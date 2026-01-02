import helmet from 'helmet';

/**
 * Helmet security middleware configuration
 * 
 * Sets various HTTP headers to protect your app from common vulnerabilities.
 * 
 * @see https://helmetjs.github.io/
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'same-origin' },
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Enable if using SharedArrayBuffer
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frameguard (X-Frame-Options)
  frameguard: { action: 'deny' },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // Don't Sniff Mimetype
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // X-XSS-Protection (deprecated but still useful for older browsers)
  xssFilter: true,
});

/**
 * Relaxed helmet config for development
 * Disables CSP which can be annoying during development
 */
export const helmetDevConfig = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

/**
 * Get appropriate helmet config based on environment
 */
export function getHelmetConfig() {
  return process.env.NODE_ENV === 'production' 
    ? helmetConfig 
    : helmetDevConfig;
}

export default helmetConfig;
