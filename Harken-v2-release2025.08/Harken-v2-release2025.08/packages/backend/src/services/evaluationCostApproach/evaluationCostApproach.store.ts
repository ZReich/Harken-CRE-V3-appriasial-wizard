import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const EvaluationCostApproach = database.evaluation_cost_approaches;
const CostApproachComps = database.eval_cost_approach_comps;
const CostApproachSubjectAdj = database.eval_cost_approach_subject_adj;
const CostApproachCompAdj = database.eval_cost_approach_comp_adj;
const CostApproachImprovements = database.eval_cost_approach_improvements;
const Comps = database.comps;
const Zoning = database.zoning;
const CostComparisonAttribute = database.eval_cost_approach_comparison_attributes;
import HelperFunction from '../../utils/common/helper';
import { ICostApproach, ICostApproachesWeightRequest } from './IEvaluationCostApproach';
import { Sequelize } from 'sequelize';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';

const helperFunction = new HelperFunction();
export default class EvaluationCostApproachStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('evaluationCostApproach', EvaluationCostApproach);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to save cost approach
	 * @param attributes
	 * @returns
	 */
	public async createCostApproach(attributes: Partial<ICostApproach>): Promise<ICostApproach> {
		try {
			const { cost_subject_property_adjustments, comparison_attributes, comps, ...rest } =
				attributes;
			const updatedSubjectPropertyAdjustments =
				cost_subject_property_adjustments
					?.filter((item) => item?.adj_key && item?.adj_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					})) || [];

			let updateComparisonAttributes = [];
			if (comparison_attributes?.length > 0) {
				updateComparisonAttributes = comparison_attributes
					.filter((item) => item?.comparison_key && item?.comparison_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}

			// Prepare nested comps data
			const nestedComps =
				comps?.map((comp) => ({
					...comp,
					comps_adjustments: comp?.comps_adjustments || [],
				})) || [];

			return await EvaluationCostApproach.create(
				{
					...rest,
					comparison_attributes: updateComparisonAttributes || [],
					cost_subject_property_adjustments: updatedSubjectPropertyAdjustments || [],
					comps: nestedComps,
				},
				{
					include: [
						{ model: CostApproachSubjectAdj, as: 'cost_subject_property_adjustments' },
						{
							model: CostApproachComps,
							as: 'comps',
							include: [{ model: CostApproachCompAdj, as: 'comps_adjustments' }],
						},
						{ model: CostComparisonAttribute, as: 'comparison_attributes' },
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
	 * @description Function to find cost approach by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ICostApproach>): Promise<ICostApproach> {
		try {
			const evaluationCostApproach = await EvaluationCostApproach.findOne({
				where: attributes,
				include: [
					{
						model: CostApproachSubjectAdj,
						as: 'cost_subject_property_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: CostComparisonAttribute,
						as: 'comparison_attributes',
						attributes: ['comparison_key', 'comparison_value'],
					},
					{
						model: CostApproachComps,
						as: 'comps',
						include: [
							{
								model: CostApproachCompAdj,
								as: 'comps_adjustments',
								attributes: ['adj_key', 'adj_value'],
							},
							{ model: Comps, as: 'comp_details', include: [Zoning] },
						],
					},
					{
						model: CostApproachImprovements,
						as: 'improvements',
						separate: true, // Separate fetch for comp_details
						order: [
							[Sequelize.literal('zoning_id IS NULL'), 'ASC'], // Order NULLs last
							['zoning_id', 'ASC'],
						],
					},
				],
				order: [
					[
						{ model: CostApproachSubjectAdj, as: 'cost_subject_property_adjustments' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: CostComparisonAttribute, as: 'comparison_attributes' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[{ model: CostApproachComps, as: 'comps' }, EvaluationsEnum.ORDER_BY_COLUMN, 'ASC'],
				],
			});

			if (evaluationCostApproach) {
				const { comps } = evaluationCostApproach;

				if (comps) {
					const updatedComps = comps.map((comp) => {
						// Convert the comp and its related objects to plain JS objects
						const compPlain = comp.toJSON();
						const { comp_details } = compPlain;

						// Check if comp_details and zonings exist
						if (comp_details && comp_details.zonings) {
							const totalBeds = comp_details.zonings.reduce(
								(sum, zoning) => sum + (zoning.bed || 0),
								0,
							);
							const totalUnits = comp_details.zonings.reduce(
								(sum, zoning) => sum + (zoning.unit || 0),
								0,
							);
							// Replace 0 with null
							const finalBeds = totalBeds === 0 ? null : totalBeds;
							const finalUnits = totalUnits === 0 ? null : totalUnits;

							// Add total_beds and total_units to comp_details
							comp_details.total_beds = finalBeds;
							comp_details.total_units = finalUnits;
						}

						return {
							...compPlain, // Use compPlain instead of comps
							comp_details,
						};
					});

					const response = {
						...evaluationCostApproach.toJSON(),
						comps: updatedComps,
					};
					return response;
				}
			}

			return evaluationCostApproach;
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
	 * @description function to update cost approach details.
	 * @param attributes
	 * @returns
	 */
	public async updateCostApproach(attributes: Partial<ICostApproach>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			await EvaluationCostApproach.update(rest, {
				where: {
					id: id,
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
			return false;
		}
	}

	/**
	 * @description Find evaluation by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findOne(attributes: Partial<ICostApproach>): Promise<ICostApproach> {
		try {
			return await EvaluationCostApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to save weight
	 * @param attributes
	 * @returns
	 */
	public async addWeight(
		attributes: Partial<ICostApproachesWeightRequest>,
	): Promise<ICostApproach> {
		try {
			return await EvaluationCostApproach.create(attributes);
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
		attributes: Partial<ICostApproachesWeightRequest>,
	): Promise<ICostApproach> {
		try {
			const { id, ...rest } = attributes;
			await EvaluationCostApproach.update(rest, {
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
	 * @description Function to remove evaluation cost approach.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<ICostApproach>): Promise<boolean> {
		try {
			return await EvaluationCostApproach.destroy({
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
