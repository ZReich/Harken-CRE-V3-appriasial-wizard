import database from '../../config/db';
import { ICostComparisonAttributes } from './IResEvaluationCostCompareAttributes';
const CostComparisonAttributes = database.res_eval_cost_approach_comparison_attributes;

export default class ResEvaluationCostComparativeStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async findAll(
		attributes: Partial<ICostComparisonAttributes>,
	): Promise<ICostComparisonAttributes[]> {
		try {
			return await CostComparisonAttributes.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create comparison attributes.
	 * @returns
	 */
	public async create(
		attributes: Partial<ICostComparisonAttributes>,
	): Promise<ICostComparisonAttributes> {
		try {
			return await CostComparisonAttributes.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ICostComparisonAttributes>): Promise<boolean> {
		try {
			return await CostComparisonAttributes.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to updated comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async update(
		attributes: Partial<ICostComparisonAttributes>,
	): Promise<ICostComparisonAttributes> {
		try {
			const { comparison_key, res_evaluation_cost_approach_id, ...rest } = attributes;
			const whereClause = { comparison_key, res_evaluation_cost_approach_id };
			return await CostComparisonAttributes.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
