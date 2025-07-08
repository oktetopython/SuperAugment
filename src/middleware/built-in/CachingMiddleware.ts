/**
 * Caching Middleware
 * 
 * Provides intelligent caching for tool execution results with
 * configurable TTL, cache keys, and invalidation strategies.
 */

import { createHash } from 'crypto';
import type { IMiddleware, MiddlewareContext, MiddlewareResult, NextFunction } from '../interfaces';

export interface CachingOptions {
  enabled: boolean;
  defaultTtl: number; // Default TTL in milliseconds
  maxCacheSize: number; // Maximum cache size in bytes
  keyPrefix: string;
  includeUserId: boolean;
  includeSessionId: boolean;
  cacheableTools: string[]; // Tools that should be cached
  nonCacheableTools: string[]; // Tools that should never be cached
  cacheableResults: (result: any) => boolean; // Function to determine if result should be cached
  generateCacheKey: (context: MiddlewareContext) => string; // Custom cache key generator
}

/**
 * Caching middleware implementation
 */
export class CachingMiddleware implements IMiddleware {
  name = 'caching';
  priority = 200; // Medium priority
  enabled = true;

  private options: CachingOptions = {
    enabled: true,
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    keyPrefix: 'tool:',
    includeUserId: false, // Don't include user ID by default for shared caching
    includeSessionId: false,
    cacheableTools: [], // Empty means all tools are cacheable
    nonCacheableTools: ['deploy_application', 'test_project'], // Tools that shouldn't be cached
    cacheableResults: (result: any) => {
      // Don't cache error results or results with sensitive data
      return result && 
             typeof result === 'object' && 
             !result.error && 
             !result.sensitive &&
             !result.realtime;
    },
    generateCacheKey: (context: MiddlewareContext) => {
      return this.generateDefaultCacheKey(context);
    },
  };

  constructor(options?: Partial<CachingOptions>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  async execute(
    context: MiddlewareContext,
    next: NextFunction
  ): Promise<MiddlewareResult> {
    // Check if caching is enabled and tool is cacheable
    if (!this.options.enabled || !this.isToolCacheable(context.toolName)) {
      return next();
    }

    // Generate cache key
    const cacheKey = this.options.generateCacheKey(context);

    try {
      // Try to get cached result
      const cachedResult = await context.cache.get(cacheKey);
      if (cachedResult) {
        context.logger.debug('Cache hit', { 
          toolName: context.toolName, 
          cacheKey: this.sanitizeCacheKey(cacheKey) 
        });

        return {
          success: true,
          data: cachedResult,
          metadata: {
            cached: true,
            cacheKey: this.sanitizeCacheKey(cacheKey),
            cacheHit: true,
          },
        };
      }

      context.logger.debug('Cache miss', { 
        toolName: context.toolName, 
        cacheKey: this.sanitizeCacheKey(cacheKey) 
      });

      // Execute next middleware/tool
      const result = await next();

      // Cache the result if it's successful and cacheable
      if (result.success && this.options.cacheableResults(result.data)) {
        await this.cacheResult(context, cacheKey, result.data);
        
        // Add cache metadata to result
        if (result.metadata) {
          result.metadata['cached'] = true;
          result.metadata['cacheKey'] = this.sanitizeCacheKey(cacheKey);
          result.metadata['cacheHit'] = false;
        } else {
          result.metadata = {
            cached: true,
            cacheKey: this.sanitizeCacheKey(cacheKey),
            cacheHit: false,
          };
        }
      }

      return result;
    } catch (error) {
      context.logger.warn('Caching middleware error, proceeding without cache', {
        error: (error as Error).message,
        toolName: context.toolName,
      });

      // If caching fails, continue without caching
      return next();
    }
  }

  private isToolCacheable(toolName: string): boolean {
    // If tool is explicitly non-cacheable, don't cache
    if (this.options.nonCacheableTools.includes(toolName)) {
      return false;
    }

    // If specific cacheable tools are defined, only cache those
    if (this.options.cacheableTools.length > 0) {
      return this.options.cacheableTools.includes(toolName);
    }

    // Otherwise, cache all tools except non-cacheable ones
    return true;
  }

  private generateDefaultCacheKey(context: MiddlewareContext): string {
    const keyParts = [
      this.options.keyPrefix,
      context.toolName,
    ];

    // Include user ID if configured
    if (this.options.includeUserId && context.userId) {
      keyParts.push(`user:${context.userId}`);
    }

    // Include session ID if configured
    if (this.options.includeSessionId && context.sessionId) {
      keyParts.push(`session:${context.sessionId}`);
    }

    // Hash the arguments to create a deterministic key
    const argsHash = this.hashArguments(context.arguments);
    keyParts.push(`args:${argsHash}`);

    return keyParts.join(':');
  }

  private hashArguments(args: Record<string, any>): string {
    // Sort keys to ensure consistent hashing
    const sortedArgs = Object.keys(args)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = args[key];
        return sorted;
      }, {} as Record<string, any>);

    const argsString = JSON.stringify(sortedArgs);
    return createHash('sha256').update(argsString).digest('hex').substring(0, 16);
  }

  private async cacheResult(
    context: MiddlewareContext,
    cacheKey: string,
    result: any
  ): Promise<void> {
    try {
      await context.cache.set(cacheKey, result, this.options.defaultTtl);
      
      context.logger.debug('Result cached', {
        toolName: context.toolName,
        cacheKey: this.sanitizeCacheKey(cacheKey),
        ttl: this.options.defaultTtl,
      });
    } catch (error) {
      context.logger.warn('Failed to cache result', {
        error: (error as Error).message,
        toolName: context.toolName,
        cacheKey: this.sanitizeCacheKey(cacheKey),
      });
    }
  }

  private sanitizeCacheKey(cacheKey: string): string {
    // Remove sensitive information from cache key for logging
    return cacheKey.replace(/user:[^:]+/g, 'user:***')
                   .replace(/session:[^:]+/g, 'session:***');
  }

  shouldRun(context: MiddlewareContext): boolean {
    return this.options.enabled && this.isToolCacheable(context.toolName);
  }

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async cleanup(): Promise<void> {
    // No cleanup needed
  }

  /**
   * Update caching options
   */
  updateOptions(options: Partial<CachingOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current caching options
   */
  getOptions(): CachingOptions {
    return { ...this.options };
  }

  /**
   * Invalidate cache for a specific tool
   */
  async invalidateToolCache(
    context: MiddlewareContext,
    toolName: string
  ): Promise<void> {
    // This would require access to the cache provider to implement pattern-based deletion
    // For now, we'll just log the intent
    context.logger.info('Cache invalidation requested', { toolName });
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(_context: MiddlewareContext): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    // This would require the cache provider to track statistics
    // For now, return placeholder data
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
    };
  }
}
