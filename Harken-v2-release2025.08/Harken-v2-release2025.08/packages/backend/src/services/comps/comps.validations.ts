import Joi from 'joi';
import CompsEnum from '../../utils/enums/CompsEnum';
import { propertyUnitsSchema } from '../propertyUnits/properties.validations';
import { zoningCompSchema } from '../zonings/zonings.validation';
import { dateFormatValidator } from '../../utils/common/helper';

export const basicPropertyInfoSchema = {
	id: Joi.number().optional().allow(null),
	property_id: Joi.number().optional().allow(null),
	user_id: Joi.number().optional().allow(null),
	account_id: Joi.number().optional().allow(null),
	property_image_url: Joi.string().optional().allow('', null),
	street_address: Joi.string().required(),
	street_suite: Joi.string().optional().allow('', null),
	city: Joi.string().required(),
	county: Joi.string().optional().allow('', null),
	state: Joi.string().required(),
	zipcode: Joi.number().required(),
	map_pin_lat: Joi.string().required(),
	map_pin_lng: Joi.string().required(),
	map_pin_zoom: Joi.number().optional().allow(null),
	latitude: Joi.string().optional().allow('', null),
	longitude: Joi.string().optional().allow('', null),
	location_desc: Joi.string().optional().allow('', null),
	legal_desc: Joi.string().optional().allow('', null),
	comp_link: Joi.boolean().default(false).optional(),
};

export const propertyDetailsSchema = {
	type: Joi.string().valid(CompsEnum.SALE, CompsEnum.LEASE).required(),
	comp_type: Joi.string().valid(CompsEnum.BUILDING_WITH_LAND, CompsEnum.LAND_ONLY).required(),
	date_sold: dateFormatValidator.date().required(),
	land_dimension: Joi.string().required(),
	price_square_foot: Joi.number().when(CompsEnum.COMP_TYPE, {
		is: CompsEnum.BUILDING_WITH_LAND,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	sale_price: Joi.number().when(CompsEnum.TYPE, {
		is: CompsEnum.SALE,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	lease_rate: Joi.number().when(CompsEnum.TYPE, {
		is: CompsEnum.LEASE,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	building_size: Joi.number().when(CompsEnum.COMP_TYPE, {
		is: CompsEnum.BUILDING_WITH_LAND,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	land_size: Joi.number().when(CompsEnum.COMP_TYPE, {
		is: CompsEnum.LAND_ONLY,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	land_type: Joi.string().when(CompsEnum.COMP_TYPE, {
		is: CompsEnum.LAND_ONLY,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	land_type_custom: Joi.string().optional().allow('', null),
	lease_type: Joi.string().when(CompsEnum.TYPE, {
		is: CompsEnum.LEASE,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	lease_rate_unit: Joi.string().when(CompsEnum.TYPE, {
		is: CompsEnum.LEASE,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	comparison_basis: Joi.string().when(CompsEnum.COMP_TYPE, {
		is: CompsEnum.BUILDING_WITH_LAND,
		then: Joi.valid(CompsEnum.SF, CompsEnum.UNIT, CompsEnum.BED).required(),
		otherwise: Joi.optional().allow(null),
	}),
	zoning_type: Joi.string().optional().allow('', null),
	summary: Joi.string().optional().allow('', null),
	parcel_id_apn: Joi.string().optional().allow('', null),
	occupancy: Joi.string().optional().allow('', null),
};

export const offerorInfoSchema = {
	offeror_type: Joi.string().optional().allow('', null),
	offeror_id: Joi.number()
		.optional()
		.allow(null)
		.when(CompsEnum.OFFEROR_TYPE, {
			is: Joi.string().valid(null, ''),
			then: Joi.valid(null),
			otherwise: Joi.number().optional().allow(null),
		}),
};

export const acquirerInfoSchema = {
	acquirer_type: Joi.string().optional().allow('', null),
	acquirer_id: Joi.number()
		.optional()
		.allow(null)
		.when(CompsEnum.ACQUIRER_TYPE, {
			is: Joi.string().valid(null, ''),
			then: Joi.valid(null),
			otherwise: Joi.number().optional().allow(null),
		}),
};

export const buildingInfoSchema = {
	zonings: Joi.array().items(zoningCompSchema),
	property_units: Joi.array().items(propertyUnitsSchema),
	year_built: Joi.string().optional().allow('', null),
	year_remodeled: Joi.string().optional().allow('', null),
	condition: Joi.string().required(),
	condition_custom: Joi.string().optional().allow('', null),
	construction_class: Joi.string().optional().allow('', null),
	stories: Joi.string().optional().allow('', null),
	gross_building_area: Joi.number().optional().allow(null),
	net_building_area: Joi.number().optional().allow(null),
	effective_age: Joi.string().optional().allow('', null),
	building_comments: Joi.string().optional().allow('', null),
	parking: Joi.string().optional().allow('', null),
	parking_custom: Joi.string().optional().allow('', null),
};

export const siteInfoSchema = {
	topography: Joi.string().optional().allow('', null),
	topography_custom: Joi.string().optional().allow('', null),
	lot_shape: Joi.string().optional().allow('', null),
	lot_shape_custom: Joi.string().optional().allow('', null),
	frontage: Joi.string().optional().allow('', null),
	frontage_custom: Joi.string().optional().allow('', null),
	site_access: Joi.string().optional().allow('', null),
	utilities_select: Joi.string().optional().allow('', null),
	utilities_select_custom: Joi.string().optional().allow('', null),
	included_utilities: Joi.array().optional(),
	other_include_utilities: Joi.string().optional().allow('', null),
	site_comments: Joi.string().optional().allow('', null),
};

export const transactionInfoSchema = {
	sale_status: Joi.string().optional().allow('', null),
	net_operating_income: Joi.number().optional().allow(null),
	cap_rate: Joi.number().optional().allow(null),
	total_operating_expense: Joi.number().optional().allow(null),
	operating_expense_psf: Joi.number().optional().allow(null),
	list_price: Joi.number().optional().allow(null),
	date_list: dateFormatValidator.date().optional().allow(null, ''),
	days_on_market: Joi.number().optional().allow(null),
	total_concessions: Joi.number().optional().allow(null),
	financing: Joi.string().optional().allow('', null),
	marketing_time: Joi.string().optional().allow('', null),
	est_land_value: Joi.number().optional().allow(null),
	est_building_value: Joi.number().optional().allow(null),
	concessions: Joi.string().optional().allow('', null),
};

export const additionalPropertyInfoSchema = {
	property_class: Joi.string().optional().allow('', null),
	term: Joi.number().optional().allow(null),
	space: Joi.number().optional().allow(null),
	cam: Joi.number().optional().allow(null),
	date_execution: dateFormatValidator.date().optional().allow(null, ''),
	date_commencement: dateFormatValidator.date().optional().allow(null, ''),
	date_expiration: dateFormatValidator.date().optional().allow(null, ''),
	TI_allowance: Joi.number().optional().allow(null),
	TI_allowance_unit: Joi.string().optional().allow('', null),
	asking_rent: Joi.number().optional().allow(null),
	asking_rent_unit: Joi.string().optional().allow('', null),
	escalators: Joi.number().optional().allow(null),
	free_rent: Joi.number().optional().allow(null),
	lease_status: Joi.string().optional().allow('', null),
	private_comp: Joi.number().optional().allow(null),
	grantor: Joi.string().optional().allow('', null),
	grantee: Joi.string().optional().allow('', null),
	instrument: Joi.string().optional().allow('', null),
	confirmed_by: Joi.string().optional().allow('', null),
	confirmed_with: Joi.string().optional().allow('', null),
	site_coverage_percent: Joi.number().optional().allow(null),
};

// Combine all schemas into one
export const combinedSchema = Joi.object().keys({
	...basicPropertyInfoSchema,
	...propertyDetailsSchema,
	...offerorInfoSchema,
	...acquirerInfoSchema,
	...buildingInfoSchema,
	...siteInfoSchema,
	...transactionInfoSchema,
	...additionalPropertyInfoSchema,
});

export const compsListSchema = Joi.object().keys({
	type: Joi.valid(CompsEnum.SALE, CompsEnum.LEASE).required(),
	state: Joi.string().optional().allow(null, ''),
	city: Joi.array().optional().allow(null),
	propertyType: Joi.alternatives()
		.try(Joi.string(), Joi.array().items(Joi.string()))
		.optional()
		.allow(null, ''),
	start_date: dateFormatValidator.date().optional().allow(null, ''),
	end_date: dateFormatValidator.date().optional().allow(null, ''),
	building_sf_min: Joi.number().optional().allow(null),
	building_sf_max: Joi.number().optional().allow(null),
	land_sf_min: Joi.number().optional().allow(null),
	land_sf_max: Joi.number().optional().allow(null),
	cap_rate_min: Joi.number().optional().allow(null),
	cap_rate_max: Joi.number().optional().allow(null),
	page: Joi.number().optional().allow(null),
	limit: Joi.number().optional().allow(null),
	search: Joi.string().optional().allow(null, ''),
	orderBy: Joi.string().optional().allow(null, ''),
	orderByColumn: Joi.string().optional().allow(null, ''),
	street_address: Joi.string().optional().allow(null, ''),
	comparison_basis: Joi.string().optional().allow(null, ''),
	appraisal_land_dimension: Joi.string().optional().allow(null, ''),
	price_sf_max: Joi.number().optional().allow(null),
	price_sf_min: Joi.number().optional().allow(null),
	lease_type: Joi.string().optional().allow(null, ''),
	square_footage_max: Joi.number().optional().allow(null),
	square_footage_min: Joi.number().optional().allow(null),
	compStatus: Joi.string().optional().allow(null, ''),
	comp_type: Joi.string().optional().allow(null, ''),
	land_dimension: Joi.string().optional().allow(null, ''),
});

export const downloadCompSchema = Joi.object({
	comparison: Joi.valid(CompsEnum.AC, CompsEnum.SF).default(CompsEnum.SF).optional(),
	compIds: Joi.array().items().optional().allow(null),
});

export const mapBoundsSchema = Joi.object({
	bounds: Joi.object({
		north: Joi.number().required(),
		south: Joi.number().required(),
		east: Joi.number().required(),
		west: Joi.number().required(),
	}).required(),
	zoom: Joi.number().min(1).max(20).required(),
	center: Joi.object({
		lat: Joi.number(),
		lng: Joi.number(),
	}).optional(),
	filters: Joi.object({
		type: Joi.valid(CompsEnum.SALE, CompsEnum.LEASE).optional(),
		state: Joi.string().optional().allow(null, ''),
		city: Joi.array().optional().allow(null),
		propertyType: Joi.alternatives()
			.try(Joi.string(), Joi.array().items(Joi.string()))
			.optional()
			.allow(null, ''),
		start_date: dateFormatValidator.date().optional().allow(null, ''),
		end_date: dateFormatValidator.date().optional().allow(null, ''),
		building_sf_min: Joi.number().optional().allow(null),
		building_sf_max: Joi.number().optional().allow(null),
		land_sf_min: Joi.number().optional().allow(null),
		land_sf_max: Joi.number().optional().allow(null),
		cap_rate_min: Joi.number().optional().allow(null),
		cap_rate_max: Joi.number().optional().allow(null),
		page: Joi.number().optional().allow(null),
		limit: Joi.number().optional().allow(null),
		search: Joi.string().optional().allow(null, ''),
		orderBy: Joi.string().optional().allow(null, ''),
		orderByColumn: Joi.string().optional().allow(null, ''),
		street_address: Joi.string().optional().allow(null, ''),
		comparison_basis: Joi.string().optional().allow(null, ''),
		appraisal_land_dimension: Joi.string().optional().allow(null, ''),
		price_sf_max: Joi.number().optional().allow(null),
		price_sf_min: Joi.number().optional().allow(null),
		lease_type: Joi.string().optional().allow(null, ''),
		square_footage_max: Joi.number().optional().allow(null),
		square_footage_min: Joi.number().optional().allow(null),
		compStatus: Joi.string().optional().allow(null, ''),
		comp_type: Joi.string().optional().allow(null, ''),
		land_dimension: Joi.string().optional().allow(null, ''),
	}).optional(),
	limit: Joi.number().min(1).max(100).default(20).optional(),
	page: Joi.number().min(1).default(1).optional(),
});

export const clusterDetailsSchema = Joi.object({
	bounds: Joi.object({
		north: Joi.number().required(),
		south: Joi.number().required(),
		east: Joi.number().required(),
		west: Joi.number().required(),
	}).required(),
	zoom: Joi.number().min(1).max(20).required(),
	filters: Joi.object({
		type: Joi.valid(CompsEnum.SALE, CompsEnum.LEASE).optional(),
		state: Joi.string().optional().allow(null, ''),
		city: Joi.array().optional().allow(null),
		propertyType: Joi.alternatives()
			.try(Joi.string(), Joi.array().items(Joi.string()))
			.optional()
			.allow(null, ''),
		start_date: dateFormatValidator.date().optional().allow(null, ''),
		end_date: dateFormatValidator.date().optional().allow(null, ''),
		building_sf_min: Joi.number().optional().allow(null),
		building_sf_max: Joi.number().optional().allow(null),
		land_sf_min: Joi.number().optional().allow(null),
		land_sf_max: Joi.number().optional().allow(null),
		cap_rate_min: Joi.number().optional().allow(null),
		cap_rate_max: Joi.number().optional().allow(null),
		page: Joi.number().optional().allow(null),
		limit: Joi.number().optional().allow(null),
		search: Joi.string().optional().allow(null, ''),
		orderBy: Joi.string().optional().allow(null, ''),
		orderByColumn: Joi.string().optional().allow(null, ''),
		street_address: Joi.string().optional().allow(null, ''),
		comparison_basis: Joi.string().optional().allow(null, ''),
		appraisal_land_dimension: Joi.string().optional().allow(null, ''),
		price_sf_max: Joi.number().optional().allow(null),
		price_sf_min: Joi.number().optional().allow(null),
		lease_type: Joi.string().optional().allow(null, ''),
		square_footage_max: Joi.number().optional().allow(null),
		square_footage_min: Joi.number().optional().allow(null),
		compStatus: Joi.string().optional().allow(null, ''),
		comp_type: Joi.string().optional().allow(null, ''),
		land_dimension: Joi.string().optional().allow(null, ''),
	}).optional(),
	limit: Joi.number().min(1).max(100).default(20).optional(),
	page: Joi.number().min(1).default(1).optional(),
});

export const validateCompSchema = Joi.object({
	street_address: Joi.string().required().allow(null, ''),
	city: Joi.string().required().allow(null, ''),
	state: Joi.string().required().allow(null, ''),
	zipcode: Joi.string().optional().allow(null, ''),
	latitude: Joi.number().optional().allow(null, ''),
	longitude: Joi.number().optional().allow(null, ''),
	google_place_id: Joi.string().optional().allow(null, ''),
	date_sold: dateFormatValidator.date().optional().allow(null, ''),
});
