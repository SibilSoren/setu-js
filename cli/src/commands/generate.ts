import * as p from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { readConfig, configExists } from '../lib/config.js';
import { writeFile, fileExists } from '../utils/fs.js';

interface GenerateOptions {
  // Future options can be added here
}

export async function generate(type: string, name: string, _options?: GenerateOptions) {
  console.clear();
  p.intro(chalk.bgCyan.black(` 🪛 yantr generate ${type} ${name} `));

  try {
    const cwd = process.cwd();

    // Step 1: Check if yantr.json exists
    if (!(await configExists(cwd))) {
      p.log.error('yantr.json not found.');
      p.log.info('Please run ' + chalk.cyan('yantr init') + ' first.');
      p.outro(chalk.red('Generate cancelled.'));
      process.exit(1);
    }

    // Step 2: Read config
    const config = await readConfig(cwd);

    // Step 3: Validate type
    const validTypes = ['route'];
    
    if (!validTypes.includes(type)) {
      p.log.error(`Unknown type: ${chalk.red(type)}`);
      p.log.info(`Available types: ${chalk.cyan(validTypes.join(', '))}`);
      p.outro(chalk.red('Generate cancelled.'));
      process.exit(1);
    }

    // Step 4: Generate based on type
    if (type === 'route') {
      await generateRoute(cwd, config.srcDir, name);
    }

    p.outro(chalk.green(`Generated ${type} "${name}" successfully! 🪛`));
  } catch (error) {
    p.log.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Generate route, controller, and service files
 */
async function generateRoute(cwd: string, srcDir: string, name: string) {
  const spinner = p.spinner();
  
  // Normalize the name (e.g., "users" -> "users", "UserProfile" -> "user-profile")
  const normalizedName = name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  
  const pascalName = toPascalCase(normalizedName);
  const camelName = toCamelCase(normalizedName);

  // Define file paths
  const baseDir = path.join(cwd, srcDir);
  const routesDir = path.join(baseDir, 'routes');
  const controllersDir = path.join(baseDir, 'controllers');
  const servicesDir = path.join(baseDir, 'services');

  const files = {
    route: path.join(routesDir, `${normalizedName}.routes.ts`),
    controller: path.join(controllersDir, `${normalizedName}.controller.ts`),
    service: path.join(servicesDir, `${normalizedName}.service.ts`),
  };

  // Check if files already exist
  for (const [type, filePath] of Object.entries(files)) {
    if (await fileExists(filePath)) {
      const overwrite = await p.confirm({
        message: `${type} file already exists. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(overwrite) || !overwrite) {
        p.outro(chalk.yellow('Generate cancelled.'));
        process.exit(0);
      }
    }
  }

  spinner.start('Generating files...');

  // Generate service file
  const serviceContent = generateServiceTemplate(pascalName, camelName);
  await writeFile(files.service, serviceContent);

  // Generate controller file
  const controllerContent = generateControllerTemplate(pascalName, camelName, normalizedName);
  await writeFile(files.controller, controllerContent);

  // Generate route file
  const routeContent = generateRouteTemplate(pascalName, camelName, normalizedName);
  await writeFile(files.route, routeContent);

  spinner.stop('Files generated');

  // Show created files
  const createdFiles = Object.values(files).map(f => 
    `${chalk.green('✓')} ${path.relative(cwd, f)}`
  ).join('\n');

  p.note(createdFiles, 'Files created');

  // Usage hint
  p.log.info('Add to your app:');
  console.log(chalk.gray(`  import ${camelName}Routes from './${srcDir}/routes/${normalizedName}.routes';`));
  console.log(chalk.gray(`  app.use('/api/${normalizedName}', ${camelName}Routes);`));
}

/**
 * Generate service template
 */
function generateServiceTemplate(pascalName: string, _camelName: string): string {
  return `/**
 * ${pascalName} Service
 * 
 * Business logic for ${pascalName.toLowerCase()} operations.
 */

export interface ${pascalName} {
  id: string;
  // Add your fields here
  createdAt: Date;
  updatedAt: Date;
}

export interface Create${pascalName}Input {
  // Add your input fields here
}

export interface Update${pascalName}Input {
  // Add your update fields here
}

/**
 * Get all ${pascalName.toLowerCase()}s
 */
export async function getAll(): Promise<${pascalName}[]> {
  // TODO: Implement database query
  // Example: return prisma.${_camelName}.findMany();
  return [];
}

/**
 * Get ${pascalName.toLowerCase()} by ID
 */
export async function getById(id: string): Promise<${pascalName} | null> {
  // TODO: Implement database query
  // Example: return prisma.${_camelName}.findUnique({ where: { id } });
  return null;
}

/**
 * Create a new ${pascalName.toLowerCase()}
 */
export async function create(input: Create${pascalName}Input): Promise<${pascalName}> {
  // TODO: Implement database insert
  // Example: return prisma.${_camelName}.create({ data: input });
  throw new Error('Not implemented');
}

/**
 * Update ${pascalName.toLowerCase()} by ID
 */
export async function update(id: string, input: Update${pascalName}Input): Promise<${pascalName}> {
  // TODO: Implement database update
  // Example: return prisma.${_camelName}.update({ where: { id }, data: input });
  throw new Error('Not implemented');
}

/**
 * Delete ${pascalName.toLowerCase()} by ID
 */
export async function remove(id: string): Promise<void> {
  // TODO: Implement database delete
  // Example: await prisma.${_camelName}.delete({ where: { id } });
  throw new Error('Not implemented');
}
`;
}

/**
 * Generate controller template
 */
function generateControllerTemplate(pascalName: string, camelName: string, normalizedName: string): string {
  return `import type { Request, Response } from 'express';
import { z } from 'zod';
import * as ${camelName}Service from '../services/${normalizedName}.service';
import { asyncHandler } from '../lib/yantr/error-handler';
import { NotFoundError } from '../lib/yantr/error-handler';

/**
 * ${pascalName} Controller
 * 
 * Request handlers for ${pascalName.toLowerCase()} endpoints.
 */

// Validation schemas
export const create${pascalName}Schema = z.object({
  // Add your validation rules here
});

export const update${pascalName}Schema = z.object({
  // Add your validation rules here
});

/**
 * GET /api/${normalizedName}
 * Get all ${pascalName.toLowerCase()}s
 */
export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const items = await ${camelName}Service.getAll();
  
  res.json({
    success: true,
    data: items,
  });
});

/**
 * GET /api/${normalizedName}/:id
 * Get ${pascalName.toLowerCase()} by ID
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await ${camelName}Service.getById(id);
  
  if (!item) {
    throw new NotFoundError('${pascalName} not found');
  }
  
  res.json({
    success: true,
    data: item,
  });
});

/**
 * POST /api/${normalizedName}
 * Create a new ${pascalName.toLowerCase()}
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = create${pascalName}Schema.parse(req.body);
  const item = await ${camelName}Service.create(input);
  
  res.status(201).json({
    success: true,
    data: item,
    message: '${pascalName} created successfully',
  });
});

/**
 * PUT /api/${normalizedName}/:id
 * Update ${pascalName.toLowerCase()} by ID
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = update${pascalName}Schema.parse(req.body);
  const item = await ${camelName}Service.update(id, input);
  
  res.json({
    success: true,
    data: item,
    message: '${pascalName} updated successfully',
  });
});

/**
 * DELETE /api/${normalizedName}/:id
 * Delete ${pascalName.toLowerCase()} by ID
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ${camelName}Service.remove(id);
  
  res.json({
    success: true,
    message: '${pascalName} deleted successfully',
  });
});
`;
}

/**
 * Generate route template
 */
function generateRouteTemplate(pascalName: string, camelName: string, normalizedName: string): string {
  return `import { Router } from 'express';
import * as ${camelName}Controller from '../controllers/${normalizedName}.controller';
import { validateBody } from '../lib/yantr/zod-middleware';
import { 
  create${pascalName}Schema, 
  update${pascalName}Schema 
} from '../controllers/${normalizedName}.controller';

const router = Router();

/**
 * ${pascalName} Routes
 * 
 * GET    /api/${normalizedName}      - Get all ${pascalName.toLowerCase()}s
 * GET    /api/${normalizedName}/:id  - Get ${pascalName.toLowerCase()} by ID
 * POST   /api/${normalizedName}      - Create ${pascalName.toLowerCase()}
 * PUT    /api/${normalizedName}/:id  - Update ${pascalName.toLowerCase()}
 * DELETE /api/${normalizedName}/:id  - Delete ${pascalName.toLowerCase()}
 */

router.get('/', ${camelName}Controller.getAll);
router.get('/:id', ${camelName}Controller.getById);
router.post('/', validateBody(create${pascalName}Schema), ${camelName}Controller.create);
router.put('/:id', validateBody(update${pascalName}Schema), ${camelName}Controller.update);
router.delete('/:id', ${camelName}Controller.remove);

export default router;
`;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Convert string to camelCase
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
