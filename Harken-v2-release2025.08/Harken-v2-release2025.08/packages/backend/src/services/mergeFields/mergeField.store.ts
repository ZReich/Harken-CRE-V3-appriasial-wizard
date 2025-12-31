import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { CheckType, IMergeFields } from './IMergeFieldService';
import { TemplateEnum } from '../../utils/enums/MessageEnum';
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import { Op } from 'sequelize';
const MergeFields = database.appraisal_merge_fields;
const helperFunction = new HelperFunction();
export default class MergeFieldStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to find list of merge fields.
	 * @param attributes
	 * @returns
	 */
	public async findAll(checkType: CheckType): Promise<IMergeFields[]> {
		try {
			const { income, cost, sale, lease, rent_roll } = checkType;

			// Build the condition for the type field
			const typeConditions = [];
			if (income) typeConditions.push(AppraisalsEnum.INCOME);
			if (cost) typeConditions.push(AppraisalsEnum.COST);
			if (sale) typeConditions.push(AppraisalsEnum.SALE);
			if (lease) typeConditions.push(AppraisalsEnum.LEASE);
			if (rent_roll) typeConditions.push(AppraisalsEnum.RENT_ROLL);

			const whereClause = { type: null };

			if (typeConditions?.length) {
				whereClause.type = { [Op.in]: typeConditions };
			}

			const orderBy = 'asc';
			const orderByColumn = TemplateEnum.ORDER_BY;

			const mergeFieldList = await MergeFields.findAll({
				where: whereClause,
				attributes: ['tag', 'field', 'type'],
				order: [[orderByColumn, orderBy]],
				raw: true,
			});
			return mergeFieldList;
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(e);
		}
	}
	/**
	 * @description Function to find merge field by id.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<IMergeFields>): Promise<IMergeFields> {
		try {
			return await MergeFields.findOne({ where: attributes, raw: true });
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
