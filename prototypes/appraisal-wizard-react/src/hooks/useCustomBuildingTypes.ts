/**
 * useCustomBuildingTypes Hook
 * 
 * Manages user-defined custom building component types for Exterior, Mechanical, and Interior.
 * Persists to localStorage for reuse across appraisals.
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  BuildingComponentCategory, 
  BuildingComponentType,
  ExteriorCategory,
  MechanicalCategory,
  InteriorCategory,
} from '../constants/buildingComponents';
import type { DepreciationClass } from '../constants/costSegregation';

// =================================================================
// TYPES
// =================================================================

export interface CustomBuildingType {
  id: string;
  label: string;
  category: BuildingComponentCategory;
  parentSection: 'exterior' | 'mechanical' | 'interior';
  defaultEconomicLife: number;
  defaultUnit: 'SF' | 'LF' | 'EA' | 'LS' | 'TON';
  depreciationClass: DepreciationClass;
  notes?: string;
  isCustom: true;
  createdAt: string;
}

// Storage keys for localStorage (separate by section for organization)
const STORAGE_KEY_EXTERIOR = 'harken_custom_building_types_exterior';
const STORAGE_KEY_MECHANICAL = 'harken_custom_building_types_mechanical';
const STORAGE_KEY_INTERIOR = 'harken_custom_building_types_interior';

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Generate a unique ID for custom types
 */
function generateCustomId(label: string, section: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `custom-${section}-${slug}-${Date.now().toString(36)}`;
}

/**
 * Get storage key for a section
 */
function getStorageKey(section: 'exterior' | 'mechanical' | 'interior'): string {
  switch (section) {
    case 'exterior': return STORAGE_KEY_EXTERIOR;
    case 'mechanical': return STORAGE_KEY_MECHANICAL;
    case 'interior': return STORAGE_KEY_INTERIOR;
  }
}

/**
 * Load custom types from localStorage for a section
 */
function loadFromStorage(section: 'exterior' | 'mechanical' | 'interior'): CustomBuildingType[] {
  try {
    const stored = localStorage.getItem(getStorageKey(section));
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((item: CustomBuildingType) => 
          item.id && 
          item.label && 
          item.category && 
          item.parentSection === section &&
          item.defaultUnit && 
          typeof item.defaultEconomicLife === 'number' &&
          item.isCustom === true
        );
      }
    }
  } catch (e) {
    console.warn(`Failed to load custom building types (${section}) from storage:`, e);
  }
  return [];
}

/**
 * Save custom types to localStorage for a section
 */
function saveToStorage(section: 'exterior' | 'mechanical' | 'interior', types: CustomBuildingType[]): void {
  try {
    localStorage.setItem(getStorageKey(section), JSON.stringify(types));
  } catch (e) {
    console.warn(`Failed to save custom building types (${section}) to storage:`, e);
  }
}

/**
 * Load all custom types from all sections
 */
function loadAllFromStorage(): CustomBuildingType[] {
  return [
    ...loadFromStorage('exterior'),
    ...loadFromStorage('mechanical'),
    ...loadFromStorage('interior'),
  ];
}

// =================================================================
// HOOK
// =================================================================

interface UseCustomBuildingTypesReturn {
  /** All custom building component types */
  customTypes: CustomBuildingType[];
  
  /** Add a new custom type */
  addCustomType: (type: Omit<CustomBuildingType, 'id' | 'isCustom' | 'createdAt'>) => CustomBuildingType;
  
  /** Remove a custom type by ID */
  removeCustomType: (id: string) => void;
  
  /** Update an existing custom type */
  updateCustomType: (id: string, updates: Partial<Omit<CustomBuildingType, 'id' | 'isCustom' | 'createdAt'>>) => void;
  
  /** Get custom types for a specific category */
  getCustomTypesByCategory: (category: BuildingComponentCategory) => CustomBuildingType[];
  
  /** Get custom types for a specific section */
  getCustomTypesBySection: (section: 'exterior' | 'mechanical' | 'interior') => CustomBuildingType[];
  
  /** Check if a custom type with this label already exists in a category */
  hasCustomType: (label: string, category: BuildingComponentCategory) => boolean;
  
  /** Convert custom type to BuildingComponentType format for unified handling */
  toBuildingComponentType: (customType: CustomBuildingType) => BuildingComponentType;
}

export function useCustomBuildingTypes(): UseCustomBuildingTypesReturn {
  const [customTypes, setCustomTypes] = useState<CustomBuildingType[]>(() => loadAllFromStorage());

  // Persist to localStorage whenever types change
  useEffect(() => {
    // Group by section and save each
    const exterior = customTypes.filter(t => t.parentSection === 'exterior');
    const mechanical = customTypes.filter(t => t.parentSection === 'mechanical');
    const interior = customTypes.filter(t => t.parentSection === 'interior');
    
    saveToStorage('exterior', exterior);
    saveToStorage('mechanical', mechanical);
    saveToStorage('interior', interior);
  }, [customTypes]);

  // Add a new custom type
  const addCustomType = useCallback((
    type: Omit<CustomBuildingType, 'id' | 'isCustom' | 'createdAt'>
  ): CustomBuildingType => {
    const newType: CustomBuildingType = {
      ...type,
      id: generateCustomId(type.label, type.parentSection),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    
    setCustomTypes(prev => [...prev, newType]);
    return newType;
  }, []);

  // Remove a custom type
  const removeCustomType = useCallback((id: string) => {
    setCustomTypes(prev => prev.filter(t => t.id !== id));
  }, []);

  // Update a custom type
  const updateCustomType = useCallback((
    id: string, 
    updates: Partial<Omit<CustomBuildingType, 'id' | 'isCustom' | 'createdAt'>>
  ) => {
    setCustomTypes(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  // Get custom types by category
  const getCustomTypesByCategory = useCallback((category: BuildingComponentCategory): CustomBuildingType[] => {
    return customTypes.filter(t => t.category === category);
  }, [customTypes]);

  // Get custom types by section
  const getCustomTypesBySection = useCallback((section: 'exterior' | 'mechanical' | 'interior'): CustomBuildingType[] => {
    return customTypes.filter(t => t.parentSection === section);
  }, [customTypes]);

  // Check if a custom type with this label exists in a category
  const hasCustomType = useCallback((label: string, category: BuildingComponentCategory): boolean => {
    const normalizedLabel = label.toLowerCase().trim();
    return customTypes.some(t => 
      t.category === category && 
      t.label.toLowerCase().trim() === normalizedLabel
    );
  }, [customTypes]);

  // Convert to BuildingComponentType format
  const toBuildingComponentType = useCallback((customType: CustomBuildingType): BuildingComponentType => {
    return {
      id: customType.id,
      label: customType.label,
      category: customType.category,
      parentSection: customType.parentSection,
      defaultEconomicLife: customType.defaultEconomicLife,
      defaultUnit: customType.defaultUnit,
      depreciationClass: customType.depreciationClass,
      notes: customType.notes,
    };
  }, []);

  return {
    customTypes,
    addCustomType,
    removeCustomType,
    updateCustomType,
    getCustomTypesByCategory,
    getCustomTypesBySection,
    hasCustomType,
    toBuildingComponentType,
  };
}

// =================================================================
// CATEGORY-SPECIFIC HELPERS
// =================================================================

/**
 * Determine parent section from category
 */
export function getSectionFromCategory(category: BuildingComponentCategory): 'exterior' | 'mechanical' | 'interior' {
  const exteriorCategories: ExteriorCategory[] = ['foundation', 'roofing', 'walls', 'windows'];
  const mechanicalCategories: MechanicalCategory[] = ['electrical', 'heating', 'cooling', 'fire-protection', 'elevators'];
  const interiorCategories: InteriorCategory[] = ['ceilings', 'flooring', 'walls'];
  
  if (exteriorCategories.includes(category as ExteriorCategory)) return 'exterior';
  if (mechanicalCategories.includes(category as MechanicalCategory)) return 'mechanical';
  if (interiorCategories.includes(category as InteriorCategory)) return 'interior';
  
  // Default fallback
  return 'exterior';
}

export default useCustomBuildingTypes;

