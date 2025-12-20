import IUser from './IUser';
import { Response } from 'express';

export { Response };
export interface IRequest extends Request {
	user: IUser;
}

export interface ISuccess {
	message: string;
	statusCode: number;
}

export interface IError {
	message: string;
	error?: any;
	statusCode: number;
	next?: string;
	previous?: string;
	position?: string;
}

export interface ILog {
	message: any;
	location: string;
	level: string;
	error?: any;
}
export type ZoningChildren = {
	[key: string]: string;
};

export type ZoningValue = string | { name: string; children?: ZoningChildren };

export type Zoning = {
	[key: string]: ZoningValue;
};
