import { Op } from 'sequelize';
import database from '../../config/db';
import { IIncomeSource } from './IAppraisalIncomeSourceService';
import { AppraisalIncomeEnum } from '../../utils/enums/DefaultEnum';
const IncomeApproachSource = database.appraisal_income_approach_source;
export default class AppraisalIncomeSourcesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('IncomeApproachStorage', IncomeApproachSource);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description query to find appraisal income approach source by id.
	 * @param attributes
	 * @returns
	 */
	public async find(id: number): Promise<IIncomeSource> {
		try {
			return await IncomeApproachSource.findOne({
				where: {
					id: id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update appraisal income approach source
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(id: number, attributes: Partial<IIncomeSource>): Promise<boolean> {
		try {
			return await IncomeApproachSource.update(attributes, {
				where: { id: id },
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description query to create appraisal income approach source
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IIncomeSource>): Promise<IIncomeSource> {
		try {
			return await IncomeApproachSource.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove unused appraisal income approach sources.
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
			const instances = await IncomeApproachSource.findAll({
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
	 * @description query to find all appraisal income approach source
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IIncomeSource>): Promise<IIncomeSource[]> {
		try {
			return await IncomeApproachSource.findAll({ where: attributes, raw: true });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 *
	 * @param attribute
	 * @returns
	 */
	public async removeByAttribute(attribute: Partial<IIncomeSource>): Promise<boolean> {
		try {
			const instances = await IncomeApproachSource.findAll({
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
