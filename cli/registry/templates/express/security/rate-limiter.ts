import rateLimit from 'express-rate-limit';

/**
 * Default rate limiter configuration
 * 
 * Limits requests per IP address to prevent abuse.
 * Customize the values based on your application needs.
 */
export const rateLimiter = rateLimit({
  // Time window in milliseconds
  windowMs: 15 * 60 * 1000, // 15 minutes
  
  // Maximum requests per window per IP
  max: 100,
  
  // Return rate limit info in headers
  standardHeaders: true,
  
  // Disable X-RateLimit-* headers
  legacyHeaders: false,
  
  // Custom error message
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  
  // Skip rate limiting for certain requests
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/health' || req.url === '/ready';
  },
  
  // Custom key generator (default is IP)
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] as string || 
           req.socket.remoteAddress || 
           'unknown';
  },
});

/**
 * Strict rate limiter for sensitive endpoints (like auth)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      message: 'Too many login attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API rate limiter for general API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    error: {
      message: 'API rate limit exceeded.',
      code: 'API_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
