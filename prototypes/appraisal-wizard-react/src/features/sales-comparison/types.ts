export interface Property {
  id: string;
  type: 'subject' | 'comp';
  name: string;
  address: string;
  image: string;
  distance?: string;
  status?: string;
  /** Latitude coordinate for map display */
  lat?: number;
  /** Longitude coordinate for map display */
  lng?: number;
  /** Sale price for map tooltip */
  salePrice?: number;
}

export type GridRowCategory = 'transaction' | 'physical' | 'financial' | 'adjustments' | 'valuation' | 'quantitative' | 'qualitative' | 'cap_rate_extraction';

export interface GridRowData {
  id: string;
  category: GridRowCategory;
  label: string;
  key: string;
  format?: 'currency' | 'number' | 'text' | 'percent' | 'date' | 'currency_sf' | 'percent_adjustment' | 'text_with_adjustment';
  isAdjustment?: boolean;
  mode?: 'standard' | 'residual' | 'both';
  isCalculated?: boolean;
}

export interface ComparisonValue {
  value: string | number | null;
  adjustment?: number;
  flag?: 'superior' | 'inferior' | 'similar';
  unit?: 'percent' | 'dollar';
}

export type PropertyValues = Record<string, Record<string, ComparisonValue>>;

export interface Section {
  id: GridRowCategory;
  title: string;
  color: string;
}

