import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

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
 * Global error handler middleware for Hono
 */
export async function errorHandler(err: Error, c: Context): Promise<Response> {
  // Log error for debugging
  console.error('[Error]', err);

  // Handle AppError instances
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    };

    // Include validation errors if present
    if (err instanceof ValidationError) {
      response.error = {
        ...response.error as object,
        details: err.errors,
      };
    }

    return c.json(response, err.statusCode as any);
  }

  // Handle Hono HTTPException
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        message: err.message,
        code: 'HTTP_EXCEPTION',
      },
    }, err.status);
  }

  // Handle unexpected errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return c.json({
    success: false,
    error: {
      message,
      code: 'INTERNAL_ERROR',
    },
  }, statusCode);
}

/**
 * Create error handler middleware for Hono app
 * Usage: app.onError(onError)
 */
export const onError = errorHandler;
