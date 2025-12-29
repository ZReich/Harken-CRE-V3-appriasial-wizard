/**
 * useCustomSiteTypes Hook
 * 
 * Manages user-defined custom site improvement types.
 * Persists to localStorage for reuse across appraisals.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SiteImprovementCategory, SiteImprovementType } from '../constants/marshallSwift';

// =================================================================
// TYPES
// =================================================================

export interface CustomSiteType {
  id: string;
  label: string;
  category: SiteImprovementCategory;
  defaultUnit: 'SF' | 'LF' | 'EA' | 'LS';
  defaultEconomicLife: number;
  isCustom: true;
  createdAt: string;
}

// Storage key for localStorage
const STORAGE_KEY = 'harken_custom_site_types';

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Generate a unique ID for custom types
 */
function generateCustomId(label: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `custom-${slug}-${Date.now().toString(36)}`;
}

/**
 * Load custom types from localStorage
 */
function loadFromStorage(): CustomSiteType[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (Array.isArray(parsed)) {
        return parsed.filter((item: CustomSiteType) => 
          item.id && 
          item.label && 
          item.category && 
          item.defaultUnit && 
          typeof item.defaultEconomicLife === 'number' &&
          item.isCustom === true
        );
      }
    }
  } catch (e) {
    console.warn('Failed to load custom site types from storage:', e);
  }
  return [];
}

/**
 * Save custom types to localStorage
 */
function saveToStorage(types: CustomSiteType[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
  } catch (e) {
    console.warn('Failed to save custom site types to storage:', e);
  }
}

// =================================================================
// HOOK
// =================================================================

interface UseCustomSiteTypesReturn {
  /** All custom site improvement types */
  customTypes: CustomSiteType[];
  
  /** Add a new custom type */
  addCustomType: (type: Omit<CustomSiteType, 'id' | 'isCustom' | 'createdAt'>) => CustomSiteType;
  
  /** Remove a custom type by ID */
  removeCustomType: (id: string) => void;
  
  /** Update an existing custom type */
  updateCustomType: (id: string, updates: Partial<Omit<CustomSiteType, 'id' | 'isCustom' | 'createdAt'>>) => void;
  
  /** Get custom types for a specific category */
  getCustomTypesByCategory: (category: SiteImprovementCategory) => CustomSiteType[];
  
  /** Check if a custom type with this label already exists */
  hasCustomType: (label: string) => boolean;
  
  /** Convert custom type to SiteImprovementType format for unified handling */
  toSiteImprovementType: (customType: CustomSiteType) => SiteImprovementType;
}

export function useCustomSiteTypes(): UseCustomSiteTypesReturn {
  const [customTypes, setCustomTypes] = useState<CustomSiteType[]>(() => loadFromStorage());

  // Persist to localStorage whenever types change
  useEffect(() => {
    saveToStorage(customTypes);
  }, [customTypes]);

  // Add a new custom type
  const addCustomType = useCallback((
    type: Omit<CustomSiteType, 'id' | 'isCustom' | 'createdAt'>
  ): CustomSiteType => {
    const newType: CustomSiteType = {
      ...type,
      id: generateCustomId(type.label),
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
    updates: Partial<Omit<CustomSiteType, 'id' | 'isCustom' | 'createdAt'>>
  ) => {
    setCustomTypes(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  // Get custom types by category
  const getCustomTypesByCategory = useCallback((category: SiteImprovementCategory): CustomSiteType[] => {
    return customTypes.filter(t => t.category === category);
  }, [customTypes]);

  // Check if a custom type with this label exists
  const hasCustomType = useCallback((label: string): boolean => {
    const normalizedLabel = label.toLowerCase().trim();
    return customTypes.some(t => t.label.toLowerCase().trim() === normalizedLabel);
  }, [customTypes]);

  // Convert to SiteImprovementType format
  const toSiteImprovementType = useCallback((customType: CustomSiteType): SiteImprovementType => {
    return {
      id: customType.id,
      label: customType.label,
      category: customType.category,
      defaultUnit: customType.defaultUnit,
      defaultEconomicLife: customType.defaultEconomicLife,
      applicablePropertyCategories: ['residential', 'commercial', 'land'], // Custom types apply to all
    };
  }, []);

  return {
    customTypes,
    addCustomType,
    removeCustomType,
    updateCustomType,
    getCustomTypesByCategory,
    hasCustomType,
    toSiteImprovementType,
  };
}

export default useCustomSiteTypes;

