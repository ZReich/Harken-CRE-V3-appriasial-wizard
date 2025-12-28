import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowUpRight, Building2, Layers, Calendar, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ImprovementValuation } from './ImprovementValuation';
import { CostConclusion } from './CostConclusion';
import { RichTextEditor } from './RichTextEditor';
import { BuildingSelector } from './BuildingSelector';
import { ValueScenario } from '../types';
import { SCENARIO_OPTIONS } from '../constants';
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
  
  const [activeSection, setActiveSection] = useState<'all' | 'improvements'>('all');
  const [scenario, setScenario] = useState<ValueScenario>('As Is');
  
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

  // Notify parent of scenario changes
  useMemo(() => {
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      
      {/* Page Header & View Toggle */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Cost Approach
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium text-[#0da1c7] bg-[#0da1c7]/10 px-2 py-0.5 rounded border border-[#0da1c7]/20 mt-1">
              <Calendar size={12}/> {scenario} Value
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="ml-4 h-10 bg-slate-100 rounded-lg p-1 flex items-center border border-slate-200 shadow-inner">
            {SCENARIO_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`px-3 h-full rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${scenario === s ? 'bg-white text-[#0da1c7] shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-100/80 p-1 rounded-lg border border-slate-200 flex items-center">
          <button 
            onClick={() => setActiveSection('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'all' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Layers size={14} /> Full View
          </button>
          <button 
            onClick={() => setActiveSection('improvements')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'improvements' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Building2 size={14}/> Improvements Only
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth">
        <div className="w-full min-h-full pb-20">
          <div className="p-6 space-y-8">
            
            {/* Land Value Summary Card (replaces embedded Land Valuation) */}
            {activeSection === 'all' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Land Value</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                
                <div className={`rounded-xl border-2 p-6 ${
                  hasLandValue 
                    ? 'bg-gradient-to-br from-lime-50 to-white border-lime-200' 
                    : 'bg-gradient-to-br from-amber-50 to-white border-amber-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        hasLandValue ? 'bg-lime-100 text-lime-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <ArrowUpRight size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">Land Valuation</h3>
                          {hasLandValue ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={12} />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              <AlertCircle size={12} />
                              Incomplete
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 max-w-md">
                          {hasLandValue 
                            ? 'Land value concluded via Sales Comparison Approach in the Land Valuation section.'
                            : 'Complete the Land Valuation section to provide a land value for the Cost Approach.'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {hasLandValue ? (
                        <>
                          <div className="text-3xl font-bold text-slate-900">
                            {formatCurrency(landValue)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Indicated Land Value
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={onNavigateToLand}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          Complete Land Valuation
                          <ExternalLink size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {hasLandValue && (
                    <div className="mt-4 pt-4 border-t border-lime-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>
                          <strong className="text-slate-800">5</strong> Land Sales Analyzed
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          <strong className="text-slate-800">$12,961</strong> per acre
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          <strong className="text-slate-800">63.27</strong> acres
                        </span>
                      </div>
                      <button
                        onClick={onNavigateToLand}
                        className="text-sm font-medium text-lime-700 hover:text-lime-800 flex items-center gap-1"
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
                  <p className="text-xs text-slate-500">
                    Land is valued separately using Sales Comparison Approach. The concluded value automatically 
                    flows into this Cost Approach. This ensures consistency across all approaches requiring land value.
                  </p>
                </div>
              </section>
            )}

            {/* Building Selector Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-50">
              <BuildingSelector
                scenarioId={currentScenarioId}
                selectedBuildingIds={selectedBuildingIds}
                onSelectionChange={handleBuildingSelectionChange}
              />
            </section>

            {/* Improvement Valuation Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
              <ImprovementValuation onValueChange={setImprovementsValue} scenario={scenario} />
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
              <div className="flex items-center gap-2 mb-3 px-2">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Comments & Narrative</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <RichTextEditor />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
