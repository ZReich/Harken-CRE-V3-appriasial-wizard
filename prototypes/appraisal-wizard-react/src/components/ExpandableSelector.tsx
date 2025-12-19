import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X } from 'lucide-react';

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
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  default: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
  site: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  structure: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  systems: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  interior: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  market: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
};

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
}: ExpandableSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
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
      if (multiple) {
        onChange([...selectedValues.filter(v => v !== 'Type My Own'), customValue.trim()]);
      } else {
        onChange(customValue.trim());
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
      className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden animate-fade-in"
    >
      <div className="max-h-64 overflow-y-auto py-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
              isSelected(option)
                ? 'bg-[#0da1c7]/10 text-[#0da1c7] font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            role="option"
            aria-selected={isSelected(option)}
          >
            <span>{option}</span>
            {isSelected(option) && (
              <Check className="w-4 h-4 text-[#0da1c7]" />
            )}
          </button>
        ))}

        {allowCustom && (
          <div className="border-t border-gray-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={customValue}
                onChange={(e) => handleCustomChange(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customValue.trim()}
                className="px-3 py-2 text-sm font-medium text-white bg-[#0da1c7] rounded-lg hover:bg-[#0b8fb0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {multiple && selectedValues.length > 0 && (
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
          <div className="flex flex-wrap gap-1.5">
            {selectedValues.filter(v => v !== 'Type My Own').map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#0da1c7]/10 text-[#0da1c7] rounded-full"
              >
                {val.length > 15 ? val.substring(0, 12) + '...' : val}
                <button
                  type="button"
                  onClick={(e) => handleRemoveValue(val, e)}
                  className="hover:bg-[#0da1c7]/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
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
        className={`w-full flex items-center justify-between gap-2 px-4 ${
          compact ? 'py-2' : 'py-2.5'
        } rounded-xl border ${
          isExpanded
            ? 'border-[#0da1c7] bg-white shadow-md ring-2 ring-[#0da1c7]'
            : hasSelection || hasCustomValue
            ? `${colors.border} ${colors.bg}`
            : 'border-gray-200 bg-white hover:border-gray-300'
        } transition-all duration-200`}
        aria-expanded={isExpanded}
        aria-controls={`options-${id}`}
      >
        <span className={`text-sm font-medium ${hasSelection || hasCustomValue ? colors.text : 'text-gray-600'}`}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>

        <div className="flex items-center gap-2">
          {displayText && (
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#0da1c7]/10 text-[#0da1c7] rounded-full">
              {displayText}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
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

