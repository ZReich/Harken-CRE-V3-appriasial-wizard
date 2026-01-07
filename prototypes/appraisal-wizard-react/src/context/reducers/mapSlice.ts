// src/context/reducers/mapSlice.ts
// Handles all map-related actions

import type { WizardState, WizardAction } from '../../types';

/**
 * Handles map-related actions.
 * Returns the updated state if handled, or null if not a map action.
 */
export function handleMapAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    case 'SET_SUBJECT_MAPS':
      return {
        ...state,
        subjectMaps: action.payload,
      };

    case 'ADD_SUBJECT_MAP':
      return {
        ...state,
        subjectMaps: [...state.subjectMaps, action.payload],
      };

    case 'UPDATE_SUBJECT_MAP':
      return {
        ...state,
        subjectMaps: state.subjectMaps.map(map =>
          map.id === action.payload.id
            ? { ...map, ...action.payload.updates }
            : map
        ),
      };

    case 'REMOVE_SUBJECT_MAP':
      return {
        ...state,
        subjectMaps: state.subjectMaps.filter(map => map.id !== action.payload),
      };

    case 'SET_APPROACH_MAP':
      return {
        ...state,
        approachMaps: {
          ...state.approachMaps,
          [action.payload.approachType]: action.payload.map,
        },
      };

    case 'REMOVE_APPROACH_MAP': {
      const { [action.payload]: _, ...restApproachMaps } = state.approachMaps;
      return {
        ...state,
        approachMaps: restApproachMaps,
      };
    }

    default:
      return null;
  }
}
