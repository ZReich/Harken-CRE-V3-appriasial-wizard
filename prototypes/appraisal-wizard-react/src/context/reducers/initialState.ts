// src/context/reducers/initialState.ts
// Extracted initial state creation from WizardContext

import type { WizardState } from '../../types';
import { createDefaultInventory } from '../../contracts/improvements';

/**
 * Creates the default wizard state structure.
 * This is the canonical shape of the wizard state.
 */
export function createDefaultState(): WizardState {
  return {
    template: null,
    propertyType: null,
    propertySubtype: null,
    msOccupancyCode: null,
    // Property Components (Mixed-Use Architecture)
    propertyComponents: [],
    activeComponentId: null,
    incomeApproachInstances: [],
    scenarioReconciliations: [],
    scenarios: [
      { id: 1, name: 'As Is', approaches: ['Sales Comparison'], effectiveDate: '', isRequired: true }
    ],
    activeScenarioId: 1,
    subjectData: {
      propertyName: '',
      address: { street: '', city: '', state: '', zip: '', county: '' },
      taxId: '',
      legalDescription: '',
      reportDate: '',
      inspectionDate: '',
      effectiveDate: '',
      lastSaleDate: '',
      lastSalePrice: '',
      transactionHistory: '',
      // Location & Area
      areaDescription: '',
      neighborhoodBoundaries: '',
      neighborhoodCharacteristics: '',
      specificLocation: '',
      // Site Details
      siteArea: '',
      siteAreaUnit: 'acres' as const,
      shape: '',
      frontage: '',
      topography: '',
      environmental: '',
      easements: '',
      zoningClass: '',
      zoningDescription: '',
      zoningConforming: false,
      // Utilities (expanded)
      waterSource: '',
      waterProvider: '',
      sewerType: '',
      electricProvider: '',
      naturalGas: '',
      telecom: '',
      // Storm Drainage & Fire Protection
      stormDrainage: '',
      stormDrainageNotes: '',
      fireHydrantDistance: '',
      // Access & Visibility
      approachType: '',
      accessQuality: '',
      visibility: '',
      truckAccess: '',
      // Site Improvements
      pavingType: '',
      fencingType: '',
      yardStorage: '',
      landscaping: '',
      // Flood Zone (enhanced)
      femaZone: '',
      femaMapPanel: '',
      femaMapDate: '',
      floodInsuranceRequired: '',
      // Site Description Narrative
      siteDescriptionNarrative: '',
      // Purpose & Scope
      appraisalPurpose: '',
      intendedUsers: '',
      propertyInterest: '',
      // Inspection
      inspectorName: '',
      inspectorLicense: '',
      inspectionType: 'interior_exterior',
      personalInspection: true,
      // Certifications
      certificationAcknowledged: false,
      licenseNumber: '',
      licenseState: '',
      licenseExpiration: '',
      additionalCertifications: '',
      appraisalAssistance: '',
      // Assignment Context
      propertyStatus: undefined,
      occupancyStatus: undefined,
      plannedChanges: undefined,
      loanPurpose: undefined,
      // Coordinates
      coordinates: undefined,
      // Cadastral data
      cadastralData: undefined,
    },
    improvementsInventory: createDefaultInventory(),
    siteImprovements: [],
    costApproachBuildingSelections: {},
    costApproachBuildingCostData: {},
    extractedData: {},
    uploadedDocuments: [],
    documentFieldSources: {},
    fieldSuggestions: {},
    acceptedFields: {},
    owners: [
      { id: 'owner_1', name: '', ownershipType: 'individual', percentage: 100 }
    ],
    incomeApproachData: null,
    analysisConclusions: { conclusions: [] },
    reconciliationData: null,
    stagingPhotos: [],
    // Maps
    subjectMaps: [],
    approachMaps: {},
    currentPage: 'template',
    subjectActiveTab: 'location',
    isFullscreen: false,
    // Progress Tracking
    pageTabs: {},
    sectionCompletedAt: {},
    scenarioCompletions: [],
    allScenariosCompletedAt: null,
    celebration: {
      isVisible: false,
      sectionId: null,
      scenarioId: null,
      level: 'none' as const,
    },
    lastModified: new Date().toISOString(),
  };
}

/**
 * Helper to clean corrupted address fields (e.g., "Bozeman, Bozeman, Bozeman" -> "Bozeman")
 */
function cleanAddressField(value: string | undefined): string {
  if (!value) return '';
  // If the field contains commas, it might be corrupted with repeated values
  if (value.includes(',')) {
    const parts = value.split(',').map(p => p.trim()).filter(Boolean);
    const uniqueParts = [...new Set(parts)];
    // If all parts were the same, return just one; otherwise keep original
    if (uniqueParts.length === 1) {
      return uniqueParts[0];
    }
  }
  return value;
}

/**
 * Loads stored state from localStorage and merges with defaults.
 * Handles reset parameter to clear all stored data.
 * Includes migration logic for legacy data formats.
 */
export function getInitialState(): WizardState {
  const defaultState = createDefaultState();

  // Check for reset parameter (clears all stored data)
  if (typeof window !== 'undefined' && window.location.search.includes('reset=1')) {
    localStorage.removeItem('harken_wizard_react');
    sessionStorage.removeItem('harken_extracted_data');
    // Redirect without reset param to avoid infinite loop
    window.history.replaceState({}, '', window.location.pathname);
    return defaultState;
  }

  // Try to load from localStorage and merge with defaults
  const stored = localStorage.getItem('harken_wizard_react');
  if (stored) {
    try {
      const parsedState = JSON.parse(stored);

      // MIGRATION: Fix legacy fieldSuggestions (object -> array)
      // This prevents "fieldSuggestions.some is not a function" errors when users have old data
      if (parsedState.fieldSuggestions) {
        Object.keys(parsedState.fieldSuggestions).forEach(key => {
          const val = parsedState.fieldSuggestions[key];
          if (val && !Array.isArray(val)) {
            console.log(`[WizardContext] Migrating legacy fieldSuggestion for ${key} to array`);
            // Wrap legacy object in array
            parsedState.fieldSuggestions[key] = [val];
          }
        });
      }

      const storedAddress = parsedState.subjectData?.address || {};
      const cleanedAddress = {
        ...defaultState.subjectData.address,
        ...storedAddress,
        // Clean potentially corrupted city field
        city: cleanAddressField(storedAddress.city),
      };

      return {
        ...defaultState,
        ...parsedState,
        // Deep merge subject data to preserve new fields
        subjectData: {
          ...defaultState.subjectData,
          ...(parsedState.subjectData || {}),
          address: cleanedAddress,
          // Preserve coordinates from storage
          coordinates: parsedState.subjectData?.coordinates || undefined,
          // Preserve cadastralData from storage
          cadastralData: parsedState.subjectData?.cadastralData || undefined,
        },
        celebration: {
          ...defaultState.celebration,
          ...(parsedState.celebration || {}),
        },
        // Preserve documentFieldSources from storage
        documentFieldSources: parsedState.documentFieldSources || {},
        // Preserve field suggestions from storage
        fieldSuggestions: parsedState.fieldSuggestions || {},
        acceptedFields: parsedState.acceptedFields || {},
        // Preserve property components from storage (Mixed-Use Architecture)
        propertyComponents: parsedState.propertyComponents || [],
        activeComponentId: parsedState.activeComponentId || null,
        incomeApproachInstances: parsedState.incomeApproachInstances || [],
        scenarioReconciliations: parsedState.scenarioReconciliations || [],
      };
    } catch (e) {
      console.warn('Failed to parse stored wizard state');
    }
  }

  return defaultState;
}
