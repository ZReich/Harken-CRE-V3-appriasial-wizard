import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, Calculator, X, Check, ExternalLink, HelpCircle, Building, Table2, BookOpen, Clock, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Improvement } from '../types';

interface ImprovementValuationProps {
  onValueChange: (val: number) => void;
}

const OCCUPANCY_OPTIONS = [
  "Apartment", "Bank", "Convenience Store", "Hospital", 
  "Hotel/Motel", "Industrial", "Industrial (Light)", "Industrial (Heavy)", 
  "Office", "Office (Low Rise)", "Office (High Rise)", "Parking Structure", 
  "Retail Store", "School", "Warehouse"
];

const CLASS_OPTIONS = [
  "A - Fireproof Steel", 
  "B - Reinforced Concrete", 
  "C - Masonry", 
  "D - Wood Frame", 
  "S - Metal"
];

const QUALITY_OPTIONS = [
  "Low", "Fair", "Average", "Good", "Excellent", "Luxury"
];

// Depreciation Table Data (Building Material)
const DEPRECIATION_TABLE_DATA = [
    { age: 1, frame: 1, masonryWood: 0, masonrySteel: 0 },
    { age: 2, frame: 2, masonryWood: 1, masonrySteel: 0 },
    { age: 3, frame: 3, masonryWood: 2, masonrySteel: 1 },
    { age: 4, frame: 4, masonryWood: 3, masonrySteel: 2 },
    { age: 5, frame: 6, masonryWood: 5, masonrySteel: 3 },
    { age: 8, frame: 12, masonryWood: 10, masonrySteel: 5 },
    { age: 10, frame: 20, masonryWood: 15, masonrySteel: 8 },
    { age: 15, frame: 25, masonryWood: 20, masonrySteel: 15 },
    { age: 20, frame: 30, masonryWood: 25, masonrySteel: 20 },
    { age: 25, frame: 35, masonryWood: 30, masonrySteel: 25 },
    { age: 30, frame: 40, masonryWood: 35, masonrySteel: 30 },
    { age: 35, frame: 45, masonryWood: 40, masonrySteel: 35 },
    { age: 40, frame: 50, masonryWood: 45, masonrySteel: 40 },
    { age: 45, frame: 55, masonryWood: 50, masonrySteel: 45 },
    { age: 50, frame: 60, masonryWood: 55, masonrySteel: 50 },
    { age: 55, frame: 65, masonryWood: 60, masonrySteel: 55 },
    { age: 60, frame: 70, masonryWood: 65, masonrySteel: 60 },
];

const MOCK_IMPROVEMENTS: Improvement[] = [
  {
    id: '1',
    name: "Light Manufacturing",
    occupancy: "Industrial (Light)",
    class: "C - Masonry",
    quality: "Average",
    sourceName: "MVS Sec 14 P 24",
    sourceDate: "Jan 2024",
    yearBuilt: 2022,
    yearRemodeled: undefined,
    effectiveAge: 2,
    economicLife: 45,
    areaSf: 9425,
    baseCostPsf: 113.36,
    entrepreneurialIncentive: 0.10, // 10% Profit
    multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
    depreciationPhysical: 0.05,
    depreciationFunctional: 0.0,
    depreciationExternal: 0.0,
  },
  {
    id: '2',
    name: "Interior Office",
    occupancy: "Office",
    class: "C - Masonry",
    quality: "Good",
    sourceName: "MVS Sec 15 P 10",
    sourceDate: "Jan 2024",
    yearBuilt: 2024,
    effectiveAge: 0,
    economicLife: 55,
    areaSf: 400,
    baseCostPsf: 150.24,
    entrepreneurialIncentive: 0.15,
    multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
    depreciationPhysical: 0.0,
    depreciationFunctional: 0.0,
    depreciationExternal: 0.0,
  },
  {
      id: '3',
      name: "Refrigerated Space",
      occupancy: "Industrial",
      class: "C - Masonry",
      quality: "Average",
      yearBuilt: 2020,
      effectiveAge: 4,
      economicLife: 45,
      areaSf: 675,
      baseCostPsf: 132.81,
      entrepreneurialIncentive: 0.10,
      multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
      depreciationPhysical: 0.10,
      depreciationFunctional: 0.0,
      depreciationExternal: 0.0,
  }
];

const DEFAULT_IMP: Improvement = {
    id: '',
    name: "New Component",
    occupancy: "Industrial",
    class: "C - Masonry",
    quality: "Average",
    yearBuilt: new Date().getFullYear(),
    effectiveAge: 0,
    economicLife: 45,
    areaSf: 0,
    baseCostPsf: 0,
    entrepreneurialIncentive: 0.10,
    multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
    depreciationPhysical: 0,
    depreciationFunctional: 0,
    depreciationExternal: 0,
};

export const ImprovementValuation: React.FC<ImprovementValuationProps> = ({ onValueChange }) => {
  // --- State ---
  const [improvements, setImprovements] = useState<Improvement[]>(MOCK_IMPROVEMENTS);
  const [siteImprovementsCost, setSiteImprovementsCost] = useState(70000);
  
  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Improvement>(DEFAULT_IMP);
  
  // Modals
  const [showDepreciationTable, setShowDepreciationTable] = useState(false);
  const [showCostEstimator, setShowCostEstimator] = useState(false);

  // --- Calculations ---
  
  const calculateLineItem = (imp: Improvement) => {
    // 1. Base Cost (Hard + Soft)
    const combinedMultiplier = imp.multipliers.current * imp.multipliers.local * imp.multipliers.perimeter;
    const adjustedRate = imp.baseCostPsf * combinedMultiplier;
    const baseCostTotal = imp.areaSf * adjustedRate;
    
    // 2. Entrepreneurial Incentive (Profit) - Applied to the adjusted base cost
    const incentiveAmount = baseCostTotal * (imp.entrepreneurialIncentive || 0);
    const costNew = baseCostTotal + incentiveAmount;
    
    // 3. Depreciation
    const totalDepreciationPct = imp.depreciationPhysical + imp.depreciationFunctional + imp.depreciationExternal;
    const depreciationAmount = costNew * totalDepreciationPct;
    const depreciatedCost = costNew - depreciationAmount;

    // 4. Remaining Economic Life
    const remainingEconomicLife = Math.max(0, imp.economicLife - imp.effectiveAge);

    return { 
        adjustedRate, 
        baseCostTotal,
        incentiveAmount,
        costNew, 
        totalDepreciationPct, 
        depreciatedCost, 
        combinedMultiplier,
        remainingEconomicLife
    };
  };

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
  }, [improvements, siteImprovementsCost]);

  useEffect(() => {
    onValueChange(totals.mvsTotalWithSite);
  }, [totals.mvsTotalWithSite, onValueChange]);

  // --- Handlers ---

  const handleEdit = (imp: Improvement) => {
      setFormData({ ...imp });
      setEditingId(imp.id);
      setIsEditing(true);
  };

  const handleAddNew = () => {
      setFormData({ ...DEFAULT_IMP, id: Math.random().toString() });
      setEditingId(null);
      setIsEditing(true);
  };

  const handleSave = () => {
      if (editingId) {
          setImprovements(prev => prev.map(i => i.id === editingId ? formData : i));
      } else {
          setImprovements(prev => [...prev, formData]);
      }
      setIsEditing(false);
  };

  const handleDelete = (id: string) => {
      if (confirm('Are you sure you want to delete this component?')) {
          setImprovements(prev => prev.filter(i => i.id !== id));
      }
  };

  const updateForm = (field: keyof Improvement, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const updateMultiplier = (field: keyof Improvement['multipliers'], value: number) => {
      setFormData(prev => ({
          ...prev,
          multipliers: { ...prev.multipliers, [field]: value }
      }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

  // --- Modal Components ---
  
  const DepreciationTableModal = ({ isOpen, onClose, onSelect, currentAge }: { isOpen: boolean, onClose: () => void, onSelect: (val: number) => void, currentAge: number }) => {
      const closestRow = useMemo(() => {
        return DEPRECIATION_TABLE_DATA.reduce((prev, curr) => 
            Math.abs(curr.age - currentAge) < Math.abs(prev.age - currentAge) ? curr : prev
        );
      }, [currentAge]);

      if (!isOpen) return null;

      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div 
                  className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">M&S Depreciation Tables</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Recommended values highlighted for Effective Age {currentAge}.</p>
                      </div>
                      <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"><X size={18}/></button>
                  </div>
                  
                  <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
                      <table className="w-full text-center border-collapse">
                          <thead className="bg-white sticky top-0 z-10 text-[10px] font-bold text-gray-500 uppercase tracking-wider shadow-sm">
                              <tr>
                                  <th className="py-3 px-2 border-b border-gray-100 bg-gray-50/80 backdrop-blur">Effective Age</th>
                                  <th className="py-3 px-2 border-b border-gray-100 bg-gray-50/80 backdrop-blur">Frame</th>
                                  <th className="py-3 px-2 border-b border-gray-100 bg-gray-50/80 backdrop-blur">Masonry / Wood</th>
                                  <th className="py-3 px-2 border-b border-gray-100 bg-gray-50/80 backdrop-blur">Masonry / Steel</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm text-gray-600">
                              {DEPRECIATION_TABLE_DATA.map((row) => {
                                  const isRecommended = row.age === closestRow.age;
                                  return (
                                      <tr key={row.age} className={`transition-colors border-b border-gray-50 ${isRecommended ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                          <td className={`py-2 px-2 font-bold ${isRecommended ? 'text-brand-600' : 'text-gray-900'}`}>{row.age} Yrs</td>
                                          <td className="p-1.5">
                                              <button 
                                                onClick={() => { onSelect(row.frame/100); onClose(); }} 
                                                className={`w-full py-1.5 rounded transition-all border border-transparent ${isRecommended ? 'bg-white shadow-sm text-brand-700 font-bold border-brand-200' : 'hover:bg-white hover:shadow-sm hover:text-brand-600 hover:border-gray-200'}`}
                                              >
                                                {row.frame}%
                                              </button>
                                          </td>
                                          <td className="p-1.5">
                                              <button 
                                                onClick={() => { onSelect(row.masonryWood/100); onClose(); }} 
                                                className={`w-full py-1.5 rounded transition-all border border-transparent ${isRecommended ? 'bg-white shadow-sm text-brand-700 font-bold border-brand-200' : 'hover:bg-white hover:shadow-sm hover:text-brand-600 hover:border-gray-200'}`}
                                              >
                                                {row.masonryWood}%
                                              </button>
                                          </td>
                                          <td className="p-1.5">
                                              <button 
                                                onClick={() => { onSelect(row.masonrySteel/100); onClose(); }} 
                                                className={`w-full py-1.5 rounded transition-all border border-transparent ${isRecommended ? 'bg-white shadow-sm text-brand-700 font-bold border-brand-200' : 'hover:bg-white hover:shadow-sm hover:text-brand-600 hover:border-gray-200'}`}
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

  const CostEstimatorModal = ({ isOpen, onClose, onApply, params }: { isOpen: boolean, onClose: () => void, onApply: (val: number) => void, params: Improvement }) => {
      // Async state
      const [isLoading, setIsLoading] = useState(false);
      const [baseRate, setBaseRate] = useState(0);
      const [additives, setAdditives] = useState({
          sprinklers: false,
          hvac: false,
          elevators: false
      });
      const [manualAdj, setManualAdj] = useState(0);

      // Effect: Simulate API Call when modal opens
      useEffect(() => {
          if (isOpen) {
              fetchMVSData();
          }
      }, [isOpen, params.occupancy, params.class, params.quality]);

      const fetchMVSData = async () => {
          setIsLoading(true);
          setManualAdj(0);
          setAdditives({ sprinklers: false, hvac: false, elevators: false });
          
          // Simulate network delay for API Call
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Mock logic (This is where you would call your backend endpoint: /api/mvs-lookup)
          let rate = 100;
          if (params.occupancy.includes("Office")) rate = 145;
          if (params.occupancy.includes("Industrial")) rate = 95;
          if (params.occupancy.includes("Retail")) rate = 110;
          
          if (params.class.includes("A -")) rate *= 1.4;
          if (params.class.includes("B -")) rate *= 1.25;
          if (params.class.includes("D -")) rate *= 0.85;

          if (params.quality === "Good") rate *= 1.15;
          if (params.quality === "Excellent") rate *= 1.3;
          if (params.quality === "Low") rate *= 0.8;

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

      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Base Cost Estimator</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Fetching M&S Data via API</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"><X size={18}/></button>
                 </div>
                 
                 <div className="p-6 space-y-6 overflow-y-auto">
                    {/* API Status / Result */}
                    {isLoading ? (
                        <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 flex flex-col items-center justify-center text-center space-y-3">
                             <Loader2 size={24} className="animate-spin text-brand-600"/>
                             <div className="text-sm font-medium text-gray-600">Querying CoreLogic M&S API...</div>
                             <div className="text-xs text-gray-400">Authenticating & retrieving Section 14 data</div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 animate-in fade-in duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Live Data Return</span>
                                <span className="text-[10px] text-blue-400 bg-white px-2 py-0.5 rounded-full border border-blue-100">Success (200 OK)</span>
                            </div>
                            <div className="text-sm text-blue-900 mb-3">
                                {params.occupancy} • {params.class.split('-')[0].trim()} • {params.quality}
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-blue-200/50">
                                <span className="text-sm font-medium text-blue-800">Base Rate</span>
                                <span className="text-xl font-bold text-blue-900">${baseRate.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {/* Additives (Only show when data is loaded) */}
                    <div className={`space-y-3 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Common Additives</label>
                        <div className="space-y-2">
                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <span className="text-sm text-gray-700">Fire Sprinklers</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-gray-500">+$3.50</span>
                                    <input type="checkbox" checked={additives.sprinklers} onChange={e => setAdditives({...additives, sprinklers: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500"/>
                                </div>
                            </label>
                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <span className="text-sm text-gray-700">Complete HVAC</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-gray-500">+$4.25</span>
                                    <input type="checkbox" checked={additives.hvac} onChange={e => setAdditives({...additives, hvac: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500"/>
                                </div>
                            </label>
                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <span className="text-sm text-gray-700">Elevators</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-gray-500">+$8.00</span>
                                    <input type="checkbox" checked={additives.elevators} onChange={e => setAdditives({...additives, elevators: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500"/>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Manual Adjust */}
                    <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Manual Adjustment ($)</label>
                         <input 
                            type="number" 
                            value={manualAdj}
                            onChange={e => setManualAdj(+e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            placeholder="0.00"
                         />
                    </div>
                 </div>

                 {/* Footer */}
                 <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                     <div>
                         <div className="text-xs text-gray-500 font-medium uppercase">Total Est. Rate</div>
                         <div className="text-xl font-bold text-gray-900">
                             {isLoading ? <span className="animate-pulse">...</span> : `$${totalRate.toFixed(2)}`}
                         </div>
                     </div>
                     <button 
                        onClick={() => { onApply(totalRate); onClose(); }}
                        disabled={isLoading}
                        className={`font-medium text-sm px-6 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2 ${isLoading ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}
                     >
                         <Check size={16} /> Apply
                     </button>
                 </div>
            </div>
        </div>
      );
  };

  // --- Views ---

  if (isEditing) {
      const { costNew, depreciatedCost, combinedMultiplier, remainingEconomicLife, incentiveAmount } = calculateLineItem(formData);
      
      return (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200 relative">
              {/* Modals */}
              <DepreciationTableModal 
                isOpen={showDepreciationTable}
                onClose={() => setShowDepreciationTable(false)}
                onSelect={(val) => updateForm('depreciationPhysical', val)}
                currentAge={formData.effectiveAge}
              />

              <CostEstimatorModal 
                isOpen={showCostEstimator}
                onClose={() => setShowCostEstimator(false)}
                onApply={(val) => updateForm('baseCostPsf', val)}
                params={formData}
              />

              {/* Form Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Edit Component</h3>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="text-gray-500 hover:text-gray-700 font-medium text-sm px-3 py-2 rounded-md transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-colors"
                      >
                          <Check size={16} /> Save Changes
                      </button>
                  </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                  
                  {/* Column 1: Structure Details */}
                  <div className="space-y-6">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Structure Details</h4>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Component Name</label>
                              <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => updateForm('name', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Year Built</label>
                                <select
                                    value={formData.yearBuilt} 
                                    onChange={e => updateForm('yearBuilt', +e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                >
                                    {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Occupancy</label>
                                <select 
                                    value={formData.occupancy} 
                                    onChange={e => updateForm('occupancy', e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                >
                                    {OCCUPANCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Class</label>
                                <select 
                                    value={formData.class} 
                                    onChange={e => updateForm('class', e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                >
                                    {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Quality</label>
                                <select 
                                    value={formData.quality} 
                                    onChange={e => updateForm('quality', e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                >
                                    {QUALITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                             </div>
                          </div>

                          {/* Source Data (USPAP) */}
                           <div className="pt-2">
                             <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase mb-1.5">
                                <BookOpen size={10} /> Data Source Citation
                             </label>
                             <div className="grid grid-cols-2 gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Source (e.g. MVS Sec 12)"
                                    value={formData.sourceName || ''}
                                    onChange={e => updateForm('sourceName', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:border-brand-500 outline-none"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Eff. Date (e.g. Jan 2024)"
                                    value={formData.sourceDate || ''}
                                    onChange={e => updateForm('sourceDate', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:border-brand-500 outline-none"
                                />
                             </div>
                           </div>
                      </div>
                  </div>

                  {/* Column 2: Cost Analysis */}
                  <div className="space-y-6">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Cost Analysis (M&S)</h4>

                      <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Gross Area (SF)</label>
                                  <input 
                                    type="number" 
                                    value={formData.areaSf}
                                    onChange={e => updateForm('areaSf', +e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Base Cost ($/SF)</label>
                                  <div className="relative">
                                    <input 
                                        type="number" 
                                        value={formData.baseCostPsf}
                                        onChange={e => updateForm('baseCostPsf', +e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-md pl-3 pr-8 py-2 text-sm font-semibold text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                    />
                                    <button 
                                        onClick={() => setShowCostEstimator(true)}
                                        className="absolute right-1 top-1.5 text-brand-500 hover:text-brand-700 hover:bg-brand-50 p-1 rounded transition-all"
                                        title="Open Base Cost Estimator"
                                    >
                                        <Calculator size={16} />
                                    </button>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-3 pt-2">
                             <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-500">Current Mult.</label>
                                <input 
                                    type="number" 
                                    value={formData.multipliers.current}
                                    onChange={e => updateMultiplier('current', +e.target.value)}
                                    className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-right text-sm text-gray-700 focus:border-brand-500 outline-none"
                                />
                             </div>
                             <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-500">Local Mult.</label>
                                <input 
                                    type="number" 
                                    value={formData.multipliers.local}
                                    onChange={e => updateMultiplier('local', +e.target.value)}
                                    className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-right text-sm text-gray-700 focus:border-brand-500 outline-none"
                                />
                             </div>
                             <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-500">Perimeter Mult.</label>
                                <input 
                                    type="number" 
                                    value={formData.multipliers.perimeter}
                                    onChange={e => updateMultiplier('perimeter', +e.target.value)}
                                    className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-right text-sm text-gray-700 focus:border-brand-500 outline-none"
                                />
                             </div>
                             <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <label className="text-sm font-medium text-brand-600">Entr. Incentive</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={((formData.entrepreneurialIncentive || 0) * 100).toFixed(1)}
                                        onChange={e => updateForm('entrepreneurialIncentive', +e.target.value / 100)}
                                        className="w-20 bg-brand-50 border border-brand-200 rounded px-2 py-1 text-right text-sm text-brand-700 font-bold focus:border-brand-500 outline-none"
                                    />
                                    <span className="text-xs text-brand-400 w-3">%</span>
                                </div>
                             </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                              <div className="flex justify-between text-xs text-gray-500">
                                  <span>Profit Amount</span>
                                  <span className="font-mono">{formatCurrency(incentiveAmount)}</span>
                              </div>
                              <div className="flex justify-between items-end border-t border-gray-200 pt-2">
                                  <span className="text-sm font-bold text-gray-700">Total Cost New</span>
                                  <span className="text-lg font-bold text-gray-900">{formatCurrency(costNew)}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Column 3: Depreciation */}
                  <div className="space-y-6">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Depreciation Breakdown</h4>

                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Effective Age</label>
                                <input 
                                    type="number" 
                                    value={formData.effectiveAge} 
                                    onChange={e => updateForm('effectiveAge', +e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Economic Life</label>
                                <input 
                                    type="number" 
                                    value={formData.economicLife} 
                                    onChange={e => updateForm('economicLife', +e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                />
                             </div>
                          </div>
                          
                          {/* Remaining Economic Life (Calculated) */}
                           <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-blue-700 text-sm">
                                <Clock size={14} />
                                <span className="font-medium">Remaining Economic Life:</span>
                                <span className="font-bold ml-auto">{remainingEconomicLife} Years</span>
                           </div>

                          <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-500">Physical</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={(formData.depreciationPhysical * 100).toFixed(1)}
                                            onChange={e => updateForm('depreciationPhysical', +e.target.value / 100)}
                                            className="w-24 bg-white border border-gray-200 rounded px-2 py-1 text-right text-sm text-gray-700 focus:border-brand-500 outline-none pr-8"
                                        />
                                        <button 
                                            onClick={() => setShowDepreciationTable(true)}
                                            className="absolute right-1 top-1 bottom-1 px-1 text-gray-400 hover:text-brand-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Open Depreciation Guide"
                                        >
                                            <Table2 size={14} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-400 w-3">%</span>
                                </div>
                             </div>
                             <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-500">Functional</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={(formData.depreciationFunctional * 100).toFixed(1)}
                                        onChange={e => updateForm('depreciationFunctional', +e.target.value / 100)}
                                        className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-right text-sm text-gray-700 focus:border-brand-500 outline-none"
                                    />
                                    <span className="text-xs text-gray-400 w-3">%</span>
                                </div>
                             </div>
                             <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-500">External</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={(formData.depreciationExternal * 100).toFixed(1)}
                                        onChange={e => updateForm('depreciationExternal', +e.target.value / 100)}
                                        className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-right text-sm text-gray-700 focus:border-brand-500 outline-none"
                                    />
                                    <span className="text-xs text-gray-400 w-3">%</span>
                                </div>
                             </div>
                          </div>

                          <div className="bg-brand-50/50 p-4 rounded-lg border border-brand-100 flex items-center justify-between mt-4">
                              <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">Depreciated Value</span>
                              <span className="text-xl font-bold text-gray-900">{formatCurrency(depreciatedCost)}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- List View ---
  return (
    <div className="space-y-8 font-sans">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building size={20} className="text-brand-600" />
                MVS Cost Analysis
            </h2>
            <div className="flex items-center gap-3">
                 <a href="#" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    <ExternalLink size={12} /> Open MVS Online
                 </a>
                 <div className="text-[10px] font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                    Source: Marshall Valuation Service
                 </div>
            </div>
        </div>
        
        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Improvement</div>
                <div className="col-span-1 text-right">Area</div>
                <div className="col-span-1 text-right">Profit</div>
                <div className="col-span-2 text-right">Cost New</div>
                <div className="col-span-2 text-right">Depreciation</div>
                <div className="col-span-2 text-right">Value</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-gray-50">
                {improvements.map(imp => {
                    const { costNew, depreciatedCost, totalDepreciationPct } = calculateLineItem(imp);
                    const profitPct = imp.entrepreneurialIncentive || 0;
                    
                    return (
                        <div key={imp.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50/50 transition-colors group">
                            {/* Structure */}
                            <div className="col-span-4">
                                <div className="text-sm font-bold text-gray-900">{imp.name}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{imp.occupancy} • {imp.quality}</div>
                            </div>
                            
                            {/* Area */}
                            <div className="col-span-1 text-right text-sm text-gray-600">
                                {imp.areaSf.toLocaleString()}
                            </div>

                            {/* Profit */}
                            <div className="col-span-1 text-right text-xs font-bold text-brand-600 bg-brand-50 rounded py-1 px-1.5 w-fit ml-auto">
                                +{(profitPct * 100).toFixed(0)}%
                            </div>

                            {/* Cost New */}
                            <div className="col-span-2 text-right text-sm font-medium text-gray-600">
                                {formatCurrency(costNew)}
                            </div>

                            {/* Depreciation */}
                            <div className="col-span-2 text-right text-sm font-medium text-red-500">
                                {totalDepreciationPct > 0 ? `-${(totalDepreciationPct * 100).toFixed(1)}%` : '0.0%'}
                            </div>

                            {/* Value & Actions */}
                            <div className="col-span-2 flex items-center justify-end gap-4 relative">
                                <span className="text-sm font-bold text-gray-900">{formatCurrency(depreciatedCost)}</span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-4 bg-white/80 backdrop-blur-sm px-1 rounded-l-md border border-r-0 border-gray-200 shadow-sm transform translate-x-full group-hover:-translate-x-full duration-200">
                                    <button onClick={() => handleEdit(imp)} className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(imp.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Site Improvements Row */}
                <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center bg-gray-50/30">
                     <div className="col-span-4">
                         <div className="text-sm font-bold text-gray-800">Site Improvements</div>
                         <div className="text-xs text-gray-400 mt-0.5">Paving, Landscaping, etc.</div>
                     </div>
                     <div className="col-span-1 text-right text-sm text-gray-400">-</div>
                     <div className="col-span-1 text-right text-sm text-gray-400">-</div>
                     <div className="col-span-2 flex justify-end">
                         <input 
                            type="number" 
                            value={siteImprovementsCost} 
                            onChange={(e) => setSiteImprovementsCost(+e.target.value)}
                            className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                         />
                     </div>
                     <div className="col-span-2 text-right text-sm text-gray-400">0.0%</div>
                     <div className="col-span-2 text-right text-sm font-bold text-gray-900">{formatCurrency(siteImprovementsCost)}</div>
                </div>
            </div>

            {/* Add Button */}
            <div className="px-6 py-3 border-t border-gray-200 bg-white">
                <button 
                    onClick={handleAddNew}
                    className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                    <Plus size={16} /> Add Improvement Component
                </button>
            </div>
        </div>

        {/* Footer Totals */}
        <div className="flex flex-col items-end gap-1 pr-6 pt-2">
            <div className="flex items-center justify-end gap-12 text-sm">
                <span className="text-gray-500">Total Cost New (Incl. Profit)</span>
                <span className="font-medium text-gray-700 min-w-[100px] text-right">{formatCurrency(totals.mvsCostNewTotal)}</span>
            </div>
            <div className="flex items-center justify-end gap-12 text-sm">
                <span className="text-gray-500">Total Depreciation</span>
                <span className="font-medium text-red-500 min-w-[100px] text-right">-{formatCurrency(totals.totalDepreciationAmount)}</span>
            </div>
            <div className="flex items-center justify-end gap-12 text-base mt-2 pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Indicated Value (MVS)</span>
                <span className="font-bold text-gray-900 min-w-[100px] text-right">{formatCurrency(totals.mvsTotalWithSite)}</span>
            </div>
        </div>

    </div>
  );
};