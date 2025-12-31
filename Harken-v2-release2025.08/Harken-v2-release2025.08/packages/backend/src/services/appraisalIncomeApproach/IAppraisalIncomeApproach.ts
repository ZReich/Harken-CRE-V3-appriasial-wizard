import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { IIncomeSource } from '../appraisalIncomeSource/IAppraisalIncomeSourceService';
import { IOperatingExpense } from '../appraisalOperatingExpenses/IAppraisalOperatingExpenseService';
import { IOtherIncomeSource } from '../appraisalIncomeOtherSource/IAppraisalIncomeOtherSource';

export interface IAppraisalIncomeApproach {
	id: number;
	appraisal_id: number;
	appraisal_approach_id: number;
	eval_weight: number;
	net_income: string;
	indicated_value_range: string;
	indicated_value_psf: string;
	incremental_value: number;
	incremental_value_monthly: number;
	total: string;
	vacancy: number;
	adjusted_gross_amount: number;
	vacant_amount: number;
	monthly_capitalization_rate: number;
	annual_capitalization_rate: number;
	unit_capitalization_rate: number;
	sq_ft_capitalization_rate: number;
	bed_capitalization_rate: number;
	high_capitalization_rate: number;
	total_net_income: number;
	indicated_range_monthly: number;
	indicated_range_annual: number;
	indicated_range_unit: number;
	indicated_range_sq_feet: number;
	indicated_range_bed: number;
	indicated_psf_monthly: number;
	indicated_psf_annual: number;
	indicated_psf_unit: number;
	indicated_psf_sq_feet: number;
	indicated_psf_bed: number;
	total_monthly_income: number;
	total_annual_income: number;
	total_rent_unit: number;
	total_unit: number;
	total_oe_annual_amount: number;
	total_oe_gross: number;
	total_oe_per_unit: number;
	total_sq_ft: number;
	total_rent_sq_ft: number;
	total_oe_per_square_feet: number;
	total_rent_bed: number;
	total_oe_per_bed: number;
	total_bed: number;
	income_notes: string;
	expense_notes: string;
	cap_rate_notes: string;
	other_total_monthly_income: number;
	other_total_annual_income: number;
	other_total_sq_ft: number;
	incomeSources: IIncomeSource[];
	operatingExpenses: IOperatingExpense[];
	otherIncomeSources: IOtherIncomeSource[];
}
export interface IAppraisalIncomeCreateUpdateRequest extends Request, IAppraisalIncomeApproach {
	user: IUser;
}

export interface IGetIncomeApproachRequest extends Request {
	user?: IUser;
}
export interface handleIncomeSourceOrOpExp {
	incomeSources: IIncomeSource[];
	otherIncomeSources: IOtherIncomeSource[];
	operatingExpenses: IOperatingExpense[];
	appraisalIncomeApproachId: number;
}
export interface IIncomeApproachHtml {
	appraisalApproachId: number;
	comparisonBase: string;
	appraisalId: number;
	analysisType?: string;
	compType?: string;
}
