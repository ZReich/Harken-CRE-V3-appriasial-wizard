import Joi from 'joi';

export const wikipediaInfoSchema = Joi.object({
	string: Joi.string().required(),
});

export const searchPropertySchema = Joi.object({
	streetAddress: Joi.string().required(),
	city: Joi.string().optional(),
	state: Joi.string().optional(),
	zipCode: Joi.string().required(),
	apn: Joi.string().optional(),
});

export const getPropertySchema = Joi.object({
	clipId: Joi.string().optional(),
	propertyId: Joi.number().optional(),
});