import { z } from 'zod';
import { SuperAugmentTool } from '../ToolManager.js';
import { ConfigManager } from '../../config/ConfigManager.js';
import { logger } from '../../utils/logger.js';

const ReviewCodeInputSchema = z.object({
  pullRequest: z.number().optional().describe('Pull request number to review'),
  files: z.array(z.string()).optional().describe('Specific files to review'),
  diff: z.string().optional().describe('Code diff to review'),
  persona: z.string().optional().describe('Cognitive persona for review approach'),
  criteria: z.array(z.string()).optional().describe('Review criteria (e.g., security, performance, style)'),
  severity: z.enum(['low', 'medium', 'high']).default('medium').describe('Review severity level'),
});

type ReviewCodeInput = z.infer<typeof ReviewCodeInputSchema>;

/**
 * Code review tool with cognitive persona support
 */
export class ReviewCodeTool implements SuperAugmentTool {
  name = 'review_code';
  description = 'Perform comprehensive code reviews with cognitive persona expertise';
  inputSchema = ReviewCodeInputSchema.schema;

  constructor(private configManager: ConfigManager) {}

  async execute(args: ReviewCodeInput): Promise<any> {
    try {
      logger.info('Starting code review', { args });

      const validatedArgs = ReviewCodeInputSchema.parse(args);
      const persona = validatedArgs.persona 
        ? this.configManager.getPersona(validatedArgs.persona)
        : null;

      const review = await this.performReview(validatedArgs, persona);

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

  private async performReview(args: ReviewCodeInput, persona: any): Promise<any> {
    // Placeholder implementation
    return {
      summary: 'Code review completed',
      findings: [
        {
          type: 'improvement',
          severity: 'medium',
          message: 'Consider adding error handling',
          file: 'example.ts',
          line: 42,
        },
      ],
      recommendations: [
        'Add unit tests for new functionality',
        'Update documentation',
      ],
      persona_insights: persona ? {
        persona_name: persona.name,
        specialized_recommendations: [`${persona.name} recommends focusing on ${persona.expertise.join(', ')}`],
      } : null,
    };
  }

  private formatReviewResult(review: any, persona: any): string {
    let result = '# Code Review Report\n\n';
    
    if (persona) {
      result += `**Reviewer Persona**: ${persona.name}\n\n`;
    }

    result += `## Summary\n${review.summary}\n\n`;

    if (review.findings.length > 0) {
      result += '## Findings\n';
      review.findings.forEach((finding: any, index: number) => {
        result += `${index + 1}. **${finding.type}** (${finding.severity}): ${finding.message}\n`;
        if (finding.file) result += `   File: ${finding.file}:${finding.line}\n`;
      });
      result += '\n';
    }

    if (review.recommendations.length > 0) {
      result += '## Recommendations\n';
      review.recommendations.forEach((rec: string, index: number) => {
        result += `${index + 1}. ${rec}\n`;
      });
    }

    return result;
  }
}
