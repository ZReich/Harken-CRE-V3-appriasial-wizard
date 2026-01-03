import React, { useState, useRef } from 'react';
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
  onEditNotes?: (item: LineItem) => void;
}

export const InputRow: React.FC<InputRowProps> = ({
  item,
  variant,
  onChange,
  onDelete,
  placeholder = "Item Name",
  totalPropertySqFt = 1,
  effectiveGrossIncome = 0,
  onEditNotes
}) => {
  // Removed internal isNoteOpen state as we are using parent modal
  const dateInputRef = useRef<HTMLInputElement>(null);
  // const [isNoteOpen, setIsNoteOpen] = useState(false); // we are using parent modal

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
  const inputContainerClass = "relative bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-[#0da1c7] focus-within:border-transparent transition-all duration-200";
  const inputBaseClass = "w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 font-semibold px-3 py-2.5 text-sm placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-3 pt-1.5 leading-none";

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors p-2 rounded-xl z-0 hover:z-10">

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
            <input
              ref={dateInputRef}
              type="date"
              value={item.leaseExpiry || ''}
              onChange={(e) => onChange({ ...item, leaseExpiry: e.target.value })}
              className="text-sm bg-transparent text-slate-700 dark:text-slate-200 font-semibold hover:text-[#0da1c7] focus:text-[#0da1c7] outline-none cursor-pointer w-full dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <Calendar
              size={14}
              className="text-[#0da1c7] flex-shrink-0 cursor-pointer hover:text-[#0b8dad]"
              onClick={() => dateInputRef.current?.showPicker()}
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
              onChange={(e) => onChange({ ...item, itemSqFt: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => onChange({ ...item, marketRentPerSf: parseFloat(e.target.value) || 0 })}
                className={`${inputBaseClass} text-right pl-6 text-[#0da1c7]`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Annual Income */}
          <div className={`w-40 flex-shrink-0 ${inputContainerClass} bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700`}>
            <label className={labelClass}>Annual Rent</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={item.amount === 0 ? '' : item.amount}
                onChange={(e) => handleAnnualChange(e.target.value)}
                className={`${inputBaseClass} text-right pl-6 font-bold text-slate-800 dark:text-white`}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD / OTHER / REIMBURSEMENT */}
      {(variant === 'other' || variant === 'reimbursement') && (
        <div className={`w-48 flex-shrink-0 ${inputContainerClass} bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700`}>
          <label className={labelClass}>Annual Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              value={item.amount === 0 ? '' : item.amount}
              onChange={(e) => handleAnnualChange(e.target.value)}
              className={`${inputBaseClass} text-right pl-6 font-bold text-slate-800 dark:text-white`}
              placeholder="0.00"
            />
          </div>
        </div>
      )}

      {/* 4. EXPENSE & RESERVES VARIANT */}
      {(variant === 'expense' || variant === 'reserve') && (
        <div className="flex gap-3 items-center w-full sm:w-auto">
          {/* ANNUAL AMOUNT */}
          <div className={`w-48 flex-shrink-0 ${inputContainerClass} bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700`}>
            <label className={labelClass}>Annual Cost</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={item.amount === 0 ? '' : item.amount}
                onChange={(e) => handleAnnualChange(e.target.value)}
                className={`${inputBaseClass} text-right pl-6 font-bold text-slate-800 dark:text-white`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Metrics column */}
          <div className="flex flex-col gap-1 w-24">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-medium">% EGI</span>
              <span className="font-bold text-slate-600 dark:text-slate-300">{percentEgi.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-medium">$/SF</span>
              <span className="font-bold text-slate-600 dark:text-slate-300">${costPerSf.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. NOTES (Interactive Icon) */}
      <div className="relative w-full sm:w-auto hidden md:block">
        <button
          onClick={() => onEditNotes && onEditNotes(item)}
          className={`p-2 rounded-lg transition-all group/notes ${item.comments
            ? 'bg-[#0da1c7]/10 text-[#0da1c7] hover:bg-[#0da1c7]/20 border border-[#0da1c7]/20'
            : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500 dark:hover:text-slate-400'
            }`}
          title={item.comments ? "Edit Notes" : "Add Notes"}
        >
          <MessageSquare size={16} className={item.comments ? "fill-current" : ""} />
        </button>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/notes:opacity-100 group-hover/notes:visible transition-all z-50 pointer-events-none">
          <div className="font-bold text-slate-400 uppercase text-[10px] mb-1">Notes</div>
          <p className="line-clamp-3 leading-relaxed">
            {item.comments ? item.comments.replace(/<[^>]*>/g, '') : "Click to add analysis notes..."}
          </p>
          <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
        </div>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="absolute -right-2 top-0 sm:relative sm:right-auto sm:top-auto p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

