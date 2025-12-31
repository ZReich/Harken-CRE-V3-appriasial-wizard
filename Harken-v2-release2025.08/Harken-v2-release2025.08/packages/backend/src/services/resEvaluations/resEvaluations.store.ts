import database from '../../config/db';
const ResEvaluations = database.res_evaluations;
const IncomeApproaches = database.res_evaluation_income_approaches;
const CostApproaches = database.res_evaluation_cost_approaches;
const SaleApproaches = database.res_evaluation_sales_approaches;
const ResEvaluationScenarios = database.res_evaluation_scenarios;
const Clients = database.clients;
const ResZoning = database.res_zoning;
const ResEvalAmenities = database.res_evaluation_amenities;
const GlobalCodeCategories = database.global_code_categories;
const GlobalCodes = database.global_codes;
const ComparativeAttributeList = database.res_evaluation_comparative_attribute_list;
const User = database.users;
const Account = database.accounts;
const EvaluationFiles = database.res_evaluation_files;
const IncomeOperatingExp = database.res_eval_income_approach_op_exp;
const IncomeApproachSource = database.res_eval_income_approach_source;
const ResEvalIncomeOtherSource = database.res_eval_income_approach_other_source;

import { col, fn, Op, where } from 'sequelize';
import ResZoningStore from '../resZoning/resZoning.store';

import PropertiesStore from '../masterProperty/masterProperty.store';
import ResEvalAmenitiesStore from '../resEvaluationAmenities/resEvaluationAmenities.store';

import {
	IDeleteEvaluation,
	IEvaluation,
	IEvaluationListRequest,
	IEvaluationListSuccess,
	IEvaluationScenarioRequest,
	IEvaluationsUpdateRequest,
} from './IResEvaluationsService';
import { ResEvaluationsEnum } from '../../utils/enums/ResEvaluationsEnum';
import IResZoning from '../../utils/interfaces/IResZoning';
import DefaultEnum from '../../utils/enums/DefaultEnum';
import { IComparativeAttributeList } from '../resEvaluationSaleApproach/IResEvaluationSalesService';

export default class ResEvaluationsStore {
	private masterPropertyStorage = new PropertiesStore();
	private resEvalAmenitiesStore = new ResEvalAmenitiesStore();
	private resZoningStorage = new ResZoningStore();

	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('ResEvaluationsStore', ResEvaluations);
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
			return await ResEvaluations.findOne({
				where: attributes,
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
	public async getResEvaluation(attributes: Partial<IEvaluation>): Promise<IEvaluation> {
		try {
			const evaluation = await ResEvaluations.findOne({
				where: attributes,
				include: [
					{
						model: ResEvaluationScenarios,
						include: [
							{ model: IncomeApproaches, attributes: ['id', 'res_evaluation_scenario_id'] },
							{ model: CostApproaches, attributes: ['id', 'res_evaluation_scenario_id'] },
							{ model: SaleApproaches, attributes: ['id', 'res_evaluation_scenario_id'] },
						],
					},
					ResZoning,
					ResEvalAmenities,
					{
						model: Clients,
						as: 'client',
					},
				],
			});

			if (evaluation && evaluation.res_zonings && Array.isArray(evaluation.res_zonings)) {
				let totalBasement = 0;
				for (const zoning of evaluation.res_zonings) {
					const finished = zoning.basement_finished_sq_ft || 0;
					const unfinished = zoning.basement_unfinished_sq_ft || 0;
					totalBasement += finished + unfinished;
				}
				// Safely add total_basement to plain object
				const plainEvaluation = evaluation.get
					? evaluation.get({ plain: true })
					: { ...evaluation };
				return { ...plainEvaluation, total_basement: totalBasement };
			}
			return evaluation?.get ? evaluation.get({ plain: true }) : evaluation;
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
			return await ResEvaluations.create(attributes);
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
				business_name: data.property_name,
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
			return await ResEvaluations.update(attributes, {
				where: {
					id: evaluationId,
				},
			});
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
			const { res_zonings, ...data } = attributes;
			// Check id is valid or not
			const isValid = await ResEvaluations.findByPk(data.id);
			if (!isValid) {
				return false;
			}
			const masterPropertyId = await this.getMasterProperty(data);
			if (masterPropertyId) {
				data.property_id = masterPropertyId;
				// Create the Evaluation entry
				const evaluation = await ResEvaluations.update(data, {
					where: { id: data.id },
				});

				if (evaluation) {
					if (data.res_evaluation_amenities) {
						await this.resEvalAmenitiesStore.addAmenities(
							data.res_evaluation_amenities,
							data.id,
							ResEvaluationsEnum.EVALUATION_ID,
						);
					}
					// Create zonings entries
					const extractZoning: IResZoning[] = res_zonings.map((zoning: IResZoning) => {
						const { sub_zone_custom, ...rest } = zoning;
						if (zoning.sub_zone == ResEvaluationsEnum.TYPE_MY_OWN) {
							rest.sub_zone = sub_zone_custom || '';
						}
						return rest;
					});
					await this.resZoningStorage.addAssociation(
						extractZoning,
						data.id,
						ResEvaluationsEnum.EVALUATION_ID,
					);
				}
				return evaluation;
			}
			return false;
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
			const { page = 1, search, limit, accountId, userId } = attributes;
			let { orderByColumn, orderBy } = attributes;
			const offset = (page - 1) * limit;

			// Set default ordering
			orderByColumn = orderByColumn || ResEvaluationsEnum.ID;
			orderBy = orderBy || DefaultEnum.DECENDING;

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
			// Search logic
			if (search) {
				filters[Op.or] = [
					{ street_address: { [Op.like]: `%${search}%` } },
					{ property_name: { [Op.like]: `%${search}%` } },
					{ '$client.first_name$': { [Op.like]: `%${search}%` } },
					{ '$client.last_name$': { [Op.like]: `%${search}%` } },
					{ '$client.company$': { [Op.like]: `%${search}%` } },
					// Add full name match using CONCAT
					where(fn('CONCAT', col('client.first_name'), ' ', col('client.last_name')), {
						[Op.like]: `%${search}%`,
					}),
				];
			}

			// 👇 Step 1: Count query
			const count = await ResEvaluations.count({
				where: filters,
				include: [
					{
						model: Clients,
						as: 'client',
						required: true, // Ensures INNER JOIN for accurate filtering
					},
				],
				distinct: true,
			});

			// 👇 Step 2: Data query
			const rows = await ResEvaluations.findAll({
				limit: Number(limit),
				offset,
				order: [[orderByColumn, orderBy]],
				where: filters,
				attributes: [
					'id',
					'property_id',
					'user_id',
					'account_id',
					'client_id',
					'property_name',
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
					ResEvaluationScenarios,
					{
						model: Clients,
						as: 'client',
						attributes: ['id', 'first_name', 'last_name', 'company'],
						required: true,
					},
				],
			});

			return {
				evaluations: rows,
				page,
				perPage: limit,
				totalRecords: count,
			};
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to delete evaluation.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: IDeleteEvaluation): Promise<boolean> {
		try {
			return await ResEvaluations.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description function to get all comparative attributes.
	 * @param attributes
	 * @returns
	 */
	public async getComparativeAttributes(attributes): Promise<IComparativeAttributeList[]> {
		try {
			const { code, status } = attributes;
			const category = await GlobalCodeCategories.findOne({
				where: { type: 'res_evaluation_types' },
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
			const attributesIds = await ComparativeAttributeList.findAll({
				where: { res_evaluation_type_id: gCode.id },
				attributes: ['id', 'comparative_attribute_id', 'default'],
				raw: true,
			});
			const attributesIdsArray = attributesIds.map((item) => item.id);

			const globalCodes = await ComparativeAttributeList.findAll({
				attributes: ['id', 'comparative_attribute_id', 'res_evaluation_type_id', 'default'],
				where: { id: { [Op.in]: attributesIdsArray } },
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
	 * @description get review details.
	 * @param attributes
	 * @returns
	 */
	public async getReviewDetails(attributes: Partial<IEvaluation>): Promise<IEvaluation> {
		try {
			const evaluation = await ResEvaluations.findOne({
				where: attributes,
				attributes: [
					'id',
					'building_size',
					'land_size',
					'comp_type',
					'review_summary',
					'reviewed_by',
					'review_date',
				],
				include: [
					{
						model: ResEvaluationScenarios,
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
				],
			});
			return evaluation;
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
			const evaluation = await ResEvaluations.findOne({
				where: attributes,
				include: [
					{
						model: Clients,
						as: 'client',
					},
					User,
					Account,
					ResZoning,
					EvaluationFiles,
					ResEvalAmenities,
					{
						model: ResEvaluationScenarios,
						include: [
							{
								model: IncomeApproaches,
								include: [
									{ model: IncomeOperatingExp, as: 'operatingExpenses' },
									{ model: IncomeApproachSource, as: 'incomeSources' },
									{ model: ResEvalIncomeOtherSource, as: 'otherIncomeSources', separate: true, order: [['id', 'ASC']] },
								],
							},
						],
					},
				],
			});

			if (!evaluation) return null;

			// Convert entire instance (with all includes) to plain object
			const plainEvaluation = evaluation.get({ plain: true });

			return plainEvaluation;
		} catch (e) {
			return e.message || e;
		}
	}
}
