import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..');

// Configuration schemas
const PersonaSchema = z.object({
  name: z.string(),
  description: z.string(),
  expertise: z.array(z.string()),
  approach: z.string(),
  tools: z.array(z.string()).optional(),
});

const ToolConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  parameters: z.record(z.any()),
  personas: z.array(z.string()).optional(),
  examples: z.array(z.any()).optional(),
});

const ConfigSchema = z.object({
  personas: z.array(PersonaSchema),
  tools: z.array(ToolConfigSchema),
  patterns: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
});

export type Persona = z.infer<typeof PersonaSchema>;
export type ToolConfig = z.infer<typeof ToolConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Manages configuration loading and access for SuperAugment
 */
export class ConfigManager {
  private config: Config | null = null;
  private configPath: string;

  constructor() {
    this.configPath = join(PROJECT_ROOT, 'config');
  }

  /**
   * Initialize the configuration manager
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Loading SuperAugment configuration...');
      
      // Load main configuration files
      const personas = await this.loadPersonas();
      const tools = await this.loadTools();
      const patterns = await this.loadPatterns();
      const settings = await this.loadSettings();

      // Combine into main config
      this.config = {
        personas,
        tools,
        patterns,
        settings,
      };

      // Validate configuration
      ConfigSchema.parse(this.config);
      
      logger.info(`Loaded ${personas.length} personas and ${tools.length} tools`);
    } catch (error) {
      logger.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): Config {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }
    return this.config;
  }

  /**
   * Get all personas
   */
  getPersonas(): Persona[] {
    return this.getConfig().personas;
  }

  /**
   * Get a specific persona by name
   */
  getPersona(name: string): Persona | undefined {
    return this.getPersonas().find(p => p.name === name);
  }

  /**
   * Get all tool configurations
   */
  getToolConfigs(): ToolConfig[] {
    return this.getConfig().tools;
  }

  /**
   * Get a specific tool configuration by name
   */
  getToolConfig(name: string): ToolConfig | undefined {
    return this.getToolConfigs().find(t => t.name === name);
  }

  /**
   * Load personas from configuration
   */
  private async loadPersonas(): Promise<Persona[]> {
    const personasPath = join(this.configPath, 'personas.yml');
    const content = await readFile(personasPath, 'utf-8');
    const data = YAML.parse(content);
    return data.personas || [];
  }

  /**
   * Load tool configurations
   */
  private async loadTools(): Promise<ToolConfig[]> {
    const toolsPath = join(this.configPath, 'tools.yml');
    const content = await readFile(toolsPath, 'utf-8');
    const data = YAML.parse(content);
    return data.tools || [];
  }

  /**
   * Load patterns configuration
   */
  private async loadPatterns(): Promise<Record<string, any>> {
    try {
      const patternsPath = join(this.configPath, 'patterns.yml');
      const content = await readFile(patternsPath, 'utf-8');
      return YAML.parse(content) || {};
    } catch (error) {
      logger.warn('No patterns configuration found, using empty patterns');
      return {};
    }
  }

  /**
   * Load settings configuration
   */
  private async loadSettings(): Promise<Record<string, any>> {
    try {
      const settingsPath = join(this.configPath, 'settings.yml');
      const content = await readFile(settingsPath, 'utf-8');
      return YAML.parse(content) || {};
    } catch (error) {
      logger.warn('No settings configuration found, using default settings');
      return {};
    }
  }
}
