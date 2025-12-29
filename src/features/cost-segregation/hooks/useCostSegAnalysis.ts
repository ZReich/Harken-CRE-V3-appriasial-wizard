/**
 * useCostSegAnalysis Hook
 * 
 * React hook for consuming cost segregation analysis in components.
 * Handles analysis generation, caching, and updates.
 */

import { useMemo, useCallback } from 'react';
import { useWizard } from '../../../context/WizardContext';
import type { CostSegAnalysis, CostSegSettings, DepreciationClass } from '../types';
import { 
  generateCostSegAnalysis, 
  hasCostApproachData,
  applyComponentOverride,
  updateTaxRate,
} from '../services/costSegService';
import { DEFAULT_TAX_RATE, getBonusRate } from '../constants';

interface UseCostSegAnalysisReturn {
  /** The current cost seg analysis (null if not available) */
  analysis: CostSegAnalysis | null;
  
  /** Whether cost seg is enabled for this appraisal */
  isEnabled: boolean;
  
  /** Whether the analysis is ready to be viewed/edited */
  isReady: boolean;
  
  /** Whether cost seg can be generated (has required data) */
  canGenerate: boolean;
  
  /** Whether the user has skipped cost seg */
  isSkipped: boolean;
  
  /** Current settings */
  settings: CostSegSettings | null;
  
  /** Enable or disable cost seg */
  setEnabled: (enabled: boolean) => void;
  
  /** Skip cost seg for this assignment */
  skipCostSeg: () => void;
  
  /** Generate or regenerate the analysis */
  generateAnalysis: () => CostSegAnalysis | null;
  
  /** Update a component's depreciation class */
  overrideComponent: (componentId: string, newClass: DepreciationClass, justification?: string) => void;
  
  /** Update the tax rate for projections */
  setTaxRate: (rate: number) => void;
  
  /** Save the current analysis to wizard state */
  saveAnalysis: (analysis: CostSegAnalysis) => void;
  
  /** Validation messages */
  validationMessages: string[];
}

/**
 * Hook for managing cost segregation analysis
 */
export function useCostSegAnalysis(): UseCostSegAnalysisReturn {
  const { state, setCostSegSettings, getCostSegSettings, isCostSegEnabled } = useWizard();
  
  const settings = getCostSegSettings() ?? null;
  const isEnabled = isCostSegEnabled();
  const isSkipped = settings?.skipped ?? false;
  
  // Check if we have the required data
  const canGenerate = useMemo(() => {
    // Must have Cost Approach selected
    const hasCostApproach = state.scenarios?.some(s => 
      s.approaches?.includes('Cost Approach')
    ) ?? false;
    
    if (!hasCostApproach) return false;
    
    return hasCostApproachData(state);
  }, [state.scenarios, state.improvementsInventory, state.landValuationData, state.siteImprovements]);
  
  // Get or generate the analysis
  const analysis = useMemo(() => {
    if (!isEnabled || isSkipped) return null;
    
    // Return stored analysis if available
    if (settings?.analysis) {
      return settings.analysis;
    }
    
    // Generate new analysis if we have data
    if (canGenerate) {
      return generateCostSegAnalysis(state);
    }
    
    return null;
  }, [isEnabled, isSkipped, settings?.analysis, canGenerate, state]);
  
  const isReady = analysis !== null;
  
  // Validation messages
  const validationMessages = useMemo(() => {
    const messages: string[] = [];
    
    if (!state.scenarios?.some(s => s.approaches?.includes('Cost Approach'))) {
      messages.push('Cost Approach must be selected for at least one scenario');
    }
    
    const buildings = state.improvementsInventory?.parcels?.flatMap(p => p.buildings) || [];
    if (buildings.length === 0) {
      messages.push('At least one building must be defined in Improvements Inventory');
    }
    
    if (!state.landValuationData?.concludedLandValue) {
      messages.push('Land valuation is recommended for accurate cost segregation');
    }
    
    return messages;
  }, [state]);
  
  // Actions
  const setEnabled = useCallback((enabled: boolean) => {
    const currentYear = new Date().getFullYear();
    const newSettings: CostSegSettings = {
      ...settings,
      enabled,
      skipped: false,
      taxRate: settings?.taxRate ?? DEFAULT_TAX_RATE,
      bonusRate: settings?.bonusRate ?? getBonusRate(currentYear),
    };
    setCostSegSettings(newSettings);
  }, [settings, setCostSegSettings]);
  
  const skipCostSeg = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const newSettings: CostSegSettings = {
      ...settings,
      enabled: settings?.enabled ?? false,
      skipped: true,
      taxRate: settings?.taxRate ?? DEFAULT_TAX_RATE,
      bonusRate: settings?.bonusRate ?? getBonusRate(currentYear),
    };
    setCostSegSettings(newSettings);
  }, [settings, setCostSegSettings]);
  
  const generateAnalysis = useCallback(() => {
    if (!canGenerate) return null;
    
    const newAnalysis = generateCostSegAnalysis(state);
    
    // Save to settings
    const currentYear = new Date().getFullYear();
    const newSettings: CostSegSettings = {
      ...settings,
      enabled: true,
      skipped: false,
      analysis: newAnalysis,
      taxRate: settings?.taxRate ?? DEFAULT_TAX_RATE,
      bonusRate: settings?.bonusRate ?? getBonusRate(currentYear),
    };
    setCostSegSettings(newSettings);
    
    return newAnalysis;
  }, [canGenerate, state, settings, setCostSegSettings]);
  
  const overrideComponent = useCallback((
    componentId: string, 
    newClass: DepreciationClass, 
    justification?: string
  ) => {
    if (!analysis) return;
    
    const updatedAnalysis = applyComponentOverride(analysis, componentId, newClass, justification);
    
    const currentYear = new Date().getFullYear();
    const newSettings: CostSegSettings = {
      ...settings,
      enabled: true,
      skipped: false,
      analysis: updatedAnalysis,
      taxRate: settings?.taxRate ?? DEFAULT_TAX_RATE,
      bonusRate: settings?.bonusRate ?? getBonusRate(currentYear),
    };
    setCostSegSettings(newSettings);
  }, [analysis, settings, setCostSegSettings]);
  
  const setTaxRate = useCallback((rate: number) => {
    const currentYear = new Date().getFullYear();
    let updatedAnalysis = analysis;
    
    if (analysis) {
      updatedAnalysis = updateTaxRate(analysis, rate);
    }
    
    const newSettings: CostSegSettings = {
      ...settings,
      enabled: settings?.enabled ?? false,
      skipped: settings?.skipped ?? false,
      analysis: updatedAnalysis ?? undefined,
      taxRate: rate,
      bonusRate: settings?.bonusRate ?? getBonusRate(currentYear),
    };
    setCostSegSettings(newSettings);
  }, [analysis, settings, setCostSegSettings]);
  
  const saveAnalysis = useCallback((newAnalysis: CostSegAnalysis) => {
    const currentYear = new Date().getFullYear();
    const newSettings: CostSegSettings = {
      ...settings,
      enabled: true,
      skipped: false,
      analysis: newAnalysis,
      taxRate: newAnalysis.taxRate ?? settings?.taxRate ?? DEFAULT_TAX_RATE,
      bonusRate: newAnalysis.bonusDepreciationRate ?? settings?.bonusRate ?? getBonusRate(currentYear),
    };
    setCostSegSettings(newSettings);
  }, [settings, setCostSegSettings]);
  
  return {
    analysis,
    isEnabled,
    isReady,
    canGenerate,
    isSkipped,
    settings,
    setEnabled,
    skipCostSeg,
    generateAnalysis,
    overrideComponent,
    setTaxRate,
    saveAnalysis,
    validationMessages,
  };
}

export default useCostSegAnalysis;

