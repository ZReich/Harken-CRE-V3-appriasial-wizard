import { ISaleCompsQualitativeAdj } from '../appraisalSaleCompsQualitativeAdj/IAppraisalSaleCompQualitativeAdj';
import { ISalesCompsAdjustments } from '../appraisalSalesCompAdjustments/IAppraisalSalesCompAdj';
import { IComp } from '../comps/ICompsService';

export interface ISalesComp {
	id?: number;
	appraisal_sales_approach_id?: number;
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
