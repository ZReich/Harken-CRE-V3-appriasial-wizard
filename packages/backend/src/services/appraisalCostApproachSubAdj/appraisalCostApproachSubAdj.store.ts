import database from '../../config/db';
import { ICostSubPropertyAdj } from './IAppraisalCostApproachSubAdj';

const AppraisalCostSubAdj = database.appraisal_cost_approach_subject_adj;
export default class AppraisalCostSubAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('subjectAdjustmentsStorage', AppraisalCostSubAdj);
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
			return await AppraisalCostSubAdj.findAll({
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
			return await AppraisalCostSubAdj.create(attributes);
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
			return await AppraisalCostSubAdj.destroy({
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
			const { adj_key, appraisal_cost_approach_id, ...rest } = attributes;
			const whereClause = { adj_key, appraisal_cost_approach_id };
			return await AppraisalCostSubAdj.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
