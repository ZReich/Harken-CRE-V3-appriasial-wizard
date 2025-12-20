import Joi from 'joi';

export const loginSchema = Joi.object().keys({
	email_address: Joi.string().required(),
	password: Joi.string().required(),
});

export const forgotPwSchema = Joi.object().keys({
	email_address: Joi.string().required(),
});

export const resetPwSchema = Joi.object().keys({
	password: Joi.string().required().min(5).label('Password'),
	token: Joi.string().required(),
});
