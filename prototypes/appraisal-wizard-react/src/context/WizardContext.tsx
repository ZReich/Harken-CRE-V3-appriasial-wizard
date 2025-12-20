import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { WizardState, WizardAction, ImprovementsInventory, Owner, ExtractedData, UploadedDocument, IncomeApproachState } from '../types';
import { createDefaultInventory } from '../contracts/improvements';

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
    improvementsInventory: createDefaultInventory(),
    extractedData: {},
    uploadedDocuments: [],
    owners: [
      { id: 'owner_1', name: '', ownershipType: 'individual', percentage: 100 }
    ],
    incomeApproachData: null,
    currentPage: 'template',
    subjectActiveTab: 'location',
    isFullscreen: false,
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

      case 'SET_INCOME_APPROACH_DATA':
        return { ...state, incomeApproachData: action.payload };

      case 'SET_CURRENT_PAGE':
        return { ...state, currentPage: action.payload };

      case 'SET_SUBJECT_TAB':
        return { ...state, subjectActiveTab: action.payload };

      case 'TOGGLE_FULLSCREEN':
        return { ...state, isFullscreen: !state.isFullscreen };

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
  
  // Document extraction helpers
  setExtractedData: (slotId: string, data: ExtractedData) => void;
  getExtractedField: (slotId: string, field: string) => string | undefined;
  addUploadedDocument: (doc: UploadedDocument) => void;
  
  // Owner management helpers
  addOwner: () => void;
  updateOwner: (id: string, updates: Partial<Owner>) => void;
  removeOwner: (id: string) => void;
  
  // Income approach helpers
  setIncomeApproachData: (data: IncomeApproachState) => void;
  getIncomeApproachData: () => IncomeApproachState | null;
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

  // Convenience helpers
  const setTemplate = (template: string) => {
    dispatch({ type: 'SET_TEMPLATE', payload: template });
  };

  const setPropertyType = (type: string, subtype?: string) => {
    dispatch({ type: 'SET_PROPERTY_TYPE', payload: { type, subtype } });
  };

  const setImprovementsInventory = (inventory: ImprovementsInventory) => {
    dispatch({ type: 'SET_IMPROVEMENTS_INVENTORY', payload: inventory });
  };

  const toggleFullscreen = () => {
    dispatch({ type: 'TOGGLE_FULLSCREEN' });
  };

  const goToPage = (page: string) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  // Document extraction helpers
  const setExtractedData = (slotId: string, data: ExtractedData) => {
    dispatch({ type: 'SET_EXTRACTED_DATA', payload: { slotId, data } });
  };

  const getExtractedField = (slotId: string, field: string): string | undefined => {
    return state.extractedData[slotId]?.[field]?.value;
  };

  const addUploadedDocument = (doc: UploadedDocument) => {
    dispatch({ type: 'ADD_UPLOADED_DOCUMENT', payload: doc });
  };

  // Owner management helpers
  const addOwner = () => {
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
  };

  const updateOwner = (id: string, updates: Partial<Owner>) => {
    dispatch({ type: 'UPDATE_OWNER', payload: { id, updates } });
  };

  const removeOwner = (id: string) => {
    if (state.owners.length <= 1) return;
    
    dispatch({ type: 'REMOVE_OWNER', payload: id });
    
    // If only one owner left, set percentage to 100
    const remainingOwners = state.owners.filter(o => o.id !== id);
    if (remainingOwners.length === 1) {
      dispatch({ type: 'UPDATE_OWNER', payload: { id: remainingOwners[0].id, updates: { percentage: 100 } } });
    }
  };

  // Income approach helpers
  const setIncomeApproachData = (data: IncomeApproachState) => {
    dispatch({ type: 'SET_INCOME_APPROACH_DATA', payload: data });
  };

  const getIncomeApproachData = (): IncomeApproachState | null => {
    return state.incomeApproachData;
  };

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
        addOwner,
        updateOwner,
        removeOwner,
        setIncomeApproachData,
        getIncomeApproachData,
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

