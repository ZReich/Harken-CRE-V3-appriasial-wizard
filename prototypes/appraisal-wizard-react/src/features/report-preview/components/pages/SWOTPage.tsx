/**
 * SWOT Page Component
 * 
 * Displays the SWOT analysis in a professional four-quadrant layout
 * for the appraisal report.
 * 
 * Enhanced with:
 * - Better visual hierarchy
 * - Item categorization support
 * - Professional formatting for print
 */

import React from 'react';
import type { SWOTAnalysisData } from '../../../../types';

interface SWOTPageProps {
  data: SWOTAnalysisData;
  pageNumber?: number;
}

interface QuadrantProps {
  title: string;
  items: string[];
  bgColor: string;
  borderColor: string;
  headerColor: string;
  bulletColor: string;
  iconSymbol: string;
}

const Quadrant: React.FC<QuadrantProps> = ({ 
  title, 
  items, 
  bgColor, 
  borderColor, 
  headerColor,
  bulletColor,
  iconSymbol
}) => (
  <div className={`${bgColor} rounded-lg border ${borderColor} overflow-hidden h-full`}>
    <div className={`${headerColor} px-4 py-2.5 flex items-center gap-2`}>
      <span className="text-lg">{iconSymbol}</span>
      <h3 className="font-semibold text-white text-sm tracking-wide">{title}</h3>
      <span className="ml-auto text-white/70 text-xs font-medium">
        ({items.length})
      </span>
    </div>
    <div className="p-4">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-2">No items identified</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
              <span className={`${bulletColor} mt-1.5 w-1.5 h-1.5 rounded-full shrink-0`} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export const SWOTPage: React.FC<SWOTPageProps> = ({ data, pageNumber }) => {
  if (!data) {
    return (
      <div className="bg-surface-1 w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto">
        <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
          SWOT ANALYSIS
        </h1>
        <p className="text-sm text-slate-500 italic">No SWOT analysis data available.</p>
      </div>
    );
  }

  const { strengths, weaknesses, opportunities, threats, summary } = data;
  
  // Calculate counts for the summary
  const totalItems = strengths.length + weaknesses.length + opportunities.length + threats.length;
  const positiveItems = strengths.length + opportunities.length;
  const negativeItems = weaknesses.length + threats.length;

  return (
    <div className="bg-surface-1 w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
        SWOT ANALYSIS
      </h1>

      {/* Introductory Text */}
      <div className="mb-6">
        <p className="text-sm text-slate-700 leading-relaxed">
          The following SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis provides a strategic 
          assessment of the subject property's competitive position in the market. This framework evaluates 
          internal characteristics and external factors that may impact property value and investment potential.
        </p>
        
        {/* Stats Bar */}
        {totalItems > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-3 dark:bg-elevation-subtle rounded">
              <span className="text-slate-500">Total Factors:</span>
              <span className="font-semibold text-slate-700">{totalItems}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-teal-mint-light rounded">
              <span className="text-accent-teal-mint">Positive:</span>
              <span className="font-semibold text-accent-teal-mint">{positiveItems}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-red-light rounded">
              <span className="text-harken-error">Negative:</span>
              <span className="font-semibold text-harken-error">{negativeItems}</span>
            </div>
          </div>
        )}
      </div>

      {/* Four Quadrant Grid - Equal height rows */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Row 1: Strengths & Weaknesses (Internal) */}
        <div className="text-center text-xs text-slate-400 font-medium col-span-2 pb-1">
          INTERNAL FACTORS
        </div>
        
        {/* Strengths */}
        <Quadrant
          title="STRENGTHS"
          items={strengths}
          bgColor="bg-accent-teal-mint-light"
          borderColor="border-accent-teal-mint"
          headerColor="bg-accent-teal-mint"
          bulletColor="bg-accent-teal-mint"
          iconSymbol="+"
        />

        {/* Weaknesses */}
        <Quadrant
          title="WEAKNESSES"
          items={weaknesses}
          bgColor="bg-accent-red-light"
          borderColor="border-harken-error/20"
          headerColor="bg-harken-error"
          bulletColor="bg-harken-error"
          iconSymbol="−"
        />

        {/* Row 2: Opportunities & Threats (External) */}
        <div className="text-center text-xs text-slate-400 font-medium col-span-2 pt-2 pb-1">
          EXTERNAL FACTORS
        </div>

        {/* Opportunities */}
        <Quadrant
          title="OPPORTUNITIES"
          items={opportunities}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          headerColor="bg-blue-600"
          bulletColor="bg-blue-500"
          iconSymbol="↑"
        />

        {/* Threats */}
        <Quadrant
          title="THREATS"
          items={threats}
          bgColor="bg-accent-amber-gold-light"
          borderColor="border-accent-amber-gold"
          headerColor="bg-accent-amber-gold"
          bulletColor="bg-accent-amber-gold"
          iconSymbol="⚠"
        />
      </div>

      {/* Matrix Legend */}
      <div className="bg-surface-2 dark:bg-elevation-2 rounded-lg p-3 mb-6 border border-light-border dark:border-dark-border">
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-700">Internal Factors:</span>{' '}
            Characteristics inherent to the property that can be controlled or influenced through ownership decisions.
          </div>
          <div>
            <span className="font-semibold text-slate-700">External Factors:</span>{' '}
            Market conditions and environmental factors outside the control of property ownership.
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="bg-gradient-to-r from-[#0da1c7]/5 to-transparent border-l-4 border-[#0da1c7] pl-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Analysis Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Page Number */}
      {pageNumber && (
        <div className="absolute bottom-[0.5in] right-[1in]">
          <span className="text-sm text-slate-400">{pageNumber}</span>
        </div>
      )}
    </div>
  );
};

export default SWOTPage;
