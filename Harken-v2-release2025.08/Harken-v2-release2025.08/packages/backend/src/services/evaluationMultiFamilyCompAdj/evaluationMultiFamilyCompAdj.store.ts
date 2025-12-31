import database from '../../config/db';
import { IMultiFamilyCompsAdjustment } from './IEvaluationMultiFamilyCompAdj';

const EvalMultiFamilyCompAdj = database.eval_multi_family_comp_adj;
export default class EvalMultiFamilyCompAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvalMultiFamilyCompAdjStorage', EvalMultiFamilyCompAdj);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find multi-family approach comp adjustments
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<IMultiFamilyCompsAdjustment>,
	): Promise<IMultiFamilyCompsAdjustment[]> {
		try {
			return await EvalMultiFamilyCompAdj.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new multi-family subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async createAdjustments(
		attributes: Partial<IMultiFamilyCompsAdjustment>,
	): Promise<IMultiFamilyCompsAdjustment> {
		try {
			return await EvalMultiFamilyCompAdj.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	public async updateAdjustments(
		attributes: Partial<IMultiFamilyCompsAdjustment>,
	): Promise<IMultiFamilyCompsAdjustment> {
		try {
			const { adj_key, eval_multi_family_approach_comp_id, ...rest } = attributes;
			return await EvalMultiFamilyCompAdj.update(rest, {
				where: {
					adj_key,
					eval_multi_family_approach_comp_id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove multi-family subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(
		attributes: Partial<IMultiFamilyCompsAdjustment>,
	): Promise<boolean> {
		try {
			return await EvalMultiFamilyCompAdj.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
