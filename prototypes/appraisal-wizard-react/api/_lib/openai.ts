/**
 * OpenAI Service for AI Draft Generation
 * 
 * This module provides AI-powered text generation for appraisal report sections.
 * Ported from Harken's packages/backend/src/services/appraisal/appraisal-ai.service.ts
 * 
 * 100% portable - can be copied directly to Harken backend.
 */

import OpenAI from 'openai';
import type { AIGenerationContext } from './types.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =================================================================
// SYSTEM PROMPT
// =================================================================

export const SYSTEM_PROMPT = `You are a senior MAI-designated commercial real estate appraiser with 30 years of experience writing USPAP-compliant appraisal reports. Your task is to generate clear, accurate, and professional narrative text for appraisal reports.

Write in a professional, authoritative voice using proper appraisal terminology:
- Use terms like "subject property," "highest and best use," "legally permissible," "physically possible," "financially feasible," "maximally productive"
- Reference "the four tests of highest and best use" when appropriate
- Use phrases like "based on our analysis," "market evidence supports," "it is our conclusion that"
- Be definitive in conclusions - avoid hedging language
- Write in third person ("the appraiser" or "we") not first person
- Reference USPAP Standards Rule 1-3 concepts implicitly through proper methodology
- Use industry-standard abbreviations (SF, PSF, NNN, GBA, NRA) appropriately

Your output should read like it came from a Tier 1 national appraisal firm's report.

Additional guidelines:
1. Be factual and objective - avoid speculation
2. Be concise but thorough
3. Do not include specific dollar values unless provided in context
4. Follow the specific format and content requirements for each section type`;

// =================================================================
// SECTION PROMPTS
// =================================================================

type PromptGenerator = (ctx: AIGenerationContext) => string;

export const SECTION_PROMPTS: Record<string, PromptGenerator> = {
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

  hbu_legally_permissible: (ctx) => `Write the "Legally Permissible Uses" section of a Highest and Best Use analysis as a 30-year MAI appraiser would.

PROPERTY DATA:
- Zoning Classification: ${ctx.siteData?.zoning || 'Not specified'}
- Property Type: ${ctx.propertyType || 'Commercial'}
- Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
- County: ${ctx.siteData?.county || 'Not specified'}

Write a professional analysis addressing:
1. Current zoning designation and permitted uses by right
2. Conditional or special exception uses available
3. Any deed restrictions, easements, or private covenants identified
4. Compliance status of current improvements (conforming/non-conforming)

Conclude definitively with legally permissible uses. Use proper appraisal terminology. Write 2 paragraphs, approximately 150 words.`,

  hbu_physically_possible: (ctx) => `Write the "Physically Possible Uses" section of a Highest and Best Use analysis as a 30-year MAI appraiser would.

SITE DATA:
- Site Area: ${ctx.siteData?.siteSize || 'Not specified'}
- Shape: ${ctx.siteData?.shape || 'Not specified'}
- Topography: ${ctx.siteData?.topography || 'Not specified'}
- Utilities: ${ctx.siteData?.utilities || 'Not specified'}
- Flood Zone: Not specified
- Frontage/Access: Adequate

Write a professional analysis addressing:
1. Site size adequacy for various development types
2. Physical characteristics (shape, topography, soil conditions)
3. Utility availability and capacity
4. Flood zone implications
5. Access and visibility considerations

Conclude with physically possible uses given site constraints. Use proper appraisal terminology. Write 2 paragraphs, approximately 150 words.`,

  hbu_financially_feasible: (ctx) => `Write the "Financially Feasible Uses" section of a Highest and Best Use analysis as a 30-year MAI appraiser would.

MARKET DATA:
- Property Type: ${ctx.propertyType || 'Commercial'}
- Submarket Vacancy: ${ctx.marketData?.vacancyRate || 'Not specified'}
- Market Trend: ${ctx.marketData?.marketTrend || 'Stable'}
- Asking Rent: ${ctx.marketData?.rentalRate || 'Not specified'}
- Cap Rate Range: ${ctx.marketData?.capRate || 'Not specified'}

Write a professional analysis addressing:
1. Current market demand for legally permissible and physically possible uses
2. Supply/demand dynamics and absorption trends
3. Achievable rents or sale prices relative to development costs
4. Required returns and market cap rates
5. Development timing considerations

Conclude which uses would generate positive residual land value or adequate return. Use proper appraisal terminology including references to "residual land value," "development pro forma," and "market-derived returns." Write 2 paragraphs, approximately 150 words.`,

  hbu_maximally_productive: (ctx) => `Write the "Maximally Productive Use" conclusion for Highest and Best Use As Vacant as a 30-year MAI appraiser would.

SUMMARY DATA:
- Property Type Context: ${ctx.propertyType || 'Commercial'}
- Zoning: ${ctx.siteData?.zoning || 'Not specified'}
- Site Size: ${ctx.siteData?.siteSize || 'Not specified'}
- Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
- Market Conditions: ${ctx.marketData?.marketTrend || 'Stable'}

Write a definitive conclusion that:
1. Synthesizes the legally permissible, physically possible, and financially feasible analyses
2. Identifies the single use (or uses) that would result in the highest land value
3. States the highest and best use conclusion clearly and definitively
4. Briefly supports why this use is maximally productive over alternatives

Use authoritative language like "Based on our analysis of the four tests of highest and best use, it is our conclusion that..." Write 2 paragraphs, approximately 150 words.`,

  hbu_as_improved: (ctx) => `Write the "Highest and Best Use As Improved" analysis as a 30-year MAI appraiser would.

IMPROVEMENT DATA:
- Current Use: ${ctx.propertyType || 'Commercial'} - ${ctx.propertySubtype || 'Not specified'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'}
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Condition: ${ctx.improvementData?.condition || 'Not specified'}
- Functional Utility: ${ctx.improvementData?.quality || 'Adequate'}

Write a professional analysis addressing:
1. Whether the improvements represent the highest and best use of the site as improved
2. The "Ideal Improvement" test - do existing improvements approximate what would be built today?
3. Analysis of alternatives: continue current use, renovate/convert, or demolish
4. Contribution of improvements to overall property value

Conclude definitively whether the current use should be continued. Reference concepts like "contribution value," "functional obsolescence," and "economic life remaining." Write 2 paragraphs, approximately 175 words.`,

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
// GENERATION FUNCTION
// =================================================================

export interface GenerateDraftParams {
  section: string;
  context: AIGenerationContext;
  existingText?: string;
  instruction?: string;
}

export async function generateDraft(params: GenerateDraftParams): Promise<string> {
  const { section, context, existingText, instruction } = params;

  // Get the appropriate prompt template
  const promptGenerator = SECTION_PROMPTS[section] || SECTION_PROMPTS['default'];
  let userPrompt = promptGenerator(context);

  // Add existing text context if provided
  if (existingText) {
    userPrompt += `\n\nExisting text to improve or build upon:\n${existingText}`;
  }

  // Add custom instruction if provided
  if (instruction) {
    userPrompt += `\n\nAdditional instruction: ${instruction}`;
  }

  // Generate content using OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = completion.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content generated from OpenAI');
  }

  return content.trim();
}

/**
 * Get available section types for AI generation
 */
export function getAvailableSections(): string[] {
  return Object.keys(SECTION_PROMPTS);
}


