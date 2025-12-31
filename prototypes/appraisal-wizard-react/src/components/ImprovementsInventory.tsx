import { useState, useCallback, useEffect, useMemo } from 'react';
import { useWizard } from '../context/WizardContext';
import {
  createDefaultParcel,
  createDefaultBuilding,
  createDefaultArea,
  calculateTotalSF,
  calculateParcelSF,
  calculateBuildingSF,
  validateInventory,
  calculateActualAge,
  calculateRemainingLife,
  calculateDepreciation,
} from '../contracts/improvements';
import type {
  ImprovementParcel,
  ImprovementBuilding,
  ImprovementArea,
  ImprovementsInventory as ImprovementsInventoryType,
  InteriorFeatures,
} from '../types';
import {
  CONSTRUCTION_TYPES,
  CONSTRUCTION_QUALITY,
  CONSTRUCTION_CLASSES,
  CONDITIONS,
} from '../types';
import { Building2, Building, Factory, TreePine, Warehouse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Icon map for construction classes (matches types/index.ts CONSTRUCTION_CLASSES)
const CONSTRUCTION_CLASS_ICONS: Record<string, LucideIcon> = {
  Building2,
  Building,
  Warehouse, // Class C - Masonry Bearing Walls
  TreePine,
  Factory,
};
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  MapPin,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Ruler,
  Home,
  Wrench,
  LayoutGrid,
  Columns,
  Square,
  SplitSquareVertical,
  EyeOff,
} from 'lucide-react';
import ExpandableSelector, { YearSelector } from './ExpandableSelector';
import EnhancedTextArea from './EnhancedTextArea';
import ExteriorFeaturesInventory from './ExteriorFeaturesInventory';
import MechanicalSystemsInventory from './MechanicalSystemsInventory';
import InteriorFinishesInventory from './InteriorFinishesInventory';
import BuildingTypeSelector from './BuildingTypeSelector';
import { getPropertyType } from '../constants/marshallSwift';
import { getAreaTypesForBuildingType, type AreaTypeConfig } from '../constants/useAreaTypes';
import { type ApplicablePropertyType, occupancyCodeToPropertyType } from '../constants/buildingComponents';

// Note: Area types are now dynamically loaded via getAreaTypesForBuildingType() 
// based on the building's property type. See AreaCard for implementation.

const SF_TYPES = [
  { value: 'GBA', label: 'GBA' },
  { value: 'NRA', label: 'NRA' },
  { value: 'GLA', label: 'GLA' },
  { value: 'RSF', label: 'RSF' },
];

const HEIGHT_PRESETS = [
  { label: 'Retail', eave: 16, clear: 14, ridge: 20 },
  { label: 'Warehouse', eave: 24, clear: 22, ridge: 32 },
  { label: 'Distribution', eave: 32, clear: 30, ridge: 40 },
  { label: 'Light Industrial', eave: 20, clear: 18, ridge: 26 },
  { label: 'Office', eave: 12, clear: 10, ridge: 14 },
];

const BUILDING_CONFIGS = [
  { value: 'standard', label: 'Standard', Icon: LayoutGrid },
  { value: 'clear-span', label: 'Clear Span', Icon: Square },
  { value: 'multi-bay', label: 'Multi-Bay', Icon: Columns },
  { value: 'variable', label: 'Variable Heights', Icon: SplitSquareVertical },
];

export default function ImprovementsInventory() {
  const { state, setImprovementsInventory } = useWizard();
  const inventory = state.improvementsInventory;
  const [expandedParcels, setExpandedParcels] = useState<Set<string>>(
    new Set(inventory.parcels.map((p) => p.id))
  );
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(
    new Set(inventory.parcels.flatMap((p) => p.buildings.map((b) => b.id)))
  );

  const updateInventory = useCallback(
    (updater: (inv: ImprovementsInventoryType) => ImprovementsInventoryType) => {
      const updated = updater({ ...inventory, parcels: [...inventory.parcels] });
      setImprovementsInventory(updated);
    },
    [inventory, setImprovementsInventory]
  );

  // Auto-populate first parcel from centralized subjectData
  useEffect(() => {
    if (!state.subjectData) return;
    
    const firstParcel = inventory.parcels[0];
    if (!firstParcel) return;
    
    const { taxId, legalDescription, address } = state.subjectData;
    const addressString = address?.street 
      ? `${address.street}, ${address.city}, ${address.state} ${address.zip}`
      : '';
    
    // Only auto-populate if first parcel fields are empty and subjectData has values
    const needsUpdate = (
      (!firstParcel.parcelNumber && taxId) ||
      (!firstParcel.legalDescription && legalDescription) ||
      (!firstParcel.address && addressString)
    );
    
    if (needsUpdate) {
      setImprovementsInventory({
        ...inventory,
        parcels: inventory.parcels.map((p, idx) => 
          idx === 0 
            ? { 
                ...p, 
                parcelNumber: p.parcelNumber || taxId || '',
                legalDescription: p.legalDescription || legalDescription || '',
                address: p.address || addressString,
              }
            : p
        ),
      });
    }
  }, [state.subjectData, inventory.parcels[0]?.id]); // Only run when subjectData changes or first parcel is created

  const addParcel = () => {
    updateInventory((inv) => ({
      ...inv,
      parcels: [...inv.parcels, createDefaultParcel()],
    }));
  };

  const removeParcel = (parcelId: string) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.filter((p) => p.id !== parcelId),
    }));
  };

  const updateParcel = (parcelId: string, updates: Partial<ImprovementParcel>) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.map((p) => (p.id === parcelId ? { ...p, ...updates } : p)),
    }));
  };

  const addBuilding = (parcelId: string) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.map((p) =>
        p.id === parcelId ? { ...p, buildings: [...p.buildings, createDefaultBuilding()] } : p
      ),
    }));
  };

  const removeBuilding = (parcelId: string, buildingId: string) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.map((p) =>
        p.id === parcelId ? { ...p, buildings: p.buildings.filter((b) => b.id !== buildingId) } : p
      ),
    }));
  };

  const updateBuilding = (parcelId: string, buildingId: string, updates: Partial<ImprovementBuilding>) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.map((p) =>
        p.id === parcelId
          ? { ...p, buildings: p.buildings.map((b) => (b.id === buildingId ? { ...b, ...updates } : b)) }
          : p
      ),
    }));
  };

  const addArea = (parcelId: string, buildingId: string) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              buildings: p.buildings.map((b) =>
                b.id === buildingId ? { ...b, areas: [...b.areas, createDefaultArea()] } : b
              ),
            }
          : p
      ),
    }));
  };

  const removeArea = (parcelId: string, buildingId: string, areaId: string) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              buildings: p.buildings.map((b) =>
                b.id === buildingId ? { ...b, areas: b.areas.filter((a) => a.id !== areaId) } : b
              ),
            }
          : p
      ),
    }));
  };

  const updateArea = (parcelId: string, buildingId: string, areaId: string, updates: Partial<ImprovementArea>) => {
    updateInventory((inv) => ({
      ...inv,
      parcels: inv.parcels.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              buildings: p.buildings.map((b) =>
                b.id === buildingId
                  ? { ...b, areas: b.areas.map((a) => (a.id === areaId ? { ...a, ...updates } : a)) }
                  : b
              ),
            }
          : p
      ),
    }));
  };

  const toggleParcel = (parcelId: string) => {
    setExpandedParcels((prev) => {
      const next = new Set(prev);
      if (next.has(parcelId)) next.delete(parcelId);
      else next.add(parcelId);
      return next;
    });
  };

  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings((prev) => {
      const next = new Set(prev);
      if (next.has(buildingId)) next.delete(buildingId);
      else next.add(buildingId);
      return next;
    });
  };

  const validation = validateInventory(inventory);
  const totalSF = calculateTotalSF(inventory);
  const totalBuildings = inventory.parcels.reduce((sum, p) => sum + p.buildings.length, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#0da1c7] to-[#0b8fb0] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Improvements Inventory</h2>
            <p className="text-white/80 text-sm">
              {inventory.parcels.length} Parcel{inventory.parcels.length !== 1 ? 's' : ''} | {totalBuildings} Building{totalBuildings !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-sm mb-1">Total Square Footage</div>
            <div className="text-3xl font-bold tracking-tight">
              {totalSF.toLocaleString()} <span className="text-lg font-normal text-white/80">SF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Alerts */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((err) => (
            <div key={err.code + err.path} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-red-800">{err.message}</span>
            </div>
          ))}
          {validation.warnings.map((warn) => (
            <div key={warn.code + warn.path} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-amber-800">{warn.message}</span>
            </div>
          ))}
        </div>
      )}

      {validation.isValid && totalSF > 0 && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium text-green-800">All improvements data is complete and valid</span>
        </div>
      )}

      {/* Parcels */}
      <div className="space-y-4">
        {inventory.parcels.map((parcel, pIdx) => (
          <ParcelCard
            key={parcel.id}
            parcel={parcel}
            index={pIdx}
            isExpanded={expandedParcels.has(parcel.id)}
            canRemove={inventory.parcels.length > 1}
            expandedBuildings={expandedBuildings}
            isFirstParcel={pIdx === 0}
            subjectData={state.subjectData}
            defaultOccupancyCode={state.msOccupancyCode || undefined}
            defaultPropertyType={state.propertyType || undefined}
            onToggle={() => toggleParcel(parcel.id)}
            onToggleBuilding={toggleBuilding}
            onUpdate={(updates) => updateParcel(parcel.id, updates)}
            onRemove={() => removeParcel(parcel.id)}
            onAddBuilding={() => addBuilding(parcel.id)}
            onRemoveBuilding={(buildingId) => removeBuilding(parcel.id, buildingId)}
            onUpdateBuilding={(buildingId, updates) => updateBuilding(parcel.id, buildingId, updates)}
            onAddArea={(buildingId) => addArea(parcel.id, buildingId)}
            onRemoveArea={(buildingId, areaId) => removeArea(parcel.id, buildingId, areaId)}
            onUpdateArea={(buildingId, areaId, updates) => updateArea(parcel.id, buildingId, areaId, updates)}
          />
        ))}
      </div>

      {/* Add Parcel Button */}
      <button
        onClick={addParcel}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-[#0da1c7] hover:text-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all flex items-center justify-center gap-2 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Add Another Parcel</span>
      </button>
    </div>
  );
}

// =================================================================
// PARCEL CARD
// =================================================================

interface ParcelCardProps {
  parcel: ImprovementParcel;
  index: number;
  isExpanded: boolean;
  canRemove: boolean;
  expandedBuildings: Set<string>;
  isFirstParcel?: boolean;  // For showing "Synced from Setup" badges
  subjectData?: { taxId: string; legalDescription: string; address: { street: string; city: string; state: string; zip: string; county: string } };
  defaultOccupancyCode?: string;
  defaultPropertyType?: string;
  onToggle: () => void;
  onToggleBuilding: (buildingId: string) => void;
  onUpdate: (updates: Partial<ImprovementParcel>) => void;
  onRemove: () => void;
  onAddBuilding: () => void;
  onRemoveBuilding: (buildingId: string) => void;
  onUpdateBuilding: (buildingId: string, updates: Partial<ImprovementBuilding>) => void;
  onAddArea: (buildingId: string) => void;
  onRemoveArea: (buildingId: string, areaId: string) => void;
  onUpdateArea: (buildingId: string, areaId: string, updates: Partial<ImprovementArea>) => void;
}

function ParcelCard({
  parcel,
  index,
  isExpanded,
  canRemove,
  expandedBuildings,
  isFirstParcel,
  subjectData,
  defaultOccupancyCode,
  defaultPropertyType,
  onToggle,
  onToggleBuilding,
  onUpdate,
  onRemove,
  onAddBuilding,
  onRemoveBuilding,
  onUpdateBuilding,
  onAddArea,
  onRemoveArea,
  onUpdateArea,
}: ParcelCardProps) {
  const parcelSF = calculateParcelSF(parcel);
  
  // Check if fields are synced from Setup
  const isTaxIdSynced = isFirstParcel && subjectData?.taxId && parcel.parcelNumber === subjectData.taxId;
  const isLegalDescSynced = isFirstParcel && subjectData?.legalDescription && parcel.legalDescription === subjectData.legalDescription;
  const addressString = subjectData?.address?.street 
    ? `${subjectData.address.street}, ${subjectData.address.city}, ${subjectData.address.state} ${subjectData.address.zip}`
    : '';
  const isAddressSynced = isFirstParcel && addressString && parcel.address === addressString;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-[#0da1c7]"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0da1c7]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <div className="font-bold text-[#1c3643]">
                Parcel {index + 1}
                {parcel.parcelNumber && <span className="text-gray-500 font-normal ml-2 text-sm">#{parcel.parcelNumber}</span>}
              </div>
              <div className="text-xs text-gray-500">
                {parcel.buildings.length} Building{parcel.buildings.length !== 1 ? 's' : ''} | {parcelSF.toLocaleString()} SF
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-lg font-bold text-[#0da1c7]">{parcelSF.toLocaleString()}</span>
            <span className="text-sm text-gray-500 ml-1">SF</span>
          </div>
          {canRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-5 border-t border-gray-100 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                Tax ID / Parcel Number
                {isTaxIdSynced && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-normal">From Setup</span>
                )}
              </label>
              <input
                type="text"
                value={parcel.parcelNumber}
                onChange={(e) => onUpdate({ parcelNumber: e.target.value })}
                placeholder="e.g., 12-345-678"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent ${
                  isTaxIdSynced ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                Situs Address
                {isAddressSynced && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-normal">From Setup</span>
                )}
              </label>
              <input
                type="text"
                value={parcel.address || ''}
                onChange={(e) => onUpdate({ address: e.target.value })}
                placeholder="Street address"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent ${
                  isAddressSynced ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-2">
              Legal Description
              {isLegalDescSynced && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-normal">From Setup</span>
              )}
            </label>
            <input
              type="text"
              value={parcel.legalDescription || ''}
              onChange={(e) => onUpdate({ legalDescription: e.target.value })}
              placeholder="e.g., Lot 1, Block 2, Canyon Creek Industrial Park"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent ${
                isLegalDescSynced ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1c3643]" />
                <h4 className="font-bold text-[#1c3643]">Buildings</h4>
              </div>
              <button
                onClick={onAddBuilding}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0da1c7] hover:bg-[#0da1c7]/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Building
              </button>
            </div>

            <div className="space-y-3">
              {parcel.buildings.map((building, bIdx) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  index={bIdx}
                  isExpanded={expandedBuildings.has(building.id)}
                  canRemove={parcel.buildings.length > 1}
                  defaultOccupancyCode={defaultOccupancyCode}
                  defaultPropertyType={defaultPropertyType}
                  onToggle={() => onToggleBuilding(building.id)}
                  onUpdate={(updates) => onUpdateBuilding(building.id, updates)}
                  onRemove={() => onRemoveBuilding(building.id)}
                  onAddArea={() => onAddArea(building.id)}
                  onRemoveArea={(areaId) => onRemoveArea(building.id, areaId)}
                  onUpdateArea={(areaId, updates) => onUpdateArea(building.id, areaId, updates)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =================================================================
// BUILDING CARD
// =================================================================

interface BuildingCardProps {
  building: ImprovementBuilding;
  index: number;
  isExpanded: boolean;
  canRemove: boolean;
  defaultOccupancyCode?: string;
  defaultPropertyType?: string;
  onToggle: () => void;
  onUpdate: (updates: Partial<ImprovementBuilding>) => void;
  onRemove: () => void;
  onAddArea: () => void;
  onRemoveArea: (areaId: string) => void;
  onUpdateArea: (areaId: string, updates: Partial<ImprovementArea>) => void;
}

function BuildingCard({
  building,
  index,
  isExpanded,
  canRemove,
  defaultOccupancyCode,
  defaultPropertyType,
  onToggle,
  onUpdate,
  onRemove,
  onAddArea,
  onRemoveArea,
  onUpdateArea,
}: BuildingCardProps) {
  const buildingSF = calculateBuildingSF(building);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [activeZoneIndex, setActiveZoneIndex] = useState<number | null>(null);
  
  // Get property category for component filtering
  const effectivePropertyType = building.propertyTypeOverride || defaultPropertyType;
  const propertyTypeConfig = effectivePropertyType ? getPropertyType(effectivePropertyType) : null;
  const propertyCategory = propertyTypeConfig?.category;
  
  // Derive ApplicablePropertyType from occupancy code or property type
  const effectiveOccupancyCode = building.msOccupancyCodeOverride || defaultOccupancyCode;
  const applicablePropertyType = effectivePropertyType 
    ? occupancyCodeToPropertyType(effectivePropertyType)
    : undefined;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const actualAge = calculateActualAge(building.yearBuilt);
  const remainingLife = calculateRemainingLife(building.effectiveAge, building.totalEconomicLife);
  const depreciation = calculateDepreciation(building.effectiveAge, building.totalEconomicLife);

  const applyHeightPreset = (preset: typeof HEIGHT_PRESETS[0]) => {
    if (building.buildingConfiguration === 'variable' && activeZoneIndex !== null) {
      const zones = [...(building.heightZones || [])];
      if (zones[activeZoneIndex]) {
        zones[activeZoneIndex] = {
          ...zones[activeZoneIndex],
          eaveHeight: preset.eave,
          clearHeight: preset.clear,
          ridgeHeight: preset.ridge,
        };
        onUpdate({ heightZones: zones });
      }
      return;
    }
    onUpdate({
      eaveHeight: preset.eave,
      clearHeight: preset.clear,
      ridgeHeight: preset.ridge,
    });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors" onClick={onToggle}>
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <div className="w-8 h-8 rounded-lg bg-[#1c3643]/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#1c3643]" />
          </div>
          <div>
            <span className="font-semibold text-sm text-[#1c3643]">{building.name || `Building ${index + 1}`}</span>
            <span className="text-xs text-gray-500 ml-2">({building.areas.length} area{building.areas.length !== 1 ? 's' : ''})</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Building Type Selector */}
          <div onClick={(e) => e.stopPropagation()}>
            <BuildingTypeSelector
              propertyTypeOverride={building.propertyTypeOverride}
              msOccupancyCodeOverride={building.msOccupancyCodeOverride}
              defaultPropertyType={defaultPropertyType}
              defaultOccupancyCode={defaultOccupancyCode}
              onPropertyTypeChange={(type) => onUpdate({ propertyTypeOverride: type })}
              onOccupancyCodeChange={(code) => onUpdate({ msOccupancyCodeOverride: code })}
              compact={true}
            />
          </div>
          {building.yearBuilt && (
            <span className="px-2 py-0.5 text-xs font-medium bg-white rounded border text-gray-600">Built {building.yearBuilt}</span>
          )}
          <span className="text-sm font-bold text-[#0da1c7]">{buildingSF.toLocaleString()} SF</span>
          {canRemove && (
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-4 bg-white border-t border-gray-200 space-y-4">
          {/* Basic Information */}
          <CollapsibleSection title="Basic Information" icon={<Building2 className="w-4 h-4" />} isExpanded={expandedSections.has('basic')} onToggle={() => toggleSection('basic')}>
            <div className="grid grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Building Name</label>
                <input type="text" value={building.name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="e.g., Building A" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Address Override</label>
                <input type="text" value={building.addressOverride || ''} onChange={(e) => onUpdate({ addressOverride: e.target.value })} placeholder="If different from parcel" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" />
              </div>
              <YearSelector id={`year-built-${building.id}`} label="Year Built" value={building.yearBuilt} onChange={(v) => onUpdate({ yearBuilt: v })} required />
              <YearSelector id={`year-remodeled-${building.id}`} label="Year Remodeled" value={building.yearRemodeled ? parseInt(building.yearRemodeled) : null} onChange={(v) => onUpdate({ yearRemodeled: v?.toString() || '' })} includeNA />
            </div>
          </CollapsibleSection>

          {/* Age & Economic Life */}
          <CollapsibleSection title="Age & Economic Life" icon={<Calculator className="w-4 h-4" />} isExpanded={expandedSections.has('age')} onToggle={() => toggleSection('age')}>
            <AgeEconomicLifeSection building={building} actualAge={actualAge} remainingLife={remainingLife} depreciation={depreciation} onUpdate={onUpdate} />
          </CollapsibleSection>

          {/* Construction Details */}
          <CollapsibleSection title="Construction Details" icon={<Ruler className="w-4 h-4" />} isExpanded={expandedSections.has('construction')} onToggle={() => toggleSection('construction')}>
            <div className="space-y-4">
              {/* M&S Construction Class - ButtonSelector with icons */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  M&S Construction Class
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONSTRUCTION_CLASSES.map((cls) => {
                    const IconComponent = CONSTRUCTION_CLASS_ICONS[cls.iconName] || Building2;
                    const isSelected = building.constructionClass === cls.value;
                    return (
                      <button
                        key={cls.value}
                        type="button"
                        onClick={() => onUpdate({ constructionClass: cls.value })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-[#0da1c7] bg-[#0da1c7]/10 text-[#0da1c7]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {cls.label}
                      </button>
                    );
                  })}
                </div>
                {building.constructionClass && (
                  <p className="text-xs text-slate-500 mt-1">
                    {CONSTRUCTION_CLASSES.find(c => c.value === building.constructionClass)?.description}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <ExpandableSelector id={`construction-type-${building.id}`} label="Construction Type" options={CONSTRUCTION_TYPES} value={building.constructionType || ''} onChange={(v) => onUpdate({ constructionType: Array.isArray(v) ? v[0] : v })} category="structure" required multiple={false} />
                <ExpandableSelector id={`construction-quality-${building.id}`} label="Construction Quality" options={CONSTRUCTION_QUALITY} value={building.constructionQuality || ''} onChange={(v) => onUpdate({ constructionQuality: Array.isArray(v) ? v[0] : v })} category="structure" multiple={false} />
                <ExpandableSelector id={`condition-${building.id}`} label="Condition" options={CONDITIONS} value={building.condition || ''} onChange={(v) => onUpdate({ condition: Array.isArray(v) ? v[0] : v })} category="structure" required multiple={false} />
              </div>

              {/* Building Heights */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#0da1c7]" />
                    Building Heights
                  </h5>
                  <span className="text-xs text-gray-500">Clear height is interior usable height</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Eave Height</label>
                    <div className="flex items-center gap-2">
                      <input type="text" inputMode="decimal" value={building.eaveHeight ?? ''} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); onUpdate({ eaveHeight: val ? Number(val) : null }); }} placeholder="24" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white" />
                      <span className="text-xs font-medium text-gray-500">ft</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Clear Height *</label>
                    <div className="flex items-center gap-2">
                      <input type="text" inputMode="decimal" value={building.clearHeight ?? ''} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); onUpdate({ clearHeight: val ? Number(val) : null }); }} placeholder="22" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white" />
                      <span className="text-xs font-medium text-gray-500">ft</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Ridge Height</label>
                    <div className="flex items-center gap-2">
                      <input type="text" inputMode="decimal" value={building.ridgeHeight ?? ''} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); onUpdate({ ridgeHeight: val ? Number(val) : null }); }} placeholder="32" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white" />
                      <span className="text-xs font-medium text-gray-500">ft</span>
                    </div>
                  </div>
                </div>

                {/* Building Configuration */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Building Configuration</label>
                  <div className="flex flex-wrap gap-2">
                    {BUILDING_CONFIGS.map((config) => {
                      const Icon = config.Icon;
                      const isSelected = building.buildingConfiguration === config.value;
                      return (
                        <button key={config.value} type="button" onClick={() => onUpdate({ buildingConfiguration: config.value as ImprovementBuilding['buildingConfiguration'] })} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${isSelected ? 'border-[#0da1c7] bg-[#0da1c7]/10 text-[#0da1c7]' : 'border-gray-200 bg-white text-gray-700 hover:border-[#0da1c7]/50'}`}>
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variable Height Zones */}
                {building.buildingConfiguration === 'variable' && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Height Zones</div>
                        <div className="text-xs text-gray-500 mt-0.5">Use zones when clear height differs across bays/areas.</div>
                      </div>
                      <button type="button" onClick={() => { const zones = building.heightZones || []; const newZone = { id: `zone-${Date.now()}`, label: `Zone ${zones.length + 1}`, clearHeight: null, eaveHeight: null, ridgeHeight: null }; onUpdate({ heightZones: [...zones, newZone] }); }} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                        + Add Zone
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr className="text-left text-xs font-semibold text-gray-600">
                            <th className="px-4 py-3 w-48">Zone</th>
                            <th className="px-4 py-3 w-32">Clear (ft) *</th>
                            <th className="px-4 py-3 w-32">Eave (ft)</th>
                            <th className="px-4 py-3 w-32">Ridge (ft)</th>
                            <th className="px-4 py-3 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(building.heightZones || []).length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">No zones added. Click &quot;+ Add Zone&quot; to create height zones.</td></tr>
                          ) : (
                            (building.heightZones || []).map((zone, zoneIndex) => (
                              <tr key={zone.id} onClick={() => setActiveZoneIndex(zoneIndex)} className={`cursor-pointer transition-all ${activeZoneIndex === zoneIndex ? 'bg-[#0da1c7]/5 ring-2 ring-inset ring-[#0da1c7]' : 'hover:bg-gray-50'}`}>
                                <td className="px-4 py-2"><input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" placeholder="e.g., Warehouse" value={zone.label} onFocus={() => setActiveZoneIndex(zoneIndex)} onChange={(e) => { const zones = [...(building.heightZones || [])]; zones[zoneIndex] = { ...zones[zoneIndex], label: e.target.value }; onUpdate({ heightZones: zones }); }} /></td>
                                <td className="px-4 py-2"><input type="text" inputMode="decimal" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" placeholder="22" value={zone.clearHeight ?? ''} onFocus={() => setActiveZoneIndex(zoneIndex)} onChange={(e) => { const zones = [...(building.heightZones || [])]; const val = e.target.value.replace(/[^0-9.]/g, ''); zones[zoneIndex] = { ...zones[zoneIndex], clearHeight: val ? parseFloat(val) : null }; onUpdate({ heightZones: zones }); }} /></td>
                                <td className="px-4 py-2"><input type="text" inputMode="decimal" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" placeholder="24" value={zone.eaveHeight ?? ''} onFocus={() => setActiveZoneIndex(zoneIndex)} onChange={(e) => { const zones = [...(building.heightZones || [])]; const val = e.target.value.replace(/[^0-9.]/g, ''); zones[zoneIndex] = { ...zones[zoneIndex], eaveHeight: val ? parseFloat(val) : null }; onUpdate({ heightZones: zones }); }} /></td>
                                <td className="px-4 py-2"><input type="text" inputMode="decimal" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" placeholder="32" value={zone.ridgeHeight ?? ''} onFocus={() => setActiveZoneIndex(zoneIndex)} onChange={(e) => { const zones = [...(building.heightZones || [])]; const val = e.target.value.replace(/[^0-9.]/g, ''); zones[zoneIndex] = { ...zones[zoneIndex], ridgeHeight: val ? parseFloat(val) : null }; onUpdate({ heightZones: zones }); }} /></td>
                                <td className="px-4 py-2 text-right"><button type="button" onClick={(e) => { e.stopPropagation(); const zones = (building.heightZones || []).filter((_, i) => i !== zoneIndex); onUpdate({ heightZones: zones }); if (activeZoneIndex === zoneIndex) setActiveZoneIndex(null); }} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-600">Quick Presets</label>
                    {building.buildingConfiguration === 'variable' && (
                      <span className="text-xs text-gray-500">{activeZoneIndex !== null ? `Applying to: ${(building.heightZones || [])[activeZoneIndex]?.label || 'Zone'}` : 'Click a zone row to select it first'}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HEIGHT_PRESETS.map((preset) => (
                      <button key={preset.label} type="button" onClick={() => applyHeightPreset(preset)} disabled={building.buildingConfiguration === 'variable' && activeZoneIndex === null} className={`px-3 py-1.5 rounded-full bg-white border text-xs font-medium transition-all ${building.buildingConfiguration === 'variable' && activeZoneIndex === null ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-[#0da1c7]/5 hover:border-[#0da1c7]/30 hover:text-[#0da1c7]'}`}>
                        {preset.label} ({preset.eave}&apos;/{preset.clear}&apos;/{preset.ridge}&apos;)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <EnhancedTextArea id={`construction-desc-${building.id}`} label="Construction Details Description" value={building.constructionDescription || ''} onChange={(v) => onUpdate({ constructionDescription: v })} placeholder="Describe the building construction..." sectionContext="construction_description" rows={4} />
            </div>
          </CollapsibleSection>

          {/* Exterior Features */}
          <CollapsibleSection title="Exterior Features" icon={<Home className="w-4 h-4" />} isExpanded={expandedSections.has('exterior')} onToggle={() => toggleSection('exterior')}>
            <ExteriorFeaturesInventory
              features={building.exteriorFeatures}
              onChange={(updated) => onUpdate({ exteriorFeatures: updated })}
              buildingYearBuilt={building.yearBuilt}
              defaultOccupancyCode={defaultOccupancyCode}
              buildingPropertyTypeOverride={building.propertyTypeOverride}
              buildingOccupancyCodeOverride={building.msOccupancyCodeOverride}
              propertyCategory={propertyCategory}
            />
          </CollapsibleSection>

          {/* Mechanical Systems */}
          <CollapsibleSection title="Mechanical Systems" icon={<Wrench className="w-4 h-4" />} isExpanded={expandedSections.has('mechanical')} onToggle={() => toggleSection('mechanical')}>
            <MechanicalSystemsInventory
              systems={building.mechanicalSystems}
              onChange={(updated) => onUpdate({ mechanicalSystems: updated })}
              buildingYearBuilt={building.yearBuilt}
              defaultOccupancyCode={defaultOccupancyCode}
              buildingPropertyTypeOverride={building.propertyTypeOverride}
              buildingOccupancyCodeOverride={building.msOccupancyCodeOverride}
              propertyCategory={propertyCategory}
            />
          </CollapsibleSection>

          {/* Use Areas */}
          <CollapsibleSection title="Use Areas / Segments" icon={<Layers className="w-4 h-4" />} isExpanded={expandedSections.has('areas')} onToggle={() => toggleSection('areas')} action={<button onClick={(e) => { e.stopPropagation(); onAddArea(); }} className="flex items-center gap-1 text-xs font-medium text-[#0da1c7] hover:underline"><Plus className="w-3 h-3" />Add Area</button>}>
            <div className="space-y-3">
              {building.areas.map((area, aIdx) => (
                <AreaCard key={area.id} area={area} index={aIdx} canRemove={building.areas.length > 1} effectivePropertyType={applicablePropertyType} onUpdate={(updates) => onUpdateArea(area.id, updates)} onRemove={() => onRemoveArea(area.id)} />
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

// =================================================================
// COLLAPSIBLE SECTION
// =================================================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function CollapsibleSection({ title, icon, isExpanded, onToggle, children, action }: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <span className="text-[#1c3643]">{icon}</span>
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </button>
      {isExpanded && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

// =================================================================
// AGE & ECONOMIC LIFE SECTION
// =================================================================

interface AgeEconomicLifeSectionProps {
  building: ImprovementBuilding;
  actualAge: number | null;
  remainingLife: number | null;
  depreciation: number | null;
  onUpdate: (updates: Partial<ImprovementBuilding>) => void;
}

function AgeEconomicLifeSection({ building, actualAge, remainingLife, depreciation, onUpdate }: AgeEconomicLifeSectionProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcQuality, setCalcQuality] = useState<string | null>(null);
  const [calcCondition, setCalcCondition] = useState<string | null>(null);
  const [calcRemodel, setCalcRemodel] = useState<string | null>(null);

  const qualityOptions = [
    { value: 'excellent', label: 'Excellent', life: 60, desc: '55-65 yr life' },
    { value: 'average', label: 'Average', life: 45, desc: '40-50 yr life' },
    { value: 'fair', label: 'Fair/Poor', life: 30, desc: '25-35 yr life' },
  ];

  const conditionOptions = [
    { value: 'excellent', label: 'Excellent', adjustment: -0.3, color: 'text-green-600' },
    { value: 'good', label: 'Good', adjustment: -0.15, color: 'text-green-600' },
    { value: 'average', label: 'Average', adjustment: 0, color: 'text-gray-500' },
    { value: 'fair', label: 'Fair', adjustment: 0.15, color: 'text-amber-600' },
    { value: 'poor', label: 'Poor', adjustment: 0.3, color: 'text-red-600' },
  ];

  const remodelOptions = [
    { value: 'major', label: 'Major', adjustment: -0.4, color: 'text-green-600' },
    { value: 'moderate', label: 'Moderate', adjustment: -0.2, color: 'text-green-600' },
    { value: 'minor', label: 'Minor', adjustment: -0.1, color: 'text-green-600' },
    { value: 'none', label: 'None', adjustment: 0, color: 'text-gray-500' },
  ];

  const calcEconomicLife = qualityOptions.find(q => q.value === calcQuality)?.life ?? null;
  let calcEffectiveAge: number | null = null;
  if (actualAge !== null && calcQuality && calcCondition && calcRemodel) {
    const conditionAdj = conditionOptions.find(c => c.value === calcCondition)?.adjustment ?? 0;
    const remodelAdj = remodelOptions.find(r => r.value === calcRemodel)?.adjustment ?? 0;
    calcEffectiveAge = Math.max(0, Math.round(actualAge * (1 + conditionAdj + remodelAdj)));
  }
  let calcDepreciation: number | null = null;
  if (calcEffectiveAge !== null && calcEconomicLife !== null && calcEconomicLife > 0) {
    calcDepreciation = Math.min(100, Math.round((calcEffectiveAge / calcEconomicLife) * 100));
  }

  const applyCalculatedValues = () => {
    if (calcEconomicLife !== null) onUpdate({ totalEconomicLife: calcEconomicLife });
    if (calcEffectiveAge !== null) onUpdate({ effectiveAge: calcEffectiveAge });
    setShowCalculator(false);
  };

  const formatAdjustment = (adj: number) => adj === 0 ? '±0%' : adj > 0 ? `+${Math.round(adj * 100)}%` : `${Math.round(adj * 100)}%`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Actual Age</label><div className="flex items-center gap-2"><input type="text" value={actualAge !== null ? actualAge : ''} readOnly placeholder="Auto" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700" /><span className="text-xs text-gray-500">yrs</span></div></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Effective Age</label><div className="flex items-center gap-2"><input type="number" value={building.effectiveAge ?? ''} onChange={(e) => onUpdate({ effectiveAge: e.target.value ? Number(e.target.value) : undefined })} placeholder={actualAge !== null ? `Suggest: ${actualAge}` : 'Enter'} min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" /><span className="text-xs text-gray-500">yrs</span></div></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Total Economic Life</label><div className="flex items-center gap-2"><input type="number" value={building.totalEconomicLife ?? 50} onChange={(e) => onUpdate({ totalEconomicLife: e.target.value ? Number(e.target.value) : 50 })} min="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" /><span className="text-xs text-gray-500">yrs</span></div></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Remaining Life</label><div className="flex items-center gap-2"><input type="text" value={remainingLife !== null ? remainingLife : ''} readOnly placeholder="Auto" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700" /><span className="text-xs text-gray-500">yrs</span></div></div>
      </div>

      <div className="p-4 bg-white border-2 border-[#0da1c7]/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0da1c7]/10 flex items-center justify-center"><Calculator className="w-5 h-5 text-[#0da1c7]" /></div>
            <div><p className="font-semibold text-gray-800">Physical Depreciation (Age-Life Method)</p><p className="text-xs text-gray-500">Effective Age / Total Economic Life</p></div>
          </div>
          <span className="text-2xl font-bold text-[#0da1c7]">{depreciation !== null ? `${depreciation}%` : '--'}</span>
        </div>
      </div>

      <button type="button" onClick={() => setShowCalculator(!showCalculator)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors">
        <div className="flex items-center gap-2"><Calculator className="w-5 h-5 text-[#0da1c7]" /><span className="font-medium text-gray-700">Need help? Use the Effective Age Calculator</span></div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
      </button>

      {showCalculator && (
        <div className="mt-3 p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-5">
          <div><label className="block text-sm font-semibold text-gray-800 mb-2">1. Construction Quality - Sets Economic Life</label><div className="grid grid-cols-3 gap-3">{qualityOptions.map((opt) => (<button key={opt.value} type="button" onClick={() => setCalcQuality(opt.value)} className={`p-3 rounded-lg border-2 text-center transition-all ${calcQuality === opt.value ? 'border-[#0da1c7] bg-[#0da1c7]/10' : 'border-gray-200 hover:border-gray-300'}`}><span className="block font-medium text-gray-800">{opt.label}</span><span className="block text-xs text-gray-500">{opt.desc}</span></button>))}</div></div>
          <div><label className="block text-sm font-semibold text-gray-800 mb-2">2. Current Condition - Adjusts Effective Age</label><div className="grid grid-cols-5 gap-2">{conditionOptions.map((opt) => (<button key={opt.value} type="button" onClick={() => setCalcCondition(opt.value)} className={`p-2 rounded-lg border-2 text-center transition-all ${calcCondition === opt.value ? 'border-[#0da1c7] bg-[#0da1c7]/10' : 'border-gray-200 hover:border-gray-300'}`}><span className="block font-medium text-sm text-gray-800">{opt.label}</span><span className={`block text-xs ${opt.color}`}>{formatAdjustment(opt.adjustment)}</span></button>))}</div></div>
          <div><label className="block text-sm font-semibold text-gray-800 mb-2">3. Remodeling Impact - Further Adjustment</label><div className="grid grid-cols-4 gap-2">{remodelOptions.map((opt) => (<button key={opt.value} type="button" onClick={() => setCalcRemodel(opt.value)} className={`p-2 rounded-lg border-2 text-center transition-all ${calcRemodel === opt.value ? 'border-[#0da1c7] bg-[#0da1c7]/10' : 'border-gray-200 hover:border-gray-300'}`}><span className="block font-medium text-sm text-gray-800">{opt.label}</span><span className={`block text-xs ${opt.color}`}>{formatAdjustment(opt.adjustment)}</span></button>))}</div></div>
          <div className="bg-[#0da1c7]/5 rounded-xl p-4 border border-[#0da1c7]/20">
            <div className="grid grid-cols-3 gap-4 text-center"><div><p className="text-xs text-gray-500 uppercase mb-1">Economic Life</p><p className="text-xl font-bold text-gray-800">{calcEconomicLife !== null ? calcEconomicLife : '--'}</p><p className="text-xs text-gray-400">years</p></div><div><p className="text-xs text-gray-500 uppercase mb-1">Effective Age</p><p className="text-xl font-bold text-[#0da1c7]">{calcEffectiveAge !== null ? calcEffectiveAge : '--'}</p><p className="text-xs text-gray-400">years</p></div><div><p className="text-xs text-gray-500 uppercase mb-1">Depreciation</p><p className="text-xl font-bold text-gray-800">{calcDepreciation !== null ? `${calcDepreciation}%` : '--%'}</p></div></div>
            <button type="button" onClick={applyCalculatedValues} disabled={calcEconomicLife === null || calcEffectiveAge === null} className="mt-4 w-full py-2.5 bg-[#0da1c7] text-white rounded-lg font-medium hover:bg-[#0b8fb0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Apply These Values</button>
          </div>
        </div>
      )}
    </div>
  );
}

// =================================================================
// AREA CARD
// =================================================================

interface AreaCardProps {
  area: ImprovementArea;
  index: number;
  canRemove: boolean;
  effectivePropertyType?: ApplicablePropertyType;
  onUpdate: (updates: Partial<ImprovementArea>) => void;
  onRemove: () => void;
}

function AreaCard({ area, canRemove, effectivePropertyType, onUpdate, onRemove }: AreaCardProps) {
  const [showInterior, setShowInterior] = useState(false);
  
  // Get filtered area types based on building's property type
  const filteredAreaTypes = useMemo(() => {
    return getAreaTypesForBuildingType(effectivePropertyType);
  }, [effectivePropertyType]);
  
  // Get area name for display
  const currentAreaType = filteredAreaTypes.find((t: AreaTypeConfig) => t.id === area.type);
  const areaName = area.type === 'other' && area.customType ? area.customType : 
    currentAreaType?.label || area.type;

  // Default to measured if not set
  const hasMeasuredSF = area.hasMeasuredSF !== false;
  
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={area.type} onChange={(e) => onUpdate({ type: e.target.value as ImprovementArea['type'] })} className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent">
          {filteredAreaTypes.map((t: AreaTypeConfig) => (<option key={t.id} value={t.id}>{t.label}{t.isPrimary ? ' ★' : ''}</option>))}
        </select>
        {area.type === 'other' && (<input type="text" value={area.customType || ''} onChange={(e) => onUpdate({ customType: e.target.value })} placeholder="Specify type" className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" />)}
        
        {/* SF Measurement Toggle - Styled pill buttons per design system */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdate({ hasMeasuredSF: true })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
              hasMeasuredSF
                ? 'border-[#0da1c7] bg-[#0da1c7]/10 text-[#0da1c7]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Measured
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ hasMeasuredSF: false, squareFootage: null })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
              !hasMeasuredSF
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Not Measured
          </button>
        </div>
        
        {/* SF Input - Only shown when measured */}
        {hasMeasuredSF ? (
          <div className="flex items-center gap-1.5">
            <input type="number" value={area.squareFootage || ''} onChange={(e) => onUpdate({ squareFootage: e.target.value ? Number(e.target.value) : null })} placeholder="SF" className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent" />
            <select value={area.sfType} onChange={(e) => onUpdate({ sfType: e.target.value as ImprovementArea['sfType'] })} className="w-20 px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent">
              {SF_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.value}</option>))}
            </select>
          </div>
        ) : (
          <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
            Features Only
          </span>
        )}
        
        <select value={area.condition || ''} onChange={(e) => onUpdate({ condition: e.target.value })} className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent">
          <option value="">Condition</option>
          {CONDITIONS.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        {canRemove && (<button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>)}
      </div>

      <button type="button" onClick={() => setShowInterior(!showInterior)} className="flex items-center gap-2 text-xs font-medium text-[#0da1c7] hover:underline">
        {showInterior ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        Interior Features
      </button>

      {showInterior && (
        <div className="pl-4 border-l-2 border-[#0da1c7]/20">
          <InteriorFinishesInventory
            features={area.interiorFeatures}
            onChange={(updated: InteriorFeatures) => onUpdate({ interiorFeatures: updated })}
            buildingYearBuilt={area.yearBuilt}
            areaName={areaName}
            areaTypeId={area.type}
            compact
          />
        </div>
      )}
    </div>
  );
}
