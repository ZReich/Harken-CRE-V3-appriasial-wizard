import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface IGetRequest extends Request {
	user?: IUser;
}

export interface IStates {
	code: string;
	name: string;
	status: number;
}

export interface IStatesSuccess extends ISuccess {
	data: IStates;
}

export interface IStateListSuccess extends ISuccess {
	data: IStates[];
}

export interface IGlobalOptionsCode {
	global_code_category_id: number;
	code: string;
	name: string;
	parent_id: number;
	sub_options: IGlobalSubOptionsCode[];
}
export interface IGlobalSubOptionsCode {
	global_code_category_id: number;
	code: string;
	name: string;
	parent_id: number;
}
export interface IGlobalCode {
	type: string;
	label: string;
	options: IGlobalOptionsCode[];
}
export interface IGlobalCodesListSuccess extends ISuccess {
	data: IGlobalCode[];
}
export interface IGetWikipediaInfoRequest extends Request {
	user: IUser;
	string: string;
}
export interface IWikipediaSuccess<T> extends ISuccess {
	data: T;
}
