/**
 * Guidance content for the Setup phase of the appraisal wizard.
 * This is a PREVIEW/DEMO file - will be expanded to cover all wizard phases.
 */

import { GuidanceSectionContent } from '../components/WizardGuidancePanel';
import { USPAPDetail } from '../components/USPAPDetailModal';

// =============================================================================
// USPAP DETAIL CONTENT
// =============================================================================

const USPAP_DETAILS: Record<string, USPAPDetail> = {
  'SR-1-1': {
    id: 'SR-1-1',
    reference: 'SR 1-1',
    title: 'Real Property Appraisal Development - General Requirements',
    category: 'standards-rule',
    fullText: 'In developing a real property appraisal, an appraiser must: (a) be aware of, understand, and correctly employ those recognized methods and techniques that are necessary to produce a credible appraisal; (b) not commit a substantial error of omission or commission that significantly affects an appraisal; (c) not render appraisal services in a careless or negligent manner.',
    plainLanguage: 'This is the foundation of competent appraisal practice. It requires you to know what you\'re doing, not make major mistakes, and take your work seriously. Every decision you make in this wizard should reflect professional competence.',
    howToComply: [
      'Select the appropriate property type that matches the subject',
      'Choose valuation approaches that are recognized for this property type',
      'Document your reasoning for each selection you make',
      'If uncertain about any selection, research before proceeding',
    ],
    relatedStandards: ['SR 1-2', 'SR 1-3', 'Ethics Rule - Competency'],
  },
  'SR-1-2-e': {
    id: 'SR-1-2-e',
    reference: 'SR 1-2(e)',
    title: 'Problem Identification - Type and Definition of Value',
    category: 'standards-rule',
    fullText: 'In developing a real property appraisal, an appraiser must: identify the problem to be solved, including... (e) the type and definition of value and its source.',
    plainLanguage: 'You must clearly state what type of value you\'re estimating (Market Value, Insurable Value, etc.) and use the correct definition. Different value types require different analysis approaches.',
    howToComply: [
      'Select the appropriate value type based on the assignment purpose',
      'Understand that "Market Value" has a specific legal definition',
      'If using a specialized value definition, cite the source',
      'Ensure the value type aligns with the client\'s intended use',
    ],
    relatedStandards: ['SR 1-2(a-d)', 'SR 2-2(a)(viii)', 'Definitions Section'],
  },
  'SR-1-2-d': {
    id: 'SR-1-2-d',
    reference: 'SR 1-2(d)',
    title: 'Problem Identification - Property Interest',
    category: 'standards-rule',
    fullText: 'In developing a real property appraisal, an appraiser must: identify the problem to be solved, including... (d) the interest to be appraised.',
    plainLanguage: 'You must identify whether you\'re appraising Fee Simple (full ownership), Leased Fee (landlord\'s interest), Leasehold (tenant\'s interest), or some other partial interest. This fundamentally affects value.',
    howToComply: [
      'Determine if the property has existing leases that affect the interest',
      'Fee Simple is appropriate when no leases encumber the property',
      'Leased Fee considers the landlord\'s rights under existing leases',
      'Document any assumptions about property interest clearly',
    ],
    relatedStandards: ['SR 1-2(e)', 'SR 1-4(a)', 'Definitions Section'],
  },
  'SR-1-2-c': {
    id: 'SR-1-2-c',
    reference: 'SR 1-2(c)',
    title: 'Problem Identification - Effective Date',
    category: 'standards-rule',
    fullText: 'In developing a real property appraisal, an appraiser must: identify the problem to be solved, including... (c) the effective date of the appraisal.',
    plainLanguage: 'The effective date is the "as of" date for your value opinion - the date to which your analysis applies. This is often the inspection date for current value, or a future date for prospective values.',
    howToComply: [
      'For "As Is" valuations, use the inspection date',
      'For "As Completed" scenarios, use the projected completion date',
      'For "As Stabilized" scenarios, use the projected stabilization date',
      'All market data must be analyzed as of this date',
    ],
    relatedStandards: ['SR 1-3(b)', 'SR 2-2(a)(viii)', 'Advisory Opinion 34'],
  },
  'SR-1-3-b': {
    id: 'SR-1-3-b',
    reference: 'SR 1-3(b)',
    title: 'Scope of Work - Market Conditions',
    category: 'standards-rule',
    fullText: 'When the value opinion to be developed is market value, an appraiser must, if such information is available to the appraiser in the normal course of business: (b) analyze such comparable sales data as are available to indicate a value conclusion.',
    plainLanguage: 'When appraising for market value, you must analyze relevant comparable sales. This standard ensures your conclusions are grounded in actual market evidence, not just theory.',
    howToComply: [
      'Research comparable sales in the subject market area',
      'Consider Sales Comparison Approach for most property types',
      'Document why you included or excluded potential comparables',
      'Adjust comparables for differences from the subject',
    ],
    relatedStandards: ['SR 1-4', 'SR 1-6', 'Advisory Opinion 1'],
  },
  'SR-2-3': {
    id: 'SR-2-3',
    reference: 'SR 2-3',
    title: 'Appraisal Report - Certification',
    category: 'standards-rule',
    fullText: 'Each written real property appraisal report must contain a certification that is similar in content to the following: I certify that, to the best of my knowledge and belief... [followed by specific certification statements]',
    plainLanguage: 'Every appraisal report must include a signed certification confirming your compliance with USPAP, disclosure of any assistance, statement about inspection, and other key professional commitments.',
    howToComply: [
      'Include all required certification statements in your report',
      'Disclose any significant professional assistance received',
      'State whether you personally inspected the property',
      'Sign and date the certification',
    ],
    relatedStandards: ['SR 2-2', 'Ethics Rule', 'Record Keeping Rule'],
  },
  'SR-1-4-a': {
    id: 'SR-1-4-a',
    reference: 'SR 1-4(a)',
    title: 'Property Inspection',
    category: 'standards-rule',
    fullText: 'When developing a real property appraisal, an appraiser must collect, verify, and analyze all information necessary for credible assignment results, including: (a) information about the physical characteristics of the property.',
    plainLanguage: 'You must gather and verify physical information about the property. Inspection is the primary method, but the scope depends on the assignment. Document what you observed and any limiting conditions.',
    howToComply: [
      'Conduct the appropriate level of inspection for the assignment',
      'Document physical characteristics observed during inspection',
      'Note any areas that were not accessible for inspection',
      'Verify physical data with public records when possible',
    ],
    relatedStandards: ['SR 1-2(g)', 'SR 2-2(a)(x)', 'Advisory Opinion 2'],
  },
  'INTERAGENCY': {
    id: 'INTERAGENCY',
    reference: 'Interagency Guidelines',
    title: 'Prospective Value Requirements',
    category: 'advisory',
    fullText: 'For transactions that involve the construction of improvements... the appraisal should provide a prospective market value "as completed" and an "as is" market value... For income-producing property, the appraisal should include a prospective market value "as stabilized."',
    plainLanguage: 'Federal banking regulators require multiple values for development/construction loans: As Is (current), As Completed (when finished), and As Stabilized (when leased up). This protects lenders by showing value at each stage.',
    howToComply: [
      'Include "As Is" value for all development projects',
      'Include "As Completed" value showing post-construction value',
      'Include "As Stabilized" for income properties not yet at stable occupancy',
      'Clearly label each scenario with its effective date',
    ],
    relatedStandards: ['SR 1-2(c)', 'Advisory Opinion 34', 'OCC Bulletin 2010-42'],
  },
};

// =============================================================================
// SETUP TAB GUIDANCE
// =============================================================================

export const SETUP_GUIDANCE: Record<string, GuidanceSectionContent> = {
  basics: {
    id: 'basics',
    title: 'Assignment Basics',
    context: 'This section establishes the fundamental parameters of your appraisal assignment: property type, current status, and required valuation scenarios. Your selections here automatically configure the appropriate approaches and ensure compliance with USPAP and Interagency Guidelines.',
    tips: [
      'Select property type before status - this determines available subtypes and default approaches',
      'Property status automatically triggers required scenarios (e.g., construction properties need As Is + As Completed + As Stabilized)',
      'Each scenario should have its own effective date that makes sense for that value premise',
      'Review the auto-configured scenarios before adding custom ones',
    ],
    commonMistakes: [
      'Selecting wrong property type (e.g., choosing "Residential" for a 6-unit apartment)',
      'Missing required scenarios for construction/development loans',
      'Using the same effective date for all scenarios when prospective dates are needed',
      'Adding unnecessary scenarios that don\'t serve the assignment purpose',
    ],
    uspap: {
      reference: 'SR 1-2(c)',
      brief: 'Identify effective dates and property characteristics',
      detail: USPAP_DETAILS['SR-1-2-c'],
    },
  },
  purpose: {
    id: 'purpose',
    title: 'Purpose & Scope',
    context: 'Define what type of value you\'re estimating (Market Value, Insurable Value, etc.) and the property interest being appraised (Fee Simple, Leased Fee, etc.). These selections fundamentally affect your analysis methodology and conclusions.',
    tips: [
      'Market Value is appropriate for most lending assignments',
      'Use the client\'s value definition if they provided one in the engagement letter',
      'Leased Fee is appropriate when existing leases affect property value',
      'Clearly identify all intended users - this affects your liability',
    ],
    commonMistakes: [
      'Using "Market Value" when a specialized definition is required',
      'Confusing Fee Simple with Leased Fee for income properties',
      'Omitting intended users required by the assignment',
      'Not matching value type to the assignment\'s intended use',
    ],
    uspap: {
      reference: 'SR 1-2(d-e)',
      brief: 'Identify property interest and type of value',
      detail: USPAP_DETAILS['SR-1-2-d'],
    },
  },
  property: {
    id: 'property',
    title: 'Property Identification',
    context: 'Provide complete identification of the subject property including legal description, ownership, and transaction history. USPAP requires disclosure of all sales and transfers within 3 years of the effective date.',
    tips: [
      'Verify legal description matches current deed records',
      'Include all parcels if property consists of multiple tax lots',
      'Document all ownership transfers, not just sales',
      'Note any listings, pending sales, or offers on the property',
    ],
    commonMistakes: [
      'Using outdated legal descriptions that don\'t reflect lot splits or combinations',
      'Missing ownership transfers that weren\'t arms-length sales',
      'Not verifying owner names against title records',
      'Incomplete transaction history documentation',
    ],
    uspap: {
      reference: 'SR 1-5(a)',
      brief: 'Analyze prior sales of subject within 3 years',
      detail: {
        id: 'SR-1-5-a',
        reference: 'SR 1-5(a)',
        title: 'Subject Property Analysis - Prior Sales',
        category: 'standards-rule',
        fullText: 'When developing a real property appraisal, an appraiser must analyze any current Agreement of Sale, option, or listing of the subject property and analyze any prior sales of the subject property that occurred within three (3) years for one to four residential property, and five (5) years for all other property types.',
        plainLanguage: 'You must research and analyze any recent sales, listings, or pending contracts on the subject property. This provides important context about market activity and can indicate unusual circumstances.',
        howToComply: [
          'Research all transfers within the required time period',
          'Document each transaction with date, price, and parties',
          'Analyze whether prior sales were arms-length transactions',
          'Explain any significant price changes between transactions',
        ],
        relatedStandards: ['SR 1-4(a)', 'SR 2-2(a)(viii)'],
      },
    },
  },
  inspection: {
    id: 'inspection',
    title: 'Inspection Details',
    context: 'Document the property inspection including type (interior/exterior/desktop), date, and who performed it. USPAP requires disclosure of significant professional assistance and whether you personally inspected the property.',
    tips: [
      'Match inspection type to assignment scope (desktop vs. full inspection)',
      'Document date of inspection - this often sets the effective date',
      'If using contract appraisers, disclose their role and credentials',
      'Note any areas that couldn\'t be accessed during inspection',
    ],
    commonMistakes: [
      'Not disclosing significant assistance from others',
      'Claiming personal inspection when only exterior was viewed',
      'Missing documentation of inaccessible areas',
      'Inconsistent inspection dates across report sections',
    ],
    uspap: {
      reference: 'SR 1-4(a)',
      brief: 'Collect and verify property information',
      detail: USPAP_DETAILS['SR-1-4-a'],
    },
  },
  certifications: {
    id: 'certifications',
    title: 'Certifications',
    context: 'USPAP requires specific certification statements in every appraisal report. This section ensures you understand and acknowledge these requirements, and allows you to add any additional certifications required for this assignment.',
    tips: [
      'Read each certification statement carefully before acknowledging',
      'Add client-required certifications to the additional section',
      'Ensure license information is current and matches your state records',
      'Check expiration dates - an expired license invalidates the appraisal',
    ],
    commonMistakes: [
      'Signing certifications without reading them',
      'Missing state-specific certification requirements',
      'Using expired license information',
      'Omitting required third-party certifications',
    ],
    uspap: {
      reference: 'SR 2-3',
      brief: 'Required certification content',
      detail: USPAP_DETAILS['SR-2-3'],
    },
  },
};

// Helper function to get guidance for a section
export function getSetupGuidance(sectionId: string): GuidanceSectionContent | null {
  return SETUP_GUIDANCE[sectionId] || null;
}

