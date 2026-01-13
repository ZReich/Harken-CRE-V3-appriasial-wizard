/**
 * SWOT Page Component
 * 
 * Displays the SWOT analysis in a professional four-quadrant layout
 * for the appraisal report.
 * 
 * Enhanced with:
 * - ReportPageBase wrapper for consistent page structure
 * - HTML rendering for summary text
 * - Content limiting to prevent overflow
 * - Professional formatting for print
 */

import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, AlertTriangle } from 'lucide-react';
import type { SWOTAnalysisData } from '../../../../types';
import { renderReportContent } from '../../../../utils/htmlRenderer';
import { ReportPageBase } from './ReportPageBase';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

interface SWOTPageProps {
  data?: SWOTAnalysisData;
  pageNumber?: number;
}

interface QuadrantProps {
  title: string;
  items: string[];
  bgColor: string;
  borderColor: string;
  headerColor: string;
  bulletColor: string;
  icon: React.ReactNode;
  maxItems?: number;
}

const MAX_ITEMS_PER_QUADRANT = 4;

const Quadrant: React.FC<QuadrantProps> = ({ 
  title, 
  items, 
  bgColor, 
  borderColor, 
  headerColor,
  bulletColor,
  icon,
  maxItems = MAX_ITEMS_PER_QUADRANT,
}) => {
  const displayItems = items.slice(0, maxItems);
  const hiddenCount = items.length - displayItems.length;

  return (
    <div className={`${bgColor} rounded-lg border ${borderColor} overflow-hidden h-full flex flex-col`}>
      <div className={`${headerColor} px-3 py-2 flex items-center gap-2 flex-shrink-0`}>
        {icon}
        <h3 className="font-semibold text-white text-xs tracking-wide">{title}</h3>
        <span className="ml-auto text-white/70 text-xs font-medium">
          ({items.length})
        </span>
      </div>
      <div className="p-3 flex-1 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-1">No items identified</p>
        ) : (
          <ul className="space-y-1.5">
            {displayItems.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                <span className={`${bulletColor} mt-1 w-1 h-1 rounded-full shrink-0`} />
                <span className="leading-relaxed line-clamp-2">{item}</span>
              </li>
            ))}
            {hiddenCount > 0 && (
              <li className="text-xs text-slate-500 italic pl-2.5">
                +{hiddenCount} more item{hiddenCount > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export const SWOTPage: React.FC<SWOTPageProps> = ({ data, pageNumber }) => {
  // Use sample SWOT data as fallback
  const sampleSwot = sampleAppraisalData.swot;
  const hasWizardData = data && (data.strengths?.length > 0 || data.weaknesses?.length > 0);
  
  const swotData = hasWizardData ? data : {
    strengths: sampleSwot.strengths,
    weaknesses: sampleSwot.weaknesses,
    opportunities: sampleSwot.opportunities,
    threats: sampleSwot.threats,
    summary: sampleSwot.summary,
  };

  const { strengths, weaknesses, opportunities, threats, summary } = swotData;
  
  // Calculate counts for the summary
  const totalItems = strengths.length + weaknesses.length + opportunities.length + threats.length;
  const positiveItems = strengths.length + opportunities.length;
  const negativeItems = weaknesses.length + threats.length;

  return (
    <ReportPageBase
      title="SWOT Analysis"
      sidebarLabel="SWOT"
      pageNumber={pageNumber}
      sectionNumber={5}
      sectionTitle="ANALYSIS"
      contentPadding="p-10"
    >
      {/* Introductory Text */}
      <div className="mb-4">
        <p className="text-xs text-slate-700 leading-relaxed">
          The following SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis provides a strategic 
          assessment of the subject property's competitive position in the market.
        </p>
        
        {/* Stats Bar */}
        {totalItems > 0 && (
          <div className="mt-3 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded">
              <span className="text-slate-500">Total:</span>
              <span className="font-semibold text-slate-700">{totalItems}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded">
              <span className="text-emerald-600">Positive:</span>
              <span className="font-semibold text-emerald-600">{positiveItems}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded">
              <span className="text-red-600">Negative:</span>
              <span className="font-semibold text-red-600">{negativeItems}</span>
            </div>
          </div>
        )}
      </div>

      {/* Four Quadrant Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Row 1 Label */}
        <div className="text-center text-[10px] text-slate-400 font-medium col-span-2 pb-0.5 uppercase tracking-wider">
          Internal Factors
        </div>
        
        {/* Strengths */}
        <Quadrant
          title="STRENGTHS"
          items={strengths}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
          headerColor="bg-emerald-600"
          bulletColor="bg-emerald-500"
          icon={<TrendingUp className="w-3.5 h-3.5 text-white" />}
        />

        {/* Weaknesses */}
        <Quadrant
          title="WEAKNESSES"
          items={weaknesses}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          headerColor="bg-red-500"
          bulletColor="bg-red-500"
          icon={<TrendingDown className="w-3.5 h-3.5 text-white" />}
        />

        {/* Row 2 Label */}
        <div className="text-center text-[10px] text-slate-400 font-medium col-span-2 pt-1 pb-0.5 uppercase tracking-wider">
          External Factors
        </div>

        {/* Opportunities */}
        <Quadrant
          title="OPPORTUNITIES"
          items={opportunities}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          headerColor="bg-blue-600"
          bulletColor="bg-blue-500"
          icon={<ArrowUpRight className="w-3.5 h-3.5 text-white" />}
        />

        {/* Threats */}
        <Quadrant
          title="THREATS"
          items={threats}
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
          headerColor="bg-amber-500"
          bulletColor="bg-amber-500"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-white" />}
        />
      </div>

      {/* Matrix Legend */}
      <div className="bg-slate-50 rounded-lg p-2.5 mb-4 border border-slate-200">
        <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-600">
          <div>
            <span className="font-semibold text-slate-700">Internal Factors:</span>{' '}
            Characteristics inherent to the property that can be controlled through ownership.
          </div>
          <div>
            <span className="font-semibold text-slate-700">External Factors:</span>{' '}
            Market conditions and factors outside the control of property ownership.
          </div>
        </div>
      </div>

      {/* Summary Section - with HTML rendering */}
      {summary && (
        <div className="bg-gradient-to-r from-[#0da1c7]/5 to-[#0da1c7]/10 border-l-4 border-[#0da1c7] pl-3 py-2">
          <h2 className="text-xs font-semibold text-slate-800 mb-1">
            Analysis Summary
          </h2>
          <div 
            className="text-xs text-slate-700 leading-relaxed prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderReportContent(summary) }}
          />
        </div>
      )}
    </ReportPageBase>
  );
};

export default SWOTPage;
