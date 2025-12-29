import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { 
  Building2, 
  Factory, 
  Store, 
  Home, 
  Warehouse, 
  GraduationCap,
  Tractor,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { 
  PROPERTY_TYPES, 
  OCCUPANCY_CODES, 
  getOccupancyCodesByPropertyType,
  getPropertyType,
  getOccupancyCode,
  type PropertyType,
  type OccupancyCode 
} from '../constants/marshallSwift';

// =================================================================
// TYPES
// =================================================================

interface BuildingTypeSelectorProps {
  /**
   * Currently selected property type (Tier 2).
   * Null means inherited from wizard default.
   */
  propertyTypeOverride: string | undefined;
  
  /**
   * Currently selected occupancy code (Tier 3).
   * Null means inherited from wizard default.
   */
  msOccupancyCodeOverride: string | undefined;
  
  /**
   * The wizard-level default property type (from Setup page).
   */
  defaultPropertyType?: string;
  
  /**
   * The wizard-level default occupancy code (from Setup page).
   */
  defaultOccupancyCode?: string;
  
  /**
   * Callback when property type changes.
   */
  onPropertyTypeChange: (propertyTypeId: string | undefined) => void;
  
  /**
   * Callback when occupancy code changes.
   */
  onOccupancyCodeChange: (occupancyCodeId: string | undefined) => void;
  
  /**
   * Whether selector is disabled.
   */
  disabled?: boolean;
  
  /**
   * Compact mode shows just a badge that expands on click.
   */
  compact?: boolean;
}

// =================================================================
// ICON MAPPING
// =================================================================

const PROPERTY_TYPE_ICONS: Record<string, typeof Building2> = {
  'office': Building2,
  'retail': Store,
  'industrial': Factory,
  'multifamily': Home,
  'institutional': GraduationCap,
  'agricultural': Tractor,
  'single-family': Home,
  'townhouse': Home,
  'duplex-fourplex': Home,
  'manufactured': Home,
  'adu': Home,
  'vacant-land': Warehouse,
  'development-site': Warehouse,
};

function getPropertyTypeIcon(propertyTypeId: string): typeof Building2 {
  return PROPERTY_TYPE_ICONS[propertyTypeId] || Building2;
}

// =================================================================
// COMPONENT
// =================================================================

const BuildingTypeSelector: FC<BuildingTypeSelectorProps> = ({
  propertyTypeOverride,
  msOccupancyCodeOverride,
  defaultPropertyType,
  defaultOccupancyCode,
  onPropertyTypeChange,
  onOccupancyCodeChange,
  disabled = false,
  compact = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  
  // Compute effective values
  const effectivePropertyType = propertyTypeOverride || defaultPropertyType;
  const effectiveOccupancyCode = msOccupancyCodeOverride || defaultOccupancyCode;
  const isInherited = !propertyTypeOverride && !msOccupancyCodeOverride;
  
  // Get current display labels
  const currentPropertyType = effectivePropertyType ? getPropertyType(effectivePropertyType) : null;
  const currentOccupancyCode = effectiveOccupancyCode ? getOccupancyCode(effectiveOccupancyCode) : null;
  
  // Filter commercial property types for building selector
  const commercialPropertyTypes = useMemo(() => 
    PROPERTY_TYPES.filter(pt => pt.category === 'commercial'),
    []
  );
  
  // Get occupancy codes for selected property type
  const availableOccupancyCodes = useMemo(() => {
    const typeId = selectedPropertyType || effectivePropertyType;
    if (!typeId) return [];
    return getOccupancyCodesByPropertyType(typeId);
  }, [selectedPropertyType, effectivePropertyType]);
  
  // Handle property type selection
  const handlePropertyTypeSelect = (propertyType: PropertyType) => {
    setSelectedPropertyType(propertyType.id);
    
    // If there's only one occupancy code, auto-select it
    const codes = getOccupancyCodesByPropertyType(propertyType.id);
    if (codes.length === 1) {
      handleOccupancyCodeSelect(codes[0]);
    }
  };
  
  // Handle occupancy code selection
  const handleOccupancyCodeSelect = (occupancyCode: OccupancyCode) => {
    // Check if this is the same as the default
    const isDefaultPropertyType = occupancyCode.propertyTypeId === defaultPropertyType;
    const isDefaultOccupancy = occupancyCode.id === defaultOccupancyCode;
    
    if (isDefaultPropertyType && isDefaultOccupancy) {
      // Clear overrides - inherit from default
      onPropertyTypeChange(undefined);
      onOccupancyCodeChange(undefined);
    } else {
      // Set overrides
      onPropertyTypeChange(occupancyCode.propertyTypeId);
      onOccupancyCodeChange(occupancyCode.id);
    }
    
    setIsExpanded(false);
    setSelectedPropertyType(null);
  };
  
  // Handle clearing override
  const handleClearOverride = () => {
    onPropertyTypeChange(undefined);
    onOccupancyCodeChange(undefined);
    setIsExpanded(false);
    setSelectedPropertyType(null);
  };
  
  // Render collapsed badge
  const renderCollapsedBadge = () => {
    const Icon = effectivePropertyType ? getPropertyTypeIcon(effectivePropertyType) : Building2;
    const label = currentOccupancyCode?.label || currentPropertyType?.label || 'Select Type';
    
    return (
      <button
        type="button"
        onClick={() => !disabled && setIsExpanded(true)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-all cursor-pointer
          ${isInherited 
            ? 'bg-gray-100 text-gray-600 border border-gray-200' 
            : 'bg-[#0da1c7]/10 text-[#0da1c7] border border-[#0da1c7]/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0da1c7]/20'}
        `}
      >
        <Icon className="w-4 h-4" />
        <span className="truncate max-w-[180px]">{label}</span>
        {isInherited && (
          <span className="text-xs text-gray-400 ml-1">(Inherited)</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>
    );
  };
  
  // Render expanded selector
  const renderExpandedSelector = () => {
    const showOccupancyCodes = selectedPropertyType || (effectivePropertyType && availableOccupancyCodes.length > 0);
    
    return (
      <div className="absolute z-50 top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 w-[400px] max-h-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">
            {selectedPropertyType ? 'Select Occupancy Type' : 'Select Building Type'}
          </h4>
          <div className="flex items-center gap-2">
            {!isInherited && (
              <button
                type="button"
                onClick={handleClearOverride}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear Override
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setSelectedPropertyType(null);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronUp className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Back button when showing occupancy codes */}
        {selectedPropertyType && (
          <button
            type="button"
            onClick={() => setSelectedPropertyType(null)}
            className="w-full px-4 py-2 text-left text-sm text-[#0da1c7] hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Building Types
          </button>
        )}
        
        {/* Property Type Grid */}
        {!selectedPropertyType && (
          <div className="p-3 grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">
            {commercialPropertyTypes.map((pt) => {
              const Icon = getPropertyTypeIcon(pt.id);
              const isSelected = effectivePropertyType === pt.id;
              
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => handlePropertyTypeSelect(pt)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg text-left transition-all
                    ${isSelected 
                      ? 'bg-[#0da1c7]/10 border-2 border-[#0da1c7]' 
                      : 'bg-white border border-gray-200 hover:border-[#0da1c7]/50 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? 'bg-[#0da1c7]/20' : 'bg-gray-100'}
                  `}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#0da1c7]' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isSelected ? 'text-[#0da1c7]' : 'text-gray-900'}`}>
                      {pt.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{pt.msSection}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0da1c7]" />}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Occupancy Code List */}
        {showOccupancyCodes && selectedPropertyType && (
          <div className="max-h-[320px] overflow-y-auto">
            {availableOccupancyCodes.map((oc) => {
              const isSelected = effectiveOccupancyCode === oc.id;
              const isDefault = oc.id === defaultOccupancyCode;
              
              return (
                <button
                  key={oc.id}
                  type="button"
                  onClick={() => handleOccupancyCodeSelect(oc)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-gray-50
                    ${isSelected 
                      ? 'bg-[#0da1c7]/10' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-[#0da1c7]' : 'text-gray-900'}`}>
                        {oc.label}
                      </span>
                      {isDefault && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{oc.description}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{oc.msSection} {oc.msPage}</span>
                      <span>{oc.defaultEconomicLife} yr life</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0da1c7] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="relative">
      {compact && !isExpanded && renderCollapsedBadge()}
      {isExpanded && renderExpandedSelector()}
      
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsExpanded(false);
            setSelectedPropertyType(null);
          }}
        />
      )}
    </div>
  );
};

export default BuildingTypeSelector;

