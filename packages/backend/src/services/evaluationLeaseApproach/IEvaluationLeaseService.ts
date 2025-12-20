import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ILeaseComp } from '../evaluationLeaseApproachComps/IEvaluationLeaseApproachComps';
import { ILeaseSubAdjustments } from '../evaluationLeaseApproachSubAdj/IEvaluationLeaseSubjectAdj';
import { ILeaseSubQualitativeAdj } from '../evaluationLeaseQualitativeSubAdj/IEvaluationLeaseQualitativeAdj';
import { ILeaseComparisonAttributes } from '../evaluationLeaseCompareAttributes/IEvaluationLeaseCompareAttributes';

export interface ILeaseApproach {
	id: number;
	evaluation_id?: number;
	weight: number;
	evaluation_scenario_id: number;
	averaged_adjusted_psf: number;
	notes: string;
	lease_comps_notes: string;
	area_map_zoom: number;
	map_type?: string;
	map_center_lat?: string;
	map_center_lng?: string;
	comps?: ILeaseComp[];
	low_adjusted_comp_range?: number;
	high_adjusted_comp_range?: number;
	subject_property_adjustments: ILeaseSubAdjustments[];
	subject_qualitative_adjustments?: ILeaseSubQualitativeAdj[];
}
export interface ILeaseApproachRequest {
	id?: number;
	subject_property_adjustments?: ILeaseSubAdjustments[];
	weight: number;
	averaged_adjusted_psf?: number;
	notes?: string;
	lease_comps_notes?: string;
	evaluation_scenario_id: number;
	comps?: ILeaseComp[];
	subject_qualitative_adjustments?: ILeaseSubQualitativeAdj[];
	low_adjusted_comp_range?: number;
	high_adjusted_comp_range?: number;
	comparison_attributes?: ILeaseComparisonAttributes[];
}

export interface SaveLeaseApproachRequest extends Request {
	user: IUser;
	evaluation_id: number;
	weighted_market_value?: number;
	lease_approach: ILeaseApproachRequest;
}

export interface GetLeaseApproachRequest extends Request {
	user: IUser;
}
