import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ILeaseComp } from '../appraisalLeaseApproachComps/IAppraisalLeaseApproachComps';
import { ILeaseSubAdjustments } from '../appraisalLeaseApproachSubAdj/IAppraisalLeaseSubjectAdj';
import { ILeaseSubQualitativeAdj } from '../appraisalLeaseQualitativeSubAdj/IAppraisalLeaseQualitativeAdj';

export interface ILeaseApproach {
	id: number;
	appraisal_id?: number;
	weight: number;
	appraisal_approach_id: number;
	averaged_adjusted_psf: number;
	lease_approach_value: number;
	note: string;
	lease_comps_notes: string;
	total_comp_adj: number;
	lease_approach_indicated_val: number;
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
	lease_approach_value?: number;
	total_comp_adj?: number;
	lease_approach_indicated_val?: number;
	note?: string;
	lease_comps_notes?: string;
	appraisal_approach_id: number;
	comps?: ILeaseComp[];
	subject_qualitative_adjustments?: ILeaseSubQualitativeAdj[];
	low_adjusted_comp_range?: number;
	high_adjusted_comp_range?: number;
}

export interface SaveLeaseApproachRequest extends Request {
	user: IUser;
	appraisal_id: number;
	weighted_market_value?: number;
	lease_approach: ILeaseApproachRequest;
}

export interface GetLeaseApproachRequest extends Request {
	user: IUser;
}
