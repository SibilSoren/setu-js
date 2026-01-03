import * as p from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { 
  getComponent, 
  listComponents, 
  fetchTemplateFile 
} from '../lib/registry.js';
import { 
  readConfig, 
  configExists, 
  addInstalledComponent,
  isComponentInstalled,
  setDatabaseConfig,
  type DatabaseType,
  type OrmType
} from '../lib/config.js';
import { installDependencies } from '../lib/installer.js';
import { writeFile, fileExists } from '../utils/fs.js';

interface AddOptions {
  overwrite?: boolean;
}

/**
 * Database type and ORM mapping
 */
const DATABASE_OPTIONS = [
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
] as const;

const ORM_OPTIONS: Record<DatabaseType, { value: OrmType; label: string; recommended?: boolean }[]> = {
  postgres: [
    { value: 'prisma', label: 'Prisma (recommended)', recommended: true },
    { value: 'drizzle', label: 'Drizzle' },
  ],
  mongodb: [
    { value: 'mongoose', label: 'Mongoose' },
  ],
};

/**
 * Handle database component with type/ORM selection
 */
async function handleDatabaseAdd(
  cwd: string, 
  config: Awaited<ReturnType<typeof readConfig>>,
  options: AddOptions
): Promise<void> {
  // Check if database is already configured
  if (config.database && !options.overwrite) {
    const overwrite = await p.confirm({
      message: `Database already configured (${config.database.orm}). Reconfigure?`,
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.outro(chalk.yellow('Add cancelled.'));
      process.exit(0);
    }
  }

  // Step 1: Select database type
  const dbType = await p.select({
    message: 'Select your database:',
    options: DATABASE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
  });

  if (p.isCancel(dbType)) {
    p.outro(chalk.yellow('Add cancelled.'));
    process.exit(0);
  }

  // Step 2: Select ORM
  const ormOptions = ORM_OPTIONS[dbType as DatabaseType];
  const orm = await p.select({
    message: 'Select your ORM:',
    initialValue: ormOptions.find(o => o.recommended)?.value || ormOptions[0].value,
    options: ormOptions.map(opt => ({ value: opt.value, label: opt.label })),
  });

  if (p.isCancel(orm)) {
    p.outro(chalk.yellow('Add cancelled.'));
    process.exit(0);
  }

  // Step 3: Fetch and install templates
  const spinner = p.spinner();
  spinner.start('Setting up database...');

  const variantKey = `${dbType}-${orm}`;
  
  // Get registry to find variant
  const registry = await fs.readJson(
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '../registry/registry.json')
  );
  
  const dbComponent = registry.components.database;
  const variant = dbComponent.variants[variantKey];

  if (!variant) {
    spinner.stop('Variant not found');
    p.log.error(`Database variant ${variantKey} not found`);
    process.exit(1);
  }

  // Fetch and write files
  const installedFiles: string[] = [];
  const baseDir = path.join(cwd, config.srcDir, 'lib', 'yantr', 'database');

  for (const filePath of variant.files) {
    const content = await fetchTemplateFile(filePath);
    const fileName = path.basename(filePath);
    const targetPath = path.join(baseDir, fileName);

    await writeFile(targetPath, content);
    installedFiles.push(path.relative(cwd, targetPath));
  }

  spinner.stop('Database files created');

  // Step 4: Install dependencies
  if (variant.dependencies.length > 0 || variant.devDependencies.length > 0) {
    spinner.start('Installing dependencies...');

    try {
      if (variant.dependencies.length > 0) {
        await installDependencies(config.packageManager, variant.dependencies, cwd, false);
      }
      if (variant.devDependencies.length > 0) {
        await installDependencies(config.packageManager, variant.devDependencies, cwd, true);
      }
      spinner.stop('Dependencies installed');
    } catch (error) {
      spinner.stop('Could not install dependencies automatically');
      p.log.warning(`Please run: ${chalk.cyan(`${config.packageManager} add ${variant.dependencies.join(' ')}`)}`);
    }
  }

  // Step 5: Update config
  await setDatabaseConfig(cwd, dbType as DatabaseType, orm as OrmType);
  await addInstalledComponent(cwd, 'database');

  // Summary
  const filesNote = installedFiles.map(f => `${chalk.green('✓')} ${f}`).join('\n');
  p.note(filesNote, 'Files created');

  // Database-specific next steps
  const nextSteps: Record<string, string[]> = {
    prisma: [
      `Initialize Prisma: ${chalk.cyan('npx prisma init')}`,
      `Configure DATABASE_URL in ${chalk.cyan('.env')}`,
      `Run migrations: ${chalk.cyan('npx prisma migrate dev')}`,
    ],
    drizzle: [
      `Configure DATABASE_URL in ${chalk.cyan('.env')}`,
      `Create drizzle.config.ts for migrations`,
      `Run migrations: ${chalk.cyan('npx drizzle-kit push:pg')}`,
    ],
    mongoose: [
      `Configure MONGODB_URI in ${chalk.cyan('.env')}`,
      `Call ${chalk.cyan('connectDB()')} before using models`,
      `Create your schemas in ${chalk.cyan('models.ts')}`,
    ],
  };

  p.log.info('Next steps:');
  nextSteps[orm as string]?.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });

  p.outro(chalk.green(`Database configured with ${variant.label}! 🪛`));
}

/**
 * Handle regular component add (framework-specific)
 */
async function handleRegularAdd(
  componentName: string,
  cwd: string,
  config: Awaited<ReturnType<typeof readConfig>>,
  options: AddOptions
): Promise<void> {
  const spinner = p.spinner();
  spinner.start('Fetching component registry...');

  const availableComponents = await listComponents();
  
  if (!availableComponents.includes(componentName)) {
    spinner.stop('Component not found');
    p.log.error(`Unknown component: ${chalk.red(componentName)}`);
    p.log.info(`Available components: ${chalk.cyan(availableComponents.join(', '))}`);
    p.outro(chalk.red('Add cancelled.'));
    process.exit(1);
  }

  // Check if already installed
  const alreadyInstalled = await isComponentInstalled(cwd, componentName);
  
  if (alreadyInstalled && !options.overwrite) {
    spinner.stop('Component already installed');
    
    const overwrite = await p.confirm({
      message: `${componentName} is already installed. Overwrite?`,
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.outro(chalk.yellow('Add cancelled.'));
      process.exit(0);
    }
  }

  // Fetch component metadata
  spinner.start(`Downloading ${componentName}...`);
  
  const component = await getComponent(componentName);
  
  if (!component) {
    spinner.stop('Failed to fetch component');
    p.log.error('Failed to get component metadata');
    process.exit(1);
  }

  // Get framework from config
  const framework = config.framework || 'express';
  
  // Determine files to fetch (framework-specific or regular)
  let filesToFetch: string[] = [];
  
  if (component.frameworkSpecific && typeof component.files === 'object' && !Array.isArray(component.files)) {
    // Framework-specific component
    filesToFetch = component.files[framework] || component.files['express'] || [];
    if (filesToFetch.length === 0) {
      spinner.stop(`${componentName} not available for ${framework}`);
      p.log.error(`Component ${componentName} is not yet available for ${framework}`);
      p.log.info('Available for: ' + Object.keys(component.files).join(', '));
      p.outro(chalk.red('Add cancelled.'));
      process.exit(1);
    }
  } else if (Array.isArray(component.files)) {
    filesToFetch = component.files;
  }

  // Fetch files
  const files = new Map<string, string>();
  for (const filePath of filesToFetch) {
    const content = await fetchTemplateFile(filePath);
    files.set(filePath, content);
  }
  
  spinner.stop(`Downloaded ${files.size} files`);

  // Write files to project
  spinner.start('Installing files...');
  
  const installedFiles: string[] = [];
  const baseDir = path.join(cwd, config.srcDir, 'lib', 'yantr');

  for (const [filePath, content] of files) {
    const fileName = path.basename(filePath);
    const targetPath = path.join(baseDir, componentName, fileName);
    
    if ((await fileExists(targetPath)) && !options.overwrite && !alreadyInstalled) {
      const shouldOverwrite = await p.confirm({
        message: `File ${fileName} already exists. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
        continue;
      }
    }

    await writeFile(targetPath, content);
    installedFiles.push(path.relative(cwd, targetPath));
  }

  spinner.stop('Files installed');

  // Install dependencies
  const deps = component.dependencies?.common || component.dependencies || [];
  const devDeps = component.devDependencies?.common || component.devDependencies || [];

  if (deps.length > 0 || devDeps.length > 0) {
    spinner.start('Installing dependencies...');

    try {
      if (deps.length > 0) {
        await installDependencies(config.packageManager, deps, cwd, false);
      }
      if (devDeps.length > 0) {
        await installDependencies(config.packageManager, devDeps, cwd, true);
      }
      spinner.stop('Dependencies installed');
    } catch (error) {
      spinner.stop('Could not install dependencies automatically');
      if (deps.length > 0) {
        p.log.warning(`Please run: ${chalk.cyan(`${config.packageManager} add ${deps.join(' ')}`)}`);
      }
    }
  }

  // Update yantr.json
  await addInstalledComponent(cwd, componentName);

  // Summary
  const filesNote = installedFiles.map(f => `${chalk.green('✓')} ${f}`).join('\n');
  p.note(filesNote, 'Files created');

  if (deps.length > 0) {
    p.log.info(`Dependencies: ${chalk.cyan(deps.join(', '))}`);
  }

  // Component-specific usage hints
  const usageHints: Record<string, string[]> = {
    auth: [
      `Import auth routes: ${chalk.gray(`import authRoutes from '${config.srcDir}/lib/yantr/auth/auth.routes';`)}`,
      `Add to app: ${chalk.gray('app.use("/api/auth", authRoutes);')}`,
    ],
    logger: [
      `Import logger: ${chalk.gray(`import { logger } from '${config.srcDir}/lib/yantr/logger/logger';`)}`,
      `Use HTTP logging: ${chalk.gray('app.use(httpLogger);')}`,
    ],
    security: [
      `Import security: ${chalk.gray(`import { rateLimiter, helmetConfig } from '${config.srcDir}/lib/yantr/security';`)}`,
      `Add to app: ${chalk.gray('app.use(helmetConfig); app.use(rateLimiter);')}`,
    ],
  };

  if (usageHints[componentName]) {
    p.log.info('Usage:');
    usageHints[componentName].forEach((hint, i) => {
      console.log(`  ${i + 1}. ${hint}`);
    });
  }

  p.outro(chalk.green(`${component.name} added successfully! 🪛`));
}

/**
 * Main add command
 */
export async function add(componentName: string, options: AddOptions) {
  console.clear();
  p.intro(chalk.bgCyan.black(` 🪛 yantr add ${componentName} `));

  try {
    const cwd = process.cwd();

    // Check if yantr.json exists
    if (!(await configExists(cwd))) {
      p.log.error('yantr.json not found.');
      p.log.info('Please run ' + chalk.cyan('yantr init') + ' first.');
      p.outro(chalk.red('Add cancelled.'));
      process.exit(1);
    }

    // Read config
    const config = await readConfig(cwd);

    // Route to appropriate handler
    if (componentName === 'database') {
      await handleDatabaseAdd(cwd, config, options);
    } else {
      await handleRegularAdd(componentName, cwd, config, options);
    }
  } catch (error) {
    p.log.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    process.exit(1);
  }
}
