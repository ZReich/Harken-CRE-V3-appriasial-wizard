/**
 * Demographics Page Components
 * 
 * Split into 2 pages for optimal presentation:
 * - Page 1 (Overview): Large radius ring map + key demographic highlights
 * - Page 2 (Detail): Comprehensive data tables with population, income, education, employment
 * 
 * Features:
 * - Static radius ring map (auto-captured from wizard or via Static Maps API)
 * - Key Demographic Highlights as metric cards
 * - Demographics data tables organized by category
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

/**
 * Page 1: Demographics Overview
 * Features large map and key metric cards
 */
export const DemographicsOverviewPage: React.FC<DemographicsPageProps> = ({
  data,
  source = 'US Census Bureau',
  asOfDate,
  pageNumber,
  latitude,
  longitude,
  mapImageUrl,
  showMap = true,
}) => {
  const sourceDisplay = source === 'esri' 
    ? 'ESRI Demographics' 
    : source === 'census' 
      ? 'US Census Bureau ACS'
      : source;

  // Generate static map URL - larger size for the overview page
  const staticMapUrl = React.useMemo(() => {
    if (mapImageUrl) return mapImageUrl;
    if (latitude && longitude) {
      return generateStaticMapUrl(latitude, longitude, {
        width: 800,
        height: 500,
        zoom: 11,
        mapType: 'hybrid',
      });
    }
    return null;
  }, [latitude, longitude, mapImageUrl]);

  // Extract key metrics from data (use 3-mile radius as primary)
  const primaryRadius = data?.find(d => d.radius === 3) || data?.[1] || data?.[0];
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-5">
        NEIGHBORHOOD DEMOGRAPHICS
      </h1>

      {/* Large Map Section */}
      {showMap && staticMapUrl && (
        <div className="relative mb-5">
          <div className="rounded-lg overflow-hidden border border-slate-200 shadow-md">
            <img 
              src={staticMapUrl} 
              alt="Demographics radius map showing 1, 3, and 5 mile rings around subject property"
              className="w-full"
              style={{ height: '380px', objectFit: 'cover' }}
            />
          </div>
          
          {/* Map Legend - Below Map */}
          <div className="flex items-center justify-center gap-6 mt-3 py-2 px-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" 
                   style={{ backgroundColor: 'rgba(47, 196, 178, 0.4)', border: '2px solid #059669' }} />
              <span className="text-sm font-medium text-slate-700">1 Mile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" 
                   style={{ backgroundColor: 'rgba(59, 130, 246, 0.35)', border: '2px solid #2563eb' }} />
              <span className="text-sm font-medium text-slate-700">3 Miles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" 
                   style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)', border: '2px solid #7c3aed' }} />
              <span className="text-sm font-medium text-slate-700">5 Miles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow" />
              <span className="text-sm font-medium text-slate-700">Subject</span>
            </div>
          </div>
        </div>
      )}

      {/* No map fallback */}
      {showMap && !staticMapUrl && (
        <div className="h-[200px] bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center mb-5">
          <div className="text-center text-slate-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Map requires property coordinates</p>
          </div>
        </div>
      )}

      {/* Key Demographic Highlights - 5 Cards */}
      {hasData && primaryRadius && (
        <>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0da1c7]" />
            Key Demographic Highlights
            <span className="text-xs font-normal text-slate-500 ml-auto">Based on 3-Mile Radius</span>
          </h2>
          
          <div className="grid grid-cols-5 gap-3 mb-6">
            {/* Population */}
            <div className="bg-gradient-to-br from-teal-50 to-white rounded-lg p-4 border border-teal-200 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-teal-700 uppercase">Population</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {formatCompact(primaryRadius.population.current)}
              </div>
              <div className="flex items-center justify-center gap-1">
                {primaryRadius.population.annualGrowthRate >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  primaryRadius.population.annualGrowthRate >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {primaryRadius.population.annualGrowthRate >= 0 ? '+' : ''}
                  {formatPercentage(primaryRadius.population.annualGrowthRate)}/yr
                </span>
              </div>
            </div>

            {/* Median Income */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase">Median Income</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {formatCurrency(primaryRadius.income.medianHousehold)}
              </div>
              <div className="text-xs text-slate-500">
                Per capita: {formatCurrency(primaryRadius.income.perCapita)}
              </div>
            </div>

            {/* Households */}
            <div className="bg-gradient-to-br from-violet-50 to-white rounded-lg p-4 border border-violet-200 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Home className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-semibold text-violet-700 uppercase">Households</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {formatCompact(primaryRadius.households.current)}
              </div>
              <div className="text-xs text-slate-500">
                Avg size: {primaryRadius.households.averageSize.toFixed(1)}
              </div>
            </div>

            {/* Education */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4 border border-amber-200 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 uppercase">College Grads</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {formatPercentage(primaryRadius.education.percentCollegeGraduates)}
              </div>
              <div className="text-xs text-slate-500">
                Graduate+: {formatPercentage(primaryRadius.education.percentGraduateDegree)}
              </div>
            </div>

            {/* Employment */}
            <div className="bg-gradient-to-br from-cyan-50 to-white rounded-lg p-4 border border-cyan-200 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Briefcase className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-semibold text-cyan-700 uppercase">Unemployment</span>
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                (primaryRadius.employment?.unemploymentRate || 0) < 5 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {formatPercentage(primaryRadius.employment?.unemploymentRate || 0)}
              </div>
              <div className="text-xs text-slate-500">
                Labor force: {formatCompact(primaryRadius.employment?.laborForce || 0)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* No data message */}
      {!hasData && (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-500 italic">
            No demographics data available. Visit the Subject Data section to load demographics.
          </p>
        </div>
      )}

      {/* Source Attribution */}
      <div className="absolute bottom-[1in] left-[1in] right-[1in]">
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-2">
          <p>
            Source: {sourceDisplay}{asOfDate && ` (as of ${new Date(asOfDate).toLocaleDateString()})`}
          </p>
          {data?.[0]?.isApproximate && (
            <p className="text-amber-600 italic">
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


/**
 * Page 2: Demographics Detail Tables
 * Features comprehensive data tables with all metrics
 */
export const DemographicsDetailPage: React.FC<DemographicsPageProps> = ({
  data,
  source = 'US Census Bureau',
  asOfDate,
  pageNumber,
}) => {
  const sourceDisplay = source === 'esri' 
    ? 'ESRI Demographics' 
    : source === 'census' 
      ? 'US Census Bureau ACS'
      : source;

  if (!data || data.length === 0) {
    return null; // Don't render detail page without data
  }

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-5">
        NEIGHBORHOOD DEMOGRAPHICS - DETAIL
      </h1>

      {/* Main Demographics Table */}
      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left py-2.5 px-4 font-semibold text-slate-700 border border-slate-200">
              Metric
            </th>
            {data.map((d) => (
              <th 
                key={d.radius} 
                className="text-center py-2.5 px-4 font-semibold text-slate-700 border border-slate-200 w-[120px]"
              >
                {d.radius} Mile{d.radius > 1 ? 's' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Population Section */}
          <tr className="bg-teal-50">
            <td colSpan={data.length + 1} className="py-2 px-4 font-bold text-teal-800 border border-slate-200 text-xs uppercase tracking-wider">
              Population
            </td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Current Population</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center font-semibold text-slate-800 border border-slate-200">
                {formatPopulation(d.population.current)}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">5-Year Projection</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center text-slate-700 border border-slate-200">
                {formatPopulation(d.population.projected5Year)}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Annual Growth Rate</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center border border-slate-200">
                <span className={`font-medium ${d.population.annualGrowthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {d.population.annualGrowthRate >= 0 ? '+' : ''}{formatPercentage(d.population.annualGrowthRate)}
                </span>
              </td>
            ))}
          </tr>

          {/* Households Section */}
          <tr className="bg-violet-50">
            <td colSpan={data.length + 1} className="py-2 px-4 font-bold text-violet-800 border border-slate-200 text-xs uppercase tracking-wider">
              Households
            </td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Total Households</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center font-semibold text-slate-800 border border-slate-200">
                {formatPopulation(d.households.current)}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Average Household Size</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center text-slate-700 border border-slate-200">
                {d.households.averageSize.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Income Section */}
          <tr className="bg-blue-50">
            <td colSpan={data.length + 1} className="py-2 px-4 font-bold text-blue-800 border border-slate-200 text-xs uppercase tracking-wider">
              Income
            </td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Median Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center font-semibold text-slate-800 border border-slate-200">
                {formatCurrency(d.income.medianHousehold)}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Average Household Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center text-slate-700 border border-slate-200">
                {formatCurrency(d.income.averageHousehold)}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Per Capita Income</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center text-slate-700 border border-slate-200">
                {formatCurrency(d.income.perCapita)}
              </td>
            ))}
          </tr>

          {/* Education Section */}
          <tr className="bg-amber-50">
            <td colSpan={data.length + 1} className="py-2 px-4 font-bold text-amber-800 border border-slate-200 text-xs uppercase tracking-wider">
              Education
            </td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">College Graduates (Bachelor's+)</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center font-semibold text-slate-800 border border-slate-200">
                {formatPercentage(d.education.percentCollegeGraduates)}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Graduate Degree</td>
            {data.map((d) => (
              <td key={d.radius} className="py-2 px-4 text-center text-slate-700 border border-slate-200">
                {formatPercentage(d.education.percentGraduateDegree)}
              </td>
            ))}
          </tr>

          {/* Employment Section */}
          {data[0]?.employment && (
            <>
              <tr className="bg-cyan-50">
                <td colSpan={data.length + 1} className="py-2 px-4 font-bold text-cyan-800 border border-slate-200 text-xs uppercase tracking-wider">
                  Employment
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Labor Force</td>
                {data.map((d) => (
                  <td key={d.radius} className="py-2 px-4 text-center font-semibold text-slate-800 border border-slate-200">
                    {formatPopulation(d.employment?.laborForce || 0)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-4 text-slate-700 border border-slate-200 pl-6">Unemployment Rate</td>
                {data.map((d) => (
                  <td key={d.radius} className="py-2 px-4 text-center border border-slate-200">
                    <span className={`font-medium ${(d.employment?.unemploymentRate || 0) < 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatPercentage(d.employment?.unemploymentRate || 0)}
                    </span>
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
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">
            Employment by Industry ({data[data.length - 1].radius}-Mile Radius)
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {data[data.length - 1].employmentByIndustry.slice(0, 12).map((industry, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-700">{industry.industry}</span>
                    <span className="text-xs font-semibold text-slate-800">{formatPercentage(industry.percentage)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#0da1c7] to-[#0da1c7]/70 rounded-full h-2 transition-all"
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
            <p className="text-amber-600 italic">
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


/**
 * Legacy single-page component (deprecated, kept for backwards compatibility)
 * Renders overview page only
 */
export const DemographicsPage: React.FC<DemographicsPageProps> = (props) => {
  return <DemographicsOverviewPage {...props} />;
};

export default DemographicsPage;
