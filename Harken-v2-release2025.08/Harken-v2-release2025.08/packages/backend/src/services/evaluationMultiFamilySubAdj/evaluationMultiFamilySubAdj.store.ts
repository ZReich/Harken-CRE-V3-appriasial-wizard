import database from '../../config/db';
import { IMultiFamilySubAdj } from './IEvalMultiFamilySubjectAdj';

const SubjectAdjustments = database.eval_multi_family_subject_adj;
export default class EvalMultiFamilySubAdjStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find multi family approach subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async findAdjustments(
		attributes: Partial<IMultiFamilySubAdj>,
	): Promise<IMultiFamilySubAdj[]> {
		try {
			return await SubjectAdjustments.findAll({
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
		attributes: Partial<IMultiFamilySubAdj>,
	): Promise<IMultiFamilySubAdj> {
		try {
			return await SubjectAdjustments.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove multi-family subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async removeAdjustments(attributes: Partial<IMultiFamilySubAdj>): Promise<boolean> {
		try {
			return await SubjectAdjustments.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to updated multi-family adjustments.
	 * @param attributes
	 * @returns
	 */
	public async updateAdjustments(
		attributes: Partial<IMultiFamilySubAdj>,
	): Promise<IMultiFamilySubAdj> {
		try {
			const { adj_key, evaluation_multi_family_approach_id, ...rest } = attributes;
			const whereClause = { adj_key, evaluation_multi_family_approach_id };
			return await SubjectAdjustments.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
