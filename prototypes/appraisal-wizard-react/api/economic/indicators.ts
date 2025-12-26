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
    const [fedFunds, treasury, cpi, gdp] = await Promise.all([
      getFredData(FRED_SERIES.FEDERAL_FUNDS_RATE, 13, 'm'),  // 13 months for YoY comparison
      getFredData(FRED_SERIES.TREASURY_10Y, 13, 'm'),
      getFredData(FRED_SERIES.CPI, 13, 'm'),
      getFredData(FRED_SERIES.GDP, 8, 'q'),  // Quarterly, last 2 years
    ]);

    // Calculate inflation rate (YoY change in CPI)
    const latestCpi = cpi.observations[0]?.value || 0;
    const yearAgoCpi = cpi.observations[12]?.value || latestCpi;
    const inflationRate = ((latestCpi - yearAgoCpi) / yearAgoCpi) * 100;

    // Calculate GDP growth (YoY change)
    const latestGdp = gdp.observations[0]?.value || 0;
    const yearAgoGdp = gdp.observations[4]?.value || latestGdp;
    const gdpGrowth = ((latestGdp - yearAgoGdp) / yearAgoGdp) * 100;

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
            const yearAgoValue = cpi.observations[yearAgoIdx]?.value || obs.value;
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
            const yearAgoValue = gdp.observations[yearAgoIdx]?.value || obs.value;
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


