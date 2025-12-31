import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const AppraisalIncomeApproach = database.appraisal_income_approaches;
import HelperFunction from '../../utils/common/helper';
import {
	IAppraisalIncomeApproach,
	IAppraisalIncomeCreateUpdateRequest,
} from './IAppraisalIncomeApproach';
import { Sequelize } from 'sequelize';
const helperFunction = new HelperFunction();
export default class AppraisalIncomeStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create appraisal
	 * @param attributes
	 * @returns
	 */
	public async createIncomeApproach(
		attributes: Partial<IAppraisalIncomeCreateUpdateRequest>,
	): Promise<IAppraisalIncomeApproach> {
		try {
			return await AppraisalIncomeApproach.create(attributes);
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}
	/**
	 * @description find appraisal income approach.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(
		attributes: Partial<IAppraisalIncomeApproach>,
	): Promise<IAppraisalIncomeApproach> {
		try {
			return await AppraisalIncomeApproach.findOne({
				where: attributes,
				include: [
					{ association: AppraisalIncomeApproach.associations.operatingExpenses },
					{ association: AppraisalIncomeApproach.associations.otherIncomeSources },
					{
						association: AppraisalIncomeApproach.associations.incomeSources,
						separate: true, // Fetch separately to allow ordering
						order: [
							[Sequelize.literal('zoning_id IS NULL'), 'ASC'], // Order by zoning_id IS NOT NULL first, NULLs last
							['zoning_id', 'ASC'],
							['link_overview', 'DESC'],
						],
					},
				],
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}
	/**
	 * @description function to update income approach details.
	 * @param attributes
	 * @returns
	 */
	public async updateIncomeApproach(
		attributes: Partial<IAppraisalIncomeApproach>,
	): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalIncomeApproach.update(rest, {
				where: {
					id: id,
				},
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}

	public async remove(attributes: Partial<IAppraisalIncomeApproach>): Promise<boolean> {
		try {
			return await AppraisalIncomeApproach.destroy({
				where: attributes,
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}
}
