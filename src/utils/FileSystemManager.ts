import { readFile, readdir, stat, access } from 'fs/promises';
import { join, relative, extname, basename } from 'path';
import { glob } from 'glob';
import { logger } from './logger.js';

export interface FileInfo {
  path: string;
  relativePath: string;
  size: number;
  isDirectory: boolean;
  extension: string;
  content?: string;
}

export interface ProjectStructure {
  rootPath: string;
  files: FileInfo[];
  directories: string[];
  packageJson?: any;
  framework?: string | undefined;
  language?: string | undefined;
}

/**
 * Manages file system operations for SuperAugment
 */
export class FileSystemManager {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedExtensions = new Set([
    '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h',
    '.css', '.scss', '.sass', '.less', '.html', '.xml', '.json', '.yaml', '.yml', '.md',
    '.sql', '.sh', '.bat', '.ps1', '.dockerfile', '.gitignore', '.env'
  ]);

  /**
   * Read files matching glob patterns
   */
  async readFiles(patterns: string[], rootPath: string = process.cwd()): Promise<FileInfo[]> {
    try {
      logger.info('Reading files with patterns:', { patterns, rootPath });
      
      const files: FileInfo[] = [];
      
      for (const pattern of patterns) {
        const matchedFiles = await glob(pattern, {
          cwd: rootPath,
          ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'coverage/**'],
          absolute: false,
        });

        for (const filePath of matchedFiles) {
          const fullPath = join(rootPath, filePath);
          const fileInfo = await this.getFileInfo(fullPath, rootPath);
          
          if (fileInfo && this.isAllowedFile(fileInfo)) {
            files.push(fileInfo);
          }
        }
      }

      logger.info(`Read ${files.length} files`);
      return files;
    } catch (error) {
      logger.error('Failed to read files:', error);
      throw error;
    }
  }

  /**
   * Read a single file
   */
  async readFile(filePath: string, rootPath: string = process.cwd()): Promise<FileInfo | null> {
    try {
      const fullPath = join(rootPath, filePath);
      return await this.getFileInfo(fullPath, rootPath);
    } catch (error) {
      logger.error(`Failed to read file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Analyze project structure
   */
  async analyzeProjectStructure(rootPath: string = process.cwd()): Promise<ProjectStructure> {
    try {
      logger.info('Analyzing project structure:', { rootPath });

      const structure: ProjectStructure = {
        rootPath,
        files: [],
        directories: [],
      };

      // Read package.json if exists
      try {
        const packageJsonPath = join(rootPath, 'package.json');
        await access(packageJsonPath);
        const packageContent = await readFile(packageJsonPath, 'utf-8');
        structure.packageJson = JSON.parse(packageContent);
      } catch {
        // package.json doesn't exist, that's fine
      }

      // Detect framework and language
      structure.framework = await this.detectFramework(rootPath, structure.packageJson);
      structure.language = await this.detectPrimaryLanguage(rootPath);

      // Get project files
      const patterns = ['**/*'];
      structure.files = await this.readFiles(patterns, rootPath);

      // Get directories
      structure.directories = await this.getDirectories(rootPath);

      logger.info('Project structure analyzed:', {
        framework: structure.framework,
        language: structure.language,
        fileCount: structure.files.length,
        dirCount: structure.directories.length,
      });

      return structure;
    } catch (error) {
      logger.error('Failed to analyze project structure:', error);
      throw error;
    }
  }

  /**
   * Get file information
   */
  private async getFileInfo(fullPath: string, rootPath: string): Promise<FileInfo | null> {
    try {
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        return null;
      }

      if (stats.size > this.maxFileSize) {
        logger.warn(`File too large, skipping: ${fullPath} (${stats.size} bytes)`);
        return null;
      }

      const relativePath = relative(rootPath, fullPath);
      const extension = extname(fullPath);

      const fileInfo: FileInfo = {
        path: fullPath,
        relativePath,
        size: stats.size,
        isDirectory: false,
        extension,
      };

      // Read content for text files
      if (this.isTextFile(extension)) {
        try {
          fileInfo.content = await readFile(fullPath, 'utf-8');
        } catch (error) {
          logger.warn(`Failed to read file content: ${fullPath}`, error);
        }
      }

      return fileInfo;
    } catch (error) {
      logger.error(`Failed to get file info for ${fullPath}:`, error);
      return null;
    }
  }

  /**
   * Check if file is allowed
   */
  private isAllowedFile(fileInfo: FileInfo): boolean {
    // Skip hidden files and directories
    if (basename(fileInfo.relativePath).startsWith('.') && 
        !fileInfo.relativePath.includes('.env') && 
        !fileInfo.relativePath.includes('.gitignore')) {
      return false;
    }

    // Check extension
    return this.allowedExtensions.has(fileInfo.extension) || fileInfo.extension === '';
  }

  /**
   * Check if file is text file
   */
  private isTextFile(extension: string): boolean {
    const textExtensions = new Set([
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h',
      '.css', '.scss', '.sass', '.less', '.html', '.xml', '.json', '.yaml', '.yml', '.md',
      '.sql', '.sh', '.bat', '.ps1', '.txt', '.env', '.gitignore'
    ]);
    return textExtensions.has(extension) || extension === '';
  }

  /**
   * Detect project framework
   */
  private async detectFramework(rootPath: string, packageJson?: any): Promise<string | undefined> {
    if (packageJson?.dependencies || packageJson?.devDependencies) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.react) return 'React';
      if (deps.vue) return 'Vue.js';
      if (deps.angular || deps['@angular/core']) return 'Angular';
      if (deps.next) return 'Next.js';
      if (deps.nuxt) return 'Nuxt.js';
      if (deps.express) return 'Express.js';
      if (deps.fastify) return 'Fastify';
      if (deps.nestjs || deps['@nestjs/core']) return 'NestJS';
    }

    // Check for framework-specific files
    try {
      await access(join(rootPath, 'angular.json'));
      return 'Angular';
    } catch {}

    try {
      await access(join(rootPath, 'nuxt.config.js'));
      return 'Nuxt.js';
    } catch {}

    try {
      await access(join(rootPath, 'next.config.js'));
      return 'Next.js';
    } catch {}

    return undefined;
  }

  /**
   * Detect primary programming language
   */
  private async detectPrimaryLanguage(rootPath: string): Promise<string | undefined> {
    try {
      const files = await glob('**/*.{js,ts,py,java,go,rs,cpp,c}', {
        cwd: rootPath,
        ignore: ['node_modules/**', 'dist/**', 'build/**'],
      });

      const langCounts: Record<string, number> = {};
      
      for (const file of files) {
        const ext = extname(file);
        const lang = this.extensionToLanguage(ext);
        if (lang) {
          langCounts[lang] = (langCounts[lang] || 0) + 1;
        }
      }

      // Return the most common language
      const sortedLangs = Object.entries(langCounts).sort(([,a], [,b]) => b - a);
      return sortedLangs[0]?.[0];
    } catch {
      return undefined;
    }
  }

  /**
   * Map file extension to language
   */
  private extensionToLanguage(ext: string): string | undefined {
    const mapping: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'JavaScript',
      '.tsx': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.cpp': 'C++',
      '.c': 'C',
    };
    return mapping[ext];
  }

  /**
   * Get directories in project
   */
  private async getDirectories(rootPath: string): Promise<string[]> {
    try {
      const items = await readdir(rootPath, { withFileTypes: true });
      const directories = items
        .filter(item => item.isDirectory())
        .map(item => item.name)
        .filter(name => !name.startsWith('.') && !['node_modules', 'dist', 'build', 'coverage'].includes(name));
      
      return directories;
    } catch {
      return [];
    }
  }
}
