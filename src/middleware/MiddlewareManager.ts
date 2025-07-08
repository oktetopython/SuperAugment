/**
 * Middleware Manager
 * 
 * Manages the middleware pipeline for tool execution with support for
 * priority-based ordering, conditional execution, and performance monitoring.
 */

import { logger } from '../utils/logger.js';
import type {
  IMiddleware,
  IMiddlewareManager,
  ToolContext,
  MiddlewareContext,
  MiddlewareConfig,
  MiddlewareExecutionResult,
  MiddlewareResult,
  NextFunction,
} from './interfaces.js';
import { container, ServiceIdentifiers } from '../core/Container.js';
import type { ICacheProvider } from '../interfaces/ICacheProvider.js';
import type { IPerformanceMonitor } from '../interfaces/IPerformanceMonitor.js';

/**
 * Middleware manager implementation
 */
export class MiddlewareManager implements IMiddlewareManager {
  private middleware: Map<string, IMiddleware> = new Map();
  private cacheProvider?: ICacheProvider;
  private performanceMonitor?: IPerformanceMonitor;

  async initialize(): Promise<void> {
    try {
      // Resolve optional dependencies
      if (container.has(ServiceIdentifiers.CACHE_PROVIDER)) {
        this.cacheProvider = await container.resolve<ICacheProvider>(ServiceIdentifiers.CACHE_PROVIDER);
      }
      
      if (container.has(ServiceIdentifiers.PERFORMANCE_MONITOR)) {
        this.performanceMonitor = await container.resolve<IPerformanceMonitor>(ServiceIdentifiers.PERFORMANCE_MONITOR);
      }

      logger.info('Middleware manager initialized');
    } catch (error) {
      logger.error('Failed to initialize middleware manager:', error);
      throw error;
    }
  }

  register(middleware: IMiddleware): void {
    this.middleware.set(middleware.name, middleware);
    logger.debug(`Registered middleware: ${middleware.name} (priority: ${middleware.priority})`);
  }

  unregister(name: string): void {
    const middleware = this.middleware.get(name);
    if (middleware) {
      this.middleware.delete(name);
      logger.debug(`Unregistered middleware: ${name}`);
    }
  }

  getMiddleware(): IMiddleware[] {
    return Array.from(this.middleware.values())
      .sort((a, b) => a.priority - b.priority);
  }

  async execute(
    context: ToolContext,
    toolExecutor: (args: Record<string, any>) => Promise<any>
  ): Promise<MiddlewareExecutionResult> {
    const startTime = Date.now();
    const executedMiddleware: string[] = [];
    const skippedMiddleware: string[] = [];
    const middlewareDurations: Record<string, number> = {};

    // Create enhanced middleware context
    const middlewareContext: MiddlewareContext = {
      ...context,
      startTime: new Date(startTime),
      performance: {
        timings: {},
        metrics: {},
      },
      cache: {
        get: async (key: string) => {
          return this.cacheProvider ? await this.cacheProvider.get(key) : undefined;
        },
        set: async (key: string, value: any, ttl?: number) => {
          if (this.cacheProvider) {
            await this.cacheProvider.set(key, value, ttl !== undefined ? { ttl } : {});
          }
        },
        has: async (key: string) => {
          return this.cacheProvider ? await this.cacheProvider.has(key) : false;
        },
      },
      logger: {
        debug: (message: string, meta?: any) => logger.debug(message, { ...meta, toolName: context.toolName }),
        info: (message: string, meta?: any) => logger.info(message, { ...meta, toolName: context.toolName }),
        warn: (message: string, meta?: any) => logger.warn(message, { ...meta, toolName: context.toolName }),
        error: (message: string, meta?: any) => logger.error(message, { ...meta, toolName: context.toolName }),
      },
    };

    try {
      // Get enabled middleware sorted by priority
      const enabledMiddleware = this.getMiddleware()
        .filter(m => m.enabled)
        .filter(m => !m.shouldRun || m.shouldRun(middlewareContext));

      // Create middleware execution chain
      let currentArgs = { ...context.arguments };
      let index = 0;

      const executeNext: NextFunction = async (): Promise<MiddlewareResult> => {
        if (index >= enabledMiddleware.length) {
          // Execute the actual tool
          try {
            const result = await toolExecutor(currentArgs);
            return {
              success: true,
              data: result,
            };
          } catch (error) {
            return {
              success: false,
              error: error as Error,
            };
          }
        }

        const middleware = enabledMiddleware[index++]!; // Safe because we checked index < length above

        const middlewareStartTime = Date.now();

        try {
          // Check if middleware should run
          if (middleware.shouldRun && !middleware.shouldRun(middlewareContext)) {
            skippedMiddleware.push(middleware.name);
            return executeNext();
          }

          // Execute middleware
          const result = await middleware.execute(middlewareContext, executeNext);
          
          // Record execution time
          const duration = Date.now() - middlewareStartTime;
          middlewareDurations[middleware.name] = duration;
          executedMiddleware.push(middleware.name);

          // Update context with transformed arguments
          if (result.transformedArgs) {
            currentArgs = { ...currentArgs, ...result.transformedArgs };
          }

          // Record performance metrics
          if (this.performanceMonitor) {
            await this.performanceMonitor.recordMetric({
              name: `middleware.${middleware.name}.duration`,
              value: duration,
              unit: 'ms',
              timestamp: new Date(),
              tags: {
                toolName: context.toolName,
                middleware: middleware.name,
              },
            });
          }

          return result;
        } catch (error) {
          const duration = Date.now() - middlewareStartTime;
          middlewareDurations[middleware.name] = duration;
          executedMiddleware.push(middleware.name);

          logger.error(`Middleware ${middleware.name} failed:`, error);
          
          return {
            success: false,
            error: error as Error,
          };
        }
      };

      // Execute the middleware chain
      const result = await executeNext();
      const totalDuration = Date.now() - startTime;

      // Record overall performance
      if (this.performanceMonitor) {
        await this.performanceMonitor.recordMetric({
          name: 'middleware.pipeline.duration',
          value: totalDuration,
          unit: 'ms',
          timestamp: new Date(),
          tags: {
            toolName: context.toolName,
            success: result.success.toString(),
          },
        });
      }

      const executionResult: MiddlewareExecutionResult = {
        success: result.success,
        result: result.data,
        executedMiddleware,
        skippedMiddleware,
        totalDuration,
        middlewareDurations,
      };
      
      if (result.error) {
        executionResult.error = result.error;
      }
      
      return executionResult;
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      
      logger.error('Middleware pipeline execution failed:', error);
      
      return {
        success: false,
        error: error as Error,
        executedMiddleware,
        skippedMiddleware,
        totalDuration,
        middlewareDurations,
      };
    }
  }

  setEnabled(name: string, enabled: boolean): void {
    const middleware = this.middleware.get(name);
    if (middleware) {
      middleware.enabled = enabled;
      logger.debug(`${enabled ? 'Enabled' : 'Disabled'} middleware: ${name}`);
    }
  }

  getConfig(): MiddlewareConfig[] {
    return Array.from(this.middleware.values()).map(m => ({
      name: m.name,
      enabled: m.enabled,
      priority: m.priority,
      options: {}, // TODO: Add options support
    }));
  }

  async updateConfig(configs: MiddlewareConfig[]): Promise<void> {
    for (const config of configs) {
      const middleware = this.middleware.get(config.name);
      if (middleware) {
        middleware.enabled = config.enabled;
        middleware.priority = config.priority;
        // TODO: Apply options
      }
    }

    logger.info('Middleware configuration updated');
  }

  clear(): void {
    this.middleware.clear();
    logger.debug('Cleared all middleware');
  }

  /**
   * Get middleware statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byPriority: Record<number, number>;
  } {
    const middleware = Array.from(this.middleware.values());
    const enabled = middleware.filter(m => m.enabled);
    const disabled = middleware.filter(m => !m.enabled);
    
    const byPriority: Record<number, number> = {};
    middleware.forEach(m => {
      byPriority[m.priority] = (byPriority[m.priority] || 0) + 1;
    });

    return {
      total: middleware.length,
      enabled: enabled.length,
      disabled: disabled.length,
      byPriority,
    };
  }

  /**
   * Initialize all registered middleware
   */
  async initializeAll(): Promise<void> {
    const middleware = Array.from(this.middleware.values());
    
    for (const m of middleware) {
      if (m.initialize) {
        try {
          await m.initialize();
          logger.debug(`Initialized middleware: ${m.name}`);
        } catch (error) {
          logger.error(`Failed to initialize middleware ${m.name}:`, error);
        }
      }
    }
  }

  /**
   * Cleanup all registered middleware
   */
  async cleanupAll(): Promise<void> {
    const middleware = Array.from(this.middleware.values());
    
    for (const m of middleware) {
      if (m.cleanup) {
        try {
          await m.cleanup();
          logger.debug(`Cleaned up middleware: ${m.name}`);
        } catch (error) {
          logger.error(`Failed to cleanup middleware ${m.name}:`, error);
        }
      }
    }
  }
}
