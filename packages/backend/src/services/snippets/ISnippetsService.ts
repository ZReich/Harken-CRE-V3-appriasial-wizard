import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface ISnippet {
	id: number;
	account_id: number;
	name: string;
	snippet: string;
	created_by?: number;
}
export interface ISnippetRequest extends Request {
	user: IUser;
}
export interface ISnippetCreateRequest extends ISnippetRequest {
	name: string;
	snippet: string;
}

export interface ISnippetSuccess<T> extends ISuccess {
	data: T;
}
