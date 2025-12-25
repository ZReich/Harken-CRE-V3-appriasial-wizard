/**
 * Demographics Page Component
 * 
 * Displays neighborhood demographics data in a clean table format
 * for the appraisal report. Shows data for 1, 3, and 5 mile radii.
 */

import React from 'react';
import type { RadiusDemographics } from '../../../../types/api';

interface DemographicsPageProps {
  data: RadiusDemographics[];
  source?: string;
  asOfDate?: string;
  pageNumber?: number;
}

// Formatting helpers
const formatPopulation = (value: number) => value.toLocaleString('en-US');
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

export const DemographicsPage: React.FC<DemographicsPageProps> = ({
  data,
  source = 'US Census Bureau',
  asOfDate,
  pageNumber,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto">
        <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
          NEIGHBORHOOD DEMOGRAPHICS
        </h1>
        <p className="text-sm text-slate-500 italic">No demographics data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
        NEIGHBORHOOD DEMOGRAPHICS
      </h1>

      {/* Main Demographics Table */}
      <table className="w-full text-sm border-collapse mb-8">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left py-2 px-3 font-semibold text-slate-700 border border-slate-200">
              Metric
            </th>
            {data.map((d) => (
              <th 
                key={d.radius} 
                className="text-center py-2 px-3 font-semibold text-slate-700 border border-slate-200"
              >
                {d.radius} Mile{d.radius > 1 ? 's' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Population Section */}
          <tr className="bg-blue-50">
            <td colSpan={data.length + 1} className="py-2 px-3 font-semibold text-slate-700 border border-slate-200">
              Population
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Current Population</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatPopulation(d.population.current)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">5-Year Projection</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center text-slate-700 border border-slate-200">
                {formatPopulation(d.population.projected5Year)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Annual Growth Rate</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center text-slate-700 border border-slate-200">
                {formatPercentage(d.population.annualGrowthRate)}
              </td>
            ))}
          </tr>

          {/* Households Section */}
          <tr className="bg-emerald-50">
            <td colSpan={data.length + 1} className="py-2 px-3 font-semibold text-slate-700 border border-slate-200">
              Households
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Total Households</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatPopulation(d.households.current)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Average Household Size</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center text-slate-700 border border-slate-200">
                {d.households.averageSize.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Income Section */}
          <tr className="bg-amber-50">
            <td colSpan={data.length + 1} className="py-2 px-3 font-semibold text-slate-700 border border-slate-200">
              Income
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Median Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatCurrency(d.income.medianHousehold)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Average Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center text-slate-700 border border-slate-200">
                {formatCurrency(d.income.averageHousehold)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Per Capita Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center text-slate-700 border border-slate-200">
                {formatCurrency(d.income.perCapita)}
              </td>
            ))}
          </tr>

          {/* Education Section */}
          <tr className="bg-purple-50">
            <td colSpan={data.length + 1} className="py-2 px-3 font-semibold text-slate-700 border border-slate-200">
              Education
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">College Graduates (Bachelor's+)</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatPercentage(d.education.percentCollegeGraduates)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-2 px-3 text-slate-600 border border-slate-200 pl-6">Graduate Degree</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-3 text-center text-slate-700 border border-slate-200">
                {formatPercentage(d.education.percentGraduateDegree)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Employment by Industry (if available) */}
      {data[data.length - 1]?.employmentByIndustry?.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">
            Employment by Industry (5-Mile Radius)
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {data[data.length - 1].employmentByIndustry.map((industry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{industry.industry}</span>
                    <span className="text-sm font-medium text-slate-800">{formatPercentage(industry.percentage)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-[#0da1c7] rounded-full h-2"
                      style={{ width: `${Math.min(industry.percentage * 3, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Source Attribution */}
      <div className="absolute bottom-[1in] left-[1in] right-[1in]">
        <p className="text-xs text-slate-500">
          Source: {source}{asOfDate && ` (as of ${new Date(asOfDate).toLocaleDateString()})`}
        </p>
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

export default DemographicsPage;

