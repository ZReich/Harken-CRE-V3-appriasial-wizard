// =================================================================
// COMPLETION SCHEMA - Defines what "complete" means for each section
// =================================================================

export type CelebrationLevel = 'none' | 'small' | 'medium' | 'large' | 'grand' | 'finale';
export type AnimationType = 'none' | 'gears' | 'home' | 'chart' | 'fireworks' | 'cascade';

export interface TabSchema {
  id: string;
  label: string;
  requiredFields: string[];  // Dot-notation paths into WizardState
  weight?: number;           // Relative importance (default 1)
}

export interface SectionSchema {
  id: string;
  path: string;
  label: string;
  celebrationLevel: CelebrationLevel;
  animationType: AnimationType;
  animationDuration: number;  // in seconds
  tabs: TabSchema[];
  trackProgress: boolean;     // Whether to show progress indicators
}

export const COMPLETION_SCHEMA: SectionSchema[] = [
  {
    id: 'template',
    path: '/template',
    label: 'Template',
    celebrationLevel: 'none',
    animationType: 'none',
    animationDuration: 0,
    trackProgress: false,
    tabs: []
  },
  {
    id: 'documents',
    path: '/document-intake',
    label: 'Documents',
    celebrationLevel: 'none',
    animationType: 'none',
    animationDuration: 0,
    trackProgress: false,
    tabs: []
  },
  {
    id: 'setup',
    path: '/setup',
    label: 'Setup',
    celebrationLevel: 'small',
    animationType: 'gears',
    animationDuration: 2,
    trackProgress: true,
    tabs: [
      // Assignment Basics - DYNAMIC: scenario effective dates are counted dynamically in getTabCompletion
      // Static fields: address (5), report/inspection dates (2), property type/subtype (2), status fields (4) = 13 static + dynamic scenarios
      { id: 'basics', label: 'Assignment Basics', requiredFields: [
        // Address fields (5)
        'subjectData.address.street',
        'subjectData.address.city',
        'subjectData.address.state',
        'subjectData.address.zip',
        'subjectData.address.county',
        // Key dates - report and inspection only (2) - scenario effective dates are dynamic
        'subjectData.reportDate',
        'subjectData.inspectionDate',
        // Property type selection (2)
        'propertyType',
        'propertySubtype',
        // Property status section (4) - includes conditional fields that appear based on selections
        'subjectData.propertyStatus',
        'subjectData.loanPurpose',
        'subjectData.plannedChanges',
        'subjectData.occupancyStatus'
        // NOTE: Scenario effective dates (scenarios[n].effectiveDate) are handled dynamically
      ], weight: 3 },
      // Purpose & Scope: value type, property interest, intended users (3 fields)
      { id: 'purpose', label: 'Purpose & Scope', requiredFields: [
        'subjectData.appraisalPurpose',
        'subjectData.propertyInterest',
        'subjectData.intendedUsers'
      ], weight: 2 },
      // Property ID: property name, tax ID and legal description
      { id: 'property', label: 'Property ID', requiredFields: [
        'subjectData.propertyName',
        'subjectData.taxId',
        'subjectData.legalDescription'
      ], weight: 2 },
      // Inspection: inspector name and inspection type
      // Inspection: inspectionType always visible, inspectorName only when personalInspection=false
      { id: 'inspection', label: 'Inspection', requiredFields: [
        'subjectData.inspectionType',
        'subjectData.inspectorName'  // Conditional: only required when personalInspection=false
      ], weight: 1 },
      // Certifications: owner name required
      { id: 'certifications', label: 'Certifications', requiredFields: [
        'subjectData.certificationAcknowledged',
        'subjectData.licenseNumber'
      ], weight: 1 }
    ]
  },
  {
    id: 'subjectData',
    path: '/subject-data',
    label: 'Subject Data',
    celebrationLevel: 'medium',
    animationType: 'home',
    animationDuration: 2.5,
    trackProgress: true,
    tabs: [
      // Location: requires county and area description
      { id: 'location', label: 'Location & Area', requiredFields: [
        'subjectData.address.county',
        'subjectData.areaDescription'
      ], weight: 1 },
      // Site: requires site area, zoning, and legal description
      { id: 'site', label: 'Site Details', requiredFields: [
        'subjectData.siteArea',
        'subjectData.zoningClass',
        'subjectData.legalDescription'
      ], weight: 2 },
      // Improvements: at least one building with year built
      { id: 'improvements', label: 'Improvements', requiredFields: [
        'improvementsInventory.parcels[0].buildings[0].yearBuilt'
      ], weight: 2 },
      // Demographics: requires demographics data to be loaded
      { id: 'demographics', label: 'Demographics', requiredFields: [
        'demographicsData.radiusAnalysis[0]'
      ], weight: 1 },
      // Tax: requires transaction history (USPAP 3-year requirement)
      { id: 'tax', label: 'Tax & Ownership', requiredFields: [
        'subjectData.transactionHistory',
        'owners[0].name'
      ], weight: 2 },
      // Photos & Exhibits are optional - no required fields (will show as not tracked)
      { id: 'photos', label: 'Photos & Maps', requiredFields: [], weight: 1 },
      { id: 'exhibits', label: 'Exhibits & Docs', requiredFields: [], weight: 1 }
    ]
  },
  {
    id: 'analysis',
    path: '/analysis',
    label: 'Analysis',
    celebrationLevel: 'grand',  // When ALL scenarios complete
    animationType: 'fireworks',
    animationDuration: 4,
    trackProgress: true,
    tabs: []  // Dynamic based on selected approaches per scenario
  },
  {
    id: 'review',
    path: '/review',
    label: 'Review',
    celebrationLevel: 'finale',
    animationType: 'cascade',
    animationDuration: 5,
    trackProgress: true,
    tabs: [
      // Checklist: just needs to be visited (no specific fields)
      { id: 'checklist', label: 'Completion Checklist', requiredFields: [], weight: 1 },
      // Reconciliation: requires exposure period and comments
      { id: 'reconciliation', label: 'Value Reconciliation', requiredFields: ['reconciliationData.exposurePeriod'], weight: 2 },
      // Preview: optional - no required fields
      { id: 'preview', label: 'Report Preview', requiredFields: [], weight: 1 }
    ]
  }
];

// =================================================================
// SCENARIO CELEBRATION CONFIG (within Analysis)
// =================================================================

export interface ScenarioCelebrationConfig {
  celebrationLevel: 'medium';
  animationType: 'chart';
  animationDuration: number;
}

export const SCENARIO_CELEBRATION_CONFIG: ScenarioCelebrationConfig = {
  celebrationLevel: 'medium',
  animationType: 'chart',
  animationDuration: 2,
};

// =================================================================
// CELEBRATION MESSAGES
// =================================================================

export const CELEBRATION_MESSAGES: Record<string, { title: string; subtitle: string }> = {
  setup: {
    title: 'Setup Complete!',
    subtitle: 'Your assignment is configured and ready.',
  },
  subjectData: {
    title: 'Subject Data Complete!',
    subtitle: 'Property information captured successfully.',
  },
  analysis: {
    title: 'All Valuations Complete!',
    subtitle: "You've done the hard work. Time to finalize!",
  },
  review: {
    title: 'Report Ready!',
    subtitle: 'Congratulations on completing the appraisal!',
  },
};

export const getScenarioCelebrationMessage = (scenarioName: string) => ({
  title: `${scenarioName} Scenario Complete!`,
  subtitle: 'All approaches have value conclusions.',
});

// =================================================================
// HELPER FUNCTIONS
// =================================================================

export function getSectionSchema(sectionId: string): SectionSchema | undefined {
  return COMPLETION_SCHEMA.find(s => s.id === sectionId);
}

export function getSectionByPath(path: string): SectionSchema | undefined {
  return COMPLETION_SCHEMA.find(s => s.path === path);
}

export function getTabSchema(sectionId: string, tabId: string): TabSchema | undefined {
  const section = getSectionSchema(sectionId);
  return section?.tabs.find(t => t.id === tabId);
}

export function shouldTrackProgress(sectionId: string): boolean {
  const section = getSectionSchema(sectionId);
  return section?.trackProgress ?? false;
}

export function hasCelebration(sectionId: string): boolean {
  const section = getSectionSchema(sectionId);
  return section?.celebrationLevel !== 'none';
}

