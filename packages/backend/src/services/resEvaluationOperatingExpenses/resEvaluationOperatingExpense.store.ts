import { Op } from 'sequelize';
import database from '../../config/db';
import { IResOperatingExpense } from './IResEvaluationOperatingExpenseService';
import { ResEvaluationsEnum } from '../../utils/enums/ResEvaluationsEnum';
const EvalIncomeOperatingExpense = database.res_eval_income_approach_op_exp;
export default class ResEvalOperatingExpensesStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('operatingExpenseStorage', EvalIncomeOperatingExpense);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description query to find evaluation income operating expense by id.
	 * @param attributes
	 * @returns
	 */
	public async find(id: number): Promise<IResOperatingExpense> {
		try {
			return await EvalIncomeOperatingExpense.findOne({
				where: {
					id: id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update evaluation income operating expense
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(id: number, attributes: Partial<IResOperatingExpense>): Promise<boolean> {
		try {
			return await EvalIncomeOperatingExpense.update(attributes, {
				where: { id: id },
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description query to create evaluation income operating expense
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IResOperatingExpense>): Promise<IResOperatingExpense> {
		try {
			return await EvalIncomeOperatingExpense.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove unused evaluation income operating expense
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
			const instances = await EvalIncomeOperatingExpense.findAll({
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
	 * @description Function to find all income approach operating expenses
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IResOperatingExpense>): Promise<IResOperatingExpense[]> {
		try {
			return await EvalIncomeOperatingExpense.findAll({
				where: attributes,
				raw: true,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
