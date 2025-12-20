import database from '../../config/db';
import { ILeaseCompsQualitativeAdj } from './IAppraisalLeaseCompQualitativeAdj';
const AppraisalLeaseCompsQualitativeAdj = database.appraisal_lease_approach_qualitative_comp_adj;
export default class AppraisalLeaseCompQualitativeAdjStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find lease approach comp Qualitative adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ILeaseCompsQualitativeAdj>,
	): Promise<ILeaseCompsQualitativeAdj[]> {
		try {
			return await AppraisalLeaseCompsQualitativeAdj.findAll({
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
		attributes: Partial<ILeaseCompsQualitativeAdj>,
	): Promise<ILeaseCompsQualitativeAdj> {
		try {
			return await AppraisalLeaseCompsQualitativeAdj.create(attributes);
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
		attributes: Partial<ILeaseCompsQualitativeAdj>,
	): Promise<ILeaseCompsQualitativeAdj> {
		try {
			const { adj_key, appraisal_lease_approach_comp_id, ...rest } = attributes;
			return await AppraisalLeaseCompsQualitativeAdj.update(rest, {
				where: {
					adj_key,
					appraisal_lease_approach_comp_id,
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
	public async removeAdjustments(attributes: Partial<ILeaseCompsQualitativeAdj>): Promise<boolean> {
		try {
			return await AppraisalLeaseCompsQualitativeAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
