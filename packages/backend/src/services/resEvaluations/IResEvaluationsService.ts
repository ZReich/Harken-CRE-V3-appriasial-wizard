import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';
import { ISalesApproach } from '../appraisalSalesApproach/IAppraisalSalesService';
import { ICostApproach } from '../appraisalCostApproach/IAppraisalCostApproach';
import { IClient } from '../clients/IClientService';
import IRentRolls from '../appraisalRentRolls/IRentRolls';
import { IEvaluationMetaData } from '../evaluationMetaData/IEvaluationMetaDataService';
import { IEvaluationScenario } from '../evaluationScenario/IEvaluationScenarioService';
import IAccount from '../accounts/IAccountsService';
import IResZoning from '../../utils/interfaces/IResZoning';
import { IResEvaluationScenario } from '../resEvaluationScenario/IResEvaluationScenarioService';
import { IResEvaluationIncomeApproach } from '../resEvaluationIncomeApproach/IResEvaluationIncomeApproach';

export interface IEvaluationsListRequest extends Request {
	user?: IUser;
	page: number;
	limit: number;
	search?: string;
	orderBy?: string;
	orderByColumn: string;
	offset?: number;
}

export interface IEvaluationsUpdateRequest extends Request {
	user?: IUser;
	id: number;
	res_evaluation_scenario_id: number;
	res_evaluation_id: number;
	property_id: number;
	user_id: number;
	account_id: number;
	client_id: number;
	evaluation_type: string;
	property_name: string;
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
	property_image_url: string;
	condition: string;
	property_class: string;
	year_built: string;
	year_remodeled: string;
	sale_price: number;
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
	exterior: string;
	roof: string;
	electrical: string;
	plumbing: string;
	inspector_name: string;
	report_date: Date;
	effective_date: Date;
	heating_cooling: string;
	windows: string;
	bedrooms: string;
	bathrooms: string;
	garage: string;
	fencing: string;
	fireplace: string;
	other_amenities: string;
	conforming_use_determination: string;
	key_highlights: string;
	site_details_north: string;
	site_details_south: string;
	site_details_east: string;
	site_details_west: string;
	traffic_counts: string;
	traffic_count: string;
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
	exhibits: string;
	county_details_url: string;
	county_tax_url: string;
	subdivision_survey_url: string;
	weighted_market_value: number;
	position: string;
	file_pdf_url: string;
	file_number: string;
	summary: string;
	rounding: number;
	last_transfer_date_known: string;
	most_likely_owner_user: string;
	review_summary: string;
	lot_shape: string;
	comp_type: string;
	comp_adjustment_mode: string;
	aerial_map_zoom: number;
	aerial_map_type: string;
	comps_map_type: string;
	assessed_market_year: string;
	tax_liability_year: string;
	total_land_improvement: number;
	weight_sf: number;
	res_zonings: IResZoning[];
	res_evaluation_amenities?: [];
}

export interface IGetEvaluationRequest extends Request {
	user?: IUser;
}

export interface IEvaluation {
	id: number;
	user?: IUser;
	property_id: number;
	user_id: number;
	account_id: number;
	client_id: number;
	evaluation_type: string;
	property_name: string;
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
	property_image_url: string;
	condition: string;
	property_class: string;
	year_built: string;
	year_remodeled: string;
	sale_price: number;
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
	exterior: string;
	roof: string;
	electrical: string;
	plumbing: string;
	inspector_name: string;
	report_date: Date;
	effective_date: Date;
	heating_cooling: string;
	windows: string;
	bedrooms: string;
	bathrooms: string;
	garage: string;
	fencing: string;
	fireplace: string;
	res_evaluation_amenities: [];
	other_amenities: string;
	conforming_use_determination: string;
	key_highlights: string;
	site_details_north: string;
	site_details_south: string;
	site_details_east: string;
	site_details_west: string;
	traffic_counts: string;
	traffic_count: string;
	map_image_url: string;
	map_zoom: number;
	map_selected_area: string;
	map_pin_lat: string;
	map_pin_lng: string;
	map_pin_zoom: number;
	map_center_lat: string;
	map_center_lng: string;
	map_image_for_report_url: string;
	google_place_id: string;
	map_pin_image_url: number;
	latitude: string;
	longitude: string;
	exhibits: string;
	county_details_url: string;
	county_tax_url: string;
	subdivision_survey_url: string;
	weighted_market_value: number;
	position: string;
	file_pdf_url: string;
	file_number: string;
	summary: string;
	rounding: number;
	last_transfer_date_known: string;
	most_likely_owner_user: string;
	review_summary: string;
	lot_shape: string;
	comp_type: string;
	comp_adjustment_mode: string;
	aerial_map_zoom: number;
	aerial_map_type: string;
	comps_map_type: string;
	assessed_market_year: string;
	tax_liability_year: string;
	total_land_improvement: number;
	weight_sf: number;
	res_zonings: IResZoning[];
	account: IAccount;
	client: IClient;
	photos_taken_by: string;
	photo_date: string;
	res_evaluation_scenarios: IResEvaluationScenario[];
	total_basement: number;
	reviewed_by?: number;
	review_date?: Date;
}

export interface IEvaluationSuccess<T> extends ISuccess {
	data: T;
}

export interface IEvaluationSetupRequest extends IGetEvaluationRequest {
	client_id: number;
	evaluation_type: string;
	comp_type: string;
	scenarios: IEvaluationScenario[];
	position?: string;
}

export interface ILatLng {
	lat: string;
	long: string;
}

export interface IMapBoundary extends IGetEvaluationRequest {
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

export interface IAerialMap extends IGetEvaluationRequest {
	aerial_map_zoom: number;
	aerial_map_type: string;
	map_center_lat?: string;
	map_center_lng?: string;
}
export interface IAreaInfo extends IGetEvaluationRequest {
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
	res_evaluation_id: number;
	field: string;
}

export interface IPostEvalExhibitsRequest extends Request {
	file: Express.Multer.File;
	user: IUser;
}

export interface IRemoveExhibitsRequest extends Request {
	user: IUser;
}

export interface IEvaluationFiles {
	id: number;
	res_evaluation_id: number;
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

export interface IEvaluationListRequest extends Request {
	user: IUser;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
	propertyName?: string;
	compType?: string;
	state?: string;
	streetAddress?: string;
	city?: [];
	dateOfAnalysisFrom?: string;
	dateOfAnalysisTo?: string;
	accountId?: number;
	userId?: number;
}

export interface IEvaluationListSuccess {
	evaluations: IEvaluation[];
	page: number;
	totalRecords: number;
	perPage: number;
}

export interface IGetAreaInfoRequest extends Request {
	user: IUser;
}
export interface IGetAllAreaInfo {
	areaInfo: IEvaluationMetaData[];
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

export interface IDeleteEvaluationRequest extends Request {
	user: IUser;
}

export interface IDeleteEvaluation {
	id: number;
}

export interface IGetInfoForPdf extends Request {
	user: IUser;
}

export interface ICalculateSale {
	data: IEvaluationsUpdateRequest;
	sale: ISalesApproach;
}

export interface ICalculateCost {
	data: IEvaluationsUpdateRequest;
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
	comparative_attribute_id: number;
	evaluation_type_id: number;
	default: string;
}
export interface ISaleComparitivesListSuccess extends ISuccess {
	data: ISaleComparitiveAttributesList[];
}

export interface ISaveRentRoll extends IGetRequest {
	res_evaluation_id: number;
	evaluation_approach_id: number;
	type: string;
	rent_rolls: IRentRolls[];
}

export interface ISaveRentRollResponse {
	type: string;
	rent_rolls: IRentRolls[];
}

export interface ISaveAreaMap extends Request {
	user: IUser;
	area_map_zoom: number;
	map_type: string;
	map_center_lat?: string;
	map_center_lng?: string;
}

export interface IAreaMap {
	area_map_zoom: number;
	map_type: string;
	map_center_lat?: string;
	map_center_lng?: string;
}
export interface IEvaluationRequest extends Request {
	user: IUser;
}
export interface IApproachesPercentage {
	id: number;
	eval_weight: number;
}
export interface ISaveWeightPercentage extends IEvaluationRequest {
	approach_id: number;
	approach_type: string;
	eval_weight: number;
}

export interface IEvaluationScenarioRequest extends IGetEvaluationRequest {
	client_id: number;
	evaluation_type: string;
	comp_type: string;
	res_evaluation_scenarios: IEvaluationScenario[];
}

export interface ICalculateIncome {
	data: IEvaluationsUpdateRequest;
	income: IResEvaluationIncomeApproach;
}

export interface ICalculateCost {
	data: IEvaluationsUpdateRequest;
	cost: ICostApproach;
}

export interface IMergeFieldDataRequest extends IEvaluationRequest {
	evaluation_id: number;
	merge_fields: [];
}
