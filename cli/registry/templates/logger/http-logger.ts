import pinoHttp from 'pino-http';
import { logger } from './logger';

/**
 * HTTP request logging middleware
 * 
 * Logs all incoming requests with:
 * - Method, URL, status code
 * - Response time
 * - Request ID for tracing
 * 
 * @example
 * ```typescript
 * import express from 'express';
 * import { httpLogger } from './lib/yantr/logger/http-logger';
 * 
 * const app = express();
 * app.use(httpLogger);
 * ```
 */
export const httpLogger = pinoHttp({
  logger,
  
  // Generate unique request ID
  genReqId: (req) => {
    return req.headers['x-request-id'] as string || crypto.randomUUID();
  },
  
  // Custom log level based on status code
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  
  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  
  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  
  // Properties to include in logs
  customProps: (req) => ({
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  }),
  
  // Don't log these paths (health checks, etc.)
  autoLogging: {
    ignore: (req) => {
      const ignorePaths = ['/health', '/ready', '/metrics'];
      return ignorePaths.includes(req.url || '');
    },
  },
});

export default httpLogger;
