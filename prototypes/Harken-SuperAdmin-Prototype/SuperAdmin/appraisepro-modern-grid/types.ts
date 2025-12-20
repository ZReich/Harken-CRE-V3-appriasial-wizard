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
  category: 'transaction' | 'physical' | 'financial' | 'adjustments' | 'valuation';
  label: string;
  key: string; // The key to look up in values
  format?: 'currency' | 'number' | 'text' | 'percent' | 'date' | 'currency_sf';
  isAdjustment?: boolean; // If true, handled differently in UI
}

export interface ComparisonValue {
  value: string | number | null;
  adjustment?: number; // For adjustment rows
  flag?: 'superior' | 'inferior' | 'similar'; // For qualitative assessment
}

// Map property ID to its values for specific rows
export type PropertyValues = Record<string, Record<string, ComparisonValue>>;

export interface Section {
  id: string;
  title: string;
  color: string;
}