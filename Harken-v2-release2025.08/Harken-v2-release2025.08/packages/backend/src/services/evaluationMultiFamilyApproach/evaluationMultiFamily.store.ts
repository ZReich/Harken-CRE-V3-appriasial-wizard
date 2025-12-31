import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const EvaluationMultiFamilyApproach = database.evaluation_multi_family_approaches;
const MultiFamilyApproachComps = database.eval_multi_family_approach_comps;
const MultiFamilySubjectAdj = database.eval_multi_family_subject_adj;
const MultiFamilyCompAdj = database.eval_multi_family_comp_adj;
const Comps = database.comps;
const Zoning = database.zoning;
const MultiFamilyComparisonAttribute = database.eval_multi_family_comparison_attributes;
const PropertyUnits = database.property_units;
const CompsIncludedUtilities = database.comps_included_utilities;

import HelperFunction from '../../utils/common/helper';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';
import { IMultiFamilyApproach } from './IEvaluationMultiFamily';

const helperFunction = new HelperFunction();
export default class EvaluationMultiFamilyStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationMultiFamilyStore', EvaluationMultiFamilyApproach);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to save multi-family approach.
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IMultiFamilyApproach>): Promise<IMultiFamilyApproach> {
		try {
			const { subject_property_adjustments, comps, comparison_attributes, ...rest } = attributes;

			let updateComparisonAttributes = [];
			if (comparison_attributes?.length > 0) {
				updateComparisonAttributes = comparison_attributes
					.filter((item) => item.comparison_key && item.comparison_key.trim() !== '')
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
			// Prepare nested comps data
			const nestedComps =
				comps?.map((comp) => ({
					...comp,
					comps_adjustments: comp.comps_adjustments || [],
				})) || [];

			return await EvaluationMultiFamilyApproach.create(
				{
					...rest,
					comparison_attributes: updateComparisonAttributes || [],
					subject_property_adjustments: updatedSubjectPropertyAdjustments || [],
					comps: nestedComps,
				},
				{
					include: [
						{ model: MultiFamilySubjectAdj, as: 'subject_property_adjustments' },
						{ model: MultiFamilyComparisonAttribute, as: 'comparison_attributes' },
						{
							model: MultiFamilyApproachComps,
							as: 'comps',
							include: [{ model: MultiFamilyCompAdj, as: 'comps_adjustments' }],
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
	 * @description Function to find multi-family approach by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(
		attributes: Partial<IMultiFamilyApproach>,
	): Promise<IMultiFamilyApproach> {
		try {
			const evaluationMultiFamilyApproach = await EvaluationMultiFamilyApproach.findOne({
				where: attributes,
				include: [
					{ model: MultiFamilySubjectAdj, as: 'subject_property_adjustments' },
					{ model: MultiFamilyComparisonAttribute, as: 'comparison_attributes' },
					{
						model: MultiFamilyApproachComps,
						as: 'comps',
						include: [
							{ model: MultiFamilyCompAdj, as: 'comps_adjustments' },
							{
								model: Comps,
								as: 'comp_details',
								include: [Zoning, PropertyUnits, CompsIncludedUtilities],
							},
						],
					},
				],
				order: [
					[
						{ model: MultiFamilyComparisonAttribute, as: 'comparison_attributes' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: MultiFamilySubjectAdj, as: 'subject_property_adjustments' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: MultiFamilyApproachComps, as: 'comps' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
				],
			});

			if (evaluationMultiFamilyApproach) {
				const { comps } = evaluationMultiFamilyApproach;

				if (comps) {
					const updatedComps = comps.map((comp) => {
						// Convert the comp and its related objects to plain JS objects
						const compPlain = comp.get({ plain: true });
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
							// Add total_beds and total_units to comp_details
							comp_details.total_beds = totalBeds;
							comp_details.total_units = totalUnits;
						}

						return {
							...compPlain, // Use compPlain instead of comps
							comp_details,
						};
					});

					const response = {
						...evaluationMultiFamilyApproach.toJSON(),
						comps: updatedComps,
					};
					return response;
				}
			}

			return evaluationMultiFamilyApproach;
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
	 * @description function to update multi-family approach details.
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<IMultiFamilyApproach>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			await EvaluationMultiFamilyApproach.update(rest, {
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
	public async findOne(attributes: Partial<IMultiFamilyApproach>): Promise<IMultiFamilyApproach> {
		try {
			return await EvaluationMultiFamilyApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Function to remove evaluation multi family approach.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<IMultiFamilyApproach>): Promise<boolean> {
		try {
			return await EvaluationMultiFamilyApproach.destroy({
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
