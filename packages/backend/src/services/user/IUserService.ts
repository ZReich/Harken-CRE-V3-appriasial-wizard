import IUsersTransactions from '../../utils/interfaces/IUsersTransactions';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess, Response } from '../../utils/interfaces/common';
import { Request } from 'express';

export interface IRegisterUserRequest extends Request {
	id?: number;
	first_name?: string;
}

/********************************************************************************
 *  Get User
 ********************************************************************************/

export interface IGetUserRequest extends Request {
	id?: number;
	user?: IUser;
}

export interface IGetUserResponse extends Response {
	user?: IUser;
}

export interface IUpdateTransactionRequest extends Request {
	id?: number;
	user?: IUser;
	comp_adjustment_mode?: string;
	status?: string;
	users_transactions: IUsersTransactions[];
	account_id?: number;
	significant_in_pdf: number;
}

export interface IAddPersonalDataRequest extends Request {
	id?: number;
	user?: IUser;
	first_name: string;
	last_name: string;
	email_address: string;
	phone_number: string;
	position: string;
	qualification?: string;
	background?: string;
	affiliations?: string;
	education?: string;
	responsibility?: string;
	profile_image_url?: string;
	signature_image_url?: string;
}

export interface IUpdateUserEmail extends Request {
	email_address?: string;
	user: IUser;
}

export interface IUserSuccess<T> extends ISuccess {
	data: T;
}

export interface IProfileSuccessData {
	user: IUser;
}
export interface IUserListSuccess {
	users: IUser;
	page: number;
	totalRecords: number;
	perPage: number;
}
export interface IEmailSuccessData {
	email: string;
}

export interface IChangePasswordRequest extends Request {
	user: IUser;
	new_password: string;
	confirm_password: string;
}

export interface IUsersListRequest extends Request {
	user: IUser;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
}
export interface IUserRequest extends Request {
	user: IUser;
}
