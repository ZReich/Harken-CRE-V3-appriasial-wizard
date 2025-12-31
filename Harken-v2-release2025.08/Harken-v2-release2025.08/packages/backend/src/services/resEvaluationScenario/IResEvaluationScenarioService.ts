import { ICostApproach } from '../resEvaluationCostApproach/IResEvaluationCostApproach';
import { IResEvaluationIncomeApproach } from '../resEvaluationIncomeApproach/IResEvaluationIncomeApproach';
import { IEvalSalesApproach } from '../resEvaluationSaleApproach/IResEvaluationSalesService';

export interface IResEvaluationScenario {
	id?: number;
	name: string;
	has_income_approach?: number;
	has_sales_approach?: number;
	has_cost_approach?: number;
	res_evaluation_income_approach?: IResEvaluationIncomeApproach;
	res_evaluation_sales_approach?: IEvalSalesApproach;
	res_evaluation_cost_approach?: ICostApproach;
	weighted_market_value: number;
	rounding: number;
}
