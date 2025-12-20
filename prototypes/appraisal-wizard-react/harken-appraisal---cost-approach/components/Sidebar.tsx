
import React from 'react';
import { ArrowLeft, ArrowRight, Edit2 } from 'lucide-react';

interface SidebarProps {
  landValue: number;
  improvementsValue: number;
  totalCostValue: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ landValue, improvementsValue, totalCostValue }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <aside className="w-80 bg-[#dbe0e4] border-l border-gray-300 flex flex-col h-full flex-shrink-0">
      <div className="p-8 space-y-10 flex-1 overflow-y-auto">
        
        {/* Income Section */}
        <div className="space-y-1">
          <h3 className="text-base font-normal text-gray-800 uppercase tracking-wide">Income</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-600/70">$0</span>
            <span className="text-base font-medium text-gray-500">25%</span>
            <Edit2 size={14} className="text-gray-400 cursor-pointer hover:text-gray-600 ml-1" />
          </div>
          <div className="text-xs text-brand-500 font-medium tracking-wide">$0/SF</div>
        </div>

        {/* Sales Section */}
        <div className="space-y-1">
          <h3 className="text-base font-normal text-gray-800 uppercase tracking-wide">Sales</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-600/70">$0</span>
            <span className="text-base font-medium text-gray-500">50%</span>
            <Edit2 size={14} className="text-gray-400 cursor-pointer hover:text-gray-600 ml-1" />
          </div>
          <div className="text-xs text-brand-500 font-medium tracking-wide">$235/SF</div>
        </div>

        {/* Cost Section (Active) */}
        <div className="space-y-1 relative">
          <h3 className="text-base font-normal text-gray-800 uppercase tracking-wide">Cost</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-600 transition-all duration-500">
              {formatCurrency(totalCostValue)}
            </span>
            <span className="text-base font-bold text-gray-700">25%</span>
            <Edit2 size={14} className="text-gray-400 cursor-pointer hover:text-gray-600 ml-1" />
          </div>
          <div className="text-xs text-brand-500 font-medium tracking-wide mb-2">$0/SF</div>
          
          {/* Cost breakdown */}
          <div className="flex justify-between text-xs text-gray-500 mt-2 border-t border-gray-300/50 pt-2">
            <span>Land:</span>
            <span className="font-medium text-gray-700">{formatCurrency(landValue)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Improv:</span>
            <span className="font-medium text-gray-700">{formatCurrency(improvementsValue)}</span>
          </div>
        </div>

        {/* Weighted Total */}
        <div className="pt-8">
           <h3 className="text-lg font-normal text-gray-800 uppercase tracking-wide mb-1">Weighted Total</h3>
           <div className="text-3xl font-bold text-brand-600/80">
             {formatCurrency(0)} 
           </div>
           <div className="text-sm text-brand-500 mt-1 font-medium tracking-wide">$117/SF</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 flex gap-2">
        <button className="w-12 h-12 bg-gray-400 hover:bg-gray-500 text-white rounded shadow-sm flex items-center justify-center transition-all">
          <ArrowLeft size={20} />
        </button>
        <button className="flex-1 h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded shadow-md flex items-center justify-center gap-2 transition-all uppercase tracking-wide text-sm">
          Next <ArrowRight size={18} />
        </button>
      </div>
    </aside>
  );
};
