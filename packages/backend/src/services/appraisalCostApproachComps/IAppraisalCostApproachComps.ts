import { ICostCompsAdjustment } from '../appraisalCostApproachCompAdj/IAppraisalCostApproachCompAdj';
import { IComp } from '../comps/ICompsService';

export interface ICostComp {
	id?: number;
	appraisal_cost_approach_id: number;
	comp_id: number;
	order: number;
	total_adjustment: number;
	adjusted_psf: number;
	weight: number;
	comps_adjustments: ICostCompsAdjustment[];
	comp_details?: IComp;
}
