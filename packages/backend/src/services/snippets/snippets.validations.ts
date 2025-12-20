import Joi from 'joi';

export const snippetSchema = Joi.object().keys({
	snippets_category_id: Joi.number().required(),
	name: Joi.string().required(),
	snippet: Joi.string().required(),
});
