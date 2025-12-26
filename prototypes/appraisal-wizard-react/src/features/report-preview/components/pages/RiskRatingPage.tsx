/**
 * Risk Rating Page Component
 * 
 * Displays the Investment Risk Rating ("Bond Rating for Buildings")
 * in a comprehensive, professional format for the appraisal report.
 * 
 * This page provides institutional-quality risk analysis presentation
 * suitable for sophisticated investors and lenders.
 */

import React from 'react';
import type { RiskRatingData } from '../../../../types/api';

interface RiskRatingPageProps {
  data: RiskRatingData;
  pageNumber?: number;
}

// Grade styling configuration
const GRADE_CONFIG: Record<string, { 
  bg: string; 
  text: string; 
  border: string;
  lightBg: string;
  barColor: string;
  description: string;
  riskLevel: string;
}> = {
  'AAA': { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-800', 
    border: 'border-emerald-400',
    lightBg: 'bg-emerald-50',
    barColor: 'bg-emerald-500',
    description: 'Institutional Grade - Exceptional',
    riskLevel: 'Minimal Risk'
  },
  'AA': { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-800', 
    border: 'border-emerald-400',
    lightBg: 'bg-emerald-50',
    barColor: 'bg-emerald-500',
    description: 'High Quality - Very Low Risk',
    riskLevel: 'Very Low Risk'
  },
  'A': { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-700', 
    border: 'border-emerald-400',
    lightBg: 'bg-emerald-50',
    barColor: 'bg-emerald-500',
    description: 'Upper Medium Grade',
    riskLevel: 'Low Risk'
  },
  'BBB': { 
    bg: 'bg-cyan-100', 
    text: 'text-cyan-800', 
    border: 'border-cyan-400',
    lightBg: 'bg-cyan-50',
    barColor: 'bg-cyan-500',
    description: 'Investment Grade - Moderate Risk',
    riskLevel: 'Moderate Risk'
  },
  'BB': { 
    bg: 'bg-amber-100', 
    text: 'text-amber-800', 
    border: 'border-amber-400',
    lightBg: 'bg-amber-50',
    barColor: 'bg-amber-500',
    description: 'Speculative - Below Investment Grade',
    riskLevel: 'Elevated Risk'
  },
  'B': { 
    bg: 'bg-amber-100', 
    text: 'text-amber-800', 
    border: 'border-amber-400',
    lightBg: 'bg-amber-50',
    barColor: 'bg-amber-500',
    description: 'Highly Speculative',
    riskLevel: 'High Risk'
  },
  'CCC': { 
    bg: 'bg-red-100', 
    text: 'text-red-800', 
    border: 'border-red-400',
    lightBg: 'bg-red-50',
    barColor: 'bg-red-500',
    description: 'Substantial Risk',
    riskLevel: 'Substantial Risk'
  },
  'CC': { 
    bg: 'bg-red-100', 
    text: 'text-red-800', 
    border: 'border-red-400',
    lightBg: 'bg-red-50',
    barColor: 'bg-red-500',
    description: 'Extremely Speculative',
    riskLevel: 'Very High Risk'
  },
  'C': { 
    bg: 'bg-red-100', 
    text: 'text-red-800', 
    border: 'border-red-400',
    lightBg: 'bg-red-50',
    barColor: 'bg-red-500',
    description: 'Near Default Risk',
    riskLevel: 'Extreme Risk'
  },
};

// Dimension detailed descriptions
const DIMENSION_DETAILS: Record<string, {
  label: string;
  fullName: string;
  description: string;
  interpretation: string;
}> = {
  marketVolatility: {
    label: 'Market Volatility',
    fullName: 'Market Volatility (Beta)',
    description: 'Measures price sensitivity relative to broader real estate market movements.',
    interpretation: 'Higher scores indicate lower volatility and more stable value characteristics.',
  },
  liquidity: {
    label: 'Liquidity Risk',
    fullName: 'Liquidity Risk Assessment',
    description: 'Evaluates the ease of converting the asset to cash without significant price concession.',
    interpretation: 'Higher scores indicate stronger market depth and faster potential disposition.',
  },
  incomeStability: {
    label: 'Income Stability',
    fullName: 'Income Stability (Yield Spread)',
    description: 'Analyzes the predictability and durability of income streams.',
    interpretation: 'Higher scores indicate more reliable and diversified income sources.',
  },
  assetQuality: {
    label: 'Asset Quality',
    fullName: 'Asset Quality Assessment',
    description: 'Comprehensive assessment of physical characteristics and location quality.',
    interpretation: 'Higher scores indicate superior construction, condition, and location attributes.',
  },
};

const RATING_SCALE = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C'];

const METHODOLOGY_DISCLOSURE = `This Investment Risk Rating employs a proprietary analytical framework that integrates multiple data sources to provide an institutional-quality risk assessment. The methodology synthesizes:

• Federal Reserve economic indicators (interest rates, inflation, GDP growth)
• Regional and local market statistics (transaction velocity, pricing trends)
• Property-specific characteristics (age, condition, construction quality)
• Demographic and economic data (population trends, income levels, employment)
• Income analysis metrics (cap rate spreads, occupancy patterns)

The four risk dimensions are dynamically weighted based on property type, income-producing status, and prevailing market conditions. Scores are normalized relative to Metropolitan Statistical Area (MSA) benchmarks using z-score methodology, ensuring appropriate regional context.

The composite rating translates quantitative scores into a letter-grade scale modeled after fixed-income credit ratings, providing a familiar framework for institutional investors and lenders.`;

const USPAP_DISCLOSURE = `PROFESSIONAL STANDARDS DISCLOSURE

This Investment Risk Rating is a supplementary analytical tool developed to support the appraiser's professional judgment. It does not replace the appraiser's value conclusion or the comprehensive analysis contained elsewhere in this report.

The rating methodology has been reviewed by the appraiser and determined to incorporate reasonable data sources and analytical approaches for this assignment. The model inputs and outputs have been examined for consistency with market observations and property-specific factors.

This rating is provided for informational purposes and should be interpreted in conjunction with the complete appraisal analysis. The rating reflects conditions as of the effective date of the appraisal and may not reflect subsequent market changes.

The appraiser certifies that the use of this analytical tool complies with the Uniform Standards of Professional Appraisal Practice (USPAP) and applicable state regulations.`;

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
  const gradeConfig = GRADE_CONFIG[overallGrade] || GRADE_CONFIG['BBB'];
  const gradeIndex = RATING_SCALE.indexOf(overallGrade);

  const dimensionData = [
    { key: 'marketVolatility', ...dimensions.marketVolatility, ...DIMENSION_DETAILS.marketVolatility },
    { key: 'liquidity', ...dimensions.liquidity, ...DIMENSION_DETAILS.liquidity },
    { key: 'incomeStability', ...dimensions.incomeStability, ...DIMENSION_DETAILS.incomeStability },
    { key: 'assetQuality', ...dimensions.assetQuality, ...DIMENSION_DETAILS.assetQuality },
  ];

  // Calculate weighted contribution for each dimension
  const totalWeight = dimensionData.reduce((sum, d) => sum + d.weight, 0);
  const weightedContributions = dimensionData.map(d => ({
    ...d,
    contribution: (d.score * d.weight / totalWeight).toFixed(1),
    percentOfTotal: ((d.score * d.weight / totalWeight) / overallScore * 100).toFixed(0),
  }));

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-4">
        INVESTMENT RISK ANALYSIS
      </h1>

      {/* Executive Summary Box */}
      <div className="flex gap-6 mb-6">
        {/* Rating Badge */}
        <div className={`${gradeConfig.bg} ${gradeConfig.border} border-3 rounded-xl p-5 text-center flex-shrink-0`} style={{ minWidth: '140px' }}>
          <div className={`text-4xl font-bold ${gradeConfig.text} mb-1`}>
            {overallGrade}
          </div>
          <div className={`text-xs font-semibold ${gradeConfig.text} uppercase tracking-wide`}>
            {gradeConfig.riskLevel}
          </div>
          <div className="text-slate-600 mt-2 text-xs">
            Score: {overallScore}/100
          </div>
        </div>

        {/* Summary Text */}
        <div className="flex-1">
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            This property has been assigned an <strong>{gradeConfig.description}</strong> rating 
            based on comprehensive analysis of market, financial, and physical risk factors. This 
            rating provides a standardized framework for evaluating investment quality, similar to 
            bond credit ratings used in fixed-income markets.
          </p>
          <div className="text-xs text-slate-500">
            <strong>Rating Classification:</strong> {gradeIndex <= 2 ? 'Investment Grade - Core/Core-Plus' : 
              gradeIndex <= 4 ? 'Investment Grade - Value-Add' : 'Speculative Grade - Opportunistic'}
          </div>
        </div>
      </div>

      {/* Rating Scale Visualization */}
      <div className="mb-6 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Lower Risk</span>
          <span className="font-medium text-slate-700">Rating Scale Position</span>
          <span>Higher Risk</span>
        </div>
        <div className="flex items-center gap-0.5">
          {RATING_SCALE.map((grade) => {
            const config = GRADE_CONFIG[grade];
            const isCurrent = grade === overallGrade;
            return (
              <div 
                key={grade}
                className={`flex-1 h-6 flex items-center justify-center text-xs font-bold ${
                  isCurrent 
                    ? `${config.bg} ${config.text} ${config.border} border-2 rounded` 
                    : `${config.lightBg} ${config.text} opacity-50`
                }`}
              >
                {grade}
              </div>
            );
          })}
        </div>
      </div>

      {/* Four-Dimension Analysis */}
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
        Risk Dimension Analysis
      </h2>
      
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left py-2 px-2 font-semibold text-slate-700 border border-slate-200">
              Dimension
            </th>
            <th className="text-center py-2 px-2 font-semibold text-slate-700 border border-slate-200 w-16">
              Score
            </th>
            <th className="text-center py-2 px-2 font-semibold text-slate-700 border border-slate-200 w-16">
              Weight
            </th>
            <th className="text-center py-2 px-2 font-semibold text-slate-700 border border-slate-200 w-20">
              Contribution
            </th>
            <th className="text-left py-2 px-2 font-semibold text-slate-700 border border-slate-200">
              Assessment
            </th>
          </tr>
        </thead>
        <tbody>
          {weightedContributions.map((dim, idx) => (
            <tr key={dim.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-2 px-2 border border-slate-200">
                <div className="font-medium text-slate-800">{dim.fullName}</div>
                <div className="text-slate-500 mt-0.5">{dim.description}</div>
              </td>
              <td className="py-2 px-2 text-center border border-slate-200">
                <div className="font-bold text-slate-800 text-sm">{dim.score}</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full ${
                      dim.score >= 80 ? 'bg-emerald-500' :
                      dim.score >= 60 ? 'bg-cyan-500' :
                      dim.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </td>
              <td className="py-2 px-2 text-center font-medium text-slate-700 border border-slate-200">
                {(dim.weight * 100).toFixed(0)}%
              </td>
              <td className="py-2 px-2 text-center border border-slate-200">
                <span className="font-medium text-slate-800">{dim.contribution}</span>
                <span className="text-slate-400 ml-1">pts</span>
              </td>
              <td className="py-2 px-2 border border-slate-200">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  dim.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  dim.score >= 60 ? 'bg-cyan-100 text-cyan-700' :
                  dim.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {dim.score >= 80 ? 'Strong' :
                   dim.score >= 60 ? 'Adequate' :
                   dim.score >= 40 ? 'Moderate Risk' : 'Elevated Risk'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-semibold">
            <td className="py-2 px-2 border border-slate-200 text-slate-800">
              Composite Score
            </td>
            <td className="py-2 px-2 text-center border border-slate-200 text-slate-800 text-sm">
              {overallScore}
            </td>
            <td className="py-2 px-2 text-center border border-slate-200 text-slate-700">
              100%
            </td>
            <td className="py-2 px-2 text-center border border-slate-200 text-slate-800">
              {overallScore} pts
            </td>
            <td className="py-2 px-2 border border-slate-200">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${gradeConfig.bg} ${gradeConfig.text}`}>
                {overallGrade} Rating
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Weight Rationale */}
      {weightingRationale && (
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-1">
            Dynamic Weight Calibration
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {weightingRationale}
          </p>
        </div>
      )}

      {/* Methodology Summary */}
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Analytical Methodology
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
        {METHODOLOGY_DISCLOSURE}
      </p>

      {/* USPAP Disclosure */}
      <div className="border border-slate-300 rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
        <h3 className="font-bold text-slate-700 mb-2">Professional Standards Compliance</h3>
        {USPAP_DISCLOSURE.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-[0.75in] left-[1in] right-[1in] flex items-center justify-between text-xs text-slate-400">
        <span>Rating generated: {new Date(generatedDate).toLocaleDateString()}</span>
        <span>Proprietary Risk Analysis Framework</span>
      </div>

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
