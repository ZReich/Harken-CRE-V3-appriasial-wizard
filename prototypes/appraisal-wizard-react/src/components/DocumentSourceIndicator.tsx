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
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: 'text-emerald-500',
      };
    case 'medium':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: 'text-amber-500',
      };
    case 'low':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: 'text-red-500',
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
      className="absolute z-50 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
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
          <div className="text-xs text-gray-500 mb-0.5">File</div>
          <div className="text-sm text-gray-900 dark:text-white font-medium flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate" title={source.sourceFilename}>
              {source.sourceFilename}
            </span>
          </div>
        </div>

        {/* Document Type */}
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Document Type</div>
          <div className="text-sm text-gray-900 dark:text-white">
            {formatDocumentType(source.sourceDocumentType)}
          </div>
        </div>

        {/* Extracted Value */}
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Extracted Value</div>
          <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded border border-gray-100 dark:border-slate-600 break-words">
            {source.value}
          </div>
        </div>

        {/* Confidence Bar */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Confidence</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  source.confidence >= 0.85
                    ? 'bg-emerald-500'
                    : source.confidence >= 0.65
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-8">{confidencePercent}%</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
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
  return 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-300 focus:ring-emerald-200';
}

export default DocumentSourceIndicator;
