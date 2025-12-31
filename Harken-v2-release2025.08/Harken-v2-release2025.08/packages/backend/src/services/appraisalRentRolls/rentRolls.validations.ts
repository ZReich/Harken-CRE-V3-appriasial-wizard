import Joi from 'joi';
import DefaultEnum from '../../utils/enums/DefaultEnum';

const rentRollSummarySchema = Joi.object({
	id: Joi.number().allow(null).optional(),
	beds: Joi.number().allow(null).optional(),
	baths: Joi.number().allow(null).optional(),
	sq_ft: Joi.number().allow(null).optional(),
	unit_count: Joi.number().allow(null).optional(),
	avg_monthly_rent: Joi.number().allow(null).optional(),
});

const rentRollDetailSchema = Joi.object({
	id: Joi.number().allow(null).optional(),
	rent: Joi.number().required(),
	unit: Joi.string().required(),
	tenant_exp: Joi.string().optional().allow(null, ''),
	description: Joi.string().optional().allow(null, ''),
	lease_expiration: Joi.string().optional().allow(null, ''),
	beds: Joi.number().allow(null).optional(),
	baths: Joi.number().allow(null).optional(),
});

export const saveRentRollSchema = Joi.object({
	appraisal_id: Joi.number().required(),
	appraisal_approach_id: Joi.number().required(),
	type: Joi.string().valid(DefaultEnum.SUMMARY, DefaultEnum.DETAIL).required(),
	rent_rolls: Joi.alternatives()
		.conditional('type', {
			is: DefaultEnum.SUMMARY,
			then: Joi.array().items(rentRollSummarySchema).required(),
		})
		.conditional('type', {
			is: DefaultEnum.DETAIL,
			then: Joi.array().items(rentRollDetailSchema).required(),
		}),
});
