import { ICapApproach } from '../evaluationCapApproach/IEvaluationCapApproach';
import { ICostApproach } from '../evaluationCostApproach/IEvaluationCostApproach';
import { IEvaluationIncomeApproach } from '../evaluationIncomeApproach/IEvaluationIncomeApproach';
import { ILeaseApproach } from '../evaluationLeaseApproach/IEvaluationLeaseService';
import { IMultiFamilyApproach } from '../evaluationMultiFamilyApproach/IEvaluationMultiFamily';
import { IEvalSalesApproach } from '../evaluationSaleApproach/IEvaluationSalesService';

export interface IEvaluationScenario {
	id?: number;
	evaluation_id: number;
	name: string;
	has_income_approach?: number;
	has_lease_approach?: number;
	has_cap_approach?: number;
	has_multi_family_approach?: number;
	has_sales_approach?: number;
	has_cost_approach?: number;
	evaluation_income_approach?: IEvaluationIncomeApproach;
	evaluation_sales_approach?: IEvalSalesApproach;
	evaluation_cost_approach?: ICostApproach;
	evaluation_lease_approach?: ILeaseApproach;
	evaluation_cap_approach?: ICapApproach;
	evaluation_multi_family_approach?: IMultiFamilyApproach;
	weighted_market_value: number;
	rounding?: number;
}
