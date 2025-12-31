import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';
import IResZoning from '../../utils/interfaces/IResZoning';

export interface IResCompRequest extends Request {
	user?: IUser;
}
export interface IResCompListSuccessData {
	resComps: IResComp;
	page: number;
	totalRecord: number;
	perPage: number;
}

export interface IResCompsRequest extends IResCompRequest {
	page: number;
	limit: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
	propertyType?: string;
	street_address?: string;
	state?: string;
	city?: [];
	start_date?: string;
	end_date?: string;
	building_sf_min?: number;
	building_sf_max?: number;
	land_sf_min?: number;
	land_sf_max?: number;
}

export interface IResComp {
	id: number;
	property_id: number;
	user_id: number;
	account_id: number;
	property_name: string;
	street_address: string;
	city: string;
	county: string;
	state: string;
	zipcode: number;
	type: string;
	property_image_url: string;
	condition: string;
	exterior: string;
	roof: string;
	electrical: string;
	plumbing: string;
	heating_cooling: string;
	windows: string;
	year_built: string;
	year_remodeled: string;
	sale_price: number;
	price_square_foot: number;
	building_size: number;
	land_size: number;
	land_dimension: string;
	date_sold: Date;
	summary: string;
	frontage: string;
	utilities_select: string;
	utilities_text: string;
	basement: string;
	zoning_type: string;
	map_pin_lat: string;
	map_pin_lng: string;
	map_pin_zoom: number;
	latitude: string;
	longitude: string;
	topography: string;
	lot_shape: string;
	list_price: number;
	date_list: string;
	days_on_market: number;
	total_concessions: number;
	offeror_type: string;
	offeror_id: number;
	acquirer_type: string;
	acquirer_id: number;
	private_comp: number;
	sale_status: string;
	bedrooms: string;
	bathrooms: string;
	garage: string;
	fencing: string;
	fireplace: string;
	additional_amenities: string;
	other_amenities: string;
	ai_generated: number;
	google_place_id?: string;
}

export interface IResCompSuccess<T> extends ISuccess {
	data: T;
}

export interface ICompsCreateUpdateRequest extends Request {
	user?: IUser;
	id?: number;
	property_id?: number;
	user_id?: number;
	account_id?: number;
	property_image_url?: string;
	street_address: string;
	city: string;
	state: string;
	zipcode: number;
	county: string;
	map_pin_lat: string;
	map_pin_lng: string;
	map_pin_zoom?: number;
	latitude?: string;
	longitude?: string;
	summary?: string;
	land_size?: number;
	land_dimension?: string;
	topography?: string;
	topography_custom?: string;
	lot_shape?: string;
	lot_shape_custom?: string;
	frontage?: string;
	frontage_custom?: string;
	condition: string;
	condition_custom?: string;
	building_size?: number;
	year_built?: string;
	year_remodeled?: string;
	basement: string;
	basement_custom: string;
	utilities_select?: string;
	utilities_select_custom?: string;
	zoning_type?: string;
	exterior: string;
	exterior_custom: string;
	roof: string;
	roof_custom: string;
	electrical: string;
	electrical_custom: string;
	plumbing: string;
	plumbing_custom: string;
	heating_cooling: string;
	heating_cooling_custom: string;
	windows: string;
	windows_custom: string;
	bedrooms: string;
	bedrooms_custom: string;
	bathrooms: string;
	bathrooms_custom: string;
	garage: string;
	garage_custom: string;
	fencing: string;
	fencing_custom: string;
	fireplace: string;
	fireplace_custom: string;
	additional_amenities?: [];
	other_amenities: string;
	sale_price: number;
	date_sold?: Date;
	sale_status?: string;
	list_price?: number;
	date_list?: string;
	days_on_market?: number;
	total_concessions?: number;
	offeror_type?: string;
	offeror_id?: number;
	acquirer_type?: string;
	acquirer_id?: number;
	private_comp?: number;
	zonings: IResZoning[];
	price_square_foot: number;
	google_place_id?: string;
}

export interface IResCompSuccess<T> extends ISuccess {
	data: T;
}

export interface IGetCitiesRequest extends Request {
	user?: IUser;
	state: string;
}

export interface ICitiesSuccess {
	allCities: [];
}
export interface IResCompPdfUploadRequest extends IResCompRequest {
	file: any;
}

export interface ISaveExtractResComps extends IResCompRequest {
	property_id?: number;
	user_id?: number;
	account_id?: number;
	property_image_url?: string;
	property_name: string;
	street_address: string;
	city: string;
	state: string;
	zipcode: number;
	county: string;
	map_pin_lat: string;
	map_pin_lng: string;
	map_pin_zoom?: number;
	latitude?: string;
	longitude?: string;
	summary?: string;
	land_size?: number;
	land_dimension?: string;
	topography?: string;
	topography_custom?: string;
	lot_shape?: string;
	lot_shape_custom?: string;
	frontage?: string;
	frontage_custom?: string;
	condition: string;
	condition_custom?: string;
	building_size?: number;
	year_built?: string;
	year_remodeled?: string;
	basement: string;
	basement_custom: string;
	utilities_select?: string;
	utilities_select_custom?: string;
	zoning_type?: string;
	exterior: string;
	exterior_custom: string;
	roof: string;
	roof_custom: string;
	electrical: string;
	electrical_custom: string;
	plumbing: string;
	plumbing_custom: string;
	heating_cooling: string;
	heating_cooling_custom: string;
	windows: string;
	windows_custom: string;
	bedrooms: string;
	bedrooms_custom: string;
	bathrooms: string;
	bathrooms_custom: string;
	garage: string;
	garage_custom: string;
	fencing: string;
	fencing_custom: string;
	fireplace: string;
	fireplace_custom: string;
	additional_amenities?: [];
	other_amenities: string;
	sale_price: number;
	date_sold?: Date;
	sale_status?: string;
	list_price?: number;
	date_list?: string;
	days_on_market?: number;
	total_concessions?: number;
	offeror_type?: string;
	offeror_id?: number;
	acquirer_type?: string;
	acquirer_id?: number;
	private_comp?: number;
	zonings: IResZoning[];
	price_square_foot: number;
	ai_generated: number;
	google_place_id?: string;
}
export interface ISaveExtractedResComps extends IResCompRequest {
	properties: ISaveExtractResComps[];
}

export interface IExtractedCompsSuccess {
	compsCreated: IResComp[];
	selectedComps?: number[];
	totalLinked?: number;
	totalCreated?: number;
	message?: string;
	addressValidationFailCount?: number;
	alreadyExistsCompsCount?: number;
}

export interface IMapFilters {
	state?: string;
	propertyType?: string | string[];
	city?: string[];
	search?: string;
	start_date?: string;
	end_date?: string;
	building_sf_min?: number;
	building_sf_max?: number;
	land_sf_min?: number;
	land_sf_max?: number;
	orderBy?: string;
	orderByColumn?: string;
	street_address?: string;
}

export interface IMapBoundsRequest extends Request {
	user?: IUser;
	body: {
		bounds: {
			north: number;
			south: number;
			east: number;
			west: number;
		};
		zoom: number;
		center?: {
			lat: number;
			lng: number;
		};
		filters?: IMapFilters;
		limit?: number;
		page?: number;
	};
}

export interface IClusterDetailsRequest extends Request {
	user?: IUser;
	body: {
		bounds: {
			north: number;
			south: number;
			east: number;
			west: number;
		};
		zoom: number;
		filters?: IMapFilters;
		limit?: number;
		page?: number;
	};
}

export interface IMapSearchResponse {
	properties: IMapProperty[];
	totalRecord: number;
	page: number;
	limit: number;
	totalPages: number;
	clusters?: IGeoCluster[];
}

export interface IMapSuccess<T> extends ISuccess {
	data: T;
}

export interface IMapProperty {
	id: number;
	street_address: string;
	city: string;
	state: string;
	zipcode: string;
	type: string;
	property_class?: string;
	sale_price?: number;
	lease_rate?: number;
	building_size?: number;
	land_size?: number;
	price_square_foot?: number;
	date_sold?: Date;
	year_built?: string;
	condition?: string;
	map_pin_lat: string;
	map_pin_lng: string;
	property_image_url?: string;
	summary?: string;
	created?: Date;
}

export interface IGeoCluster {
	id: string;
	bounds: {
		north: number;
		south: number;
		east: number;
		west: number;
	};
	center: {
		lat: number;
		lng: number;
	};
	count: number;
	avgPrice?: number;
	avgSize?: number;
	avgPricePerSf?: number;
	propertyTypes: string[];
	zoom: number;
	properties?: IMapProperty[];
}

export interface IGeoClusterResponse {
	clusters: IGeoCluster[];
	totalCount: number;
	bounds: {
		north: number;
		south: number;
		east: number;
		west: number;
	};
	zoom: number;
	center: {
		lat: number;
		lng: number;
	};
}

export interface IExtractedCompSuccessData {
	compId?: number;
	link?: boolean;
	message?: string;
	addressValidation?: boolean;
	alreadyExist?: boolean;
}
