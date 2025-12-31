import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISalesComp } from '../appraisalSalesApproachComps/IAppraisalSalesApproachComps';
import { SalesSubAdjustments } from '../appraisalSalesApproachSubjectAdj/IAppraisalSalesApproachSubAdj';
import { ISaleSubQualitativeAdj } from '../appraisalSaleQualitativeSubAdj/IAppraisalSaleQualitativeAdj';
import { ISaleComparisonAttributes } from '../appraisalSaleCompareAttributes/IAppraisalSaleCompareAttributes';

export interface ISalesApproach {
	id: number;
	appraisal_id?: number;
	weight: number;
	appraisal_approach_id: number;
	averaged_adjusted_psf: number;
	sales_approach_value: number;
	note: string;
	total_comp_adj: number;
	sales_approach_indicated_val: number;
	area_map_zoom: number;
	map_type?: string;
	map_center_lat?: string;
	map_center_lng?: string;
	comps?: ISalesComp[];
	subject_property_adjustments: SalesSubAdjustments[];
	subject_qualitative_adjustments: ISaleSubQualitativeAdj[];
	sales_comparison_attributes: ISaleComparisonAttributes[];
}
export interface ISalesApproachesRequest {
	id?: number;
	subject_property_adjustments?: SalesSubAdjustments[];
	weight: number;
	averaged_adjusted_psf?: number;
	sales_approach_value?: number;
	total_comp_adj?: number;
	sales_approach_indicated_val?: number;
	note?: string;
	appraisal_approach_id: number;
	comps?: ISalesComp[];
	sales_comparison_attributes?: ISaleComparisonAttributes[];
	subject_qualitative_adjustments?: ISaleSubQualitativeAdj[];
}

export interface SaveSalesApproachRequest extends Request {
	user: IUser;
	appraisal_id: number;
	weighted_market_value?: number;
	sales_approach: ISalesApproachesRequest;
}

export interface GetSalesApproachRequest extends Request {
	user: IUser;
}
