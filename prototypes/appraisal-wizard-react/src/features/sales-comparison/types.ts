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

/**
 * Override data for calculated fields
 * When appraiser needs to override a calculated value
 */
export interface OverrideData {
  /** The manually entered override value */
  overrideValue: number | string;
  /** Required explanation for the override */
  note: string;
  /** Original calculated value (for reference/display) */
  originalCalculated?: number | string | null;
  /** Timestamp when override was applied */
  overriddenAt?: string;
}

/**
 * Per-adjustment explanation for USPAP compliance
 * Allows appraisers to document rationale for each specific adjustment
 */
export interface AdjustmentExplanation {
  /** The explanation text (supports rich text HTML) */
  text: string;
  /** Timestamp when explanation was last updated */
  updatedAt?: string;
  /** Optional: data source reference (e.g., "Paired sales analysis", "MLS data") */
  dataSource?: 'paired_sales' | 'mls_data' | 'market_study' | 'appraiser_judgment' | 'cost_data' | 'other';
}

export interface ComparisonValue {
  value: string | number | null;
  adjustment?: number;
  flag?: 'superior' | 'inferior' | 'similar';
  unit?: 'percent' | 'dollar';
  /** Override data for calculated fields that have been manually adjusted */
  override?: OverrideData;
  /** Per-adjustment explanation for USPAP compliance */
  explanation?: AdjustmentExplanation;
}

export type PropertyValues = Record<string, Record<string, ComparisonValue>>;

export interface Section {
  id: GridRowCategory;
  title: string;
  color: string;
}

