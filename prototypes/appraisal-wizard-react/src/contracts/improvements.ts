/**
 * Improvements Contract
 * 
 * Canonical data model for the improvements inventory (Parcels → Buildings → Areas).
 * Includes default structures, validation rules, and rollup logic.
 */

import type {
  ImprovementsInventory,
  ImprovementParcel,
  ImprovementBuilding,
  ImprovementArea,
  ValidationResult,
  ValidationIssue,
  ImprovementsRollups,
} from '../types';

export const SCHEMA_VERSION = 1;

// =================================================================
// ID GENERATION
// =================================================================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// =================================================================
// DEFAULT FACTORIES
// =================================================================

export function createDefaultArea(): ImprovementArea {
  return {
    id: generateId(),
    type: 'office',
    customType: '',
    squareFootage: null,
    sfType: 'GBA',
    yearBuilt: null,
    yearRemodeled: '',
    condition: '',
    description: '',
  };
}

export function createDefaultBuilding(): ImprovementBuilding {
  return {
    id: generateId(),
    name: '',
    address: '',
    yearBuilt: null,
    yearRemodeled: '',
    constructionType: '',
    constructionQuality: '',
    condition: '',
    clearHeight: null,
    eaveHeight: null,
    ridgeHeight: null,
    areas: [createDefaultArea()],
  };
}

export function createDefaultParcel(): ImprovementParcel {
  return {
    id: generateId(),
    parcelNumber: '',
    legalDescription: '',
    address: '',
    buildings: [createDefaultBuilding()],
  };
}

export function createDefaultInventory(): ImprovementsInventory {
  return {
    schemaVersion: SCHEMA_VERSION,
    parcels: [createDefaultParcel()],
  };
}

// =================================================================
// ROLLUP CALCULATIONS
// =================================================================

export function calculateAreaSF(area: ImprovementArea): number {
  // Skip areas that are marked as not measured (features only)
  if (area.hasMeasuredSF === false) {
    return 0;
  }
  return area.squareFootage || 0;
}

export function calculateBuildingSF(building: ImprovementBuilding): number {
  return building.areas.reduce((sum, area) => sum + calculateAreaSF(area), 0);
}

export function calculateParcelSF(parcel: ImprovementParcel): number {
  return parcel.buildings.reduce((sum, building) => sum + calculateBuildingSF(building), 0);
}

export function calculateTotalSF(inventory: ImprovementsInventory): number {
  return inventory.parcels.reduce((sum, parcel) => sum + calculateParcelSF(parcel), 0);
}

export function calculateRollups(inventory: ImprovementsInventory): ImprovementsRollups {
  const sfByType: Record<string, number> = {};
  let totalAreas = 0;
  let totalBuildings = 0;

  for (const parcel of inventory.parcels) {
    totalBuildings += parcel.buildings.length;
    for (const building of parcel.buildings) {
      totalAreas += building.areas.length;
      for (const area of building.areas) {
        const typeKey = area.type === 'other' ? (area.customType || 'Other') : area.type;
        sfByType[typeKey] = (sfByType[typeKey] || 0) + (area.squareFootage || 0);
      }
    }
  }

  return {
    totalSF: calculateTotalSF(inventory),
    sfByType,
    subjectTotals: {
      parcels: inventory.parcels.length,
      buildings: totalBuildings,
      areas: totalAreas,
    },
  };
}

// =================================================================
// VALIDATION
// =================================================================

export function validateInventory(inventory: ImprovementsInventory): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!inventory || !inventory.parcels || inventory.parcels.length === 0) {
    errors.push({
      code: 'NO_PARCELS',
      message: 'At least one parcel is required for improved properties.',
      severity: 'error',
    });
    return { errors, warnings, isValid: false };
  }

  inventory.parcels.forEach((parcel, pIdx) => {
    const parcelLabel = `Parcel ${pIdx + 1}`;

    if (!parcel.parcelNumber) {
      warnings.push({
        code: 'MISSING_PARCEL_NUMBER',
        message: `${parcelLabel}: Tax ID / Parcel Number is recommended.`,
        severity: 'warning',
        path: `parcels[${pIdx}].parcelNumber`,
      });
    }

    if (!parcel.buildings || parcel.buildings.length === 0) {
      errors.push({
        code: 'NO_BUILDINGS',
        message: `${parcelLabel}: At least one building is required.`,
        severity: 'error',
        path: `parcels[${pIdx}].buildings`,
      });
      return;
    }

    parcel.buildings.forEach((building, bIdx) => {
      const buildingLabel = `${parcelLabel}, Building ${building.name || bIdx + 1}`;

      if (!building.yearBuilt) {
        warnings.push({
          code: 'MISSING_YEAR_BUILT',
          message: `${buildingLabel}: Year Built is recommended.`,
          severity: 'warning',
          path: `parcels[${pIdx}].buildings[${bIdx}].yearBuilt`,
        });
      }

      if (!building.areas || building.areas.length === 0) {
        errors.push({
          code: 'NO_AREAS',
          message: `${buildingLabel}: At least one use area is required.`,
          severity: 'error',
          path: `parcels[${pIdx}].buildings[${bIdx}].areas`,
        });
        return;
      }

      building.areas.forEach((area, aIdx) => {
        const areaLabel = `${buildingLabel}, Area ${area.type || aIdx + 1}`;

        if (!area.squareFootage || area.squareFootage <= 0) {
          errors.push({
            code: 'MISSING_SF',
            message: `${areaLabel}: Square footage is required and must be > 0.`,
            severity: 'error',
            path: `parcels[${pIdx}].buildings[${bIdx}].areas[${aIdx}].squareFootage`,
          });
        }

        if (area.type === 'other' && !area.customType) {
          warnings.push({
            code: 'MISSING_CUSTOM_TYPE',
            message: `${areaLabel}: Custom type description needed for 'Other'.`,
            severity: 'warning',
            path: `parcels[${pIdx}].buildings[${bIdx}].areas[${aIdx}].customType`,
          });
        }
      });
    });
  });

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}

// =================================================================
// AGE-LIFE CALCULATIONS
// =================================================================

export function calculateActualAge(yearBuilt: number | null): number | null {
  if (!yearBuilt) return null;
  const currentYear = new Date().getFullYear();
  return currentYear - yearBuilt;
}

export function calculateRemainingLife(effectiveAge: number | undefined, totalEconomicLife: number | undefined): number | null {
  if (effectiveAge === undefined || totalEconomicLife === undefined) return null;
  return Math.max(0, totalEconomicLife - effectiveAge);
}

export function calculateDepreciation(effectiveAge: number | undefined, totalEconomicLife: number | undefined): number | null {
  if (effectiveAge === undefined || totalEconomicLife === undefined || totalEconomicLife === 0) return null;
  return Math.min(100, Math.round((effectiveAge / totalEconomicLife) * 100));
}

// =================================================================
// NORMALIZATION / MIGRATION
// =================================================================

export function normalizeInventory(data: unknown): ImprovementsInventory {
  if (!data || typeof data !== 'object') {
    return createDefaultInventory();
  }

  const inv = data as Partial<ImprovementsInventory>;

  if (!inv.schemaVersion || inv.schemaVersion < SCHEMA_VERSION) {
    console.warn('Migrating improvements inventory to schema version', SCHEMA_VERSION);
    // Future migrations would go here
  }

  if (!inv.parcels || !Array.isArray(inv.parcels) || inv.parcels.length === 0) {
    return createDefaultInventory();
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    parcels: inv.parcels,
  };
}

