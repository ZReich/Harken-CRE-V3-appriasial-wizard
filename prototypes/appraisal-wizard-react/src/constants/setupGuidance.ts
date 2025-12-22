/**
 * Guidance content for the Setup phase of the appraisal wizard.
 * Uses the unified SectionGuidance interface from wizardPhaseGuidance.
 */

import { type SectionGuidance } from './wizardPhaseGuidance';

// =============================================================================
// SETUP TAB GUIDANCE (using unified interface)
// =============================================================================

export const SETUP_GUIDANCE: Record<string, SectionGuidance> = {
  basics: {
    title: 'Assignment Basics',
    context: 'This section establishes the fundamental parameters of your appraisal assignment: property type, current status, and required valuation scenarios. Your selections here automatically configure the appropriate approaches and ensure compliance with USPAP and Interagency Guidelines.',
    tips: [
      'Select property type before status - this determines available subtypes and default approaches',
      'Property status automatically triggers required scenarios (e.g., construction properties need As Is + As Completed + As Stabilized)',
      'Each scenario should have its own effective date that makes sense for that value premise',
      'Review the auto-configured scenarios before adding custom ones',
    ],
    mistakes: [
      'Selecting wrong property type (e.g., choosing "Residential" for a 6-unit apartment)',
      'Missing required scenarios for construction/development loans',
      'Using the same effective date for all scenarios when prospective dates are needed',
      'Adding unnecessary scenarios that don\'t serve the assignment purpose',
    ],
    uspap: {
      reference: 'SR 1-2(d)',
      title: 'Effective Date',
      summary: 'Identify effective dates and property characteristics for each valuation scenario',
    },
  },
  purpose: {
    title: 'Purpose & Scope',
    context: 'Define what type of value you\'re estimating (Market Value, Insurable Value, etc.) and the property interest being appraised (Fee Simple, Leased Fee, etc.). These selections fundamentally affect your analysis methodology and conclusions.',
    tips: [
      'Market Value is appropriate for most lending assignments',
      'Use the client\'s value definition if they provided one in the engagement letter',
      'Leased Fee is appropriate when existing leases affect property value',
      'Clearly identify all intended users - this affects your liability',
    ],
    mistakes: [
      'Using "Market Value" when a specialized definition is required',
      'Confusing Fee Simple with Leased Fee for income properties',
      'Omitting intended users required by the assignment',
      'Not matching value type to the assignment\'s intended use',
    ],
    uspap: {
      reference: 'SR 1-2(b)',
      title: 'Intended Use and Users',
      summary: 'Identify property interest and type of value being estimated',
    },
  },
  property: {
    title: 'Property Identification',
    context: 'Provide complete identification of the subject property including legal description, ownership, and transaction history. USPAP requires disclosure of all sales and transfers within 3 years of the effective date.',
    tips: [
      'Verify legal description matches current deed records',
      'Include all parcels if property consists of multiple tax lots',
      'Document all ownership transfers, not just sales',
      'Note any listings, pending sales, or offers on the property',
    ],
    mistakes: [
      'Using outdated legal descriptions that don\'t reflect lot splits or combinations',
      'Missing ownership transfers that weren\'t arms-length sales',
      'Not verifying owner names against title records',
      'Incomplete transaction history documentation',
    ],
    uspap: {
      reference: 'SR 2-2(a)(iii)',
      title: 'Property Identification',
      summary: 'Identify the real estate by legal description and address',
    },
  },
  inspection: {
    title: 'Inspection Details',
    context: 'Document the property inspection including type (interior/exterior/desktop), date, and who performed it. USPAP requires disclosure of significant professional assistance and whether you personally inspected the property.',
    tips: [
      'Match inspection type to assignment scope (desktop vs. full inspection)',
      'Document date of inspection - this often sets the effective date',
      'If using contract appraisers, disclose their role and credentials',
      'Note any areas that couldn\'t be accessed during inspection',
    ],
    mistakes: [
      'Not disclosing significant assistance from others',
      'Claiming personal inspection when only exterior was viewed',
      'Missing documentation of inaccessible areas',
      'Inconsistent inspection dates across report sections',
    ],
    uspap: {
      reference: 'SR 1-4(a)',
      title: 'Property Inspection',
      summary: 'Collect and verify property information through inspection',
    },
  },
  certifications: {
    title: 'Certifications',
    context: 'USPAP requires specific certification statements in every appraisal report. This section ensures you understand and acknowledge these requirements, and allows you to add any additional certifications required for this assignment.',
    tips: [
      'Read each certification statement carefully before acknowledging',
      'Add client-required certifications to the additional section',
      'Ensure license information is current and matches your state records',
      'Check expiration dates - an expired license invalidates the appraisal',
    ],
    mistakes: [
      'Signing certifications without reading them',
      'Missing state-specific certification requirements',
      'Using expired license information',
      'Omitting required third-party certifications',
    ],
    uspap: {
      reference: 'SR 2-3',
      title: 'Certification Requirements',
      summary: 'Include all required certification elements in the report',
    },
  },
};

// Helper function to get guidance for a section
export function getSetupGuidance(sectionId: string): SectionGuidance | null {
  return SETUP_GUIDANCE[sectionId] || null;
}
