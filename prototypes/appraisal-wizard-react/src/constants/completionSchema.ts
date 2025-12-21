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
      { id: 'basics', label: 'Assignment Basics', requiredFields: ['propertyType', 'subjectData.address.street'], weight: 2 },
      { id: 'purpose', label: 'Purpose & Scope', requiredFields: ['scenarios[0].effectiveDate'], weight: 2 },
      { id: 'property', label: 'Property ID', requiredFields: ['subjectData.taxId'], weight: 1 },
      { id: 'inspection', label: 'Inspection', requiredFields: [], weight: 1 },
      { id: 'certifications', label: 'Certifications', requiredFields: [], weight: 1 }
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
      { id: 'location', label: 'Location & Area', requiredFields: [], weight: 1 },
      { id: 'site', label: 'Site Details', requiredFields: [], weight: 1 },
      { id: 'improvements', label: 'Improvements', requiredFields: ['improvementsInventory.parcels[0].parcelNumber'], weight: 2 },
      { id: 'tax', label: 'Tax & Ownership', requiredFields: ['subjectData.transactionHistory'], weight: 1 },
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
      { id: 'checklist', label: 'Completion Checklist', requiredFields: [], weight: 1 },
      { id: 'reconciliation', label: 'Value Reconciliation', requiredFields: [], weight: 2 },
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

