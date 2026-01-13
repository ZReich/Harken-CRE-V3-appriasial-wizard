import React from 'react';
import type { ContentBlock } from '../../../../types';
import { ReportPageBase } from './ReportPageBase';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

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
  const rawContent = content[0]?.content as {
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
    finalValue?: number;
    finalValueFormatted?: string;
    scenarios?: Array<{ 
      name: string; 
      approaches: string[];
      approachValues?: Record<string, number | null>;
    }>;
    reconciliationWeights?: Record<string, number>;
  } | undefined;
  
  // Use sample data as fallback
  const sample = sampleAppraisalData;
  const hasWizardData = rawContent?.propertyName && rawContent.propertyName.length > 0;
  
  const summaryData = hasWizardData ? rawContent : {
    propertyName: sample.property.name,
    address: sample.property.fullAddress,
    propertyType: sample.property.propertyType,
    propertySubtype: sample.property.propertySubtype,
    taxId: sample.property.taxId,
    legalDescription: sample.property.legalDescription,
    siteArea: `${sample.site.landArea} ${sample.site.landAreaUnit} (${sample.site.landAreaSF.toLocaleString()} SF)`,
    zoningClass: `${sample.site.zoning} - ${sample.site.zoningDescription}`,
    effectiveDate: sample.valuation.effectiveDate,
    inspectionDate: sample.valuation.inspectionDate,
    finalValue: sample.valuation.asIsValue,
    finalValueFormatted: `$${sample.valuation.asIsValue.toLocaleString()}`,
    scenarios: [{
      name: 'As Is',
      approaches: ['Sales Comparison', 'Income Approach', 'Cost Approach'],
      approachValues: {
        'sales-comparison': sample.valuation.salesComparisonValue,
        'income-approach': sample.valuation.incomeApproachValue,
        'cost-approach': sample.valuation.costApproachValue,
      },
    }],
    reconciliationWeights: {
      'sales-comparison': sample.reconciliation.salesComparisonWeight,
      'income-approach': sample.reconciliation.incomeApproachWeight,
      'cost-approach': sample.reconciliation.costApproachWeight,
    },
  };

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
    <div className="mb-4">
      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {sectionTitle}
      </h4>
      <table className="w-full">
        <tbody>
          {rows.map((row, index) => (
            <tr 
              key={index} 
              className={`border-b border-slate-200 ${
                isEditing ? 'cursor-pointer hover:bg-slate-50' : ''
              }`}
              onClick={() => isEditing && onContentClick?.(`summary-${row.label}`)}
            >
              <td className="py-1.5 pr-4 text-xs text-slate-600 w-1/3">
                {row.label}
              </td>
              <td className={`py-1.5 text-xs ${
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
    <ReportPageBase
      title={title || 'Summary of Appraisal'}
      sidebarLabel="SUM"
      pageNumber={pageNumber}
      sectionNumber={1}
      sectionTitle="SUMMARY"
      contentPadding="p-10"
    >
      {renderTableSection('Property Identification', identificationRows)}
      {renderTableSection('Site Information', siteRows)}
      {renderTableSection('Key Dates', dateRows)}

      {/* Scenario & Approaches */}
      {summaryData?.scenarios && summaryData.scenarios.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Valuation Scenarios
          </h4>
          <div className="space-y-2">
            {summaryData.scenarios.map((scenario, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-3">
                <div className="font-medium text-slate-800 text-xs mb-1.5">{scenario.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.approaches.map((approach, i) => {
                    const value = scenario.approachValues?.[approach];
                    const weight = summaryData.reconciliationWeights?.[approach];
                    return (
                      <div 
                        key={i}
                        className="px-2 py-1.5 bg-sky-100/50 text-sky-700 text-[10px] rounded"
                      >
                        <div className="font-medium">{approach}</div>
                        {value != null && value > 0 && (
                          <div className="mt-0.5">
                            ${value.toLocaleString()}
                            {weight != null && weight > 0 && (
                              <span className="text-sky-500 ml-0.5">({weight}%)</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value Conclusions */}
      <div className="mb-4">
        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Value Conclusions
        </h4>
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 text-center">
          <p className="text-[10px] text-slate-500 mb-1">Final Market Value Estimate</p>
          <p className="text-2xl font-bold text-slate-900">
            {summaryData?.finalValueFormatted || (summaryData?.finalValue 
              ? `$${summaryData.finalValue.toLocaleString()}` 
              : 'To be determined')}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">As of Effective Date</p>
        </div>
      </div>
    </ReportPageBase>
  );
};

export default SummaryPage;
