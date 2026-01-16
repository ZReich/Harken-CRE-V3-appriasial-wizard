import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Check, 
  MessageSquare,
  Bold,
  Italic,
  Underline,
  List,
  Sparkles,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { AdjustmentExplanation } from '../features/sales-comparison/types';

/**
 * Data source options for adjustment explanations
 */
const DATA_SOURCES = [
  { value: 'paired_sales', label: 'Paired Sales Analysis' },
  { value: 'mls_data', label: 'MLS Market Data' },
  { value: 'market_study', label: 'Published Market Study' },
  { value: 'appraiser_judgment', label: 'Appraiser Judgment' },
  { value: 'cost_data', label: 'Cost Data (Marshall & Swift)' },
  { value: 'other', label: 'Other (specify in notes)' },
] as const;

interface AdjustmentExplanationPopoverProps {
  /** Current explanation if exists */
  currentExplanation?: AdjustmentExplanation | null;
  /** The adjustment value for context (e.g., 0.075 for 7.5%) */
  adjustmentValue: number;
  /** Comparable property name */
  compName: string;
  /** Row label (e.g., "Location", "Condition") */
  rowLabel: string;
  /** Flag indicating superior/inferior/similar */
  flag?: 'superior' | 'inferior' | 'similar';
  /** Callback when explanation is saved */
  onSave: (explanation: AdjustmentExplanation) => void;
  /** Callback when explanation is cleared */
  onClear: () => void;
  /** Callback when popover is closed */
  onClose: () => void;
  /** Position relative to trigger */
  position?: 'left' | 'right' | 'center';
}

export const AdjustmentExplanationPopover: React.FC<AdjustmentExplanationPopoverProps> = ({
  currentExplanation,
  adjustmentValue,
  compName,
  rowLabel,
  flag = 'similar',
  onSave,
  onClear,
  onClose,
  position = 'left'
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string>(currentExplanation?.text ?? '');
  const [dataSource, setDataSource] = useState<AdjustmentExplanation['dataSource']>(
    currentExplanation?.dataSource
  );
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lock ALL scrolling (horizontal AND vertical) on parent grid when popover is open
  useEffect(() => {
    // Find ALL elements that could potentially scroll
    const scrollableElements: HTMLElement[] = [];
    
    // Get the main grid container
    const gridContainer = document.querySelector('.sales-grid-scroll-container') as HTMLElement;
    if (gridContainer) scrollableElements.push(gridContainer);
    
    // Also check for any element with overflow: auto or scroll (both x and y)
    document.querySelectorAll('*').forEach((el) => {
      const style = window.getComputedStyle(el);
      const hasHorizontalScroll = style.overflowX === 'auto' || style.overflowX === 'scroll';
      const hasVerticalScroll = style.overflowY === 'auto' || style.overflowY === 'scroll';
      if (hasHorizontalScroll || hasVerticalScroll) {
        if (!scrollableElements.includes(el as HTMLElement)) {
          scrollableElements.push(el as HTMLElement);
        }
      }
    });
    
    // Store each element's current scroll positions (both X and Y)
    const lockedPositions = new Map<HTMLElement, { left: number; top: number }>();
    scrollableElements.forEach((el) => {
      lockedPositions.set(el, { left: el.scrollLeft, top: el.scrollTop });
    });
    
    // Create scroll handlers that reset scroll positions immediately
    const scrollHandlers = new Map<HTMLElement, () => void>();
    
    scrollableElements.forEach((el) => {
      const handler = () => {
        const lockedPos = lockedPositions.get(el);
        if (lockedPos !== undefined) {
          if (el.scrollLeft !== lockedPos.left) {
            el.scrollLeft = lockedPos.left;
          }
          if (el.scrollTop !== lockedPos.top) {
            el.scrollTop = lockedPos.top;
          }
        }
      };
      scrollHandlers.set(el, handler);
      el.addEventListener('scroll', handler, { passive: true });
    });
    
    // Prevent ALL wheel scrolling outside the popover
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Allow scrolling within the popover itself
      if (target.closest('.adjustment-explanation-popover')) {
        return;
      }
      
      // Block all scrolling outside the popover
      e.preventDefault();
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    return () => {
      // Remove all scroll handlers
      scrollHandlers.forEach((handler, el) => {
        el.removeEventListener('scroll', handler);
      });
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

  // Format adjustment for display
  const formatAdjustment = (val: number): string => {
    const percent = Math.abs(val * 100).toFixed(1);
    const sign = val > 0 ? '+' : val < 0 ? '-' : '';
    return `${sign}${percent}%`;
  };

  // Get flag label
  const getFlagLabel = (): { label: string; color: string; icon: React.ReactNode } => {
    if (flag === 'superior') {
      return { 
        label: 'SUP', 
        color: 'text-accent-teal-mint bg-accent-teal-mint-light',
        icon: <ArrowUpRight className="w-3 h-3" />
      };
    }
    if (flag === 'inferior') {
      return { 
        label: 'INF', 
        color: 'text-harken-error bg-accent-red-light',
        icon: <ArrowDownRight className="w-3 h-3" />
      };
    }
    return { 
      label: 'SIM', 
      color: 'text-slate-500 bg-surface-3 dark:bg-elevation-subtle',
      icon: <Minus className="w-3 h-3" />
    };
  };

  const flagInfo = getFlagLabel();

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

  // Sync editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== text) {
      editorRef.current.innerHTML = text;
    }
  }, []);

  // Execute formatting command
  const execCommand = useCallback((command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);
    }
  }, []);

  // Handle editor input
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);
      setError(null);
    }
  }, []);

  // Generate AI draft
  const generateAIDraft = useCallback(async () => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation (in production, this would call the AI service)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const direction = flag === 'superior' ? 'superiority' : flag === 'inferior' ? 'inferiority' : 'similarity';
    const adjustmentType = adjustmentValue > 0 ? 'upward' : adjustmentValue < 0 ? 'downward' : 'no';
    
    const draft = `The ${adjustmentType} adjustment of ${formatAdjustment(adjustmentValue)} for ${rowLabel.toLowerCase()} reflects the ${direction} of ${compName} compared to the subject property for this element.

Based on analysis of comparable sales in the subject market area, properties with similar ${rowLabel.toLowerCase()} characteristics typically demonstrate this level of value differential. This adjustment is supported by market evidence and is consistent with typical buyer preferences in this property type and location.`;

    if (editorRef.current) {
      editorRef.current.innerHTML = draft;
      setText(draft);
    }
    
    setIsGeneratingAI(false);
  }, [adjustmentValue, compName, rowLabel, flag]);

  // Handle save
  const handleSave = () => {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    if (!cleanText) {
      setError('Please enter an explanation for this adjustment');
      return;
    }
    
    onSave({
      text,
      dataSource,
      updatedAt: new Date().toISOString()
    });
  };

  // Handle clear
  const handleClear = () => {
    onClear();
  };

  const positionClass = {
    left: 'right-0',
    right: 'left-0',
    center: 'left-1/2 -translate-x-1/2'
  }[position];

  const isLargeAdjustment = Math.abs(adjustmentValue) >= 0.15;

  // Fullscreen modal wrapper - use portal to render at document.body level to cover everything
  if (isFullscreen) {
    return createPortal(
      <div 
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 99999 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsFullscreen(false);
          }
        }}
      >
        <div 
          ref={popoverRef}
          className="w-[90vw] max-w-4xl h-[80vh] bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gradient-action-start to-gradient-action-end px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-white/80" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">
                  Adjustment Explanation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded hover:bg-white/20 transition-colors"
                  title="Exit fullscreen"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Context info */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/90 text-base font-medium">{rowLabel}</span>
              <span className="text-white/60">•</span>
              <span className="text-white/80 text-base">{compName}</span>
              <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs font-bold uppercase ${flagInfo.color}`}>
                {flagInfo.icon}
                {flagInfo.label} {formatAdjustment(adjustmentValue)}
              </span>
            </div>
          </div>

          {/* Large adjustment warning */}
          {isLargeAdjustment && !currentExplanation?.text && (
            <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                USPAP requires explanation for significant adjustments ({'\u2265'}15%)
              </p>
            </div>
          )}

          {/* Toolbar */}
          <div className="px-6 py-3 border-b border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2 flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-surface-4 dark:bg-elevation-muted mx-1"></div>
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            
            {/* AI Draft Button */}
            <div className="ml-auto">
              <button
                type="button"
                onClick={generateAIDraft}
                disabled={isGeneratingAI}
                className="h-8 px-3 text-xs font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Draft
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor - Flex grow to fill available space */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              data-placeholder="Explain the rationale for this adjustment..."
              className="flex-1 w-full overflow-y-auto px-4 py-3 border border-light-border dark:border-dark-border rounded-lg text-base text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-harken-blue/30 focus:border-harken-blue bg-surface-1 dark:bg-elevation-1/50 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none leading-relaxed"
            />
            
            {/* Error message */}
            {error && (
              <p className="mt-3 text-sm text-harken-error flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Data Source Selector */}
          <div className="px-6 pb-4 flex-shrink-0">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Data Source (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowDataSourceDropdown(!showDataSourceDropdown)}
                className="w-full max-w-md flex items-center justify-between px-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-lg bg-surface-1 dark:bg-elevation-1/50 text-slate-700 dark:text-slate-200 hover:border-harken-blue transition-colors"
              >
                <span className={dataSource ? '' : 'text-slate-400'}>
                  {dataSource 
                    ? DATA_SOURCES.find(s => s.value === dataSource)?.label 
                    : 'Select data source...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDataSourceDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDataSourceDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-full max-w-md bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-lg shadow-lg z-10 overflow-hidden">
                  {DATA_SOURCES.map((source) => (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => {
                        setDataSource(source.value as AdjustmentExplanation['dataSource']);
                        setShowDataSourceDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-2 dark:hover:bg-elevation-2 transition-colors ${
                        dataSource === source.value ? 'bg-harken-blue/10 text-harken-blue' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-surface-2 dark:bg-elevation-2 border-t border-light-border dark:border-dark-border flex items-center gap-3 flex-shrink-0">
            {currentExplanation && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm font-bold text-harken-error hover:bg-accent-red-light rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 text-sm font-bold text-white bg-harken-blue hover:bg-harken-blue/90 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Use portal but NO blur - keep grid visible for context
  // Position in top-right area so it doesn't obstruct grid data
  return createPortal(
    <>
      {/* Invisible click-catcher to close on click outside - NO blur/dim */}
      <div 
        className="fixed inset-0"
        style={{ zIndex: 99998 }}
        onClick={onClose}
      />
      {/* Popover positioned in right side of screen, vertically centered */}
      <div 
        ref={popoverRef}
        className="adjustment-explanation-popover fixed top-1/2 right-8 -translate-y-1/2 w-96 bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden"
        style={{ zIndex: 99999 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
      <div className="bg-gradient-to-r from-gradient-action-start to-gradient-action-end px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/80" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Adjustment Explanation
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Context info */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white/90 text-sm font-medium">{rowLabel}</span>
          <span className="text-white/60">•</span>
          <span className="text-white/80 text-sm">{compName}</span>
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${flagInfo.color}`}>
            {flagInfo.icon}
            {flagInfo.label} {formatAdjustment(adjustmentValue)}
          </span>
        </div>
      </div>

      {/* Large adjustment warning */}
      {isLargeAdjustment && !currentExplanation?.text && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            USPAP requires explanation for significant adjustments ({'\u2265'}15%)
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-surface-4 dark:bg-elevation-muted mx-1"></div>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        
        {/* Expand to fullscreen */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Expand to fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        
        {/* AI Draft Button */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={generateAIDraft}
            disabled={isGeneratingAI}
            className="h-6 px-2 text-[10px] font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                AI Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="p-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder="Explain the rationale for this adjustment..."
          className="w-full min-h-[120px] max-h-[200px] overflow-y-auto px-3 py-2 border border-light-border dark:border-dark-border rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-harken-blue/30 focus:border-harken-blue bg-surface-1 dark:bg-elevation-1/50 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none leading-relaxed"
        />
        
        {/* Error message */}
        {error && (
          <p className="mt-2 text-xs text-harken-error flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>

      {/* Data Source Selector */}
      <div className="px-4 pb-4">
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Data Source (Optional)
          </label>
          <button
            type="button"
            onClick={() => setShowDataSourceDropdown(!showDataSourceDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-lg bg-surface-1 dark:bg-elevation-1/50 text-slate-700 dark:text-slate-200 hover:border-harken-blue transition-colors"
          >
            <span className={dataSource ? '' : 'text-slate-400'}>
              {dataSource 
                ? DATA_SOURCES.find(s => s.value === dataSource)?.label 
                : 'Select data source...'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDataSourceDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDataSourceDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-lg shadow-lg z-10 overflow-hidden">
              {DATA_SOURCES.map((source) => (
                <button
                  key={source.value}
                  type="button"
                  onClick={() => {
                    setDataSource(source.value as AdjustmentExplanation['dataSource']);
                    setShowDataSourceDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-2 dark:hover:bg-elevation-2 transition-colors ${
                    dataSource === source.value ? 'bg-harken-blue/10 text-harken-blue' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {source.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-surface-2 dark:bg-elevation-2 border-t border-light-border dark:border-dark-border flex items-center gap-2">
        {currentExplanation && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-bold text-harken-error hover:bg-accent-red-light rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 text-xs font-bold text-white bg-harken-blue hover:bg-harken-blue/90 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Check className="w-3 h-3" />
          Save
        </button>
      </div>
      </div>
    </>,
    document.body
  );
};

export default AdjustmentExplanationPopover;
