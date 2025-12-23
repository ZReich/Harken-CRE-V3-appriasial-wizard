// Sales Comparison Approach - Feature Module
export { SalesGrid } from './components/SalesGrid';
export { PropertyCard } from './components/PropertyCard';
export { RichTextEditor } from './components/RichTextEditor';
export { PriceChart } from './components/PriceChart';
export { 
  PROPERTIES, 
  MOCK_VALUES, 
  INITIAL_ROWS, 
  SECTIONS
} from './constants';
export type { Property, PropertyValues, GridRowData, ComparisonValue, Section } from './types';

// Re-export element filter utilities for use by other grids
export { getAvailableElements, normalizeSection, normalizeApproach } from '../../utils/elementFilter';
export { ELEMENT_REGISTRY } from '../../constants/elementRegistry';
export type { ElementDefinition, SectionType, ApproachType } from '../../constants/elementRegistry';
