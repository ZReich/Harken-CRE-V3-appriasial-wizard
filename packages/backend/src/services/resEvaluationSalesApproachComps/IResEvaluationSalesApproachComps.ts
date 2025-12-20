import { ISalesCompAmenities } from '../resEvaluationSaleApproachCompAmenities/IResEvaluationSaleCompAmenitiesService';
import { ISalesCompsAdjustments } from '../resEvaluationSaleCompAdj/IResEvaluationSalesCompAdj';
import { ISaleCompsQualitativeAdj } from '../resEvaluationSaleCompsQualitativeAdj/IResEvaluationSaleCompQualitativeAdj';
import { IResComp } from '../residentialComp/IResCompService';

export interface ISalesComp {
	id?: number;
	res_evaluation_sales_approach_id?: number;
	comp_id: number;
	order: number;
	adjustment_note?: string;
	total_adjustment?: number;
	adjusted_psf?: number;
	weight?: number;
	blended_adjusted_psf?: number;
	averaged_adjusted_psf?: number;
	comp_details?: IResComp;
	comps_adjustments: ISalesCompsAdjustments[];
	comps_qualitative_adjustments: ISaleCompsQualitativeAdj[];
	extra_amenities: ISalesCompAmenities[];
	overall_comparability?: string;
}
