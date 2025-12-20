import database from '../../config/db';
const AppraisalRentRollType = database.appraisal_rent_roll_type;
const AppraisalRentRolls = database.appraisal_rent_roll;
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { Op } from 'sequelize';
import HelperFunction from '../../utils/common/helper';
import IRentRollType from './IAppraisalRentRollType';
const helperFunction = new HelperFunction();

export default class AppraisalRentRollTypeStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find approach by attribute.
	 * @param attributes
	 * @returns
	 */
	public async find(attributes: Partial<IRentRollType>): Promise<IRentRollType> {
		try {
			return await AppraisalRentRollType.findOne({
				where: attributes,
				attributes: ['id', 'appraisal_approach_id', 'type'],
				include: [{ model: AppraisalRentRolls, as: 'rent_rolls' }],
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to add rent roll type.
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IRentRollType>): Promise<IRentRollType> {
		try {
			return await AppraisalRentRollType.create(attributes);
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
	 * @description Function to update rent roll type.
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<IRentRollType>): Promise<IRentRollType> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalRentRollType.update(rest, {
				where: {
					id,
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

	/**
	 * @description function to remove unused appraisal approaches.
	 * @param keepApproachId
	 * @param objectId
	 * @returns
	 */
	public async remove(keepApproachId: number[], objectId: number): Promise<boolean> {
		try {
			const objectColumn = AppraisalsEnum.APPRAISAL_ID;
			const instances = await AppraisalRentRollType.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: keepApproachId,
					},
				},
			});
			if (instances && instances.length > 0) {
				for (const instance of instances) {
					await instance.destroy();
				}
			}
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	}

	public async removeType(attributes: Partial<IRentRollType>): Promise<boolean> {
		try {
			await AppraisalRentRollType.destroy({
				where: {
					attributes,
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
}
