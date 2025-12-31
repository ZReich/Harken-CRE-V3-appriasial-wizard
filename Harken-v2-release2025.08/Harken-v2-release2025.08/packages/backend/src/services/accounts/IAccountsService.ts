import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface IAccountsListRequest extends Request {
	user: IUser;
	page: number;
	search?: string;
	sortByColumn?: string;
	sortOrder?: string;
	limit: number;
}
export default interface IAccount {
	id: number;
	name: string;
	street_address: string;
	city: string;
	state: string;
	zipcode: number;
	phone_number: string;
	detail: string;
	logo_url: string;
	manager_email: string;
	theme: string;
	per_user_price: number;
	subscription_id?: string;
	customer_id?: string;
	subscription?: string;
	first_login?: number;
	enable_residential?: string;
	is_deleted?: number;
	primary_color: string;
	secondary_color: string;
	tertiary_color: string;
	share_clients?: number;
}

export interface IAccountSuccessData {
	accounts: IAccount[];
	totalRecords: number;
}

export interface IAccountListSuccessData {
	accounts: IAccount;
	perPage: number;
	page: number;
	totalRecords: number;
}
export interface IAccountSuccess<T> extends ISuccess {
	data: T;
}

export interface IContactRequest extends Request {
	user: IUser;
	id?: number;
	name?: string;
	phone_number?: string;
	street_address?: string;
	city?: string;
	state?: string;
	zipcode?: number;
	detail?: string;
	share_clients?: number;
}

export interface IUpdateThemeRequest extends Request {
	user: IUser;
	id: number;
	logo_url?: string;
	manager_email?: string;
	theme?: string;
	per_user_price?: number;
	primary_color: string;
	secondary_color: string;
	tertiary_color: string;
}
export interface IAccountsRequest {
	page: number;
	limit: number;
	search?: string;
	orderBy?: string;
	orderByColumn: string;
}
export interface IGetAccountRequest extends Request {
	user?: IUser;
}
export interface ISendInviteRequest extends Request {
	user?: IUser;
	id: number;
	emails: [];
}
