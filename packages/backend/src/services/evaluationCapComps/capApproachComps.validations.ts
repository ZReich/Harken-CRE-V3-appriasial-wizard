import Joi from 'joi';

export const capCompSchema = Joi.object({
	id: Joi.number().allow(null).optional(),
	comp_id: Joi.number().required(),
	order: Joi.number().allow(null).optional(),
	cap_rate: Joi.number().allow(null).optional(),
	weighting_note: Joi.string().allow(null, '').optional(),
	weight: Joi.number().allow(null, '').optional(),
});
