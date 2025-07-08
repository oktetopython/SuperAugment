/**
 * Layered Error Handler
 * 
 * Implements a layered error handling strategy where different layers
 * can handle errors with their own specific logic while maintaining
 * a unified error format and recovery mechanism.
 */

import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';
import type {
  IErrorHandler,
  ErrorContext,
  ErrorRecoveryStrategy,
  ErrorReport,
  ErrorMetrics,
} from '../interfaces/IErrorHandler.js';
import {
  ErrorCode,
  SuperAugmentError,
  ToolExecutionError,
  AnalysisError,
  ConfigurationError,
  FileSystemError,
} from './ErrorTypes.js';

/**
 * Error layer interface
 */
interface ErrorLayer {
  name: string;
  priority: number;
  canHandle: (error: Error, context: ErrorContext) => boolean;
  handle: (error: Error, context: ErrorContext) => Promise<ErrorReport>;
}

/**
 * Layered error handler implementation
 */
export class LayeredErrorHandler implements IErrorHandler {
  private layers: ErrorLayer[] = [];
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map();
  private errorReports: ErrorReport[] = [];
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByCode: {} as Record<ErrorCode, number>,
    errorsBySeverity: {},
    recoverySuccessRate: 0,
    averageRecoveryTime: 0,
  };
  private errorCallbacks: Array<(report: ErrorReport) => void> = [];
  private recoveryCallbacks: Array<(report: ErrorReport, result: any) => void> = [];

  async initialize(): Promise<void> {
    // Register default error layers
    this.registerLayer({
      name: 'tool-execution',
      priority: 1,
      canHandle: (error) => error instanceof ToolExecutionError,
      handle: this.handleToolExecutionError.bind(this),
    });

    this.registerLayer({
      name: 'analysis',
      priority: 2,
      canHandle: (error) => error instanceof AnalysisError,
      handle: this.handleAnalysisError.bind(this),
    });

    this.registerLayer({
      name: 'configuration',
      priority: 3,
      canHandle: (error) => error instanceof ConfigurationError,
      handle: this.handleConfigurationError.bind(this),
    });

    this.registerLayer({
      name: 'filesystem',
      priority: 4,
      canHandle: (error) => error instanceof FileSystemError,
      handle: this.handleFileSystemError.bind(this),
    });

    this.registerLayer({
      name: 'generic',
      priority: 999,
      canHandle: () => true, // Catch-all layer
      handle: this.handleGenericError.bind(this),
    });

    // Register default recovery strategies
    this.registerDefaultRecoveryStrategies();

    logger.info('Layered error handler initialized');
  }

  /**
   * Register an error layer
   */
  registerLayer(layer: ErrorLayer): void {
    this.layers.push(layer);
    this.layers.sort((a, b) => a.priority - b.priority);
    logger.debug(`Registered error layer: ${layer.name}`);
  }

  /**
   * Remove an error layer
   */
  removeLayer(name: string): void {
    this.layers = this.layers.filter(layer => layer.name !== name);
    logger.debug(`Removed error layer: ${name}`);
  }

  async handleError(
    error: Error,
    context: ErrorContext,
    options?: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      recoverable?: boolean;
      silent?: boolean;
    }
  ): Promise<ErrorReport> {
    const startTime = Date.now();

    try {
      // Find appropriate layer to handle the error
      const layer = this.layers.find(l => l.canHandle(error, context));
      
      if (!layer) {
        throw new Error(`No error layer found to handle error: ${error.message}`);
      }

      // Handle error with the appropriate layer
      const report = await layer.handle(error, context);
      
      // Apply options
      if (options?.severity) {
        report.severity = options.severity;
      }
      
      if (options?.recoverable !== undefined) {
        report.recoverable = options.recoverable;
      }

      // Attempt recovery if error is recoverable
      if (report.recoverable) {
        const recoveryResult = await this.attemptRecovery(error, context);
        report.recoveryAttempted = true;
        report.recoverySuccessful = recoveryResult.recovered;
      }

      // Update metrics
      this.updateMetrics(report, Date.now() - startTime);

      // Store report
      this.errorReports.push(report);

      // Notify callbacks
      if (!options?.silent) {
        this.errorCallbacks.forEach(callback => {
          try {
            callback(report);
          } catch (callbackError) {
            logger.error('Error in error callback:', callbackError);
          }
        });
      }

      // Log error
      this.logError(report);

      return report;
    } catch (handlingError) {
      logger.error('Error while handling error:', handlingError);
      
      // Create fallback error report
      const fallbackReport: ErrorReport = {
        id: randomUUID(),
        error,
        context,
        code: ErrorCode.UNKNOWN_ERROR,
        severity: 'critical',
        recoverable: false,
        recoveryAttempted: false,
        timestamp: new Date(),
        stackTrace: error.stack || '',
      };

      this.errorReports.push(fallbackReport);
      return fallbackReport;
    }
  }

  registerRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.name, strategy);
    logger.debug(`Registered recovery strategy: ${strategy.name}`);
  }

  removeRecoveryStrategy(name: string): void {
    this.recoveryStrategies.delete(name);
    logger.debug(`Removed recovery strategy: ${name}`);
  }

  getRecoveryStrategies(): ErrorRecoveryStrategy[] {
    return Array.from(this.recoveryStrategies.values());
  }

  async attemptRecovery(
    error: Error,
    context: ErrorContext
  ): Promise<{
    recovered: boolean;
    result?: any;
    strategy?: string;
    attempts: number;
  }> {
    let attempts = 0;
    
    for (const [name, strategy] of this.recoveryStrategies) {
      if (strategy.canRecover(error, context)) {
        const maxRetries = strategy.maxRetries || 1;
        
        for (let retry = 0; retry < maxRetries; retry++) {
          attempts++;
          
          try {
            if (strategy.retryDelay && retry > 0) {
              await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
            }
            
            const result = await strategy.recover(error, context);
            
            logger.info(`Recovery successful with strategy: ${name}`, {
              attempts,
              strategy: name,
            });
            
            return {
              recovered: true,
              result,
              strategy: name,
              attempts,
            };
          } catch (recoveryError) {
            logger.warn(`Recovery attempt ${retry + 1} failed for strategy ${name}:`, recoveryError);
          }
        }
      }
    }

    return {
      recovered: false,
      attempts,
    };
  }

  createError(
    code: ErrorCode,
    message: string,
    context?: ErrorContext,
    cause?: Error
  ): Error {
    const errorClass = this.getErrorClassForCode(code);
    const error = new errorClass(message, code);
    
    if (cause) {
      error.cause = cause;
    }
    
    if (context) {
      (error as any).context = context;
    }
    
    return error;
  }

  isRecoverable(error: Error, context: ErrorContext): boolean {
    return Array.from(this.recoveryStrategies.values())
      .some(strategy => strategy.canRecover(error, context));
  }

  async getMetrics(): Promise<ErrorMetrics> {
    return { ...this.metrics };
  }

  async clearMetrics(): Promise<void> {
    this.metrics = {
      totalErrors: 0,
      errorsByCode: {} as Record<ErrorCode, number>,
      errorsBySeverity: {},
      recoverySuccessRate: 0,
      averageRecoveryTime: 0,
    };
  }

  async getErrorReports(options?: {
    since?: Date;
    severity?: string[];
    codes?: ErrorCode[];
    limit?: number;
  }): Promise<ErrorReport[]> {
    let reports = [...this.errorReports];

    if (options?.since) {
      reports = reports.filter(r => r.timestamp >= options.since!);
    }

    if (options?.severity) {
      reports = reports.filter(r => options.severity!.includes(r.severity));
    }

    if (options?.codes) {
      reports = reports.filter(r => options.codes!.includes(r.code));
    }

    if (options?.limit) {
      reports = reports.slice(-options.limit);
    }

    return reports;
  }

  async exportErrorReports(format: 'json' | 'csv'): Promise<string> {
    const reports = await this.getErrorReports();
    
    if (format === 'json') {
      return JSON.stringify(reports, null, 2);
    } else {
      // CSV format
      const headers = ['id', 'code', 'severity', 'message', 'timestamp', 'recoverable', 'recoverySuccessful'];
      const rows = reports.map(r => [
        r.id,
        r.code,
        r.severity,
        r.error.message,
        r.timestamp.toISOString(),
        r.recoverable,
        r.recoverySuccessful || false,
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  onError(callback: (report: ErrorReport) => void): void {
    this.errorCallbacks.push(callback);
  }

  onRecovery(callback: (report: ErrorReport, result: any) => void): void {
    this.recoveryCallbacks.push(callback);
  }

  validateContext(context: ErrorContext): boolean {
    return !!(context.operation && context.component && context.timestamp);
  }

  sanitizeError(error: Error): Error {
    const sanitized = new Error(error.message);
    sanitized.name = error.name;
    sanitized.stack = error.stack || '';
    
    // Remove sensitive information
    if (error.message.includes('password') || error.message.includes('token')) {
      sanitized.message = error.message.replace(/password=\w+/gi, 'password=***')
                                     .replace(/token=\w+/gi, 'token=***');
    }
    
    return sanitized;
  }

  classifyError(error: Error): {
    code: ErrorCode;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    recoverable: boolean;
  } {
    if (error instanceof SuperAugmentError) {
      return {
        code: error.code,
        severity: this.getSeverityForCode(error.code),
        category: this.getCategoryForCode(error.code),
        recoverable: this.isRecoverableByCode(error.code),
      };
    }

    return {
      code: ErrorCode.UNKNOWN_ERROR,
      severity: 'medium',
      category: 'unknown',
      recoverable: false,
    };
  }

  // Private helper methods

  private async handleToolExecutionError(error: Error, context: ErrorContext): Promise<ErrorReport> {
    const toolError = error as ToolExecutionError;
    return {
      id: randomUUID(),
      error,
      context,
      code: toolError.code,
      severity: 'medium',
      recoverable: true,
      recoveryAttempted: false,
      timestamp: new Date(),
      stackTrace: error.stack || "",
    };
  }

  private async handleAnalysisError(error: Error, context: ErrorContext): Promise<ErrorReport> {
    const analysisError = error as AnalysisError;
    return {
      id: randomUUID(),
      error,
      context,
      code: analysisError.code,
      severity: 'low',
      recoverable: true,
      recoveryAttempted: false,
      timestamp: new Date(),
      stackTrace: error.stack || "",
    };
  }

  private async handleConfigurationError(error: Error, context: ErrorContext): Promise<ErrorReport> {
    const configError = error as ConfigurationError;
    return {
      id: randomUUID(),
      error,
      context,
      code: configError.code,
      severity: 'high',
      recoverable: false,
      recoveryAttempted: false,
      timestamp: new Date(),
      stackTrace: error.stack || "",
    };
  }

  private async handleFileSystemError(error: Error, context: ErrorContext): Promise<ErrorReport> {
    const fsError = error as FileSystemError;
    return {
      id: randomUUID(),
      error,
      context,
      code: fsError.code,
      severity: 'medium',
      recoverable: true,
      recoveryAttempted: false,
      timestamp: new Date(),
      stackTrace: error.stack || "",
    };
  }

  private async handleGenericError(error: Error, context: ErrorContext): Promise<ErrorReport> {
    return {
      id: randomUUID(),
      error,
      context,
      code: ErrorCode.UNKNOWN_ERROR,
      severity: 'medium',
      recoverable: false,
      recoveryAttempted: false,
      timestamp: new Date(),
      stackTrace: error.stack || "",
    };
  }

  private registerDefaultRecoveryStrategies(): void {
    // Retry strategy for transient errors
    this.registerRecoveryStrategy({
      name: 'retry',
      canRecover: (error) => {
        const transientCodes = [
          ErrorCode.FILE_READ_ERROR,
          ErrorCode.NETWORK_ERROR,
          ErrorCode.TIMEOUT_ERROR,
        ];
        return error instanceof SuperAugmentError && 
               transientCodes.includes(error.code);
      },
      recover: async (error, _context) => {
        // Simple retry - the original operation should be retried by the caller
        throw error; // Re-throw to trigger retry
      },
      maxRetries: 3,
      retryDelay: 1000,
    });

    // Fallback strategy for analysis errors
    this.registerRecoveryStrategy({
      name: 'analysis-fallback',
      canRecover: (error) => error instanceof AnalysisError,
      recover: async (error, _context) => {
        return {
          status: 'partial',
          message: 'Analysis completed with limited results due to error',
          error: error.message,
        };
      },
    });
  }

  private updateMetrics(report: ErrorReport, _processingTime: number): void {
    this.metrics.totalErrors++;
    
    if (!this.metrics.errorsByCode[report.code]) {
      this.metrics.errorsByCode[report.code] = 0;
    }
    this.metrics.errorsByCode[report.code]++;
    
    if (!this.metrics.errorsBySeverity[report.severity]) {
      this.metrics.errorsBySeverity[report.severity] = 0;
    }
    const currentCount = this.metrics.errorsBySeverity[report.severity] || 0;
    this.metrics.errorsBySeverity[report.severity] = currentCount + 1;
    
    // Update recovery success rate
    const recoveryAttempts = this.errorReports.filter(r => r.recoveryAttempted).length;
    const recoverySuccesses = this.errorReports.filter(r => r.recoverySuccessful === true).length;
    this.metrics.recoverySuccessRate = recoveryAttempts > 0 ? recoverySuccesses / recoveryAttempts : 0;
  }

  private logError(report: ErrorReport): void {
    const logLevel = this.getLogLevelForSeverity(report.severity);
    logger[logLevel](`Error handled: ${report.error.message}`, {
      id: report.id,
      code: report.code,
      severity: report.severity,
      component: report.context.component,
      operation: report.context.operation,
      recoverable: report.recoverable,
      recoveryAttempted: report.recoveryAttempted,
      recoverySuccessful: report.recoverySuccessful,
    });
  }

  private getLogLevelForSeverity(severity: string): 'debug' | 'info' | 'warn' | 'error' {
    switch (severity) {
      case 'low': return 'debug';
      case 'medium': return 'info';
      case 'high': return 'warn';
      case 'critical': return 'error';
      default: return 'info';
    }
  }

  private getErrorClassForCode(code: ErrorCode): typeof SuperAugmentError {
    if (code >= 1100 && code < 1200) return ToolExecutionError;
    if (code >= 1400 && code < 1500) return AnalysisError;
    if (code >= 1300 && code < 1400) return ConfigurationError;
    if (code >= 1200 && code < 1300) return FileSystemError;
    return SuperAugmentError;
  }

  private getSeverityForCode(code: ErrorCode): 'low' | 'medium' | 'high' | 'critical' {
    if (code === ErrorCode.INITIALIZATION_FAILED) return 'critical';
    if (code >= 1300 && code < 1400) return 'high'; // Configuration errors
    if (code >= 1100 && code < 1200) return 'medium'; // Tool errors
    if (code >= 1400 && code < 1500) return 'low'; // Analysis errors
    return 'medium';
  }

  private getCategoryForCode(code: ErrorCode): string {
    if (code >= 1100 && code < 1200) return 'tool';
    if (code >= 1200 && code < 1300) return 'filesystem';
    if (code >= 1300 && code < 1400) return 'configuration';
    if (code >= 1400 && code < 1500) return 'analysis';
    if (code >= 1500 && code < 1600) return 'resource';
    if (code >= 1600 && code < 1700) return 'network';
    return 'unknown';
  }

  private isRecoverableByCode(code: ErrorCode): boolean {
    const nonRecoverableCodes = [
      ErrorCode.INITIALIZATION_FAILED,
      ErrorCode.CONFIG_VALIDATION_FAILED,
      ErrorCode.PERMISSION_DENIED,
    ];
    return !nonRecoverableCodes.includes(code);
  }
}
