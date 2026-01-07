// src/context/reducers/index.ts
// Combines all reducer slices into a single reducer

import type { WizardState, WizardAction } from '../../types';
import { getInitialState, createDefaultState } from './initialState';
import { handleCoreAction } from './coreSlice';
import { handleScenarioAction } from './scenarioSlice';
import { handleDocumentAction } from './documentSlice';
import { handlePhotoAction } from './photoSlice';
import { handleMapAction } from './mapSlice';
import { handleSuggestionAction } from './suggestionSlice';
import { handleProgressAction } from './progressSlice';
import { handleAnalysisAction } from './analysisSlice';

// Re-export for convenience
export { getInitialState, createDefaultState };

/**
 * Main wizard reducer that delegates to domain-specific slices.
 * Each slice returns the updated state if it handled the action,
 * or null if the action wasn't handled by that slice.
 */
export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  // Try each slice handler in order
  const sliceHandlers = [
    handleCoreAction,
    handleScenarioAction,
    handleDocumentAction,
    handlePhotoAction,
    handleMapAction,
    handleSuggestionAction,
    handleProgressAction,
    handleAnalysisAction,
  ];

  let newState: WizardState | null = null;

  for (const handler of sliceHandlers) {
    newState = handler(state, action);
    if (newState !== null) {
      break;
    }
  }

  // If no handler matched, return the original state
  if (newState === null) {
    return state;
  }

  // Update lastModified timestamp
  return { ...newState, lastModified: new Date().toISOString() };
}
