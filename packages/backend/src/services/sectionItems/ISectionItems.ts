import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface ISectionItem {
	id?: number;
	section_id: number;
	type: string;
	content: string;
	order: number;
	subsections?: any;
}
export interface ISectionItemRequest extends Request {
	user: IUser;
}
export interface ISectionItemCreateRequest extends ISectionItemRequest {
	template_id?: number;
	parent_id: number;
	title: string;
	order: number;
}

export interface ISectionItemSuccess<T> extends ISuccess {
	data: T;
}
