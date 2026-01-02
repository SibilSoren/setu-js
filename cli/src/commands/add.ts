import * as p from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import { 
  getComponent, 
  listComponents, 
  fetchComponentFiles 
} from '../lib/registry.js';
import { 
  readConfig, 
  configExists, 
  addInstalledComponent,
  isComponentInstalled 
} from '../lib/config.js';
import { installDependencies } from '../lib/installer.js';
import { writeFile, fileExists } from '../utils/fs.js';

interface AddOptions {
  overwrite?: boolean;
}

export async function add(componentName: string, options: AddOptions) {
  console.clear();
  p.intro(chalk.bgCyan.black(\` 🪛 yantr add \${componentName} \`));

  try {
    const cwd = process.cwd();

    // Step 1: Check if yantr.json exists
    if (!(await configExists(cwd))) {
      p.log.error('yantr.json not found.');
      p.log.info('Please run ' + chalk.cyan('yantr init') + ' first.');
      p.outro(chalk.red('Add cancelled.'));
      process.exit(1);
    }

    // Step 2: Read config
    const config = await readConfig(cwd);

    // Step 3: Validate component name
    const spinner = p.spinner();
    spinner.start('Fetching component registry...');

    const availableComponents = await listComponents();
    
    if (!availableComponents.includes(componentName)) {
      spinner.stop('Component not found');
      p.log.error(\`Unknown component: \${chalk.red(componentName)}\`);
      p.log.info(\`Available components: \${chalk.cyan(availableComponents.join(', '))}\`);
      p.outro(chalk.red('Add cancelled.'));
      process.exit(1);
    }

    // Step 4: Check if already installed
    const alreadyInstalled = await isComponentInstalled(cwd, componentName);
    
    if (alreadyInstalled && !options.overwrite) {
      spinner.stop('Component already installed');
      
      const overwrite = await p.confirm({
        message: \`\${componentName} is already installed. Overwrite?\`,
        initialValue: false,
      });

      if (p.isCancel(overwrite) || !overwrite) {
        p.outro(chalk.yellow('Add cancelled.'));
        process.exit(0);
      }
    }

    // Step 5: Fetch component metadata and files
    spinner.start(\`Downloading \${componentName}...\`);
    
    const component = await getComponent(componentName);
    
    if (!component) {
      spinner.stop('Failed to fetch component');
      p.log.error('Failed to get component metadata');
      process.exit(1);
    }

    const files = await fetchComponentFiles(componentName);
    spinner.stop(\`Downloaded \${files.size} files\`);

    // Step 6: Write files to project
    spinner.start('Installing files...');
    
    const installedFiles: string[] = [];
    const baseDir = path.join(cwd, config.srcDir, 'lib', 'yantr');

    for (const [filePath, content] of files) {
      const fileName = path.basename(filePath);
      const targetPath = path.join(baseDir, componentName, fileName);
      
      if ((await fileExists(targetPath)) && !options.overwrite && !alreadyInstalled) {
        const shouldOverwrite = await p.confirm({
          message: \`File \${fileName} already exists. Overwrite?\`,
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

    // Step 7: Install dependencies
    if (component.dependencies.length > 0 || component.devDependencies.length > 0) {
      spinner.start('Installing dependencies...');

      try {
        if (component.dependencies.length > 0) {
          await installDependencies(
            config.packageManager,
            component.dependencies,
            cwd,
            false
          );
        }

        if (component.devDependencies.length > 0) {
          await installDependencies(
            config.packageManager,
            component.devDependencies,
            cwd,
            true
          );
        }

        spinner.stop('Dependencies installed');
      } catch (error) {
        spinner.stop('Could not install dependencies automatically');
        
        if (component.dependencies.length > 0) {
          p.log.warning(
            \`Please run: \${chalk.cyan(\`\${config.packageManager} add \${component.dependencies.join(' ')}\`)}\`
          );
        }
        if (component.devDependencies.length > 0) {
          p.log.warning(
            \`Please run: \${chalk.cyan(\`\${config.packageManager} add -D \${component.devDependencies.join(' ')}\`)}\`
          );
        }
      }
    }

    // Step 8: Update yantr.json
    await addInstalledComponent(cwd, componentName);

    // Summary
    const filesNote = installedFiles.map(f => \`\${chalk.green('✓')} \${f}\`).join('\\n');
    
    p.note(filesNote, 'Files created');

    if (component.dependencies.length > 0) {
      p.log.info(\`Dependencies: \${chalk.cyan(component.dependencies.join(', '))}\`);
    }

    // Component-specific usage hints
    const usageHints: Record<string, string[]> = {
      auth: [
        \`Import auth routes: \${chalk.gray(\`import authRoutes from '\${config.srcDir}/lib/yantr/auth/auth.routes';\`)}\`,
        \`Add to app: \${chalk.gray('app.use("/api/auth", authRoutes);')}\`,
      ],
      logger: [
        \`Import logger: \${chalk.gray(\`import { logger } from '\${config.srcDir}/lib/yantr/logger/logger';\`)}\`,
        \`Use HTTP logging: \${chalk.gray('app.use(httpLogger);')}\`,
      ],
      database: [
        \`Import prisma: \${chalk.gray(\`import { prisma } from '\${config.srcDir}/lib/yantr/database/prisma';\`)}\`,
        \`Initialize: \${chalk.gray('npx prisma init')}\`,
      ],
      security: [
        \`Import security: \${chalk.gray(\`import { rateLimiter, helmetConfig } from '\${config.srcDir}/lib/yantr/security';\`)}\`,
        \`Add to app: \${chalk.gray('app.use(helmetConfig); app.use(rateLimiter);')}\`,
      ],
    };

    if (usageHints[componentName]) {
      p.log.info('Usage:');
      usageHints[componentName].forEach((hint, i) => {
        console.log(\`  \${i + 1}. \${hint}\`);
      });
    }

    p.outro(chalk.green(\`\${component.name} added successfully! 🪛\`));
  } catch (error) {
    p.log.error(\`Failed: \${error instanceof Error ? error.message : String(error)}\`);
    console.error(error);
    process.exit(1);
  }
}
