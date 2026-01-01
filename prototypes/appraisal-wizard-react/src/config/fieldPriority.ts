/**
 * Field Priority Configuration
 * 
 * Defines the priority order for data sources for each field type.
 * 
 * Priority Order:
 * 1. Document Upload - User Accept/Reject UI
 * 2. Montana GIS - Auto-apply (free, for Montana properties)
 * 3. Cotality API - Auto-apply (paid, for all properties)
 * 4. Manual Entry - User types it themselves
 */

import { DOCUMENT_FIELD_MAPPINGS, type DocumentType } from './documentFieldMappings';
import { COTALITY_POPULATABLE_FIELDS } from './cotalityFieldMapping';

export type DataSource = 'document' | 'montana_gis' | 'cotality' | 'manual';

export interface FieldPriorityConfig {
  wizardPath: string;
  availableSources: DataSource[];
  defaultSource: DataSource;
}

/**
 * Fields that can be populated from documents.
 */
const DOCUMENT_POPULATABLE_FIELDS = new Set<string>();
Object.values(DOCUMENT_FIELD_MAPPINGS).forEach((mappings) => {
  mappings.forEach((m) => {
    DOCUMENT_POPULATABLE_FIELDS.add(m.wizardPath);
  });
});

/**
 * Fields that can be populated from Montana GIS.
 * These are the same as cadastral service fields.
 */
export const MONTANA_GIS_POPULATABLE_FIELDS = [
  'subjectData.address.street',
  'subjectData.address.city',
  'subjectData.address.state',
  'subjectData.address.zip',
  'subjectData.address.county',
  'subjectData.taxId',
  'subjectData.legalDescription',
  'subjectData.siteArea',
  'subjectData.zoningClass',
  'owners.0.name',
  'subjectData.cadastralData.assessedLandValue',
  'subjectData.cadastralData.assessedImprovementValue',
  'subjectData.cadastralData.totalAssessedValue',
];

/**
 * Get available data sources for a field.
 */
export function getAvailableSources(wizardPath: string): DataSource[] {
  const sources: DataSource[] = [];

  if (DOCUMENT_POPULATABLE_FIELDS.has(wizardPath)) {
    sources.push('document');
  }

  if (MONTANA_GIS_POPULATABLE_FIELDS.includes(wizardPath)) {
    sources.push('montana_gis');
  }

  if (COTALITY_POPULATABLE_FIELDS.includes(wizardPath)) {
    sources.push('cotality');
  }

  sources.push('manual');

  return sources;
}

/**
 * Get the next fallback source after a rejection.
 * 
 * @param currentSource - The source that was just rejected
 * @param wizardPath - The field path
 * @param isMontanaProperty - Whether the property is in Montana
 * @returns The next source to try, or null if all sources exhausted
 */
export function getNextFallbackSource(
  currentSource: DataSource,
  wizardPath: string,
  isMontanaProperty: boolean
): DataSource | null {
  const availableSources = getAvailableSources(wizardPath);

  // Priority order (document already handled by Accept/Reject UI)
  const priorityOrder: DataSource[] = isMontanaProperty
    ? ['montana_gis', 'cotality', 'manual']
    : ['cotality', 'manual'];

  // Find the current source in priority order and get the next one
  const currentIndex = priorityOrder.indexOf(currentSource);
  
  if (currentIndex === -1) {
    // Current source is document, start with first API
    return priorityOrder[0];
  }

  // Get the next available source
  for (let i = currentIndex + 1; i < priorityOrder.length; i++) {
    if (availableSources.includes(priorityOrder[i])) {
      return priorityOrder[i];
    }
  }

  return null; // All sources exhausted
}

/**
 * Check if a field should show Accept/Reject UI for document data.
 * Document data always shows Accept/Reject.
 */
export function shouldShowAcceptReject(source: DataSource): boolean {
  return source === 'document';
}

/**
 * Check if a field should auto-apply from an API source.
 * API data (Montana GIS, Cotality) is auto-applied without Accept/Reject.
 */
export function shouldAutoApply(source: DataSource): boolean {
  return source === 'montana_gis' || source === 'cotality';
}

/**
 * Get the display label for a data source.
 */
export function getSourceLabel(source: DataSource): string {
  const labels: Record<DataSource, string> = {
    document: 'Document Upload',
    montana_gis: 'Montana GIS',
    cotality: 'Cotality API',
    manual: 'Manual Entry',
  };
  return labels[source] || source;
}
