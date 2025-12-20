import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const EvaluationCapApproach = database.evaluation_cap_approaches;
const CapApproachComps = database.eval_cap_approach_comps;
const Comps = database.comps;
const Zoning = database.zoning;
const PropertyUnits = database.property_units;
const CapComparisonAttribute = database.eval_cap_approach_comparison_attributes;

import HelperFunction from '../../utils/common/helper';
import { ICapApproach, ICapApproachRequest } from './IEvaluationCapApproach';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';

const helperFunction = new HelperFunction();
export default class EvaluationCapApproachStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('evaluationCostApproach', EvaluationCapApproach);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to save cap approach
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<ICapApproachRequest>): Promise<ICapApproach> {
		try {
			const { comps, comparison_attributes, ...rest } = attributes;

			let updateComparisonAttributes = [];

			if (comparison_attributes?.length > 0) {
				updateComparisonAttributes = comparison_attributes
					.filter((item) => item.comparison_key && item.comparison_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}
			// Prepare nested comps data
			const nestedComps =
				comps?.map((comp) => ({
					...comp,
				})) || [];

			return await EvaluationCapApproach.create(
				{
					...rest,
					comparison_attributes: updateComparisonAttributes || [],
					comps: nestedComps,
				},
				{
					include: [
						{
							model: CapApproachComps,
							as: 'comps',
						},
						{ model: CapComparisonAttribute, as: 'comparison_attributes' },
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
	 * @description Function to find cap approach by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ICapApproach>): Promise<ICapApproach> {
		try {
			const evaluationCapApproach = await EvaluationCapApproach.findOne({
				where: attributes,
				include: [
					{
						model: CapApproachComps,
						as: 'comps',
						include: [{ model: Comps, as: 'comp_details', include: [Zoning, PropertyUnits] }],
						order: [['order', 'ASC']], // Order CapApproachComps by 'order'
					},
					{ model: CapComparisonAttribute, as: 'comparison_attributes' },
				],
				order: [
					[
						{ model: CapComparisonAttribute, as: 'comparison_attributes' },
						EvaluationsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
				],
			});

			if (evaluationCapApproach) {
				const { comps } = evaluationCapApproach;

				if (comps) {
					// Ensure comps are sorted by 'order' in case the ORM doesn't do it
					const sortedComps = comps
						.map((comp) => comp)
						.sort((a, b) => (a.order || 0) - (b.order || 0));

					const updatedComps = sortedComps.map((comp) => {
						const compPlain = comp.get({ plain: true });
						const { comp_details } = compPlain;
						let totalBeds;
						let totalUnits;
						if (comp_details && comp_details.zonings) {
							totalBeds = comp_details.zonings.reduce((sum, zoning) => sum + (zoning.bed || 0), 0);
							totalUnits = comp_details.zonings.reduce(
								(sum, zoning) => sum + (zoning.unit || 0),
								0,
							);
							totalBeds = totalBeds === 0 ? null : totalBeds;
							totalUnits = totalUnits === 0 ? null : totalUnits;
							comp_details.total_beds = totalBeds;
							comp_details.total_units = totalUnits;
						}

						return {
							...compPlain,
							comp_details,
						};
					});

					const response = {
						...evaluationCapApproach.toJSON(),
						comps: updatedComps,
					};
					return response;
				}
			}

			return evaluationCapApproach;
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
	public async updateCapApproach(attributes: Partial<ICapApproach>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			await EvaluationCapApproach.update(rest, {
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
	 * @description Find one cap approach.
	 * @param attributes
	 * @returns
	 */
	public async findOne(attributes: Partial<ICapApproach>): Promise<ICapApproach> {
		try {
			return await EvaluationCapApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove evaluation cap approach.
	 * @param attributes
	 * @returns
	 */
	public async remove(attributes: Partial<ICapApproach>): Promise<boolean> {
		try {
			return await EvaluationCapApproach.destroy({
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
