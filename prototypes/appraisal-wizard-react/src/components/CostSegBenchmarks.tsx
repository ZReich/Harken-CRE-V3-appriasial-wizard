/**
 * Cost Seg Benchmarks Comparison
 * 
 * Compares user's allocations against industry benchmarks
 * for similar property types and sizes.
 */

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import type { CostSegBenchmark } from '../types';

interface CostSegBenchmarksProps {
  userAllocation: {
    fiveYear: number;
    fifteenYear: number;
    thirtyNineYear: number;
  };
  propertyType: string;
  buildingSize: number;
  qualityClass?: string;
}

// Industry benchmarks data
const BENCHMARKS: CostSegBenchmark[] = [
  {
    propertyType: 'office',
    buildingSizeCategory: '50K-150K SF',
    qualityClass: 'Class B',
    typicalRanges: { fiveYearMin: 18, fiveYearMax: 28, fifteenYearMin: 10, fifteenYearMax: 18, thirtyNineYearMin: 55, thirtyNineYearMax: 70 },
    source: 'CSSI Industry Study 2024',
  },
  {
    propertyType: 'office',
    buildingSizeCategory: '50K-150K SF',
    qualityClass: 'Class A',
    typicalRanges: { fiveYearMin: 22, fiveYearMax: 32, fifteenYearMin: 12, fifteenYearMax: 20, thirtyNineYearMin: 50, thirtyNineYearMax: 65 },
    source: 'CSSI Industry Study 2024',
    notes: 'High-end finishes increase personal property',
  },
  {
    propertyType: 'restaurant',
    buildingSizeCategory: '3K-10K SF',
    typicalRanges: { fiveYearMin: 30, fiveYearMax: 45, fifteenYearMin: 8, fifteenYearMax: 15, thirtyNineYearMin: 45, thirtyNineYearMax: 60 },
    source: 'CSSI Industry Study 2024',
    notes: 'Heavy kitchen equipment',
  },
  {
    propertyType: 'retail',
    buildingSizeCategory: '10K-50K SF',
    typicalRanges: { fiveYearMin: 20, fiveYearMax: 30, fifteenYearMin: 12, fifteenYearMax: 18, thirtyNineYearMin: 55, thirtyNineYearMax: 65 },
    source: 'CSSI Industry Study 2024',
  },
  {
    propertyType: 'warehouse',
    buildingSizeCategory: '50K-200K SF',
    typicalRanges: { fiveYearMin: 10, fiveYearMax: 18, fifteenYearMin: 15, fifteenYearMax: 22, thirtyNineYearMin: 65, thirtyNineYearMax: 75 },
    source: 'CSSI Industry Study 2024',
    notes: 'Lower personal property due to minimal finishes',
  },
];

function getBenchmark(propertyType: string, size: number, qualityClass?: string): CostSegBenchmark | null {
  const matches = BENCHMARKS.filter(b => b.propertyType.toLowerCase() === propertyType.toLowerCase());
  return matches.find(b => b.qualityClass === qualityClass) || matches[0] || null;
}

function getStatusColor(value: number, min: number, max: number): string {
  if (value >= min && value <= max) return 'emerald';
  if (value < min && value >= min - 5) return 'amber';
  if (value > max && value <= max + 5) return 'amber';
  return 'red';
}

export const CostSegBenchmarksPanel: React.FC<CostSegBenchmarksProps> = ({
  userAllocation,
  propertyType,
  buildingSize,
  qualityClass,
}) => {
  const benchmark = useMemo(() => getBenchmark(propertyType, buildingSize, qualityClass), [propertyType, buildingSize, qualityClass]);

  if (!benchmark) {
    return (
      <div className="bg-harken-gray-light border border-light-border rounded-xl p-4">
        <p className="text-sm text-harken-gray">No benchmark data available for {propertyType}</p>
      </div>
    );
  }

  const fiveYearStatus = getStatusColor(userAllocation.fiveYear, benchmark.typicalRanges.fiveYearMin, benchmark.typicalRanges.fiveYearMax);
  const fifteenYearStatus = getStatusColor(userAllocation.fifteenYear, benchmark.typicalRanges.fifteenYearMin, benchmark.typicalRanges.fifteenYearMax);
  const thirtyNineYearStatus = getStatusColor(userAllocation.thirtyNineYear, benchmark.typicalRanges.thirtyNineYearMin, benchmark.typicalRanges.thirtyNineYearMax);

  return (
    <div className="bg-surface-1 border-2 border-blue-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-blue-900">Industry Benchmarks</h3>
      </div>

      {/* Property Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p><strong>{propertyType}</strong> • {benchmark.buildingSizeCategory} {qualityClass && `• ${qualityClass}`}</p>
          <p className="text-blue-600 mt-1">Source: {benchmark.source}</p>
          {benchmark.notes && <p className="mt-1">{benchmark.notes}</p>}
        </div>
      </div>

      {/* Comparison Bars */}
      <div className="space-y-4">
        <AllocationBar
          label="5-Year Personal Property"
          userValue={userAllocation.fiveYear}
          minRange={benchmark.typicalRanges.fiveYearMin}
          maxRange={benchmark.typicalRanges.fiveYearMax}
          status={fiveYearStatus}
        />
        <AllocationBar
          label="15-Year Land Improvements"
          userValue={userAllocation.fifteenYear}
          minRange={benchmark.typicalRanges.fifteenYearMin}
          maxRange={benchmark.typicalRanges.fifteenYearMax}
          status={fifteenYearStatus}
        />
        <AllocationBar
          label="39-Year Real Property"
          userValue={userAllocation.thirtyNineYear}
          minRange={benchmark.typicalRanges.thirtyNineYearMin}
          maxRange={benchmark.typicalRanges.thirtyNineYearMax}
          status={thirtyNineYearStatus}
        />
      </div>
    </div>
  );
};

interface AllocationBarProps {
  label: string;
  userValue: number;
  minRange: number;
  maxRange: number;
  status: string;
}

const AllocationBar: React.FC<AllocationBarProps> = ({ label, userValue, minRange, maxRange, status }) => {
  const statusColors = {
    emerald: { bg: 'bg-accent-teal-mint', text: 'text-accent-teal-mint', border: 'border-accent-teal-mint' },
    amber: { bg: 'bg-accent-amber-gold', text: 'text-accent-amber-gold', border: 'border-accent-amber-gold/30' },
    red: { bg: 'bg-harken-error', text: 'text-harken-error', border: 'border-harken-error/30' },
  }[status] || { bg: 'bg-harken-gray-light0', text: 'text-harken-gray', border: 'border-light-border' }; // Fallback

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-harken-gray dark:text-slate-200">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${statusColors.text}`}>{userValue.toFixed(1)}%</span>
          <span className="text-xs text-harken-gray-med dark:text-slate-400">
            (typical: {minRange}-{maxRange}%)
          </span>
        </div>
      </div>
      <div className="relative h-6 bg-harken-gray-light rounded-full overflow-hidden">
        {/* Typical range indicator */}
        <div
          className="absolute h-full bg-blue-100"
          style={{
            left: `${minRange}%`,
            width: `${maxRange - minRange}%`,
          }}
        />
        {/* User value */}
        <div
          className={`absolute h-full ${statusColors.bg} opacity-70`}
          style={{ width: `${userValue}%` }}
        />
        {/* Marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-harken-dark"
          style={{ left: `${userValue}%` }}
        />
      </div>
    </div>
  );
};

export default CostSegBenchmarksPanel;
