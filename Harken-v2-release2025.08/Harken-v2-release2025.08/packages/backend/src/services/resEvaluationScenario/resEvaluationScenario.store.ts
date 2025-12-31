import { Op } from 'sequelize';
import database from '../../config/db';
const ResEvaluationScenarios = database.res_evaluation_scenarios;
import { IResEvaluationScenario } from './IResEvaluationScenarioService';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { ResEvaluationsEnum } from '../../utils/enums/ResEvaluationsEnum';

const helperFunction = new HelperFunction();
export default class ResEvaluationScenarioStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationScenarioStore', ResEvaluationScenarioStore);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find scenario by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findScenario(
		attributes: Partial<IResEvaluationScenario>,
	): Promise<IResEvaluationScenario> {
		try {
			return await ResEvaluationScenarios.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to create new scenario.
	 * @param attributes
	 * @returns
	 */
	public async createScenario(attributes: IResEvaluationScenario): Promise<IResEvaluationScenario> {
		try {
			return await ResEvaluationScenarios.create(attributes);
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
		attributes: Partial<IResEvaluationScenario>,
	): Promise<IResEvaluationScenario> {
		try {
			return await ResEvaluationScenarios.update(attributes, {
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
			const objectColumn = ResEvaluationsEnum.EVALUATION_ID;
			const instances = await ResEvaluationScenarios.findAll({
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
}
