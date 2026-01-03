import pino from 'pino';

/**
 * Logger configuration
 * 
 * In production, logs are JSON formatted for easy parsing.
 * In development, logs are pretty-printed for readability.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  
  // Base properties added to every log
  base: {
    pid: process.pid,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Timestamp configuration
  timestamp: pino.stdTimeFunctions.isoTime,
  
  // Pretty print in development
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});

/**
 * Create a child logger with additional context
 * 
 * @example
 * ```typescript
 * const userLogger = createLogger({ module: 'user-service' });
 * userLogger.info({ userId: '123' }, 'User logged in');
 * ```
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log levels available:
 * - trace: Very detailed debugging information
 * - debug: Debugging information
 * - info: General information
 * - warn: Warning messages
 * - error: Error messages
 * - fatal: Critical errors
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export default logger;
