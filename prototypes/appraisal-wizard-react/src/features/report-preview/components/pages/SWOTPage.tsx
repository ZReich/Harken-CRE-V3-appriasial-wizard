/**
 * SWOT Page Component
 * 
 * Displays the SWOT analysis in a professional four-quadrant layout
 * for the appraisal report.
 */

import React from 'react';
import type { SWOTData } from '../../../../components/SWOTAnalysis';

interface SWOTPageProps {
  data: SWOTData;
  pageNumber?: number;
}

interface QuadrantProps {
  title: string;
  items: string[];
  bgColor: string;
  borderColor: string;
  headerColor: string;
}

const Quadrant: React.FC<QuadrantProps> = ({ title, items, bgColor, borderColor, headerColor }) => (
  <div className={`${bgColor} rounded-lg border ${borderColor} overflow-hidden`}>
    <div className={`${headerColor} px-4 py-2`}>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
    </div>
    <div className="p-4">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No items identified</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-slate-400 mt-1">•</span>
              <span>{item}</span>
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
      <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto">
        <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
          SWOT ANALYSIS
        </h1>
        <p className="text-sm text-slate-500 italic">No SWOT analysis data available.</p>
      </div>
    );
  }

  const { strengths, weaknesses, opportunities, threats, summary } = data;

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
        SWOT ANALYSIS
      </h1>

      {/* Introductory Text */}
      <p className="text-sm text-slate-700 mb-6 leading-relaxed">
        The following SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis provides a strategic 
        assessment of the subject property's competitive position in the market. This framework evaluates 
        internal characteristics and external factors that may impact property value and investment potential.
      </p>

      {/* Four Quadrant Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Strengths */}
        <Quadrant
          title="STRENGTHS"
          items={strengths}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
          headerColor="bg-emerald-600"
        />

        {/* Weaknesses */}
        <Quadrant
          title="WEAKNESSES"
          items={weaknesses}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          headerColor="bg-red-600"
        />

        {/* Opportunities */}
        <Quadrant
          title="OPPORTUNITIES"
          items={opportunities}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          headerColor="bg-blue-600"
        />

        {/* Threats */}
        <Quadrant
          title="THREATS"
          items={threats}
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
          headerColor="bg-amber-600"
        />
      </div>

      {/* Summary Section */}
      {summary && (
        <>
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">
            Analysis Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {summary}
          </p>
        </>
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

