import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const EvaluationIncomeApproach = database.evaluation_income_approaches;
import HelperFunction from '../../utils/common/helper';
import {
	IEvaluationIncomeApproach,
	IEvaluationIncomeCreateUpdateRequest,
	IIncomeApproachesWeightRequest,
} from './IEvaluationIncomeApproach';
import { Sequelize } from 'sequelize';
const helperFunction = new HelperFunction();
export default class EvaluationIncomeStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to update income approach details.
	 * @param attributes
	 * @returns
	 */
	public async updateIncomeApproach(
		attributes: Partial<IEvaluationIncomeApproach>,
	): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationIncomeApproach.update(rest, {
				where: { id },
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
	 * @description Function to remove evaluation income approach.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<IEvaluationIncomeApproach>): Promise<boolean> {
		try {
			return await EvaluationIncomeApproach.destroy({
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
	 * @description find evaluation income approach.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(
		attributes: Partial<IEvaluationIncomeApproach>,
	): Promise<IEvaluationIncomeApproach> {
		try {
			return await EvaluationIncomeApproach.findOne({
				where: attributes,
				include: [
					{ association: EvaluationIncomeApproach.associations.operatingExpenses },
					{ association: EvaluationIncomeApproach.associations.otherIncomeSources },
					{
						association: EvaluationIncomeApproach.associations.incomeSources,
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
	 * @description function to create evaluation
	 * @param attributes
	 * @returns
	 */
	public async createIncomeApproach(
		attributes: Partial<IEvaluationIncomeCreateUpdateRequest>,
	): Promise<IEvaluationIncomeApproach> {
		try {
			const { operatingExpenses, incomeSources, otherIncomeSources, ...rest } = attributes;

			// Helper function to remove `id` if it's null
			const removeNullId = (items) =>
				items.map(({ id, ...otherAttributes }) =>
					id === null ? otherAttributes : { id, ...otherAttributes },
				);
			// Transform the sources using the helper function
			const updatedOperatingExpenses = removeNullId(operatingExpenses);
			const updatedIncomeSources = removeNullId(incomeSources);
			const updatedOtherIncomeSources = removeNullId(otherIncomeSources);

			return await EvaluationIncomeApproach.create(
				{
					...rest,
					operatingExpenses: updatedOperatingExpenses,
					incomeSources: updatedIncomeSources,
					otherIncomeSources: updatedOtherIncomeSources,
				},
				{
					// This will create records in evaluation_income_op_ex, evaluation_income_approach_source, and other income source tables.
					include: [
						{ association: EvaluationIncomeApproach.associations.operatingExpenses },
						{ association: EvaluationIncomeApproach.associations.incomeSources },
						{ association: EvaluationIncomeApproach.associations.otherIncomeSources },
					],
				},
			);
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
	 * @description Function to save weight
	 * @param attributes
	 * @returns
	 */
	public async addWeight(
		attributes: Partial<IIncomeApproachesWeightRequest>,
	): Promise<IEvaluationIncomeApproach> {
		try {
			return await EvaluationIncomeApproach.create(attributes);
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
	 * @description Function to save weight
	 * @param attributes
	 * @returns
	 */
	public async updateWeight(
		attributes: Partial<IIncomeApproachesWeightRequest>,
	): Promise<IEvaluationIncomeApproach> {
		try {
			const { id, ...rest } = attributes;
			await EvaluationIncomeApproach.update(rest, {
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
	 * @description Find Evaluation by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findOne(
		attributes: Partial<IEvaluationIncomeApproach>,
	): Promise<IEvaluationIncomeApproach> {
		try {
			return await EvaluationIncomeApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}
}
