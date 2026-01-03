/**
 * Document Field Mappings
 * 
 * Maps extracted document fields to wizard state paths.
 * This allows the AI extraction to automatically populate the correct wizard fields.
 */

export type DocumentType = 
  | 'cadastral' 
  | 'engagement' 
  | 'sale' 
  | 'lease' 
  | 'rentroll' 
  | 'survey'
  | 'tax_return'
  | 'financial_statement'
  | 'deed'           // NEW: Grant deeds, warranty deeds, quitclaim deeds
  | 'flood_map'      // NEW: FEMA flood zone determinations
  | 'tax_assessment' // NEW: Property tax assessment/records
  | 'unknown';

/**
 * Field mapping from extracted field name to wizard state path.
 * The wizard state path uses dot notation (e.g., 'subjectData.taxId').
 */
export interface FieldMapping {
  extractedField: string;
  wizardPath: string;
  transform?: (value: string) => string; // Optional value transformation
}

/**
 * Mappings for each document type.
 * When data is extracted from a document, these mappings determine
 * which wizard fields get auto-populated.
 */
export const DOCUMENT_FIELD_MAPPINGS: Record<DocumentType, FieldMapping[]> = {
  cadastral: [
    { extractedField: 'propertyAddress', wizardPath: 'subjectData.address.street' },
    { extractedField: 'legalDescription', wizardPath: 'subjectData.legalDescription' },
    { extractedField: 'taxId', wizardPath: 'subjectData.taxId' },
    { extractedField: 'owner', wizardPath: 'owners.0.name' },
    { extractedField: 'landArea', wizardPath: 'subjectData.siteArea' },
    { extractedField: 'county', wizardPath: 'subjectData.address.county' },
    { extractedField: 'state', wizardPath: 'subjectData.address.state' },
    { extractedField: 'zipCode', wizardPath: 'subjectData.address.zip' },
    { extractedField: 'yearBuilt', wizardPath: 'improvementsInventory.parcels.0.buildings.0.yearBuilt' },
    { extractedField: 'zoning', wizardPath: 'subjectData.zoningClass' },
  ],
  
  engagement: [
    { extractedField: 'clientName', wizardPath: 'client.name' },
    { extractedField: 'clientAddress', wizardPath: 'client.address' },
    { extractedField: 'fee', wizardPath: 'engagement.fee' },
    { extractedField: 'appraisalPurpose', wizardPath: 'subjectData.appraisalPurpose' },
    { extractedField: 'effectiveDate', wizardPath: 'subjectData.effectiveDate' },
    { extractedField: 'intendedUse', wizardPath: 'subjectData.intendedUsers' },
    { extractedField: 'intendedUsers', wizardPath: 'subjectData.intendedUsers' },
    { extractedField: 'propertyAddress', wizardPath: 'subjectData.address.street' },
    { extractedField: 'dueDate', wizardPath: 'engagement.dueDate' },
  ],
  
  sale: [
    { extractedField: 'salePrice', wizardPath: 'subjectData.lastSalePrice' },
    { extractedField: 'saleDate', wizardPath: 'subjectData.lastSaleDate' },
    { extractedField: 'buyer', wizardPath: 'owners.0.name' },
    { extractedField: 'seller', wizardPath: 'transaction.seller' },
    { extractedField: 'terms', wizardPath: 'transaction.terms' },
    { extractedField: 'propertyAddress', wizardPath: 'subjectData.address.street' },
    { extractedField: 'closingDate', wizardPath: 'transaction.closingDate' },
  ],
  
  lease: [
    { extractedField: 'tenantName', wizardPath: 'incomeApproachData.leases.0.tenantName' },
    { extractedField: 'landlordName', wizardPath: 'owners.0.name' },
    { extractedField: 'rentAmount', wizardPath: 'incomeApproachData.leases.0.rentAmount' },
    { extractedField: 'leaseStart', wizardPath: 'incomeApproachData.leases.0.startDate' },
    { extractedField: 'leaseEnd', wizardPath: 'incomeApproachData.leases.0.endDate' },
    { extractedField: 'squareFeet', wizardPath: 'incomeApproachData.leases.0.squareFeet' },
    { extractedField: 'leaseType', wizardPath: 'incomeApproachData.leases.0.leaseType' },
    { extractedField: 'escalations', wizardPath: 'incomeApproachData.leases.0.escalations' },
  ],
  
  rentroll: [
    { extractedField: 'units', wizardPath: 'incomeApproachData.propertyMeta.units' },
    { extractedField: 'occupancyRate', wizardPath: 'incomeApproachData.propertyMeta.occupancy' },
    { extractedField: 'grossIncome', wizardPath: 'incomeApproachData.summary.potentialGrossIncome' },
    { extractedField: 'netIncome', wizardPath: 'incomeApproachData.summary.netOperatingIncome' },
    { extractedField: 'averageRent', wizardPath: 'incomeApproachData.propertyMeta.averageRent' },
    { extractedField: 'totalSquareFeet', wizardPath: 'incomeApproachData.propertyMeta.totalSF' },
  ],
  
  survey: [
    { extractedField: 'landArea', wizardPath: 'subjectData.siteArea' },
    { extractedField: 'legalDescription', wizardPath: 'subjectData.legalDescription' },
    { extractedField: 'easements', wizardPath: 'subjectData.easements' },
    { extractedField: 'floodZone', wizardPath: 'subjectData.femaZone' },
    { extractedField: 'zoning', wizardPath: 'subjectData.zoningClass' },
    { extractedField: 'dimensions', wizardPath: 'subjectData.frontage' },
  ],
  
  tax_return: [
    { extractedField: 'grossIncome', wizardPath: 'incomeApproachData.summary.potentialGrossIncome' },
    { extractedField: 'expenses', wizardPath: 'incomeApproachData.summary.operatingExpenses' },
    { extractedField: 'netIncome', wizardPath: 'incomeApproachData.summary.netOperatingIncome' },
    { extractedField: 'propertyTaxes', wizardPath: 'incomeApproachData.expenses.realEstateTaxes' },
    { extractedField: 'insurance', wizardPath: 'incomeApproachData.expenses.insurance' },
    { extractedField: 'repairs', wizardPath: 'incomeApproachData.expenses.repairs' },
  ],
  
  financial_statement: [
    { extractedField: 'grossIncome', wizardPath: 'incomeApproachData.summary.potentialGrossIncome' },
    { extractedField: 'effectiveGrossIncome', wizardPath: 'incomeApproachData.summary.effectiveGrossIncome' },
    { extractedField: 'expenses', wizardPath: 'incomeApproachData.summary.operatingExpenses' },
    { extractedField: 'netIncome', wizardPath: 'incomeApproachData.summary.netOperatingIncome' },
    { extractedField: 'vacancyRate', wizardPath: 'incomeApproachData.vacancy.rate' },
    { extractedField: 'managementFee', wizardPath: 'incomeApproachData.expenses.management' },
    { extractedField: 'propertyTaxes', wizardPath: 'incomeApproachData.expenses.realEstateTaxes' },
    { extractedField: 'insurance', wizardPath: 'incomeApproachData.expenses.insurance' },
  ],
  
  // NEW: Deed documents (Grant Deed, Warranty Deed, Quitclaim Deed)
  deed: [
    { extractedField: 'grantor', wizardPath: 'transaction.seller' },
    { extractedField: 'grantee', wizardPath: 'owners.0.name' },
    { extractedField: 'recordingDate', wizardPath: 'subjectData.lastSaleDate' },
    { extractedField: 'salePrice', wizardPath: 'subjectData.lastSalePrice' },
    { extractedField: 'legalDescription', wizardPath: 'subjectData.legalDescription' },
    { extractedField: 'propertyAddress', wizardPath: 'subjectData.address.street' },
    { extractedField: 'documentNumber', wizardPath: 'subjectData.deedDocumentNumber' },
    { extractedField: 'county', wizardPath: 'subjectData.address.county' },
    { extractedField: 'state', wizardPath: 'subjectData.address.state' },
  ],
  
  // NEW: FEMA Flood Zone Determination documents
  flood_map: [
    { extractedField: 'floodZone', wizardPath: 'subjectData.femaZone' },
    { extractedField: 'panelNumber', wizardPath: 'subjectData.femaPanelNumber' },
    { extractedField: 'effectiveDate', wizardPath: 'subjectData.femaMapDate' },
    { extractedField: 'communityNumber', wizardPath: 'subjectData.femaCommunityNumber' },
    { extractedField: 'propertyAddress', wizardPath: 'subjectData.address.street' },
    { extractedField: 'mapNumber', wizardPath: 'subjectData.femaMapNumber' },
    { extractedField: 'determination', wizardPath: 'subjectData.floodZoneDescription' },
  ],
  
  // NEW: Property Tax Assessment records
  tax_assessment: [
    { extractedField: 'taxId', wizardPath: 'subjectData.taxId' },
    { extractedField: 'assessedValue', wizardPath: 'subjectData.assessedValue' },
    { extractedField: 'taxYear', wizardPath: 'subjectData.taxYear' },
    { extractedField: 'annualTax', wizardPath: 'subjectData.annualPropertyTax' },
    { extractedField: 'landValue', wizardPath: 'subjectData.assessedLandValue' },
    { extractedField: 'improvementValue', wizardPath: 'subjectData.assessedImprovementValue' },
    { extractedField: 'owner', wizardPath: 'owners.0.name' },
    { extractedField: 'propertyAddress', wizardPath: 'subjectData.address.street' },
    { extractedField: 'propertyClass', wizardPath: 'subjectData.propertyClass' },
  ],
  
  unknown: [
    { extractedField: 'propertyAddress', wizardPath: 'subjectData.address.street' },
    { extractedField: 'owner', wizardPath: 'owners.0.name' },
    { extractedField: 'value', wizardPath: 'subjectData.lastSalePrice' },
    { extractedField: 'date', wizardPath: 'subjectData.lastSaleDate' },
  ],
};

/**
 * Get the wizard path for a given extracted field and document type.
 */
export function getWizardPath(documentType: DocumentType, extractedField: string): string | null {
  const mappings = DOCUMENT_FIELD_MAPPINGS[documentType] || DOCUMENT_FIELD_MAPPINGS.unknown;
  const mapping = mappings.find(m => m.extractedField === extractedField);
  return mapping?.wizardPath || null;
}

/**
 * Get all mappings for a document type.
 */
export function getMappingsForDocumentType(documentType: DocumentType): FieldMapping[] {
  return DOCUMENT_FIELD_MAPPINGS[documentType] || DOCUMENT_FIELD_MAPPINGS.unknown;
}

/**
 * High-priority fields that should be populated first.
 * These are the most commonly needed fields in appraisals.
 */
export const PRIORITY_FIELDS = [
  'subjectData.address.street',
  'subjectData.taxId',
  'subjectData.legalDescription',
  'subjectData.siteArea',
  'subjectData.appraisalPurpose',
  'subjectData.effectiveDate',
  'subjectData.lastSalePrice',
  'subjectData.lastSaleDate',
  'owners.0.name',
];

/**
 * Fields that should show document source indicators in the UI.
 * These are fields where knowing the source document is important for the appraiser.
 */
export const FIELDS_WITH_SOURCE_INDICATORS = [
  // Setup page
  'subjectData.address.street',
  'subjectData.address.city',
  'subjectData.address.state',
  'subjectData.address.zip',
  'subjectData.address.county',
  'subjectData.taxId',
  'subjectData.legalDescription',
  'subjectData.appraisalPurpose',
  'subjectData.effectiveDate',
  'subjectData.intendedUsers',
  
  // Subject Data - Site
  'subjectData.siteArea',
  'subjectData.zoningClass',
  'subjectData.zoningDescription',
  'subjectData.easements',
  'subjectData.femaZone',
  'subjectData.frontage',
  
  // Flood Map fields (NEW)
  'subjectData.femaPanelNumber',
  'subjectData.femaMapDate',
  'subjectData.femaCommunityNumber',
  'subjectData.femaMapNumber',
  'subjectData.floodZoneDescription',
  
  // Tax Assessment fields (NEW)
  'subjectData.assessedValue',
  'subjectData.taxYear',
  'subjectData.annualPropertyTax',
  'subjectData.assessedLandValue',
  'subjectData.assessedImprovementValue',
  'subjectData.propertyClass',
  
  // Deed fields (NEW)
  'subjectData.deedDocumentNumber',
  'transaction.seller',
  
  // Subject Data - Ownership
  'owners.0.name',
  
  // Transaction History
  'subjectData.lastSalePrice',
  'subjectData.lastSaleDate',
  
  // Income Approach
  'incomeApproachData.summary.potentialGrossIncome',
  'incomeApproachData.summary.effectiveGrossIncome',
  'incomeApproachData.summary.netOperatingIncome',
  'incomeApproachData.propertyMeta.occupancy',
];
