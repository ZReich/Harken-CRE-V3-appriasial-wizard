import Joi from 'joi';

export const snippetsCategorySchema = Joi.object().keys({
	category_name: Joi.string().required(),
});
