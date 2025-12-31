import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ICostSubPropertyAdj } from '../appraisalCostApproachSubAdj/IAppraisalCostApproachSubAdj';
import { ICostComp } from '../appraisalCostApproachComps/IAppraisalCostApproachComps';
import { ICostImprovements } from '../appraisalCostApproachImprovements/IAppraisalCostApproachImprovements';

export interface ICostApproach {
	id?: number;
	appraisal_approach_id: number;
	weight?: number;
	land_value?: number;
	averaged_adjusted_psf?: number;
	incremental_value?: number;
	notes?: string;
	overall_replacement_cost?: number;
	total_depreciation?: number;
	total_depreciation_percentage?: number;
	total_depreciated_cost?: number;
	total_cost_valuation?: number;
	indicated_value_psf?: number;
	area_map_zoom?: number;
	map_type?: string;
	map_center_lat?: string;
	map_center_lng?: string;
	indicated_value_punit?: number;
	indicated_value_pbed?: number;
	improvements_total_adjusted_cost?: number;
	improvements_total_adjusted_ppsf?: number;
	improvements_total_depreciation?: number;
	improvements_total_sf_area?: number;
	effective_age?: number;
	comments?: string;
	cost_subject_property_adjustments: ICostSubPropertyAdj[];
	comps?: ICostComp[];
	improvements?: ICostImprovements[];
}

export interface ISaveCostApproachRequest extends Request {
	user: IUser;
	appraisal_id: number;
	weighted_market_value?: number;
	position?: string;
	cost_approach: ICostApproach;
}

export interface GetCostApproachRequest extends Request {
	user: IUser;
}

export interface ISaveCostImprovements extends Request {
	user: IUser;
	id: number;
	appraisal_id: number;
	appraisal_approach_id: number;
	effective_age?: number;
	overall_replacement_cost?: number;
	total_depreciation?: number;
	total_depreciation_percentage?: number;
	total_depreciated_cost?: number;
	total_cost_valuation?: number;
	indicated_value_psf?: number;
	indicated_value_punit?: number;
	indicated_value_pbed?: number;
	cost_approach_indicated_val?: number;
	improvements?: ICostImprovements[];
	improvements_total_sf_area?: number;
	improvements_total_adjusted_ppsf?: number;
	improvements_total_depreciation?: number;
	improvements_total_adjusted_cost?: number;
	comments?: string;
}

export interface ISaveAreaMapReq extends Request {
	user: IUser;
	area_map_zoom: number;
	map_type: string;
	map_center_lat?: string;
	map_center_lng?: string;
}
