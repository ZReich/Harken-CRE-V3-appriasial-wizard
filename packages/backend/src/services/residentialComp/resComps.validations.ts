import Joi from 'joi';
import CompsEnum from '../../utils/enums/CompsEnum';
import { resZoningCompSchema } from '../resZoning/zonings.validation';
import { dateFormatValidator } from '../../utils/common/helper';

export const loacationInfoSchema = {
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
	comp_link: Joi.boolean().default(false).optional(),
};

export const propertyDetailsSchema = {
	summary: Joi.string().optional().allow('', null),
	zonings: Joi.array().items(resZoningCompSchema),
	building_size: Joi.number().required(),
	land_size: Joi.number().optional().allow(null),
	land_dimension: Joi.string().required(),
	topography: Joi.string().optional().allow('', null),
	topography_custom: Joi.string().optional().allow('', null),
	lot_shape: Joi.string().optional().allow('', null),
	lot_shape_custom: Joi.string().optional().allow('', null),
	frontage: Joi.string().optional().allow('', null),
	frontage_custom: Joi.string().optional().allow('', null),
	condition: Joi.string().required(),
	condition_custom: Joi.string().optional().allow('', null),
	year_built: Joi.string().optional().allow('', null),
	year_remodeled: Joi.string().optional().allow('', null),
	basement: Joi.string().optional().allow('', null),
	basement_custom: Joi.string().optional().allow('', null),
	utilities_select: Joi.string().optional().allow('', null),
	utilities_select_custom: Joi.string().optional().allow('', null),
	zoning_type: Joi.string().optional().allow('', null),
	price_square_foot: Joi.number().required(),
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

export const amenitiesInfoSchema = {
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
	fireplace_custom: Joi.string().optional().allow(null, ''),
	other_amenities: Joi.string().optional().allow(null, ''),
	additional_amenities: Joi.array().optional(),
};

export const transactionInfoSchema = {
	sale_price: Joi.number().required(),
	date_sold: dateFormatValidator.date().optional().allow(null, ''),
	sale_status: Joi.string().optional().allow('', null),
	list_price: Joi.number().optional().allow(null),
	date_list: dateFormatValidator.date().optional().allow(null, ''),
	days_on_market: Joi.number().optional().allow(null),
	total_concessions: Joi.number().optional().allow(null),
	private_comp: Joi.number().optional().allow(null),
};

// Combine all schemas into one
export const combinedSchema = Joi.object().keys({
	...loacationInfoSchema,
	...propertyDetailsSchema,
	...offerorInfoSchema,
	...acquirerInfoSchema,
	...amenitiesInfoSchema,
	...transactionInfoSchema,
});

export const resCompsListSchema = Joi.object().keys({
	page: Joi.number().optional().allow(null, ''),
	limit: Joi.number().optional().allow(null, ''),
	search: Joi.string().optional().allow(null, ''),
	orderBy: Joi.string().optional().allow(null, ''),
	orderByColumn: Joi.string().optional().allow(null, ''),
	propertyType: Joi.string().optional().allow(null, ''),
	street_address: Joi.string().optional().allow(null, ''),
	state: Joi.string().optional().allow(null, ''),
	city: Joi.array().optional().allow(null),
	start_date: dateFormatValidator.date().optional().allow(null, ''),
	end_date: dateFormatValidator.date().optional().allow(null, ''),
	building_sf_min: Joi.number().optional().allow(null),
	building_sf_max: Joi.number().optional().allow(null),
	land_sf_min: Joi.number().optional().allow(null),
	land_sf_max: Joi.number().optional().allow(null),
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
		search: Joi.string().optional().allow(null, ''),
		orderBy: Joi.string().optional().allow(null, ''),
		orderByColumn: Joi.string().optional().allow(null, ''),
		street_address: Joi.string().optional().allow(null, ''),
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
		search: Joi.string().optional().allow(null, ''),
		orderBy: Joi.string().optional().allow(null, ''),
		orderByColumn: Joi.string().optional().allow(null, ''),
		street_address: Joi.string().optional().allow(null, ''),
	}).optional(),
	limit: Joi.number().min(1).max(100).default(20).optional(),
	page: Joi.number().min(1).default(1).optional(),
});
