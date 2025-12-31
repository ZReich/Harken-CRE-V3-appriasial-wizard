import database from '../../config/db';
import { ISalesCompsAdjustments } from './IAppraisalSalesCompAdj';

const AppraisalSalesCompAdj = database.appraisal_sales_approach_comp_adj;
export default class AppraisalSalesCompAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('appraisalSalesCompAdjStorage', AppraisalSalesCompAdj);
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
			return await AppraisalSalesCompAdj.findAll({
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
			return await AppraisalSalesCompAdj.create(attributes);
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
			const { adj_key, appraisal_sales_approach_comp_id, ...rest } = attributes;
			return await AppraisalSalesCompAdj.update(rest, {
				where: {
					adj_key,
					appraisal_sales_approach_comp_id,
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
			return await AppraisalSalesCompAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
