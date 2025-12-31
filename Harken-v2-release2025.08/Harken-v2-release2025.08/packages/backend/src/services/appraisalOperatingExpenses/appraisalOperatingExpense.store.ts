import { Op } from 'sequelize';
import database from '../../config/db';
import { IOperatingExpense } from './IAppraisalOperatingExpenseService';
import { AppraisalIncomeEnum } from '../../utils/enums/DefaultEnum';
const IncomeOperatingExpense = database.appraisal_income_approach_op_exp;
export default class AppraisalOperatingExpensesStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('operatingExpenseStorage', IncomeOperatingExpense);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description query to find appraisal income operating expense by id.
	 * @param attributes
	 * @returns
	 */
	public async find(id: number): Promise<IOperatingExpense> {
		try {
			return await IncomeOperatingExpense.findOne({
				where: {
					id: id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update appraisal income operating expense
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(id: number, attributes: Partial<IOperatingExpense>): Promise<boolean> {
		try {
			return await IncomeOperatingExpense.update(attributes, {
				where: { id: id },
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description query to create appraisal income operating expense
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IOperatingExpense>): Promise<IOperatingExpense> {
		try {
			return await IncomeOperatingExpense.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove unused appraisal income operating expense
	 * @param keepTransactionId
	 * @param objectId
	 * @param objectColumn
	 * @returns
	 */
	public async remove(
		keepIncomeSourceId: number[],
		objectId: number,
		objectColumn = AppraisalIncomeEnum.APPRAISAL_INCOME_APPROACH_ID,
	): Promise<boolean> {
		try {
			const instances = await IncomeOperatingExpense.findAll({
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
	public async findAll(attributes: Partial<IOperatingExpense>): Promise<IOperatingExpense[]> {
		try {
			return await IncomeOperatingExpense.findAll({
				where: attributes,
				raw: true,
			});
		} catch (e) {
			return e.message || e;
		}
	}
}
