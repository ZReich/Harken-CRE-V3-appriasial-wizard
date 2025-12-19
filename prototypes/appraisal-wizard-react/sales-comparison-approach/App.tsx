
import React, { useState } from 'react';
import { SalesGrid } from './components/SalesGrid';
import { PROPERTIES, MOCK_VALUES } from './constants';
import { Layers, Building, StickyNote } from 'lucide-react';

const App: React.FC = () => {
  const [analysisMode, setAnalysisMode] = useState<'standard' | 'residual'>('standard');

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col">
      {/* Header for context, but minimal */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-40 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">A</span>
            Sales Comparison Grid
          </h1>
        </div>
        <div className="flex items-center gap-4">
           {/* Analysis Mode Toggle */}
           <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
             <button 
                onClick={() => setAnalysisMode('standard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all ${
                  analysisMode === 'standard' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <Layers className="w-3.5 h-3.5" />
                Standard
             </button>
             <button 
                onClick={() => setAnalysisMode('residual')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all ${
                  analysisMode === 'residual' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <Building className="w-3.5 h-3.5" />
                Improvement Analysis
             </button>
           </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-hidden relative">
         <SalesGrid properties={PROPERTIES} values={MOCK_VALUES} analysisMode={analysisMode} />
      </div>
    </div>
  );
};

export default App;
