import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface IClientCreateRequest extends Request {
	user?: IUser;
	account_id?: number;
	first_name: string;
	last_name: string;
	title?: string;
	street_address?: string;
	city?: string;
	state?: string;
	zipcode?: string;
	place_id?: string;
	company?: string;
	phone_number?: string;
	email_address: string;
	shared?: number;
}

export interface IGetClientsRequest extends Request {
	user?: IUser;
}

export interface IClient {
	id?: number;
	user_id: number;
	account_id?: number;
	first_name: string;
	last_name: string;
	title: string;
	street_address: string;
	city: string;
	state: string;
	zipcode: string;
	place_id: string;
	company: string;
	phone_number: string;
	email_address: string;
	shared: number;
}

export interface IClientSuccess extends ISuccess {
	data: IClient;
}

export interface IClientListSuccess extends ISuccess {
	data: IClient[];
}

export interface IClientsListRequest extends Request {
	user?: IUser;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
}
export interface IGetClientListSuccess {
	clients: IClient;
	page: number;
	totalRecords: number;
	perPage: number;
}

export interface IClientsSuccess<T> extends ISuccess {
	data: T;
}
