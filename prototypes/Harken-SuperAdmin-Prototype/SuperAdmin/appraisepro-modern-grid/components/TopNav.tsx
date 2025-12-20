import React from 'react';
import { ChevronRight, Settings, Save } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
          <span>Appraisal Setup</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">In Progress</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="font-semibold text-slate-800">Commercial Appraisal - Standard</div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-500">Phase 2 of 5 • Assignment Details</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Stepper (Simplified Visual) */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium">
           <div className="flex items-center gap-2 text-slate-400">
              <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center">1</div>
              Template
           </div>
           <div className="w-8 h-px bg-slate-200"></div>
           <div className="flex items-center gap-2 text-blue-600">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">2</div>
              Setup
           </div>
           <div className="w-8 h-px bg-slate-200"></div>
           <div className="flex items-center gap-2 text-slate-400">
              <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center">3</div>
              Subject Data
           </div>
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Draft</span>
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm shadow-cyan-200 transition-all text-sm font-semibold">
              Continue
              <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};
