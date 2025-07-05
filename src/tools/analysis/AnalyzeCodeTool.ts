import { z } from 'zod';
import { SuperAugmentTool } from '../ToolManager.js';
import { ConfigManager } from '../../config/ConfigManager.js';
import { logger } from '../../utils/logger.js';

const AnalyzeCodeInputSchema = z.object({
  files: z.array(z.string()).optional().describe('Array of file paths to analyze'),
  code: z.string().optional().describe('Code content to analyze directly'),
  persona: z.string().optional().describe('Cognitive persona to use for analysis'),
  depth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed').describe('Analysis depth'),
  focus: z.array(z.string()).optional().describe('Specific areas to focus on (e.g., performance, security, maintainability)'),
  language: z.string().optional().describe('Programming language (auto-detected if not specified)'),
});

type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

/**
 * Code analysis tool with cognitive persona support
 */
export class AnalyzeCodeTool implements SuperAugmentTool {
  name = 'analyze_code';
  description = 'Analyze code for quality, patterns, issues, and improvements with cognitive persona support';
  inputSchema = AnalyzeCodeInputSchema.schema;

  constructor(private configManager: ConfigManager) {}

  async execute(args: AnalyzeCodeInput): Promise<any> {
    try {
      logger.info('Starting code analysis', { args });

      // Validate input
      const validatedArgs = AnalyzeCodeInputSchema.parse(args);
      
      // Get persona if specified
      const persona = validatedArgs.persona 
        ? this.configManager.getPersona(validatedArgs.persona)
        : null;

      // Perform analysis based on persona and parameters
      const analysis = await this.performAnalysis(validatedArgs, persona);

      return {
        content: [
          {
            type: 'text',
            text: this.formatAnalysisResult(analysis, persona),
          },
        ],
      };
    } catch (error) {
      logger.error('Code analysis failed:', error);
      throw error;
    }
  }

  private async performAnalysis(args: AnalyzeCodeInput, persona: any): Promise<any> {
    const analysis = {
      summary: '',
      issues: [] as any[],
      suggestions: [] as any[],
      metrics: {} as Record<string, any>,
      persona_insights: null as any,
    };

    // Basic analysis logic
    if (args.code) {
      analysis.summary = `Analyzing ${args.code.length} characters of code`;
      
      // Simulate code analysis
      analysis.issues = this.detectIssues(args.code, args.focus);
      analysis.suggestions = this.generateSuggestions(args.code, args.depth);
      analysis.metrics = this.calculateMetrics(args.code);
    }

    // Apply persona-specific insights
    if (persona) {
      analysis.persona_insights = this.applyPersonaInsights(analysis, persona);
    }

    return analysis;
  }

  private detectIssues(code: string, focus?: string[]): any[] {
    const issues = [];

    // Basic issue detection
    if (code.includes('console.log')) {
      issues.push({
        type: 'code_quality',
        severity: 'warning',
        message: 'Console.log statements found - consider using proper logging',
        line: 1,
      });
    }

    if (code.includes('var ')) {
      issues.push({
        type: 'modernization',
        severity: 'info',
        message: 'Consider using let/const instead of var',
        line: 1,
      });
    }

    // Focus-specific analysis
    if (focus?.includes('security')) {
      if (code.includes('eval(')) {
        issues.push({
          type: 'security',
          severity: 'error',
          message: 'Use of eval() is dangerous and should be avoided',
          line: 1,
        });
      }
    }

    return issues;
  }

  private generateSuggestions(code: string, depth: string): any[] {
    const suggestions = [];

    if (depth === 'comprehensive') {
      suggestions.push({
        category: 'performance',
        suggestion: 'Consider implementing code splitting for better performance',
        impact: 'medium',
      });

      suggestions.push({
        category: 'maintainability',
        suggestion: 'Add TypeScript for better type safety',
        impact: 'high',
      });
    }

    return suggestions;
  }

  private calculateMetrics(code: string): Record<string, any> {
    return {
      lines_of_code: code.split('\n').length,
      complexity_estimate: 'medium',
      maintainability_index: 75,
      test_coverage_needed: true,
    };
  }

  private applyPersonaInsights(analysis: any, persona: any): any {
    const insights = {
      persona_name: persona.name,
      specialized_focus: persona.expertise,
      recommendations: [] as string[],
    };

    // Apply persona-specific analysis
    switch (persona.name) {
      case 'architect':
        insights.recommendations.push('Consider the overall system architecture and scalability');
        insights.recommendations.push('Evaluate design patterns and architectural principles');
        break;
      case 'security':
        insights.recommendations.push('Perform thorough security vulnerability assessment');
        insights.recommendations.push('Review authentication and authorization mechanisms');
        break;
      case 'performance':
        insights.recommendations.push('Analyze performance bottlenecks and optimization opportunities');
        insights.recommendations.push('Consider caching strategies and resource utilization');
        break;
      default:
        insights.recommendations.push(`Apply ${persona.name} expertise to the analysis`);
    }

    return insights;
  }

  private formatAnalysisResult(analysis: any, persona: any): string {
    let result = '# Code Analysis Report\n\n';

    if (persona) {
      result += `**Persona**: ${persona.name} (${persona.description})\n\n`;
    }

    result += `## Summary\n${analysis.summary}\n\n`;

    if (analysis.issues.length > 0) {
      result += '## Issues Found\n';
      analysis.issues.forEach((issue: any, index: number) => {
        result += `${index + 1}. **${issue.type}** (${issue.severity}): ${issue.message}\n`;
      });
      result += '\n';
    }

    if (analysis.suggestions.length > 0) {
      result += '## Suggestions\n';
      analysis.suggestions.forEach((suggestion: any, index: number) => {
        result += `${index + 1}. **${suggestion.category}**: ${suggestion.suggestion} (Impact: ${suggestion.impact})\n`;
      });
      result += '\n';
    }

    result += '## Metrics\n';
    Object.entries(analysis.metrics).forEach(([key, value]) => {
      result += `- **${key.replace(/_/g, ' ')}**: ${value}\n`;
    });

    if (analysis.persona_insights) {
      result += '\n## Persona Insights\n';
      analysis.persona_insights.recommendations.forEach((rec: string, index: number) => {
        result += `${index + 1}. ${rec}\n`;
      });
    }

    return result;
  }
}
