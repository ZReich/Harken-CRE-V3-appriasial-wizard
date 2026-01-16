/**
 * DisplayModeToggle.tsx
 * Toggle for selecting how component values are displayed in the report.
 * Options: Combined, Individual, or Both.
 */

import React from 'react';
import { LayoutGrid, Layers, LayoutList, Check } from 'lucide-react';

type DisplayMode = 'combined' | 'individual' | 'both';

interface DisplayModeToggleProps {
  value: DisplayMode;
  onChange: (mode: DisplayMode) => void;
  className?: string;
}

interface ModeOption {
  id: DisplayMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'combined',
    label: 'Combined',
    description: 'Show only the total combined value',
    icon: Layers,
  },
  {
    id: 'individual',
    label: 'Individual',
    description: 'Show each component value separately',
    icon: LayoutList,
  },
  {
    id: 'both',
    label: 'Both',
    description: 'Show individual values and combined total',
    icon: LayoutGrid,
  },
];

export function DisplayModeToggle({
  value,
  onChange,
  className = '',
}: DisplayModeToggleProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-harken-dark dark:text-white mb-3">
        Value Display Mode
      </label>
      <p className="text-xs text-harken-gray-med dark:text-slate-400 mb-3">
        Choose how component values appear in the final report
      </p>
      
      <div className="grid grid-cols-3 gap-3">
        {MODE_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          const Icon = option.icon;
          
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-harken-blue bg-harken-blue/5 dark:border-cyan-400 dark:bg-cyan-500/10'
                  : 'border-light-border dark:border-harken-gray hover:border-harken-blue/50 dark:hover:border-cyan-500/50 bg-white dark:bg-elevation-2'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-harken-blue dark:bg-cyan-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
              
              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-3
                ${isSelected
                  ? 'bg-harken-blue/10 dark:bg-cyan-500/20'
                  : 'bg-slate-100 dark:bg-slate-800'
                }
              `}>
                <Icon className={`
                  w-5 h-5
                  ${isSelected
                    ? 'text-harken-blue dark:text-cyan-400'
                    : 'text-harken-gray-med dark:text-slate-400'
                  }
                `} />
              </div>
              
              {/* Label */}
              <span className={`
                block text-sm font-semibold mb-1
                ${isSelected
                  ? 'text-harken-blue dark:text-cyan-400'
                  : 'text-harken-dark dark:text-white'
                }
              `}>
                {option.label}
              </span>
              
              {/* Description */}
              <span className="text-xs text-harken-gray-med dark:text-slate-400">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DisplayModeToggle;
