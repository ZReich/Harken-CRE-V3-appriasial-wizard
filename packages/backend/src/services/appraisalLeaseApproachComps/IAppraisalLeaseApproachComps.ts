import { ILeaseCompsAdjustments } from '../appraisalLeaseCompAdjustments/IAppraisalLeaseCompAdj';
import { ILeaseCompsQualitativeAdj } from '../appraisalLeaseCompsQualitativeAdj/IAppraisalLeaseCompQualitativeAdj';
import { IComp } from '../comps/ICompsService';

export interface ILeaseComp {
	id?: number;
	appraisal_lease_approach_id?: number;
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
