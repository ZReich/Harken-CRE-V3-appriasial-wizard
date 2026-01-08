import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowUpRight, Calendar, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ImprovementValuation } from './ImprovementValuation';
import { CostConclusion } from './CostConclusion';
import { BuildingSelector } from './BuildingSelector';
import { ContractorCostComparison } from './ContractorCostComparison';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { ValueScenario } from '../types';
import { useWizard } from '../../../context/WizardContext';

interface CostApproachGridProps {
  onValueChange?: (value: number) => void;
  onScenarioChange?: (scenario: 'As Is' | 'As Completed' | 'As Stabilized') => void;
  // Land value from the standalone Land Valuation section
  landValueFromLandSection?: number;
  onNavigateToLand?: () => void;
  scenarioId?: number;
}

export const CostApproachGrid: React.FC<CostApproachGridProps> = ({
  onValueChange,
  onScenarioChange,
  landValueFromLandSection = 820000, // Default mock value for demonstration
  onNavigateToLand,
  scenarioId,
}) => {
  const { state, setApproachConclusion, setCostApproachBuildingSelections } = useWizard();
  const [improvementsValue, setImprovementsValue] = useState(0);
  const [finalIndicatedValue, setFinalIndicatedValue] = useState(0);
  const [narrativeText, setNarrativeText] = useState('');

  // Derive scenario from the active scenario in context (synced with top-level scenario switcher)
  const activeScenario = useMemo(() => {
    return state.scenarios.find(s => s.id === (scenarioId ?? state.activeScenarioId)) || state.scenarios[0];
  }, [state.scenarios, scenarioId, state.activeScenarioId]);

  const scenario: ValueScenario = (activeScenario?.name as ValueScenario) || 'As Is';

  // Get selected building IDs for the current scenario
  const currentScenarioId = scenarioId ?? state.activeScenarioId;
  const selectedBuildingIds = state.costApproachBuildingSelections?.[currentScenarioId] || [];

  // Handler for building selection changes
  const handleBuildingSelectionChange = useCallback((buildingIds: string[]) => {
    setCostApproachBuildingSelections(currentScenarioId, buildingIds);
  }, [currentScenarioId, setCostApproachBuildingSelections]);

  // Use land value from the standalone Land Valuation section
  const landValue = landValueFromLandSection;
  const hasLandValue = landValue > 0;

  // Stabilization usually adds ~5-15% in soft costs (lost rent/commissions)
  const stabilizationAdjustment = scenario === 'As Stabilized' ? 125000 : 0;

  // Notify parent of value changes
  useMemo(() => {
    onValueChange?.(finalIndicatedValue);
  }, [finalIndicatedValue, onValueChange]);

  // Notify parent of scenario changes (scenario is derived from context)
  useEffect(() => {
    onScenarioChange?.(scenario);
  }, [scenario, onScenarioChange]);

  // Sync concluded value to WizardContext when scenarioId is provided
  useEffect(() => {
    if (scenarioId !== undefined && finalIndicatedValue > 0) {
      setApproachConclusion(scenarioId, 'Cost Approach', finalIndicatedValue);
    }
  }, [scenarioId, finalIndicatedValue, setApproachConclusion]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 overflow-hidden font-sans">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-surface-2 dark:bg-elevation-2/50 dark:bg-elevation-1/50 scroll-smooth">
        <div className="w-full min-h-full pb-20">
          <div className="p-6 space-y-8">

            {/* Land Value Summary Card (replaces embedded Land Valuation) */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3 px-2">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Land Value</span>
                <div className="h-px bg-surface-4 dark:bg-elevation-muted flex-1"></div>
              </div>

              <div className={`rounded-xl border-2 p-6 ${hasLandValue
                ? 'bg-gradient-to-br from-lime-50 to-white dark:from-lime-900/20 dark:to-harken-dark border-lime-200 dark:border-lime-800'
                : 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-harken-dark border-accent-amber-gold-light dark:border-accent-amber-gold/30'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasLandValue ? 'bg-lime-100 dark:bg-lime-900/50 text-lime-600 dark:text-lime-400' : 'bg-accent-amber-gold-light dark:bg-accent-amber-gold/10 text-accent-amber-gold dark:text-accent-amber-gold-hover'
                      }`}>
                      <ArrowUpRight size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Land Valuation</h3>
                        {hasLandValue ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-lime-700 dark:text-lime-300 bg-lime-100 dark:bg-lime-900/50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        ) : <span className="flex items-center gap-1 text-xs font-medium text-accent-amber-gold dark:text-accent-amber-gold-hover bg-accent-amber-gold-light dark:bg-accent-amber-gold/10 px-2 py-0.5 rounded-full">
                          <AlertCircle size={12} />
                          Incomplete
                        </span>
                        }
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-200 max-w-md">
                        {hasLandValue
                          ? 'Land value concluded via Sales Comparison Approach in the Land Valuation section.'
                          : 'Complete the Land Valuation section to provide a land value for the Cost Approach.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasLandValue ? (
                      <>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(landValue)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Indicated Land Value
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={onNavigateToLand}
                        className="px-4 py-2 bg-accent-amber-gold hover:bg-accent-amber-gold-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        Complete Land Valuation
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {hasLandValue && (
                  <div className="mt-4 pt-4 border-t border-lime-200/50 dark:border-lime-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>
                        <strong className="text-slate-800 dark:text-white">5</strong> Land Sales Analyzed
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        <strong className="text-slate-800 dark:text-white">$12,961</strong> per acre
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        <strong className="text-slate-800 dark:text-white">63.27</strong> acres
                      </span>
                    </div>
                    <button
                      onClick={onNavigateToLand}
                      className="text-sm font-medium text-lime-700 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300 flex items-center gap-1"
                    >
                      View Land Analysis
                      <ExternalLink size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Info callout */}
              <div className="mt-3 flex items-start gap-2 px-2">
                <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Land is valued separately using Sales Comparison Approach. The concluded value automatically
                  flows into this Cost Approach. This ensures consistency across all approaches requiring land value.
                </p>
              </div>
            </section>

            {/* Building Selector Section */}
            <section className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-50">
              <BuildingSelector
                scenarioId={currentScenarioId}
                selectedBuildingIds={selectedBuildingIds}
                onSelectionChange={handleBuildingSelectionChange}
              />
            </section>

            {/* Improvement Valuation Section */}
            <section className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
              <ImprovementValuation
                onValueChange={setImprovementsValue}
                scenario={scenario}
                scenarioId={currentScenarioId}
              />
            </section>

            {/* Contractor Cost Comparison Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <ContractorCostComparison
                scenarioId={currentScenarioId}
                msTotalCost={improvementsValue}
              />
            </section>

            {/* Conclusion Section */}
            <section>
              <CostConclusion
                landValue={landValue}
                improvementsValue={improvementsValue}
                scenario={scenario}
                stabilizationAdjustment={stabilizationAdjustment}
                onFinalValueChange={setFinalIndicatedValue}
              />
            </section>

            {/* Comments Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <EnhancedTextArea
                id="cost-approach-narrative"
                label="Cost Approach Narrative"
                value={narrativeText}
                onChange={setNarrativeText}
                placeholder="Describe the cost approach methodology, land value basis, and improvement valuation..."
                rows={6}
                sectionContext="cost_approach"
                helperText="Document the cost approach methodology and reconciliation."
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
