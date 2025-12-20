import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import IZoning from '../../utils/interfaces/IZoning';
import IPropertyUnits from '../propertyUnits/IPropertyUnits';
import { ISuccess } from '../../utils/interfaces/common';

export interface ICompsRequest {
	type: string;
	state?: string;
	city?: [];
	propertyType?: string | string[];
	start_date?: string;
	end_date?: string;
	building_sf_min?: number;
	building_sf_max?: number;
	land_sf_min?: number;
	land_sf_max?: number;
	cap_rate_min?: number;
	cap_rate_max?: number;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn: string;
	street_address?: string;
	comparison_basis?: string;
	appraisal_land_dimension?: string;
	price_sf_max?: number;
	price_sf_min?: number;
	lease_type?: string;
	square_footage_max?: number;
	square_footage_min?: number;
	compStatus?: string;
	comp_type?: string;
	land_dimension?: string;
}

export interface ICompsListRequest extends Request {
	user?: IUser;
	type: string;
	state?: string;
	city?: [];
	propertyType?: string | string[];
	start_date?: string;
	end_date?: string;
	building_sf_min?: number;
	building_sf_max?: number;
	land_sf_min?: number;
	land_sf_max?: number;
	cap_rate_min?: number;
	cap_rate_max?: number;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
	street_address?: string;
	comparison_basis?: string;
	appraisal_land_dimension?: string;
	price_sf_max?: number;
	price_sf_min?: number;
	lease_type?: string;
	square_footage_max?: number;
	square_footage_min?: number;
	compStatus?: string;
	comp_type?: string;
}

export interface ICompsCreateUpdateRequest extends Request {
	user?: IUser;
	id?: number;
	property_id?: number;
	user_id?: number;
	account_id?: number;
	street_address: string;
	street_suite: string;
	city: string;
	county: string;
	state: string;
	zipcode: number;
	type: string;
	property_image_url?: string;
	condition: string;
	property_class?: string;
	year_built?: string;
	year_remodeled?: string;
	sale_price: number;
	price_square_foot: number;
	lease_rate?: number;
	term?: number;
	concessions?: string;
	building_size?: number;
	land_size?: number;
	land_dimension?: string;
	date_sold?: Date;
	summary?: string;
	parcel_id_apn?: string;
	frontage?: string;
	utilities_select?: string;
	zoning_type?: string;
	map_pin_lat: string;
	map_pin_lng: string;
	map_pin_zoom?: number;
	latitude?: string;
	longitude?: string;
	net_operating_income?: number;
	cap_rate?: number;
	comp_type?: string;
	land_type?: string;
	lease_type?: string;
	topography?: string;
	lot_shape?: string;
	lease_rate_unit?: string;
	space?: number;
	cam?: number;
	date_execution?: string;
	date_commencement?: string;
	date_expiration?: string;
	TI_allowance?: number;
	TI_allowance_unit?: string;
	asking_rent?: number;
	asking_rent_unit?: string;
	escalators?: number;
	free_rent?: number;
	lease_status?: string;
	total_operating_expense?: number;
	operating_expense_psf?: number;
	list_price?: number;
	date_list?: string;
	days_on_market?: number;
	total_concessions?: number;
	offeror_type?: string;
	offeror_id?: number;
	acquirer_type?: string;
	acquirer_id?: number;
	private_comp?: number;
	sale_status?: string;
	comparison_basis?: string;
	occupancy?: string;
	location_desc?: string;
	legal_desc?: string;
	grantor?: string;
	grantee?: string;
	instrument?: string;
	confirmed_by?: string;
	confirmed_with?: string;
	financing?: string;
	marketing_time?: string;
	est_land_value?: number;
	est_building_value?: number;
	construction_class?: string;
	stories?: string;
	site_access?: string;
	gross_building_area?: number;
	net_building_area?: number;
	site_coverage_percent?: number;
	effective_age?: string;
	site_comments?: string;
	building_comments?: string;
	other_include_utilities?: string;
	parking?: string;
	zonings: IZoning[];
	included_utilities?: [];
	property_units?: IPropertyUnits[];
	google_place_id?: string;
}

export interface IGetCompRequest extends Request {
	user?: IUser;
}

export interface IComp {
	id: number;
	property_id: number;
	user_id: number;
	account_id: number;
	business_name: string;
	street_address: string;
	street_suite: string;
	city: string;
	county: string;
	state: string;
	zipcode: number;
	type: string;
	property_image_url: string;
	condition: string;
	property_class: string;
	year_built: string;
	year_remodeled: string;
	sale_price: number;
	price_square_foot: number;
	lease_rate: number;
	term: number;
	concessions: string;
	building_size: number;
	land_size: number;
	land_dimension: string;
	date_sold: Date;
	summary: string;
	parcel_id_apn: string;
	frontage: string;
	utilities_select: string;
	zoning_type: string;
	map_pin_lat: string;
	map_pin_lng: string;
	map_pin_zoom: number;
	latitude: string;
	longitude: string;
	net_operating_income: number;
	cap_rate: number;
	comp_type: string;
	land_type: string;
	lease_type: string;
	topography: string;
	lot_shape: string;
	lease_rate_unit: string;
	space: number;
	cam: number;
	date_execution: string;
	date_commencement: string;
	date_expiration: string;
	TI_allowance: number;
	TI_allowance_unit: string;
	asking_rent: number;
	asking_rent_unit: string;
	escalators: number;
	free_rent: number;
	lease_status: string;
	total_operating_expense: number;
	operating_expense_psf: number;
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
	comparison_basis: string;
	occupancy: string;
	location_desc: string;
	legal_desc: string;
	grantor: string;
	grantee: string;
	instrument: string;
	confirmed_by: string;
	confirmed_with: string;
	financing: string;
	marketing_time: string;
	est_land_value: number;
	est_building_value: number;
	construction_class: string;
	stories: string;
	site_access: string;
	gross_building_area: number;
	net_building_area: number;
	site_coverage_percent: number;
	effective_age: string;
	site_comments: string;
	building_comments: string;
	other_include_utilities: string;
	parking: string;
	zonings: IZoning[];
	included_utilities: [];
	property_units: IPropertyUnits[];
	total_beds?: number;
	total_units?: number;
	total_property_beds?: number;
	total_property_baths?: number;
	ai_generated?: number;
	google_place_id?: string;
}
export interface ICompListSuccessData {
	comps: IComp;
	page: number;
	totalRecord: number;
	perPage: number;
}

export interface ICompSuccess<T> extends ISuccess {
	data: T;
}

export interface ICitiesSuccess {
	allCities: [];
}
export interface IGetCitiesRequest extends Request {
	user?: IUser;
	state: string;
}
export interface ICompDownloadRequest extends IGetCompRequest {
	compIds: [];
	comparison: string;
}

export interface IGetPdfUploadRequest extends IGetCompRequest {
	file: any;
}

export interface ISaveExtractedPdfComps extends IGetCompRequest {
	comp_type: string;
	type: string;
	properties: IExtractedComp[];
}

export interface IExtractedComp extends IGetCompRequest {
	property_id?: number;
	user_id?: number;
	account_id?: number;
	business_name?: string;
	street_address: string;
	street_suite: string;
	city: string;
	county: string;
	state: string;
	zipcode: number;
	type: string;
	property_image_url?: string;
	condition: string;
	property_class?: string;
	year_built?: string;
	year_remodeled?: string;
	sale_price: number;
	price_square_foot: number;
	lease_rate?: number;
	term?: number;
	concessions?: string;
	building_size?: number;
	land_size?: number;
	land_dimension?: string;
	date_sold?: Date;
	summary?: string;
	parcel_id_apn?: string;
	frontage?: string;
	utilities_select?: string;
	zoning_type?: string;
	map_pin_lat?: string;
	map_pin_lng?: string;
	map_pin_zoom?: number;
	latitude?: string;
	longitude?: string;
	net_operating_income?: number;
	cap_rate?: number;
	comp_type?: string;
	land_type?: string;
	lease_type?: string;
	topography?: string;
	lot_shape?: string;
	lease_rate_unit?: string;
	space?: number;
	cam?: number;
	date_execution?: string;
	date_commencement?: string;
	date_expiration?: string;
	TI_allowance?: number;
	TI_allowance_unit?: string;
	asking_rent?: number;
	asking_rent_unit?: string;
	escalators?: number;
	free_rent?: number;
	lease_status?: string;
	total_operating_expense?: number;
	operating_expense_psf?: number;
	list_price?: number;
	date_list?: string;
	days_on_market?: number;
	total_concessions?: number;
	offeror_type?: string;
	offeror_id?: number;
	acquirer_type?: string;
	acquirer_id?: number;
	private_comp?: number;
	sale_status?: string;
	comparison_basis?: string;
	occupancy?: string;
	location_desc?: string;
	legal_desc?: string;
	grantor?: string;
	grantee?: string;
	instrument?: string;
	confirmed_by?: string;
	confirmed_with?: string;
	financing?: string;
	marketing_time?: string;
	est_land_value?: number;
	est_building_value?: number;
	construction_class?: string;
	stories?: string;
	site_access?: string;
	gross_building_area?: number;
	net_building_area?: number;
	site_coverage_percent?: number;
	effective_age?: string;
	site_comments?: string;
	building_comments?: string;
	other_include_utilities?: string;
	parking?: string;
	building_type: string;
	building_sub_type: string;
	building_sub_type_custom?: string;
	sq_ft: number;
	comps_included_utilities?: [];
	property_units?: IPropertyUnits[];
	ai_generated: number;
	google_place_id?: string;
}

export interface IExtractedCompsSuccessData {
	compsCreated: IComp[];
	selectedComps?: number[];
	totalLinked?: number;
	totalCreated?: number;
	message?: string;
}

export interface IMapFilters {
	type?: string; // sale, lease, etc.
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
	cap_rate_min?: number;
	cap_rate_max?: number;
	orderBy?: string;
	orderByColumn?: string;
	street_address?: string;
	comparison_basis?: string;
	appraisal_land_dimension?: string;
	price_sf_max?: number;
	price_sf_min?: number;
	lease_type?: string;
	square_footage_max?: number;
	square_footage_min?: number;
	compStatus?: string;
	comp_type?: string;
	land_dimension?: string;
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
