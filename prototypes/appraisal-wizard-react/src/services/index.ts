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


