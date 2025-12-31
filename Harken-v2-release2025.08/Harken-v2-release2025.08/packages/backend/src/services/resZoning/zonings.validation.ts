import Joi from 'joi';
import CompsEnum from '../../utils/enums/CompsEnum';

export const resZoningCompSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	zone: Joi.string().required(),
	sub_zone: Joi.string().required(),
	sub_zone_custom: Joi.string().when('sub_zone', {
		is: CompsEnum.TYPE_MY_OWN,
		then: Joi.required(),
		otherwise: Joi.optional().allow(null, ''),
	}),
	total_sq_ft: Joi.number().required(),
	gross_living_sq_ft: Joi.number().required(),
	basement_finished_sq_ft: Joi.number().required(),
	basement_unfinished_sq_ft: Joi.number().required(),
	weight_sf: Joi.number().required(),
});
