/**
 * Demographics Page Component
 * 
 * Displays neighborhood demographics data in a professional report format.
 * Features a side-by-side layout with radius ring map and key demographic highlights,
 * followed by detailed data tables.
 * 
 * Features:
 * - Static radius ring map (auto-captured from wizard or via Static Maps API)
 * - Key Demographic Highlights panel alongside map
 * - Demographics data table with population, income, education, employment
 * - Employment by industry breakdown
 * - Data source attribution
 */

import React from 'react';
import { Users, Home, DollarSign, GraduationCap, Briefcase, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import type { RadiusDemographics } from '../../../../types/api';
import { generateStaticMapUrl } from '../../../../utils/mapCapture';

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
const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
};


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

  // Generate static map URL if we have coordinates but no image
  const staticMapUrl = React.useMemo(() => {
    if (mapImageUrl) return mapImageUrl;
    if (latitude && longitude) {
      return generateStaticMapUrl(latitude, longitude, {
        width: 640,
        height: 400,
        zoom: 11,
        mapType: 'hybrid',
      });
    }
    return null;
  }, [latitude, longitude, mapImageUrl]);

  // Extract key metrics from data (use 3-mile radius as primary)
  const primaryRadius = data?.find(d => d.radius === 3) || data?.[1] || data?.[0];

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
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-4">
        NEIGHBORHOOD DEMOGRAPHICS
      </h1>

      {/* Side-by-Side: Map + Key Highlights */}
      {showMap && staticMapUrl && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Left: Radius Ring Map */}
          <div className="relative">
            <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img 
                src={staticMapUrl} 
                alt="Demographics radius map showing 1, 3, and 5 mile rings around subject property"
                className="w-full h-auto"
                style={{ height: '260px', objectFit: 'cover' }}
              />
              
              {/* Map Legend Overlay */}
              <div className="absolute bottom-2 left-2 bg-white/95 rounded px-2.5 py-1.5 text-[10px] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" 
                         style={{ backgroundColor: '#2fc4b2', border: '1.5px solid #059669' }} />
                    <span className="text-slate-600">1 Mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" 
                         style={{ backgroundColor: '#3b82f6', border: '1.5px solid #2563eb' }} />
                    <span className="text-slate-600">3 Mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" 
                         style={{ backgroundColor: '#8b5cf6', border: '1.5px solid #7c3aed' }} />
                    <span className="text-slate-600">5 Mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
                    <span className="text-slate-600">Subject</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Key Demographic Highlights */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0da1c7]" />
              Key Demographic Highlights
            </h2>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Population */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-[#2fc4b2]" />
                  <span className="text-[10px] font-medium text-slate-500 uppercase">Population</span>
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {formatCompact(primaryRadius?.population.current || 0)}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {(primaryRadius?.population.annualGrowthRate || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-[10px] font-medium ${
                    (primaryRadius?.population.annualGrowthRate || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {(primaryRadius?.population.annualGrowthRate || 0) >= 0 ? '+' : ''}
                    {formatPercentage(primaryRadius?.population.annualGrowthRate || 0)}/yr
                  </span>
                </div>
              </div>

              {/* Median Income */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span className="text-[10px] font-medium text-slate-500 uppercase">Median Income</span>
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {formatCurrency(primaryRadius?.income.medianHousehold || 0)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Per capita: {formatCurrency(primaryRadius?.income.perCapita || 0)}
                </div>
              </div>

              {/* Households */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Home className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span className="text-[10px] font-medium text-slate-500 uppercase">Households</span>
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {formatCompact(primaryRadius?.households.current || 0)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Avg size: {primaryRadius?.households.averageSize.toFixed(1)}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-medium text-slate-500 uppercase">College Grads</span>
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {formatPercentage(primaryRadius?.education.percentCollegeGraduates || 0)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Graduate+: {formatPercentage(primaryRadius?.education.percentGraduateDegree || 0)}
                </div>
              </div>

              {/* Employment Rate - Full Width */}
              {primaryRadius?.employment && (
                <div className="col-span-2 bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#0da1c7]" />
                      <span className="text-[10px] font-medium text-slate-500 uppercase">Employment</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-slate-800">
                          {formatCompact(primaryRadius.employment.laborForce)}
                        </div>
                        <div className="text-[9px] text-slate-500">Labor Force</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-bold ${
                          primaryRadius.employment.unemploymentRate < 5 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {formatPercentage(primaryRadius.employment.unemploymentRate)}
                        </div>
                        <div className="text-[9px] text-slate-500">Unemployment</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3-Mile Radius Indicator */}
            <div className="mt-2 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                Based on 3-mile radius analysis
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Demographics Table */}
      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="bg-surface-3">
            <th className="text-left py-2 px-3 font-semibold text-slate-700 border border-light-border">
              Metric
            </th>
            {data.map((d) => (
              <th 
                key={d.radius} 
                className="text-center py-2 px-3 font-semibold text-slate-700 border border-light-border"
              >
                {d.radius} Mile{d.radius > 1 ? 's' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Population Section */}
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-light-border text-xs uppercase tracking-wide">
              Population
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Current Population</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-light-border">
                {formatPopulation(d.population.current)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">5-Year Projection</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-light-border">
                {formatPopulation(d.population.projected5Year)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Annual Growth Rate</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-light-border">
                <span className={d.population.annualGrowthRate >= 0 ? 'text-accent-teal-mint' : 'text-harken-error'}>
                  {d.population.annualGrowthRate >= 0 ? '+' : ''}{formatPercentage(d.population.annualGrowthRate)}
                </span>
              </td>
            ))}
          </tr>

          {/* Households Section */}
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-light-border text-xs uppercase tracking-wide">
              Households
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Total Households</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-light-border">
                {formatPopulation(d.households.current)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Average Household Size</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-light-border">
                {d.households.averageSize.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Income Section */}
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-light-border text-xs uppercase tracking-wide">
              Income
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Median Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-light-border">
                {formatCurrency(d.income.medianHousehold)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Average Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-light-border">
                {formatCurrency(d.income.averageHousehold)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Per Capita Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-light-border">
                {formatCurrency(d.income.perCapita)}
              </td>
            ))}
          </tr>

          {/* Education Section */}
          <tr className="bg-[#0da1c7]/10">
            <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-light-border text-xs uppercase tracking-wide">
              Education
            </td>
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">College Graduates (Bachelor's+)</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-light-border">
                {formatPercentage(d.education.percentCollegeGraduates)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Graduate Degree</td>
            {data.map((d) => (
              <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-light-border">
                {formatPercentage(d.education.percentGraduateDegree)}
              </td>
            ))}
          </tr>

          {/* Employment Section */}
          {data[0]?.employment && (
            <>
              <tr className="bg-[#0da1c7]/10">
                <td colSpan={data.length + 1} className="py-1.5 px-3 font-semibold text-slate-700 border border-light-border text-xs uppercase tracking-wide">
                  Employment
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Labor Force</td>
                {data.map((d) => (
                  <td key={d.radius} className="py-1.5 px-3 text-center font-medium text-slate-800 border border-light-border">
                    {formatPopulation(d.employment?.laborForce || 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-3 text-slate-600 border border-light-border pl-6">Unemployment Rate</td>
                {data.map((d) => (
                  <td key={d.radius} className="py-1.5 px-3 text-center text-slate-700 border border-light-border">
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
          <h2 className="text-sm font-semibold text-slate-800 border-b border-border-muted pb-1 mb-3 uppercase tracking-wide">
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
                  <div className="w-full bg-surface-4 rounded-full h-1.5">
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
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-light-border pt-2">
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
