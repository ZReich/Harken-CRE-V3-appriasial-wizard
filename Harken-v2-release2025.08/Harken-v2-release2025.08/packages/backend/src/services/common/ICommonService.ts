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
export interface ISearchPropertyRequest extends Request {
	streetAddress: string;
	city: string;
	state: string;
	zipCode: string;
	apn: string;
}

export interface ICoreLogicTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface ICoreLogicProperty {
	id: string;
	address: {
		streetAddress: string;
		city: string;
		state: string;
		zipCode: string;
	};
	parcel: {
		apn: string;
	};
	legal: {
		legalDescription: string;
	};
	owner: {
		name: string;
	};
	assessment: {
		totalValue: number;
		landValue: number;
		improvementValue: number;
	};
	characteristics: {
		buildingArea: number;
		lotSize: number;
		yearBuilt: number;
		bedrooms: number;
		bathrooms: number;
	};
}

export interface ICoreLogicSearchResponse {
	items: ICoreLogicProperty[];
	totalCount: number;
	hasMoreResults: boolean;
}

export interface ICoreLogicPropertySearchSuccess extends ISuccess {
	data: ICoreLogicSearchResponse;
}

export interface IGetPropertyRequest extends Request {
	clipId?: string;
	propertyId?: number;
}

export interface ICoreLogicPropertyGetSuccess extends ISuccess {
	data: any;
}
