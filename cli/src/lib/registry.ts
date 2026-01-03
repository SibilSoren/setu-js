import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Schema for variant (used by database component)
 */
export const VariantSchema = z.object({
  label: z.string(),
  files: z.array(z.string()),
  dependencies: z.array(z.string()).default([]),
  devDependencies: z.array(z.string()).default([]),
});

/**
 * Schema for a single component in the registry
 * Supports both framework-specific components and variant-based components
 */
export const ComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  frameworkSpecific: z.boolean().optional(),
  requiresSelection: z.boolean().optional(),
  // files can be either an array (simple) or an object keyed by framework
  files: z.union([
    z.array(z.string()),
    z.record(z.string(), z.array(z.string())),
  ]).optional(),
  // dependencies can be either an array or an object with "common" and/or framework keys
  dependencies: z.union([
    z.array(z.string()),
    z.record(z.string(), z.array(z.string())),
  ]).optional().default([]),
  // devDependencies can be either an array or an object with "common" and/or framework keys  
  devDependencies: z.union([
    z.array(z.string()),
    z.record(z.string(), z.array(z.string())),
  ]).optional().default([]),
  // variants for components like database that have multiple options
  variants: z.record(z.string(), VariantSchema).optional(),
});

export type Component = z.infer<typeof ComponentSchema>;

/**
 * Schema for the full registry
 */
export const RegistrySchema = z.object({
  version: z.string(),
  baseUrl: z.string(),
  components: z.record(z.string(), ComponentSchema),
});

export type Registry = z.infer<typeof RegistrySchema>;

// Registry configuration
const REGISTRY_URL = 'https://raw.githubusercontent.com/SibilSoren/setu-js/main/cli/registry/registry.json';
const CACHE_DIR = '.yantr-cache';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

/**
 * Get the cache directory path
 */
function getCacheDir(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  return path.join(homeDir, CACHE_DIR);
}

/**
 * Get cached registry if valid
 */
async function getCachedRegistry(): Promise<Registry | null> {
  const cacheDir = getCacheDir();
  const cachePath = path.join(cacheDir, 'registry.json');
  
  try {
    if (!(await fs.pathExists(cachePath))) {
      return null;
    }

    const stats = await fs.stat(cachePath);
    const age = Date.now() - stats.mtimeMs;
    
    if (age > CACHE_TTL_MS) {
      return null; // Cache expired
    }

    const content = await fs.readJson(cachePath);
    return RegistrySchema.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save registry to cache
 */
async function cacheRegistry(registry: Registry): Promise<void> {
  const cacheDir = getCacheDir();
  const cachePath = path.join(cacheDir, 'registry.json');
  
  try {
    await fs.ensureDir(cacheDir);
    await fs.writeJson(cachePath, registry);
  } catch {
    // Ignore cache write errors
  }
}

/**
 * Fetch registry from GitHub
 */
async function fetchRemoteRegistry(): Promise<Registry> {
  const response = await fetch(REGISTRY_URL);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return RegistrySchema.parse(data);
}

/**
 * Load local registry from CLI package (fallback)
 */
async function loadLocalRegistry(): Promise<Registry> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Try different paths based on dev vs built
  // When bundled, the dist/index.js is in cli/dist/
  // Registry is in cli/registry/
  const possiblePaths = [
    // From source: cli/src/lib -> cli/registry
    path.join(__dirname, '..', '..', 'registry', 'registry.json'),
    // From dist: cli/dist -> cli/registry  
    path.join(__dirname, '..', 'registry', 'registry.json'),
    // Direct path from built bundle
    path.resolve(__dirname, '..', 'registry', 'registry.json'),
  ];

  for (const registryPath of possiblePaths) {
    if (await fs.pathExists(registryPath)) {
      const content = await fs.readJson(registryPath);
      return RegistrySchema.parse(content);
    }
  }

  throw new Error(`Local registry not found. Tried: ${possiblePaths.join(', ')}`);
}

/**
 * Load local template file (for when running from local install)
 */
async function loadLocalTemplateFile(filePath: string): Promise<string | null> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'registry', 'templates', filePath),
    path.join(__dirname, '..', 'registry', 'templates', filePath),
  ];

  for (const templatePath of possiblePaths) {
    if (await fs.pathExists(templatePath)) {
      return fs.readFile(templatePath, 'utf-8');
    }
  }

  return null;
}

/**
 * Get the registry (with caching and fallback)
 */
export async function getRegistry(): Promise<Registry> {
  // Try cache first
  const cached = await getCachedRegistry();
  if (cached) {
    return cached;
  }

  // Try local first (faster when CLI is installed globally)
  try {
    const local = await loadLocalRegistry();
    return local;
  } catch {
    // Local not found, try remote
  }

  // Try fetching from remote with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(REGISTRY_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const remote = RegistrySchema.parse(data);
    await cacheRegistry(remote);
    return remote;
  } catch (error) {
    throw new Error(`Failed to load registry: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a specific component from the registry
 */
export async function getComponent(name: string): Promise<Component | null> {
  const registry = await getRegistry();
  return registry.components[name] || null;
}

/**
 * List all available components
 */
export async function listComponents(): Promise<string[]> {
  const registry = await getRegistry();
  return Object.keys(registry.components);
}

/**
 * Fetch a template file from the registry (local first, then remote)
 */
export async function fetchTemplateFile(filePath: string): Promise<string> {
  // Try local first
  const local = await loadLocalTemplateFile(filePath);
  if (local) {
    return local;
  }

  // Try remote
  const registry = await getRegistry();
  const url = `${registry.baseUrl}/${filePath}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch template: ${url} (${response.status})`);
  }

  return response.text();
}

/**
 * Fetch all files for a component
 */
export async function fetchComponentFiles(
  componentName: string
): Promise<Map<string, string>> {
  const component = await getComponent(componentName);
  
  if (!component) {
    throw new Error(`Component not found: ${componentName}`);
  }

  const files = new Map<string, string>();
  
  for (const filePath of component.files) {
    const content = await fetchTemplateFile(filePath);
    files.set(filePath, content);
  }

  return files;
}

