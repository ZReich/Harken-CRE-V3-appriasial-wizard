/**
 * Template-specific enums for report template configuration
 * These enums align with existing codebase fields (comp_type, type, etc.)
 * but provide standardization at the template level
 */

export enum ReportTypeEnum {
	APPRAISAL = 'appraisal',
	EVALUATION = 'evaluation',
}

export enum PropertyCategoryEnum {
	COMMERCIAL = 'commercial',
	RESIDENTIAL = 'residential',
	INDUSTRIAL = 'industrial',
	SPECIAL_PURPOSE = 'special_purpose',
}

/**
 * Maps to existing comp_type field in appraisals/evaluations
 * BUILD NOTE: This is NOT new - it already exists in the codebase
 * We're just standardizing it at the template level
 */
export enum CompositionTypeEnum {
	BUILDING_WITH_LAND = 'building_with_land',
	LAND_ONLY = 'land_only',
}

/**
 * USPAP-compliant scenario types
 * BUILD NOTE: Adds standardization to existing freeform scenario.name field
 * Maintains backward compatibility - existing scenarios use 'name' field as-is
 */
export enum ScenarioTypeEnum {
	AS_IS = 'as_is',
	AS_COMPLETED = 'as_completed',
	AS_STABILIZED = 'as_stabilized',
	AS_RENOVATED = 'as_renovated',
	PROSPECTIVE = 'prospective',
	RETROSPECTIVE = 'retrospective',
	HYPOTHETICAL = 'hypothetical',
	PROPOSED = 'proposed',
	CUSTOM = 'custom',
}

export const ScenarioTypeLabels: Record<ScenarioTypeEnum, string> = {
	[ScenarioTypeEnum.AS_IS]: 'As-Is (Current Condition)',
	[ScenarioTypeEnum.AS_COMPLETED]: 'As-Completed (After Construction)',
	[ScenarioTypeEnum.AS_STABILIZED]: 'As-Stabilized (After Stabilization)',
	[ScenarioTypeEnum.AS_RENOVATED]: 'As-Renovated (After Improvements)',
	[ScenarioTypeEnum.PROSPECTIVE]: 'Prospective Value',
	[ScenarioTypeEnum.RETROSPECTIVE]: 'Retrospective Value',
	[ScenarioTypeEnum.HYPOTHETICAL]: 'Hypothetical Condition',
	[ScenarioTypeEnum.PROPOSED]: 'Proposed Development',
	[ScenarioTypeEnum.CUSTOM]: 'Custom Scenario',
};

export enum ScenarioPresetEnum {
	SINGLE = 'single',
	DUAL = 'dual',
	TRIPLE = 'triple',
	CUSTOM = 'custom',
}

/**
 * Maps to existing analysis_type and comparison_basis fields
 * BUILD NOTE: These already exist in the codebase
 */
export enum AnalysisTypeEnum {
	PRICE_PER_SF = 'price_per_sf',
	PRICE_PER_ACRE = 'price_per_acre',
	PRICE_PER_UNIT = 'price_per_unit',
	PRICE_PER_BED = 'price_per_bed',
}

/**
 * Configuration keys for template_configuration table
 */
export enum TemplateConfigKeyEnum {
	ENABLED_APPROACHES = 'enabled_approaches',
	DEFAULT_WEIGHTS = 'default_weights',
	ANALYSIS_TYPES = 'analysis_types',
	FIELD_VISIBILITY_RULES = 'field_visibility_rules',
	COMPARISON_ATTRIBUTES = 'comparison_attributes',
	LAND_FIELD_REQUIREMENTS = 'land_field_requirements',
}

export default {
	ReportTypeEnum,
	PropertyCategoryEnum,
	CompositionTypeEnum,
	ScenarioTypeEnum,
	ScenarioTypeLabels,
	ScenarioPresetEnum,
	AnalysisTypeEnum,
	TemplateConfigKeyEnum,
};













