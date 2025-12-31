import Joi from 'joi';

export const extraCompAmenities = Joi.object({
	id: Joi.number().optional().allow(null, ''),
	another_amenity_name: Joi.string().optional().allow(null, ''),
	subject_property_check: Joi.number().optional().allow(null, ''),
	comp_property_check: Joi.number().optional().allow(null, ''),
	another_amenity_value: Joi.number().optional().allow(null, ''),
	is_extra: Joi.number().optional().allow(null, ''),
});
