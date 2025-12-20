import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ICostSubPropertyAdj } from '../resEvaluationCostApproachSubAdj/IResEvaluationCostApproachSubAdj';
import { ICostComp } from '../resEvalCostApproachComps/IResEvaluationCostApproachComps';
import { ICostImprovements } from '../resEvaluationCostApproachImprovements/IResEvaluationCostApproachImprovements';
import { ICostComparisonAttributes } from '../resEvaluationCostCompareAttributes/IResEvaluationCostCompareAttributes';

export interface ICostApproach {
	id?: number;
	res_evaluation_id: number;
	res_evaluation_scenario_id: number;
	weight?: number;
	eval_weight?: number;
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
	improvements_total_adjusted_cost?: number;
	improvements_total_adjusted_ppsf?: number;
	improvements_total_depreciation?: number;
	improvements_total_sf_area?: number;
	effective_age?: number;
	comments?: string;
	cost_subject_property_adjustments: ICostSubPropertyAdj[];
	comp_data?: ICostComp[];
	cost_improvements?: ICostImprovements[];
	comparison_attributes?: ICostComparisonAttributes[];
}

export interface ISaveCostApproachRequest extends Request {
	user: IUser;
	res_evaluation_id: number;
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
	res_evaluation_id: number;
	res_evaluation_scenario_id: number;
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
	cost_improvements?: ICostImprovements[];
	improvements_total_sf_area?: number;
	improvements_total_adjusted_ppsf?: number;
	improvements_total_depreciation?: number;
	improvements_total_adjusted_cost?: number;
	comments?: string;
	weighted_market_value?: number;
	incremental_value?: number;
}

export interface ISaveAreaMapReq extends Request {
	user: IUser;
	area_map_zoom: number;
	map_type: string;
	map_center_lat?: string;
	map_center_lng?: string;
}
export interface ICostApproachesWeightRequest {
	id?: number;
	res_evaluation_id: number;
	res_evaluation_scenario_id: number;
	eval_weight: number;
}
