import database from '../../config/db';
import { ILeaseComparisonAttributes } from './IEvaluationLeaseCompareAttributes';

const LeaseComparisonAttributes = database.eval_lease_approach_comparison_attributes;

export default class EvalLeaseComparativeStore {
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
		attributes: Partial<ILeaseComparisonAttributes>,
	): Promise<ILeaseComparisonAttributes[]> {
		try {
			return await LeaseComparisonAttributes.findAll({
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
		attributes: Partial<ILeaseComparisonAttributes>,
	): Promise<ILeaseComparisonAttributes> {
		try {
			return await LeaseComparisonAttributes.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ILeaseComparisonAttributes>): Promise<boolean> {
		try {
			return await LeaseComparisonAttributes.destroy({
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
		attributes: Partial<ILeaseComparisonAttributes>,
	): Promise<ILeaseComparisonAttributes> {
		try {
			const { comparison_key, evaluation_lease_approach_id, ...rest } = attributes;
			const whereClause = { comparison_key, evaluation_lease_approach_id };
			return await LeaseComparisonAttributes.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
