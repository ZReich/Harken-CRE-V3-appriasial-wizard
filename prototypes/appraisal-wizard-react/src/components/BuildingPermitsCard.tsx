/**
 * BuildingPermitsCard Component
 * 
 * Displays building permit history for the subject property and area.
 * Integrates with permit data sources for historical construction activity.
 */

import React, { useState } from 'react';
import {
  FileText,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Building2,
  Calendar,
  DollarSign,
  ClipboardList,
  Filter,
} from 'lucide-react';
import ButtonSelector from './ButtonSelector';
import EnhancedTextArea from './EnhancedTextArea';

interface BuildingPermit {
  id: string;
  permitNumber: string;
  permitType: 'new_construction' | 'addition' | 'alteration' | 'repair' | 'demolition' | 'mechanical' | 'electrical' | 'plumbing' | 'other';
  description: string;
  issuedDate: string;
  completedDate?: string;
  status: 'issued' | 'active' | 'completed' | 'expired' | 'cancelled' | 'pending';
  estimatedValue?: number;
  actualValue?: number;
  contractor?: string;
  inspectionsPassed?: number;
  inspectionsRequired?: number;
}

interface BuildingPermitsCardProps {
  /** Permits for the subject property */
  permits: BuildingPermit[];
  onPermitsChange?: (permits: BuildingPermit[]) => void;

  /** Selected permit type filter */
  selectedPermitType: string;
  onPermitTypeChange: (value: string) => void;

  /** Permit notes */
  permitNotes: string;
  onPermitNotesChange: (value: string) => void;

  /** Data refresh callback */
  onRefresh?: () => void;
  isRefreshing?: boolean;

  /** Data source indicator */
  dataSource?: 'county' | 'cotality' | 'manual' | 'mock' | null;
  lastUpdated?: string;
}

const PERMIT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'new_construction', label: 'New Construction' },
  { value: 'addition', label: 'Addition' },
  { value: 'alteration', label: 'Alteration' },
  { value: 'repair', label: 'Repair' },
  { value: 'demolition', label: 'Demolition' },
];

const PERMIT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  new_construction: { label: 'New', color: 'bg-green-100 text-green-700 border-green-300' },
  addition: { label: 'Addition', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  alteration: { label: 'Alteration', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  repair: { label: 'Repair', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  demolition: { label: 'Demo', color: 'bg-red-100 text-red-700 border-red-300' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-300' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  issued: { label: 'Issued', color: 'text-blue-600' },
  active: { label: 'Active', color: 'text-green-600' },
  completed: { label: 'Completed', color: 'text-slate-600' },
  expired: { label: 'Expired', color: 'text-amber-600' },
  cancelled: { label: 'Cancelled', color: 'text-red-600' },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Individual permit row display
 */
function PermitRow({ permit }: { permit: BuildingPermit }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeInfo = PERMIT_TYPE_LABELS[permit.permitType] || PERMIT_TYPE_LABELS.other;
  const statusInfo = STATUS_LABELS[permit.status] || STATUS_LABELS.issued;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-600">{permit.permitNumber}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className={`text-[10px] font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-slate-700 truncate mt-0.5">{permit.description}</p>
        </div>

        <div className="text-right shrink-0">
          {permit.estimatedValue && (
            <div className="font-bold text-[#1c3643] dark:text-white">
              {formatCurrency(permit.estimatedValue)}
            </div>
          )}
          <div className="text-[10px] text-slate-400">
            {formatDate(permit.issuedDate)}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Issued:</span>
              <span className="ml-1 font-medium">{formatDate(permit.issuedDate)}</span>
            </div>
            {permit.completedDate && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Completed:</span>
                <span className="ml-1 font-medium">{formatDate(permit.completedDate)}</span>
              </div>
            )}
            {permit.estimatedValue && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Est. Value:</span>
                <span className="ml-1 font-medium">{formatCurrency(permit.estimatedValue)}</span>
              </div>
            )}
            {permit.actualValue && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Actual Value:</span>
                <span className="ml-1 font-medium">{formatCurrency(permit.actualValue)}</span>
              </div>
            )}
            {permit.contractor && (
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-slate-400">Contractor:</span>
                <span className="ml-1 font-medium">{permit.contractor}</span>
              </div>
            )}
            {permit.inspectionsRequired !== undefined && (
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-slate-400">Inspections:</span>
                <span className="ml-1 font-medium">
                  {permit.inspectionsPassed || 0} of {permit.inspectionsRequired} passed
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BuildingPermitsCard({
  permits,
  onPermitsChange,
  selectedPermitType,
  onPermitTypeChange,
  permitNotes,
  onPermitNotesChange,
  onRefresh,
  isRefreshing = false,
  dataSource,
  lastUpdated,
}: BuildingPermitsCardProps) {
  // Filter permits by type
  const filteredPermits = selectedPermitType === 'all'
    ? permits
    : permits.filter(p => p.permitType === selectedPermitType);

  // Calculate summary stats
  const totalValue = filteredPermits.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
  const activeCount = filteredPermits.filter(p => ['issued', 'active'].includes(p.status)).length;
  const completedCount = filteredPermits.filter(p => p.status === 'completed').length;

  // Data source badge
  const getDataSourceBadge = () => {
    if (!dataSource) return null;

    const badges: Record<string, { label: string; color: string }> = {
      county: { label: 'County Records', color: 'bg-blue-100 text-blue-700' },
      cotality: { label: 'Cotality', color: 'bg-purple-100 text-purple-700' },
      manual: { label: 'Manual', color: 'bg-gray-100 text-gray-600' },
      mock: { label: 'Estimated', color: 'bg-amber-100 text-amber-700' },
    };

    const badge = badges[dataSource];
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0da1c7]" />
            <div>
              <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">Building Permits</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Permit history and construction activity
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
                title="Refresh permit data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Permit Type Filter */}
      <div className="p-4 bg-slate-50/50 border-b border-gray-100 dark:bg-slate-800/50 dark:border-slate-700">
        <ButtonSelector
          label="Permit Type"
          options={PERMIT_TYPE_OPTIONS}
          value={selectedPermitType}
          onChange={onPermitTypeChange}
        />
      </div>

      {/* Summary Stats */}
      {filteredPermits.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-3 text-center">
            <div className="text-xl font-bold text-[#0da1c7]">{filteredPermits.length}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Permits</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-xl font-bold text-green-600">{activeCount}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Active</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalValue)}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Value</div>
          </div>
        </div>
      )}

      {/* Permits List */}
      <div className="p-4">
        {filteredPermits.length > 0 ? (
          <div className="space-y-2">
            {filteredPermits.map((permit) => (
              <PermitRow key={permit.id} permit={permit} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No permits found</p>
            <p className="text-xs text-slate-400 mt-1">
              Building permits will be imported from county records
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="p-4 pt-0">
        <EnhancedTextArea
          id="permit_notes"
          label="Permit Analysis Notes"
          value={permitNotes}
          onChange={onPermitNotesChange}
          placeholder="Summarize permit activity, recent improvements, pending work..."
          rows={3}
          sectionContext="permit_analysis"
          helperText="Note any permit-related findings that impact the appraisal."
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

export default BuildingPermitsCard;
