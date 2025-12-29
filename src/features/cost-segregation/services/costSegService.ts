/**
 * Cost Segregation Service
 * 
 * Core analysis engine for generating IRS-compliant cost segregation studies.
 * Handles component allocation, depreciation classification, and schedule generation.
 */

import type { WizardState, ImprovementBuilding, SiteImprovement } from '../../../types';
import type {
  CostSegAnalysis,
  CostSegComponent,
  ClassSummary,
  DepreciationClass,
  PropertyClass,
  ComponentCategory,
  TaxBenefitProjection,
  DepreciationSchedule,
  DepreciationYearEntry,
  BuildingSystemSummary,
  BuildingSystemType,
} from '../types';
import {
  COMPONENT_DEPRECIATION_MAP,
  SITE_IMPROVEMENT_DEPRECIATION_MAP,
  MACRS_RATES,
  STRAIGHT_LINE_RATES,
  getBonusRate,
  DEFAULT_TAX_RATE,
  DEPRECIATION_CLASSES,
  getAllocationsForOccupancy,
  BUILDING_SYSTEMS,
} from '../constants';

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine property class based on wizard state
 */
function determinePropertyClass(state: WizardState): PropertyClass {
  const propertyType = state.propertyType?.toLowerCase() || '';
  const propertySubtype = state.propertySubtype?.toLowerCase() || '';
  
  // Residential rental properties use 27.5-year
  if (
    propertyType === 'residential' ||
    propertySubtype.includes('apartment') ||
    propertySubtype.includes('multifamily') ||
    propertySubtype.includes('duplex') ||
    propertySubtype.includes('residential')
  ) {
    return 'residential-rental';
  }
  
  // Everything else is nonresidential (39-year)
  return 'nonresidential';
}

/**
 * Get the real property depreciation class based on property type
 */
function getRealPropertyClass(propertyClass: PropertyClass): DepreciationClass {
  return propertyClass === 'residential-rental' ? '27.5-year' : '39-year';
}

/**
 * Look up depreciation classification for a component option
 */
function lookupComponentClassification(componentName: string): {
  class: DepreciationClass;
  category: ComponentCategory;
  irsAssetClass?: string;
  buildingSystem?: BuildingSystemType;
} | null {
  // Direct lookup
  if (COMPONENT_DEPRECIATION_MAP[componentName]) {
    return COMPONENT_DEPRECIATION_MAP[componentName];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(COMPONENT_DEPRECIATION_MAP)) {
    if (componentName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(componentName.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}

// =================================================================
// BUILDING COST EXTRACTION
// =================================================================

interface BuildingCostData {
  buildingId: string;
  buildingName: string;
  totalCost: number;
  occupancyCode: string;
  components: Array<{
    type: string;
    name: string;
    value?: string[];
  }>;
}

/**
 * Extract building cost data from wizard state
 */
function extractBuildingCosts(state: WizardState): BuildingCostData[] {
  const buildings: BuildingCostData[] = [];
  const activeScenarioId = state.activeScenarioId;
  
  // Get buildings from improvements inventory
  const allBuildings = state.improvementsInventory?.parcels?.flatMap(p => p.buildings) || [];
  
  // Get selected buildings for the active scenario
  const selectedBuildingIds = state.costApproachBuildingSelections?.[activeScenarioId] || [];
  const selectedBuildings = selectedBuildingIds.length > 0
    ? allBuildings.filter(b => selectedBuildingIds.includes(b.id))
    : allBuildings;
  
  for (const building of selectedBuildings) {
    // Get cost overrides for this building
    const overrides = state.costApproachBuildingCostData?.[activeScenarioId]?.[building.id];
    
    // Calculate total building cost (simplified - in real implementation, use full cost approach calculation)
    const baseCostPsf = overrides?.baseCostPsf || 100; // Default if not set
    const totalSf = building.areas?.reduce((sum, a) => sum + (a.squareFootage || 0), 0) || 0;
    const totalCost = baseCostPsf * totalSf;
    
    // Extract component information
    const components: BuildingCostData['components'] = [];
    
    if (building.exteriorFeatures) {
      if (building.exteriorFeatures.foundation) {
        components.push({ type: 'foundation', name: 'Foundation', value: building.exteriorFeatures.foundation });
      }
      if (building.exteriorFeatures.roof) {
        components.push({ type: 'roof', name: 'Roofing', value: building.exteriorFeatures.roof });
      }
      if (building.exteriorFeatures.walls) {
        components.push({ type: 'exterior-walls', name: 'Exterior Walls', value: building.exteriorFeatures.walls });
      }
      if (building.exteriorFeatures.windows) {
        components.push({ type: 'windows', name: 'Windows', value: building.exteriorFeatures.windows });
      }
    }
    
    if (building.mechanicalSystems) {
      if (building.mechanicalSystems.electrical) {
        components.push({ type: 'electrical', name: 'Electrical', value: building.mechanicalSystems.electrical });
      }
      if (building.mechanicalSystems.heating) {
        components.push({ type: 'hvac', name: 'HVAC - Heating', value: building.mechanicalSystems.heating });
      }
      if (building.mechanicalSystems.cooling) {
        components.push({ type: 'hvac', name: 'HVAC - Cooling', value: building.mechanicalSystems.cooling });
      }
      if (building.mechanicalSystems.sprinkler) {
        components.push({ type: 'sprinkler', name: 'Fire Protection', value: building.mechanicalSystems.sprinkler });
      }
      if (building.mechanicalSystems.elevators) {
        components.push({ type: 'elevators', name: 'Elevators', value: building.mechanicalSystems.elevators });
      }
    }
    
    // Get interior features from first area (or combine)
    const firstArea = building.areas?.[0];
    if (firstArea?.interiorFeatures) {
      if (firstArea.interiorFeatures.ceilings) {
        components.push({ type: 'ceilings', name: 'Ceilings', value: firstArea.interiorFeatures.ceilings });
      }
      if (firstArea.interiorFeatures.flooring) {
        components.push({ type: 'flooring', name: 'Flooring', value: firstArea.interiorFeatures.flooring });
      }
      if (firstArea.interiorFeatures.walls) {
        components.push({ type: 'interior-walls', name: 'Interior Walls', value: firstArea.interiorFeatures.walls });
      }
    }
    
    buildings.push({
      buildingId: building.id,
      buildingName: building.name || `Building ${building.id}`,
      totalCost,
      occupancyCode: overrides?.occupancy || state.msOccupancyCode || 'office-lowrise',
      components,
    });
  }
  
  return buildings;
}

// =================================================================
// COMPONENT GENERATION
// =================================================================

/**
 * Generate cost seg components from building data
 */
function generateBuildingComponents(
  buildingData: BuildingCostData,
  propertyClass: PropertyClass
): CostSegComponent[] {
  const components: CostSegComponent[] = [];
  const realPropertyClass = getRealPropertyClass(propertyClass);
  
  // Get allocation percentages for this occupancy type
  const allocations = getAllocationsForOccupancy(buildingData.occupancyCode);
  
  // Generate components based on allocation percentages
  for (const allocation of allocations) {
    const cost = buildingData.totalCost * allocation.percentOfBuildingCost;
    
    // Adjust real property class based on property type
    let depClass = allocation.defaultDepreciationClass;
    if (depClass === '39-year' || depClass === '27.5-year') {
      depClass = realPropertyClass;
    }
    
    components.push({
      id: generateId(),
      componentId: allocation.componentId,
      label: allocation.label,
      category: allocation.category,
      depreciationClass: depClass,
      cost,
      percentOfTotal: allocation.percentOfBuildingCost * 100,
      buildingId: buildingData.buildingId,
      buildingName: buildingData.buildingName,
      irsAssetClass: allocation.irsAssetClass,
      classificationSource: 'auto',
      dataSource: 'improvements-inventory',
    });
  }
  
  // Also process specific components from the building data
  for (const comp of buildingData.components) {
    if (comp.value && comp.value.length > 0) {
      for (const value of comp.value) {
        const classification = lookupComponentClassification(value);
        if (classification) {
          // Check if we already have a similar component
          const existing = components.find(c => 
            c.label.toLowerCase().includes(comp.name.toLowerCase()) ||
            comp.name.toLowerCase().includes(c.label.toLowerCase())
          );
          
          if (existing) {
            // Update the existing component with specific classification
            existing.depreciationClass = classification.class === '39-year' || classification.class === '27.5-year'
              ? realPropertyClass
              : classification.class;
            existing.description = value;
          }
        }
      }
    }
  }
  
  return components;
}

/**
 * Generate cost seg components from site improvements
 */
function generateSiteComponents(
  siteImprovements: SiteImprovement[]
): CostSegComponent[] {
  return siteImprovements.map(si => {
    // Look up classification
    const classification = SITE_IMPROVEMENT_DEPRECIATION_MAP[si.typeId] || {
      class: '15-year' as DepreciationClass,
      category: 'land-improvement' as ComponentCategory,
    };
    
    const cost = si.contributoryValue || si.replacementCostNew || 0;
    
    return {
      id: generateId(),
      componentId: si.typeId,
      label: si.typeName,
      description: si.description,
      category: classification.category,
      depreciationClass: classification.class,
      cost,
      percentOfTotal: 0, // Will be calculated later
      irsAssetClass: classification.irsAssetClass,
      classificationSource: 'auto',
      dataSource: 'site-improvements',
      quantity: si.quantity,
      unit: si.unit,
    };
  });
}

// =================================================================
// SUMMARY CALCULATIONS
// =================================================================

/**
 * Calculate summary by depreciation class
 */
function calculateClassSummary(
  components: CostSegComponent[],
  depreciableBasis: number,
  bonusRate: number
): ClassSummary[] {
  const summaryMap = new Map<DepreciationClass, ClassSummary>();
  
  // Initialize all classes
  for (const cls of DEPRECIATION_CLASSES) {
    summaryMap.set(cls.id, {
      class: cls.id,
      totalValue: 0,
      percentOfBasis: 0,
      componentCount: 0,
      firstYearDepreciation: 0,
      firstYearWithBonus: 0,
    });
  }
  
  // Accumulate component values
  for (const comp of components) {
    const effectiveClass = comp.depreciationClassOverride || comp.depreciationClass;
    const summary = summaryMap.get(effectiveClass);
    if (summary) {
      summary.totalValue += comp.cost;
      summary.componentCount += 1;
    }
  }
  
  // Calculate percentages and first-year depreciation
  for (const summary of summaryMap.values()) {
    if (depreciableBasis > 0) {
      summary.percentOfBasis = (summary.totalValue / depreciableBasis) * 100;
    }
    
    // Calculate first-year depreciation
    const classConfig = DEPRECIATION_CLASSES.find(c => c.id === summary.class);
    
    if (summary.class === '5-year' || summary.class === '7-year' || summary.class === '15-year') {
      // MACRS rates
      const rates = MACRS_RATES[summary.class as '5-year' | '7-year' | '15-year'];
      const firstYearRate = rates[0];
      
      // Calculate with and without bonus
      const eligibleForBonus = classConfig?.eligibleForBonus ?? false;
      const bonusAmount = eligibleForBonus ? summary.totalValue * bonusRate : 0;
      const remainingBasis = summary.totalValue - bonusAmount;
      
      summary.firstYearDepreciation = remainingBasis * firstYearRate;
      summary.firstYearWithBonus = bonusAmount + summary.firstYearDepreciation;
    } else {
      // Straight-line (real property)
      const rate = STRAIGHT_LINE_RATES[summary.class as '27.5-year' | '39-year'] || (1 / 39);
      // Mid-month convention - assume placed in service in month 1 for simplicity
      summary.firstYearDepreciation = summary.totalValue * rate * (11.5 / 12);
      summary.firstYearWithBonus = summary.firstYearDepreciation; // No bonus for real property
    }
  }
  
  // Return only classes with values
  return Array.from(summaryMap.values()).filter(s => s.totalValue > 0);
}

/**
 * Calculate building systems summary
 */
function calculateBuildingSystems(
  components: CostSegComponent[],
  totalBuildingCost: number
): BuildingSystemSummary[] {
  const systemMap = new Map<BuildingSystemType, BuildingSystemSummary>();
  
  // Initialize all systems
  for (const system of BUILDING_SYSTEMS) {
    systemMap.set(system.id, {
      system: system.id,
      label: system.label,
      depreciableCost: 0,
      replacementCost: 0,
      componentIds: [],
      percentOfBuilding: 0,
    });
  }
  
  // Map components to building systems
  for (const comp of components) {
    if (comp.dataSource === 'site-improvements') continue; // Skip site improvements
    
    // Determine building system based on component
    let systemType: BuildingSystemType = 'other';
    
    const label = comp.label.toLowerCase();
    if (label.includes('hvac') || label.includes('heating') || label.includes('cooling')) {
      systemType = 'hvac';
    } else if (label.includes('plumbing') || label.includes('water')) {
      systemType = 'plumbing';
    } else if (label.includes('electrical') || label.includes('wiring')) {
      systemType = 'electrical';
    } else if (label.includes('elevator') || label.includes('escalator')) {
      systemType = 'elevators-escalators';
    } else if (label.includes('fire') || label.includes('sprinkler') || label.includes('alarm')) {
      systemType = 'fire-protection';
    } else if (label.includes('security') || label.includes('access control')) {
      systemType = 'security';
    } else if (label.includes('gas')) {
      systemType = 'gas-distribution';
    } else if (label.includes('structure') || label.includes('foundation') || label.includes('framing') || label.includes('roof')) {
      systemType = 'building-structure';
    }
    
    const summary = systemMap.get(systemType);
    if (summary) {
      summary.depreciableCost += comp.cost;
      summary.replacementCost += comp.cost;
      summary.componentIds.push(comp.id);
    }
  }
  
  // Calculate percentages
  for (const summary of systemMap.values()) {
    if (totalBuildingCost > 0) {
      summary.percentOfBuilding = (summary.depreciableCost / totalBuildingCost) * 100;
    }
  }
  
  return Array.from(systemMap.values()).filter(s => s.depreciableCost > 0);
}

// =================================================================
// DEPRECIATION SCHEDULE
// =================================================================

/**
 * Generate depreciation schedule
 */
function generateDepreciationSchedule(
  classSummary: ClassSummary[],
  bonusRate: number,
  taxRate: number,
  startYear: number,
  years: number = 40
): DepreciationSchedule {
  const schedule: DepreciationYearEntry[] = [];
  
  // Track remaining basis by class
  const remainingBasis: Record<string, number> = {};
  const bonusApplied: Record<string, number> = {};
  
  for (const summary of classSummary) {
    const classConfig = DEPRECIATION_CLASSES.find(c => c.id === summary.class);
    const eligibleForBonus = classConfig?.eligibleForBonus ?? false;
    
    bonusApplied[summary.class] = eligibleForBonus ? summary.totalValue * bonusRate : 0;
    remainingBasis[summary.class] = summary.totalValue - bonusApplied[summary.class];
  }
  
  let cumulativeDepreciation = 0;
  let cumulativeTaxSavings = 0;
  
  for (let yearNum = 1; yearNum <= years; yearNum++) {
    const calendarYear = startYear + yearNum - 1;
    
    const byClass = {
      fiveYear: 0,
      sevenYear: 0,
      fifteenYear: 0,
      realProperty: 0,
    };
    
    let totalYearDep = 0;
    
    // Calculate depreciation for each class
    for (const summary of classSummary) {
      let yearDep = 0;
      
      if (summary.class === '5-year') {
        if (yearNum <= 6) {
          yearDep = remainingBasis[summary.class] * MACRS_RATES['5-year'][yearNum - 1];
          if (yearNum === 1) yearDep += bonusApplied[summary.class];
        }
        byClass.fiveYear = yearDep;
      } else if (summary.class === '7-year') {
        if (yearNum <= 8) {
          yearDep = remainingBasis[summary.class] * MACRS_RATES['7-year'][yearNum - 1];
          if (yearNum === 1) yearDep += bonusApplied[summary.class];
        }
        byClass.sevenYear = yearDep;
      } else if (summary.class === '15-year') {
        if (yearNum <= 16) {
          yearDep = remainingBasis[summary.class] * MACRS_RATES['15-year'][yearNum - 1];
          if (yearNum === 1) yearDep += bonusApplied[summary.class];
        }
        byClass.fifteenYear = yearDep;
      } else {
        // Real property (27.5 or 39 year)
        const recoveryPeriod = summary.class === '27.5-year' ? 27.5 : 39;
        if (yearNum <= Math.ceil(recoveryPeriod)) {
          const rate = 1 / recoveryPeriod;
          if (yearNum === 1) {
            yearDep = summary.totalValue * rate * (11.5 / 12); // Mid-month
          } else if (yearNum === Math.ceil(recoveryPeriod)) {
            yearDep = summary.totalValue * rate * (0.5 / 12); // Remaining
          } else {
            yearDep = summary.totalValue * rate;
          }
        }
        byClass.realProperty += yearDep;
      }
      
      totalYearDep += yearDep;
    }
    
    cumulativeDepreciation += totalYearDep;
    const taxSavings = totalYearDep * taxRate;
    cumulativeTaxSavings += taxSavings;
    
    const totalBasis = classSummary.reduce((sum, s) => sum + s.totalValue, 0);
    
    schedule.push({
      year: yearNum,
      calendarYear,
      byClass,
      totalDepreciation: totalYearDep,
      cumulativeDepreciation,
      remainingBasis: totalBasis - cumulativeDepreciation,
      taxSavings,
      cumulativeTaxSavings,
    });
  }
  
  return {
    years: schedule,
    taxRate,
    bonusRate,
    startYear,
    midYearConvention: true,
  };
}

// =================================================================
// TAX BENEFIT PROJECTION
// =================================================================

/**
 * Calculate tax benefit projection
 */
function calculateTaxBenefit(
  classSummary: ClassSummary[],
  depreciationSchedule: DepreciationSchedule,
  taxRate: number
): TaxBenefitProjection {
  const totalBasis = classSummary.reduce((sum, s) => sum + s.totalValue, 0);
  
  // Without cost seg - all goes to 39-year (or 27.5-year)
  // Simplified: assume 39-year straight-line
  const year1WithoutCostSeg = totalBasis / 39 * (11.5 / 12);
  
  // With cost seg - use actual first year from schedule
  const year1WithCostSeg = depreciationSchedule.years[0]?.totalDepreciation || 0;
  
  // With bonus - already included in schedule
  const year1WithBonus = year1WithCostSeg;
  
  const additionalYear1Deductions = year1WithBonus - year1WithoutCostSeg;
  const year1TaxSavings = additionalYear1Deductions * taxRate;
  
  // Cumulative benefits
  const years5 = depreciationSchedule.years.slice(0, 5);
  const years10 = depreciationSchedule.years.slice(0, 10);
  
  const withoutCostSeg5Year = year1WithoutCostSeg * 5;
  const withoutCostSeg10Year = year1WithoutCostSeg * 10;
  
  const cumulativeBenefit5Year = (years5.reduce((sum, y) => sum + y.totalDepreciation, 0) - withoutCostSeg5Year) * taxRate;
  const cumulativeBenefit10Year = (years10.reduce((sum, y) => sum + y.totalDepreciation, 0) - withoutCostSeg10Year) * taxRate;
  
  return {
    year1WithoutCostSeg,
    year1WithCostSeg: year1WithCostSeg - (depreciationSchedule.bonusRate > 0 ? classSummary.filter(s => 
      ['5-year', '7-year', '15-year'].includes(s.class)
    ).reduce((sum, s) => sum + s.totalValue * depreciationSchedule.bonusRate, 0) : 0),
    year1WithBonus,
    additionalYear1Deductions,
    year1TaxSavings,
    cumulativeBenefit5Year,
    cumulativeBenefit10Year,
    taxRate,
  };
}

// =================================================================
// MAIN ANALYSIS GENERATION
// =================================================================

/**
 * Check if the wizard state has sufficient data for cost seg analysis
 */
export function hasCostApproachData(state: WizardState): boolean {
  // Check if Cost Approach is enabled for any scenario
  const hasCostApproachScenario = state.scenarios?.some(s => 
    s.approaches?.includes('Cost Approach')
  );
  
  if (!hasCostApproachScenario) return false;
  
  // Check if we have buildings
  const buildings = state.improvementsInventory?.parcels?.flatMap(p => p.buildings) || [];
  if (buildings.length === 0) return false;
  
  // Check if we have land valuation
  const hasLandValue = (state.landValuationData?.concludedLandValue ?? 0) > 0;
  
  return hasLandValue || buildings.length > 0;
}

/**
 * Generate a complete cost segregation analysis
 */
export function generateCostSegAnalysis(state: WizardState): CostSegAnalysis {
  const propertyClass = determinePropertyClass(state);
  const currentYear = new Date().getFullYear();
  const bonusRate = getBonusRate(currentYear);
  const taxRate = state.costSegSettings?.taxRate || DEFAULT_TAX_RATE;
  
  // Extract building data
  const buildingCosts = extractBuildingCosts(state);
  
  // Calculate total costs
  const totalBuildingCost = buildingCosts.reduce((sum, b) => sum + b.totalCost, 0);
  const siteImprovementsCost = state.siteImprovements?.reduce((sum, si) => 
    sum + (si.contributoryValue || si.replacementCostNew || 0), 0) || 0;
  
  const landValue = state.landValuationData?.concludedLandValue || 0;
  const totalProjectCost = totalBuildingCost + siteImprovementsCost + landValue;
  const depreciableBasis = totalBuildingCost + siteImprovementsCost;
  
  // Generate components
  const buildingComponents = buildingCosts.flatMap(b => 
    generateBuildingComponents(b, propertyClass)
  );
  const siteComponents = generateSiteComponents(state.siteImprovements || []);
  const allComponents = [...buildingComponents, ...siteComponents];
  
  // Update percent of total for each component
  for (const comp of allComponents) {
    comp.percentOfTotal = depreciableBasis > 0 
      ? (comp.cost / depreciableBasis) * 100 
      : 0;
  }
  
  // Calculate summaries
  const summaryByClass = calculateClassSummary(allComponents, depreciableBasis, bonusRate);
  const buildingSystems = calculateBuildingSystems(buildingComponents, totalBuildingCost);
  
  // Generate depreciation schedule
  const depreciationSchedule = generateDepreciationSchedule(
    summaryByClass,
    bonusRate,
    taxRate,
    currentYear
  );
  
  // Calculate tax benefits
  const taxBenefitProjection = calculateTaxBenefit(
    summaryByClass,
    depreciationSchedule,
    taxRate
  );
  
  // Build property address
  const address = state.subjectData?.address;
  const propertyAddress = address 
    ? `${address.street}, ${address.city}, ${address.state} ${address.zip}`
    : 'Property Address Not Specified';
  
  return {
    id: generateId(),
    propertyId: state.subjectData?.taxId || 'unknown',
    propertyAddress,
    propertyClass,
    analysisDate: new Date().toISOString(),
    preparedBy: state.subjectData?.inspectorName || undefined,
    
    totalProjectCost,
    landValue,
    depreciableBasis,
    
    components: allComponents,
    summaryByClass,
    buildingSystems,
    taxBenefitProjection,
    depreciationSchedule,
    
    bonusDepreciationRate: bonusRate,
    taxRate,
    placementInServiceDate: state.scenarios?.[0]?.effectiveDate || new Date().toISOString().split('T')[0],
    methodology: 'cost-estimate',
    
    lastModified: new Date().toISOString(),
    version: 1,
  };
}

/**
 * Apply user override to a component
 */
export function applyComponentOverride(
  analysis: CostSegAnalysis,
  componentId: string,
  newClass: DepreciationClass,
  justification?: string
): CostSegAnalysis {
  const updatedComponents = analysis.components.map(comp => {
    if (comp.id === componentId) {
      return {
        ...comp,
        depreciationClassOverride: newClass,
        overrideJustification: justification,
        classificationSource: 'manual' as const,
      };
    }
    return comp;
  });
  
  // Recalculate summaries
  const summaryByClass = calculateClassSummary(
    updatedComponents, 
    analysis.depreciableBasis, 
    analysis.bonusDepreciationRate
  );
  
  const depreciationSchedule = generateDepreciationSchedule(
    summaryByClass,
    analysis.bonusDepreciationRate,
    analysis.taxRate,
    parseInt(analysis.placementInServiceDate.split('-')[0])
  );
  
  const taxBenefitProjection = calculateTaxBenefit(
    summaryByClass,
    depreciationSchedule,
    analysis.taxRate
  );
  
  return {
    ...analysis,
    components: updatedComponents,
    summaryByClass,
    depreciationSchedule,
    taxBenefitProjection,
    lastModified: new Date().toISOString(),
    version: analysis.version + 1,
  };
}

/**
 * Update tax rate and recalculate
 */
export function updateTaxRate(
  analysis: CostSegAnalysis,
  newTaxRate: number
): CostSegAnalysis {
  const depreciationSchedule = generateDepreciationSchedule(
    analysis.summaryByClass,
    analysis.bonusDepreciationRate,
    newTaxRate,
    parseInt(analysis.placementInServiceDate.split('-')[0])
  );
  
  const taxBenefitProjection = calculateTaxBenefit(
    analysis.summaryByClass,
    depreciationSchedule,
    newTaxRate
  );
  
  return {
    ...analysis,
    taxRate: newTaxRate,
    depreciationSchedule,
    taxBenefitProjection,
    lastModified: new Date().toISOString(),
    version: analysis.version + 1,
  };
}

