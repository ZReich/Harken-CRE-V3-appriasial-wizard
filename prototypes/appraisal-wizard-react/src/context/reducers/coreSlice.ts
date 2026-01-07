// src/context/reducers/coreSlice.ts
// Handles core wizard actions (template, property, improvements, owners, etc.)

import type { WizardState, WizardAction } from '../../types';
import { getInitialState } from './initialState';

/**
 * Handles core wizard actions.
 * Returns the updated state if handled, or null if not a core action.
 */
export function handleCoreAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload };

    case 'SET_PROPERTY_TYPE':
      return {
        ...state,
        propertyType: action.payload.type,
        propertySubtype: action.payload.subtype || null,
      };

    case 'SET_IMPROVEMENTS_INVENTORY':
      return { ...state, improvementsInventory: action.payload };

    case 'SET_MS_OCCUPANCY_CODE':
      return { ...state, msOccupancyCode: action.payload };

    case 'SET_SITE_IMPROVEMENTS':
      return { ...state, siteImprovements: action.payload };

    case 'SET_COST_APPROACH_BUILDING_SELECTIONS':
      return {
        ...state,
        costApproachBuildingSelections: {
          ...state.costApproachBuildingSelections,
          [action.payload.scenarioId]: action.payload.buildingIds,
        },
      };

    case 'SET_COST_APPROACH_BUILDING_COST_DATA': {
      const { scenarioId, buildingId, overrides } = action.payload;
      const scenarioCostData = state.costApproachBuildingCostData[scenarioId] || {};

      if (overrides === null) {
        // Remove overrides for this building
        const { [buildingId]: _, ...restBuildings } = scenarioCostData;
        return {
          ...state,
          costApproachBuildingCostData: {
            ...state.costApproachBuildingCostData,
            [scenarioId]: restBuildings,
          },
        };
      }

      return {
        ...state,
        costApproachBuildingCostData: {
          ...state.costApproachBuildingCostData,
          [scenarioId]: {
            ...scenarioCostData,
            [buildingId]: overrides,
          },
        },
      };
    }

    case 'SET_SUBJECT_DATA': {
      // Ensure subjectData exists with defaults
      const currentSubjectData = state.subjectData || {
        propertyName: '',
        address: { street: '', city: '', state: '', zip: '', county: '' },
        taxId: '',
        legalDescription: '',
      };
      return {
        ...state,
        subjectData: {
          ...currentSubjectData,
          ...action.payload,
          // Handle nested address update (merge, don't replace)
          address: action.payload.address
            ? { ...(currentSubjectData.address || {}), ...action.payload.address }
            : currentSubjectData.address,
          // Preserve coordinates if not explicitly being updated
          coordinates: action.payload.coordinates !== undefined
            ? action.payload.coordinates
            : currentSubjectData.coordinates,
          // Preserve cadastralData if not explicitly being updated
          cadastralData: action.payload.cadastralData !== undefined
            ? action.payload.cadastralData
            : currentSubjectData.cadastralData,
        },
      };
    }

    case 'ADD_OWNER':
      return {
        ...state,
        owners: [...state.owners, action.payload],
      };

    case 'UPDATE_OWNER':
      return {
        ...state,
        owners: state.owners.map(owner =>
          owner.id === action.payload.id
            ? { ...owner, ...action.payload.updates }
            : owner
        ),
      };

    case 'REMOVE_OWNER':
      return {
        ...state,
        owners: state.owners.filter(owner => owner.id !== action.payload),
      };

    case 'SET_OWNERS':
      return { ...state, owners: action.payload };

    case 'RESET':
      return getInitialState();

    default:
      return null;
  }
}
