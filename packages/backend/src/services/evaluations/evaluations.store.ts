import database from '../../config/db';
const Evaluations = database.evaluations;
const Account = database.accounts;
const User = database.users;
const Clients = database.clients;
const Zoning = database.zoning;
const IncomeApproaches = database.evaluation_income_approaches;
const CostApproaches = database.evaluation_cost_approaches;
const CostComps = database.eval_cost_approach_comps;
const SaleApproaches = database.evaluation_sales_approaches;
const LeaseComps = database.eval_lease_approach_comps;
const SaleComps = database.eval_sales_approach_comps;
const GlobalCodeCategories = database.global_code_categories;
const GlobalCodes = database.global_codes;
const ComparativeAttributeList = database.evaluation_comparative_attribute_list;
const LeaseApproaches = database.evaluation_lease_approaches;
const EvaluationFiles = database.evaluation_files;
const IncomeOperatingExp = database.eval_income_approach_op_exp;
const IncomeApproachSource = database.eval_income_approach_source;
const EvaluationScenarios = database.evaluation_scenarios;
const CapApproaches = database.evaluation_cap_approaches;
const CapApproachComps = database.eval_cap_approach_comps;
const MultiFamilyApproaches = database.evaluation_multi_family_approaches;
const MultiFamilyApproachComps = database.eval_multi_family_approach_comps;
const RentRollApproaches = database.evaluation_rent_roll_type;
const RentRolls = database.evaluation_rent_roll;
const EvaluationIncludeUtility = database.evaluation_included_utilities;

import { col, fn, Op, where } from 'sequelize';
import { changeDateFormat } from '../../utils/common/Time';
import DefaultEnum from '../../utils/enums/DefaultEnum';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';
import { EvalMessageEnum } from '../../utils/enums/MessageEnum';
import IZoning from '../../utils/interfaces/IZoning';
import { IComparativeAttributeList } from '../evaluationSaleApproach/IEvaluationSalesService';
import EvaluationIncludeUtilityStore from '../evaluationUtilies/evaluationIncludedUtility.store';
import PropertiesStore from '../masterProperty/masterProperty.store';
import ZoningStore from '../zonings/zoning.store';
import {
	IDeleteEvaluation,
	IEvaluation,
	IEvaluationListRequest,
	IEvaluationListSuccess,
	IEvaluationScenarioRequest,
	IEvaluationsUpdateRequest,
} from './IEvaluationsService';

export default class EvaluationsStore {
	private masterPropertyStorage = new PropertiesStore();
	private zoningStorage = new ZoningStore();
	private utilityStorage = new EvaluationIncludeUtilityStore();

	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationsStore', Evaluations);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find Evaluation by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<IEvaluation>): Promise<IEvaluation> {
		try {
			return await Evaluations.findOne({
				where: attributes,
				include: {
					model: EvaluationScenarios,
					as: 'scenarios',
					include: [IncomeApproaches],
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to create Evaluation
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async createEvaluation(attributes: IEvaluationScenarioRequest): Promise<IEvaluation> {
		try {
			return await Evaluations.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Get master property id
	 * @param data
	 * @returns
	 */
	public async getMasterProperty(data) {
		try {
			const coordinates = {
				lat: data.map_pin_lat || data.latitude,
				lng: data.map_pin_lng || data.longitude,
			};

			const address = {
				business_name: data.business_name,
				street_address: data.street_address,
				city: data.city,
				state: data.state,
				zipcode: data.zipcode,
				county: data.county || null,
			};

			return await this.masterPropertyStorage.retrieve(address, coordinates);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to update Evaluation
	 * @param attributes
	 * @returns
	 */
	public async updateOverview(attributes: IEvaluationsUpdateRequest): Promise<boolean> {
		try {
			const { zonings, evaluation_included_utilities, ...data } = attributes;
			// Check id is valid or not
			const isValid = await Evaluations.findByPk(data.id);
			if (!isValid) {
				return false;
			}
			const masterPropertyId = await this.getMasterProperty(data);
			if (masterPropertyId) {
				data.property_id = masterPropertyId;

				if (evaluation_included_utilities?.length) {
					// Add, update and remove utilities
					this.utilityStorage.addUtilities(
						evaluation_included_utilities,
						data.id,
						EvalMessageEnum.EVALUATION_ID,
					);
				}

				// Create the Evaluation entry
				const evaluation = await Evaluations.update(data, {
					where: { id: data.id },
				});

				if (evaluation) {
					if (data.comp_type === EvaluationsEnum.BUILDING_WITH_LAND) {
						// Create zonings entries
						const extractZoning: IZoning[] = await Promise.all(
							zonings.map(async (zoning: IZoning) => {
								if (zoning.sub_zone == EvaluationsEnum.TYPE_MY_OWN) {
									zoning.sub_zone = zoning.sub_zone_custom ? zoning.sub_zone_custom : '';
								}
								delete zoning.sub_zone_custom;
								if (data.comparison_basis == EvaluationsEnum.SF) {
									zoning.unit = null;
									zoning.bed = null;
								} else if (data.comparison_basis == EvaluationsEnum.UNIT) {
									zoning.bed = null;
								} else if (data.comparison_basis == EvaluationsEnum.BED) {
									zoning.unit = null;
								}
								return zoning;
							}),
						);
						await this.zoningStorage.addAssociation(
							extractZoning,
							data.id,
							EvalMessageEnum.EVALUATION_ID,
						);

						await this.updateEvaluation(
							{ land_type: '', analysis_type: EvaluationsEnum.PRICE_SF },
							data.id,
						);
					} else if (data.comp_type === EvaluationsEnum.LAND_ONLY) {
						// Removing zonings and property units data when comp type is land only.
						this.zoningStorage.delete({ evaluation_id: data?.id });
						this.updateEvaluation({ building_size: 0 }, data?.id);
					}
					return true;
				}
				return false;
			}
			return false;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description query to update evaluation details.
	 * @param attributes
	 * @param evaluationId
	 * @returns
	 */
	public async updateEvaluation(
		attributes: Partial<IEvaluation>,
		evaluationId: number,
	): Promise<IEvaluation> {
		try {
			if (attributes?.map_selected_area) {
				attributes.map_selected_area = JSON.stringify(attributes.map_selected_area);
			}
			return await Evaluations.update(attributes, {
				where: {
					id: evaluationId,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Find evaluation by id.
	 * @param attributes
	 * @returns
	 */
	public async getEvaluation(attributes: Partial<IEvaluation>): Promise<IEvaluation> {
		try {
			const evaluation = await Evaluations.findOne({
				where: attributes,
				include: [
					{
						model: Clients,
						as: 'client',
					},
					{
						model: EvaluationScenarios,
						as: 'scenarios',
						include: [
							{ model: IncomeApproaches, attributes: ['id', 'evaluation_scenario_id'] },
							{ model: SaleApproaches, attributes: ['id', 'evaluation_scenario_id'] },
							{ model: CostApproaches, attributes: ['id', 'evaluation_scenario_id'] },
							{ model: LeaseApproaches, attributes: ['id'] },
							{ model: MultiFamilyApproaches, attributes: ['id'] },
							{ model: RentRollApproaches, attributes: ['id'] },
							{ model: CapApproaches, attributes: ['id'] },
							{ model: RentRollApproaches, include: [{ model: RentRolls, as: 'rent_rolls' }] },
						],
					},
					EvaluationFiles,
					Zoning,
					EvaluationIncludeUtility,
				],
			});

			if (evaluation) {
				const { zonings } = evaluation;
				if (zonings && zonings?.length > 0) {
					// Calculate total beds and total units from zonings
					const totalBeds = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.bed || 0),
						0,
					);
					const totalUnits = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.unit || 0),
						0,
					);

					// Add total_beds and total_units to the evaluation
					evaluation.setDataValue('total_beds', totalBeds);
					evaluation.setDataValue('total_units', totalUnits);
				}

				const response = evaluation.toJSON(); // Convert the instance to JSON
				return response as IEvaluation;
			}

			return evaluation;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to delete evaluation.
	 * @param attributes
	 * @returns
	 */
	public async deleteEvaluation(attributes: IDeleteEvaluation): Promise<boolean> {
		try {
			return await Evaluations.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description Find evaluation by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findValidEvaluation(id: number): Promise<IEvaluation> {
		try {
			return await Evaluations.findByPk(id);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to get all evaluation list.
	 * @param attributes
	 * @returns
	 */
	public async getEvaluationList(
		attributes: Partial<IEvaluationListRequest>,
	): Promise<IEvaluationListSuccess> {
		try {
			const filters: any = {};
			const {
				page = 1,
				search,
				limit,
				businessName,
				compType,
				city,
				state,
				streetAddress,
				accountId,
				userId,
			} = attributes;
			let { orderByColumn, orderBy, dateOfAnalysisFrom, dateOfAnalysisTo } = attributes;
			//Applying pagination
			const offset = (page - 1) * limit;

			//Applying searching
			if (search) {
				filters[Op.or] = [
					{ street_address: { [Op.like]: `%${search}%` } },
					{ business_name: { [Op.like]: `%${search}%` } },
					{ '$client.first_name$': { [Op.like]: `%${search}%` } },
					{ '$client.last_name$': { [Op.like]: `%${search}%` } },
					{ '$client.company$': { [Op.like]: `%${search}%` } },
					// Add full name match using CONCAT
					where(fn('CONCAT', col('client.first_name'), ' ', col('client.last_name')), {
						[Op.like]: `%${search}%`,
					}),
				];
			}

			if (!orderByColumn) {
				orderByColumn = EvaluationsEnum.ID;
			}
			if (!orderBy) {
				orderBy = DefaultEnum.DECENDING;
			}
			if (accountId) {
				filters.account_id = accountId;
			}
			// if (userId) {
			// 	filters.user_id = userId;
			// }
			if (userId) {
				filters[Op.or] = [
					{ user_id: userId },
					{ reviewed_by: userId },
				];
			}
			// To filter name
			if (businessName) {
				filters.business_name = businessName;
			}
			// To filter comp type
			if (compType) {
				filters.comp_type = compType;
			}
			// To filter state
			if (state) {
				filters.state = state;
			}
			// To filter city
			if (city?.length) {
				filters.city = { [Op.in]: city };
			}
			// Filter for street address
			if (streetAddress) {
				filters.street_address = { [Op.like]: `%${streetAddress}%` };
			}

			// Converting request date format.
			if (dateOfAnalysisFrom) {
				dateOfAnalysisFrom = changeDateFormat(dateOfAnalysisFrom);
			}
			if (dateOfAnalysisTo) {
				dateOfAnalysisTo = changeDateFormat(dateOfAnalysisTo);
			}

			// Applying filters for date of analysis
			if (dateOfAnalysisFrom && dateOfAnalysisTo) {
				filters.date_of_analysis = {
					[Op.between]: [dateOfAnalysisFrom, dateOfAnalysisTo],
					[Op.not]: null,
				};
			} else if (dateOfAnalysisFrom) {
				filters.date_of_analysis = { [Op.gte]: dateOfAnalysisFrom, [Op.not]: null };
			} else if (dateOfAnalysisTo) {
				filters.date_of_analysis = { [Op.lte]: dateOfAnalysisTo, [Op.not]: null };
			}

			const { count, rows } = await Evaluations.findAndCountAll({
				limit: Number(limit),
				offset: offset,
				order: [[orderByColumn, orderBy]],
				where: filters,
				distinct: true,
				attributes: [
					'id',
					'property_id',
					'user_id',
					'account_id',
					'client_id',
					'business_name',
					'street_address',
					'street_suite',
					'city',
					'county',
					'state',
					'zipcode',
					'type',
					'comp_type',
					'date_of_analysis',
					'position',
				],
				include: [
					{
						model: Clients,
						as: 'client',
						attributes: ['id', 'first_name', 'last_name', 'company'],
						where: {},
					},
					{ model: EvaluationScenarios, as: 'scenarios' },
				],
			});
			return { evaluations: rows, page, perPage: limit, totalRecords: count };
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to check linked comps to evaluation approach
	 * @param attributes
	 * @returns
	 */
	public async getLinkedComps(attributes: Partial<IEvaluation>): Promise<IEvaluation> {
		try {
			const evaluation = await Evaluations.findOne({
				where: attributes,
				include: [
					{
						model: EvaluationScenarios,
						as: 'scenarios',
						include: [
							{
								model: CapApproaches,
								include: [
									{
										model: CapApproachComps,
										as: 'comps',
									},
								],
							},
							{
								model: MultiFamilyApproaches,
								include: [
									{
										model: MultiFamilyApproachComps,
										as: 'comps',
									},
								],
							},
							{
								model: CostApproaches,
								include: [
									{
										model: CostComps,
										as: 'comps',
									},
								],
							},
							{
								model: SaleApproaches,
								include: [
									{
										model: SaleComps,
										as: 'comp_data',
									},
								],
							},
							{
								model: LeaseApproaches,
								include: [
									{
										model: LeaseComps,
										as: 'comps',
									},
								],
							},
						],
					},
				],
			});
			return evaluation;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to get all sale comparative attributes.
	 * @param attributes
	 * @returns
	 */
	public async getComparativeAttributes(attributes): Promise<IComparativeAttributeList[]> {
		try {
			const { code, status } = attributes;
			const category = await GlobalCodeCategories.findOne({
				where: { type: 'property_types' },
			});

			if (!category) {
				return;
			}
			const gCode = await GlobalCodes.findOne({
				where: {
					global_code_category_id: category?.id,
					code,
					status,
				},
			});
			const saleAttributesIds = await ComparativeAttributeList.findAll({
				where: { evaluation_type_id: gCode.id },
				attributes: ['id', 'comparative_attribute_id', 'default'],
				raw: true,
			});
			const saleAttributesIdsArray = saleAttributesIds.map((item) => item.id);

			const globalCodes = await ComparativeAttributeList.findAll({
				attributes: ['id', 'comparative_attribute_id', 'evaluation_type_id', 'default'],
				where: { id: { [Op.in]: saleAttributesIdsArray } },
				include: [
					{
						model: GlobalCodes,
						required: true, // Ensures only matching records are fetched
						where: { status },
						attributes: ['code', 'name'],
					},
				],
				order: [[GlobalCodes, 'name', 'ASC']],
			});
			const newList = globalCodes.map((code) => {
				const codeJSON = code.toJSON();
				const { global_code, ...rest } = codeJSON; // Destructure and exclude the unwanted field
				const attributes = global_code || {};
				return { ...rest, ...attributes }; // Merge the remaining fields with attributes
			});
			return newList;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to get appraisal info for pdf.
	 * @param attributes
	 * @returns
	 */
	public async getEvaluationInfoForPdf(attributes: Partial<IEvaluation>): Promise<IEvaluation> {
		try {
			const evaluation = await Evaluations.findOne({
				where: attributes,
				include: [
					{
						model: Clients,
						as: 'client',
					},
					User,
					Account,
					Zoning,
					EvaluationFiles,
					EvaluationIncludeUtility,
					{
						model: EvaluationScenarios,
						as: 'scenarios',
						include: [
							{
								model: IncomeApproaches,
								include: [
									{ model: IncomeOperatingExp, as: 'operatingExpenses' },
									{ model: IncomeApproachSource, as: 'incomeSources' },
								],
							},
						],
					},
				],
			});

			if (!evaluation) return null;

			// // Convert entire instance (with all includes) to plain object
			// const plainEvaluation = evaluation.get({ plain: true });

			// return plainEvaluation;
			if (evaluation) {
				const { zonings } = evaluation;

				if (zonings && zonings.length > 0) {
					// Calculate total beds and total units from zonings
					const totalBeds = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.bed || 0),
						0,
					);
					const totalUnits = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.unit || 0),
						0,
					);

					// Add total_beds and total_units to the evaluation
					evaluation.setDataValue('total_beds', totalBeds);
					evaluation.setDataValue('total_units', totalUnits);
				}

				const plainEvaluation = evaluation.get({ plain: true }); // Convert instance to plain object
				return plainEvaluation as IEvaluation;
			}
			return evaluation;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description get review
	 * @param attributes
	 * @returns
	 */
	public async getReviewDetails(attributes: Partial<IEvaluation>): Promise<IEvaluation> {
		try {
			const evaluation = await Evaluations.findOne({
				where: attributes,
				attributes: [
					'id',
					'building_size',
					'land_size',
					'comp_type',
					'comparison_basis',
					'review_summary',
					'analysis_type',
					'reviewed_by',
					'review_date',
				],
				include: [
					{
						model: EvaluationScenarios,
						as: 'scenarios',
						attributes: ['id', 'name', 'weighted_market_value', 'rounding'],
						include: [
							{
								model: IncomeApproaches,
								attributes: [
									'id',
									'eval_weight',
									'incremental_value',
									'indicated_psf_annual',
									'indicated_range_annual',
								],
							},
							{
								model: SaleApproaches,
								attributes: [
									'id',
									'eval_weight',
									'incremental_value',
									'averaged_adjusted_psf',
									'sales_approach_value',
								],
							},
							{
								model: CostApproaches,
								attributes: [
									'id',
									'eval_weight',
									'incremental_value',
									'averaged_adjusted_psf',
									'total_cost_valuation',
									'indicated_value_psf',
									'land_value',
								],
							},
						],
					},
					Zoning,
				],
			});

			if (evaluation) {
				const { zonings } = evaluation;
				if (zonings && zonings?.length > 0) {
					// Calculate total beds and total units from zonings
					const totalBeds = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.bed || 0),
						0,
					);
					const totalUnits = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.unit || 0),
						0,
					);

					// Add total_beds and total_units to the evaluation
					evaluation.setDataValue('total_beds', totalBeds);
					evaluation.setDataValue('total_units', totalUnits);
				}

				const response = evaluation.toJSON(); // Convert the instance to JSON
				return response as IEvaluation;
			}
			return evaluation;
		} catch (e) {
			return e.message || e;
		}
	}

	public async deleteData(
		evaluationId: number,
		attributes: Partial<IEvaluation>,
	): Promise<boolean> {
		try {
			// Delete the evaluation itself
			const deleted = await Evaluations.destroy(attributes, { where: { id: evaluationId } });
			return deleted > 0;
		} catch (error) {
			return false;
		}
	}
}
