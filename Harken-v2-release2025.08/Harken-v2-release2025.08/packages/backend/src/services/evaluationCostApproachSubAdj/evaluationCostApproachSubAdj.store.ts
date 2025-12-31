import database from '../../config/db';
import { ICostSubPropertyAdj } from './IEvaluationCostApproachSubAdj';

const EvaluationCostSubAdj = database.eval_cost_approach_subject_adj;
export default class EvaluationCostSubAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('subjectAdjustmentsStorage', EvaluationCostSubAdj);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find cost approach subject adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ICostSubPropertyAdj>,
	): Promise<ICostSubPropertyAdj[]> {
		try {
			return await EvaluationCostSubAdj.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new cost subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async createAdjustments(
		attributes: Partial<ICostSubPropertyAdj>,
	): Promise<ICostSubPropertyAdj> {
		try {
			return await EvaluationCostSubAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove cost subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<ICostSubPropertyAdj>): Promise<boolean> {
		try {
			return await EvaluationCostSubAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to updated adjustments.
	 * @param attributes
	 * @returns
	 */
	public async updateAdjustments(
		attributes: Partial<ICostSubPropertyAdj>,
	): Promise<ICostSubPropertyAdj> {
		try {
			const { adj_key, evaluation_cost_approach_id, ...rest } = attributes;
			const whereClause = { adj_key, evaluation_cost_approach_id };
			return await EvaluationCostSubAdj.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
