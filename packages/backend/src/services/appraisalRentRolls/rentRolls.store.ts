import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const AppraisalRentRoll = database.appraisal_rent_roll;
import HelperFunction from '../../utils/common/helper';
import IRentRolls from './IRentRolls';
import { Op } from 'sequelize';
import { RentRollEnums } from '../../utils/enums/CommonEnum';
import { ISaveRentRoll } from '../appraisals/IAppraisalsService';
const helperFunction = new HelperFunction();
export default class AppraisalRentRollsStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create rent roll
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<ISaveRentRoll>): Promise<IRentRolls> {
		try {
			return await AppraisalRentRoll.create(attributes);
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
	 * @description find appraisal rent roll
	 * @param attributes
	 * @returns
	 */
	public async find(attributes: Partial<IRentRolls>): Promise<IRentRolls> {
		try {
			return await AppraisalRentRoll.findOne({
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
	/**
	 * @description Function to get all rent rolls.
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IRentRolls>): Promise<IRentRolls[]> {
		try {
			return await AppraisalRentRoll.findAll({
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
	/**
	 * @description function to update rent roll details
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<IRentRolls>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalRentRoll.update(rest, {
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

	/**
	 * @description Function to remove rent roll.
	 * @param keepRentRollId
	 * @param objectId
	 * @param objectColumn
	 * @returns
	 */
	public async remove(
		keepRentRollId: number[],
		objectId: number,
		objectColumn = RentRollEnums.APPRAISAL_RENT_ROLL_TYPE_ID,
	): Promise<boolean> {
		try {
			const instances = await AppraisalRentRoll.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: keepRentRollId,
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
			return e.message || e;
		}
	}

	public async removeAll(): Promise<boolean> {
		try {
			const instances = await AppraisalRentRoll.findAll({
				attributes: ['id'],
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
			return e.message || e;
		}
	}
}
