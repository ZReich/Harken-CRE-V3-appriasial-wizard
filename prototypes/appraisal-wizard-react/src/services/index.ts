/**
 * Services Index
 * 
 * Re-exports all service modules for convenient imports.
 */

// Base API client
export { apiRequest, apiGet, apiPost, getApiBaseUrl, ApiError } from './api';

// AI Service
export {
  generateDraft,
  AI_SECTIONS,
  buildContextFromState,
  type AISectionType,
} from './aiService';

// Cadastral Service
export {
  queryParcelByLocation,
  queryParcelByParcelId,
  queryParcelByAddress,
  isMontanaProperty,
  mapCadastralToSubjectData,
} from './cadastralService';

// Demographics Service
export {
  getDemographicsByRadius,
  formatPopulation,
  formatCurrency,
  formatPercentage,
  createDemographicsSummary,
} from './demographicsService';

// Economic Service
export {
  getEconomicIndicators,
  formatRate,
  calculateChange,
  getTrend,
  createEconomicSummary,
} from './economicService';

// Risk Rating Service
export {
  calculateRiskRating,
  GRADE_COLORS,
  GRADE_DESCRIPTIONS,
  getGradeDisplayInfo,
  formatWeight,
  buildRiskRatingRequest,
  RISK_RATING_DISCLOSURE,
} from './riskRatingService';

// Property Data Router
export {
  getPropertyData,
  getLookupCostInfo,
  getServiceAvailability,
  type PropertyLookupRequest,
  type PropertyLookupResult,
} from './propertyDataRouter';

// Cotality Service
export {
  getPropertyData as getCotalityPropertyData,
  mapCotalityToCadastralFormat,
  type CotalityPropertyData,
  type CotalityResponse,
} from './cotalityService';

// School Rating Service
export {
  getSchoolRatings,
  getSchoolQualityScore,
  type SchoolRating,
  type SchoolRatingsResponse,
} from './schoolRatingService';

// Crime Statistics Service
export {
  getCrimeStatistics,
  getCrimeSafetyScore,
  formatCrimeComparison,
  type CrimeStatistics,
  type CrimeResponse,
} from './crimeService';

// Cost Segregation Service
export {
  generateCostSegAnalysis,
  applyComponentOverride,
  resetAnalysisOverrides,
  getBonusDepreciationRate,
  formatCostSegCurrency,
  formatCostSegPercent,
  type GenerateCostSegInput,
} from './costSegregationService';

// SWOT Suggestion Service
export {
  generateSWOTSuggestions,
  convertToSimpleSWOT,
} from './swotSuggestionService';

// Walk Score Service
export {
  getWalkScore,
  isWalkScoreConfigured,
  isWalkScoreRelevant,
  getWalkScoreDescription,
  interpretWalkScoreForSWOT,
} from './walkScoreService';