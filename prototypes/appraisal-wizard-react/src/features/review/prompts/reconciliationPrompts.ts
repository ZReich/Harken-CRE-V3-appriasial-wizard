// =================================================================
// AI PROMPT TEMPLATES FOR VALUE RECONCILIATION
// =================================================================
// These prompts are designed to generate professional appraisal
// narratives that comply with USPAP standards.

// =================================================================
// TYPES
// =================================================================

export interface ReconciliationContextData {
  propertyType: string;
  propertySubtype?: string;
  location: string;
  scenarioName: string;
  effectiveDate: string;
  approaches: Array<{
    name: string;
    value: number;
    weight: number;
    qualityScore: number;
  }>;
  concludedValue: number;
  minValue: number;
  maxValue: number;
  variancePercent: number;
}

export interface ExposureContextData {
  propertyType: string;
  location: string;
  value: number;
  exposureMin: number;
  exposureMax: number;
  marketingMin: number;
  marketingMax: number;
  propertyCondition?: string;
  marketConditions?: string;
}

export interface IncomeReconciliationContextData {
  propertyType: string;
  scenarioName: string;
  directCapValue: number;
  dcfValue: number;
  reconciledValue: number;
  noi: number;
  capRate: number;
  discountRate: number;
  terminalCapRate: number;
  holdingPeriod: number;
  variancePercent: number;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getWeightDescription(weight: number): string {
  if (weight >= 50) return 'primary emphasis';
  if (weight >= 30) return 'significant weight';
  if (weight >= 15) return 'secondary consideration';
  return 'supporting consideration';
}

function getQualityDescription(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'adequate';
  return 'limited';
}

// =================================================================
// RECONCILIATION COMMENTS PROMPT
// =================================================================

export function buildReconciliationPrompt(data: ReconciliationContextData): string {
  const approachDetails = data.approaches
    .map(a => `- ${a.name}: ${formatCurrency(a.value)} (${a.weight}% weight, ${getQualityDescription(a.qualityScore)} data quality)`)
    .join('\n');

  return `You are a senior MAI-designated commercial real estate appraiser with 30 years of experience writing appraisal reports. You must write a value reconciliation narrative that complies with USPAP Standards Rule 1-6 and 2-2.

ASSIGNMENT CONTEXT:
- Property Type: ${data.propertyType}${data.propertySubtype ? ` (${data.propertySubtype})` : ''}
- Location: ${data.location}
- Valuation Scenario: ${data.scenarioName}
- Effective Date: ${data.effectiveDate}

APPROACH VALUES AND WEIGHTS:
${approachDetails}

CONCLUDED VALUE: ${formatCurrency(data.concludedValue)}

VALUE RANGE ANALYSIS:
- Minimum Indication: ${formatCurrency(data.minValue)}
- Maximum Indication: ${formatCurrency(data.maxValue)}
- Variance: ${data.variancePercent.toFixed(1)}%

WRITING INSTRUCTIONS:
1. Begin with: "In reconciling the value indications..."
2. Explain WHY each approach received its specific weight based on:
   - Reliability and quality of available data
   - Applicability of the approach to this property type
   - Market participant behavior for this asset class
3. Address the variance between approaches if significant (>10%)
4. Discuss how the ${data.scenarioName} scenario influenced approach weighting
5. Conclude with confidence in the final value
6. Write in first person from the appraiser's perspective
7. Use professional, objective tone
8. Length: 2-3 paragraphs (200-350 words)

DO NOT:
- Use placeholder text like [insert value here]
- Include hypothetical or uncertain statements
- Reference specific comparable properties by address
- Include numerical calculations in the narrative`;
}

// =================================================================
// EXPOSURE TIME RATIONALE PROMPT
// =================================================================

export function buildExposureTimePrompt(data: ExposureContextData): string {
  return `You are a senior commercial real estate appraiser with 30 years of market experience. Write an exposure time and marketing time rationale for an appraisal report.

PROPERTY DETAILS:
- Property Type: ${data.propertyType}
- Location: ${data.location}
- Concluded Value: ${formatCurrency(data.value)}
- Property Condition: ${data.propertyCondition || 'Average'}
- Market Conditions: ${data.marketConditions || 'Stable'}

EXPOSURE/MARKETING TIME ESTIMATES:
- Exposure Time: ${data.exposureMin} to ${data.exposureMax} months (retrospective)
- Marketing Time: ${data.marketingMin} to ${data.marketingMax} months (prospective)

WRITING INSTRUCTIONS:
1. Begin with: "Based on analysis of current market conditions..."
2. Clearly distinguish between:
   - EXPOSURE TIME: Retrospective - the estimated time the property would have been on the market PRIOR to the effective date
   - MARKETING TIME: Prospective - the estimated time to sell AFTER the effective date
3. Reference current market conditions for ${data.propertyType} properties
4. Discuss factors that influence marketability:
   - Property size relative to typical market transactions
   - Location characteristics
   - Property condition and functional utility
   - Current investor demand and lending environment
5. Justify the estimated time ranges based on market evidence
6. Write in first person from the appraiser's perspective
7. Length: 1-2 paragraphs (100-200 words)

DO NOT:
- Use placeholder text
- Reference specific transactions without actual data
- Make speculative statements about future market conditions`;
}

// =================================================================
// INCOME APPROACH RECONCILIATION PROMPT
// =================================================================

export function buildIncomeReconciliationPrompt(data: IncomeReconciliationContextData): string {
  const spreadBasisPoints = Math.round((data.terminalCapRate - data.capRate) * 100);
  const spreadDescription = spreadBasisPoints > 0 
    ? `positive spread of ${spreadBasisPoints} basis points reflects anticipated market uncertainty and risk premium at reversion`
    : spreadBasisPoints < 0
    ? `negative spread of ${Math.abs(spreadBasisPoints)} basis points reflects expectations of market improvement over the holding period`
    : 'equal going-in and terminal rates reflect stable market expectations';

  return `You are a senior MAI-designated commercial appraiser with 30 years of experience. Write the Income Approach reconciliation section for an appraisal report.

PROPERTY AND SCENARIO:
- Property Type: ${data.propertyType}
- Valuation Scenario: ${data.scenarioName}

INCOME APPROACH ANALYSIS:
- Net Operating Income (NOI): ${formatCurrency(data.noi)}
- Direct Capitalization Rate: ${data.capRate.toFixed(2)}%
- Direct Capitalization Value: ${formatCurrency(data.directCapValue)}

DCF ANALYSIS:
- Discount Rate (Yield): ${data.discountRate.toFixed(2)}%
- Terminal Capitalization Rate: ${data.terminalCapRate.toFixed(2)}%
- Holding Period: ${data.holdingPeriod} years
- DCF Value Indication: ${formatCurrency(data.dcfValue)}

RECONCILIATION:
- Variance Between Methods: ${data.variancePercent.toFixed(1)}%
- Reconciled Income Approach Value: ${formatCurrency(data.reconciledValue)}

SPREAD ANALYSIS:
The ${spreadDescription}.

WRITING INSTRUCTIONS:
1. Begin with: "The Income Approach value conclusion has been developed using both Direct Capitalization and Discounted Cash Flow methodologies..."
2. Explain each methodology briefly:
   - Direct Cap: single-year NOI capitalized at market rate
   - DCF: multi-year cash flow projection discounted to present value
3. Discuss why the cap rates selected are appropriate for this property type
4. Address the variance between methods (${data.variancePercent.toFixed(1)}%)
5. Explain how the final reconciled value was determined
6. Write in first person from the appraiser's perspective
7. Length: 2-3 paragraphs (200-300 words)`;
}

// =================================================================
// SIMULATED AI DRAFTS (for demo/offline use)
// =================================================================

export function getSimulatedReconciliationDraft(data: ReconciliationContextData): string {
  const primaryApproach = data.approaches.reduce((a, b) => a.weight > b.weight ? a : b);
  const secondaryApproaches = data.approaches.filter(a => a.name !== primaryApproach.name);
  
  let draft = `In reconciling the value indications from the applicable valuation approaches, I have given ${getWeightDescription(primaryApproach.weight)} to the ${primaryApproach.name}, which indicates a value of ${formatCurrency(primaryApproach.value)}. This approach is considered most reliable for this ${data.propertyType} property because `;
  
  if (primaryApproach.name === 'Income Approach') {
    draft += `income-producing properties like the subject are typically purchased by investors who base their acquisition decisions on anticipated income and return requirements. The income data utilized reflects actual operating history and market-supported assumptions.`;
  } else if (primaryApproach.name === 'Sales Comparison') {
    draft += `adequate comparable sales data was available, and market participants for this property type rely heavily on direct comparison to recent transactions. The adjustments applied are well-supported by market evidence.`;
  } else if (primaryApproach.name === 'Cost Approach') {
    draft += `the improvements are relatively new, making depreciation estimates more reliable. Additionally, for special-purpose properties, cost of replacement is a primary consideration for market participants.`;
  }
  
  if (secondaryApproaches.length > 0) {
    draft += `\n\nThe ${secondaryApproaches.map(a => a.name).join(' and ')} ${secondaryApproaches.length > 1 ? 'provide' : 'provides'} ${secondaryApproaches.length > 1 ? 'supporting' : 'a supporting'} indication${secondaryApproaches.length > 1 ? 's' : ''} of value. `;
    
    secondaryApproaches.forEach(approach => {
      if (approach.name === 'Cost Approach') {
        draft += `The Cost Approach, indicating ${formatCurrency(approach.value)}, is given less weight due to the difficulty in accurately measuring depreciation. `;
      } else if (approach.name === 'Sales Comparison') {
        draft += `The Sales Comparison Approach, indicating ${formatCurrency(approach.value)}, provides market-based support for the value conclusion. `;
      } else if (approach.name === 'Income Approach') {
        draft += `The Income Approach, indicating ${formatCurrency(approach.value)}, is considered in the reconciliation as a reflection of investment expectations. `;
      }
    });
  }
  
  draft += `\n\nBased on the foregoing analysis, it is my opinion that the market value of the subject property, under the ${data.scenarioName} scenario as of the effective date, is ${formatCurrency(data.concludedValue)}. This conclusion reflects the most probable price the property would bring in a competitive and open market under all conditions requisite to a fair sale, with buyer and seller each acting prudently and knowledgeably.`;
  
  return draft;
}

export function getSimulatedExposureDraft(data: ExposureContextData): string {
  return `Based on analysis of current market conditions for ${data.propertyType} properties in the ${data.location} market, I estimate the exposure time for the subject property to be ${data.exposureMin} to ${data.exposureMax} months. This estimate reflects the time period the property would have been exposed to the market prior to the effective date of value, assuming competent marketing at market-appropriate pricing.

The estimated marketing time, which represents the prospective time to achieve a sale from the effective date forward, is also estimated at ${data.marketingMin} to ${data.marketingMax} months. This estimate considers the property's ${formatCurrency(data.value)} value level, which falls within the typical transaction size for this market. The subject's ${data.propertyCondition || 'average'} condition and functional utility are consistent with market expectations. Current market conditions for ${data.propertyType} assets are ${data.marketConditions || 'stable'}, with adequate buyer demand and available financing for qualified investors. These factors support the exposure and marketing time estimates provided.`;
}

export function getSimulatedIncomeReconciliationDraft(data: IncomeReconciliationContextData): string {
  const variance = data.variancePercent;
  const varianceInterpretation = variance < 5 
    ? 'The close agreement between these two methods provides strong support for the Income Approach value conclusion.'
    : variance < 10
    ? 'The reasonable alignment between these methods supports confidence in the Income Approach indication.'
    : 'The variance between methods reflects differences in underlying assumptions and market expectations.';

  return `The Income Approach value conclusion for the subject ${data.propertyType} property has been developed using both Direct Capitalization and Discounted Cash Flow (Yield Capitalization) methodologies under the "${data.scenarioName}" scenario.

The Direct Capitalization method converts the stabilized Net Operating Income of ${formatCurrency(data.noi)} into value using a market-derived capitalization rate of ${data.capRate.toFixed(2)}%. This rate is supported by analysis of recent comparable sales and reflects current investor return requirements for ${data.propertyType} properties in this market. The Direct Capitalization indication is ${formatCurrency(data.directCapValue)}.

A ${data.holdingPeriod}-year Discounted Cash Flow analysis was also performed, utilizing a discount rate of ${data.discountRate.toFixed(2)}% and a terminal capitalization rate of ${data.terminalCapRate.toFixed(2)}%. The ${data.terminalCapRate > data.capRate ? 'higher terminal rate reflects typical investor expectations for increased risk at reversion' : 'relationship between going-in and terminal rates reflects market expectations for property performance'}. The DCF analysis indicates a value of ${formatCurrency(data.dcfValue)}.

${varianceInterpretation} Based on reconciliation of these two methods, the Income Approach value indication is ${formatCurrency(data.reconciledValue)}.`;
}

// =================================================================
// CERTIFICATION PROMPT (for reference)
// =================================================================

export const CERTIFICATION_STATEMENTS = [
  'I certify that, to the best of my knowledge and belief, the statements of fact contained in this report are true and correct.',
  'I certify that the reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions and are my personal, impartial, and unbiased professional analyses, opinions, and conclusions.',
  'I certify that I have no present or prospective interest in the property that is the subject of this report and no personal interest with respect to the parties involved.',
  'I certify that I have performed no services, as an appraiser or in any other capacity, regarding the property that is the subject of this report within the three-year period immediately preceding the agreement to perform this assignment.',
  'I certify that my engagement in this assignment was not contingent upon developing or reporting predetermined results.',
  'I certify that my compensation for completing this assignment is not contingent upon the development or reporting of a predetermined value or direction in value that favors the cause of the client, the amount of the value opinion, the attainment of a stipulated result, or the occurrence of a subsequent event directly related to the intended use of this appraisal.',
  'I certify that my analyses, opinions, and conclusions were developed, and this report has been prepared, in conformity with the Uniform Standards of Professional Appraisal Practice.',
];

