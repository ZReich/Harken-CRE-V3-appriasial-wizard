import Joi from 'joi';
import { capCompSchema } from '../evaluationCapComps/capApproachComps.validations';
import { comparisonAttributeSchema } from '../evaluations/evaluations.validations';

export const capApproachSaveSchema = Joi.object({
	evaluation_id: Joi.number().required(),
	weighted_market_value: Joi.number().optional().allow(null),
	cap_approach: Joi.object({
		id: Joi.number().allow(null).optional(),
		evaluation_scenario_id: Joi.number().required(),
		weight: Joi.number().allow(null).optional(),
		high_cap_rate: Joi.number().allow(null).optional(),
		low_cap_rate: Joi.number().allow(null).optional(),
		weigted_average: Joi.number().allow(null).optional(),
		rounded_average: Joi.number().allow(null).optional(),
		notes: Joi.string().allow(null, '').optional(),
		comps: Joi.array().items(capCompSchema).optional().allow(null),
		comparison_attributes: Joi.array().items(comparisonAttributeSchema).optional().allow(null),
		cap_rate_notes: Joi.string().allow(null, '').optional(),
	}),
});
