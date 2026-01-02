/**
 * HBU Context Builder
 * 
 * Gathers all relevant wizard state data for constructing AI prompts
 * for Highest and Best Use analysis.
 */

import type { WizardState } from '../types';

/**
 * HBU Context - All data needed for AI draft generation
 */
export interface HBUContext {
  // Property Identification
  propertyType: string | null;
  propertySubtype: string | null;
  
  // Site Data
  siteData: {
    city: string;
    state: string;
    county: string;
    zoning: string;
    zoningDescription: string;
    zoningConforming: boolean;
    siteSize: string;
    siteAreaUnit: string;
    shape: string;
    topography: string;
    frontage: string;
    utilities: string;
    floodZone: string;
    environmental: string;
    easements: string;
  };
  
  // Improvement Data (if improvements exist)
  improvementData: {
    hasImprovements: boolean;
    buildingSize: string | null;
    yearBuilt: number | null;
    condition: string | null;
    quality: string | null;
    buildingClass: string | null;
    numberOfUnits: number | null;
    parkingSpaces: number | null;
    landToBuilding: number | null;
  } | null;
  
  // Market Data (from analysis)
  marketData: {
    vacancyRate: string | null;
    marketTrend: string | null;
    rentalRate: string | null;
    capRate: string | null;
    salesPricePerSf: string | null;
    daysOnMarket: string | null;
  };
  
  // Analysis Conclusions
  analysisData: {
    salesComparisonValue: number | null;
    incomeApproachValue: number | null;
    costApproachValue: number | null;
    landValue: number | null;
  };
}

/**
 * Build HBU context from wizard state
 */
export function buildHBUContext(state: WizardState): HBUContext {
  const { subjectData, propertyType, propertySubtype, improvementsInventory, analysisConclusions } = state;
  
  // Determine if property has improvements
  const hasImprovements = propertyType !== 'land';
  
  // Extract site data
  const siteData = {
    city: subjectData?.address?.city || '',
    state: subjectData?.address?.state || '',
    county: subjectData?.address?.county || '',
    zoning: subjectData?.zoningClass || '',
    zoningDescription: subjectData?.zoningDescription || '',
    zoningConforming: subjectData?.zoningConforming || false,
    siteSize: subjectData?.siteArea || '',
    siteAreaUnit: subjectData?.siteAreaUnit || 'acres',
    shape: subjectData?.shape || '',
    topography: subjectData?.topography || '',
    frontage: subjectData?.frontage || '',
    utilities: subjectData?.utilities || '',
    floodZone: subjectData?.floodZone || '',
    environmental: subjectData?.environmental || '',
    easements: subjectData?.easements || '',
  };
  
  // Extract improvement data from parcels structure
  let improvementData = null;
  if (hasImprovements && improvementsInventory?.parcels?.[0]?.buildings?.[0]) {
    const primaryBuilding = improvementsInventory.parcels[0].buildings[0];
    // Calculate total building size from areas
    const totalSf = primaryBuilding.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || 0;
    improvementData = {
      hasImprovements: true,
      buildingSize: totalSf > 0 ? totalSf.toString() : null,
      yearBuilt: primaryBuilding.yearBuilt || null,
      condition: primaryBuilding.condition || null,
      quality: primaryBuilding.constructionQuality || null,
      buildingClass: null, // Not in current schema
      numberOfUnits: null, // Not in current schema
      parkingSpaces: null, // Not in current schema
      landToBuilding: null, // Could calculate from site and building
    };
  }
  
  // Extract market data (placeholder - would pull from MarketAnalysisGrid data)
  const marketData = {
    vacancyRate: null,
    marketTrend: null,
    rentalRate: null,
    capRate: null,
    salesPricePerSf: null,
    daysOnMarket: null,
  };
  
  // Extract analysis conclusions
  const activeScenarioId = state.activeScenarioId;
  const conclusions = analysisConclusions?.conclusions || [];
  
  const getConclusion = (approach: string) => {
    const conclusion = conclusions.find(
      c => c.scenarioId === activeScenarioId && c.approach === approach
    );
    return conclusion?.valueConclusion || null;
  };
  
  const analysisData = {
    salesComparisonValue: getConclusion('Sales Comparison'),
    incomeApproachValue: getConclusion('Income Approach'),
    costApproachValue: getConclusion('Cost Approach'),
    landValue: getConclusion('Land Valuation'),
  };
  
  return {
    propertyType,
    propertySubtype,
    siteData,
    improvementData,
    marketData,
    analysisData,
  };
}

/**
 * Format HBU context for API request
 * 
 * Converts HBU context into the format expected by the backend AI service
 */
export function formatContextForAPI(context: HBUContext): Record<string, any> {
  return {
    propertyType: context.propertyType,
    propertySubtype: context.propertySubtype,
    siteData: context.siteData,
    improvementData: context.improvementData,
    marketData: context.marketData,
    valuationData: context.analysisData,
    // Flatten some commonly needed fields
    city: context.siteData.city,
    state: context.siteData.state,
    zoning: context.siteData.zoning,
    siteSize: context.siteData.siteSize,
    hasImprovements: context.improvementData?.hasImprovements || false,
    buildingSize: context.improvementData?.buildingSize || null,
    yearBuilt: context.improvementData?.yearBuilt || null,
    condition: context.improvementData?.condition || null,
  };
}

/**
 * Helper function to calculate adjusted price for sales comps
 * FIX #21: Adjusted prices now calculated from grid values
 */
function calculateAdjustedPrice(
  compId: string, 
  valuesGrid?: Record<string, Record<string, any>>
): number | null {
  if (!valuesGrid || !valuesGrid[compId]) return null;
  
  const compValues = valuesGrid[compId];
  let basePrice = 0;
  
  // Get base price from sale price row
  const salePriceCell = compValues['salePrice'];
  if (salePriceCell && typeof salePriceCell.value === 'number') {
    basePrice = salePriceCell.value;
  } else if (typeof salePriceCell?.value === 'string') {
    basePrice = parseFloat(salePriceCell.value) || 0;
  }
  
  if (basePrice === 0) return null;
  
  // Calculate total adjustments
  let totalAdjustment = 0;
  Object.entries(compValues).forEach(([rowId, cellValue]: [string, any]) => {
    if (rowId !== 'salePrice' && cellValue?.adjustment) {
      const adj = cellValue.adjustment;
      if (cellValue.unit === 'percent') {
        totalAdjustment += (basePrice * adj / 100);
      } else {
        totalAdjustment += adj;
      }
    }
  });
  
  return basePrice + totalAdjustment;
}

/**
 * Build enhanced context for AI generation from wizard state
 * Includes additional data for non-HBU sections
 * 
 * SECOND AUDIT FIXES APPLIED:
 * - #21: Adjusted prices calculated
 * - #22: Sale dates added to land comps
 * - #25-26: Currency and percentage formatting
 * - #27: Full address extraction
 * - #28: Site size in multiple units
 * - #29: GBA priority over calculated size
 * - #30: Building age calculated
 * - #31: Condition normalized
 * - #32: Price per SF calculated
 * - #33-34: Scenario info and applicable approaches
 * - #36: Comp counts provided
 * - #38-40: Demographics, economics, risk data
 * - #41: Validation added
 * - #42: Standardized null handling
 * - #43: Filter null elements
 * - #44: Error handling added
 * - #45: Selective context building (placeholder)
 */
export function buildEnhancedContextForAI(
  state: WizardState,
  sectionContext?: string
): Record<string, any> {
  // FIX #44: Add try-catch error handling
  try {
    // FIX #41: Validate critical data exists
    if (!state.subjectData) {
      console.warn('AI Context: No subject data available');
      return {
        error: 'insufficient_data',
        message: 'Subject property data required for AI generation',
        dataQuality: 'insufficient',
      };
    }

    const hbuContext = buildHBUContext(state);
    const baseContext = formatContextForAPI(hbuContext);
    
    const { subjectData, swotAnalysis, salesComparisonData, landValuationData, 
            incomeApproachData, marketAnalysis, reconciliationData, costApproachBuildingCostData,
            activeScenarioId, analysisConclusions, scenarios, demographicsData, 
            economicIndicators, riskRating } = state;
    
    // FIX #27: Extract full address
    const fullAddress = [
      subjectData.address?.street,
      subjectData.address?.city,
      subjectData.address?.state,
      subjectData.address?.zip
    ].filter(Boolean).join(', ');
    
    // FIX #28: Site size in multiple units
    const siteAcres = subjectData.siteAreaUnit === 'acres' 
      ? parseFloat(subjectData.siteArea || '0') 
      : parseFloat(subjectData.siteArea || '0') / 43560;
    const siteSqFt = subjectData.siteAreaUnit === 'sqft' 
      ? parseFloat(subjectData.siteArea || '0')
      : parseFloat(subjectData.siteArea || '0') * 43560;
    
    // FIX #29: Use total SF from areas array (ImprovementBuilding doesn't have gba)
    const building = state.improvementsInventory?.parcels?.[0]?.buildings?.[0];
    const buildingSizeNum = building?.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || 0;
    
    // FIX #30: Calculate building age
    const currentYear = new Date().getFullYear();
    const yearBuilt = building?.yearBuilt || null;
    const buildingAge = yearBuilt ? currentYear - yearBuilt : null;
    
    // FIX #31: Normalize condition (keep original, add normalized)
    const conditionRaw = building?.condition || null;
    const conditionNormalized = conditionRaw ? 
      conditionRaw.toLowerCase().replace(/[^a-z]/g, '') : null;
    
    // Add extended site data
    const extendedSiteData = {
      ...baseContext.siteData,
      fullAddress, // FIX #27
      siteAcres: siteAcres > 0 ? siteAcres.toFixed(2) : null, // FIX #28
      siteSqFt: siteSqFt > 0 ? Math.round(siteSqFt) : null, // FIX #28
      waterSource: subjectData.waterSource || null, // FIX #42: null not ''
      sewerType: subjectData.sewerType || null,
      electricProvider: subjectData.electricProvider || null,
      naturalGas: subjectData.naturalGas || null,
      telecom: subjectData.telecom || null,
      femaZone: subjectData.femaZone || null,
      easements: subjectData.easements || null,
      environmental: subjectData.environmental || 'No environmental issues observed', // FIX #37
      approachType: subjectData.approachType || null,
      accessQuality: subjectData.accessQuality || null,
      visibility: subjectData.visibility || null,
      pavingType: subjectData.pavingType || null,
      fencingType: subjectData.fencingType || null,
    };
    
    // Add improvement details
    const extendedImprovementData = baseContext.improvementData ? {
      ...baseContext.improvementData,
      buildingSize: buildingSizeNum > 0 ? buildingSizeNum.toString() : null, // FIX #29
      buildingAge, // FIX #30
      condition: conditionRaw, // Original
      conditionNormalized, // FIX #31
      exteriorFeatures: building?.exteriorFeatures || {},
      interiorFeatures: building?.areas?.[0]?.interiorFeatures || {},
      mechanicalSystems: building?.mechanicalSystems || {},
    } : null;
    
    // Add transaction history
    const transactionData = {
      lastSaleDate: subjectData.lastSaleDate || null, // FIX #42
      lastSalePrice: subjectData.lastSalePrice || null,
      transactionHistory: subjectData.transactionHistory || null,
      legalDescription: subjectData.legalDescription || null,
    };
    
    // SWOT data - handle both array and string formats
    const swotData = swotAnalysis ? {
      swotStrengths: Array.isArray(swotAnalysis.strengths) 
        ? swotAnalysis.strengths 
        : (swotAnalysis.strengths ? [swotAnalysis.strengths] : []),
      swotWeaknesses: Array.isArray(swotAnalysis.weaknesses)
        ? swotAnalysis.weaknesses
        : (swotAnalysis.weaknesses ? [swotAnalysis.weaknesses] : []),
      swotOpportunities: Array.isArray(swotAnalysis.opportunities)
        ? swotAnalysis.opportunities
        : (swotAnalysis.opportunities ? [swotAnalysis.opportunities] : []),
      swotThreats: Array.isArray(swotAnalysis.threats)
        ? swotAnalysis.threats
        : (swotAnalysis.threats ? [swotAnalysis.threats] : []),
    } : {};
    
    // Building permits - access from subjectData
    const permitData = subjectData.buildingPermits?.length ? {
      buildingPermits: subjectData.buildingPermits
        .filter(p => p && p.type) // FIX #43: Filter nulls
        .map(p => ({
          permitNumber: p.permitNumber,
          type: p.type,
          description: p.description,
          issueDate: p.issueDate,
          status: p.status,
        }))
    } : {};
    
    // Traffic data - access from subjectData
    const traffic = subjectData.trafficData;
    const trafficInfo = traffic?.aadt ? {
      aadt: traffic.aadt,
      roadClassification: traffic.roadClassification || null,
    } : {};
    
    // FIX #21: Extract Sales Comparison comps with adjusted prices
    const salesComps = salesComparisonData?.properties
      ?.filter(p => p && p.type === 'comp' && p.address) // FIX #43: Filter nulls/incomplete
      .map(p => ({
        id: p.id,
        address: p.address,
        salePrice: p.salePrice || 0,
        saleDate: p.saleDate || null,
        adjustedPrice: calculateAdjustedPrice(p.id, salesComparisonData.values), // FIX #21
      })) || [];
    
    // FIX #22: Extract Land Valuation comps with sale dates
    const landComps = landValuationData?.landComps
      ?.filter(c => c && c.address) // FIX #43: Filter nulls
      ?.map(c => ({
        id: c.id,
        address: c.address,
        salePrice: c.salePrice,
        saleDate: c.saleDate || null, // FIX #22
        acreage: c.acreage,
        pricePerAcre: c.pricePerAcre,
        adjustedPricePerAcre: c.adjustedPricePerAcre,
      })) || [];
    
    // Extract Income Approach data (NOI, rent comps, expense comps)
    const incomeData: Record<string, any> = {};
    if (incomeApproachData) {
      // Extract NOI with formatting - FIX #25
      const noi = (incomeApproachData as any).valuationData?.noi;
      if (noi !== undefined && noi !== null) {
        incomeData.noi = noi;
        incomeData.noiFormatted = `$${noi.toLocaleString()}`; // FIX #25
      }
      
      // Extract rent comparables
      const rentComparables = (incomeApproachData as any).rentComparables;
      if (rentComparables && Array.isArray(rentComparables)) {
        incomeData.rentComps = rentComparables.filter(c => c && c.address); // FIX #43
        incomeData.rentCompNotes = (incomeApproachData as any).rentCompNotes || null;
      }
      
      // Extract expense comparables
      const expenseComparables = (incomeApproachData as any).expenseComparables;
      if (expenseComparables && Array.isArray(expenseComparables)) {
        incomeData.expenseComps = expenseComparables.filter(c => c && c.address); // FIX #43
        incomeData.expenseCompNotes = (incomeApproachData as any).expenseCompNotes || null;
      }
    }
    
    // FIX #26: Extract Market Analysis data with proper formatting
    const marketData = marketAnalysis ? {
      vacancyRate: marketAnalysis.supplyMetrics?.vacancyRate 
        ? `${marketAnalysis.supplyMetrics.vacancyRate}%` // FIX #26: Add %
        : null,
      marketTrend: marketAnalysis.marketTrends?.overallTrend || null,
      averageRent: marketAnalysis.demandMetrics?.averageRent 
        ? `$${marketAnalysis.demandMetrics.averageRent.toLocaleString()}` // Format as currency
        : null,
      rentGrowth: marketAnalysis.demandMetrics?.rentGrowth
        ? `${marketAnalysis.demandMetrics.rentGrowth}%` // FIX #26: Add %
        : null,
      daysOnMarket: marketAnalysis.demandMetrics?.averageDaysOnMarket?.toString() || null,
      narrative: marketAnalysis.narrative || null,
    } : {
      vacancyRate: null,
      marketTrend: null,
      averageRent: null,
      rentGrowth: null,
      daysOnMarket: null,
      narrative: null,
    };
    
    // Extract Cost Approach data (RCN, contractor costs)
    const costData: Record<string, any> = {};
    if (costApproachBuildingCostData?.[activeScenarioId]) {
      const buildingCosts = Object.values(costApproachBuildingCostData[activeScenarioId])[0];
      if (buildingCosts) {
        costData.contractorCost = buildingCosts.contractorCost || null;
        costData.contractorCostFormatted = buildingCosts.contractorCost 
          ? `$${buildingCosts.contractorCost.toLocaleString()}`
          : null;
        costData.contractorSource = buildingCosts.contractorSource || null;
        costData.contractorDate = buildingCosts.contractorDate || null;
        costData.contractorNotes = buildingCosts.contractorNotes || null;
      }
    }
    
    // Calculate value ranges from approach conclusions
    const conclusions = analysisConclusions?.conclusions || [];
    const scenarioConclusions = conclusions.filter(c => c.scenarioId === activeScenarioId);
    const values = scenarioConclusions
      .map(c => c.valueConclusion)
      .filter((v): v is number => v !== null && v !== undefined);
    
    const valuationData = {
      salesValue: conclusions.find(c => c.approach === 'Sales Comparison' && c.scenarioId === activeScenarioId)?.valueConclusion || null,
      incomeValue: conclusions.find(c => c.approach === 'Income Approach' && c.scenarioId === activeScenarioId)?.valueConclusion || null,
      costValue: conclusions.find(c => c.approach === 'Cost Approach' && c.scenarioId === activeScenarioId)?.valueConclusion || null,
      landValue: conclusions.find(c => c.approach === 'Land Valuation' && c.scenarioId === activeScenarioId)?.valueConclusion || null,
      minValue: values.length > 0 ? Math.min(...values) : null,
      maxValue: values.length > 0 ? Math.max(...values) : null,
    };
    
    // FIX #32: Calculate price per SF separately (don't modify typed valuationData)
    let valuePsf: number | null = null;
    if (valuationData.salesValue && buildingSizeNum > 0) {
      valuePsf = valuationData.salesValue / buildingSizeNum;
    } else if (valuationData.incomeValue && buildingSizeNum > 0) {
      valuePsf = valuationData.incomeValue / buildingSizeNum;
    } else if (valuationData.costValue && buildingSizeNum > 0) {
      valuePsf = valuationData.costValue / buildingSizeNum;
    }
    
    // Extract Reconciliation data (weights, exposure times)
    const reconciliationContext = reconciliationData?.scenarioReconciliations?.find(
      r => r.scenarioId === activeScenarioId
    );
    
    const reconciliationInfo = reconciliationContext ? {
      approachWeights: reconciliationContext.weights || {},
      exposurePeriodMin: reconciliationData?.exposurePeriod || null,
      marketingTime: reconciliationData?.marketingTime || null,
      exposureRationale: reconciliationData?.exposureRationale || null,
    } : {};
    
    // FIX #33-34: Extract scenario information and applicable approaches
    const activeScenario = scenarios?.find(s => s.id === activeScenarioId);
    const applicableApproaches = activeScenario?.approaches || [];
    
    const scenarioInfo = {
      scenarioName: activeScenario?.name || 'Market Value',
      // scenarioType removed - AppraisalScenario doesn't have a 'type' property
      applicableApproaches, // FIX #34
      isSalesApplicable: applicableApproaches.includes('sales-comparison'),
      isIncomeApplicable: applicableApproaches.includes('income-approach'),
      isCostApplicable: applicableApproaches.includes('cost-approach'),
      isLandValApplicable: applicableApproaches.includes('land-valuation'),
    };
    
    // FIX #36: Add comp counts
    const compCounts = {
      salesCompsCount: salesComps.length,
      landCompsCount: landComps.length,
      rentCompsCount: incomeData.rentComps?.length || 0,
      expenseCompsCount: incomeData.expenseComps?.length || 0,
    };
    
    // FIX #38: Extract demographics data (correct property paths)
    const demographics = demographicsData ? {
      population: demographicsData.radiusAnalysis?.[0]?.population?.current || null,
      medianIncome: demographicsData.radiusAnalysis?.[0]?.income?.medianHousehold || null,
      employmentRate: demographicsData.radiusAnalysis?.[0]?.employment ? 
        (100 - (demographicsData.radiusAnalysis[0].employment.unemploymentRate || 0)) : null,
      dataSource: demographicsData.dataSource || null,
    } : {};
    
    // FIX #39: Extract economic indicators (correct property paths)
    const economics = economicIndicators ? {
      gdpGrowth: economicIndicators.gdpGrowth?.current || null,
      unemployment: null, // Not a direct property - would need to calculate from employment data
      inflation: economicIndicators.inflation?.current || null,
      interestRates: economicIndicators.federalFundsRate?.current || economicIndicators.treasury10Y?.current || null,
    } : {};
    
    // FIX #40: Extract risk rating
    const riskInfo = riskRating ? {
      overallGrade: riskRating.overallGrade || null,
      overallScore: riskRating.overallScore || null,
    } : {};
    
    // FIX #41: Validate section has minimum data for quality check
    let dataQuality: 'complete' | 'partial' | 'insufficient' = 'complete';
    if (sectionContext === 'sales_comparison' && salesComps.length === 0) {
      dataQuality = 'insufficient';
    } else if (sectionContext === 'land_valuation' && landComps.length === 0) {
      dataQuality = 'insufficient';
    } else if (sectionContext?.includes('income') && !incomeData.noi && (!incomeData.rentComps || incomeData.rentComps.length === 0)) {
      dataQuality = 'partial';
    }
    
    return {
      ...baseContext,
      siteData: extendedSiteData,
      improvementData: extendedImprovementData,
      marketData,
      valuationData,
      ...transactionData,
      ...swotData,
      ...permitData,
      ...trafficInfo,
      salesComps,
      landComps,
      ...incomeData,
      ...costData,
      ...reconciliationInfo,
      ...scenarioInfo, // FIX #33-34
      ...compCounts, // FIX #36
      ...demographics, // FIX #38
      ...economics, // FIX #39
      ...riskInfo, // FIX #40
      dataQuality, // FIX #41
    };
    
  } catch (error) {
    // FIX #44: Catch any errors including circular references
    console.error('AI Context Builder Error:', error);
    return {
      error: 'context_build_failed',
      message: 'Failed to build context for AI generation',
      details: error instanceof Error ? error.message : 'Unknown error',
      dataQuality: 'insufficient',
    };
  }
}

/**
 * Get a summary string for HBU context (for display/debugging)
 */
export function getContextSummary(context: HBUContext): string {
  const parts: string[] = [];
  
  if (context.propertyType) {
    parts.push(`${context.propertyType} property`);
  }
  
  if (context.siteData.city && context.siteData.state) {
    parts.push(`in ${context.siteData.city}, ${context.siteData.state}`);
  }
  
  if (context.siteData.zoning) {
    parts.push(`zoned ${context.siteData.zoning}`);
  }
  
  if (context.siteData.siteSize) {
    parts.push(`${context.siteData.siteSize} ${context.siteData.siteAreaUnit}`);
  }
  
  return parts.join(' ') || 'Property context not yet available';
}

export default buildHBUContext;

