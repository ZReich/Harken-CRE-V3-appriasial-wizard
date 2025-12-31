import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface ISnippetsCategory {
	id: number;
	account_id: number;
	category_name: string;
	created_by?: number;
}
export interface ISnippetsCategoryRequest extends Request {
	user: IUser;
}
export interface IAddSnippetsCategoryRequest extends ISnippetsCategoryRequest {
	category_name: string;
}

export interface ISnippetsCategorySuccess<T> extends ISuccess {
	data: T;
}
