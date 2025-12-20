import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const AppraisalCostApproach = database.appraisal_cost_approaches;
const CostApproachComps = database.appraisal_cost_approach_comps;
const CostApproachSubjectAdj = database.appraisal_cost_approach_subject_adj;
const CostApproachCompAdj = database.appraisal_cost_approach_comp_adj;
const CostApproachImprovements = database.appraisal_cost_approach_improvements;
const Comps = database.comps;
const Zoning = database.zoning;
import HelperFunction from '../../utils/common/helper';
import { ICostApproach } from './IAppraisalCostApproach';
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import { Sequelize } from 'sequelize';

const helperFunction = new HelperFunction();
export default class AppraisalCostApproachStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('appraisalCostStore', AppraisalCostApproach);
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
			const { cost_subject_property_adjustments, comps, ...rest } = attributes;
			const updatedSubjectPropertyAdjustments =
				cost_subject_property_adjustments
					?.filter((item) => item.adj_key && item.adj_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					})) || [];
			// Prepare nested comps data
			const nestedComps =
				comps?.map((comp) => ({
					...comp,
					comps_adjustments: comp?.comps_adjustments || [],
				})) || [];

			return await AppraisalCostApproach.create(
				{
					...rest,
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
			const appraisalCostApproach = await AppraisalCostApproach.findOne({
				where: attributes,
				include: [
					{ model: CostApproachSubjectAdj, as: 'cost_subject_property_adjustments' },
					{
						model: CostApproachComps,
						as: 'comps',
						include: [
							{ model: CostApproachCompAdj, as: 'comps_adjustments' },
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
						AppraisalsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
				],
			});

			if (appraisalCostApproach) {
				const { comps } = appraisalCostApproach;

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
						...appraisalCostApproach.toJSON(),
						comps: updatedComps,
					};
					return response;
				}
			}

			return appraisalCostApproach;
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
			await AppraisalCostApproach.update(rest, {
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
	 * @description Find appraisal by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findOne(attributes: Partial<ICostApproach>): Promise<ICostApproach> {
		try {
			return await AppraisalCostApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}
}
