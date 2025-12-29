/**
 * Demographics Radius API Route
 * POST /api/demographics/radius
 * 
 * Returns demographic data for 1, 3, and 5 mile radii around a location.
 * 
 * Data Sources (in priority order):
 * 1. ESRI GeoEnrichment API (when ESRI_API_KEY is configured) - TRUE radius data
 * 2. US Census Bureau API (fallback) - Approximated from county-level data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRadiusDemographics } from '../_lib/census';
import { fetchGeoEnrichment, isESRIConfigured, getESRIToken, getESRIAuthMethod } from '../_lib/esri';

interface DemographicsRequestBody {
  latitude: number;
  longitude: number;
  radii?: number[];
}

// Industry distribution for employment (typical US breakdown) - used as fallback
const INDUSTRY_DISTRIBUTION = [
  { industry: 'Healthcare & Social Assistance', percentage: 16.2 },
  { industry: 'Retail Trade', percentage: 10.8 },
  { industry: 'Manufacturing', percentage: 8.5 },
  { industry: 'Education Services', percentage: 8.3 },
  { industry: 'Accommodation & Food Services', percentage: 7.8 },
  { industry: 'Professional & Technical Services', percentage: 7.5 },
  { industry: 'Construction', percentage: 6.8 },
  { industry: 'Transportation & Warehousing', percentage: 5.2 },
  { industry: 'Finance & Insurance', percentage: 4.8 },
  { industry: 'Public Administration', percentage: 4.5 },
  { industry: 'Other Services', percentage: 19.6 },
];

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
    const body = req.body as DemographicsRequestBody;
    const { latitude, longitude, radii = [1, 3, 5] } = body;

    // Validate required fields
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude are required',
        data: null,
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates',
        data: null,
      });
    }

    // Try ESRI first if configured
    if (isESRIConfigured()) {
      try {
        const authMethod = getESRIAuthMethod();
        console.log(`Using ESRI GeoEnrichment API for demographics (auth: ${authMethod})`);
        
        // Get token (works for both API key and OAuth)
        const token = await getESRIToken();
        
        const esriData = await fetchGeoEnrichment(
          latitude,
          longitude,
          radii,
          token
        );

        // Format ESRI response
        const formattedData = esriData.map(data => ({
          ...data,
          isApproximate: false,
        }));

        return res.status(200).json({
          success: true,
          data: formattedData,
          source: 'esri',
          authMethod,
          asOfDate: new Date().toISOString(),
          note: `Demographics data from ESRI GeoEnrichment API (${authMethod}) with true ring buffer analysis.`,
          error: null,
        });
      } catch (esriError) {
        console.error('ESRI API error, falling back to Census:', esriError);
        // Fall through to Census fallback
      }
    }

    // Fallback to Census API
    console.log('Using Census API for demographics (approximated)');
    
    const radiusData = await getRadiusDemographics(
      { latitude, longitude },
      radii
    );

    // Format Census response
    const formattedData = radiusData.map(({ radius, demographics, isApproximate }) => {
      const totalEducated = demographics.bachelorsDegree + 
                           demographics.mastersDegree + 
                           demographics.doctorateDegree;
      
      // Estimate total population 25+ (roughly 65% of total population)
      const estPop25Plus = demographics.population * 0.65;
      
      return {
        radius,
        population: {
          current: demographics.population,
          projected5Year: Math.round(demographics.population * 1.05), // 1% annual growth assumption
          annualGrowthRate: 1.0,
        },
        households: {
          current: demographics.households,
          projected5Year: Math.round(demographics.households * 1.04),
          averageSize: Math.round(demographics.averageHouseholdSize * 100) / 100,
        },
        income: {
          medianHousehold: demographics.medianHouseholdIncome,
          averageHousehold: Math.round(demographics.medianHouseholdIncome * 1.15), // Avg typically higher
          perCapita: demographics.perCapitaIncome,
        },
        education: {
          percentCollegeGraduates: Math.round((totalEducated / Math.max(estPop25Plus, 1)) * 1000) / 10,
          percentGraduateDegree: Math.round(((demographics.mastersDegree + demographics.doctorateDegree) / Math.max(estPop25Plus, 1)) * 1000) / 10,
        },
        employment: {
          laborForce: demographics.laborForce,
          unemployed: demographics.unemployed,
          unemploymentRate: Math.round((demographics.unemployed / Math.max(demographics.laborForce, 1)) * 1000) / 10,
        },
        employmentByIndustry: INDUSTRY_DISTRIBUTION,
        isApproximate,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedData,
      source: 'census',
      asOfDate: new Date().toISOString(),
      note: 'Radius demographics are approximated from county-level Census data. For precise radius data, configure ESRI_API_KEY.',
      error: null,
    });
  } catch (error) {
    console.error('Demographics error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to fetch demographics: ${errorMessage}`,
      data: null,
    });
  }
}
