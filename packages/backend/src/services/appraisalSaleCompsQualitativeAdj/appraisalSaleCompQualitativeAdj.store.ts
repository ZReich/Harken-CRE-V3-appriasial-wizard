import database from '../../config/db';
import { ISaleCompsQualitativeAdj } from './IAppraisalSaleCompQualitativeAdj';
const AppraisalSaleCompsQualitativeAdj = database.appraisal_sales_approach_qualitative_comp_adj;
export default class AppraisalSalesCompQualitativeAdjStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find sales approach comp Qualitative adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ISaleCompsQualitativeAdj>,
	): Promise<ISaleCompsQualitativeAdj[]> {
		try {
			return await AppraisalSaleCompsQualitativeAdj.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new sales subject Qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async createAdjustments(
		attributes: Partial<ISaleCompsQualitativeAdj>,
	): Promise<ISaleCompsQualitativeAdj> {
		try {
			return await AppraisalSaleCompsQualitativeAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update sales subject Qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async updateAdjustments(
		attributes: Partial<ISaleCompsQualitativeAdj>,
	): Promise<ISaleCompsQualitativeAdj> {
		try {
			const { adj_key, appraisal_sales_approach_comp_id, ...rest } = attributes;
			return await AppraisalSaleCompsQualitativeAdj.update(rest, {
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
	 * @description Query to remove sales subject Qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<ISaleCompsQualitativeAdj>): Promise<boolean> {
		try {
			return await AppraisalSaleCompsQualitativeAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
