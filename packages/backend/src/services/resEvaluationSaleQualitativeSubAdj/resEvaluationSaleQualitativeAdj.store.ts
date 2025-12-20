import database from '../../config/db';
import { ISaleSubQualitativeAdj } from './IResEvaluationSaleQualitativeAdj';

const SubQualitativeAdj = database.res_eval_sales_approach_qualitative_sub_adj;
export default class ResEvaluationSaleSubQualitativeAdjStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find sales approach subject qualitative adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ISaleSubQualitativeAdj>,
	): Promise<ISaleSubQualitativeAdj[]> {
		try {
			return await SubQualitativeAdj.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new sales subject qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async createAdjustments(
		attributes: Partial<ISaleSubQualitativeAdj>,
	): Promise<ISaleSubQualitativeAdj> {
		try {
			return await SubQualitativeAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove sales subject qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<ISaleSubQualitativeAdj>): Promise<boolean> {
		try {
			return await SubQualitativeAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to updated qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async updateAdjustments(
		attributes: Partial<ISaleSubQualitativeAdj>,
	): Promise<ISaleSubQualitativeAdj> {
		try {
			const { adj_key, res_evaluation_sales_approach_id, ...rest } = attributes;
			const whereClause = { adj_key, res_evaluation_sales_approach_id };
			return await SubQualitativeAdj.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
