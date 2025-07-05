import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { logger } from '../utils/logger.js';

// Import tool implementations
import { AnalyzeCodeTool } from './analysis/AnalyzeCodeTool.js';
import { AnalyzeProjectTool } from './analysis/AnalyzeProjectTool.js';
import { ReviewCodeTool } from './analysis/ReviewCodeTool.js';
import { SecurityScanTool } from './analysis/SecurityScanTool.js';
import { BuildProjectTool } from './build/BuildProjectTool.js';
import { TestProjectTool } from './build/TestProjectTool.js';
import { DeployApplicationTool } from './build/DeployApplicationTool.js';

/**
 * Base interface for all SuperAugment tools
 */
export interface SuperAugmentTool {
  name: string;
  description: string;
  inputSchema: any;
  execute(args: Record<string, any>): Promise<any>;
}

/**
 * Manages all development tools for SuperAugment
 */
export class ToolManager {
  private tools: Map<string, SuperAugmentTool> = new Map();

  constructor(private configManager: ConfigManager) {}

  /**
   * Initialize the tool manager
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing SuperAugment tools...');

      // Register all tools
      this.registerTool(new AnalyzeCodeTool(this.configManager));
      this.registerTool(new AnalyzeProjectTool(this.configManager));
      this.registerTool(new ReviewCodeTool(this.configManager));
      this.registerTool(new SecurityScanTool(this.configManager));
      this.registerTool(new BuildProjectTool(this.configManager));
      this.registerTool(new TestProjectTool(this.configManager));
      this.registerTool(new DeployApplicationTool(this.configManager));

      logger.info(`Registered ${this.tools.size} tools`);
    } catch (error) {
      logger.error('Failed to initialize tools:', error);
      throw error;
    }
  }

  /**
   * Register a tool
   */
  private registerTool(tool: SuperAugmentTool): void {
    this.tools.set(tool.name, tool);
    logger.debug(`Registered tool: ${tool.name}`);
  }

  /**
   * List all available tools
   */
  async listTools(): Promise<Tool[]> {
    const tools: Tool[] = [];

    for (const [name, tool] of this.tools) {
      // Create MCP-compatible schema
      const mcpSchema = {
        type: "object" as const,
        properties: this.zodSchemaToProperties(tool.inputSchema),
      };

      tools.push({
        name,
        description: tool.description,
        inputSchema: mcpSchema,
      });
    }

    return tools;
  }

  /**
   * Call a specific tool
   */
  async callTool(name: string, args: Record<string, any>): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      logger.info(`Executing tool: ${name}`, { args });
      const result = await tool.execute(args);
      logger.info(`Tool execution completed: ${name}`);
      return result;
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, error);
      throw error;
    }
  }

  /**
   * Get a specific tool
   */
  getTool(name: string): SuperAugmentTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Convert Zod schema to MCP-compatible properties
   */
  private zodSchemaToProperties(schema: any): Record<string, any> {
    try {
      // For Zod object schemas, extract the shape
      if (schema._def && schema._def.shape) {
        const properties: Record<string, any> = {};
        const shape = schema._def.shape();

        for (const [key, value] of Object.entries(shape)) {
          properties[key] = this.zodTypeToJsonSchema(value as any);
        }

        return properties;
      }

      // Fallback for other schema types
      return {};
    } catch (error) {
      logger.warn(`Failed to convert schema for tool`, { error });
      return {};
    }
  }

  /**
   * Convert individual Zod type to JSON Schema
   */
  private zodTypeToJsonSchema(zodType: any): any {
    try {
      const typeName = zodType._def?.typeName;

      switch (typeName) {
        case 'ZodString':
          return { type: 'string', description: zodType.description };
        case 'ZodNumber':
          return { type: 'number', description: zodType.description };
        case 'ZodBoolean':
          return { type: 'boolean', description: zodType.description };
        case 'ZodArray':
          return {
            type: 'array',
            items: this.zodTypeToJsonSchema(zodType._def.type),
            description: zodType.description
          };
        case 'ZodEnum':
          return {
            type: 'string',
            enum: zodType._def.values,
            description: zodType.description
          };
        case 'ZodOptional':
          return this.zodTypeToJsonSchema(zodType._def.innerType);
        case 'ZodDefault':
          const baseSchema = this.zodTypeToJsonSchema(zodType._def.innerType);
          return { ...baseSchema, default: zodType._def.defaultValue() };
        default:
          return { type: 'string', description: zodType.description || 'Unknown type' };
      }
    } catch (error) {
      return { type: 'string', description: 'Error parsing schema' };
    }
  }
}
