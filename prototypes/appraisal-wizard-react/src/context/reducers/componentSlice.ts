// src/context/reducers/componentSlice.ts
// Reducer slice for Property Components (Mixed-Use Architecture)

import type { WizardState, WizardAction, PropertyComponent, IncomeApproachInstance, ComponentReconciliation } from '../../types';

/**
 * Handles property component actions for mixed-use properties.
 * Manages the component-based model that replaces single property type selection.
 */
export function handleComponentAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    // =========================================================
    // PROPERTY COMPONENT ACTIONS
    // =========================================================

    case 'ADD_PROPERTY_COMPONENT': {
      const newComponent = action.payload as PropertyComponent;
      return {
        ...state,
        propertyComponents: [...state.propertyComponents, newComponent],
        lastModified: new Date().toISOString(),
      };
    }

    case 'UPDATE_PROPERTY_COMPONENT': {
      const { id, updates } = action.payload as { id: string; updates: Partial<PropertyComponent> };
      return {
        ...state,
        propertyComponents: state.propertyComponents.map(comp =>
          comp.id === id ? { ...comp, ...updates } : comp
        ),
        lastModified: new Date().toISOString(),
      };
    }

    case 'REMOVE_PROPERTY_COMPONENT': {
      const componentId = action.payload as string;
      return {
        ...state,
        propertyComponents: state.propertyComponents.filter(comp => comp.id !== componentId),
        // Also remove any associated income approach instances
        incomeApproachInstances: state.incomeApproachInstances.filter(
          inst => inst.componentId !== componentId
        ),
        // Clear active component if it was the one removed
        activeComponentId: state.activeComponentId === componentId ? null : state.activeComponentId,
        lastModified: new Date().toISOString(),
      };
    }

    case 'REORDER_PROPERTY_COMPONENTS': {
      const orderedIds = action.payload as string[];
      const reorderedComponents = orderedIds
        .map((id, index) => {
          const comp = state.propertyComponents.find(c => c.id === id);
          if (comp) {
            return { ...comp, sortOrder: index, isPrimary: index === 0 };
          }
          return null;
        })
        .filter((c): c is PropertyComponent => c !== null);

      return {
        ...state,
        propertyComponents: reorderedComponents,
        lastModified: new Date().toISOString(),
      };
    }

    case 'SET_ACTIVE_COMPONENT': {
      return {
        ...state,
        activeComponentId: action.payload as string | null,
      };
    }

    // =========================================================
    // INCOME APPROACH INSTANCE ACTIONS
    // =========================================================

    case 'ADD_INCOME_APPROACH_INSTANCE': {
      const newInstance = action.payload as IncomeApproachInstance;
      return {
        ...state,
        incomeApproachInstances: [...state.incomeApproachInstances, newInstance],
        lastModified: new Date().toISOString(),
      };
    }

    case 'UPDATE_INCOME_APPROACH_INSTANCE': {
      const { id, updates } = action.payload as { id: string; updates: Partial<IncomeApproachInstance> };
      return {
        ...state,
        incomeApproachInstances: state.incomeApproachInstances.map(inst =>
          inst.id === id ? { ...inst, ...updates } : inst
        ),
        lastModified: new Date().toISOString(),
      };
    }

    case 'REMOVE_INCOME_APPROACH_INSTANCE': {
      const instanceId = action.payload as string;
      return {
        ...state,
        incomeApproachInstances: state.incomeApproachInstances.filter(
          inst => inst.id !== instanceId
        ),
        lastModified: new Date().toISOString(),
      };
    }

    // =========================================================
    // INCOME LINE TO RENT COMP LINKING
    // =========================================================

    case 'LINK_RENT_COMP_TO_INCOME_LINE': {
      const { instanceId, lineId, rentCompId } = action.payload as {
        instanceId: string;
        lineId: string;
        rentCompId: string;
      };

      return {
        ...state,
        incomeApproachInstances: state.incomeApproachInstances.map(inst => {
          if (inst.id !== instanceId) return inst;

          return {
            ...inst,
            incomeLineItems: inst.incomeLineItems.map(line => {
              if (line.id !== lineId) return line;
              // Add rentCompId if not already linked
              const linked = line.linkedRentCompIds.includes(rentCompId)
                ? line.linkedRentCompIds
                : [...line.linkedRentCompIds, rentCompId];
              return { ...line, linkedRentCompIds: linked };
            }),
          };
        }),
        lastModified: new Date().toISOString(),
      };
    }

    case 'UNLINK_RENT_COMP_FROM_INCOME_LINE': {
      const { instanceId, lineId, rentCompId } = action.payload as {
        instanceId: string;
        lineId: string;
        rentCompId: string;
      };

      return {
        ...state,
        incomeApproachInstances: state.incomeApproachInstances.map(inst => {
          if (inst.id !== instanceId) return inst;

          return {
            ...inst,
            incomeLineItems: inst.incomeLineItems.map(line => {
              if (line.id !== lineId) return line;
              return {
                ...line,
                linkedRentCompIds: line.linkedRentCompIds.filter(id => id !== rentCompId),
              };
            }),
          };
        }),
        lastModified: new Date().toISOString(),
      };
    }

    // =========================================================
    // COMPONENT RECONCILIATION ACTIONS
    // =========================================================

    case 'UPDATE_COMPONENT_RECONCILIATION': {
      const { scenarioId, reconciliation } = action.payload as {
        scenarioId: number;
        reconciliation: ComponentReconciliation;
      };

      // Find or create scenario reconciliation
      const existingIndex = state.scenarioReconciliations.findIndex(
        sr => sr.scenarioId === scenarioId
      );

      if (existingIndex >= 0) {
        // Update existing scenario reconciliation
        const scenarioRecon = state.scenarioReconciliations[existingIndex];
        const compIndex = scenarioRecon.componentReconciliations.findIndex(
          cr => cr.componentId === reconciliation.componentId
        );

        let updatedComponentReconciliations;
        if (compIndex >= 0) {
          // Update existing component reconciliation
          updatedComponentReconciliations = [...scenarioRecon.componentReconciliations];
          updatedComponentReconciliations[compIndex] = reconciliation;
        } else {
          // Add new component reconciliation
          updatedComponentReconciliations = [
            ...scenarioRecon.componentReconciliations,
            reconciliation,
          ];
        }

        // Recalculate totals
        const totalMarketValue = updatedComponentReconciliations.reduce(
          (sum, cr) => sum + cr.reconciledValue,
          0
        );

        const valueBreakdown = updatedComponentReconciliations.map(cr => ({
          componentId: cr.componentId,
          componentName: cr.componentName,
          value: cr.reconciledValue,
          percentOfTotal: totalMarketValue > 0 ? (cr.reconciledValue / totalMarketValue) * 100 : 0,
        }));

        const updatedScenarioReconciliations = [...state.scenarioReconciliations];
        updatedScenarioReconciliations[existingIndex] = {
          ...scenarioRecon,
          componentReconciliations: updatedComponentReconciliations,
          totalMarketValue,
          valueBreakdown,
        };

        return {
          ...state,
          scenarioReconciliations: updatedScenarioReconciliations,
          lastModified: new Date().toISOString(),
        };
      } else {
        // Create new scenario reconciliation
        const totalMarketValue = reconciliation.reconciledValue;
        const newScenarioRecon = {
          scenarioId,
          componentReconciliations: [reconciliation],
          totalMarketValue,
          valueBreakdown: [
            {
              componentId: reconciliation.componentId,
              componentName: reconciliation.componentName,
              value: reconciliation.reconciledValue,
              percentOfTotal: 100,
            },
          ],
        };

        return {
          ...state,
          scenarioReconciliations: [...state.scenarioReconciliations, newScenarioRecon],
          lastModified: new Date().toISOString(),
        };
      }
    }

    case 'RECALCULATE_SCENARIO_TOTALS': {
      const scenarioId = action.payload as number;
      const scenarioIndex = state.scenarioReconciliations.findIndex(
        sr => sr.scenarioId === scenarioId
      );

      if (scenarioIndex < 0) return state;

      const scenarioRecon = state.scenarioReconciliations[scenarioIndex];
      const totalMarketValue = scenarioRecon.componentReconciliations.reduce(
        (sum, cr) => sum + cr.reconciledValue,
        0
      );

      const valueBreakdown = scenarioRecon.componentReconciliations.map(cr => ({
        componentId: cr.componentId,
        componentName: cr.componentName,
        value: cr.reconciledValue,
        percentOfTotal: totalMarketValue > 0 ? (cr.reconciledValue / totalMarketValue) * 100 : 0,
      }));

      const updatedScenarioReconciliations = [...state.scenarioReconciliations];
      updatedScenarioReconciliations[scenarioIndex] = {
        ...scenarioRecon,
        totalMarketValue,
        valueBreakdown,
      };

      return {
        ...state,
        scenarioReconciliations: updatedScenarioReconciliations,
        lastModified: new Date().toISOString(),
      };
    }

    default:
      return null; // Action not handled by this slice
  }
}
