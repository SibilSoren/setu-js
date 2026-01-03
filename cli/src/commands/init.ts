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
  ensureDir,
  createPackageJson
} from '../utils/fs.js';
import {
  detectFramework,
  FRAMEWORK_INFO,
  isFrameworkSupported
} from '../utils/detector.js';

interface InitOptions {
  yes?: boolean;
  framework?: string;
  runtime?: string;
}

export async function init(projectNameArg: string | undefined, options: InitOptions) {
  console.clear();
  p.intro(chalk.bgCyan.black(' 🪛 yantr init '));

  let cwd = process.cwd();
  
  // If project name is provided, create directory and use it
  if (projectNameArg) {
    const targetDir = path.resolve(cwd, projectNameArg);
    
    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      const isEmpty = (await fs.readdir(targetDir)).length === 0;
      if (!isEmpty) {
        p.log.error(`Directory "${projectNameArg}" already exists and is not empty.`);
        process.exit(1);
      }
    } else {
      await ensureDir(targetDir);
      p.log.info(`Created directory: ${chalk.cyan(projectNameArg)}`);
    }
    
    cwd = targetDir;
  }

  // Step 1: Check if this is a Node.js project and detect/select framework
  let isNode = await isNodeProject(cwd);
  let framework: Framework;
  
  if (!isNode) {
    if (!projectNameArg) {
      p.log.warning('No package.json found in current directory.');
    }
    
    // Ask for framework first when creating new project
    if (options.yes || options.framework) {
      // Use provided framework or default to Express
      const validFrameworks = ['express', 'hono', 'fastify'];
      if (options.framework && !validFrameworks.includes(options.framework)) {
        p.log.error(`Invalid framework: ${options.framework}. Use: express, hono, or fastify`);
        process.exit(1);
      }
      framework = (options.framework as Framework) || 'express';
      const runtime = (options.runtime as 'node' | 'bun') || 'node';
      const spinner = p.spinner();
      const folderName = projectNameArg || path.basename(cwd);
      spinner.start(`Creating package.json with ${FRAMEWORK_INFO[framework].name} for ${runtime}...`);
      await createPackageJson(cwd, folderName, framework, runtime);
      spinner.stop('Created package.json');
      isNode = true;
    } else {
      const shouldInit = await p.confirm({
        message: projectNameArg 
          ? `Initialize a new Node.js project in "${projectNameArg}"?`
          : 'Would you like to initialize a new Node.js project here?',
        initialValue: true,
      });

      if (p.isCancel(shouldInit) || !shouldInit) {
        p.outro(chalk.yellow('Initialization cancelled.'));
        process.exit(0);
      }

      // Ask which framework to use
      const selectedFramework = await p.select({
        message: 'Which framework would you like to use?',
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

      // Ask for runtime
      const selectedRuntime = await p.select({
        message: 'Which runtime would you like to use?',
        initialValue: 'node' as const,
        options: [
          { value: 'node', label: 'Node.js - Standard JavaScript runtime' },
          { value: 'bun', label: 'Bun - Fast all-in-one runtime' },
        ],
      });

      if (p.isCancel(selectedRuntime)) {
        p.outro(chalk.yellow('Initialization cancelled.'));
        process.exit(0);
      }

      const runtime = selectedRuntime as 'node' | 'bun';

      // Create package.json with framework dependency
      const spinner = p.spinner();
      const folderName = projectNameArg || path.basename(cwd);
      spinner.start(`Creating package.json with ${FRAMEWORK_INFO[framework].name} for ${runtime}...`);
      await createPackageJson(cwd, folderName, framework, runtime);
      spinner.stop('Created package.json');
      isNode = true;
    }
  } else {
    // Detect framework from existing package.json
    const detected = await detectFramework(cwd);
    
    if (detected) {
      framework = detected;
      p.log.info(`Detected framework: ${chalk.cyan(FRAMEWORK_INFO[framework].name)}`);
    } else {
      // No framework detected, ask user
      if (options.yes || options.framework) {
        const validFrameworks = ['express', 'hono', 'fastify'];
        if (options.framework && !validFrameworks.includes(options.framework)) {
          p.log.error(`Invalid framework: ${options.framework}. Use: express, hono, or fastify`);
          process.exit(1);
        }
        framework = (options.framework as Framework) || 'express';
      } else {
        const selectedFramework = await p.select({
          message: 'Which framework are you using?',
          initialValue: 'express' as Framework,
          options: [
            { value: 'express', label: 'Express.js' },
            { value: 'hono', label: 'Hono' },
            { value: 'fastify', label: 'Fastify' },
          ],
        });

        if (p.isCancel(selectedFramework)) {
          p.outro(chalk.yellow('Initialization cancelled.'));
          process.exit(0);
        }

        framework = selectedFramework as Framework;
      }
    }
  }

  // Step 2: Check if yantr.json already exists
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

  // Step 3: Detect or ask for configuration
  let projectName: string;
  let srcDir: string;
  let packageManager: PackageManager;

  if (options.yes) {
    // Use defaults in non-interactive mode
    projectName = (await getProjectName(cwd)) || path.basename(cwd);
    srcDir = (await hasSrcDirectory(cwd)) ? './src' : '.';
    packageManager = (await detectPackageManager(cwd)) || 'npm';
  } else {
    // Interactive prompts
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

  // Step 4: Create yantr.json
  const spinner = p.spinner();
  spinner.start('Creating configuration...');

  const config = createConfig(projectName, srcDir, framework, packageManager);
  await writeConfig(cwd, config);
  
  spinner.stop('Created yantr.json');

  // Step 5: Copy base templates from registry
  spinner.start('Setting up base templates...');

  const templatesDir = path.join(srcDir, 'lib', 'yantr');
  await ensureDir(path.join(cwd, templatesDir));

  // Load templates from registry based on framework
  const cliDir = path.dirname(new URL(import.meta.url).pathname);
  // From dist/index.js, go up to cli/ then into registry/templates
  const registryDir = path.resolve(cliDir, '../registry/templates');
  
  // Determine template paths based on framework
  const frameworkDir = framework;  // 'express', 'hono', or 'fastify'
  const baseTemplatesDir = path.join(registryDir, frameworkDir, 'base');
  
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

  // Step 6: Install dependencies
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
