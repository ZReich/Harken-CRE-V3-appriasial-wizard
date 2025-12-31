import Joi from 'joi';

export const createClientSchema = Joi.object().keys({
	account_id: Joi.number().optional().allow('', null),
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),
	email_address: Joi.string().optional().allow('', null),
	title: Joi.string().optional().allow('', null),
	street_address: Joi.string().optional().allow('', null),
	city: Joi.string().optional().allow('', null),
	state: Joi.string().optional().allow('', null),
	zipcode: Joi.string().optional().allow('', null),
	place_id: Joi.string().optional().allow('', null),
	company: Joi.string().optional().allow('', null),
	phone_number: Joi.string().optional().allow('', null),
	shared: Joi.number().optional().allow('', null),
});
