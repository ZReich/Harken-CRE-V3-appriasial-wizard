
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
  key: string; // The key to look up in values
  format?: 'currency' | 'number' | 'text' | 'percent' | 'date' | 'currency_sf' | 'percent_adjustment' | 'text_with_adjustment';
  isAdjustment?: boolean; // If true, handled differently in UI
  mode?: 'standard' | 'residual' | 'both'; // Controls visibility based on analysis mode
  isCalculated?: boolean; // If true, the field is read-only and computed
}

export interface ComparisonValue {
  value: string | number | null;
  adjustment?: number; // For adjustment rows
  flag?: 'superior' | 'inferior' | 'similar'; // For qualitative assessment
  unit?: 'percent' | 'dollar'; // Track if value is a percentage or dollar amount
}

// Map property ID to its values for specific rows
export type PropertyValues = Record<string, Record<string, ComparisonValue>>;

export interface Section {
  id: string;
  title: string;
  color: string;
}
