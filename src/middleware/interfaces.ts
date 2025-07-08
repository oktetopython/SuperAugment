/**
 * Middleware Interfaces
 * 
 * Defines the contracts for middleware components in the tool execution pipeline
 */

export interface ToolContext {
  toolName: string;
  arguments: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface MiddlewareContext extends ToolContext {
  startTime: Date;
  performance: {
    timings: Record<string, number>;
    metrics: Record<string, any>;
  };
  cache: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any, ttl?: number) => Promise<void>;
    has: (key: string) => Promise<boolean>;
  };
  logger: {
    debug: (message: string, meta?: any) => void;
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
  };
}

export interface MiddlewareResult {
  success: boolean;
  data?: any;
  error?: Error;
  metadata?: Record<string, any>;
  skipRemaining?: boolean; // Skip remaining middleware
  transformedArgs?: Record<string, any>; // Transform arguments for next middleware
}

export type NextFunction = () => Promise<MiddlewareResult>;

/**
 * Base middleware interface
 */
export interface IMiddleware {
  name: string;
  priority: number;
  enabled: boolean;
  
  /**
   * Execute the middleware
   */
  execute(
    context: MiddlewareContext,
    next: NextFunction
  ): Promise<MiddlewareResult>;

  /**
   * Initialize the middleware
   */
  initialize?(): Promise<void>;

  /**
   * Cleanup the middleware
   */
  cleanup?(): Promise<void>;

  /**
   * Check if middleware should run for this context
   */
  shouldRun?(context: MiddlewareContext): boolean;
}

/**
 * Middleware configuration
 */
export interface MiddlewareConfig {
  name: string;
  enabled: boolean;
  priority: number;
  options: Record<string, any>;
}

/**
 * Middleware execution result
 */
export interface MiddlewareExecutionResult {
  success: boolean;
  result?: any;
  error?: Error;
  executedMiddleware: string[];
  skippedMiddleware: string[];
  totalDuration: number;
  middlewareDurations: Record<string, number>;
}

/**
 * Middleware manager interface
 */
export interface IMiddlewareManager {
  /**
   * Initialize the middleware manager
   */
  initialize(): Promise<void>;

  /**
   * Register a middleware
   */
  register(middleware: IMiddleware): void;

  /**
   * Unregister a middleware
   */
  unregister(name: string): void;

  /**
   * Get all registered middleware
   */
  getMiddleware(): IMiddleware[];

  /**
   * Execute middleware pipeline
   */
  execute(
    context: ToolContext,
    toolExecutor: (args: Record<string, any>) => Promise<any>
  ): Promise<MiddlewareExecutionResult>;

  /**
   * Enable/disable middleware
   */
  setEnabled(name: string, enabled: boolean): void;

  /**
   * Get middleware configuration
   */
  getConfig(): MiddlewareConfig[];

  /**
   * Update middleware configuration
   */
  updateConfig(configs: MiddlewareConfig[]): Promise<void>;

  /**
   * Clear all middleware
   */
  clear(): void;
}
