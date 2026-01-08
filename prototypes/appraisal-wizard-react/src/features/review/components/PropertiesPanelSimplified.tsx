/**
 * PropertiesPanelSimplified - Consolidated single-scroll properties panel
 * 
 * ULTRATHINK Design Rationale:
 * - Eliminates cognitive load from switching between 3 tabs
 * - Groups related controls together in visual hierarchy
 * - Most common actions are immediately visible
 * - AI tools prominently featured as primary workflow accelerator
 * - Progressive disclosure via accordions for advanced options
 * - Professional, clean aesthetic matching Rove brand
 */

import React, { useState, useEffect } from 'react';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Sparkles,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
} from 'lucide-react';

// =================================================================
// TYPES
// =================================================================

export interface ElementStyles {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  marginTop?: number;
  marginBottom?: number;
}

export interface ElementContent {
  [elementId: string]: {
    text: string;
    styles: React.CSSProperties;
  };
}

interface PropertiesPanelSimplifiedProps {
  selectedElement: string | null;
  elementStyles: ElementStyles;
  elementContent: ElementContent;
  onStyleChange: (styles: Partial<ElementStyles>) => void;
  onContentChange: (elementId: string, content: string) => void;
  onDeleteElement: () => void;
  isDirty?: boolean;
  onSave?: () => void;
}

// =================================================================
// ACCORDION SECTION COMPONENT
// =================================================================

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, icon, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-light-border dark:border-dark-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-harken-gray-light dark:hover:bg-elevation-3/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-[#0da1c7]">{icon}</div>
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-harken-gray-med" />
        ) : (
          <ChevronRight size={18} className="text-harken-gray-med" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0 space-y-3">{children}</div>}
    </div>
  );
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export function PropertiesPanelSimplified({
  selectedElement,
  elementStyles,
  elementContent,
  onStyleChange,
  onContentChange,
  onDeleteElement,
  isDirty,
  onSave,
}: PropertiesPanelSimplifiedProps) {
  const [localContent, setLocalContent] = useState('');

  useEffect(() => {
    if (selectedElement && elementContent[selectedElement]) {
      setLocalContent(elementContent[selectedElement].text);
    } else {
      setLocalContent('');
    }
  }, [selectedElement, elementContent]);

  const handleContentBlur = () => {
    if (selectedElement && localContent !== elementContent[selectedElement]?.text) {
      onContentChange(selectedElement, localContent);
    }
  };

  // No selection state
  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-harken-gray-light dark:bg-elevation-1">
        <div className="w-16 h-16 rounded-full bg-harken-gray-light dark:bg-elevation-1 flex items-center justify-center mb-4">
          <Type size={28} className="text-harken-gray-med" />
        </div>
        <p className="text-sm font-semibold text-harken-gray dark:text-slate-200 mb-2">
          No Element Selected
        </p>
        <p className="text-xs text-harken-gray-med dark:text-slate-400 max-w-[200px]">
          Click on any text, image, or section in the preview to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface-1 dark:bg-elevation-1">
      {/* Header with Save Status */}
      <div className="flex-shrink-0 p-4 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-slate-50 to-white dark:from-harken-dark dark:to-harken-dark">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              Properties
            </div>
            <div className="text-xs text-harken-gray-med dark:text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
              {selectedElement}
            </div>
          </div>
          {isDirty && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-amber-gold-light dark:bg-accent-amber-gold/10 rounded-full">
                <div className="w-1.5 h-1.5 bg-accent-amber-gold rounded-full animate-pulse" />
                <span className="text-xs text-accent-amber-gold dark:text-accent-amber-gold-hover font-medium">
                  Unsaved
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Save Button - Only show when dirty */}
        {isDirty && onSave && (
          <button
            onClick={onSave}
            className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#0da1c7] to-[#0890a8] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        {/* Quick Actions - Always Visible */}
        <div className="p-4 space-y-2 bg-harken-gray-light dark:bg-elevation-1/50 border-b border-light-border dark:border-dark-border">
          <div className="text-xs font-bold text-harken-gray-med dark:text-slate-400 uppercase tracking-wider mb-3">
            Quick Actions
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1.5 p-3 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-lg hover:border-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all">
              <Copy size={18} className="text-harken-gray dark:text-slate-200" />
              <span className="text-xs font-medium text-harken-gray dark:text-slate-200">Copy</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 p-3 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-lg hover:border-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all">
              <Type size={18} className="text-harken-gray dark:text-slate-200" />
              <span className="text-xs font-medium text-harken-gray dark:text-slate-200">Edit</span>
            </button>
            <button
              onClick={onDeleteElement}
              className="flex flex-col items-center gap-1.5 p-3 bg-surface-1 dark:bg-elevation-1 border border-harken-error/30 dark:border-harken-error rounded-lg hover:border-harken-error hover:bg-accent-red-light dark:hover:bg-accent-red-light transition-all"
            >
              <Trash2 size={18} className="text-harken-error dark:text-harken-error" />
              <span className="text-xs font-medium text-harken-error dark:text-harken-error">Delete</span>
            </button>
          </div>
        </div>

        {/* AI Tools - Prominently Featured */}
        <div className="p-4 space-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#0da1c7]" />
            <div className="text-xs font-bold text-harken-gray dark:text-slate-200 uppercase tracking-wider">
              AI Assistant
            </div>
          </div>
          <button className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0da1c7] to-[#0890a8] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Sparkles size={16} />
            AI Rewrite
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-3 bg-surface-1/80 dark:bg-elevation-1/80 border border-blue-200 dark:border-blue-800 text-harken-gray dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-surface-1 dark:hover:bg-elevation-3 transition-all flex items-center justify-center gap-1.5">
              <Maximize2 size={14} />
              Expand
            </button>
            <button className="py-2 px-3 bg-surface-1/80 dark:bg-elevation-1/80 border border-blue-200 dark:border-blue-800 text-harken-gray dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-surface-1 dark:hover:bg-elevation-3 transition-all flex items-center justify-center gap-1.5">
              <Minimize2 size={14} />
              Shorten
            </button>
          </div>
        </div>

        {/* Text Content Editor */}
        <div className="p-4 space-y-3 border-b border-light-border dark:border-dark-border">
          <label className="block text-xs font-bold text-harken-gray-med dark:text-slate-400 uppercase tracking-wider">
            Content
          </label>
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="Enter text content..."
            className="w-full h-32 px-3 py-2 text-sm border border-light-border dark:border-harken-gray rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* Typography - Collapsed by default */}
        <AccordionSection title="Typography" icon={<Type size={18} />} defaultOpen={true}>
          <div className="space-y-3">
            {/* Font Family & Size Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-harken-gray dark:text-slate-400 mb-1">
                  Font
                </label>
                <select
                  value={elementStyles.fontFamily || 'Montserrat'}
                  onChange={(e) => onStyleChange({ fontFamily: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border border-light-border dark:border-harken-gray rounded bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white"
                >
                  <option value="Montserrat">Montserrat</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-harken-gray dark:text-slate-400 mb-1">
                  Size
                </label>
                <select
                  value={elementStyles.fontSize || 14}
                  onChange={(e) => onStyleChange({ fontSize: parseInt(e.target.value) })}
                  className="w-full px-2 py-1.5 text-xs border border-light-border dark:border-harken-gray rounded bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white"
                >
                  {[10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                    <option key={size} value={size}>{size}px</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Style Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onStyleChange({ fontWeight: elementStyles.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                  elementStyles.fontWeight === 'bold'
                    ? 'bg-[#0da1c7] border-[#0da1c7] text-white'
                    : 'bg-surface-1 dark:bg-elevation-1 border-light-border dark:border-harken-gray text-harken-gray dark:text-slate-200 hover:border-[#0da1c7]'
                }`}
              >
                <Bold size={16} className="mx-auto" />
              </button>
              <button className="flex-1 py-2 px-3 rounded-lg border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-gray dark:text-slate-200 hover:border-[#0da1c7] transition-all">
                <Italic size={16} className="mx-auto" />
              </button>
              <button className="flex-1 py-2 px-3 rounded-lg border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-gray dark:text-slate-200 hover:border-[#0da1c7] transition-all">
                <Underline size={16} className="mx-auto" />
              </button>
            </div>

            {/* Alignment */}
            <div>
              <label className="block text-xs font-medium text-harken-gray dark:text-slate-400 mb-1">
                Alignment
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onStyleChange({ textAlign: 'left' })}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    elementStyles.textAlign === 'left'
                      ? 'bg-[#0da1c7] border-[#0da1c7] text-white'
                      : 'bg-surface-1 dark:bg-elevation-1 border-light-border dark:border-harken-gray text-harken-gray dark:text-slate-200 hover:border-[#0da1c7]'
                  }`}
                >
                  <AlignLeft size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => onStyleChange({ textAlign: 'center' })}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    elementStyles.textAlign === 'center'
                      ? 'bg-[#0da1c7] border-[#0da1c7] text-white'
                      : 'bg-surface-1 dark:bg-elevation-1 border-light-border dark:border-harken-gray text-harken-gray dark:text-slate-200 hover:border-[#0da1c7]'
                  }`}
                >
                  <AlignCenter size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => onStyleChange({ textAlign: 'right' })}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    elementStyles.textAlign === 'right'
                      ? 'bg-[#0da1c7] border-[#0da1c7] text-white'
                      : 'bg-surface-1 dark:bg-elevation-1 border-light-border dark:border-harken-gray text-harken-gray dark:text-slate-200 hover:border-[#0da1c7]'
                  }`}
                >
                  <AlignRight size={16} className="mx-auto" />
                </button>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-harken-gray dark:text-slate-400 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={elementStyles.color || '#1c3643'}
                  onChange={(e) => onStyleChange({ color: e.target.value })}
                  className="w-12 h-9 rounded border border-light-border dark:border-harken-gray cursor-pointer"
                />
                <input
                  type="text"
                  value={elementStyles.color || '#1c3643'}
                  onChange={(e) => onStyleChange({ color: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border border-light-border dark:border-harken-gray rounded bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white font-mono"
                  placeholder="#1c3643"
                />
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Spacing - Collapsed by default */}
        <AccordionSection title="Spacing" icon={<Palette size={18} />}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-harken-gray dark:text-slate-400 mb-1">
                Top Margin
              </label>
              <input
                type="range"
                min="0"
                max="64"
                value={elementStyles.marginTop || 0}
                onChange={(e) => onStyleChange({ marginTop: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-right text-xs text-harken-gray-med dark:text-slate-400 mt-1">
                {elementStyles.marginTop || 0}px
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-harken-gray dark:text-slate-400 mb-1">
                Bottom Margin
              </label>
              <input
                type="range"
                min="0"
                max="64"
                value={elementStyles.marginBottom || 0}
                onChange={(e) => onStyleChange({ marginBottom: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-right text-xs text-harken-gray-med dark:text-slate-400 mt-1">
                {elementStyles.marginBottom || 0}px
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}

export default PropertiesPanelSimplified;
