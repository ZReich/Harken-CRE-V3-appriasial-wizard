import database from '../../config/db';
import { ISalesComp } from './IAppraisalSalesApproachComps';
const AppraisalSalesComps = database.appraisal_sales_approach_comps;
const SalesCompsAdjustments = database.appraisal_sales_approach_comp_adj;
export default class AppraisalSalesCompsStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('salesCompsStorage', AppraisalSalesComps);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find sales approach comps
	 * @param attributes
	 * @returns
	 */
	public async findSalesComps(attributes: Partial<ISalesComp>): Promise<ISalesComp[]> {
		try {
			return await AppraisalSalesComps.findAll({
				where: attributes,
				include: [{ model: SalesCompsAdjustments, as: 'comps_adjustments' }],
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new sales  approach comps
	 * @param attributes
	 * @returns
	 */
	public async createSalesComps(attributes: Partial<ISalesComp>): Promise<ISalesComp> {
		try {
			return await AppraisalSalesComps.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update sales approach comps
	 * @param attributes
	 * @returns
	 */
	public async updateSalesComps(attributes: Partial<ISalesComp>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalSalesComps.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove sales approach comps.
	 * @param attributes
	 * @returns
	 */
	public async removeSalesComps(attributes: Partial<ISalesComp>): Promise<boolean> {
		try {
			return await AppraisalSalesComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
