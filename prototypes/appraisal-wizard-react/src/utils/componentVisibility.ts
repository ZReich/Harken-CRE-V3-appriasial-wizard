/**
 * Component Visibility Utility
 * 
 * Determines which components should be visible based on the current
 * wizard configuration (property type, scenario, approaches selected).
 */

import type { AppraisalScenario } from '../types';

// =================================================================
// CONFIGURATION INTERFACE
// =================================================================

export interface WizardConfig {
  propertyType: string | null;
  propertySubtype: string | null;
  propertyInterest: string;
  hasImprovements: boolean;
  activeScenario: AppraisalScenario | null;
  
  // Assignment context for smart visibility
  propertyStatus?: string;
  occupancyStatus?: string;
  plannedChanges?: string;
  hasActualRentRoll?: boolean;   // Set based on whether rent roll has data
  hasActualExpenses?: boolean;   // Set based on whether expenses have data
}

// =================================================================
// VISIBILITY RESULT INTERFACE
// =================================================================

export interface ComponentVisibility {
  // Income Approach components
  rentComparableGrid: boolean;
  rentRollAnalysis: boolean;
  expenseComparableGrid: boolean;
  dcfAnalysis: boolean;
  dcfDetailedTable: boolean;
  directCapitalization: boolean;
  
  // Multi-Family Approach components
  multiFamilyGrid: boolean;
  
  // Sales Comparison components
  improvedSalesGrid: boolean;
  capRateExtraction: boolean;
  
  // Land / Cost Approach components
  landSalesGrid: boolean;
  costNewCalculation: boolean;
  depreciationAnalysis: boolean;
  entrepreneurialProfit: boolean;
  leaseUpCosts: boolean;
  
  // HBU components
  hbuAsVacant: boolean;
  hbuAsImproved: boolean;
  
  // Market Analysis components
  marketRentTrends: boolean;
  marketSaleTrends: boolean;
  marketSupplyDemand: boolean;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Determines if the property type is income-producing
 */
export function isIncomeProducing(propertyType: string | null, subtype: string | null): boolean {
  if (!propertyType) return false;
  
  // Commercial properties are generally income-producing
  if (propertyType === 'commercial') return true;
  
  // Multi-family residential is income-producing
  if (subtype) {
    const incomeSubtypes = ['multifamily', '2-4unit', 'apartment', 'mixed-use', 'mixeduse'];
    if (incomeSubtypes.some(t => subtype.toLowerCase().includes(t))) return true;
  }
  
  return false;
}

/**
 * Checks if a specific approach is included in the scenario
 */
function hasApproach(scenario: AppraisalScenario | null, approachName: string): boolean {
  if (!scenario) return false;
  return scenario.approaches.some(a => 
    a.toLowerCase().includes(approachName.toLowerCase())
  );
}

// =================================================================
// MAIN VISIBILITY FUNCTION
// =================================================================

/**
 * Get the visibility flags for all optional components based on wizard config
 */
export function getVisibleComponents(config: WizardConfig): ComponentVisibility {
  const { 
    propertyType, propertySubtype, propertyInterest, hasImprovements, activeScenario,
    propertyStatus, occupancyStatus, plannedChanges: _plannedChanges, hasActualRentRoll, hasActualExpenses
  } = config;
  
  // plannedChanges is available for future use in visibility logic
  void _plannedChanges;
  
  const incomeApproachActive = hasApproach(activeScenario, 'income');
  const salesComparisonActive = hasApproach(activeScenario, 'sales');
  const costApproachActive = hasApproach(activeScenario, 'cost');
  const landValuationActive = hasApproach(activeScenario, 'land');
  const multiFamilyActive = hasApproach(activeScenario, 'multi-family');
  
  const isIncome = isIncomeProducing(propertyType, propertySubtype);
  const isLeasedFee = propertyInterest === 'leased_fee';
  const isLand = propertyType === 'land';
  
  // Check if this is a multi-family property
  const isMultiFamily = propertySubtype === 'multifamily' || propertySubtype === '2-4unit' ||
                        propertySubtype?.includes('multifamily') || propertySubtype?.includes('2-4unit') ||
                        propertySubtype?.includes('apartment');
  
  const scenarioName = activeScenario?.name || 'As Is';
  const isAsIs = scenarioName === 'As Is';
  const isAsCompleted = scenarioName === 'As Completed';
  const isAsStabilized = scenarioName === 'As Stabilized';
  const isAsProposed = scenarioName === 'As Proposed';
  
  // === SMART RENT COMPS VISIBILITY ===
  // Show rent comps when we need to project market rents
  const needsProjectedRents = 
    occupancyStatus === 'lease_up' || 
    occupancyStatus === 'vacant' ||
    hasActualRentRoll === false;  // No existing rent roll data
  
  const isProspectiveScenario = isAsStabilized || isAsCompleted || isAsProposed;
  
  const isNewDevelopment = 
    propertyStatus === 'proposed' || 
    propertyStatus === 'under_construction';
  
  const showRentComps = !!(incomeApproachActive && isIncome && (
    needsProjectedRents || isProspectiveScenario || isNewDevelopment
  ));
  
  // === SMART EXPENSE COMPS VISIBILITY ===
  // NNN leases typically have minimal landlord expenses
  const isNNNLikely = propertySubtype === 'industrial';
  const isOwnerOccupied = occupancyStatus === 'not_applicable';
  
  const hasNoHistoricalExpenses = 
    isNewDevelopment || 
    hasActualExpenses === false;
  
  const needsExpenseSupport = 
    !isNNNLikely && 
    !isOwnerOccupied && 
    (hasNoHistoricalExpenses || isAsCompleted || isAsStabilized);
  
  const showExpenseComps = !!(incomeApproachActive && isIncome && needsExpenseSupport);
  
  return {
    // Income Approach Components
    rentComparableGrid: showRentComps,  // Smart visibility based on assignment context
    rentRollAnalysis: !!(incomeApproachActive && (isLeasedFee || isIncome)),
    expenseComparableGrid: showExpenseComps,  // Smart visibility based on assignment context
    dcfAnalysis: !!incomeApproachActive,
    dcfDetailedTable: !!(incomeApproachActive && (isAsStabilized || isAsCompleted || isAsProposed)),
    directCapitalization: !!incomeApproachActive,
    
    // Multi-Family Approach Components
    multiFamilyGrid: !!(multiFamilyActive && isMultiFamily),
    
    // Sales Comparison Components
    improvedSalesGrid: !!(salesComparisonActive && hasImprovements),
    capRateExtraction: !!(salesComparisonActive && incomeApproachActive),
    
    // Land / Cost Approach Components
    landSalesGrid: !!(landValuationActive || costApproachActive || isLand),
    costNewCalculation: !!(costApproachActive && hasImprovements),
    depreciationAnalysis: !!(costApproachActive && isAsIs),
    entrepreneurialProfit: !!(costApproachActive && (isAsCompleted || isAsStabilized || isAsProposed)),
    leaseUpCosts: isAsStabilized,
    
    // HBU Components
    hbuAsVacant: true, // Always required
    hbuAsImproved: hasImprovements,
    
    // Market Analysis Components
    marketRentTrends: !!incomeApproachActive,
    marketSaleTrends: !!salesComparisonActive,
    marketSupplyDemand: true, // Always useful
  };
}

// =================================================================
// ANALYSIS DEPTH RECOMMENDATIONS
// =================================================================

export type AnalysisDepth = 'simplified' | 'robust';

export interface DepthRecommendation {
  recommended: AnalysisDepth;
  reason: string;
}

export interface AnalysisDepthRecommendations {
  dcfAnalysis: DepthRecommendation;
  rentComparables: DepthRecommendation;
  expenseComparables: DepthRecommendation;
  capRateSupport: DepthRecommendation;
  depreciation: DepthRecommendation;
}

/**
 * Get recommendations for simplified vs robust analysis depth
 */
export function getAnalysisDepthRecommendations(config: WizardConfig & {
  loanPurpose?: string;
  estimatedValue?: number;
  tenantCount?: number;
  hasLeaseRollover?: boolean;
}): AnalysisDepthRecommendations {
  const { activeScenario, propertyType: _propertyType, propertySubtype, loanPurpose, estimatedValue, tenantCount, hasLeaseRollover } = config;
  void _propertyType; // Reserved for property-type-specific recommendations
  
  const scenarioName = activeScenario?.name || 'As Is';
  const isConstructionLoan = loanPurpose === 'construction';
  const isBridgeLoan = loanPurpose === 'bridge';
  const isHighValue = (estimatedValue || 0) > 20000000;
  const _isLowValue = (estimatedValue || 0) < 5000000;
  void _isLowValue; // Reserved for simplified analysis recommendations
  const isMultiTenant = (tenantCount || 0) > 1;
  const isAsStabilized = scenarioName === 'As Stabilized';
  const isAsCompleted = scenarioName === 'As Completed';
  const isNewConstruction = propertySubtype?.includes('proposed') || propertySubtype?.includes('construction');
  
  return {
    dcfAnalysis: {
      recommended: (isConstructionLoan || isBridgeLoan || isAsStabilized || hasLeaseRollover || isMultiTenant) 
        ? 'robust' : 'simplified',
      reason: isConstructionLoan 
        ? 'Construction lenders typically require year-by-year DCF projections showing lease-up timeline.'
        : isAsStabilized 
          ? 'As Stabilized scenarios benefit from showing the absorption and stabilization timeline.'
          : hasLeaseRollover 
            ? 'Properties with near-term lease rollover should show year-by-year lease expiration impacts.'
            : isMultiTenant 
              ? 'Multi-tenant properties benefit from detailed cash flow projections.'
              : 'Simplified DCF is sufficient for straightforward, stabilized properties.',
    },
    
    rentComparables: {
      recommended: (isAsStabilized || isAsCompleted || isNewConstruction) ? 'robust' : 'simplified',
      reason: isAsStabilized 
        ? 'Must support projected market rents with formal comparable analysis.'
        : isNewConstruction 
          ? 'New construction requires market rent support since there is no rental history.'
          : 'Narrative reference to market data may be sufficient for stabilized properties.',
    },
    
    expenseComparables: {
      recommended: (isNewConstruction || isAsCompleted) ? 'robust' : 'simplified',
      reason: isNewConstruction 
        ? 'No historical expenses available - must rely on comparable properties.'
        : isAsCompleted 
          ? 'Post-renovation expenses should be supported by comparable data.'
          : 'Subject\'s actual expenses can be used with narrative market comparison.',
    },
    
    capRateSupport: {
      recommended: (isHighValue || isConstructionLoan) ? 'robust' : 'simplified',
      reason: isHighValue 
        ? 'High-value properties warrant extracted cap rates from actual sales.'
        : isConstructionLoan 
          ? 'Lenders expect market-derived cap rate support from transactions.'
          : 'Investor surveys and broker opinions may be sufficient.',
    },
    
    depreciation: {
      recommended: (isHighValue || config.hasImprovements) ? 'robust' : 'simplified',
      reason: isHighValue 
        ? 'Detailed depreciation breakdown (physical, functional, external) adds credibility.'
        : 'Age-life method is acceptable for straightforward properties.',
    },
  };
}

