import database from '../../config/db';
import { ILeaseComp } from './IEvaluationLeaseApproachComps';
const EvaluationLeaseComps = database.eval_lease_approach_comps;
const LeaseCompsAdjustments = database.eval_lease_approach_comp_adj;
export default class EvaluationLeaseCompsStorage {
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
			return await EvaluationLeaseComps.findAll({
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
			return await EvaluationLeaseComps.create(attributes);
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
			return await EvaluationLeaseComps.update(rest, { where: { id } });
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
			return await EvaluationLeaseComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
