/**
 * File System Provider Interface
 * 
 * Defines the contract for file system operations with caching and batch processing
 */

export interface FileStats {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  mtime: Date;
  ctime: Date;
}

export interface FileContent {
  content: string;
  encoding: string;
  size: number;
  mtime: Date;
}

export interface BatchReadOptions {
  maxConcurrency?: number;
  maxFileSize?: number;
  encoding?: string;
  ignoreErrors?: boolean;
}

export interface BatchReadResult {
  successful: Array<{
    path: string;
    content: string;
    size: number;
  }>;
  failed: Array<{
    path: string;
    error: string;
  }>;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in bytes
  enabled?: boolean;
}

export interface WatchOptions {
  recursive?: boolean;
  ignored?: string[];
  persistent?: boolean;
}

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  stats?: FileStats;
  timestamp: Date;
}

/**
 * File system provider interface
 */
export interface IFileSystemProvider {
  /**
   * Initialize the file system provider
   */
  initialize(): Promise<void>;

  /**
   * Check if a path exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file or directory stats
   */
  stat(path: string): Promise<FileStats>;

  /**
   * Read file content
   */
  readFile(path: string, encoding?: string): Promise<string>;

  /**
   * Read file content with metadata
   */
  readFileWithMetadata(path: string, encoding?: string): Promise<FileContent>;

  /**
   * Write file content
   */
  writeFile(path: string, content: string, encoding?: string): Promise<void>;

  /**
   * Read directory contents
   */
  readDir(path: string): Promise<string[]>;

  /**
   * Create directory
   */
  mkdir(path: string, recursive?: boolean): Promise<void>;

  /**
   * Remove file or directory
   */
  remove(path: string): Promise<void>;

  /**
   * Copy file or directory
   */
  copy(src: string, dest: string): Promise<void>;

  /**
   * Move/rename file or directory
   */
  move(src: string, dest: string): Promise<void>;

  /**
   * Find files matching patterns
   */
  glob(patterns: string | string[], options?: {
    cwd?: string;
    ignore?: string[];
    absolute?: boolean;
  }): Promise<string[]>;

  /**
   * Batch read multiple files
   */
  batchRead(paths: string[], options?: BatchReadOptions): Promise<BatchReadResult>;

  /**
   * Watch for file system changes
   */
  watch(
    paths: string | string[],
    callback: (event: FileChangeEvent) => void,
    options?: WatchOptions
  ): Promise<() => void>; // Returns unwatch function

  /**
   * Get cache statistics
   */
  getCacheStats(): Promise<{
    size: number;
    hitRate: number;
    entries: number;
  }>;

  /**
   * Clear cache
   */
  clearCache(): Promise<void>;

  /**
   * Configure cache options
   */
  configureCaching(options: CacheOptions): Promise<void>;

  /**
   * Validate file path
   */
  validatePath(path: string): Promise<boolean>;

  /**
   * Get safe file path (prevents directory traversal)
   */
  getSafePath(path: string, basePath?: string): Promise<string>;

  /**
   * Get file size without reading content
   */
  getFileSize(path: string): Promise<number>;

  /**
   * Check if file is text-based
   */
  isTextFile(path: string): Promise<boolean>;

  /**
   * Get file encoding
   */
  detectEncoding(path: string): Promise<string>;
}
