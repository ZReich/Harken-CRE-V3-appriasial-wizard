import Joi from 'joi';
import { dateFormatValidator } from '../../utils/common/helper';
import CompsEnum from '../../utils/enums/CompsEnum';
import { addScenarioSchema } from '../resEvaluationScenario/resEvaluationScenario.valiadations';
import { resZoningCompSchema } from '../resZoning/zonings.validation';
import { MapEnum, UploadEnum } from '../../utils/enums/DefaultEnum';
import { improvementSchema } from '../resEvaluationCostApproachImprovements/resEvaluationCostImprovement.validations';
import { extraCompAmenities } from '../resEvaluationSaleApproachCompAmenities/resEvalSaleCompAmenities.valiadations';

export const evaluationSaveScenarioSchema = Joi.object({
	client_id: Joi.number().required(),
	evaluation_type: Joi.string().required(),
	res_evaluation_scenarios: Joi.array().items(addScenarioSchema).min(1).required(),
});

export const appraisalAddClientSchema = Joi.object().keys({
	client_id: Joi.number().required(),
});

export const propertyDetailSchema = {
	property_id: Joi.number().optional().allow(null),
	property_name: Joi.string().required(),
	street_address: Joi.string().required(),
	street_suite: Joi.string().optional().allow('', null),
	city: Joi.string().required(),
	county: Joi.string().optional().allow('', null),
	state: Joi.string().required(),
	zipcode: Joi.string().required(),
	map_pin_lat: Joi.string().required(),
	map_pin_lng: Joi.string().required(),
	map_pin_zoom: Joi.number().optional().allow(null),
	latitude: Joi.string().optional().allow('', null),
	longitude: Joi.string().optional().allow('', null),
	google_place_id: Joi.string().optional().allow('', null),
	type: Joi.string().valid(CompsEnum.SALE, CompsEnum.NON_SALE).default(CompsEnum.SALE).required(),
	under_contract_price: Joi.number().optional().allow(null),
	close_date: dateFormatValidator.date().optional().allow(null, ''),
	last_transfer_date_known: Joi.string()
		.valid(CompsEnum.YES, CompsEnum.NO)
		.default(CompsEnum.YES)
		.required(),
	last_transferred_date: dateFormatValidator.date().optional().allow(null, ''),
	price: Joi.number().optional().allow(null),
	parcel_id_apn: Joi.string().optional().allow('', null),
	owner_of_record: Joi.string().optional().allow('', null),
	property_geocode: Joi.string().optional().allow('', null),
	property_legal: Joi.string().optional().allow('', null),
	property_rights: Joi.string().required(),
	property_rights_custom: Joi.string().when('property_rights', {
		is: CompsEnum.TYPE_MY_OWN,
		then: Joi.string().required(),
		otherwise: Joi.string().allow('', null),
	}),
	file_number: Joi.string().optional().allow('', null),
	intended_use: Joi.string().optional().allow('', null),
	intended_user: Joi.string().optional().allow('', null),
};

export const specificationsDetailsSchema = {
	res_zonings: Joi.array().items(resZoningCompSchema),
	land_size: Joi.number().when(CompsEnum.COMP_TYPE, {
		is: CompsEnum.LAND_ONLY,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	land_dimension: Joi.string().valid(CompsEnum.SF, CompsEnum.ACRE).default(CompsEnum.SF).required(),
	high_and_best_user: Joi.string().optional().allow('', null),
	most_likely_owner_user: Joi.string().optional().allow('', null),
	most_likely_owner_user_custom: Joi.string().optional().allow('', null),
	topography: Joi.string().optional().allow('', null),
	topography_custom: Joi.string().optional().allow('', null),
	lot_shape: Joi.string().optional().allow('', null),
	lot_shape_custom: Joi.string().optional().allow('', null),
	frontage: Joi.string().optional().allow('', null),
	frontage_custom: Joi.string().optional().allow('', null),
	front_feet: Joi.number().optional().allow(null),
	lot_depth: Joi.number().optional().allow(null),
	utilities_select: Joi.string().optional().allow('', null),
	utilities_select_custom: Joi.string().optional().allow('', null),
	included_utilities: Joi.array().optional(),
	summary: Joi.string().optional().allow('', null),
	condition: Joi.string().optional().allow('', null),
	condition_custom: Joi.string().optional().allow('', null),
	property_class: Joi.string().optional().allow(''),
	property_class_custom: Joi.string().optional().allow('', null),
	year_built: Joi.string().optional().allow('', null),
	year_remodeled: Joi.string().optional().allow('', null),
	no_stories: Joi.string().optional().allow('', null),
	height: Joi.number().optional().allow(null),
	main_structure_base: Joi.string().optional().allow('', null),
	main_structure_base_custom: Joi.string().optional().allow('', null),
	foundation: Joi.string().optional().allow('', null),
	foundation_custom: Joi.string().optional().allow(''),
	parking: Joi.string().optional().allow('', null),
	parking_custom: Joi.string().optional().allow('', null),
	basement: Joi.string().optional().allow('', null),
	basement_custom: Joi.string().optional().allow('', null),
	ada_compliance: Joi.string().optional().allow('', null),
	ada_compliance_custom: Joi.string().optional().allow('', null),
};

export const analysisDetailSchema = {
	date_of_analysis: dateFormatValidator.date().optional().allow(null, ''),
	effective_date: dateFormatValidator.date().optional().allow(null, ''),
	inspector_name: Joi.string().optional().allow('', null),
	report_date: dateFormatValidator.date().optional().allow(null, ''),
};

export const amenitiesDetailsSchema = {
	exterior: Joi.string().optional().allow('', null),
	exterior_custom: Joi.string().optional().allow('', null),
	roof: Joi.string().optional().allow('', null),
	roof_custom: Joi.string().optional().allow('', null),
	electrical: Joi.string().optional().allow('', null),
	electrical_custom: Joi.string().optional().allow('', null),
	plumbing: Joi.string().optional().allow('', null),
	plumbing_custom: Joi.string().optional().allow('', null),
	heating_cooling: Joi.string().optional().allow('', null),
	heating_cooling_custom: Joi.string().optional().allow('', null),
	windows: Joi.string().optional().allow('', null),
	windows_custom: Joi.string().optional().allow('', null),
	bedrooms: Joi.string().optional().allow('', null),
	bedrooms_custom: Joi.string().optional().allow('', null),
	bathrooms: Joi.string().optional().allow('', null),
	bathrooms_custom: Joi.string().optional().allow('', null),
	garage: Joi.string().optional().allow('', null),
	garage_custom: Joi.string().optional().allow('', null),
	fencing: Joi.string().optional().allow('', null),
	fencing_custom: Joi.string().optional().allow('', null),
	fireplace: Joi.string().optional().allow('', null),
	fireplace_custom: Joi.string().optional().allow('', null),
	res_evaluation_amenities: Joi.array().optional().allow('', null),
	other_amenities: Joi.string().optional().allow('', null),
};

export const zoningDetailsSchema = {
	zoning_type: Joi.string().optional().allow('', null),
	zoning_description: Joi.string().optional().allow('', null),
	conforming_use_determination: Joi.string().required(),
};

export const taxDetailsSchema = {
	land_assessment: Joi.number().optional().allow(null),
	structure_assessment: Joi.number().optional().allow(null),
	total_land_improvement: Joi.number().optional().allow(null),
	price_square_foot: Joi.number().required(),
	sids: Joi.string().optional().allow('', null),
	taxes_in_arrears: Joi.number().optional().allow(null),
	tax_liability: Joi.number().optional().allow(null),
	assessed_market_year: Joi.string().optional().allow('', null),
	tax_liability_year: Joi.string().optional().allow('', null),
};

export const additionalPropertyInfoSchema = {
	building_size: Joi.number().required(),
	position: Joi.string().optional().allow('', null),
	traffic_street_address: Joi.string().optional().allow('', null),
	traffic_count: Joi.string().optional().allow('', null),
	traffic_input: Joi.number().optional().allow('', null),
};

// Combine all schemas into one
export const evaluationCombinedSchema = Joi.object().keys({
	...propertyDetailSchema,
	...specificationsDetailsSchema,
	...analysisDetailSchema,
	...amenitiesDetailsSchema,
	...zoningDetailsSchema,
	...taxDetailsSchema,
	...additionalPropertyInfoSchema,
});

export const latLongSchema = Joi.object({
	lat: Joi.string().required(),
	long: Joi.string().required(),
});

export const mapBoundarySchema = Joi.object({
	position: Joi.string().optional().allow(null),
	map_image_url: Joi.string().optional().allow(null, ''),
	map_image_for_report_url: Joi.string().optional().allow(null, ''),
	latitude: Joi.string().optional().allow(null, ''),
	longitude: Joi.string().optional().allow(null, ''),
	map_selected_area: Joi.array().items(latLongSchema).optional().allow(null, ''),
	map_zoom: Joi.number().optional().allow(null, ''),
	boundary_map_type: Joi.string().optional().allow(null, ''),
});

export const aerialMapSchema = Joi.object({
	aerial_map_zoom: Joi.number().optional().allow(null, ''),
	aerial_map_type: Joi.string().allow(MapEnum.ROADMAP, MapEnum.HYBRID),
	map_center_lat: Joi.string().optional().allow(null, ''),
	map_center_lng: Joi.string().optional().allow(null, ''),
});

export const evalAreaInfoSchema = Joi.object({
	city_info: Joi.string().optional().allow(null, ''),
	county_info: Joi.string().optional().allow(null, ''),
	property_summary_sales_arrow: Joi.string().optional().allow(null, ''),
	property_summary_vacancy_arrow: Joi.string().optional().allow(null, ''),
	property_summary_net_absorption_arrow: Joi.string().optional().allow(null, ''),
	property_summary_construction_arrow: Joi.string().optional().allow(null, ''),
	property_summary_lease_rates_arrow: Joi.string().optional().allow(null, ''),
});

export const uploadImageSchema = Joi.object({
	field: Joi.string().required(),
	type: Joi.string().required().valid(UploadEnum.RES_EVALUATION),
	imageId: Joi.number().allow(null).optional(),
});

export const evaluationListSchema = Joi.object().keys({
	page: Joi.number().optional().allow(null),
	limit: Joi.number().optional().allow(null),
	search: Joi.string().optional().allow(null, ''),
	orderBy: Joi.string().optional().allow(null, ''),
	orderByColumn: Joi.string().optional().allow(null, ''),
	businessName: Joi.string().optional().allow(null, ''),
	compType: Joi.string().optional().allow(null, ''),
	state: Joi.string().optional().allow(null, ''),
	city: Joi.array().optional().allow(null),
	streetAddress: Joi.string().optional().allow(null, ''),
	dateOfAnalysisFrom: dateFormatValidator.date().optional().allow(null, ''),
	dateOfAnalysisTo: dateFormatValidator.date().optional().allow(null, ''),
});

export const advanceSearchSchema = Joi.object().keys({
	type: Joi.string().valid(CompsEnum.SALE, CompsEnum.LEASE).required(),
	state: Joi.string().optional().allow(null, ''),
	comp_type: Joi.string().optional().allow(null, ''),
	city: Joi.array().optional().allow(null),
	propertyType: Joi.string().optional().allow(null, ''),
	start_date: dateFormatValidator.date().optional().allow(null, ''),
	end_date: dateFormatValidator.date().optional().allow(null, ''),
	building_sf_min: Joi.number().optional().allow(null),
	building_sf_max: Joi.number().optional().allow(null),
	land_sf_min: Joi.number().optional().allow(null),
	land_sf_max: Joi.number().optional().allow(null),
	cap_rate_min: Joi.number().optional().allow(null),
	cap_rate_max: Joi.number().optional().allow(null),
	street_address: Joi.string().optional().allow(null, ''),
});
export const incomeApproachSourceSchema = {
	id: Joi.number().optional().allow(null),
	res_evaluation_income_approach_id: Joi.number().optional().allow(null),
	res_zoning_id: Joi.number().optional().allow(null),
	type: Joi.string().optional().allow(null, ''),
	space: Joi.string().optional().allow(null, ''),
	monthly_income: Joi.number().optional().allow(null),
	annual_income: Joi.number().optional().allow(null),
	rent_sq_ft: Joi.number().optional().allow(null),
	square_feet: Joi.number().optional().allow(null),
	comments: Joi.string().optional().allow(null, ''),
	link_overview: Joi.number().optional().default(0),
};

export const otherIncomeSourceSchema = {
	id: Joi.number().optional().allow(null),
	type: Joi.string().optional().allow(null, ''),
	monthly_income: Joi.number().optional().allow(null),
	annual_income: Joi.number().optional().allow(null),
	square_feet: Joi.number().optional().allow(null),
	comments: Joi.string().optional().allow(null, ''),
};

export const operatingExpenseSchema = {
	id: Joi.number().optional().allow(null),
	name: Joi.string().optional().allow(null, ''),
	annual_amount: Joi.number().optional().allow(null),
	percentage_of_gross: Joi.number().optional().allow(null),
	total_per_bed: Joi.number().optional().allow(null),
	total_per_unit: Joi.number().optional().allow(null),
	total_per_sq_ft: Joi.number().optional().allow(null),
	comments: Joi.string().optional().allow(null, ''),
};
export const resEvalIncomeApproachSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	res_evaluation_id: Joi.number().optional().allow(null),
	res_evaluation_scenario_id: Joi.number().optional().allow(null),
	weighted_market_value: Joi.number().optional().allow(null),
	eval_weight: Joi.number().optional().allow(null),
	income_source: Joi.string().optional().allow(null, ''),
	operating_expense: Joi.string().optional().allow(null, ''),
	net_income: Joi.string().optional().allow(null, ''),
	indicated_value_range: Joi.string().optional().allow(null, ''),
	indicated_value_psf: Joi.string().optional().allow(null, ''),
	incremental_value: Joi.number().optional().allow(null, ''),
	incremental_value_monthly: Joi.number().optional().allow(null),
	total: Joi.string().optional().allow(null, ''),
	vacancy: Joi.number().optional().allow(null),
	adjusted_gross_amount: Joi.number().optional().allow(null),
	vacant_amount: Joi.number().optional().allow(null),
	date_created: Joi.date().optional().allow(null),
	last_updated: Joi.date().optional().allow(null),
	monthly_capitalization_rate: Joi.number().optional().allow(null),
	annual_capitalization_rate: Joi.number().optional().allow(null),
	sq_ft_capitalization_rate: Joi.number().optional().allow(null),
	total_net_income: Joi.number().optional().allow(null),
	indicated_range_monthly: Joi.number().optional().allow(null),
	indicated_range_annual: Joi.number().optional().allow(null),
	indicated_range_sq_feet: Joi.number().optional().allow(null),
	indicated_psf_monthly: Joi.number().optional().allow(null),
	indicated_psf_annual: Joi.number().optional().allow(null),
	indicated_psf_sq_feet: Joi.number().optional().allow(null),
	total_monthly_income: Joi.number().optional().allow(null),
	total_annual_income: Joi.number().optional().allow(null),
	total_oe_annual_amount: Joi.number().optional().allow(null),
	total_oe_gross: Joi.number().optional().allow(null),
	total_sq_ft: Joi.number().optional().allow(null),
	total_rent_sq_ft: Joi.number().optional().allow(null),
	total_oe_per_square_feet: Joi.number().optional().allow(null),
	incomeSources: Joi.array().items(incomeApproachSourceSchema).optional().allow(null, ''),
	operatingExpenses: Joi.array().items(operatingExpenseSchema).optional().allow(null, ''),
	otherIncomeSources: Joi.array().items(otherIncomeSourceSchema).optional().allow(null, ''),
	income_notes: Joi.string().optional().allow(null, ''),
	expense_notes: Joi.string().optional().allow(null, ''),
	cap_rate_notes: Joi.string().optional().allow(null, ''),
	other_total_monthly_income: Joi.number().optional().allow(null),
	other_total_annual_income: Joi.number().optional().allow(null),
	other_total_sq_ft: Joi.number().optional().allow(null),
});

const subSaleAdjustmentsSchema = Joi.object({
	adj_key: Joi.string().optional().allow(null, ''),
	adj_value: Joi.number().required().default(0).allow(null, ''),
});
const subCostAdjustmentsSchema = Joi.object({
	adj_key: Joi.string().optional().allow(null, ''),
	adj_value: Joi.string().optional().allow(null, ''),
});

export const comparisonAttributeSchema = Joi.object({
	comparison_key: Joi.string().optional().allow(null, ''),
	comparison_value: Joi.string().optional().allow(null, ''),
});
const compsAdjustmentsSchema = Joi.object({
	adj_key: Joi.string().optional().allow(null, ''),
	adj_value: Joi.number().default(0).allow(null, ''),
});

const costCompSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	comp_id: Joi.number().required(),
	order: Joi.number().required(),
	total_adjustment: Joi.number().required(),
	adjusted_psf: Joi.number().optional().allow(null),
	weight: Joi.number().required(),
	comps_adjustments: Joi.array().items(compsAdjustmentsSchema).required(),
});
// Main cost approach save schema
export const evalCostApproachSchema = Joi.object({
	res_evaluation_id: Joi.number().required(),
	weighted_market_value: Joi.number().optional().allow(null),
	position: Joi.string().optional().allow(null),
	cost_approach: Joi.object({
		id: Joi.number().optional().allow(null),
		res_evaluation_scenario_id: Joi.number().required(),
		weight: Joi.number().optional().allow(null),
		land_value: Joi.number().optional().allow(null),
		averaged_adjusted_psf: Joi.number().optional().allow(null),
		incremental_value: Joi.number().optional().allow(null),
		notes: Joi.string().optional().allow(null),
		overall_replacement_cost: Joi.number().optional().allow(null),
		total_depreciation: Joi.number().optional().allow(null),
		total_depreciation_percentage: Joi.number().optional().allow(null),
		total_depreciated_cost: Joi.number().optional().allow(null),
		total_cost_valuation: Joi.number().optional().allow(null),
		indicated_value_psf: Joi.number().optional().allow(null),
		indicated_value_punit: Joi.number().optional().allow(null),
		improvements_total_adjusted_cost: Joi.number().optional().allow(null),
		improvements_total_adjusted_ppsf: Joi.number().optional().allow(null),
		improvements_total_depreciation: Joi.number().optional().allow(null),
		improvements_total_sf_area: Joi.number().optional().allow(null),
		cost_subject_property_adjustments: Joi.array()
			.items(subCostAdjustmentsSchema)
			.optional()
			.allow(null),
		comp_data: Joi.array().items(costCompSchema).optional().allow(null),
		comparison_attributes: Joi.array().items(comparisonAttributeSchema).optional().allow(null),
	}).required(),
});

export const saveCostImprovementSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	res_evaluation_id: Joi.number().required(),
	res_evaluation_scenario_id: Joi.number().required(),
	effective_age: Joi.number().optional().allow(null),
	overall_replacement_cost: Joi.number().optional().allow(null),
	total_depreciation: Joi.number().optional().allow(null),
	total_depreciation_percentage: Joi.number().optional().allow(null),
	total_depreciated_cost: Joi.number().optional().allow(null),
	total_cost_valuation: Joi.number().optional().allow(null),
	indicated_value_psf: Joi.number().optional().allow(null),
	cost_improvements: Joi.array().items(improvementSchema).optional().allow(null),
	improvements_total_sf_area: Joi.number().optional().allow(null),
	improvements_total_adjusted_ppsf: Joi.number().optional().allow(null),
	improvements_total_depreciation: Joi.number().optional().allow(null),
	improvements_total_adjusted_cost: Joi.number().optional().allow(null),
	comments: Joi.string().optional().allow(null, ''),
	weighted_market_value: Joi.number().optional().allow(null, ''),
	incremental_value: Joi.number().optional().allow(null, ''),
});

export const saveAreaMapSchema = Joi.object({
	area_map_zoom: Joi.number().required(),
	map_type: Joi.string().required(),
	map_center_lat: Joi.string().optional().allow(null, ''),
	map_center_lng: Joi.string().optional().allow(null, ''),
});
export const getSelectedCompSchema = Joi.object().keys({
	compIds: Joi.array().required(),
});

export const evaluationPositionSchema = Joi.object({
	position: Joi.string().optional().allow(null),
});
export const positionSchema = Joi.object({
	id: Joi.number().required(),
	order: Joi.number().required(),
});
export const updateExhibitPositionSchema = Joi.object({
	exhibits: Joi.array().items(positionSchema).optional().allow(null),
});

const subQualitativeAdjSchema = Joi.object({
	adj_key: Joi.string().optional().allow(null, ''),
	adj_value: Joi.string().optional().allow(null, ''),
	subject_property_value: Joi.string().optional().allow(''),
});
const compsQualitativeCompsSchema = Joi.object({
	adj_key: Joi.string().optional().allow(null, ''),
	adj_value: Joi.string().optional().allow(null, ''),
});
const compSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	comp_id: Joi.number().required(),
	order: Joi.number().required(),
	adjustment_note: Joi.string().optional().allow(null, ''),
	total_adjustment: Joi.number().optional().allow(null),
	adjusted_psf: Joi.number().optional().allow(null),
	weight: Joi.number().optional().allow(null),
	blended_adjusted_psf: Joi.number().optional().allow(null),
	averaged_adjusted_psf: Joi.number().optional().allow(null),
	comps_adjustments: Joi.array().items(compsAdjustmentsSchema).optional().allow(null),
	comps_qualitative_adjustments: Joi.array()
		.items(compsQualitativeCompsSchema)
		.optional()
		.allow(null),
	extra_amenities: Joi.array().items(extraCompAmenities).optional().allow(null),
	overall_comparability: Joi.string().optional().allow(null, ''),
});
export const saveSalesApproachSchema = Joi.object({
	res_evaluation_id: Joi.number().required(),
	weighted_market_value: Joi.number().optional().allow(null),
	sales_approach: Joi.object({
		id: Joi.number().optional().allow(null),
		res_evaluation_scenario_id: Joi.number().required(),
		weight: Joi.number().required(),
		incremental_value: Joi.number().optional().allow(null),
		averaged_adjusted_psf: Joi.number().optional().allow(null),
		sales_approach_value: Joi.number().optional().allow(null),
		total_comp_adj: Joi.number().optional().allow(null),
		sales_approach_indicated_val: Joi.number().optional().allow(null),
		note: Joi.string().optional().allow(null, ''),
		sales_comparison_attributes: Joi.array()
			.items(comparisonAttributeSchema)
			.optional()
			.allow(null),
		subject_property_adj: Joi.array().items(subSaleAdjustmentsSchema).optional().allow(null),
		subject_qualitative_adjustments: Joi.array()
			.items(subQualitativeAdjSchema)
			.optional()
			.allow(null),
		comp_data: Joi.array().items(compSchema).optional().allow(null),
	}).required(),
});

export const SaveApproachPercentSchema = Joi.object({
	approach_id: Joi.number().required(),
	approach_type: Joi.string().required(),
	eval_weight: Joi.number().required(),
});

export const SaveReviewSchema = Joi.object({
	res_evaluation_scenario_id: Joi.number().optional().allow(null),
	approach_id: Joi.number().optional().allow(null),
	eval_weight: Joi.number().optional().allow(null),
	approach: Joi.string().optional().allow(null, ''),
	incremental_value: Joi.number().optional().allow(null),
	weighted_market_value: Joi.number().optional().allow(null),
	review_summary: Joi.string().optional().allow(null, ''),
	rounding: Joi.number().optional().allow(null, ''),
	reviewed_by: Joi.number().optional().allow(null),
	review_date: Joi.date().optional().allow(null),
});
