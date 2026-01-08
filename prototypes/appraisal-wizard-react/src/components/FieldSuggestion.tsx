/**
 * FieldSuggestion Component
 * 
 * Displays a suggestion panel below form fields with Accept/Reject buttons.
 * Shows source attribution (filename + document type) and confidence score.
 * Used for document-extracted data that needs user confirmation.
 * 
 * When a suggestion is rejected, the component automatically fetches
 * fallback data from Montana GIS (for MT properties) or Cotality API.
 */

import { useState, useCallback, useMemo } from 'react';
import { Check, X, FileText, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { fetchFallbackValue, isMontanaProperty } from '../services/fieldFallbackService';
import type { FieldSuggestion as FieldSuggestionType } from '../types';

export interface FieldSuggestionData {
  value: string;
  confidence: number;
  source: 'document' | 'montana_gis' | 'cotality';
  sourceFilename?: string;
  sourceDocumentType?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface FieldSuggestionProps {
  fieldPath: string;
  onAccept: (value: string) => void;
  onReject?: () => void;
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
    financial: 'Financial Statement',
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
  if (confidence >= 0.9) return 'text-accent-teal-mint bg-accent-teal-mint-light';
  if (confidence >= 0.7) return 'text-harken-blue bg-blue-50';
  if (confidence >= 0.5) return 'text-accent-amber-gold bg-accent-amber-gold-light';
  return 'text-harken-error bg-accent-red-light';
}

export function FieldSuggestion({
  fieldPath,
  onAccept,
  onReject,
  className = '',
}: FieldSuggestionProps) {
  const { state, rejectFieldSuggestion, getFieldSuggestion } = useWizard();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState<'idle' | 'fetching' | 'done'>('idle');

  // Get first pending suggestion from wizard state (array-based now)
  const suggestion = getFieldSuggestion(fieldPath);

  // Memoize the suggestion value to use in callbacks
  const suggestionValue = useMemo(() => suggestion?.value, [suggestion?.value]);

  // All hooks MUST be called before any conditional returns!
  const handleAccept = useCallback(async () => {
    if (!suggestionValue) return;
    setIsProcessing(true);
    try {
      onAccept(suggestionValue);
    } finally {
      setIsProcessing(false);
    }
  }, [suggestionValue, onAccept]);

  const handleReject = useCallback(async () => {
    setIsProcessing(true);
    setFallbackStatus('fetching');
    try {
      // First, mark the suggestion as rejected in wizard state
      rejectFieldSuggestion(fieldPath);
      onReject?.();

      // Then try to fetch fallback data from external APIs
      const address = state.subjectData?.address;
      if (address) {
        console.log(`[FieldSuggestion] Fetching fallback for ${fieldPath}...`);
        const fallbackResult = await fetchFallbackValue(fieldPath, {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          county: address.county,
        });

        if (fallbackResult.success && fallbackResult.value) {
          console.log(`[FieldSuggestion] Fallback found: ${fallbackResult.value} (${fallbackResult.source})`);
          // Auto-apply the fallback value (no Accept/Reject for API data)
          onAccept(fallbackResult.value);
        } else {
          console.log(`[FieldSuggestion] No fallback available: ${fallbackResult.error}`);
        }
      }
    } catch (error) {
      console.error('[FieldSuggestion] Error fetching fallback:', error);
    } finally {
      setIsProcessing(false);
      setFallbackStatus('done');
    }
  }, [fieldPath, state.subjectData?.address, onReject, rejectFieldSuggestion, onAccept]);

  // Calculate confidence color - safe even if suggestion is null
  const confidenceColor = suggestion ? getConfidenceColor(suggestion.confidence) : '';

  // Don't render if no pending suggestion - AFTER all hooks are defined!
  if (!suggestion || suggestion.status !== 'pending') {
    return null;
  }

  return (
    <div
      className={`mt-2 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-white overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-blue-500" />
          <span className="text-harken-gray">
            Suggested from:{' '}
            <span className="font-medium text-harken-dark dark:text-white">
              {suggestion.sourceFilename || 'Document'}
            </span>
          </span>
          {suggestion.sourceDocumentType && (
            <span className="text-xs text-harken-gray-med">
              ({formatDocumentType(suggestion.sourceDocumentType)})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${confidenceColor}`}
          >
            {formatConfidence(suggestion.confidence)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-harken-gray-med" />
          ) : (
            <ChevronDown className="w-4 h-4 text-harken-gray-med" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-blue-100">
          {/* Suggested Value */}
          <div className="mt-3 p-3 bg-surface-1 dark:bg-elevation-1 rounded-md border border-light-border dark:border-harken-gray">
            <p className="text-sm text-harken-dark font-medium leading-relaxed">
              "{suggestion.value}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-harken-gray dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-md hover:bg-harken-gray-light dark:hover:bg-harken-gray hover:text-harken-gray dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing && fallbackStatus === 'fetching' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Finding from {isMontanaProperty(state.subjectData?.address?.state) ? 'MT GIS' : 'Cotality'}...
                </>
              ) : isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Reject & Auto-Fill
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-harken-blue border border-harken-blue rounded-md hover:bg-harken-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline display next to field labels.
 * Shows only when a field has an accepted suggestion source.
 */
export function FieldSourceBadge({
  fieldPath,
  className = '',
}: {
  fieldPath: string;
  className?: string;
}) {
  const { state, getFieldSuggestions } = useWizard();
  
  // Check for accepted suggestion in the array
  const suggestions = getFieldSuggestions(fieldPath);
  const acceptedSuggestion = suggestions.find(s => s.status === 'accepted');
  
  // Also check documentFieldSources for legacy/existing source tracking
  const legacySource = state.documentFieldSources?.[fieldPath];
  
  // Determine which source to show (accepted suggestion takes precedence)
  const source = acceptedSuggestion || legacySource;
  
  if (!source) {
    return null;
  }

  const filename = 'sourceFilename' in source 
    ? source.sourceFilename 
    : source.sourceFilename;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full ${className}`}
      title={`Data from ${filename}`}
    >
      <FileText className="w-3 h-3" />
      From {filename}
    </span>
  );
}

export default FieldSuggestion;
