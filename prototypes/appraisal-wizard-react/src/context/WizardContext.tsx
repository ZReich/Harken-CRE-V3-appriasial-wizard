import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { WizardState, WizardAction, ImprovementsInventory } from '../types';
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

