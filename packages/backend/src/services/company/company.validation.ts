import Joi from 'joi';

export const createCompanySchema = Joi.object().keys({
	account_id: Joi.number().optional(),
	full_name: Joi.string().optional(),
	company_name: Joi.string().required(),
	email_address: Joi.string().optional(),
});
