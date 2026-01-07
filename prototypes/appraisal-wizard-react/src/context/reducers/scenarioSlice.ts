// src/context/reducers/scenarioSlice.ts
// Handles all scenario-related actions

import type { WizardState, WizardAction, AppraisalScenario } from '../../types';

export type ScenarioAction =
  | { type: 'ADD_SCENARIO'; payload: AppraisalScenario }
  | { type: 'REMOVE_SCENARIO'; payload: number }
  | { type: 'UPDATE_SCENARIO'; payload: Partial<AppraisalScenario> & { id: number } }
  | { type: 'SET_ACTIVE_SCENARIO'; payload: number }
  | { type: 'SET_SCENARIOS'; payload: AppraisalScenario[] };

/**
 * Handles scenario-related actions.
 * Returns the updated state if handled, or null if not a scenario action.
 */
export function handleScenarioAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
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

    default:
      return null;
  }
}
