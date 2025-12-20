import { Op } from 'sequelize';
import database from '../../config/db';
import { IResOtherIncomeSource } from './IResEvaluationIncomeOtherSource';
import { ResEvaluationsEnum } from '../../utils/enums/ResEvaluationsEnum';
const EvalIncomeOtherSource = database.res_eval_income_approach_other_source;
export default class ResEvaluationOtherIncomeStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description query to find evaluation other income approach other source by id.
	 * @param attributes
	 * @returns
	 */
	public async find(id: number): Promise<IResOtherIncomeSource> {
		try {
			return await EvalIncomeOtherSource.findOne({
				where: {
					id: id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update evaluation other income approach other source
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(id: number, attributes: Partial<IResOtherIncomeSource>): Promise<boolean> {
		try {
			return await EvalIncomeOtherSource.update(attributes, {
				where: { id: id },
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description query to create evaluation other income approach other source
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IResOtherIncomeSource>): Promise<IResOtherIncomeSource> {
		try {
			return await EvalIncomeOtherSource.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove unused evaluation other income approach other sources.
	 * @param keepTransactionId
	 * @param objectId
	 * @param objectColumn
	 * @returns
	 */
	public async remove(
		keepIncomeSourceId: number[],
		objectId: number,
		objectColumn = ResEvaluationsEnum.RES_EVALUATION_INCOME_APPROACH_ID,
	): Promise<boolean> {
		try {
			const instances = await EvalIncomeOtherSource.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: keepIncomeSourceId,
					},
				},
			});

			if (instances && instances.length > 0) {
				for (const instance of instances) {
					await instance.destroy();
				}
			}
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description query to find all evaluation other income approach other source
	 * @param attributes
	 * @returns
	 */
	public async findAll(
		attributes: Partial<IResOtherIncomeSource>,
	): Promise<IResOtherIncomeSource[]> {
		try {
			return await EvalIncomeOtherSource.findAll({ where: attributes, raw: true });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description query to remove evaluation other income approach other source by attribute.
	 * @param attribute
	 * @returns
	 */
	public async removeByAttribute(attribute: Partial<IResOtherIncomeSource>): Promise<boolean> {
		try {
			const instances = await EvalIncomeOtherSource.findAll({
				attributes: ['id'],
				where: attribute,
			});

			if (instances && instances.length > 0) {
				for (const instance of instances) {
					await instance.destroy();
				}
			}
		} catch (e) {
			return false;
		}
	}
}
