/**
 * Code Review Analyzer
 * 
 * Provides comprehensive code review analysis including static analysis,
 * security scanning, performance analysis, and best practices validation.
 */

import { logger } from '../utils/logger.js';
import type { FileInfo } from '../utils/FileSystemManager.js';

export interface ReviewFinding {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'maintainability' | 'style' | 'bug' | 'complexity';
  title: string;
  description: string;
  file: string;
  line?: number;
  column?: number;
  code?: string;
  suggestion?: string;
  rule: string;
  confidence: number; // 0-100
}

export interface QualityMetrics {
  complexity: {
    cyclomatic: number;
    cognitive: number;
    halstead: {
      volume: number;
      difficulty: number;
      effort: number;
    };
  };
  maintainability: {
    index: number;
    techDebt: number; // in hours
    duplication: number; // percentage
  };
  coverage: {
    lines: number;
    branches: number;
    functions: number;
  };
  size: {
    lines: number;
    codeLines: number;
    commentLines: number;
    blankLines: number;
  };
}

export interface ReviewResult {
  summary: {
    filesReviewed: number;
    totalLines: number;
    findingsCount: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  findings: ReviewFinding[];
  metrics: QualityMetrics;
  recommendations: string[];
  score: number; // Overall quality score 0-100
}

/**
 * Code review analyzer implementation
 */
export class CodeReviewAnalyzer {
  private securityPatterns: Map<string, RegExp> = new Map();
  private performancePatterns: Map<string, RegExp> = new Map();
  private maintainabilityRules: Map<string, (content: string) => ReviewFinding[]> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeRules();
  }

  /**
   * Perform comprehensive code review analysis
   */
  async analyzeFiles(files: FileInfo[], options: {
    includeMetrics?: boolean;
    criteria?: string[];
    severity?: string;
  } = {}): Promise<ReviewResult> {
    const findings: ReviewFinding[] = [];
    let totalLines = 0;
    let codeLines = 0;
    let commentLines = 0;
    let blankLines = 0;

    logger.info(`Starting code review analysis for ${files.length} files`);

    // Analyze each file
    for (const file of files) {
      if (!file.content) continue;

      const lines = file.content.split('\n');
      totalLines += lines.length;

      // Count line types
      const lineCounts = this.countLineTypes(lines);
      codeLines += lineCounts.code;
      commentLines += lineCounts.comments;
      blankLines += lineCounts.blank;

      // Perform various analyses
      const fileFindings = [
        ...this.analyzeSecurityIssues(file),
        ...this.analyzePerformanceIssues(file),
        ...this.analyzeMaintainabilityIssues(file),
        ...this.analyzeStyleIssues(file),
        ...this.analyzeBugPatterns(file),
        ...this.analyzeComplexity(file),
      ];

      // Filter by criteria and severity
      const filteredFindings = this.filterFindings(fileFindings, options);
      findings.push(...filteredFindings);
    }

    // Calculate metrics
    const metrics = options.includeMetrics 
      ? this.calculateMetrics(files, findings, { totalLines, codeLines, commentLines, blankLines })
      : this.getDefaultMetrics();

    // Generate recommendations
    const recommendations = this.generateRecommendations(findings, metrics);

    // Calculate overall score
    const score = this.calculateQualityScore(findings, metrics);

    const result: ReviewResult = {
      summary: {
        filesReviewed: files.length,
        totalLines,
        findingsCount: findings.length,
        criticalIssues: findings.filter(f => f.severity === 'critical').length,
        highIssues: findings.filter(f => f.severity === 'high').length,
        mediumIssues: findings.filter(f => f.severity === 'medium').length,
        lowIssues: findings.filter(f => f.severity === 'low').length,
      },
      findings,
      metrics,
      recommendations,
      score,
    };

    logger.info(`Code review analysis completed: ${findings.length} findings, score: ${score}`);
    return result;
  }

  /**
   * Analyze security issues
   */
  private analyzeSecurityIssues(file: FileInfo): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const lines = file.content?.split('\n') || [];

    for (const [rule, pattern] of this.securityPatterns) {
      lines.forEach((line, index) => {
        const match = pattern.exec(line);
        if (match) {
          findings.push({
            id: `sec_${rule}_${index}`,
            type: 'error',
            severity: this.getSecuritySeverity(rule),
            category: 'security',
            title: `Security Issue: ${rule}`,
            description: this.getSecurityDescription(rule),
            file: file.path,
            line: index + 1,
            code: line.trim(),
            suggestion: this.getSecuritySuggestion(rule),
            rule,
            confidence: 85,
          });
        }
      });
    }

    return findings;
  }

  /**
   * Analyze performance issues
   */
  private analyzePerformanceIssues(file: FileInfo): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const lines = file.content?.split('\n') || [];

    for (const [rule, pattern] of this.performancePatterns) {
      lines.forEach((line, index) => {
        const match = pattern.exec(line);
        if (match) {
          findings.push({
            id: `perf_${rule}_${index}`,
            type: 'warning',
            severity: 'medium',
            category: 'performance',
            title: `Performance Issue: ${rule}`,
            description: this.getPerformanceDescription(rule),
            file: file.path,
            line: index + 1,
            code: line.trim(),
            suggestion: this.getPerformanceSuggestion(rule),
            rule,
            confidence: 75,
          });
        }
      });
    }

    return findings;
  }

  /**
   * Analyze maintainability issues
   */
  private analyzeMaintainabilityIssues(file: FileInfo): ReviewFinding[] {
    const findings: ReviewFinding[] = [];

    if (!file.content) return findings;

    for (const [rule, analyzer] of this.maintainabilityRules) {
      try {
        const ruleFindings = analyzer(file.content);
        findings.push(...ruleFindings.map(f => ({ ...f, file: file.path })));
      } catch (error) {
        logger.warn(`Failed to apply maintainability rule ${rule}:`, error);
      }
    }

    return findings;
  }

  /**
   * Analyze style issues
   */
  private analyzeStyleIssues(file: FileInfo): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const lines = file.content?.split('\n') || [];

    lines.forEach((line, index) => {
      // Check for long lines
      if (line.length > 120) {
        findings.push({
          id: `style_long_line_${index}`,
          type: 'info',
          severity: 'low',
          category: 'style',
          title: 'Long Line',
          description: 'Line exceeds recommended length of 120 characters',
          file: file.path,
          line: index + 1,
          code: line.trim(),
          suggestion: 'Consider breaking this line into multiple lines',
          rule: 'max-line-length',
          confidence: 95,
        });
      }

      // Check for trailing whitespace
      if (line.endsWith(' ') || line.endsWith('\t')) {
        findings.push({
          id: `style_trailing_whitespace_${index}`,
          type: 'info',
          severity: 'low',
          category: 'style',
          title: 'Trailing Whitespace',
          description: 'Line has trailing whitespace',
          file: file.path,
          line: index + 1,
          code: line,
          suggestion: 'Remove trailing whitespace',
          rule: 'no-trailing-spaces',
          confidence: 100,
        });
      }
    });

    return findings;
  }

  /**
   * Analyze bug patterns
   */
  private analyzeBugPatterns(file: FileInfo): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const content = file.content || '';

    // Check for common bug patterns
    const bugPatterns = [
      {
        pattern: /console\.log\(/g,
        rule: 'no-console',
        title: 'Console Statement',
        description: 'Console statements should be removed in production code',
        severity: 'low' as const,
      },
      {
        pattern: /debugger;/g,
        rule: 'no-debugger',
        title: 'Debugger Statement',
        description: 'Debugger statements should be removed in production code',
        severity: 'medium' as const,
      },
      {
        pattern: /TODO|FIXME|HACK/g,
        rule: 'no-todos',
        title: 'TODO/FIXME Comment',
        description: 'TODO/FIXME comments indicate incomplete code',
        severity: 'low' as const,
      },
    ];

    bugPatterns.forEach(({ pattern, rule, title, description, severity }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        findings.push({
          id: `bug_${rule}_${match.index}`,
          type: 'warning',
          severity,
          category: 'bug',
          title,
          description,
          file: file.path,
          line: lineNumber,
          code: match[0],
          suggestion: this.getBugPatternSuggestion(rule),
          rule,
          confidence: 90,
        });
      }
    });

    return findings;
  }

  /**
   * Analyze code complexity
   */
  private analyzeComplexity(file: FileInfo): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const content = file.content || '';

    // Simple cyclomatic complexity calculation
    const complexityKeywords = /\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/g;
    const matches = content.match(complexityKeywords) || [];
    const complexity = matches.length + 1; // Base complexity is 1

    if (complexity > 10) {
      findings.push({
        id: `complexity_high_${file.path}`,
        type: 'warning',
        severity: complexity > 20 ? 'high' : 'medium',
        category: 'complexity',
        title: 'High Complexity',
        description: `File has high cyclomatic complexity (${complexity})`,
        file: file.path,
        suggestion: 'Consider breaking down complex functions into smaller ones',
        rule: 'max-complexity',
        confidence: 80,
      });
    }

    return findings;
  }

  /**
   * Initialize security patterns
   */
  private initializePatterns(): void {
    // Security patterns
    this.securityPatterns.set('sql-injection', /(?:SELECT|INSERT|UPDATE|DELETE).*(?:\+|\$\{|\$\()/i);
    this.securityPatterns.set('xss-vulnerability', /innerHTML\s*=\s*[^;]*\+/i);
    this.securityPatterns.set('hardcoded-password', /password\s*=\s*["'][^"']+["']/i);
    this.securityPatterns.set('hardcoded-secret', /(?:secret|token|key)\s*=\s*["'][^"']+["']/i);
    this.securityPatterns.set('eval-usage', /\beval\s*\(/i);
    this.securityPatterns.set('unsafe-regex', /new\s+RegExp\s*\([^)]*\$\{/i);

    // Performance patterns
    this.performancePatterns.set('inefficient-loop', /for\s*\([^)]*\.length[^)]*\)/i);
    this.performancePatterns.set('dom-query-in-loop', /for\s*\([^}]*document\.querySelector/i);
    this.performancePatterns.set('sync-fs-operation', /fs\.readFileSync|fs\.writeFileSync/i);
    this.performancePatterns.set('blocking-operation', /\.sync\(\)|\.wait\(\)/i);
  }

  /**
   * Initialize maintainability rules
   */
  private initializeRules(): void {
    // Function length rule
    this.maintainabilityRules.set('max-function-length', (content: string) => {
      const findings: ReviewFinding[] = [];
      const functionPattern = /function\s+\w+\s*\([^)]*\)\s*\{/g;
      let match;

      while ((match = functionPattern.exec(content)) !== null) {
        const startIndex = match.index;
        const functionStart = content.substring(0, startIndex).split('\n').length;
        
        // Find function end (simplified)
        let braceCount = 1;
        let endIndex = startIndex + match[0].length;
        
        while (braceCount > 0 && endIndex < content.length) {
          if (content[endIndex] === '{') braceCount++;
          if (content[endIndex] === '}') braceCount--;
          endIndex++;
        }

        const functionContent = content.substring(startIndex, endIndex);
        const lineCount = functionContent.split('\n').length;

        if (lineCount > 50) {
          findings.push({
            id: `maint_long_function_${startIndex}`,
            type: 'warning',
            severity: lineCount > 100 ? 'high' : 'medium',
            category: 'maintainability',
            title: 'Long Function',
            description: `Function is ${lineCount} lines long`,
            line: functionStart,
            suggestion: 'Consider breaking this function into smaller functions',
            rule: 'max-function-length',
            confidence: 90,
          } as ReviewFinding);
        }
      }

      return findings;
    });

    // Duplicate code detection (simplified)
    this.maintainabilityRules.set('duplicate-code', (content: string) => {
      const findings: ReviewFinding[] = [];
      const lines = content.split('\n');
      const lineMap = new Map<string, number[]>();

      // Find duplicate lines
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.length > 10) { // Only check substantial lines
          if (!lineMap.has(trimmed)) {
            lineMap.set(trimmed, []);
          }
          lineMap.get(trimmed)!.push(index + 1);
        }
      });

      // Report duplicates
      lineMap.forEach((lineNumbers, line) => {
        if (lineNumbers.length > 1) {
          findings.push({
            id: `maint_duplicate_${lineNumbers[0]}`,
            type: 'info',
            severity: 'low',
            category: 'maintainability',
            title: 'Duplicate Code',
            description: `Line appears ${lineNumbers.length} times`,
            line: lineNumbers[0],
            code: line,
            suggestion: 'Consider extracting common code into a function',
            rule: 'duplicate-code',
            confidence: 70,
          } as ReviewFinding);
        }
      });

      return findings;
    });
  }

  /**
   * Filter findings based on criteria and severity
   */
  private filterFindings(findings: ReviewFinding[], options: {
    criteria?: string[];
    severity?: string;
  }): ReviewFinding[] {
    let filtered = findings;

    if (options.criteria && options.criteria.length > 0) {
      filtered = filtered.filter(f => options.criteria!.includes(f.category));
    }

    if (options.severity && options.severity !== 'all') {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const minLevel = severityLevels[options.severity as keyof typeof severityLevels] || 1;
      filtered = filtered.filter(f => severityLevels[f.severity] >= minLevel);
    }

    return filtered;
  }

  /**
   * Calculate quality metrics
   */
  private calculateMetrics(
    files: FileInfo[], 
    findings: ReviewFinding[], 
    lineCounts: { totalLines: number; codeLines: number; commentLines: number; blankLines: number }
  ): QualityMetrics {
    const criticalIssues = findings.filter(f => f.severity === 'critical').length;
    const highIssues = findings.filter(f => f.severity === 'high').length;
    
    // Calculate maintainability index (simplified)
    const maintainabilityIndex = Math.max(0, 100 - (criticalIssues * 10 + highIssues * 5));
    
    // Estimate technical debt in hours
    const techDebt = criticalIssues * 4 + highIssues * 2 + findings.filter(f => f.severity === 'medium').length * 0.5;

    return {
      complexity: {
        cyclomatic: this.calculateCyclomaticComplexity(files),
        cognitive: this.calculateCognitiveComplexity(files),
        halstead: {
          volume: lineCounts.codeLines * 0.1, // Simplified
          difficulty: findings.length * 0.1,
          effort: findings.length * lineCounts.codeLines * 0.01,
        },
      },
      maintainability: {
        index: maintainabilityIndex,
        techDebt,
        duplication: this.calculateDuplication(files),
      },
      coverage: {
        lines: 0, // Would need actual test coverage data
        branches: 0,
        functions: 0,
      },
      size: lineCounts,
    };
  }

  private getDefaultMetrics(): QualityMetrics {
    return {
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        halstead: { volume: 0, difficulty: 0, effort: 0 },
      },
      maintainability: {
        index: 100,
        techDebt: 0,
        duplication: 0,
      },
      coverage: {
        lines: 0,
        branches: 0,
        functions: 0,
      },
      size: {
        lines: 0,
        codeLines: 0,
        commentLines: 0,
        blankLines: 0,
      },
    };
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(findings: ReviewFinding[], metrics: QualityMetrics): string[] {
    const recommendations: string[] = [];

    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const securityCount = findings.filter(f => f.category === 'security').length;
    const performanceCount = findings.filter(f => f.category === 'performance').length;

    if (criticalCount > 0) {
      recommendations.push(`🚨 Address ${criticalCount} critical issues immediately`);
    }

    if (highCount > 0) {
      recommendations.push(`⚠️ Resolve ${highCount} high-priority issues before deployment`);
    }

    if (securityCount > 0) {
      recommendations.push(`🔒 Review and fix ${securityCount} security vulnerabilities`);
    }

    if (performanceCount > 0) {
      recommendations.push(`⚡ Optimize ${performanceCount} performance issues`);
    }

    if (metrics.maintainability.index < 70) {
      recommendations.push('📈 Improve code maintainability through refactoring');
    }

    if (metrics.maintainability.techDebt > 10) {
      recommendations.push(`🔧 Estimated ${Math.round(metrics.maintainability.techDebt)} hours of technical debt to address`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Code quality looks good! Consider adding more comprehensive tests.');
    }

    return recommendations;
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(findings: ReviewFinding[], metrics: QualityMetrics): number {
    let score = 100;

    // Deduct points for findings
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;
    const lowCount = findings.filter(f => f.severity === 'low').length;

    score -= criticalCount * 20;
    score -= highCount * 10;
    score -= mediumCount * 5;
    score -= lowCount * 1;

    // Factor in maintainability
    score = (score + metrics.maintainability.index) / 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Helper methods for pattern matching
  private getSecuritySeverity(rule: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalRules = ['sql-injection', 'xss-vulnerability', 'eval-usage'];
    const highRules = ['hardcoded-password', 'hardcoded-secret'];
    
    if (criticalRules.includes(rule)) return 'critical';
    if (highRules.includes(rule)) return 'high';
    return 'medium';
  }

  private getSecurityDescription(rule: string): string {
    const descriptions: Record<string, string> = {
      'sql-injection': 'Potential SQL injection vulnerability detected',
      'xss-vulnerability': 'Potential XSS vulnerability in innerHTML usage',
      'hardcoded-password': 'Hardcoded password detected in source code',
      'hardcoded-secret': 'Hardcoded secret/token detected in source code',
      'eval-usage': 'Use of eval() function poses security risks',
      'unsafe-regex': 'Potentially unsafe regular expression construction',
    };
    return descriptions[rule] || 'Security issue detected';
  }

  private getSecuritySuggestion(rule: string): string {
    const suggestions: Record<string, string> = {
      'sql-injection': 'Use parameterized queries or prepared statements',
      'xss-vulnerability': 'Use textContent instead of innerHTML or sanitize input',
      'hardcoded-password': 'Move passwords to environment variables or secure configuration',
      'hardcoded-secret': 'Move secrets to environment variables or secure vault',
      'eval-usage': 'Avoid eval() and use safer alternatives like JSON.parse()',
      'unsafe-regex': 'Use static regex patterns or validate input before regex construction',
    };
    return suggestions[rule] || 'Review and fix security issue';
  }

  private getPerformanceDescription(rule: string): string {
    const descriptions: Record<string, string> = {
      'inefficient-loop': 'Loop accesses array length property on each iteration',
      'dom-query-in-loop': 'DOM query inside loop can cause performance issues',
      'sync-fs-operation': 'Synchronous file system operation blocks event loop',
      'blocking-operation': 'Blocking operation detected',
    };
    return descriptions[rule] || 'Performance issue detected';
  }

  private getPerformanceSuggestion(rule: string): string {
    const suggestions: Record<string, string> = {
      'inefficient-loop': 'Cache array length in a variable before the loop',
      'dom-query-in-loop': 'Move DOM queries outside the loop or cache results',
      'sync-fs-operation': 'Use asynchronous file system operations',
      'blocking-operation': 'Use asynchronous alternatives',
    };
    return suggestions[rule] || 'Optimize performance';
  }

  private getBugPatternSuggestion(rule: string): string {
    const suggestions: Record<string, string> = {
      'no-console': 'Remove console statements or use a proper logging library',
      'no-debugger': 'Remove debugger statements',
      'no-todos': 'Complete TODO items or create proper issue tracking',
    };
    return suggestions[rule] || 'Fix bug pattern';
  }

  private countLineTypes(lines: string[]): { code: number; comments: number; blank: number } {
    let code = 0;
    let comments = 0;
    let blank = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '') {
        blank++;
      } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        comments++;
      } else {
        code++;
      }
    });

    return { code, comments, blank };
  }

  private calculateCyclomaticComplexity(files: FileInfo[]): number {
    let totalComplexity = 0;
    
    files.forEach(file => {
      if (file.content) {
        const complexityKeywords = file.content.match(/\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/g) || [];
        totalComplexity += complexityKeywords.length + 1; // Base complexity is 1
      }
    });

    return totalComplexity;
  }

  private calculateCognitiveComplexity(files: FileInfo[]): number {
    // Simplified cognitive complexity calculation
    return this.calculateCyclomaticComplexity(files) * 1.2;
  }

  private calculateDuplication(files: FileInfo[]): number {
    // Simplified duplication calculation
    let totalLines = 0;
    let duplicateLines = 0;

    files.forEach(file => {
      if (file.content) {
        const lines = file.content.split('\n');
        totalLines += lines.length;
        
        const lineMap = new Map<string, number>();
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.length > 10) {
            lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1);
          }
        });

        lineMap.forEach(count => {
          if (count > 1) {
            duplicateLines += count - 1;
          }
        });
      }
    });

    return totalLines > 0 ? (duplicateLines / totalLines) * 100 : 0;
  }
}
