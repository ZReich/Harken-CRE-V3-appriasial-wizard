import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { IAppraisalIncomeApproach } from '../appraisalIncomeApproach/IAppraisalIncomeApproach';
import { ISalesApproach } from '../appraisalSalesApproach/IAppraisalSalesService';
import { ICostApproach } from '../appraisalCostApproach/IAppraisalCostApproach';
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import { ILeaseApproach } from '../appraisalLeaseApproach/IAppraisalLeaseService';
import IRentRolls from '../appraisalRentRolls/IRentRolls';

export interface IAppraisalApproach {
	id: number;
	appraisal_income_approach?: IAppraisalIncomeApproach;
	appraisal_sales_approach?: ISalesApproach;
	appraisal_cost_approach?: ICostApproach;
	appraisal_lease_approach?: ILeaseApproach;
	appraisal_rent_roll?: IRentRolls;
	appraisal_id: number;
	type: ApproachType;
	name: string;
}

export interface IAppraisalApproachCreateUpdateRequest extends Request {
	user: IUser;
	id?: number;
	type: string;
	name: string;
}
export type ApproachType =
	| AppraisalsEnum.INCOME
	| AppraisalsEnum.COST
	| AppraisalsEnum.SALE
	| AppraisalsEnum.LEASE
	| AppraisalsEnum.RENT_ROLL;
export interface ResponseApproachObject {
	income?: boolean;
	sale?: boolean;
	cost?: boolean;
}
