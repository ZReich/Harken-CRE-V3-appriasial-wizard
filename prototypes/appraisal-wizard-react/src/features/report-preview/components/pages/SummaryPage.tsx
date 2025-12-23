import React from 'react';
import type { ContentBlock } from '../../../../types';

interface SummaryPageProps {
  content: ContentBlock[];
  title?: string;
  pageNumber?: number;
  isEditing?: boolean;
  onContentClick?: (blockId: string) => void;
}

interface SummaryRow {
  label: string;
  value: string | number | React.ReactNode;
  emphasized?: boolean;
}

export const SummaryPage: React.FC<SummaryPageProps> = ({
  content,
  title,
  pageNumber,
  isEditing = false,
  onContentClick,
}) => {
  const summaryData = content[0]?.content as {
    propertyName?: string;
    address?: string;
    propertyType?: string;
    propertySubtype?: string;
    taxId?: string;
    legalDescription?: string;
    siteArea?: string;
    zoningClass?: string;
    effectiveDate?: string;
    inspectionDate?: string;
    scenarios?: Array<{ name: string; approaches: string[] }>;
  } | undefined;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not Specified';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Build summary rows
  const identificationRows: SummaryRow[] = [
    { label: 'Property Name', value: summaryData?.propertyName || 'Not Specified' },
    { label: 'Property Address', value: summaryData?.address || 'Not Specified' },
    { label: 'Property Type', value: summaryData?.propertyType || 'Not Specified' },
    { label: 'Property Subtype', value: summaryData?.propertySubtype || 'N/A' },
    { label: 'Tax ID / Parcel Number', value: summaryData?.taxId || 'Not Specified' },
    { label: 'Legal Description', value: summaryData?.legalDescription || 'Not Specified' },
  ];

  const siteRows: SummaryRow[] = [
    { label: 'Site Area', value: summaryData?.siteArea || 'Not Specified' },
    { label: 'Zoning', value: summaryData?.zoningClass || 'Not Specified' },
  ];

  const dateRows: SummaryRow[] = [
    { label: 'Effective Date of Value', value: formatDate(summaryData?.effectiveDate), emphasized: true },
    { label: 'Date of Inspection', value: formatDate(summaryData?.inspectionDate) },
  ];

  const renderTableSection = (sectionTitle: string, rows: SummaryRow[]) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {sectionTitle}
      </h4>
      <table className="w-full">
        <tbody>
          {rows.map((row, index) => (
            <tr 
              key={index} 
              className={`border-b border-slate-100 ${
                isEditing ? 'cursor-pointer hover:bg-slate-50' : ''
              }`}
              onClick={() => isEditing && onContentClick?.(`summary-${row.label}`)}
            >
              <td className="py-2.5 pr-4 text-sm text-slate-600 w-1/3">
                {row.label}
              </td>
              <td className={`py-2.5 text-sm ${
                row.emphasized ? 'font-semibold text-slate-900' : 'text-slate-800'
              }`}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Page header */}
      <div className="px-16 pt-12 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {title || 'Summary of Appraisal'}
          </h2>
          {pageNumber && (
            <span className="text-sm text-slate-400">Page {pageNumber}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-16 py-8 overflow-auto">
        {renderTableSection('Property Identification', identificationRows)}
        {renderTableSection('Site Information', siteRows)}
        {renderTableSection('Key Dates', dateRows)}

        {/* Scenario & Approaches */}
        {summaryData?.scenarios && summaryData.scenarios.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Valuation Scenarios
            </h4>
            <div className="space-y-3">
              {summaryData.scenarios.map((scenario, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4">
                  <div className="font-medium text-slate-800 mb-2">{scenario.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {scenario.approaches.map((approach, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-sky-100 text-sky-700 text-sm rounded-full"
                      >
                        {approach}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Conclusions placeholder */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Value Conclusions
          </h4>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 text-center">
            <p className="text-sm text-slate-500 mb-2">Final Market Value Estimate</p>
            <p className="text-4xl font-bold text-slate-900">$0</p>
            <p className="text-sm text-slate-500 mt-2">As of Effective Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;

