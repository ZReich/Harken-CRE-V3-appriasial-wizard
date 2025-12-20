import { IComp } from '../comps/ICompsService';
import { ILeaseCompsAdjustments } from '../evaluationLeaseCompAdjustments/IEvaluationLeaseCompAdj';
import { ILeaseCompsQualitativeAdj } from '../evaluationLeaseCompsQualitativeAdj/IEvaluationLeaseCompQualitativeAdj';

export interface ILeaseComp {
	id?: number;
	evaluation_lease_approach_id?: number;
	comp_id: number;
	order: number;
	adjustment_note?: string;
	total_adjustment?: number;
	adjusted_psf?: number;
	weight?: number;
	blended_adjusted_psf?: number;
	averaged_adjusted_psf?: number;
	comp_details?: IComp;
	comps_adjustments: ILeaseCompsAdjustments[];
	comps_qualitative_adjustments: ILeaseCompsQualitativeAdj[];
}
