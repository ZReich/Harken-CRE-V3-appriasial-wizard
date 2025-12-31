import database from '../../config/db';
import { ISaleCompsQualitativeAdj } from './IEvaluationSaleCompQualitativeAdj';
const EvaluationSaleCompsQualitativeAdj = database.eval_sales_approach_qualitative_comp_adj;
export default class EvaluationSalesCompQualitativeAdjStore {
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
			return await EvaluationSaleCompsQualitativeAdj.findAll({
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
			return await EvaluationSaleCompsQualitativeAdj.create(attributes);
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
			const { adj_key, evaluation_sales_approach_comp_id, ...rest } = attributes;
			return await EvaluationSaleCompsQualitativeAdj.update(rest, {
				where: {
					adj_key,
					evaluation_sales_approach_comp_id,
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
			return await EvaluationSaleCompsQualitativeAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
