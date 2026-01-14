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
import { ReportPageBase } from './ReportPageBase';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

interface RiskRatingPageProps {
  data?: RiskRatingData;
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
    text: 'text-emerald-700', 
    border: 'border-emerald-400',
    lightBg: 'bg-emerald-50',
    barColor: 'bg-emerald-500',
    description: 'Institutional Grade - Exceptional',
    riskLevel: 'Minimal Risk'
  },
  'AA': { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-700', 
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
    text: 'text-amber-700', 
    border: 'border-amber-400',
    lightBg: 'bg-amber-50',
    barColor: 'bg-amber-500',
    description: 'Speculative - Below Investment Grade',
    riskLevel: 'Elevated Risk'
  },
  'B': { 
    bg: 'bg-amber-100', 
    text: 'text-amber-700', 
    border: 'border-amber-400',
    lightBg: 'bg-amber-50',
    barColor: 'bg-amber-500',
    description: 'Highly Speculative',
    riskLevel: 'High Risk'
  },
  'CCC': { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
    border: 'border-red-400',
    lightBg: 'bg-red-50',
    barColor: 'bg-red-500',
    description: 'Substantial Risk',
    riskLevel: 'Substantial Risk'
  },
  'CC': { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
    border: 'border-red-400',
    lightBg: 'bg-red-50',
    barColor: 'bg-red-500',
    description: 'Extremely Speculative',
    riskLevel: 'Very High Risk'
  },
  'C': { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
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
}> = {
  marketVolatility: {
    label: 'Market Volatility',
    fullName: 'Market Volatility (Beta)',
  },
  liquidity: {
    label: 'Liquidity Risk',
    fullName: 'Liquidity Risk Assessment',
  },
  incomeStability: {
    label: 'Income Stability',
    fullName: 'Income Stability',
  },
  assetQuality: {
    label: 'Asset Quality',
    fullName: 'Asset Quality',
  },
};

const RATING_SCALE = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C'];

export const RiskRatingPage: React.FC<RiskRatingPageProps> = ({ data, pageNumber }) => {
  // Use sample risk rating data as fallback
  const sampleRisk = sampleAppraisalData.riskRating;
  const hasWizardData = data && data.overallGrade;
  
  // Create compatible risk data structure
  const riskData = hasWizardData ? data : null;
  
  if (!riskData) {
    return (
      <ReportPageBase
        title="Investment Risk Analysis"
        sidebarLabel="RISK"
        pageNumber={pageNumber}
        sectionNumber={5}
        sectionTitle="ANALYSIS"
        contentPadding="p-10"
      >
        <p className="text-sm text-slate-500 italic">No risk rating data available.</p>
      </ReportPageBase>
    );
  }

  // Extract rating details from wizard data or sample
  const overallGrade = riskData?.overallGrade || sampleRisk.overallRating;
  const overallScore = riskData?.overallScore || 78;
  const dimensions = riskData?.dimensions || sampleRisk.dimensions;
  const weightingRationale = riskData?.weightingRationale || sampleRisk.methodology;
  const generatedDate = riskData?.generatedDate || new Date().toISOString();
  
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
  }));

  return (
    <ReportPageBase
      title="Investment Risk Analysis"
      sidebarLabel="RISK"
      pageNumber={pageNumber}
      sectionNumber={5}
      sectionTitle="ANALYSIS"
      contentPadding="p-10"
    >
      {/* Executive Summary Box */}
      <div className="flex gap-5 mb-6">
        {/* Rating Badge */}
        <div className={`${gradeConfig.bg} ${gradeConfig.border} border-2 rounded-lg p-4 text-center flex-shrink-0`} style={{ minWidth: '120px' }}>
          <div className={`text-4xl font-bold ${gradeConfig.text}`}>
            {overallGrade}
          </div>
          <div className={`text-xs font-semibold ${gradeConfig.text} uppercase tracking-wide`}>
            {gradeConfig.riskLevel}
          </div>
          <div className="text-slate-600 mt-1 text-xs">
            Score: {overallScore}/100
          </div>
        </div>

        {/* Summary Text */}
        <div className="flex-1">
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            This property has been assigned an <strong>{gradeConfig.description}</strong> rating 
            based on comprehensive analysis of market, financial, and physical risk factors.
          </p>
          <div className="text-xs text-slate-500">
            <strong>Classification:</strong> {gradeIndex <= 2 ? 'Investment Grade - Core/Core-Plus' : 
              gradeIndex <= 4 ? 'Investment Grade - Value-Add' : 'Speculative Grade - Opportunistic'}
          </div>
        </div>
      </div>

      {/* Rating Scale Visualization */}
      <div className="mb-6 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Lower Risk</span>
          <span className="font-medium text-slate-700">Rating Scale</span>
          <span>Higher Risk</span>
        </div>
        <div className="flex items-center gap-1">
          {RATING_SCALE.map((grade) => {
            const config = GRADE_CONFIG[grade];
            const isCurrent = grade === overallGrade;
            return (
              <div 
                key={grade}
                className={`flex-1 h-7 flex items-center justify-center text-xs font-bold ${
                  isCurrent 
                    ? `${config.bg} ${config.text} ${config.border} border-2 rounded` 
                    : `${config.lightBg} ${config.text} opacity-40`
                }`}
              >
                {grade}
              </div>
            );
          })}
        </div>
      </div>

      {/* Four-Dimension Analysis */}
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">
        Risk Dimension Analysis
      </h2>
      
      <table className="w-full text-xs border-collapse mb-5">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left py-2.5 px-3 font-semibold text-slate-700 border border-slate-200">
              Dimension
            </th>
            <th className="text-center py-2.5 px-3 font-semibold text-slate-700 border border-slate-200 w-16">
              Score
            </th>
            <th className="text-center py-2.5 px-3 font-semibold text-slate-700 border border-slate-200 w-16">
              Weight
            </th>
            <th className="text-center py-2.5 px-3 font-semibold text-slate-700 border border-slate-200 w-20">
              Contrib.
            </th>
            <th className="text-left py-2.5 px-3 font-semibold text-slate-700 border border-slate-200 w-24">
              Rating
            </th>
          </tr>
        </thead>
        <tbody>
          {weightedContributions.map((dim, idx) => (
            <tr key={dim.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-2.5 px-3 border border-slate-200 font-medium text-slate-800">
                {dim.fullName}
              </td>
              <td className="py-2.5 px-3 text-center border border-slate-200">
                <div className="font-bold text-slate-800">{dim.score}</div>
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
              <td className="py-2.5 px-3 text-center font-medium text-slate-700 border border-slate-200">
                {(dim.weight * 100).toFixed(0)}%
              </td>
              <td className="py-2.5 px-3 text-center border border-slate-200">
                <span className="font-medium text-slate-800">{dim.contribution}</span>
                <span className="text-slate-400 ml-0.5">pts</span>
              </td>
              <td className="py-2.5 px-3 border border-slate-200">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  dim.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  dim.score >= 60 ? 'bg-cyan-100 text-cyan-700' :
                  dim.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {dim.score >= 80 ? 'Strong' :
                   dim.score >= 60 ? 'Adequate' :
                   dim.score >= 40 ? 'Moderate' : 'Elevated'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-semibold">
            <td className="py-2.5 px-3 border border-slate-200 text-slate-800">
              Composite Score
            </td>
            <td className="py-2.5 px-3 text-center border border-slate-200 text-slate-800">
              {overallScore}
            </td>
            <td className="py-2.5 px-3 text-center border border-slate-200 text-slate-700">
              100%
            </td>
            <td className="py-2.5 px-3 text-center border border-slate-200 text-slate-800">
              {overallScore} pts
            </td>
            <td className="py-2.5 px-3 border border-slate-200">
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${gradeConfig.bg} ${gradeConfig.text}`}>
                {overallGrade}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Weight Rationale */}
      {weightingRationale && (
        <div className="bg-slate-100 rounded-lg p-4 mb-5">
          <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-1">
            Dynamic Weight Calibration
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {weightingRationale}
          </p>
        </div>
      )}

      {/* Methodology Summary */}
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">
        Analytical Methodology
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed mb-5">
        This Investment Risk Rating employs a proprietary analytical framework integrating Federal Reserve 
        economic indicators, regional market statistics, property-specific characteristics, and income 
        analysis metrics. The four risk dimensions are dynamically weighted based on property type and 
        market conditions. Scores are normalized using MSA benchmarks with z-score methodology.
      </p>

      {/* USPAP Disclosure */}
      <div className="border border-slate-200 rounded-lg p-4 text-xs text-slate-600 leading-relaxed">
        <h3 className="font-bold text-slate-700 mb-2">Professional Standards Compliance</h3>
        <p>
          This Investment Risk Rating is a supplementary analytical tool supporting the appraiser's 
          professional judgment. It does not replace the value conclusion or comprehensive analysis 
          contained elsewhere in this report. The rating reflects conditions as of the effective date 
          and complies with USPAP and applicable state regulations.
        </p>
      </div>

      {/* Generated Date Footer */}
      <div className="mt-4 text-xs text-slate-400 text-center">
        Rating generated: {new Date(generatedDate).toLocaleDateString()} | Proprietary Risk Analysis Framework
      </div>
    </ReportPageBase>
  );
};

export default RiskRatingPage;
