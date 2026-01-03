/**
 * BuildingSelector Component
 * 
 * Allows selection of which parcels/buildings from the Improvements Inventory
 * should be included in the Cost Approach for the current scenario.
 * 
 * Scenario-aware: different selections per scenario (As Is, As Completed, etc.)
 */

import React, { useMemo } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Ruler,
  CheckCircle2,
  Square,
  CheckSquare,
  Layers,
} from 'lucide-react';
import { useWizard } from '../../../context/WizardContext';
import type { ImprovementParcel, ImprovementBuilding } from '../../../types';

// =================================================================
// TYPES
// =================================================================

interface BuildingSelectorProps {
  scenarioId: number;
  selectedBuildingIds: string[];
  onSelectionChange: (buildingIds: string[]) => void;
}

interface BuildingInfo {
  parcelId: string;
  parcelNumber: string;
  building: ImprovementBuilding;
  totalSF: number;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function calculateBuildingSF(building: ImprovementBuilding): number {
  return building.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || 0;
}

function getAllBuildings(parcels: ImprovementParcel[]): BuildingInfo[] {
  const buildings: BuildingInfo[] = [];
  
  parcels.forEach(parcel => {
    parcel.buildings?.forEach(building => {
      buildings.push({
        parcelId: parcel.id,
        parcelNumber: parcel.parcelNumber || `Parcel ${parcels.indexOf(parcel) + 1}`,
        building,
        totalSF: calculateBuildingSF(building),
      });
    });
  });
  
  return buildings;
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export const BuildingSelector: React.FC<BuildingSelectorProps> = ({
  selectedBuildingIds,
  onSelectionChange,
}) => {
  const { state } = useWizard();
  const { improvementsInventory } = state;
  
  // Get all buildings from the inventory
  const allBuildings = useMemo(() => {
    return getAllBuildings(improvementsInventory?.parcels || []);
  }, [improvementsInventory]);
  
  // Calculate totals for selected buildings
  const selectedTotals = useMemo(() => {
    const selected = allBuildings.filter(b => selectedBuildingIds.includes(b.building.id));
    return {
      count: selected.length,
      totalSF: selected.reduce((sum, b) => sum + b.totalSF, 0),
    };
  }, [allBuildings, selectedBuildingIds]);
  
  // Check if all are selected
  const allSelected = allBuildings.length > 0 && selectedBuildingIds.length === allBuildings.length;
  
  // Toggle single building
  const toggleBuilding = (buildingId: string) => {
    if (selectedBuildingIds.includes(buildingId)) {
      onSelectionChange(selectedBuildingIds.filter(id => id !== buildingId));
    } else {
      onSelectionChange([...selectedBuildingIds, buildingId]);
    }
  };
  
  // Toggle all buildings
  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allBuildings.map(b => b.building.id));
    }
  };
  
  // Empty state
  if (allBuildings.length === 0) {
    return (
      <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Buildings Defined</h3>
            <p className="text-sm text-slate-600 mb-3">
              Buildings must be defined in the Improvements tab before they can be costed in the Cost Approach.
            </p>
            <p className="text-xs text-amber-700">
              Navigate to Subject Data &gt; Improvements to add buildings and use areas.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0da1c7]/10 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#0da1c7]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Select Buildings to Cost</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose which buildings to include in this scenario's cost calculation
            </p>
          </div>
        </div>
        
        {/* Select All Toggle */}
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-[#0da1c7] hover:bg-[#0da1c7]/5 rounded-lg transition-colors"
        >
          {allSelected ? (
            <>
              <CheckSquare size={16} className="text-[#0da1c7]" />
              Deselect All
            </>
          ) : (
            <>
              <Square size={16} />
              Select All ({allBuildings.length})
            </>
          )}
        </button>
      </div>
      
      {/* Selection Summary */}
      {selectedBuildingIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-lime-50 border border-lime-200 rounded-lg">
          <CheckCircle2 size={16} className="text-lime-600" />
          <span className="text-sm text-lime-700">
            <strong>{selectedTotals.count}</strong> building{selectedTotals.count !== 1 ? 's' : ''} selected
            <span className="mx-2 text-lime-400">|</span>
            <strong>{selectedTotals.totalSF.toLocaleString()}</strong> SF total
          </span>
        </div>
      )}
      
      {/* Building List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allBuildings.map((info) => {
          const isSelected = selectedBuildingIds.includes(info.building.id);
          const building = info.building;
          
          return (
            <button
              key={building.id}
              onClick={() => toggleBuilding(building.id)}
              className={`relative p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                isSelected
                  ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                  : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              {/* Checkbox Indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-[#0da1c7] text-white'
                  : 'border-2 border-gray-300'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              {/* Building Info */}
              <div className="flex items-start gap-3 pr-8">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-[#0da1c7]/20' : 'bg-gray-100'
                }`}>
                  <Building2 className={`w-5 h-5 ${isSelected ? 'text-[#0da1c7]' : 'text-gray-400'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${
                    isSelected ? 'text-[#0da1c7]' : 'text-slate-900'
                  }`}>
                    {building.name || `Building ${allBuildings.indexOf(info) + 1}`}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={10} />
                    <span className="truncate">{info.parcelNumber}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {info.totalSF > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                        <Ruler size={10} />
                        <span>{info.totalSF.toLocaleString()} SF</span>
                      </div>
                    )}
                    {building.yearBuilt && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                        <Calendar size={10} />
                        <span>{building.yearBuilt}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Area breakdown */}
                  {building.areas && building.areas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {building.areas.slice(0, 3).map((area, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          {area.type}: {(area.squareFootage || 0).toLocaleString()} SF
                        </span>
                      ))}
                      {building.areas.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          +{building.areas.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BuildingSelector;

