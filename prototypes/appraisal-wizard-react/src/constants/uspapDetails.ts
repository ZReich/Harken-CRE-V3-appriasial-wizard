/**
 * Full USPAP explanations for detailed modal popups.
 * Each entry provides comprehensive information about a specific standard rule.
 */

export interface USPAPDetail {
  reference: string;           // Short reference (e.g., "SR 1-2(e)")
  title: string;               // Full title
  type: 'Standards Rule' | 'Advisory Opinion' | 'Ethics Rule' | 'Competency Rule' | 'Scope of Work';
  officialText: string;        // Actual USPAP standard language
  explanation: string;         // Plain-language explanation
  compliance: string[];        // How to comply in practice
  relatedStandards: string[];  // Related standard references
  edition: string;             // USPAP edition year
}

export const uspapDetails: Record<string, USPAPDetail> = {
  // =============================================================================
  // STANDARDS RULE 1 - REAL PROPERTY APPRAISAL, DEVELOPMENT
  // =============================================================================
  
  'SR 1-2(a-c)': {
    reference: 'SR 1-2(a-c)',
    title: 'Assignment Elements',
    type: 'Standards Rule',
    officialText: `In developing a real property appraisal, an appraiser must: (a) identify the client and any intended users; (b) identify the intended use of the appraiser's opinions and conclusions; (c) identify the type and definition of value and, if the value opinion to be developed is market value, ascertain whether the value is to be the most probable price...`,
    explanation: 'This rule requires appraisers to clearly establish WHO the appraisal is for, WHAT it will be used for, and WHAT type of value is being estimated before beginning any analysis. These elements form the foundation of the assignment and affect all subsequent decisions.',
    compliance: [
      'Document the client name as it appears in the engagement letter',
      'List all intended users by name or class (e.g., "ABC Bank and its assigns")',
      'State the intended use specifically (e.g., "for loan underwriting purposes")',
      'Define the type of value and its definition if not market value',
    ],
    relatedStandards: ['SR 1-1(a)', 'SR 2-2(a)(i)', 'SR 2-2(a)(ii)'],
    edition: '2024-2025',
  },

  'SR 1-2(d)': {
    reference: 'SR 1-2(d)',
    title: 'Effective Date',
    type: 'Standards Rule',
    officialText: `In developing a real property appraisal, an appraiser must: (d) identify the effective date of the appraiser's opinions and conclusions;`,
    explanation: 'The effective date is the "as of" date for the value opinion. It establishes the point in time for which market conditions, property characteristics, and all analysis applies. This is distinct from the inspection date or report date.',
    compliance: [
      'For current value assignments, effective date is typically the inspection date',
      'For retrospective appraisals, use the historical date specified',
      'For prospective values (As Completed, As Stabilized), use the projected future date',
      'Always clearly state the effective date in the report',
    ],
    relatedStandards: ['SR 1-5(a)', 'SR 2-2(a)(iv)'],
    edition: '2024-2025',
  },

  'SR 1-2(e)': {
    reference: 'SR 1-2(e)',
    title: 'Property Characteristics',
    type: 'Standards Rule',
    officialText: `In developing a real property appraisal, an appraiser must: (e) identify the characteristics of the property that are relevant to the type and definition of value and intended use of the appraisal, including: (i) its location and physical, legal, and economic characteristics; (ii) the real property interest to be valued; (iii) any personal property, trade fixtures, or intangible items that are not real property but are included in the appraisal...`,
    explanation: 'This rule requires complete identification and documentation of all property characteristics that affect value. The appraiser must analyze physical, legal, and economic attributes relevant to the assignment.',
    compliance: [
      'Document location and physical characteristics thoroughly',
      'Identify and analyze legal characteristics (zoning, easements, restrictions)',
      'Consider economic characteristics affecting value',
      'Clearly identify the real property interest being valued',
    ],
    relatedStandards: ['SR 1-4(a)', 'SR 2-2(a)(x)'],
    edition: '2024-2025',
  },

  'SR 1-2(b)': {
    reference: 'SR 1-2(b)',
    title: 'Intended Use and Users',
    type: 'Standards Rule',
    officialText: `In developing a real property appraisal, an appraiser must: (b) identify the intended use of the appraiser's opinions and conclusions;`,
    explanation: 'The intended use defines HOW the appraisal will be utilized. This is different from the purpose (type of value). The intended use affects the scope of work and level of detail required.',
    compliance: [
      'Document the specific use (e.g., "mortgage lending", "estate settlement")',
      'Ensure scope of work is appropriate for the intended use',
      'Do not expand the intended use beyond what was agreed with the client',
      'Clearly state intended use in the report certification',
    ],
    relatedStandards: ['SR 1-2(a)', 'Scope of Work Rule'],
    edition: '2024-2025',
  },

  // =============================================================================
  // STANDARDS RULE 1-3 - MARKET ANALYSIS
  // =============================================================================

  'SR 1-3(a)': {
    reference: 'SR 1-3(a)',
    title: 'Market Area Analysis',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results in developing a real property appraisal, an appraiser must: (a) analyze regional, market area, and subject property characteristics;`,
    explanation: 'This rule requires analysis of the subject property within its market context. The appraiser must understand how regional and local factors influence property values and how the subject compares to the competition.',
    compliance: [
      'Define and analyze the relevant market area for the property type',
      'Identify supply and demand factors affecting values',
      'Analyze neighborhood characteristics and trends',
      'Document how the subject compares to competing properties',
    ],
    relatedStandards: ['SR 1-3(b)', 'SR 1-4(a)'],
    edition: '2024-2025',
  },

  'SR 1-3(b)': {
    reference: 'SR 1-3(b)',
    title: 'Current Market Conditions',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results in developing a real property appraisal, an appraiser must: (b) analyze current market conditions and any reasonably probable changes, to the extent that they affect the subject property value as of the effective date;`,
    explanation: 'For current value opinions, this requires analysis of market conditions as of the effective date. The appraiser should consider trends and any anticipated changes that would affect a buyer or seller\'s decision.',
    compliance: [
      'Research current market conditions for the property type',
      'Analyze recent sales trends and pricing changes',
      'Consider supply and demand dynamics',
      'Note any pending changes that affect value',
    ],
    relatedStandards: ['SR 1-3(a)', 'SR 1-6(a)'],
    edition: '2024-2025',
  },

  // =============================================================================
  // STANDARDS RULE 1-4 - DATA COLLECTION AND ANALYSIS
  // =============================================================================

  'SR 1-4(a)': {
    reference: 'SR 1-4(a)',
    title: 'Property Inspection',
    type: 'Standards Rule',
    officialText: `When developing a real property appraisal, an appraiser must collect, verify, and analyze all information necessary for credible assignment results, including: (a) information about the physical characteristics of the property.`,
    explanation: 'You must gather and verify physical information about the property. Inspection is the primary method, but the scope depends on the assignment. Document what you observed and any limiting conditions.',
    compliance: [
      'Conduct the appropriate level of inspection for the assignment',
      'Document physical characteristics observed during inspection',
      'Note any areas that were not accessible for inspection',
      'Verify physical data with public records when possible',
    ],
    relatedStandards: ['SR 1-2(g)', 'SR 2-2(a)(x)', 'Advisory Opinion 2'],
    edition: '2024-2025',
  },

  'SR 1-4(b)(ii)': {
    reference: 'SR 1-4(b)(ii)',
    title: 'Income Analysis',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results when developing an opinion of the value of a leased fee or leasehold estate, an appraiser must analyze the effect on value, if any, of: (ii) the actual and potential income and expenses;`,
    explanation: 'For income-producing properties, this requires analysis of both actual (contract) income and potential (market) income. Understanding the difference is essential for proper income approach application.',
    compliance: [
      'Obtain and analyze current rent roll',
      'Compare contract rents to market rents',
      'Research market vacancy and collection loss',
      'Analyze historical and projected operating expenses',
    ],
    relatedStandards: ['SR 1-4(b)(i)', 'SR 1-4(b)(iii)'],
    edition: '2024-2025',
  },

  'SR 1-4(b)(iii)': {
    reference: 'SR 1-4(b)(iii)',
    title: 'Lease Analysis',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results when developing an opinion of the value of a leased fee or leasehold estate, an appraiser must analyze the effect on value, if any, of: (iii) the terms and conditions of any leases;`,
    explanation: 'Lease terms directly affect property value. This rule requires thorough analysis of all lease provisions that could influence income, risk, or marketability.',
    compliance: [
      'Review actual lease documents, not just abstracts',
      'Analyze rent escalation clauses and renewal options',
      'Consider expense reimbursement structures',
      'Evaluate tenant credit quality and lease security',
    ],
    relatedStandards: ['SR 1-4(b)(ii)', 'SR 1-6(b)'],
    edition: '2024-2025',
  },

  // =============================================================================
  // STANDARDS RULE 1-5 - SALES AND CONTRACT ANALYSIS
  // =============================================================================

  'SR 1-5(a)': {
    reference: 'SR 1-5(a)',
    title: 'Contract Analysis',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results, an appraiser must: (a) analyze any current agreement of sale, option, or listing of the subject property;`,
    explanation: 'If the subject property is under contract, listed for sale, or subject to an option, this must be analyzed and considered in the valuation. This provides important market evidence about the property.',
    compliance: [
      'Obtain and review any current purchase agreement',
      'Analyze listing history and days on market',
      'Compare contract/listing price to concluded value',
      'Explain any significant differences',
    ],
    relatedStandards: ['SR 1-5(b)', 'SR 2-2(a)(ix)'],
    edition: '2024-2025',
  },

  'SR 1-5(b)': {
    reference: 'SR 1-5(b)',
    title: 'Prior Sales Analysis',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results, an appraiser must: (b) analyze any prior sales of the subject property that occurred within the three (3) years prior to the effective date of the appraisal;`,
    explanation: 'This rule requires research and analysis of any sales of the subject property within 3 years. Prior sales provide important value evidence and must be explained in the report.',
    compliance: [
      'Research all transfers of the subject within 3 years',
      'Analyze the circumstances of each sale',
      'Compare prior sale prices to current value conclusion',
      'Document non-arms-length transactions',
    ],
    relatedStandards: ['SR 1-5(a)', 'SR 2-2(a)(ix)'],
    edition: '2024-2025',
  },

  // =============================================================================
  // STANDARDS RULE 1-6 - VALUATION APPROACHES
  // =============================================================================

  'SR 1-6(a)': {
    reference: 'SR 1-6(a)',
    title: 'Sales Comparison Approach',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results, an appraiser must develop an opinion of the value by use of: (a) the sales comparison approach, which shall include collection of data from all appropriate sources and analysis of comparable sale data;`,
    explanation: 'The Sales Comparison Approach compares the subject to similar properties that have sold. It reflects how buyers and sellers actually behave in the market and is considered the most reliable approach for most property types.',
    compliance: [
      'Search all appropriate data sources for comparable sales',
      'Select comparables with similar physical, locational, and economic characteristics',
      'Make adjustments for differences from the subject',
      'Reconcile the adjusted sale prices to a value conclusion',
    ],
    relatedStandards: ['SR 1-6(b)', 'SR 1-6(c)'],
    edition: '2024-2025',
  },

  'SR 1-6(b)': {
    reference: 'SR 1-6(b)',
    title: 'Income Approach',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results, an appraiser must develop an opinion of the value by use of: (b) the income approach, which shall include analysis of operating expenses, vacancy and collection loss, reserves, income capitalization methods, and projected income;`,
    explanation: 'The Income Approach estimates value based on the income a property can generate. It is essential for investment properties and reflects how investors make decisions based on expected returns.',
    compliance: [
      'Analyze income and expenses based on market data',
      'Apply appropriate vacancy and collection loss allowances',
      'Select and support capitalization rates or discount rates',
      'Apply appropriate income capitalization method',
    ],
    relatedStandards: ['SR 1-6(a)', 'SR 1-6(c)'],
    edition: '2024-2025',
  },

  'SR 1-6(c)': {
    reference: 'SR 1-6(c)',
    title: 'Cost Approach',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results, an appraiser must develop an opinion of the value by use of: (c) the cost approach, which shall include an estimate of land value, improvement cost new, and depreciation from all sources;`,
    explanation: 'The Cost Approach estimates value by calculating what it would cost to replace or reproduce the improvements, less depreciation, plus land value. It is most reliable for new or special-purpose properties.',
    compliance: [
      'Estimate land value using comparable sales analysis',
      'Estimate cost new using appropriate cost sources',
      'Analyze and extract depreciation from all sources',
      'Add land value to depreciated improvement value',
    ],
    relatedStandards: ['SR 1-6(a)', 'SR 1-6(b)'],
    edition: '2024-2025',
  },

  // =============================================================================
  // STANDARDS RULE 2 - REPORTING
  // =============================================================================

  'SR 2-2(a)(iii)': {
    reference: 'SR 2-2(a)(iii)',
    title: 'Property Identification',
    type: 'Standards Rule',
    officialText: `Each written real property appraisal report must: (iii) identify the real estate by address or legal description, or both, and identify the real property interest appraised;`,
    explanation: 'The subject property must be identified clearly enough that there is no confusion about what is being appraised. This includes both the physical real estate and the property rights being valued.',
    compliance: [
      'Include complete street address',
      'Provide legal description from deed or title',
      'Identify the property interest (fee simple, leased fee, etc.)',
      'Note if multiple parcels are included',
    ],
    relatedStandards: ['SR 1-2(e)', 'SR 2-2(a)(iv)'],
    edition: '2024-2025',
  },

  'SR 2-2(a)(vii)': {
    reference: 'SR 2-2(a)(vii)',
    title: 'Scope of Work Disclosure',
    type: 'Standards Rule',
    officialText: `Each written real property appraisal report must: (vii) describe the scope of work used to develop the appraisal;`,
    explanation: 'The report must clearly disclose the extent of property inspection, including who inspected, what was inspected, and any limitations. This helps intended users understand the basis for conclusions.',
    compliance: [
      'State the date and type of inspection (interior/exterior/none)',
      'Disclose who performed the inspection',
      'Note any areas not inspected and why',
      'Describe any limitations on the inspection',
    ],
    relatedStandards: ['Scope of Work Rule', 'SR 2-2(a)(viii)'],
    edition: '2024-2025',
  },

  'SR 2-2(a)(x)': {
    reference: 'SR 2-2(a)(x)',
    title: 'Supporting Information',
    type: 'Standards Rule',
    officialText: `Each written real property appraisal report must: (x) provide sufficient information to enable the intended users of the appraisal to understand the report properly;`,
    explanation: 'The report must contain enough information and exhibits to allow intended users to understand the analysis and conclusions. The level of detail should match the complexity of the assignment.',
    compliance: [
      'Include sufficient photographs to document condition',
      'Provide maps showing subject and comparable locations',
      'Include relevant exhibits that support conclusions',
      'Ensure all exhibits are legible and properly labeled',
    ],
    relatedStandards: ['SR 2-2(a)(viii)', 'Scope of Work Rule'],
    edition: '2024-2025',
  },

  'SR 2-3': {
    reference: 'SR 2-3',
    title: 'Certification Requirements',
    type: 'Standards Rule',
    officialText: `Each written real property appraisal report must contain a signed certification that is similar in content to the following: I certify that, to the best of my knowledge and belief: the statements of fact contained in this report are true and correct; the reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions...`,
    explanation: 'USPAP requires specific certification statements in every appraisal report. These certifications affirm the appraiser\'s independence, competency, compliance with standards, and disclosure of any prior services.',
    compliance: [
      'Include all required certification elements',
      'Disclose any prior services for the property within 3 years',
      'State whether you personally inspected the property',
      'Sign and date the certification',
    ],
    relatedStandards: ['Ethics Rule', 'Competency Rule'],
    edition: '2024-2025',
  },

  // =============================================================================
  // DOCUMENT INTAKE STANDARDS
  // =============================================================================

  'Record Keeping': {
    reference: 'Record Keeping',
    title: 'Workfile Requirements',
    type: 'Standards Rule',
    officialText: `An appraiser must prepare a workfile for each appraisal assignment. A workfile must be in existence prior to the issuance of any written or oral appraisal report.`,
    explanation: 'USPAP requires maintaining a complete workfile with all data, analyses, and supporting documentation used in the appraisal. This ensures reproducibility and supports the credibility of your conclusions.',
    compliance: [
      'Organize all source documents by category',
      'Retain copies of engagement letters and contracts',
      'Document data sources and verification methods',
      'Preserve workfile for at least 5 years (or as required by law)',
    ],
    relatedStandards: ['SR 1-2(e)', 'Ethics Rule'],
    edition: '2024-2025',
  },

  'Scope of Work': {
    reference: 'Scope of Work',
    title: 'Scope of Work Rule',
    type: 'Scope of Work',
    officialText: `For each appraisal engagement, an appraiser must: identify the problem to be solved; determine and perform the scope of work necessary to develop credible assignment results; disclose the scope of work in the report.`,
    explanation: 'The scope of work must be appropriate for the assignment. It defines what data you will collect, what analysis you will perform, and what approaches you will apply. The scope must lead to credible results.',
    compliance: [
      'Define the scope based on assignment requirements',
      'Document the scope of work in the report',
      'Ensure scope is sufficient for credible results',
      'Note any extraordinary assumptions or limiting conditions',
    ],
    relatedStandards: ['SR 1-2(f)', 'SR 2-2(a)(vii)'],
    edition: '2024-2025',
  },

  'Ethics Rule': {
    reference: 'Ethics Rule',
    title: 'Ethics and Conduct',
    type: 'Ethics Rule',
    officialText: `An appraiser must perform assignments with impartiality, objectivity, and independence, and without accommodation of personal interests. An appraiser must not accept an assignment that includes the reporting of predetermined opinions and conclusions.`,
    explanation: 'Appraisers must maintain objectivity and avoid conflicts of interest. This includes disclosing any current or prior relationships with the property or parties, and refusing assignments where independence is compromised.',
    compliance: [
      'Disclose any prior services for the subject property',
      'Disclose any relationships with parties to the transaction',
      'Do not accept contingent compensation',
      'Maintain objectivity throughout the assignment',
    ],
    relatedStandards: ['Competency Rule', 'SR 2-3'],
    edition: '2024-2025',
  },

  'Competency Rule': {
    reference: 'Competency Rule',
    title: 'Competency Requirements',
    type: 'Competency Rule',
    officialText: `An appraiser must: be competent to perform the assignment; acquire the necessary competency to perform the assignment; or decline or withdraw from the assignment. Competency requires: geographic competency, property type competency, and assignment type competency.`,
    explanation: 'Before accepting an assignment, you must ensure you have the knowledge and experience needed, or take steps to acquire competency (such as additional research or associating with a competent appraiser).',
    compliance: [
      'Evaluate your competency before accepting assignments',
      'Document steps taken to acquire competency when needed',
      'Disclose in the report any lack of competency and steps taken',
      'Consider geographic and property type experience',
    ],
    relatedStandards: ['Ethics Rule', 'SR 2-3'],
    edition: '2024-2025',
  },

  // =============================================================================
  // SITE AND IMPROVEMENTS
  // =============================================================================

  'SR 1-4(a-i)': {
    reference: 'SR 1-4(a-i)',
    title: 'Physical Characteristics',
    type: 'Standards Rule',
    officialText: `When developing a real property appraisal, an appraiser must collect, verify, and analyze all information necessary for credible assignment results, including: (a) information about the physical characteristics of the property.`,
    explanation: 'Document all physical characteristics that affect value including site characteristics (size, shape, topography, utilities) and improvement characteristics (size, quality, condition, functional utility).',
    compliance: [
      'Document site size, shape, and topography',
      'Note utility availability and access',
      'Describe building size, age, and construction quality',
      'Assess condition and identify any deferred maintenance',
    ],
    relatedStandards: ['SR 1-4(a)', 'SR 2-2(a)(x)'],
    edition: '2024-2025',
  },

  'SR 1-4(a-ii)': {
    reference: 'SR 1-4(a-ii)',
    title: 'Legal Characteristics',
    type: 'Standards Rule',
    officialText: `When developing a real property appraisal, an appraiser must collect, verify, and analyze all information necessary for credible assignment results, including legal characteristics such as: zoning, land use regulations, deed restrictions, and encumbrances.`,
    explanation: 'Legal characteristics can significantly impact value. Analyze zoning compliance, any variances or non-conformities, deed restrictions, and encumbrances that affect property rights or use.',
    compliance: [
      'Verify current zoning designation and compliance',
      'Document any variances or special permits',
      'Review deed restrictions and easements',
      'Consider impact of encumbrances on value',
    ],
    relatedStandards: ['SR 1-2(e)', 'SR 1-4(a)'],
    edition: '2024-2025',
  },

  // =============================================================================
  // TAX AND OWNERSHIP
  // =============================================================================

  'SR 1-5(b-c)': {
    reference: 'SR 1-5(b-c)',
    title: 'Prior Sales and Listings',
    type: 'Standards Rule',
    officialText: `When necessary for credible assignment results, an appraiser must: (b) analyze any prior sales of the subject property within three years; (c) analyze any current agreements of sale, options, or listings.`,
    explanation: 'Research the sale history and any current marketing of the subject property. This provides valuable market evidence and context for the current value opinion.',
    compliance: [
      'Research all transfers within the past 3 years',
      'Verify sale prices and terms from public records',
      'Analyze any current listing or contract',
      'Explain any significant differences from concluded value',
    ],
    relatedStandards: ['SR 1-5(a)', 'SR 2-2(a)(ix)'],
    edition: '2024-2025',
  },
};

/**
 * Get USPAP detail by reference.
 */
export function getUSPAPDetail(reference: string): USPAPDetail | null {
  return uspapDetails[reference] || null;
}

/**
 * Get all available USPAP references.
 */
export function getAllUSPAPReferences(): string[] {
  return Object.keys(uspapDetails);
}
