import database from '../../config/db';
import { ILeaseSubAdjustments } from './IAppraisalLeaseSubjectAdj';

const SubjectAdjustments = database.appraisal_lease_approach_subject_adj;
export default class AppraisalLeaseSubAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find lease approach subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<ILeaseSubAdjustments>,
	): Promise<ILeaseSubAdjustments[]> {
		try {
			return await SubjectAdjustments.findAll({
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
		attributes: Partial<ILeaseSubAdjustments>,
	): Promise<ILeaseSubAdjustments> {
		try {
			return await SubjectAdjustments.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove lease subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<ILeaseSubAdjustments>): Promise<boolean> {
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
		attributes: Partial<ILeaseSubAdjustments>,
	): Promise<ILeaseSubAdjustments> {
		try {
			const { adj_key, appraisal_lease_approach_id, ...rest } = attributes;
			const whereClause = { adj_key, appraisal_lease_approach_id };
			return await SubjectAdjustments.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
