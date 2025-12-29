/**
 * useCostSegAnalysis Hook
 * 
 * React hook for generating and managing cost segregation analysis
 * using data from the wizard context.
 */

import { useState, useMemo, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import {
  generateCostSegAnalysis,
  applyComponentOverride,
  resetAnalysisOverrides,
  type GenerateCostSegInput,
} from '../services/costSegregationService';
import type { CostSegAnalysis, CostSegConfig } from '../types';
import { DepreciationClass } from '../constants/costSegregation';

export interface UseCostSegAnalysisOptions {
  /** Auto-generate analysis when data is available */
  autoGenerate?: boolean;
  /** Custom configuration options */
  config?: Partial<CostSegConfig>;
}

export interface UseCostSegAnalysisReturn {
  /** The generated cost segregation analysis */
  analysis: CostSegAnalysis | null;
  
  /** Whether all required data is available for analysis */
  isReady: boolean;
  
  /** Whether the user can generate (has minimum required data, even if not fully complete) */
  canGenerate: boolean;
  
  /** Whether Cost Segregation is enabled in Setup */
  isCostSegEnabled: boolean;
  
  /** Whether Cost Approach is selected in any scenario */
  hasCostApproach: boolean;
  
  /** Whether Cost Approach has been completed with a value conclusion */
  isCostApproachComplete: boolean;
  
  /** Whether the analysis is currently being generated */
  isGenerating: boolean;
  
  /** Any error that occurred during generation */
  error: string | null;
  
  /** Generate or regenerate the analysis */
  generate: () => void;
  
  /** Apply a depreciation class override to a component */
  applyOverride: (componentId: string, newClass: DepreciationClass, reason?: string) => void;
  
  /** Reset all overrides */
  resetOverrides: () => void;
  
  /** Summary data for quick display */
  summary: {
    totalProjectCost: number;
    landValue: number;
    totalImprovementCost: number;
    fiveYearTotal: number;
    fiveYearPercent: number;
    fifteenYearTotal: number;
    fifteenYearPercent: number;
    thirtyNineYearTotal: number;
    thirtyNineYearPercent: number;
    firstYearDepreciation: number;
    acceleratedBenefit: number;
  } | null;
  
  /** Missing data that prevents analysis */
  missingData: string[];
  
  /** Validation errors (e.g., Cost Approach not complete) */
  validationErrors: string[];
}

/**
 * Hook to generate and manage cost segregation analysis.
 * Pulls data from wizard context and provides a reactive interface.
 */
export function useCostSegAnalysis(
  options: UseCostSegAnalysisOptions = {}
): UseCostSegAnalysisReturn {
  const { autoGenerate = false, config: customConfig } = options;
  const { state } = useWizard();
  
  const [analysis, setAnalysis] = useState<CostSegAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [componentOverrides, setComponentOverrides] = useState<Record<string, DepreciationClass>>({});

  // Check what data is available and validation requirements
  const dataCheck = useMemo(() => {
    const missing: string[] = [];
    const validationErrors: string[] = [];
    
    // Check if Cost Segregation is enabled in setup
    const isCostSegEnabled = state.subjectData?.costSegregationEnabled === true;
    if (!isCostSegEnabled) {
      validationErrors.push('Cost Segregation is not enabled. Enable it in Setup when selecting Cost Approach.');
    }
    
    // Check if Cost Approach is selected in at least one scenario
    const hasCostApproach = state.scenarios?.some(s => s.approaches?.includes('Cost Approach'));
    if (!hasCostApproach) {
      validationErrors.push('Cost Approach must be selected in at least one scenario.');
    }
    
    // Check if Cost Approach has been completed (has a value conclusion)
    const costApproachConclusion = state.analysisConclusions?.conclusions.find(
      c => c.approach === 'Cost Approach' && c.valueConclusion !== null && c.valueConclusion > 0
    );
    const isCostApproachComplete = !!costApproachConclusion;
    if (hasCostApproach && !isCostApproachComplete) {
      validationErrors.push('Complete the Cost Approach analysis first to generate cost segregation.');
    }
    
    // Required: Occupancy code or property type
    const occupancyCode = state.msOccupancyCode || mapPropertyTypeToOccupancy(state.propertyType);
    if (!occupancyCode) {
      missing.push('Property type or M&S occupancy code');
    }
    
    // Required: Building inventory data
    const hasBuildings = state.improvementsInventory?.parcels?.some(p => p.buildings?.length > 0);
    if (!hasBuildings) {
      missing.push('Building inventory data');
    }
    
    // Combine all issues
    const allMissingData = [...validationErrors, ...missing];
    
    return {
      occupancyCode: occupancyCode || 'office-lowrise',
      hasBuildings,
      hasCostApproach,
      isCostApproachComplete,
      isCostSegEnabled,
      missingData: allMissingData,
      validationErrors,
      isReady: allMissingData.length === 0,
      canGenerate: isCostSegEnabled && hasCostApproach && hasBuildings && Boolean(occupancyCode),
    };
  }, [
    state.msOccupancyCode, 
    state.propertyType, 
    state.improvementsInventory, 
    state.subjectData?.costSegregationEnabled,
    state.scenarios,
    state.analysisConclusions,
  ]);

  // Extract cost data from wizard state
  const costData = useMemo(() => {
    // Try to get from cost approach conclusions
    const costApproachConclusion = state.analysisConclusions?.conclusions.find(
      c => c.approach === 'Cost Approach' && c.scenarioId === state.activeScenarioId
    );
    
    // If we have a concluded value, use it
    let totalProjectCost = costApproachConclusion?.valueConclusion || 0;
    
    // Estimate from land valuation if available
    const landValue = state.landValuationData?.concludedLandValue || 0;
    
    // If no cost approach data, try to estimate from building inventory
    if (totalProjectCost === 0 && state.improvementsInventory?.parcels) {
      // Rough estimate: $150/SF for commercial buildings
      const totalSF = state.improvementsInventory.parcels.reduce((sum, parcel) => {
        return sum + parcel.buildings.reduce((bSum, b) => {
          return bSum + b.areas.reduce((aSum, a) => aSum + (a.squareFootage || 0), 0);
        }, 0);
      }, 0);
      totalProjectCost = totalSF * 150;
    }
    
    // Site improvements value
    const siteImprovementsCost = state.siteImprovements?.reduce(
      (sum, si) => sum + (si.contributoryValue || si.replacementCostNew || 0),
      0
    ) || 0;
    
    // Building cost = total - land - site improvements
    const buildingCost = Math.max(0, totalProjectCost - landValue - siteImprovementsCost);
    
    return {
      totalProjectCost,
      landValue,
      buildingCost,
      siteImprovementsCost,
    };
  }, [
    state.analysisConclusions,
    state.activeScenarioId,
    state.landValuationData,
    state.improvementsInventory,
    state.siteImprovements,
  ]);

  // Generate analysis
  const generate = useCallback(() => {
    if (!dataCheck.isReady && !autoGenerate) {
      setError('Missing required data for cost segregation analysis');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const input: GenerateCostSegInput = {
        propertyId: state.subjectData?.taxId || 'unknown',
        propertyName: state.subjectData?.propertyName || 'Subject Property',
        propertyAddress: formatAddress(state.subjectData?.address),
        occupancyCode: dataCheck.occupancyCode,
        isResidential: isResidentialProperty(state.propertyType),
        totalProjectCost: costData.totalProjectCost,
        landValue: costData.landValue,
        totalBuildingCost: costData.buildingCost,
        totalSiteImprovementCost: costData.siteImprovementsCost,
        improvementsInventory: state.improvementsInventory,
        siteImprovements: state.siteImprovements,
        config: customConfig,
        componentOverrides,
      };

      const result = generateCostSegAnalysis(input);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setIsGenerating(false);
    }
  }, [
    dataCheck,
    costData,
    state.subjectData,
    state.propertyType,
    state.improvementsInventory,
    state.siteImprovements,
    customConfig,
    componentOverrides,
    autoGenerate,
  ]);

  // Apply override
  const applyOverride = useCallback((
    componentId: string,
    newClass: DepreciationClass,
    reason?: string
  ) => {
    if (!analysis) return;
    
    // Update local overrides
    setComponentOverrides(prev => ({
      ...prev,
      [componentId]: newClass,
    }));
    
    // Apply to analysis
    const updated = applyComponentOverride(analysis, componentId, newClass, reason);
    setAnalysis(updated);
  }, [analysis]);

  // Reset overrides
  const resetOverrides = useCallback(() => {
    if (!analysis) return;
    
    setComponentOverrides({});
    const reset = resetAnalysisOverrides(analysis);
    setAnalysis(reset);
  }, [analysis]);

  // Summary data
  const summary = useMemo(() => {
    if (!analysis) return null;
    
    return {
      totalProjectCost: analysis.totalProjectCost,
      landValue: analysis.landValue,
      totalImprovementCost: analysis.totalImprovementCost,
      fiveYearTotal: analysis.summary.fiveYear.total,
      fiveYearPercent: analysis.summary.fiveYear.percent,
      fifteenYearTotal: analysis.summary.fifteenYear.total,
      fifteenYearPercent: analysis.summary.fifteenYear.percent,
      thirtyNineYearTotal: analysis.summary.thirtyNineYear.total,
      thirtyNineYearPercent: analysis.summary.thirtyNineYear.percent,
      firstYearDepreciation: analysis.firstYearDepreciation,
      acceleratedBenefit: analysis.acceleratedBenefit,
    };
  }, [analysis]);

  // Auto-generate on mount if enabled and ready
  // Note: Using autoGenerate in dependencies intentionally
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    if (autoGenerate && dataCheck.isReady && !analysis && !isGenerating) {
      generate();
    }
  }, [autoGenerate, dataCheck.isReady]);

  return {
    analysis,
    isReady: dataCheck.isReady,
    canGenerate: dataCheck.canGenerate,
    isCostSegEnabled: dataCheck.isCostSegEnabled,
    hasCostApproach: dataCheck.hasCostApproach,
    isCostApproachComplete: dataCheck.isCostApproachComplete,
    isGenerating,
    error,
    generate,
    applyOverride,
    resetOverrides,
    summary,
    missingData: dataCheck.missingData,
    validationErrors: dataCheck.validationErrors,
  };
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Map property type to occupancy code.
 */
function mapPropertyTypeToOccupancy(propertyType: string | null): string | null {
  if (!propertyType) return null;
  
  const mapping: Record<string, string> = {
    'office': 'office-lowrise',
    'retail': 'retail-strip',
    'industrial': 'warehouse-distribution',
    'warehouse': 'warehouse-distribution',
    'multifamily': 'apartment-garden',
    'hotel': 'hotel-limited-service',
    'medical': 'medical-office',
    'manufacturing': 'manufacturing-light',
  };
  
  const normalized = propertyType.toLowerCase();
  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Check if property type is residential (27.5-year vs 39-year).
 */
function isResidentialProperty(propertyType: string | null): boolean {
  if (!propertyType) return false;
  const normalized = propertyType.toLowerCase();
  return normalized.includes('multifamily') || 
         normalized.includes('apartment') || 
         normalized.includes('residential');
}

/**
 * Format address from subject data.
 */
function formatAddress(address?: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}): string {
  if (!address) return '';
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip,
  ].filter(Boolean);
  return parts.join(', ');
}

export default useCostSegAnalysis;

