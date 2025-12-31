import database from '../../config/db';
import { ILeaseCompsAdjustments } from './IEvaluationLeaseCompAdj';

const EvaluationLeaseCompAdj = database.eval_lease_approach_comp_adj;
export default class EvaluationLeaseCompAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find lease approach comp adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ILeaseCompsAdjustments>,
	): Promise<ILeaseCompsAdjustments[]> {
		try {
			return await EvaluationLeaseCompAdj.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new lease subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async createAdjustments(
		attributes: Partial<ILeaseCompsAdjustments>,
	): Promise<ILeaseCompsAdjustments> {
		try {
			return await EvaluationLeaseCompAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update adjustments.
	 * @param attributes
	 * @returns
	 */
	public async updateAdjustments(
		attributes: Partial<ILeaseCompsAdjustments>,
	): Promise<ILeaseCompsAdjustments> {
		try {
			const { adj_key, eval_lease_approach_comp_id, ...rest } = attributes;
			return await EvaluationLeaseCompAdj.update(rest, {
				where: {
					adj_key,
					eval_lease_approach_comp_id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove lease subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<ILeaseCompsAdjustments>): Promise<boolean> {
		try {
			return await EvaluationLeaseCompAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
