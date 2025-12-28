/**
 * Market Analysis Types
 */

export interface MarketMetric {
  label: string;
  value: number | string;
  change?: number; // YoY change percentage
  changeLabel?: string;
  source?: string;
}

export interface MarketSection {
  id: string;
  title: string;
  icon: string;
  metrics: MarketMetric[];
}

export interface MarketSupplyDemand {
  vacancyRate: number;
  vacancyChange: number;
  absorptionSf: number;
  absorptionChange: number;
  newConstructionSf: number;
  pipelineSf: number;
}

export interface RentTrends {
  currentAskingRent: number;
  rentChange: number;
  rentGrowth5Year: number;
  rentRangeLow: number;
  rentRangeHigh: number;
}

export interface SaleTrends {
  avgPricePsf: number;
  priceChange: number;
  avgCapRate: number;
  capRateChange: number;
  transactionVolume: number;
  avgDom: number;
}

export interface MarketData {
  supplyDemand: MarketSupplyDemand;
  rentTrends: RentTrends;
  saleTrends: SaleTrends;
  marketOutlook: string;
  dataAsOf: string;
}





