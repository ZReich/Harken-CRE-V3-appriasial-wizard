import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';
import TokenTypeEnum from '../../utils/enums/TokenTypeEnum';

export interface IResetPasswordRequest extends Request {
	password: string;
	token: string;
}

export interface IAuthUserRequest extends Request {
	email_address: string;
	password: string;
}

export interface ITokenRequest extends Request {
	token: string;
}

export interface IForgotPasswordRequest extends Request {
	email_address: string;
}

export interface IAuth {
	email_address?: string;
	password?: string;
}

export interface ILoginSuccessData {
	user: IUser;
	token: string;
	refresh_token: string;
}

export interface ILoginSuccess<T> extends ISuccess {
	data: T;
}

export default interface ITokenDetails {
	id: number;
	role: number;
	account_id: number;
	expire: string;
	first_name: string;
	last_name: string;
	approved_by_admin: number;
	status: string;
	type: TokenTypeEnum;
}
