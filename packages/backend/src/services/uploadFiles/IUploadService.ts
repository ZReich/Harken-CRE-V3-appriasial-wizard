import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';

export interface IUploadRequest extends Request {
	file: Express.Multer.File;
	user?: IUser;
	id?: number;
	type: string;
	urlToDelete?: string;
}

export interface IDeleteRequest extends Request {
	file_path: string;
}

export interface IUploadSuccess<T> extends ISuccess {
	data: T;
}

export interface IURLSuccessData {
	url: string;
}

export interface IUploadURLSuccessData {
	id: number;
	url: string;
}

export interface IAddFile {
	file: Express.Multer.File;
	id: number;
	type: string;
}

export interface IUploadToS3 {
	fileInput: Express.Multer.File;
	entityName: string;
	objectId: number;
}

export interface IUploadFile extends Express.Multer.File {
	id?: number;
}

export interface IUploadPhotosRequest extends Request {
	files: IUploadFile[];
	user?: IUser;
	type: string;
}

export interface IPhotoPagesSuccess<T> extends ISuccess {
	data: T;
}
