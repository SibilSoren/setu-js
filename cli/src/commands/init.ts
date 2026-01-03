import * as p from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { 
  detectPackageManager, 
  type PackageManager,
  installDependencies 
} from '../lib/installer.js';
import { 
  configExists, 
  createConfig, 
  writeConfig,
  type Framework
} from '../lib/config.js';
import { 
  isNodeProject, 
  getProjectName, 
  hasSrcDirectory,
  writeFile,
  ensureDir
} from '../utils/fs.js';
import {
  detectFramework,
  FRAMEWORK_INFO
} from '../utils/detector.js';

interface InitOptions {
  yes?: boolean;
  framework?: string;
}

export async function init(options: InitOptions) {
  console.clear();
  p.intro(chalk.bgCyan.black(' 🪛 yantr init '));

  const cwd = process.cwd();
  
  // Check if this is a Node.js project
  const isNode = await isNodeProject(cwd);
  
  if (!isNode) {
    p.log.error('No package.json found in current directory.');
    p.log.info(`To create a new project, run: ${chalk.cyan('yantr create <project-name>')}`);
    p.log.info(`To initialize here, first run: ${chalk.cyan('npm init -y')}`);
    p.outro(chalk.yellow('Initialization cancelled.'));
    process.exit(1);
  }

  // Check if yantr.json already exists
  const hasConfig = await configExists(cwd);
  
  if (hasConfig && !options.yes) {
    const overwrite = await p.confirm({
      message: 'yantr.json already exists. Overwrite?',
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.outro(chalk.yellow('Initialization cancelled.'));
      process.exit(0);
    }
  }

  // Detect or select framework
  let framework: Framework;
  const detected = await detectFramework(cwd);
  
  if (detected) {
    framework = detected;
    p.log.info(`Detected framework: ${chalk.cyan(FRAMEWORK_INFO[framework].name)}`);
  } else if (options.yes || options.framework) {
    const validFrameworks = ['express', 'hono', 'fastify'];
    if (options.framework && !validFrameworks.includes(options.framework)) {
      p.log.error(`Invalid framework: ${options.framework}. Use: express, hono, or fastify`);
      process.exit(1);
    }
    framework = (options.framework as Framework) || 'express';
    p.log.info(`Using framework: ${chalk.cyan(FRAMEWORK_INFO[framework].name)}`);
  } else {
    const selectedFramework = await p.select({
      message: 'Which framework are you using?',
      initialValue: 'express' as Framework,
      options: [
        { value: 'express', label: 'Express.js - Fast, unopinionated, minimalist' },
        { value: 'hono', label: 'Hono - Ultrafast, lightweight, multi-runtime' },
        { value: 'fastify', label: 'Fastify - High performance web framework' },
      ],
    });

    if (p.isCancel(selectedFramework)) {
      p.outro(chalk.yellow('Initialization cancelled.'));
      process.exit(0);
    }

    framework = selectedFramework as Framework;
  }

  // Collect configuration
  let projectName: string;
  let srcDir: string;
  let packageManager: PackageManager;

  if (options.yes) {
    projectName = (await getProjectName(cwd)) || path.basename(cwd);
    srcDir = (await hasSrcDirectory(cwd)) ? './src' : '.';
    packageManager = (await detectPackageManager(cwd)) || 'npm';
  } else {
    const detectedPm = await detectPackageManager(cwd);
    const detectedName = (await getProjectName(cwd)) || path.basename(cwd);
    const hasSrc = await hasSrcDirectory(cwd);

    const responses = await p.group(
      {
        projectName: () =>
          p.group({
             name: () => p.text({
                message: 'Project name:',
                defaultValue: detectedName,
                placeholder: detectedName,
              })
          }),
        srcDir: () =>
          p.select({
            message: 'Where should Yantr put generated files?',
            initialValue: hasSrc ? './src' : '.',
            options: [
              { value: './src', label: './src (recommended)' },
              { value: '.', label: '. (project root)' },
              { value: './lib', label: './lib' },
            ],
          }),
        packageManager: () =>
          p.select({
            message: 'Package manager:',
            initialValue: detectedPm || 'npm',
            options: [
              { value: 'npm', label: 'npm' },
              { value: 'pnpm', label: 'pnpm' },
              { value: 'yarn', label: 'yarn' },
              { value: 'bun', label: 'bun' },
            ],
          }),
      },
      {
        onCancel: () => {
          p.cancel('Initialization cancelled.');
          process.exit(0);
        },
      }
    );

    projectName = (responses.projectName as any).name as string;
    srcDir = responses.srcDir as string;
    packageManager = responses.packageManager as PackageManager;
  }

  // Create yantr.json
  const spinner = p.spinner();
  spinner.start('Creating configuration...');

  const config = createConfig(projectName, srcDir, framework, packageManager);
  await writeConfig(cwd, config);
  
  spinner.stop('Created yantr.json');

  // Copy base templates
  spinner.start('Setting up base templates...');

  const templatesDir = path.join(srcDir, 'lib', 'yantr');
  await ensureDir(path.join(cwd, templatesDir));

  const cliDir = path.dirname(new URL(import.meta.url).pathname);
  const registryDir = path.resolve(cliDir, '../registry/templates');
  const baseTemplatesDir = path.join(registryDir, framework, 'base');
  
  try {
    const errorHandlerPath = path.join(baseTemplatesDir, 'error-handler.ts');
    const zodMiddlewarePath = path.join(baseTemplatesDir, 'zod-middleware.ts');
    
    const errorHandlerContent = await fs.readFile(errorHandlerPath, 'utf-8');
    const zodMiddlewareContent = await fs.readFile(zodMiddlewarePath, 'utf-8');

    await writeFile(
      path.join(cwd, templatesDir, 'error-handler.ts'),
      errorHandlerContent
    );

    await writeFile(
      path.join(cwd, templatesDir, 'zod-middleware.ts'),
      zodMiddlewareContent
    );
  } catch (error) {
    spinner.stop('Could not load base templates');
    p.log.error(`Failed to load templates for ${framework}: ${error}`);
    process.exit(1);
  }

  spinner.stop('Base templates created');

  // Install dependencies
  spinner.start('Installing dependencies...');

  const deps = ['zod'];

  try {
    await installDependencies(packageManager, deps, cwd, false);
    spinner.stop('Dependencies installed');
  } catch (error) {
    spinner.stop('Could not install dependencies automatically');
    p.log.warning(`Please run: ${chalk.cyan(`${packageManager} add ${deps.join(' ')}`)}`);
  }

  // Summary
  p.note(
    `${chalk.green('✓')} yantr.json created
${chalk.green('✓')} ${templatesDir}/error-handler.ts
${chalk.green('✓')} ${templatesDir}/zod-middleware.ts`,
    'Files created'
  );

  // Framework-specific next steps
  p.log.info('Next steps:');
  
  if (framework === 'hono') {
    p.log.step(1, `Add error handler to your Hono app:`);
    console.log(chalk.gray(`   import { onError } from '${templatesDir}/error-handler';`));
    console.log(chalk.gray(`   app.onError(onError);`));
  } else if (framework === 'fastify') {
    p.log.step(1, `Add error handler to your Fastify app:`);
    console.log(chalk.gray(`   import { errorHandler } from '${templatesDir}/error-handler';`));
    console.log(chalk.gray(`   fastify.setErrorHandler(errorHandler);`));
  } else {
    p.log.step(1, `Add error handler to your Express app:`);
    console.log(chalk.gray(`   import { errorHandler } from '${templatesDir}/error-handler';`));
    console.log(chalk.gray(`   app.use(errorHandler);`));
  }
  
  p.log.step(2, `Add components: ${chalk.cyan('yantr add auth')}`);
  p.log.step(3, `Generate routes: ${chalk.cyan('yantr generate route users')}`);

  p.outro(chalk.green(`YantrJS initialized with ${FRAMEWORK_INFO[framework].name}! 🪛`));
}
