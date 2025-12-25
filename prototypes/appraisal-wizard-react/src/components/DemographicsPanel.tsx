/**
 * Demographics Panel Component
 * 
 * Displays demographic data for multiple radius rings (1, 3, 5 miles).
 * Features a clean table layout matching the existing design system.
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  Home, 
  DollarSign, 
  GraduationCap,
  Briefcase,
  Loader2,
  AlertCircle,
  RefreshCw,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { getDemographicsByRadius, formatPopulation, formatCurrency, formatPercentage } from '../services/demographicsService';
import type { RadiusDemographics, DemographicsResponse } from '../types/api';

interface DemographicsPanelProps {
  latitude?: number;
  longitude?: number;
  className?: string;
  onDataLoaded?: (data: RadiusDemographics[]) => void;
}

export function DemographicsPanel({ 
  latitude, 
  longitude, 
  className = '',
  onDataLoaded 
}: DemographicsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RadiusDemographics[] | null>(null);
  const [source, setSource] = useState<string>('');
  const [asOfDate, setAsOfDate] = useState<string>('');

  const fetchData = async () => {
    if (!latitude || !longitude) {
      setError('Location coordinates are required to fetch demographics data.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: DemographicsResponse = await getDemographicsByRadius(latitude, longitude);
      
      if (response.success && response.data) {
        setData(response.data);
        setSource(response.source);
        setAsOfDate(response.asOfDate);
        onDataLoaded?.(response.data);
      } else {
        setError(response.error || 'Failed to fetch demographics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 text-[#0da1c7] animate-spin" />
          <span className="text-slate-600">Loading demographics data...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        {latitude && longitude && (
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  // Render no coordinates state
  if (!latitude || !longitude) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-amber-600 mb-2">
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Location Required</span>
        </div>
        <p className="text-sm text-slate-500">
          Enter the property address to load demographic data for the surrounding area.
        </p>
      </div>
    );
  }

  // Render data state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <p className="text-slate-500">No demographics data available.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Demographics Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0da1c7]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Neighborhood Demographics</h3>
              <p className="text-xs text-slate-500">Population, income, and education data by radius</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Source</span>
            <p className="text-sm font-medium text-slate-600 capitalize">{source}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Metric
                </th>
                {data.map((d) => (
                  <th key={d.radius} className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {d.radius} Mile{d.radius > 1 ? 's' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Population Section */}
              <tr className="bg-blue-50/30">
                <td colSpan={data.length + 1} className="px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users className="w-4 h-4 text-blue-600" />
                    Population
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Current Population</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center font-medium text-slate-800">
                    {formatPopulation(d.population.current)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">5-Year Projection</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center text-slate-600">
                    {formatPopulation(d.population.projected5Year)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Annual Growth Rate</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center">
                    <span className={`inline-flex items-center gap-1 ${d.population.annualGrowthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      <TrendingUp className={`w-3 h-3 ${d.population.annualGrowthRate < 0 ? 'rotate-180' : ''}`} />
                      {formatPercentage(d.population.annualGrowthRate)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Households Section */}
              <tr className="bg-emerald-50/30">
                <td colSpan={data.length + 1} className="px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Home className="w-4 h-4 text-emerald-600" />
                    Households
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Total Households</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center font-medium text-slate-800">
                    {formatPopulation(d.households.current)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Average Household Size</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center text-slate-600">
                    {d.households.averageSize.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Income Section */}
              <tr className="bg-amber-50/30">
                <td colSpan={data.length + 1} className="px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    Income
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Median Household Income</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center font-medium text-slate-800">
                    {formatCurrency(d.income.medianHousehold)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Average Household Income</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center text-slate-600">
                    {formatCurrency(d.income.averageHousehold)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Per Capita Income</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center text-slate-600">
                    {formatCurrency(d.income.perCapita)}
                  </td>
                ))}
              </tr>

              {/* Education Section */}
              <tr className="bg-purple-50/30">
                <td colSpan={data.length + 1} className="px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    Education
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">College Graduates</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center font-medium text-slate-800">
                    {formatPercentage(d.education.percentCollegeGraduates)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600 pl-8">Graduate Degree</td>
                {data.map((d) => (
                  <td key={d.radius} className="px-4 py-3 text-sm text-center text-slate-600">
                    {formatPercentage(d.education.percentGraduateDegree)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Source: {source === 'census' ? 'US Census Bureau ACS' : source === 'esri' ? 'ESRI GeoEnrichment' : 'Simulated Data'} 
            {asOfDate && ` • As of ${new Date(asOfDate).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {/* Employment by Industry - Only show if data exists */}
      {data[0]?.employmentByIndustry && data[0].employmentByIndustry.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0da1c7]/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-[#0da1c7]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Employment by Industry</h3>
                <p className="text-xs text-slate-500">Distribution of employed population (5-mile radius)</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {data[data.length - 1].employmentByIndustry.map((industry, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-40 text-sm text-slate-600 truncate">{industry.industry}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0da1c7] to-[#0da1c7]/70 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(industry.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="w-14 text-sm font-medium text-slate-700 text-right">
                    {formatPercentage(industry.percentage)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemographicsPanel;

