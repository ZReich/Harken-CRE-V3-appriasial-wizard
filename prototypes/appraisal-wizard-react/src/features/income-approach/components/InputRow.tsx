import React, { useState } from 'react';
import { Trash2, Calendar, MessageSquare, X } from 'lucide-react';
import type { LineItem } from '../types';

interface InputRowProps {
  item: LineItem;
  variant: 'rental' | 'reimbursement' | 'other' | 'expense' | 'reserve';
  onChange: (updated: LineItem) => void;
  onDelete: (id: string) => void;
  placeholder?: string;
  totalPropertySqFt?: number;
  effectiveGrossIncome?: number;
}

export const InputRow: React.FC<InputRowProps> = ({ 
  item, 
  variant, 
  onChange, 
  onDelete, 
  placeholder = "Item Name",
  totalPropertySqFt = 1,
  effectiveGrossIncome = 0
}) => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  
  const handleAnnualChange = (val: string) => {
    const annual = parseFloat(val) || 0;
    onChange({ ...item, amount: annual });
  };

  const handleContractRentSfChange = (val: string) => {
    const rpsf = parseFloat(val) || 0;
    const sf = item.itemSqFt || 0;
    if (sf > 0) {
      onChange({ ...item, amount: rpsf * sf });
    }
  };

  // Calculations
  const contractRentPerSf = (item.itemSqFt && item.itemSqFt > 0) ? item.amount / item.itemSqFt : 0;
  const percentEgi = effectiveGrossIncome > 0 ? (item.amount / effectiveGrossIncome) * 100 : 0;
  const costPerSf = totalPropertySqFt > 0 ? item.amount / totalPropertySqFt : 0;

  // Helper styles for big inputs - matches SetupPage input patterns
  const inputContainerClass = "relative bg-white rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#0da1c7] focus-within:border-transparent transition-all duration-200";
  const inputBaseClass = "w-full bg-transparent border-none outline-none text-slate-700 font-semibold px-3 py-2.5 text-sm placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-wide px-3 pt-1.5 leading-none";

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-white/50 transition-colors p-2 rounded-xl z-0 hover:z-10">
      
      {/* 1. NAME COLUMN */}
      <div className="flex-grow w-full sm:w-auto min-w-[150px]">
        <div className={`${inputContainerClass}`}>
          <label className={labelClass}>Description / Source</label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => onChange({ ...item, name: e.target.value })}
            placeholder={placeholder}
            className={`${inputBaseClass} text-base`}
          />
        </div>
      </div>
      
      {/* 1b. LEASE EXPIRY - For Rental Variant (separate column, not nested) */}
      {variant === 'rental' && (
        <div className={`w-36 flex-shrink-0 ${inputContainerClass}`}>
          <label className={labelClass}>Lease Expiry</label>
          <div className="flex items-center gap-2 px-3 py-2">
            <Calendar size={14} className="text-[#0da1c7] flex-shrink-0" />
            <input 
              type="date"
              value={item.leaseExpiry || ''}
              onChange={(e) => onChange({...item, leaseExpiry: e.target.value})}
              className="text-sm bg-transparent text-slate-700 font-semibold hover:text-[#0da1c7] focus:text-[#0da1c7] outline-none cursor-pointer w-full"
            />
          </div>
        </div>
      )}
      
      {/* 2. RENTAL VARIANT COLUMNS */}
      {variant === 'rental' && (
        <div className="flex gap-2 w-full sm:w-auto">
          {/* SF */}
          <div className={`w-28 flex-shrink-0 ${inputContainerClass}`}>
            <label className={labelClass}>Sq Ft</label>
            <input
              type="number"
              value={item.itemSqFt === 0 || !item.itemSqFt ? '' : item.itemSqFt}
              onChange={(e) => onChange({...item, itemSqFt: parseFloat(e.target.value) || 0})}
              className={`${inputBaseClass} text-center`}
              placeholder="0"
            />
          </div>

          {/* Contract Rent $/SF */}
          <div className={`w-32 flex-shrink-0 ${inputContainerClass}`}>
            <label className={labelClass}>Rent/SF</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={contractRentPerSf === 0 ? '' : contractRentPerSf.toFixed(2)}
                onChange={(e) => handleContractRentSfChange(e.target.value)}
                className={`${inputBaseClass} text-right pl-6`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Market Rent $/SF */}
          <div className={`w-32 flex-shrink-0 ${inputContainerClass}`}>
            <label className={labelClass}>Mkt/SF</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={item.marketRentPerSf === 0 || !item.marketRentPerSf ? '' : item.marketRentPerSf}
                onChange={(e) => onChange({...item, marketRentPerSf: parseFloat(e.target.value) || 0})}
                className={`${inputBaseClass} text-right pl-6 text-[#0da1c7]`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Annual Income */}
          <div className={`w-40 flex-shrink-0 ${inputContainerClass} bg-white ring-1 ring-slate-200`}>
            <label className={labelClass}>Annual Rent</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={item.amount === 0 ? '' : item.amount}
                onChange={(e) => handleAnnualChange(e.target.value)}
                className={`${inputBaseClass} text-right pl-6 font-bold text-slate-800`}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD / OTHER / REIMBURSEMENT */}
      {(variant === 'other' || variant === 'reimbursement') && (
        <div className={`w-48 flex-shrink-0 ${inputContainerClass} bg-white ring-1 ring-slate-200`}>
          <label className={labelClass}>Annual Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              value={item.amount === 0 ? '' : item.amount}
              onChange={(e) => handleAnnualChange(e.target.value)}
              className={`${inputBaseClass} text-right pl-6 font-bold text-slate-800`}
              placeholder="0.00"
            />
          </div>
        </div>
      )}

      {/* 4. EXPENSE & RESERVES VARIANT */}
      {(variant === 'expense' || variant === 'reserve') && (
        <div className="flex gap-3 items-center w-full sm:w-auto">
          {/* ANNUAL AMOUNT */}
          <div className={`w-48 flex-shrink-0 ${inputContainerClass} bg-white ring-1 ring-slate-200`}>
            <label className={labelClass}>Annual Cost</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={item.amount === 0 ? '' : item.amount}
                onChange={(e) => handleAnnualChange(e.target.value)}
                className={`${inputBaseClass} text-right pl-6 font-bold text-slate-800`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Metrics column */}
          <div className="flex flex-col gap-1 w-24">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">% EGI</span>
              <span className="font-bold text-slate-600">{percentEgi.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">$/SF</span>
              <span className="font-bold text-slate-600">${costPerSf.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. NOTES (Interactive Popover) */}
      <div className="relative w-full sm:w-48 hidden md:block">
        {/* Trigger (Closed State) */}
        <div 
          onClick={() => setIsNoteOpen(true)}
          className={`${inputContainerClass} cursor-text hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-[#0da1c7]/30 transition-all`}
        >
          <div className="flex justify-between items-start">
            <label className={labelClass}>Notes</label>
            <MessageSquare size={12} className="text-[#0da1c7] mt-2 mr-2 opacity-50" />
          </div>
          <div className={`${inputBaseClass} truncate text-slate-500 font-medium h-[36px] flex items-center`}>
            {item.comments ? (
              <span className="text-slate-700">{item.comments.replace(/<[^>]*>/g, '').substring(0, 20) + (item.comments.length > 20 ? '...' : '')}</span>
            ) : (
              <span className="text-slate-400 italic">Add details...</span>
            )}
          </div>
        </div>

        {/* Popover (Open State) */}
        {isNoteOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setIsNoteOpen(false)}></div>
            <div className="absolute top-0 right-0 w-[600px] z-50 animate-fade-in origin-top-right">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-200 p-1">
                <div className="bg-slate-50/50 p-2 flex items-center justify-between border-b border-slate-100 mb-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-2">
                    Editing Notes: {item.name || "Untitled Item"}
                  </span>
                  <button onClick={() => setIsNoteOpen(false)} className="p-1 hover:bg-slate-200 rounded-md text-slate-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                
                <div className="px-3 py-3">
                  <textarea
                    value={item.comments || ''}
                    onChange={(e) => onChange({ ...item, comments: e.target.value })}
                    placeholder="Enter notes, assumptions, or details about this line item..."
                    className="w-full min-h-[120px] p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent leading-relaxed"
                  />
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-xl">
                  <button onClick={() => setIsNoteOpen(false)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                    Done
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="absolute -right-2 top-0 sm:relative sm:right-auto sm:top-auto p-2 text-slate-300 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

