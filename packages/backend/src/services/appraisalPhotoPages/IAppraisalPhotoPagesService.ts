import { ISuccess } from '../../utils/interfaces/common';
import IUser from '../../utils/interfaces/IUser';
import { Request } from 'express';

export interface IPhotoPage {
	id?: number;
	appraisal_id?: number;
	image_url: string;
	caption: string;
	order: number;
}
export interface IPhotoPageRequest extends Request {
	user: IUser;
}
export interface IAppraisalPhotoPages extends IPhotoPageRequest {
	photos_taken_by: string;
	photo_date: string;
	photos: IPhotoPage[];
}

export interface IPhotoPagesSuccess<T> extends ISuccess {
	data: T;
}

export interface IUploadFile extends Express.Multer.File {
	id?: number;
}

export interface IUploadPhotosRequest extends Request {
	files: IUploadFile[];
	user?: IUser;
	type: string;
}
export interface IUrlSuccess {
	url: string;
}
