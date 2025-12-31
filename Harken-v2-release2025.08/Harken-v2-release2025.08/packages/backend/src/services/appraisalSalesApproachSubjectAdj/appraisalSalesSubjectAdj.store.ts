import database from '../../config/db';
import { SalesSubAdjustments } from './IAppraisalSalesApproachSubAdj';

const SubjectAdjustments = database.appraisal_sales_approach_subject_adj;
export default class AppraisalSalesSubAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('subjectAdjustmentsStorage', SubjectAdjustments);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find sales approach subject adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<SalesSubAdjustments>,
	): Promise<SalesSubAdjustments[]> {
		try {
			return await SubjectAdjustments.findAll({
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
		attributes: Partial<SalesSubAdjustments>,
	): Promise<SalesSubAdjustments> {
		try {
			return await SubjectAdjustments.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove sales subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<SalesSubAdjustments>): Promise<boolean> {
		try {
			return await SubjectAdjustments.destroy({
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
		attributes: Partial<SalesSubAdjustments>,
	): Promise<SalesSubAdjustments> {
		try {
			const { adj_key, appraisal_sales_approach_id, ...rest } = attributes;
			const whereClause = { adj_key, appraisal_sales_approach_id };
			return await SubjectAdjustments.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
