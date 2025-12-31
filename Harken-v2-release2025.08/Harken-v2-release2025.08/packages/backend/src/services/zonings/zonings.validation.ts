import Joi from 'joi';
import CompsEnum from '../../utils/enums/CompsEnum';

export const zoningCompSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	zone: Joi.string().required(),
	sub_zone: Joi.string().required(),
	sub_zone_custom: Joi.string().when('sub_zone', {
		is: CompsEnum.TYPE_MY_OWN,
		then: Joi.required(),
		otherwise: Joi.optional().allow(''),
	}),
	sq_ft: Joi.number().required(),
	unit: Joi.number().when(CompsEnum.COMPARISON_BASIS, {
		is: CompsEnum.UNIT,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	bed: Joi.number().when(CompsEnum.COMPARISON_BASIS, {
		is: CompsEnum.BED,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null),
	}),
	weight_sf: Joi.number().optional().allow(null),
});
