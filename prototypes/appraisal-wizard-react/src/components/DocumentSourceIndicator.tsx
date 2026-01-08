/**
 * DocumentSourceIndicator Component
 * 
 * Displays a small badge next to auto-populated fields showing which document
 * the data came from and its confidence level.
 * 
 * Usage:
 * <DocumentSourceIndicator fieldPath="subjectData.taxId" />
 */

import { useState, useRef, useEffect } from 'react';
import { FileText, ChevronDown, Check, AlertCircle, Info } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import type { ExtractedFieldSource } from '../types';

interface DocumentSourceIndicatorProps {
  /** The wizard state path for this field (e.g., 'subjectData.taxId') */
  fieldPath: string;
  /** Optional: Show inline with label instead of as a standalone badge */
  inline?: boolean;
  /** Optional: Custom class name */
  className?: string;
}

/**
 * Get the confidence level classification for styling
 */
function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.65) return 'medium';
  return 'low';
}

/**
 * Get color classes based on confidence level
 */
function getConfidenceColors(confidence: number): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'high':
      return {
        bg: 'bg-accent-teal-mint-light',
        text: 'text-accent-teal-mint',
        border: 'border-accent-teal-mint',
        icon: 'text-accent-teal-mint',
      };
    case 'medium':
      return {
        bg: 'bg-accent-amber-gold-light',
        text: 'text-accent-amber-gold',
        border: 'border-accent-amber-gold-light',
        icon: 'text-accent-amber-gold',
      };
    case 'low':
      return {
        bg: 'bg-accent-red-light',
        text: 'text-harken-error',
        border: 'border-harken-error/30',
        icon: 'text-harken-error',
      };
  }
}

/**
 * Format a document type for display
 */
function formatDocumentType(type: string): string {
  const labels: Record<string, string> = {
    cadastral: 'Cadastral',
    engagement: 'Engagement',
    sale: 'Sale Agreement',
    lease: 'Lease',
    rentroll: 'Rent Roll',
    survey: 'Survey',
    tax_return: 'Tax Return',
    financial_statement: 'Financial',
    unknown: 'Document',
  };
  return labels[type] || type;
}

/**
 * Truncate filename if too long
 */
function truncateFilename(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) return filename;
  const ext = filename.split('.').pop() || '';
  const name = filename.slice(0, filename.length - ext.length - 1);
  const truncated = name.slice(0, maxLength - ext.length - 4);
  return `${truncated}...${ext}`;
}

export function DocumentSourceIndicator({
  fieldPath,
  inline = false,
  className = '',
}: DocumentSourceIndicatorProps) {
  const { getFieldSource } = useWizard();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const source = getFieldSource(fieldPath);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // If no source, don't render anything
  if (!source) {
    return null;
  }

  const colors = getConfidenceColors(source.confidence);
  const confidencePercent = Math.round(source.confidence * 100);
  const ConfidenceIcon = source.confidence >= 0.85 ? Check : source.confidence >= 0.65 ? Info : AlertCircle;

  const badge = (
    <button
      ref={triggerRef}
      onClick={() => setIsOpen(!isOpen)}
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium
        border transition-all hover:shadow-sm cursor-pointer
        ${colors.bg} ${colors.text} ${colors.border}
        ${inline ? 'ml-1.5' : ''}
        ${className}
      `}
      title={`From: ${source.sourceFilename}`}
      type="button"
    >
      <FileText className="w-3 h-3" />
      <span className="max-w-[80px] truncate">{truncateFilename(source.sourceFilename, 12)}</span>
      <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );

  const popover = isOpen && (
    <div
      ref={popoverRef}
      className="absolute z-50 mt-1 w-64 bg-surface-1 rounded-lg shadow-lg border border-light-border overflow-hidden"
      style={{ top: '100%', left: 0 }}
    >
      {/* Header */}
      <div className={`px-3 py-2 border-b ${colors.bg} ${colors.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${colors.text}`}>
            Document Source
          </span>
          <div className={`flex items-center gap-1 ${colors.icon}`}>
            <ConfidenceIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{confidencePercent}%</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Filename */}
        <div>
          <div className="text-xs text-harken-gray mb-0.5">File</div>
          <div className="text-sm text-harken-dark dark:text-white font-medium flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-harken-gray-med flex-shrink-0" />
            <span className="truncate" title={source.sourceFilename}>
              {source.sourceFilename}
            </span>
          </div>
        </div>

        {/* Document Type */}
        <div>
          <div className="text-xs text-harken-gray mb-0.5">Document Type</div>
          <div className="text-sm text-harken-dark dark:text-white">
            {formatDocumentType(source.sourceDocumentType)}
          </div>
        </div>

        {/* Extracted Value */}
        <div>
          <div className="text-xs text-harken-gray mb-0.5">Extracted Value</div>
          <div className="text-sm text-harken-dark dark:text-white bg-harken-gray-light dark:bg-elevation-1 px-2 py-1 rounded border border-harken-gray-light dark:border-harken-gray break-words">
            {source.value}
          </div>
        </div>

        {/* Confidence Bar */}
        <div>
          <div className="text-xs text-harken-gray mb-1">Confidence</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-harken-gray-light rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  source.confidence >= 0.85
                    ? 'bg-accent-teal-mint-light0'
                    : source.confidence >= 0.65
                    ? 'bg-accent-amber-gold-light0'
                    : 'bg-accent-red-light0'
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs text-harken-gray w-8">{confidencePercent}%</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-harken-gray-med pt-1 border-t border-harken-gray-light">
          Extracted {new Date(source.extractedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      {badge}
      {popover}
    </div>
  );
}

/**
 * Hook to check if a field has a document source
 */
export function useHasDocumentSource(fieldPath: string): boolean {
  const { hasFieldSource } = useWizard();
  return hasFieldSource(fieldPath);
}

/**
 * Get styling classes for an input field that has a document source
 */
export function getDocumentSourceInputClasses(hasSource: boolean): string {
  if (!hasSource) return '';
  return 'border-accent-teal-mint bg-accent-teal-mint-light/30 focus:border-accent-teal-mint focus:ring-accent-teal-mint/30';
}

export default DocumentSourceIndicator;
