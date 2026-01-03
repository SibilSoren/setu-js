import fs from 'fs-extra';
import path from 'path';

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Copy a file, creating parent directories if needed
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

/**
 * Write content to a file, creating parent directories if needed
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

/**
 * Read file content as string
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * Check if a directory contains a package.json
 */
export async function isNodeProject(cwd: string): Promise<boolean> {
  return fs.pathExists(path.join(cwd, 'package.json'));
}

/**
 * Get project name from package.json
 */
export async function getProjectName(cwd: string): Promise<string | null> {
  const pkgPath = path.join(cwd, 'package.json');
  
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    return pkg.name || null;
  }
  
  return null;
}

/**
 * Check if src directory exists
 */
export async function hasSrcDirectory(cwd: string): Promise<boolean> {
  return fs.pathExists(path.join(cwd, 'src'));
}

/**
 * Create a minimal package.json for a new project with framework dependency
 */
export async function createPackageJson(
  cwd: string, 
  name: string,
  framework?: 'express' | 'hono' | 'fastify'
): Promise<void> {
  const frameworkDeps: Record<string, string> = {};
  
  if (framework === 'express') {
    frameworkDeps['express'] = '^4.18.0';
  } else if (framework === 'hono') {
    frameworkDeps['hono'] = '^4.0.0';
  } else if (framework === 'fastify') {
    frameworkDeps['fastify'] = '^4.0.0';
  }

  const packageJson = {
    name: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      dev: 'ts-node src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
    },
    keywords: [],
    author: '',
    license: 'ISC',
    dependencies: frameworkDeps,
  };

  await writeFile(
    path.join(cwd, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}
