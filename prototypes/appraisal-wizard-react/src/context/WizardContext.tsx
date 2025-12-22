import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { WizardState, WizardAction, ImprovementsInventory, Owner, ExtractedData, UploadedDocument, IncomeApproachState, ReconciliationData, CelebrationState, SubjectData } from '../types';
import { createDefaultInventory } from '../contracts/improvements';
import { getSectionSchema } from '../constants/completionSchema';
import { getNestedValue, isFilled } from '../utils/stateHelpers';

// =================================================================
// INITIAL STATE
// =================================================================

const getInitialState = (): WizardState => {
  // Try to load from localStorage
  const stored = localStorage.getItem('harken_wizard_react');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored wizard state');
    }
  }

  return {
    template: null,
    propertyType: null,
    propertySubtype: null,
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
    },
    improvementsInventory: createDefaultInventory(),
    extractedData: {},
    uploadedDocuments: [],
    owners: [
      { id: 'owner_1', name: '', ownershipType: 'individual', percentage: 100 }
    ],
    incomeApproachData: null,
    reconciliationData: null,
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
};

// =================================================================
// REDUCER
// =================================================================

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const newState = (() => {
    switch (action.type) {
      case 'SET_TEMPLATE':
        return { ...state, template: action.payload };

      case 'SET_PROPERTY_TYPE':
        return {
          ...state,
          propertyType: action.payload.type,
          propertySubtype: action.payload.subtype || null,
        };

      case 'ADD_SCENARIO':
        return { ...state, scenarios: [...state.scenarios, action.payload] };

      case 'REMOVE_SCENARIO':
        return {
          ...state,
          scenarios: state.scenarios.filter(s => s.id !== action.payload),
        };

      case 'UPDATE_SCENARIO':
        return {
          ...state,
          scenarios: state.scenarios.map(s =>
            s.id === action.payload.id ? { ...s, ...action.payload } : s
          ),
        };

      case 'SET_ACTIVE_SCENARIO':
        return { ...state, activeScenarioId: action.payload };

      case 'SET_SCENARIOS':
        return { 
          ...state, 
          scenarios: action.payload,
          // If active scenario no longer exists, switch to first scenario
          activeScenarioId: action.payload.some(s => s.id === state.activeScenarioId) 
            ? state.activeScenarioId 
            : action.payload[0]?.id || 1
        };

      case 'SET_IMPROVEMENTS_INVENTORY':
        return { ...state, improvementsInventory: action.payload };

      case 'SET_EXTRACTED_DATA':
        return {
          ...state,
          extractedData: {
            ...state.extractedData,
            [action.payload.slotId]: {
              ...state.extractedData[action.payload.slotId],
              ...action.payload.data,
            },
          },
        };

      case 'SET_ALL_EXTRACTED_DATA':
        return { ...state, extractedData: action.payload };

      case 'ADD_UPLOADED_DOCUMENT':
        return {
          ...state,
          uploadedDocuments: [...state.uploadedDocuments, action.payload],
        };

      case 'UPDATE_UPLOADED_DOCUMENT':
        return {
          ...state,
          uploadedDocuments: state.uploadedDocuments.map(doc =>
            doc.id === action.payload.id ? { ...doc, ...action.payload.updates } : doc
          ),
        };

      case 'REMOVE_UPLOADED_DOCUMENT':
        return {
          ...state,
          uploadedDocuments: state.uploadedDocuments.filter(doc => doc.id !== action.payload),
        };

      case 'ADD_OWNER':
        return {
          ...state,
          owners: [...state.owners, action.payload],
        };

      case 'UPDATE_OWNER':
        return {
          ...state,
          owners: state.owners.map(owner =>
            owner.id === action.payload.id ? { ...owner, ...action.payload.updates } : owner
          ),
        };

      case 'REMOVE_OWNER':
        return {
          ...state,
          owners: state.owners.filter(owner => owner.id !== action.payload),
        };

      case 'SET_OWNERS':
        return { ...state, owners: action.payload };

      case 'SET_SUBJECT_DATA':
        return {
          ...state,
          subjectData: {
            ...state.subjectData,
            ...action.payload,
            // Handle nested address update
            address: action.payload.address
              ? { ...state.subjectData.address, ...action.payload.address }
              : state.subjectData.address,
          },
        };

      case 'SET_INCOME_APPROACH_DATA':
        return { ...state, incomeApproachData: action.payload };

      case 'SET_RECONCILIATION_DATA':
        return { ...state, reconciliationData: action.payload };

      case 'SET_CURRENT_PAGE':
        return { ...state, currentPage: action.payload };

      case 'SET_SUBJECT_TAB':
        return { ...state, subjectActiveTab: action.payload };

      case 'TOGGLE_FULLSCREEN':
        return { ...state, isFullscreen: !state.isFullscreen };

      // Progress Tracking Actions
      case 'SET_PAGE_TAB':
        return {
          ...state,
          pageTabs: {
            ...state.pageTabs,
            [action.payload.page]: {
              lastActiveTab: action.payload.tab,
              hasInteracted: true,
            },
          },
        };

      case 'MARK_SECTION_COMPLETE':
        return {
          ...state,
          sectionCompletedAt: {
            ...state.sectionCompletedAt,
            [action.payload.sectionId]: new Date().toISOString(),
          },
        };

      case 'MARK_SCENARIO_COMPLETE': {
        const existingIndex = state.scenarioCompletions.findIndex(
          sc => sc.scenarioId === action.payload.scenarioId
        );
        const newCompletion = {
          scenarioId: action.payload.scenarioId,
          completedApproaches: [],
          isComplete: true,
          completedAt: new Date().toISOString(),
        };
        
        if (existingIndex >= 0) {
          const updated = [...state.scenarioCompletions];
          updated[existingIndex] = { ...updated[existingIndex], ...newCompletion };
          return { ...state, scenarioCompletions: updated };
        }
        return { ...state, scenarioCompletions: [...state.scenarioCompletions, newCompletion] };
      }

      case 'UPDATE_SCENARIO_APPROACH': {
        const { scenarioId, approach, isComplete } = action.payload;
        const existingIndex = state.scenarioCompletions.findIndex(
          sc => sc.scenarioId === scenarioId
        );
        
        if (existingIndex >= 0) {
          const updated = [...state.scenarioCompletions];
          const current = updated[existingIndex];
          const approaches = isComplete
            ? [...new Set([...current.completedApproaches, approach])]
            : current.completedApproaches.filter(a => a !== approach);
          updated[existingIndex] = { ...current, completedApproaches: approaches };
          return { ...state, scenarioCompletions: updated };
        }
        
        return {
          ...state,
          scenarioCompletions: [
            ...state.scenarioCompletions,
            {
              scenarioId,
              completedApproaches: isComplete ? [approach] : [],
              isComplete: false,
              completedAt: null,
            },
          ],
        };
      }

      case 'MARK_ALL_SCENARIOS_COMPLETE':
        return { ...state, allScenariosCompletedAt: new Date().toISOString() };

      case 'SHOW_CELEBRATION':
        return {
          ...state,
          celebration: {
            isVisible: true,
            sectionId: action.payload.sectionId,
            scenarioId: action.payload.scenarioId ?? null,
            level: action.payload.level,
          },
        };

      case 'HIDE_CELEBRATION':
        return {
          ...state,
          celebration: {
            isVisible: false,
            sectionId: null,
            scenarioId: null,
            level: 'none' as const,
          },
        };

      case 'RESET':
        return getInitialState();

      default:
        return state;
    }
  })();

  // Update lastModified
  return { ...newState, lastModified: new Date().toISOString() };
}

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
}

const WizardContext = createContext<WizardContextValue | null>(null);

// =================================================================
// PROVIDER
// =================================================================

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, null, getInitialState);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('harken_wizard_react', JSON.stringify(state));
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
    
    const filledCount = tab.requiredFields.filter(field => {
      const value = getNestedValue(state, field);
      return isFilled(value);
    }).length;
    
    return Math.round((filledCount / tab.requiredFields.length) * 100);
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

  return (
    <WizardContext.Provider
      value={{
        state,
        dispatch,
        setTemplate,
        setPropertyType,
        setImprovementsInventory,
        toggleFullscreen,
        goToPage,
        setExtractedData,
        getExtractedField,
        addUploadedDocument,
        setSubjectData,
        getSubjectData,
        addOwner,
        updateOwner,
        removeOwner,
        setIncomeApproachData,
        getIncomeApproachData,
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

