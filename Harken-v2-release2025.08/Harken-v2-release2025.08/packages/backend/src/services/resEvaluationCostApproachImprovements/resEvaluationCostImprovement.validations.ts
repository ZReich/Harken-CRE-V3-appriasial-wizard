import Joi from 'joi';

export const improvementSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	zoning_id: Joi.number().optional().allow(null),
	type: Joi.string().optional().allow(null, ''),
	sf_area: Joi.number().optional().allow(null),
	rsm_code: Joi.number().optional().allow(null),
	adjusted_psf: Joi.number().optional().allow(null),
	depreciation: Joi.number().optional().allow(null),
	adjusted_cost: Joi.number().optional().allow(null),
	depreciation_amount: Joi.number().optional().allow(null),
	structure_cost: Joi.number().optional().allow(null),
	subject_lf: Joi.number().optional().allow(null),
	comp_base: Joi.number().optional().allow(null),
	comp_lf: Joi.number().optional().allow(null),
	perimeter_adj: Joi.number().optional().allow(null),
	location_adj: Joi.number().optional().allow(null),
});
