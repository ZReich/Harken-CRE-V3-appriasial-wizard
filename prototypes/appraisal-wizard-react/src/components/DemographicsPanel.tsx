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

import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { ApiError } from '../services/api';
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
  const lat = Number(latitude);
  const lng = Number(longitude);

  // Memoize radii to prevent infinite re-render loops
  const radiiKey = radii?.join(',') || '';
  const normalizedRadii = useMemo(() => {
    const list = (radii?.length ? radii : [1, 3, 5])
      .map((r) => Number(r))
      .filter((r) => Number.isFinite(r) && r > 0);

    return list.length > 0 ? list : [1, 3, 5];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiiKey]);

  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const [data, setData] = useState<RadiusDemographics[] | null>(null);
  const [source, setSource] = useState<'esri' | 'census' | 'mock'>('census');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite');

  // Fetch demographics data - memoized to prevent re-creation each render
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDemographicsByRadius(lat, lng, normalizedRadii) as DemographicsResponse & { note?: string };
      
      if (response.success && response.data) {
        setData(response.data);
        setSource(response.source);
        onDataLoaded?.(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch demographics');
      }
    } catch (err) {
      // Prefer server-provided error details when available
      if (err instanceof ApiError) {
        const resp = err.response as any;
        const serverMessage =
          typeof resp === 'string'
            ? resp
            : resp?.error || resp?.message;

        setError(serverMessage ? String(serverMessage) : err.message);
      } else {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, radiiKey]);

  useEffect(() => {
    if (hasValidCoords) {
      fetchData();
    } else {
      setIsLoading(false);
      setError('Demographics requires a valid latitude/longitude.');
    }
  }, [hasValidCoords, fetchData]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-dark-border dark:border-dark-border p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading demographics data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-dark-border dark:border-dark-border p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-harken-error">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="ml-4 px-3 py-1 text-sm bg-accent-red-light hover:bg-accent-red-light rounded-lg transition-colors"
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
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-dark-border dark:border-dark-border overflow-hidden">
        <div className="px-4 py-3 border-b border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-harken-blue" />
            Demographics Map
          </h3>
        </div>
        <RadiusRingMap
          latitude={lat}
          longitude={lng}
          radii={normalizedRadii}
          mapType={mapType}
          onMapTypeChange={setMapType}
          height={350}
        />
      </div>

      {/* Data Table */}
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-dark-border dark:border-dark-border overflow-hidden">
        <div className="px-4 py-3 border-b border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-harken-blue" />
            Radius Demographics
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              source === 'esri' 
                ? 'bg-accent-teal-mint-light text-accent-teal-mint' 
                : 'bg-accent-amber-gold-light text-accent-amber-gold'
            }`}>
              {source === 'esri' ? 'ESRI (Precise)' : 'Census (Approx.)'}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2 dark:bg-elevation-2 border-b border-light-border dark:border-dark-border">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Metric</th>
                {normalizedRadii.map(radius => (
                  <th key={radius} className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">
                    {radius} Mile{radius !== 1 ? 's' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {/* Population Section */}
              <tr className="bg-surface-2 dark:bg-elevation-2/50">
                <td colSpan={normalizedRadii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Population
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Current Population</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800 dark:text-white">
                    {formatNumber(d.population.current)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">5-Year Projection</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {formatNumber(d.population.projected5Year)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Annual Growth Rate</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    <span className={d.population.annualGrowthRate >= 0 ? 'text-accent-teal-mint' : 'text-harken-error'}>
                      {d.population.annualGrowthRate >= 0 ? '+' : ''}{formatPercent(d.population.annualGrowthRate)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Households Section */}
              <tr className="bg-surface-2 dark:bg-elevation-2/50">
                <td colSpan={normalizedRadii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" />
                    Households
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Total Households</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800 dark:text-white">
                    {formatNumber(d.households.current)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Average Household Size</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {d.households.averageSize.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Income Section */}
              <tr className="bg-surface-2 dark:bg-elevation-2/50">
                <td colSpan={normalizedRadii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Income
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Median Household Income</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800 dark:text-white">
                    {formatCurrency(d.income.medianHousehold)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Average Household Income</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {formatCurrency(d.income.averageHousehold)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Per Capita Income</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {formatCurrency(d.income.perCapita)}
                  </td>
                ))}
              </tr>

              {/* Education Section */}
              <tr className="bg-surface-2 dark:bg-elevation-2/50">
                <td colSpan={normalizedRadii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Education
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">College Graduates (Bachelor's+)</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800 dark:text-white">
                    {formatPercent(d.education.percentCollegeGraduates)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Graduate Degree</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {formatPercent(d.education.percentGraduateDegree)}
                  </td>
                ))}
              </tr>

              {/* Employment Section */}
              <tr className="bg-surface-2 dark:bg-elevation-2/50">
                <td colSpan={normalizedRadii.length + 1} className="px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Employment
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Labor Force</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 font-medium text-slate-800 dark:text-white">
                    {formatNumber(d.employment?.laborForce || 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">Unemployment Rate</td>
                {data.map(d => (
                  <td key={d.radius} className="text-right px-4 py-2.5 text-slate-600 dark:text-slate-400">
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
        <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-dark-border dark:border-dark-border overflow-hidden">
          <div className="px-4 py-3 border-b border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-harken-blue" />
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
                      <span className="text-xs font-medium text-slate-800 dark:text-white">{formatPercent(item.percentage)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 dark:bg-elevation-subtle rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-harken-blue rounded-full transition-all"
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
