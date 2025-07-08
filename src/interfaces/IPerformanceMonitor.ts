/**
 * Performance Monitor Interface
 * 
 * Defines the contract for performance monitoring and metrics collection
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface TimingMetric extends PerformanceMetric {
  duration: number;
  startTime: Date;
  endTime: Date;
}

export interface MemoryMetric extends PerformanceMetric {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export interface SystemMetric extends PerformanceMetric {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage?: number;
  networkIO?: {
    bytesIn: number;
    bytesOut: number;
  };
}

export interface PerformanceReport {
  id: string;
  operation: string;
  component: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  success: boolean;
  error?: string;
  metrics: PerformanceMetric[];
  metadata?: Record<string, any>;
}

export interface PerformanceThreshold {
  name: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action?: 'log' | 'alert' | 'throttle' | 'circuit-break';
}

export interface PerformanceAlert {
  id: string;
  threshold: PerformanceThreshold;
  metric: PerformanceMetric;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface PerformanceStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  medianDuration: number;
  p95Duration: number;
  p99Duration: number;
  throughput: number; // operations per second
  errorRate: number;
}

/**
 * Performance monitor interface
 */
export interface IPerformanceMonitor {
  /**
   * Initialize the performance monitor
   */
  initialize(): Promise<void>;

  /**
   * Start timing an operation
   */
  startTiming(
    operation: string,
    component: string,
    metadata?: Record<string, any>
  ): string; // Returns timing ID

  /**
   * End timing an operation
   */
  endTiming(
    timingId: string,
    success?: boolean,
    error?: string
  ): Promise<TimingMetric>;

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): Promise<void>;

  /**
   * Record multiple metrics
   */
  recordMetrics(metrics: PerformanceMetric[]): Promise<void>;

  /**
   * Get current memory usage
   */
  getMemoryUsage(): Promise<MemoryMetric>;

  /**
   * Get current system metrics
   */
  getSystemMetrics(): Promise<SystemMetric>;

  /**
   * Get performance statistics for an operation
   */
  getStats(
    operation?: string,
    component?: string,
    timeRange?: {
      start: Date;
      end: Date;
    }
  ): Promise<PerformanceStats>;

  /**
   * Get performance reports
   */
  getReports(options?: {
    operation?: string;
    component?: string;
    since?: Date;
    limit?: number;
    includeSuccessful?: boolean;
    includeErrors?: boolean;
  }): Promise<PerformanceReport[]>;

  /**
   * Set performance threshold
   */
  setThreshold(threshold: PerformanceThreshold): Promise<void>;

  /**
   * Remove performance threshold
   */
  removeThreshold(name: string): Promise<void>;

  /**
   * Get all performance thresholds
   */
  getThresholds(): Promise<PerformanceThreshold[]>;

  /**
   * Get active performance alerts
   */
  getAlerts(resolved?: boolean): Promise<PerformanceAlert[]>;

  /**
   * Resolve a performance alert
   */
  resolveAlert(alertId: string): Promise<void>;

  /**
   * Clear old performance data
   */
  cleanup(olderThan: Date): Promise<number>;

  /**
   * Export performance data
   */
  export(format: 'json' | 'csv', options?: {
    since?: Date;
    operations?: string[];
    components?: string[];
  }): Promise<string>;

  /**
   * Get performance summary
   */
  getSummary(timeRange?: {
    start: Date;
    end: Date;
  }): Promise<{
    totalOperations: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    topSlowOperations: Array<{
      operation: string;
      averageDuration: number;
      count: number;
    }>;
    topErrorOperations: Array<{
      operation: string;
      errorRate: number;
      count: number;
    }>;
  }>;

  /**
   * Set performance event listener
   */
  onEvent(
    event: 'metric' | 'threshold' | 'alert' | 'report',
    callback: (data: any) => void
  ): void;

  /**
   * Remove performance event listener
   */
  offEvent(
    event: 'metric' | 'threshold' | 'alert' | 'report',
    callback: (data: any) => void
  ): void;

  /**
   * Start continuous monitoring
   */
  startMonitoring(interval?: number): Promise<void>;

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): Promise<void>;

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean;

  /**
   * Get monitoring configuration
   */
  getConfig(): Promise<{
    interval: number;
    thresholds: PerformanceThreshold[];
    retentionPeriod: number;
    alertsEnabled: boolean;
  }>;

  /**
   * Update monitoring configuration
   */
  updateConfig(config: Partial<{
    interval: number;
    retentionPeriod: number;
    alertsEnabled: boolean;
  }>): Promise<void>;
}
