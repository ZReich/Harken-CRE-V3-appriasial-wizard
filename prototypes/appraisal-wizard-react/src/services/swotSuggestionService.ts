/**
 * SWOT Suggestion Service
 * 
 * Intelligent analysis engine that generates data-driven SWOT suggestions
 * based on property data from the wizard state. Analyzes:
 * - Site details (frontage, visibility, access, zoning)
 * - Demographics (income, population, growth trends)
 * - Economic indicators (interest rates, inflation, GDP)
 * - Improvements (condition, age, quality)
 * - Market metrics (vacancy, absorption, rent trends)
 * - Risk rating (location, market, financial scores)
 * - External APIs (Walk Score for applicable property types)
 * 
 * Property-type aware: Different factors matter for different property types.
 */

import type {
  SWOTItem,
  EnhancedSWOTData,
  SWOTCategory,
  SWOTConfidence,
  SubjectData,
  DemographicsData,
  EconomicIndicators,
  ImprovementsInventory,
  MarketAnalysisData,
  WalkScoreResponse,
} from '../types';
import type { RiskRatingData } from '../types/api';
import { getWalkScore, isWalkScoreRelevant, interpretWalkScoreForSWOT } from './walkScoreService';

// Unique ID generator
let idCounter = 0;
const generateId = (): string => `swot-${Date.now()}-${++idCounter}`;

/**
 * Main entry point: Generate intelligent SWOT suggestions from wizard state
 */
export async function generateSWOTSuggestions(wizardState: {
  propertyType?: string | null;
  subjectData?: SubjectData;
  demographicsData?: DemographicsData;
  economicIndicators?: EconomicIndicators;
  improvementsInventory?: ImprovementsInventory;
  marketAnalysis?: MarketAnalysisData;
  riskRating?: RiskRatingData;
}): Promise<Partial<EnhancedSWOTData>> {
  const strengths: SWOTItem[] = [];
  const weaknesses: SWOTItem[] = [];
  const opportunities: SWOTItem[] = [];
  const threats: SWOTItem[] = [];
  
  const propertyType = wizardState.propertyType || 'commercial';
  
  // Track data completeness
  let dataPointsAvailable = 0;
  let dataPointsTotal = 6; // subject, demographics, economic, improvements, market, walkScore

  // 1. Analyze Site/Location factors
  if (wizardState.subjectData) {
    dataPointsAvailable++;
    const siteItems = analyzeLocationFactors(wizardState.subjectData, propertyType);
    categorizeItems(siteItems, strengths, weaknesses, opportunities, threats);
  }

  // 2. Analyze Demographics
  if (wizardState.demographicsData) {
    dataPointsAvailable++;
    const demoItems = analyzeDemographicFactors(wizardState.demographicsData, propertyType);
    categorizeItems(demoItems, strengths, weaknesses, opportunities, threats);
  }

  // 3. Analyze Economic Indicators
  if (wizardState.economicIndicators) {
    dataPointsAvailable++;
    const econItems = analyzeEconomicFactors(wizardState.economicIndicators, propertyType);
    categorizeItems(econItems, strengths, weaknesses, opportunities, threats);
  }

  // 4. Analyze Improvements
  if (wizardState.improvementsInventory) {
    dataPointsAvailable++;
    const impItems = analyzeImprovementFactors(wizardState.improvementsInventory, propertyType);
    categorizeItems(impItems, strengths, weaknesses, opportunities, threats);
  }

  // 5. Analyze Market Data
  if (wizardState.marketAnalysis) {
    dataPointsAvailable++;
    const marketItems = analyzeMarketFactors(wizardState.marketAnalysis, propertyType);
    categorizeItems(marketItems, strengths, weaknesses, opportunities, threats);
  }

  // 6. Fetch Walk Score for applicable property types
  if (isWalkScoreRelevant(propertyType) && wizardState.subjectData?.address) {
    try {
      // Note: In production, you'd geocode the address to get lat/lng
      // For now, use placeholder coordinates
      const walkScore = await getWalkScore(
        46.8721, // placeholder lat
        -114.0093, // placeholder lng
        `${wizardState.subjectData.address.street}, ${wizardState.subjectData.address.city}, ${wizardState.subjectData.address.state}`
      );
      dataPointsAvailable++;
      const walkItems = analyzeWalkScore(walkScore, propertyType);
      categorizeItems(walkItems, strengths, weaknesses, opportunities, threats);
    } catch (error) {
      console.warn('[SWOT] Walk Score fetch failed:', error);
    }
  }

  // 7. Analyze Risk Rating if available
  if (wizardState.riskRating) {
    const riskItems = analyzeRiskRating(wizardState.riskRating, propertyType);
    categorizeItems(riskItems, strengths, weaknesses, opportunities, threats);
  }

  // Calculate impact score
  const impactScore = calculateImpactScore(strengths, weaknesses, opportunities, threats);
  
  // Calculate data completeness
  const dataCompleteness = Math.round((dataPointsAvailable / dataPointsTotal) * 100);

  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
    impactScore,
    dataCompleteness,
    lastAnalyzed: new Date().toISOString(),
    propertyType,
  };
}

/**
 * Categorize items into SWOT quadrants based on their nature
 */
function categorizeItems(
  items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }>,
  strengths: SWOTItem[],
  weaknesses: SWOTItem[],
  opportunities: SWOTItem[],
  threats: SWOTItem[]
): void {
  for (const item of items) {
    const { quadrant, ...swotItem } = item;
    switch (quadrant) {
      case 'strength':
        strengths.push(swotItem);
        break;
      case 'weakness':
        weaknesses.push(swotItem);
        break;
      case 'opportunity':
        opportunities.push(swotItem);
        break;
      case 'threat':
        threats.push(swotItem);
        break;
    }
  }
}

// =================================================================
// LOCATION FACTORS ANALYSIS
// =================================================================

function analyzeLocationFactors(
  subjectData: SubjectData,
  propertyType: string
): Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> {
  const items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> = [];

  // Frontage analysis
  if (subjectData.frontage) {
    const frontage = parseFloat(subjectData.frontage);
    if (!isNaN(frontage)) {
      const thresholds = getFrontageThresholds(propertyType);
      
      if (frontage >= thresholds.excellent) {
        items.push({
          id: generateId(),
          text: `Excellent street frontage of ${frontage.toLocaleString()} feet provides strong visibility and access`,
          category: 'location',
          confidence: 'high',
          source: 'Site Details',
          sourceField: 'subjectData.frontage',
          isAISuggested: true,
          isUserAdded: false,
          impact: 'high',
          quadrant: 'strength',
        });
      } else if (frontage < thresholds.poor) {
        items.push({
          id: generateId(),
          text: `Limited frontage of ${frontage.toLocaleString()} feet may restrict visibility and signage opportunities`,
          category: 'location',
          confidence: 'high',
          source: 'Site Details',
          sourceField: 'subjectData.frontage',
          isAISuggested: true,
          isUserAdded: false,
          impact: 'medium',
          quadrant: 'weakness',
        });
      }
    }
  }

  // Visibility analysis
  if (subjectData.visibility) {
    const visibility = subjectData.visibility.toLowerCase();
    if (visibility.includes('excellent') || visibility.includes('high') || visibility.includes('good')) {
      items.push({
        id: generateId(),
        text: `${subjectData.visibility} visibility enhances property exposure and marketability`,
        category: 'location',
        confidence: 'high',
        source: 'Site Details',
        sourceField: 'subjectData.visibility',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'strength',
      });
    } else if (visibility.includes('poor') || visibility.includes('limited') || visibility.includes('low')) {
      items.push({
        id: generateId(),
        text: `${subjectData.visibility} visibility may impact tenant attraction and rental rates`,
        category: 'location',
        confidence: 'high',
        source: 'Site Details',
        sourceField: 'subjectData.visibility',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'weakness',
      });
    }
  }

  // Access analysis
  if (subjectData.accessQuality) {
    const access = subjectData.accessQuality.toLowerCase();
    if (access.includes('excellent') || access.includes('multiple') || access.includes('highway') || access.includes('direct')) {
      items.push({
        id: generateId(),
        text: `Strong access characteristics: ${subjectData.accessQuality}`,
        category: 'location',
        confidence: 'high',
        source: 'Site Details',
        sourceField: 'subjectData.accessQuality',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'strength',
      });
    } else if (access.includes('limited') || access.includes('restricted') || access.includes('poor')) {
      items.push({
        id: generateId(),
        text: `Access limitations: ${subjectData.accessQuality}`,
        category: 'location',
        confidence: 'high',
        source: 'Site Details',
        sourceField: 'subjectData.accessQuality',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'weakness',
      });
    }
  }

  // Zoning analysis (for opportunities/threats)
  if (subjectData.zoningClass) {
    const zoning = subjectData.zoningClass.toLowerCase();
    // Check for favorable zoning for property type
    if (isZoningFavorable(zoning, propertyType)) {
      items.push({
        id: generateId(),
        text: `Favorable zoning (${subjectData.zoningClass}) allows for current use and potential expansion`,
        category: 'regulatory',
        confidence: 'medium',
        source: 'Site Details',
        sourceField: 'subjectData.zoningClass',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'strength',
      });
    }
  }

  // Flood zone analysis
  if (subjectData.floodZone) {
    const floodZone = subjectData.floodZone.toUpperCase();
    if (floodZone === 'X' || floodZone.includes('MINIMAL')) {
      items.push({
        id: generateId(),
        text: `Located in minimal flood risk zone (${subjectData.floodZone}), reducing insurance costs`,
        category: 'environmental',
        confidence: 'high',
        source: 'Site Details',
        sourceField: 'subjectData.floodZone',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'strength',
      });
    } else if (floodZone.includes('A') || floodZone.includes('V') || floodZone.includes('HIGH')) {
      items.push({
        id: generateId(),
        text: `Located in high-risk flood zone (${subjectData.floodZone}), requiring flood insurance and potential mitigation`,
        category: 'environmental',
        confidence: 'high',
        source: 'Site Details',
        sourceField: 'subjectData.floodZone',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'threat',
      });
    }
  }

  return items;
}

function getFrontageThresholds(propertyType: string): { excellent: number; poor: number } {
  const lower = propertyType.toLowerCase();
  
  if (lower.includes('industrial') || lower.includes('warehouse')) {
    return { excellent: 400, poor: 100 };
  }
  if (lower.includes('retail')) {
    return { excellent: 150, poor: 40 };
  }
  if (lower.includes('office')) {
    return { excellent: 200, poor: 50 };
  }
  // Default
  return { excellent: 200, poor: 50 };
}

function isZoningFavorable(zoning: string, propertyType: string): boolean {
  const lower = propertyType.toLowerCase();
  
  if (lower.includes('industrial')) {
    return zoning.includes('industrial') || zoning.includes('m-') || zoning.includes('i-');
  }
  if (lower.includes('retail')) {
    return zoning.includes('commercial') || zoning.includes('c-') || zoning.includes('retail');
  }
  if (lower.includes('office')) {
    return zoning.includes('commercial') || zoning.includes('office') || zoning.includes('c-');
  }
  if (lower.includes('multifamily')) {
    return zoning.includes('residential') || zoning.includes('r-') || zoning.includes('multifamily');
  }
  
  return true; // Default to favorable if we can't determine
}

// =================================================================
// DEMOGRAPHICS ANALYSIS
// =================================================================

function analyzeDemographicFactors(
  demographics: DemographicsData,
  propertyType: string
): Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> {
  const items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> = [];

  // Find the most relevant radius (1 mile for retail, 3 mile for others)
  const targetRadius = propertyType.toLowerCase().includes('retail') ? 1 : 3;
  const radiusData = demographics.radiusAnalysis?.find(r => r.radius === targetRadius) 
    || demographics.radiusAnalysis?.[0];

  if (!radiusData) return items;

  // Population analysis - calculate density from population and radius area
  if (radiusData.population?.current) {
    // Approximate density: population / area of circle (pi * r^2)
    const areaSquareMiles = Math.PI * targetRadius * targetRadius;
    const density = Math.round(radiusData.population.current / areaSquareMiles);
    const isHighDensity = density > 5000; // per sq mile
    const isLowDensity = density < 1000;

    if (isHighDensity && propertyType.toLowerCase().includes('retail')) {
      items.push({
        id: generateId(),
        text: `High population density (${density.toLocaleString()}/sq mi within ${targetRadius} mile) supports strong retail demand`,
        category: 'market',
        confidence: 'high',
        source: 'Demographics Data',
        sourceField: 'demographicsData.radiusAnalysis.population.current',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'strength',
      });
    } else if (isLowDensity && propertyType.toLowerCase().includes('retail')) {
      items.push({
        id: generateId(),
        text: `Low population density (${density.toLocaleString()}/sq mi) may limit customer base for retail`,
        category: 'market',
        confidence: 'high',
        source: 'Demographics Data',
        sourceField: 'demographicsData.radiusAnalysis.population.current',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'weakness',
      });
    }
  }

  // Median income analysis
  if (radiusData.income?.medianHousehold) {
    const income = radiusData.income.medianHousehold;
    const isHighIncome = income > 85000;
    const isLowIncome = income < 45000;

    if (isHighIncome) {
      items.push({
        id: generateId(),
        text: `Above-average median household income ($${income.toLocaleString()}) indicates strong consumer spending power`,
        category: 'market',
        confidence: 'high',
        source: 'Demographics Data',
        sourceField: 'demographicsData.radiusAnalysis.income.medianHousehold',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'strength',
      });
    } else if (isLowIncome) {
      items.push({
        id: generateId(),
        text: `Below-average median household income ($${income.toLocaleString()}) may limit rent potential for premium tenants`,
        category: 'market',
        confidence: 'high',
        source: 'Demographics Data',
        sourceField: 'demographicsData.radiusAnalysis.income.medianHousehold',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'weakness',
      });
    }
  }

  // Population growth analysis (calculate 5-year from annual rate)
  if (radiusData.population?.annualGrowthRate !== undefined) {
    const growth = radiusData.population.annualGrowthRate * 5; // Approximate 5-year growth
    
    if (growth > 5) {
      items.push({
        id: generateId(),
        text: `Strong 5-year population growth of ${growth.toFixed(1)}% indicates expanding market demand`,
        category: 'market',
        confidence: 'high',
        source: 'Demographics Data',
        sourceField: 'demographicsData.radiusAnalysis.population.annualGrowthRate',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'opportunity',
      });
    } else if (growth < -2) {
      items.push({
        id: generateId(),
        text: `Population decline of ${Math.abs(growth).toFixed(1)}% over 5 years may indicate softening demand`,
        category: 'market',
        confidence: 'high',
        source: 'Demographics Data',
        sourceField: 'demographicsData.radiusAnalysis.population.annualGrowthRate',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'threat',
      });
    }
  }

  // Education level (for office properties)
  if (radiusData.education?.percentCollegeGraduates && propertyType.toLowerCase().includes('office')) {
    const collegeRate = radiusData.education.percentCollegeGraduates;
    
    if (collegeRate > 40) {
      items.push({
        id: generateId(),
        text: `Highly educated workforce (${collegeRate.toFixed(0)}% college-educated) supports office tenant demand`,
        category: 'market',
        confidence: 'medium',
        source: 'Demographics Data',
        sourceField: 'demographicsData.radiusAnalysis.education.percentCollegeGraduates',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'strength',
      });
    }
  }

  return items;
}

// =================================================================
// ECONOMIC FACTORS ANALYSIS
// =================================================================

function analyzeEconomicFactors(
  economic: EconomicIndicators,
  propertyType: string
): Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> {
  const items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> = [];

  // Interest rate analysis
  if (economic.federalFundsRate) {
    const rate = economic.federalFundsRate.current;
    const projected = economic.federalFundsRate.projected1Y;
    
    if (rate > 5) {
      items.push({
        id: generateId(),
        text: `Elevated interest rates (${rate.toFixed(2)}%) increasing borrowing costs and may pressure cap rates`,
        category: 'financial',
        confidence: 'high',
        source: 'Economic Data',
        sourceField: 'economicIndicators.federalFundsRate',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'threat',
      });
    } else if (rate < 3 && projected && projected < rate) {
      items.push({
        id: generateId(),
        text: `Favorable interest rate environment (${rate.toFixed(2)}%) with rates projected to decline supports valuations`,
        category: 'financial',
        confidence: 'medium',
        source: 'Economic Data',
        sourceField: 'economicIndicators.federalFundsRate',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'opportunity',
      });
    }
  }

  // Inflation analysis
  if (economic.inflation) {
    const rate = economic.inflation.current;
    const trend = economic.inflation.trend;
    
    if (rate > 4 && trend === 'rising') {
      items.push({
        id: generateId(),
        text: `Rising inflation (${rate.toFixed(1)}%) may erode real returns and increase operating expenses`,
        category: 'financial',
        confidence: 'high',
        source: 'Economic Data',
        sourceField: 'economicIndicators.inflation',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'threat',
      });
    } else if (rate < 2.5 && trend === 'stable') {
      items.push({
        id: generateId(),
        text: `Stable, moderate inflation (${rate.toFixed(1)}%) provides predictable operating cost environment`,
        category: 'financial',
        confidence: 'medium',
        source: 'Economic Data',
        sourceField: 'economicIndicators.inflation',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'low',
        quadrant: 'strength',
      });
    }
  }

  // GDP growth analysis
  if (economic.gdpGrowth) {
    const growth = economic.gdpGrowth.current;
    const trend = economic.gdpGrowth.trend;
    
    if (growth > 2.5 && trend === 'accelerating') {
      items.push({
        id: generateId(),
        text: `Strong GDP growth (${growth.toFixed(1)}%) and accelerating economy support tenant expansion`,
        category: 'market',
        confidence: 'high',
        source: 'Economic Data',
        sourceField: 'economicIndicators.gdpGrowth',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'opportunity',
      });
    } else if (growth < 1 || trend === 'slowing') {
      items.push({
        id: generateId(),
        text: `Slowing economic growth (${growth.toFixed(1)}%) may reduce tenant demand and leasing velocity`,
        category: 'market',
        confidence: 'medium',
        source: 'Economic Data',
        sourceField: 'economicIndicators.gdpGrowth',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'threat',
      });
    }
  }

  return items;
}

// =================================================================
// IMPROVEMENTS ANALYSIS
// =================================================================

function analyzeImprovementFactors(
  improvements: ImprovementsInventory,
  propertyType: string
): Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> {
  const items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> = [];

  // Aggregate building data
  const buildings = improvements.parcels?.flatMap(p => p.buildings) || [];
  
  if (buildings.length === 0) return items;

  // Calculate average age
  const ages = buildings
    .map(b => b.yearBuilt ? new Date().getFullYear() - b.yearBuilt : null)
    .filter((age): age is number => age !== null);
  
  if (ages.length > 0) {
    const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length;
    
    if (avgAge < 10) {
      items.push({
        id: generateId(),
        text: `Modern construction (avg ${avgAge.toFixed(0)} years old) minimizes near-term capital expenditure requirements`,
        category: 'physical',
        confidence: 'high',
        source: 'Improvements Inventory',
        sourceField: 'improvementsInventory.parcels.buildings.yearBuilt',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'strength',
      });
    } else if (avgAge > 40) {
      items.push({
        id: generateId(),
        text: `Older construction (avg ${avgAge.toFixed(0)} years) may require significant capital improvements`,
        category: 'physical',
        confidence: 'high',
        source: 'Improvements Inventory',
        sourceField: 'improvementsInventory.parcels.buildings.yearBuilt',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'weakness',
      });
      
      // Also an opportunity for value-add
      items.push({
        id: generateId(),
        text: `Potential for value-add renovation to modernize aging improvements`,
        category: 'physical',
        confidence: 'medium',
        source: 'Improvements Inventory',
        sourceField: 'improvementsInventory.parcels.buildings.yearBuilt',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'opportunity',
      });
    }
  }

  // Analyze building condition
  const conditions = buildings.map(b => b.condition).filter(Boolean);
  const hasExcellentCondition = conditions.some(c => 
    c?.toLowerCase().includes('excellent') || c?.toLowerCase().includes('good')
  );
  const hasPoorCondition = conditions.some(c => 
    c?.toLowerCase().includes('poor') || c?.toLowerCase().includes('fair')
  );

  if (hasExcellentCondition && !hasPoorCondition) {
    items.push({
      id: generateId(),
      text: `Well-maintained improvements in good to excellent condition`,
      category: 'physical',
      confidence: 'medium',
      source: 'Improvements Inventory',
      sourceField: 'improvementsInventory.parcels.buildings.condition',
      isAISuggested: true,
      isUserAdded: false,
      impact: 'medium',
      quadrant: 'strength',
    });
  } else if (hasPoorCondition) {
    items.push({
      id: generateId(),
      text: `Deferred maintenance noted in some improvements requiring attention`,
      category: 'physical',
      confidence: 'high',
      source: 'Improvements Inventory',
      sourceField: 'improvementsInventory.parcels.buildings.condition',
      isAISuggested: true,
      isUserAdded: false,
      impact: 'high',
      quadrant: 'weakness',
    });
  }

  // Industrial-specific: Clear height
  if (propertyType.toLowerCase().includes('industrial')) {
    const clearHeights = buildings.map(b => b.clearHeight).filter((h): h is number => h != null);
    if (clearHeights.length > 0) {
      const maxHeight = Math.max(...clearHeights);
      if (maxHeight >= 32) {
        items.push({
          id: generateId(),
          text: `Modern clear height of ${maxHeight}' accommodates contemporary logistics and e-commerce operations`,
          category: 'physical',
          confidence: 'high',
          source: 'Improvements Inventory',
          sourceField: 'improvementsInventory.parcels.buildings.clearHeight',
          isAISuggested: true,
          isUserAdded: false,
          impact: 'high',
          quadrant: 'strength',
        });
      } else if (maxHeight < 24) {
        items.push({
          id: generateId(),
          text: `Limited clear height of ${maxHeight}' restricts tenant pool to smaller-scale operations`,
          category: 'physical',
          confidence: 'high',
          source: 'Improvements Inventory',
          sourceField: 'improvementsInventory.parcels.buildings.clearHeight',
          isAISuggested: true,
          isUserAdded: false,
          impact: 'high',
          quadrant: 'weakness',
        });
      }
    }
  }

  return items;
}

// =================================================================
// MARKET ANALYSIS
// =================================================================

function analyzeMarketFactors(
  market: MarketAnalysisData,
  propertyType: string
): Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> {
  const items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> = [];

  // Vacancy rate analysis
  if (market.supplyMetrics?.vacancyRate !== undefined) {
    const vacancy = market.supplyMetrics.vacancyRate;
    
    if (vacancy < 5) {
      items.push({
        id: generateId(),
        text: `Tight market vacancy (${vacancy.toFixed(1)}%) supports strong rental rates and lease negotiation power`,
        category: 'market',
        confidence: 'high',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.supplyMetrics.vacancyRate',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'strength',
      });
    } else if (vacancy > 12) {
      items.push({
        id: generateId(),
        text: `Elevated market vacancy (${vacancy.toFixed(1)}%) may pressure rental rates and extend lease-up periods`,
        category: 'market',
        confidence: 'high',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.supplyMetrics.vacancyRate',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'weakness',
      });
    }
  }

  // Rent growth analysis
  if (market.demandMetrics?.rentGrowth !== undefined) {
    const growth = market.demandMetrics.rentGrowth;
    
    if (growth > 3) {
      items.push({
        id: generateId(),
        text: `Strong rent growth of ${growth.toFixed(1)}% indicates robust demand and value appreciation potential`,
        category: 'market',
        confidence: 'high',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.demandMetrics.rentGrowth',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'opportunity',
      });
    } else if (growth < 0) {
      items.push({
        id: generateId(),
        text: `Declining rents (${growth.toFixed(1)}%) signal market softness and potential revenue pressure`,
        category: 'market',
        confidence: 'high',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.demandMetrics.rentGrowth',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'threat',
      });
    }
  }

  // Market trend analysis
  if (market.marketTrends) {
    const trend = market.marketTrends.overallTrend;
    const priceOutlook = market.marketTrends.priceOutlook;
    
    if (trend === 'improving' && priceOutlook === 'increasing') {
      items.push({
        id: generateId(),
        text: `Improving market fundamentals with positive price outlook support near-term value appreciation`,
        category: 'market',
        confidence: 'high',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.marketTrends',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'opportunity',
      });
    } else if (trend === 'declining' || priceOutlook === 'decreasing') {
      items.push({
        id: generateId(),
        text: `Softening market conditions may impact asset values and investor demand`,
        category: 'market',
        confidence: 'high',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.marketTrends',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'threat',
      });
    }
  }

  // Days on market
  if (market.demandMetrics?.averageDaysOnMarket !== undefined) {
    const dom = market.demandMetrics.averageDaysOnMarket;
    
    if (dom < 60) {
      items.push({
        id: generateId(),
        text: `Short marketing periods (avg ${dom} days) indicate strong buyer/tenant demand`,
        category: 'market',
        confidence: 'medium',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.demandMetrics.averageDaysOnMarket',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'strength',
      });
    } else if (dom > 180) {
      items.push({
        id: generateId(),
        text: `Extended marketing periods (avg ${dom} days) suggest challenging lease-up environment`,
        category: 'market',
        confidence: 'medium',
        source: 'Market Analysis',
        sourceField: 'marketAnalysis.demandMetrics.averageDaysOnMarket',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'weakness',
      });
    }
  }

  return items;
}

// =================================================================
// WALK SCORE ANALYSIS
// =================================================================

function analyzeWalkScore(
  walkScore: WalkScoreResponse,
  propertyType: string
): Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> {
  const items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> = [];
  
  const interpretation = interpretWalkScoreForSWOT(walkScore, propertyType);
  
  if (interpretation.isStrength) {
    items.push({
      id: generateId(),
      text: interpretation.text,
      category: 'location',
      confidence: interpretation.confidence,
      source: 'Walk Score API',
      sourceField: 'walkScore.walkscore',
      isAISuggested: true,
      isUserAdded: false,
      impact: 'medium',
      quadrant: 'strength',
    });
  } else if (interpretation.isWeakness) {
    items.push({
      id: generateId(),
      text: interpretation.text,
      category: 'location',
      confidence: interpretation.confidence,
      source: 'Walk Score API',
      sourceField: 'walkScore.walkscore',
      isAISuggested: true,
      isUserAdded: false,
      impact: 'medium',
      quadrant: 'weakness',
    });
  }

  // Transit score for office/multifamily
  if (walkScore.transitScore && (
    propertyType.toLowerCase().includes('office') || 
    propertyType.toLowerCase().includes('multifamily')
  )) {
    if (walkScore.transitScore >= 70) {
      items.push({
        id: generateId(),
        text: `Excellent transit access (score: ${walkScore.transitScore}/100) enhances commuter accessibility`,
        category: 'location',
        confidence: 'high',
        source: 'Walk Score API',
        sourceField: 'walkScore.transitScore',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'medium',
        quadrant: 'strength',
      });
    } else if (walkScore.transitScore < 25) {
      items.push({
        id: generateId(),
        text: `Limited public transit (score: ${walkScore.transitScore}/100) may deter transit-dependent tenants`,
        category: 'location',
        confidence: 'medium',
        source: 'Walk Score API',
        sourceField: 'walkScore.transitScore',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'low',
        quadrant: 'weakness',
      });
    }
  }

  return items;
}

// =================================================================
// RISK RATING ANALYSIS
// =================================================================

function analyzeRiskRating(
  riskRating: RiskRatingData,
  propertyType: string
): Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> {
  const items: Array<SWOTItem & { quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat' }> = [];

  // Overall grade analysis
  if (riskRating.overallGrade) {
    const grade = riskRating.overallGrade;
    const isStrongGrade = ['AAA', 'AA', 'A'].includes(grade);
    const isWeakGrade = ['CCC', 'CC', 'C'].includes(grade);

    if (isStrongGrade) {
      items.push({
        id: generateId(),
        text: `Investment-grade risk profile (${grade}) indicates strong fundamentals and lower risk premium`,
        category: 'financial',
        confidence: 'high',
        source: 'Risk Rating',
        sourceField: 'riskRating.overallGrade',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'strength',
      });
    } else if (isWeakGrade) {
      items.push({
        id: generateId(),
        text: `Elevated risk profile (${grade}) may require higher returns to compensate investors`,
        category: 'financial',
        confidence: 'high',
        source: 'Risk Rating',
        sourceField: 'riskRating.overallGrade',
        isAISuggested: true,
        isUserAdded: false,
        impact: 'high',
        quadrant: 'threat',
      });
    }
  }

  // Analyze individual dimensions (dimensions is an object, not array)
  if (riskRating.dimensions) {
    const dimensionLabels: Record<string, string> = {
      marketVolatility: 'Market Volatility',
      liquidity: 'Liquidity',
      incomeStability: 'Income Stability',
      assetQuality: 'Asset Quality',
    };
    
    for (const [key, dimension] of Object.entries(riskRating.dimensions)) {
      if (!dimension || typeof dimension.score !== 'number') continue;
      
      const score = dimension.score;
      const name = dimensionLabels[key] || key;
      
      // Scores are 0-100, normalize to assessment
      // Low scores (0-30) are strengths, high scores (70+) are concerns
      if (score <= 30) {
        items.push({
          id: generateId(),
          text: `Strong ${name.toLowerCase()} profile (score: ${score}/100) - minimal concerns`,
          category: 'financial',
          confidence: 'medium',
          source: 'Risk Rating',
          sourceField: `riskRating.dimensions.${key}`,
          isAISuggested: true,
          isUserAdded: false,
          impact: 'medium',
          quadrant: 'strength',
        });
      } else if (score >= 70) {
        items.push({
          id: generateId(),
          text: `Elevated ${name.toLowerCase()} risk (score: ${score}/100) warrants investor attention`,
          category: 'financial',
          confidence: 'medium',
          source: 'Risk Rating',
          sourceField: `riskRating.dimensions.${key}`,
          isAISuggested: true,
          isUserAdded: false,
          impact: 'medium',
          quadrant: 'threat',
        });
      }
    }
  }

  return items;
}

// =================================================================
// IMPACT SCORE CALCULATION
// =================================================================

/**
 * Calculate overall impact score from -100 (all negative) to +100 (all positive)
 */
function calculateImpactScore(
  strengths: SWOTItem[],
  weaknesses: SWOTItem[],
  opportunities: SWOTItem[],
  threats: SWOTItem[]
): number {
  // Weight items by their impact
  const impactWeights = { high: 3, medium: 2, low: 1 };
  
  const getWeightedSum = (items: SWOTItem[]): number =>
    items.reduce((sum, item) => sum + impactWeights[item.impact || 'medium'], 0);

  const positiveScore = getWeightedSum(strengths) + getWeightedSum(opportunities);
  const negativeScore = getWeightedSum(weaknesses) + getWeightedSum(threats);
  
  const totalWeight = positiveScore + negativeScore;
  
  if (totalWeight === 0) return 0;
  
  // Normalize to -100 to +100 scale
  const rawScore = positiveScore - negativeScore;
  const normalizedScore = (rawScore / totalWeight) * 100;
  
  return Math.round(Math.max(-100, Math.min(100, normalizedScore)));
}

/**
 * Convert enhanced SWOT data to simple string arrays for backward compatibility
 */
export function convertToSimpleSWOT(enhanced: Partial<EnhancedSWOTData>): {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
} {
  return {
    strengths: (enhanced.strengths || []).map(item => item.text),
    weaknesses: (enhanced.weaknesses || []).map(item => item.text),
    opportunities: (enhanced.opportunities || []).map(item => item.text),
    threats: (enhanced.threats || []).map(item => item.text),
  };
}
