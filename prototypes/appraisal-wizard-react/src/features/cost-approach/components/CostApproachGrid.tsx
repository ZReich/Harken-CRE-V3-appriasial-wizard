import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Building2, Layers, Calendar, Info } from 'lucide-react';
import { LandValuation } from './LandValuation';
import { ImprovementValuation } from './ImprovementValuation';
import { CostConclusion } from './CostConclusion';
import { RichTextEditor } from './RichTextEditor';
import { ValueScenario } from '../types';
import { SCENARIO_OPTIONS } from '../constants';

interface CostApproachGridProps {
  onValueChange?: (value: number) => void;
}

export const CostApproachGrid: React.FC<CostApproachGridProps> = ({ onValueChange }) => {
  const [landValue, setLandValue] = useState(0);
  const [improvementsValue, setImprovementsValue] = useState(0);
  const [finalIndicatedValue, setFinalIndicatedValue] = useState(0);
  
  const [activeSection, setActiveSection] = useState<'all' | 'land' | 'improvements'>('all');
  const [scenario, setScenario] = useState<ValueScenario>('As Is');

  // Stabilization usually adds ~5-15% in soft costs (lost rent/commissions)
  const stabilizationAdjustment = scenario === 'As Stabilized' ? 125000 : 0;

  // Notify parent of value changes
  useMemo(() => {
    onValueChange?.(finalIndicatedValue);
  }, [finalIndicatedValue, onValueChange]);

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
            onClick={() => setActiveSection('land')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'land' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <ArrowUpRight size={14}/> Land
          </button>
          <button 
            onClick={() => setActiveSection('improvements')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'improvements' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Building2 size={14}/> Improvements
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth">
        <div className="w-full min-h-full pb-20">
          <div className="p-6 space-y-8">
            {/* Informational Banner for Scenarios */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Info className="text-blue-500 shrink-0" size={20}/>
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-0.5">Scenario Logic Active: <span className="underline">{scenario}</span></p>
                <p className="opacity-80">
                  {scenario === 'As Is' && "Value represents property 'as-of-inspection' date including all current depreciation."}
                  {scenario === 'As Completed' && "Value assumes construction is 100% finished. Physical depreciation is zeroed for new components."}
                  {scenario === 'As Stabilized' && "Includes additional soft costs for lease-up time, absorption, and brokerage commissions."}
                </p>
              </div>
            </div>

            {/* Land Valuation Section */}
            {(activeSection === 'all' || activeSection === 'land') && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#0da1c7]/10 flex items-center justify-center text-[#0da1c7]">
                      <ArrowUpRight size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Land Valuation</h2>
                      <p className="text-xs text-slate-500">Sales Comparison Grid</p>
                    </div>
                  </div>
                </div>
                <div className="h-[700px] w-full relative border-t border-slate-100">
                  <LandValuation onValueChange={setLandValue} />
                </div>
              </section>
            )}

            {/* Improvement Valuation Section */}
            {(activeSection === 'all' || activeSection === 'improvements') && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                <ImprovementValuation onValueChange={setImprovementsValue} />
              </section>
            )}

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

