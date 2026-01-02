import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import type { PackageManager } from './installer.js';

/**
 * Schema for yantr.json configuration file
 */
export const SetuConfigSchema = z.object({
  $schema: z.string().optional(),
  projectName: z.string(),
  srcDir: z.string(),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun'] as [PackageManager, ...PackageManager[]]),
  installedComponents: z.array(z.string()),
});

export type SetuConfig = z.infer<typeof SetuConfigSchema>;

const CONFIG_FILE = 'yantr.json';

/**
 * Check if yantr.json exists in the given directory
 */
export async function configExists(cwd: string): Promise<boolean> {
  return fs.pathExists(path.join(cwd, CONFIG_FILE));
}

/**
 * Read and parse yantr.json
 */
export async function readConfig(cwd: string): Promise<SetuConfig> {
  const configPath = path.join(cwd, CONFIG_FILE);
  
  if (!(await fs.pathExists(configPath))) {
    throw new Error('yantr.json not found. Run "yantr init" first.');
  }

  const content = await fs.readJson(configPath);
  return SetuConfigSchema.parse(content);
}

/**
 * Write yantr.json configuration
 */
export async function writeConfig(cwd: string, config: SetuConfig): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Create initial yantr.json configuration
 */
export function createConfig(
  projectName: string,
  srcDir: string,
  packageManager: PackageManager
): SetuConfig {
  return {
    $schema: 'https://raw.githubusercontent.com/SibilSoren/yantr-js/main/cli/schema.json',
    projectName,
    srcDir,
    packageManager,
    installedComponents: ['base'],
  };
}
