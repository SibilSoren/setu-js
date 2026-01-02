import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/**
 * Detect the package manager used in a project by checking lockfiles
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager | null> {
  const lockFiles: Record<string, PackageManager> = {
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
    'package-lock.json': 'npm',
    'bun.lockb': 'bun',
  };

  for (const [lockFile, pm] of Object.entries(lockFiles)) {
    if (await fs.pathExists(path.join(cwd, lockFile))) {
      return pm;
    }
  }

  return null;
}

/**
 * Get the install command for a package manager
 */
export function getInstallCommand(pm: PackageManager): string {
  const commands: Record<PackageManager, string> = {
    npm: 'npm install',
    pnpm: 'pnpm install',
    yarn: 'yarn',
    bun: 'bun install',
  };
  return commands[pm];
}

/**
 * Get the add command for installing specific packages
 */
export function getAddCommand(
  pm: PackageManager,
  packages: string[],
  isDev: boolean = false
): string {
  const pkgList = packages.join(' ');
  
  const commands: Record<PackageManager, string> = {
    npm: `npm install ${isDev ? '-D' : ''} ${pkgList}`.trim(),
    pnpm: `pnpm add ${isDev ? '-D' : ''} ${pkgList}`.trim(),
    yarn: `yarn add ${isDev ? '-D' : ''} ${pkgList}`.trim(),
    bun: `bun add ${isDev ? '-d' : ''} ${pkgList}`.trim(),
  };
  
  return commands[pm];
}

/**
 * Run a package manager command
 */
export async function runPackageManager(
  pm: PackageManager,
  args: string[],
  cwd: string
): Promise<void> {
  await execa(pm, args, { cwd, stdio: 'inherit' });
}

/**
 * Install dependencies using the specified package manager
 */
export async function installDependencies(
  pm: PackageManager,
  packages: string[],
  cwd: string,
  isDev: boolean = false
): Promise<void> {
  const args: string[] = [];

  switch (pm) {
    case 'npm':
      args.push('install', isDev ? '-D' : '', ...packages);
      break;
    case 'pnpm':
      args.push('add', isDev ? '-D' : '', ...packages);
      break;
    case 'yarn':
      args.push('add', isDev ? '-D' : '', ...packages);
      break;
    case 'bun':
      args.push('add', isDev ? '-d' : '', ...packages);
      break;
  }

  // Filter out empty strings
  const filteredArgs = args.filter(Boolean);
  
  await runPackageManager(pm, filteredArgs, cwd);
}

/**
 * Get the executable command for running scripts
 */
export function getRunCommand(pm: PackageManager, script: string): string {
  const commands: Record<PackageManager, string> = {
    npm: `npm run ${script}`,
    pnpm: `pnpm ${script}`,
    yarn: `yarn ${script}`,
    bun: `bun run ${script}`,
  };
  return commands[pm];
}
