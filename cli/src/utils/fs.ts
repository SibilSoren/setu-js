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
