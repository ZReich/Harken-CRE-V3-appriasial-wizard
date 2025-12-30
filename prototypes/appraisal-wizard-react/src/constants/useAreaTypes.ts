/**
 * Use Area Types by Building Type
 * 
 * Defines the available use area types for each building/property type.
 * Used to dynamically filter area type dropdown options based on the
 * building's M&S occupancy code or property type override.
 * 
 * Each area type includes:
 * - Default interior finishes appropriate for that area
 * - Whether it's a "primary" area type for the building type (shown first)
 * - Applicable building types
 */

import type { ApplicablePropertyType } from './buildingComponents';

// =================================================================
// TYPES
// =================================================================

export type AreaTypeId = 
  // Industrial/Warehouse
  | 'warehouse'
  | 'dock'
  | 'office-mezz'
  | 'break-room'
  | 'mechanical-room'
  | 'cold-storage'
  | 'manufacturing'
  | 'clean-room'
  // Office
  | 'office'
  | 'conference'
  | 'lobby'
  | 'restroom'
  | 'storage'
  | 'server-room'
  | 'kitchen-break'
  // Retail
  | 'sales-floor'
  | 'stockroom'
  | 'fitting-room'
  | 'service-area'
  // Residential
  | 'living-area'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'garage'
  | 'basement'
  | 'utility'
  | 'laundry'
  // Multifamily
  | 'unit'
  | 'common-area'
  | 'leasing-office'
  | 'fitness'
  | 'pool-area'
  | 'parking-garage'
  // Agricultural
  | 'barn'
  | 'shop'
  | 'tack-room'
  // Universal
  | 'flex'
  | 'other';

export interface AreaTypeConfig {
  id: AreaTypeId;
  label: string;
  description?: string;
  
  /**
   * Building types this area type is applicable to.
   * If undefined or empty, it's universal (applies to all).
   */
  applicableBuildingTypes?: ApplicablePropertyType[];
  
  /**
   * Whether this is a primary/common area type for its applicable buildings.
   * Primary types appear at the top of dropdowns.
   */
  isPrimary?: boolean;
  
  /**
   * Default interior finish recommendations for this area type.
   * Used to pre-populate interior finish selections.
   */
  defaultFinishes?: {
    ceilingTypeIds?: string[];
    flooringTypeIds?: string[];
    wallTypeIds?: string[];
    plumbingTypeIds?: string[];
    lightingTypeIds?: string[];
  };
  
  /**
   * Icon name (lucide-react) for UI display.
   */
  icon?: string;
}

// =================================================================
// AREA TYPE DEFINITIONS
// =================================================================

export const AREA_TYPES: AreaTypeConfig[] = [
  // Industrial/Warehouse Areas
  {
    id: 'warehouse',
    label: 'Warehouse',
    description: 'General warehouse/storage space',
    applicableBuildingTypes: ['industrial'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open', 'ceiling-exposed-painted'],
      flooringTypeIds: ['flooring-concrete-bare', 'flooring-concrete-sealed', 'flooring-epoxy'],
      wallTypeIds: ['wall-int-cmu-bare', 'wall-int-cmu-painted', 'wall-int-metal-liner'],
    },
    icon: 'Warehouse',
  },
  {
    id: 'dock',
    label: 'Dock / Shipping',
    description: 'Loading dock and shipping areas',
    applicableBuildingTypes: ['industrial'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open'],
      flooringTypeIds: ['flooring-concrete-bare'],
      wallTypeIds: ['wall-int-cmu-bare'],
    },
    icon: 'Truck',
  },
  {
    id: 'office-mezz',
    label: 'Office Mezzanine',
    description: 'Mezzanine office space within warehouse',
    applicableBuildingTypes: ['industrial'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended'],
      flooringTypeIds: ['flooring-carpet', 'flooring-vct'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'LayoutTemplate',
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    description: 'Production / assembly area',
    applicableBuildingTypes: ['industrial'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-painted'],
      flooringTypeIds: ['flooring-epoxy', 'flooring-concrete-sealed'],
      wallTypeIds: ['wall-int-cmu-painted'],
    },
    icon: 'Factory',
  },
  {
    id: 'cold-storage',
    label: 'Cold Storage',
    description: 'Refrigerated/freezer space',
    applicableBuildingTypes: ['industrial'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-metal'],
      flooringTypeIds: ['flooring-concrete-sealed'],
      wallTypeIds: ['wall-int-metal-liner'],
    },
    icon: 'Snowflake',
  },
  {
    id: 'clean-room',
    label: 'Clean Room',
    description: 'Controlled environment space',
    applicableBuildingTypes: ['industrial', 'office'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-metal'],
      flooringTypeIds: ['flooring-epoxy'],
      wallTypeIds: ['wall-int-glass-partition'],
    },
    icon: 'Sparkles',
  },
  
  // Office Areas
  {
    id: 'office',
    label: 'Office',
    description: 'General office space',
    applicableBuildingTypes: ['office', 'retail', 'institutional', 'multifamily'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended', 'ceiling-drywall'],
      flooringTypeIds: ['flooring-carpet', 'flooring-carpet-tile', 'flooring-lvp-lvt'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Building2',
  },
  {
    id: 'conference',
    label: 'Conference',
    description: 'Meeting / conference rooms',
    applicableBuildingTypes: ['office', 'institutional'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended', 'ceiling-drywall'],
      flooringTypeIds: ['flooring-carpet', 'flooring-hardwood'],
      wallTypeIds: ['wall-int-drywall-painted', 'wall-int-glass-partition'],
    },
    icon: 'Users',
  },
  {
    id: 'lobby',
    label: 'Lobby',
    description: 'Entry / reception area',
    applicableBuildingTypes: ['office', 'retail', 'multifamily', 'institutional'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-porcelain-tile', 'flooring-hardwood'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'DoorOpen',
  },
  {
    id: 'server-room',
    label: 'Server Room',
    description: 'Data/telecommunications room',
    applicableBuildingTypes: ['office', 'industrial'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended'],
      flooringTypeIds: ['flooring-vct'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Server',
  },
  
  // Common/Universal Areas
  {
    id: 'restroom',
    label: 'Restroom',
    description: 'Bathroom / restroom facilities',
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-ceramic-tile', 'flooring-porcelain-tile'],
      wallTypeIds: ['wall-int-tile-ceramic', 'wall-int-drywall-painted'],
    },
    icon: 'Bath',
  },
  {
    id: 'break-room',
    label: 'Break Room',
    description: 'Employee break / lunch area',
    applicableBuildingTypes: ['office', 'industrial', 'retail', 'institutional'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended'],
      flooringTypeIds: ['flooring-vct', 'flooring-lvp-lvt'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Coffee',
  },
  {
    id: 'kitchen-break',
    label: 'Kitchen / Kitchenette',
    description: 'Commercial kitchenette',
    applicableBuildingTypes: ['office', 'multifamily', 'institutional'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-ceramic-tile', 'flooring-vct'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'UtensilsCrossed',
  },
  {
    id: 'mechanical-room',
    label: 'Mechanical Room',
    description: 'HVAC / utility equipment room',
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open'],
      flooringTypeIds: ['flooring-concrete-bare'],
      wallTypeIds: ['wall-int-cmu-bare', 'wall-int-drywall-painted'],
    },
    icon: 'Settings',
  },
  {
    id: 'storage',
    label: 'Storage',
    description: 'General storage area',
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open', 'ceiling-drop-suspended'],
      flooringTypeIds: ['flooring-concrete-bare', 'flooring-vct'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Package',
  },
  
  // Retail Areas
  {
    id: 'sales-floor',
    label: 'Sales Floor',
    description: 'Main retail selling area',
    applicableBuildingTypes: ['retail'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended', 'ceiling-drywall'],
      flooringTypeIds: ['flooring-porcelain-tile', 'flooring-lvp-lvt', 'flooring-polished-concrete'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'ShoppingBag',
  },
  {
    id: 'stockroom',
    label: 'Stockroom',
    description: 'Back of house inventory storage',
    applicableBuildingTypes: ['retail'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open'],
      flooringTypeIds: ['flooring-concrete-sealed'],
      wallTypeIds: ['wall-int-drywall-painted', 'wall-int-cmu-painted'],
    },
    icon: 'Archive',
  },
  {
    id: 'fitting-room',
    label: 'Fitting Room',
    description: 'Dressing / fitting rooms',
    applicableBuildingTypes: ['retail'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-carpet', 'flooring-lvp-lvt'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Shirt',
  },
  {
    id: 'service-area',
    label: 'Service Area',
    description: 'Customer service / checkout',
    applicableBuildingTypes: ['retail'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended'],
      flooringTypeIds: ['flooring-porcelain-tile', 'flooring-lvp-lvt'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Headphones',
  },
  
  // Residential Areas
  {
    id: 'living-area',
    label: 'Living Area',
    description: 'Living room / family room',
    applicableBuildingTypes: ['residential', 'multifamily'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-hardwood', 'flooring-lvp-lvt', 'flooring-carpet'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Sofa',
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    description: 'Residential kitchen',
    applicableBuildingTypes: ['residential', 'multifamily'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-ceramic-tile', 'flooring-lvp-lvt', 'flooring-hardwood'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'CookingPot',
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    description: 'Residential bedroom',
    applicableBuildingTypes: ['residential', 'multifamily'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-carpet', 'flooring-hardwood', 'flooring-lvp-lvt'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Bed',
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    description: 'Residential bathroom',
    applicableBuildingTypes: ['residential', 'multifamily'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-ceramic-tile', 'flooring-porcelain-tile', 'flooring-lvp-lvt'],
      wallTypeIds: ['wall-int-tile-ceramic', 'wall-int-drywall-painted'],
    },
    icon: 'ShowerHead',
  },
  {
    id: 'garage',
    label: 'Garage',
    description: 'Attached or detached garage',
    applicableBuildingTypes: ['residential'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open', 'ceiling-drywall'],
      flooringTypeIds: ['flooring-concrete-bare', 'flooring-epoxy'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Car',
  },
  {
    id: 'basement',
    label: 'Basement',
    description: 'Finished or unfinished basement',
    applicableBuildingTypes: ['residential'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended', 'ceiling-drywall'],
      flooringTypeIds: ['flooring-carpet', 'flooring-lvp-lvt', 'flooring-concrete-sealed'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Layers',
  },
  {
    id: 'utility',
    label: 'Utility Room',
    description: 'Mechanical / utility space',
    applicableBuildingTypes: ['residential', 'multifamily'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open'],
      flooringTypeIds: ['flooring-concrete-bare', 'flooring-vct'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Wrench',
  },
  {
    id: 'laundry',
    label: 'Laundry',
    description: 'Laundry room',
    applicableBuildingTypes: ['residential', 'multifamily'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-ceramic-tile', 'flooring-lvp-lvt'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'WashingMachine',
  },
  
  // Multifamily Common Areas
  {
    id: 'unit',
    label: 'Apartment Unit',
    description: 'Individual rental unit',
    applicableBuildingTypes: ['multifamily'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-lvp-lvt', 'flooring-carpet'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Home',
  },
  {
    id: 'common-area',
    label: 'Common Area',
    description: 'Hallways / shared spaces',
    applicableBuildingTypes: ['multifamily', 'office', 'retail'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall', 'ceiling-drop-suspended'],
      flooringTypeIds: ['flooring-lvp-lvt', 'flooring-carpet'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Users',
  },
  {
    id: 'leasing-office',
    label: 'Leasing Office',
    description: 'Property management office',
    applicableBuildingTypes: ['multifamily'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-lvp-lvt', 'flooring-hardwood'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'ClipboardList',
  },
  {
    id: 'fitness',
    label: 'Fitness Center',
    description: 'Exercise / gym facility',
    applicableBuildingTypes: ['multifamily', 'office'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall', 'ceiling-exposed-painted'],
      flooringTypeIds: ['flooring-rubber'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'Dumbbell',
  },
  {
    id: 'pool-area',
    label: 'Pool / Spa Area',
    description: 'Indoor pool or spa',
    applicableBuildingTypes: ['multifamily'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drywall'],
      flooringTypeIds: ['flooring-ceramic-tile'],
      wallTypeIds: ['wall-int-tile-ceramic'],
    },
    icon: 'Waves',
  },
  {
    id: 'parking-garage',
    label: 'Parking Garage',
    description: 'Covered parking structure',
    applicableBuildingTypes: ['multifamily', 'office', 'retail'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open'],
      flooringTypeIds: ['flooring-concrete-bare'],
      wallTypeIds: ['wall-int-cmu-bare'],
    },
    icon: 'ParkingCircle',
  },
  
  // Agricultural Areas
  {
    id: 'barn',
    label: 'Barn',
    description: 'General barn area',
    applicableBuildingTypes: ['agricultural'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open'],
      flooringTypeIds: ['flooring-concrete-bare'],
      wallTypeIds: ['wall-int-metal-liner'],
    },
    icon: 'Tractor',
  },
  {
    id: 'shop',
    label: 'Shop',
    description: 'Equipment shop / maintenance',
    applicableBuildingTypes: ['agricultural', 'industrial'],
    isPrimary: true,
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-open'],
      flooringTypeIds: ['flooring-concrete-bare', 'flooring-epoxy'],
      wallTypeIds: ['wall-int-metal-liner', 'wall-int-drywall-painted'],
    },
    icon: 'Hammer',
  },
  {
    id: 'tack-room',
    label: 'Tack Room',
    description: 'Equipment / saddle storage',
    applicableBuildingTypes: ['agricultural'],
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-exposed-painted'],
      flooringTypeIds: ['flooring-concrete-sealed'],
      wallTypeIds: ['wall-int-paneling-wood'],
    },
    icon: 'Briefcase',
  },
  
  // Universal/Flexible
  {
    id: 'flex',
    label: 'Flex Space',
    description: 'Multi-use flexible space',
    defaultFinishes: {
      ceilingTypeIds: ['ceiling-drop-suspended', 'ceiling-exposed-painted'],
      flooringTypeIds: ['flooring-concrete-sealed', 'flooring-vct'],
      wallTypeIds: ['wall-int-drywall-painted'],
    },
    icon: 'LayoutGrid',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other / custom area type',
    icon: 'Plus',
  },
];

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Get all area types applicable for a given building type.
 * Returns primary types first, then other applicable types.
 */
export function getAreaTypesForBuildingType(
  buildingType?: ApplicablePropertyType
): AreaTypeConfig[] {
  const applicable = AREA_TYPES.filter(area => {
    // Universal areas (no applicableBuildingTypes) are always included
    if (!area.applicableBuildingTypes || area.applicableBuildingTypes.length === 0) {
      return true;
    }
    // If building type specified, check if area is applicable
    if (buildingType) {
      return area.applicableBuildingTypes.includes(buildingType);
    }
    // If no building type specified, return all
    return true;
  });
  
  // Sort: primary first, then alphabetically
  return applicable.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.label.localeCompare(b.label);
  });
}

/**
 * Get an area type config by ID.
 */
export function getAreaTypeById(id: AreaTypeId | string): AreaTypeConfig | undefined {
  return AREA_TYPES.find(area => area.id === id);
}

/**
 * Get default interior finishes for an area type.
 */
export function getDefaultFinishesForAreaType(areaTypeId: AreaTypeId | string): AreaTypeConfig['defaultFinishes'] | undefined {
  const areaType = getAreaTypeById(areaTypeId);
  return areaType?.defaultFinishes;
}

/**
 * Check if an area type is applicable for a building type.
 */
export function isAreaTypeApplicable(
  areaTypeId: AreaTypeId | string,
  buildingType?: ApplicablePropertyType
): boolean {
  const areaType = getAreaTypeById(areaTypeId);
  if (!areaType) return false;
  
  // Universal areas are always applicable
  if (!areaType.applicableBuildingTypes || areaType.applicableBuildingTypes.length === 0) {
    return true;
  }
  
  // If no building type specified, consider all applicable
  if (!buildingType) return true;
  
  return areaType.applicableBuildingTypes.includes(buildingType);
}

/**
 * Map legacy area type strings to new AreaTypeId.
 * Used for backwards compatibility with existing data.
 */
export function mapLegacyAreaType(legacyType: string): AreaTypeId {
  const mapping: Record<string, AreaTypeId> = {
    'office': 'office',
    'warehouse': 'warehouse',
    'retail': 'sales-floor',
    'apartment': 'unit',
    'flex': 'flex',
    'industrial': 'manufacturing',
    'manufacturing': 'manufacturing',
    'storage': 'storage',
    'mezzanine': 'office-mezz',
    'other': 'other',
  };
  return mapping[legacyType.toLowerCase()] || 'other';
}

