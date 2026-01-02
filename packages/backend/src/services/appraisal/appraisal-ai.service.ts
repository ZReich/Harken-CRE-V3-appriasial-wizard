/**
 * Appraisal AI Service
 * Provides AI-powered text generation for appraisal report sections
 * Uses GPT-4o through the existing OpenAIService
 * 
 * FIX #46-47: SYNC REQUIRED WITH FRONTEND
 * This backend service should be kept in sync with:
 * - prototypes/appraisal-wizard-react/api/_lib/openai.ts (prompts)
 * - prototypes/appraisal-wizard-react/src/utils/hbuContextBuilder.ts (context)
 * 
 * Last Frontend Sync: January 1, 2026
 * - Added 20+ new context fields (demographics, economics, risk, etc.)
 * - Added adjusted price calculation for sales comps
 * - Added scenario info and completion flags
 * - Added proper formatting (currency, percentages)
 * - Added error handling and validation
 * 
 * TODO: Update AIGenerationContext interface to match frontend
 * TODO: Update prompts to use new context fields
 * TODO: Add validation and error handling
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

const SYSTEM_PROMPT = `You are a senior MAI-designated commercial real estate appraiser with 30 years of experience writing USPAP-compliant appraisal reports. Your task is to generate clear, accurate, and professional narrative text for appraisal reports.

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

    neighborhood_boundaries: (ctx) => `Write a professional neighborhood boundaries section for an appraisal report.

Property Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}
County: ${ctx.siteData?.county || 'Not specified'}

Describe the neighborhood boundaries using the following format:
- North: [specific street, landmark, or geographic feature]
- South: [specific street, landmark, or geographic feature]
- East: [specific street, landmark, or geographic feature]
- West: [specific street, landmark, or geographic feature]

Then provide a brief summary of why these boundaries define the competitive market area for similar properties.

Write with specific detail as a 30-year MAI appraiser would, using local knowledge and landmarks. Write 2 paragraphs, approximately 150-200 words.`,

    neighborhood_characteristics: (ctx) => `Write a professional neighborhood characteristics analysis for an appraisal report.

Property Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}
Property Subtype: ${ctx.propertySubtype || 'Not specified'}
Zoning: ${ctx.siteData?.zoning || 'Not specified'}

Include:
- Predominant land uses and development patterns
- Age and condition of existing development
- Access and transportation (highways, arterials, public transit)
- Available amenities (retail, restaurants, services)
- Factors positively and negatively affecting property values
- Neighborhood life cycle stage (growth, stability, decline)

Write as a 30-year MAI appraiser would, with specific observations about the market area. Write 2-3 paragraphs, approximately 200-250 words.`,

    specific_location: (ctx) => `Write a professional specific location description for an appraisal report.

Property Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
Property Type: ${ctx.propertyType || 'Commercial'}
Property Subtype: ${ctx.propertySubtype || 'Not specified'}

Include:
- Precise location description (street name, block, subdivision)
- Proximity to major arterials and highways (with distances)
- Nearby landmarks and points of reference
- Access characteristics (frontage, ingress/egress)
- Visibility from major roads
- Surrounding property uses

Write as a 30-year MAI appraiser would, with enough detail that a reader unfamiliar with the area could locate the property. Write 2 paragraphs, approximately 150-175 words.`,

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

    // New prompts added - Setup & Subject Data
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

    site_notes: (ctx) => `Write professional site analysis notes for an appraisal report as a 30-year MAI appraiser would.

SITE CHARACTERISTICS:
- Site Size: ${ctx.siteData?.siteSize || 'Not specified'}
- Shape: ${ctx.siteData?.shape || 'Not specified'}
- Topography: ${ctx.siteData?.topography || 'Not specified'}
- Frontage: ${ctx.siteData?.frontage || 'Not specified'}
- Access: ${ctx.siteData?.accessQuality || 'Not specified'}

Write professional observations about:
1. Any unique or noteworthy site characteristics
2. Factors that enhance or detract from site utility
3. Development constraints or opportunities
4. Competitive advantages of the site

Use professional appraisal terminology. Write 1-2 paragraphs, approximately 100-150 words.`,

    zoning_description: (ctx) => `Write a professional zoning analysis for an appraisal report as a 30-year MAI appraiser would.

ZONING INFORMATION:
- Classification: ${ctx.siteData?.zoning || 'Not specified'}
- Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.county || 'Not specified'} County

Write a professional analysis addressing:
1. Current zoning classification and jurisdiction
2. Permitted uses by right under the current zoning
3. Conditional or special exception uses available
4. Compliance status of existing improvements (conforming/non-conforming/legal non-conforming)
5. Any relevant setback, parking, or density requirements
6. Impact on property utility and marketability

Reference that zoning verification should be confirmed with local authorities for transaction purposes. Use proper appraisal terminology. Write 2 paragraphs, approximately 150-200 words.`,

    transaction_history: (ctx) => `Write a USPAP-compliant transaction history analysis as a 30-year MAI appraiser would.

TRANSACTION DATA:
- Last Sale Date: ${ctx.lastSaleDate || 'Not specified'}
- Last Sale Price: ${ctx.lastSalePrice || 'Not specified'}
- Current Owner: Per public records
${ctx.transactionHistory ? `\n\nADDITIONAL HISTORY:\n${ctx.transactionHistory}` : ''}

Write a professional analysis that:
1. Begins with: "USPAP Standards Rule 1-5 requires analysis of all sales and transfers within three years of the effective date."
2. Documents the last transaction (date, price, parties if available)
3. Analyzes whether the transaction was arms-length
4. Notes any non-arms-length considerations (family transfer, foreclosure, etc.)
5. Explains how prior sales do/do not impact current value opinion
6. States if no sales occurred within the three-year lookback period

Be specific with dates and prices when available. Write 2 paragraphs, approximately 150-200 words.`,

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

    // Utility prompts
    water_source: (ctx) => `Write a professional water service analysis for an appraisal report as a 30-year MAI appraiser would.

WATER SERVICE:
${ctx.siteData?.waterSource || 'Municipal water available'}

PROPERTY TYPE: ${ctx.propertyType || 'Commercial'}
LOCATION: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}

Write a brief professional analysis:
1. Identify the water service provider and type (municipal, well, shared)
2. Note adequacy for current and anticipated uses
3. Mention fire suppression capability if applicable for commercial properties
4. State that no deficiencies were observed that would adversely affect utility

Use authoritative language. Write 1 paragraph, approximately 75-100 words.`,

    sewer_type: (ctx) => `Write a professional sanitary sewer service analysis for an appraisal report as a 30-year MAI appraiser would.

SEWER SERVICE:
${ctx.siteData?.sewerType || 'Municipal sanitary sewer available'}

PROPERTY TYPE: ${ctx.propertyType || 'Commercial'}
LOCATION: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}

Write a brief professional analysis:
1. Identify the sewer service type (municipal, septic, package plant)
2. Note connection status and adequacy
3. State system capacity is appropriate for the property type
4. Confirm no deficiencies observed that would affect utility or value

Use authoritative language. Write 1 paragraph, approximately 75-100 words.`,

    electric: (ctx) => `Write a professional electric service analysis for an appraisal report as a 30-year MAI appraiser would.

ELECTRIC SERVICE:
${ctx.siteData?.electricProvider || 'Electric service available from local utility'}

PROPERTY TYPE: ${ctx.propertyType || 'Commercial'}
LOCATION: ${ctx.siteData?.city || 'Not specified'}

Write a brief professional analysis:
1. Identify the electric service provider
2. Note service type (overhead/underground) and phase (single/three-phase)
3. State capacity appears adequate for ${ctx.propertyType || 'commercial'} use
4. Confirm no electrical deficiencies observed

Use authoritative language. Write 1 paragraph, approximately 75-100 words.`,

    natural_gas: (ctx) => `Write a professional natural gas service analysis for an appraisal report as a 30-year MAI appraiser would.

NATURAL GAS SERVICE:
${ctx.siteData?.naturalGas || 'Natural gas available'}

PROPERTY TYPE: ${ctx.propertyType || 'Commercial'}

Write a brief professional analysis:
1. Confirm natural gas availability and connection status
2. Note utility provider if known
3. State service is adequate for heating and process needs
4. Mention this is typical for the market area

Use authoritative language. Write 1 paragraph, approximately 50-75 words.`,

    telecom: (ctx) => `Write a professional telecommunications analysis for an appraisal report as a 30-year MAI appraiser would.

PROPERTY TYPE: ${ctx.propertyType || 'Commercial'}
LOCATION: ${ctx.siteData?.city || 'Not specified'}

Write a brief professional analysis:
1. Confirm telecommunications availability (phone, internet, cable)
2. Note multiple provider options are typically available in the area
3. State fiber optic and high-speed internet service is available
4. Confirm infrastructure supports modern business communications requirements

Use authoritative language. Write 1 paragraph, approximately 75-100 words.`,

    flood_zone: (ctx) => `Write a professional FEMA flood zone determination for an appraisal report as a 30-year MAI appraiser would.

FLOOD ZONE DATA:
- FEMA Zone: ${ctx.siteData?.femaZone || 'Zone X'}
- Location: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.county || 'Not specified'} County

Write a professional flood zone analysis:
1. State "According to the Federal Emergency Management Agency (FEMA) Flood Insurance Rate Map..."
2. Identify the specific flood zone designation
3. Explain what the zone designation means (Zone X = minimal risk, Zone A = 100-year floodplain, etc.)
4. State flood insurance requirements based on zone (required for Special Flood Hazard Areas, optional for Zone X)
5. Note this is subject to FEMA map revisions
6. Conclude with impact on property marketability

Use proper FEMA terminology. Write 2 paragraphs, approximately 125-150 words.`,

    // Site description prompts
    easements: (ctx) => `Write a professional easements and encumbrances analysis for an appraisal report as a 30-year MAI appraiser would.

PROPERTY LOCATION: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
SITE SIZE: ${ctx.siteData?.siteSize || 'Not specified'}
${ctx.siteData?.easements ? `\n\nEASEMENT INFORMATION:\n${ctx.siteData.easements}` : ''}

Write a professional analysis:
1. State "Based on our title review and inspection..."
2. Identify any recorded easements (utility, access, drainage)
3. Assess whether easements adversely impact site utility or value
4. Note typical utility easements along property boundaries are customary
5. State if no unusual or adverse easements were identified
6. Reference that complete title review is recommended for transaction purposes

Use proper legal and appraisal terminology. Write 1-2 paragraphs, approximately 100-150 words.`,

    site_description_full: (ctx) => `Write a comprehensive professional site description for an appraisal report as a 30-year MAI appraiser would.

SITE CHARACTERISTICS:
- Size: ${ctx.siteData?.siteSize || 'Not specified'}
- Shape: ${ctx.siteData?.shape || 'Not specified'}
- Topography: ${ctx.siteData?.topography || 'Not specified'}
- Frontage: ${ctx.siteData?.frontage || 'Not specified'}
- Access: ${ctx.siteData?.accessQuality || 'Not specified'}
- Visibility: ${ctx.siteData?.visibility || 'Not specified'}
- Zoning: ${ctx.siteData?.zoning || 'Not specified'}

UTILITIES:
- Water: ${ctx.siteData?.waterSource || 'Municipal'}
- Sewer: ${ctx.siteData?.sewerType || 'Municipal'}
- Electric, Gas, Telecom: Available

SITE IMPROVEMENTS:
- Paving: ${ctx.siteData?.pavingType || 'Asphalt'}
- Fencing: ${ctx.siteData?.fencingType || 'Per observation'}

FLOOD ZONE: ${ctx.siteData?.femaZone || 'Zone X'}

Write a comprehensive site description with bold section headers:
1. <b><u>SITE SIZE AND CONFIGURATION</u></b> - Dimensions, shape, and area
2. <b><u>TOPOGRAPHY AND DRAINAGE</u></b> - Grade, drainage patterns
3. <b><u>ACCESS AND VISIBILITY</u></b> - Frontage, ingress/egress, visibility analysis
4. <b><u>UTILITIES</u></b> - All utility services and adequacy
5. <b><u>SITE IMPROVEMENTS</u></b> - Paving, lighting, fencing, landscaping
6. <b><u>FLOOD ZONE</u></b> - FEMA designation and implications
7. <b><u>EASEMENTS</u></b> - Notable easements or statement that none adversely affect value
8. <b><u>CONCLUSION</u></b> - Overall site suitability assessment

Write 4-6 paragraphs, approximately 350-450 words total. Use definitive professional language throughout.`,

    site_improvements: (ctx) => `Write a professional site improvements description for an appraisal report as a 30-year MAI appraiser would.

SITE IMPROVEMENTS:
- Paving: ${ctx.siteData?.pavingType || 'Asphalt paving'}
- Fencing: ${ctx.siteData?.fencingType || 'Chain link perimeter fence'}
- Property Type: ${ctx.propertyType || 'Commercial'}

Write a professional description:
1. Describe paving areas (parking, circulation, loading areas)
2. Note paving condition and adequacy
3. Describe fencing type, coverage, and condition
4. Mention exterior lighting for safety and security
5. Note any landscaping or yard improvements
6. Assess overall condition and functional adequacy
7. State whether improvements are typical for the property type

Use professional terminology. Write 2 paragraphs, approximately 150-175 words.`,

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

    // Valuation approach prompts
    sales_comparison: (ctx) => `Write the Sales Comparison Approach reconciliation narrative as a 30-year MAI appraiser would.

SUBJECT PROPERTY:
- Address: ${ctx.siteData?.city || 'Not specified'}, ${ctx.siteData?.state || 'Not specified'}
- Property Type: ${ctx.propertyType || 'Commercial'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF

${ctx.salesComps && ctx.salesComps.length > 0 ? `COMPARABLE SALES ANALYZED:
${ctx.salesComps.map((c: any, i: number) => `- Sale ${i+1}: ${c.address || 'Address not specified'}, Sale Price: ${c.salePrice ? '$' + c.salePrice.toLocaleString() : 'Not specified'}${c.adjustedPrice ? `, Adjusted: $${c.adjustedPrice.toLocaleString()}` : ''}`).join('\n')}` : 'Comparable sales were analyzed for this property type.'}

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
${ctx.landComps.map((c: any, i: number) => `- Sale ${i+1}: ${c.address || 'Not specified'}, ${c.pricePerAcre ? `$${c.pricePerAcre.toLocaleString()}/acre` : 'Price not specified'}${c.adjustedPricePerAcre ? `, Adjusted: $${c.adjustedPricePerAcre.toLocaleString()}/acre` : ''}`).join('\n')}` : 'Land sales were analyzed in the subject market area.'}

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

    // Income approach prompts
    rent_comparable: (ctx) => `Write a professional market rent analysis narrative as a 30-year MAI appraiser would.

SUBJECT PROPERTY:
- Property Type: ${ctx.propertyType || 'Commercial'}
- Building Size: ${ctx.improvementData?.buildingSize || 'Not specified'} SF
- Location: ${ctx.siteData?.city || 'Not specified'}

${ctx.rentComps && ctx.rentComps.length > 0 ? `RENTAL COMPARABLES:
${ctx.rentComps.map((c: any, i: number) => `- Comp ${i+1}: ${c.address || 'Not specified'}${c.rentPerSf ? `, $${c.rentPerSf.toFixed(2)}/SF/yr` : ''}`).join('\n')}` : 'Market rental comparables were analyzed.'}

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
${ctx.expenseComps.map((c: any, i: number) => `- Comp ${i+1}: ${c.address || 'Not specified'}${c.expenseRatio ? `, Expense Ratio: ${(c.expenseRatio * 100).toFixed(1)}%` : ''}`).join('\n')}` : 'Comparable operating expense data was analyzed.'}

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

    // Cost approach prompts
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

    // Building component prompts
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

    // Review & reconciliation prompts
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
${ctx.swotStrengths.map((s: string) => `- ${s}`).join('\n')}` : ''}

${ctx.swotWeaknesses && ctx.swotWeaknesses.length > 0 ? `WEAKNESSES IDENTIFIED:
${ctx.swotWeaknesses.map((w: string) => `- ${w}`).join('\n')}` : ''}

${ctx.swotOpportunities && ctx.swotOpportunities.length > 0 ? `OPPORTUNITIES IDENTIFIED:
${ctx.swotOpportunities.map((o: string) => `- ${o}`).join('\n')}` : ''}

${ctx.swotThreats && ctx.swotThreats.length > 0 ? `THREATS IDENTIFIED:
${ctx.swotThreats.map((t: string) => `- ${t}`).join('\n')}` : ''}

Write a comprehensive professional SWOT synthesis:
1. <b><u>SWOT ANALYSIS SUMMARY</u></b>
2. Begin with an executive statement about the property's overall risk-return profile
3. <b>Strengths:</b> Synthesize key competitive advantages - how they enhance marketability and support value
4. <b>Weaknesses:</b> Address limitations and considerations - quantify impact where possible, note capital requirements
5. <b>Opportunities:</b> Identify value-enhancement potential - market momentum, rent growth, operational improvements
6. <b>Threats:</b> Analyze risk factors - capital replacement needs, market risks, deferred maintenance implications
7. <b>Overall Assessment:</b> Conclude with investment perspective - target buyer profile, pricing considerations, market positioning

Use sophisticated investment analysis terminology. Reference how identified factors influenced the valuation approaches and final value conclusion. Write 4-5 paragraphs, approximately 350-450 words. This should read like institutional-quality investment analysis.`,

    // Supplemental data prompts
    permit_analysis: (ctx) => `Write a professional building permit analysis as a 30-year MAI appraiser would.

PROPERTY: ${ctx.propertyType || 'Commercial'} in ${ctx.siteData?.city || 'Not specified'}

${ctx.buildingPermits && ctx.buildingPermits.length > 0 ? `PERMITS IDENTIFIED:
${ctx.buildingPermits.map((p: any) => `- ${p.permitNumber || 'Permit'}: ${p.type || 'Type not specified'} - ${p.description || 'No description'}, Issued: ${p.issueDate || 'Date not specified'}`).join('\n')}` : 'Building permit records were reviewed for the subject property.'}

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
// SERVICE CLASS
// =================================================================

export default class AppraisalAIService {
    private openAIService: OpenAIService;

    constructor() {
        this.openAIService = new OpenAIService();
    }

    /**
     * Clean markdown formatting from AI output
     * Converts markdown to HTML or removes unwanted formatting
     */
    private cleanMarkdownFromOutput(text: string): string {
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
     */
    private validateNoMarkdown(text: string): void {
        const markdownPatterns = [
            { pattern: /\*\*[^*]+\*\*/, name: 'bold asterisks (**text**)' },
            { pattern: /__[^_]+__/, name: 'bold underscores (__text__)' },
            { pattern: /^#+\s/m, name: 'markdown headers (# ##)' },
            { pattern: /^[\*\-]\s+/m, name: 'markdown bullet points (- *)' },
            { pattern: /```/, name: 'code blocks (```)' },
        ];
        
        const found = markdownPatterns.find(({ pattern }) => pattern.test(text));
        if (found) {
            helperFunction.log({
                message: `Markdown syntax detected in AI output: ${found.name}. Output will be cleaned automatically.`,
                location: 'AppraisalAIService.validateNoMarkdown',
                level: LoggerEnum.WARN,
                error: '',
            });
        }
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
            let generatedContent = await this.generateWithOpenAI(userPrompt);

            // Validate and clean the output
            this.validateNoMarkdown(generatedContent);
            generatedContent = this.cleanMarkdownFromOutput(generatedContent);

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

