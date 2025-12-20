import database from '../../config/db';
import { ICapComparisonAttributes } from './IEvaluationCapCompareAttributes';
const CapComparisonAttributes = database.eval_cap_approach_comparison_attributes;

export default class EvaluationCapComparativeStore {
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
		attributes: Partial<ICapComparisonAttributes>,
	): Promise<ICapComparisonAttributes[]> {
		try {
			return await CapComparisonAttributes.findAll({
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
		attributes: Partial<ICapComparisonAttributes>,
	): Promise<ICapComparisonAttributes> {
		try {
			return await CapComparisonAttributes.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ICapComparisonAttributes>): Promise<boolean> {
		try {
			return await CapComparisonAttributes.destroy({
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
		attributes: Partial<ICapComparisonAttributes>,
	): Promise<ICapComparisonAttributes> {
		try {
			const { comparison_key, evaluation_cap_approach_id, ...rest } = attributes;
			const whereClause = { comparison_key, evaluation_cap_approach_id };
			return await CapComparisonAttributes.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
