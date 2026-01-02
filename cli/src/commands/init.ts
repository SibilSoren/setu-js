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
  writeConfig 
} from '../lib/config.js';
import { 
  isNodeProject, 
  getProjectName, 
  hasSrcDirectory,
  writeFile,
  ensureDir
} from '../utils/fs.js';
import logger from '../utils/logger.js';

interface InitOptions {
  yes?: boolean;
}

export async function init(options: InitOptions) {
  console.clear();
  p.intro(chalk.bgCyan.black(' 🌉 setu init '));

  const cwd = process.cwd();

  // Step 1: Check if this is a Node.js project
  const isNode = await isNodeProject(cwd);
  
  if (!isNode) {
    p.log.error('No package.json found in current directory.');
    p.log.info('Please run this command in an existing Node.js project, or run:');
    p.log.info(chalk.cyan('  npm init -y'));
    p.outro(chalk.red('Initialization cancelled.'));
    process.exit(1);
  }

  // Step 2: Check if setu.json already exists
  const hasConfig = await configExists(cwd);
  
  if (hasConfig && !options.yes) {
    const overwrite = await p.confirm({
      message: 'setu.json already exists. Overwrite?',
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
          p.text({
            message: 'Project name:',
            defaultValue: detectedName,
            placeholder: detectedName,
          }),
        srcDir: () =>
          p.select({
            message: 'Where should Setu put generated files?',
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

    projectName = responses.projectName as string;
    srcDir = responses.srcDir as string;
    packageManager = responses.packageManager as PackageManager;
  }

  // Step 4: Create setu.json
  const spinner = p.spinner();
  spinner.start('Creating configuration...');

  const config = createConfig(projectName, srcDir, packageManager);
  await writeConfig(cwd, config);
  
  spinner.stop('Created setu.json');

  // Step 5: Copy base templates
  spinner.start('Setting up base templates...');

  const templatesDir = path.join(srcDir, 'lib', 'setu');
  await ensureDir(path.join(cwd, templatesDir));

  // Get the registry templates path (relative to the CLI package)
  const cliDir = path.dirname(new URL(import.meta.url).pathname);
  const registryPath = path.join(cliDir, '..', '..', 'registry', 'templates', 'base');

  // Check if running from source or built version
  const baseTemplatesPath = await fs.pathExists(registryPath)
    ? registryPath
    : path.join(cliDir, 'registry', 'templates', 'base');

  // For now, we'll create the files inline since registry fetching comes in Phase 3
  // This will be replaced with actual registry fetching later

  const errorHandlerContent = `import type { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common HTTP error classes
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, true, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409, true, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 422, true, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err);

  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    };

    if (err instanceof ValidationError) {
      response.error = {
        ...response.error as object,
        details: err.errors,
      };
    }

    res.status(err.statusCode).json(response);
    return;
  }

  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: 'INTERNAL_ERROR',
    },
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
`;

  const zodMiddlewareContent = `import type { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from './error-handler';

type RequestLocation = 'body' | 'query' | 'params';

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Format Zod errors into a readable format
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const key = path || 'root';

    if (!errors[key]) {
      errors[key] = [];
    }

    errors[key].push(issue.message);
  }

  return errors;
}

/**
 * Validate request data against Zod schemas
 */
export function validate(schemas: ValidateOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const allErrors: Record<string, string[]> = {};
    const locations: RequestLocation[] = ['body', 'query', 'params'];

    for (const location of locations) {
      const schema = schemas[location];

      if (schema) {
        const result = await schema.safeParseAsync(req[location]);

        if (!result.success) {
          const errors = formatZodErrors(result.error);

          for (const [key, messages] of Object.entries(errors)) {
            const prefixedKey = \`\${location}.\${key}\`;
            allErrors[prefixedKey] = messages;
          }
        } else {
          req[location] = result.data;
        }
      }
    }

    if (Object.keys(allErrors).length > 0) {
      return next(new ValidationError(allErrors));
    }

    next();
  };
}

export function validateBody<T extends ZodSchema>(schema: T) {
  return validate({ body: schema });
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return validate({ query: schema });
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return validate({ params: schema });
}

export { z };
`;

  await writeFile(
    path.join(cwd, templatesDir, 'error-handler.ts'),
    errorHandlerContent
  );

  await writeFile(
    path.join(cwd, templatesDir, 'zod-middleware.ts'),
    zodMiddlewareContent
  );

  spinner.stop('Base templates created');

  // Step 6: Install zod dependency
  spinner.start('Installing dependencies...');

  try {
    await installDependencies(packageManager, ['zod'], cwd, false);
    spinner.stop('Dependencies installed');
  } catch (error) {
    spinner.stop('Could not install dependencies automatically');
    p.log.warning(`Please run: ${chalk.cyan(`${packageManager} add zod`)}`);
  }

  // Summary
  p.note(
    `${chalk.green('✓')} setu.json created
${chalk.green('✓')} ${templatesDir}/error-handler.ts
${chalk.green('✓')} ${templatesDir}/zod-middleware.ts`,
    'Files created'
  );

  p.log.info('Next steps:');
  p.log.step(1, `Add error handler to your Express app:`);
  console.log(chalk.gray(`   import { errorHandler } from '${templatesDir}/error-handler';`));
  console.log(chalk.gray(`   app.use(errorHandler);`));
  p.log.step(2, `Add components: ${chalk.cyan('setu add auth')}`);
  p.log.step(3, `Generate routes: ${chalk.cyan('setu generate route users')}`);

  p.outro(chalk.green('Setu initialized successfully! 🌉'));
}
