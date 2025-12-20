import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { IMultiFamilyComp } from '../evalMultiFamilyComps/IEvaluationMultiFamilyComps';
import { IMultiFamilySubAdj } from '../evaluationMultiFamilySubAdj/IEvalMultiFamilySubjectAdj';
import { IMultiFamilyComparisonAttributes } from '../evaluationMultiFamilyCompareAttributes/IEvaluationMultiFamilyCompareAttributes';

export interface IMultiFamilyApproach {
	id?: number;
	evaluation_id: number;
	evaluation_scenario_id: number;
	notes: string;
	high_rental_rate: number;
	low_rental_rate: number;
	subject_property_adjustments: IMultiFamilySubAdj[];
	area_map_zoom?: number;
	map_type?: string;
	map_center_lat?: string;
	map_center_lng?: string;
	comps?: IMultiFamilyComp[];
	comparison_attributes?: IMultiFamilyComparisonAttributes[];
}

export interface GetMultiFamilyRequest extends Request {
	user: IUser;
}

export interface ISaveMultiFamilyRequest extends Request {
	user: IUser;
	evaluation_id: number;
	position?: string;
	multi_family_approach: IMultiFamilyApproach;
}
