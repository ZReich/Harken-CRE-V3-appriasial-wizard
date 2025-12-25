/**
 * API Contract Types
 * 
 * These types define the contract between frontend services and the API layer.
 * They are 100% portable - can be used with Vercel API Routes now and Harken backend later.
 */

// ==================== CADASTRAL ====================
export interface CadastralQueryRequest {
  latitude?: number;
  longitude?: number;
  parcelId?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface CadastralData {
  parcelId: string;
  legalDescription: string;
  county: string;
  acres: number;
  sqft: number;
  situsAddress: string;
  situsCity: string;
  situsZip: string;
  ownerName: string;
  ownerName2?: string;
  mailingAddress: string;
  assessedLandValue: number;
  assessedImprovementValue: number;
  totalAssessedValue: number;
  taxYear: number;
  propertyType?: string;
  township?: string;
  range?: string;
  section?: string;
}

export interface CadastralResponse {
  success: boolean;
  data: CadastralData | null;
  source: 'montana_cadastral' | 'cotality' | 'mock';
  error?: string;
}

// ==================== DEMOGRAPHICS ====================
export interface DemographicsRequest {
  latitude: number;
  longitude: number;
  radii?: number[];  // defaults to [1, 3, 5] miles
}

export interface RadiusDemographics {
  radius: number;
  population: {
    current: number;
    projected5Year: number;
    annualGrowthRate: number;
  };
  households: {
    current: number;
    projected5Year: number;
    averageSize: number;
  };
  income: {
    medianHousehold: number;
    averageHousehold: number;
    perCapita: number;
  };
  education: {
    percentCollegeGraduates: number;
    percentGraduateDegree: number;
  };
  employmentByIndustry: Array<{
    industry: string;
    percentage: number;
  }>;
}

export interface DemographicsResponse {
  success: boolean;
  data: RadiusDemographics[];
  source: 'census' | 'esri' | 'mock';
  asOfDate: string;
  error?: string;
}

// ==================== ECONOMIC INDICATORS ====================
export interface EconomicDataPoint {
  date: string;
  value: number;
}

export interface EconomicSeries {
  current: number;
  history: EconomicDataPoint[];
}

export interface EconomicIndicatorsResponse {
  success: boolean;
  data: {
    federalFundsRate: EconomicSeries;
    treasury10Y: EconomicSeries;
    inflation: EconomicSeries;
    gdpGrowth: EconomicSeries;
  };
  asOfDate: string;
  error?: string;
}

// ==================== RISK RATING ====================
export interface RiskRatingRequest {
  propertyType: string;
  latitude: number;
  longitude: number;
  isIncomeProducing: boolean;
  capRate?: number;
  daysOnMarket?: number;
  yearBuilt?: number;
  condition?: string;
}

export interface RiskDimensionResult {
  score: number;
  weight: number;
}

export interface RiskRatingData {
  overallGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C';
  overallScore: number;
  dimensions: {
    marketVolatility: RiskDimensionResult;
    liquidity: RiskDimensionResult;
    incomeStability: RiskDimensionResult;
    assetQuality: RiskDimensionResult;
  };
  weightingRationale: string;
  generatedDate: string;
}

export interface RiskRatingResponse {
  success: boolean;
  data: RiskRatingData | null;
  error?: string;
}

// ==================== AI GENERATION ====================
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
}

export interface AIGenerationRequest {
  section: string;
  context: AIGenerationContext;
  existingText?: string;
  instruction?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  data: {
    content: string;
    section: string;
  } | null;
  error?: string;
}

// ==================== GENERIC API RESPONSE ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}


