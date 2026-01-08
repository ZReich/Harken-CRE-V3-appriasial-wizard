import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  Check, 
  MessageSquare,
  Calculator,
  PenLine
} from 'lucide-react';

/**
 * Override data structure for calculated fields
 * When a calculated value is overridden, we store both the override value
 * and a required note explaining the override rationale
 */
export interface OverrideData {
  /** The manually entered override value */
  overrideValue: number | string;
  /** Required explanation for the override */
  note: string;
  /** Original calculated value (for reference/display) */
  originalCalculated?: number | string | null;
  /** Timestamp when override was applied */
  overriddenAt?: string;
}

interface OverridePopoverProps {
  /** Current calculated value (before override) */
  calculatedValue: number | string | null;
  /** Current override data if field is already overridden */
  currentOverride?: OverrideData | null;
  /** Label for the field being overridden */
  fieldLabel: string;
  /** Format type for display and input */
  format: 'currency' | 'percent' | 'number' | 'text';
  /** Callback when override is applied */
  onApply: (override: OverrideData) => void;
  /** Callback when override is cleared (revert to calculated) */
  onClear: () => void;
  /** Callback when popover is closed */
  onClose: () => void;
  /** Position relative to trigger */
  position?: 'left' | 'right' | 'center';
}

export const OverridePopover: React.FC<OverridePopoverProps> = ({
  calculatedValue,
  currentOverride,
  fieldLabel,
  format,
  onApply,
  onClear,
  onClose,
  position = 'center'
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [overrideValue, setOverrideValue] = useState<string>(
    currentOverride?.overrideValue?.toString() ?? ''
  );
  const [note, setNote] = useState<string>(currentOverride?.note ?? '');
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDisplayValue = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percent':
        return `${(val * 100).toFixed(2)}%`;
      case 'number':
        return val.toLocaleString();
      default:
        return String(val);
    }
  };

  const parseInputValue = (input: string): number | string | null => {
    if (!input.trim()) return null;
    
    // Remove currency symbols, commas, percent signs
    const cleaned = input.replace(/[$,%\s]/g, '');
    
    if (format === 'text') return input;
    
    const num = parseFloat(cleaned);
    if (isNaN(num)) return null;
    
    // Convert percent input to decimal if needed
    if (format === 'percent' && !input.includes('.') && Math.abs(num) > 1) {
      return num / 100;
    }
    
    return num;
  };

  const handleApply = () => {
    setError(null);
    
    const parsedValue = parseInputValue(overrideValue);
    
    if (parsedValue === null) {
      setError('Please enter a valid value');
      return;
    }
    
    if (!note.trim()) {
      setError('A note explaining the override is required');
      setShowNoteEditor(true);
      return;
    }
    
    onApply({
      overrideValue: parsedValue,
      note: note.trim(),
      originalCalculated: calculatedValue,
      overriddenAt: new Date().toISOString()
    });
  };

  const handleClearOverride = () => {
    onClear();
  };

  const positionClass = {
    left: 'right-0',
    right: 'left-0',
    center: 'left-1/2 -translate-x-1/2'
  }[position];

  return (
    <div 
      ref={popoverRef}
      className={`override-popover absolute top-full mt-2 ${positionClass} w-72 bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-dark-border dark:border-dark-border z-[300] overflow-hidden`}
    >
      {/* Header */}
      <div className="bg-accent-amber-gold-light dark:bg-amber-900/30 px-4 py-3 border-b border-accent-amber-gold dark:border-amber-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold text-accent-amber-gold dark:text-amber-300 uppercase tracking-wide">
            Override Calculated Value
          </span>
        </div>
        <p className="text-[10px] text-accent-amber-gold dark:text-amber-400 mt-1">
          {fieldLabel}
        </p>
      </div>

      {/* Calculated Value Display */}
      <div className="px-4 py-3 bg-surface-2 dark:bg-elevation-2 dark:bg-slate-800/50 border-b border-light-border dark:border-dark-border dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-harken-gray-med uppercase">Calculated</span>
          </div>
          <span className="text-sm font-bold text-harken-gray dark:text-slate-200">
            {formatDisplayValue(calculatedValue)}
          </span>
        </div>
      </div>

      {/* Override Input */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="text-[10px] font-bold text-harken-gray-med dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <PenLine className="w-3 h-3" />
            Override Value
          </label>
          <input
            type="text"
            value={overrideValue}
            onChange={(e) => {
              setOverrideValue(e.target.value);
              setError(null);
            }}
            placeholder={format === 'percent' ? 'e.g. 5.25' : format === 'currency' ? 'e.g. 250000' : 'Enter value'}
            className="w-full px-3 py-2 text-sm border border-light-border dark:border-slate-600 rounded-lg bg-surface-1 dark:bg-slate-800 text-harken-gray dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber-gold focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          {format === 'percent' && (
            <p className="text-[10px] text-harken-gray-med mt-1">
              Enter as percentage (e.g., 5.25 for 5.25%)
            </p>
          )}
        </div>

        {/* Note Section */}
        <div>
          <button
            type="button"
            onClick={() => setShowNoteEditor(!showNoteEditor)}
            className="w-full flex items-center justify-between text-left"
          >
            <label className="text-[10px] font-bold text-harken-gray-med dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 cursor-pointer">
              <MessageSquare className="w-3 h-3" />
              Override Rationale
              <span className="text-harken-error">*</span>
            </label>
            <span className="text-[10px] text-harken-gray-med">
              {note ? `${note.slice(0, 20)}${note.length > 20 ? '...' : ''}` : '(required)'}
            </span>
          </button>
          
          {(showNoteEditor || !note) && (
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError(null);
              }}
              placeholder="Explain why you are overriding the calculated value..."
              rows={3}
              className="w-full mt-2 px-3 py-2 text-xs border border-light-border dark:border-slate-600 rounded-lg bg-surface-1 dark:bg-slate-800 text-harken-gray dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber-gold focus:border-transparent resize-none"
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-harken-error dark:text-harken-error flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-surface-2 dark:bg-elevation-2 dark:bg-slate-800/50 border-t border-light-border dark:border-dark-border dark:border-dark-border flex items-center gap-2">
        {currentOverride && (
          <button
            type="button"
            onClick={handleClearOverride}
            className="px-3 py-1.5 text-xs font-bold text-harken-error dark:text-harken-error hover:bg-accent-red-light dark:hover:bg-accent-red-light rounded-lg transition-colors"
          >
            Clear Override
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-harken-gray dark:text-slate-400 hover:bg-harken-gray-light dark:hover:bg-elevation-3 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-1.5 text-xs font-bold text-white bg-accent-amber-gold hover:bg-accent-amber-gold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Check className="w-3 h-3" />
          Apply Override
        </button>
      </div>
    </div>
  );
};

/**
 * Badge component to indicate a value has been overridden
 */
interface OverrideBadgeProps {
  override: OverrideData;
  onClick?: () => void;
  className?: string;
}

export const OverrideBadge: React.FC<OverrideBadgeProps> = ({ 
  override, 
  onClick,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-accent-amber-gold-light dark:bg-amber-900/40 text-accent-amber-gold dark:text-amber-400 border border-accent-amber-gold dark:border-amber-800 hover:bg-accent-amber-gold-light dark:hover:bg-amber-900/60 transition-colors cursor-pointer ${className}`}
      title={`Override: ${override.note}`}
    >
      <PenLine className="w-2.5 h-2.5" />
      Override
    </button>
  );
};

export default OverridePopover;
