import type { Request, Response, NextFunction } from 'express';
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
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * 
 * const createUserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 * 
 * router.post('/users', validate({ body: createUserSchema }), createUser);
 * ```
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
            const prefixedKey = `${location}.${key}`;
            allErrors[prefixedKey] = messages;
          }
        } else {
          // Replace request data with parsed data (for type coercion)
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

/**
 * Validate only request body
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return validate({ body: schema });
}

/**
 * Validate only query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return validate({ query: schema });
}

/**
 * Validate only route parameters
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return validate({ params: schema });
}

// Re-export Zod for convenience
export { z };
