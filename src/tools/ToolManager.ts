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
      tools.push({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
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
}
