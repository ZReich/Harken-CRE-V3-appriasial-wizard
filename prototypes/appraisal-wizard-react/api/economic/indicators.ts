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
    // Fetching annual data ('a') for the last 21 years (Current + 20 history) to ensure robust chart history
    const [fedFunds, treasury, cpi, gdp] = await Promise.all([
      getFredData(FRED_SERIES.FEDERAL_FUNDS_RATE, 21, 'a'),
      getFredData(FRED_SERIES.TREASURY_10Y, 21, 'a'),
      getFredData(FRED_SERIES.CPI, 21, 'a'),
      getFredData(FRED_SERIES.GDP, 21, 'a'),
    ]);

    // Debug logging
    console.log('FRED Data received (Annual):', {
      fedFundsCount: fedFunds.observations.length,
      treasuryCount: treasury.observations.length,
      cpiCount: cpi.observations.length,
      gdpCount: gdp.observations.length,
    });

    // Calculate inflation rate (Annual change in CPI)
    // Since data is annual, we compare current index (0) with previous year index (1)
    const latestCpi = cpi.observations[0]?.value || 0;
    const previousCpi = cpi.observations[1]?.value || latestCpi;
    const inflationRate = previousCpi > 0
      ? ((latestCpi - previousCpi) / previousCpi) * 100
      : 0;

    // Calculate GDP growth (Annual change)
    const latestGdp = gdp.observations[0]?.value || 0;
    const previousGdp = gdp.observations[1]?.value || latestGdp;
    const gdpGrowth = previousGdp > 0
      ? ((latestGdp - previousGdp) / previousGdp) * 100
      : 0;

    console.log('Calculated values:', {
      latestCpi, previousCpi, inflationRate,
      latestGdp, previousGdp, gdpGrowth
    });

    return res.status(200).json({
      success: true,
      data: {
        federalFundsRate: {
          current: fedFunds.observations[0]?.value || 0,
          history: fedFunds.observations.slice(0, 20),
        },
        treasury10Y: {
          current: treasury.observations[0]?.value || 0,
          history: treasury.observations.slice(0, 20),
        },
        inflation: {
          current: Math.round(inflationRate * 100) / 100,
          history: cpi.observations.slice(0, 20).map((obs, i) => {
            const prevIdx = i + 1;
            const prevValue = cpi.observations[prevIdx]?.value;
            // Only calculate if we have previous year data
            if (!prevValue || prevValue <= 0) {
              return { date: obs.date, value: 0 };
            }
            const change = ((obs.value - prevValue) / prevValue) * 100;
            return {
              date: obs.date,
              value: Math.round(change * 100) / 100,
            };
          }),
        },
        gdpGrowth: {
          current: Math.round(gdpGrowth * 100) / 100,
          history: gdp.observations.slice(0, 20).map((obs, i) => {
            const prevIdx = i + 1;
            const prevValue = gdp.observations[prevIdx]?.value;
            // Only calculate if we have previous year data
            if (!prevValue || prevValue <= 0) {
              return { date: obs.date, value: 0 };
            }
            const change = ((obs.value - prevValue) / prevValue) * 100;
            return {
              date: obs.date,
              value: Math.round(change * 100) / 100,
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
