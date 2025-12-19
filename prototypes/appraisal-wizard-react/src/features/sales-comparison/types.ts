export interface Property {
  id: string;
  type: 'subject' | 'comp';
  name: string;
  address: string;
  image: string;
  distance?: string;
  status?: string;
}

export interface GridRowData {
  id: string;
  category: 'transaction' | 'physical' | 'financial' | 'adjustments' | 'valuation' | 'quantitative' | 'qualitative';
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
  id: string;
  title: string;
  color: string;
}

