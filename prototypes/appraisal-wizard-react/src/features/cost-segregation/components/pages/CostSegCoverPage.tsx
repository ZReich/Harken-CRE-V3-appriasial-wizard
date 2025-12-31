/**
 * CostSegCoverPage Component
 * 
 * Cover page for the Cost Segregation report.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../../../types';

interface CostSegCoverPageProps {
  analysis: CostSegAnalysis;
  firmName?: string;
  preparerName?: string;
  className?: string;
}

export const CostSegCoverPage: React.FC<CostSegCoverPageProps> = ({
  analysis,
  firmName = 'Harken Appraisal Services',
  preparerName,
  className = '',
}) => {
  const analysisDate = new Date(analysis.analysisDate);
  const formattedDate = analysisDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`bg-white p-12 min-h-[11in] flex flex-col ${className}`}>
      {/* Header Accent */}
      <div className="h-2 bg-gradient-to-r from-[#0da1c7] to-[#1c3643] rounded-full mb-16" />

      {/* Title Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="mb-8">
          <div className="text-sm text-slate-500 uppercase tracking-widest mb-4">
            Cost Segregation Study
          </div>
          <h1 className="text-4xl font-bold text-[#1c3643] mb-4">
            {analysis.propertyName || 'Subject Property'}
          </h1>
          <p className="text-lg text-slate-600">
            {analysis.propertyAddress}
          </p>
        </div>

        {/* Decorative Line */}
        <div className="w-24 h-1 bg-[#0da1c7] rounded-full my-8" />

        {/* Key Highlights */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0da1c7]">
              ${((analysis.totalProjectCost || 0) / 1000000).toFixed(2)}M
            </div>
            <div className="text-sm text-slate-500 mt-1">Total Project Cost</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">
              {((analysis.summary.fiveYear.percent + analysis.summary.fifteenYear.percent) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-500 mt-1">Accelerated Recovery</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-700">
              ${((analysis.firstYearDepreciation || 0) / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-slate-500 mt-1">Year 1 Depreciation</div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto pt-16 border-t border-slate-200">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-semibold text-[#1c3643]">{firmName}</div>
            {preparerName && (
              <div className="text-sm text-slate-600">Prepared by: {preparerName}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Analysis Date</div>
            <div className="text-lg font-medium text-[#1c3643]">{formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSegCoverPage;
