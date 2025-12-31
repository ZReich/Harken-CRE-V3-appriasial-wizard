import { Op } from 'sequelize';
import database from '../../config/db';
import { AppraisalIncomeEnum } from '../../utils/enums/DefaultEnum';
import { IOtherIncomeSource } from './IAppraisalIncomeOtherSource';
const IncomeApproachOtherSource = database.appraisal_income_approach_other_source;
export default class AppraisalOtherIncomeSourceStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description query to find appraisal other income approach other source by id.
	 * @param attributes
	 * @returns
	 */
	public async find(id: number): Promise<IOtherIncomeSource> {
		try {
			return await IncomeApproachOtherSource.findOne({
				where: {
					id: id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to update appraisal other income approach other source
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(id: number, attributes: Partial<IOtherIncomeSource>): Promise<boolean> {
		try {
			return await IncomeApproachOtherSource.update(attributes, {
				where: { id: id },
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description query to create appraisal other income approach other source
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IOtherIncomeSource>): Promise<IOtherIncomeSource> {
		try {
			return await IncomeApproachOtherSource.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove unused appraisal other income approach other sources.
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
			const instances = await IncomeApproachOtherSource.findAll({
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
	 * @description query to find all appraisal other income approach other source
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IOtherIncomeSource>): Promise<IOtherIncomeSource[]> {
		try {
			return await IncomeApproachOtherSource.findAll({ where: attributes, raw: true });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description
	 * @param attribute
	 * @returns
	 */
	public async removeByAttribute(attribute: Partial<IOtherIncomeSource>): Promise<boolean> {
		try {
			const instances = await IncomeApproachOtherSource.findAll({
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
