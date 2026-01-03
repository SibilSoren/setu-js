import type { Context, Next, MiddlewareHandler } from 'hono';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from './error-handler';

type RequestLocation = 'body' | 'query' | 'param';

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  param?: ZodSchema;
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
 * Validate request data against Zod schemas for Hono
 */
export function validate(schemas: ValidateOptions): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const allErrors: Record<string, string[]> = {};

    // Validate body
    if (schemas.body) {
      try {
        const body = await c.req.json();
        const result = await schemas.body.safeParseAsync(body);

        if (!result.success) {
          const errors = formatZodErrors(result.error);
          for (const [key, messages] of Object.entries(errors)) {
            allErrors[`body.${key}`] = messages;
          }
        } else {
          c.set('validatedBody', result.data);
        }
      } catch (e) {
        allErrors['body'] = ['Invalid JSON body'];
      }
    }

    // Validate query parameters
    if (schemas.query) {
      const query = c.req.query();
      const result = await schemas.query.safeParseAsync(query);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        for (const [key, messages] of Object.entries(errors)) {
          allErrors[`query.${key}`] = messages;
        }
      } else {
        c.set('validatedQuery', result.data);
      }
    }

    // Validate path parameters
    if (schemas.param) {
      const param = c.req.param();
      const result = await schemas.param.safeParseAsync(param);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        for (const [key, messages] of Object.entries(errors)) {
          allErrors[`param.${key}`] = messages;
        }
      } else {
        c.set('validatedParam', result.data);
      }
    }

    if (Object.keys(allErrors).length > 0) {
      throw new ValidationError(allErrors);
    }

    await next();
  };
}

/**
 * Validate request body
 */
export function validateBody<T extends ZodSchema>(schema: T): MiddlewareHandler {
  return validate({ body: schema });
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T): MiddlewareHandler {
  return validate({ query: schema });
}

/**
 * Validate path parameters
 */
export function validateParam<T extends ZodSchema>(schema: T): MiddlewareHandler {
  return validate({ param: schema });
}

/**
 * Helper to get validated data from context
 */
export function getValidatedBody<T>(c: Context): T {
  return c.get('validatedBody') as T;
}

export function getValidatedQuery<T>(c: Context): T {
  return c.get('validatedQuery') as T;
}

export function getValidatedParam<T>(c: Context): T {
  return c.get('validatedParam') as T;
}

export { z };
