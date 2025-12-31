import { IComp } from '../comps/ICompsService';
import { ICostCompsAdjustment } from '../evaluationCostApproachCompAdj/IEvaluationCostApproachCompAdj';

export interface ICostComp {
	id?: number;
	evaluation_cost_approach_id: number;
	comp_id: number;
	order: number;
	total_adjustment: number;
	adjusted_psf: number;
	weight: number;
	comps_adjustments: ICostCompsAdjustment[];
	comp_details?: IComp;
}
