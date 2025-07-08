/**
 * Error Handler Interface
 * 
 * Defines the contract for error handling services with recovery mechanisms
 */

import { ErrorCode } from '../errors/ErrorTypes.js';

export interface ErrorContext {
  operation: string;
  component: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryStrategy {
  name: string;
  canRecover: (error: Error, context: ErrorContext) => boolean;
  recover: (error: Error, context: ErrorContext) => Promise<any>;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  code: ErrorCode;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  recoveryAttempted: boolean;
  recoverySuccessful?: boolean;
  timestamp: Date;
  stackTrace?: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCode: Record<ErrorCode, number>;
  errorsBySeverity: Record<string, number>;
  recoverySuccessRate: number;
  averageRecoveryTime: number;
}

/**
 * Error handler interface
 */
export interface IErrorHandler {
  /**
   * Initialize the error handler
   */
  initialize(): Promise<void>;

  /**
   * Handle an error with context
   */
  handleError(
    error: Error,
    context: ErrorContext,
    options?: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      recoverable?: boolean;
      silent?: boolean;
    }
  ): Promise<ErrorReport>;

  /**
   * Register an error recovery strategy
   */
  registerRecoveryStrategy(strategy: ErrorRecoveryStrategy): void;

  /**
   * Remove a recovery strategy
   */
  removeRecoveryStrategy(name: string): void;

  /**
   * Get all registered recovery strategies
   */
  getRecoveryStrategies(): ErrorRecoveryStrategy[];

  /**
   * Attempt to recover from an error
   */
  attemptRecovery(
    error: Error,
    context: ErrorContext
  ): Promise<{
    recovered: boolean;
    result?: any;
    strategy?: string;
    attempts: number;
  }>;

  /**
   * Create standardized error from code
   */
  createError(
    code: ErrorCode,
    message: string,
    context?: ErrorContext,
    cause?: Error
  ): Error;

  /**
   * Check if an error is recoverable
   */
  isRecoverable(error: Error, context: ErrorContext): boolean;

  /**
   * Get error metrics
   */
  getMetrics(): Promise<ErrorMetrics>;

  /**
   * Clear error metrics
   */
  clearMetrics(): Promise<void>;

  /**
   * Get error reports
   */
  getErrorReports(options?: {
    since?: Date;
    severity?: string[];
    codes?: ErrorCode[];
    limit?: number;
  }): Promise<ErrorReport[]>;

  /**
   * Export error reports
   */
  exportErrorReports(format: 'json' | 'csv'): Promise<string>;

  /**
   * Set error reporting callback
   */
  onError(callback: (report: ErrorReport) => void): void;

  /**
   * Set recovery callback
   */
  onRecovery(callback: (report: ErrorReport, result: any) => void): void;

  /**
   * Validate error context
   */
  validateContext(context: ErrorContext): boolean;

  /**
   * Sanitize error for logging (remove sensitive data)
   */
  sanitizeError(error: Error): Error;

  /**
   * Get error classification
   */
  classifyError(error: Error): {
    code: ErrorCode;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    recoverable: boolean;
  };
}
