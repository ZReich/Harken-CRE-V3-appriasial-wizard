/**
 * Economic Indicators API Route
 * GET /api/economic/indicators
 * 
 * Returns current and historical economic indicator data from FRED.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFredData, FRED_SERIES } from '../_lib/fred';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Prevent caching to ensure fresh data on each request
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
      data: null,
    });
  }

  // Validate API key is configured
  if (!process.env.FRED_API_KEY) {
    console.error('FRED_API_KEY not configured');
    return res.status(500).json({
      success: false,
      error: 'Economic data service not configured',
      data: null,
    });
  }

  try {
    // Fetch all economic indicators in parallel
    // For YoY calculations, we need current + 12 months ago data
    // CPI: 25 months to calculate 12 months of YoY inflation
    // GDP: 12 quarters (3 years) to calculate 8 quarters of YoY growth
    const [fedFunds, treasury, cpi, gdp] = await Promise.all([
      getFredData(FRED_SERIES.FEDERAL_FUNDS_RATE, 13, 'm'),  // 13 months for trend
      getFredData(FRED_SERIES.TREASURY_10Y, 13, 'm'),
      getFredData(FRED_SERIES.CPI, 25, 'm'),  // 25 months for YoY calculation (12 current + 12 year-ago + 1)
      getFredData(FRED_SERIES.GDP, 12, 'q'),  // 12 quarters for YoY calculation (8 current + 4 year-ago)
    ]);

    // Debug logging
    console.log('FRED Data received:', {
      fedFundsCount: fedFunds.observations.length,
      treasuryCount: treasury.observations.length,
      cpiCount: cpi.observations.length,
      gdpCount: gdp.observations.length,
    });

    // Calculate inflation rate (YoY change in CPI)
    const latestCpi = cpi.observations[0]?.value || 0;
    const yearAgoCpi = cpi.observations[12]?.value || latestCpi;
    const inflationRate = yearAgoCpi > 0 
      ? ((latestCpi - yearAgoCpi) / yearAgoCpi) * 100 
      : 0;

    // Calculate GDP growth (YoY change)
    const latestGdp = gdp.observations[0]?.value || 0;
    const yearAgoGdp = gdp.observations[4]?.value || latestGdp;
    const gdpGrowth = yearAgoGdp > 0 
      ? ((latestGdp - yearAgoGdp) / yearAgoGdp) * 100 
      : 0;
    
    console.log('Calculated values:', { 
      latestCpi, yearAgoCpi, inflationRate,
      latestGdp, yearAgoGdp, gdpGrowth 
    });

    return res.status(200).json({
      success: true,
      data: {
        federalFundsRate: {
          current: fedFunds.observations[0]?.value || 0,
          history: fedFunds.observations.slice(0, 12),
        },
        treasury10Y: {
          current: treasury.observations[0]?.value || 0,
          history: treasury.observations.slice(0, 12),
        },
        inflation: {
          current: Math.round(inflationRate * 100) / 100,
          history: cpi.observations.slice(0, 12).map((obs, i) => {
            const yearAgoIdx = i + 12;
            const yearAgoValue = cpi.observations[yearAgoIdx]?.value;
            // Only calculate if we have year-ago data
            if (!yearAgoValue || yearAgoValue <= 0) {
              return { date: obs.date, value: 0 };
            }
            const yoyChange = ((obs.value - yearAgoValue) / yearAgoValue) * 100;
            return {
              date: obs.date,
              value: Math.round(yoyChange * 100) / 100,
            };
          }),
        },
        gdpGrowth: {
          current: Math.round(gdpGrowth * 100) / 100,
          history: gdp.observations.slice(0, 8).map((obs, i) => {
            const yearAgoIdx = i + 4;
            const yearAgoValue = gdp.observations[yearAgoIdx]?.value;
            // Only calculate if we have year-ago data
            if (!yearAgoValue || yearAgoValue <= 0) {
              return { date: obs.date, value: 0 };
            }
            const yoyChange = ((obs.value - yearAgoValue) / yearAgoValue) * 100;
            return {
              date: obs.date,
              value: Math.round(yoyChange * 100) / 100,
            };
          }),
        },
      },
      asOfDate: new Date().toISOString(),
      error: null,
    });
  } catch (error) {
    console.error('Economic indicators error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to fetch economic indicators: ${errorMessage}`,
      data: null,
    });
  }
}


