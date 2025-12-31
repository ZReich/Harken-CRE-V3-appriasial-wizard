import { ISuccess } from '../../utils/interfaces/common';
import IUser from '../../utils/interfaces/IUser';
import { Request } from 'express';

export interface IEvalPhotoPage {
	id?: number;
	evaluation_id?: number;
	image_url: string;
	caption: string;
	order: number;
}
export interface IEvalPhotoPageRequest extends Request {
	user: IUser;
}
export interface IEvaluationPhotoPages extends IEvalPhotoPageRequest {
	photos_taken_by: string;
	photo_date: string;
	photos: IEvalPhotoPage[];
}

export interface IEvalPhotoPagesSuccess<T> extends ISuccess {
	data: T;
}

export interface IUploadFile extends Express.Multer.File {
	id?: number;
}

export interface IEvalUploadPhotosRequest extends Request {
	files: IUploadFile[];
	user?: IUser;
	type: string;
}
export interface IEvalUrlSuccess {
	url: string;
}
