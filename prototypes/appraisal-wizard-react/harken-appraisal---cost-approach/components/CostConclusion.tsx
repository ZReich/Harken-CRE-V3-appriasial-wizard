
import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Check, ArrowRight, Wand2, TrendingUp, Sparkles } from 'lucide-react';
import { ValueScenario } from '../types';

interface CostConclusionProps {
  landValue: number;
  improvementsValue: number;
  scenario: ValueScenario;
  stabilizationAdjustment: number;
  onFinalValueChange: (val: number) => void;
}

export const CostConclusion: React.FC<CostConclusionProps> = ({ 
  landValue, 
  improvementsValue, 
  scenario,
  stabilizationAdjustment,
  onFinalValueChange 
}) => {
  // The raw mathematical sum
  const exactTotal = landValue + improvementsValue + stabilizationAdjustment;
  
  // The user's final "opinion" (rounded)
  const [finalValue, setFinalValue] = useState<number>(exactTotal);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Sync state if exactTotal changes (unless user has manually typed a number)
  useEffect(() => {
    if (!isManualOverride) {
      setFinalValue(exactTotal);
      onFinalValueChange(exactTotal);
    }
  }, [exactTotal, isManualOverride, onFinalValueChange]);

  const handleRound = (precision: number) => {
    const rounded = Math.round(exactTotal / precision) * precision;
    setFinalValue(rounded);
    setIsManualOverride(true);
    onFinalValueChange(rounded);
  };

  const handleManualChange = (val: number) => {
    setFinalValue(val);
    setIsManualOverride(true);
    onFinalValueChange(val);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Calculator size={16} className="text-brand-600"/>
                {scenario} Value Conclusion
            </h3>
            {scenario === 'As Stabilized' && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">
                    <TrendingUp size={10}/> OPTIMIZED SCENARIO
                </span>
            )}
         </div>
         <div className="text-xs text-gray-500 font-medium bg-gray-200/50 px-2 py-1 rounded">
            Cost Approach Module
         </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left: The Math Breakdown */}
        <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cost Components Breakdown</h4>
            
            <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-600 font-medium">Land Value Conclusion</span>
                <span className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{formatCurrency(landValue)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-600 font-medium">Depreciated Improvements</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-normal">(+)</span>
                    <span className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{formatCurrency(improvementsValue)}</span>
                </div>
            </div>

            {scenario === 'As Stabilized' && (
                <div className="flex justify-between items-center text-sm group text-green-700 bg-green-50/50 p-2 rounded -mx-2">
                    <span className="font-medium">Stabilization (Soft Costs/Lost Rent)</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70 font-normal">(+)</span>
                        <span className="font-bold">{formatCurrency(stabilizationAdjustment)}</span>
                    </div>
                </div>
            )}

            <div className="border-t border-gray-200 my-2 pt-3 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex flex-col">
                    <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wide">Exact Mathematical Total</span>
                    {scenario !== 'As Is' && <span className="text-[9px] text-brand-600 font-medium mt-0.5">Prospective Valuation Logic Applied</span>}
                </div>
                <span className="font-mono font-medium text-gray-600">{formatCurrency(exactTotal)}</span>
            </div>
        </div>

        {/* Right: The Indicated Value (Review) */}
        <div className="bg-brand-50/30 rounded-xl border border-brand-100 p-6 relative h-full">
             <div className="absolute -top-3 left-6 bg-white px-2 text-xs font-bold text-brand-600 uppercase tracking-wider border border-brand-100 rounded shadow-sm">
                Final Conclusion
             </div>

             <div className="space-y-6 flex flex-col h-full">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reported {scenario} Value</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-400 font-medium">$</span>
                        <input 
                            type="number" 
                            value={finalValue}
                            onChange={(e) => handleManualChange(+e.target.value)}
                            className="w-full pl-8 pr-4 py-3 text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        />
                         {isManualOverride && (
                            <div className="absolute right-4 top-4 text-green-600 animate-in zoom-in duration-300">
                                <Check size={20} />
                            </div>
                        )}
                    </div>
                    {isManualOverride ? (
                         <div className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                            <Sparkles size={12}/> Conclusion refined to avoid false precision.
                         </div>
                    ) : (
                         <div className="text-xs text-gray-400 mt-2">
                            Rounded values provide higher credibility in a final report.
                         </div>
                    )}
                </div>

                <div className="flex-1"></div>

                {/* Smart Rounding Actions */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button 
                        onClick={() => handleRound(1000)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm text-gray-700 text-[10px] font-bold uppercase tracking-wide rounded hover:bg-gray-50 hover:text-brand-600 transition-colors"
                    >
                        <Wand2 size={12} /> Round to $1k
                    </button>
                    <button 
                        onClick={() => handleRound(5000)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm text-gray-700 text-[10px] font-bold uppercase tracking-wide rounded hover:bg-gray-50 hover:text-brand-600 transition-colors"
                    >
                        <Wand2 size={12} /> Round to $5k
                    </button>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
