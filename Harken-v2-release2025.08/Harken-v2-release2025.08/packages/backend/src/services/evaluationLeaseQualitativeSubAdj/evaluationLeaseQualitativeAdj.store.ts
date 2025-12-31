import database from '../../config/db';
import { ILeaseSubQualitativeAdj } from './IEvaluationLeaseQualitativeAdj';

const SubLeaseQualitativeAdj = database.eval_lease_approach_qualitative_sub_adj;
export default class EvaluationLeaseSubQualitativeAdjStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find lease approach subject qualitative adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ILeaseSubQualitativeAdj>,
	): Promise<ILeaseSubQualitativeAdj[]> {
		try {
			return await SubLeaseQualitativeAdj.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new lease subject qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async createAdjustments(
		attributes: Partial<ILeaseSubQualitativeAdj>,
	): Promise<ILeaseSubQualitativeAdj> {
		try {
			return await SubLeaseQualitativeAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove lease subject qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<ILeaseSubQualitativeAdj>): Promise<boolean> {
		try {
			return await SubLeaseQualitativeAdj.destroy({
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
		attributes: Partial<ILeaseSubQualitativeAdj>,
	): Promise<ILeaseSubQualitativeAdj> {
		try {
			const { adj_key, evaluation_lease_approach_id, ...rest } = attributes;
			const whereClause = { adj_key, evaluation_lease_approach_id };
			return await SubLeaseQualitativeAdj.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
