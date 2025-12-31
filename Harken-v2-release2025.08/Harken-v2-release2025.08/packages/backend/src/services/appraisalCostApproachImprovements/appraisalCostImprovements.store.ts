import database from '../../config/db';
import { ICostImprovements } from './IAppraisalCostApproachImprovements';

const AppraisalCostImprovements = database.appraisal_cost_approach_improvements;
export default class AppraisalCostImprovementStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('appraisalCostImprovements', AppraisalCostImprovements);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find cost approach improvements
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<ICostImprovements>): Promise<ICostImprovements[]> {
		try {
			return await AppraisalCostImprovements.findAll({
				where: attributes,
				raw: true,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create new cost approach improvements.
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<ICostImprovements>): Promise<ICostImprovements> {
		try {
			return await AppraisalCostImprovements.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update cost approach improvements.
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<ICostImprovements>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalCostImprovements.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove cost approach improvements.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ICostImprovements>): Promise<boolean> {
		try {
			return await AppraisalCostImprovements.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to create appraisal cost improvements in bulk.
	 * @param attributes
	 * @returns
	 */
	public async bulkCreate(attributes: Partial<ICostImprovements>[]): Promise<ICostImprovements[]> {
		try {
			return await AppraisalCostImprovements.bulkCreate(attributes, {
				// The 'updateOnDuplicate' option specifies which fields should be updated if a duplicate record is found.
				// In this case, if a record with the same primary key already exists, the specified fields will be updated.
				updateOnDuplicate: [
					'type',
					'sf_area',
					'structure_cost',
					'depreciation_amount',
					'adjusted_cost',
				],
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
