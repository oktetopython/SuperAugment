/**
 * Configuration Provider Interface
 * 
 * Defines the contract for configuration management services
 */

export interface Persona {
  name: string;
  description: string;
  expertise: string[];
  approach: string;
  tools?: string[];
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: unknown[];
}

export interface ToolExample {
  name: string;
  description?: string;
  input: Record<string, unknown>;
  output?: unknown;
}

export interface ToolConfig {
  name: string;
  description: string;
  category: string;
  parameters: Record<string, ToolParameter>;
  personas?: string[];
  examples?: ToolExample[];
}

export interface Pattern {
  name: string;
  pattern: string;
  description?: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Settings {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  cacheEnabled?: boolean;
  maxCacheSize?: number;
  timeout?: number;
  retryAttempts?: number;
  [key: string]: unknown;
}

export interface Config {
  personas: Persona[];
  tools: ToolConfig[];
  patterns?: Record<string, Pattern>;
  settings?: Settings;
}

export interface ConfigChangeEvent {
  type: 'added' | 'changed' | 'removed';
  filename: string;
  timestamp: Date;
}

/**
 * Configuration provider interface
 */
export interface IConfigProvider {
  /**
   * Initialize the configuration provider
   */
  initialize(): Promise<void>;

  /**
   * Get the current configuration
   */
  getConfig(): Promise<Config>;

  /**
   * Get a specific persona by name
   */
  getPersona(name: string): Promise<Persona | undefined>;

  /**
   * Get all available personas
   */
  getPersonas(): Promise<Persona[]>;

  /**
   * Get tool configuration by name
   */
  getToolConfig(name: string): Promise<ToolConfig | undefined>;

  /**
   * Get all tool configurations
   */
  getToolConfigs(): Promise<ToolConfig[]>;

  /**
   * Get a configuration setting
   */
  getSetting<T = any>(key: string, defaultValue?: T): Promise<T>;

  /**
   * Check if configuration is valid
   */
  isValid(): Promise<boolean>;

  /**
   * Reload configuration from source
   */
  reload(): Promise<void>;

  /**
   * Watch for configuration changes
   */
  onConfigChange(callback: (event: ConfigChangeEvent) => void): void;

  /**
   * Stop watching for configuration changes
   */
  stopWatching(): void;

  /**
   * Get configuration metadata
   */
  getMetadata(): Promise<{
    version: string;
    lastModified: Date;
    source: string;
  }>;
}
