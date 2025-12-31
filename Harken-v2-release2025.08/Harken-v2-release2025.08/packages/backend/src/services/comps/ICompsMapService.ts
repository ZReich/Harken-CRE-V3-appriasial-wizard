import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

// Generic success interface for map services
export interface IMapSuccess<T> extends ISuccess {
	data: T;
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

export interface IMapSearchResponse {
	properties: IMapProperty[];
	totalRecord: number;
	page: number;
	limit: number;
	totalPages: number;
	clusters?: IGeoCluster[];
	filters: IMapFilters;
}

export interface IMapStatsResponse {
	totalProperties: number;
	avgPrice: number;
	avgSize: number;
	avgPricePerSf: number;
	priceRange: {
		min: number;
		max: number;
	};
	sizeRange: {
		min: number;
		max: number;
	};
	propertyTypes: Array<{
		type: string;
		count: number;
		percentage: number;
	}>;
	cities: Array<{
		city: string;
		count: number;
		avgPrice: number;
	}>;
	recentTransactions: IMapProperty[];
}
