/**
 * DemographicsPanel Component
 * 
 * Displays radius-based demographics data with an interactive map.
 * Features:
 * - RadiusRingMap showing 1/3/5 mile rings
 * - Demographics data table with population, income, education, employment
 * - Employment by industry breakdown
 * - Data source indicator (ESRI vs Census)
 */

import { useEffect, useState } from 'react';
import { 
  Users, 
  Home, 
  DollarSign, 
  GraduationCap, 
  Briefcase,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Building2
} from 'lucide-react';
import { RadiusRingMap } from './RadiusRingMap';
import { getDemographicsByRadius } from '../services/demographicsService';
import type { RadiusDemographics, DemographicsResponse } from '../types/api';

// =================================================================
// TYPES
// =================================================================

interface DemographicsPanelProps {
  latitude: number;
  longitude: number;
  radii?: number[];
  onDataLoaded?: (data: RadiusDemographics[]) => void;
  className?: string;
}

// =================================================================
// FORMATTERS
// =================================================================

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// =================================================================
// COMPONENT
// =================================================================

export function DemographicsPanel({
  latitude,
  longitude,
  radii = [1, 3, 5],
  onDataLoaded,
  className = '',
}: DemographicsPanelProps) {
  const [data, setData] = useState<RadiusDemographics[] | null>(null);
  const [source, setSource] = useState<'esri' | 'census' | 'mock'>('census');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite');

  // Fetch demographics data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDemographicsByRadius(latitude, longitude, radii) as DemographicsResponse & { note?: string };
      
      if (response.success && response.data) {
        setData(response.data);
        setSource(response.source);
        onDataLoaded?.(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch demographics');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchData();
    }
  }, [latitude, longitude, radii.join(',')]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading demographics data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="ml-4 px-3 py-1 text-sm bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0da1c7]" />
            Demographics Map
          </h3>
        </div>
        <RadiusRingMap
          latitude={latitude}
          longitude={longitude}
          radii={radii}
          mapType={mapType}
          onMapTypeChange={setMapType}
          height={350}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0da1c7]" />
            Radius Demographics
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              source === 'esri' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {source === 'esri' ? 'ESRI (Precise)' : 'Census (Approx.)'}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Metric</th>
                {radii.map(radius => (
                  <th key={radius} className="text-right px-4 py-3 font-semibold text-slate-600">
                    {radius} Mile{radius !== 1 ? 's' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Population Section */}
              <tr className="bg-slate-50/50">
                <td colSpan={radii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Population
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Current Population</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800">
                    {formatNumber(d.population.current)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">5-Year Projection</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600">
                    {formatNumber(d.population.projected5Year)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Annual Growth Rate</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600">
                    <span className={d.population.annualGrowthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {d.population.annualGrowthRate >= 0 ? '+' : ''}{formatPercent(d.population.annualGrowthRate)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Households Section */}
              <tr className="bg-slate-50/50">
                <td colSpan={radii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" />
                    Households
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Total Households</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800">
                    {formatNumber(d.households.current)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Average Household Size</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600">
                    {d.households.averageSize.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Income Section */}
              <tr className="bg-slate-50/50">
                <td colSpan={radii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Income
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Median Household Income</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800">
                    {formatCurrency(d.income.medianHousehold)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Average Household Income</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600">
                    {formatCurrency(d.income.averageHousehold)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Per Capita Income</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600">
                    {formatCurrency(d.income.perCapita)}
                  </td>
                ))}
              </tr>

              {/* Education Section */}
              <tr className="bg-slate-50/50">
                <td colSpan={radii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Education
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">College Graduates (Bachelor's+)</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800">
                    {formatPercent(d.education.percentCollegeGraduates)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Graduate Degree</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600">
                    {formatPercent(d.education.percentGraduateDegree)}
                  </td>
                ))}
              </tr>

              {/* Employment Section */}
              <tr className="bg-slate-50/50">
                <td colSpan={radii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Employment
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Labor Force</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800">
                    {formatNumber(d.employment?.laborForce || 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700">Unemployment Rate</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600">
                    {formatPercent(d.employment?.unemploymentRate || 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Employment by Industry */}
      {data[0]?.employmentByIndustry && data[0].employmentByIndustry.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0da1c7]" />
              Employment by Industry (1-Mile Radius)
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {data[0].employmentByIndustry.slice(0, 10).map((item, index) => (
                <div key={item.industry} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 truncate pr-2">{item.industry}</span>
                      <span className="text-xs font-medium text-slate-800">{formatPercent(item.percentage)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0da1c7] rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(item.percentage * 4, 100)}%`,
                          opacity: 1 - (index * 0.05)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Source Note */}
      {data[0]?.isApproximate && (
        <div className="text-xs text-slate-500 flex items-start gap-2 px-1">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Radius demographics are approximated from county-level Census data. 
            For precise radius data, configure ESRI GeoEnrichment API.
          </span>
        </div>
      )}
    </div>
  );
}

export default DemographicsPanel;
