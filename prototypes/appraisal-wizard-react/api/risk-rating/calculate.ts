/**
 * Risk Rating Calculation API Route
 * POST /api/risk-rating/calculate
 * 
 * Calculates the Investment Risk Rating ("Bond Rating for Buildings")
 * for a property based on market and property data.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { calculateRiskRating, getRiskRatingDisclosure } from '../_lib/risk-engine';
import { getTreasuryRate } from '../_lib/fred';

interface RiskRatingRequestBody {
  propertyType: string;
  latitude: number;
  longitude: number;
  isIncomeProducing: boolean;
  capRate?: number;
  daysOnMarket?: number;
  yearBuilt?: number;
  condition?: string;
  schoolRating?: number;
  crimeScore?: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
      data: null,
    });
  }

  try {
    const body = req.body as RiskRatingRequestBody;
    const {
      propertyType,
      isIncomeProducing,
      capRate,
      daysOnMarket,
      yearBuilt,
      condition,
      schoolRating,
      crimeScore,
    } = body;

    // Validate required fields
    if (!propertyType) {
      return res.status(400).json({
        success: false,
        error: 'propertyType is required',
        data: null,
      });
    }

    // Get current treasury rate for yield spread calculation
    let treasuryRate = 4.25; // Default fallback
    
    if (process.env.FRED_API_KEY) {
      try {
        treasuryRate = await getTreasuryRate();
      } catch (error) {
        console.warn('Could not fetch treasury rate, using default:', error);
      }
    }

    // Calculate risk rating
    const riskRating = calculateRiskRating({
      propertyType,
      isIncomeProducing: isIncomeProducing ?? false,
      capRate,
      treasuryRate,
      daysOnMarket,
      yearBuilt,
      condition,
      schoolRating,
      crimeScore,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...riskRating,
        generatedDate: new Date().toISOString(),
        treasuryRateUsed: treasuryRate,
      },
      disclaimer: getRiskRatingDisclosure(),
      error: null,
    });
  } catch (error) {
    console.error('Risk rating calculation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to calculate risk rating: ${errorMessage}`,
      data: null,
    });
  }
}


