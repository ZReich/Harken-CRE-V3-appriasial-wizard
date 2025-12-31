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

// =============================================================================
// AI PHOTO MATERIAL DETECTION
// =============================================================================

/**
 * Detected material from photo analysis
 */
export interface DetectedMaterial {
  id: string;
  category: 'roofing' | 'siding' | 'flooring' | 'ceiling' | 'foundation' | 'mechanical' | 'electrical' | 'plumbing' | 'other';
  name: string;
  confidence: number; // 0-100
  details?: string;
  suggestedAge?: number;
  suggestedCondition?: 'excellent' | 'good' | 'average' | 'fair' | 'poor';
}

/**
 * Photo analysis result
 */
export interface PhotoAnalysisResult {
  photoId: string;
  materials: DetectedMaterial[];
  generalDescription?: string;
  timestamp: number;
}

/**
 * Analyze a photo for materials (simulated for prototype)
 * 
 * In production, this would call an AI vision API (OpenAI, Google Vision, etc.)
 * For the prototype, we return realistic mock data based on photo category.
 */
export async function analyzePhotoForMaterials(
  photoUrl: string,
  photoCategory: string,
): Promise<PhotoAnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  // Generate mock detected materials based on category
  const materials = generateMockMaterials(photoCategory);
  
  return {
    photoId: photoUrl,
    materials,
    generalDescription: generateMockDescription(photoCategory, materials),
    timestamp: Date.now(),
  };
}

/**
 * Generate mock materials based on photo category
 */
function generateMockMaterials(category: string): DetectedMaterial[] {
  const generateId = () => Math.random().toString(36).substring(2, 11);
  
  // Category-specific material detection
  const materialPools: Record<string, DetectedMaterial[]> = {
    'ext_roof': [
      { id: generateId(), category: 'roofing', name: 'Metal Standing Seam', confidence: 92, details: '24-gauge steel with Galvalume coating', suggestedAge: 8, suggestedCondition: 'good' },
      { id: generateId(), category: 'roofing', name: 'Built-up Roofing (BUR)', confidence: 78, details: '3-ply with gravel surfacing', suggestedAge: 15, suggestedCondition: 'average' },
      { id: generateId(), category: 'mechanical', name: 'Rooftop HVAC Unit', confidence: 85, details: 'Carrier 5-ton package unit', suggestedAge: 10, suggestedCondition: 'average' },
    ],
    'ext_front': [
      { id: generateId(), category: 'siding', name: 'CMU Block (Split-Face)', confidence: 88, details: 'Painted concrete masonry units', suggestedAge: 20, suggestedCondition: 'good' },
      { id: generateId(), category: 'other', name: 'Aluminum Storefront Glazing', confidence: 91, details: 'Clear anodized frame with insulated glass', suggestedAge: 15, suggestedCondition: 'good' },
      { id: generateId(), category: 'other', name: 'Steel Overhead Door', confidence: 82, details: 'Insulated sectional, 12x12 ft', suggestedAge: 12, suggestedCondition: 'average' },
    ],
    'ext_rear': [
      { id: generateId(), category: 'siding', name: 'Metal Panel Siding', confidence: 86, details: 'Corrugated steel, painted', suggestedAge: 18, suggestedCondition: 'average' },
      { id: generateId(), category: 'other', name: 'Loading Dock Leveler', confidence: 79, details: 'Mechanical dock leveler with bumpers', suggestedAge: 15, suggestedCondition: 'fair' },
    ],
    'int_mechanical': [
      { id: generateId(), category: 'mechanical', name: 'Forced Air Furnace', confidence: 94, details: 'Gas-fired, 150,000 BTU', suggestedAge: 12, suggestedCondition: 'average' },
      { id: generateId(), category: 'mechanical', name: 'Water Heater', confidence: 89, details: 'Commercial gas, 100 gallon', suggestedAge: 8, suggestedCondition: 'good' },
      { id: generateId(), category: 'electrical', name: 'Main Panel', confidence: 87, details: '400A, 3-phase service', suggestedAge: 20, suggestedCondition: 'good' },
    ],
    'int_electrical': [
      { id: generateId(), category: 'electrical', name: 'Electrical Panel', confidence: 93, details: '200A main breaker panel', suggestedAge: 15, suggestedCondition: 'good' },
      { id: generateId(), category: 'electrical', name: 'Conduit Wiring', confidence: 85, details: 'EMT conduit with copper conductors', suggestedAge: 20, suggestedCondition: 'average' },
    ],
    'int_office': [
      { id: generateId(), category: 'ceiling', name: 'Suspended Acoustic Ceiling', confidence: 91, details: '2x4 lay-in tiles', suggestedAge: 10, suggestedCondition: 'good' },
      { id: generateId(), category: 'flooring', name: 'Commercial Carpet Tile', confidence: 88, details: 'Modular carpet squares', suggestedAge: 5, suggestedCondition: 'good' },
      { id: generateId(), category: 'other', name: 'LED Light Fixtures', confidence: 90, details: '2x4 troffer style', suggestedAge: 3, suggestedCondition: 'excellent' },
    ],
    'int_shop': [
      { id: generateId(), category: 'flooring', name: 'Sealed Concrete Floor', confidence: 95, details: '4" reinforced slab with epoxy sealer', suggestedAge: 25, suggestedCondition: 'average' },
      { id: generateId(), category: 'ceiling', name: 'Exposed Structure', confidence: 88, details: 'Painted open web steel joists', suggestedAge: 25, suggestedCondition: 'good' },
      { id: generateId(), category: 'other', name: 'High Bay Lighting', confidence: 86, details: 'T5 fluorescent high bay fixtures', suggestedAge: 8, suggestedCondition: 'good' },
    ],
    'site_parking': [
      { id: generateId(), category: 'other', name: 'Asphalt Paving', confidence: 92, details: 'Hot mix asphalt, striped', suggestedAge: 8, suggestedCondition: 'average' },
      { id: generateId(), category: 'other', name: 'Concrete Curbing', confidence: 85, details: '6" vertical curb', suggestedAge: 15, suggestedCondition: 'good' },
    ],
  };
  
  // Get materials for category or return generic defaults
  const categoryMaterials = materialPools[category];
  if (categoryMaterials) {
    // Return 1-3 random materials from the pool
    const count = 1 + Math.floor(Math.random() * Math.min(3, categoryMaterials.length));
    const shuffled = [...categoryMaterials].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  // Default fallback materials
  return [
    { 
      id: generateId(), 
      category: 'other', 
      name: 'Building Component', 
      confidence: 65, 
      details: 'Unable to identify specific material',
      suggestedCondition: 'average',
    },
  ];
}

/**
 * Generate a mock description based on detected materials
 */
function generateMockDescription(category: string, materials: DetectedMaterial[]): string {
  if (materials.length === 0) return 'No specific materials detected.';
  
  const materialNames = materials.map(m => m.name).join(', ');
  const avgCondition = materials.reduce((sum, m) => {
    const conditionValue = { excellent: 5, good: 4, average: 3, fair: 2, poor: 1 }[m.suggestedCondition || 'average'] || 3;
    return sum + conditionValue;
  }, 0) / materials.length;
  
  const conditionLabel = avgCondition >= 4.5 ? 'excellent' : avgCondition >= 3.5 ? 'good' : avgCondition >= 2.5 ? 'average' : 'fair';
  
  return `Photo shows ${materialNames}. Overall condition appears to be ${conditionLabel}.`;
}


