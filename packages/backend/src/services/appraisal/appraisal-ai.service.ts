/**
 * Appraisal AI Service
 * Provides AI-powered text generation for appraisal report sections
 * Uses GPT-4o through the existing OpenAIService
 */

import { Request, Response } from 'express';
import { OpenAIService } from '../../utils/common/openAI';
import { SendResponse } from '../../utils';
import { StatusCodeEnum } from '../../enums';
import helperFunction from '../../utils/common/helperFunction';
import { LoggerEnum } from '../../enums/logger.enum';

// =================================================================
// TYPE DEFINITIONS
// =================================================================

interface AIGenerationContext {
    propertyType?: string;
    propertySubtype?: string;
    siteData?: {
        city?: string;
        state?: string;
        county?: string;
        zoning?: string;
        siteSize?: string;
        utilities?: string;
        topography?: string;
        shape?: string;
    };
    improvementData?: {
        buildingSize?: string;
        yearBuilt?: string;
        condition?: string;
        constructionType?: string;
        quality?: string;
    };
    marketData?: {
        vacancyRate?: string;
        marketTrend?: string;
        capRate?: string;
        rentalRate?: string;
    };
    scenarios?: Array<{
        name: string;
        effectiveDate?: string;
        approaches?: string[];
    }>;
    valuationData?: {
        salesValue?: number;
        incomeValue?: number;
        costValue?: number;
        concludedValue?: number;
    };
}

interface AIGenerationRequest {
    section: string;
    context: AIGenerationContext;
    existingText?: string;
    instruction?: string;
}

// =================================================================
// PROMPT TEMPLATES
// =================================================================

const SYSTEM_PROMPT = `You are an expert commercial real estate appraiser with decades of experience writing professional appraisal reports. Your task is to generate clear, accurate, and professional narrative text for appraisal reports following USPAP (Uniform Standards of Professional Appraisal Practice) guidelines.

Important guidelines:
1. Write in third person, professional tone
2. Be factual and objective - avoid speculation
3. Use industry-standard terminology
4. Be concise but thorough
5. Do not include specific dollar values unless provided in context
6. Follow the specific format and content requirements for each section type`;

const SECTION_PROMPTS: Record<string, (context: AIGenerationContext) => string> = {
    area_description: (ctx) => `Write a professional area/regional description for an appraisal report.

Property Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}

Include:
- General description of the metropolitan/regional area
- Key economic drivers and employment base
- Population trends and demographics (general)
- Transportation access and infrastructure
- Overall market conditions

Write 2-3 paragraphs, approximately 150-200 words.`,

    neighborhood_description: (ctx) => `Write a professional neighborhood description for an appraisal report.

Property Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}
Zoning: ${ctx.siteData?.zoning || 'Not specified'}

Include:
- Description of the immediate neighborhood boundaries
- Predominant land uses
- Development patterns and trends
- Compatibility of uses
- Access and visibility
- Neighborhood stage (growth, stability, decline)

Write 2-3 paragraphs, approximately 150-200 words.`,

    site_description: (ctx) => `Write a professional site description for an appraisal report.

Site Size: ${ctx.siteData?.siteSize || 'Not specified'}
Shape: ${ctx.siteData?.shape || 'Not specified'}
Topography: ${ctx.siteData?.topography || 'Not specified'}
Utilities: ${ctx.siteData?.utilities || 'Not specified'}
Zoning: ${ctx.siteData?.zoning || 'Not specified'}

Include:
- Physical characteristics (size, shape, topography)
- Utility availability and adequacy
- Access and frontage
- Easements and encumbrances (general statement)
- Environmental observations (general disclaimer)
- Site suitability conclusion

Write 2-3 paragraphs, approximately 150-200 words.`,

    hbu_analysis: (ctx) => `Write a professional Highest and Best Use analysis conclusion for an appraisal report.

Property Type: ${ctx.propertyType || 'Commercial'}
Subtype: ${ctx.propertySubtype || 'Not specified'}
Zoning: ${ctx.siteData?.zoning || 'Not specified'}
Site Size: ${ctx.siteData?.siteSize || 'Not specified'}
Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'}
Condition: ${ctx.improvementData?.condition || 'Not specified'}

Write conclusions for both:
1. Highest and Best Use As Vacant - summarizing the four tests (legally permissible, physically possible, financially feasible, maximally productive)
2. Highest and Best Use As Improved - current use analysis

Write 2-3 paragraphs, approximately 200-250 words. Be conclusive about the highest and best use determination.`,

    market_analysis: (ctx) => `Write a professional market analysis for an appraisal report.

Property Type: ${ctx.propertyType || 'Commercial'}
Subtype: ${ctx.propertySubtype || 'Not specified'}
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Vacancy Rate: ${ctx.marketData?.vacancyRate || 'Not specified'}
Market Trend: ${ctx.marketData?.marketTrend || 'Not specified'}

Include:
- Supply and demand conditions
- Vacancy and absorption trends
- Rental rate trends (if applicable)
- New construction/competition
- Market participant interviews (general reference)
- Market outlook conclusion

Write 2-3 paragraphs, approximately 150-200 words.`,

    reconciliation: (ctx) => `Write a professional reconciliation and final value conclusion for an appraisal report.

Property Type: ${ctx.propertyType || 'Commercial'}
Approaches Used: ${ctx.scenarios?.[0]?.approaches?.join(', ') || 'Sales Comparison, Income, Cost'}

${ctx.valuationData ? `
Value Indications:
- Sales Comparison Approach: ${ctx.valuationData.salesValue ? '$' + ctx.valuationData.salesValue.toLocaleString() : 'N/A'}
- Income Approach: ${ctx.valuationData.incomeValue ? '$' + ctx.valuationData.incomeValue.toLocaleString() : 'N/A'}
- Cost Approach: ${ctx.valuationData.costValue ? '$' + ctx.valuationData.costValue.toLocaleString() : 'N/A'}
` : ''}

Include:
- Brief discussion of each approach's reliability for this property type
- Rationale for weighting the approaches
- Support for the final value conclusion
- Reasonable exposure time estimate (general)

Write 2-3 paragraphs, approximately 200-250 words.`,

    improvement_description: (ctx) => `Write a professional improvement description for an appraisal report.

Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'}
Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
Construction Type: ${ctx.improvementData?.constructionType || 'Not specified'}
Quality: ${ctx.improvementData?.quality || 'Not specified'}
Condition: ${ctx.improvementData?.condition || 'Not specified'}

Include:
- General building description
- Construction type and materials
- Interior finish and layout
- Mechanical systems overview
- Condition assessment
- Functional utility

Write 2-3 paragraphs, approximately 150-200 words.`,

    default: (ctx) => `Write a professional narrative paragraph for a commercial real estate appraisal report.

Property Type: ${ctx.propertyType || 'Commercial'}
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}

Provide a well-written, professional paragraph appropriate for an appraisal report. Be factual and objective.

Write 1-2 paragraphs, approximately 100-150 words.`
};

// =================================================================
// SERVICE CLASS
// =================================================================

export default class AppraisalAIService {
    private openAIService: OpenAIService;

    constructor() {
        this.openAIService = new OpenAIService();
    }

    /**
     * Generate AI draft content for an appraisal section
     */
    public generateDraft = async (
        request: Request,
        response: Response
    ): Promise<Response | void> => {
        try {
            const body = request.body as AIGenerationRequest;
            const { section, context, existingText, instruction } = body;

            if (!section) {
                return SendResponse(
                    response,
                    {
                        statusCode: StatusCodeEnum.BAD_REQUEST,
                        message: 'Section identifier is required',
                    },
                    StatusCodeEnum.BAD_REQUEST
                );
            }

            // Get the appropriate prompt template
            const promptGenerator = SECTION_PROMPTS[section] || SECTION_PROMPTS['default'];
            let userPrompt = promptGenerator(context || {});

            // Add existing text context if provided
            if (existingText) {
                userPrompt += `\n\nExisting text to improve or build upon:\n${existingText}`;
            }

            // Add custom instruction if provided
            if (instruction) {
                userPrompt += `\n\nAdditional instruction: ${instruction}`;
            }

            // Generate content using OpenAI
            const generatedContent = await this.generateWithOpenAI(userPrompt);

            helperFunction.log({
                message: `AI draft generated for section: ${section}`,
                location: 'AppraisalAIService.generateDraft',
                level: LoggerEnum.INFO,
                error: '',
            });

            return SendResponse(
                response,
                {
                    statusCode: StatusCodeEnum.OK,
                    message: 'Draft generated successfully',
                    data: {
                        content: generatedContent,
                        section: section,
                    },
                },
                StatusCodeEnum.OK
            );
        } catch (error: any) {
            helperFunction.log({
                message: error.message,
                location: 'AppraisalAIService.generateDraft',
                level: LoggerEnum.ERROR,
                error: error,
            });

            return SendResponse(
                response,
                {
                    statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
                    message: 'Failed to generate AI draft',
                    error: error.message,
                },
                StatusCodeEnum.INTERNAL_SERVER_ERROR
            );
        }
    };

    /**
     * Generate content using OpenAI
     */
    private async generateWithOpenAI(prompt: string): Promise<string> {
        try {
            // Using the existing OpenAI service pattern
            const response = await this.openAIService.generateChatCompletion(
                `${SYSTEM_PROMPT}\n\n${prompt}`
            );

            // Handle response - the existing service returns parsed JSON or raw content
            if (typeof response === 'string') {
                return response;
            } else if (Array.isArray(response) && response.length > 0) {
                return String(response[0]);
            } else if (response && typeof response === 'object') {
                return JSON.stringify(response);
            }

            return '';
        } catch (error) {
            console.error('OpenAI generation error:', error);
            throw error;
        }
    }
}

