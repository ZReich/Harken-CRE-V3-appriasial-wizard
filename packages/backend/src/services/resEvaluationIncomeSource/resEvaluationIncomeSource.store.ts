import { Op } from 'sequelize';
import database from '../../config/db';
import { IResIncomeSource } from './IResEvaluationIncomeSourceService';
import { ResEvaluationsEnum } from '../../utils/enums/ResEvaluationsEnum';
const ResEvalIncomeApproachSource = database.res_eval_income_approach_source;
export default class ResEvaluationIncomeSourcesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvalIncomeApproachStorage', ResEvalIncomeApproachSource);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description query to find evaluation income approach source by id.
	 * @param attributes
	 * @returns
	 */
	public async find(id: number): Promise<IResIncomeSource> {
		try {
			return await ResEvalIncomeApproachSource.findOne({
				where: {
					id: id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update evaluation income approach source
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(id: number, attributes: Partial<IResIncomeSource>): Promise<boolean> {
		try {
			return await ResEvalIncomeApproachSource.update(attributes, {
				where: { id: id },
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description query to create evaluation income approach source
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IResIncomeSource>): Promise<IResIncomeSource> {
		try {
			return await ResEvalIncomeApproachSource.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove unused evaluation income approach sources.
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
			const instances = await ResEvalIncomeApproachSource.findAll({
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
	 * @description query to find all evaluation income approach source
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IResIncomeSource>): Promise<IResIncomeSource[]> {
		try {
			return await ResEvalIncomeApproachSource.findAll({ where: attributes, raw: true });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description query to remove evaluation income approach source by attribute.
	 * @param attribute
	 * @returns
	 */
	public async removeByAttribute(attribute: Partial<IResIncomeSource>): Promise<boolean> {
		try {
			const instances = await ResEvalIncomeApproachSource.findAll({
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

	/**
	 * @description Function to remove unused evaluation income approach sources.
	 * @param keepTransactionId
	 * @param objectId
	 * @param objectColumn
	 * @returns
	 */
	public async removeOne(id): Promise<boolean> {
		try {
			return await ResEvalIncomeApproachSource.destroy({
				where: { id },
			});
		} catch (e) {
			return false;
		}
	}
}
