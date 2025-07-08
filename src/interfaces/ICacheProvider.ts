/**
 * Cache Provider Interface
 * 
 * Defines the contract for caching services with TTL and LRU support
 */

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: Date;
  ttl?: number;
  size: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheStats {
  size: number;
  entries: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  memoryUsage: number;
  maxMemoryUsage: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in bytes
  maxEntries?: number; // Maximum number of entries
  strategy?: 'lru' | 'lfu' | 'fifo'; // Eviction strategy
  serialize?: boolean; // Whether to serialize values
}

export interface CacheQuery {
  pattern?: string; // Key pattern to match
  tags?: string[]; // Tags to filter by
  minAge?: number; // Minimum age in milliseconds
  maxAge?: number; // Maximum age in milliseconds
  limit?: number; // Maximum number of results
}

/**
 * Cache provider interface
 */
export interface ICacheProvider {
  /**
   * Initialize the cache provider
   */
  initialize(options?: CacheOptions): Promise<void>;

  /**
   * Get a value from cache
   */
  get<T = unknown>(key: string): Promise<T | undefined>;

  /**
   * Set a value in cache
   */
  set<T = unknown>(
    key: string,
    value: T,
    options?: {
      ttl?: number;
      tags?: string[];
    }
  ): Promise<void>;

  /**
   * Check if a key exists in cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete a value from cache
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Get multiple values from cache
   */
  getMany<T = unknown>(keys: string[]): Promise<Array<T | undefined>>;

  /**
   * Set multiple values in cache
   */
  setMany<T = unknown>(
    entries: Array<{
      key: string;
      value: T;
      ttl?: number;
      tags?: string[];
    }>
  ): Promise<void>;

  /**
   * Delete multiple values from cache
   */
  deleteMany(keys: string[]): Promise<number>;

  /**
   * Get cache entry with metadata
   */
  getEntry<T = unknown>(key: string): Promise<CacheEntry<T> | undefined>;

  /**
   * Get all cache entries matching query
   */
  query<T = unknown>(query: CacheQuery): Promise<CacheEntry<T>[]>;

  /**
   * Get all cache keys
   */
  keys(pattern?: string): Promise<string[]>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;

  /**
   * Reset cache statistics
   */
  resetStats(): Promise<void>;

  /**
   * Expire entries older than specified age
   */
  expire(maxAge: number): Promise<number>;

  /**
   * Delete entries by tag
   */
  deleteByTag(tag: string): Promise<number>;

  /**
   * Delete entries by pattern
   */
  deleteByPattern(pattern: string): Promise<number>;

  /**
   * Get cache size in bytes
   */
  getSize(): Promise<number>;

  /**
   * Get number of entries
   */
  getEntryCount(): Promise<number>;

  /**
   * Optimize cache (remove expired entries, defragment)
   */
  optimize(): Promise<void>;

  /**
   * Export cache data
   */
  export(): Promise<Array<CacheEntry>>;

  /**
   * Import cache data
   */
  import(entries: Array<CacheEntry>): Promise<void>;

  /**
   * Set cache event listener
   */
  onEvent(
    event: 'hit' | 'miss' | 'set' | 'delete' | 'expire' | 'evict',
    callback: (key: string, value?: unknown) => void
  ): void;

  /**
   * Remove cache event listener
   */
  offEvent(
    event: 'hit' | 'miss' | 'set' | 'delete' | 'expire' | 'evict',
    callback: (key: string, value?: unknown) => void
  ): void;

  /**
   * Flush cache to persistent storage (if supported)
   */
  flush(): Promise<void>;

  /**
   * Load cache from persistent storage (if supported)
   */
  load(): Promise<void>;
}
