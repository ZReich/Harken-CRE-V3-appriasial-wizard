import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface IMergeFields {
	id?: number;
	key: any;
	tag: any;
	field: string;
	type: string | null;
}
export interface IMergeFieldsRequest extends Request {
	user: IUser;
}
export interface IMergeFieldsListRequest extends IMergeFieldsRequest {
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
}

export interface IMergeFieldsSuccess<T> extends ISuccess {
	data: T;
}
export interface CheckType {
	income?: boolean;
	cost?: boolean;
	sale?: boolean;
	lease?: boolean;
	rent_roll?: boolean;
	type?: null;
}
export interface IMergeFieldDataRequest extends IMergeFieldsRequest {
	appraisal_id: number;
	merge_fields: [];
}
