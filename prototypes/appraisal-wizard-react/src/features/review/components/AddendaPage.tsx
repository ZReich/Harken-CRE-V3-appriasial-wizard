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
        {/* Green Sidebar */}
        <div className="bg-accent-teal-mint text-white flex items-center justify-center relative">
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
          <div className="absolute top-2 right-2 bg-accent-teal-mint text-white px-4 py-2 rounded text-xs font-semibold">
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
              <div className="bg-accent-teal-mint-light border border-accent-teal-mint rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-accent-teal-mint font-semibold">{includedCount}</span>
                    <span className="text-accent-teal-mint text-sm ml-1">
                      of {documents.length} documents included in report
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="border border-light-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-harken-gray-light border-b border-light-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-harken-gray uppercase tracking-wider">
                        Include
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-harken-gray uppercase tracking-wider">
                        Document
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-harken-gray uppercase tracking-wider">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-harken-gray uppercase tracking-wider">
                        Size
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-harken-gray uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-harken-gray-med-lt">
                    {documents.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        document={doc}
                        isSelected={selectedElement === `doc-${doc.id}`}
                        onSelect={() => onSelectElement(`doc-${doc.id}`)}
                        onToggleInclude={() => toggleDocumentInclusion(doc.id)}
                      />
                    ))}
                  </tbody>
                </table>
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

// Individual document row
interface DocumentRowProps {
  document: UploadedDocument;
  isSelected: boolean;
  onSelect: () => void;
  onToggleInclude: () => void;
}

function DocumentRow({ document, isSelected, onSelect, onToggleInclude }: DocumentRowProps) {
  const isIncluded = document.includeInReport !== false;
  const hasExtractedData = document.extractedData && Object.keys(document.extractedData).length > 0;

  return (
    <tr 
      className={`hover:bg-harken-gray-light cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={onSelect}
    >
      {/* Include Toggle */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleInclude();
          }}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            isIncluded 
              ? 'bg-accent-teal-mint border-accent-teal-mint text-white' 
              : 'bg-surface-1 border-light-border text-harken-gray-med-lt hover:border-harken-gray-med'
          }`}
        >
          {isIncluded && <Check className="w-4 h-4" />}
        </button>
      </td>

      {/* Document Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-harken-gray-med flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-harken-dark">{document.name}</div>
            {document.slotId && (
              <div className="text-xs text-harken-gray-med">{document.slotId}</div>
            )}
          </div>
        </div>
      </td>

      {/* Document Type */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-harken-gray-light text-harken-gray">
          {formatDocumentType(document.documentType)}
        </span>
      </td>

      {/* Size */}
      <td className="px-4 py-3 text-sm text-harken-gray-med">
        {formatFileSize(document.size)}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {document.status === 'extracted' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
              <Check className="w-3 h-3" />
              Processed
            </span>
          ) : document.status === 'error' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent-red-light text-harken-error">
              <X className="w-3 h-3" />
              Error
            </span>
          ) : document.status === 'processing' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
              Processing...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-harken-gray-light text-harken-gray">
              Pending
            </span>
          )}
          
          {hasExtractedData && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Could show a modal with extracted data
              }}
              className="p-1 text-harken-gray-med hover:text-harken-gray transition-colors"
              title="View extracted data"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default AddendaPage;
