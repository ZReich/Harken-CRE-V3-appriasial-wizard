import database from '../../config/db';
import { ICostCompsAdjustment } from './IAppraisalCostApproachCompAdj';

const AppraisalCostCompAdj = database.appraisal_cost_approach_comp_adj;
export default class AppraisalCostCompAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('appraisalCostCompAdjStorage', AppraisalCostCompAdj);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find sales approach comp adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ICostCompsAdjustment>,
	): Promise<ICostCompsAdjustment[]> {
		try {
			return await AppraisalCostCompAdj.findAll({
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
		attributes: Partial<ICostCompsAdjustment>,
	): Promise<ICostCompsAdjustment> {
		try {
			return await AppraisalCostCompAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	public async updateAdjustments(
		attributes: Partial<ICostCompsAdjustment>,
	): Promise<ICostCompsAdjustment> {
		try {
			const { adj_key, appraisal_cost_approach_comp_id, ...rest } = attributes;
			return await AppraisalCostCompAdj.update(rest, {
				where: {
					adj_key,
					appraisal_cost_approach_comp_id,
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
	public async removeAdjustments(attributes: Partial<ICostCompsAdjustment>): Promise<boolean> {
		try {
			return await AppraisalCostCompAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
