import { z } from 'zod';
import type { SuperAugmentTool } from '../ToolManager';
import { ConfigManager } from '../../config/ConfigManager';
import { FileSystemManager, type FileInfo } from '../../utils/FileSystemManager';
import { CodeReviewAnalyzer, type ReviewResult } from '../../analyzers/CodeReviewAnalyzer';
import { logger } from '../../utils/logger';

const ReviewCodeInputSchema = z.object({
  pullRequest: z.number().optional().describe('Pull request number to review'),
  files: z.array(z.string()).optional().describe('Specific files to review (supports glob patterns)'),
  diff: z.string().optional().describe('Code diff to review'),
  projectPath: z.string().optional().describe('Project root path (defaults to current directory)'),
  persona: z.string().optional().describe('Cognitive persona for review approach'),
  criteria: z.array(z.string()).optional().describe('Review criteria (e.g., security, performance, style)'),
  severity: z.enum(['low', 'medium', 'high', 'all']).default('all').describe('Minimum severity level to report'),
  includeMetrics: z.boolean().default(true).describe('Include code quality metrics'),
  maxFiles: z.number().default(50).describe('Maximum number of files to review'),
});

type ReviewCodeInput = z.infer<typeof ReviewCodeInputSchema>;

/**
 * Enhanced code review tool with comprehensive analysis capabilities
 */
export class ReviewCodeTool implements SuperAugmentTool {
  name = 'review_code';
  description = 'Perform comprehensive code reviews with advanced static analysis, security scanning, and cognitive persona expertise';
  inputSchema = ReviewCodeInputSchema;

  private fileSystemManager: FileSystemManager;
  private codeReviewAnalyzer: CodeReviewAnalyzer;

  constructor(private configManager: ConfigManager) {
    this.fileSystemManager = new FileSystemManager();
    this.codeReviewAnalyzer = new CodeReviewAnalyzer();
  }

  async execute(args: ReviewCodeInput): Promise<any> {
    try {
      logger.info('Starting enhanced code review', { args });

      const validatedArgs = ReviewCodeInputSchema.parse(args);
      const persona = validatedArgs.persona
        ? this.configManager.getPersona(validatedArgs.persona)
        : null;

      // Get files to review
      const filesToReview = await this.getFilesToReview(validatedArgs);

      // Perform comprehensive review using the new analyzer
      const reviewResult = await this.codeReviewAnalyzer.analyzeFiles(filesToReview, {
        includeMetrics: validatedArgs.includeMetrics,
        criteria: validatedArgs.criteria || [],
        severity: validatedArgs.severity,
      });

      // Apply persona insights
      const review = this.enhanceWithPersonaInsights(reviewResult, persona);

      return {
        content: [
          {
            type: 'text',
            text: this.formatReviewResult(review, persona),
          },
        ],
      };
    } catch (error) {
      logger.error('Code review failed:', error);
      throw error;
    }
  }

  /**
   * Get files to review based on input parameters
   */
  private async getFilesToReview(args: ReviewCodeInput): Promise<FileInfo[]> {
    const projectPath = args.projectPath || process.cwd();

    if (args.files && args.files.length > 0) {
      // Review specific files
      const files = await this.fileSystemManager.readFiles(args.files, projectPath);
      return files.slice(0, args.maxFiles);
    } else {
      // Review common code files
      const defaultPatterns = [
        '**/*.{js,ts,jsx,tsx,vue,py,java,go,rs,cpp,c,h,cs,php,rb,swift,kt}',
        '!node_modules/**',
        '!dist/**',
        '!build/**',
        '!coverage/**',
        '!.git/**',
        '!vendor/**',
        '!target/**',
      ];
      const files = await this.fileSystemManager.readFiles(defaultPatterns, projectPath);
      return files.slice(0, args.maxFiles);
    }
  }

  /**
   * Enhance review results with persona-specific insights
   */
  private enhanceWithPersonaInsights(reviewResult: ReviewResult, persona: any): any {
    const review = {
      summary: `Reviewed ${reviewResult.summary.filesReviewed} files (${reviewResult.summary.totalLines} lines). Found ${reviewResult.summary.findingsCount} issues. Quality score: ${reviewResult.score}/100`,
      files_reviewed: reviewResult.summary.filesReviewed,
      total_lines: reviewResult.summary.totalLines,
      findings: reviewResult.findings,
      recommendations: reviewResult.recommendations,
      quality_metrics: reviewResult.metrics,
      quality_score: reviewResult.score,
      persona_insights: null as any,
    };

    // Apply persona-specific insights
    if (persona) {
      review.persona_insights = this.applyPersonaInsights(reviewResult, persona);
      
      // Add persona-specific recommendations
      const personaRecommendations = this.generatePersonaRecommendations(reviewResult, persona);
      review.recommendations = [...review.recommendations, ...personaRecommendations];
    }

    return review;
  }

  /**
   * Apply persona-specific insights to review results
   */
  private applyPersonaInsights(reviewResult: ReviewResult, persona: any): any {
    if (!persona) return null;

    const insights = {
      persona_name: persona.name,
      expertise_areas: persona.expertise || [],
      approach: persona.approach || '',
      focused_findings: [] as any[],
      specialized_recommendations: [] as string[],
    };

    // Filter findings based on persona expertise
    if (persona.expertise) {
      const expertiseAreas = persona.expertise.map((e: string) => e.toLowerCase());
      
      insights.focused_findings = reviewResult.findings.filter(finding => {
        const category = finding.category.toLowerCase();
        return expertiseAreas.some((area: string) => 
          area.includes(category) || 
          category.includes(area) ||
          (area === 'security' && category === 'security') ||
          (area === 'performance' && category === 'performance') ||
          (area === 'architecture' && category === 'maintainability')
        );
      });
    }

    // Generate persona-specific insights based on approach
    if (persona.approach) {
      const approach = persona.approach.toLowerCase();
      if (approach.includes('security')) {
        insights.specialized_recommendations.push(
          '🔒 Focus on security vulnerabilities and implement defense-in-depth strategies'
        );
      }
      if (approach.includes('performance')) {
        insights.specialized_recommendations.push(
          '⚡ Prioritize performance optimizations and monitor resource usage'
        );
      }
      if (approach.includes('maintainability')) {
        insights.specialized_recommendations.push(
          '🔧 Emphasize code maintainability and long-term sustainability'
        );
      }
    }

    return insights;
  }

  /**
   * Generate persona-specific recommendations
   */
  private generatePersonaRecommendations(reviewResult: ReviewResult, persona: any): string[] {
    if (!persona) return [];

    const recommendations: string[] = [];
    const personaName = persona.name?.toLowerCase() || '';
    const expertise = persona.expertise || [];

    // Security persona recommendations
    if (personaName.includes('security') || expertise.includes('security')) {
      const securityIssues = reviewResult.findings.filter(f => f.category === 'security');
      if (securityIssues.length > 0) {
        recommendations.push(`🛡️ Security Review: Found ${securityIssues.length} security issues requiring immediate attention`);
        recommendations.push('🔐 Implement security testing in CI/CD pipeline');
        recommendations.push('📋 Consider security code review checklist for future reviews');
      }
    }

    // Performance persona recommendations
    if (personaName.includes('performance') || expertise.includes('performance')) {
      const performanceIssues = reviewResult.findings.filter(f => f.category === 'performance');
      if (performanceIssues.length > 0) {
        recommendations.push(`⚡ Performance Review: ${performanceIssues.length} performance optimizations identified`);
        recommendations.push('📊 Add performance monitoring and benchmarking');
        recommendations.push('🎯 Consider implementing performance budgets');
      }
    }

    // Architecture persona recommendations
    if (personaName.includes('architect') || expertise.includes('architecture')) {
      if (reviewResult.metrics.complexity.cyclomatic > 20) {
        recommendations.push('🏗️ Architecture Review: High complexity detected, consider refactoring');
        recommendations.push('📐 Implement design patterns to reduce complexity');
        recommendations.push('🔄 Consider breaking down large components');
      }
    }

    // QA persona recommendations
    if (personaName.includes('qa') || expertise.includes('testing')) {
      recommendations.push('🧪 QA Review: Ensure comprehensive test coverage');
      recommendations.push('🔍 Add integration tests for critical paths');
      recommendations.push('📝 Document test scenarios and edge cases');
    }

    return recommendations;
  }

  private formatReviewResult(review: any, persona: any): string {
    let result = '# 🔍 Code Review Report\n\n';
    
    if (persona) {
      result += `**👤 Reviewer Persona**: ${persona.name}\n`;
      if (persona.expertise) {
        result += `**🎯 Expertise**: ${persona.expertise.join(', ')}\n`;
      }
      result += '\n';
    }

    // Summary section
    result += `## 📊 Summary\n`;
    result += `${review.summary}\n\n`;
    
    if (review.quality_score !== undefined) {
      result += `**Quality Score**: ${review.quality_score}/100\n\n`;
    }

    // Findings section
    if (review.findings && review.findings.length > 0) {
      result += '## 🔍 Findings\n\n';
      
      // Group findings by severity
      const findingsBySeverity = {
        critical: review.findings.filter((f: any) => f.severity === 'critical'),
        high: review.findings.filter((f: any) => f.severity === 'high'),
        medium: review.findings.filter((f: any) => f.severity === 'medium'),
        low: review.findings.filter((f: any) => f.severity === 'low'),
      };

      Object.entries(findingsBySeverity).forEach(([severity, findings]) => {
        if (findings.length > 0) {
          const icon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : severity === 'medium' ? '⚡' : 'ℹ️';
          result += `### ${icon} ${severity.toUpperCase()} (${findings.length})\n\n`;
          
          findings.forEach((finding: any, index: number) => {
            result += `${index + 1}. **${finding.title || finding.category}**: ${finding.description || finding.message}\n`;
            if (finding.file && finding.line) {
              result += `   📁 File: \`${finding.file}:${finding.line}\`\n`;
            }
            if (finding.suggestion) {
              result += `   💡 Suggestion: ${finding.suggestion}\n`;
            }
            result += '\n';
          });
        }
      });
    }

    // Quality metrics section
    if (review.quality_metrics) {
      result += '## 📈 Quality Metrics\n\n';
      const metrics = review.quality_metrics;
      
      if (metrics.complexity) {
        result += `**Complexity**:\n`;
        result += `- Cyclomatic: ${metrics.complexity.cyclomatic}\n`;
        result += `- Cognitive: ${Math.round(metrics.complexity.cognitive)}\n\n`;
      }
      
      if (metrics.maintainability) {
        result += `**Maintainability**:\n`;
        result += `- Index: ${Math.round(metrics.maintainability.index)}/100\n`;
        result += `- Technical Debt: ${Math.round(metrics.maintainability.techDebt)} hours\n`;
        result += `- Code Duplication: ${Math.round(metrics.maintainability.duplication)}%\n\n`;
      }
      
      if (metrics.size) {
        result += `**Code Size**:\n`;
        result += `- Total Lines: ${metrics.size.lines}\n`;
        result += `- Code Lines: ${metrics.size.codeLines}\n`;
        result += `- Comment Lines: ${metrics.size.commentLines}\n\n`;
      }
    }

    // Persona insights section
    if (review.persona_insights) {
      result += '## 🧠 Persona Insights\n\n';
      const insights = review.persona_insights;
      
      if (insights.focused_findings && insights.focused_findings.length > 0) {
        result += `**${insights.persona_name} Focus Areas** (${insights.focused_findings.length} findings):\n`;
        insights.focused_findings.slice(0, 5).forEach((finding: any, index: number) => {
          result += `${index + 1}. ${finding.title}: ${finding.description}\n`;
        });
        result += '\n';
      }
      
      if (insights.specialized_recommendations && insights.specialized_recommendations.length > 0) {
        result += '**Specialized Recommendations**:\n';
        insights.specialized_recommendations.forEach((rec: string, index: number) => {
          result += `${index + 1}. ${rec}\n`;
        });
        result += '\n';
      }
    }

    // Recommendations section
    if (review.recommendations && review.recommendations.length > 0) {
      result += '## 💡 Recommendations\n\n';
      review.recommendations.forEach((rec: string, index: number) => {
        result += `${index + 1}. ${rec}\n`;
      });
      result += '\n';
    }

    result += '---\n';
    result += '*Report generated by SuperAugment Enhanced Code Review Tool*\n';

    return result;
  }
}
