import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const EvaluationSalesApproach = database.evaluation_sales_approaches;
const SalesApproachComps = database.eval_sales_approach_comps;
const SalesApproachSubjectAdj = database.eval_sales_approach_subject_adj;
const SalesApproachCompAdj = database.eval_sales_approach_comp_adj;
const Comps = database.comps;
const Zoning = database.zoning;
const SubjectQualitativeAdj = database.eval_sales_approach_qualitative_sub_adj;
const SaleQualitativeCompsAdj = database.eval_sales_approach_qualitative_comp_adj;
const SalesComparisonAttribute = database.eval_sales_approach_comparison_attributes;
const PropertyUnits = database.property_units;
import HelperFunction from '../../utils/common/helper';
import {
	IEvalSalesApproach,
	ISalesApproachesRequest,
	ISalesApproachesWeightRequest,
} from './IEvaluationSalesService';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';

const helperFunction = new HelperFunction();
export default class EvaluationSalesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationSalesStore', EvaluationSalesApproach);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to save sales approach
	 * @param attributes
	 * @returns
	 */
	public async createSalesApproach(
		attributes: Partial<ISalesApproachesRequest>,
	): Promise<IEvalSalesApproach> {
		try {
			const {
				sales_comparison_attributes,
				subject_property_adj,
				subject_qualitative_adjustments,
				comp_data,
				...rest
			} = attributes;

			const updatedSubjectPropertyAdjustments = subject_property_adj
				.filter((item) => item.adj_key && item.adj_key.trim() !== '')
				.map((item, index) => ({
					...item,
					order: index + 1, // Start order from 1 and increment by 1
				}));

			let updateSubQualitativeAdjustments = [];
			if (subject_qualitative_adjustments?.length > 0) {
				updateSubQualitativeAdjustments = subject_qualitative_adjustments
					.filter((item) => item.adj_key && item.adj_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}
			let updateComparisonAttributes = [];
			if (sales_comparison_attributes?.length > 0) {
				updateComparisonAttributes = sales_comparison_attributes
					.filter((item) => item.comparison_key && item.comparison_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}
			// Prepare nested comps data
			const nestedComps =
				comp_data?.map((comp) => ({
					...comp,
					comps_adjustments: comp.comps_adjustments || [],
					comps_qualitative_adjustments: comp.comps_qualitative_adjustments || [],
				})) || [];

			return await EvaluationSalesApproach.create(
				{
					...rest,
					sales_comparison_attributes: updateComparisonAttributes || [],
					subject_property_adj: updatedSubjectPropertyAdjustments || [],
					subject_qualitative_adjustments: updateSubQualitativeAdjustments,
					comp_data: nestedComps,
				},
				{
					include: [
						{ model: SalesComparisonAttribute, as: 'sales_comparison_attributes' },
						{ model: SalesApproachSubjectAdj, as: 'subject_property_adj' },
						{ model: SubjectQualitativeAdj, as: 'subject_qualitative_adjustments' },
						{
							model: SalesApproachComps,
							as: 'comp_data',
							include: [
								{ model: SalesApproachCompAdj, as: 'comps_adjustments' },
								{ model: SaleQualitativeCompsAdj, as: 'comps_qualitative_adjustments' },
							],
						},
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
	 * @description Function to find sales approach by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(
		attributes: Partial<IEvalSalesApproach>,
	): Promise<IEvalSalesApproach | null> {
		try {
			const evaluationSalesApproach = await EvaluationSalesApproach.findOne({
				where: attributes,
				attributes: [
					'id',
					'evaluation_scenario_id',
					'eval_weight',
					'averaged_adjusted_psf',
					'sales_approach_value',
					'note',
					'total_comp_adj',
					'sales_approach_indicated_val',
					'area_map_zoom',
					'map_type',
					'map_center_lat',
					'map_center_lng',
					'incremental_value',
				],
				include: [
					{
						model: SalesComparisonAttribute,
						as: 'sales_comparison_attributes',
						attributes: ['comparison_key', 'comparison_value'],
					},
					{
						model: SalesApproachSubjectAdj,
						as: 'subject_property_adj',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: SubjectQualitativeAdj,
						as: 'subject_qualitative_adjustments',
						attributes: ['adj_key', 'adj_value', 'subject_property_value'],
					},
				],
				order: [
					[
						{ model: SalesApproachSubjectAdj, as: 'subject_property_adj' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: SubjectQualitativeAdj, as: 'subject_qualitative_adjustments' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: SalesComparisonAttribute, as: 'sales_comparison_attributes' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
				],
			});

			if (!evaluationSalesApproach) {
				return null; // Early exit if no record is found
			}

			const linkedComps = await SalesApproachComps.findAll({
				where: { evaluation_sales_approach_id: evaluationSalesApproach.id },
				attributes: [
					'id',
					'comp_id',
					'adjustment_note',
					'total_adjustment',
					'adjusted_psf',
					'weight',
					'blended_adjusted_psf',
					'averaged_adjusted_psf',
					'overall_comparability',
					'order',
				],
				include: [
					{
						model: SalesApproachCompAdj,
						as: 'comps_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: SaleQualitativeCompsAdj,
						as: 'comps_qualitative_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
				],
				order: [[EvaluationsEnum.ORDER_BY_COLUMN, 'ASC']],
			});

			// Fetch and attach comp details in parallel
			const compDetails = await Promise.all(
				linkedComps.map(async (comp) => {
					const compData = await Comps.findOne({
						where: { id: comp.comp_id },
						include: [
							{
								model: Zoning,
							},
							{ model: PropertyUnits, attributes: ['beds', 'baths', 'sq_ft'] },
						],
					});

					if (!compData) return null;

					const plainData = compData.get({ plain: true });

					// Calculate totals
					plainData.total_beds = await helperFunction.calculateTotal(plainData.zonings, 'bed');
					plainData.total_beds = plainData.total_beds === 0 ? null : plainData.total_beds;

					plainData.total_units = await helperFunction.calculateTotal(plainData.zonings, 'unit');
					plainData.total_units = plainData.total_units === 0 ? null : plainData.total_units;

					plainData.total_property_beds = await helperFunction.calculateTotal(
						plainData.property_units,
						'beds',
					);
					plainData.total_property_baths = await helperFunction.calculateTotal(
						plainData.property_units,
						'baths',
					);

					return { ...comp.get({ plain: true }), comp_details: plainData };
				}),
			);

			// Add comp details to the response
			return {
				...evaluationSalesApproach.toJSON(),
				comp_data: compDetails.filter(Boolean), // Remove null values
			};
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
	 * @description function to update sale approach details.
	 * @param attributes
	 * @returns
	 */
	public async updateSalesApproach(attributes: Partial<IEvalSalesApproach>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationSalesApproach.update(rest, {
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
	public async findOne(attributes: Partial<IEvalSalesApproach>): Promise<IEvalSalesApproach> {
		try {
			return await EvaluationSalesApproach.findOne({ where: attributes });
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
		attributes: Partial<ISalesApproachesWeightRequest>,
	): Promise<IEvalSalesApproach> {
		try {
			return await EvaluationSalesApproach.create(attributes);
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
		attributes: Partial<ISalesApproachesWeightRequest>,
	): Promise<IEvalSalesApproach> {
		try {
			const { id, ...rest } = attributes;
			await EvaluationSalesApproach.update(rest, {
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
	 * @description Function to remove evaluation sales approach.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<IEvalSalesApproach>): Promise<boolean> {
		try {
			return await EvaluationSalesApproach.destroy({
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
