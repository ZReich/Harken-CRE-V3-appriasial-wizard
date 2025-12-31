import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';

export interface IAppraisalFilesData {
	id?: number;
	appraisal_id: number;
	type: string;
	size: number;
	height: number;
	width: number;
	title: string;
	description: string;
	dir: string;
	filename: string;
	origin: string;
	storage: string;
	order: number;
}

export interface ImageType {
	title: string;
	orientation?: string;
	page?: string | number;
	description?: string;
}

export interface IUpdateExhibits extends Request {
	user: IUser;
	fileName: string;
	fileId: number;
}

export interface IFilesPosition {
	id: number;
	order?: number;
	filename?: string;
}
export interface IUpdatePositions extends Request {
	user: IUser;
	exhibits: IPosition[];
}
export interface IPosition {
	id: number;
	order: number;
}
