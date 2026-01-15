/**
 * AddendaPage Component
 * 
 * Displays uploaded documents in the report preview as an Addenda section.
 * Shows document list with classification, source info, and toggle for inclusion.
 */

import { FileText, Eye, Check, X } from 'lucide-react';
import { useWizard } from '../../../context/WizardContext';
import type { UploadedDocument } from '../../../types';

// Helper to format document type labels
function formatDocumentType(docType?: string): string {
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
  return typeLabels[docType || 'unknown'] || docType || 'Document';
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AddendaPageProps {
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
}

export function AddendaPage({ selectedElement, onSelectElement }: AddendaPageProps) {
  const { state, dispatch } = useWizard();
  const documents = state.uploadedDocuments || [];

  // Toggle document inclusion in report
  const toggleDocumentInclusion = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      dispatch({
        type: 'UPDATE_UPLOADED_DOCUMENT',
        payload: {
          id: docId,
          updates: { includeInReport: !doc.includeInReport },
        },
      });
    }
  };

  // Count included documents
  const includedCount = documents.filter(d => d.includeInReport !== false).length;

  return (
    <div className="bg-surface-1 shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in' }}>
      <div className="grid grid-cols-[80px_1fr]" style={{ minHeight: '11in' }}>
        {/* Teal Sidebar - matches report theme */}
        <div className="text-white flex items-center justify-center relative" style={{ backgroundColor: '#0da1c7' }}>
          <div className="absolute top-8 text-center">
            <span className="text-xs font-bold tracking-wider">11</span>
          </div>
          <div
            className="transform -rotate-90 whitespace-nowrap text-sm font-medium tracking-wider"
            style={{ width: '200px', textAlign: 'center' }}
          >
            ADDENDA
          </div>
        </div>

        {/* Main Content */}
        <div className="p-10 relative">
          {/* Section Badge */}
          <div className="absolute top-2 right-2 text-white px-4 py-2 rounded text-xs font-semibold" style={{ backgroundColor: '#0da1c7' }}>
            ADDENDA
          </div>

          <h2 className="text-2xl font-light text-harken-gray mb-2 mt-8">Supporting Documents</h2>
          <p className="text-sm text-harken-gray-med mb-6">
            The following documents were provided in connection with this appraisal assignment.
          </p>

          {documents.length === 0 ? (
            <div className="text-center py-12 bg-harken-gray-light rounded-lg border border-light-border">
              <FileText className="w-12 h-12 text-harken-gray-med mx-auto mb-3" />
              <p className="text-harken-gray-med">No documents have been uploaded.</p>
              <p className="text-sm text-harken-gray-med mt-1">
                Upload documents in the Document Intake section to include them in the report.
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(13, 161, 199, 0.1)', border: '1px solid #0da1c7' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold" style={{ color: '#0da1c7' }}>{includedCount}</span>
                    <span className="text-sm ml-1" style={{ color: '#0da1c7' }}>
                      of {documents.length} documents included in report
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    isSelected={selectedElement === `doc-${doc.id}`}
                    onSelect={() => onSelectElement(`doc-${doc.id}`)}
                    onToggleInclude={() => toggleDocumentInclusion(doc.id)}
                  />
                ))}
              </div>

              {/* Footer Note */}
              <div className="mt-6 text-xs text-harken-gray-med text-center">
                Documents marked for inclusion will appear in the final report addenda.
                <br />
                Original documents are available upon request.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual document card
interface DocumentCardProps {
  document: UploadedDocument;
  isSelected: boolean;
  onSelect: () => void;
  onToggleInclude: () => void;
}

function DocumentCard({ document, isSelected, onSelect, onToggleInclude }: DocumentCardProps) {
  const isIncluded = document.includeInReport !== false;
  const hasExtractedData = document.extractedData && Object.keys(document.extractedData).length > 0;

  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${isSelected
          ? 'bg-blue-50 border-[#0da1c7] ring-1 ring-[#0da1c7]'
          : 'bg-white border-light-border hover:border-harken-gray-med'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon & Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-harken-gray-light rounded-lg flex-shrink-0">
            <FileText className="w-6 h-6 text-harken-gray-med" />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-medium text-harken-dark truncate" title={document.name}>
              {document.name}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-harken-gray-light text-harken-gray border border-gray-200">
                {formatDocumentType(document.documentType)}
              </span>
              <span className="text-[10px] text-harken-gray-med">
                {formatFileSize(document.size)}
              </span>
            </div>

            {/* Status Indicator */}
            <div className="mt-2 flex items-center gap-2">
              {document.status === 'extracted' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
                  <Check className="w-3 h-3" />
                  Processed
                </span>
              ) : document.status === 'error' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-harken-error">
                  <X className="w-3 h-3" />
                  Error
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Include Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleInclude();
          }}
          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isIncluded
              ? 'bg-[#0da1c7] border-[#0da1c7] text-white'
              : 'bg-white border-light-border text-transparent hover:border-harken-gray-med'
            }`}
          title={isIncluded ? "Included in report" : "Click to include"}
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default AddendaPage;
