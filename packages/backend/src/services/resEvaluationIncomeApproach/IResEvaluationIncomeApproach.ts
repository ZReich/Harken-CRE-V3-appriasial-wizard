import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { IResIncomeSource } from '../resEvaluationIncomeSource/IResEvaluationIncomeSourceService';
import { IResOtherIncomeSource } from '../resEvaluationIncomeOtherSources/IResEvaluationIncomeOtherSource';
import { IResOperatingExpense } from '../resEvaluationOperatingExpenses/IResEvaluationOperatingExpenseService';

export interface IResEvaluationIncomeApproach {
	id: number;
	res_evaluation_id?: number;
	res_evaluation_scenario_id: number;
	eval_weight?: number;
	income_source: string;
	operating_expense: string;
	net_income: string;
	indicated_value_range: string;
	indicated_value_psf: string;
	incremental_value: number;
	incremental_value_monthly?: number;
	total: string;
	vacancy?: number;
	adjusted_gross_amount?: number;
	vacant_amount?: number;
	date_created: Date;
	last_updated?: Date;
	monthly_capitalization_rate?: number;
	annual_capitalization_rate?: number;
	sq_ft_capitalization_rate?: number;
	total_net_income?: number;
	indicated_range_monthly?: number;
	indicated_range_annual?: number;
	indicated_range_sq_feet?: number;
	indicated_psf_monthly?: number;
	indicated_psf_annual?: number;
	indicated_psf_sq_feet?: number;
	total_monthly_income?: number;
	total_annual_income?: number;
	total_oe_annual_amount?: number;
	total_oe_gross?: number;
	total_sq_ft?: number;
	total_rent_sq_ft?: number;
	total_oe_per_square_feet?: number;
	incomeSources: IResIncomeSource[];
	otherIncomeSources: IResOtherIncomeSource[];
	operatingExpenses: IResOperatingExpense[];
	other_total_monthly_income: number;
	other_total_annual_income: number;
	other_total_sq_ft: number;
	income_notes: string;
	expense_notes: string;
	cap_rate_notes: string;
}

export interface IResEvaluationIncomeSaveRequest extends Request, IResEvaluationIncomeApproach {
	user: IUser;
}

export interface IEvalIncomeApproachRequest extends Request {
	user?: IUser;
}
export interface handleIncomeSourceOrOpExp {
	incomeSources: IResIncomeSource[];
	otherIncomeSources: IResOtherIncomeSource[];
	operatingExpenses: IResOperatingExpense[];
	evaluationIncomeApproachId: number;
}

export interface IIncomeApproachesWeightRequest {
	id?: number;
	res_evaluation_id: number;
	res_evaluation_scenario_id: number;
	eval_weight: number;
}
