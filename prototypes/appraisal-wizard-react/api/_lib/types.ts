/**
 * Shared API types for Vercel serverless functions
 * These types are used internally by the API routes
 */

// ==================== FRED API ====================
export interface FredObservation {
  date: string;
  value: number;
}

export interface FredResponse {
  observations: FredObservation[];
}

// ==================== CENSUS API ====================
export interface CensusVariables {
  B01001_001E: number;  // Total population
  B01002_001E: number;  // Median age
  B11001_001E: number;  // Total households
  B25010_001E: number;  // Average household size
  B19013_001E: number;  // Median household income
  B19301_001E: number;  // Per capita income
  B15003_022E: number;  // Bachelor's degree
  B15003_023E: number;  // Master's degree
  B15003_025E: number;  // Doctorate degree
  B23025_002E: number;  // Labor force
  B23025_005E: number;  // Unemployed
}

// ==================== RISK ENGINE ====================
export interface RiskInputs {
  propertyType: string;
  isIncomeProducing: boolean;
  capRate?: number;
  treasuryRate: number;
  daysOnMarket?: number;
  yearBuilt?: number;
  condition?: string;
  schoolRating?: number;
  crimeScore?: number;
}

export interface RiskDimensionScore {
  score: number;
  weight: number;
}

export interface RiskOutput {
  overallGrade: string;
  overallScore: number;
  dimensions: {
    marketVolatility: RiskDimensionScore;
    liquidity: RiskDimensionScore;
    incomeStability: RiskDimensionScore;
    assetQuality: RiskDimensionScore;
  };
  weightingRationale: string;
}

// ==================== MONTANA CADASTRAL ====================
export interface MontanaCadastralParcel {
  PARCELID: string;
  GEOCONTOID: string;
  COUNTYCD: string;
  COUNTYNAME: string;
  LEGALDESC: string;
  TOWNSHIP: string;
  RANGE: string;
  SECTION: string;
  PROPTYPE: string;
  ACRES: number;
  SQFT: number;
  SITUS_ADDR: string;
  SITUS_CITY: string;
  SITUS_ZIP: string;
  OWNERNME1: string;
  OWNERNME2: string;
  MAILADDR: string;
  LANDVAL: number;
  IMPVAL: number;
  TOTALVAL: number;
  TAXYR: number;
}

// ==================== AI GENERATION ====================
export interface SiteImprovementContext {
  typeName: string;       // e.g., "Wood Fence", "Asphalt Paving"
  quantity: number;
  unit: string;           // 'SF' | 'LF' | 'EA' | 'LS'
  yearInstalled?: number;
  condition?: string;     // 'excellent' | 'good' | 'average' | 'fair' | 'poor'
}

export interface AIGenerationContext {
  propertyType?: string;
  propertySubtype?: string;
  siteData?: {
    city?: string;
    state?: string;
    county?: string;
    zoning?: string;
    siteSize?: string;
    utilities?: string;
    topography?: string;
    shape?: string;
  };
  improvementData?: {
    buildingSize?: string;
    yearBuilt?: string;
    condition?: string;
    constructionType?: string;
    quality?: string;
  };
  marketData?: {
    vacancyRate?: string;
    marketTrend?: string;
    capRate?: string;
    rentalRate?: string;
  };
  scenarios?: Array<{
    name: string;
    effectiveDate?: string;
    approaches?: string[];
  }>;
  valuationData?: {
    salesValue?: number;
    incomeValue?: number;
    costValue?: number;
    concludedValue?: number;
  };
  // Site Improvements Inventory
  siteImprovements?: SiteImprovementContext[];
}


