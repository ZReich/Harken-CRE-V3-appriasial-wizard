import Joi from 'joi';

export const propertyUnitsSchema = Joi.object({
	id: Joi.number().allow(null).optional(),
	beds: Joi.number().allow(null).optional(),
	baths: Joi.number().allow(null).optional(),
	sq_ft: Joi.number().allow(null).optional(),
	unit_count: Joi.number().allow(null).optional(), // Allowing empty string or null for optional
	avg_monthly_rent: Joi.number().allow(null).optional(), // Allowing empty string or null for optional
});
