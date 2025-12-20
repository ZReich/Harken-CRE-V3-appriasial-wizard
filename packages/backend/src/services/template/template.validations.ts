import Joi from 'joi';
import { sectionSchema } from '../sections/sections.validations';

export const templateSchema = Joi.object({
	parent_id: Joi.number().optional().allow(null, ''),
	appraisal_id: Joi.number().optional().allow(null, ''),
	name: Joi.string().when('appraisal_id', {
		is: Joi.exist(), // Checks if appraisal_id is present and not null
		then: Joi.optional().allow(null, ''), // If appraisal_id has a value, name is optional
		otherwise: Joi.required(), // If appraisal_id is null, name is required
	}),
	description: Joi.string().optional().allow(null, ''),
});

export const reportTemplateSchema = Joi.object().keys({
	appraisal_id: Joi.number().optional().allow(null, ''),
	sections: Joi.array().items(sectionSchema).optional().allow(null, ''),
});
export const linkTempSchema = Joi.object().keys({
	appraisal_id: Joi.number().required(),
	template_id: Joi.number().required(),
});
