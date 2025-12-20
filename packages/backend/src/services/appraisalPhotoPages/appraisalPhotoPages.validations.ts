import Joi from 'joi';
import { UploadEnum } from '../../utils/enums/DefaultEnum';
export const photoPagesSchema = Joi.object().keys({
	id: Joi.number().optional().allow(null),
	image_url: Joi.string().required(),
	caption: Joi.string().optional().allow(''),
	order: Joi.number().optional().allow(''),
});

export const savePhotoPagesSchema = Joi.object().keys({
	photos_taken_by: Joi.string().optional().allow(''),
	photo_date: Joi.string().optional().allow(''),
	photos: Joi.array().items(photoPagesSchema).optional(),
});

export const uploadMultiplePhotosSchema = Joi.object({
	type: Joi.string()
		.required()
		.valid(UploadEnum.COMPS, UploadEnum.USERS, UploadEnum.ACCOUNTS, UploadEnum.APPRAISAL),
});
