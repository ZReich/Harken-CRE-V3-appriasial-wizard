import Joi from 'joi';
import { UploadEnum } from '../../utils/enums/DefaultEnum';

export const uploadFileSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	type: Joi.string()
		.required()
		.valid(
			UploadEnum.COMPS,
			UploadEnum.USERS,
			UploadEnum.ACCOUNTS,
			UploadEnum.APPRAISAL,
			UploadEnum.EVALUATION,
			UploadEnum.RES_EVALUATION,
		),
	urlToDelete: Joi.string().optional().allow(''),
});

export const deleteFileSchema = Joi.object({
	file_path: Joi.string().required(),
});
