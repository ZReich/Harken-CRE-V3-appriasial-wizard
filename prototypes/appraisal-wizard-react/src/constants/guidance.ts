/**
 * Comprehensive guidance content for all scenario + approach combinations.
 * Each entry provides context-specific information to help appraisers 
 * understand how the selected scenario affects data entry and analysis.
 */

export interface GuidanceContent {
  context: string;
  assumptions: string[];
  pitfalls: string[];
  uspap: string;
  tips: string[];
}

export interface ApproachGuidance {
  [approachId: string]: GuidanceContent;
}

export interface ScenarioGuidance {
  [scenarioName: string]: ApproachGuidance;
}

// =============================================================================
// GUIDANCE CONTENT MATRIX
// =============================================================================

export const GUIDANCE_CONTENT: ScenarioGuidance = {
  // ---------------------------------------------------------------------------
  // AS IS SCENARIO
  // ---------------------------------------------------------------------------
  'As Is': {
    hbu: {
      context: 'Analyze the property as it exists on the effective date of appraisal, including all current improvements, conditions, and uses.',
      assumptions: [
        'Property is valued in its current physical condition',
        'Existing improvements and uses are considered',
        'Current zoning and legal restrictions apply',
        'Market conditions as of inspection date',
      ],
      pitfalls: [
        'Failing to account for deferred maintenance',
        'Not considering existing lease encumbrances',
        'Overlooking non-conforming use status',
        'Ignoring functional obsolescence in current improvements',
      ],
      uspap: 'Standards Rule 1-3(b): When the value opinion is as of a current date, an analysis of current market conditions is required.',
      tips: [
        'Document all physical deficiencies observed during inspection',
        'Consider whether current use maximizes value or if conversion is warranted',
        'Note any legal non-conforming uses that may affect marketability',
      ],
    },
    land: {
      context: 'Value the land as if vacant and available for development, reflecting current market conditions and recent comparable land sales.',
      assumptions: [
        'Land is valued as if vacant and available for HBU',
        'Current zoning and entitlements in place',
        'No extraordinary assumptions about future changes',
        'Market-supported adjustments based on current conditions',
      ],
      pitfalls: [
        'Using land sales with different entitlements without adjustment',
        'Ignoring environmental conditions affecting current value',
        'Not adjusting for differences in access, utilities, or topography',
        'Overlooking the impact of existing easements or encumbrances',
      ],
      uspap: 'Standards Rule 1-4(a): Land or site value shall be analyzed and developed when necessary.',
      tips: [
        'Verify zoning and entitlements for each comparable sale',
        'Adjust for market conditions (time) based on documented trends',
        'Consider allocation methods as a check on land value conclusion',
      ],
    },
    market: {
      context: 'Analyze current market conditions including supply, demand, absorption rates, and trends affecting the subject property type.',
      assumptions: [
        'Analysis reflects conditions as of effective date',
        'Historical trends inform but do not dictate current value',
        'Current inventory and vacancy rates are considered',
        'Buyer/seller motivations reflect current market dynamics',
      ],
      pitfalls: [
        'Relying on outdated market data',
        'Extrapolating trends without supporting evidence',
        'Ignoring micro-market conditions specific to the subject area',
        'Not distinguishing between asking prices and actual transactions',
      ],
      uspap: 'Standards Rule 1-3(a): An appraiser must analyze relevant market area conditions.',
      tips: [
        'Use multiple sources to verify market statistics',
        'Interview local brokers for insight on current activity',
        'Document both quantitative data and qualitative market observations',
      ],
    },
    sales: {
      context: 'Compare the subject property as it currently exists to similar properties that have recently sold, applying adjustments for all differences.',
      assumptions: [
        'Comparables reflect arms-length transactions',
        'Adjustments account for current condition differences',
        'Physical depreciation and deferred maintenance considered',
        'Contract vs. market rent for income-producing properties',
      ],
      pitfalls: [
        'Not adjusting for condition differences between subject and comps',
        'Using sales with different motivations (distressed, related-party)',
        'Ignoring lease encumbrances that affect comparable prices',
        'Applying adjustments without market support',
      ],
      uspap: 'Standards Rule 1-4(b): Compare comparable sales, apply appropriate adjustments, reconcile to value indication.',
      tips: [
        'Verify all comparable sales with parties to the transaction',
        'Document the rationale for each adjustment applied',
        'Consider bracketing the subject with superior and inferior sales',
      ],
    },
    income: {
      context: 'Analyze actual rent roll, current vacancy, and operating expenses to derive value via direct capitalization or DCF.',
      assumptions: [
        'Use actual in-place rents (contract rent)',
        'Apply current vacancy and collection loss rates',
        'Reflect actual operating expenses with market comparisons',
        'Capitalize stabilized NOI or project DCF with current lease terms',
      ],
      pitfalls: [
        'Confusing contract rent with market rent without disclosure',
        'Using pro forma income instead of actual operating history',
        'Applying cap rates from different property types or markets',
        'Not deducting appropriate reserves for replacement',
      ],
      uspap: 'Standards Rule 1-4(c): Analyze income and expenses, select appropriate capitalization method.',
      tips: [
        'Request 2-3 years of operating statements for trend analysis',
        'Compare subject expenses to industry benchmarks (BOMA, IREM)',
        'Document cap rate selection with comparable sale analysis',
      ],
    },
    cost: {
      context: 'Estimate replacement cost new of improvements, then deduct all forms of depreciation (physical, functional, external) reflecting current condition.',
      assumptions: [
        'All depreciation types are fully recognized',
        'Current physical condition with deferred maintenance',
        'Functional obsolescence from design or layout deficiencies',
        'External obsolescence from market or locational factors',
      ],
      pitfalls: [
        'Underestimating physical depreciation for older buildings',
        'Not identifying curable vs. incurable depreciation',
        'Using cost manuals without local multipliers',
        'Failing to deduct entrepreneurial incentive/profit appropriately',
      ],
      uspap: 'Standards Rule 1-4(d): Analyze current cost, depreciation, and entrepreneurial incentive.',
      tips: [
        'Break down depreciation into curable and incurable components',
        'Use age-life method as a check on observed condition method',
        'Verify cost data with local contractors when possible',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // AS COMPLETED SCENARIO
  // ---------------------------------------------------------------------------
  'As Completed': {
    hbu: {
      context: 'Analyze the property assuming all proposed construction or renovations are 100% complete as of the prospective date.',
      assumptions: [
        'Improvements are fully constructed per plans and specs',
        'Certificate of occupancy has been issued',
        'No remaining construction or punch-list items',
        'Quality and condition are as-new',
      ],
      pitfalls: [
        'Valuing before reviewing final plans and specifications',
        'Not discounting for time value if completion is distant',
        'Assuming stabilized occupancy when not yet leased',
        'Ignoring potential cost overruns or scope changes',
      ],
      uspap: 'Standards Rule 1-2(g): Prospective value must clearly disclose the effective date and extraordinary assumptions.',
      tips: [
        'Review architectural plans, specs, and construction budget',
        'Verify expected completion date with contractor/developer',
        'Clearly state this is a prospective value with associated risks',
      ],
    },
    land: {
      context: 'Land value typically remains unchanged from As Is scenario; the land is the same physical asset regardless of improvement status.',
      assumptions: [
        'Land value is consistent with As Is scenario',
        'No change in zoning or entitlements assumed',
        'Site work included in improvement costs, not land',
        'Same market conditions apply to land component',
      ],
      pitfalls: [
        'Double-counting site improvements in both land and building',
        'Changing land value assumptions without justification',
        'Confusing entitled land value with raw land value',
      ],
      uspap: 'The allocation of value between land and improvements must be supportable.',
      tips: [
        'Use the same land value conclusion as the As Is scenario',
        'Ensure site improvements are consistently categorized',
        'Document any differences in land value between scenarios',
      ],
    },
    market: {
      context: 'Analyze prospective market conditions at the expected completion date, considering supply pipeline and absorption forecasts.',
      assumptions: [
        'Market analysis projects forward to completion date',
        'Consider projects under construction as future supply',
        'Absorption forecasts inform lease-up timeline',
        'Economic forecasts support market assumptions',
      ],
      pitfalls: [
        'Overly optimistic market projections',
        'Ignoring competing projects in the pipeline',
        'Not accounting for economic cycle timing',
        'Using current rents without escalation or market trends',
      ],
      uspap: 'Prospective opinions must reflect reasonably probable market conditions.',
      tips: [
        'Research construction pipeline in the subject market',
        'Use forecasts from reputable economic sources',
        'Clearly identify assumptions as prospective/projected',
      ],
    },
    sales: {
      context: 'Compare to newly constructed comparable properties with similar quality and specifications. No condition adjustments needed for as-new subject.',
      assumptions: [
        'Subject is compared as if brand new construction',
        'No physical depreciation on subject improvements',
        'Comparables should be recent new construction sales',
        'Entrepreneurial profit/incentive may be reflected in sales',
      ],
      pitfalls: [
        'Using older comparable sales without adjusting for new construction premium',
        'Not accounting for differences in construction quality',
        'Applying condition adjustments to a brand-new subject',
        'Ignoring presale vs. completed-sale pricing differences',
      ],
      uspap: 'Comparable sales must be appropriately adjusted to reflect the assumed condition.',
      tips: [
        'Focus on comparable new construction sales when available',
        'Document construction quality comparisons (Class A, B, C)',
        'Consider developer portfolio sales as market evidence',
      ],
    },
    income: {
      context: 'Project pro forma income at market rents upon completion. During construction, property generates no income or negative carry.',
      assumptions: [
        'Use projected market rents at completion date',
        'Assume competent property management upon opening',
        'Vacancy reflects absorption period, not stabilized rate',
        'Expenses projected based on comparable new properties',
      ],
      pitfalls: [
        'Using stabilized occupancy immediately upon completion',
        'Not accounting for lease-up costs and timing',
        'Projecting rents above market without justification',
        'Ignoring concessions typical for new construction lease-up',
      ],
      uspap: 'Income projections must be reasonable and supported by market evidence.',
      tips: [
        'Research achievable rents for comparable new construction',
        'Build in realistic absorption timeline (6-18 months typical)',
        'Account for lease-up concessions (free rent, TI allowances)',
      ],
    },
    cost: {
      context: 'Physical depreciation is zero for new construction. Calculate replacement cost new and add entrepreneurial profit. No deferred maintenance.',
      assumptions: [
        'Zero physical depreciation (brand new)',
        'Functional obsolescence from design should be zero if well-designed',
        'External obsolescence still possible from market/location',
        'Entrepreneurial profit/incentive added to cost',
      ],
      pitfalls: [
        'Applying physical depreciation to new improvements',
        'Using actual construction cost without verifying market cost',
        'Not including entrepreneurial profit in total cost',
        'Ignoring external obsolescence even for new construction',
      ],
      uspap: 'Cost estimates must reflect market-based replacement cost new.',
      tips: [
        'Entrepreneurial profit typically 10-20% for development risk',
        'Verify construction costs against current bid climate',
        'External obsolescence can still affect value even if building is new',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // AS STABILIZED SCENARIO
  // ---------------------------------------------------------------------------
  'As Stabilized': {
    hbu: {
      context: 'Analyze the property assuming it has achieved stabilized occupancy with market-level rents and typical vacancy rates.',
      assumptions: [
        'Property has reached stabilized occupancy (typically 90-95%)',
        'Rents are at market levels for the property type',
        'Operating expenses reflect stabilized operations',
        'Management is professional and competent',
      ],
      pitfalls: [
        'Assuming stabilization without defining the timeline',
        'Using unrealistic stabilized occupancy assumptions',
        'Not accounting for time and costs to reach stabilization',
        'Confusing stabilized value with current value',
      ],
      uspap: 'Prospective value requires clear disclosure of assumptions and effective date.',
      tips: [
        'Define stabilized occupancy (typically 90-95% for most property types)',
        'Document expected timeline to achieve stabilization',
        'Clearly distinguish from As Is and As Completed values',
      ],
    },
    land: {
      context: 'Land value remains consistent with other scenarios. Stabilization status affects improvements, not underlying land.',
      assumptions: [
        'Land value is unchanged from As Is analysis',
        'Same entitlements and development potential',
        'Land contributes equally across all scenarios',
      ],
      pitfalls: [
        'Inadvertently changing land value between scenarios',
        'Not maintaining consistency in land valuation approach',
      ],
      uspap: 'Consistency in land value allocation across scenarios must be maintained.',
      tips: [
        'Carry forward the same land value from As Is scenario',
        'Ensure reconciliation accounts for consistent land treatment',
      ],
    },
    market: {
      context: 'Analyze market conditions at the prospective stabilization date, which may be 1-3 years into the future.',
      assumptions: [
        'Market projections extend to stabilization date',
        'Supply/demand balance at time of stabilization',
        'Rent growth and expense escalation factored in',
        'Economic conditions support stabilization assumptions',
      ],
      pitfalls: [
        'Projecting too far into the future with false precision',
        'Not considering competitive supply at stabilization',
        'Assuming linear rent growth without market support',
        'Ignoring potential economic cycle impacts',
      ],
      uspap: 'Market projections must be reasonable and supportable.',
      tips: [
        'Limit projections to reasonable timeframes (typically 2-3 years max)',
        'Use escalation factors from market evidence',
        'Identify key risks to achieving projected stabilization',
      ],
    },
    sales: {
      context: 'Compare to stabilized, occupied properties with similar tenant profiles. Value reflects income stream from market-level occupancy.',
      assumptions: [
        'Comparables are stabilized, occupied properties',
        'Market rents and typical vacancy rates apply',
        'No lease-up risk in subject or comparables',
        'Buyer would pay premium for stabilized asset',
      ],
      pitfalls: [
        'Using vacant or lease-up comparable sales',
        'Not adjusting for differences in tenant quality/credit',
        'Ignoring WALT (weighted average lease term) differences',
        'Applying below-market lease adjustments incorrectly',
      ],
      uspap: 'Comparable sales must reflect similar risk profiles and income characteristics.',
      tips: [
        'Focus on comparable sales with similar occupancy profiles',
        'Analyze price per SF and implied cap rates',
        'Consider adjustments for credit tenant concentrations',
      ],
    },
    income: {
      context: 'Apply market rents, market vacancy (typically 5-10%), and stabilized operating expenses to derive NOI for capitalization.',
      assumptions: [
        'Market-level rents throughout (no below-market leases)',
        'Stabilized vacancy of 5-10% depending on property type',
        'Operating expenses at market levels',
        'No lease-up costs or absorption period',
      ],
      pitfalls: [
        'Using below-market contract rents in stabilized analysis',
        'Applying zero vacancy to stabilized scenario',
        'Not escalating expenses to stabilization date',
        'Using cap rates from different risk profiles',
      ],
      uspap: 'Income capitalization must use appropriate, market-supported rates.',
      tips: [
        'Stabilized vacancy: 5% office, 5-7% retail, 5-10% industrial',
        'Use market rent, not in-place rent, for stabilized analysis',
        'Cap rates should reflect stabilized, low-risk investments',
      ],
    },
    cost: {
      context: 'Add soft costs for lease-up period including absorption time, leasing commissions, tenant improvements, and carrying costs.',
      assumptions: [
        'Physical depreciation minimal for new construction',
        'Add lease-up costs to reach stabilization',
        'Include broker commissions and tenant improvements',
        'Carrying costs during absorption period',
      ],
      pitfalls: [
        'Treating As Stabilized same as As Completed in cost approach',
        'Not adding soft costs to reach stabilization',
        'Using same value for As Completed and As Stabilized',
        'Ignoring the time value of money during lease-up',
      ],
      uspap: 'All costs to achieve stabilization must be accounted for.',
      tips: [
        'Leasing commissions: 4-6% of aggregate lease value',
        'Tenant improvements: varies by property type and tenant',
        'Carrying costs: debt service + expenses during lease-up',
        'Marketing costs: typically 1-3% of project value',
      ],
    },
  },
};

// =============================================================================
// COMPONENT-SPECIFIC GUIDANCE (for optional components)
// =============================================================================

export interface ComponentGuidance {
  title: string;
  whyUseThis: string;
  whenRequired: string[];
  whenOptional: string[];
  alternativeApproaches: string;
  bankTip: string;
}

export const COMPONENT_GUIDANCE: Record<string, ComponentGuidance> = {
  rentComparables: {
    title: 'Rent Comparable Analysis',
    whyUseThis: 'Comparing rental rates from similar properties establishes market rent support. This is critical when contract rents differ from market, when projecting stabilized income, or when the subject has significant vacancy.',
    whenRequired: [
      'As Stabilized scenarios - must support projected rents',
      'When contract rent differs from market by more than 10%',
      'New construction or repositioned properties',
      'When lender specifically requests rent comparables',
    ],
    whenOptional: [
      'Fully stabilized properties with at-market leases',
      'Properties with long-term credit tenants',
      'When rent roll alone provides sufficient support',
    ],
    alternativeApproaches: 'If formal rent comparables are not available, you can reference published market surveys (CoStar, CBRE MarketView) in narrative form. However, a formal grid provides stronger support.',
    bankTip: 'Lenders prefer seeing 3-5 rent comparables with clear adjustments. This demonstrates thorough market research and supports your stabilized rent assumptions.',
  },
  
  expenseComparables: {
    title: 'Expense Comparable Analysis',
    whyUseThis: 'Operating expense comparables validate your expense assumptions against similar properties. This is especially important when the subject\'s actual expenses appear unusually high or low.',
    whenRequired: [
      'When subject has less than 3 years operating history',
      'When expenses deviate significantly from market norms',
      'New construction without stabilized expenses',
      'Properties under new management',
    ],
    whenOptional: [
      'Stabilized properties with consistent historical expenses',
      'When using published expense surveys (BOMA, IREM)',
      'Owner-occupied properties',
    ],
    alternativeApproaches: 'Reference published expense surveys (BOMA Experience Exchange, IREM Income/Expense Analysis) in your narrative. You can also use a simple expense ratio comparison without a formal grid.',
    bankTip: 'Banks appreciate expense due diligence. Even if you do not use a formal grid, mentioning how the subject\'s expense ratio compares to market benchmarks strengthens your analysis.',
  },
  
  capRateExtraction: {
    title: 'Cap Rate Extraction from Sales',
    whyUseThis: 'Extracting cap rates from comparable sales provides market-derived support for your capitalization rate selection. This is more defensible than relying solely on published surveys.',
    whenRequired: [
      'All Income Approach valuations using Direct Capitalization',
      'When cap rate selection significantly impacts value',
      'Unique property types without published cap rate data',
    ],
    whenOptional: [
      'When using investor surveys as primary cap rate support',
      'Properties valued primarily by DCF',
    ],
    alternativeApproaches: 'Cite investor surveys (PwC Real Estate Investor Survey, RealtyRates), broker opinions, or band-of-investment analysis. However, extracted cap rates from actual sales are the gold standard.',
    bankTip: 'Reviewers want to see cap rate support from actual transactions when possible. Even 2-3 sales with extracted cap rates adds significant credibility.',
  },
  
  dcfProjection: {
    title: 'Discounted Cash Flow Projection',
    whyUseThis: 'A year-by-year DCF shows the complete cash flow projection, making your assumptions transparent and allowing reviewers to understand how value is derived over the holding period.',
    whenRequired: [
      'Properties with significant lease rollover during holding period',
      'Value-add or repositioning plays',
      'When lender requires DCF methodology',
      'Complex rent structures (steps, CPI adjustments)',
    ],
    whenOptional: [
      'Stabilized properties with long-term leases',
      'When Direct Cap is the primary method',
      'Simple single-tenant properties',
    ],
    alternativeApproaches: 'A simplified DCF showing inputs and outputs (without year-by-year detail) is acceptable for straightforward properties. Our system calculates the math either way.',
    bankTip: 'Construction lenders and sophisticated investors often require full DCF schedules. Showing the year-by-year projection demonstrates thorough analysis and allows them to adjust assumptions if needed.',
  },
  
  marketAnalysis: {
    title: 'Market Analysis Dashboard',
    whyUseThis: 'A comprehensive market analysis section demonstrates understanding of supply/demand dynamics, rent trends, and investment market conditions that support your valuation conclusions.',
    whenRequired: [
      'All commercial appraisals - USPAP requires market analysis',
      'Properties in markets experiencing rapid change',
      'When comparable data is limited - market context is essential',
    ],
    whenOptional: [
      'Updating a previous appraisal with minimal market changes',
      'Simple residential properties in stable markets',
    ],
    alternativeApproaches: 'At minimum, include narrative discussion of market conditions. A quantitative dashboard with metrics adds depth and professionalism.',
    bankTip: 'Loan reviewers look for evidence that you understand the market. Including vacancy rates, absorption data, and rent/sale trends shows you have done your due diligence.',
  },
  
  landSalesGrid: {
    title: 'Land Comparable Sales Analysis',
    whyUseThis: 'Land value support is essential for the Cost Approach and for understanding land-to-building ratios. A formal land sales grid provides documented support for land value conclusions.',
    whenRequired: [
      'All Cost Approach valuations of improved properties',
      'Land-only appraisals',
      'Subdivision or development analyses',
      'When allocation of value is required',
    ],
    whenOptional: [
      'Income-producing properties where land allocation is not critical',
      'When using extraction method as primary land value support',
    ],
    alternativeApproaches: 'Extraction from improved sales or allocation based on typical land-to-value ratios can supplement direct land sales analysis.',
    bankTip: 'Land value support strengthens Cost Approach credibility. Include at least 3-4 land sales with clear adjustments.',
  },
};

/**
 * Get component-specific guidance
 */
export function getComponentGuidance(componentId: string): ComponentGuidance | null {
  return COMPONENT_GUIDANCE[componentId] || null;
}

// =============================================================================
// DEFAULT/FALLBACK GUIDANCE
// =============================================================================

export const DEFAULT_GUIDANCE: GuidanceContent = {
  context: 'Complete this section based on the selected approach methodology and applicable USPAP requirements.',
  assumptions: [
    'All assumptions should be clearly stated and supportable',
    'Market conditions as of the effective date apply',
    'Standard appraiser competency requirements met',
  ],
  pitfalls: [
    'Ensure all required analyses are completed',
    'Document all data sources and verification methods',
    'Maintain consistency throughout the report',
  ],
  uspap: 'Adhere to USPAP Standards Rules applicable to this approach and assignment type.',
  tips: [
    'Review checklist to ensure completeness',
    'Cross-reference values between approaches for reasonableness',
    'Document rationale for all conclusions',
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get guidance content for a specific scenario and approach combination.
 * Falls back to default guidance if the combination is not defined.
 */
export function getGuidance(scenarioName: string, approachId: string): GuidanceContent {
  const scenarioGuidance = GUIDANCE_CONTENT[scenarioName];
  if (!scenarioGuidance) {
    return DEFAULT_GUIDANCE;
  }
  
  const approachGuidance = scenarioGuidance[approachId];
  if (!approachGuidance) {
    return DEFAULT_GUIDANCE;
  }
  
  return approachGuidance;
}

/**
 * Check if guidance exists for a specific scenario/approach combination.
 */
export function hasGuidance(scenarioName: string, approachId: string): boolean {
  return Boolean(GUIDANCE_CONTENT[scenarioName]?.[approachId]);
}

/**
 * Get all approach IDs that have guidance for a given scenario.
 */
export function getApproachesWithGuidance(scenarioName: string): string[] {
  const scenarioGuidance = GUIDANCE_CONTENT[scenarioName];
  if (!scenarioGuidance) return [];
  return Object.keys(scenarioGuidance);
}

