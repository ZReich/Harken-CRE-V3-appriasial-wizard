import { Op } from 'sequelize';
import database from '../../config/db';
const EvaluationScenarios = database.evaluation_scenarios;
import { IEvaluationScenario } from './IEvaluationScenarioService';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';

const helperFunction = new HelperFunction();
export default class EvaluationScenarioStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationScenarioStore', EvaluationScenarioStore);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find scenario by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findScenario(
		attributes: Partial<IEvaluationScenario>,
	): Promise<IEvaluationScenario> {
		try {
			return await EvaluationScenarios.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to create new scenario.
	 * @param attributes
	 * @returns
	 */
	public async createScenario(attributes: IEvaluationScenario): Promise<IEvaluationScenario> {
		try {
			return await EvaluationScenarios.create(attributes);
		} catch (e) {
			console.log(e);
			return e.message || e;
		}
	}

	/**
	 * @description Function to update any scenario.
	 * @param attributes
	 * @returns
	 */
	public async updateScenario(
		id: number,
		attributes: Partial<IEvaluationScenario>,
	): Promise<IEvaluationScenario> {
		try {
			return await EvaluationScenarios.update(attributes, {
				where: {
					id: id,
				},
			});
		} catch (e) {
			console.log(e);
			return e.message || e;
		}
	}

	/**
	 * @description function to remove unused Evaluation approaches.
	 * @param keepApproachId
	 * @param objectId
	 * @returns
	 */
	public async removeScenarios(keepId: number[], objectId: number): Promise<boolean> {
		try {
			const objectColumn = EvaluationsEnum.EVALUATION_ID;
			const instances = await EvaluationScenarios.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: keepId,
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
	 * @description Find all scenario by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IEvaluationScenario>): Promise<IEvaluationScenario[]> {
		try {
			return await EvaluationScenarios.findAll({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}
}
