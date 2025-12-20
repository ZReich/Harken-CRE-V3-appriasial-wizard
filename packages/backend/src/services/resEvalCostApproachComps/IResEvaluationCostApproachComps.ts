import { ICostCompsAdjustment } from '../resEvaluationCostApproachCompAdj/IResEvaluationCostApproachCompAdj';
import { IResComp } from '../residentialComp/IResCompService';

export interface ICostComp {
	id?: number;
	res_evaluation_cost_approach_id: number;
	comp_id: number;
	order: number;
	total_adjustment: number;
	adjusted_psf: number;
	weight: number;
	comps_adjustments: ICostCompsAdjustment[];
	comp_details?: IResComp;
}
