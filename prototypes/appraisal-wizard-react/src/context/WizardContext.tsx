import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { WizardState, WizardAction, ImprovementsInventory, Owner, ExtractedData, UploadedDocument, IncomeApproachState, ReconciliationData, CelebrationState, SubjectData, PreviewEditsPayload, StagingPhoto, CoverPhotoData, SiteImprovement, CostApproachOverrides, ExtractedFieldSource, FieldSuggestion, FieldSuggestionSource, MapData, MapType } from '../types';
import { getSectionSchema } from '../constants/completionSchema';
import { getNestedValue, isFilled } from '../utils/stateHelpers';

// Import modular reducer and initial state
import { wizardReducer, getInitialState } from './reducers';

// =================================================================
// REDUCER & INITIAL STATE (Extracted to ./reducers/)
// See: ./reducers/index.ts for the modular reducer implementation
// =================================================================

// The reducer and initial state have been extracted to improve maintainability:
// - ./reducers/initialState.ts - State creation and localStorage persistence
// - ./reducers/coreSlice.ts - Template, property, improvements, owners
// - ./reducers/scenarioSlice.ts - Scenario management
// - ./reducers/documentSlice.ts - Document uploads and extraction
// - ./reducers/photoSlice.ts - Staging and cover photos
// - ./reducers/mapSlice.ts - Subject and approach maps
// - ./reducers/suggestionSlice.ts - Field suggestions (accept/reject)
// - ./reducers/progressSlice.ts - Progress tracking and celebrations
// - ./reducers/analysisSlice.ts - Analysis data (demographics, SWOT, etc.)

// NOTE: wizardReducer and getInitialState are now imported from './reducers'
// The legacy inline reducer has been removed to reduce file size.
// See the reducers/ directory for the modular implementation.

// =================================================================
// CONTEXT
// =================================================================

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;

  // Convenience helpers
  setTemplate: (template: string) => void;
  setPropertyType: (type: string, subtype?: string) => void;
  setImprovementsInventory: (inventory: ImprovementsInventory) => void;
  setMsOccupancyCode: (code: string | null) => void;
  setSiteImprovements: (improvements: SiteImprovement[]) => void;
  setCostApproachBuildingSelections: (scenarioId: number, buildingIds: string[]) => void;
  setCostApproachBuildingCostData: (scenarioId: number, buildingId: string, overrides: CostApproachOverrides | null) => void;
  toggleFullscreen: () => void;
  goToPage: (page: string) => void;

  // Scenario helpers
  getActiveScenario: () => import('../types').AppraisalScenario | undefined;
  setActiveScenario: (id: number) => void;
  setScenarios: (scenarios: import('../types').AppraisalScenario[]) => void;

  // Document extraction helpers
  setExtractedData: (slotId: string, data: ExtractedData) => void;
  getExtractedField: (slotId: string, field: string) => string | undefined;
  addUploadedDocument: (doc: UploadedDocument) => void;
  updateUploadedDocument: (id: string, updates: Partial<UploadedDocument>) => void;

  // Document field source tracking helpers
  applyDocumentExtractedData: (documentId: string, documentName: string, documentType: string, fields: Record<string, { value: string; confidence: number }>) => void;
  getFieldSource: (fieldPath: string) => ExtractedFieldSource | undefined;
  hasFieldSource: (fieldPath: string) => boolean;
  clearDocumentFieldSources: () => void;

  // Field suggestion helpers (Accept/Reject UI) - supports multiple suggestions per field
  addFieldSuggestion: (fieldPath: string, suggestion: Omit<FieldSuggestion, 'createdAt' | 'id'>) => void;
  acceptFieldSuggestion: (fieldPath: string, value: string, suggestionId?: string) => void;
  rejectFieldSuggestion: (fieldPath: string, suggestionId?: string) => void;
  getFieldSuggestions: (fieldPath: string) => FieldSuggestion[]; // Get all suggestions for a field
  getFieldSuggestion: (fieldPath: string) => FieldSuggestion | undefined; // Get first pending suggestion
  hasFieldSuggestion: (fieldPath: string) => boolean;
  hasPendingFieldSuggestion: (fieldPath: string) => boolean;
  getPendingSuggestionCount: (fieldPath: string) => number;
  isFieldAccepted: (fieldPath: string) => boolean;
  clearFieldSuggestions: () => void;

  // Subject data helpers
  setSubjectData: (data: Partial<SubjectData>) => void;
  getSubjectData: () => SubjectData;

  // Owner management helpers
  addOwner: () => void;
  updateOwner: (id: string, updates: Partial<Owner>) => void;
  removeOwner: (id: string) => void;

  // Income approach helpers
  setIncomeApproachData: (data: IncomeApproachState) => void;
  getIncomeApproachData: () => IncomeApproachState | null;

  // Analysis approach conclusion helpers
  setApproachConclusion: (scenarioId: number, approach: string, valueConclusion: number | null) => void;
  getApproachConclusion: (scenarioId: number, approach: string) => number | null;

  // Reconciliation helpers
  setReconciliationData: (data: ReconciliationData) => void;
  getReconciliationData: () => ReconciliationData | null;

  // Progress Tracking helpers
  setPageTab: (page: string, tab: string) => void;
  getTabCompletion: (sectionId: string, tabId: string) => number;
  getSectionCompletion: (sectionId: string) => number;
  getSmartInitialTab: (sectionId: string, defaultTab: string) => string;
  markSectionComplete: (sectionId: string) => void;

  // Celebration helpers
  showCelebration: (sectionId: string, level: CelebrationState['level'], scenarioId?: number) => void;
  hideCelebration: () => void;

  // Scenario completion helpers
  updateScenarioApproach: (scenarioId: number, approach: string, isComplete: boolean) => void;
  isScenarioComplete: (scenarioId: number) => boolean;
  areAllScenariosComplete: () => boolean;

  // Preview edit helpers
  applyPreviewEdits: (edits: PreviewEditsPayload) => void;

  // Staging photo helpers
  addStagingPhotos: (photos: StagingPhoto[]) => void;
  updateStagingPhoto: (id: string, updates: Partial<StagingPhoto>) => void;
  removeStagingPhoto: (id: string) => void;
  clearStagingPhotos: () => void;
  assignStagingPhoto: (photoId: string, slotId: string) => void;
  getStagingPhotos: () => StagingPhoto[];
  getUnassignedStagingPhotos: () => StagingPhoto[];

  // Cover photo helpers
  setCoverPhoto: (photo: CoverPhotoData) => void;
  removeCoverPhoto: () => void;

  // CBRE Parity Data helpers
  setDemographicsData: (data: import('../types').DemographicsData) => void;
  setEconomicIndicators: (data: import('../types').EconomicIndicators) => void;
  setSwotAnalysis: (data: import('../types').SWOTAnalysisData) => void;
  setRiskRating: (data: import('../types/api').RiskRatingData) => void;

  // Property Component helpers
  addPropertyComponent: (component: Omit<import('../types').PropertyComponent, 'id' | 'sortOrder'>) => void;
  updatePropertyComponent: (id: string, updates: Partial<import('../types').PropertyComponent>) => void;
  removePropertyComponent: (id: string) => void;
  setActiveComponent: (id: string | null) => void;
  getPropertyComponents: () => import('../types').PropertyComponent[];
  getPrimaryComponent: () => import('../types').PropertyComponent | undefined;
  getIncomeEnabledComponents: () => import('../types').PropertyComponent[];
  getExcessLandComponents: () => import('../types').PropertyComponent[];

  // Land allocation helpers
  getTotalAllocatedLand: () => number;
  getRemainingUnallocatedLand: () => number;
  getComponentsWithLandAllocation: () => import('../types').PropertyComponent[];

  // Income Approach Instance helpers
  addIncomeApproachInstance: (instance: Omit<import('../types').IncomeApproachInstance, 'id'>) => void;
  updateIncomeApproachInstance: (id: string, updates: Partial<import('../types').IncomeApproachInstance>) => void;
  removeIncomeApproachInstance: (id: string) => void;
  getIncomeApproachInstances: () => import('../types').IncomeApproachInstance[];
  getIncomeInstanceForComponent: (componentId: string) => import('../types').IncomeApproachInstance | undefined;

  // Sales Comparison, Land Valuation, Photos, HBU, Market Analysis helpers
  setSalesComparisonData: (data: import('../types').SalesComparisonData) => void;
  getSalesComparisonData: () => import('../types').SalesComparisonData | undefined;
  setLandValuationData: (data: import('../types').LandValuationData) => void;
  getLandValuationData: () => import('../types').LandValuationData | undefined;
  setReportPhotos: (data: import('../types').ReportPhotosData) => void;
  getReportPhotos: () => import('../types').ReportPhotosData | undefined;
  setHbuAnalysis: (data: import('../types').HBUAnalysis) => void;
  getHbuAnalysis: () => import('../types').HBUAnalysis | undefined;
  setMarketAnalysis: (data: import('../types').MarketAnalysisData) => void;
  getMarketAnalysis: () => import('../types').MarketAnalysisData | undefined;

  // Building type helpers
  getEffectiveBuildingPropertyType: (buildingId: string) => string | undefined;
  getEffectiveBuildingOccupancyCode: (buildingId: string) => string | undefined;
  getBuildingById: (buildingId: string) => import('../types').ImprovementBuilding | undefined;

  // Map helpers
  setSubjectMaps: (maps: MapData[]) => void;
  addSubjectMap: (map: MapData) => void;
  updateSubjectMap: (id: string, updates: Partial<MapData>) => void;
  removeSubjectMap: (id: string) => void;
  getSubjectMaps: () => MapData[];
  getSubjectMapsByType: (type: MapType) => MapData[];
  setApproachMap: (approachType: string, map: MapData) => void;
  removeApproachMap: (approachType: string) => void;
  getApproachMap: (approachType: string) => MapData | undefined;

  // Derived state
  hasImprovements: boolean; // True if property type is not 'land'
}

const WizardContext = createContext<WizardContextValue | null>(null);

// =================================================================
// PROVIDER
// =================================================================

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, null, getInitialState);

  // Persist to localStorage on change
  useEffect(() => {
    // IMPORTANT: Subject Data (photos) can introduce large base64 previews and File objects.
    // JSON.stringify + localStorage writes can become extremely expensive and/or exceed quota,
    // which manifests as "navigation sticks" (URL changes but UI doesn't update quickly).
    const persistTimer = window.setTimeout(() => {
      try {
        // Strip heavy/non-serializable data before persisting.
        const persistableState = {
          ...state,
          // Do not persist staging photos (contains File + large base64 previews)
          stagingPhotos: [],
          // Do not persist report photo URLs (often base64 previews). Keep captions/slot mapping only.
          reportPhotos: state.reportPhotos
            ? {
              ...state.reportPhotos,
              assignments: (state.reportPhotos.assignments ?? []).map((a) => ({
                ...a,
                url: '',
              })),
            }
            : undefined,
          // Do not persist cover photo preview/file (can be very large)
          coverPhoto: state.coverPhoto
            ? {
              id: state.coverPhoto.id,
              sourceSlotId: state.coverPhoto.sourceSlotId,
              caption: state.coverPhoto.caption,
              preview: '',
            }
            : undefined,
        };

        localStorage.setItem('harken_wizard_react', JSON.stringify(persistableState));
      } catch (err) {
        // Avoid hard-crashing the app if storage quota is exceeded or storage is blocked.
        console.warn('[WizardContext] Failed to persist wizard state to localStorage:', err);
      }
    }, 250);

    return () => window.clearTimeout(persistTimer);
  }, [state]);

  // Convenience helpers - all memoized to prevent infinite loops in useEffect dependencies
  const setTemplate = useCallback((template: string) => {
    dispatch({ type: 'SET_TEMPLATE', payload: template });
  }, []);

  const setPropertyType = useCallback((type: string, subtype?: string) => {
    dispatch({ type: 'SET_PROPERTY_TYPE', payload: { type, subtype } });
  }, []);

  const setImprovementsInventory = useCallback((inventory: ImprovementsInventory) => {
    dispatch({ type: 'SET_IMPROVEMENTS_INVENTORY', payload: inventory });
  }, []);

  const setMsOccupancyCode = useCallback((code: string | null) => {
    dispatch({ type: 'SET_MS_OCCUPANCY_CODE', payload: code });
  }, []);

  const setSiteImprovements = useCallback((improvements: SiteImprovement[]) => {
    dispatch({ type: 'SET_SITE_IMPROVEMENTS', payload: improvements });
  }, []);

  const setCostApproachBuildingSelections = useCallback((scenarioId: number, buildingIds: string[]) => {
    dispatch({ type: 'SET_COST_APPROACH_BUILDING_SELECTIONS', payload: { scenarioId, buildingIds } });
  }, []);

  const setCostApproachBuildingCostData = useCallback((
    scenarioId: number,
    buildingId: string,
    overrides: import('../types').CostApproachOverrides | null
  ) => {
    dispatch({ type: 'SET_COST_APPROACH_BUILDING_COST_DATA', payload: { scenarioId, buildingId, overrides } });
  }, []);

  const toggleFullscreen = useCallback(() => {
    dispatch({ type: 'TOGGLE_FULLSCREEN' });
  }, []);

  const goToPage = useCallback((page: string) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  // Document extraction helpers
  const setExtractedData = useCallback((slotId: string, data: ExtractedData) => {
    dispatch({ type: 'SET_EXTRACTED_DATA', payload: { slotId, data } });
  }, []);

  const getExtractedField = useCallback((slotId: string, field: string): string | undefined => {
    return state.extractedData[slotId]?.[field]?.value;
  }, [state.extractedData]);

  const addUploadedDocument = useCallback((doc: UploadedDocument) => {
    dispatch({ type: 'ADD_UPLOADED_DOCUMENT', payload: doc });
  }, []);

  const updateUploadedDocument = useCallback((id: string, updates: Partial<UploadedDocument>) => {
    dispatch({ type: 'UPDATE_UPLOADED_DOCUMENT', payload: { id, updates } });
  }, []);

  // Document field source tracking helpers
  const applyDocumentExtractedData = useCallback((
    documentId: string,
    documentName: string,
    documentType: string,
    fields: Record<string, { value: string; confidence: number }>
  ) => {
    dispatch({
      type: 'APPLY_DOCUMENT_EXTRACTED_DATA',
      payload: { documentId, documentName, documentType, fields },
    });
  }, []);

  const getFieldSource = useCallback((fieldPath: string): ExtractedFieldSource | undefined => {
    return state.documentFieldSources?.[fieldPath];
  }, [state.documentFieldSources]);

  const hasFieldSource = useCallback((fieldPath: string): boolean => {
    return !!state.documentFieldSources?.[fieldPath];
  }, [state.documentFieldSources]);

  const clearDocumentFieldSources = useCallback(() => {
    dispatch({ type: 'CLEAR_DOCUMENT_FIELD_SOURCES' });
  }, []);

  // Field suggestion helpers (Accept/Reject UI) - Now supports multiple suggestions per field
  const addFieldSuggestion = useCallback((
    fieldPath: string,
    suggestion: Omit<FieldSuggestion, 'createdAt' | 'id'>
  ) => {
    dispatch({
      type: 'ADD_FIELD_SUGGESTION',
      payload: {
        fieldPath,
        suggestion: {
          ...suggestion,
          id: `${fieldPath}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          createdAt: new Date().toISOString(),
        },
      },
    });
  }, []);

  const acceptFieldSuggestion = useCallback((fieldPath: string, value: string, suggestionId?: string) => {
    dispatch({
      type: 'ACCEPT_FIELD_SUGGESTION',
      payload: { fieldPath, value, suggestionId },
    });
  }, []);

  const rejectFieldSuggestion = useCallback((fieldPath: string, suggestionId?: string) => {
    dispatch({
      type: 'REJECT_FIELD_SUGGESTION',
      payload: { fieldPath, suggestionId },
    });
  }, []);

  // Get all suggestions for a field (array)
  const getFieldSuggestions = useCallback((fieldPath: string): FieldSuggestion[] => {
    return state.fieldSuggestions?.[fieldPath] || [];
  }, [state.fieldSuggestions]);

  // Get the first pending suggestion for a field (for backward compatibility)
  const getFieldSuggestion = useCallback((fieldPath: string): FieldSuggestion | undefined => {
    const suggestions = state.fieldSuggestions?.[fieldPath];
    return suggestions?.find(s => s.status === 'pending');
  }, [state.fieldSuggestions]);

  const hasFieldSuggestion = useCallback((fieldPath: string): boolean => {
    const suggestions = state.fieldSuggestions?.[fieldPath];
    return suggestions && suggestions.length > 0;
  }, [state.fieldSuggestions]);

  const hasPendingFieldSuggestion = useCallback((fieldPath: string): boolean => {
    const suggestions = state.fieldSuggestions?.[fieldPath];
    return suggestions?.some(s => s.status === 'pending') || false;
  }, [state.fieldSuggestions]);

  // Get count of pending suggestions for a field
  const getPendingSuggestionCount = useCallback((fieldPath: string): number => {
    const suggestions = state.fieldSuggestions?.[fieldPath];
    return suggestions?.filter(s => s.status === 'pending').length || 0;
  }, [state.fieldSuggestions]);

  const isFieldAccepted = useCallback((fieldPath: string): boolean => {
    return !!state.acceptedFields?.[fieldPath];
  }, [state.acceptedFields]);

  const clearFieldSuggestions = useCallback(() => {
    dispatch({ type: 'CLEAR_FIELD_SUGGESTIONS' });
  }, []);

  // Subject data helpers
  const setSubjectData = useCallback((data: Partial<SubjectData>) => {
    dispatch({ type: 'SET_SUBJECT_DATA', payload: data });
  }, []);

  const getSubjectData = useCallback((): SubjectData => {
    return state.subjectData;
  }, [state.subjectData]);

  // Owner management helpers
  const addOwner = useCallback(() => {
    const newOwner: Owner = {
      id: `owner_${Date.now()}`,
      name: '',
      ownershipType: 'individual',
      percentage: 0,
    };

    // Recalculate percentages
    const currentOwners = state.owners;
    if (currentOwners.length === 1 && currentOwners[0].percentage === 100) {
      // Split 50/50
      dispatch({ type: 'UPDATE_OWNER', payload: { id: currentOwners[0].id, updates: { percentage: 50 } } });
      newOwner.percentage = 50;
    }

    dispatch({ type: 'ADD_OWNER', payload: newOwner });
  }, [state.owners]);

  const updateOwner = useCallback((id: string, updates: Partial<Owner>) => {
    dispatch({ type: 'UPDATE_OWNER', payload: { id, updates } });
  }, []);

  const removeOwner = useCallback((id: string) => {
    if (state.owners.length <= 1) return;

    dispatch({ type: 'REMOVE_OWNER', payload: id });

    // If only one owner left, set percentage to 100
    const remainingOwners = state.owners.filter(o => o.id !== id);
    if (remainingOwners.length === 1) {
      dispatch({ type: 'UPDATE_OWNER', payload: { id: remainingOwners[0].id, updates: { percentage: 100 } } });
    }
  }, [state.owners]);

  // Income approach helpers
  const setIncomeApproachData = useCallback((data: IncomeApproachState) => {
    dispatch({ type: 'SET_INCOME_APPROACH_DATA', payload: data });
  }, []);

  const getIncomeApproachData = useCallback((): IncomeApproachState | null => {
    return state.incomeApproachData;
  }, [state.incomeApproachData]);

  // Analysis approach conclusion helpers
  const setApproachConclusion = useCallback((scenarioId: number, approach: string, valueConclusion: number | null) => {
    dispatch({
      type: 'SET_APPROACH_CONCLUSION',
      payload: {
        scenarioId,
        approach,
        valueConclusion,
        lastUpdated: new Date().toISOString(),
      },
    });
  }, []);

  const getApproachConclusion = useCallback((scenarioId: number, approach: string): number | null => {
    const conclusion = state.analysisConclusions?.conclusions?.find(
      c => c.scenarioId === scenarioId && c.approach === approach
    );
    return conclusion?.valueConclusion ?? null;
  }, [state.incomeApproachData]);

  // Reconciliation helpers
  const setReconciliationData = useCallback((data: ReconciliationData) => {
    dispatch({ type: 'SET_RECONCILIATION_DATA', payload: data });
  }, []);

  const getReconciliationData = useCallback((): ReconciliationData | null => {
    return state.reconciliationData;
  }, [state.reconciliationData]);

  // Scenario helpers
  const getActiveScenario = useCallback(() => {
    return state.scenarios.find(s => s.id === state.activeScenarioId);
  }, [state.scenarios, state.activeScenarioId]);

  const setActiveScenario = useCallback((id: number) => {
    dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: id });
  }, []);

  const setScenarios = useCallback((scenarios: import('../types').AppraisalScenario[]) => {
    dispatch({ type: 'SET_SCENARIOS', payload: scenarios });
  }, []);

  // Progress Tracking helpers
  const setPageTab = useCallback((page: string, tab: string) => {
    dispatch({ type: 'SET_PAGE_TAB', payload: { page, tab } });
  }, []);

  const getTabCompletion = useCallback((sectionId: string, tabId: string): number => {
    const section = getSectionSchema(sectionId);
    const tab = section?.tabs.find(t => t.id === tabId);

    // If no tab found, return 0
    if (!tab) return 0;

    // If no required fields defined, this tab is "not tracked" - return 0% (not complete)
    // This prevents tabs from showing 100% when they have no tracking configured
    if (tab.requiredFields.length === 0) return 0;

    // CONDITIONAL FIELD HANDLING: Some fields only appear based on context
    // For Assignment Basics, plannedChanges and occupancyStatus are conditional
    // For Inspection, inspectorName is conditional on personalInspection
    const isFieldApplicable = (field: string): boolean => {
      // plannedChanges only shows for 'existing' or 'recently_completed' property status
      if (field === 'subjectData.plannedChanges') {
        const status = state.subjectData?.propertyStatus;
        return status === 'existing' || status === 'recently_completed';
      }
      // occupancyStatus only shows for commercial or multifamily/2-4unit
      if (field === 'subjectData.occupancyStatus') {
        if (state.propertyType === 'commercial') return true;
        const subType = state.propertySubtype;
        if (subType && (subType.includes('multifamily') || subType.includes('2-4unit'))) return true;
        return false;
      }
      // inspectorName only required when personalInspection is false
      if (field === 'subjectData.inspectorName') {
        return state.subjectData?.personalInspection === false;
      }
      return true; // All other fields are always applicable
    };

    // Filter to only applicable fields
    const applicableFields = tab.requiredFields.filter(isFieldApplicable);

    // Count filled static fields
    let filledCount = applicableFields.filter(field => {
      const value = getNestedValue(state, field);
      return isFilled(value);
    }).length;

    let totalFields = applicableFields.length;

    // DYNAMIC SCENARIO HANDLING: For Assignment Basics tab, add scenario effective dates
    if (sectionId === 'setup' && tabId === 'basics') {
      const scenarios = state.scenarios || [];
      // Add each scenario's effectiveDate as a required field
      scenarios.forEach(scenario => {
        totalFields += 1; // Each scenario needs an effective date
        if (isFilled(scenario.effectiveDate)) {
          filledCount += 1;
        }
      });
    }

    if (totalFields === 0) return 0;
    return Math.round((filledCount / totalFields) * 100);
  }, [state]);

  const getSectionCompletion = useCallback((sectionId: string): number => {
    const section = getSectionSchema(sectionId);
    if (!section || section.tabs.length === 0) {
      // For sections without tabs (like template/documents), check if completed
      if (sectionId === 'template') return state.template ? 100 : 0;
      if (sectionId === 'documents') return (state.uploadedDocuments?.length || 0) > 0 ? 100 : 0;
      return 0;
    }

    // Only count tabs that have required fields defined (tracked tabs)
    const trackedTabs = section.tabs.filter(tab => tab.requiredFields.length > 0);

    // If no tabs are tracked, return 0 (section has no completion tracking)
    if (trackedTabs.length === 0) return 0;

    const tabCompletions = trackedTabs.map(tab => {
      const weight = tab.weight || 1;
      const completion = getTabCompletion(sectionId, tab.id);
      return { completion, weight };
    });

    const totalWeight = tabCompletions.reduce((sum, t) => sum + t.weight, 0);
    const weightedSum = tabCompletions.reduce((sum, t) => sum + (t.completion * t.weight), 0);

    return Math.round(weightedSum / totalWeight);
  }, [state, getTabCompletion]);

  const getSmartInitialTab = useCallback((sectionId: string, defaultTab: string): string => {
    const pageState = state.pageTabs?.[sectionId];
    const sectionComplete = getSectionCompletion(sectionId) === 100;

    // If section is complete, start from top
    if (sectionComplete) return defaultTab;

    // If user has interacted and tab exists, resume there
    if (pageState?.hasInteracted && pageState.lastActiveTab) {
      return pageState.lastActiveTab;
    }

    return defaultTab;
  }, [state.pageTabs, getSectionCompletion]);

  const markSectionComplete = useCallback((sectionId: string) => {
    dispatch({ type: 'MARK_SECTION_COMPLETE', payload: { sectionId } });
  }, []);

  // Celebration helpers
  const showCelebration = useCallback((sectionId: string, level: CelebrationState['level'], scenarioId?: number) => {
    dispatch({ type: 'SHOW_CELEBRATION', payload: { sectionId, level, scenarioId } });
  }, []);

  const hideCelebration = useCallback(() => {
    dispatch({ type: 'HIDE_CELEBRATION' });
  }, []);

  // Scenario completion helpers
  const updateScenarioApproach = useCallback((scenarioId: number, approach: string, isComplete: boolean) => {
    dispatch({ type: 'UPDATE_SCENARIO_APPROACH', payload: { scenarioId, approach, isComplete } });
  }, []);

  const isScenarioComplete = useCallback((scenarioId: number): boolean => {
    const scenario = state.scenarios?.find(s => s.id === scenarioId);
    if (!scenario) return false;

    const scenarioCompletion = state.scenarioCompletions?.find(sc => sc.scenarioId === scenarioId);
    if (scenarioCompletion?.isComplete) return true;

    // Check if all approaches have been marked complete
    const completedApproaches = scenarioCompletion?.completedApproaches || [];
    return scenario.approaches.every(approach => completedApproaches.includes(approach));
  }, [state.scenarios, state.scenarioCompletions]);

  const areAllScenariosComplete = useCallback((): boolean => {
    if (state.allScenariosCompletedAt) return true;
    if (!state.scenarios || state.scenarios.length === 0) return false;
    return state.scenarios.every(s => isScenarioComplete(s.id));
  }, [state.scenarios, state.allScenariosCompletedAt, isScenarioComplete]);

  // Preview edits helpers
  const applyPreviewEdits = useCallback((edits: PreviewEditsPayload) => {
    dispatch({ type: 'APPLY_PREVIEW_EDITS', payload: edits });
  }, []);

  // Staging photo helpers
  const addStagingPhotos = useCallback((photos: StagingPhoto[]) => {
    dispatch({ type: 'ADD_STAGING_PHOTOS', payload: photos });
  }, []);

  const updateStagingPhoto = useCallback((id: string, updates: Partial<StagingPhoto>) => {
    dispatch({ type: 'UPDATE_STAGING_PHOTO', payload: { id, updates } });
  }, []);

  const removeStagingPhoto = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_STAGING_PHOTO', payload: id });
  }, []);

  const clearStagingPhotos = useCallback(() => {
    dispatch({ type: 'CLEAR_STAGING_PHOTOS' });
  }, []);

  const assignStagingPhoto = useCallback((photoId: string, slotId: string) => {
    dispatch({ type: 'ASSIGN_STAGING_PHOTO', payload: { photoId, slotId } });
  }, []);

  const getStagingPhotos = useCallback((): StagingPhoto[] => {
    return state.stagingPhotos || [];
  }, [state.stagingPhotos]);

  const getUnassignedStagingPhotos = useCallback((): StagingPhoto[] => {
    return (state.stagingPhotos || []).filter(photo => !photo.assignedSlot);
  }, [state.stagingPhotos]);

  // Cover photo helpers
  const setCoverPhoto = useCallback((photo: CoverPhotoData) => {
    dispatch({ type: 'SET_COVER_PHOTO', payload: photo });
  }, []);

  const removeCoverPhoto = useCallback(() => {
    dispatch({ type: 'REMOVE_COVER_PHOTO' });
  }, []);

  // CBRE Parity Data helpers
  const setDemographicsData = useCallback((data: import('../types').DemographicsData) => {
    dispatch({ type: 'SET_DEMOGRAPHICS_DATA', payload: data });
  }, []);

  const setEconomicIndicators = useCallback((data: import('../types').EconomicIndicators) => {
    dispatch({ type: 'SET_ECONOMIC_INDICATORS', payload: data });
  }, []);

  const setSwotAnalysis = useCallback((data: import('../types').SWOTAnalysisData) => {
    dispatch({ type: 'SET_SWOT_ANALYSIS', payload: data });
  }, []);

  const setRiskRating = useCallback((riskRating: import('../types/api').RiskRatingData) => {
    dispatch({ type: 'SET_RISK_RATING', payload: riskRating });
  }, []);

  // Property Component helpers
  const addPropertyComponent = useCallback((component: Omit<import('../types').PropertyComponent, 'id' | 'sortOrder'>) => {
    const fullComponent: import('../types').PropertyComponent = {
      ...component,
      id: `component_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sortOrder: (state.propertyComponents || []).length,
    };
    dispatch({ type: 'ADD_PROPERTY_COMPONENT', payload: fullComponent });
  }, [state.propertyComponents]);

  const updatePropertyComponent = useCallback((id: string, updates: Partial<import('../types').PropertyComponent>) => {
    dispatch({ type: 'UPDATE_PROPERTY_COMPONENT', payload: { id, updates } });
  }, []);

  const removePropertyComponent = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PROPERTY_COMPONENT', payload: id });
  }, []);

  const setActiveComponent = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_COMPONENT', payload: id });
  }, []);

  const getPropertyComponents = useCallback(() => {
    return state.propertyComponents || [];
  }, [state.propertyComponents]);

  const getPrimaryComponent = useCallback(() => {
    return (state.propertyComponents || []).find(c => c.isPrimary);
  }, [state.propertyComponents]);

  const getIncomeEnabledComponents = useCallback(() => {
    return (state.propertyComponents || []).filter(c => c.analysisConfig.incomeApproach);
  }, [state.propertyComponents]);

  const getExcessLandComponents = useCallback(() => {
    return (state.propertyComponents || []).filter(c =>
      c.landClassification === 'excess' || c.landClassification === 'surplus'
    );
  }, [state.propertyComponents]);

  // Land allocation helpers
  const getTotalAllocatedLand = useCallback(() => {
    return (state.propertyComponents || []).reduce((sum, comp) => 
      sum + (comp.landAllocation?.acres || 0), 0);
  }, [state.propertyComponents]);

  const getRemainingUnallocatedLand = useCallback(() => {
    const totalSiteAcres = parseFloat(state.subjectData?.siteArea || '0');
    const siteUnit = state.subjectData?.siteAreaUnit || 'acres';
    // Convert SF to acres if needed (siteAreaUnit is 'sqft' not 'sf')
    const totalAcres = siteUnit === 'sqft' ? totalSiteAcres / 43560 : totalSiteAcres;
    return totalAcres - getTotalAllocatedLand();
  }, [state.subjectData?.siteArea, state.subjectData?.siteAreaUnit, getTotalAllocatedLand]);

  const getComponentsWithLandAllocation = useCallback(() => {
    return (state.propertyComponents || []).filter(c => 
      c.landAllocation && (c.landAllocation.acres || c.landAllocation.squareFeet)
    );
  }, [state.propertyComponents]);

  // Income Approach Instance helpers
  const addIncomeApproachInstance = useCallback((instance: Omit<import('../types').IncomeApproachInstance, 'id'>) => {
    const fullInstance: import('../types').IncomeApproachInstance = {
      ...instance,
      id: `income_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    dispatch({ type: 'ADD_INCOME_APPROACH_INSTANCE', payload: fullInstance });
  }, []);

  const updateIncomeApproachInstance = useCallback((id: string, updates: Partial<import('../types').IncomeApproachInstance>) => {
    dispatch({ type: 'UPDATE_INCOME_APPROACH_INSTANCE', payload: { id, updates } });
  }, []);

  const removeIncomeApproachInstance = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_INCOME_APPROACH_INSTANCE', payload: id });
  }, []);

  const getIncomeApproachInstances = useCallback(() => {
    return state.incomeApproachInstances || [];
  }, [state.incomeApproachInstances]);

  const getIncomeInstanceForComponent = useCallback((componentId: string) => {
    return (state.incomeApproachInstances || []).find(i => i.componentId === componentId);
  }, [state.incomeApproachInstances]);

  // Sales Comparison helpers
  const setSalesComparisonData = useCallback((data: import('../types').SalesComparisonData) => {
    dispatch({ type: 'SET_SALES_COMPARISON_DATA', payload: data });
  }, []);

  const getSalesComparisonData = useCallback(() => {
    return state.salesComparisonData;
  }, [state.salesComparisonData]);

  // Land Valuation helpers
  const setLandValuationData = useCallback((data: import('../types').LandValuationData) => {
    dispatch({ type: 'SET_LAND_VALUATION_DATA', payload: data });
  }, []);

  const getLandValuationData = useCallback(() => {
    return state.landValuationData;
  }, [state.landValuationData]);

  // Report Photos helpers
  const setReportPhotos = useCallback((data: import('../types').ReportPhotosData) => {
    dispatch({ type: 'SET_REPORT_PHOTOS', payload: data });
  }, []);

  const getReportPhotos = useCallback(() => {
    return state.reportPhotos;
  }, [state.reportPhotos]);

  // HBU Analysis helpers
  const setHbuAnalysis = useCallback((data: import('../types').HBUAnalysis) => {
    dispatch({ type: 'SET_HBU_ANALYSIS', payload: data });
  }, []);

  const getHbuAnalysis = useCallback(() => {
    return state.hbuAnalysis;
  }, [state.hbuAnalysis]);

  // Market Analysis helpers
  const setMarketAnalysis = useCallback((data: import('../types').MarketAnalysisData) => {
    dispatch({ type: 'SET_MARKET_ANALYSIS', payload: data });
  }, []);

  const getMarketAnalysis = useCallback(() => {
    return state.marketAnalysis;
  }, [state.marketAnalysis]);

  // ================================================================
  // MAP HELPERS
  // ================================================================

  const setSubjectMaps = useCallback((maps: MapData[]) => {
    dispatch({ type: 'SET_SUBJECT_MAPS', payload: maps });
  }, []);

  const addSubjectMap = useCallback((map: MapData) => {
    dispatch({ type: 'ADD_SUBJECT_MAP', payload: map });
  }, []);

  const updateSubjectMap = useCallback((id: string, updates: Partial<MapData>) => {
    dispatch({ type: 'UPDATE_SUBJECT_MAP', payload: { id, updates } });
  }, []);

  const removeSubjectMap = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SUBJECT_MAP', payload: id });
  }, []);

  const getSubjectMaps = useCallback((): MapData[] => {
    return state.subjectMaps || [];
  }, [state.subjectMaps]);

  const getSubjectMapsByType = useCallback((type: MapType): MapData[] => {
    return (state.subjectMaps || []).filter(map => map.type === type);
  }, [state.subjectMaps]);

  const setApproachMap = useCallback((approachType: string, map: MapData) => {
    dispatch({ type: 'SET_APPROACH_MAP', payload: { approachType, map } });
  }, []);

  const removeApproachMap = useCallback((approachType: string) => {
    dispatch({ type: 'REMOVE_APPROACH_MAP', payload: approachType });
  }, []);

  const getApproachMap = useCallback((approachType: string): MapData | undefined => {
    return state.approachMaps?.[approachType];
  }, [state.approachMaps]);

  // ================================================================
  // BUILDING TYPE HELPERS
  // ================================================================

  /**
   * Find a building by ID across all parcels.
   */
  const getBuildingById = useCallback((buildingId: string) => {
    for (const parcel of state.improvementsInventory.parcels) {
      const building = parcel.buildings.find(b => b.id === buildingId);
      if (building) return building;
    }
    return undefined;
  }, [state.improvementsInventory]);

  /**
   * Get the effective property type for a building.
   * Returns the building's override if set, otherwise the wizard default.
   */
  const getEffectiveBuildingPropertyType = useCallback((buildingId: string): string | undefined => {
    const building = getBuildingById(buildingId);

    // Check building-level override first
    if (building?.propertyTypeOverride) {
      return building.propertyTypeOverride;
    }

    // Fall back to wizard-level default (derive from msOccupancyCode)
    // The msOccupancyCode contains the occupancy code ID, we need to get its property type
    if (state.msOccupancyCode) {
      // The msOccupancyCode is the occupancy code ID like 'warehouse-general'
      // We need to look up the property type from the occupancy codes
      // For simplicity, return the propertyType from state if set
      return state.propertyType || undefined;
    }

    return state.propertyType || undefined;
  }, [getBuildingById, state.msOccupancyCode, state.propertyType]);

  /**
   * Get the effective occupancy code for a building.
   * Returns the building's override if set, otherwise the wizard default.
   */
  const getEffectiveBuildingOccupancyCode = useCallback((buildingId: string): string | undefined => {
    const building = getBuildingById(buildingId);

    // Check building-level override first
    if (building?.msOccupancyCodeOverride) {
      return building.msOccupancyCodeOverride;
    }

    // Fall back to wizard-level default
    return state.msOccupancyCode || undefined;
  }, [getBuildingById, state.msOccupancyCode]);

  // Derived state: hasImprovements
  // True if property type is not 'land' (i.e., has improvements to appraise)
  const hasImprovements = state.propertyType !== 'land';

  return (
    <WizardContext.Provider
      value={{
        state,
        dispatch,
        setTemplate,
        setPropertyType,
        setImprovementsInventory,
        setMsOccupancyCode,
        setSiteImprovements,
        setCostApproachBuildingSelections,
        setCostApproachBuildingCostData,
        toggleFullscreen,
        goToPage,
        setExtractedData,
        getExtractedField,
        addUploadedDocument,
        updateUploadedDocument,
        // Document field source tracking
        applyDocumentExtractedData,
        getFieldSource,
        hasFieldSource,
        clearDocumentFieldSources,
        // Field suggestions (Accept/Reject UI) - supports multiple per field
        addFieldSuggestion,
        acceptFieldSuggestion,
        rejectFieldSuggestion,
        getFieldSuggestions,
        getFieldSuggestion,
        hasFieldSuggestion,
        hasPendingFieldSuggestion,
        getPendingSuggestionCount,
        isFieldAccepted,
        clearFieldSuggestions,
        setSubjectData,
        getSubjectData,
        addOwner,
        updateOwner,
        removeOwner,
        setIncomeApproachData,
        getIncomeApproachData,
        setApproachConclusion,
        getApproachConclusion,
        setReconciliationData,
        getReconciliationData,
        getActiveScenario,
        setActiveScenario,
        setScenarios,
        // Progress Tracking
        setPageTab,
        getTabCompletion,
        getSectionCompletion,
        getSmartInitialTab,
        markSectionComplete,
        // Celebration
        showCelebration,
        hideCelebration,
        // Scenario completion
        updateScenarioApproach,
        isScenarioComplete,
        areAllScenariosComplete,
        // Preview edits
        applyPreviewEdits,
        // Staging photos
        addStagingPhotos,
        updateStagingPhoto,
        removeStagingPhoto,
        clearStagingPhotos,
        assignStagingPhoto,
        getStagingPhotos,
        getUnassignedStagingPhotos,
        // Cover photo
        setCoverPhoto,
        removeCoverPhoto,
        // CBRE Parity Data
        setDemographicsData,
        setEconomicIndicators,
        setSwotAnalysis,
        setRiskRating,
        // Property Component helpers
        addPropertyComponent,
        updatePropertyComponent,
        removePropertyComponent,
        setActiveComponent,
        getPropertyComponents,
        getPrimaryComponent,
        getIncomeEnabledComponents,
        getExcessLandComponents,
        // Land allocation helpers
        getTotalAllocatedLand,
        getRemainingUnallocatedLand,
        getComponentsWithLandAllocation,
        // Income Approach Instance helpers
        addIncomeApproachInstance,
        updateIncomeApproachInstance,
        removeIncomeApproachInstance,
        getIncomeApproachInstances,
        getIncomeInstanceForComponent,
        // Sales Comparison, Land Valuation, Photos, HBU, Market Analysis
        setSalesComparisonData,
        getSalesComparisonData,
        setLandValuationData,
        getLandValuationData,
        setReportPhotos,
        getReportPhotos,
        setHbuAnalysis,
        getHbuAnalysis,
        setMarketAnalysis,
        getMarketAnalysis,
        // Building type helpers
        getEffectiveBuildingPropertyType,
        getEffectiveBuildingOccupancyCode,
        getBuildingById,
        // Map helpers
        setSubjectMaps,
        addSubjectMap,
        updateSubjectMap,
        removeSubjectMap,
        getSubjectMaps,
        getSubjectMapsByType,
        setApproachMap,
        removeApproachMap,
        getApproachMap,
        // Derived state
        hasImprovements,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

// =================================================================
// HOOK
// =================================================================

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

