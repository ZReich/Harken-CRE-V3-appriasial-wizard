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
  
  // =================================================================
  // COST SEGREGATION SPECIFIC MAPPINGS
  // =================================================================
  
  // System refinements
  'costseg_electrical': ['int_electrical', 'int_mechanical', 'int_office', 'ext_roof'],
  'costseg_electrical_panels': ['int_electrical', 'int_mechanical'],
  'costseg_electrical_circuits': ['int_electrical', 'int_ceiling', 'int_office'],
  'costseg_electrical_dedicated': ['int_electrical', 'int_server', 'int_mechanical'],
  'costseg_hvac': ['int_mechanical', 'int_hvac', 'ext_roof'],
  'costseg_hvac_units': ['ext_roof', 'int_mechanical'],
  'costseg_hvac_ductwork': ['int_mechanical', 'int_ceiling', 'int_warehouse'],
  'costseg_hvac_controls': ['int_mechanical', 'int_office'],
  'costseg_plumbing': ['int_plumbing', 'int_bathroom', 'int_kitchen', 'int_mechanical'],
  'costseg_plumbing_fixtures': ['int_bathroom', 'int_kitchen'],
  'costseg_plumbing_pipes': ['int_mechanical', 'int_bathroom'],
  'costseg_fire_protection': ['int_mechanical', 'int_ceiling', 'int_warehouse'],
  
  // Personal property (5/7-year)
  'costseg_personal_property': ['int_office', 'int_conference', 'int_lobby', 'int_shop'],
  'costseg_movable_partitions': ['int_office', 'int_conference'],
  'costseg_window_treatments': ['int_office', 'int_conference', 'int_lobby'],
  'costseg_decorative_fixtures': ['int_lobby', 'int_office', 'int_conference'],
  'costseg_specialty_lighting': ['int_office', 'int_shop', 'int_warehouse'],
  'costseg_carpeting': ['int_office', 'int_conference', 'int_lobby'],
  'costseg_equipment': ['int_mechanical', 'int_server', 'int_kitchen'],
  'costseg_security_systems': ['int_lobby', 'int_office', 'ext_front'],
  'costseg_av_systems': ['int_conference', 'int_lobby'],
  
  // Land improvements (15-year)
  'costseg_land_improvements': ['site_parking', 'site_landscape', 'site_yard_n', 'site_yard_s'],
  'costseg_parking_striping': ['site_parking'],
  'costseg_parking_lighting': ['site_parking'],
  'costseg_landscaping': ['site_landscape', 'site_yard_n', 'site_yard_s', 'site_yard_e', 'site_yard_w'],
  'costseg_site_lighting': ['site_parking', 'ext_front'],
  'costseg_site_fencing': ['site_yard_n', 'site_yard_s', 'site_yard_e', 'site_yard_w'],
  'costseg_site_signage': ['ext_front', 'site_parking'],
  'costseg_site_utilities': ['site_yard_n', 'site_parking', 'ext_front'],
  
  // Tenant improvements
  'costseg_tenant_improvements': ['int_office', 'int_conference', 'int_bathroom', 'int_kitchen'],
  'costseg_demising_walls': ['int_office', 'int_conference'],
  'costseg_specialized_finishes': ['int_office', 'int_conference', 'int_lobby'],
  
  // Measurement documentation
  'costseg_measurements': ['int_mechanical', 'int_electrical', 'int_plumbing', 'site_parking'],
  'costseg_conduit_runs': ['int_electrical', 'int_ceiling', 'int_mechanical'],
  'costseg_piping_runs': ['int_plumbing', 'int_mechanical'],
  'costseg_ductwork_runs': ['int_hvac', 'int_ceiling', 'int_mechanical'],
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
  
  // Cost Segregation
  'costseg_electrical': 'Electrical System (Cost Seg)',
  'costseg_electrical_panels': 'Electrical Panels',
  'costseg_electrical_circuits': 'Electrical Circuits',
  'costseg_electrical_dedicated': 'Dedicated Equipment Circuits',
  'costseg_hvac': 'HVAC System (Cost Seg)',
  'costseg_hvac_units': 'HVAC Units',
  'costseg_hvac_ductwork': 'HVAC Ductwork',
  'costseg_hvac_controls': 'HVAC Controls',
  'costseg_plumbing': 'Plumbing System (Cost Seg)',
  'costseg_plumbing_fixtures': 'Plumbing Fixtures',
  'costseg_plumbing_pipes': 'Plumbing Pipes',
  'costseg_fire_protection': 'Fire Protection System',
  'costseg_personal_property': 'Personal Property (5/7-Year)',
  'costseg_movable_partitions': 'Movable Partitions',
  'costseg_window_treatments': 'Window Treatments',
  'costseg_decorative_fixtures': 'Decorative Fixtures',
  'costseg_specialty_lighting': 'Specialty Lighting',
  'costseg_carpeting': 'Carpeting',
  'costseg_equipment': 'Equipment',
  'costseg_security_systems': 'Security Systems',
  'costseg_av_systems': 'Audio/Visual Systems',
  'costseg_land_improvements': 'Land Improvements (15-Year)',
  'costseg_parking_striping': 'Parking Striping',
  'costseg_parking_lighting': 'Parking Lighting',
  'costseg_landscaping': 'Landscaping',
  'costseg_site_lighting': 'Site Lighting',
  'costseg_site_fencing': 'Site Fencing',
  'costseg_site_signage': 'Site Signage',
  'costseg_site_utilities': 'Site Utilities',
  'costseg_tenant_improvements': 'Tenant Improvements',
  'costseg_demising_walls': 'Demising Walls',
  'costseg_specialized_finishes': 'Specialized Finishes',
  'costseg_measurements': 'Measurement Documentation',
  'costseg_conduit_runs': 'Conduit Runs',
  'costseg_piping_runs': 'Piping Runs',
  'costseg_ductwork_runs': 'Ductwork Runs',
};

/**
 * Get human-readable label for a section ID.
 */
export function formatSectionName(sectionId: string): string {
  return SECTION_LABELS[sectionId] || sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
