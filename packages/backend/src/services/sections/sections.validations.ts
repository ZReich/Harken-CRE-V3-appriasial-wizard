import Joi from 'joi';
import { sectionItemSchema, subSectionItemSchema } from '../sectionItems/sectionItem.validations';

export const subsectionSchema = Joi.object().keys({
	id: Joi.number().optional().allow(null),
	template_id: Joi.number().allow(null),
	parent_id: Joi.number().optional().allow(null),
	title: Joi.string().required(),
	order: Joi.number().optional().allow(null),
	items: Joi.array().items(subSectionItemSchema).optional().allow(null, ''),
});

export const sectionSchema = Joi.object().keys({
	id: Joi.number().optional().allow(null, ''),
	template_id: Joi.number().allow(null),
	parent_id: Joi.number().optional().allow(null),
	title: Joi.string().required(),
	order: Joi.number().optional().allow(null),
	items: Joi.array().items(sectionItemSchema).optional().allow(null, ''),
});
