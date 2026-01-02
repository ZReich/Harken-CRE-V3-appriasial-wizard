/**
 * CostSegDetailsSection Component
 * 
 * NEW IMPLEMENTATION: Integrates all new cost seg components for a streamlined workflow.
 * Focuses on system refinements and supplemental items rather than re-entering building data.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Plus,
  Info,
  AlertCircle,
} from 'lucide-react';
import { YearSelector } from './ExpandableSelector';
import type {
  CostSegBuildingDetails,
  CostSegSystemRefinement as CostSegSystemRefinementType,
  CostSegSupplementalItem,
  ImprovementBuilding,
} from '../types';
import CostSegSystemRefinement from './CostSegSystemRefinement';
import CostSegSupplementalItems from './CostSegSupplementalItems';
import CostSegAuditRisk from './CostSegAuditRisk';
import CostSegBenchmarksPanel from './CostSegBenchmarks';

interface CostSegDetailsSectionProps {
  building: ImprovementBuilding;
  isCostSegEnabled: boolean;
  defaultOccupancyCode?: string;
  onUpdateBuilding: (updates: Partial<ImprovementBuilding>) => void;
  availablePhotos?: { id: string; url: string; caption?: string }[];
  propertyType?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
};

export default function CostSegDetailsSection({
  building,
  isCostSegEnabled,
  defaultOccupancyCode,
  onUpdateBuilding,
  availablePhotos = [],
  propertyType = 'office',
}: CostSegDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const details = building.costSegDetails;

  // Calculate building totals for system costs
  const buildingTotals = useMemo(() => {
    // Get total building cost from areas
    const totalSF = building.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || 0;
    const estimatedCost = totalSF * 150; // $150/SF estimate if no other data

    // Try to extract system costs from mechanical systems if available
    const mechanicalSystems = building.mechanicalSystems;
    
    return {
      totalBuildingCost: estimatedCost,
      electricalCost: 0, // Would come from M&S or mechanical systems
      hvacCost: 0,
      plumbingCost: 0,
      fireProtectionCost: 0,
    };
  }, [building]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const handleToggleEnabled = useCallback((checked: boolean) => {
    if (checked) {
      onUpdateBuilding({
        costSegDetails: {
          enabled: true,
          placedInServiceDate: building.yearBuilt ? String(building.yearBuilt) : undefined,
          systemRefinements: [],
          supplementalItems: [],
        },
      });
      setIsExpanded(true);
    } else {
      onUpdateBuilding({
        costSegDetails: undefined,
      });
      setIsExpanded(false);
    }
  }, [onUpdateBuilding, building.yearBuilt]);

  const updateDetails = useCallback((updates: Partial<CostSegBuildingDetails>) => {
    if (!details) return;
    
    onUpdateBuilding({
      costSegDetails: {
        ...details,
        ...updates,
      },
    });
  }, [details, onUpdateBuilding]);

  const handleAddSystemRefinement = useCallback((systemType: 'electrical' | 'plumbing' | 'hvac' | 'fire-protection') => {
    if (!details) return;

    const systemLabels = {
      electrical: 'Electrical System',
      plumbing: 'Plumbing System',
      hvac: 'HVAC System',
      'fire-protection': 'Fire Protection System',
    };

    const systemCosts = {
      electrical: buildingTotals.electricalCost || buildingTotals.totalBuildingCost * 0.10,
      plumbing: buildingTotals.plumbingCost || buildingTotals.totalBuildingCost * 0.08,
      hvac: buildingTotals.hvacCost || buildingTotals.totalBuildingCost * 0.15,
      'fire-protection': buildingTotals.fireProtectionCost || buildingTotals.totalBuildingCost * 0.05,
    };

    const newRefinement: CostSegSystemRefinementType = {
      id: `system-${Date.now()}`,
      systemType,
      systemLabel: systemLabels[systemType],
      totalSystemCost: systemCosts[systemType],
      refinements: [],
      totalAllocated: 0,
      isFullyAllocated: false,
    };

    updateDetails({
      systemRefinements: [...details.systemRefinements, newRefinement],
    });
  }, [details, updateDetails, buildingTotals]);

  const handleUpdateSystemRefinement = useCallback((refinementId: string, updated: CostSegSystemRefinementType) => {
    if (!details) return;

    updateDetails({
      systemRefinements: details.systemRefinements.map(r =>
        r.id === refinementId ? updated : r
      ),
    });
  }, [details, updateDetails]);

  const handleDeleteSystemRefinement = useCallback((refinementId: string) => {
    if (!details) return;

    updateDetails({
      systemRefinements: details.systemRefinements.filter(r => r.id !== refinementId),
    });
  }, [details, updateDetails]);

  // Calculate totals for audit risk and benchmarks
  const allocationTotals = useMemo(() => {
    if (!details) return { fiveYear: 0, fifteenYear: 0, thirtyNineYear: 0, total: 0 };

    let fiveYear = 0;
    let fifteenYear = 0;
    let thirtyNineYear = 0;

    // Sum from system refinements
    details.systemRefinements.forEach(sys => {
      sys.refinements.forEach(line => {
        if (line.depreciationClass === '5-year' || line.depreciationClass === '7-year') {
          fiveYear += line.amount;
        } else if (line.depreciationClass === '15-year') {
          fifteenYear += line.amount;
        } else if (line.depreciationClass === '39-year' || line.depreciationClass === '27.5-year') {
          thirtyNineYear += line.amount;
        }
      });
    });

    // Add supplemental items
    details.supplementalItems.forEach(item => {
      if (item.depreciationClass === '5-year' || item.depreciationClass === '7-year') {
        fiveYear += item.cost;
      } else if (item.depreciationClass === '15-year') {
        fifteenYear += item.cost;
      } else if (item.depreciationClass === '39-year' || item.depreciationClass === '27.5-year') {
        thirtyNineYear += item.cost;
      }
    });

    const total = fiveYear + fifteenYear + thirtyNineYear;

    return {
      fiveYear: total > 0 ? (fiveYear / total) * 100 : 0,
      fifteenYear: total > 0 ? (fifteenYear / total) * 100 : 0,
      thirtyNineYear: total > 0 ? (thirtyNineYear / total) * 100 : 0,
      total,
    };
  }, [details]);

  if (!isCostSegEnabled) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Cost Segregation Details"
      icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      <div className="space-y-4">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor={`cost-seg-enabled-${building.id}`} className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
            <input
              type="checkbox"
              id={`cost-seg-enabled-${building.id}`}
              checked={details?.enabled || false}
              onChange={(e) => handleToggleEnabled(e.target.checked)}
              className="form-checkbox h-4 w-4 text-[#0da1c7] rounded"
            />
            Enable Cost Segregation for this Building
          </label>
        </div>

        {details?.enabled && (
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Building data auto-pulled from appraisal</p>
                <p>Add system refinements (electrical, HVAC, plumbing breakdowns) and supplemental items specific to cost segregation.</p>
              </div>
            </div>

            {/* Placed in Service Date */}
            <div>
              <YearSelector
                id={`cs-placed-in-service-${building.id}`}
                label="Placed In Service Year"
                value={details.placedInServiceDate ? parseInt(details.placedInServiceDate) : null}
                onChange={(year) => updateDetails({ placedInServiceDate: year ? String(year) : undefined })}
                required
              />
            </div>

            {/* Building Cost Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-xs font-medium text-slate-600 mb-2">Building Information</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">Estimated Total Cost:</span>
                <span className="font-bold text-slate-900">{formatCurrency(buildingTotals.totalBuildingCost)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                System costs estimated from building data. Refine below for accurate cost segregation.
              </p>
            </div>

            {/* System Refinements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">System Refinements</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSystemRefinement('electrical')}
                    className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                  >
                    + Electrical
                  </button>
                  <button
                    onClick={() => handleAddSystemRefinement('hvac')}
                    className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    + HVAC
                  </button>
                  <button
                    onClick={() => handleAddSystemRefinement('plumbing')}
                    className="px-2 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded transition-colors"
                  >
                    + Plumbing
                  </button>
                </div>
              </div>

              {details.systemRefinements.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  No system refinements added yet. Click buttons above to add.
                </div>
              )}

              {details.systemRefinements.map(refinement => (
                <CostSegSystemRefinement
                  key={refinement.id}
                  refinement={refinement}
                  onUpdate={(updated) => handleUpdateSystemRefinement(refinement.id, updated)}
                  onDelete={() => handleDeleteSystemRefinement(refinement.id)}
                  availablePhotos={availablePhotos}
                />
              ))}
            </div>

            {/* Supplemental Items */}
            <CostSegSupplementalItems
              items={details.supplementalItems}
              onUpdate={(items) => updateDetails({ supplementalItems: items })}
              buildingId={building.id}
              propertyType={propertyType}
              availablePhotos={availablePhotos}
            />

            {/* Allocation Summary */}
            {allocationTotals.total > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Allocation Summary</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="text-xs text-emerald-700 mb-1">5-Year Personal Property</div>
                    <div className="text-lg font-bold text-emerald-900">{allocationTotals.fiveYear.toFixed(1)}%</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="text-xs text-amber-700 mb-1">15-Year Land Improvements</div>
                    <div className="text-lg font-bold text-amber-900">{allocationTotals.fifteenYear.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-xs text-slate-700 mb-1">39-Year Real Property</div>
                    <div className="text-lg font-bold text-slate-900">{allocationTotals.thirtyNineYear.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="text-sm text-center text-gray-600">
                  Total Allocated: {formatCurrency(allocationTotals.total)}
                </div>
              </div>
            )}

            {/* Audit Risk & Benchmarks */}
            {allocationTotals.total > 0 && (
              <div className="space-y-3">
                <CostSegAuditRisk
                  totalCost={allocationTotals.total}
                  fiveYearTotal={allocationTotals.total * (allocationTotals.fiveYear / 100)}
                  fifteenYearTotal={allocationTotals.total * (allocationTotals.fifteenYear / 100)}
                  thirtyNineYearTotal={allocationTotals.total * (allocationTotals.thirtyNineYear / 100)}
                  hasPhotos={details.systemRefinements.some(r => r.refinements.some(line => line.linkedPhotoIds && line.linkedPhotoIds.length > 0)) ||
                             details.supplementalItems.some(i => i.linkedPhotoIds && i.linkedPhotoIds.length > 0)}
                  hasMeasurements={details.systemRefinements.some(r => r.refinements.some(line => line.measurements))}
                  propertyType={propertyType}
                />

                <CostSegBenchmarksPanel
                  userAllocation={{
                    fiveYear: allocationTotals.fiveYear,
                    fifteenYear: allocationTotals.fifteenYear,
                    thirtyNineYear: allocationTotals.thirtyNineYear,
                  }}
                  propertyType={propertyType}
                  buildingSize={building.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || 0}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
