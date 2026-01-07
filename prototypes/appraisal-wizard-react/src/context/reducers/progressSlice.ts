// src/context/reducers/progressSlice.ts
// Handles progress tracking, section completion, and celebration actions

import type { WizardState, WizardAction, CelebrationState } from '../../types';

/**
 * Handles progress-related actions.
 * Returns the updated state if handled, or null if not a progress action.
 */
export function handleProgressAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_SUBJECT_TAB':
      return { ...state, subjectActiveTab: action.payload };

    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };

    case 'SET_PAGE_TAB': {
      const { page, tab } = action.payload;
      return {
        ...state,
        pageTabs: {
          ...state.pageTabs,
          [page]: {
            lastActiveTab: tab,
            hasInteracted: true,
          },
        },
      };
    }

    case 'MARK_SECTION_COMPLETE': {
      const { sectionId } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        sectionCompletedAt: {
          ...state.sectionCompletedAt,
          [sectionId]: now,
        },
      };
    }

    case 'MARK_SCENARIO_COMPLETE': {
      const { scenarioId } = action.payload;
      const now = new Date().toISOString();
      const existingIndex = state.scenarioCompletions.findIndex(
        sc => sc.scenarioId === scenarioId
      );
      const newCompletion = {
        scenarioId,
        completedApproaches: [] as string[],
        isComplete: true,
        completedAt: now,
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
          level: 'none' as CelebrationState['level'],
        },
      };

    default:
      return null;
  }
}
