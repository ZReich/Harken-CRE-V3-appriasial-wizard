/**
 * Demographics Page Component
 * 
 * Displays neighborhood demographics data in a clean table format
 * for the appraisal report. Shows data for 1, 3, and 5 mile radii.
 * 
 * Features:
 * - Static radius ring map at top (for PDF embedding)
 * - Demographics data table with population, income, education, employment
 * - Employment by industry breakdown
 * - Data source attribution
 */

import React from 'react';
import type { RadiusDemographics } from '../../../../types/api';

interface DemographicsPageProps {
  data: RadiusDemographics[];
  source?: 'esri' | 'census' | 'mock' | string;
  asOfDate?: string;
  pageNumber?: number;
  // Map props
  latitude?: number;
  longitude?: number;
  mapImageUrl?: string;
  showMap?: boolean;
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
  latitude,
  longitude,
  mapImageUrl,
  showMap = true,
}) => {
  // Format source name for display
  const sourceDisplay = source === 'esri' 
    ? 'ESRI Demographics' 
    : source === 'census' 
      ? 'US Census Bureau ACS'
      : source;

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-1 w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto">
        <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
          NEIGHBORHOOD DEMOGRAPHICS
        </h1>
        <p className="text-sm text-slate-500 italic">No demographics data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-4">
        NEIGHBORHOOD DEMOGRAPHICS
      </h1>

      {/* Radius Ring Map */}
      {showMap && (mapImageUrl || (latitude && longitude)) && (
        <div className="mb-6">
          <div className="relative rounded-lg overflow-hidden border border-slate-200">
            {mapImageUrl ? (
              <img 
                src={mapImageUrl} 
                alt="Demographics radius map showing 1, 3, and 5 mile rings around subject property"
                className="w-full h-auto"
                style={{ maxHeight: '280px', objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-[280px] bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Map image not available</span>
              </div>
            )}
            
            {/* Map Legend Overlay */}
            <div className="absolute bottom-2 left-2 bg-surface-1/95 rounded px-3 py-1.5 text-xs shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border-2 border-[#0da1c7]" 
                       style={{ backgroundColor: 'rgba(13, 161, 199, 0.35)' }} />
                  <span className="text-slate-600">1 Mile</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border-2 border-[#0da1c7]" 
                       style={{ backgroundColor: 'rgba(13, 161, 199, 0.25)' }} />
                  <span className="text-slate-600">3 Miles</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border-2 border-[#0da1c7]" 
                       style={{ backgroundColor: 'rgba(13, 161, 199, 0.15)' }} />
                  <span className="text-slate-600">5 Miles</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-harken-error border-2 border-white" />
                  <span className="text-slate-600">Subject</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Demographics Table */}
      <table className="w-full text-sm border-collapse mb-6">
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
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-slate-200 text-xs uppercase tracking-wide">
              Population
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Current Population</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatPopulation(d.population.current)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">5-Year Projection</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-slate-200">
                {formatPopulation(d.population.projected5Year)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Annual Growth Rate</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-slate-200">
                <span className={d.population.annualGrowthRate >= 0 ? 'text-accent-teal-mint' : 'text-harken-error'}>
                  {d.population.annualGrowthRate >= 0 ? '+' : ''}{formatPercentage(d.population.annualGrowthRate)}
                </span>
              </td>
            ))}
          </tr>

          {/* Households Section */}
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-slate-200 text-xs uppercase tracking-wide">
              Households
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Total Households</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatPopulation(d.households.current)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Average Household Size</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-slate-200">
                {d.households.averageSize.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Income Section */}
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-slate-200 text-xs uppercase tracking-wide">
              Income
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Median Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatCurrency(d.income.medianHousehold)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Average Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-slate-200">
                {formatCurrency(d.income.averageHousehold)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Per Capita Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-slate-200">
                {formatCurrency(d.income.perCapita)}
              </td>
            ))}
          </tr>

          {/* Education Section */}
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-slate-200 text-xs uppercase tracking-wide">
              Education
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">College Graduates (Bachelor's+)</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-slate-200">
                {formatPercentage(d.education.percentCollegeGraduates)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Graduate Degree</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-slate-200">
                {formatPercentage(d.education.percentGraduateDegree)}
              </td>
            ))}
          </tr>

          {/* Employment Section */}
          {data[0]?.employment && (
            <>
              <tr className="bg-[#0da1c7]/10">
                <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-slate-200 text-xs uppercase tracking-wide">
                  Employment
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Labor Force</td>
                {data.map((d) => (
                  <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-slate-200">
                    {formatPopulation(d.employment?.laborForce || 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-3 text-slate-600 border border-slate-200 pl-6">Unemployment Rate</td>
                {data.map((d) => (
                  <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-slate-200">
                    {formatPercentage(d.employment?.unemploymentRate || 0)}
                  </td>
                ))}
              </tr>
            </>
          )}
        </tbody>
      </table>

      {/* Employment by Industry (if available) */}
      {data[data.length - 1]?.employmentByIndustry?.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mb-3 uppercase tracking-wide">
            Employment by Industry ({data[data.length - 1].radius}-Mile Radius)
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
            {data[data.length - 1].employmentByIndustry.slice(0, 10).map((industry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-slate-600">{industry.industry}</span>
                    <span className="text-xs font-medium text-slate-800">{formatPercentage(industry.percentage)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-[#0da1c7] rounded-full h-1.5"
                      style={{ width: `${Math.min(industry.percentage * 4, 100)}%` }}
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
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-2">
          <p>
            Source: {sourceDisplay}{asOfDate && ` (as of ${new Date(asOfDate).toLocaleDateString()})`}
          </p>
          {data[0]?.isApproximate && (
            <p className="text-accent-amber-gold italic">
              * Radius data approximated from county-level statistics
            </p>
          )}
        </div>
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
