import database from '../../config/db';
import { ISalesCompsAdjustments } from './IEvaluationSalesCompAdj';

const EvaluationSalesCompAdj = database.eval_sales_approach_comp_adj;
export default class EvaluationSalesCompAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('evaluationSalesCompAdjStorage', EvaluationSalesCompAdj);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find sales approach comp adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ISalesCompsAdjustments>,
	): Promise<ISalesCompsAdjustments[]> {
		try {
			return await EvaluationSalesCompAdj.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new sales subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async createAdjustments(
		attributes: Partial<ISalesCompsAdjustments>,
	): Promise<ISalesCompsAdjustments> {
		try {
			return await EvaluationSalesCompAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to update adjustments of sale comp adjustment.
	 * @param attributes
	 * @returns
	 */
	public async updateAdjustments(
		attributes: Partial<ISalesCompsAdjustments>,
	): Promise<ISalesCompsAdjustments> {
		try {
			const { adj_key, eval_sales_approach_comp_id, ...rest } = attributes;
			return await EvaluationSalesCompAdj.update(rest, {
				where: {
					adj_key,
					eval_sales_approach_comp_id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove sales subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<ISalesCompsAdjustments>): Promise<boolean> {
		try {
			return await EvaluationSalesCompAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
