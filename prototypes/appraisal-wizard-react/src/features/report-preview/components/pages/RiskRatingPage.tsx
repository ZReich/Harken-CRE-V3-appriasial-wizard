/**
 * Risk Rating Page Component
 * 
 * Displays the Investment Risk Rating ("Bond Rating for Buildings")
 * in a professional format for the appraisal report.
 */

import React from 'react';
import type { RiskRatingData } from '../../../../types/api';

interface RiskRatingPageProps {
  data: RiskRatingData;
  pageNumber?: number;
}

// Grade colors
const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'AAA': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400' },
  'AA': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400' },
  'A': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-400' },
  'BBB': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-400' },
  'BB': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400' },
  'B': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400' },
  'CCC': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
  'CC': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
  'C': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
};

const GRADE_DESCRIPTIONS: Record<string, string> = {
  'AAA': 'Institutional Grade - Exceptional',
  'AA': 'High Quality - Very Low Risk',
  'A': 'Upper Medium Grade',
  'BBB': 'Investment Grade - Moderate Risk',
  'BB': 'Speculative - Below Investment Grade',
  'B': 'Highly Speculative',
  'CCC': 'Substantial Risk',
  'CC': 'Extremely Speculative',
  'C': 'Near Default Risk',
};

const USPAP_DISCLOSURE = `RISK RATING DISCLOSURE

The Investment Risk Rating presented in this report is a statistical model based on aggregated market data and is used as a supplementary risk analysis tool to support the appraiser's conclusions. This rating does not replace the appraiser's value conclusion or professional judgment.

The risk rating methodology incorporates data from multiple sources including federal economic indicators, property records, demographic data, and market statistics. The appraiser has reviewed the model inputs and outputs and determined them to be reasonable for this analysis.

This rating is provided for informational purposes and should be considered alongside the complete appraisal analysis contained in this report.`;

export const RiskRatingPage: React.FC<RiskRatingPageProps> = ({ data, pageNumber }) => {
  if (!data) {
    return (
      <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto">
        <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
          INVESTMENT RISK ANALYSIS
        </h1>
        <p className="text-sm text-slate-500 italic">No risk rating data available.</p>
      </div>
    );
  }

  const { overallGrade, overallScore, dimensions, weightingRationale, generatedDate } = data;
  const gradeStyle = GRADE_COLORS[overallGrade] || GRADE_COLORS['BBB'];
  const gradeDescription = GRADE_DESCRIPTIONS[overallGrade] || 'Investment Grade';

  const dimensionData = [
    { name: 'Market Volatility', ...dimensions.marketVolatility },
    { name: 'Liquidity Risk', ...dimensions.liquidity },
    { name: 'Income Stability', ...dimensions.incomeStability },
    { name: 'Asset Quality', ...dimensions.assetQuality },
  ];

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
        INVESTMENT RISK ANALYSIS
      </h1>

      {/* Introductory Text */}
      <p className="text-sm text-slate-700 mb-6 leading-relaxed">
        This property has been assigned an Investment Risk Rating based on analysis of market, 
        financial, and physical factors. This rating provides a standardized framework for evaluating 
        investment quality, similar to bond credit ratings used in fixed-income markets.
      </p>

      {/* Main Rating Badge */}
      <div className="flex justify-center mb-8">
        <div className={`${gradeStyle.bg} ${gradeStyle.border} border-4 rounded-2xl p-8 text-center`}>
          <div className={`text-6xl font-bold ${gradeStyle.text} mb-2`}>
            {overallGrade}
          </div>
          <div className={`text-lg font-medium ${gradeStyle.text}`}>
            {gradeDescription}
          </div>
          <div className="text-slate-600 mt-2">
            Score: {overallScore} / 100
          </div>
        </div>
      </div>

      {/* Risk Dimension Analysis */}
      <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">
        Risk Dimension Analysis
      </h2>
      
      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left py-2 px-3 font-semibold text-slate-700 border border-slate-200">
              Dimension
            </th>
            <th className="text-center py-2 px-3 font-semibold text-slate-700 border border-slate-200 w-24">
              Score
            </th>
            <th className="text-center py-2 px-3 font-semibold text-slate-700 border border-slate-200 w-24">
              Weight
            </th>
            <th className="text-left py-2 px-3 font-semibold text-slate-700 border border-slate-200 w-40">
              Assessment
            </th>
          </tr>
        </thead>
        <tbody>
          {dimensionData.map((dim, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-3 px-3 font-medium text-slate-700 border border-slate-200">
                {dim.name}
              </td>
              <td className="py-3 px-3 text-center border border-slate-200">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-800">{dim.score}</span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-200">
                    <div 
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        dim.score >= 80 ? 'bg-emerald-500' :
                        dim.score >= 60 ? 'bg-cyan-500' :
                        dim.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-center font-medium text-slate-700 border border-slate-200">
                {(dim.weight * 100).toFixed(0)}%
              </td>
              <td className="py-3 px-3 text-slate-600 border border-slate-200">
                {dim.score >= 80 ? 'Strong' :
                 dim.score >= 60 ? 'Adequate' :
                 dim.score >= 40 ? 'Moderate Risk' : 'Elevated Risk'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Weighting Rationale */}
      {weightingRationale && (
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-slate-700 mb-2">Weight Determination</h3>
          <p className="text-sm text-slate-600">
            {weightingRationale}
          </p>
        </div>
      )}

      {/* USPAP Disclosure */}
      <div className="border border-slate-300 rounded-lg p-4 text-xs text-slate-600 leading-relaxed">
        {USPAP_DISCLOSURE.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className={idx > 0 ? 'mt-3' : 'font-semibold'}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Generated Date */}
      {generatedDate && (
        <div className="mt-4 text-xs text-slate-500">
          Rating generated: {new Date(generatedDate).toLocaleDateString()}
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

export default RiskRatingPage;

