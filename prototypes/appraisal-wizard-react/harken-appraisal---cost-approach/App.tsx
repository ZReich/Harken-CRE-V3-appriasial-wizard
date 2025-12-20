
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandValuation } from './components/LandValuation';
import { ImprovementValuation } from './components/ImprovementValuation';
import { CostConclusion } from './components/CostConclusion';
import { RichEditor } from './components/RichEditor';
import { ArrowUpRight, Building2, Layers, Calendar, Info } from 'lucide-react';
import { ValueScenario } from './types';

export default function App() {
  const [landValue, setLandValue] = useState(0);
  const [improvementsValue, setImprovementsValue] = useState(0);
  const [finalIndicatedValue, setFinalIndicatedValue] = useState(0);
  
  const [activeSection, setActiveSection] = useState<'all' | 'land' | 'improvements'>('all');
  const [scenario, setScenario] = useState<ValueScenario>('As Is');

  // Professional Tip: Stabilization usually adds ~5-15% in soft costs (lost rent/commissions)
  const stabilizationAdjustment = scenario === 'As Stabilized' ? 125000 : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 relative scroll-smooth">
          <div className="w-full min-h-full pb-20">
            
            {/* Page Header & View Toggle */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 px-8 py-4 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
               <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      Cost Approach
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 mt-1">
                       <Calendar size={12}/> {scenario} Value
                    </div>
                  </div>

                  {/* Scenario Selector: The "Brain" of the appraisal */}
                  <div className="ml-4 h-10 bg-gray-100 rounded-lg p-1 flex items-center border border-gray-200 shadow-inner">
                    {(['As Is', 'As Completed', 'As Stabilized'] as ValueScenario[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setScenario(s)}
                        className={`px-3 h-full rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${scenario === s ? 'bg-white text-brand-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="bg-gray-100/80 p-1 rounded-lg border border-gray-200 flex items-center">
                 <button 
                   onClick={() => setActiveSection('all')}
                   className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'all' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                 >
                   <Layers size={14} /> Full View
                 </button>
                 <button 
                   onClick={() => setActiveSection('land')}
                   className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'land' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                 >
                   <ArrowUpRight size={14}/> Land
                 </button>
                 <button 
                   onClick={() => setActiveSection('improvements')}
                   className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'improvements' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                 >
                   <Building2 size={14}/> Improvements
                 </button>
               </div>
            </div>

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
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center text-brand-600">
                                <ArrowUpRight size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Land Valuation</h2>
                                <p className="text-xs text-gray-500">Sales Comparison Grid</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[700px] w-full relative border-t border-gray-100">
                      <LandValuation onValueChange={setLandValue} />
                    </div>
                  </section>
                )}

                {/* Improvement Valuation Section */}
                {(activeSection === 'all' || activeSection === 'improvements') && (
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
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
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Comments & Narrative</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                   </div>
                   <RichEditor />
                </section>
            </div>

          </div>
        </main>

        {/* Sidebar Summary */}
        <Sidebar 
          landValue={landValue} 
          improvementsValue={improvementsValue} 
          totalCostValue={finalIndicatedValue}
        />
      </div>
    </div>
  );
}
