/**
 * Cotality (CoreLogic) Field Mapping Configuration
 * 
 * Maps Cotality API response fields to wizard state paths.
 * Used to auto-populate wizard fields from Cotality property data.
 */

export interface CotalityFieldMapping {
  cotalityField: string;
  wizardPath: string;
  transform?: (value: any) => string;
  confidence: number;
}

/**
 * Field mappings from Cotality API to wizard paths.
 * Based on the Harken backend buildPropertyDetails function.
 */
export const COTALITY_FIELD_MAPPINGS: CotalityFieldMapping[] = [
  // Address fields
  { cotalityField: 'streetAddress', wizardPath: 'subjectData.address.street', confidence: 0.95 },
  { cotalityField: 'city', wizardPath: 'subjectData.address.city', confidence: 0.95 },
  { cotalityField: 'stateCode', wizardPath: 'subjectData.address.state', confidence: 0.95 },
  { cotalityField: 'zipCode', wizardPath: 'subjectData.address.zip', confidence: 0.95 },
  { cotalityField: 'countyName', wizardPath: 'subjectData.address.county', confidence: 0.95 },
  
  // Property identifiers
  { cotalityField: 'apn', wizardPath: 'subjectData.taxId', confidence: 0.95 },
  { cotalityField: 'legalDescription', wizardPath: 'subjectData.legalDescription', confidence: 0.90 },
  
  // Building data
  { cotalityField: 'yearBuilt', wizardPath: 'improvementsInventory.parcels.0.buildings.0.yearBuilt', confidence: 0.90 },
  { cotalityField: 'buildingSize', wizardPath: 'subjectData.buildingSize', confidence: 0.85 },
  { cotalityField: 'bedrooms', wizardPath: 'subjectData.bedrooms', confidence: 0.90 },
  { cotalityField: 'bathrooms', wizardPath: 'subjectData.bathrooms', confidence: 0.90 },
  
  // Site data
  { cotalityField: 'siteArea', wizardPath: 'subjectData.siteArea', confidence: 0.90 },
  { cotalityField: 'zoningClass', wizardPath: 'subjectData.zoningClass', confidence: 0.85 },
  
  // Tax data
  { cotalityField: 'assessedLandValue', wizardPath: 'subjectData.cadastralData.assessedLandValue', confidence: 0.90 },
  { cotalityField: 'assessedImprovementValue', wizardPath: 'subjectData.cadastralData.assessedImprovementValue', confidence: 0.90 },
  { cotalityField: 'totalAssessedValue', wizardPath: 'subjectData.cadastralData.totalAssessedValue', confidence: 0.90 },
  
  // Ownership
  { cotalityField: 'ownerName', wizardPath: 'owners.0.name', confidence: 0.90 },
];

/**
 * Fields that can be populated from Cotality API.
 * Used to determine which fields to show "fetching from Cotality" spinner.
 */
export const COTALITY_POPULATABLE_FIELDS = COTALITY_FIELD_MAPPINGS.map(m => m.wizardPath);

/**
 * Get the Cotality mapping for a specific wizard path.
 */
export function getCotalityMapping(wizardPath: string): CotalityFieldMapping | undefined {
  return COTALITY_FIELD_MAPPINGS.find(m => m.wizardPath === wizardPath);
}

/**
 * Check if a field can be populated from Cotality.
 */
export function canPopulateFromCotality(wizardPath: string): boolean {
  return COTALITY_POPULATABLE_FIELDS.includes(wizardPath);
}
