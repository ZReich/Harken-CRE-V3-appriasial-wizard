/**
 * Market Analysis Constants
 */

import type { MarketData } from './types';

export const MOCK_MARKET_DATA: MarketData = {
  supplyDemand: {
    vacancyRate: 5.2,
    vacancyChange: -0.8,
    absorptionSf: 245000,
    absorptionChange: 12.5,
    newConstructionSf: 180000,
    pipelineSf: 320000,
  },
  rentTrends: {
    currentAskingRent: 24.50,
    rentChange: 3.2,
    rentGrowth5Year: 2.8,
    rentRangeLow: 18.00,
    rentRangeHigh: 32.00,
  },
  saleTrends: {
    avgPricePsf: 285,
    priceChange: 5.4,
    avgCapRate: 6.25,
    capRateChange: -0.15,
    transactionVolume: 45,
    avgDom: 87,
  },
  marketOutlook: 'The local retail market continues to show resilience with steady tenant demand and limited new supply. Vacancy rates have compressed over the past 12 months, supporting modest rent growth. Investment activity has picked up, with cap rates stabilizing after a period of expansion. The outlook for the next 12-18 months remains cautiously optimistic, supported by strong local economic fundamentals and population growth.',
  dataAsOf: 'Q4 2024',
};





