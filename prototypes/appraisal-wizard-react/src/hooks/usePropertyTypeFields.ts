/**
 * usePropertyTypeFields Hook
 * 
 * Returns dynamic field visibility and options based on the selected
 * M&S property classification from the Setup page.
 */

import { useMemo } from 'react';
import { useWizard } from '../context/WizardContext';
import {
  type PropertyCategory,
  getSiteImprovementsByCategory,
  type SiteImprovementType,
} from '../constants/marshallSwift';

// =================================================================
// TYPES
// =================================================================

export interface AreaTypeOption {
  value: string;
  label: string;
}

export interface UtilityOption {
  value: string;
  label: string;
}

export interface AccessOption {
  value: string;
  label: string;
}

export interface ConstructionOption {
  value: string;
  label: string;
}

export interface QualityOption {
  value: string;
  label: string;
}

export interface SiteDetailsVisibility {
  // Section visibility
  showParkingSection: boolean;
  showLoadingSection: boolean;
  showRailAccess: boolean;
  showAgFeatures: boolean;
  showWaterRights: boolean;
  showClearHeight: boolean;
  showTruckAccess: boolean;
  showVisibility: boolean;
  
  // Dynamic options
  utilityOptions: UtilityOption[];
  accessOptions: AccessOption[];
  siteImprovementTypes: SiteImprovementType[];
}

export interface ImprovementsVisibility {
  // Dynamic area types based on property category
  areaTypes: AreaTypeOption[];
  
  // Field visibility
  showRoomCounts: boolean;
  showHeightFields: boolean;
  showCraneFields: boolean;
  showDockFields: boolean;
  showFloorLoading: boolean;
  showAgFeatures: boolean;
  showGarageFields: boolean;
  showBathroomFields: boolean;
  showElevatorFields: boolean;
  
  // Dynamic options
  constructionOptions: ConstructionOption[];
  qualityOptions: QualityOption[];
}

export interface FieldVisibility {
  siteDetails: SiteDetailsVisibility;
  improvements: ImprovementsVisibility;
  propertyCategory: PropertyCategory | null;
  propertyType: string | null;
  msOccupancyCode: string | null;
}

// =================================================================
// AREA TYPE OPTIONS BY CATEGORY
// =================================================================

const RESIDENTIAL_AREA_TYPES: AreaTypeOption[] = [
  { value: 'main-level', label: 'Main Level' },
  { value: 'upper-level', label: 'Upper Level' },
  { value: 'basement-finished', label: 'Basement (Finished)' },
  { value: 'basement-unfinished', label: 'Basement (Unfinished)' },
  { value: 'attic', label: 'Attic' },
  { value: 'garage-attached', label: 'Garage (Attached)' },
  { value: 'garage-detached', label: 'Garage (Detached)' },
  { value: 'porch', label: 'Porch/Deck' },
  { value: 'other', label: 'Other' },
];

const COMMERCIAL_AREA_TYPES: AreaTypeOption[] = [
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'flex', label: 'Flex Space' },
  { value: 'mezzanine', label: 'Mezzanine' },
  { value: 'common', label: 'Common Area' },
  { value: 'storage', label: 'Storage' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
];

const INDUSTRIAL_AREA_TYPES: AreaTypeOption[] = [
  { value: 'production', label: 'Production' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'cold-storage', label: 'Cold Storage' },
  { value: 'freezer', label: 'Freezer' },
  { value: 'rd', label: 'R&D' },
  { value: 'office-support', label: 'Office (Support)' },
  { value: 'loading', label: 'Loading Area' },
  { value: 'mezzanine', label: 'Mezzanine' },
  { value: 'other', label: 'Other' },
];

const AGRICULTURAL_AREA_TYPES: AreaTypeOption[] = [
  { value: 'barn-general', label: 'General Barn' },
  { value: 'barn-dairy', label: 'Dairy Barn' },
  { value: 'barn-horse', label: 'Horse Barn' },
  { value: 'equipment-shed', label: 'Equipment Shed' },
  { value: 'pole-building', label: 'Pole Building' },
  { value: 'poultry', label: 'Poultry House' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'processing', label: 'Processing Area' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' },
];

// =================================================================
// UTILITY OPTIONS BY CATEGORY
// =================================================================

const RESIDENTIAL_UTILITY_OPTIONS: UtilityOption[] = [
  { value: 'public-water', label: 'Public Water' },
  { value: 'private-well', label: 'Private Well' },
  { value: 'public-sewer', label: 'Public Sewer' },
  { value: 'septic', label: 'Septic System' },
  { value: 'natural-gas', label: 'Natural Gas' },
  { value: 'propane', label: 'Propane' },
  { value: 'electric', label: 'Electric' },
];

const COMMERCIAL_UTILITY_OPTIONS: UtilityOption[] = [
  { value: 'public-water', label: 'Public Water' },
  { value: 'public-sewer', label: 'Public Sewer' },
  { value: 'natural-gas', label: 'Natural Gas' },
  { value: '3-phase-power', label: '3-Phase Power' },
  { value: 'single-phase', label: 'Single Phase Power' },
  { value: 'fire-hydrant', label: 'Fire Hydrant Proximity' },
  { value: 'telecom', label: 'Fiber/Telecom' },
];

const INDUSTRIAL_UTILITY_OPTIONS: UtilityOption[] = [
  { value: 'public-water', label: 'Public Water' },
  { value: 'fire-suppression', label: 'Fire Suppression Water' },
  { value: 'public-sewer', label: 'Public Sewer' },
  { value: 'industrial-sewer', label: 'Industrial Sewer' },
  { value: 'natural-gas-high', label: 'Natural Gas (High Volume)' },
  { value: '3-phase-high', label: '3-Phase Power (High Amp)' },
  { value: 'backup-generator', label: 'Backup Generator' },
];

const AGRICULTURAL_UTILITY_OPTIONS: UtilityOption[] = [
  { value: 'rural-electric', label: 'Rural Electric' },
  { value: 'well-water', label: 'Well Water' },
  { value: 'irrigation', label: 'Irrigation Water' },
  { value: 'propane', label: 'Propane' },
  { value: 'septic', label: 'Septic' },
];

// =================================================================
// ACCESS OPTIONS BY CATEGORY
// =================================================================

const RESIDENTIAL_ACCESS_OPTIONS: AccessOption[] = [
  { value: 'public-street', label: 'Public Street' },
  { value: 'private-road', label: 'Private Road' },
  { value: 'driveway', label: 'Driveway' },
  { value: 'alley', label: 'Alley Access' },
];

const COMMERCIAL_ACCESS_OPTIONS: AccessOption[] = [
  { value: 'curb-cut', label: 'Curb Cut' },
  { value: 'traffic-signal', label: 'Traffic Signal' },
  { value: 'corner', label: 'Corner Location' },
  { value: 'frontage-road', label: 'Frontage Road' },
  { value: 'shared-access', label: 'Shared Access' },
];

const INDUSTRIAL_ACCESS_OPTIONS: AccessOption[] = [
  { value: 'highway', label: 'Highway Access' },
  { value: 'truck-route', label: 'Truck Route' },
  { value: 'rail-spur', label: 'Rail Spur' },
  { value: 'wb-67', label: 'WB-67 Access' },
  { value: 'multi-access', label: 'Multiple Access Points' },
];

const AGRICULTURAL_ACCESS_OPTIONS: AccessOption[] = [
  { value: 'county-road', label: 'County Road' },
  { value: 'private-road', label: 'Private Road' },
  { value: 'field-access', label: 'Field Access' },
  { value: 'easement', label: 'Easement' },
];

// =================================================================
// CONSTRUCTION OPTIONS
// =================================================================

const RESIDENTIAL_CONSTRUCTION_OPTIONS: ConstructionOption[] = [
  { value: 'wood-frame', label: 'Wood Frame' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'brick', label: 'Brick' },
  { value: 'stucco', label: 'Stucco' },
  { value: 'vinyl-siding', label: 'Vinyl Siding' },
  { value: 'log', label: 'Log' },
];

const COMMERCIAL_CONSTRUCTION_OPTIONS: ConstructionOption[] = [
  { value: 'A', label: 'Class A - Fireproof Steel' },
  { value: 'B', label: 'Class B - Reinforced Concrete' },
  { value: 'C', label: 'Class C - Masonry' },
  { value: 'D', label: 'Class D - Wood Frame' },
  { value: 'S', label: 'Class S - Metal' },
];

// =================================================================
// QUALITY OPTIONS
// =================================================================

const RESIDENTIAL_QUALITY_OPTIONS: QualityOption[] = [
  { value: '1', label: '1 - Economy' },
  { value: '2', label: '2 - Fair' },
  { value: '3', label: '3 - Average' },
  { value: '4', label: '4 - Good' },
  { value: '5', label: '5 - Very Good' },
  { value: '6', label: '6 - Excellent' },
];

const COMMERCIAL_QUALITY_OPTIONS: QualityOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'fair', label: 'Fair' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'luxury', label: 'Luxury' },
];

// =================================================================
// HOOK IMPLEMENTATION
// =================================================================

export function usePropertyTypeFields(): FieldVisibility {
  const { state } = useWizard();
  
  // Get property classification from WizardContext
  const propertyCategory = (state.propertyType as PropertyCategory) || null;
  const propertyType = state.propertySubtype || null;
  const msOccupancyCode = (state as unknown as { msOccupancyCode?: string }).msOccupancyCode || null;

  return useMemo(() => {
    // Determine if this is an industrial property type
    const isIndustrial = propertyType === 'industrial' || 
                         msOccupancyCode?.includes('warehouse') ||
                         msOccupancyCode?.includes('manufacturing') ||
                         msOccupancyCode?.includes('distribution');
    
    const isAgricultural = propertyType === 'agricultural';
    const isResidential = propertyCategory === 'residential';
    const isCommercial = propertyCategory === 'commercial';
    const isLand = propertyCategory === 'land';

    // Site Details visibility
    const siteDetails: SiteDetailsVisibility = {
      // Section visibility based on property type
      showParkingSection: isCommercial && !isAgricultural,
      showLoadingSection: isCommercial && (isIndustrial || propertyType === 'retail'),
      showRailAccess: isIndustrial,
      showAgFeatures: isAgricultural,
      showWaterRights: isAgricultural,
      showClearHeight: isCommercial && !isAgricultural,
      showTruckAccess: isCommercial && (isIndustrial || propertyType === 'retail'),
      showVisibility: isCommercial && (propertyType === 'retail' || propertyType === 'office'),
      
      // Dynamic options
      utilityOptions: isResidential ? RESIDENTIAL_UTILITY_OPTIONS :
                      isAgricultural ? AGRICULTURAL_UTILITY_OPTIONS :
                      isIndustrial ? INDUSTRIAL_UTILITY_OPTIONS :
                      isCommercial ? COMMERCIAL_UTILITY_OPTIONS :
                      COMMERCIAL_UTILITY_OPTIONS,
      
      accessOptions: isResidential ? RESIDENTIAL_ACCESS_OPTIONS :
                     isAgricultural ? AGRICULTURAL_ACCESS_OPTIONS :
                     isIndustrial ? INDUSTRIAL_ACCESS_OPTIONS :
                     isCommercial ? COMMERCIAL_ACCESS_OPTIONS :
                     COMMERCIAL_ACCESS_OPTIONS,
      
      siteImprovementTypes: propertyCategory 
        ? getSiteImprovementsByCategory(propertyCategory)
        : getSiteImprovementsByCategory('commercial'),
    };

    // Improvements visibility
    const improvements: ImprovementsVisibility = {
      // Dynamic area types
      areaTypes: isResidential ? RESIDENTIAL_AREA_TYPES :
                 isAgricultural ? AGRICULTURAL_AREA_TYPES :
                 isIndustrial ? INDUSTRIAL_AREA_TYPES :
                 isCommercial ? COMMERCIAL_AREA_TYPES :
                 COMMERCIAL_AREA_TYPES,
      
      // Field visibility
      showRoomCounts: isResidential,
      showHeightFields: isCommercial && !isAgricultural,
      showCraneFields: isIndustrial,
      showDockFields: isCommercial && (isIndustrial || propertyType === 'retail'),
      showFloorLoading: isIndustrial,
      showAgFeatures: isAgricultural,
      showGarageFields: isResidential,
      showBathroomFields: isResidential,
      showElevatorFields: isCommercial && (propertyType === 'office' || propertyType === 'multifamily'),
      
      // Dynamic options
      constructionOptions: isResidential ? RESIDENTIAL_CONSTRUCTION_OPTIONS : COMMERCIAL_CONSTRUCTION_OPTIONS,
      qualityOptions: isResidential ? RESIDENTIAL_QUALITY_OPTIONS : COMMERCIAL_QUALITY_OPTIONS,
    };

    return {
      siteDetails,
      improvements,
      propertyCategory,
      propertyType,
      msOccupancyCode,
    };
  }, [propertyCategory, propertyType, msOccupancyCode]);
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Check if a field should be shown for the given property classification
 */
export function shouldShowField(
  fieldName: string,
  propertyCategory: PropertyCategory | null,
  propertyType: string | null
): boolean {
  if (!propertyCategory) return true; // Show all fields if no category selected
  
  const fieldRules: Record<string, (cat: PropertyCategory, type: string | null) => boolean> = {
    'clearHeight': (cat) => cat === 'commercial',
    'truckAccess': (cat, type) => cat === 'commercial' && (type === 'industrial' || type === 'retail'),
    'railAccess': (_, type) => type === 'industrial',
    'parkingRatio': (cat, type) => cat === 'commercial' && type !== 'agricultural',
    'bedrooms': (cat) => cat === 'residential',
    'bathrooms': (cat) => cat === 'residential',
    'garageSpaces': (cat) => cat === 'residential',
    'craneCapacity': (_, type) => type === 'industrial',
    'floorLoading': (_, type) => type === 'industrial',
    'dockDoors': (cat, type) => cat === 'commercial' && (type === 'industrial' || type === 'retail'),
    'tillableAcres': (_, type) => type === 'agricultural',
    'waterRights': (_, type) => type === 'agricultural',
  };
  
  const rule = fieldRules[fieldName];
  return rule ? rule(propertyCategory, propertyType) : true;
}

/**
 * Get field label variations based on property type
 */
export function getFieldLabel(
  fieldName: string,
  propertyCategory: PropertyCategory | null
): string {
  const labelVariations: Record<string, Record<PropertyCategory, string>> = {
    'area': {
      residential: 'Living Area',
      commercial: 'Gross Building Area',
      land: 'Land Area',
    },
    'size': {
      residential: 'Lot Size',
      commercial: 'Site Area',
      land: 'Acreage',
    },
    'condition': {
      residential: 'Condition',
      commercial: 'Condition Rating',
      land: 'Topography',
    },
  };
  
  const variations = labelVariations[fieldName];
  if (variations && propertyCategory) {
    return variations[propertyCategory];
  }
  
  // Default labels
  const defaults: Record<string, string> = {
    'area': 'Area',
    'size': 'Size',
    'condition': 'Condition',
  };
  
  return defaults[fieldName] || fieldName;
}

