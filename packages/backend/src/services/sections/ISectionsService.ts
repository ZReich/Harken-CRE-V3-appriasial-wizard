import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';
import { ISectionItem } from '../sectionItems/ISectionItemsService';

export interface ISection {
	id?: number;
	template_id: number;
	parent_id?: number;
	title: string;
	order?: number;
	subsections?: ISubSection[];
	items?: ISectionItem[];
}
export interface ISubSection {
	id?: number;
	template_id: number;
	parent_id?: number;
	title: string;
	order: number;
	items?: ISectionItem[];
}
export interface ISectionRequest extends Request {
	user: IUser;
}
export interface ISectionCreateRequest extends ISectionRequest {
	template_id?: number;
	parent_id: number;
	title: string;
	order: number;
}

export interface ISectionSuccess<T> extends ISuccess {
	data: T;
}
