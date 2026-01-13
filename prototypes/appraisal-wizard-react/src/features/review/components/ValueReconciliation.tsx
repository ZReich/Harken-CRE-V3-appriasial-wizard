import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useWizard } from '../../../context/WizardContext';
import { APPROACH_COLORS } from '../constants';
import { DEFAULT_CERTIFICATIONS } from '../types';
import type { ScenarioReconciliation } from '../types';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import {
  calculateAIWeights,
  getIncomeSubMethodValues,
  getTypicalExposureRanges,
  type WeightCalculationResult
} from '../utils/weightCalculator';
import {
  type ReconciliationContextData,
  type ExposureContextData,
} from '../prompts/reconciliationPrompts';

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function formatCurrency(value: number | null | undefined): string {
  if (value == null || value === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getApproachIcon(approachName: string) {
  if (approachName.includes('Sales')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (approachName.includes('Income')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (approachName.includes('Multi-Family')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (approachName.includes('Land')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    );
  }
  // Cost Approach (default)
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

// =================================================================
// VALUE RECONCILIATION COMPONENT
// =================================================================

export function ValueReconciliation() {
  const { state, getIncomeApproachData, setReconciliationData } = useWizard();
  const { scenarios, improvementsInventory, extractedData, reconciliationData } = state;

  // Local state for reconciliation data
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [reconciliations, setReconciliations] = useState<ScenarioReconciliation[]>(() =>
    reconciliationData?.scenarioReconciliations || scenarios.map((s) => ({
      scenarioId: s.id,
      weights: {}, // Start with empty weights - user must enter or use AI
      comments: '',
    }))
  );

  // Exposure time as ranges
  const [exposureMin, setExposureMin] = useState<string>(
    () => reconciliationData?.exposurePeriod?.toString() || ''
  );
  const [exposureMax, setExposureMax] = useState<string>('');
  const [marketingMin, setMarketingMin] = useState<string>(
    () => reconciliationData?.marketingTime?.toString() || ''
  );
  const [marketingMax, setMarketingMax] = useState<string>('');
  const [exposureRationale, setExposureRationale] = useState(
    () => reconciliationData?.exposureRationale || ''
  );
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>(
    () => reconciliationData?.certifications || []
  );

  // Income sub-method visibility
  const [incomeExpanded, setIncomeExpanded] = useState(false);

  // AI weight suggestion state
  const [aiWeightResult, setAiWeightResult] = useState<WeightCalculationResult | null>(null);
  const [showAiExplanation, setShowAiExplanation] = useState(false);

  // Get property info from state
  const propertyName = useMemo(() => {
    if (improvementsInventory?.parcels?.[0]?.buildings?.[0]?.name) {
      return improvementsInventory.parcels[0].buildings[0].name;
    }
    if (extractedData?.cadastral?.propertyName?.value) {
      return extractedData.cadastral.propertyName.value;
    }
    return 'Subject Property';
  }, [improvementsInventory, extractedData]);

  const propertyLocation = useMemo(() => {
    if (extractedData?.cadastral?.address?.value) {
      return extractedData.cadastral.address.value;
    }
    if (improvementsInventory?.parcels?.[0]?.address) {
      return improvementsInventory.parcels[0].address;
    }
    return 'Location Not Specified';
  }, [extractedData, improvementsInventory]);

  // Get typical exposure ranges for guidance
  const typicalRanges = useMemo(() =>
    getTypicalExposureRanges(state.propertyType || 'commercial'),
    [state.propertyType]
  );

  // Get income sub-method values - use actual data or mock values for demo
  const incomeSubMethods = useMemo(() => {
    const incomeData = getIncomeApproachData();
    const calculated = getIncomeSubMethodValues(incomeData);

    // If no actual data, use mock values for demo purposes
    if (calculated.directCapValue === 0 && calculated.dcfValue === 0) {
      return {
        directCapValue: 1240000,
        dcfValue: 1260000,
        reconciledValue: 1250000,
      };
    }
    return calculated;
  }, [getIncomeApproachData]);

  // Get approach value for a scenario
  const getApproachValue = useCallback((scenarioId: number, approachName: string): number | null => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario?.approaches.includes(approachName)) return null;

    // Get income approach data if available
    const incomeData = getIncomeApproachData();
    if (approachName.includes('Income') && incomeData?.valuationData?.marketCapRate) {
      return incomeSubMethods.reconciledValue || 1250000;
    }

    // Mock values for demo - in production these would come from actual approach data
    const mockValues: Record<string, Record<string, number>> = {
      'As Is': { 'Sales Comparison': 1130000, 'Income Approach': 1250000, 'Cost Approach': 1052000, 'Land Valuation': 450000 },
      'As Completed': { 'Sales Comparison': 1550000, 'Income Approach': 1250000, 'Cost Approach': 1310000, 'Land Valuation': 450000 },
      'As Stabilized': { 'Sales Comparison': 0, 'Income Approach': 1250000, 'Cost Approach': 0, 'Land Valuation': 0 },
    };

    return mockValues[scenario.name]?.[approachName] || null;
  }, [scenarios, getIncomeApproachData, incomeSubMethods.reconciledValue]);

  // Calculate weight total for active scenario
  const getWeightTotal = useCallback((scenarioId: number): number => {
    const recon = reconciliations.find((r) => r.scenarioId === scenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!recon || !scenario) return 0;

    return scenario.approaches.reduce((sum, approach) => {
      return sum + (recon.weights[approach] || 0);
    }, 0);
  }, [reconciliations, scenarios]);

  // Calculate concluded value for a scenario
  const getConcludedValue = useCallback((scenarioId: number): number => {
    const recon = reconciliations.find((r) => r.scenarioId === scenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!recon || !scenario) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    scenario.approaches.forEach((approach) => {
      const weight = recon.weights[approach] || 0;
      const value = getApproachValue(scenarioId, approach);
      if (value && weight > 0) {
        totalWeight += weight;
        weightedSum += (value * weight) / 100;
      }
    });

    return Math.round(weightedSum);
  }, [reconciliations, scenarios, getApproachValue]);

  // Get value breakdown string
  const getValueBreakdown = useCallback((scenarioId: number): string => {
    const recon = reconciliations.find((r) => r.scenarioId === scenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!recon || !scenario) return '';

    const parts: string[] = [];
    scenario.approaches.forEach((approach) => {
      const weight = recon.weights[approach] || 0;
      const value = getApproachValue(scenarioId, approach);
      if (value && weight > 0) {
        const shortName = approach.replace(' Approach', '').replace(' Comparison', '');
        parts.push(`${shortName} ${weight}% × ${formatCurrency(value)}`);
      }
    });

    return parts.join(' + ');
  }, [reconciliations, scenarios, getApproachValue]);

  // Handle AI weight suggestion
  const handleSuggestWeights = useCallback(() => {
    const activeScenario = scenarios[activeScenarioIndex];
    if (!activeScenario) return;

    const incomeData = getIncomeApproachData();

    const result = calculateAIWeights(
      state.propertyType || 'commercial',
      activeScenario.name,
      activeScenario.approaches,
      undefined, // salesData - would come from actual sales comparison data
      incomeData,
      undefined, // costData
      improvementsInventory
    );

    setAiWeightResult(result);
    setShowAiExplanation(true);
  }, [scenarios, activeScenarioIndex, state.propertyType, getIncomeApproachData, improvementsInventory]);

  // Apply AI suggested weights
  const applyAiWeights = useCallback(() => {
    if (!aiWeightResult) return;
    const activeScenario = scenarios[activeScenarioIndex];
    if (!activeScenario) return;

    setReconciliations((prev) =>
      prev.map((r) =>
        r.scenarioId === activeScenario.id
          ? { ...r, weights: { ...aiWeightResult.weights } }
          : r
      )
    );
    setShowAiExplanation(false);
  }, [aiWeightResult, scenarios, activeScenarioIndex]);

  // Handle weight change
  const handleWeightChange = (scenarioId: number, approach: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setReconciliations((prev) =>
      prev.map((r) =>
        r.scenarioId === scenarioId
          ? { ...r, weights: { ...r.weights, [approach]: Math.min(100, Math.max(0, numValue)) } }
          : r
      )
    );
  };

  // Handle comments change
  const handleCommentsChange = (scenarioId: number, comments: string) => {
    setReconciliations((prev) =>
      prev.map((r) => (r.scenarioId === scenarioId ? { ...r, comments } : r))
    );
  };

  // Toggle certification
  const toggleCertification = (certId: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(certId) ? prev.filter((id) => id !== certId) : [...prev, certId]
    );
  };

  // Sync local state to WizardContext
  useEffect(() => {
    setReconciliationData({
      scenarioReconciliations: reconciliations,
      exposurePeriod: exposureMin ? parseInt(exposureMin) : null,
      marketingTime: marketingMin ? parseInt(marketingMin) : null,
      exposureRationale,
      certifications: selectedCertifications,
    });
  }, [reconciliations, exposureMin, marketingMin, exposureRationale, selectedCertifications, setReconciliationData]);

  const activeScenario = scenarios[activeScenarioIndex];
  const activeReconciliation = reconciliations.find((r) => r.scenarioId === activeScenario?.id);
  const weightTotal = activeScenario ? getWeightTotal(activeScenario.id) : 0;
  const concludedValue = activeScenario ? getConcludedValue(activeScenario.id) : 0;

  // Build context data for AI drafting
  const reconciliationContextData: ReconciliationContextData | null = activeScenario ? {
    propertyType: state.propertyType || 'commercial',
    propertySubtype: state.propertySubtype || undefined,
    location: propertyLocation,
    scenarioName: activeScenario.name,
    effectiveDate: activeScenario.effectiveDate || 'TBD',
    approaches: activeScenario.approaches.map(a => ({
      name: a,
      value: getApproachValue(activeScenario.id, a) || 0,
      weight: activeReconciliation?.weights[a] || 0,
      qualityScore: aiWeightResult?.qualityScores[a] || 50,
    })),
    concludedValue,
    minValue: Math.min(...activeScenario.approaches.map(a => getApproachValue(activeScenario.id, a) || Infinity)),
    maxValue: Math.max(...activeScenario.approaches.map(a => getApproachValue(activeScenario.id, a) || 0)),
    variancePercent: 0, // Would calculate actual variance
  } : null;

  const exposureContextData: ExposureContextData = {
    propertyType: state.propertyType || 'commercial',
    location: propertyLocation,
    value: concludedValue,
    exposureMin: parseInt(exposureMin) || typicalRanges.exposureMin,
    exposureMax: parseInt(exposureMax) || typicalRanges.exposureMax,
    marketingMin: parseInt(marketingMin) || typicalRanges.marketingMin,
    marketingMax: parseInt(marketingMax) || typicalRanges.marketingMax,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Summary Header Card - Simplified */}
      <div className="bg-gradient-to-r from-accent-cyan to-accent-cyan-hover dark:from-accent-cyan/90 dark:to-accent-cyan-hover/80 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{propertyName}</h2>
            <p className="text-cyan-50">{propertyLocation}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/90 mb-1">Primary Value Conclusion</div>
            <div className="text-4xl font-bold">{formatCurrency(getConcludedValue(scenarios[0]?.id || 1))}</div>
            <div className="text-sm text-white/75 mt-1">{scenarios[0]?.effectiveDate || 'Effective Date TBD'}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 dark:bg-white/15 rounded-lg p-3 backdrop-blur-sm border border-white/30 dark:border-white/20">
            <div className="text-xs text-white/75 mb-1">Property Type</div>
            <div className="font-semibold">{state.propertyType || 'Commercial'}</div>
          </div>
          <div className="bg-white/20 dark:bg-white/15 rounded-lg p-3 backdrop-blur-sm border border-white/30 dark:border-white/20">
            <div className="text-xs text-white/75 mb-1">Valuation Scenarios</div>
            <div className="font-semibold">{scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Value Conclusions Summary Table */}
      <div className="bg-surface-1 dark:bg-elevation-1 p-6 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
        <h3 className="text-lg font-semibold text-harken-dark dark:text-white mb-4 pb-3 border-b border-light-border dark:border-harken-gray">
          Value Conclusions Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-elevation-2 dark:to-elevation-3">
                <th className="text-left px-4 py-3 font-semibold text-harken-gray dark:text-slate-200 border-b-2 border-light-border dark:border-dark-border"></th>
                {scenarios.map((s, idx) => (
                  <th
                    key={s.id}
                    className="text-center px-4 py-3 font-semibold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-dark-border"
                  >
                    <span className={idx === 0 ? 'text-blue-600 dark:text-blue-400' : idx === 1 ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}>
                      {s.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Effective Date Row */}
              <tr className="border-b border-harken-gray-light dark:border-dark-border bg-harken-gray-light dark:bg-elevation-1/50">
                <td className="px-4 py-3 font-medium text-harken-gray dark:text-slate-200">Effective Date</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="px-4 py-3 text-center text-sm text-harken-gray dark:text-slate-400">
                    {s.effectiveDate || 'TBD'}
                  </td>
                ))}
              </tr>

              {/* Approach Rows - Only show approaches that are used */}
              {Array.from(new Set(scenarios.flatMap(s => s.approaches))).map((approach) => {
                const colors = APPROACH_COLORS[approach] || { text: 'text-harken-gray' };
                const isIncomeApproach = approach === 'Income Approach';

                return (
                  <React.Fragment key={approach}>
                    <tr className="border-b border-harken-gray-light dark:border-dark-border hover:bg-harken-gray-light dark:hover:bg-elevation-3">
                      <td className="px-4 py-3 font-medium text-harken-gray dark:text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className={colors.text}>{getApproachIcon(approach)}</span>
                          <span>{approach}</span>
                          {isIncomeApproach && (
                            <button
                              onClick={() => setIncomeExpanded(!incomeExpanded)}
                              className="ml-2 p-1 text-harken-gray-med hover:text-harken-gray dark:hover:text-harken-gray-light hover:bg-harken-gray-light dark:hover:bg-harken-gray rounded transition-colors"
                              title={incomeExpanded ? 'Hide sub-methods' : 'Show Direct Cap & DCF breakdown'}
                            >
                              {incomeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                      {scenarios.map((s) => {
                        const value = getApproachValue(s.id, approach);
                        const isApplicable = s.approaches.includes(approach);
                        const recon = reconciliations.find(r => r.scenarioId === s.id);
                        const weight = recon?.weights[approach] || 0;

                        return (
                          <td key={s.id} className="px-4 py-3 text-center">
                            {isApplicable ? (
                              <div>
                                <span className="font-semibold text-harken-dark dark:text-white">{formatCurrency(value)}</span>
                                {weight > 0 && (
                                  <span className="ml-2 text-xs text-harken-gray-med">({weight}%)</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-harken-gray-med italic">N/A</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Income Sub-Methods - Render immediately after Income Approach row */}
                    {isIncomeApproach && incomeExpanded && (
                      <>
                        <tr className="border-b border-harken-gray-light dark:border-dark-border bg-green-50/50 dark:bg-green-900/20">
                          <td className="px-4 py-2 pl-10 text-sm text-harken-gray dark:text-slate-400">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              Direct Capitalization
                            </span>
                          </td>
                          {scenarios.map((s) => (
                            <td key={s.id} className="px-4 py-2 text-center text-sm text-harken-gray dark:text-slate-400">
                              {s.approaches.includes('Income Approach')
                                ? formatCurrency(incomeSubMethods.directCapValue)
                                : <span className="text-harken-gray-med">—</span>
                              }
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-harken-gray-light dark:border-dark-border bg-green-50/50 dark:bg-green-900/20">
                          <td className="px-4 py-2 pl-10 text-sm text-harken-gray dark:text-slate-400">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              DCF / Yield Capitalization
                            </span>
                          </td>
                          {scenarios.map((s) => (
                            <td key={s.id} className="px-4 py-2 text-center text-sm text-harken-gray dark:text-slate-400">
                              {s.approaches.includes('Income Approach')
                                ? formatCurrency(incomeSubMethods.dcfValue)
                                : <span className="text-harken-gray-med">—</span>
                              }
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Concluded Value Row */}
              <tr className="bg-gradient-to-r from-accent-teal-mint-light to-accent-teal-mint-light dark:from-accent-teal-mint/10 dark:to-accent-teal-mint/10">
                <td className="px-4 py-4 font-bold text-harken-dark dark:text-white uppercase text-sm">Concluded Value</td>
                {scenarios.map((s, idx) => (
                  <td key={s.id} className="px-4 py-4 text-center">
                    <span
                      className={`text-xl font-bold ${idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-green-600' : 'text-purple-600'
                        }`}
                    >
                      {formatCurrency(getConcludedValue(s.id))}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Helper Message if No Concluded Values */}
        {scenarios.some(s => getConcludedValue(s.id) === 0) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Concluded values will calculate automatically</strong> once you assign reconciliation weights to each approach below. 
              Use the <strong>"AI Suggest Weights"</strong> button for intelligent recommendations, or enter weights manually.
            </div>
          </div>
        )}
      </div>

      {/* Reconciliation by Scenario */}
      <div className="bg-surface-1 dark:bg-elevation-1 p-6 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-light-border dark:border-harken-gray">
          <h3 className="text-lg font-semibold text-harken-dark dark:text-white">
            Reconciliation by Scenario
          </h3>
          <button
            onClick={handleSuggestWeights}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-accent-cyan to-accent-cyan-hover hover:from-accent-cyan-hover hover:to-accent-cyan dark:from-accent-cyan dark:to-accent-cyan-hover rounded-lg flex items-center gap-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            AI Suggest Weights
          </button>
        </div>

        {/* AI Weight Explanation Panel */}
        {showAiExplanation && aiWeightResult && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800 rounded-xl animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-200">AI Weight Recommendation</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyAiWeights}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Apply
                </button>
                <button
                  onClick={() => setShowAiExplanation(false)}
                  className="px-3 py-1.5 text-sm font-medium text-harken-gray dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-md hover:bg-harken-gray-light dark:hover:bg-harken-gray"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {Object.entries(aiWeightResult.weights).map(([approach, weight]) => {
                const explanation = aiWeightResult.explanations[approach];
                return (
                  <div key={approach} className="bg-surface-1 dark:bg-elevation-1 p-3 rounded-lg border border-blue-100 dark:border-harken-gray">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-harken-dark dark:text-white">{approach}</span>
                      <span className="text-lg font-bold text-blue-600">{weight}%</span>
                    </div>
                    <div className="text-xs text-harken-gray dark:text-slate-400 space-y-1">
                      <div>Base Weight: {explanation?.baseWeight}% • Quality Score: {explanation?.qualityScore}/100</div>
                      <div>Scenario: {explanation?.scenarioReason}</div>
                      <div className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full capitalize">
                        {explanation?.recommendation} emphasis
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scenario Tabs */}
        <div className="flex gap-2 mb-6 border-b border-light-border dark:border-dark-border">
          {scenarios.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioIndex(idx)}
              className={`px-4 py-2 text-sm font-medium -mb-px transition-colors ${idx === activeScenarioIndex
                  ? 'text-accent-cyan dark:text-accent-cyan border-b-2 border-accent-cyan dark:border-accent-cyan font-semibold'
                  : 'text-harken-gray-med dark:text-slate-400 hover:text-accent-cyan-hover dark:hover:text-accent-cyan hover:border-b-2 hover:border-accent-cyan-hover/30 dark:hover:border-accent-cyan/30'
                }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Active Scenario Panel - ONLY show approaches for THIS scenario */}
        {activeScenario && activeReconciliation && (
          <div className="space-y-6">
            {/* Approach Value Boxes - Only for current scenario's approaches */}
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${activeScenario.approaches.length}, 1fr)` }}
            >
              {activeScenario.approaches.map((approach) => {
                const value = getApproachValue(activeScenario.id, approach);
                const colors = APPROACH_COLORS[approach] || { bg: 'bg-harken-gray-light', text: 'text-harken-gray', border: 'border-light-border' };

                return (
                  <div
                    key={approach}
                    className={`rounded-xl p-5 text-center border-2 ${colors.bg} dark:bg-elevation-1 ${colors.border} dark:border-harken-gray`}
                  >
                    <div className="text-xs text-harken-gray-med dark:text-slate-400 uppercase mb-2 font-medium">{approach}</div>
                    <div className={`text-xl font-bold mb-3 ${colors.text}`}>
                      {formatCurrency(value)}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-harken-gray dark:text-slate-200 mb-1">Weight (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={activeReconciliation.weights[approach] || ''}
                        onChange={(e) => handleWeightChange(activeScenario.id, approach, e.target.value)}
                        placeholder="0"
                        className="w-full bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-lg px-3 py-2 text-center text-sm text-harken-dark dark:text-white focus:ring-2 focus:ring-[#0da1c7] dark:focus:ring-cyan-400 focus:border-[#0da1c7]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weight Total Validation */}
            <div className={`flex items-center justify-between p-4 rounded-lg ${weightTotal === 100
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                : weightTotal > 0
                  ? 'bg-accent-amber-gold-light dark:bg-amber-900/30 border border-accent-amber-gold dark:border-amber-700'
                  : 'bg-harken-gray-light dark:bg-elevation-1 border border-light-border dark:border-harken-gray'
              }`}>
              <div className="flex items-center gap-2">
                {weightTotal === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : weightTotal > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-accent-amber-gold dark:text-amber-400" />
                ) : (
                  <Info className="w-5 h-5 text-harken-gray-med" />
                )}
                <span className={`font-medium ${weightTotal === 100 ? 'text-green-800 dark:text-green-200' : weightTotal > 0 ? 'text-accent-amber-gold dark:text-amber-200' : 'text-harken-gray dark:text-slate-400'
                  }`}>
                  Weight Total: {weightTotal}%
                  {weightTotal !== 100 && weightTotal > 0 && ' — Weights should sum to 100%'}
                  {weightTotal === 0 && ' — Enter weights or use AI Suggest'}
                </span>
              </div>
              {weightTotal > 0 && (
                <div className="text-right">
                  <div className="text-sm font-semibold text-harken-dark dark:text-white">
                    Concluded Value: {formatCurrency(concludedValue)}
                  </div>
                  <div className="text-xs text-harken-gray-med dark:text-slate-400">
                    {getValueBreakdown(activeScenario.id)}
                  </div>
                </div>
              )}
            </div>

            {/* Reconciliation Comments - Using EnhancedTextArea */}
            <EnhancedTextArea
              label={`Reconciliation Comments - ${activeScenario.name}`}
              value={activeReconciliation.comments}
              onChange={(value) => handleCommentsChange(activeScenario.id, value)}
              placeholder={`Explain your reasoning for the ${activeScenario.name} value conclusion...`}
              required
              rows={6}
              sectionContext="reconciliation"
              helperText="Explain why each approach received its specific weight based on data reliability and applicability"
              contextData={reconciliationContextData || undefined}
            />
          </div>
        )}
      </div>

      {/* Exposure & Marketing Time - Enhanced with ranges and tooltips */}
      <div className="bg-surface-1 dark:bg-elevation-1 p-6 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
        <h3 className="text-lg font-semibold text-harken-dark dark:text-white mb-4 pb-3 border-b border-light-border dark:border-harken-gray">
          Exposure & Marketing Time
        </h3>

        {/* Guidance Panel */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>{typicalRanges.description}</strong>
            <p className="mt-1 text-blue-700 dark:text-blue-300">
              Exposure time is <em>retrospective</em> (how long the property would have been on the market prior to the effective date).
              Marketing time is <em>prospective</em> (estimated time to sell from the effective date forward).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Exposure Period Range */}
          <div>
            <label className="block text-sm font-medium text-harken-gray dark:text-slate-200 mb-1 flex items-center gap-2">
              Estimated Exposure Period (Months) <span className="text-harken-error">*</span>
              <div className="group relative">
                <Info className="w-4 h-4 text-harken-gray-med cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-harken-dark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Retrospective: Time on market prior to effective date
                </div>
              </div>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={typicalRanges.exposureMin.toString()}
                value={exposureMin}
                onChange={(e) => setExposureMin(e.target.value)}
                className="flex-1 border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] dark:focus:ring-cyan-400 focus:border-[#0da1c7]"
              />
              <span className="text-harken-gray-med dark:text-slate-400">to</span>
              <input
                type="number"
                placeholder={typicalRanges.exposureMax.toString()}
                value={exposureMax}
                onChange={(e) => setExposureMax(e.target.value)}
                className="flex-1 border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] dark:focus:ring-cyan-400 focus:border-[#0da1c7]"
              />
              <span className="text-harken-gray-med dark:text-slate-400 text-sm">months</span>
            </div>
          </div>

          {/* Marketing Time Range */}
          <div>
            <label className="block text-sm font-medium text-harken-gray dark:text-slate-200 mb-1 flex items-center gap-2">
              Estimated Marketing Time (Months)
              <div className="group relative">
                <Info className="w-4 h-4 text-harken-gray-med cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-harken-dark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Prospective: Time to sell from effective date forward
                </div>
              </div>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={typicalRanges.marketingMin.toString()}
                value={marketingMin}
                onChange={(e) => setMarketingMin(e.target.value)}
                className="flex-1 border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] dark:focus:ring-cyan-400 focus:border-[#0da1c7]"
              />
              <span className="text-harken-gray-med dark:text-slate-400">to</span>
              <input
                type="number"
                placeholder={typicalRanges.marketingMax.toString()}
                value={marketingMax}
                onChange={(e) => setMarketingMax(e.target.value)}
                className="flex-1 border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0da1c7] dark:focus:ring-cyan-400 focus:border-[#0da1c7]"
              />
              <span className="text-harken-gray-med dark:text-slate-400 text-sm">months</span>
            </div>
          </div>
        </div>

        {/* Exposure Rationale - Using EnhancedTextArea */}
        <EnhancedTextArea
          label="Exposure Time Rationale"
          value={exposureRationale}
          onChange={setExposureRationale}
          placeholder="Explain the basis for your exposure and marketing time estimates..."
          rows={4}
          sectionContext="exposure"
          helperText="Reference market conditions, property characteristics, and comparable marketing times"
          contextData={exposureContextData}
        />
      </div>

      {/* Final Certifications */}
      <div className="bg-surface-1 dark:bg-elevation-1 p-6 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
        <h3 className="text-lg font-semibold text-harken-dark dark:text-white mb-4 pb-3 border-b border-light-border dark:border-harken-gray">
          Final Certifications
        </h3>
        <p className="text-sm text-harken-gray-med dark:text-slate-400 mb-4">
          Click each certification to confirm your compliance with USPAP requirements.
        </p>
        <div className="space-y-3">
          {DEFAULT_CERTIFICATIONS.map((cert) => {
            const isSelected = selectedCertifications.includes(cert.id);
            return (
              <button
                key={cert.id}
                onClick={() => toggleCertification(cert.id)}
                className={`w-full text-left p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                    ? 'border-[#0da1c7] dark:border-cyan-400 bg-[#0da1c7]/5 dark:bg-cyan-400/10'
                    : 'border-light-border dark:border-harken-gray hover:border-[#0da1c7]/50 dark:hover:border-cyan-400/50 hover:bg-[#0da1c7]/5 dark:hover:bg-cyan-400/10'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-[#0da1c7] dark:bg-cyan-400 border-[#0da1c7] dark:border-cyan-400' : 'border-light-border dark:border-harken-gray'
                      }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-harken-gray dark:text-slate-200">{cert.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
