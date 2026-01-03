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
  createConfig, 
  writeConfig,
  addInstalledComponent,
  setDatabaseConfig,
  type Framework,
  type DatabaseType,
  type OrmType
} from '../lib/config.js';
import { 
  writeFile,
  ensureDir,
  createPackageJson
} from '../utils/fs.js';
import { FRAMEWORK_INFO } from '../utils/detector.js';
import { fetchTemplateFile } from '../lib/registry.js';

interface CreateOptions {
  yes?: boolean;
  framework?: string;
  runtime?: string;
  dbType?: string;
  orm?: string;
}

/**
 * Database type and ORM mapping
 */
const DATABASE_OPTIONS = [
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'none', label: 'Skip database setup' },
] as const;

const ORM_OPTIONS: Record<string, { value: string; label: string; recommended?: boolean }[]> = {
  postgres: [
    { value: 'prisma', label: 'Prisma (recommended)', recommended: true },
    { value: 'drizzle', label: 'Drizzle' },
  ],
  mongodb: [
    { value: 'mongoose', label: 'Mongoose' },
  ],
};

const COMPONENT_OPTIONS = [
  { value: 'auth', label: 'Authentication - JWT with refresh tokens' },
  { value: 'logger', label: 'Logger - Pino structured logging' },
  { value: 'security', label: 'Security - Rate limiting + Helmet headers' },
];

export async function create(projectName: string, options: CreateOptions) {
  console.clear();
  p.intro(chalk.bgCyan.black(' 🪛 yantr create '));

  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, projectName);

  // Check if directory already exists
  if (await fs.pathExists(targetDir)) {
    const isEmpty = (await fs.readdir(targetDir)).length === 0;
    if (!isEmpty) {
      p.log.error(`Directory "${projectName}" already exists and is not empty.`);
      process.exit(1);
    }
  } else {
    await ensureDir(targetDir);
  }

  p.log.info(`Creating project in ${chalk.cyan(projectName)}`);

  // Collect all configuration
  let runtime: 'node' | 'bun';
  let framework: Framework;
  let dbType: string | null = null;
  let orm: string | null = null;
  let components: string[] = [];
  let packageManager: PackageManager;

  if (options.yes) {
    // Use defaults in non-interactive mode
    runtime = (options.runtime as 'node' | 'bun') || 'node';
    framework = (options.framework as Framework) || 'express';
    dbType = options.dbType || null;
    orm = options.orm || null;
    packageManager = 'npm';
  } else {
    // Step 1: Select runtime
    const selectedRuntime = await p.select({
      message: 'Which runtime would you like to use?',
      initialValue: 'node' as const,
      options: [
        { value: 'node', label: 'Node.js - Standard JavaScript runtime' },
        { value: 'bun', label: 'Bun - Fast all-in-one runtime' },
      ],
    });

    if (p.isCancel(selectedRuntime)) {
      p.outro(chalk.yellow('Project creation cancelled.'));
      process.exit(0);
    }

    runtime = selectedRuntime as 'node' | 'bun';

    // Step 2: Select framework
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
      p.outro(chalk.yellow('Project creation cancelled.'));
      process.exit(0);
    }

    framework = selectedFramework as Framework;

    // Step 3: Select database
    const selectedDbType = await p.select({
      message: 'Which database would you like to use?',
      initialValue: 'none',
      options: DATABASE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
    });

    if (p.isCancel(selectedDbType)) {
      p.outro(chalk.yellow('Project creation cancelled.'));
      process.exit(0);
    }

    dbType = selectedDbType === 'none' ? null : selectedDbType;

    // Step 4: Select ORM (if database selected)
    if (dbType && ORM_OPTIONS[dbType]) {
      const ormOptions = ORM_OPTIONS[dbType];
      const selectedOrm = await p.select({
        message: 'Which ORM would you like to use?',
        initialValue: ormOptions.find(o => o.recommended)?.value || ormOptions[0].value,
        options: ormOptions.map(opt => ({ value: opt.value, label: opt.label })),
      });

      if (p.isCancel(selectedOrm)) {
        p.outro(chalk.yellow('Project creation cancelled.'));
        process.exit(0);
      }

      orm = selectedOrm;
    }

    // Step 5: Select additional components
    const selectedComponents = await p.multiselect({
      message: 'Which additional components would you like to add?',
      options: COMPONENT_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
      required: false,
    });

    if (p.isCancel(selectedComponents)) {
      p.outro(chalk.yellow('Project creation cancelled.'));
      process.exit(0);
    }

    components = selectedComponents as string[];

    // Step 6: Select package manager
    const detectedPm = await detectPackageManager(cwd);
    const selectedPm = await p.select({
      message: 'Which package manager would you like to use?',
      initialValue: detectedPm || 'npm',
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'pnpm', label: 'pnpm' },
        { value: 'yarn', label: 'yarn' },
        { value: 'bun', label: 'bun' },
      ],
    });

    if (p.isCancel(selectedPm)) {
      p.outro(chalk.yellow('Project creation cancelled.'));
      process.exit(0);
    }

    packageManager = selectedPm as PackageManager;
  }

  // ============================================
  // Start creating the project
  // ============================================

  const spinner = p.spinner();

  // Step 1: Create package.json
  spinner.start(`Creating package.json with ${FRAMEWORK_INFO[framework].name} for ${runtime}...`);
  await createPackageJson(targetDir, projectName, framework, runtime);
  spinner.stop('Created package.json');

  // Step 2: Create yantr.json
  spinner.start('Creating configuration...');
  const config = createConfig(projectName, './src', framework, packageManager);
  await writeConfig(targetDir, config);
  spinner.stop('Created yantr.json');

  // Step 3: Copy base templates
  spinner.start('Setting up base templates...');
  
  const templatesDir = path.join('./src', 'lib', 'yantr');
  await ensureDir(path.join(targetDir, templatesDir));

  const cliDir = path.dirname(new URL(import.meta.url).pathname);
  const registryDir = path.resolve(cliDir, '../registry/templates');
  const baseTemplatesDir = path.join(registryDir, framework, 'base');

  try {
    const errorHandlerPath = path.join(baseTemplatesDir, 'error-handler.ts');
    const zodMiddlewarePath = path.join(baseTemplatesDir, 'zod-middleware.ts');
    
    const errorHandlerContent = await fs.readFile(errorHandlerPath, 'utf-8');
    const zodMiddlewareContent = await fs.readFile(zodMiddlewarePath, 'utf-8');

    await writeFile(
      path.join(targetDir, templatesDir, 'error-handler.ts'),
      errorHandlerContent
    );

    await writeFile(
      path.join(targetDir, templatesDir, 'zod-middleware.ts'),
      zodMiddlewareContent
    );
  } catch (error) {
    spinner.stop('Could not load base templates');
    p.log.error(`Failed to load templates for ${framework}: ${error}`);
    process.exit(1);
  }

  spinner.stop('Base templates created');

  // Step 4: Set up database if selected
  if (dbType && orm) {
    spinner.start(`Setting up ${dbType} with ${orm}...`);

    const variantKey = `${dbType}-${orm}`;
    const registry = await fs.readJson(
      path.resolve(cliDir, '../registry/registry.json')
    );
    
    const dbComponent = registry.components.database;
    const variant = dbComponent.variants[variantKey];

    if (variant) {
      const baseDir = path.join(targetDir, './src', 'lib', 'yantr', 'database');
      await ensureDir(baseDir);

      for (const filePath of variant.files) {
        const content = await fetchTemplateFile(filePath);
        const fileName = path.basename(filePath);
        const targetPath = path.join(baseDir, fileName);
        await writeFile(targetPath, content);
      }

      await setDatabaseConfig(targetDir, dbType as DatabaseType, orm as OrmType);
      await addInstalledComponent(targetDir, 'database');
      
      spinner.stop(`Database configured with ${variant.label}`);
    } else {
      spinner.stop('Database variant not found, skipping...');
    }
  }

  // Step 5: Set up additional components
  for (const componentName of components) {
    spinner.start(`Adding ${componentName}...`);

    try {
      const registry = await fs.readJson(
        path.resolve(cliDir, '../registry/registry.json')
      );
      
      const component = registry.components[componentName];
      
      if (component) {
        let filesToFetch: string[] = [];
        
        if (component.frameworkSpecific && typeof component.files === 'object' && !Array.isArray(component.files)) {
          filesToFetch = component.files[framework] || component.files['express'] || [];
        } else if (Array.isArray(component.files)) {
          filesToFetch = component.files;
        }

        const baseDir = path.join(targetDir, './src', 'lib', 'yantr', componentName);
        await ensureDir(baseDir);

        for (const filePath of filesToFetch) {
          const content = await fetchTemplateFile(filePath);
          const fileName = path.basename(filePath);
          const targetPath = path.join(baseDir, fileName);
          await writeFile(targetPath, content);
        }

        await addInstalledComponent(targetDir, componentName);
        spinner.stop(`Added ${component.name}`);
      } else {
        spinner.stop(`Component ${componentName} not found, skipping...`);
      }
    } catch (error) {
      spinner.stop(`Could not add ${componentName}`);
      p.log.warning(`Failed to add ${componentName}: ${error}`);
    }
  }

  // Step 6: Collect all dependencies and install at once
  spinner.start('Installing dependencies...');

  const allDeps: string[] = ['zod'];
  const allDevDeps: string[] = [];

  // Add database dependencies
  if (dbType && orm) {
    const variantKey = `${dbType}-${orm}`;
    const registry = await fs.readJson(
      path.resolve(cliDir, '../registry/registry.json')
    );
    const variant = registry.components.database?.variants?.[variantKey];
    if (variant) {
      allDeps.push(...(variant.dependencies || []));
      allDevDeps.push(...(variant.devDependencies || []));
    }
  }

  // Add component dependencies
  for (const componentName of components) {
    const registry = await fs.readJson(
      path.resolve(cliDir, '../registry/registry.json')
    );
    const component = registry.components[componentName];
    if (component) {
      const deps = component.dependencies?.common || (Array.isArray(component.dependencies) ? component.dependencies : []);
      const devDeps = component.devDependencies?.common || (Array.isArray(component.devDependencies) ? component.devDependencies : []);
      allDeps.push(...deps);
      allDevDeps.push(...devDeps);
    }
  }

  try {
    // Remove duplicates
    const uniqueDeps = [...new Set(allDeps)];
    const uniqueDevDeps = [...new Set(allDevDeps)];

    if (uniqueDeps.length > 0) {
      await installDependencies(packageManager, uniqueDeps, targetDir, false);
    }
    if (uniqueDevDeps.length > 0) {
      await installDependencies(packageManager, uniqueDevDeps, targetDir, true);
    }
    spinner.stop('Dependencies installed');
  } catch (error) {
    spinner.stop('Could not install dependencies automatically');
    p.log.warning(`Please run: ${chalk.cyan(`cd ${projectName} && ${packageManager} install`)}`);
  }

  // Summary
  const createdFiles = [
    'package.json',
    'yantr.json',
    `${templatesDir}/error-handler.ts`,
    `${templatesDir}/zod-middleware.ts`,
  ];

  if (dbType && orm) {
    createdFiles.push(`${templatesDir}/database/`);
  }

  for (const comp of components) {
    createdFiles.push(`${templatesDir}/${comp}/`);
  }

  const filesNote = createdFiles.map(f => `${chalk.green('✓')} ${f}`).join('\n');
  p.note(filesNote, 'Project created');

  // Next steps
  p.log.info('Next steps:');
  console.log(`  1. ${chalk.cyan(`cd ${projectName}`)}`);
  
  if (framework === 'hono') {
    console.log(`  2. Add error handler: ${chalk.gray('app.onError(onError);')}`);
  } else if (framework === 'fastify') {
    console.log(`  2. Add error handler: ${chalk.gray('fastify.setErrorHandler(errorHandler);')}`);
  } else {
    console.log(`  2. Add error handler: ${chalk.gray('app.use(errorHandler);')}`);
  }
  
  if (!dbType) {
    console.log(`  3. Add database: ${chalk.cyan('yantr add database')}`);
  }
  
  console.log(`  ${!dbType ? '4' : '3'}. Generate routes: ${chalk.cyan('yantr generate route users')}`);

  p.outro(chalk.green(`🎉 ${projectName} created with ${FRAMEWORK_INFO[framework].name}!`));
}
