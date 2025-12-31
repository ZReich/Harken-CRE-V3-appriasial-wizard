import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ICapComps } from '../evaluationCapComps/IEvaluationCapComps';
import { ICapComparisonAttributes } from '../evaluationCapCompareAttributes/IEvaluationCapCompareAttributes';

export interface ICapApproach {
	id?: number;
	evaluation_id: number;
	evaluation_scenario_id: number;
	weight?: number;
	high_cap_rate?: number;
	low_cap_rate?: number;
	weighted_average?: number;
	rounded_average?: number;
	notes?: string;
	area_map_zoom: number;
	map_type?: string;
	map_center_lat?: string;
	map_center_lng?: string;
	comps?: ICapComps[];
	comparison_attributes?: ICapComparisonAttributes[];
	cap_rate_notes?: string;
}

export interface GetCapApproachRequest extends Request {
	user: IUser;
}

export interface ICapApproachRequest extends Request {
	id?: number;
	evaluation_scenario_id: number;
	weight?: number;
	high_cap_rate?: number;
	low_cap_rate?: number;
	weighted_average?: number;
	rounded_average?: number;
	area_map_zoom?: number;
	map_type?: string;
	map_center_lat?: string;
	map_center_lng?: string;
	notes?: string;
	comps?: ICapComps[];
	comparison_attributes?: ICapComparisonAttributes[];
	cap_rate_notes?: string;
}
export interface SaveCapApproachRequest extends GetCapApproachRequest {
	user: IUser;
	evaluation_id: number;
	weighted_market_value?: number;
	cap_approach: ICapApproachRequest;
}
