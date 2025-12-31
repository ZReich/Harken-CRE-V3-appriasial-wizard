import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';
import { ISectionItem } from '../sectionItems/ISectionItemsService';
import { ISection } from '../sections/ISectionsService';

export interface ITemplate {
	id: number;
	appraisal_id?: number;
	parent_id?: number;
	account_id: number;
	name: string;
	description: string;
	created_by: number;
	sections?: ISection[];
}

export interface ITemplateRequest extends Request {
	user: IUser;
}

export interface ITemplateCreateRequest extends ITemplateRequest {
	name?: string;
	description?: string;
	appraisal_id?: number;
	parent_id?: number;
}
export interface ITemplateSuccess<T> extends ISuccess {
	data: T;
}

export interface ITemplateListRequest extends ITemplateRequest {
	accountId?: number;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
}

export interface ITemplateListSuccess {
	template: ITemplate[];
	page: number;
	totalRecord: number;
	perPage: number;
}
export interface IReportTempSaveRequest extends ITemplateRequest {
	name: string;
	description: string;
	appraisal_id: number;
	parent_id?: number;
	section: ISection[];
	item: ISectionItem[];
}
export interface linkExistTempRequest extends ITemplateRequest {
	appraisal_id?: number;
	template_id?: number;
}
