/**
 * OpenAI Service for AI Draft Generation
 * 
 * This module provides AI-powered text generation for appraisal report sections.
 * Ported from Harken's packages/backend/src/services/appraisal/appraisal-ai.service.ts
 * 
 * 100% portable - can be copied directly to Harken backend.
 */

import OpenAI from 'openai';
import type { AIGenerationContext } from './types';

// FIX #50: Check for API key and provide helpful error
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn('⚠️  OPENAI_API_KEY not configured. AI draft generation will not work.');
  console.warn('    Set OPENAI_API_KEY in your environment variables or .env file.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key-for-development',
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

CRITICAL FORMATTING RULES:
1. Use ONLY HTML formatting - NEVER use markdown syntax
2. For bold section headers: use <b><u>HEADER TEXT</u></b> (NOT **text** or __text__)
3. For bold text: use <b>text</b> (NOT **text**)
4. For underline: use <u>text</u> (NOT __text__)
5. For line breaks: use \n (NOT markdown line breaks)
6. DO NOT use asterisks (*), underscores (_), or hashtags (#) for formatting
7. DO NOT use markdown bullet points (- or *) - write as flowing narrative paragraphs
8. DO NOT use any special characters for formatting: ** __ ## ### * - [ ] etc.

Additional guidelines:
1. Be factual and objective - avoid speculation
2. Be concise but thorough
3. Do not include specific dollar values unless provided in context
4. Follow the specific format and content requirements for each section type
5. Output pure narrative text with HTML formatting only - no markdown`;

// =================================================================
// SECTION PROMPTS
// =================================================================

type PromptGenerator = (ctx: AIGenerationContext) => string;

export const SECTION_PROMPTS: Record<string, PromptGenerator> = {
  area_description: (ctx) => `Write the Area/Regional Description section of an appraisal report.

SUBJECT PROPERTY DATA:
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
County: ${ctx.siteData?.county || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>AREA DESCRIPTION</u></b>
2. Write as a 30-year MAI-designated appraiser in third person ("the appraiser" or "we")
3. Cover: metropolitan/regional area description, key economic drivers and employment base, population trends, transportation infrastructure, overall market conditions
4. Use definitive language — avoid "may," "might," "could"
5. Reference "based on our market analysis" or "it is our conclusion that"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points or markdown
- Be factual and objective

Write 2-3 paragraphs, approximately 150-200 words.`,

  neighborhood_description: (ctx) => `Write the Neighborhood Description section of an appraisal report.

SUBJECT PROPERTY DATA:
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}
Zoning: ${ctx.siteData?.zoning || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>NEIGHBORHOOD DESCRIPTION</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Cover: immediate neighborhood boundaries, predominant land uses, development patterns and trends, compatibility of uses, access and visibility, neighborhood life cycle stage (growth, stability, decline)
4. Use definitive conclusions — no hedging language
5. Reference "based on our inspection" or "it is our observation that"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points or markdown
- Be factual and objective

Write 2-3 paragraphs, approximately 150-200 words.`,

  neighborhood_boundaries: (ctx) => `Write the Neighborhood Boundaries section of an appraisal report.

SUBJECT PROPERTY DATA:
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
County: ${ctx.siteData?.county || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>NEIGHBORHOOD BOUNDARIES</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Define boundaries using cardinal directions (North, South, East, West) with specific streets, landmarks, or geographic features
4. Explain why these boundaries define the competitive market area for similar properties
5. Use definitive language — "the neighborhood is bounded by" not "the neighborhood may be bounded by"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Write boundaries as flowing narrative, NOT as bullet points
- Example: "The neighborhood is bounded on the north by Main Street, on the south by the railroad corridor, on the east by Highway 93, and on the west by the Clark Fork River."

Write 2 paragraphs, approximately 150-200 words.`,

  neighborhood_characteristics: (ctx) => `Write the Neighborhood Characteristics section of an appraisal report.

SUBJECT PROPERTY DATA:
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}
Property Subtype: ${ctx.propertySubtype || 'Not specified'}
Zoning: ${ctx.siteData?.zoning || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>NEIGHBORHOOD CHARACTERISTICS</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Cover: predominant land uses and development patterns, age and condition of existing development, access and transportation infrastructure, available amenities, factors positively and negatively affecting property values, neighborhood life cycle stage
4. Use definitive conclusions — "the neighborhood is characterized by" not "the neighborhood may be characterized by"
5. Reference "based on our inspection and market analysis"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points or markdown
- Be specific with observations about the market area

Write 2-3 paragraphs, approximately 200-250 words.`,

  specific_location: (ctx) => `Write the Specific Location section of an appraisal report.

SUBJECT PROPERTY DATA:
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}
Property Subtype: ${ctx.propertySubtype || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>SPECIFIC LOCATION</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Provide precise location description including: street name and block, proximity to major arterials and highways (with approximate distances), nearby landmarks and points of reference, access characteristics (frontage, ingress/egress), visibility from major roads, surrounding property uses
4. Write with enough detail that a reader unfamiliar with the area could locate the property
5. Use definitive language — "the subject is located" not "the subject may be located"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points or markdown

Write 2 paragraphs, approximately 150-175 words.`,

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

  market_analysis: (ctx) => `Write a comprehensive professional market analysis and outlook for an appraisal report as a 30-year MAI appraiser would.

PROPERTY INFORMATION:
- Property Type: ${ctx.propertyType || 'Commercial'}
- Subtype: ${ctx.propertySubtype || 'Not specified'}
- Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}

LOCAL MARKET DATA:
- Vacancy Rate: ${ctx.marketData?.vacancyRate || 'Not specified'}
- Market Trend: ${ctx.marketData?.marketTrend || 'Not specified'}
- Average Rent: ${ctx.marketData?.averageRent || 'Not specified'}
- Rent Growth: ${ctx.marketData?.rentGrowth || 'Not specified'}
- Days on Market: ${ctx.marketData?.daysOnMarket || 'Not specified'}

ECONOMIC INDICATORS (from Federal Reserve Economic Data):
${ctx.gdpGrowth ? `- GDP Growth: ${ctx.gdpGrowth}%` : ''}
${ctx.unemployment ? `- Unemployment Rate: ${ctx.unemployment}%` : ''}
${ctx.inflation ? `- Inflation Rate: ${ctx.inflation}%` : ''}
${ctx.interestRates ? `- Interest Rates: ${ctx.interestRates}%` : ''}

DEMOGRAPHICS:
${ctx.population ? `- Population: ${ctx.population.toLocaleString()}` : ''}
${ctx.medianIncome ? `- Median Income: $${ctx.medianIncome.toLocaleString()}` : ''}
${ctx.employmentRate ? `- Employment Rate: ${ctx.employmentRate}%` : ''}

Write a comprehensive market analysis with the following structure:

<b><u>ECONOMIC OVERVIEW</u></b>
Begin with a paragraph discussing the broader economic conditions affecting the market. Reference the economic indicators provided (GDP growth, unemployment, inflation, interest rates). Explain how these macroeconomic factors are influencing commercial real estate demand, capitalization rates, and investment activity. Connect national/regional economic trends to local market performance.

<b><u>LOCAL MARKET CONDITIONS</u></b>
Analyze the specific ${ctx.propertyType || 'commercial'} market in ${ctx.siteData?.city || 'the subject area'}. Discuss:
- Current supply and demand dynamics
- Vacancy rates and absorption trends
- Rental rate trends and growth patterns
- New construction pipeline and competitive supply
- Factors driving demand (employment growth, population trends, industry mix)

<b><u>MARKET OUTLOOK</u></b>
Provide a forward-looking analysis of market conditions. Discuss:
- Short-term outlook (6-12 months) based on current indicators
- Medium-term trends (1-3 years) considering economic forecasts
- Factors that could positively or negatively impact values
- Risk factors and opportunities in the current market
- How interest rates and inflation are expected to affect cap rates and valuations

Write as a senior MAI appraiser with deep market knowledge. Reference specific data points provided. Be balanced and objective - acknowledge both positive and negative factors. Conclude with a clear statement about whether the market is favorable, stable, or challenging for the subject property type.

Write 4-5 paragraphs, approximately 400-500 words total. Use bold, underlined headers as shown above.`,

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

  // =================================================================
  // SETUP & SUBJECT DATA PROMPTS
  // =================================================================
  
  legal_description: (ctx) => `Write a professional legal description narrative for an appraisal report as a 30-year MAI appraiser would.

LEGAL DESCRIPTION PROVIDED:
${ctx.legalDescription || 'Not specified'}

PROPERTY LOCATION:
- Address: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
- County: ${ctx.siteData?.county || 'Not specified'}
- Site Size: ${ctx.siteData?.siteSize || 'Not specified'}

Write a brief narrative that:
1. States "The legal description of the subject property is as follows:"
2. Presents the legal description in a clear, formatted manner
3. Notes that the appraiser has not verified the legal description and relies on competent sources
4. References title documentation or other sources if applicable

Format with bold section header. Write 1-2 paragraphs, approximately 100-150 words.`,

  site_notes: (ctx) => `Write the Site Analysis Notes section of an appraisal report.

SUBJECT SITE DATA (from appraiser's inspection):
Site Size: ${ctx.siteData?.siteSize || 'Not specified'}
Shape: ${ctx.siteData?.shape || 'Not specified'}
Topography: ${ctx.siteData?.topography || 'Not specified'}
Frontage: ${ctx.siteData?.frontage || 'Not specified'}
Access Quality: ${ctx.siteData?.accessQuality || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>SITE ANALYSIS</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Address: unique or noteworthy site characteristics, factors that enhance or detract from site utility, development constraints or opportunities, competitive advantages of the site
4. Use definitive language — "the site presents" not "the site may present"
5. Conclude with overall site utility assessment

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points or markdown
- Only describe data provided above — do not fabricate details

Write 1-2 paragraphs, approximately 100-150 words.`,

  zoning_description: (ctx) => `Write the Zoning Analysis section of an appraisal report.

ZONING DATA (from appraiser's research):
Classification: ${ctx.siteData?.zoning || 'Not specified'}
Conforming Status: ${ctx.siteData?.zoningConforming ? 'Conforming' : 'To be verified'}
Jurisdiction: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.county || 'Not specified'} County

WRITING REQUIREMENTS:
1. Begin with: <b><u>ZONING ANALYSIS</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Address: current zoning classification and jurisdiction, permitted uses by right, conditional or special exception uses available, compliance status of existing improvements (conforming/non-conforming/legal non-conforming), relevant setback, parking, or density requirements, impact on property utility and marketability
4. Use definitive language — "the subject is zoned" not "the subject may be zoned"
5. Note that zoning verification should be confirmed with local authorities for transaction purposes

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points or markdown

Write 2 paragraphs, approximately 150-200 words.`,

  transaction_history: (ctx) => `Write the Transaction History section of an appraisal report.

TRANSACTION DATA (from public records):
Last Sale Date: ${ctx.lastSaleDate || 'Not specified'}
Last Sale Price: ${ctx.lastSalePrice || 'Not specified'}
Current Owner: Per public records
${ctx.transactionHistory ? `Additional History: ${ctx.transactionHistory}` : ''}

WRITING REQUIREMENTS:
1. Begin with: <b><u>TRANSACTION HISTORY</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Open with: "USPAP Standards Rule 1-5 requires analysis of all sales and transfers within three years of the effective date."
4. Document the last transaction (date, price, parties if available)
5. Analyze definitively whether the transaction was arms-length
6. Note any non-arms-length considerations (family transfer, foreclosure, REO, short sale)
7. Explain how prior sales do or do not impact current value opinion
8. If no sales occurred within three years, state that explicitly

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points
- Be specific with dates and prices when available
- Only describe data provided — do not fabricate transaction details

Write 2 paragraphs, approximately 150-200 words.`,

  construction_description: (ctx) => `Write a professional construction description narrative for an appraisal report as a 30-year MAI appraiser would.

BUILDING INFORMATION:
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF
- Construction Type: ${ctx.improvementData?.constructionType || 'Not specified'}
- Quality: ${ctx.improvementData?.quality || 'Not specified'}
- Condition: ${ctx.improvementData?.condition || 'Not specified'}

Write a professional narrative describing:
1. Structural system and framing type
2. Foundation system
3. Wall construction and materials
4. Roof structure and covering
5. Overall construction quality classification
6. Age and condition assessment

Use industry-standard construction terminology. Write 2 paragraphs, approximately 150-200 words.`,

  // =================================================================
  // UTILITY & INFRASTRUCTURE PROMPTS
  // =================================================================
  
  water_source: (ctx) => `Write the Water Service section of an appraisal report.

WATER SERVICE DATA:
Service Type: ${ctx.siteData?.waterSource || 'Municipal water available'}
Property Type: ${ctx.propertyType || 'Commercial'}
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>WATER SERVICE</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Identify water service provider and type (municipal, private well, shared system)
4. State adequacy for current and anticipated uses
5. For commercial properties, address fire suppression capability
6. Conclude definitively — "no deficiencies were observed" not "no deficiencies appear to exist"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative — no bullet points

Write 1 paragraph, approximately 75-100 words.`,

  sewer_type: (ctx) => `Write the Sanitary Sewer Service section of an appraisal report.

SEWER SERVICE DATA:
Service Type: ${ctx.siteData?.sewerType || 'Municipal sanitary sewer available'}
Property Type: ${ctx.propertyType || 'Commercial'}
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>SANITARY SEWER</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Identify sewer service type (municipal, septic system, package treatment plant)
4. Note connection status and system adequacy for the property type
5. Conclude definitively — "no deficiencies were observed" not "no deficiencies appear to exist"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative — no bullet points

Write 1 paragraph, approximately 75-100 words.`,

  electric: (ctx) => `Write the Electric Service section of an appraisal report.

ELECTRIC SERVICE DATA:
Provider: ${ctx.siteData?.electricProvider || 'Local utility provider'}
Property Type: ${ctx.propertyType || 'Commercial'}
Location: ${ctx.siteData?.city || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>ELECTRIC SERVICE</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Identify electric service provider
4. Note service type (overhead/underground) and phase (single-phase/three-phase) if known
5. State capacity is adequate for ${ctx.propertyType || 'commercial'} use
6. Conclude definitively — "no deficiencies were observed"

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative — no bullet points

Write 1 paragraph, approximately 75-100 words.`,

  natural_gas: (ctx) => `Write the Natural Gas Service section of an appraisal report.

NATURAL GAS DATA:
Availability: ${ctx.siteData?.naturalGas || 'Natural gas available'}
Property Type: ${ctx.propertyType || 'Commercial'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>NATURAL GAS</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Confirm natural gas availability and connection status
4. State service is adequate for heating and any process requirements
5. Note this is typical for the market area

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative — no bullet points

Write 1 paragraph, approximately 50-75 words.`,

  telecom: (ctx) => `Write the Telecommunications section of an appraisal report.

TELECOMMUNICATIONS DATA:
Property Type: ${ctx.propertyType || 'Commercial'}
Location: ${ctx.siteData?.city || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>TELECOMMUNICATIONS</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Confirm telecommunications availability (telephone, internet, cable)
4. Note multiple provider options in the area
5. Address fiber optic and high-speed internet availability
6. State infrastructure supports modern business communications requirements

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative — no bullet points

Write 1 paragraph, approximately 75-100 words.`,

  storm_drainage: (ctx) => `Write the Storm Drainage section of an appraisal report.

STORM DRAINAGE DATA:
Property Type: ${ctx.propertyType || 'Commercial'}
Topography: ${ctx.siteData?.topography || 'Not specified'}
Location: ${ctx.siteData?.city || 'Not specified'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>STORM DRAINAGE</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. Describe storm water management system (municipal storm sewer, on-site retention, natural drainage)
4. Note adequacy for the site and property type
5. Address any retention/detention requirements if applicable
6. State no drainage deficiencies were observed during inspection

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative — no bullet points

Write 1 paragraph, approximately 75-100 words.`,

  flood_zone: (ctx) => `Write the Flood Zone Determination section of an appraisal report.

FLOOD ZONE DATA (from FEMA research):
FEMA Zone: ${ctx.siteData?.femaZone || 'Zone X'}
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.county || 'Not specified'} County

WRITING REQUIREMENTS:
1. Begin with: <b><u>FLOOD ZONE DETERMINATION</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. State "According to the Federal Emergency Management Agency (FEMA) Flood Insurance Rate Map..."
4. Identify the specific flood zone designation
5. Explain what the zone designation means (Zone X = minimal flood risk outside 500-year floodplain, Zone A/AE = 100-year floodplain, etc.)
6. State flood insurance requirements (required for Special Flood Hazard Areas, optional for Zone X)
7. Note this determination is subject to FEMA map revisions
8. Conclude with definitive statement on impact to property marketability

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points
- Use proper FEMA terminology

Write 2 paragraphs, approximately 125-150 words.`,

  // =================================================================
  // SITE DESCRIPTION PROMPTS
  // =================================================================
  
  easements: (ctx) => `Write the Easements and Encumbrances section of an appraisal report.

EASEMENT DATA (from title review):
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Site Size: ${ctx.siteData?.siteSize || 'Not specified'}
${ctx.siteData?.easements ? `Identified Easements: ${ctx.siteData.easements}` : 'Easements: Per title review'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>EASEMENTS AND ENCUMBRANCES</u></b>
2. Write as a 30-year MAI-designated appraiser in third person
3. State "Based on our title review and inspection..."
4. Identify any recorded easements (utility, access, drainage, conservation)
5. Assess definitively whether easements adversely impact site utility or value
6. Note that typical utility easements along property boundaries are customary and do not adversely affect value
7. State conclusion: "No unusual or adverse easements were identified" OR describe impact if adverse
8. Reference that complete title review is recommended for transaction purposes

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers
- Flowing narrative paragraphs — no bullet points
- Use proper legal and appraisal terminology

Write 1-2 paragraphs, approximately 100-150 words.`,

  site_description_full: (ctx) => {
    // Build site improvements list from inventory data
    const formatSiteImprovements = () => {
      if (!ctx.siteImprovements || ctx.siteImprovements.length === 0) {
        return 'Per observation';
      }
      return ctx.siteImprovements
        .map(imp => `${imp.typeName} (${imp.quantity.toLocaleString()} ${imp.unit}${imp.condition ? `, ${imp.condition} condition` : ''})`)
        .join('; ');
    };

    return `Write the comprehensive Site Description section of an appraisal report.

SUBJECT SITE DATA (from appraiser's inspection):
Size: ${ctx.siteData?.siteSize || 'Not specified'}
Shape: ${ctx.siteData?.shape || 'Not specified'}
Topography: ${ctx.siteData?.topography || 'Not specified'}
Frontage: ${ctx.siteData?.frontage || 'Not specified'}
Access Quality: ${ctx.siteData?.accessQuality || 'Not specified'}
Visibility: ${ctx.siteData?.visibility || 'Not specified'}
Zoning: ${ctx.siteData?.zoning || 'Not specified'}

UTILITIES:
Water: ${ctx.siteData?.waterSource || 'Municipal'}
Sewer: ${ctx.siteData?.sewerType || 'Municipal'}
Electric, Gas, Telecom: Available

SITE IMPROVEMENTS (from inventory — use EXACT types listed):
${formatSiteImprovements()}

FLOOD ZONE: ${ctx.siteData?.femaZone || 'Zone X'}

WRITING REQUIREMENTS:
1. Write as a 30-year MAI-designated appraiser in third person ("the appraiser" or "we")
2. Use proper appraisal terminology: "subject site," "based on our inspection," "it is our conclusion that"
3. Be definitive in conclusions — avoid hedging language like "may," "might," "could"
4. Describe ONLY data provided above — do NOT invent, substitute, or fabricate details

REQUIRED SECTIONS (use HTML headers <b><u>HEADER</u></b>):
1. <b><u>SITE SIZE AND CONFIGURATION</u></b> — Dimensions, shape, and total area
2. <b><u>TOPOGRAPHY AND DRAINAGE</u></b> — Grade characteristics, drainage adequacy
3. <b><u>ACCESS AND VISIBILITY</u></b> — Frontage, ingress/egress, visibility from roadway
4. <b><u>UTILITIES</u></b> — All utility services and adequacy assessment
5. <b><u>SITE IMPROVEMENTS</u></b> — Describe ONLY improvements from inventory above (use exact type names — if "Wood Fence" is listed, write "wood fence" not "chain link")
6. <b><u>FLOOD ZONE</u></b> — FEMA designation and flood insurance implications
7. <b><u>EASEMENTS</u></b> — Notable easements or "no adverse easements were identified"
8. <b><u>CONCLUSION</u></b> — Definitive statement on site suitability for current use

FORMATTING:
- HTML only: <b><u>HEADER</u></b> for headers, no markdown
- Flowing narrative paragraphs — no bullet points
- Reference USPAP methodology implicitly

Write 4-6 paragraphs, approximately 350-450 words total.`;
  },

  site_improvements: (ctx) => {
    // Build site improvements list from inventory data
    const formatSiteImprovements = () => {
      if (!ctx.siteImprovements || ctx.siteImprovements.length === 0) {
        return 'No site improvements inventory provided';
      }
      return ctx.siteImprovements
        .map(imp => `${imp.typeName}: ${imp.quantity.toLocaleString()} ${imp.unit}${imp.yearInstalled ? `, installed ${imp.yearInstalled}` : ''}${imp.condition ? `, ${imp.condition} condition` : ''}`)
        .join('\n');
    };

    return `Write the Site Improvements section of an appraisal report.

SUBJECT PROPERTY SITE IMPROVEMENTS (from appraiser's inventory):
${formatSiteImprovements()}

PROPERTY TYPE: ${ctx.propertyType || 'Commercial'}

WRITING REQUIREMENTS:
1. Begin with: <b><u>SITE IMPROVEMENTS</u></b>
2. Write as a 30-year MAI-designated appraiser in third person ("the appraiser observed" or "we noted")
3. Describe ONLY the site improvements listed above — do NOT substitute, invent, or add improvements not in the inventory
4. For each improvement, address:
   - Type and extent (using the EXACT type names provided, e.g., if "Wood Fence" is listed, write "wood fence" not "chain link")
   - Quantity and coverage area
   - Observed condition and remaining useful life assessment
   - Functional adequacy for the property type
5. Conclude with a definitive statement on whether site improvements are consistent with market expectations for this property type and contribute positively to utility and marketability

FORMATTING:
- Use HTML only: <b><u>HEADER</u></b> for section header
- Write flowing narrative paragraphs — no bullet points or markdown
- Be definitive — avoid "may," "might," "could possibly"
- Reference "based on our inspection" or "it is our conclusion that"

Write 2 paragraphs, approximately 150-175 words total.`;
  },

  property_boundaries: (ctx) => `Write a professional property boundaries description for an appraisal report as a 30-year MAI appraiser would.

PROPERTY LOCATION:
- Address: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.county || 'Not specified'} County
- Site Size: ${ctx.siteData?.siteSize || 'Not specified'}

Write a professional boundary description using the cardinal direction format:
1. <b><u>PROPERTY BOUNDARIES</u></b>
   - North: [Identify boundary - street, property, natural feature]
   - South: [Identify boundary]
   - East: [Identify boundary]
   - West: [Identify boundary]

2. Explain how these boundaries define the competitive market area or neighborhood
3. Note visibility and accessibility from primary boundaries
4. Reference verification from survey or title documents

Be specific with street names and geographic features when possible. Write 2 paragraphs, approximately 150-175 words.`,

  // =================================================================
  // VALUATION APPROACH PROMPTS - SALES COMPARISON
  // =================================================================
  
  sales_comparison: (ctx) => `Write the Sales Comparison Approach reconciliation narrative as a 30-year MAI appraiser would.

SUBJECT PROPERTY:
- Address: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
- Property Type: ${ctx.propertyType || 'Commercial'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF

${ctx.salesComps && ctx.salesComps.length > 0 ? `COMPARABLE SALES ANALYZED:
${ctx.salesComps.map((c, i) => `- Sale ${i+1}: ${c.address || 'Address not specified'}, Sale Price: ${c.salePrice ? '$' + c.salePrice.toLocaleString() : 'Not specified'}${c.adjustedPrice ? `, Adjusted: $${c.adjustedPrice.toLocaleString()}` : ''}`).join('\n')}` : 'Comparable sales were analyzed for this property type.'}

${ctx.valuationData?.salesValue ? `CONCLUDED VALUE: $${ctx.valuationData.salesValue.toLocaleString()}` : ''}

Write a professional narrative that:
1. Begins with: <b><u>SALES COMPARISON APPROACH</u></b>
2. States "The Sales Comparison Approach is based on the principle of substitution..."
3. Discusses comparable selection criteria (location, size, age, quality, condition)
4. Explains adjustment methodology (market-derived adjustments for key differences)
5. Discusses the reconciliation process and weighting of comparables
6. States the concluded value indication with confidence
7. Notes this approach is reliable when adequate comparable data exists

Format with bold section headers. Write 3-4 paragraphs, approximately 250-300 words. Use authoritative MAI-level language.`,

  land_valuation: (ctx) => `Write a professional land valuation analysis narrative as a 30-year MAI appraiser would.

SUBJECT SITE:
- Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
- Site Size: ${ctx.siteData?.siteSize || 'Not specified'}
- Zoning: ${ctx.siteData?.zoning || 'Not specified'}
- Topography: ${ctx.siteData?.topography || 'Level'}

${ctx.landComps && ctx.landComps.length > 0 ? `LAND SALES ANALYZED:
${ctx.landComps.map((c, i) => `- Sale ${i+1}: ${c.address || 'Not specified'}, ${c.pricePerAcre ? `$${c.pricePerAcre.toLocaleString()}/acre` : 'Price not specified'}${c.adjustedPricePerAcre ? `, Adjusted: $${c.adjustedPricePerAcre.toLocaleString()}/acre` : ''}`).join('\n')}` : 'Land sales were analyzed in the subject market area.'}

${ctx.valuationData?.landValue ? `CONCLUDED LAND VALUE: $${ctx.valuationData.landValue.toLocaleString()}` : ''}

Write a professional narrative with sections:
1. <b><u>LAND VALUATION - SALES COMPARISON APPROACH</u></b>
2. State "Land value was estimated using the Sales Comparison Approach, the preferred method for vacant land..."
3. Describe the local land market conditions
4. Discuss comparable land sales analyzed
5. Explain adjustments made for: size, location, topography, utilities, zoning
6. Note after 30 years of appraising land, the adjustment methodology reflects market behavior
7. Reconcile to a concluded land value per acre and total land value
8. State this value represents the highest and best use as vacant

Format with bold headers. Write 3-4 paragraphs, approximately 250-300 words.`,

  // =================================================================
  // INCOME APPROACH PROMPTS
  // =================================================================
  
  rent_comparable: (ctx) => `Write a professional market rent analysis narrative as a 30-year MAI appraiser would.

SUBJECT PROPERTY:
- Property Type: ${ctx.propertyType || 'Commercial'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF
- Location: ${ctx.siteData?.city || 'Not specified'}

${ctx.rentComps && ctx.rentComps.length > 0 ? `RENTAL COMPARABLES:
${ctx.rentComps.map((c, i) => `- Comp ${i+1}: ${c.address || 'Not specified'}${c.rentPerSf ? `, $${c.rentPerSf.toFixed(2)}/SF/yr` : ''}`).join('\n')}` : 'Market rental comparables were analyzed.'}

Write a professional narrative:
1. <b><u>MARKET RENT ANALYSIS</u></b>
2. State "In estimating market rent, I analyzed comparable rental properties in the subject's competitive market..."
3. Describe current rental market conditions (vacancy, absorption, landlord/tenant market)
4. Discuss rental comparables and selection criteria
5. Explain adjustments for location, size, condition, amenities, lease structure
6. Note typical lease terms in the market (NNN, modified gross, etc.)
7. Reconcile to a market rent conclusion per SF annually and monthly
8. State this represents the most probable rent from a knowledgeable tenant

Draw on "30 years of experience in this market" for authority. Write 3 paragraphs, approximately 225-275 words.`,

  expense_comparable: (ctx) => `Write a professional operating expense analysis narrative as a 30-year MAI appraiser would.

SUBJECT PROPERTY:
- Property Type: ${ctx.propertyType || 'Commercial'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF

${ctx.expenseComps && ctx.expenseComps.length > 0 ? `EXPENSE COMPARABLES:
${ctx.expenseComps.map((c, i) => `- Comp ${i+1}: ${c.address || 'Not specified'}${c.expenseRatio ? `, Expense Ratio: ${(c.expenseRatio * 100).toFixed(1)}%` : ''}`).join('\n')}` : 'Comparable operating expense data was analyzed.'}

Write a professional narrative:
1. <b><u>OPERATING EXPENSE ANALYSIS</u></b>
2. State "Operating expenses were estimated based on comparable expense data and market surveys..."
3. Discuss expense data sources (property managers, owners, published surveys)
4. Break down major expense categories:
   - Real Estate Taxes (based on current assessment)
   - Insurance (market rates for similar properties)
   - Utilities (if not tenant-paid)
   - Repairs & Maintenance (typical expenditures for age/condition)
   - Management Fee (market-standard percentage of EGI)
   - Reserves for Replacement (appropriate allowance for capital items)
5. Compare expense ratio to market (typically 25-40% of EGI for commercial)
6. State expenses are at stabilized levels appropriate for market conditions

Draw on professional judgment from 30 years of experience. Write 2-3 paragraphs, approximately 200-250 words.`,

  multi_family: (ctx) => `Write a professional multi-family rental analysis narrative as a 30-year MAI appraiser would.

SUBJECT PROPERTY:
- Property Type: Multi-Family ${ctx.propertySubtype || ''}
- Location: ${ctx.siteData?.city || 'Not specified'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF

Write a professional narrative:
1. <b><u>MULTI-FAMILY RENTAL ANALYSIS</u></b>
2. State "In developing the rental analysis for this multi-family property, I applied the methodology refined over 30 years..."
3. Describe the multi-family market in the subject area
4. Discuss vacancy rates, absorption, and rental trends
5. Analyze rental comparables by unit type (studio, 1BR, 2BR, 3BR)
6. Make adjustments for: location, unit size, amenities, age/condition, parking
7. Reconcile to market rent per unit and per SF
8. Discuss lease-up assumptions if applicable
9. Calculate potential gross income and effective gross income

Use multi-family specific terminology (unit mix, concessions, turnover, tenant profile). Write 3-4 paragraphs, approximately 275-325 words.`,

  // =================================================================
  // COST APPROACH PROMPTS
  // =================================================================
  
  cost_approach: (ctx) => `Write a professional Cost Approach narrative as a 30-year MAI appraiser would.

PROPERTY DATA:
- Property Type: ${ctx.propertyType || 'Commercial'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Construction Type: ${ctx.improvementData?.constructionType || 'Not specified'}
- Condition: ${ctx.improvementData?.condition || 'Average'}

${ctx.replacementCostNew ? `Replacement Cost New: $${ctx.replacementCostNew.toLocaleString()}` : ''}
${ctx.valuationData?.landValue ? `Land Value: $${ctx.valuationData.landValue.toLocaleString()}` : ''}
${ctx.valuationData?.costValue ? `Concluded Value: $${ctx.valuationData.costValue.toLocaleString()}` : ''}

Write a professional narrative with sections:
1. <b><u>COST APPROACH</u></b>
2. State "The Cost Approach is based on the principle of substitution - a prudent investor would pay no more than the cost to acquire a similar site and construct improvements of equal utility."
3. <b><u>LAND VALUE</u></b> - Reference the land value from the Land Valuation section
4. <b><u>IMPROVEMENT COST ESTIMATE</u></b> - Explain the cost estimation method:
   - Marshall & Swift Valuation Service cost data
   - Adjusted for local market conditions and current construction costs
   - Includes direct costs (materials, labor) and indirect costs (fees, financing, developer profit)
5. <b><u>DEPRECIATION ANALYSIS</u></b>:
   - Physical Depreciation (based on age, condition, effective age vs. economic life)
   - Functional Obsolescence (if any design inadequacies or superadequacies)
   - External Obsolescence (if location or market factors impact value)
6. <b><u>VALUE INDICATION</u></b> - Depreciated improvement value + land value
7. Note after 30 years, Cost Approach is most reliable for newer construction

Write 4-5 paragraphs, approximately 300-350 words.`,

  cost_reconciliation: (ctx) => `Write a professional cost data reconciliation narrative as a 30-year MAI appraiser would.

PROPERTY TYPE: ${ctx.propertyType || 'Commercial'}
BUILDING SIZE: ${ctx.improvementData?.buildingSize || 'Not specified'} SF

${ctx.replacementCostNew ? `Marshall & Swift Cost: $${ctx.replacementCostNew.toLocaleString()}` : ''}
${ctx.contractorCost ? `Contractor Cost/Bid: $${ctx.contractorCost.toLocaleString()}` : ''}

Write a professional narrative:
1. <b><u>COST DATA RECONCILIATION</u></b>
2. Discuss the sources of cost data analyzed:
   - Marshall & Swift Valuation Service (industry standard)
   - Local contractor estimates or bids (if available)
   - Recent construction costs for comparable projects
3. Compare and reconcile differences between cost sources
4. Explain any necessary adjustments for:
   - Regional cost multipliers
   - Current cost trends (inflation/deflation)
   - Property-specific features
   - Soft costs (architect, engineering, permits, financing, developer profit)
5. Conclude with the final replacement cost new adopted
6. State this reflects current market construction costs as of the effective date

Use authoritative language drawing on 30 years of cost estimation experience. Write 2-3 paragraphs, approximately 200-250 words.`,

  // =================================================================
  // BUILDING COMPONENT PROMPTS
  // =================================================================
  
  exterior_component: (ctx) => `Write a professional exterior component description as a 30-year MAI appraiser would.

BUILDING DATA:
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Construction Type: ${ctx.improvementData?.constructionType || 'Not specified'}
- Condition: ${ctx.improvementData?.condition || 'Average'}

Write a concise professional description of the specific exterior component, including:
1. Material type and quality
2. Observed condition
3. Approximate age or installation date if different from building
4. Remaining useful life estimate
5. Any deficiencies or superior features noted

Use construction and appraisal terminology. Write 1 paragraph, approximately 75-100 words.`,

  exterior_description: (ctx) => `Write a professional exterior features summary for an appraisal report as a 30-year MAI appraiser would.

BUILDING DATA:
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Construction Type: ${ctx.improvementData?.constructionType || 'Not specified'}
- Condition: ${ctx.improvementData?.condition || 'Average'}

Write a comprehensive exterior description with sections:
1. <b><u>EXTERIOR FEATURES</u></b>
2. <b>Foundation:</b> Type and condition
3. <b>Exterior Walls:</b> Materials, finish, condition
4. <b>Roof:</b> Covering type, structure, condition, age
5. <b>Windows/Doors:</b> Type, glazing, condition
6. <b>Overall Assessment:</b> Functional adequacy and condition summary

Use professional construction terminology. Write 2-3 paragraphs, approximately 200-250 words.`,

  interior_component: (ctx) => `Write a professional interior component description as a 30-year MAI appraiser would.

BUILDING DATA:
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Quality: ${ctx.improvementData?.quality || 'Average'}
- Condition: ${ctx.improvementData?.condition || 'Average'}

Write a concise professional description of the specific interior component, including:
1. Material or system type
2. Quality classification
3. Observed condition
4. Age if different from building
5. Functional adequacy for property type

Use professional terminology. Write 1 paragraph, approximately 75-100 words.`,

  interior_description: (ctx) => `Write a professional interior features summary for an appraisal report as a 30-year MAI appraiser would.

BUILDING DATA:
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Quality: ${ctx.improvementData?.quality || 'Average'}

Write a comprehensive interior description with sections:
1. <b><u>INTERIOR FEATURES</u></b>
2. <b>Ceilings:</b> Type, height, condition
3. <b>Flooring:</b> Materials by area, condition
4. <b>Interior Walls:</b> Construction, finish, condition
5. <b>Plumbing Fixtures:</b> Quantity, quality, condition
6. <b>Lighting:</b> Type and adequacy
7. <b>Overall Assessment:</b> Functional utility and condition

Use professional terminology. Write 2-3 paragraphs, approximately 200-250 words.`,

  mechanical_component: (ctx) => `Write a professional mechanical component description as a 30-year MAI appraiser would.

BUILDING DATA:
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF

Write a concise professional description of the specific mechanical component, including:
1. System type, brand, and capacity
2. Installation or replacement date
3. Observed condition and maintenance status
4. Expected remaining useful life
5. Adequacy for building size and use

Use HVAC and mechanical systems terminology. Write 1 paragraph, approximately 75-100 words.`,

  mechanical_description: (ctx) => `Write a professional mechanical systems summary for an appraisal report as a 30-year MAI appraiser would.

BUILDING DATA:
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF
- Year Built: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Property Type: ${ctx.propertyType || 'Commercial'}

Write a comprehensive mechanical systems description with sections:
1. <b><u>MECHANICAL SYSTEMS</u></b>
2. <b>Heating:</b> System type, fuel source, capacity, condition
3. <b>Cooling:</b> System type, tonnage, condition
4. <b>Ventilation:</b> Air handling, make-up air if applicable
5. <b>Electrical:</b> Service size, phase, panel condition
6. <b>Plumbing:</b> Supply, waste, fixtures adequacy
7. <b>Fire Protection:</b> Sprinkler system type and coverage
8. <b>Overall Assessment:</b> Systems adequacy and condition

Use HVAC and building systems terminology. Write 3-4 paragraphs, approximately 250-300 words.`,

  depreciation_override: (ctx) => `Write a professional depreciation analysis rationale as a 30-year MAI appraiser would.

COMPONENT DATA:
- Component Type: [Component being analyzed]
- Building Year: ${ctx.improvementData?.yearBuilt || 'Not specified'}
- Observed Condition: ${ctx.improvementData?.condition || 'Average'}

Write a professional depreciation rationale:
1. State "Based on inspection and analysis of the subject property..."
2. Explain why the calculated depreciation was adjusted
3. Reference observed condition, deferred maintenance, or superior maintenance
4. Cite effective age vs. actual age considerations
5. Note market evidence of value impact
6. Conclude with the depreciation percentage adopted and supporting rationale

Draw on professional judgment and market experience. Write 1-2 paragraphs, approximately 100-150 words.`,

  // =================================================================
  // REVIEW & RECONCILIATION PROMPTS
  // =================================================================
  
  exposure: (ctx) => `Write a professional exposure time and marketing time estimate as a 30-year MAI appraiser would.

PROPERTY DATA:
- Property Type: ${ctx.propertyType || 'Commercial'}
- Location: ${ctx.siteData?.city || 'Not specified'}
${ctx.valuationData?.concludedValue ? `- Concluded Value: $${ctx.valuationData.concludedValue.toLocaleString()}` : ''}

Write a professional analysis with sections:
1. <b><u>EXPOSURE TIME</u></b>
2. Define: "Exposure time is the estimated length of time the property would have been offered for sale prior to the effective date..."
3. Estimate: Based on market analysis, exposure time is estimated at [X] to [Y] months
4. Support with: current market conditions, typical marketing periods for comparable properties, property value level
5. <b><u>MARKETING TIME</u></b>
6. Define: "Marketing time is the prospective time to sell after the effective date..."
7. Estimate: Marketing time is estimated at [X] to [Y] months
8. Support with: current buyer demand, available financing, property's competitive position

Reference market participant interviews and comparable sales absorption. Write 2-3 paragraphs, approximately 200-250 words.`,

  swot_summary_analysis: (ctx) => `Write a professional SWOT analysis summary narrative as a 30-year MAI appraiser would.

PROPERTY: ${ctx.propertyType || 'Commercial'} property in ${ctx.siteData?.city || 'Not specified'}

${ctx.swotStrengths && ctx.swotStrengths.length > 0 ? `STRENGTHS IDENTIFIED:
${ctx.swotStrengths.map(s => `- ${s}`).join('\n')}` : ''}

${ctx.swotWeaknesses && ctx.swotWeaknesses.length > 0 ? `WEAKNESSES IDENTIFIED:
${ctx.swotWeaknesses.map(w => `- ${w}`).join('\n')}` : ''}

${ctx.swotOpportunities && ctx.swotOpportunities.length > 0 ? `OPPORTUNITIES IDENTIFIED:
${ctx.swotOpportunities.map(o => `- ${o}`).join('\n')}` : ''}

${ctx.swotThreats && ctx.swotThreats.length > 0 ? `THREATS IDENTIFIED:
${ctx.swotThreats.map(t => `- ${t}`).join('\n')}` : ''}

Write a comprehensive professional SWOT synthesis:
1. <b><u>SWOT ANALYSIS SUMMARY</u></b>
2. Begin with an executive statement about the property's overall risk-return profile
3. <b>Strengths:</b> Synthesize key competitive advantages - how they enhance marketability and support value
4. <b>Weaknesses:</b> Address limitations and considerations - quantify impact where possible, note capital requirements
5. <b>Opportunities:</b> Identify value-enhancement potential - market momentum, rent growth, operational improvements
6. <b>Threats:</b> Analyze risk factors - capital replacement needs, market risks, deferred maintenance implications
7. <b>Overall Assessment:</b> Conclude with investment perspective - target buyer profile, pricing considerations, market positioning

Use sophisticated investment analysis terminology. Reference how identified factors influenced the valuation approaches and final value conclusion. Write 4-5 paragraphs, approximately 350-450 words. This should read like institutional-quality investment analysis.`,

  // =================================================================
  // SUPPLEMENTAL DATA PROMPTS
  // =================================================================
  
  permit_analysis: (ctx) => `Write a professional building permit analysis as a 30-year MAI appraiser would.

PROPERTY: ${ctx.propertyType || 'Commercial'} in ${ctx.siteData?.city || 'Not specified'}

${ctx.buildingPermits && ctx.buildingPermits.length > 0 ? `PERMITS IDENTIFIED:
${ctx.buildingPermits.map(p => `- ${p.permitNumber || 'Permit'}: ${p.type || 'Type not specified'} - ${p.description || 'No description'}, Issued: ${p.issueDate || 'Date not specified'}`).join('\n')}` : 'Building permit records were reviewed for the subject property.'}

Write a professional analysis:
1. <b><u>BUILDING PERMIT ANALYSIS</u></b>
2. State "As part of the due diligence process, building permit records were reviewed..."
3. Summarize significant permits found (major renovations, additions, systems replacements)
4. Note permits indicate [construction work completed/improvements made]
5. Assess impact on property condition and remaining useful life
6. Note if no permits were found or records were limited
7. State impact (if any) on the appraisal analysis and value conclusion

Use professional language. Write 1-2 paragraphs, approximately 125-150 words.`,

  traffic_analysis: (ctx) => `Write a professional traffic impact analysis as a 30-year MAI appraiser would.

PROPERTY LOCATION: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
${ctx.aadt ? `TRAFFIC DATA: Average Annual Daily Traffic (AADT): ${ctx.aadt.toLocaleString()} vehicles/day` : ''}

Write a professional analysis:
1. <b><u>TRAFFIC AND ACCESS ANALYSIS</u></b>
2. State traffic volume data for adjacent roadways
3. Discuss how traffic levels impact property visibility and access
4. For commercial/retail: Higher traffic generally positive for exposure
5. For industrial/warehouse: Adequate access without congestion preferred
6. Note peak hour considerations
7. Assess whether traffic characteristics are appropriate for the property type
8. Conclude with impact on marketability and value

Use professional terminology. Write 1-2 paragraphs, approximately 125-150 words.`,

  default: (ctx) => `Write a professional narrative paragraph for a commercial real estate appraisal report.

Property Type: ${ctx.propertyType || 'Commercial'}
Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}

Provide a well-written, professional paragraph appropriate for an appraisal report. Be factual and objective.

Write 1-2 paragraphs, approximately 100-150 words.`
};

// =================================================================
// SANITIZATION FUNCTIONS
// =================================================================

/**
 * Clean markdown formatting from AI output
 * Converts markdown to HTML or removes unwanted formatting
 */
function cleanMarkdownFromOutput(text: string): string {
  let cleaned = text;
  
  // Remove markdown bold/italic with asterisks or underscores
  // **bold** or __bold__ → <b>bold</b>
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  cleaned = cleaned.replace(/__([^_]+)__/g, '<b>$1</b>');
  
  // Remove single asterisk/underscore emphasis *text* or _text_
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Just remove, don't emphasize
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove markdown headers (# ## ###)
  cleaned = cleaned.replace(/^#+\s+(.+)$/gm, '$1');
  
  // Remove markdown bullet points (- or * at start of line)
  cleaned = cleaned.replace(/^[\*\-]\s+/gm, '');
  
  // Remove markdown numbered lists (1. 2. etc)
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  
  // Remove markdown blockquotes (>)
  cleaned = cleaned.replace(/^>\s+/gm, '');
  
  // Remove markdown code blocks (```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove markdown horizontal rules (---, ***)
  cleaned = cleaned.replace(/^[\-\*]{3,}$/gm, '');
  
  // Remove square brackets (markdown links/checkboxes)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // [text](url) → text
  cleaned = cleaned.replace(/\[([ xX])\]/g, ''); // Remove checkboxes
  
  return cleaned;
}

/**
 * Validate output contains no markdown syntax
 * Throws error if problematic patterns found
 */
function validateNoMarkdown(text: string): void {
  const markdownPatterns = [
    { pattern: /\*\*[^*]+\*\*/, name: 'bold asterisks (**text**)' },
    { pattern: /__[^_]+__/, name: 'bold underscores (__text__)' },
    { pattern: /^#+\s/m, name: 'markdown headers (# ##)' },
    { pattern: /^[\*\-]\s+/m, name: 'markdown bullet points (- *)' },
    { pattern: /```/, name: 'code blocks (```)' },
  ];
  
  const found = markdownPatterns.find(({ pattern }) => pattern.test(text));
  if (found) {
    console.warn(`⚠️  Markdown syntax detected in AI output: ${found.name}`);
    console.warn('   Output will be cleaned automatically.');
  }
}

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

  // Validate and clean the output
  validateNoMarkdown(content);
  const cleaned = cleanMarkdownFromOutput(content);

  return cleaned.trim();
}

/**
 * Get available section types for AI generation
 */
export function getAvailableSections(): string[] {
  return Object.keys(SECTION_PROMPTS);
}


