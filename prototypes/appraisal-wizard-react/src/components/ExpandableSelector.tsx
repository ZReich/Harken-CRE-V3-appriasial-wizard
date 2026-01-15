import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X, Star } from 'lucide-react';

interface ExpandableSelectorProps {
  id: string;
  label: string;
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  allowCustom?: boolean;
  category?: 'default' | 'site' | 'structure' | 'systems' | 'interior' | 'market';
  required?: boolean;
  placeholder?: string;
  compact?: boolean;
  multiple?: boolean;
  customOptions?: string[];
  onCustomAdd?: (value: string, category: string) => void;
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  default: { bg: 'bg-harken-gray-light dark:bg-elevation-2', border: 'border-light-border dark:border-dark-border', text: 'text-harken-gray dark:text-slate-300' },
  site: { bg: 'bg-accent-teal-mint-light dark:bg-accent-teal-mint/20', border: 'border-accent-teal-mint-light dark:border-accent-teal-mint/30', text: 'text-accent-teal-mint' },
  structure: { bg: 'bg-surface-1 dark:bg-elevation-1', border: 'border-accent-cyan dark:border-accent-cyan/60', text: 'text-accent-cyan' },
  systems: { bg: 'bg-accent-amber-gold-light dark:bg-accent-amber-gold/20', border: 'border-accent-amber-gold-light dark:border-accent-amber-gold/30', text: 'text-accent-amber-gold' },
  interior: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-400' },
  market: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-700', text: 'text-rose-700 dark:text-rose-400' },
};

// Local storage key for custom options
const CUSTOM_OPTIONS_KEY = 'harken-custom-selector-options';

// Load custom options from localStorage
export function loadCustomOptions(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(CUSTOM_OPTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save custom option to localStorage
export function saveCustomOption(category: string, value: string): void {
  try {
    const current = loadCustomOptions();
    if (!current[category]) {
      current[category] = [];
    }
    if (!current[category].includes(value)) {
      current[category].push(value);
      localStorage.setItem(CUSTOM_OPTIONS_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Failed to save custom option:', e);
  }
}

// Get custom options for a specific category
export function getCustomOptionsForCategory(category: string): string[] {
  const all = loadCustomOptions();
  return all[category] || [];
}

export default function ExpandableSelector({
  id,
  label,
  options,
  value,
  onChange,
  allowCustom = true,
  category = 'default',
  required = false,
  placeholder = 'Enter custom value...',
  compact = false,
  multiple = true,
  customOptions: externalCustomOptions,
  onCustomAdd,
}: ExpandableSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [localCustomOptions, setLocalCustomOptions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load custom options on mount
  useEffect(() => {
    const stored = getCustomOptionsForCategory(id);
    setLocalCustomOptions(stored);
  }, [id]);

  // Merge all options: default + external custom + local custom
  const allCustomOptions = [...new Set([...(externalCustomOptions || []), ...localCustomOptions])];

  // Normalize value to array for multi-select
  const selectedValues: string[] = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (Array.isArray(value) ? value : (value ? [value] : []));

  const isSelected = (option: string) => selectedValues.includes(option);
  const hasSelection = selectedValues.length > 0 && !selectedValues.includes('Type My Own');
  const hasCustomValue = selectedValues.some(v => v && !options.includes(v) && v !== 'Type My Own');

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 320; // estimated max height

      // Position above if not enough space below
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownStyle({
        position: 'fixed',
        top: showAbove ? 'auto' : rect.bottom + 8,
        bottom: showAbove ? viewportHeight - rect.top + 8 : 'auto',
        left: rect.left,
        width: Math.max(rect.width, 280),
        zIndex: 9999,
      });
    }
  }, []);

  // Update position when expanded
  useEffect(() => {
    if (isExpanded) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isExpanded, updateDropdownPosition]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (selectedOption: string) => {
    if (selectedOption === 'Type My Own') {
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    if (multiple) {
      if (isSelected(selectedOption)) {
        const newValues = selectedValues.filter(v => v !== selectedOption);
        onChange(newValues);
      } else {
        onChange([...selectedValues, selectedOption]);
      }
    } else {
      onChange(selectedOption);
      setIsExpanded(false);
    }
  };

  const handleRemoveValue = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    onChange(multiple ? newValues : (newValues[0] || ''));
  };

  const handleCustomChange = (newValue: string) => {
    setCustomValue(newValue);
  };

  const handleAddCustom = () => {
    if (customValue.trim()) {
      const trimmedValue = customValue.trim();

      // Save to localStorage for future use
      saveCustomOption(id, trimmedValue);
      setLocalCustomOptions(prev => [...prev, trimmedValue]);

      // Notify parent if callback provided
      if (onCustomAdd) {
        onCustomAdd(trimmedValue, category);
      }

      // Add to selection
      if (multiple) {
        onChange([...selectedValues.filter(v => v !== 'Type My Own'), trimmedValue]);
      } else {
        onChange(trimmedValue);
      }
      setCustomValue('');
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const colors = categoryColors[category] || categoryColors.default;

  const getDisplayText = () => {
    if (!hasSelection && !hasCustomValue) return null;

    const displayCount = selectedValues.filter(v => v !== 'Type My Own').length;
    if (displayCount === 0) return null;
    if (displayCount === 1) {
      const val = selectedValues.find(v => v !== 'Type My Own') || '';
      return val.length > 20 ? val.substring(0, 17) + '...' : val;
    }
    return `${displayCount} selected`;
  };

  const displayText = getDisplayText();

  const dropdownContent = isExpanded && (
    <div
      ref={dropdownRef}
      id={`options-${id}`}
      style={dropdownStyle}
      className="bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-dark-border shadow-2xl overflow-hidden animate-fade-in"
    >
      {/* Selected items header (for multi-select) */}
      {multiple && selectedValues.length > 0 && (
        <div className="border-b border-light-border dark:border-dark-border px-3 py-2 bg-harken-blue/5 dark:bg-harken-blue/10">
          <div className="text-xs font-medium text-harken-gray-med dark:text-slate-400 mb-1.5">Selected ({selectedValues.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedValues.filter(v => v !== 'Type My Own').map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-harken-blue/10 text-harken-blue rounded-full"
              >
                {val.length > 15 ? val.substring(0, 12) + '...' : val}
                <button
                  type="button"
                  onClick={(e) => handleRemoveValue(val, e)}
                  className="hover:bg-harken-blue/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto py-1 px-1">
        {/* Standard options */}
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-all rounded-lg my-0.5 ${isSelected(option)
                ? 'bg-accent-cyan/10 text-accent-cyan font-semibold ring-1 ring-accent-cyan'
                : 'text-harken-gray dark:text-slate-300 hover:ring-1 hover:ring-accent-cyan hover:text-accent-cyan'
              }`}
            role="option"
            aria-selected={isSelected(option)}
          >
            <span>{option}</span>
            {isSelected(option) && (
              <Check className="w-4 h-4 text-accent-cyan" />
            )}
          </button>
        ))}

        {/* Custom options (previously saved) */}
        {allCustomOptions.length > 0 && (
          <>
            <div className="px-4 py-1.5 text-xs font-semibold text-harken-gray-med dark:text-slate-400 uppercase tracking-wide bg-harken-gray-light dark:bg-elevation-2 border-t border-b border-light-border dark:border-dark-border">
              Your Custom Options
            </div>
            {allCustomOptions.filter(o => !options.includes(o)).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-all rounded-lg mx-1 my-0.5 ${isSelected(option)
                    ? 'bg-accent-cyan/10 text-accent-cyan font-semibold ring-1 ring-accent-cyan'
                    : 'text-harken-gray dark:text-slate-300 hover:ring-1 hover:ring-accent-cyan hover:text-accent-cyan'
                  }`}
                role="option"
                aria-selected={isSelected(option)}
              >
                <span className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-accent-amber-gold" />
                  {option}
                </span>
                {isSelected(option) && (
                  <Check className="w-4 h-4 text-accent-cyan" />
                )}
              </button>
            ))}
          </>
        )}

        {/* Add custom value */}
        {allowCustom && (
          <div className="border-t border-light-border dark:border-dark-border px-4 py-3 bg-harken-gray-light dark:bg-elevation-2">
            <div className="text-xs font-medium text-harken-gray-med dark:text-slate-400 mb-2">Add custom option (saved for future use)</div>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={customValue}
                onChange={(e) => handleCustomChange(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customValue.trim()}
                className="px-3 py-2 text-sm font-medium text-white bg-harken-blue rounded-lg hover:bg-harken-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      data-selector-id={id}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between gap-2 px-4 ${compact ? 'py-2' : 'py-2.5'
          } rounded-xl border ${isExpanded
            ? 'border-harken-blue bg-surface-1 dark:bg-elevation-1 shadow-md ring-2 ring-harken-blue'
            : hasSelection || hasCustomValue
              ? `${colors.border} ${colors.bg}`
              : 'border-light-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1 hover:border-accent-cyan/50 dark:hover:border-accent-cyan/50'
          } transition-all duration-200`}
        aria-expanded={isExpanded}
        aria-controls={`options-${id}`}
      >
        <span className={`text-sm font-medium ${hasSelection || hasCustomValue ? colors.text : 'text-harken-gray dark:text-slate-300'}`}>
          {label}
          {required && <span className="text-harken-error ml-0.5">*</span>}
        </span>

        <div className="flex items-center gap-2">
          {displayText && (
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-harken-blue/10 text-harken-blue rounded-full">
              {displayText}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-harken-gray-med transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
              }`}
          />
        </div>
      </button>

      {createPortal(dropdownContent, document.body)}
    </div>
  );
}

// Year Selector variant
interface YearSelectorProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  required?: boolean;
  includeNA?: boolean;
}

export function YearSelector({
  id,
  label,
  value,
  onChange,
  required = false,
  includeNA = false,
}: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  if (includeNA) {
    years.push('N/A');
    years.push('Not remodeled');
  }

  for (let y = currentYear + 5; y >= 1900; y--) {
    years.push(y.toString());
  }

  const handleChange = (selected: string | string[]) => {
    const val = Array.isArray(selected) ? selected[0] : selected;
    if (val === 'N/A' || val === 'Not remodeled' || !val) {
      onChange(null);
    } else {
      onChange(parseInt(val, 10));
    }
  };

  return (
    <ExpandableSelector
      id={id}
      label={label}
      options={years}
      value={value?.toString() || ''}
      onChange={handleChange}
      allowCustom={false}
      required={required}
      category="structure"
      multiple={false}
    />
  );
}
