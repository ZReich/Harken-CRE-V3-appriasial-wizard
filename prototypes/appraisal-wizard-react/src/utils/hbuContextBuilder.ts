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
 * Build enhanced context for AI generation from wizard state
 * Includes additional data for non-HBU sections
 * 
 * FIXED: All data extraction now properly connected to actual wizard state structure
 */
export function buildEnhancedContextForAI(state: WizardState): Record<string, any> {
  const hbuContext = buildHBUContext(state);
  const baseContext = formatContextForAPI(hbuContext);
  
  const { subjectData, swotAnalysis, salesComparisonData, landValuationData, 
          incomeApproachData, marketAnalysis, reconciliationData, costApproachBuildingCostData,
          activeScenarioId, analysisConclusions } = state;
  
  // Add extended site data
  const extendedSiteData = {
    ...baseContext.siteData,
    waterSource: subjectData?.waterSource || '',
    sewerType: subjectData?.sewerType || '',
    electricProvider: subjectData?.electricProvider || '',
    naturalGas: subjectData?.naturalGas || '',
    telecom: subjectData?.telecom || '',
    femaZone: subjectData?.femaZone || '',
    easements: subjectData?.easements || '',
    environmental: subjectData?.environmental || '',
    approachType: subjectData?.approachType || '',
    accessQuality: subjectData?.accessQuality || '',
    visibility: subjectData?.visibility || '',
    pavingType: subjectData?.pavingType || '',
    fencingType: subjectData?.fencingType || '',
  };
  
  // Add improvement details
  const building = state.improvementsInventory?.parcels?.[0]?.buildings?.[0];
  const extendedImprovementData = baseContext.improvementData ? {
    ...baseContext.improvementData,
    exteriorFeatures: building?.exteriorFeatures || {},
    interiorFeatures: building?.areas?.[0]?.interiorFeatures || {},
    mechanicalSystems: building?.mechanicalSystems || {},
  } : null;
  
  // Add transaction history
  const transactionData = {
    lastSaleDate: subjectData?.lastSaleDate || '',
    lastSalePrice: subjectData?.lastSalePrice || '',
    transactionHistory: subjectData?.transactionHistory || '',
    legalDescription: subjectData?.legalDescription || '',
  };
  
  // FIX #1-2: SWOT data - handle both array and string formats
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
  
  // FIX #3: Building permits - access from subjectData (not root of state)
  const permitData = subjectData?.buildingPermits?.length ? {
    buildingPermits: subjectData.buildingPermits.map(p => ({
      permitNumber: p.permitNumber,
      type: p.type,
      description: p.description,
      issueDate: p.issueDate,
      status: p.status,
    }))
  } : {};
  
  // FIX #4: Traffic data - access from subjectData (not root of state)
  const traffic = subjectData?.trafficData;
  const trafficInfo = traffic?.aadt ? {
    aadt: traffic.aadt,
    roadClassification: traffic.roadClassification || '',
  } : {};
  
  // FIX #5: Extract Sales Comparison comps
  const salesComps = salesComparisonData?.properties
    ?.filter(p => p.type === 'comp')
    .map(p => ({
      id: p.id,
      address: p.address,
      salePrice: p.salePrice || 0,
      saleDate: p.saleDate || '',
    })) || [];
  
  // FIX #6: Extract Land Valuation comps
  const landComps = landValuationData?.landComps?.map(c => ({
    id: c.id,
    address: c.address,
    salePrice: c.salePrice,
    acreage: c.acreage,
    pricePerAcre: c.pricePerAcre,
    adjustedPricePerAcre: c.adjustedPricePerAcre,
  })) || [];
  
  // FIX #7-8: Extract Income Approach data (NOI, rent comps, expense comps)
  const incomeData: Record<string, any> = {};
  if (incomeApproachData) {
    // Extract NOI if available (from valuationData)
    if ((incomeApproachData as any).valuationData?.noi !== undefined) {
      incomeData.noi = (incomeApproachData as any).valuationData.noi;
    }
    // Extract rent comparables if available
    if ((incomeApproachData as any).rentComparables && Array.isArray((incomeApproachData as any).rentComparables)) {
      incomeData.rentComps = (incomeApproachData as any).rentComparables;
      incomeData.rentCompNotes = (incomeApproachData as any).rentCompNotes || '';
    }
    // Extract expense comparables if available
    if ((incomeApproachData as any).expenseComparables && Array.isArray((incomeApproachData as any).expenseComparables)) {
      incomeData.expenseComps = (incomeApproachData as any).expenseComparables;
      incomeData.expenseCompNotes = (incomeApproachData as any).expenseCompNotes || '';
    }
  }
  
  // FIX #9: Extract Market Analysis data
  const marketData = marketAnalysis ? {
    vacancyRate: marketAnalysis.supplyMetrics?.vacancyRate?.toString() || null,
    marketTrend: marketAnalysis.marketTrends?.overallTrend || null,
    averageRent: marketAnalysis.demandMetrics?.averageRent?.toString() || null,
    rentGrowth: marketAnalysis.demandMetrics?.rentGrowth?.toString() || null,
    daysOnMarket: marketAnalysis.demandMetrics?.averageDaysOnMarket?.toString() || null,
    narrative: marketAnalysis.narrative || '',
  } : {
    vacancyRate: null,
    marketTrend: null,
    averageRent: null,
    rentGrowth: null,
    daysOnMarket: null,
    narrative: '',
  };
  
  // FIX #10: Extract Cost Approach data (RCN, contractor costs)
  const costData: Record<string, any> = {};
  if (costApproachBuildingCostData?.[activeScenarioId]) {
    const buildingCosts = Object.values(costApproachBuildingCostData[activeScenarioId])[0];
    if (buildingCosts) {
      costData.contractorCost = buildingCosts.contractorCost || null;
      costData.contractorSource = buildingCosts.contractorSource || null;
      costData.contractorDate = buildingCosts.contractorDate || null;
      costData.contractorNotes = buildingCosts.contractorNotes || '';
    }
  }
  
  // FIX #11: Calculate value ranges from approach conclusions
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
  
  // FIX #12: Extract Reconciliation data (weights, exposure times)
  const reconciliationContext = reconciliationData?.scenarioReconciliations?.find(
    r => r.scenarioId === activeScenarioId
  );
  
  const reconciliationInfo = reconciliationContext ? {
    approachWeights: reconciliationContext.weights || {},
    exposurePeriodMin: reconciliationData?.exposurePeriod || null,
    marketingTime: reconciliationData?.marketingTime || null,
    exposureRationale: reconciliationData?.exposureRationale || '',
  } : {};
  
  return {
    ...baseContext,
    siteData: extendedSiteData,
    improvementData: extendedImprovementData,
    marketData, // FIX #9: Now populated from actual market analysis
    valuationData, // FIX #11: Now includes min/max ranges
    ...transactionData,
    ...swotData,
    ...permitData,
    ...trafficInfo,
    // FIX #5-12: All new data extractions
    salesComps,
    landComps,
    ...incomeData,
    ...costData,
    ...reconciliationInfo,
  };
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

