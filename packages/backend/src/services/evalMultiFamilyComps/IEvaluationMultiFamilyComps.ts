import { IComp } from '../comps/ICompsService';
import { IMultiFamilyCompsAdjustment } from '../evaluationMultiFamilyCompAdj/IEvaluationMultiFamilyCompAdj';

export interface IMultiFamilyComp {
	id?: number;
	evaluation_multi_family_approach_id: number;
	comp_id: number;
	order: number;
	property_unit: string;
	property_unit_id: number;
	avg_monthly_rent: number;
	total_adjustment: number;
	adjusted_montly_val: number;
	comps_adjustments: IMultiFamilyCompsAdjustment[];
	comp_details?: IComp;
}
