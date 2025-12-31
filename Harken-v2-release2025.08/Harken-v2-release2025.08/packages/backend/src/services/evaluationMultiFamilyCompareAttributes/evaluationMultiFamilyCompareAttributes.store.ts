import database from '../../config/db';
import { IMultiFamilyComparisonAttributes } from './IEvaluationMultiFamilyCompareAttributes';

const MuiltiFamilyComparisonAttributes = database.eval_multi_family_comparison_attributes;

export default class EvalMultiFamilyComparativeStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async findAll(
		attributes: Partial<IMultiFamilyComparisonAttributes>,
	): Promise<IMultiFamilyComparisonAttributes[]> {
		try {
			return await MuiltiFamilyComparisonAttributes.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create comparison attributes.
	 * @returns
	 */
	public async create(
		attributes: Partial<IMultiFamilyComparisonAttributes>,
	): Promise<IMultiFamilyComparisonAttributes> {
		try {
			return await MuiltiFamilyComparisonAttributes.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<IMultiFamilyComparisonAttributes>): Promise<boolean> {
		try {
			return await MuiltiFamilyComparisonAttributes.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to updated comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async update(
		attributes: Partial<IMultiFamilyComparisonAttributes>,
	): Promise<IMultiFamilyComparisonAttributes> {
		try {
			const { comparison_key, evaluation_multi_family_approach_id, ...rest } = attributes;
			const whereClause = { comparison_key, evaluation_multi_family_approach_id };
			return await MuiltiFamilyComparisonAttributes.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
