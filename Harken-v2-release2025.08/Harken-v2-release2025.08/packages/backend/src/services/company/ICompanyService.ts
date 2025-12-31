import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface ICompanyCreateRequest extends Request {
	user?: IUser;
	full_name: string;
	company_name: string;
	email_address: string;
	account_id: number;
}

export interface IGetCompanyRequest extends Request {
	user?: IUser;
}

export interface ICompany extends Request {
	id?: number;
	full_name: string;
	company_name: string;
	email_address: string;
	account_id: number;
}

export interface ICompanySuccess extends ISuccess {
	data: ICompany;
}

export interface ICompanyListSuccess extends ISuccess {
	data: ICompany[];
}
