import database from '../../config/db';
import { ISalesCompAmenities } from './IResEvaluationSaleCompAmenitiesService';
const EvaluationSaleCompAmenities = database.res_eval_sales_approach_comp_amenities;

export default class ResEvalSaleCompAmenitiesStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('ResEvalSaleCompAmenitiesStorage', ResEvalSaleCompAmenitiesStorage);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Query to find
	 * @param attributes
	 * @returns
	 */
	public async find(attributes: Partial<ISalesCompAmenities>): Promise<ISalesCompAmenities[]> {
		try {
			return await EvaluationSaleCompAmenities.findAll({
				where: attributes,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to create
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<ISalesCompAmenities>): Promise<ISalesCompAmenities> {
		try {
			return await EvaluationSaleCompAmenities.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to update.
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<ISalesCompAmenities>): Promise<ISalesCompAmenities> {
		try {
			const { res_eval_sales_approach_comp_id, ...rest } = attributes;
			return await EvaluationSaleCompAmenities.update(rest, {
				where: {
					res_eval_sales_approach_comp_id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to remove sales subject adjustments.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<ISalesCompAmenities>): Promise<boolean> {
		try {
			return await EvaluationSaleCompAmenities.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
}
