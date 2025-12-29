/**
 * useFilteredBuildingComponents Hook
 * 
 * Provides filtered building component options based on the effective
 * property type and category for a building. Used by ExteriorFeaturesInventory
 * and MechanicalSystemsInventory to show relevant component options.
 * 
 * Features:
 * - Filters components by property type (industrial, office, residential, etc.)
 * - Filters by property category (residential vs commercial)
 * - Returns both filtered "recommended" and all "other" options
 * - Sorts with primary/recommended components first
 */

import { useMemo } from 'react';
import {
  type ApplicablePropertyType,
  type ExteriorCategory,
  type MechanicalCategory,
  type BuildingComponentType,
  getFilteredExteriorTypes,
  getFilteredMechanicalTypes,
  getExteriorTypesByCategory,
  getMechanicalTypesByCategory,
  occupancyCodeToPropertyType,
} from '../constants/buildingComponents';
import type { PropertyCategory } from '../constants/marshallSwift';
import { getOccupancyCode, getPropertyType } from '../constants/marshallSwift';

// =================================================================
// TYPES
// =================================================================

export interface FilteredComponentsResult {
  /**
   * Components recommended for the property type (filtered & sorted).
   */
  recommended: BuildingComponentType[];
  
  /**
   * All other components NOT in the recommended list.
   * Shown in an "Other Options" expandable section.
   */
  other: BuildingComponentType[];
  
  /**
   * All components (unfiltered) for complete access.
   */
  all: BuildingComponentType[];
  
  /**
   * The effective property type used for filtering.
   */
  effectivePropertyType: ApplicablePropertyType | undefined;
  
  /**
   * Whether the building is using an override vs inherited type.
   */
  isOverridden: boolean;
}

export interface UseFilteredBuildingComponentsParams {
  /**
   * The occupancy code from the wizard (Setup page default).
   */
  defaultOccupancyCode?: string;
  
  /**
   * Property type override set on this specific building.
   */
  buildingPropertyTypeOverride?: string;
  
  /**
   * Occupancy code override set on this specific building.
   */
  buildingOccupancyCodeOverride?: string;
  
  /**
   * Property category (residential | commercial | land).
   * Used for more granular filtering.
   */
  propertyCategory?: PropertyCategory;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Derive the ApplicablePropertyType from an occupancy code ID.
 */
function getPropertyTypeFromOccupancyCode(occupancyCodeId: string): ApplicablePropertyType | undefined {
  const occupancyCode = getOccupancyCode(occupancyCodeId);
  if (!occupancyCode) return undefined;
  
  return occupancyCodeToPropertyType(occupancyCode.propertyTypeId);
}

/**
 * Derive the PropertyCategory from an occupancy code's property type.
 */
function getPropertyCategoryFromOccupancyCode(occupancyCodeId: string): PropertyCategory | undefined {
  const occupancyCode = getOccupancyCode(occupancyCodeId);
  if (!occupancyCode) return undefined;
  
  const propertyType = getPropertyType(occupancyCode.propertyTypeId);
  return propertyType?.category;
}

// =================================================================
// HOOK
// =================================================================

export function useFilteredBuildingComponents(
  params: UseFilteredBuildingComponentsParams
): {
  getExteriorComponents: (category: ExteriorCategory) => FilteredComponentsResult;
  getMechanicalComponents: (category: MechanicalCategory) => FilteredComponentsResult;
  effectivePropertyType: ApplicablePropertyType | undefined;
  effectivePropertyCategory: PropertyCategory | undefined;
  isOverridden: boolean;
} {
  const {
    defaultOccupancyCode,
    buildingPropertyTypeOverride,
    buildingOccupancyCodeOverride,
    propertyCategory: explicitCategory,
  } = params;
  
  // Compute effective occupancy code
  const effectiveOccupancyCode = buildingOccupancyCodeOverride || defaultOccupancyCode;
  
  // Derive effective property type
  const effectivePropertyType = useMemo((): ApplicablePropertyType | undefined => {
    // First check building-level override
    if (buildingPropertyTypeOverride) {
      return occupancyCodeToPropertyType(buildingPropertyTypeOverride);
    }
    
    // Then derive from occupancy code
    if (effectiveOccupancyCode) {
      return getPropertyTypeFromOccupancyCode(effectiveOccupancyCode);
    }
    
    return undefined;
  }, [buildingPropertyTypeOverride, effectiveOccupancyCode]);
  
  // Derive effective property category
  const effectivePropertyCategory = useMemo((): PropertyCategory | undefined => {
    if (explicitCategory) return explicitCategory;
    
    if (effectiveOccupancyCode) {
      return getPropertyCategoryFromOccupancyCode(effectiveOccupancyCode);
    }
    
    return undefined;
  }, [explicitCategory, effectiveOccupancyCode]);
  
  // Check if building has an override
  const isOverridden = Boolean(buildingPropertyTypeOverride || buildingOccupancyCodeOverride);
  
  // Function to get filtered exterior components
  const getExteriorComponents = useMemo(() => {
    return (category: ExteriorCategory): FilteredComponentsResult => {
      const allTypes = getExteriorTypesByCategory(category);
      const recommended = getFilteredExteriorTypes(
        category,
        effectivePropertyType,
        effectivePropertyCategory
      );
      
      // "Other" = all types not in recommended
      const recommendedIds = new Set(recommended.map(c => c.id));
      const other = allTypes.filter(c => !recommendedIds.has(c.id));
      
      return {
        recommended,
        other,
        all: allTypes,
        effectivePropertyType,
        isOverridden,
      };
    };
  }, [effectivePropertyType, effectivePropertyCategory, isOverridden]);
  
  // Function to get filtered mechanical components
  const getMechanicalComponents = useMemo(() => {
    return (category: MechanicalCategory): FilteredComponentsResult => {
      const allTypes = getMechanicalTypesByCategory(category);
      const recommended = getFilteredMechanicalTypes(
        category,
        effectivePropertyType,
        effectivePropertyCategory
      );
      
      // "Other" = all types not in recommended
      const recommendedIds = new Set(recommended.map(c => c.id));
      const other = allTypes.filter(c => !recommendedIds.has(c.id));
      
      return {
        recommended,
        other,
        all: allTypes,
        effectivePropertyType,
        isOverridden,
      };
    };
  }, [effectivePropertyType, effectivePropertyCategory, isOverridden]);
  
  return {
    getExteriorComponents,
    getMechanicalComponents,
    effectivePropertyType,
    effectivePropertyCategory,
    isOverridden,
  };
}

export default useFilteredBuildingComponents;

