// =================================================================
// REVIEW PAGE TYPES
// =================================================================

export type ReviewTabId = 'hbu' | 'swot' | 'risk-rating' | 'cost-seg' | 'market-analysis' | 'reconciliation' | 'checklist' | 'preview';

export interface ReviewTab {
  id: ReviewTabId;
  label: string;
  icon: 'hbu' | 'chart' | 'checklist' | 'document';
}

// =================================================================
// RECONCILIATION TYPES
// =================================================================

export interface ScenarioReconciliation {
  scenarioId: number;
  weights: {
    [approachName: string]: number; // e.g., { 'Sales Comparison': 40, 'Income Approach': 60 }
  };
  comments: string;
}

export interface ReconciliationData {
  scenarioReconciliations: ScenarioReconciliation[];
  exposurePeriod: number | null;
  marketingTime: number | null;
  exposureRationale: string;
  certifications: string[];
}

export interface ApproachValue {
  approachName: string;
  scenarioId: number;
  value: number | null;
  isApplicable: boolean;
}

// =================================================================
// REPORT EDITOR TYPES
// =================================================================

// =================================================================
// INLINE PHOTO PLACEMENT TYPES
// =================================================================

export type PhotoPosition = 'header' | 'inline' | 'footer';
export type PhotoAspectRatio = '16/9' | '4/3' | 'square' | '3/2';

export interface PhotoSlotConfig {
  id: string;
  position: PhotoPosition;
  aspectRatio: PhotoAspectRatio;
  label?: string;
  categoryFilter?: string; // Filter photos by category (e.g., 'interior', 'exterior')
}

export interface InlinePhotoPlacement {
  slotId: string;
  photoId: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ReportSection {
  id: string;
  label: string;
  type: 'cover' | 'section' | 'toc' | 'letter' | 'summary-table' | 'narrative' | 'analysis-grid' | 'photo-grid' | 'map' | 'document' | 'addenda-header' | 'addenda-list' | 'risk-rating' | 'demographics' | 'economic-context' | 'swot' | 'comparable-cards' | 'comparable-detail' | 'comparable-map' | 'lease-abstraction' | 'dcf-projection' | 'zoning-exhibit' | 'environmental-exhibit' | 'scenario-reconciliation';
  sectionNumber?: string;
  enabled: boolean;
  expanded: boolean;
  fields: ReportField[];
  // Dynamic: only show if approach is selected
  requiresApproach?: string;
  // Inline photo placement configuration
  allowInlinePhotos?: boolean;
  photoSlots?: PhotoSlotConfig[];
  
  // =================================================================
  // SCENARIO & COMPARABLE SUPPORT (Professional Report Architecture)
  // =================================================================
  
  /** Scenario this section belongs to (for multi-scenario reports) */
  scenarioId?: number;
  /** Scenario name for display (e.g., "As Is", "As Completed", "As Stabilized") */
  scenarioName?: string;
  /** For individual comparable pages - the comparable ID */
  comparableId?: string;
  /** Type of comparable for this section */
  comparableType?: 'land' | 'improved' | 'rent';
  /** For lease abstraction pages - the lease/tenant ID */
  leaseId?: string;
  /** For addenda document pages - the document ID */
  documentId?: string;
  /** Map image URL for comparable location maps */
  mapImageUrl?: string;
  /** Parent section ID for nested sections (e.g., comps under Sales Comparison) */
  parentSectionId?: string;
  /** Whether this is a scenario group header */
  isScenarioHeader?: boolean;
  /** Color coding for scenario groups */
  scenarioColor?: 'blue' | 'green' | 'purple';
}

export interface ReportField {
  id: string;
  label: string;
  enabled: boolean;
  // Field-level inline photo support
  allowPhoto?: boolean;
  photoPosition?: 'before' | 'after' | 'right';
}

export interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'section';
  pageId: string;
  fieldId: string;
  content: string;
  styles: ElementStyles;
}

export interface ElementStyles {
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  marginTop?: number;
  marginBottom?: number;
}

export interface TextBlock {
  id: string;
  pageId: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles: ElementStyles;
  hasBorder: boolean;
}

// =================================================================
// PROPERTY PANEL TYPES
// =================================================================

export type PropertyTabId = 'design' | 'content' | 'advanced';

export interface PropertyTab {
  id: PropertyTabId;
  label: string;
}

// =================================================================
// CERTIFICATION TYPES
// =================================================================

export interface Certification {
  id: string;
  text: string;
}

export const DEFAULT_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert_1',
    text: 'I certify that the statements of fact contained in this report are true and correct',
  },
  {
    id: 'cert_2',
    text: 'I certify that the analyses, opinions, and conclusions are limited only by the assumptions and limiting conditions stated in this report',
  },
  {
    id: 'cert_3',
    text: 'I certify that I have no present or prospective interest in the property',
  },
  {
    id: 'cert_4',
    text: 'I certify that I have performed no services regarding the property within the three-year period immediately preceding acceptance of this assignment',
  },
];

// =================================================================
// COMPARABLE CARD TYPES (ROVE-style 3 per page)
// =================================================================

export interface ComparableCardData {
  id: string;
  type: 'land' | 'improved' | 'rent';
  photoUrl?: string;
  address: string;
  cityStateZip?: string;
  // Transaction data
  saleDate?: string;
  salePrice?: number;
  pricePerUnit?: number; // $/SF, $/Acre, $/Unit depending on type
  unitLabel?: string; // "SF", "Acre", "Unit"
  // Property data
  size?: number;
  sizeLabel?: string; // "SF", "Acres", "Units"
  yearBuilt?: number;
  propertyType?: string;
  // Narrative (optional)
  narrative?: string;
  // Adjustment summary
  netAdjustment?: number;
  adjustedValue?: number;
}

export interface ComparableCardsPageData {
  approachType: 'land' | 'sales' | 'rent';
  scenarioId: number;
  scenarioName: string;
  comparables: ComparableCardData[];
}

// =================================================================
// SCENARIO GROUP TYPES
// =================================================================

export type ScenarioType = 'As Is' | 'As Completed' | 'As Stabilized';

export interface ScenarioGroup {
  id: number;
  name: ScenarioType;
  color: 'blue' | 'green' | 'purple';
  sections: ReportSection[];
}

export const SCENARIO_COLORS: Record<ScenarioType, 'blue' | 'green' | 'purple'> = {
  'As Is': 'blue',
  'As Completed': 'green',
  'As Stabilized': 'purple',
};

// =================================================================
// MAP CAPTURE TYPES
// =================================================================

export interface ComparableMapData {
  approachType: 'land' | 'sales' | 'rent';
  scenarioId: number;
  imageUrl: string;
  subjectPin: {
    lat: number;
    lng: number;
    address: string;
  };
  comparablePins: Array<{
    id: string;
    number: number;
    lat: number;
    lng: number;
    address: string;
  }>;
}

// =================================================================
// LEASE ABSTRACTION PAGE TYPES
// =================================================================

export interface LeaseAbstractionPageData {
  leaseId: string;
  tenantName: string;
  tenantLegalName?: string;
  tenantType?: 'national' | 'regional' | 'local' | 'government' | 'non_profit';
  suiteNumber?: string;
  leasedSqFt: number;
  leaseType: string;
  leaseStartDate: string;
  leaseEndDate: string;
  currentBaseRent: number;
  rentPerSf?: number;
  escalations?: Array<{
    type: string;
    rate?: number;
    effectiveDate?: string;
  }>;
  options?: Array<{
    type: string;
    terms?: string;
  }>;
  notes?: string;
}

// =================================================================
// DCF PROJECTION PAGE TYPES
// =================================================================

export interface DCFProjectionPageData {
  scenarioId: number;
  scenarioName: string;
  holdingPeriod: number;
  discountRate: number;
  terminalCapRate: number;
  annualGrowthRate: number;
  yearlyProjections: Array<{
    year: number;
    noi: number;
    pvFactor: number;
    pvCashFlow: number;
  }>;
  reversionValue: number;
  pvReversion: number;
  totalPresentValue: number;
}
