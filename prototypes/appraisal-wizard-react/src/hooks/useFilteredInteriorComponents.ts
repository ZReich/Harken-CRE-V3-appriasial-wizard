/**
 * useFilteredInteriorComponents Hook
 * 
 * Provides filtered interior finish component options based on the
 * area type (warehouse, office, kitchen, bathroom, etc.). Used by
 * InteriorFinishesInventory to show relevant component options for
 * each use area.
 * 
 * Features:
 * - Filters ceiling, flooring, and wall finishes by area type
 * - Provides default finish suggestions for each area type
 * - Returns both filtered "recommended" and all "other" options
 */

import { useMemo } from 'react';
import {
  type InteriorCategory,
  type BuildingComponentType,
  getFilteredInteriorTypes,
  getInteriorTypesByCategory,
  CEILING_TYPES,
  FLOORING_TYPES,
  INTERIOR_WALL_TYPES,
  INTERIOR_PLUMBING_TYPES,
  INTERIOR_LIGHTING_TYPES,
} from '../constants/buildingComponents';
import {
  type AreaTypeId,
  getAreaTypeById,
  getDefaultFinishesForAreaType,
} from '../constants/useAreaTypes';

// =================================================================
// TYPES
// =================================================================

export interface FilteredInteriorResult {
  /**
   * Components recommended for this area type.
   * Based on defaultFinishes from area type config + applicable property types.
   */
  recommended: BuildingComponentType[];
  
  /**
   * All other components NOT in the recommended list.
   */
  other: BuildingComponentType[];
  
  /**
   * All components (unfiltered) for complete access.
   */
  all: BuildingComponentType[];
  
  /**
   * Default component IDs for this area type (for auto-population).
   */
  defaultIds: string[];
}

export interface UseFilteredInteriorComponentsParams {
  /**
   * The area type ID (e.g., 'warehouse', 'office', 'kitchen', 'bathroom').
   */
  areaType: AreaTypeId | string;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Get components that match the area type's default finish IDs.
 */
function getComponentsByIds(
  allComponents: BuildingComponentType[],
  ids?: string[]
): BuildingComponentType[] {
  if (!ids || ids.length === 0) return [];
  
  const idSet = new Set(ids);
  return allComponents.filter(c => idSet.has(c.id));
}

/**
 * Sort components with defaults first, then alphabetically.
 */
function sortWithDefaultsFirst(
  components: BuildingComponentType[],
  defaultIds: string[]
): BuildingComponentType[] {
  const defaultSet = new Set(defaultIds);
  
  return [...components].sort((a, b) => {
    const aIsDefault = defaultSet.has(a.id);
    const bIsDefault = defaultSet.has(b.id);
    
    if (aIsDefault && !bIsDefault) return -1;
    if (!aIsDefault && bIsDefault) return 1;
    
    // Then by isPrimary
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    
    return a.label.localeCompare(b.label);
  });
}

// =================================================================
// HOOK
// =================================================================

export function useFilteredInteriorComponents(
  params: UseFilteredInteriorComponentsParams
): {
  getCeilingComponents: () => FilteredInteriorResult;
  getFlooringComponents: () => FilteredInteriorResult;
  getWallComponents: () => FilteredInteriorResult;
  getPlumbingComponents: () => FilteredInteriorResult;
  getLightingComponents: () => FilteredInteriorResult;
  areaTypeLabel: string;
  defaultFinishes: {
    ceilingTypeIds: string[];
    flooringTypeIds: string[];
    wallTypeIds: string[];
    plumbingTypeIds: string[];
    lightingTypeIds: string[];
  };
} {
  const { areaType } = params;
  
  // Get area type config
  const areaTypeConfig = useMemo(() => getAreaTypeById(areaType), [areaType]);
  const areaTypeLabel = areaTypeConfig?.label || 'Area';
  
  // Get default finishes for this area type
  const defaultFinishes = useMemo(() => {
    const defaults = getDefaultFinishesForAreaType(areaType);
    return {
      ceilingTypeIds: defaults?.ceilingTypeIds || [],
      flooringTypeIds: defaults?.flooringTypeIds || [],
      wallTypeIds: defaults?.wallTypeIds || [],
      plumbingTypeIds: defaults?.plumbingTypeIds || [],
      lightingTypeIds: defaults?.lightingTypeIds || [],
    };
  }, [areaType]);
  
  // Function to get filtered ceiling components
  const getCeilingComponents = useMemo(() => {
    return (): FilteredInteriorResult => {
      const allTypes = CEILING_TYPES;
      const defaultComponents = getComponentsByIds(allTypes, defaultFinishes.ceilingTypeIds);
      
      // Recommended = defaults + any with isPrimary that aren't in defaults
      const defaultIds = new Set(defaultFinishes.ceilingTypeIds);
      const recommended = sortWithDefaultsFirst(
        allTypes.filter(c => defaultIds.has(c.id) || c.isPrimary),
        defaultFinishes.ceilingTypeIds
      );
      
      // Other = everything not in recommended
      const recommendedIds = new Set(recommended.map(c => c.id));
      const other = allTypes.filter(c => !recommendedIds.has(c.id));
      
      return {
        recommended,
        other,
        all: allTypes,
        defaultIds: defaultFinishes.ceilingTypeIds,
      };
    };
  }, [defaultFinishes.ceilingTypeIds]);
  
  // Function to get filtered flooring components
  const getFlooringComponents = useMemo(() => {
    return (): FilteredInteriorResult => {
      const allTypes = FLOORING_TYPES;
      
      // Recommended = defaults + any with isPrimary that aren't in defaults
      const defaultIds = new Set(defaultFinishes.flooringTypeIds);
      const recommended = sortWithDefaultsFirst(
        allTypes.filter(c => defaultIds.has(c.id) || c.isPrimary),
        defaultFinishes.flooringTypeIds
      );
      
      // Other = everything not in recommended
      const recommendedIds = new Set(recommended.map(c => c.id));
      const other = allTypes.filter(c => !recommendedIds.has(c.id));
      
      return {
        recommended,
        other,
        all: allTypes,
        defaultIds: defaultFinishes.flooringTypeIds,
      };
    };
  }, [defaultFinishes.flooringTypeIds]);
  
  // Function to get filtered wall components
  const getWallComponents = useMemo(() => {
    return (): FilteredInteriorResult => {
      const allTypes = INTERIOR_WALL_TYPES;
      
      // Recommended = defaults + any with isPrimary that aren't in defaults
      const defaultIds = new Set(defaultFinishes.wallTypeIds);
      const recommended = sortWithDefaultsFirst(
        allTypes.filter(c => defaultIds.has(c.id) || c.isPrimary),
        defaultFinishes.wallTypeIds
      );
      
      // Other = everything not in recommended
      const recommendedIds = new Set(recommended.map(c => c.id));
      const other = allTypes.filter(c => !recommendedIds.has(c.id));
      
      return {
        recommended,
        other,
        all: allTypes,
        defaultIds: defaultFinishes.wallTypeIds,
      };
    };
  }, [defaultFinishes.wallTypeIds]);
  
  // Function to get filtered plumbing components
  const getPlumbingComponents = useMemo(() => {
    return (): FilteredInteriorResult => {
      const allTypes = INTERIOR_PLUMBING_TYPES;
      
      // Recommended = defaults + any with isPrimary that aren't in defaults
      const defaultIds = new Set(defaultFinishes.plumbingTypeIds);
      const recommended = sortWithDefaultsFirst(
        allTypes.filter(c => defaultIds.has(c.id) || c.isPrimary),
        defaultFinishes.plumbingTypeIds
      );
      
      // Other = everything not in recommended
      const recommendedIds = new Set(recommended.map(c => c.id));
      const other = allTypes.filter(c => !recommendedIds.has(c.id));
      
      return {
        recommended,
        other,
        all: allTypes,
        defaultIds: defaultFinishes.plumbingTypeIds,
      };
    };
  }, [defaultFinishes.plumbingTypeIds]);
  
  // Function to get filtered lighting components
  const getLightingComponents = useMemo(() => {
    return (): FilteredInteriorResult => {
      const allTypes = INTERIOR_LIGHTING_TYPES;
      
      // Recommended = defaults + any with isPrimary that aren't in defaults
      const defaultIds = new Set(defaultFinishes.lightingTypeIds);
      const recommended = sortWithDefaultsFirst(
        allTypes.filter(c => defaultIds.has(c.id) || c.isPrimary),
        defaultFinishes.lightingTypeIds
      );
      
      // Other = everything not in recommended
      const recommendedIds = new Set(recommended.map(c => c.id));
      const other = allTypes.filter(c => !recommendedIds.has(c.id));
      
      return {
        recommended,
        other,
        all: allTypes,
        defaultIds: defaultFinishes.lightingTypeIds,
      };
    };
  }, [defaultFinishes.lightingTypeIds]);
  
  return {
    getCeilingComponents,
    getFlooringComponents,
    getWallComponents,
    getPlumbingComponents,
    getLightingComponents,
    areaTypeLabel,
    defaultFinishes,
  };
}

export default useFilteredInteriorComponents;

