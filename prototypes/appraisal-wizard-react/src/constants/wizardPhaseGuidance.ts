/**
 * Comprehensive guidance content for all wizard phases.
 * Each section provides context-specific information to help appraisers
 * understand requirements, best practices, and USPAP compliance.
 */

export interface SectionGuidance {
  title: string;
  context: string;
  tips: string[];
  mistakes: string[];
  uspap: {
    reference: string;      // Short reference (e.g., "SR 1-2(e)")
    title: string;          // Full title of the standard
    summary: string;        // Brief description shown in guidance panel
  } | null;
}

export interface PhaseGuidance {
  [sectionId: string]: SectionGuidance;
}

// =============================================================================
// DOCUMENTS PHASE GUIDANCE
// =============================================================================

export const DOCUMENTS_GUIDANCE: PhaseGuidance = {
  overview: {
    title: 'Document Intake',
    context: 'Upload source documents to automatically extract property details, client information, and financial data. AI-powered extraction pre-populates fields throughout the wizard, reducing manual data entry and errors.',
    tips: [
      'Upload the clearest, most legible copies of documents available',
      'Review extracted data for accuracy before accepting',
      'You can skip this step and enter data manually if preferred',
      'Documents can be uploaded at any time during the appraisal process',
    ],
    mistakes: [
      'Accepting extracted data without verification',
      'Uploading low-quality scans that reduce extraction accuracy',
      'Forgetting to include all relevant lease agreements or amendments',
    ],
    uspap: {
      reference: 'SR 1-2(e)',
      title: 'Standards Rule 1-2(e) - Workfile Documentation',
      summary: 'Maintain complete workfile documentation of all data sources.',
    },
  },
  cadastral: {
    title: 'Cadastral / County Records',
    context: 'County records provide authoritative property identification including legal description, tax ID, ownership, and land area. These form the foundation of accurate property identification.',
    tips: [
      'Verify the legal description matches current deed records',
      'Cross-reference tax ID with county assessor database',
      'Note any discrepancies between recorded and actual land area',
      'Document the source and date of all county records',
    ],
    mistakes: [
      'Using outdated county records without verification',
      'Not checking for recent ownership transfers',
      'Ignoring discrepancies between different data sources',
    ],
    uspap: {
      reference: 'SR 1-4(a)',
      title: 'Standards Rule 1-4(a) - Data Collection',
      summary: 'Collect and verify data from reliable sources to develop credible results.',
    },
  },
  engagement: {
    title: 'Engagement Letter',
    context: 'The engagement letter establishes the scope of work, identifies the client and intended users, and defines the appraisal assignment. It is a critical document for USPAP compliance.',
    tips: [
      'Confirm client name matches exactly as it should appear in the report',
      'Verify the intended use and intended users are clearly stated',
      'Document any extraordinary assumptions or hypothetical conditions',
      'Note any assignment conditions that limit scope of work',
    ],
    mistakes: [
      'Proceeding without a written engagement letter',
      'Not clarifying ambiguous scope of work terms',
      'Accepting assignments with inappropriate limiting conditions',
    ],
    uspap: {
      reference: 'SR 1-2(a-c)',
      title: 'Standards Rule 1-2 - Assignment Elements',
      summary: 'Identify client, intended users, and intended use of the appraisal.',
    },
  },
  sale: {
    title: 'Buy/Sale Agreement',
    context: 'Purchase agreements reveal transaction terms, sale price, and conditions that may affect the property\'s value. Understanding the pending transaction helps identify any unusual conditions.',
    tips: [
      'Note any seller concessions, credits, or personal property included',
      'Identify if the transaction is arms-length or related party',
      'Document financing terms that may affect price',
      'Look for contingencies that could affect closing',
    ],
    mistakes: [
      'Not disclosing pending sale in the report',
      'Failing to analyze whether sale price reflects market value',
      'Overlooking non-realty items included in purchase price',
    ],
    uspap: {
      reference: 'SR 1-5(a)',
      title: 'Standards Rule 1-5(a) - Contract Analysis',
      summary: 'Analyze any current agreement of sale, option, or listing.',
    },
  },
  lease: {
    title: 'Lease Agreements',
    context: 'Lease documents establish contractual rent, terms, and tenant obligations. For income-producing properties, leases are essential for understanding the leased fee interest value.',
    tips: [
      'Extract key terms: base rent, escalations, expense reimbursements',
      'Note lease commencement, expiration, and renewal options',
      'Identify any unusual lease provisions affecting value',
      'Document tenant improvement allowances and free rent periods',
    ],
    mistakes: [
      'Using lease abstracts without reviewing actual lease documents',
      'Not accounting for all lease modifications and amendments',
      'Overlooking expense stops and CAM reconciliation terms',
    ],
    uspap: {
      reference: 'SR 1-4(b)(iii)',
      title: 'Standards Rule 1-4(b)(iii) - Lease Analysis',
      summary: 'Analyze current lease agreements affecting the property.',
    },
  },
  rentroll: {
    title: 'Rent Roll',
    context: 'The rent roll provides a snapshot of current occupancy, rental income, and tenant information. It is essential for income approach analysis and understanding property performance.',
    tips: [
      'Verify rent roll date matches or is close to effective date',
      'Cross-reference with lease agreements for accuracy',
      'Note any vacant units and market rent potential',
      'Identify below-market or above-market rents',
    ],
    mistakes: [
      'Using outdated rent rolls without adjustment',
      'Not reconciling rent roll totals with operating statements',
      'Ignoring tenant credit quality considerations',
    ],
    uspap: {
      reference: 'SR 1-4(b)(ii)',
      title: 'Standards Rule 1-4(b)(ii) - Income Analysis',
      summary: 'Analyze and reconcile actual and potential income from the property.',
    },
  },
};

// =============================================================================
// SETUP PHASE GUIDANCE
// =============================================================================

export const SETUP_GUIDANCE: PhaseGuidance = {
  basics: {
    title: 'Assignment Basics',
    context: 'Define the fundamental assignment parameters including property type, location, key dates, and valuation scenarios. These selections drive the analysis framework throughout the wizard.',
    tips: [
      'Effective date should match inspection date for current value assignments',
      'Select all applicable valuation scenarios upfront to ensure proper analysis',
      'Property type selection determines which approaches are most relevant',
      'Document any prospective dates for As Completed/Stabilized scenarios',
    ],
    mistakes: [
      'Using report date instead of inspection date as effective date',
      'Missing required scenarios for construction/development properties',
      'Not matching property type to actual subject characteristics',
    ],
    uspap: {
      reference: 'SR 1-2(d)',
      title: 'Standards Rule 1-2(d) - Effective Date',
      summary: 'Identify the effective date of the appraisal and date of the report.',
    },
  },
  purpose: {
    title: 'Purpose & Scope',
    context: 'Define what type of value is being estimated, which property interest is appraised, and who will use the appraisal. These elements shape the entire analysis approach.',
    tips: [
      'Market Value is appropriate for most lending assignments',
      'Fee Simple is most common; use Leased Fee when leases are in place',
      'Be specific about intended users - this limits who can rely on the report',
      'Document any extraordinary assumptions or hypothetical conditions',
    ],
    mistakes: [
      'Confusing purpose (type of value) with intended use (how it will be used)',
      'Not specifying property interest when leases affect value',
      'Expanding intended users beyond those identified in engagement',
    ],
    uspap: {
      reference: 'SR 1-2(b)',
      title: 'Standards Rule 1-2(b) - Intended Use',
      summary: 'Identify the intended use and intended users of the appraisal.',
    },
  },
  property: {
    title: 'Property Identification',
    context: 'Completely and accurately identify the subject property including legal description, ownership, and tax information. Proper identification prevents confusion and supports credibility.',
    tips: [
      'Verify legal description matches current deed records',
      'Include all parcels if property consists of multiple tax lots',
      'Document ownership as of the effective date',
      'Note any recent ownership changes within 3 years',
    ],
    mistakes: [
      'Using abbreviated legal descriptions that could cause confusion',
      'Not verifying ownership with current title records',
      'Omitting parcels that are part of the property being appraised',
    ],
    uspap: {
      reference: 'SR 2-2(a)(iii)',
      title: 'Standards Rule 2-2(a)(iii) - Property Identification',
      summary: 'Identify the real estate by legal description and address.',
    },
  },
  inspection: {
    title: 'Inspection',
    context: 'Document the property inspection including type, date, and who performed it. USPAP requires disclosure of the extent of inspection and any assistance received.',
    tips: [
      'Interior and exterior inspection provides most complete information',
      'Document any areas not accessible during inspection',
      'Note the weather and conditions during inspection',
      'Disclose if another party assisted with or performed the inspection',
    ],
    mistakes: [
      'Not disclosing when inspection was performed by someone other than the appraiser',
      'Failing to note areas that were not inspected',
      'Using prior inspection data without disclosure and update',
    ],
    uspap: {
      reference: 'SR 2-2(a)(vii)',
      title: 'Standards Rule 2-2(a)(vii) - Inspection Disclosure',
      summary: 'Disclose the extent of property inspection performed.',
    },
  },
  certifications: {
    title: 'Certifications',
    context: 'USPAP requires specific certification statements in every appraisal report. These certifications affirm the appraiser\'s independence, competency, and compliance with standards.',
    tips: [
      'Review all required certification elements before signing',
      'Disclose any prior services for the property within 3 years',
      'Include state license number and expiration date',
      'Add client-required certifications as needed',
    ],
    mistakes: [
      'Omitting required certification elements',
      'Not disclosing prior services or interests in the property',
      'Using outdated certification language',
    ],
    uspap: {
      reference: 'SR 2-3',
      title: 'Standards Rule 2-3 - Certification',
      summary: 'Include all required certification elements in the appraisal report.',
    },
  },
};

// =============================================================================
// SUBJECT DATA PHASE GUIDANCE
// =============================================================================

export const SUBJECT_DATA_GUIDANCE: PhaseGuidance = {
  location: {
    title: 'Location & Area',
    context: 'Describe the regional, city, and neighborhood context for the subject property. Location analysis establishes the market area and identifies factors influencing property values.',
    tips: [
      'Use specific geographic boundaries to define the neighborhood',
      'Identify major employment centers and economic drivers',
      'Note transportation access and commute patterns',
      'Document neighborhood life cycle stage and trends',
    ],
    mistakes: [
      'Defining neighborhood too broadly or narrowly for the property type',
      'Not updating area descriptions for current market conditions',
      'Ignoring negative location factors that affect value',
    ],
    uspap: {
      reference: 'SR 1-3(a)',
      title: 'Standards Rule 1-3(a) - Market Area Analysis',
      summary: 'Analyze market area and subject property characteristics.',
    },
  },
  site: {
    title: 'Site Details',
    context: 'Document the physical characteristics of the land including size, shape, topography, utilities, zoning, and any encumbrances. Site analysis supports highest and best use conclusions.',
    tips: [
      'Verify site size from multiple sources (survey, tax records, deed)',
      'Document all utility availability and adequacy',
      'Note any easements, encroachments, or deed restrictions',
      'Identify flood zone from current FEMA maps',
    ],
    mistakes: [
      'Not verifying zoning compliance for current use',
      'Overlooking easements that could affect development potential',
      'Using outdated flood zone information',
    ],
    uspap: {
      reference: 'SR 1-3(a)',
      title: 'Standards Rule 1-3(a) - Physical Characteristics',
      summary: 'Analyze relevant physical characteristics of the property.',
    },
  },
  improvements: {
    title: 'Improvements',
    context: 'Describe all improvements on the site including buildings, structures, and site improvements. Accurate improvement description supports cost approach and depreciation analysis.',
    tips: [
      'Measure or verify building dimensions during inspection',
      'Document construction quality, materials, and condition',
      'Note any deferred maintenance or needed repairs',
      'Identify functional obsolescence in layout or design',
    ],
    mistakes: [
      'Relying solely on public records for building size without verification',
      'Not adequately describing condition and quality',
      'Overlooking non-conforming or unpermitted improvements',
    ],
    uspap: {
      reference: 'SR 1-3(a)',
      title: 'Standards Rule 1-3(a) - Improvement Analysis',
      summary: 'Analyze relevant characteristics of the improvements.',
    },
  },
  tax: {
    title: 'Tax & Ownership',
    context: 'Document property tax information, assessed values, and ownership history. USPAP requires analysis of prior sales within 3 years of the effective date.',
    tips: [
      'Include current tax amount and assessment breakdown',
      'Research and document all sales within 3 years',
      'Note any pending tax appeals or reassessments',
      'Document current listings or offers on the property',
    ],
    mistakes: [
      'Not researching sales history beyond readily available data',
      'Failing to analyze and explain prior sales',
      'Overlooking current listing or pending contract',
    ],
    uspap: {
      reference: 'SR 1-5(b)',
      title: 'Standards Rule 1-5(b) - Prior Sales Analysis',
      summary: 'Analyze prior sales of the subject within 3 years.',
    },
  },
  photos: {
    title: 'Photos & Maps',
    context: 'Property photographs and maps provide visual documentation of the subject and surrounding area. Quality photos support credibility and help readers understand the property.',
    tips: [
      'Include photos of all building elevations',
      'Document any physical deficiencies or deferred maintenance',
      'Include interior photos of representative spaces',
      'Provide maps showing location and comparable locations',
    ],
    mistakes: [
      'Using photos from a prior inspection without disclosure',
      'Not photographing negative features that affect value',
      'Providing insufficient photos to document property condition',
    ],
    uspap: {
      reference: 'SR 2-2(a)(x)',
      title: 'Standards Rule 2-2(a)(x) - Exhibits',
      summary: 'Include sufficient information to support conclusions.',
    },
  },
  exhibits: {
    title: 'Exhibits & Documents',
    context: 'Supporting exhibits and documents provide evidence for conclusions in the report. Select exhibits that support your analysis without overwhelming the reader.',
    tips: [
      'Include exhibits that directly support your conclusions',
      'Ensure all exhibits are legible and properly formatted',
      'Reference exhibits in the narrative where applicable',
      'Consider what a reader needs to understand your analysis',
    ],
    mistakes: [
      'Including excessive exhibits that obscure key information',
      'Not including critical supporting documentation',
      'Using exhibits without proper source attribution',
    ],
    uspap: {
      reference: 'SR 2-2(a)(x)',
      title: 'Standards Rule 2-2(a)(x) - Supporting Information',
      summary: 'Include information necessary to support the analysis and conclusions.',
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export type WizardPhase = 'documents' | 'setup' | 'subjectData';

const PHASE_GUIDANCE_MAP: Record<WizardPhase, PhaseGuidance> = {
  documents: DOCUMENTS_GUIDANCE,
  setup: SETUP_GUIDANCE,
  subjectData: SUBJECT_DATA_GUIDANCE,
};

/**
 * Get guidance content for a specific phase and section.
 */
export function getPhaseGuidance(phase: WizardPhase, sectionId: string): SectionGuidance | null {
  const phaseGuidance = PHASE_GUIDANCE_MAP[phase];
  if (!phaseGuidance) return null;
  return phaseGuidance[sectionId] || null;
}

/**
 * Get all guidance for a specific phase.
 */
export function getAllPhaseGuidance(phase: WizardPhase): PhaseGuidance {
  return PHASE_GUIDANCE_MAP[phase] || {};
}

