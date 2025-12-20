import database from '../../config/db';
const EvaluationRentRollType = database.evaluation_rent_roll_type;
const EvaluationRentRolls = database.evaluation_rent_roll;
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { Op } from 'sequelize';
import HelperFunction from '../../utils/common/helper';
import IRentRollType from './IEvaluationRentRollType';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';
const helperFunction = new HelperFunction();

export default class EvaluationRentRollTypeStore {
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
			return await EvaluationRentRollType.findOne({
				where: attributes,
				attributes: ['id', 'evaluation_scenario_id', 'type'],
				include: [{ model: EvaluationRentRolls, as: 'rent_rolls' }],
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
			return await EvaluationRentRollType.create(attributes);
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
			return await EvaluationRentRollType.update(rest, {
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
	 * @description function to remove unused evaluation approaches.
	 * @param keepApproachId
	 * @param objectId
	 * @returns
	 */
	public async remove(keepApproachId: number[], objectId: number): Promise<boolean> {
		try {
			const objectColumn = EvaluationsEnum.EVALUATION_ID;
			const instances = await EvaluationRentRollType.findAll({
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
	/**
	 *
	 * @param attributes
	 * @returns
	 */
	public async removeType(attributes: Partial<IRentRollType>): Promise<boolean> {
		try {
			await EvaluationRentRollType.destroy({
				where: {
					...attributes,
				},
			});
			return true;
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
