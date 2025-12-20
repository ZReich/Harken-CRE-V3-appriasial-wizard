import database from '../../config/db';
import { ICostComp } from './IResEvaluationCostApproachComps';

const EvaluationCostComps = database.res_eval_cost_approach_comps;
const EvaluationCostCompsAdj = database.res_eval_cost_approach_comp_adj;
export default class ResEvaluationCostCompsStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationCostComps', EvaluationCostComps);
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
			return await EvaluationCostComps.findAll({
				where: attributes,
				include: [{ model: EvaluationCostCompsAdj, as: 'comps_adjustments' }],
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
			return await EvaluationCostComps.create(attributes);
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
			return await EvaluationCostComps.update(rest, { where: { id } });
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
			return await EvaluationCostComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
