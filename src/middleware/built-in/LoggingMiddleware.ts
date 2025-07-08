/**
 * Logging Middleware
 * 
 * Provides comprehensive logging for tool execution including
 * request/response logging, performance metrics, and error tracking.
 */

import type { IMiddleware, MiddlewareContext, MiddlewareResult, NextFunction } from '../interfaces';

export interface LoggingOptions {
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  logPerformance: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  includeArguments: boolean;
  includeResults: boolean;
  maxLogLength: number;
}

/**
 * Logging middleware implementation
 */
export class LoggingMiddleware implements IMiddleware {
  name = 'logging';
  priority = 100; // High priority to log early
  enabled = true;

  private options: LoggingOptions = {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
    logLevel: 'info',
    includeArguments: true,
    includeResults: false, // Don't log results by default for security
    maxLogLength: 1000,
  };

  constructor(options?: Partial<LoggingOptions>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  async execute(
    context: MiddlewareContext,
    next: NextFunction
  ): Promise<MiddlewareResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Log request
    if (this.options.logRequests) {
      this.logRequest(context, requestId);
    }

    try {
      // Execute next middleware/tool
      const result = await next();
      const duration = Date.now() - startTime;

      // Log successful response
      if (this.options.logResponses && result.success) {
        this.logResponse(context, result, duration, requestId);
      }

      // Log performance metrics
      if (this.options.logPerformance) {
        this.logPerformance(context, duration, requestId);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      if (this.options.logErrors) {
        this.logError(context, error as Error, duration, requestId);
      }

      // Return error result
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  private logRequest(context: MiddlewareContext, requestId: string): void {
    const logData: any = {
      requestId,
      toolName: context.toolName,
      timestamp: context.timestamp.toISOString(),
      userId: context.userId,
      sessionId: context.sessionId,
    };

    if (this.options.includeArguments) {
      logData.arguments = this.truncateData(context.arguments);
    }

    context.logger[this.options.logLevel]('Tool execution started', logData);
  }

  private logResponse(
    context: MiddlewareContext,
    result: MiddlewareResult,
    duration: number,
    requestId: string
  ): void {
    const logData: any = {
      requestId,
      toolName: context.toolName,
      duration: `${duration}ms`,
      success: result.success,
    };

    if (this.options.includeResults && result.data) {
      logData.result = this.truncateData(result.data);
    }

    if (result.metadata) {
      logData.metadata = result.metadata;
    }

    context.logger[this.options.logLevel]('Tool execution completed', logData);
  }

  private logError(
    context: MiddlewareContext,
    error: Error,
    duration: number,
    requestId: string
  ): void {
    const logData = {
      requestId,
      toolName: context.toolName,
      duration: `${duration}ms`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    };

    context.logger.error('Tool execution failed', logData);
  }

  private logPerformance(
    context: MiddlewareContext,
    duration: number,
    requestId: string
  ): void {
    const logData = {
      requestId,
      toolName: context.toolName,
      duration: `${duration}ms`,
      performance: {
        slow: duration > 5000, // Mark as slow if > 5 seconds
        category: this.getPerformanceCategory(duration),
      },
    };

    const logLevel = duration > 10000 ? 'warn' : 'debug';
    context.logger[logLevel]('Tool performance metrics', logData);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private truncateData(data: any): any {
    const serialized = JSON.stringify(data);
    if (serialized.length <= this.options.maxLogLength) {
      return data;
    }

    return {
      _truncated: true,
      _originalLength: serialized.length,
      _data: serialized.substring(0, this.options.maxLogLength) + '...',
    };
  }

  private getPerformanceCategory(duration: number): string {
    if (duration < 100) return 'fast';
    if (duration < 1000) return 'normal';
    if (duration < 5000) return 'slow';
    return 'very-slow';
  }

  shouldRun(_context: MiddlewareContext): boolean {
    // Always run logging middleware unless explicitly disabled
    return true;
  }

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async cleanup(): Promise<void> {
    // No cleanup needed
  }

  /**
   * Update logging options
   */
  updateOptions(options: Partial<LoggingOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current logging options
   */
  getOptions(): LoggingOptions {
    return { ...this.options };
  }
}
