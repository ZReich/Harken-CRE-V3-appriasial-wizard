/**
 * TrafficDataCard Component
 * 
 * Displays traffic count data with road classification selector.
 * Integrates with MDOT or similar traffic data sources.
 */

import React, { useState } from 'react';
import {
  Car,
  TrendingUp,
  RefreshCw,
  MapPin,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Route,
  ArrowRight,
} from 'lucide-react';
import ButtonSelector from './ButtonSelector';
import EnhancedTextArea from './EnhancedTextArea';

interface TrafficDataEntry {
  roadName: string;
  roadClass: string;
  annualAverageDailyTraffic: number;
  truckPercentage?: number;
  speedLimit?: number;
  lanesCount?: number;
  distance?: string;
  direction?: string;
  year?: number;
}

interface TrafficDataCardProps {
  /** Nearest roads with traffic data */
  trafficData: TrafficDataEntry[];
  onTrafficDataChange?: (data: TrafficDataEntry[]) => void;

  /** Selected road class filter */
  selectedRoadClass: string;
  onRoadClassChange: (value: string) => void;

  /** Traffic notes */
  trafficNotes: string;
  onTrafficNotesChange: (value: string) => void;

  /** Data refresh callback */
  onRefresh?: () => void;
  isRefreshing?: boolean;

  /** Whether data is from an external source */
  dataSource?: 'mdot' | 'cotality' | 'manual' | 'mock' | null;
  lastUpdated?: string;
}

const ROAD_CLASS_OPTIONS = [
  { value: 'all', label: 'All Roads' },
  { value: 'highway', label: 'Highway' },
  { value: 'arterial', label: 'Arterial' },
  { value: 'collector', label: 'Collector' },
  { value: 'local', label: 'Local' },
];

const ROAD_CLASS_COLORS: Record<string, string> = {
  highway: 'bg-accent-red-light text-harken-error border-harken-error/30',
  arterial: 'bg-orange-100 text-orange-700 border-orange-300',
  collector: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  local: 'bg-green-100 text-green-700 border-green-300',
};

function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Traffic data row display
 */
function TrafficRow({ entry, onEdit }: { entry: TrafficDataEntry; onEdit?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const roadClassColor = ROAD_CLASS_COLORS[entry.roadClass.toLowerCase()] || 'bg-harken-gray-light text-harken-dark border-light-border';

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-slate-800 dark:text-white">{entry.roadName}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roadClassColor}`}>
              {entry.roadClass}
            </span>
          </div>
          {entry.distance && (
            <span className="text-[10px] text-slate-400">{entry.distance}</span>
          )}
        </div>

        <div className="text-right">
          <div className="font-bold text-[#1c3643] dark:text-white">
            {formatNumber(entry.annualAverageDailyTraffic)}
          </div>
          <div className="text-[10px] text-slate-400">AADT</div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 dark:bg-elevation-1/50 dark:border-dark-border">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {entry.truckPercentage !== undefined && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Truck Traffic:</span>
                <span className="ml-1 font-medium">{entry.truckPercentage}%</span>
              </div>
            )}
            {entry.speedLimit !== undefined && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Speed Limit:</span>
                <span className="ml-1 font-medium">{entry.speedLimit} mph</span>
              </div>
            )}
            {entry.lanesCount !== undefined && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Lanes:</span>
                <span className="ml-1 font-medium">{entry.lanesCount}</span>
              </div>
            )}
            {entry.year && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Data Year:</span>
                <span className="ml-1 font-medium">{entry.year}</span>
              </div>
            )}
            {entry.direction && (
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-slate-400">Direction:</span>
                <span className="ml-1 font-medium">{entry.direction}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrafficDataCard({
  trafficData,
  onTrafficDataChange,
  selectedRoadClass,
  onRoadClassChange,
  trafficNotes,
  onTrafficNotesChange,
  onRefresh,
  isRefreshing = false,
  dataSource,
  lastUpdated,
}: TrafficDataCardProps) {
  const [showAddRoad, setShowAddRoad] = useState(false);

  // Filter traffic data by road class
  const filteredData = selectedRoadClass === 'all'
    ? trafficData
    : trafficData.filter(d => d.roadClass.toLowerCase() === selectedRoadClass.toLowerCase());

  // Calculate summary stats
  const avgAADT = filteredData.length > 0
    ? Math.round(filteredData.reduce((sum, d) => sum + d.annualAverageDailyTraffic, 0) / filteredData.length)
    : 0;

  const maxAADT = filteredData.length > 0
    ? Math.max(...filteredData.map(d => d.annualAverageDailyTraffic))
    : 0;

  // Data source badge
  const getDataSourceBadge = () => {
    if (!dataSource) return null;

    const badges: Record<string, { label: string; color: string }> = {
      mdot: { label: 'MDOT Data', color: 'bg-blue-100 text-blue-700' },
      cotality: { label: 'Cotality', color: 'bg-purple-100 text-purple-700' },
      manual: { label: 'Manual', color: 'bg-harken-gray-light text-harken-gray' },
      mock: { label: 'Estimated', color: 'bg-accent-amber-gold-light text-accent-amber-gold' },
    };

    const badge = badges[dataSource];
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-harken-gray-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#0da1c7]" />
            <div>
              <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">Traffic Data</h3>
              <p className="text-xs text-harken-gray-med dark:text-slate-400">
                Annual Average Daily Traffic (AADT)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getDataSourceBadge()}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#0da1c7] hover:bg-slate-100 transition-colors disabled:opacity-50"
                title="Refresh traffic data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Road Class Filter */}
      <div className="p-4 bg-slate-50/50 border-b border-harken-gray-light dark:bg-elevation-1/50 dark:border-dark-border">
        <ButtonSelector
          label="Road Classification"
          options={ROAD_CLASS_OPTIONS}
          value={selectedRoadClass}
          onChange={onRoadClassChange}
        />
      </div>

      {/* Summary Stats */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-2 divide-x divide-harken-gray-light border-b border-harken-gray-light">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-[#0da1c7]">{formatNumber(avgAADT)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Average AADT</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-[#1c3643] dark:text-white">{formatNumber(maxAADT)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Peak AADT</div>
          </div>
        </div>
      )}

      {/* Traffic Data List */}
      <div className="p-4">
        {filteredData.length > 0 ? (
          <div className="space-y-2">
            {filteredData.map((entry, index) => (
              <TrafficRow key={index} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Route className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No traffic data available</p>
            <p className="text-xs text-slate-400 mt-1">
              Traffic counts will be imported from MDOT or entered manually
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="p-4 pt-0">
        <EnhancedTextArea
          id="traffic_notes"
          label="Traffic Analysis Notes"
          value={trafficNotes}
          onChange={onTrafficNotesChange}
          placeholder="Summarize traffic patterns, peak hours, access considerations..."
          rows={3}
          sectionContext="traffic_analysis"
          helperText="Note any traffic impact on the property's value or use."
        />
      </div>

      {/* Last Updated Footer */}
      {lastUpdated && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Data last updated: {lastUpdated}
        </div>
      )}
    </div>
  );
}

export default TrafficDataCard;
