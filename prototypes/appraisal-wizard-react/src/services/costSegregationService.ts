/**
 * Cost Segregation Service
 * 
 * Generates IRS-compliant cost segregation analysis from wizard data.
 * Allocates building costs to depreciation classes (5-year, 15-year, 39-year)
 * and produces depreciation schedules.
 * 
 * References:
 * - IRS Revenue Procedure 87-56 (Asset Class Lives)
 * - Treasury Decision 9636 (Tangible Property Regulations)
 * - IRC Sections 167, 168, 1245, 1250
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  CostSegAnalysis,
  CostSegComponent,
  CostSegConfig,
  BuildingSystemSummary,
  DepreciationClassSummary,
  DepreciationYearProjection,
  ImprovementsInventory,
  ImprovementBuilding,
  SiteImprovement,
} from '../types';
import {
  DepreciationClass,
  BuildingSystem,
  BUILDING_SYSTEMS,
  getComponentClassification,
  getMACRSRate,
  getOccupancyAllocation,
  calculateComponentCosts,
  SITE_IMPROVEMENT_ALLOCATIONS,
  ALL_COMPONENT_CLASSIFICATIONS,
  DEPRECIATION_CLASSES,
} from '../constants/costSegregation';

// =================================================================
// SERVICE CONFIGURATION
// =================================================================

const DEFAULT_PROJECTION_YEARS = 10;
const CURRENT_YEAR = new Date().getFullYear();

// Bonus depreciation rates by year (phaseout per Tax Cuts and Jobs Act)
const BONUS_DEPRECIATION_RATES: Record<number, number> = {
  2022: 1.00,   // 100%
  2023: 0.80,   // 80%
  2024: 0.60,   // 60%
  2025: 0.40,   // 40%
  2026: 0.20,   // 20%
  2027: 0.00,   // 0%
};

// =================================================================
// MAIN GENERATION FUNCTION
// =================================================================

export interface GenerateCostSegInput {
  // Property identification
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  occupancyCode: string;
  isResidential?: boolean;
  
  // Cost data (from Cost Approach)
  totalProjectCost: number;
  landValue: number;
  totalBuildingCost: number;
  totalSiteImprovementCost: number;
  
  // Improvements inventory (for detailed component data)
  improvementsInventory?: ImprovementsInventory;
  siteImprovements?: SiteImprovement[];
  
  // Configuration
  config?: Partial<CostSegConfig>;
  
  // User overrides
  componentOverrides?: Record<string, DepreciationClass>;
}

/**
 * Generate a complete cost segregation analysis.
 */
export function generateCostSegAnalysis(input: GenerateCostSegInput): CostSegAnalysis {
  const {
    propertyId,
    propertyName,
    propertyAddress,
    occupancyCode,
    isResidential = false,
    totalProjectCost,
    landValue,
    totalBuildingCost,
    totalSiteImprovementCost,
    improvementsInventory,
    siteImprovements,
    config: inputConfig,
    componentOverrides = {},
  } = input;

  const totalImprovementCost = totalProjectCost - landValue;

  // Build config with defaults
  const config: CostSegConfig = {
    taxYear: CURRENT_YEAR,
    bonusDepreciationPercent: getBonusDepreciationRate(CURRENT_YEAR),
    isNewConstruction: true,
    placedInServiceDate: new Date().toISOString().split('T')[0],
    includeSiteImprovements: true,
    includeDepreciationSchedule: true,
    projectionYears: DEFAULT_PROJECTION_YEARS,
    ...inputConfig,
  };

  // Generate components from allocation tables
  const buildingComponents = generateBuildingComponents(
    occupancyCode,
    totalBuildingCost,
    improvementsInventory,
    componentOverrides
  );

  // Generate site improvement components
  const siteComponents = generateSiteComponents(
    totalSiteImprovementCost,
    siteImprovements,
    componentOverrides
  );

  // Combine all components
  const allComponents = [...buildingComponents, ...siteComponents];

  // Calculate summaries
  const classSummary = calculateClassSummary(allComponents, totalImprovementCost);
  const buildingSystems = calculateBuildingSystems(buildingComponents, totalBuildingCost);

  // Calculate convenience summary
  const summary = {
    fiveYear: getClassTotal(classSummary, '5-year'),
    sevenYear: getClassTotal(classSummary, '7-year'),
    fifteenYear: getClassTotal(classSummary, '15-year'),
    twentySevenFiveYear: getClassTotal(classSummary, '27.5-year'),
    thirtyNineYear: getClassTotal(classSummary, '39-year'),
  };

  // Generate depreciation schedule
  const depreciationSchedule = config.includeDepreciationSchedule
    ? generateDepreciationSchedule(allComponents, config.projectionYears, isResidential)
    : [];

  // Calculate first year depreciation and accelerated benefit
  const firstYearDepreciation = depreciationSchedule[0]?.totalDepreciation || 0;
  const straightLineFirstYear = totalImprovementCost * getMACRSRate(isResidential ? '27.5-year' : '39-year', 1);
  const acceleratedBenefit = firstYearDepreciation - straightLineFirstYear;

  // Count overrides
  const overrideCount = allComponents.filter(c => c.depreciationClassOverride).length;

  return {
    id: uuidv4(),
    propertyId,
    analysisDate: new Date().toISOString(),
    propertyName,
    propertyAddress,
    occupancyCode,
    isResidential,
    totalProjectCost,
    landValue,
    totalImprovementCost,
    totalBuildingCost,
    totalSiteImprovementCost,
    components: allComponents,
    classSummary,
    buildingSystems,
    summary,
    depreciationSchedule,
    firstYearDepreciation,
    acceleratedBenefit,
    methodology: 'cost-estimate',
    methodologyDescription: 'Analysis based on cost allocation methodology using Marshall & Swift component percentages and IRS depreciation class assignments.',
    hasManualOverrides: overrideCount > 0,
    overrideCount,
  };
}

// =================================================================
// COMPONENT GENERATION
// =================================================================

/**
 * Generate building components from occupancy allocation tables.
 * Supports per-building occupancy code overrides for mixed-use properties.
 */
function generateBuildingComponents(
  defaultOccupancyCode: string,
  totalBuildingCost: number,
  improvementsInventory?: ImprovementsInventory,
  overrides: Record<string, DepreciationClass> = {}
): CostSegComponent[] {
  const components: CostSegComponent[] = [];
  
  // Check if we have per-building occupancy overrides
  if (improvementsInventory && hasPerBuildingOccupancyCodes(improvementsInventory)) {
    // Process each building with its effective occupancy code
    const buildingsWithCosts = calculateBuildingCostAllocation(improvementsInventory, totalBuildingCost);
    
    for (const { building, allocatedCost } of buildingsWithCosts) {
      const effectiveCode = building.msOccupancyCodeOverride || defaultOccupancyCode;
      const buildingComponents = generateComponentsForBuilding(
        building,
        effectiveCode,
        allocatedCost,
        totalBuildingCost,
        overrides
      );
      components.push(...buildingComponents);
    }
    
    return components;
  }
  
  // Standard single-code allocation (original behavior)
  const allocation = getOccupancyAllocation(defaultOccupancyCode);
  
  if (!allocation) {
    // Fall back to default office allocation
    const fallbackCosts = calculateComponentCosts('office-lowrise', totalBuildingCost);
    return fallbackCosts.map(c => createComponent(c.componentId, c.label, c.cost, totalBuildingCost, 'allocation', overrides));
  }

  // Build components from allocation
  allocation.components.forEach(entry => {
    const classification = getComponentClassification(entry.componentId);
    if (!classification) return;

    const cost = Math.round(totalBuildingCost * entry.percentOfBuildingCost);
    const component = createComponent(
      entry.componentId,
      classification.label,
      cost,
      totalBuildingCost,
      'allocation',
      overrides
    );
    components.push(component);
  });

  // If we have inventory data, try to refine components with actual data
  if (improvementsInventory) {
    refineComponentsFromInventory(components, improvementsInventory);
  }

  return components;
}

/**
 * Check if any building in the inventory has occupancy code overrides.
 */
function hasPerBuildingOccupancyCodes(inventory: ImprovementsInventory): boolean {
  for (const parcel of inventory.parcels) {
    for (const building of parcel.buildings) {
      if (building.msOccupancyCodeOverride) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Calculate proportional cost allocation for each building based on SF.
 */
function calculateBuildingCostAllocation(
  inventory: ImprovementsInventory,
  totalBuildingCost: number
): { building: ImprovementBuilding; allocatedCost: number }[] {
  const allBuildings: ImprovementBuilding[] = [];
  
  for (const parcel of inventory.parcels) {
    allBuildings.push(...parcel.buildings);
  }
  
  // Calculate total SF
  const totalSF = allBuildings.reduce((sum, b) => {
    const buildingSF = b.areas.reduce((areaSum, area) => areaSum + (area.squareFootage || 0), 0);
    return sum + buildingSF;
  }, 0);
  
  if (totalSF === 0) {
    // Equal distribution if no SF data
    const equalShare = totalBuildingCost / allBuildings.length;
    return allBuildings.map(building => ({ building, allocatedCost: equalShare }));
  }
  
  // Proportional distribution
  return allBuildings.map(building => {
    const buildingSF = building.areas.reduce((sum, area) => sum + (area.squareFootage || 0), 0);
    const proportion = buildingSF / totalSF;
    return {
      building,
      allocatedCost: Math.round(totalBuildingCost * proportion),
    };
  });
}

/**
 * Generate components for a single building with its occupancy code.
 */
function generateComponentsForBuilding(
  building: ImprovementBuilding,
  occupancyCode: string,
  allocatedCost: number,
  totalBuildingCost: number,
  overrides: Record<string, DepreciationClass> = {}
): CostSegComponent[] {
  const components: CostSegComponent[] = [];
  
  const allocation = getOccupancyAllocation(occupancyCode);
  
  if (!allocation) {
    // Fall back to default
    const fallbackCosts = calculateComponentCosts('office-lowrise', allocatedCost);
    return fallbackCosts.map(c => ({
      ...createComponent(c.componentId, c.label, c.cost, totalBuildingCost, 'allocation', overrides),
      buildingId: building.id,
      buildingName: building.name,
    }));
  }
  
  // Build components from allocation with building reference
  allocation.components.forEach(entry => {
    const classification = getComponentClassification(entry.componentId);
    if (!classification) return;

    const cost = Math.round(allocatedCost * entry.percentOfBuildingCost);
    const component: CostSegComponent = {
      ...createComponent(
        entry.componentId,
        classification.label,
        cost,
        totalBuildingCost,
        'allocation',
        overrides
      ),
      buildingId: building.id,
      buildingName: building.name,
    };
    components.push(component);
  });
  
  return components;
}

/**
 * Generate site improvement components.
 */
function generateSiteComponents(
  totalSiteCost: number,
  siteImprovements?: SiteImprovement[],
  overrides: Record<string, DepreciationClass> = {}
): CostSegComponent[] {
  const components: CostSegComponent[] = [];

  if (siteImprovements && siteImprovements.length > 0) {
    // Use actual site improvement data
    siteImprovements.forEach(improvement => {
      const cost = improvement.contributoryValue || improvement.replacementCostNew || 0;
      if (cost <= 0) return;

      const component: CostSegComponent = {
        id: uuidv4(),
        componentId: improvement.typeId,
        label: improvement.typeName,
        category: 'site-improvement',
        depreciationClass: '15-year',
        depreciationClassOverride: overrides[improvement.typeId],
        cost,
        percentOfTotal: 0, // Will be calculated later
        sourceType: 'inventory',
        yearPlacedInService: improvement.yearInstalled || undefined,
        economicLife: improvement.economicLife,
        effectiveAge: improvement.effectiveAge,
        isTenantImprovement: false,
        isLandImprovement: true,
      };
      components.push(component);
    });
  } else if (totalSiteCost > 0) {
    // Use allocation percentages
    SITE_IMPROVEMENT_ALLOCATIONS.forEach(entry => {
      const classification = getComponentClassification(entry.componentId);
      if (!classification) return;

      const cost = Math.round(totalSiteCost * entry.typicalPercentOfSiteCost);
      if (cost <= 0) return;

      const component: CostSegComponent = {
        id: uuidv4(),
        componentId: entry.componentId,
        label: classification.label,
        category: 'site-improvement',
        depreciationClass: '15-year',
        depreciationClassOverride: overrides[entry.componentId],
        cost,
        percentOfTotal: 0,
        sourceType: 'allocation',
        isTenantImprovement: false,
        isLandImprovement: true,
      };
      components.push(component);
    });
  }

  return components;
}

/**
 * Create a CostSegComponent from basic data.
 */
function createComponent(
  componentId: string,
  label: string,
  cost: number,
  totalCost: number,
  sourceType: 'allocation' | 'inventory' | 'manual',
  overrides: Record<string, DepreciationClass>
): CostSegComponent {
  const classification = getComponentClassification(componentId);
  const defaultClass = classification?.defaultClass || '39-year';
  const category = classification?.category || 'building-component';

  return {
    id: uuidv4(),
    componentId,
    label,
    category,
    depreciationClass: defaultClass,
    depreciationClassOverride: overrides[componentId],
    cost,
    percentOfTotal: totalCost > 0 ? cost / totalCost : 0,
    sourceType,
    isTenantImprovement: category === 'tenant-improvement',
    isLandImprovement: category === 'site-improvement',
  };
}

/**
 * Refine components with actual inventory data.
 * Uses ComponentDetail arrays from Exterior, Mechanical, and Interior features
 * to provide accurate yearPlacedInService, economicLife, and condition data.
 */
function refineComponentsFromInventory(
  components: CostSegComponent[],
  inventory: ImprovementsInventory
): void {
  // Get the first building for now (could be enhanced for multi-building)
  const building = inventory.parcels[0]?.buildings[0];
  if (!building) return;

  // Update year placed in service from building year built as fallback
  const defaultYear = building.yearBuilt || undefined;
  components.forEach(c => {
    if (!c.yearPlacedInService && defaultYear) {
      c.yearPlacedInService = defaultYear;
    }
  });

  // Update component details from exterior features
  if (building.exteriorFeatures) {
    // Foundation
    updateComponentFromDetails(components, 'foundation', building.exteriorFeatures.foundationDetails, defaultYear);
    
    // Roofing - map various roofing component IDs
    updateComponentFromDetails(components, 'roofing-system', building.exteriorFeatures.roofDetails, defaultYear);
    updateComponentFromDetails(components, 'roof-structure', building.exteriorFeatures.roofDetails, defaultYear);
    updateComponentFromDetails(components, 'roof-cover', building.exteriorFeatures.roofDetails, defaultYear);
    
    // Exterior Walls
    updateComponentFromDetails(components, 'exterior-walls', building.exteriorFeatures.wallDetails, defaultYear);
    updateComponentFromDetails(components, 'wall-framing', building.exteriorFeatures.wallDetails, defaultYear);
    
    // Windows
    updateComponentFromDetails(components, 'windows-exterior', building.exteriorFeatures.windowDetails, defaultYear);
    updateComponentFromDetails(components, 'windows', building.exteriorFeatures.windowDetails, defaultYear);
  }

  // Update component details from mechanical systems
  if (building.mechanicalSystems) {
    // Electrical
    updateComponentFromDetails(components, 'electrical-general', building.mechanicalSystems.electricalDetails, defaultYear);
    updateComponentFromDetails(components, 'electrical', building.mechanicalSystems.electricalDetails, defaultYear);
    
    // HVAC - Heating
    updateComponentFromDetails(components, 'hvac-general', building.mechanicalSystems.heatingDetails, defaultYear);
    updateComponentFromDetails(components, 'hvac-heating', building.mechanicalSystems.heatingDetails, defaultYear);
    
    // HVAC - Cooling
    updateComponentFromDetails(components, 'hvac-cooling', building.mechanicalSystems.coolingDetails, defaultYear);
    
    // Fire Protection
    updateComponentFromDetails(components, 'fire-sprinkler', building.mechanicalSystems.sprinklerDetails, defaultYear);
    updateComponentFromDetails(components, 'fire-protection', building.mechanicalSystems.sprinklerDetails, defaultYear);
    
    // Elevators
    updateComponentFromDetails(components, 'elevators', building.mechanicalSystems.elevatorDetails, defaultYear);
  }

  // Update component details from interior features (first area as representative)
  const firstArea = building.areas?.[0];
  if (firstArea?.interiorFeatures) {
    // Ceilings
    updateComponentFromDetails(components, 'ceiling-system', firstArea.interiorFeatures.ceilingDetails, defaultYear);
    updateComponentFromDetails(components, 'ceilings', firstArea.interiorFeatures.ceilingDetails, defaultYear);
    
    // Flooring
    updateComponentFromDetails(components, 'flooring', firstArea.interiorFeatures.flooringDetails, defaultYear);
    updateComponentFromDetails(components, 'floor-covering', firstArea.interiorFeatures.flooringDetails, defaultYear);
    
    // Interior Walls
    updateComponentFromDetails(components, 'interior-walls', firstArea.interiorFeatures.wallDetails, defaultYear);
    updateComponentFromDetails(components, 'wall-finish', firstArea.interiorFeatures.wallDetails, defaultYear);
    
    // Plumbing Fixtures
    updateComponentFromDetails(components, 'plumbing-general', firstArea.interiorFeatures.plumbingDetails, defaultYear);
    updateComponentFromDetails(components, 'restroom-fixtures', firstArea.interiorFeatures.plumbingDetails, defaultYear);
    updateComponentFromDetails(components, 'specialty-plumbing', firstArea.interiorFeatures.plumbingDetails, defaultYear);
    
    // Interior Lighting Fixtures
    updateComponentFromDetails(components, 'lighting-general', firstArea.interiorFeatures.lightingDetails, defaultYear);
    updateComponentFromDetails(components, 'accent-lighting', firstArea.interiorFeatures.lightingDetails, defaultYear);
  }
}

/**
 * Update component with details from inventory ComponentDetail array.
 * Extracts yearInstalled, economicLife, effectiveAge, and condition.
 */
function updateComponentFromDetails(
  components: CostSegComponent[],
  componentId: string,
  details?: Array<{ 
    yearInstalled?: number; 
    economicLife?: number; 
    effectiveAge?: number;
    condition?: 'excellent' | 'good' | 'average' | 'fair' | 'poor';
  }>,
  fallbackYear?: number
): void {
  if (!details || details.length === 0) return;

  const component = components.find(c => c.componentId === componentId);
  if (!component) return;

  // For multiple detail entries, use the earliest yearInstalled (oldest component)
  // and the average economicLife
  let earliestYear: number | undefined;
  let totalEconomicLife = 0;
  let economicLifeCount = 0;
  let totalEffectiveAge = 0;
  let effectiveAgeCount = 0;

  details.forEach(detail => {
    // Track earliest year
    if (detail.yearInstalled) {
      if (!earliestYear || detail.yearInstalled < earliestYear) {
        earliestYear = detail.yearInstalled;
      }
    }
    
    // Sum for averaging
    if (detail.economicLife) {
      totalEconomicLife += detail.economicLife;
      economicLifeCount++;
    }
    if (detail.effectiveAge !== undefined) {
      totalEffectiveAge += detail.effectiveAge;
      effectiveAgeCount++;
    }
  });

  // Apply values
  if (earliestYear) {
    component.yearPlacedInService = earliestYear;
  } else if (fallbackYear && !component.yearPlacedInService) {
    component.yearPlacedInService = fallbackYear;
  }

  if (economicLifeCount > 0) {
    component.economicLife = Math.round(totalEconomicLife / economicLifeCount);
  }

  if (effectiveAgeCount > 0) {
    component.effectiveAge = Math.round(totalEffectiveAge / effectiveAgeCount);
  }
}

// =================================================================
// SUMMARY CALCULATIONS
// =================================================================

/**
 * Calculate summary by depreciation class.
 */
function calculateClassSummary(
  components: CostSegComponent[],
  totalCost: number
): DepreciationClassSummary[] {
  const summaries: Record<DepreciationClass, { total: number; count: number }> = {
    '5-year': { total: 0, count: 0 },
    '7-year': { total: 0, count: 0 },
    '15-year': { total: 0, count: 0 },
    '27.5-year': { total: 0, count: 0 },
    '39-year': { total: 0, count: 0 },
  };

  components.forEach(c => {
    const effectiveClass = c.depreciationClassOverride || c.depreciationClass;
    summaries[effectiveClass].total += c.cost;
    summaries[effectiveClass].count += 1;
  });

  return Object.entries(summaries).map(([depClass, data]) => {
    const classInfo = DEPRECIATION_CLASSES.find(d => d.id === depClass);
    return {
      depreciationClass: depClass as DepreciationClass,
      label: classInfo?.label || depClass,
      totalCost: data.total,
      percentOfTotal: totalCost > 0 ? data.total / totalCost : 0,
      componentCount: data.count,
    };
  });
}

/**
 * Calculate building system summaries per IRS TD 9636.
 */
function calculateBuildingSystems(
  components: CostSegComponent[],
  totalBuildingCost: number
): BuildingSystemSummary[] {
  const systemMap = new Map<BuildingSystem, { cost: number; componentIds: string[] }>();

  // Initialize all systems
  BUILDING_SYSTEMS.forEach(sys => {
    systemMap.set(sys.id, { cost: 0, componentIds: [] });
  });

  // Allocate components to systems
  components.forEach(c => {
    const classification = getComponentClassification(c.componentId);
    const system = classification?.parentSystem || 'other';
    
    const existing = systemMap.get(system) || { cost: 0, componentIds: [] };
    existing.cost += c.cost;
    existing.componentIds.push(c.componentId);
    systemMap.set(system, existing);
  });

  return BUILDING_SYSTEMS.map(sys => {
    const data = systemMap.get(sys.id) || { cost: 0, componentIds: [] };
    return {
      system: sys.id,
      systemLabel: sys.label,
      depreciableCost: data.cost,
      replacementCost: data.cost, // Same as depreciable for new construction
      components: data.componentIds,
      percentOfBuilding: totalBuildingCost > 0 ? data.cost / totalBuildingCost : 0,
    };
  });
}

/**
 * Get total for a depreciation class from summary.
 */
function getClassTotal(
  summaries: DepreciationClassSummary[],
  depClass: DepreciationClass
): { total: number; percent: number } {
  const summary = summaries.find(s => s.depreciationClass === depClass);
  return {
    total: summary?.totalCost || 0,
    percent: summary?.percentOfTotal || 0,
  };
}

// =================================================================
// DEPRECIATION SCHEDULE
// =================================================================

/**
 * Generate year-by-year depreciation schedule.
 */
function generateDepreciationSchedule(
  components: CostSegComponent[],
  years: number,
  isResidential: boolean
): DepreciationYearProjection[] {
  const schedule: DepreciationYearProjection[] = [];
  let cumulativeDepreciation = 0;
  const totalCost = components.reduce((sum, c) => sum + c.cost, 0);

  // Group components by effective depreciation class
  const costsByClass: Record<DepreciationClass, number> = {
    '5-year': 0,
    '7-year': 0,
    '15-year': 0,
    '27.5-year': 0,
    '39-year': 0,
  };

  components.forEach(c => {
    const effectiveClass = c.depreciationClassOverride || c.depreciationClass;
    costsByClass[effectiveClass] += c.cost;
  });

  for (let year = 1; year <= years; year++) {
    const fiveYearDep = costsByClass['5-year'] * getMACRSRate('5-year', year);
    const sevenYearDep = costsByClass['7-year'] * getMACRSRate('7-year', year);
    const fifteenYearDep = costsByClass['15-year'] * getMACRSRate('15-year', year);
    const twentySevenFiveDep = costsByClass['27.5-year'] * getMACRSRate('27.5-year', year);
    const thirtyNineDep = costsByClass['39-year'] * getMACRSRate('39-year', year);

    const totalDep = fiveYearDep + sevenYearDep + fifteenYearDep + 
                     (isResidential ? twentySevenFiveDep : thirtyNineDep);

    cumulativeDepreciation += totalDep;

    schedule.push({
      year,
      fiveYearDepreciation: Math.round(fiveYearDep),
      sevenYearDepreciation: Math.round(sevenYearDep),
      fifteenYearDepreciation: Math.round(fifteenYearDep),
      twentySevenFiveYearDepreciation: Math.round(twentySevenFiveDep),
      thirtyNineYearDepreciation: Math.round(thirtyNineDep),
      totalDepreciation: Math.round(totalDep),
      cumulativeDepreciation: Math.round(cumulativeDepreciation),
      remainingBasis: Math.round(totalCost - cumulativeDepreciation),
    });
  }

  return schedule;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Get bonus depreciation rate for a tax year.
 */
export function getBonusDepreciationRate(taxYear: number): number {
  return BONUS_DEPRECIATION_RATES[taxYear] ?? 0;
}

/**
 * Apply user override to a component.
 */
export function applyComponentOverride(
  analysis: CostSegAnalysis,
  componentId: string,
  newClass: DepreciationClass,
  reason?: string
): CostSegAnalysis {
  const updatedComponents = analysis.components.map(c => {
    if (c.componentId === componentId) {
      return {
        ...c,
        depreciationClassOverride: newClass,
        overrideReason: reason,
      };
    }
    return c;
  });

  // Recalculate summaries
  const totalCost = analysis.totalImprovementCost;
  const classSummary = calculateClassSummary(updatedComponents, totalCost);
  const buildingSystems = calculateBuildingSystems(
    updatedComponents.filter(c => !c.isLandImprovement),
    analysis.totalBuildingCost
  );

  const summary = {
    fiveYear: getClassTotal(classSummary, '5-year'),
    sevenYear: getClassTotal(classSummary, '7-year'),
    fifteenYear: getClassTotal(classSummary, '15-year'),
    twentySevenFiveYear: getClassTotal(classSummary, '27.5-year'),
    thirtyNineYear: getClassTotal(classSummary, '39-year'),
  };

  const depreciationSchedule = generateDepreciationSchedule(
    updatedComponents,
    analysis.depreciationSchedule.length,
    analysis.isResidential
  );

  const overrideCount = updatedComponents.filter(c => c.depreciationClassOverride).length;

  return {
    ...analysis,
    components: updatedComponents,
    classSummary,
    buildingSystems,
    summary,
    depreciationSchedule,
    firstYearDepreciation: depreciationSchedule[0]?.totalDepreciation || 0,
    hasManualOverrides: overrideCount > 0,
    overrideCount,
  };
}

/**
 * Reset all overrides on an analysis.
 */
export function resetAnalysisOverrides(analysis: CostSegAnalysis): CostSegAnalysis {
  const resetComponents = analysis.components.map(c => ({
    ...c,
    depreciationClassOverride: undefined,
    overrideReason: undefined,
  }));

  // Recalculate with reset components
  return {
    ...analysis,
    components: resetComponents,
    ...recalculateSummaries(resetComponents, analysis),
    hasManualOverrides: false,
    overrideCount: 0,
  };
}

/**
 * Recalculate all summaries for an analysis.
 */
function recalculateSummaries(
  components: CostSegComponent[],
  analysis: CostSegAnalysis
): Partial<CostSegAnalysis> {
  const classSummary = calculateClassSummary(components, analysis.totalImprovementCost);
  const buildingComponents = components.filter(c => !c.isLandImprovement);
  const buildingSystems = calculateBuildingSystems(buildingComponents, analysis.totalBuildingCost);

  const summary = {
    fiveYear: getClassTotal(classSummary, '5-year'),
    sevenYear: getClassTotal(classSummary, '7-year'),
    fifteenYear: getClassTotal(classSummary, '15-year'),
    twentySevenFiveYear: getClassTotal(classSummary, '27.5-year'),
    thirtyNineYear: getClassTotal(classSummary, '39-year'),
  };

  const depreciationSchedule = generateDepreciationSchedule(
    components,
    analysis.depreciationSchedule.length || DEFAULT_PROJECTION_YEARS,
    analysis.isResidential
  );

  return {
    classSummary,
    buildingSystems,
    summary,
    depreciationSchedule,
    firstYearDepreciation: depreciationSchedule[0]?.totalDepreciation || 0,
  };
}

/**
 * Format currency for display.
 */
export function formatCostSegCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display.
 */
export function formatCostSegPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

