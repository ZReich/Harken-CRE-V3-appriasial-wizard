// src/context/reducers/analysisSlice.ts
// Handles analysis data actions (demographics, SWOT, sales comparison, etc.)

import type { WizardState, WizardAction } from '../../types';

/**
 * Handles analysis data actions.
 * Returns the updated state if handled, or null if not an analysis action.
 */
export function handleAnalysisAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    case 'SET_DEMOGRAPHICS_DATA':
      return {
        ...state,
        demographicsData: action.payload,
      };

    case 'SET_ECONOMIC_INDICATORS':
      return {
        ...state,
        economicIndicators: action.payload,
      };

    case 'SET_ECONOMIC_CHART_STYLE':
      return {
        ...state,
        economicChartStyle: action.payload,
      };

    case 'SET_SWOT_ANALYSIS':
      return {
        ...state,
        swotAnalysis: action.payload,
      };

    case 'SET_RISK_RATING':
      return {
        ...state,
        riskRating: action.payload,
      };

    case 'SET_SALES_COMPARISON_DATA':
      return {
        ...state,
        salesComparisonData: action.payload,
      };
    case 'SET_SALES_COMPARISON_DATA_FOR_COMPONENT': {
      const { componentId, scenarioId, data } = action.payload;
      const nextByComponent = {
        ...(state.salesComparisonDataByComponent || {}),
        [componentId]: {
          ...(state.salesComparisonDataByComponent?.[componentId] || {}),
          [scenarioId]: data,
        },
      };
      return {
        ...state,
        salesComparisonDataByComponent: nextByComponent,
        // Keep legacy salesComparisonData in sync for primary component
        salesComparisonData: componentId === 'primary' ? data : state.salesComparisonData,
      };
    }

    case 'SET_LAND_VALUATION_DATA':
      return {
        ...state,
        landValuationData: action.payload,
      };

    case 'SET_HBU_ANALYSIS':
      return {
        ...state,
        hbuAnalysis: action.payload,
      };

    case 'SET_MARKET_ANALYSIS':
      return {
        ...state,
        marketAnalysis: action.payload,
      };

    case 'SET_INCOME_APPROACH_DATA':
      return {
        ...state,
        incomeApproachData: action.payload,
      };

    case 'SET_RECONCILIATION_DATA':
      return { ...state, reconciliationData: action.payload };

    default:
      return null;
  }
}
