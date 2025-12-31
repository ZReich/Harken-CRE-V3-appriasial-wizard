import { IComp } from '../comps/ICompsService';
import { ISalesCompsAdjustments } from '../evaluationSaleCompAdj/IEvaluationSalesCompAdj';
import { ISaleCompsQualitativeAdj } from '../evaluationSaleCompsQualitativeAdj/IEvaluationSaleCompQualitativeAdj';

export interface ISalesComp {
	id?: number;
	evaluation_sales_approach_id?: number;
	comp_id: number;
	order: number;
	adjustment_note?: string;
	total_adjustment?: number;
	adjusted_psf?: number;
	weight?: number;
	blended_adjusted_psf?: number;
	averaged_adjusted_psf?: number;
	comp_details?: IComp;
	comps_adjustments: ISalesCompsAdjustments[];
	comps_qualitative_adjustments: ISaleCompsQualitativeAdj[];
	overall_comparability?: string;
}
