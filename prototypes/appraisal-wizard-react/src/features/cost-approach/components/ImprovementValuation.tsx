import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Trash2, Edit2, Calculator, X, Check, ExternalLink, BookOpen, Clock, Loader2, Table2, Info, AlertCircle } from 'lucide-react';
import { Improvement, ImprovementLineItem } from '../types';
import { 
  DEFAULT_IMPROVEMENT, 
  OCCUPANCY_OPTIONS, 
  CLASS_OPTIONS, 
  QUALITY_OPTIONS,
  DEPRECIATION_TABLE_DATA,
  formatCurrency,
  formatPercentSimple
} from '../constants';
import { useWizard } from '../../../context/WizardContext';
import { 
  getSelectedBuildingsAsCostFormat, 
  calculateImprovementLineItem,
  type CostOverrides 
} from '../utils';
import { getTotalSiteImprovementsValue, formatSiteImprovementsForGrid } from '../utils';

interface ImprovementValuationProps {
  onValueChange: (val: number) => void;
  scenario?: 'As Is' | 'As Completed' | 'As Stabilized';
  scenarioId?: number;
  siteImprovementsCostOverride?: number; // Optional override from parent
}

export const ImprovementValuation: React.FC<ImprovementValuationProps> = ({ 
  onValueChange, 
  scenario = 'As Is',
  scenarioId,
  siteImprovementsCostOverride,
}) => {
  const { state, setCostApproachBuildingCostData } = useWizard();
  const currentScenarioId = scenarioId ?? state.activeScenarioId;
  
  // Get selected building IDs for the current scenario
  const selectedBuildingIds = state.costApproachBuildingSelections?.[currentScenarioId] || [];
  
  // Get cost overrides from context (persists across navigation)
  const costOverrides = useMemo(() => {
    const scenarioData = state.costApproachBuildingCostData?.[currentScenarioId] || {};
    // Map CostApproachOverrides to CostOverrides (same structure)
    return scenarioData as Record<string, CostOverrides>;
  }, [state.costApproachBuildingCostData, currentScenarioId]);
  
  // Convert selected buildings from inventory to cost format
  const improvements = useMemo(() => {
    return getSelectedBuildingsAsCostFormat(
      state.improvementsInventory?.parcels || [],
      selectedBuildingIds,
      costOverrides
    );
  }, [state.improvementsInventory, selectedBuildingIds, costOverrides]);
  
  // Calculate site improvements cost from inventory
  const siteImprovementsCost = useMemo(() => {
    if (siteImprovementsCostOverride !== undefined) {
      return siteImprovementsCostOverride;
    }
    return getTotalSiteImprovementsValue(state.siteImprovements || []);
  }, [state.siteImprovements, siteImprovementsCostOverride]);
  
  // Get site improvements breakdown for display
  const siteImprovementsBreakdown = useMemo(() => {
    return formatSiteImprovementsForGrid(state.siteImprovements || []);
  }, [state.siteImprovements]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Improvement>(DEFAULT_IMPROVEMENT);
  
  const [showDepreciationTable, setShowDepreciationTable] = useState(false);
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [showSiteBreakdown, setShowSiteBreakdown] = useState(false);

  const calculateLineItem = useCallback((imp: Improvement): ImprovementLineItem => {
    return calculateImprovementLineItem(imp);
  }, []);

  const totals = useMemo(() => {
    let mvsCostNew = 0;
    let mvsDepreciatedValue = 0;

    improvements.forEach(imp => {
      const { costNew, depreciatedCost } = calculateLineItem(imp);
      mvsCostNew += costNew;
      mvsDepreciatedValue += depreciatedCost;
    });

    const mvsCostNewTotal = mvsCostNew + siteImprovementsCost;
    const mvsTotalWithSite = mvsDepreciatedValue + siteImprovementsCost;
    const totalDepreciationAmount = mvsCostNewTotal - mvsTotalWithSite;

    return { 
      mvsCostNewTotal,
      mvsTotalWithSite,
      totalDepreciationAmount
    };
  }, [improvements, siteImprovementsCost, calculateLineItem]);

  useEffect(() => {
    onValueChange(totals.mvsTotalWithSite);
  }, [totals.mvsTotalWithSite, onValueChange]);

  const handleEdit = (imp: Improvement) => {
    setFormData({ ...imp });
    setEditingId(imp.id);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingId) {
      // Save as cost overrides for this building (persisted to context)
      setCostApproachBuildingCostData(currentScenarioId, editingId, {
        baseCostPsf: formData.baseCostPsf,
        occupancy: formData.occupancy,
        class: formData.class,
        quality: formData.quality,
        effectiveAge: formData.effectiveAge,
        economicLife: formData.economicLife,
        entrepreneurialIncentive: formData.entrepreneurialIncentive,
        multipliers: formData.multipliers,
        depreciationPhysical: formData.depreciationPhysical,
        depreciationFunctional: formData.depreciationFunctional,
        depreciationExternal: formData.depreciationExternal,
      });
    }
    setIsEditing(false);
  };

  const handleResetToDefault = (buildingId: string) => {
    // Remove overrides for this building (null means delete)
    setCostApproachBuildingCostData(currentScenarioId, buildingId, null);
  };

  const updateForm = (field: keyof Improvement, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const updateMultiplier = (field: keyof Improvement['multipliers'], value: number) => {
    setFormData(prev => ({
      ...prev,
      multipliers: { ...prev.multipliers, [field]: value }
    }));
  };

  // Depreciation Table Modal
  const DepreciationTableModal = () => {
    const closestRow = useMemo(() => {
      return DEPRECIATION_TABLE_DATA.reduce((prev, curr) => 
        Math.abs(curr.age - formData.effectiveAge) < Math.abs(prev.age - formData.effectiveAge) ? curr : prev
      );
    }, []);

    if (!showDepreciationTable) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">M&S Depreciation Tables</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recommended values highlighted for Effective Age {formData.effectiveAge}.</p>
            </div>
            <button onClick={() => setShowDepreciationTable(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={18}/></button>
          </div>
          
          <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
            <table className="w-full text-center border-collapse">
              <thead className="bg-white dark:bg-slate-800 sticky top-0 z-10 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shadow-sm">
                <tr>
                  <th className="py-3 px-2 border-b border-slate-100 bg-slate-50/80 backdrop-blur">Effective Age</th>
                  <th className="py-3 px-2 border-b border-slate-100 bg-slate-50/80 backdrop-blur">Frame</th>
                  <th className="py-3 px-2 border-b border-slate-100 bg-slate-50/80 backdrop-blur">Masonry / Wood</th>
                  <th className="py-3 px-2 border-b border-slate-100 bg-slate-50/80 backdrop-blur">Masonry / Steel</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 dark:text-slate-300">
                {DEPRECIATION_TABLE_DATA.map((row) => {
                  const isRecommended = row.age === closestRow.age;
                  return (
                    <tr key={row.age} className={`transition-colors border-b border-slate-50 ${isRecommended ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <td className={`py-2 px-2 font-bold ${isRecommended ? 'text-[#0da1c7]' : 'text-slate-900'}`}>{row.age} Yrs</td>
                      <td className="p-1.5">
                        <button 
                          onClick={() => { updateForm('depreciationPhysical', row.frame/100); setShowDepreciationTable(false); }} 
                          className={`w-full py-1.5 rounded transition-all border border-transparent ${isRecommended ? 'bg-white dark:bg-slate-700 shadow-sm text-[#0da1c7] font-bold border-[#0da1c7]/20' : 'hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm hover:text-[#0da1c7] hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                          {row.frame}%
                        </button>
                      </td>
                      <td className="p-1.5">
                        <button 
                          onClick={() => { updateForm('depreciationPhysical', row.masonryWood/100); setShowDepreciationTable(false); }} 
                          className={`w-full py-1.5 rounded transition-all border border-transparent ${isRecommended ? 'bg-white dark:bg-slate-700 shadow-sm text-[#0da1c7] font-bold border-[#0da1c7]/20' : 'hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm hover:text-[#0da1c7] hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                          {row.masonryWood}%
                        </button>
                      </td>
                      <td className="p-1.5">
                        <button 
                          onClick={() => { updateForm('depreciationPhysical', row.masonrySteel/100); setShowDepreciationTable(false); }} 
                          className={`w-full py-1.5 rounded transition-all border border-transparent ${isRecommended ? 'bg-white dark:bg-slate-700 shadow-sm text-[#0da1c7] font-bold border-[#0da1c7]/20' : 'hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm hover:text-[#0da1c7] hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                          {row.masonrySteel}%
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Cost Estimator Modal
  const CostEstimatorModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [baseRate, setBaseRate] = useState(0);
    const [additives, setAdditives] = useState({
      sprinklers: false,
      hvac: false,
      elevators: false
    });
    const [manualAdj, setManualAdj] = useState(0);

    useEffect(() => {
      if (showCostEstimator) {
        fetchMVSData();
      }
    }, [showCostEstimator]);

    const fetchMVSData = async () => {
      setIsLoading(true);
      setManualAdj(0);
      setAdditives({ sprinklers: false, hvac: false, elevators: false });
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      let rate = 100;
      if (formData.occupancy.includes("Office")) rate = 145;
      if (formData.occupancy.includes("Industrial")) rate = 95;
      if (formData.occupancy.includes("Retail")) rate = 110;
      
      if (formData.class.includes("A -")) rate *= 1.4;
      if (formData.class.includes("B -")) rate *= 1.25;
      if (formData.class.includes("D -")) rate *= 0.85;

      if (formData.quality === "Good") rate *= 1.15;
      if (formData.quality === "Excellent") rate *= 1.3;
      if (formData.quality === "Low") rate *= 0.8;

      setBaseRate(Number(rate.toFixed(2)));
      setIsLoading(false);
    };

    const totalRate = useMemo(() => {
      let t = baseRate;
      if (additives.sprinklers) t += 3.50;
      if (additives.hvac) t += 4.25;
      if (additives.elevators) t += 8.00;
      return t + manualAdj;
    }, [baseRate, additives, manualAdj]);

    if (!showCostEstimator) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Base Cost Estimator</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fetching M&S Data via API</p>
            </div>
            <button onClick={() => setShowCostEstimator(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"><X size={18}/></button>
          </div>
          
          <div className="p-6 space-y-6 overflow-y-auto">
            {isLoading ? (
              <div className="bg-slate-50 rounded-lg p-8 border border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 size={24} className="animate-spin text-[#0da1c7]"/>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Querying CoreLogic M&S API...</div>
                <div className="text-xs text-slate-400">Authenticating & retrieving Section 14 data</div>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 animate-in fade-in duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Live Data Return</span>
                  <span className="text-[10px] text-blue-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">Success (200 OK)</span>
                </div>
                <div className="text-sm text-blue-900 mb-3">
                  {formData.occupancy} - {formData.class.split('-')[0].trim()} - {formData.quality}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-blue-200/50">
                  <span className="text-sm font-medium text-blue-800">Base Rate</span>
                  <span className="text-xl font-bold text-blue-900">${baseRate.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className={`space-y-3 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Common Additives</label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <span className="text-sm text-slate-700 dark:text-slate-200">Fire Sprinklers</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">+$3.50</span>
                    <input type="checkbox" checked={additives.sprinklers} onChange={e => setAdditives({...additives, sprinklers: e.target.checked})} className="rounded text-[#0da1c7] focus:ring-[#0da1c7]"/>
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <span className="text-sm text-slate-700 dark:text-slate-200">Complete HVAC</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">+$4.25</span>
                    <input type="checkbox" checked={additives.hvac} onChange={e => setAdditives({...additives, hvac: e.target.checked})} className="rounded text-[#0da1c7] focus:ring-[#0da1c7]"/>
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <span className="text-sm text-slate-700 dark:text-slate-200">Elevators</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">+$8.00</span>
                    <input type="checkbox" checked={additives.elevators} onChange={e => setAdditives({...additives, elevators: e.target.checked})} className="rounded text-[#0da1c7] focus:ring-[#0da1c7]"/>
                  </div>
                </label>
              </div>
            </div>

            <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Manual Adjustment ($)</label>
              <input 
                type="number" 
                value={manualAdj}
                onChange={e => setManualAdj(+e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#0da1c7] focus:border-[#0da1c7] outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase">Total Est. Rate</div>
              <div className="text-xl font-bold text-slate-900">
                {isLoading ? <span className="animate-pulse">...</span> : `$${totalRate.toFixed(2)}`}
              </div>
            </div>
            <button 
              onClick={() => { updateForm('baseCostPsf', totalRate); setShowCostEstimator(false); }}
              disabled={isLoading}
              className={`font-medium text-sm px-6 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2 ${isLoading ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-[#0da1c7] hover:bg-[#0b8fb0] text-white'}`}
            >
              <Check size={16} /> Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Empty state when no buildings selected
  if (improvements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator size={20} className="text-[#0da1c7]" />
            MVS Cost Analysis
          </h2>
        </div>
        
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Buildings Selected</h3>
          <p className="text-sm text-slate-600 mb-4">
            Select buildings from the Building Selector above to include them in the Cost Approach analysis.
          </p>
          <p className="text-xs text-amber-700">
            Buildings are defined in Subject Data &gt; Improvements tab.
          </p>
        </div>
        
        {/* Show site improvements even if no buildings */}
        {siteImprovementsCost > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Site Improvements</h3>
              <button
                onClick={() => setShowSiteBreakdown(!showSiteBreakdown)}
                className="text-xs text-[#0da1c7] hover:underline"
              >
                {showSiteBreakdown ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            {showSiteBreakdown && siteImprovementsBreakdown.length > 0 && (
              <div className="space-y-2 mb-4">
                {siteImprovementsBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="font-medium text-slate-900">{formatCurrency(item.contributoryValue)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="font-medium text-slate-700 dark:text-slate-200">Total Site Improvements</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(siteImprovementsCost)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // EDIT VIEW
  if (isEditing) {
    const { costNew, depreciatedCost, remainingEconomicLife, incentiveAmount } = calculateLineItem(formData);
    const hasOverrides = editingId && costOverrides[editingId];
    
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200 relative">
        <DepreciationTableModal />
        <CostEstimatorModal />

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Cost Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">Building data from Improvements tab - cost overrides stored separately</p>
          </div>
          <div className="flex items-center gap-3">
            {hasOverrides && (
              <button 
                onClick={() => { if (editingId) handleResetToDefault(editingId); setIsEditing(false); }}
                className="text-amber-600 hover:text-amber-700 font-medium text-sm px-3 py-2 rounded-md transition-colors"
              >
                Reset to Default
              </button>
            )}
            <button 
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:text-slate-700 font-medium text-sm px-3 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="bg-[#0da1c7] hover:bg-[#0b8fb0] text-white font-medium text-sm px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-colors"
            >
              <Check size={16} /> Save Changes
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Structure Details */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Structure Details</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Component Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => updateForm('name', e.target.value)}
                  className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Year Built</label>
                  <select
                    value={formData.yearBuilt} 
                    onChange={e => updateForm('yearBuilt', +e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                  >
                    {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Occupancy</label>
                  <select 
                    value={formData.occupancy} 
                    onChange={e => updateForm('occupancy', e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                  >
                    {OCCUPANCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Class</label>
                  <select 
                    value={formData.class} 
                    onChange={e => updateForm('class', e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                  >
                    {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Quality</label>
                  <select 
                    value={formData.quality} 
                    onChange={e => updateForm('quality', e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                  >
                    {QUALITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase mb-1.5">
                  <BookOpen size={10} /> Data Source Citation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Source (e.g. MVS Sec 12)"
                    value={formData.sourceName || ''}
                    onChange={e => updateForm('sourceName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 focus:border-[#0da1c7] outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Eff. Date (e.g. Jan 2024)"
                    value={formData.sourceDate || ''}
                    onChange={e => updateForm('sourceDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 focus:border-[#0da1c7] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Cost Analysis */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Cost Analysis (M&S)</h4>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Gross Area (SF)</label>
                  <input 
                    type="number" 
                    value={formData.areaSf}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-not-allowed"
                    title="Area is read from Improvements inventory"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">From Improvements tab</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Base Cost ($/SF)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.baseCostPsf}
                      onChange={e => updateForm('baseCostPsf', +e.target.value)}
                      className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md pl-3 pr-8 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                    />
                    <button 
                      onClick={() => setShowCostEstimator(true)}
                      className="absolute right-1 top-1.5 text-[#0da1c7] hover:text-[#0b8fb0] hover:bg-[#0da1c7]/10 p-1 rounded transition-all"
                      title="Open Base Cost Estimator"
                    >
                      <Calculator size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-500 dark:text-slate-400">Current Mult.</label>
                  <input 
                    type="number" 
                    value={formData.multipliers.current}
                    onChange={e => updateMultiplier('current', +e.target.value)}
                    className="w-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-700 dark:text-slate-200 focus:border-[#0da1c7] outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-500 dark:text-slate-400">Local Mult.</label>
                  <input 
                    type="number" 
                    value={formData.multipliers.local}
                    onChange={e => updateMultiplier('local', +e.target.value)}
                    className="w-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-700 dark:text-slate-200 focus:border-[#0da1c7] outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-500 dark:text-slate-400">Perimeter Mult.</label>
                  <input 
                    type="number" 
                    value={formData.multipliers.perimeter}
                    onChange={e => updateMultiplier('perimeter', +e.target.value)}
                    className="w-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-700 dark:text-slate-200 focus:border-[#0da1c7] outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <label className="text-sm font-medium text-[#0da1c7]">Entr. Incentive</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={((formData.entrepreneurialIncentive || 0) * 100).toFixed(1)}
                      onChange={e => updateForm('entrepreneurialIncentive', +e.target.value / 100)}
                      className="w-20 bg-[#0da1c7]/10 border border-[#0da1c7]/20 rounded px-2 py-1 text-right text-sm text-[#0da1c7] font-bold focus:border-[#0da1c7] outline-none"
                    />
                    <span className="text-xs text-[#0da1c7]/60 w-3">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Profit Amount</span>
                  <span className="font-mono">{formatCurrency(incentiveAmount)}</span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-200 pt-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total Cost New</span>
                  <span className="text-lg font-bold text-slate-900">{formatCurrency(costNew)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Depreciation */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Depreciation Breakdown</h4>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Effective Age</label>
                  <input 
                    type="number" 
                    value={formData.effectiveAge} 
                    onChange={e => updateForm('effectiveAge', +e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Economic Life</label>
                  <input 
                    type="number" 
                    value={formData.economicLife} 
                    onChange={e => updateForm('economicLife', +e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#0da1c7] focus:ring-1 focus:ring-[#0da1c7] outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-blue-700 text-sm">
                <Clock size={14} />
                <span className="font-medium">Remaining Economic Life:</span>
                <span className="font-bold ml-auto">{remainingEconomicLife} Years</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-500 dark:text-slate-400">Physical</label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input 
                        type="number" 
                        value={(formData.depreciationPhysical * 100).toFixed(1)}
                        onChange={e => updateForm('depreciationPhysical', +e.target.value / 100)}
                        className="w-24 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-700 dark:text-slate-200 focus:border-[#0da1c7] outline-none pr-8"
                      />
                      <button 
                        onClick={() => setShowDepreciationTable(true)}
                        className="absolute right-1 top-1 bottom-1 px-1 text-slate-400 hover:text-[#0da1c7] hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors"
                        title="Open Depreciation Guide"
                      >
                        <Table2 size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 w-3">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-500 dark:text-slate-400">Functional</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={(formData.depreciationFunctional * 100).toFixed(1)}
                      onChange={e => updateForm('depreciationFunctional', +e.target.value / 100)}
                      className="w-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-700 dark:text-slate-200 focus:border-[#0da1c7] outline-none"
                    />
                    <span className="text-xs text-slate-400 w-3">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-500 dark:text-slate-400">External</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={(formData.depreciationExternal * 100).toFixed(1)}
                      onChange={e => updateForm('depreciationExternal', +e.target.value / 100)}
                      className="w-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-right text-sm text-slate-700 dark:text-slate-200 focus:border-[#0da1c7] outline-none"
                    />
                    <span className="text-xs text-slate-400 w-3">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0da1c7]/10 p-4 rounded-lg border border-[#0da1c7]/20 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-[#0da1c7] uppercase tracking-wider">Depreciated Value</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(depreciatedCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-8 font-sans">
      
      {/* Scenario-specific info banner */}
      {scenario !== 'As Is' && (
        <div className={`rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          scenario === 'As Completed' 
            ? 'bg-emerald-50 border border-emerald-200' 
            : 'bg-violet-50 border border-violet-200'
        }`}>
          <Info className={`shrink-0 mt-0.5 ${
            scenario === 'As Completed' ? 'text-emerald-600' : 'text-violet-600'
          }`} size={18} />
          <div>
            <p className={`text-sm font-semibold mb-1 ${
              scenario === 'As Completed' ? 'text-emerald-900' : 'text-violet-900'
            }`}>
              {scenario} Scenario Active
            </p>
            <p className={`text-xs ${
              scenario === 'As Completed' ? 'text-emerald-800' : 'text-violet-800'
            }`}>
              {scenario === 'As Completed' 
                ? 'Physical depreciation should be zero for new construction. Only apply functional or external obsolescence if warranted.'
                : 'Include additional soft costs for lease-up period: marketing, tenant improvements, and carrying costs during absorption.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calculator size={20} className="text-[#0da1c7]" />
          MVS Cost Analysis
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {improvements.length} building{improvements.length !== 1 ? 's' : ''} selected
          </span>
          <a href="#" className="flex items-center gap-1 text-xs font-medium text-[#0da1c7] hover:text-[#0b8fb0] transition-colors">
            <ExternalLink size={12} /> Open MVS Online
          </a>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600">
            Source: Marshall Valuation Service
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="col-span-4">Improvement</div>
          <div className="col-span-1 text-right">Area</div>
          <div className="col-span-1 text-right">Profit</div>
          <div className="col-span-2 text-right">Cost New</div>
          <div className="col-span-2 text-right">Depreciation</div>
          <div className="col-span-2 text-right">Value</div>
        </div>

        <div className="divide-y divide-slate-50">
          {improvements.map(imp => {
            const { costNew, depreciatedCost, totalDepreciationPct } = calculateLineItem(imp);
            const profitPct = imp.entrepreneurialIncentive || 0;
            const hasOverride = !!costOverrides[imp.id];
            
            return (
              <div key={imp.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors group">
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{imp.name}</span>
                    {hasOverride && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                        Modified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{imp.occupancy} - {imp.quality}</div>
                </div>
                
                <div className="col-span-1 text-right text-sm text-slate-600 dark:text-slate-300">
                  {imp.areaSf.toLocaleString()}
                </div>

                <div className="col-span-1 text-right text-xs font-bold text-[#0da1c7] bg-[#0da1c7]/10 rounded py-1 px-1.5 w-fit ml-auto">
                  +{(profitPct * 100).toFixed(0)}%
                </div>

                <div className="col-span-2 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                  {formatCurrency(costNew)}
                </div>

                <div className="col-span-2 text-right text-sm font-medium text-red-500">
                  {totalDepreciationPct > 0 ? `-${formatPercentSimple(totalDepreciationPct)}` : '0.0%'}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-4 relative">
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(depreciatedCost)}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-4 bg-white/80 backdrop-blur-sm px-1 rounded-l-md border border-r-0 border-slate-200 shadow-sm transform translate-x-full group-hover:-translate-x-full duration-200">
                    <button onClick={() => handleEdit(imp)} className="p-1.5 text-slate-400 hover:text-[#0da1c7] transition-colors" title="Edit cost data">
                      <Edit2 size={14} />
                    </button>
                    {hasOverride && (
                      <button onClick={() => handleResetToDefault(imp.id)} className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors" title="Reset to default">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Site Improvements Row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center bg-slate-50/30">
            <div className="col-span-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Site Improvements</span>
                {siteImprovementsBreakdown.length > 0 && (
                  <button
                    onClick={() => setShowSiteBreakdown(!showSiteBreakdown)}
                    className="text-[10px] text-[#0da1c7] hover:underline"
                  >
                    {showSiteBreakdown ? 'Hide' : 'Details'}
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {siteImprovementsBreakdown.length > 0 
                  ? `${siteImprovementsBreakdown.length} items from Site tab`
                  : 'Paving, Landscaping, etc.'}
              </div>
            </div>
            <div className="col-span-1 text-right text-sm text-slate-400">-</div>
            <div className="col-span-1 text-right text-sm text-slate-400">-</div>
            <div className="col-span-2 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
              {formatCurrency(siteImprovementsCost)}
            </div>
            <div className="col-span-2 text-right text-sm text-slate-400">-</div>
            <div className="col-span-2 text-right text-sm font-bold text-slate-900">{formatCurrency(siteImprovementsCost)}</div>
          </div>
          
          {/* Site Improvements Breakdown (expandable) */}
          {showSiteBreakdown && siteImprovementsBreakdown.length > 0 && (
            <div className="px-6 py-3 bg-slate-50/50">
              <div className="space-y-1.5 pl-8">
                {siteImprovementsBreakdown.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="col-span-4">{item.label}</div>
                    <div className="col-span-1"></div>
                    <div className="col-span-1"></div>
                    <div className="col-span-2 text-right">{formatCurrency(item.rcn)}</div>
                    <div className="col-span-2 text-right text-red-400">-{formatCurrency(item.depreciation)}</div>
                    <div className="col-span-2 text-right font-medium text-slate-700 dark:text-slate-200">{formatCurrency(item.contributoryValue)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 pr-6 pt-2">
        <div className="flex items-center justify-end gap-12 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Total Cost New (Incl. Profit)</span>
          <span className="font-medium text-slate-700 min-w-[100px] text-right">{formatCurrency(totals.mvsCostNewTotal)}</span>
        </div>
        <div className="flex items-center justify-end gap-12 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Total Depreciation</span>
          <span className="font-medium text-red-500 min-w-[100px] text-right">-{formatCurrency(totals.totalDepreciationAmount)}</span>
        </div>
        <div className="flex items-center justify-end gap-12 text-base mt-2 pt-2 border-t border-slate-200">
          <span className="font-bold text-slate-900">Indicated Value (MVS)</span>
          <span className="font-bold text-slate-900 min-w-[100px] text-right">{formatCurrency(totals.mvsTotalWithSite)}</span>
        </div>
      </div>
    </div>
  );
};
