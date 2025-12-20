import React from 'react';
import { ChevronDown } from 'lucide-react';

const tabs = [
  'Setup',
  'Overview',
  'Income Approach',
  'Sales Approach',
  'Lease Approach',
  'Cost Approach',
  'Exhibits',
  'Review',
];

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`
              relative px-4 py-4 text-sm font-medium transition-colors
              ${
                tab === 'Cost Approach'
                  ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <span className="flex items-center gap-1">
              {tab}
              {['Overview', 'Income Approach', 'Sales Approach', 'Lease Approach', 'Cost Approach'].includes(tab) && (
                <ChevronDown size={14} className="opacity-50" />
              )}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
          JD
        </div>
      </div>
    </header>
  );
};