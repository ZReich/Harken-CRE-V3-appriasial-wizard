import Joi from 'joi';

export const scenarioSchema = Joi.object({
	id: Joi.number().optional(),
	name: Joi.string().required(),
	has_income_approach: Joi.number().optional(),
	has_sales_approach: Joi.number().optional(),
	has_cost_approach: Joi.number().optional(),
});

export const addScenarioSchema = Joi.object({
	id: Joi.number().optional(),
	name: Joi.string().required(),
	has_income_approach: Joi.number().valid(0, 1).optional(),
	has_sales_approach: Joi.number().valid(0, 1).optional(),
	has_cost_approach: Joi.number().valid(0, 1).optional(),
})
	.custom((value, helpers) => {
		const approachKeys = [
			'has_income_approach',
			'has_sales_approach',
			'has_cost_approach',
		];

		const hasAtLeastOne = approachKeys.some((key) => value[key] === 1);

		if (!hasAtLeastOne) {
			return helpers.error('any.custom', {
				message: 'At least one approach field must have a value of 1.',
			});
		}

		return value;
	})
	.messages({
		'any.custom': '{{#message}}',
	});
