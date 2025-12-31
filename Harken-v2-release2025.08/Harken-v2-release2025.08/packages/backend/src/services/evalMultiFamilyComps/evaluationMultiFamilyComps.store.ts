import database from '../../config/db';
import { IMultiFamilyComp } from './IEvaluationMultiFamilyComps';

const EvaluationMultiFamilyComps = database.eval_multi_family_approach_comps;
const EvaluationMultiFamilyCompsAdj = database.eval_multi_family_comp_adj;
export default class EvalMultiFamilyCompsStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationMulFamilyComps', EvalMultiFamilyCompsStorage);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find multi-family approach comps
	 * @param attributes
	 * @returns
	 */
	public async find(attributes: Partial<IMultiFamilyComp>): Promise<IMultiFamilyComp[]> {
		try {
			return await EvaluationMultiFamilyComps.findAll({
				where: attributes,
				include: [{ model: EvaluationMultiFamilyCompsAdj, as: 'comps_adjustments' }],
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new multi-family approach comps
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IMultiFamilyComp>): Promise<IMultiFamilyComp> {
		try {
			return await EvaluationMultiFamilyComps.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update multi-family approach comps
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<IMultiFamilyComp>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationMultiFamilyComps.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove multi-family approach comps.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<IMultiFamilyComp>): Promise<boolean> {
		try {
			return await EvaluationMultiFamilyComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
