/**
 * MultiValueSuggestion Component
 * 
 * Displays multiple suggestions for a field side-by-side for user comparison.
 * When only one suggestion exists, displays a single card similar to FieldSuggestion.
 * Allows user to accept one value (rejecting others) or reject all to trigger API fallback.
 */

import { useState, useCallback, useMemo } from 'react';
import { Check, X, FileText, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { fetchFallbackValue, isMontanaProperty } from '../services/fieldFallbackService';
import type { FieldSuggestion } from '../types';

interface MultiValueSuggestionProps {
  fieldPath: string;
  fieldLabel?: string;
  onAccept: (value: string, suggestionId: string) => void;
  onRejectAll?: () => void;
  className?: string;
}

/**
 * Format document type for display
 */
function formatDocumentType(docType: string): string {
  const typeLabels: Record<string, string> = {
    cadastral: 'Cadastral / County Records',
    engagement: 'Engagement Letter',
    sale: 'Sale Agreement',
    lease: 'Lease Agreement',
    rentroll: 'Rent Roll',
    survey: 'Survey / Plat Map',
    tax_return: 'Tax Return',
    financial_statement: 'Financial Statement',
    deed: 'Property Deed',
    flood_map: 'FEMA Flood Map',
    tax_assessment: 'Tax Assessment',
    unknown: 'Document',
  };
  return typeLabels[docType] || docType;
}

/**
 * Format confidence score for display
 */
function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get confidence color class based on score
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-accent-teal-mint bg-accent-teal-mint-light dark:text-accent-teal-mint dark:bg-green-900/30';
  if (confidence >= 0.7) return 'text-harken-blue bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
  if (confidence >= 0.5) return 'text-accent-amber-gold bg-accent-amber-gold-light dark:text-accent-amber-gold dark:bg-accent-amber-gold/10';
  return 'text-harken-error bg-accent-red-light dark:text-harken-error dark:bg-accent-red-light';
}

export function MultiValueSuggestion({
  fieldPath,
  fieldLabel,
  onAccept,
  onRejectAll,
  className = '',
}: MultiValueSuggestionProps) {
  const { state, getFieldSuggestions, acceptFieldSuggestion, rejectFieldSuggestion } = useWizard();
  const [isExpanded, setIsExpanded] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRejectingAll, setIsRejectingAll] = useState(false);

  // Get all pending suggestions for this field - memoized to avoid recalculating on each render
  const allSuggestions = getFieldSuggestions(fieldPath);
  const pendingSuggestions = useMemo(
    () => allSuggestions.filter(s => s.status === 'pending'),
    [allSuggestions]
  );

  // All hooks MUST be called before any conditional returns!
  const handleAccept = useCallback(async (suggestion: FieldSuggestion) => {
    setProcessingId(suggestion.id);
    try {
      onAccept(suggestion.value, suggestion.id);
      acceptFieldSuggestion(fieldPath, suggestion.value, suggestion.id);
    } finally {
      setProcessingId(null);
    }
  }, [fieldPath, onAccept, acceptFieldSuggestion]);

  const handleRejectAll = useCallback(async () => {
    // Capture current pending suggestions at call time
    const currentPendingSuggestions = getFieldSuggestions(fieldPath).filter(s => s.status === 'pending');
    
    setIsRejectingAll(true);
    try {
      // Reject all pending suggestions
      for (const suggestion of currentPendingSuggestions) {
        rejectFieldSuggestion(fieldPath, suggestion.id);
      }
      onRejectAll?.();

      // Try to fetch fallback data from external APIs
      const address = state.subjectData?.address;
      if (address) {
        console.log(`[MultiValueSuggestion] Fetching fallback for ${fieldPath}...`);
        const fallbackResult = await fetchFallbackValue(fieldPath, {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          county: address.county,
        });

        if (fallbackResult.success && fallbackResult.value) {
          console.log(`[MultiValueSuggestion] Fallback found: ${fallbackResult.value} (${fallbackResult.source})`);
          // Auto-apply the fallback value
          onAccept(fallbackResult.value, 'api-fallback');
        } else {
          console.log(`[MultiValueSuggestion] No fallback available: ${fallbackResult.error}`);
        }
      }
    } catch (error) {
      console.error('[MultiValueSuggestion] Error during reject all:', error);
    } finally {
      setIsRejectingAll(false);
    }
  }, [fieldPath, getFieldSuggestions, state.subjectData?.address, onRejectAll, rejectFieldSuggestion, onAccept]);

  const hasMultipleSuggestions = pendingSuggestions.length > 1;

  // Don't render if no pending suggestions - AFTER all hooks are defined!
  if (pendingSuggestions.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-2 border border-blue-200 dark:border-blue-800 rounded-lg bg-gradient-to-r from-blue-50 to-white dark:from-harken-dark dark:to-harken-dark overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-elevation-3/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span className="text-harken-gray dark:text-slate-200">
            {hasMultipleSuggestions ? (
              <>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {pendingSuggestions.length} values found
                </span>
                {fieldLabel && <span className="text-harken-gray-med dark:text-slate-500"> for {fieldLabel}</span>}
              </>
            ) : (
              <>
                Suggested from:{' '}
                <span className="font-medium text-harken-dark dark:text-white">
                  {pendingSuggestions[0]?.sourceFilename || 'Document'}
                </span>
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!hasMultipleSuggestions && pendingSuggestions[0] && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConfidenceColor(pendingSuggestions[0].confidence)}`}>
              {formatConfidence(pendingSuggestions[0].confidence)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-harken-gray-med" />
          ) : (
            <ChevronDown className="w-4 h-4 text-harken-gray-med" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-blue-100 dark:border-dark-border">
          {hasMultipleSuggestions ? (
            // Side-by-side comparison for multiple values
            <>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 bg-surface-1 dark:bg-elevation-1 rounded-lg border border-light-border dark:border-harken-gray flex flex-col"
                  >
                    {/* Source Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-harken-gray-med dark:text-slate-400">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium truncate max-w-[120px]" title={suggestion.sourceFilename}>
                          {suggestion.sourceFilename || 'Document'}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {formatConfidence(suggestion.confidence)}
                      </span>
                    </div>
                    
                    {/* Document Type */}
                    {suggestion.sourceDocumentType && (
                      <div className="text-xs text-harken-gray-med dark:text-slate-500 mb-2">
                        ({formatDocumentType(suggestion.sourceDocumentType)})
                      </div>
                    )}
                    
                    {/* Value */}
                    <div className="flex-1 p-2 bg-harken-gray-light dark:bg-dark-input rounded text-sm text-harken-dark dark:text-white font-medium mb-3">
                      "{suggestion.value}"
                    </div>
                    
                    {/* Accept Button */}
                    <button
                      type="button"
                      onClick={() => handleAccept(suggestion)}
                      disabled={!!processingId || isRejectingAll}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#0da1c7] border border-[#0da1c7] rounded-md hover:bg-[#0b8eb0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingId === suggestion.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Accept This
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Reject All Button */}
              <div className="mt-3 pt-3 border-t border-light-border dark:border-harken-gray">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  disabled={!!processingId || isRejectingAll}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-harken-gray dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-md hover:bg-harken-gray-light dark:hover:bg-harken-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRejectingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Finding from {isMontanaProperty(state.subjectData?.address?.state) ? 'MT GIS' : 'Cotality'}...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Reject All & Auto-Fill from API
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            // Single suggestion display
            <>
              <div className="mt-3 p-3 bg-surface-1 dark:bg-elevation-1 rounded-md border border-light-border dark:border-harken-gray">
                {pendingSuggestions[0]?.sourceDocumentType && (
                  <div className="text-xs text-harken-gray-med dark:text-slate-500 mb-1">
                    {formatDocumentType(pendingSuggestions[0].sourceDocumentType)}
                  </div>
                )}
                <p className="text-sm text-harken-dark dark:text-white font-medium leading-relaxed">
                  "{pendingSuggestions[0]?.value}"
                </p>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  disabled={!!processingId || isRejectingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-harken-gray dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-md hover:bg-harken-gray-light dark:hover:bg-harken-gray hover:text-harken-gray dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRejectingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Finding from {isMontanaProperty(state.subjectData?.address?.state) ? 'MT GIS' : 'Cotality'}...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Reject & Auto-Fill
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => pendingSuggestions[0] && handleAccept(pendingSuggestions[0])}
                  disabled={!!processingId || isRejectingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#0da1c7] border border-[#0da1c7] rounded-md hover:bg-[#0b8eb0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Accept
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiValueSuggestion;
