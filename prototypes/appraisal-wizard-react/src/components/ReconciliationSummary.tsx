import React, { useState, useMemo, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';


interface ReconciliationSummaryProps {
  scenarioId: number;
  propertyType?: string;
  unitBasis?: 'sf' | 'unit' | 'acre';
  totalUnits?: number; // SF, units, or acres
  className?: string;
}

/**
 * ReconciliationSummary - Displays approach values with editable weights
 * 
 * Features:
 * - Shows only approaches active for current scenario
 * - Hover-reveal slider for weight editing
 * - Auto-normalizes weights to 100%
 * - Calculates weighted average value
 * - Shows $/Unit or $/SF based on property type
 */
export const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({
  scenarioId,
  propertyType: _propertyType = 'commercial',
  unitBasis = 'sf',
  totalUnits = 1,
  className = '',
}) => {
  void _propertyType; // Reserved for future property-type-specific display
  const { state, setReconciliationData } = useWizard();
  const { scenarios, analysisConclusions, reconciliationData } = state;

  // Get the active scenario
  const scenario = useMemo(() => {
    return scenarios.find(s => s.id === scenarioId);
  }, [scenarios, scenarioId]);

  // Get approach values from analysisConclusions
  const approachValues = useMemo(() => {
    if (!scenario) return [];
    
    return scenario.approaches.map(approachName => {
      const conclusion = analysisConclusions?.conclusions?.find(
        c => c.scenarioId === scenarioId && c.approach === approachName
      );
      return {
        approach: approachName,
        value: conclusion?.valueConclusion || 0,
      };
    }).filter(av => av.value > 0); // Only show approaches with concluded values
  }, [scenario, analysisConclusions, scenarioId]);

  // Get weights from reconciliationData or initialize defaults
  const getInitialWeights = useCallback(() => {
    const existingRecon = reconciliationData?.scenarioReconciliations?.find(
      r => r.scenarioId === scenarioId
    );
    
    if (existingRecon && Object.keys(existingRecon.weights).length > 0) {
      return existingRecon.weights;
    }
    
    // Default: equal weights
    const count = approachValues.length;
    if (count === 0) return {};
    
    const equalWeight = 100 / count;
    return approachValues.reduce((acc, av) => {
      acc[av.approach] = Math.round(equalWeight);
      return acc;
    }, {} as Record<string, number>);
  }, [reconciliationData, scenarioId, approachValues]);

  const [weights, setWeights] = useState<Record<string, number>>(getInitialWeights);
  const [hoveredApproach, setHoveredApproach] = useState<string | null>(null);

  // Update weight and normalize
  const updateWeight = useCallback((approach: string, newWeight: number) => {
    const clampedWeight = Math.max(0, Math.min(100, newWeight));
    
    setWeights(prev => {
      const updated = { ...prev, [approach]: clampedWeight };
      
      // Calculate total and normalize others proportionally
      const totalWithoutCurrent = Object.entries(updated)
        .filter(([key]) => key !== approach)
        .reduce((sum, [, w]) => sum + w, 0);
      
      // If we're at 100% or below, we're good
      const total = clampedWeight + totalWithoutCurrent;
      if (total <= 100) {
        return updated;
      }
      
      // Need to reduce other weights proportionally
      const excess = total - 100;
      const reductionFactor = totalWithoutCurrent > 0 
        ? (totalWithoutCurrent - excess) / totalWithoutCurrent 
        : 0;
      
      const normalized: Record<string, number> = {};
      for (const [key, value] of Object.entries(updated)) {
        if (key === approach) {
          normalized[key] = clampedWeight;
        } else {
          normalized[key] = Math.max(0, Math.round(value * reductionFactor));
        }
      }
      
      return normalized;
    });
  }, []);

  // Sync weights to WizardContext
  React.useEffect(() => {
    if (!reconciliationData) return;
    
    const existingRecons = reconciliationData.scenarioReconciliations || [];
    const existingIndex = existingRecons.findIndex(r => r.scenarioId === scenarioId);
    
    if (existingIndex >= 0) {
      const updated = [...existingRecons];
      updated[existingIndex] = { ...updated[existingIndex], weights };
      setReconciliationData({
        ...reconciliationData,
        scenarioReconciliations: updated,
      });
    } else {
      setReconciliationData({
        ...reconciliationData,
        scenarioReconciliations: [
          ...existingRecons,
          { scenarioId, weights, comments: '' },
        ],
      });
    }
  }, [weights, scenarioId, reconciliationData, setReconciliationData]);

  // Calculate weighted total
  const weightedTotal = useMemo(() => {
    return approachValues.reduce((sum, av) => {
      const weight = weights[av.approach] || 0;
      return sum + (av.value * weight / 100);
    }, 0);
  }, [approachValues, weights]);

  // Calculate total weight (for display)
  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((sum, w) => sum + w, 0);
  }, [weights]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get unit label
  const unitLabel = unitBasis === 'sf' ? '/SF' : unitBasis === 'unit' ? '/Unit' : '/Acre';

  // Get approach short name
  const getShortName = (approach: string) => {
    switch (approach) {
      case 'Sales Comparison': return 'SALES';
      case 'Income Approach': return 'INCOME';
      case 'Cost Approach': return 'COST';
      case 'Land Valuation': return 'LAND';
      default: return approach.toUpperCase();
    }
  };

  // Get approach color - using Harken theme accent variations
  const getApproachColor = (approach: string) => {
    // All approaches use the Harken accent palette for consistency
    // Slight opacity/shade variations provide differentiation without clashing
    switch (approach) {
      case 'Sales Comparison': 
        return { bg: 'bg-[#4db8d1]/10', border: 'border-[#4db8d1]', text: 'text-[#0da1c7]' };
      case 'Income Approach': 
        return { bg: 'bg-[#4db8d1]/10', border: 'border-[#0da1c7]', text: 'text-[#0da1c7]' };
      case 'Cost Approach': 
        return { bg: 'bg-[#4db8d1]/10', border: 'border-[#4db8d1]', text: 'text-[#0da1c7]' };
      case 'Land Valuation': 
        return { bg: 'bg-[#4db8d1]/10', border: 'border-[#7fcce0]', text: 'text-[#0da1c7]' };
      case 'Multi-Family Approach': 
        return { bg: 'bg-[#4db8d1]/10', border: 'border-[#4db8d1]', text: 'text-[#0da1c7]' };
      default: 
        return { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600' };
    }
  };

  if (approachValues.length === 0) {
    return (
      <div className={`bg-white border border-slate-200 rounded-xl p-4 ${className}`}>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Reconciliation Summary
        </h4>
        <p className="text-sm text-slate-500 italic">
          Complete at least one approach to see value reconciliation
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Reconciliation Summary
        </h4>
      </div>

      {/* Approach rows */}
      <div className="divide-y divide-slate-100">
        {approachValues.map(av => {
          const colors = getApproachColor(av.approach);
          const weight = weights[av.approach] || 0;
          const perUnit = totalUnits > 0 ? av.value / totalUnits : 0;
          const isHovered = hoveredApproach === av.approach;
          
          return (
            <div
              key={av.approach}
              className={`px-4 py-3 transition-colors ${isHovered ? colors.bg : ''}`}
              onMouseEnter={() => setHoveredApproach(av.approach)}
              onMouseLeave={() => setHoveredApproach(null)}
            >
              {/* Approach name */}
              <div className={`text-xs font-bold uppercase tracking-wider ${colors.text} mb-1`}>
                {getShortName(av.approach)}
              </div>
              
              {/* Value and weight row */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-black text-slate-800 dark:text-white">
                    {formatCurrency(av.value)}
                  </span>
                  <span className="text-sm font-bold text-slate-400 ml-2">
                    {weight}%
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  ${Math.round(perUnit).toLocaleString()}{unitLabel}
                </div>
              </div>
              
              {/* Hover-reveal slider */}
              <div 
                className={`transition-all duration-200 overflow-hidden ${
                  isHovered ? 'max-h-12 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weight}
                  onChange={(e) => updateWeight(av.approach, parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0da1c7]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weighted total */}
      <div className="px-4 py-4 text-white" style={{ backgroundColor: '#1c3643' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7fcce0]">
            Weighted Total
          </span>
          {totalWeight !== 100 && (
            <span className="text-xs font-medium text-amber-400">
              (Weights: {totalWeight}%)
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black">
            {formatCurrency(weightedTotal)}
          </span>
          <span className="text-sm font-medium text-[#7fcce0]">
            ${totalUnits > 0 ? Math.round(weightedTotal / totalUnits).toLocaleString() : 0}{unitLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationSummary;

