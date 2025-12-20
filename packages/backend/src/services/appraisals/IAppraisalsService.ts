import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import IZoning from '../../utils/interfaces/IZoning';
import { ISuccess } from '../../utils/interfaces/common';
import { IAppraisalMetaData } from '../appraisalsMetaData/IAppraisalMetaDataService';
import { IAppraisalApproach } from '../appraisalApproaches/IAppraisalApproachesService';
import { IAppraisalIncomeApproach } from '../appraisalIncomeApproach/IAppraisalIncomeApproach';
import { ISalesApproach } from '../appraisalSalesApproach/IAppraisalSalesService';
import { ICostApproach } from '../appraisalCostApproach/IAppraisalCostApproach';
import { IClient } from '../clients/IClientService';
import IRentRolls from '../appraisalRentRolls/IRentRolls';

export interface IAppraisalsListRequest extends Request {
	user?: IUser;
	page: number;
	limit: number;
	search?: string;
	orderBy?: string;
	orderByColumn: string;
	offset?: number;
}

export interface IAppraisalsUpdateRequest extends Request {
	user?: IUser;
	id?: number;
	property_id?: number;
	user_id?: number;
	account_id?: number;
	client_id?: number;
	business_name: string;
	street_address: string;
	street_suite?: string;
	city: string;
	county: string;
	state: string;
	zipcode: number;
	type: string;
	under_contract_price?: number;
	close_date?: Date;
	last_transferred_date?: Date;
	price?: number;
	land_assessment?: number;
	structure_assessment?: number;
	sids?: string;
	taxes_in_arrears?: number;
	tax_liability?: number;
	condition?: string;
	property_class?: string;
	year_built?: string;
	year_remodeled?: string;
	price_square_foot?: number;
	building_size?: number;
	land_size?: number;
	land_dimension?: string;
	no_stories?: string;
	parcel_id_apn?: string;
	owner_of_record?: string;
	property_geocode?: string;
	property_legal?: string;
	property_rights?: string;
	high_and_best_user?: string;
	intended_use?: string;
	intended_user?: string;
	topography?: string;
	frontage?: string;
	front_feet?: number;
	lot_depth?: number;
	utilities_select?: string;
	zoning_type?: string;
	zoning_description?: string;
	height?: string;
	main_structure_base?: string;
	foundation?: string;
	parking?: string;
	basement?: string;
	ada_compliance?: string;
	date_of_analysis?: Date;
	inspector_name?: string;
	report_date?: Date;
	effective_date?: Date;
	exterior?: string;
	roof?: string;
	electrical?: string;
	plumbing?: string;
	heating_cooling?: string;
	windows?: string;
	conforming_use_determination?: string;
	traffic_street_address?: string;
	traffic_count?: string;
	traffic_input?: number;
	map_image_url?: string;
	map_zoom?: number;
	map_selected_area?: string;
	map_pin_lat?: string;
	map_pin_lng?: string;
	map_pin_zoom: number;
	map_image_for_report_url?: string;
	google_place_id?: string;
	map_pin_image_url?: number;
	latitude?: string;
	longitude?: string;
	weighted_market_value?: number;
	position: string;
	submitted?: number;
	file_number?: string;
	summary?: string;
	data?: string;
	rounding?: number;
	last_transfer_date_known?: string;
	most_likely_owner_user?: string;
	review_summary?: string;
	comp_adjustment_mode?: string;
	comp_type?: string;
	land_type?: string;
	lot_shape?: string;
	aerial_map_zoom?: number;
	aerial_map_type?: string;
	assessed_market_year?: string;
	tax_liability_year?: string;
	total_land_improvement?: number;
	analysis_type?: string;
	comparison_basis?: string;
	other_include_utilities?: string;
	zonings: IZoning[];
	included_utilities?: [];
	appraisal_approaches?: IAppraisalApproach[];
	change_approaches?: number;
}

export interface IGetAppraisalRequest extends Request {
	user?: IUser;
}

export interface IAppraisal {
	id: number;
	property_id: number;
	user_id: number;
	account_id: number;
	client_id: number;
	business_name: string;
	street_address: string;
	street_suite: string;
	city: string;
	county: string;
	state: string;
	zipcode: number;
	type: string;
	under_contract_price: number;
	close_date: Date;
	last_transferred_date: Date;
	price: number;
	land_assessment: number;
	structure_assessment: number;
	sids: string;
	taxes_in_arrears: number;
	tax_liability: number;
	condition: string;
	property_class: string;
	year_built: string;
	year_remodeled: string;
	price_square_foot: number;
	building_size: number;
	land_size: number;
	land_dimension: string;
	no_stories: string;
	parcel_id_apn: string;
	owner_of_record: string;
	property_geocode: string;
	property_legal: string;
	property_rights: string;
	high_and_best_user: string;
	intended_use: string;
	intended_user: string;
	topography: string;
	frontage: string;
	front_feet: number;
	lot_depth: number;
	utilities_select: string;
	zoning_type: string;
	zoning_description: string;
	height: string;
	main_structure_base: string;
	foundation: string;
	parking: string;
	basement: string;
	ada_compliance: string;
	date_of_analysis: Date;
	inspector_name: string;
	report_date: Date;
	effective_date: Date;
	exterior: string;
	roof: string;
	electrical: string;
	plumbing: string;
	heating_cooling: string;
	windows: string;
	conforming_use_determination: string;
	traffic_street_address: string;
	traffic_count: string;
	traffic_input: number;
	map_image_url: string;
	map_zoom: number;
	map_selected_area: string;
	map_pin_lat: string;
	map_pin_lng: string;
	map_pin_zoom: number;
	map_image_for_report_url: string;
	google_place_id: string;
	map_pin_image_url: number;
	latitude: string;
	longitude: string;
	weighted_market_value: number;
	position: string;
	submitted: number;
	file_number: string;
	summary: string;
	rounding: number;
	last_transfer_date_known: string;
	most_likely_owner_user: string;
	review_summary: string;
	comp_adjustment_mode: string;
	comp_type: string;
	land_type: string;
	lot_shape: string;
	aerial_map_zoom: number;
	aerial_map_type: string;
	assessed_market_year: string;
	tax_liability_year: string;
	total_land_improvement: number;
	analysis_type: string;
	comparison_basis: string;
	other_include_utilities: string;
	zonings: IZoning[];
	included_utilities: [];
	appraisal_approaches: IAppraisalApproach[];
	total_units: number;
	total_beds: number;
	client: IClient;
	photos_taken_by: string;
	photo_date: string;
	map_center_lat: string;
	map_center_lng: string;
	boundary_map_type: string;
	total_property_beds: number;
	total_property_baths: number;
}

export interface IAppraisalListSuccessData {
	appraisal: IAppraisal;
	page: number;
	totalRecord: number;
	perPage: number;
}

export interface IAppraisalSuccess<T> extends ISuccess {
	data: T;
}

export interface IAppraisalsCreateRequest extends Request {
	user: IUser;
	client_id: number;
	appraisal_type: string;
}

export interface IAppraisalSetupRequest extends Request {
	user: IUser;
	client_id: number;
	appraisal_type: string;
	approaches: IAppraisalApproach[];
	position: string;
	map_image_url?: string;
	map_image_for_report_url?: string;
	latitude?: string;
	longitude?: string;
	map_selected_area?: ILatLng[];
	map_zoom?: number;
}

export interface IAppraisalsCreateUpdateRequest extends Request {
	user: IUser;
	client_id: number;
	appraisal_type: string;
	approaches: IAppraisalApproach[];
}

export interface ILatLng {
	lat: string;
	long: string;
}

export interface IMapBoundaryRequest extends Request {
	user: IUser;
	position: string;
	map_image_url?: string;
	map_image_for_report_url?: string;
	latitude?: string;
	longitude?: string;
	map_selected_area?: ILatLng[];
	map_zoom?: number;
	boundary_map_type?: string;
}

export interface IUploadImageRequest extends Request {
	file: Express.Multer.File;
	imageId?: number | null;
	user: IUser;
	field: string;
	type: string;
}

export interface IAerialMapRequest extends Request {
	user: IUser;
	aerial_map_zoom: number;
	aerial_map_type: string;
	map_center_lat?: string;
	map_center_lng?: string;
}

export interface IAreaInfoRequest extends Request {
	user: IUser;
	city_info: string;
	county_info: string;
	property_summary_sales_arrow: string;
	property_summary_vacancy_arrow: string;
	property_summary_net_absorption_arrow: string;
	property_summary_construction_arrow: string;
	property_summary_lease_rates_arrow: string;
}

export interface IRemoveImageRequest extends Request {
	user: IUser;
	image_id: number;
	appraisal_id: number;
	field: string;
}

export interface IPostExhibitsRequest extends Request {
	file: Express.Multer.File;
	user: IUser;
}

export interface IRemoveExhibitsRequest extends Request {
	user: IUser;
}

export interface IAppraisalFiles {
	id: number;
	appraisal_id: number;
	type: string;
	size: number;
	height: number;
	width: number;
	title: string;
	description: string;
	dir: string;
	filename: string;
	origin: string;
	storage: string;
	order: number;
}

export interface IAppraisalListRequest extends Request {
	user: IUser;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
	businessName?: string;
	compType?: string;
	state?: string;
	streetAddress?: string;
	city?: [];
	dateOfAnalysisFrom?: string;
	dateOfAnalysisTo?: string;
	accountId?: number;
	userId?: number;
}

export interface IAppraisalListSuccess {
	appraisals: IAppraisal[];
	page: number;
	totalRecords: number;
	perPage: number;
}

export interface IGetAreaInfoRequest extends Request {
	user: IUser;
}
export interface IGetAllAreaInfo {
	areaInfo: IAppraisalMetaData[];
}

export interface IAdvanceSearchRequest extends Request {
	user?: IUser;
	type: string;
	state?: string;
	comp_type?: string;
	city?: [];
	propertyType?: string;
	start_date?: string;
	end_date?: string;
	building_sf_min?: number;
	building_sf_max?: number;
	land_sf_min?: number;
	land_sf_max?: number;
	cap_rate_min?: number;
	cap_rate_max?: number;
	street_address?: string;
}

export interface IGetSelectedCompRequest extends Request {
	user?: IUser;
	compIds: [];
}

export interface IDeleteAppraisalRequest extends Request {
	user: IUser;
}

export interface IDeleteAppraisal {
	id: number;
}

export interface IGetInfoForPdf extends Request {
	user: IUser;
}

export interface ICalculateIncome {
	data: IAppraisalsUpdateRequest;
	income: IAppraisalIncomeApproach;
}
export interface ICalculateSale {
	data: IAppraisalsUpdateRequest;
	sale: ISalesApproach;
}

export interface ICalculateCost {
	data: IAppraisalsUpdateRequest;
	cost: ICostApproach;
}

export interface IPositionRequest extends Request {
	user?: IUser;
	position?: string;
}
export interface IFieldsDataGet extends Request {
	user?: IUser;
	fieldContent: string;
}

export interface IGetRequest extends Request {
	user?: IUser;
}
export interface ISaleComparitiveAttributesList {
	id: number;
	sales_comparative_attribute_id: number;
	appraisal_type_id: number;
	default: string;
}
export interface ISaleComparitivesListSuccess extends ISuccess {
	data: ISaleComparitiveAttributesList[];
}

export interface ISaveRentRoll extends IGetRequest {
	appraisal_id: number;
	appraisal_approach_id: number;
	type: string;
	rent_rolls: IRentRolls[];
}

export interface ISaveRentRollResponse {
	type: string;
	rent_rolls: IRentRolls[];
}
