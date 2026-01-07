// src/context/reducers/suggestionSlice.ts
// Handles field suggestion actions (accept/reject UI)

import type { WizardState, WizardAction } from '../../types';
import { setNestedValue } from '../../utils/stateHelpers';

/**
 * Handles field suggestion actions.
 * Returns the updated state if handled, or null if not a suggestion action.
 */
export function handleSuggestionAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    case 'ADD_FIELD_SUGGESTION': {
      const { fieldPath, suggestion } = action.payload;
      const rawSuggestions = state.fieldSuggestions?.[fieldPath];
      const existingSuggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];

      // Check if this exact suggestion already exists (same value from same source)
      const isDuplicate = existingSuggestions.some(
        s => s.value === suggestion.value && s.sourceFilename === suggestion.sourceFilename
      );

      if (isDuplicate) {
        return state; // Don't add duplicate suggestions
      }

      return {
        ...state,
        fieldSuggestions: {
          ...state.fieldSuggestions,
          [fieldPath]: [...existingSuggestions, suggestion],
        },
      };
    }

    case 'ACCEPT_FIELD_SUGGESTION': {
      const { fieldPath, value, suggestionId } = action.payload;
      const suggestions = state.fieldSuggestions[fieldPath];

      if (!suggestions || suggestions.length === 0) return state;

      // Find the accepted suggestion (by ID if provided, or first pending one)
      const acceptedSuggestion = suggestionId
        ? suggestions.find(s => s.id === suggestionId)
        : suggestions.find(s => s.status === 'pending');

      if (!acceptedSuggestion) return state;

      // Mark the accepted suggestion as accepted, others as rejected
      const updatedSuggestions = suggestions.map(s => ({
        ...s,
        status: s.id === acceptedSuggestion.id ? 'accepted' as const : 'rejected' as const,
      }));

      // Track that this field was accepted from this source
      const updatedAcceptedFields = {
        ...state.acceptedFields,
        [fieldPath]: acceptedSuggestion.source,
      };

      // Apply the value to the wizard state
      let updatedState = setNestedValue(state, fieldPath, value);

      return {
        ...updatedState,
        fieldSuggestions: {
          ...updatedState.fieldSuggestions,
          [fieldPath]: updatedSuggestions,
        },
        acceptedFields: updatedAcceptedFields,
      };
    }

    case 'REJECT_FIELD_SUGGESTION': {
      const { fieldPath, suggestionId } = action.payload;
      const suggestions = state.fieldSuggestions[fieldPath];

      if (!suggestions || suggestions.length === 0) return state;

      // If suggestionId provided, reject just that one; otherwise reject the first pending one
      const targetSuggestion = suggestionId
        ? suggestions.find(s => s.id === suggestionId)
        : suggestions.find(s => s.status === 'pending');

      if (!targetSuggestion) return state;

      // Update the target suggestion status to rejected
      const updatedSuggestions = suggestions.map(s => {
        if (s.id === targetSuggestion.id) {
          return {
            ...s,
            status: 'rejected' as const,
            rejectedSources: [...(s.rejectedSources || []), s.source],
          };
        }
        return s;
      });

      return {
        ...state,
        fieldSuggestions: {
          ...state.fieldSuggestions,
          [fieldPath]: updatedSuggestions,
        },
      };
    }

    case 'CLEAR_FIELD_SUGGESTIONS':
      return {
        ...state,
        fieldSuggestions: {},
        acceptedFields: {},
      };

    default:
      return null;
  }
}
