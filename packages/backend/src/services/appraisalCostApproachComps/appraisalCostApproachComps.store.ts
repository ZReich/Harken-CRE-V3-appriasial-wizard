import database from '../../config/db';
import { ICostComp } from './IAppraisalCostApproachComps';

const AppraisalCostComps = database.appraisal_cost_approach_comps;
const AppraisalCostCompsAdj = database.appraisal_cost_approach_comp_adj;
export default class AppraisalCostCompsStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AppraisalCostComps', AppraisalCostComps);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find cost approach comps
	 * @param attributes
	 * @returns
	 */
	public async findCostComps(attributes: Partial<ICostComp>): Promise<ICostComp[]> {
		try {
			return await AppraisalCostComps.findAll({
				where: attributes,
				include: [{ model: AppraisalCostCompsAdj, as: 'comps_adjustments' }],
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new cost approach comps
	 * @param attributes
	 * @returns
	 */
	public async createCostComps(attributes: Partial<ICostComp>): Promise<ICostComp> {
		try {
			return await AppraisalCostComps.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update cost approach comps
	 * @param attributes
	 * @returns
	 */
	public async updateCostComps(attributes: Partial<ICostComp>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalCostComps.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove cost approach comps.
	 * @param attributes
	 * @returns
	 */
	public async removeCostComps(attributes: Partial<ICostComp>): Promise<boolean> {
		try {
			return await AppraisalCostComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
