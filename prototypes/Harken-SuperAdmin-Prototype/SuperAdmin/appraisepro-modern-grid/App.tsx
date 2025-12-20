import React from 'react';
import { SalesGrid } from './components/SalesGrid';
import { PROPERTIES, MOCK_VALUES } from './constants';

const App: React.FC = () => {
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
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
             <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm">Grid View</button>
             <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700">Analytics</button>
           </div>
           <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
             Export Report
           </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-hidden relative">
         <SalesGrid properties={PROPERTIES} values={MOCK_VALUES} />
      </div>
    </div>
  );
};

export default App;