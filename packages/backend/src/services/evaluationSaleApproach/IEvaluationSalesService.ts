import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { SalesSubAdjustments } from '../evaluationSalesApproachSubjectAdj/IEvaluationSalesApproachSubAdj';
import { ISaleSubQualitativeAdj } from '../evaluationSaleQualitativeSubAdj/IEvaluationSaleQualitativeAdj';
import { ISaleComparisonAttributes } from '../evaluationSaleCompareAttributes/IEvaluationSaleCompareAttributes';
import { ISalesComp } from '../evaluationSalesApproachComps/IEvaluationSalesApproachComps';
import { ISuccess } from '../../utils/interfaces/common';
export interface IEvalSalesApproach {
	id: number;
	evaluation_id?: number;
	weight: number;
	eval_weight: number;
	evaluation_scenario_id: number;
	averaged_adjusted_psf: number;
	sales_approach_value: number;
	incremental_value: number;
	note: string;
	total_comp_adj: number;
	sales_approach_indicated_val: number;
	area_map_zoom: number;
	map_type?: string;
	map_center_lat?: string;
	map_center_lng?: string;
	comp_data?: ISalesComp[];
	subject_property_adj: SalesSubAdjustments[];
	subject_qualitative_adjustments: ISaleSubQualitativeAdj[];
	sales_comparison_attributes: ISaleComparisonAttributes[];
}
export interface ISalesApproachesRequest {
	id?: number;
	evaluation_id?: number;
	subject_property_adj?: SalesSubAdjustments[];
	eval_weight: number;
	incremental_value?: number;
	averaged_adjusted_psf?: number;
	sales_approach_value?: number;
	total_comp_adj?: number;
	sales_approach_indicated_val?: number;
	note?: string;
	evaluation_scenario_id: number;
	comp_data?: ISalesComp[];
	sales_comparison_attributes?: ISaleComparisonAttributes[];
	subject_qualitative_adjustments?: ISaleSubQualitativeAdj[];
}

export interface EvalSalesApproachRequest extends Request {
	user: IUser;
	evaluation_id: number;
	weighted_market_value?: number;
	sales_approach: ISalesApproachesRequest;
}

export interface GetSalesApproachRequest extends Request {
	user: IUser;
}

export interface IComparativeAttributeList {
	id: number;
	comparative_attribute_id: number;
	evaluation_type_id: number;
	default: string;
}

export interface IComparativeListSuccess extends ISuccess {
	data: IComparativeAttributeList[];
}
export interface ISalesApproachesWeightRequest {
	id?: number;
	evaluation_id: number;
	evaluation_scenario_id: number;
	eval_weight: number;
}
