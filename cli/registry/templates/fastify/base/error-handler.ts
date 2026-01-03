import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

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
 * Global error handler for Fastify
 * Usage: fastify.setErrorHandler(errorHandler)
 */
export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log error for debugging
  request.log.error(error);

  // Handle AppError instances
  if (error instanceof AppError) {
    const response: Record<string, unknown> = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    };

    // Include validation errors if present
    if (error instanceof ValidationError) {
      response.error = {
        ...response.error as object,
        details: error.errors,
      };
    }

    reply.status(error.statusCode).send(response);
    return;
  }

  // Handle Fastify validation errors
  if ('validation' in error && Array.isArray((error as any).validation)) {
    reply.status(400).send({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: (error as any).validation,
      },
    });
    return;
  }

  // Handle unexpected errors
  const statusCode = (error as FastifyError).statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  reply.status(statusCode).send({
    success: false,
    error: {
      message,
      code: 'INTERNAL_ERROR',
    },
  });
}
