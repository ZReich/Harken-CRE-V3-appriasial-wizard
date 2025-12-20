import database from '../../config/db';
import { ICapComps } from './IEvaluationCapComps';

const EvaluationCapComps = database.eval_cap_approach_comps;
export default class EvaluationCapCompsStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find cap approach comps
	 * @param attributes
	 * @returns
	 */
	public async findCapComps(attributes: Partial<ICapComps>): Promise<ICapComps[]> {
		try {
			return await EvaluationCapComps.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new cap approach comps
	 * @param attributes
	 * @returns
	 */
	public async createCapComps(attributes: Partial<ICapComps>): Promise<ICapComps> {
		try {
			return await EvaluationCapComps.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update cap approach comps
	 * @param attributes
	 * @returns
	 */
	public async updateCapComps(attributes: Partial<ICapComps>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationCapComps.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove cap approach comps.
	 * @param attributes
	 * @returns
	 */
	public async removeCapComps(attributes: Partial<ICapComps>): Promise<boolean> {
		try {
			return await EvaluationCapComps.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
