import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const EvaluationLeaseApproach = database.evaluation_lease_approaches;
const LeaseApproachComps = database.eval_lease_approach_comps;
const LeaseApproachSubjectAdj = database.eval_lease_approach_subject_adj;
const LeaseApproachCompAdj = database.eval_lease_approach_comp_adj;
const SubjectLeaseQualitativeAdj = database.eval_lease_approach_qualitative_sub_adj;
const LeaseQualitativeCompsAdj = database.eval_lease_approach_qualitative_comp_adj;
const Comps = database.comps;
const Zoning = database.zoning;
const PropertyUnits = database.property_units;
const LeaseComparisonAttribute = database.eval_lease_approach_comparison_attributes;
import HelperFunction from '../../utils/common/helper';
import { ILeaseApproach, ILeaseApproachRequest } from './IEvaluationLeaseService';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';

const helperFunction = new HelperFunction();
export default class EvaluationLeaseStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to save lease approach
	 * @param attributes
	 * @returns
	 */
	public async createLeaseApproach(
		attributes: Partial<ILeaseApproachRequest>,
	): Promise<ILeaseApproach> {
		try {
			const {
				subject_property_adjustments,
				subject_qualitative_adjustments,
				comps,
				comparison_attributes,
				...rest
			} = attributes;

			let updateComparisonAttributes = [];
			if (comparison_attributes?.length > 0) {
				updateComparisonAttributes = comparison_attributes
					.filter((item) => item?.comparison_key && item?.comparison_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}

			const updatedSubjectPropertyAdjustments = subject_property_adjustments
				.filter((item) => item?.adj_key && item?.adj_key.trim() !== '')
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
			// Prepare nested comps data
			const nestedComps =
				comps?.map((comp) => ({
					...comp,
					comps_adjustments: comp.comps_adjustments || [],
					comps_qualitative_adjustments: comp.comps_qualitative_adjustments || [],
				})) || [];

			return await EvaluationLeaseApproach.create(
				{
					...rest,
					comparison_attributes: updateComparisonAttributes || [],
					subject_property_adjustments: updatedSubjectPropertyAdjustments || [],
					subject_qualitative_adjustments: updateSubQualitativeAdjustments,
					comps: nestedComps,
				},
				{
					include: [
						{ model: LeaseApproachSubjectAdj, as: 'subject_property_adjustments' },
						{ model: SubjectLeaseQualitativeAdj, as: 'subject_qualitative_adjustments' },
						{
							model: LeaseApproachComps,
							as: 'comps',
							include: [
								{ model: LeaseApproachCompAdj, as: 'comps_adjustments' },
								{ model: LeaseQualitativeCompsAdj, as: 'comps_qualitative_adjustments' },
							],
						},
						{ model: LeaseComparisonAttribute, as: 'comparison_attributes' },
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
	 * @description Function to find lease approach by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ILeaseApproach>): Promise<ILeaseApproach> {
		try {
			const evaluationLeaseApproach = await EvaluationLeaseApproach.findOne({
				where: attributes,
				attributes: [
					'id',
					'evaluation_scenario_id',
					'weight',
					'averaged_adjusted_psf',
					'notes',
					'lease_comps_notes',
					'area_map_zoom',
					'map_type',
					'map_center_lat',
					'map_center_lng',
					'low_adjusted_comp_range',
					'high_adjusted_comp_range',
				],
				include: [
					{
						model: LeaseComparisonAttribute,
						as: 'comparison_attributes',
						attributes: ['comparison_key', 'comparison_value'],
					},
					{
						model: LeaseApproachSubjectAdj,
						as: 'subject_property_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: SubjectLeaseQualitativeAdj,
						as: 'subject_qualitative_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
				],
				order: [
					[
						{ model: LeaseApproachSubjectAdj, as: 'subject_property_adjustments' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: SubjectLeaseQualitativeAdj, as: 'subject_qualitative_adjustments' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: LeaseComparisonAttribute, as: 'comparison_attributes' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
				],
			});

			if (!evaluationLeaseApproach) {
				return null; // Early exit if no record is found
			}
			const linkedComps = await LeaseApproachComps.findAll({
				where: { evaluation_lease_approach_id: evaluationLeaseApproach?.id },
				attributes: [
					'id',
					'comp_id',
					'adjustment_note',
					'total_adjustment',
					'adjusted_psf',
					'weight',
					'blended_adjusted_psf',
					'averaged_adjusted_psf',
					'order',
				],
				include: [
					{
						model: LeaseApproachCompAdj,
						as: 'comps_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: LeaseQualitativeCompsAdj,
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
						where: { id: comp?.comp_id },
						include: [
							{
								model: Zoning,
							},
							{
								model: PropertyUnits,
							},
						],
					});

					if (!compData) return null;

					const plainData = compData.get({ plain: true });

					// Calculate totals
					plainData.total_beds = await helperFunction.calculateTotal(plainData.zonings, 'bed');
					plainData.total_units = await helperFunction.calculateTotal(plainData.zonings, 'unit');

					return { ...comp.get({ plain: true }), comp_details: plainData };
				}),
			);
			// Add comp details to the response
			return {
				...evaluationLeaseApproach.toJSON(),
				comps: compDetails.filter(Boolean), // Remove null values
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
	 * @description function to update lease approach details.
	 * @param attributes
	 * @returns
	 */
	public async updateLeaseApproach(attributes: Partial<ILeaseApproach>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationLeaseApproach.update(rest, {
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
	 * @description Find one lease approach.
	 * @param attributes
	 * @returns
	 */
	public async findOne(attributes: Partial<ILeaseApproach>): Promise<ILeaseApproach> {
		try {
			return await EvaluationLeaseApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove evaluation lease approach.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<ILeaseApproach>): Promise<boolean> {
		try {
			return await EvaluationLeaseApproach.destroy({
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
