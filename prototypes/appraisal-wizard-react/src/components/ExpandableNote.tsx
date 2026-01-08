import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Sparkles, Loader2 } from 'lucide-react';
import EnhancedTextArea from './EnhancedTextArea';

// ==========================================
// TYPES
// ==========================================
interface ExpandableNoteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sectionContext: string;
  helperText?: string;
  rows?: number;
  contextData?: Record<string, unknown>;
}

// ==========================================
// EXPANDABLE NOTE COMPONENT
// ==========================================
/**
 * A collapsible note field that wraps EnhancedTextArea.
 * - Collapsed: Shows "Add notes..." button or truncated preview
 * - Expanded: Full EnhancedTextArea with toolbar, AI Draft, and fullscreen
 */
export default function ExpandableNote({
  id,
  label,
  value,
  onChange,
  placeholder = 'Add notes...',
  sectionContext,
  helperText,
  rows = 3,
  contextData,
}: ExpandableNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQuickDrafting, setIsQuickDrafting] = useState(false);

  // Get a preview of the content (first 100 chars, strip HTML)
  const getPreview = useCallback(() => {
    if (!value) return '';
    const strippedText = value.replace(/<[^>]*>/g, '').trim();
    if (strippedText.length <= 100) return strippedText;
    return strippedText.substring(0, 100) + '...';
  }, [value]);

  const preview = getPreview();
  const hasContent = preview.length > 0;

  // Quick AI draft without expanding
  const handleQuickDraft = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickDrafting(true);

    // Simulate AI generation - in real implementation this would call the API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate a simple placeholder based on context
    const draftContent = generateQuickDraft(sectionContext);
    onChange(draftContent);
    setIsExpanded(true);
    setIsQuickDrafting(false);
  }, [sectionContext, onChange]);

  return (
    <div className="mt-3">
      {isExpanded ? (
        // Expanded State - Full EnhancedTextArea
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 text-xs font-medium text-harken-gray-med hover:text-harken-gray transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Collapse Notes
            </button>
          </div>
          <EnhancedTextArea
            id={id}
            label={label}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            sectionContext={sectionContext}
            helperText={helperText}
            rows={rows}
            contextData={contextData}
          />
        </div>
      ) : (
        // Collapsed State - Preview or Add Button
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all ${hasContent
              ? 'border-light-border bg-harken-gray-light dark:border-dark-border dark:bg-elevation-1/50 hover:border-[#0da1c7]/50 hover:bg-[#0da1c7]/5'
              : 'border-light-border dark:border-harken-gray hover:border-[#0da1c7] hover:bg-[#0da1c7]/5 dark:hover:border-[#0da1c7]/50'
            }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasContent ? (
              <>
                <ChevronDown className="w-4 h-4 text-harken-gray-med group-hover:text-[#0da1c7] flex-shrink-0" />
                <span className="text-sm text-harken-gray dark:text-slate-200 truncate">{preview}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-harken-gray-med group-hover:text-[#0da1c7]" />
                <span className="text-sm text-harken-gray-med dark:text-slate-400 group-hover:text-[#0da1c7]">
                  {placeholder}
                </span>
              </>
            )}
          </div>

          {/* Quick AI Draft Button */}
          {!hasContent && (
            <button
              type="button"
              onClick={handleQuickDraft}
              disabled={isQuickDrafting}
              className="ml-2 px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-md hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-1 transition-all disabled:opacity-50 shadow-sm"
            >
              {isQuickDrafting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Draft
                </>
              )}
            </button>
          )}
        </button>
      )}

      {/* Inline Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ==========================================
// QUICK DRAFT GENERATOR
// ==========================================
function generateQuickDraft(sectionContext: string): string {
  const drafts: Record<string, string> = {
    water_source: 'City water service is provided by the municipal water department. The connection appears adequate for the current and anticipated uses. No deficiencies in water service were observed during the inspection.',
    sewer_type: 'The property is connected to municipal sanitary sewer service provided by the city. The sewer connection appears adequate for the current use with no observable issues.',
    electric: 'Electric service is provided by the local utility company. The service appears adequate for the current and anticipated uses. The electrical system was observed to be in functional condition.',
    natural_gas: 'Natural gas service is available and connected to the property. The gas service appears adequate for heating and any industrial processes requiring natural gas.',
    telecom: 'Telecommunications services including telephone, internet, and cable are available to the property. Multiple providers service this area.',
    access_visibility: 'Access to the subject site is provided via a paved approach from the adjacent roadway. The approach provides adequate ingress and egress for passenger vehicles and delivery trucks. Visibility from the roadway is considered good.',
    site_improvements: 'Site improvements include paved parking areas, exterior lighting, and perimeter fencing. The improvements appear to be in average to good condition consistent with the age of the development.',
    paving: 'The paved areas consist of asphalt paving in average condition. Minor cracking and patching was observed, consistent with normal wear for the age of the improvements.',
    fencing: 'The property is secured with chain-link fencing around the perimeter. The fencing appears to be in average condition and provides adequate security for the site.',
    flood_zone: 'According to FEMA Flood Insurance Rate Map, the subject site is located in Flood Zone X, an area determined to be outside the 0.2% annual chance floodplain. No special flood hazard insurance is required.',
    site_notes: 'The subject site presents no unusual characteristics that would adversely affect its utility or marketability. The site is well-suited for its current use.',
    default: 'Notes regarding this characteristic have been documented based on the property inspection and available records.',
  };

  return drafts[sectionContext] || drafts.default;
}

