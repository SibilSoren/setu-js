import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';
import type { PackageManager } from './installer.js';

/**
 * Schema for setu.json configuration file
 */
export const SetuConfigSchema = z.object({
  $schema: z.string().optional(),
  projectName: z.string(),
  srcDir: z.string().default('./src'),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
  installedComponents: z.array(z.string()).default([]),
});

export type SetuConfig = z.infer<typeof SetuConfigSchema>;

const CONFIG_FILENAME = 'setu.json';

/**
 * Check if setu.json exists in the given directory
 */
export async function configExists(cwd: string): Promise<boolean> {
  return fs.pathExists(path.join(cwd, CONFIG_FILENAME));
}

/**
 * Read and parse setu.json
 */
export async function readConfig(cwd: string): Promise<SetuConfig> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  
  if (!(await fs.pathExists(configPath))) {
    throw new Error('setu.json not found. Run "setu init" first.');
  }

  const content = await fs.readJson(configPath);
  return SetuConfigSchema.parse(content);
}

/**
 * Write setu.json configuration
 */
export async function writeConfig(cwd: string, config: SetuConfig): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Create initial setu.json configuration
 */
export function createConfig(
  projectName: string,
  srcDir: string,
  packageManager: PackageManager
): SetuConfig {
  return {
    $schema: 'https://raw.githubusercontent.com/SibilSoren/setu-js/main/cli/schema.json',
    projectName,
    srcDir,
    packageManager,
    installedComponents: [],
  };
}

/**
 * Add a component to the installed list
 */
export async function addInstalledComponent(cwd: string, component: string): Promise<void> {
  const config = await readConfig(cwd);
  
  if (!config.installedComponents.includes(component)) {
    config.installedComponents.push(component);
    await writeConfig(cwd, config);
  }
}

/**
 * Check if a component is already installed
 */
export async function isComponentInstalled(cwd: string, component: string): Promise<boolean> {
  const config = await readConfig(cwd);
  return config.installedComponents.includes(component);
}
