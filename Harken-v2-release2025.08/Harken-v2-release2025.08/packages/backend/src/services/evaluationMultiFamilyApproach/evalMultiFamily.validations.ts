import Joi from 'joi';
import { comparisonAttributeSchema } from '../evaluations/evaluations.validations';

const subAdjustmentsSchema = Joi.object({
	adj_key: Joi.string().optional().allow(null, ''),
	adj_value: Joi.string().optional().allow(null, ''),
});
const compsAdjustmentsSchema = Joi.object({
	adj_key: Joi.string().optional().allow(null, ''),
	adj_value: Joi.number().optional().allow(null, ''),
});

const compSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	comp_id: Joi.number().required(),
	order: Joi.number().required(),
	property_unit: Joi.string().optional().allow(null, ''),
	property_unit_id: Joi.number().optional().allow(null),
	adjustment_note: Joi.string().optional().allow(null, ''),
	total_adjustment: Joi.number().optional().allow(null),
	avg_monthly_rent: Joi.number().optional().allow(null),
	adjusted_psf: Joi.number().optional().allow(null),
	weight: Joi.number().optional().allow(null),
	adjusted_montly_val: Joi.number().optional().allow(null),
	blended_adjusted_psf: Joi.number().optional().allow(null),
	averaged_adjusted_psf: Joi.number().optional().allow(null),
	comps_adjustments: Joi.array().items(compsAdjustmentsSchema).optional().allow(null),
	overall_comparability: Joi.string().optional().allow(null, ''),
});
export const saveMultiFamilyApproachSchema = Joi.object({
	evaluation_id: Joi.number().required(),
	position: Joi.string().optional().allow(null),
	multi_family_approach: Joi.object({
		id: Joi.number().optional().allow(null),
		evaluation_id: Joi.number().optional().allow(null),
		evaluation_scenario_id: Joi.number().required(),
		notes: Joi.string().optional().allow(null),
		high_rental_rate: Joi.number().optional().allow(null),
		low_rental_rate: Joi.number().optional().allow(null),
		subject_property_adjustments: Joi.array().items(subAdjustmentsSchema).optional().allow(null),
		comps: Joi.array().items(compSchema).optional().allow(null),
		comparison_attributes: Joi.array().items(comparisonAttributeSchema).optional().allow(null),
	}).required(),
});
