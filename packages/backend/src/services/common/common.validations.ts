import Joi from 'joi';

export const wikipediaInfoSchema = Joi.object({
	string: Joi.string().required(),
});
