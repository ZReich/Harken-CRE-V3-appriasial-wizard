/**
 * Photo Categories and Section Mapping
 * 
 * Maps editing sections to relevant photo categories for the auto-context
 * PhotoReferencePanel feature.
 */

/**
 * Maps section identifiers to arrays of photo slot ID prefixes.
 * Used to auto-filter photos shown when editing specific sections.
 */
export const SECTION_PHOTO_MAPPING: Record<string, string[]> = {
  // Exterior Features section
  'exterior_features': ['ext_front', 'ext_rear', 'ext_side_1', 'ext_side_2', 'ext_additional_1', 'ext_additional_2'],
  'exterior_foundation': ['ext_front', 'ext_rear', 'ext_side_1', 'ext_side_2'],
  'exterior_walls': ['ext_front', 'ext_rear', 'ext_side_1', 'ext_side_2', 'ext_additional_1', 'ext_additional_2'],
  'exterior_windows': ['ext_front', 'ext_rear', 'ext_side_1', 'ext_side_2'],
  
  // Roofing section
  'roofing': ['ext_roof', 'ext_additional_1', 'ext_additional_2', 'ext_front'],
  'exterior_roof': ['ext_roof', 'ext_additional_1', 'ext_additional_2'],
  
  // Mechanical systems
  'mechanical_hvac': ['int_mechanical', 'int_hvac', 'ext_roof'],
  'mechanical_electrical': ['int_electrical', 'int_mechanical'],
  'mechanical_plumbing': ['int_plumbing', 'int_bathroom'],
  'mechanical_heating': ['int_mechanical', 'int_hvac'],
  'mechanical_cooling': ['int_mechanical', 'int_hvac', 'ext_roof'],
  'mechanical_sprinkler': ['int_mechanical'],
  'mechanical_elevators': ['int_lobby', 'int_mechanical'],
  
  // Interior finishes
  'interior_finishes': ['int_office', 'int_lobby', 'int_conference', 'int_shop', 'int_bathroom', 'int_kitchen', 'int_mezzanine'],
  'interior_ceilings': ['int_office', 'int_lobby', 'int_conference', 'int_shop'],
  'interior_flooring': ['int_office', 'int_lobby', 'int_conference', 'int_shop', 'int_bathroom'],
  'interior_walls': ['int_office', 'int_lobby', 'int_conference', 'int_bathroom'],
  'interior_lighting': ['int_office', 'int_lobby', 'int_conference', 'int_shop', 'int_warehouse'],
  
  // Site improvements
  'site_improvements': ['site_parking', 'site_yard_n', 'site_yard_s', 'site_yard_e', 'site_yard_w'],
  'site_paving': ['site_parking'],
  'site_fencing': ['site_yard_n', 'site_yard_s', 'site_yard_e', 'site_yard_w'],
  'site_lighting': ['site_parking'],
  'site_landscaping': ['site_landscape', 'site_yard_n', 'site_yard_s'],
  'landscaping': ['site_landscape', 'site_yard_n', 'site_yard_s', 'site_yard_e', 'site_yard_w'],
  
  // Street scenes
  'street_scenes': ['street_east', 'street_west'],
  
  // General sections
  'exterior': ['ext_front', 'ext_rear', 'ext_side_1', 'ext_side_2', 'ext_additional_1', 'ext_additional_2', 'ext_roof'],
  'interior': ['int_lobby', 'int_office', 'int_conference', 'int_shop', 'int_bathroom', 'int_mechanical', 'int_mezzanine', 'int_kitchen'],
  'site': ['site_parking', 'site_yard_n', 'site_yard_s', 'site_yard_e', 'site_yard_w'],
};

/**
 * Human-readable labels for section names.
 */
export const SECTION_LABELS: Record<string, string> = {
  'exterior_features': 'Exterior Features',
  'exterior_foundation': 'Foundation',
  'exterior_walls': 'Exterior Walls',
  'exterior_windows': 'Windows & Doors',
  'exterior_roof': 'Roofing',
  'roofing': 'Roofing',
  'mechanical_hvac': 'HVAC Systems',
  'mechanical_electrical': 'Electrical Systems',
  'mechanical_plumbing': 'Plumbing',
  'mechanical_heating': 'Heating',
  'mechanical_cooling': 'Cooling',
  'mechanical_sprinkler': 'Fire Sprinkler',
  'mechanical_elevators': 'Elevators',
  'interior_finishes': 'Interior Finishes',
  'interior_ceilings': 'Ceilings',
  'interior_flooring': 'Flooring',
  'interior_walls': 'Interior Walls',
  'interior_lighting': 'Lighting',
  'site_improvements': 'Site Improvements',
  'site_paving': 'Paving',
  'site_fencing': 'Fencing',
  'site_lighting': 'Site Lighting',
  'site_landscaping': 'Landscaping',
  'landscaping': 'Landscaping',
  'street_scenes': 'Street Scenes',
  'exterior': 'Exterior',
  'interior': 'Interior',
  'site': 'Site',
};

/**
 * Get human-readable label for a section ID.
 */
export function formatSectionName(sectionId: string): string {
  return SECTION_LABELS[sectionId] || sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
