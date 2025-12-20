import database from '../../config/db';
import { ISalesComp } from './IEvaluationSalesApproachComps';
const EvaluationSalesComps = database.eval_sales_approach_comps;
const SalesCompsAdjustments = database.eval_sales_approach_comp_adj;
export default class EvaluationSalesCompsStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('salesCompsStorage', EvaluationSalesComps);
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
			return await EvaluationSalesComps.findAll({
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
			return await EvaluationSalesComps.create(attributes);
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
			return await EvaluationSalesComps.update(rest, { where: { id } });
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
			return await EvaluationSalesComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
