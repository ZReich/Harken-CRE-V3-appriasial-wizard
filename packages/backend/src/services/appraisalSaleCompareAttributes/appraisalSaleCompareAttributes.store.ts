import database from '../../config/db';
import { ISaleComparisonAttributes } from './IAppraisalSaleCompareAttributes';
const SaleComparisonAttributes = database.appraisal_sales_approach_comparison_attributes;

export default class AppraisalSaleComparisonStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find sales comparison attributes.
	 * @param attributes
	 * @returns
	 */
	public async findAll(
		attributes: Partial<ISaleComparisonAttributes>,
	): Promise<ISaleComparisonAttributes[]> {
		try {
			return await SaleComparisonAttributes.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create sales subject qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async create(
		attributes: Partial<ISaleComparisonAttributes>,
	): Promise<ISaleComparisonAttributes> {
		try {
			return await SaleComparisonAttributes.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove sales subject qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ISaleComparisonAttributes>): Promise<boolean> {
		try {
			return await SaleComparisonAttributes.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to updated sales subject qualitative adjustments.
	 * @param attributes
	 * @returns
	 */
	public async update(
		attributes: Partial<ISaleComparisonAttributes>,
	): Promise<ISaleComparisonAttributes> {
		try {
			const { comparison_key, appraisal_sales_approach_id, ...rest } = attributes;
			const whereClause = { comparison_key, appraisal_sales_approach_id };
			return await SaleComparisonAttributes.update(rest, {
				where: whereClause,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
