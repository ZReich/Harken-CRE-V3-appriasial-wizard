import database from '../../config/db';
import { ILeaseComp } from './IAppraisalLeaseApproachComps';
const AppraisalLeaseComps = database.appraisal_lease_approach_comps;
const LeaseCompsAdjustments = database.appraisal_lease_approach_comp_adj;
export default class AppraisalLeaseCompsStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find lease approach comps
	 * @param attributes
	 * @returns
	 */
	public async findLeaseComps(attributes: Partial<ILeaseComp>): Promise<ILeaseComp[]> {
		try {
			return await AppraisalLeaseComps.findAll({
				where: attributes,
				include: [{ model: LeaseCompsAdjustments, as: 'comps_adjustments' }],
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new lease approach comps
	 * @param attributes
	 * @returns
	 */
	public async createLeaseComps(attributes: Partial<ILeaseComp>): Promise<ILeaseComp> {
		try {
			return await AppraisalLeaseComps.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update lease approach comps
	 * @param attributes
	 * @returns
	 */
	public async updateLeaseComps(attributes: Partial<ILeaseComp>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalLeaseComps.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove lease approach comps.
	 * @param attributes
	 * @returns
	 */
	public async removeLeaseComps(attributes: Partial<ILeaseComp>): Promise<boolean> {
		try {
			return await AppraisalLeaseComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
