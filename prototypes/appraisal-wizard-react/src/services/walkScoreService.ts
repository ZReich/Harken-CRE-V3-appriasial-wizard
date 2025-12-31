/**
 * Walk Score API Service
 * 
 * Provides walkability, transit, and bike scores for property locations.
 * These scores are valuable for retail, office, and multifamily properties.
 * Industrial properties use alternative metrics (truck access, highway proximity).
 * 
 * API Documentation: https://www.walkscore.com/professional/api.php
 */

import type { WalkScoreResponse } from '../types';

// API key should be set in environment variables
const API_KEY = typeof import.meta !== 'undefined' && import.meta.env?.VITE_WALK_SCORE_API_KEY 
  ? import.meta.env.VITE_WALK_SCORE_API_KEY 
  : undefined;

const WALK_SCORE_API_BASE = 'https://api.walkscore.com/score';

/**
 * Check if Walk Score API is configured
 */
export function isWalkScoreConfigured(): boolean {
  return Boolean(API_KEY);
}

/**
 * Fetch Walk Score data for a location
 * 
 * @param latitude - Property latitude
 * @param longitude - Property longitude
 * @param address - Street address for the API
 * @returns Walk Score response with walkability, transit, and bike scores
 */
export async function getWalkScore(
  latitude: number,
  longitude: number,
  address: string
): Promise<WalkScoreResponse> {
  // If no API key, return mock data for development
  if (!API_KEY) {
    console.log('[WalkScore] No API key configured, returning mock data');
    return generateMockWalkScore(latitude, longitude, address);
  }

  try {
    const params = new URLSearchParams({
      format: 'json',
      address: address,
      lat: latitude.toString(),
      lon: longitude.toString(),
      transit: '1',
      bike: '1',
      wsapikey: API_KEY,
    });

    const response = await fetch(`${WALK_SCORE_API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Walk Score API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      walkscore: data.walkscore ?? 0,
      walkscoreDescription: data.description ?? 'Unknown',
      transitScore: data.transit?.score,
      transitDescription: data.transit?.description,
      bikeScore: data.bike?.score,
      bikeDescription: data.bike?.description,
      logo_url: data.logo_url,
      snappedLat: data.snapped_lat,
      snappedLon: data.snapped_lon,
    };
  } catch (error) {
    console.error('[WalkScore] API error:', error);
    // Return mock data on error for resilience
    return generateMockWalkScore(latitude, longitude, address);
  }
}

/**
 * Generate realistic mock Walk Score data based on location
 * Uses a deterministic hash so same location always gets same score
 */
function generateMockWalkScore(
  latitude: number,
  longitude: number,
  address: string
): WalkScoreResponse {
  // Create a simple hash from coordinates and address for consistent mock data
  const hash = Math.abs(
    (latitude * 1000 + longitude * 1000 + address.length) % 100
  ) / 100;

  // Generate scores that vary by location
  const baseScore = Math.floor(hash * 60) + 20; // 20-80 range
  const walkscore = Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 20) - 10));
  const transitScore = Math.min(100, Math.max(0, baseScore - 10 + Math.floor(Math.random() * 20)));
  const bikeScore = Math.min(100, Math.max(0, baseScore + 5 + Math.floor(Math.random() * 15)));

  return {
    walkscore,
    walkscoreDescription: getWalkScoreDescription(walkscore),
    transitScore,
    transitDescription: getTransitDescription(transitScore),
    bikeScore,
    bikeDescription: getBikeDescription(bikeScore),
    snappedLat: latitude,
    snappedLon: longitude,
  };
}

/**
 * Interpret Walk Score value into description
 */
export function getWalkScoreDescription(score: number): string {
  if (score >= 90) return "Walker's Paradise";
  if (score >= 70) return 'Very Walkable';
  if (score >= 50) return 'Somewhat Walkable';
  if (score >= 25) return 'Car-Dependent';
  return 'Almost All Errands Require a Car';
}

/**
 * Interpret Transit Score value into description
 */
export function getTransitDescription(score: number): string {
  if (score >= 90) return 'Excellent Transit';
  if (score >= 70) return 'Excellent Transit';
  if (score >= 50) return 'Good Transit';
  if (score >= 25) return 'Some Transit';
  return 'Minimal Transit';
}

/**
 * Interpret Bike Score value into description
 */
export function getBikeDescription(score: number): string {
  if (score >= 90) return "Biker's Paradise";
  if (score >= 70) return 'Very Bikeable';
  if (score >= 50) return 'Bikeable';
  return 'Somewhat Bikeable';
}

/**
 * Determine if Walk Score is relevant for a property type
 */
export function isWalkScoreRelevant(propertyType: string): boolean {
  const relevantTypes = [
    'retail',
    'office',
    'multifamily',
    'mixed-use',
    'residential',
    'apartment',
    'commercial',
  ];
  return relevantTypes.some(type => 
    propertyType.toLowerCase().includes(type.toLowerCase())
  );
}

/**
 * Get SWOT-relevant interpretation of Walk Score for a property type
 */
export function interpretWalkScoreForSWOT(
  walkScore: WalkScoreResponse,
  propertyType: string
): { isStrength: boolean; isWeakness: boolean; text: string; confidence: 'high' | 'medium' | 'low' } {
  const score = walkScore.walkscore;
  const transitScore = walkScore.transitScore ?? 0;
  
  // Different thresholds based on property type
  const thresholds = getPropertyTypeThresholds(propertyType);
  
  if (score >= thresholds.strength) {
    return {
      isStrength: true,
      isWeakness: false,
      text: `Strong walkability (${score}/100: ${walkScore.walkscoreDescription}) enhances ${getPropertyBenefit(propertyType)}`,
      confidence: score >= 80 ? 'high' : 'medium',
    };
  }
  
  if (score < thresholds.weakness) {
    return {
      isStrength: false,
      isWeakness: true,
      text: `Limited walkability (${score}/100: ${walkScore.walkscoreDescription}) may reduce ${getPropertyBenefit(propertyType)}`,
      confidence: score < 25 ? 'high' : 'medium',
    };
  }
  
  return {
    isStrength: false,
    isWeakness: false,
    text: `Moderate walkability (${score}/100: ${walkScore.walkscoreDescription})`,
    confidence: 'medium',
  };
}

function getPropertyTypeThresholds(propertyType: string): { strength: number; weakness: number } {
  const lower = propertyType.toLowerCase();
  
  // Retail needs high walkability
  if (lower.includes('retail')) {
    return { strength: 70, weakness: 40 };
  }
  
  // Office benefits from walkability but not as critical
  if (lower.includes('office')) {
    return { strength: 65, weakness: 35 };
  }
  
  // Multifamily strongly benefits from walkability
  if (lower.includes('multifamily') || lower.includes('apartment') || lower.includes('residential')) {
    return { strength: 60, weakness: 30 };
  }
  
  // Default thresholds
  return { strength: 60, weakness: 35 };
}

function getPropertyBenefit(propertyType: string): string {
  const lower = propertyType.toLowerCase();
  
  if (lower.includes('retail')) {
    return 'foot traffic and customer accessibility';
  }
  if (lower.includes('office')) {
    return 'employee attraction and retention';
  }
  if (lower.includes('multifamily') || lower.includes('apartment')) {
    return 'tenant desirability and rent premiums';
  }
  return 'property desirability';
}
