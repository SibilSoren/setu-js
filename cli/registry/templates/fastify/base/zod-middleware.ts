import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction, preHandlerHookHandler } from 'fastify';
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
 * Validate request data against Zod schemas for Fastify
 * Usage: { preHandler: validate({ body: schema }) }
 */
export function validate(schemas: ValidateOptions): preHandlerHookHandler {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    const allErrors: Record<string, string[]> = {};
    const locations: RequestLocation[] = ['body', 'query', 'params'];

    for (const location of locations) {
      const schema = schemas[location];

      if (schema) {
        const data = request[location];
        const result = await schema.safeParseAsync(data);

        if (!result.success) {
          const errors = formatZodErrors(result.error);

          for (const [key, messages] of Object.entries(errors)) {
            const prefixedKey = `${location}.${key}`;
            allErrors[prefixedKey] = messages;
          }
        } else {
          // Store validated data back on request
          (request as any)[`validated${location.charAt(0).toUpperCase() + location.slice(1)}`] = result.data;
        }
      }
    }

    if (Object.keys(allErrors).length > 0) {
      throw new ValidationError(allErrors);
    }

    done();
  };
}

/**
 * Validate request body
 */
export function validateBody<T extends ZodSchema>(schema: T): preHandlerHookHandler {
  return validate({ body: schema });
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T): preHandlerHookHandler {
  return validate({ query: schema });
}

/**
 * Validate path parameters
 */
export function validateParams<T extends ZodSchema>(schema: T): preHandlerHookHandler {
  return validate({ params: schema });
}

/**
 * Helper to get validated data from request
 */
export function getValidatedBody<T>(request: FastifyRequest): T {
  return (request as any).validatedBody as T;
}

export function getValidatedQuery<T>(request: FastifyRequest): T {
  return (request as any).validatedQuery as T;
}

export function getValidatedParams<T>(request: FastifyRequest): T {
  return (request as any).validatedParams as T;
}

export { z };
