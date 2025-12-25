/**
 * AI Service
 * 
 * Provides AI-powered text generation for appraisal report sections.
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

import { apiPost } from './api';
import type { AIGenerationRequest, AIGenerationResponse, AIGenerationContext } from '../types/api';

/**
 * Generate AI draft text for an appraisal section
 * 
 * @param section - Section identifier (e.g., 'area_description', 'hbu_analysis')
 * @param context - Property and market context data
 * @param existingText - Optional existing text to improve
 * @param instruction - Optional additional instruction
 * @returns Promise resolving to generated content
 */
export async function generateDraft(
  section: string,
  context: AIGenerationContext,
  existingText?: string,
  instruction?: string
): Promise<string> {
  const request: AIGenerationRequest = {
    section,
    context,
    existingText,
    instruction,
  };

  const response = await apiPost<AIGenerationResponse, AIGenerationRequest>(
    '/ai/draft',
    request
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to generate AI draft');
  }

  return response.data.content;
}

/**
 * Available section types for AI generation
 */
export const AI_SECTIONS = {
  AREA_DESCRIPTION: 'area_description',
  NEIGHBORHOOD_DESCRIPTION: 'neighborhood_description',
  SITE_DESCRIPTION: 'site_description',
  HBU_ANALYSIS: 'hbu_analysis',
  HBU_LEGALLY_PERMISSIBLE: 'hbu_legally_permissible',
  HBU_PHYSICALLY_POSSIBLE: 'hbu_physically_possible',
  HBU_FINANCIALLY_FEASIBLE: 'hbu_financially_feasible',
  HBU_MAXIMALLY_PRODUCTIVE: 'hbu_maximally_productive',
  HBU_AS_IMPROVED: 'hbu_as_improved',
  MARKET_ANALYSIS: 'market_analysis',
  RECONCILIATION: 'reconciliation',
  IMPROVEMENT_DESCRIPTION: 'improvement_description',
} as const;

export type AISectionType = typeof AI_SECTIONS[keyof typeof AI_SECTIONS];

/**
 * Build context object from wizard state for AI generation
 * 
 * @param state - Wizard state object
 * @returns AIGenerationContext for API call
 */
export function buildContextFromState(state: {
  propertyType?: string | null;
  propertySubtype?: string | null;
  subjectData?: {
    city?: string;
    state?: string;
    county?: string;
    zoningClass?: string;
    siteArea?: string;
    topography?: string;
    shape?: string;
  };
  improvementsInventory?: {
    buildings?: Array<{
      grossBuildingArea?: number;
      yearBuilt?: number;
      condition?: string;
      quality?: string;
    }>;
  };
}): AIGenerationContext {
  const building = state.improvementsInventory?.buildings?.[0];
  
  return {
    propertyType: state.propertyType || undefined,
    propertySubtype: state.propertySubtype || undefined,
    siteData: {
      city: state.subjectData?.city,
      state: state.subjectData?.state,
      county: state.subjectData?.county,
      zoning: state.subjectData?.zoningClass,
      siteSize: state.subjectData?.siteArea,
      topography: state.subjectData?.topography,
      shape: state.subjectData?.shape,
    },
    improvementData: building ? {
      buildingSize: building.grossBuildingArea?.toString(),
      yearBuilt: building.yearBuilt?.toString(),
      condition: building.condition,
      quality: building.quality,
    } : undefined,
  };
}


