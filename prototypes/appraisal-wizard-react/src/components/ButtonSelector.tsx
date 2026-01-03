import type { FC, ReactNode } from 'react';

// ==========================================
// TYPES
// ==========================================
export interface ButtonOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ButtonSelectorProps {
  options: ButtonOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ==========================================
// BUTTON SELECTOR COMPONENT
// ==========================================
/**
 * A horizontal row of styled buttons for selecting a single option.
 * Replaces dropdowns with a more visual, modern selection pattern.
 * 
 * Pattern matches ImprovementsInventory.tsx line 706
 */
const ButtonSelector: FC<ButtonSelectorProps> = ({
  options,
  value,
  onChange,
  label,
  required = false,
  size = 'md',
  className = '',
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-2 ${sizeClasses[size]} rounded-lg border-2 font-medium transition-all ${isSelected
                ? 'border-[#0da1c7] bg-[#0da1c7]/10 text-[#0da1c7] dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#0da1c7]/50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-cyan-400/50'
                }`}
            >
              {opt.icon && (
                <span className={iconSizes[size]}>
                  {opt.icon}
                </span>
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ButtonSelector;

