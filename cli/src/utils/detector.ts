import fs from 'fs-extra';
import path from 'path';

/**
 * Supported frameworks that YantrJS can scaffold
 */
export type Framework = 'express' | 'hono' | 'fastify';

/**
 * Framework metadata
 */
export const FRAMEWORK_INFO: Record<Framework, { 
  name: string; 
  package: string; 
  version: string;
  devDependencies?: string[];
}> = {
  express: {
    name: 'Express.js',
    package: 'express',
    version: '^4.18.0',
    devDependencies: ['@types/express'],
  },
  hono: {
    name: 'Hono',
    package: 'hono',
    version: '^4.0.0',
  },
  fastify: {
    name: 'Fastify',
    package: 'fastify',
    version: '^4.0.0',
  },
};

/**
 * Detect the framework being used in a project by checking package.json dependencies
 */
export async function detectFramework(cwd: string): Promise<Framework | null> {
  const pkgPath = path.join(cwd, 'package.json');
  
  if (!(await fs.pathExists(pkgPath))) {
    return null;
  }

  try {
    const pkg = await fs.readJson(pkgPath);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Check in order of specificity (Hono/Fastify are more specific than Express)
    if (deps['hono']) return 'hono';
    if (deps['fastify']) return 'fastify';
    if (deps['express']) return 'express';
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a framework is currently supported for scaffolding
 */
export function isFrameworkSupported(framework: Framework): boolean {
  // Currently only Express and Hono are fully supported
  return framework === 'express' || framework === 'hono';
}
