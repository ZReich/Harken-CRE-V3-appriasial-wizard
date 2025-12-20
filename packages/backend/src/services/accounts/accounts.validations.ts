import Joi from 'joi';

export const accountContactSchema = Joi.object().keys({
	name: Joi.string().required(),
	phone_number: Joi.string().optional().allow(null, ''),
	street_address: Joi.string().optional().allow(null, ''),
	city: Joi.string().optional().allow(null, ''),
	state: Joi.string().optional().allow(null, ''),
	zipcode: Joi.number().optional().allow(null),
	detail: Joi.string().optional().allow(null, ''),
	customer_id: Joi.string().optional().allow(null, ''),
	share_clients: Joi.number().optional().allow(null),
});

export const updateThemeSchema = Joi.object().keys({
	logo_url: Joi.string().optional().allow(null, ''),
	manager_email: Joi.string().optional().allow(null, ''),
	theme: Joi.string().required(),
	per_user_price: Joi.number().optional().allow(null),
	primary_color: Joi.string().required(),
	secondary_color: Joi.string().required(),
	tertiary_color: Joi.string().required()
});

export const sendInviteSchema = Joi.object().keys({
	id: Joi.number().required(),
	emails: Joi.array().required(),
});

export const accountListSchema = Joi.object().keys({
	page: Joi.number().required(),
	limit: Joi.number().required(),
	search: Joi.string().optional().allow(null, ''),
	orderBy: Joi.string().optional().allow(null, ''),
	orderByColumn: Joi.string().optional().allow(null, ''),
});
