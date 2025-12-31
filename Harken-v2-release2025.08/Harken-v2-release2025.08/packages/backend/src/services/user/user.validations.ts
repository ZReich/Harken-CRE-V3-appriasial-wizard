import Joi from 'joi';

export const usersTransactionsSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	user_id: Joi.number().allow(null).optional(),
	name: Joi.string().allow('', null).optional(),
	sf: Joi.number().allow(null).optional(),
	category: Joi.string().allow('', null).optional(), // Allowing empty string or null for optional
	type: Joi.string().allow('', null).optional(), // Allowing empty string or null for optional
});

export const userAddUpdateSchema = Joi.object().keys({
	first_name: Joi.string().min(3).max(30).optional(),
	last_name: Joi.string().min(3).max(30).optional(),
	password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).optional(),
	email_address: Joi.string().email().optional(),
	account_id: Joi.number().optional(),
	phone_number: Joi.string().optional(),
	position: Joi.string().min(3).max(30).optional(),
	qualification: Joi.string().optional().allow('', null),
	background: Joi.string().optional().allow('', null),
	affiliations: Joi.string().optional().allow('', null),
	education: Joi.string().optional().allow('', null),
	responsibility: Joi.string().optional().allow('', null),
	comp_adjustment_mode: Joi.string().optional(),
	status: Joi.string().min(3).max(30).optional(),
	users_transactions: Joi.array().items(usersTransactionsSchema).optional(),
	significant_in_pdf: Joi.number().optional(),
	// signature_image_url: Joi.any().optional(),
});

export const checkEmailSchema = Joi.object({
	id: Joi.number().optional(),
	email_address: Joi.string().email().required(),
});

export const updateUsersTransactions = Joi.object({
	comp_adjustment_mode: Joi.string().optional(),
	status: Joi.string().min(3).max(30).optional(),
	users_transactions: Joi.array().items(usersTransactionsSchema).optional(),
	account_id: Joi.number().optional(),
	significant_in_pdf: Joi.number().max(1).optional(),
});

export const userAddPersonalDataSchema = Joi.object().keys({
	first_name: Joi.string().min(3).max(30).required(),
	last_name: Joi.string().min(3).max(30).required(),
	email_address: Joi.string().email().required(),
	phone_number: Joi.string().required(),
	position: Joi.string().min(3).max(30).required(),
	qualification: Joi.string().optional().allow('', null),
	background: Joi.string().optional().allow('', null),
	affiliations: Joi.string().optional().allow('', null),
	education: Joi.string().optional().allow('', null),
	responsibility: Joi.string().optional().allow('', null),
	profile_image_url: Joi.string().optional().allow('', null),
	signature_image_url: Joi.string().optional().allow('', null),
});

export const changePwSchema = Joi.object().keys({
	new_password: Joi.string().required().min(5).label('Password'),
	confirm_password: Joi.string().required(),
});
