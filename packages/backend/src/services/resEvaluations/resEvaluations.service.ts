import sharp from 'sharp';
import { S3_BASE_URL } from '../../env';
import SendResponse from '../../utils/common/commonResponse';
import HelperFunction from '../../utils/common/helper';
import UploadFunction from '../../utils/common/upload';
import { ScreenEnums } from '../../utils/enums/CommonEnum';
import {
	FileOriginEnum,
	FileStorageEnum,
	LoggerEnum,
	UploadEnum,
} from '../../utils/enums/DefaultEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import UserEnum, {
	ClientEnum,
	CommonEnum,
	CompEnum,
	EvalMessageEnum,
	FileEnum,
	PhotoPagesEnum,
} from '../../utils/enums/MessageEnum';
import { ResEvaluationsEnum } from '../../utils/enums/ResEvaluationsEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import StatusEnum from '../../utils/enums/StatusEnum';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import ClientStore from '../clients/client.store';

import {
	IEvaluationFilesData,
	IFilesPosition,
	IUpdateEvalPositions,
	IUpdateExhibits,
} from '../resEvaluationFiles/IResEvaluationFilesService';
import { IResEvaluationMetaData } from '../resEvaluationMetaData/IResEvaluationMetaDataService';
import EvaluationMetaDataStore from '../resEvaluationMetaData/resEvaluationMetaData.store';
import {
	IEvalPhotoPage,
	IEvalPhotoPageRequest,
	IEvalPhotoPagesSuccess,
	IEvaluationPhotoPages,
} from '../resEvaluationPhotoPages/IResEvaluationPhotoPagesService';
import EvaluationPhotoPagesStorage from '../resEvaluationPhotoPages/resEvaluationPhotoPages.store';
import { saveEvalPhotoPagesSchema } from '../resEvaluationPhotoPages/resEvaluationPhotoPages.validations';
import ResEvaluationScenarioStore from '../resEvaluationScenario/resEvaluationScenario.store';
import { IUploadSuccess, IUploadURLSuccessData } from '../uploadFiles/IUploadService';
import {
	IAerialMap,
	IAreaInfo,
	IAreaMap,
	ICalculateIncome,
	IEvaluation,
	IEvaluationFiles,
	IEvaluationListRequest,
	IEvaluationListSuccess,
	IEvaluationRequest,
	IEvaluationScenarioRequest,
	IEvaluationSuccess,
	IEvaluationsUpdateRequest,
	IGetAllAreaInfo,
	IGetAreaInfoRequest,
	IGetEvaluationRequest,
	IGetRequest,
	IGetSelectedCompRequest,
	IMapBoundary,
	IMergeFieldDataRequest,
	IPositionRequest,
	IPostEvalExhibitsRequest,
	IRemoveExhibitsRequest,
	IRemoveImageRequest,
	ISaveAreaMap,
	ISaveWeightPercentage,
	IUploadImageRequest,
} from './IResEvaluationsService';
import ResEvaluationsStore from './resEvaluations.store';
import {
	aerialMapSchema,
	evalAreaInfoSchema,
	evalCostApproachSchema,
	evaluationCombinedSchema,
	evaluationListSchema,
	evaluationPositionSchema,
	evaluationSaveScenarioSchema,
	getSelectedCompSchema,
	mapBoundarySchema,
	resEvalIncomeApproachSchema,
	saveAreaMapSchema,
	saveCostImprovementSchema,
	updateExhibitPositionSchema,
	saveSalesApproachSchema,
	uploadImageSchema,
	SaveApproachPercentSchema,
	SaveReviewSchema,
} from './resEvaluations.validations';
import {
	handleIncomeSourceOrOpExp,
	IEvalIncomeApproachRequest,
	IResEvaluationIncomeApproach,
	IResEvaluationIncomeSaveRequest,
} from '../resEvaluationIncomeApproach/IResEvaluationIncomeApproach';
import ResEvaluationIncomeSourcesStore from '../resEvaluationIncomeSource/resEvaluationIncomeSource.store';
import ResEvaluationIncomeStore from '../resEvaluationIncomeApproach/resEvaluationIncome.store';
import { EvaluationsEnum, IncomeApproachEnum } from '../../utils/enums/EvaluationsEnum';
import ResEvalOperatingExpensesStorage from '../resEvaluationOperatingExpenses/resEvaluationOperatingExpense.store';
import ResEvaluationOtherIncomeStore from '../resEvaluationIncomeOtherSources/resEvaluationIncomeOtherSource.store';
import {
	GetCostApproachRequest,
	ICostApproach,
	ISaveCostApproachRequest,
	ISaveCostImprovements,
} from '../resEvaluationCostApproach/IResEvaluationCostApproach';
import ResEvaluationCostApproachStore from '../resEvaluationCostApproach/resEvaluationCostApproach.store';
import ResEvaluationCostSubAdjStorage from '../resEvaluationCostApproachSubAdj/resEvaluationCostApproachSubAdj.store';
import ResEvaluationCostCompAdjStorage from '../resEvaluationCostApproachCompAdj/resEvaluationCostApproachCompAdj.store';
import ResEvaluationCostImprovementStorage from '../resEvaluationCostApproachImprovements/resEvaluationCostImprovements.store';
import ResEvaluationCostCompsStorage from '../resEvalCostApproachComps/resEvaluationCostApproachComps.store';
import { ICostSubPropertyAdj } from '../resEvaluationCostApproachSubAdj/IResEvaluationCostApproachSubAdj';
import { ICostComp } from '../resEvalCostApproachComps/IResEvaluationCostApproachComps';
import { ICostCompsAdjustment } from '../resEvaluationCostApproachCompAdj/IResEvaluationCostApproachCompAdj';
import { ICostComparisonAttributes } from '../resEvaluationCostCompareAttributes/IResEvaluationCostCompareAttributes';
import ResEvaluationCostComparativeStore from '../resEvaluationCostCompareAttributes/resEvaluationCostCompareAttributes.store';
import { ICostImprovements } from '../resEvaluationCostApproachImprovements/IResEvaluationCostApproachImprovements';
import { IResComp } from '../residentialComp/IResCompService';
import ResCompsStore from '../residentialComp/resComp.store';
import ResEvaluationFilesStore from '../resEvaluationFiles/resEvaluationFiles.store';
import {
	EvalSalesApproachRequest,
	GetSalesApproachRequest,
	IComparativeListSuccess,
	IEvalSalesApproach,
	ISalesApproachesRequest,
} from '../resEvaluationSaleApproach/IResEvaluationSalesService';
import ResEvaluationSalesStore from '../resEvaluationSaleApproach/resEvaluationSales.store';
import { ISaleComparisonAttributes } from '../resEvaluationSaleCompareAttributes/IResEvaluationSaleCompareAttributes';
import ResEvaluationSaleComparisonStore from '../resEvaluationSaleCompareAttributes/resEvaluationSaleCompareAttributes.store';
import { SalesSubAdjustments } from '../resEvaluationSalesApproachSubjectAdj/IResEvaluationSalesApproachSubAdj';
import ResEvaluationSalesSubAdjStorage from '../resEvaluationSalesApproachSubjectAdj/resEvaluationSalesSubjectAdj.store';
import { ISaleSubQualitativeAdj } from '../resEvaluationSaleQualitativeSubAdj/IResEvaluationSaleQualitativeAdj';
import ResEvaluationSaleSubQualitativeAdjStore from '../resEvaluationSaleQualitativeSubAdj/resEvaluationSaleQualitativeAdj.store';
import { ISalesComp } from '../resEvaluationSalesApproachComps/IResEvaluationSalesApproachComps';
import ResEvaluationSalesCompsStorage from '../resEvaluationSalesApproachComps/resEvaluationSalesApproachComps.store';
import { ISaleCompsQualitativeAdj } from '../resEvaluationSaleCompsQualitativeAdj/IResEvaluationSaleCompQualitativeAdj';
import ResEvaluationSalesCompAdjStorage from '../resEvaluationSaleCompAdj/resEvaluationSalesCompAdj.store';
import { ISalesCompsAdjustments } from '../resEvaluationSaleCompAdj/IResEvaluationSalesCompAdj';
import ResEvaluationSalesCompQualitativeAdjStore from '../resEvaluationSaleCompsQualitativeAdj/resEvaluationSaleCompQualitativeAdj.store';
import { ISalesCompAmenities } from '../resEvaluationSaleApproachCompAmenities/IResEvaluationSaleCompAmenitiesService';
import ResEvalSaleCompAmenitiesStorage from '../resEvaluationSaleApproachCompAmenities/resEvaluationSaleCompAmenities.store';
import { ISaveReviewDetails } from '../evaluations/IEvaluationsService';
import * as reportHelpers from '../../utils/common/reportHelpers';
import * as cheerio from 'cheerio';
import { GOOGLE_MAPS_API_KEY, BACKEND_PROXY_URL_FOR_IMAGE } from '../../env';
import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import UserStore from '../user/user.store';
import { IResIncomeSource } from '../resEvaluationIncomeSource/IResEvaluationIncomeSourceService';
import ZoningStore from '../resZoning/resZoning.store';
import IResZoning from '../../utils/interfaces/IResZoning';
import { IResOperatingExpense } from '../resEvaluationOperatingExpenses/IResEvaluationOperatingExpenseService';
import CommonStore from '../common/common.store';
import { MergeFieldEnum } from '../../utils/enums/MergeFieldsEnum';
import CompsEnum from '../../utils/enums/CompsEnum';
import { GlobalCodeEnums } from '../../utils/enums/AppraisalsEnum';
import MergeFieldStore from '../mergeFields/mergeField.store';
import { v4 as uuidv4 } from 'uuid';
import { changeDateFormat } from '../../utils/common/Time';
import { Op } from 'sequelize';

const helperFunction = new HelperFunction();
const uploadFunction = new UploadFunction();
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
export default class ResEvaluationsService {
	private resEvaluationStorage = new ResEvaluationsStore();
	private zoningStore = new ZoningStore();
	private userStore = new UserStore();
	private clientStore = new ClientStore();
	private evaluationMetaDataStore = new EvaluationMetaDataStore();
	private resEvaluationScenarioStore = new ResEvaluationScenarioStore();
	private evaluationPhotoPagesStore = new EvaluationPhotoPagesStorage();
	private evaluationFilesStorage = new ResEvaluationFilesStore();
	private resEvaluationIncomeStore = new ResEvaluationIncomeStore();
	private resEvaluationIncomeSourcesStore = new ResEvaluationIncomeSourcesStore();
	private resEvalOperatingExpensesStorage = new ResEvalOperatingExpensesStorage();
	private resEvaluationOtherIncomeStore = new ResEvaluationOtherIncomeStore();
	private resEvaluationCostApproachStore = new ResEvaluationCostApproachStore();
	private resEvaluationCostSubAdjStore = new ResEvaluationCostSubAdjStorage();
	private resEvaluationCostCompsStorage = new ResEvaluationCostCompsStorage();
	private resEvaluationCostCompAdjStore = new ResEvaluationCostCompAdjStorage();
	private resEvaluationCostImprovementStore = new ResEvaluationCostImprovementStorage();
	private resEvaluationCostComparativeStore = new ResEvaluationCostComparativeStore();
	private resCompsStore = new ResCompsStore();
	private resEvaluationSaleApproachStore = new ResEvaluationSalesStore();
	private resEvaluationSaleComparisonStore = new ResEvaluationSaleComparisonStore();
	private resEvaluationSaleSubAdjStore = new ResEvaluationSalesSubAdjStorage();
	private resEvaluationSaleSubQualitativeAdjStore = new ResEvaluationSaleSubQualitativeAdjStore();
	private resEvaluationSalesCompsStore = new ResEvaluationSalesCompsStorage();
	private resEvaluationSalesCompAdjStore = new ResEvaluationSalesCompAdjStorage();
	private resEvaluationSaleQualitativeCompAdjStore =
		new ResEvaluationSalesCompQualitativeAdjStore();
	private resEvalSaleCompAmenitiesStore = new ResEvalSaleCompAmenitiesStorage();
	private commonStore = new CommonStore();
	private mergeFieldStore = new MergeFieldStore();

	constructor() {}

	/**
	 * @description Function to create and update scenario of evaluations .
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveSetup = async (
		request: IEvaluationScenarioRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			let createdEvaluation: IEvaluation;
			const role = request?.user?.role;
			const editEvaluationId = parseInt(request?.params?.id);

			// If role is data entry then do not have permission.
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate schema
			const params = await helperFunction.validate(evaluationSaveScenarioSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { res_evaluation_scenarios, ...evaluationData } = request.body;
			const { client_id } = evaluationData;
			if (client_id) {
				const validateClient = await this.clientStore.findByAttribute({ id: client_id });
				if (!validateClient) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: ClientEnum.NOT_FOUND,
						error: ErrorMessageEnum.INVALID_REQUEST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			//Updating evaluation
			if (editEvaluationId) {
				const requestedEvaluation = await this.resEvaluationStorage.findByAttribute({
					id: editEvaluationId,
				});
				//Validating requested evaluation id.
				if (!requestedEvaluation) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.EVALUATION_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				const updateEvaluation = await this.resEvaluationStorage.updateEvaluation(
					evaluationData,
					editEvaluationId,
				);
				if (!updateEvaluation) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.EVALUATION_UPDATE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			} else {
				//Create evaluation
				evaluationData.user_id = request?.user?.id;
				evaluationData.account_id = request?.user?.account_id;
				// evaluationData.comp_adjustment_mode =
				// 	request?.user?.comp_adjustment_mode ?? DefaultEnum.PERCENT;

				const findUserDetails = await this.userStore.get(request?.user?.id);

				if (findUserDetails) {
					evaluationData.comp_adjustment_mode = findUserDetails.comp_adjustment_mode;
				}
				const evaluationAttributes: IEvaluationScenarioRequest = {
					...evaluationData,
				};
				createdEvaluation = await this.resEvaluationStorage.createEvaluation(evaluationAttributes);
				if (!createdEvaluation) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.EVALUATION_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}

			let evaluationOldData = null;
			// If editing an evaluation, fetch the old data
			if (editEvaluationId)
				evaluationOldData = await this.resEvaluationStorage.getResEvaluation({
					id: editEvaluationId,
				});
			//scenarios add, update.
			const keepId = [];
			if (res_evaluation_scenarios) {
				for (const scenario of res_evaluation_scenarios) {
					let scenarioId = scenario?.id;
					let weightChangeFlag = false;
					if (scenario?.id) {
						const findScenario = await this.resEvaluationScenarioStore.findScenario({
							id: scenarioId,
						});
						if (!findScenario) {
							data = {
								statusCode: StatusCodeEnum.BAD_REQUEST,
								message: EvalMessageEnum.SCENARIO_NOT_FOUND,
							};
							return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
						}
						// Compare old and new approach flags
						const oldApproaches = [
							findScenario.has_income_approach,
							findScenario.has_sales_approach,
							findScenario.has_cost_approach,
						];
						const newApproaches = [
							scenario.has_income_approach,
							scenario.has_sales_approach,
							scenario.has_cost_approach,
						];

						// If approaches have changed, update weights
						if (oldApproaches.join(',') !== newApproaches.join(',')) {
							weightChangeFlag = true;
							const approaches = [
								{
									key: EvaluationsEnum.HAS_INCOME_APPROACH,
									table: this.resEvaluationIncomeStore,
									weightKey: EvaluationsEnum.INCOME,
								},
								{
									key: EvaluationsEnum.HAS_SALE_APPROACH,
									table: this.resEvaluationSaleApproachStore,
									weightKey: EvaluationsEnum.SALE,
								},
								{
									key: EvaluationsEnum.HAS_COST_APPROACH,
									table: this.resEvaluationCostApproachStore,
									weightKey: EvaluationsEnum.COST,
								},
							];
							const enabled = approaches.filter((a) => scenario[a.key]);
							const count = enabled.length;
							const weights =
								count === 3
									? { income: 0.25, sale: 0.5, cost: 0.25 }
									: count === 2
										? { income: 0.5, sale: 0.5, cost: 0.5 }
										: { income: 1, sale: 1, cost: 1 };

							for (const approach of enabled) {
								const exists = await approach.table.findByAttribute({
									res_evaluation_scenario_id: scenarioId,
								});
								const eval_weight = weights[approach.weightKey];

								if (!exists) {
									const eval_weight = weights[approach.weightKey];
									const savedData = await approach.table.addWeight({
										res_evaluation_id: evaluationOldData.id,
										res_evaluation_scenario_id: scenarioId,
										eval_weight,
									});
									if (evaluationOldData) {
										const data = {
											id: savedData.id,
											evaluationId: evaluationOldData.id,
											evaluationScenarioId: scenarioId,
											evalWeight: eval_weight,
										};
										// If weight change flag is true, update the scenario weight
										await this.updateWeightChangeCalcualtions(
											data,
											evaluationOldData,
											approach.weightKey,
										);
									}
								} else if (exists && exists.eval_weight !== eval_weight) {
									await approach.table.updateWeight({
										id: exists.id,
										eval_weight,
									});

									if (weightChangeFlag && evaluationOldData) {
										const data = {
											id: exists.id,
											evaluationId: evaluationOldData.id,
											evaluationScenarioId: scenarioId,
											evalWeight: eval_weight,
										};
										// If weight change flag is true, update the scenario weight
										await this.updateWeightChangeCalcualtions(
											data,
											evaluationOldData,
											approach.weightKey,
										);
									}
								}
							}
						}

						//Removing approaches data if not selected on setup screen
						const approachChecks = [
							{ key: 'has_income_approach', store: this.resEvaluationIncomeStore },
							{ key: 'has_sales_approach', store: this.resEvaluationSaleApproachStore },
							{ key: 'has_cost_approach', store: this.resEvaluationCostApproachStore },
						];

						for (const { key, store } of approachChecks) {
							if (!scenario?.[key]) {
								const record = await store.findOne({ res_evaluation_scenario_id: scenarioId });
								if (record) {
									await store.remove({ id: record.id });
								}
							}
						}
						//updating info in scenario
						await this.resEvaluationScenarioStore.updateScenario(scenario.id, scenario);
						keepId.push(scenario.id);
					} else {
						//creating new scenarios
						if (!createdEvaluation) {
							scenario.res_evaluation_id = editEvaluationId;
						} else {
							scenario.res_evaluation_id = createdEvaluation.id;
						}
						const saveScenario = await this.resEvaluationScenarioStore.createScenario(scenario);
						scenarioId = saveScenario.id;
						keepId.push(saveScenario.id);

						const approaches = [
							{
								key: EvaluationsEnum.HAS_INCOME_APPROACH,
								table: this.resEvaluationIncomeStore,
								weightKey: EvaluationsEnum.INCOME,
							},
							{
								key: EvaluationsEnum.HAS_SALE_APPROACH,
								table: this.resEvaluationSaleApproachStore,
								weightKey: EvaluationsEnum.SALE,
							},
							{
								key: EvaluationsEnum.HAS_COST_APPROACH,
								table: this.resEvaluationCostApproachStore,
								weightKey: EvaluationsEnum.COST,
							},
						];

						// Find which approaches are enabled
						const enabled = approaches.filter((a) => scenario[a.key]);
						const count = enabled.length;
						const weights =
							count === 3
								? { income: 0.25, sale: 0.5, cost: 0.25 }
								: count === 2
									? { income: 0.5, sale: 0.5, cost: 0.5 }
									: { income: 1, sale: 1, cost: 1 };

						for (const approach of enabled) {
							const exists = await approach.table.findByAttribute({
								res_evaluation_scenario_id: scenarioId,
							});
							if (!exists) {
								const eval_weight = weights[approach.weightKey];
								const savedData = await approach.table.addWeight({
									res_evaluation_id: scenario.res_evaluation_id,
									res_evaluation_scenario_id: scenarioId,
									eval_weight,
								});
								if (evaluationOldData) {
									const data = {
										id: savedData.id,
										evaluationId: evaluationOldData.id,
										evaluationScenarioId: scenarioId,
										evalWeight: eval_weight,
									};
									// If weight change flag is true, update the scenario weight
									await this.updateWeightChangeCalcualtions(
										data,
										evaluationOldData,
										approach.weightKey,
									);
								}
							}
						}
					}
				}

				// Removing scenario
				await this.resEvaluationScenarioStore.removeScenarios(keepId, editEvaluationId);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_SAVE_SUCCESS,
				data: createdEvaluation,
				position: ScreenEnums.SETUP_PAGE,
				next: ScreenEnums.OVERVIEW_PAGE,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get evaluation by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getEvaluation = async (
		request: IGetEvaluationRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			const { role, account_id, id } = request.user;

			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const evaluationId = parseInt(request?.params?.id);
			if (!evaluationId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.INVALID_EVALUATION_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attribute = { id: evaluationId, account_id: account_id, user_id: id };
			if (role === RoleEnum.ADMINISTRATOR) {
				delete attribute?.user_id;
			} else if (role === RoleEnum.USER) {
				delete attribute?.account_id;
			} else if (role === RoleEnum.SUPER_ADMINISTRATOR) {
				delete attribute?.user_id;
				delete attribute?.account_id;
			}
			const { user_id, ...restAttributes } = attribute;
			let attributesWithOr;
			if (role === RoleEnum.USER) {
				attributesWithOr = {
					...restAttributes,
					[Op.or]: [
						{ user_id: id },
						{ reviewed_by: id },
					],
				};
			} else {
				attributesWithOr = { ...restAttributes };
			}
			//finding by evaluation id
			const evaluationInfo = await this.resEvaluationStorage.getResEvaluation(attributesWithOr);
			if (!evaluationInfo) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_DATA,
				data: evaluationInfo,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description function to update evaluation overview.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateOverview = async (
		request: IEvaluationsUpdateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			// Validate schema
			const params = await helperFunction.validate(evaluationCombinedSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const evaluationId = parseInt(request.params.id);
			// Find the Evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const { role, account_id, id } = request.user;
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const evaluationData = request.body;

			const dateFields = [
				'close_date',
				'last_transferred_date',
				'date_sold',
				'date_of_analysis',
				'report_date',
				'effective_date',
			];
			for (const field of dateFields) {
				if (evaluationData[field]) {
					evaluationData[field] = changeDateFormat(evaluationData[field]);
				}
			}

			// Handle custom fields
			helperFunction.handleCustomField(ResEvaluationsEnum.MOST_LIKELY_OWNER_USER, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.TOPOGRAPHY, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.LOT_SHAPE, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.FRONTAGE, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.UTILITIES_SELECT, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.CONDITION, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.PROPERTY_CLASS, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.MAIN_STRUCTURE_BASE, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.FOUNDATION, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.PARKING, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.BASEMENT, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.ADA_COMPLIANCE, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.EXTERIOR, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.ROOF, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.ELECTRICAL, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.PLUMBING, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.HEATING_COOLING, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.WINDOWS, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.PROPERTY_RIGHTS, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.BATHROOMS, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.BEDROOMS, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.GARAGE, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.FENCING, evaluationData);
			helperFunction.handleCustomField(ResEvaluationsEnum.FIREPLACE, evaluationData);

			evaluationData.id = evaluationId;
			const attributes: IEvaluationsUpdateRequest = {
				...evaluationData,
			};
			const evaluation = await this.resEvaluationStorage.updateOverview(attributes);
			await this.updateApproaches(attributes);
			if (!evaluation) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EVALUATION_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_SAVE_SUCCESS,
				position: ScreenEnums.OVERVIEW_PAGE,
				previous: ScreenEnums.SETUP_PAGE,
				next: ScreenEnums.IMAGES_PAGE,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to update map boundaries.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateMapBoundary = async (
		request: IMapBoundary,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			// Validate the request schema
			const params = await helperFunction.validate(mapBoundarySchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attributes = params.value;

			const { map_image_url, map_image_for_report_url, ...restAttributes } = attributes;

			const uploads = [
				{
					url: map_image_url,
					existingKey: findEvaluation?.map_image_url,
					field: 'map_image_url',
					fileName: `res_evaluations/${evaluationId}/map_image_url-${uuidv4()}.png`,
				},
				{
					url: map_image_for_report_url,
					existingKey: findEvaluation?.map_image_for_report_url,
					field: 'map_image_for_report_url',
					fileName: `res_evaluations/${evaluationId}/map_image_for_report_url-${uuidv4()}.png`,
				},
			];

			for (const { url, existingKey, fileName, field } of uploads) {
				const uploadedUrl = await uploadFunction.uploadMapBoundary(url, existingKey, fileName);
				restAttributes[field] = uploadedUrl;
			}

			//Attempt to update the evaluation
			const mapBoundary = await this.resEvaluationStorage.updateEvaluation(
				restAttributes,
				evaluationId,
			);
			if (!mapBoundary) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.MAP_BOUNDARY_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.MAP_BOUNDARY_SAVE_SUCCESS,
				position: ScreenEnums.MAP_BOUNDARY,
				previous: ScreenEnums.IMAGES_PAGE,
				next: ScreenEnums.AERIAL_MAP_PAGE,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to update aerial map.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateAerialMap = async (request: IAerialMap, response: Response): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			// Validate the request schema
			const params = await helperFunction.validate(aerialMapSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the Evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attributes = params.value;
			//Attempt to update the Evaluation
			const aerialMap = await this.resEvaluationStorage.updateEvaluation(attributes, evaluationId);
			if (!aerialMap) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EVALUATION_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_SAVE_SUCCESS,
				position: ScreenEnums.AERIAL_MAP_PAGE,
				previous: ScreenEnums.MAP_BOUNDARY,
				next: ScreenEnums.AREA_INFO,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to update area info for evaluation.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateAreaInfo = async (request: IAreaInfo, response: Response): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			// Validate the request schema
			const params = await helperFunction.validate(evalAreaInfoSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attributes = params.value;
			//Attempt to update the evaluation
			const areaInfo = await this.evaluationMetaDataStore.saveAreaInfo(
				attributes,
				evaluationId,
				ResEvaluationsEnum.EVALUATION_ID,
			);
			if (!areaInfo) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EVALUATION_UPDATE_FAIL,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_SAVE_SUCCESS,
				previous: ScreenEnums.AERIAL_MAP_PAGE,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get area info of evaluation by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAreaInfo = async (
		request: IGetAreaInfoRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IGetAllAreaInfo>;
		try {
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;
			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			//Attempt to get area info of evaluation
			const areaInfo = await this.evaluationMetaDataStore.getAreaInfo({
				res_evaluation_id: evaluationId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.AREA_INFO_DATA,
				data: { areaInfo },
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to upload photo pages.
	 * @param request
	 * @param response
	 * @returns
	 */
	public savePhotoPages = async (
		request: IEvaluationPhotoPages,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvalPhotoPagesSuccess<IEvalPhotoPage[]>;
		try {
			// Validate schema
			const params = await helperFunction.validate(saveEvalPhotoPagesSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { photos_taken_by, photo_date, photos } = request.body;
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const evaluationAttributes = {
				photos_taken_by,
				photo_date,
			};
			await this.resEvaluationStorage.updateEvaluation(evaluationAttributes, evaluationId);
			const dbPhotos = await this.evaluationPhotoPagesStore.findAll({
				res_evaluation_id: evaluationId,
			});
			const savedPhotos = [];
			for (let index = 0; index < photos.length; index++) {
				const element = photos[index];
				element.res_evaluation_id = evaluationId;

				if (!element?.id) {
					// Create new photo record if id is null or missing
					const newPhoto = await this.evaluationPhotoPagesStore.create(element);
					savedPhotos.push(newPhoto);
				} else {
					// Update existing photo if id exists
					const updatedPhoto = await this.evaluationPhotoPagesStore.update(element);
					savedPhotos.push(updatedPhoto);
				}
			}

			// Delete photos in the database that are not in the photos array
			const photoIdsToKeep = photos.map((photo) => photo?.id).filter((id) => id); // Get IDs of photos to keep

			for (const dbPhoto of dbPhotos) {
				if (!photoIdsToKeep.includes(dbPhoto.id)) {
					// Delete photo from DB if not in the updated photos list
					await this.evaluationPhotoPagesStore.delete({ id: dbPhoto?.id });
					// Deleting photos from S3 bucket
					const filePath = dbPhoto?.image_url;
					const fileUrl = await helperFunction.removeSubstring(S3_BASE_URL, filePath);
					uploadFunction.removeFromServer(fileUrl);
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: PhotoPagesEnum.PHOTOS_SAVED_SUCCESSFULLY,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get all photo pages by evaluation id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAllPhotoPages = async (
		request: IEvalPhotoPageRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvalPhotoPagesSuccess<IEvaluationPhotoPages>;
		try {
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const dbPhotos = await this.evaluationPhotoPagesStore.findOne({
				id: evaluationId,
			});

			data = {
				statusCode: StatusCodeEnum.OK,
				message: PhotoPagesEnum.PHOTO_PAGES,
				data: dbPhotos,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description function to upload file to s3 bucket
	 * @param request
	 * @param response
	 * @returns
	 */
	public uploadImage = async (
		request: IUploadImageRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUploadSuccess<IUploadURLSuccessData>;
		try {
			// Validate schema
			const params = await helperFunction.validate(uploadImageSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { field, type, imageId } = request.body;
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const metaAttr = {
				evaluation_id: evaluationId,
				name: field,
			};
			//Check images is saved in metadata table
			const imageMetadata = await this.evaluationMetaDataStore.findDataByAttribute(metaAttr);
			const fileMetaData: IResEvaluationMetaData = metaAttr;
			const attribute: Partial<IEvaluationFilesData> = {
				title: field,
				origin: FileOriginEnum.EVALUATION_IMAGES,
				res_evaluation_id: evaluationId,
			};
			if (imageId) {
				attribute.id = imageId;
			}
			const file = await this.evaluationFilesStorage.findFilesByAttribute(attribute);
			if ((file && file?.title !== UploadEnum.EXTRA_IMAGE) || imageId) {
				if (uploadFunction.removeFromServer(file?.dir)) {
					if (file?.title !== UploadEnum.EXTRA_IMAGE) {
						this.evaluationFilesStorage.removeFilesById(file?.id);
					}
				}
				fileMetaData.value = null;
			}
			const metadata = await sharp(request.file.path).metadata();
			const { width, height } = metadata;
			const url = await uploadFunction.addFile({ file: request.file, id: evaluationId, type });
			if (!url) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: FileEnum.FILE_UPLOAD_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const description = await uploadFunction.getImageTypes(field);
			const titleDescription = description[field].title;
			const { mimetype, size, originalname } = request.file;
			const fileName = originalname.replace(/\s/g, '');
			const origin = FileOriginEnum.EVALUATION_IMAGES;
			const storage = FileStorageEnum.SERVER;
			const fileAttributes: Partial<IEvaluationFilesData> = {
				type: mimetype,
				size,
				dir: url,
				filename: fileName,
				res_evaluation_id: evaluationId,
				height,
				width,
				title: field,
				description: titleDescription,
				origin,
				storage,
			};
			let fileData;
			if (imageId) {
				fileAttributes.id = imageId;
				fileData = await this.evaluationFilesStorage.update(fileAttributes);
			} else {
				fileData = await this.evaluationFilesStorage.create(fileAttributes);
			}
			if (!fileData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: FileEnum.FILE_UPLOAD_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			fileMetaData.value = fileData.dir;
			if (imageMetadata && imageMetadata.id) {
				await this.evaluationMetaDataStore.update(imageMetadata.id, fileMetaData);
			} else {
				if (file && file.title != UploadEnum.EXTRA_IMAGE) {
					await this.evaluationMetaDataStore.create(fileMetaData);
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: FileEnum.FILE_UPLOAD_SUCCESS,
				data: { id: fileData.id, url: S3_BASE_URL + url },
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to remove image
	 * @param request
	 * @param response
	 * @returns
	 */
	public removeImage = async (
		request: IRemoveImageRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const imageId = Number(request?.query?.image_id);
			const evaluationId = Number(request?.query?.res_evaluation_id);
			const field = String(request?.query?.field);
			if (!imageId || !evaluationId || !field) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attribute = {
				id: imageId,
				title: field,
				origin: FileOriginEnum.EVALUATION_IMAGES,
				res_evaluation_id: evaluationId,
			};
			const file = await this.evaluationFilesStorage.findFilesByAttribute(attribute);
			if (!file) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_IMAGES_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			if (uploadFunction.removeFromServer(file.dir)) {
				this.evaluationFilesStorage.removeFilesById(file.id);
			}
			const metaAttr = {
				evaluation_id: evaluationId,
				name: field,
			};
			//Check images is saved in metadata table
			const imageMetadata = await this.evaluationMetaDataStore.findDataByAttribute(metaAttr);
			if (imageMetadata && imageMetadata.id) {
				this.evaluationMetaDataStore.removeById(imageMetadata.id);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: FileEnum.FILE_DELETE_SUCCESS,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get evaluations files
	 * @param request
	 * @param response
	 */
	public getEvaluationFiles = async (
		request: IGetEvaluationRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluationFiles[]>;
		try {
			const { role } = request.user;
			const evaluationId = parseInt(request?.params?.id);
			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const origin = request?.query?.origin as string;
			const findEvaluationFile = await this.evaluationFilesStorage.findFiles({
				res_evaluation_id: evaluationId,
				origin: origin,
			});
			if (!findEvaluationFile.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.EVALUATION_IMAGES_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_DATA,
				data: findEvaluationFile,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get list of evaluation.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getList = async (
		request: IEvaluationListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluationListSuccess>;
		try {
			const { role, id, account_id } = request.user;
			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			//validate schema
			const params = await helperFunction.validate(evaluationListSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attributes = params.value;
			//role permissions
			if (role === RoleEnum.ADMINISTRATOR) {
				attributes.accountId = account_id;
			}
			if (role === RoleEnum.USER) {
				attributes.userId = id;
			}

			//fetching evaluation list
			const evaluationList = await this.resEvaluationStorage.getEvaluationList(attributes);
			if (!evaluationList.evaluations.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.EVALUATION_LIST_DATA_NOT_FOUND,
					data: evaluationList,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: evaluationList,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to delete evaluation by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public delete = async (request: IEvaluationRequest, response: Response): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const evaluationId = parseInt(request.params.id);
			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const { role, account_id, id } = request.user;
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Deleting evaluation
			const deletedEvaluation = await this.resEvaluationStorage.delete({
				id: evaluationId,
			});
			if (!deletedEvaluation) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EVALUATION_DELETE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_DELETED,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to save income approach screen data
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveIncomeApproach = async (
		request: IResEvaluationIncomeSaveRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IResEvaluationIncomeApproach>;
		try {
			// Validate the request body
			const params = await helperFunction.validate(resEvalIncomeApproachSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { res_evaluation_id, res_evaluation_scenario_id } = request.body;

			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({
				id: res_evaluation_id,
			});
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.resEvaluationScenarioStore.findScenario({
				id: res_evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (!findScenarioApproaches.has_income_approach) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Checking permissions
			const { role, account_id, id } = request.user;
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const { weighted_market_value, ...attributes } = request.body;
			if (weighted_market_value) {
				// Updating weighted_market_value in evaluation table.
				await this.resEvaluationScenarioStore.updateScenario(res_evaluation_scenario_id, {
					weighted_market_value,
				});
			}
			// Checking duplicate record of income approach by evaluation_scenario_id.
			const incomeApproachData = await this.resEvaluationIncomeStore.findOne({
				res_evaluation_scenario_id: attributes.res_evaluation_scenario_id,
			});

			// If request id is null then create new record of evaluation income approach
			if (!attributes.id) {
				if (incomeApproachData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				const saveIncomeData = await this.resEvaluationIncomeStore.createIncomeApproach(attributes);
				if (!saveIncomeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.INCOME_APPROACH_SAVE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.INCOME_APPROACH_SAVED_SUCCESS,
					data: saveIncomeData,
				};
			} else {
				if (!incomeApproachData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.INCOME_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const { incomeSources, operatingExpenses, otherIncomeSources, ...incomeAttributes } =
					params.value;
				let updateIncomeData: boolean;
				if (Object.keys(incomeAttributes).length > 0) {
					updateIncomeData =
						await this.resEvaluationIncomeStore.updateIncomeApproach(incomeAttributes);
				}
				if (!updateIncomeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.INCOME_APPROACH_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				let keepIds: number[] = [];
				// Handle income sources
				// Evaluation income source add, update, delete.
				if (incomeSources) {
					keepIds = await this.handleIncomeSourcesOrOperatingExpenses({
						incomeSources,
						evaluationIncomeApproachId: incomeApproachData.id,
					});
				}
				if (otherIncomeSources) {
					keepIds = await this.handleIncomeSourcesOrOperatingExpenses({
						otherIncomeSources,
						evaluationIncomeApproachId: incomeApproachData.id,
					});
				}
				if (operatingExpenses) {
					keepIds = await this.handleIncomeSourcesOrOperatingExpenses({
						operatingExpenses,
						evaluationIncomeApproachId: incomeApproachData.id,
					});
				}
				if (!keepIds) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.INCOME_APPROACH_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.INCOME_APPROACH_SAVED_SUCCESS,
				};
			}
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to handle income source and operating expenses, add, update, delete.
	 * @param attributes
	 * @returns
	 */
	public async handleIncomeSourcesOrOperatingExpenses(
		attributes: Partial<handleIncomeSourceOrOpExp>,
	): Promise<number[]> {
		try {
			const { incomeSources, operatingExpenses, otherIncomeSources, evaluationIncomeApproachId } =
				attributes;
			const itemList = incomeSources || operatingExpenses || otherIncomeSources;
			let store;
			if (incomeSources) {
				store = this.resEvaluationIncomeSourcesStore;
			} else if (operatingExpenses) {
				store = this.resEvalOperatingExpensesStorage;
			} else if (otherIncomeSources) {
				store = this.resEvaluationOtherIncomeStore;
			}
			const idKey = ResEvaluationsEnum.RES_EVALUATION_INCOME_APPROACH_ID;

			const keepIds: number[] = [];
			for (const item of itemList) {
				if (item.id) {
					const foundItem = await store.find(item.id);
					if (foundItem) {
						await store.update(item.id, item);
						keepIds.push(item.id);
					}
				} else {
					item[idKey] = evaluationIncomeApproachId;
					const createdItem = await store.create(item);
					keepIds.push(createdItem.id);
				}
			}

			await store.remove(keepIds, evaluationIncomeApproachId);
			return keepIds;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to get residential evaluation income approach id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getIncomeApproach = async (
		request: IEvalIncomeApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IResEvaluationIncomeApproach>;
		try {
			const { role, account_id, id } = request.user;
			const evaluationId = Number(request?.query?.evaluationId);
			const evaluationScenarioId = Number(request?.query?.evaluationScenarioId);

			//validating query params evaluationId
			if (!evaluationId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//validating  query params evaluationScenarioId
			if (!evaluationScenarioId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_SCENARIO_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			//Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			//get evaluation income approach
			const incomeApproachData = await this.resEvaluationIncomeStore.findByAttribute({
				res_evaluation_scenario_id: evaluationScenarioId,
				res_evaluation_id: evaluationId,
			});

			// If requested income approach not found
			if (!incomeApproachData) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.INCOME_APPROACH_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.INCOME_APPROACH_DATA,
				data: incomeApproachData,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to save cost approach land.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveCostApproachLand = async (
		request: ISaveCostApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ICostApproach>;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate request body
			const params = await helperFunction.validate(evalCostApproachSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { cost_approach, res_evaluation_id, ...attributes } = request.body;
			const { id, res_evaluation_scenario_id } = cost_approach;
			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({
				id: res_evaluation_id,
			});
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.resEvaluationScenarioStore.findScenario({
				id: cost_approach.res_evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (findScenarioApproaches.has_cost_approach === 0) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			if (attributes) {
				// Updating weighted_market_value and position in evaluation table.
				await this.resEvaluationStorage.updateEvaluation(attributes, res_evaluation_id);
			}
			// Checking duplicate record of cost approach by evaluation approach id.
			const findCostData = await this.resEvaluationCostApproachStore.findByAttribute({
				res_evaluation_scenario_id,
			});
			// Creating new records for cost approach
			if (!id) {
				if (findCostData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving cost approach data in evaluation cost approaches table
				cost_approach.res_evaluation_id = res_evaluation_id;
				const saveCostApproach =
					await this.resEvaluationCostApproachStore.createCostApproach(cost_approach);
				if (!saveCostApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.COST_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.COST_APPROACH_SAVED_SUCCESS,
					data: saveCostApproach,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			} else {
				if (!findCostData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.COST_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const { cost_subject_property_adjustments, comps, comparison_attributes, ...rest } =
					cost_approach;
				rest.total_cost_valuation = findCostData.total_depreciated_cost
					? findCostData.total_depreciated_cost + rest.land_value
					: 0;
				rest.indicated_value_psf = rest.land_value
					? rest.total_cost_valuation / rest.land_value
					: 0;
				// rest.indicated_value_punit = findEvaluation.total_units
				// 	? rest.total_cost_valuation / findEvaluation.total_units
				// 	: 0;
				// rest.indicated_value_pbed = findEvaluation.total_beds
				// 	? rest.total_cost_valuation / findEvaluation.total_beds
				// 	: 0;
				let updateCostData: boolean;
				if (Object.keys(rest).length > 0) {
					updateCostData = await this.resEvaluationCostApproachStore.updateCostApproach(rest);
				}
				if (!updateCostData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.COST_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				// Handle comparison_attributes
				if (comparison_attributes) {
					const updatedCompareAttributes = comparison_attributes.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
					const updateComparisonItems = await this.syncCostComparisonItems(
						cost_approach.id,
						updatedCompareAttributes,
					);
					if (!updateComparisonItems) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.COMPARISON_ATTRIBUTE_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Handle cost_subject_property_adjustments
				if (cost_subject_property_adjustments) {
					const updatedSubjectPropertyAdjustments = cost_subject_property_adjustments.map(
						(item, index) => ({
							...item,
							order: index + 1, // Start order from 1 and increment by 1
						}),
					);
					const updateEvaluationCostSubAdj = await this.syncCostSubjectAdjustments(
						cost_approach?.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateEvaluationCostSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.COST_APPROACH_SUB_ADJ_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				if (comps) {
					const updateCostComps = await this.synchronizeCostComps(cost_approach.id, comps);
					if (!updateCostComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.COST_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.COST_APPROACH_SAVED_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to save cost approach land.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveCostApproach = async (
		request: ISaveCostApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ICostApproach>;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate request body
			const params = await helperFunction.validate(evalCostApproachSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { cost_approach, res_evaluation_id, ...attributes } = request.body;
			const { id, res_evaluation_scenario_id } = cost_approach;
			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({
				id: res_evaluation_id,
			});
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.resEvaluationScenarioStore.findScenario({
				id: cost_approach.res_evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			if (attributes) {
				// Updating weighted_market_value and position in evaluation table.
				await this.resEvaluationScenarioStore.updateScenario(
					cost_approach?.res_evaluation_scenario_id,
					attributes,
				);
			}
			// Checking duplicate record of cost approach by evaluation approach id.
			const findCostData = await this.resEvaluationCostApproachStore.findByAttribute({
				res_evaluation_scenario_id,
			});
			// Creating new records for cost approach
			if (!id) {
				if (findCostData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving cost approach data in evaluation cost approaches table
				cost_approach.res_evaluation_id = res_evaluation_id;
				const saveCostApproach =
					await this.resEvaluationCostApproachStore.createCostApproach(cost_approach);
				if (!saveCostApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.COST_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.COST_APPROACH_SAVED_SUCCESS,
					data: saveCostApproach,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			} else {
				if (!findCostData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.COST_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const { cost_subject_property_adjustments, comp_data, comparison_attributes, ...rest } =
					cost_approach;
				// rest.total_cost_valuation = findCostData.total_depreciated_cost
				// 	? findCostData.total_depreciated_cost + rest.land_value
				// 	: 0;
				// rest.indicated_value_psf = rest.land_value
				// 	? rest.total_cost_valuation / rest.land_value
				// 	: 0;
				// rest.indicated_value_punit = findEvaluation.total_units
				// 	? rest.total_cost_valuation / findEvaluation.total_units
				// 	: 0;
				// rest.indicated_value_pbed = findEvaluation.total_beds
				// 	? rest.total_cost_valuation / findEvaluation.total_beds
				// 	: 0;
				let updateCostData: boolean;
				if (Object.keys(rest).length > 0) {
					updateCostData = await this.resEvaluationCostApproachStore.updateCostApproach(rest);
				}
				if (!updateCostData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.COST_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				// Handle comparison_attributes
				if (comparison_attributes) {
					const updatedCompareAttributes = comparison_attributes.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
					const updateComparisonItems = await this.syncCostComparisonItems(
						cost_approach.id,
						updatedCompareAttributes,
					);
					if (!updateComparisonItems) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.COMPARISON_ATTRIBUTE_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Handle cost_subject_property_adjustments
				if (cost_subject_property_adjustments) {
					const updatedSubjectPropertyAdjustments = cost_subject_property_adjustments.map(
						(item, index) => ({
							...item,
							order: index + 1, // Start order from 1 and increment by 1
						}),
					);
					const updateEvaluationCostSubAdj = await this.syncCostSubjectAdjustments(
						cost_approach?.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateEvaluationCostSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.COST_APPROACH_SUB_ADJ_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				if (comp_data) {
					const updateCostComps = await this.synchronizeCostComps(cost_approach.id, comp_data);
					if (!updateCostComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.COST_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.COST_APPROACH_SAVED_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
	/**
	 * @description Synchronize subject adjustments of cost approach
	 * @param costApproachId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncCostSubjectAdjustments(
		costApproachId: number,
		newAdjustments: ICostSubPropertyAdj[],
	): Promise<boolean> {
		try {
			// Filter out adjustments with empty adj_key
			const validAdjustments = newAdjustments.filter(
				(adj) => adj?.adj_key && adj?.adj_key.trim() !== '',
			);

			// Fetch existing adjustments
			const existingAdjustments = await this.resEvaluationCostSubAdjStore.findAdjustments({
				res_evaluation_cost_approach_id: costApproachId,
			});
			// Create Sets for quick lookup of keys
			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newKeys = new Set(validAdjustments.map((adj) => adj.adj_key));

			// Determine keys to add and delete
			const keysToAdd = [...newKeys].filter((key) => !existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			const keysToUpdate = [...newKeys].filter((key) => existingKeys.has(key));

			// Prepare batches for database operations
			const adjustmentsToAdd = keysToAdd.map((key) => {
				const adjustment = validAdjustments.find((adj) => adj.adj_key === key);
				return {
					res_evaluation_cost_approach_id: costApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				res_evaluation_cost_approach_id: costApproachId,
				adj_key: key,
			}));
			// Find adjustments to update where the `order` is different
			const adjustmentsToUpdate = keysToUpdate
				.map((key) => {
					const newAdjustment = validAdjustments.find((adj) => adj.adj_key === key);
					const existingAdjustment = existingAdjustments.find((adj) => adj.adj_key === key);
					if (
						newAdjustment &&
						existingAdjustment &&
						newAdjustment.order !== existingAdjustment.order
					) {
						return {
							res_evaluation_cost_approach_id: costApproachId,
							adj_key: key,
							adj_value: newAdjustment.adj_value,
							order: newAdjustment.order, // Update the order if it differs
						};
					}
					return null;
				})
				.filter(Boolean); // Filter out null values

			// Execute batch operations
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.resEvaluationCostSubAdjStore.createAdjustments(adj)),
				...adjustmentsToDelete.map((adj) =>
					this.resEvaluationCostSubAdjStore.removeAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.resEvaluationCostSubAdjStore.updateAdjustments(adj),
				),
			]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Function to synchronize comps of cost approach
	 * @param costApproachId
	 * @param newComps
	 * @returns
	 */
	public async synchronizeCostComps(
		costApproachId: number,
		newComps: ICostComp[],
	): Promise<boolean> {
		try {
			// Fetch existing comps
			const existingComps = await this.resEvaluationCostCompsStorage.findCostComps({
				res_evaluation_cost_approach_id: costApproachId,
			});

			const existingCompIds = new Set(existingComps.map((comp) => comp.id));
			const newCompIds = new Set(
				newComps.filter((comp) => comp.id !== undefined).map((comp) => comp.id),
			);

			const compsToAdd = newComps.filter((comp) => comp.id === undefined);
			const compsToUpdate = newComps.filter((comp) => existingCompIds.has(comp.id));
			const compsToDelete = [...existingCompIds].filter((id) => !newCompIds.has(id));

			// Batch add new comps
			const addPromises = compsToAdd.map(async (comp) => {
				const createdComp = await this.resEvaluationCostCompsStorage.createCostComps({
					...comp,
					res_evaluation_cost_approach_id: costApproachId,
				});
				await this.syncCostCompAdjustments(createdComp.id, comp.comps_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.resEvaluationCostCompsStorage.updateCostComps(comp);
				await this.syncCostCompAdjustments(comp.id, comp.comps_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.resEvaluationCostCompAdjStore.removeAdjustments({
					res_eval_cost_approach_comp_id: id,
				});
				await this.resEvaluationCostCompsStorage.removeCostComps({ id });
			});

			// Execute all operations concurrently
			await Promise.all([...addPromises, ...updatePromises, ...deletePromises]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Synchronize adjustments for a single comp of cost approach
	 * @param compId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncCostCompAdjustments(compId: number, newAdjustments: ICostCompsAdjustment[]) {
		try {
			// Fetch existing comps adjustments
			const existingAdjustments = await this.resEvaluationCostCompAdjStore.findAdjustments({
				res_eval_cost_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				res_eval_cost_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				res_eval_cost_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				res_eval_cost_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.resEvaluationCostCompAdjStore.createAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) =>
					this.resEvaluationCostCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.resEvaluationCostCompAdjStore.removeAdjustments(adj),
				),
			]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Function to get cost approach data by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getCostApproach = async (
		request: GetCostApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ICostApproach>;
		try {
			const { role, account_id, id } = request.user;
			const evaluationId = Number(request?.query?.evaluationId);
			const evaluationScenarioId = Number(request?.query?.evaluationScenarioId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params evaluationId
			if (!evaluationId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating query params evaluation ApproachId
			if (!evaluationScenarioId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_SCENARIO_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Get evaluation cost approach
			const costApproachData = await this.resEvaluationCostApproachStore.findByAttribute({
				res_evaluation_scenario_id: evaluationScenarioId,
				res_evaluation_id: evaluationId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.COST_APPROACH_DATA,
				data: costApproachData,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to handle evaluation cost comparison attributes.
	 * @param capApproachId
	 * @param newComparisonItems
	 * @returns
	 */
	public async syncCostComparisonItems(
		costApproachId: number,
		newComparisonItems: ICostComparisonAttributes[],
	): Promise<boolean> {
		try {
			// Filter out items with empty comparison_key
			const validComparisonItems = newComparisonItems.filter(
				(item) => item?.comparison_key && item?.comparison_key.trim() !== '',
			);
			// Fetch existing comparison attributes
			const existingCostAttributes = await this.resEvaluationCostComparativeStore.findAll({
				res_evaluation_cost_approach_id: costApproachId,
			});

			// Create Sets for quick lookup of keys
			const existingKeys = new Set(existingCostAttributes.map((item) => item.comparison_key));
			const newKeys = new Set(validComparisonItems.map((item) => item.comparison_key));

			// Determine keys to add, delete, and update
			const keysToAdd = [...newKeys].filter((key) => !existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			const keysToUpdate = [...newKeys].filter((key) => existingKeys.has(key));

			// Prepare batches for database
			const attributesToAdd = keysToAdd.map((key) => {
				const attribute = validComparisonItems.find((item) => item.comparison_key === key);
				return {
					res_evaluation_cost_approach_id: costApproachId,
					comparison_key: attribute!.comparison_key,
					comparison_value: attribute!.comparison_value,
					order: attribute!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				res_evaluation_cost_approach_id: costApproachId,
				comparison_key: key,
			}));

			// Find adjustments to update where the `order` is different
			const attributesToUpdate = keysToUpdate
				.map((key) => {
					const newAttribute = validComparisonItems.find((item) => item.comparison_key === key);
					const existingAdjustment = existingCostAttributes.find(
						(item) => item.comparison_key === key,
					);
					if (
						newAttribute &&
						existingAdjustment &&
						newAttribute.order !== existingAdjustment.order
					) {
						return {
							res_evaluation_cost_approach_id: costApproachId,
							comparison_key: key,
							comparison_value: newAttribute.comparison_value,
							order: newAttribute.order, // Update the order if it differs
						};
					}
					return null;
				})
				.filter(Boolean); // Filter out null values

			// Execute batch operations
			await Promise.all([
				...attributesToAdd.map((item) => this.resEvaluationCostComparativeStore.create(item)),
				...attributesToDelete.map((item) => this.resEvaluationCostComparativeStore.delete(item)),
				...attributesToUpdate.map((item) => this.resEvaluationCostComparativeStore.update(item)),
			]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Function to save cost approach improvements.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveCostApproachImprovements = async (
		request: ISaveCostImprovements,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ISaveCostImprovements>;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate request body
			const params = await helperFunction.validate(saveCostImprovementSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const {
				res_evaluation_id,
				res_evaluation_scenario_id,
				cost_improvements,
				weighted_market_value,
				...attributes
			} = request.body;

			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({
				id: res_evaluation_id,
			});
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			if (attributes) {
				if (!attributes.id || attributes.id === undefined) {
					attributes.res_evaluation_scenario_id = res_evaluation_scenario_id;
					const findData = await this.resEvaluationCostApproachStore.findByAttribute({
						res_evaluation_scenario_id,
					});
					if (!findData) {
						const saveCostApproach =
							await this.resEvaluationCostApproachStore.createCostApproach(attributes);
						if (!saveCostApproach) {
							data = {
								statusCode: StatusCodeEnum.BAD_REQUEST,
								message: EvalMessageEnum.COST_APPROACH_SAVE_FAIL,
							};
							return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
						}
						attributes.id = saveCostApproach.id;
					} else {
						attributes.id = findData.id;
					}
				}

				if (weighted_market_value) {
					// Updating weighted_market_value
					await this.resEvaluationScenarioStore.updateScenario(res_evaluation_scenario_id, {
						weighted_market_value,
					});
				}
				// Updating improvements data in evaluation cost approaches table
				const findCostApproach = await this.resEvaluationCostApproachStore.findByAttribute({
					id: attributes.id,
				});
				if (!findCostApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.COST_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const updateCostApproach =
					await this.resEvaluationCostApproachStore.updateCostApproach(attributes);
				if (updateCostApproach === false) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.COST_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			if (cost_improvements) {
				const updateCostImprovements = await this.syncCostApproachImprovements(
					attributes.id,
					cost_improvements,
				);
				if (updateCostImprovements === false) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.COST_IMPROVEMENTS_SAVE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.COST_IMPROVEMENTS_SAVE_SUCCESS,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to sync cost approach improvements.
	 * @param costApproachId
	 * @param newImprovements
	 * @returns
	 */
	public async syncCostApproachImprovements(
		costApproachId: number,
		newImprovements: ICostImprovements[],
	): Promise<boolean> {
		try {
			// Fetch existing improvements
			const existingImprovements = await this.resEvaluationCostImprovementStore.findAll({
				res_evaluation_cost_approach_id: costApproachId,
			});

			const existingImprovementIds = new Set(
				existingImprovements?.map((improvement) => improvement?.id),
			);
			const newImprovementIds = new Set(
				newImprovements
					?.filter((improvement) => improvement?.id !== undefined)
					?.map((improvement) => improvement?.id),
			);
			const improvementsToAdd = newImprovements.map((improvements) => {
				const { id, ...otherAttributes } = improvements;
				return id === null ? otherAttributes : improvements;
			});
			const improvementsToUpdate = newImprovements.filter((improvement) =>
				existingImprovementIds?.has(improvement?.id),
			);
			const improvementsToDelete = [...existingImprovementIds]?.filter(
				(id) => !newImprovementIds?.has(id),
			);

			// Batch add new improvements
			const addPromises = improvementsToAdd.map(async (improvement) => {
				await this.resEvaluationCostImprovementStore.create({
					...improvement,
					res_evaluation_cost_approach_id: costApproachId,
				});
			});

			// Batch update existing improvements
			const updatePromises = improvementsToUpdate.map(async (improvement) => {
				await this.resEvaluationCostImprovementStore.update(improvement);
			});

			// Batch delete old improvements
			const deletePromises = improvementsToDelete.map(async (id) => {
				await this.resEvaluationCostImprovementStore.delete({ id });
			});

			// Execute all operations concurrently
			await Promise.all([...addPromises, ...updatePromises, ...deletePromises]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Function to update area map info in evaluation approaches.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveAreaMap = async (request: ISaveAreaMap, response: Response): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IAreaMap>;
		try {
			const { role } = request.user;

			// Role check
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate request
			const { value, error } = await helperFunction.validate(saveAreaMapSchema, request.body);
			if (!value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const id = parseInt(request.params.id);
			const url = request.originalUrl;
			const attributes = request.body;

			// Map of approach types
			const approachMap = {
				[EvaluationsEnum.SALE_AREA_MAP]: {
					store: this.resEvaluationSaleApproachStore,
					update: 'updateSalesApproach',
				},
				[EvaluationsEnum.COST_AREA_MAP]: {
					store: this.resEvaluationCostApproachStore,
					update: 'updateCostApproach',
				},
			};

			const approachKey = Object.keys(approachMap).find((key) => url.includes(key));
			if (!approachKey) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.INVALID_APPROACH_TYPE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { store, update } = approachMap[approachKey];
			const findData = await store.findOne({ id });

			if (!findData) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.THIS_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			const updateData = await store[update]({ ...attributes, id });
			if (!updateData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.AREA_INFO_UPDATE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.AREA_INFO_UPDATE_SUCCESS,
			};

			await helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};

			await helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});

			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get selected comps.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSelectedComps = async (
		request: IGetSelectedCompRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IResComp[]>;
		try {
			// Validate schema
			const params = await helperFunction.validate(getSelectedCompSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { role, account_id } = request.user;
			const attributes = request.body.compIds;
			let accountId: number;
			// Checking permissions
			if (!requiredRoles.includes(role)) {
				accountId = account_id;
			}

			// Searching comps
			const comps = await this.resCompsStore.getSelected(attributes, accountId);
			if (!comps.length) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: CompEnum.COMP_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: comps,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to update position of evaluation.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updatePosition = async (
		request: IPositionRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			// Validate schema
			const params = await helperFunction.validate(evaluationPositionSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const evaluationId = parseInt(request?.params?.id);
			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const { role, account_id, id } = request.user;
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const evaluationData = request.body;
			await this.resEvaluationStorage.updateEvaluation(evaluationData, evaluationId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_SAVE_SUCCESS,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description function to post exhibits
	 * @param request
	 * @param response
	 * @returns
	 */
	public evaluationExhibits = async (
		request: IPostEvalExhibitsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUploadSuccess<IUploadURLSuccessData>;
		try {
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			let width: number, height: number;
			const { mimetype, size, originalname } = request.file;
			if (mimetype.includes(UploadEnum.IMAGE)) {
				const metadata = await sharp(request.file.path).metadata();
				width = metadata.width;
				height = metadata.height;
			}
			const url = await uploadFunction.addFile({
				file: request.file,
				id: evaluationId,
				type: UploadEnum.RES_EVALUATION,
			});
			if (!url) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: FileEnum.FILE_UPLOAD_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const fileName = originalname.replace(/\s/g, '');
			const storage = FileStorageEnum.SERVER;
			const origin = FileOriginEnum.EVALUATION_EXHIBITS;
			let order = 1;
			const allFiles = await this.evaluationFilesStorage.findFiles({
				res_evaluation_id: evaluationId,
			});
			if (allFiles?.length) {
				const lastElement = allFiles[allFiles?.length - 1];
				order = lastElement?.order + 1;
			}
			const fileAttributes = {
				type: mimetype,
				size,
				dir: url,
				filename: fileName,
				res_evaluation_id: evaluationId,
				height,
				width,
				title: null,
				description: UploadEnum.EXHIBITS,
				origin,
				storage,
				order,
			};
			const fileData = await this.evaluationFilesStorage.create(fileAttributes);
			if (!fileData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: FileEnum.FILE_UPLOAD_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: FileEnum.FILE_UPLOAD_SUCCESS,
				data: { id: fileData.id, url: S3_BASE_URL + url },
				next: ScreenEnums.REPORT_SCREEN,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to update position of exhibits
	 * @param response
	 * @returns
	 */
	public updateExhibit = async (
		request: IUpdateExhibits,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluationFilesData>;
		try {
			// Validate the request schema
			const params = await helperFunction.validate(updateExhibitPositionSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const evaluationId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const { evaluationFilesId, field, value }: IUpdateExhibits = request.body;

			// Construct the attributes object dynamically
			const attributes: IFilesPosition = {
				id: evaluationFilesId,
				[field]: value,
			};
			const updatePosition = await this.evaluationFilesStorage.updateEvaluationFiles(attributes);
			if (!updatePosition) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EXHIBIT_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EXHIBIT_UPDATE_SUCCESS,
				position: ScreenEnums.EXHIBITS,
				next: ScreenEnums.REPORT_SCREEN,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to remove exhibits
	 * @param request
	 * @param response
	 * @returns
	 */
	public removeExhibit = async (
		request: IRemoveExhibitsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const fileId = parseInt(request?.params?.id);
			const attribute = {
				id: fileId,
			};
			const file = await this.evaluationFilesStorage.findFilesByAttribute(attribute);
			if (file) {
				if (uploadFunction.removeFromServer(file.dir)) {
					this.evaluationFilesStorage.removeFilesById(file.id);
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: FileEnum.FILE_DELETE_SUCCESS,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to update positions of exhibits.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateExhibitsPositions = async (
		request: IUpdateEvalPositions,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluationFilesData[]>;
		try {
			// Validate the request schema
			const params = await helperFunction.validate(updateExhibitPositionSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const evaluationId = parseInt(request?.params?.id);
			const { role, account_id, id } = request.user;

			// Find the evaluation by ID
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const { exhibits } = request.body;
			const updatePosition = [];
			if (exhibits) {
				for (const exhibit of exhibits) {
					updatePosition.push(await this.evaluationFilesStorage.updateEvaluationFiles(exhibit));
				}
			}
			if (!updatePosition?.length) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EXHIBIT_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EXHIBIT_UPDATE_SUCCESS,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to save and update sales approach.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveSalesApproach = async (
		request: EvalSalesApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvalSalesApproach>;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate request body
			const params = await helperFunction.validate(saveSalesApproachSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { sales_approach, res_evaluation_id, ...attributes } = request.body;
			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({
				id: res_evaluation_id,
			});
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.resEvaluationScenarioStore.findScenario({
				id: sales_approach.res_evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (findScenarioApproaches.has_sales_approach === 0) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Updating weighted_market_value in evaluation table.
			await this.resEvaluationScenarioStore.updateScenario(
				sales_approach?.res_evaluation_scenario_id,
				attributes,
			);

			// Creating new records for sale approach
			if (!sales_approach.id) {
				// Checking duplicate record of sale approach by evaluation scenario id.
				const findSaleData = await this.resEvaluationSaleApproachStore.findOne({
					res_evaluation_scenario_id: sales_approach.res_evaluation_scenario_id,
				});
				if (findSaleData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving sales approach data in evaluation sales approaches table
				sales_approach.res_evaluation_id = res_evaluation_id;
				const saveSaleApproach =
					await this.resEvaluationSaleApproachStore.createSalesApproach(sales_approach);
				if (!saveSaleApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.SALE_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.SALE_APPROACH_SAVED_SUCCESS,
					data: saveSaleApproach,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			} else {
				// Updating sales approach data
				const findSalesData = await this.resEvaluationSaleApproachStore.findOne({
					res_evaluation_scenario_id: sales_approach.res_evaluation_scenario_id,
				});
				if (!findSalesData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.SALES_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const {
					subject_property_adj,
					subject_qualitative_adjustments,
					sales_comparison_attributes,
					comp_data,
					...rest
				} = sales_approach;
				let updateSalesData: boolean;
				if (Object.keys(rest)?.length > 0) {
					updateSalesData = await this.resEvaluationSaleApproachStore.updateSalesApproach(rest);
				}
				if (!updateSalesData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.SALE_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Handle sales_comparison_attributes
				if (sales_comparison_attributes) {
					const updatedSaleComparison = sales_comparison_attributes.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
					const updateSaleComparisonItems = await this.syncSalesComparisonItems(
						sales_approach.id,
						updatedSaleComparison,
					);
					if (!updateSaleComparisonItems) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.COMPARISON_ATTRIBUTE_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Handle subject_property_adjustments
				if (subject_property_adj) {
					const updatedSubjectPropertyAdjustments = subject_property_adj.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
					const updateEvaluationSubAdj = await this.syncSalesSubjectAdjustments(
						sales_approach.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateEvaluationSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.SALES_APPROACH_SUB_ADJ_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Handle subject_qualitative_adjustments
				if (subject_qualitative_adjustments) {
					const updatedSubPropertyQualitativeAdj = subject_qualitative_adjustments.map(
						(item, index) => ({
							...item,
							order: index + 1, // Start order from 1 and increment by 1
						}),
					);
					const updateQualitativeSubAdj = await this.syncSaleSubQualitativeAdj(
						sales_approach.id,
						updatedSubPropertyQualitativeAdj,
					);
					if (!updateQualitativeSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.SALE_SUB_QUALITATIVE_ADJ_UPDATE_FAIL,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Handling comps of sales approach
				if (comp_data) {
					const updateSalesComps = await this.synchronizeSalesComps(sales_approach.id, comp_data);
					if (!updateSalesComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.SALES_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.SALE_APPROACH_SAVED_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
	/**
	 * @description Function to handle evaluation sales comparison attributes.
	 * @param saleApproachId
	 * @param newComparisonItems
	 * @returns
	 */
	public async syncSalesComparisonItems(
		saleApproachId: number,
		newComparisonItems: ISaleComparisonAttributes[],
	): Promise<boolean> {
		try {
			// Filter out items with empty comparison_key
			const validComparisonItems = newComparisonItems.filter(
				(item) => item?.comparison_key && item?.comparison_key.trim() !== '',
			);
			// Fetch existing comparison attributes
			const existingSaleAttributes = await this.resEvaluationSaleComparisonStore.findAll({
				res_evaluation_sales_approach_id: saleApproachId,
			});

			// Create Sets for quick lookup of keys
			const existingKeys = new Set(existingSaleAttributes.map((item) => item.comparison_key));
			const newKeys = new Set(validComparisonItems.map((item) => item.comparison_key));

			// Determine keys to add, delete, and update
			const keysToAdd = [...newKeys].filter((key) => !existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			const keysToUpdate = [...newKeys].filter((key) => existingKeys.has(key));

			// Prepare batches for database
			const attributesToAdd = keysToAdd.map((key) => {
				const adjustment = validComparisonItems.find((item) => item.comparison_key === key);
				return {
					res_evaluation_sales_approach_id: saleApproachId,
					comparison_key: adjustment!.comparison_key,
					comparison_value: adjustment!.comparison_value,
					order: adjustment!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				res_evaluation_sales_approach_id: saleApproachId,
				comparison_key: key,
			}));

			// Find adjustments to update where the `order` is different
			const attributesToUpdate = keysToUpdate
				.map((key) => {
					const newAdjustment = validComparisonItems.find((item) => item.comparison_key === key);
					const existingAdjustment = existingSaleAttributes.find(
						(item) => item.comparison_key === key,
					);
					if (
						newAdjustment &&
						existingAdjustment &&
						newAdjustment.order !== existingAdjustment.order
					) {
						return {
							res_evaluation_sales_approach_id: saleApproachId,
							comparison_key: key,
							comparison_value: newAdjustment.comparison_value,
							order: newAdjustment.order, // Update the order if it differs
						};
					}
					return null;
				})
				.filter(Boolean); // Filter out null values

			// Execute batch operations
			await Promise.all([
				...attributesToAdd.map((item) => this.resEvaluationSaleComparisonStore.create(item)),
				...attributesToDelete.map((item) => this.resEvaluationSaleComparisonStore.delete(item)),
				...attributesToUpdate.map((item) => this.resEvaluationSaleComparisonStore.update(item)),
			]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Function to synchronize sales adjustments.
	 * @param saleApproachId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncSalesSubjectAdjustments(
		saleApproachId: number,
		newAdjustments: SalesSubAdjustments[],
	): Promise<boolean> {
		try {
			// Fetch existing adjustments
			const existingAdjustments = await this.resEvaluationSaleSubAdjStore.findAdjustments({
				res_evaluation_sales_approach_id: saleApproachId,
			});

			const existingKeyMap = new Map(existingAdjustments.map((adj) => [adj.adj_key, adj]));
			const newKeys = new Set(newAdjustments.map((adj) => adj.adj_key));
			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));

			const operations: Promise<any>[] = [];

			// Add or update adjustments
			for (const newAdj of newAdjustments) {
				const existingAdj = existingKeyMap.get(newAdj.adj_key);
				const payload = {
					res_evaluation_sales_approach_id: saleApproachId,
					adj_key: newAdj.adj_key,
					adj_value: newAdj.adj_value,
					order: newAdj.order,
				};
				if (existingAdj) {
					// Always update if exists
					operations.push(this.resEvaluationSaleSubAdjStore.updateAdjustments(payload));
				} else {
					// Add if not exists
					operations.push(this.resEvaluationSaleSubAdjStore.createAdjustments(payload));
				}
			}

			// Delete adjustments not present in newAdjustments
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			for (const key of keysToDelete) {
				operations.push(
					this.resEvaluationSaleSubAdjStore.removeAdjustments({
						res_evaluation_sales_approach_id: saleApproachId,
						adj_key: key,
					}),
				);
			}

			await Promise.all(operations);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Function to synchronize sale approach qualitative adjustments.
	 * @param saleApproachId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncSaleSubQualitativeAdj(
		saleApproachId: number,
		newAdjustments: ISaleSubQualitativeAdj[],
	): Promise<boolean> {
		try {
			// Filter out adjustments with empty adj_key
			const validAdjustments = newAdjustments.filter(
				(adj) => adj.adj_key && adj.adj_key.trim() !== '',
			);
			// Fetch existing adjustments
			const existingAdjustments =
				await this.resEvaluationSaleSubQualitativeAdjStore.findAdjustments({
					res_evaluation_sales_approach_id: saleApproachId,
				});

			// Create Sets for quick lookup of keys
			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newKeys = new Set(validAdjustments.map((adj) => adj.adj_key));

			// Determine keys to add, delete, and update
			const keysToAdd = [...newKeys].filter((key) => !existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			const keysToUpdate = [...newKeys].filter((key) => existingKeys.has(key));

			// Prepare batches for database operations
			const adjustmentsToAdd = keysToAdd.map((key) => {
				const adjustment = validAdjustments.find((adj) => adj.adj_key === key);
				return {
					res_evaluation_sales_approach_id: saleApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
					subject_property_value: adjustment!.subject_property_value,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				res_evaluation_sales_approach_id: saleApproachId,
				adj_key: key,
			}));

			// Find adjustments to update where the `order` is different
			const adjustmentsToUpdate = keysToUpdate
				.map((key) => {
					const newAdjustment = validAdjustments.find((adj) => adj.adj_key === key);
					const existingAdjustment = existingAdjustments.find((adj) => adj.adj_key === key);
					if (
						newAdjustment &&
						existingAdjustment &&
						(newAdjustment?.order !== existingAdjustment?.order ||
							newAdjustment?.subject_property_value !== existingAdjustment?.subject_property_value)
					) {
						return {
							res_evaluation_sales_approach_id: saleApproachId,
							adj_key: key,
							adj_value: newAdjustment?.adj_value,
							order: newAdjustment?.order, // Update the order if it differs
							subject_property_value: newAdjustment?.subject_property_value,
						};
					}
					return null;
				})
				.filter(Boolean); // Filter out null values

			// Execute batch operations
			await Promise.all([
				...adjustmentsToAdd.map((adj) =>
					this.resEvaluationSaleSubQualitativeAdjStore.createAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.resEvaluationSaleSubQualitativeAdjStore.removeAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.resEvaluationSaleSubQualitativeAdjStore.updateAdjustments(adj),
				),
			]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Synchronize comps and their adjustments
	 * @param salesApproachId
	 * @param newComps
	 * @returns
	 */
	public async synchronizeSalesComps(
		salesApproachId: number,
		newComps: ISalesComp[],
	): Promise<boolean> {
		try {
			// Fetch existing comps
			const existingComps = await this.resEvaluationSalesCompsStore.findSalesComps({
				res_evaluation_sales_approach_id: salesApproachId,
			});

			const existingCompIds = new Set(existingComps.map((comp) => comp.id));
			const newCompIds = new Set(
				newComps.filter((comp) => comp.id !== undefined).map((comp) => comp.id),
			);

			const compsToAdd = newComps.filter((comp) => comp.id === undefined || comp.id === null);

			const compsToUpdate = newComps.filter((comp) => existingCompIds.has(comp.id));
			const compsToDelete = [...existingCompIds].filter((id) => !newCompIds.has(id));

			// Batch add new comps
			const addPromises = compsToAdd.map(async (comp) => {
				const createdComp = await this.resEvaluationSalesCompsStore.createSalesComps({
					...comp,
					res_evaluation_sales_approach_id: salesApproachId,
				});
				await this.syncSalesCompAdjustments(createdComp.id, comp.comps_adjustments);
				await this.syncSalesCompQualitativeAdj(createdComp.id, comp.comps_qualitative_adjustments);
				await this.syncSalesCompAmenities(createdComp.id, comp.extra_amenities);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.resEvaluationSalesCompsStore.updateSalesComps(comp);
				await this.syncSalesCompAdjustments(comp.id, comp.comps_adjustments);
				await this.syncSalesCompQualitativeAdj(comp.id, comp.comps_qualitative_adjustments);
				await this.syncSalesCompAmenities(comp.id, comp.extra_amenities);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.resEvaluationSalesCompAdjStore.removeAdjustments({
					res_eval_sales_approach_comp_id: id,
				});
				await this.resEvaluationSalesCompsStore.removeSalesComps({ id });
				await this.resEvalSaleCompAmenitiesStore.remove({ res_eval_sales_approach_comp_id: id });
			});

			// Execute all operations concurrently
			await Promise.all([...addPromises, ...updatePromises, ...deletePromises]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Synchronize adjustments for a single comp
	 * @param compId
	 * @param newAdjustments
	 */
	public async syncSalesCompAdjustments(
		compId: number,
		newAdjustments: ISalesCompsAdjustments[],
	): Promise<boolean> {
		try {
			// Fetch existing adjustments
			const existingAdjustments = await this.resEvaluationSalesCompAdjStore.findAdjustments({
				res_eval_sales_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newKeys = new Set(newAdjustments.map((adj) => adj.adj_key));

			// Add or update adjustments
			const ops = newAdjustments.map((adj) => {
				const data = {
					res_eval_sales_approach_comp_id: compId,
					adj_key: adj.adj_key,
					adj_value: adj.adj_value,
				};
				if (existingKeys.has(adj.adj_key)) {
					return this.resEvaluationSalesCompAdjStore.updateAdjustments(data);
				} else {
					return this.resEvaluationSalesCompAdjStore.createAdjustments(data);
				}
			});

			// Remove adjustments not present in newAdjustments
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			for (const key of keysToDelete) {
				ops.push(
					this.resEvaluationSalesCompAdjStore.removeAdjustments({
						res_eval_sales_approach_comp_id: compId,
						adj_key: key,
					}),
				);
			}

			return true;
		} catch (e) {
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
	 * @description Function to Handle sales comps qualitative adjustments.
	 * @param compId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncSalesCompQualitativeAdj(
		compId: number,
		newAdjustments: ISaleCompsQualitativeAdj[],
	) {
		try {
			// Fetch existing comps adjustments
			const existingAdjustments =
				await this.resEvaluationSaleQualitativeCompAdjStore.findAdjustments({
					res_evaluation_sales_approach_comp_id: compId,
				});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				res_evaluation_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				res_evaluation_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				res_evaluation_sales_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) =>
					this.resEvaluationSaleQualitativeCompAdjStore.createAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.resEvaluationSaleQualitativeCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.resEvaluationSaleQualitativeCompAdjStore.removeAdjustments(adj),
				),
			]);

			return true;
		} catch (e) {
			// Logging error
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
	 * @description Synchronize comps and their adjustments
	 * @param salesApproachId
	 * @param newComps
	 * @returns
	 */
	public async syncSalesCompAmenities(
		salesApproachCompId: number,
		newCompAmenities: ISalesCompAmenities[],
	): Promise<boolean> {
		try {
			// Filter out amenities with empty another_amenity_name
			const validAmenities = newCompAmenities.filter(
				(amenity) => amenity?.another_amenity_name && amenity?.another_amenity_name.trim() !== '',
			);
			// Fetch existing comps amenities
			const existingComps = await this.resEvalSaleCompAmenitiesStore.find({
				res_eval_sales_approach_comp_id: salesApproachCompId,
			});

			const existingCompIds = new Set(existingComps.map((comp) => comp.id));
			const newCompIds = new Set(
				validAmenities.filter((comp) => comp.id !== undefined).map((comp) => comp.id),
			);

			const compsToAdd: ISalesCompAmenities[] = [];
			const compsToUpdate: ISalesCompAmenities[] = [];

			// Assign order based on index and prepare records
			validAmenities.forEach((comp, index) => {
				const updatedComp = {
					...comp,
					order: index + 1, // Set order based on index
					res_eval_sales_approach_comp_id: salesApproachCompId,
				};

				if (!comp.id) {
					compsToAdd.push(updatedComp);
				} else if (existingCompIds.has(comp.id)) {
					compsToUpdate.push(updatedComp);
				}
			});

			const compsToDelete = [...existingCompIds].filter((id) => !newCompIds.has(id));

			// Perform batch operations
			await Promise.all([
				...compsToAdd.map((comp) => this.resEvalSaleCompAmenitiesStore.create(comp)),
				...compsToUpdate.map((comp) => this.resEvalSaleCompAmenitiesStore.update(comp)),
				...compsToDelete.map((id) => this.resEvalSaleCompAmenitiesStore.remove({ id })),
			]);

			return true;
		} catch (e) {
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
	 * @description Function to get sales approach data by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSalesApproach = async (
		request: GetSalesApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvalSalesApproach>;
		try {
			const { role, account_id, id } = request.user;
			const evaluationId = Number(request?.query?.evaluationId);
			const evaluationScenarioId = Number(request?.query?.evaluationScenarioId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params evaluationId
			if (!evaluationId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating  query params evaluationScenarioId
			if (!evaluationScenarioId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_SCENARIO_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findEvaluation.account_id != account_id) ||
				(role === RoleEnum.USER && findEvaluation.user_id != id);

			if (isNotAuthorized && (typeof findEvaluation.reviewed_by === 'number' && findEvaluation.reviewed_by != id)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Get evaluation sales approach
			const salesApproachData = await this.resEvaluationSaleApproachStore.findByAttribute({
				res_evaluation_scenario_id: evaluationScenarioId,
				res_evaluation_id: evaluationId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.SALE_APPROACH_DATA,
				data: salesApproachData,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Get list of Comparative Attributes
	 * @param request
	 * @param response
	 * @returns
	 */
	public getEvalComparativeAttributes = async (
		request: IGetRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IComparativeListSuccess;
		try {
			const { evaluation_type } = request.query;
			const attributes = { status: 1, code: evaluation_type };
			// Get codes by attribute
			const comparativeAttributes =
				await this.resEvaluationStorage.getComparativeAttributes(attributes);
			if (!comparativeAttributes) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: CommonEnum.GLOBAL_CODE_CATEGORY_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CommonEnum.GLOBAL_CODE_CATEGORIES_LIST,
				data: comparativeAttributes,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};

			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to save evaluation weight in income, sale and cost approach.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveWeightPercentage = async (
		request: ISaveWeightPercentage,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate request body
			const params = await helperFunction.validate(SaveApproachPercentSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { approach_type, approach_id, eval_weight } = request.body;
			const evaluationId = parseInt(request?.params?.id);
			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const percentValue = eval_weight / 100;
			const attributes = { id: approach_id, eval_weight: percentValue };
			let updateSuccess;
			if (approach_type === EvaluationsEnum.INCOME) {
				const findApproach = await this.resEvaluationIncomeStore.findByAttribute({
					id: approach_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.INCOME_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else {
					attributes['incremental_value'] = findApproach?.indicated_range_annual
						? findApproach?.indicated_range_annual / percentValue
						: 0;
					updateSuccess = await this.resEvaluationIncomeStore.updateIncomeApproach(attributes);
				}
			} else if (approach_type === EvaluationsEnum.SALE) {
				const findApproach = await this.resEvaluationSaleApproachStore.findByAttribute({
					id: approach_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.SALES_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else {
					attributes['incremental_value'] = findApproach?.sales_approach_value
						? findApproach?.sales_approach_value / percentValue
						: 0;
					updateSuccess = await this.resEvaluationSaleApproachStore.updateSalesApproach(attributes);
				}
			} else if (approach_type === EvaluationsEnum.COST) {
				const findApproach = await this.resEvaluationCostApproachStore.findByAttribute({
					id: approach_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.COST_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else {
					attributes['incremental_value'] = findApproach?.total_cost_valuation
						? findApproach?.total_cost_valuation / percentValue
						: 0;
					updateSuccess = await this.resEvaluationCostApproachStore.updateCostApproach(attributes);
				}
			}

			if (!updateSuccess) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EVALUATION_APPROACH_UPDATE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			} else {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: StatusEnum.SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Handles saving review details for an evaluation, including updating scenario and approach data.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveReviewDetails = async (
		request: ISaveReviewDetails,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate request body
			const params = await helperFunction.validate(SaveReviewSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const {
				approach,
				approach_id,
				eval_weight,
				incremental_value,
				res_evaluation_scenario_id,
				weighted_market_value,
				rounding,
				review_summary,
				review_date,
				reviewed_by,
			} = request.body;
			const evaluation_id = parseInt(request?.params?.id);

			// Find the evaluation by id
			const findEvaluation = await this.resEvaluationStorage.findByAttribute({ id: evaluation_id });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			let reviewDate = null;

			if (review_date) {
				reviewDate = changeDateFormat(review_date);
			}
			const evalAttributes: any = {};
			evalAttributes.review_date = reviewDate;
			if (typeof review_summary !== 'undefined' && review_summary !== null)
				evalAttributes.review_summary = review_summary;
			if (typeof reviewed_by !== 'undefined' && reviewed_by !== null)
				evalAttributes.reviewed_by = reviewed_by;

			// Only update if there is at least one valid attribute
			if (Object.keys(evalAttributes).length > 0) {
				await this.resEvaluationStorage.updateEvaluation(evalAttributes, evaluation_id);
			}

			// Update weighted market value and rounding data in scenario table.
			const findScenario = await this.resEvaluationScenarioStore.findScenario({
				id: res_evaluation_scenario_id,
			});
			let updateScenarioDetail;
			if (findScenario) {
				const scenarioAttributes = {
					weighted_market_value,
					rounding,
				};
				updateScenarioDetail = await this.resEvaluationScenarioStore.updateScenario(
					res_evaluation_scenario_id,
					scenarioAttributes,
				);
			}

			//Saving review details on the basis of approach type.
			const percentValue = eval_weight / 100;
			const attributes = {
				id: approach_id,
				eval_weight: percentValue,
				incremental_value,
			};
			let updateSuccess;
			if (approach === EvaluationsEnum.INCOME) {
				const findApproach = await this.resEvaluationIncomeStore.findByAttribute({
					id: approach_id,
					res_evaluation_scenario_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.INCOME_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else {
					updateSuccess = await this.resEvaluationIncomeStore.updateIncomeApproach(attributes);
				}
			} else if (approach === EvaluationsEnum.SALE) {
				const findApproach = await this.resEvaluationSaleApproachStore.findByAttribute({
					id: approach_id,
					res_evaluation_scenario_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.SALES_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else
					updateSuccess = await this.resEvaluationSaleApproachStore.updateSalesApproach(attributes);
			} else if (approach === EvaluationsEnum.COST) {
				const findApproach = await this.resEvaluationCostApproachStore.findByAttribute({
					id: approach_id,
					res_evaluation_scenario_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.COST_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else
					updateSuccess = await this.resEvaluationCostApproachStore.updateCostApproach(attributes);
			}

			if (!updateSuccess && !updateScenarioDetail) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.EVALUATION_APPROACH_UPDATE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			} else {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: StatusEnum.SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get evaluation by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getReview = async (
		request: IGetEvaluationRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluation>;
		try {
			const { role, account_id, id } = request.user;

			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const evaluationId = parseInt(request?.params?.id);
			if (!evaluationId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.INVALID_EVALUATION_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attribute = { id: evaluationId, account_id: account_id, user_id: id };
			if (role === RoleEnum.ADMINISTRATOR) {
				delete attribute?.user_id;
			} else if (role === RoleEnum.USER) {
				delete attribute?.account_id;
			} else if (role === RoleEnum.SUPER_ADMINISTRATOR) {
				delete attribute?.user_id;
				delete attribute?.account_id;
			}
			//finding by evaluation id
			const evaluationInfo = await this.resEvaluationStorage.getReviewDetails(attribute);
			if (!evaluationInfo) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.EVALUATION_DATA,
				data: evaluationInfo,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get HTML to preview report.
	 * @param request
	 * @param response
	 * @returns
	 */
	public previewReport = async (
		request: IGetRequest,
		response: Response,
	): Promise<Response | void | any> => {
		let data: IError | IEvaluationSuccess<string>;
		try {
			const { role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const evaluationId = parseInt(request?.params?.id);
			const evaluationData: IEvaluation = await this.resEvaluationStorage.findByAttribute({
				id: evaluationId,
			});
			if (!evaluationData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.INVALID_EVALUATION_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Fetching html content for preview
			const htmlContent = await this.getReportPdfContent(evaluationId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.REPORT_PREVIEW_SUCCESS,
				data: htmlContent,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to create html content for download pdf document.
	 * @param compIds
	 * @returns
	 */
	public getReportPdfContent = async (id): Promise<string> => {
		try {
			const googleApiKey = GOOGLE_MAPS_API_KEY;
			const repoertImageProxyURL = BACKEND_PROXY_URL_FOR_IMAGE;
			const evaluationData: any = await this.resEvaluationStorage.getEvaluationInfoForPdf({
				id,
			});
			for (let index = 0; index < evaluationData.res_evaluation_scenarios.length; index++) {
				const scenario = evaluationData.res_evaluation_scenarios[index];
				if (scenario.has_sales_approach) {
					// Get evaluation sales approach
					const approachData = await this.resEvaluationSaleApproachStore.findByAttribute({
						res_evaluation_scenario_id: scenario.id,
					});
					evaluationData.res_evaluation_scenarios[index]['evaluation_sale_approach'] = approachData;
				}
				if (scenario.has_cost_approach) {
					// Get evaluation cost approach
					const approachData = await this.resEvaluationCostApproachStore.findByAttribute({
						res_evaluation_scenario_id: scenario.id,
					});
					evaluationData.res_evaluation_scenarios[index]['evaluation_cost_approach'] = approachData;
				}
			}
			// Fetch all codes
			const getStates = await this.commonStore.findGlobalCodeByAttribute({ type: 'states' });
			const statesOptions = getStates?.options;

			//Fetch zoning type
			const zoning = await this.commonStore.findGlobalCodeByAttribute({ type: 'zone' });
			const zoningOptions = zoning?.options;

			//Fetch condition global codes
			const condition = await this.commonStore.findGlobalCodeByAttribute({ type: 'condition' });
			const conditionOptions = condition?.options;

			//Fetch frontage values
			const frontage = await this.commonStore.findGlobalCodeByAttribute({ type: 'frontages' });
			const frontageOptions = frontage?.options;

			//Fetch topography values
			const topography = await this.commonStore.findGlobalCodeByAttribute({ type: 'topographies' });
			const topographyOptions = topography?.options;

			//Fetch sales_res_comp_quantitative_adjustment type
			const salesCompQuantitativeAdjustments = await this.commonStore.findGlobalCodeByAttribute({
				type: 'sales_res_comp_quantitative_adjustments',
			});
			const salesCompQuantitativeAdjustmentsOptions = salesCompQuantitativeAdjustments?.options;
			//Fetch property_class values
			const propertyClass = await this.commonStore.findGlobalCodeByAttribute({
				type: 'property_class',
			});
			const propertyClassOptions = propertyClass?.options;

			const propertyRights = await this.commonStore.findGlobalCodeByAttribute({
				type: 'property_rights',
			});
			const propertyRightOptions = propertyRights?.options;

			const user = await this.userStore.get(evaluationData.user.id);
			evaluationData.user = user;
			const noPhotoUrl = '/images/default-placeholder.png';

			// Batch fetch all images in parallel
			const [
				coverImage,
				tocImage,
				ESDImage,
				propertySummaryImage,
				propertySummaryBottomImage,
				areaInfo,
				exhibits,
			] = await Promise.all([
				this.evaluationFilesStorage.findFilesByAttribute({ res_evaluation_id: id, title: 'cover' }),
				this.evaluationFilesStorage.findFilesByAttribute({
					res_evaluation_id: id,
					title: 'table-of-contents',
				}),
				this.evaluationFilesStorage.findFilesByAttribute({
					res_evaluation_id: id,
					title: 'executive-summary-details',
				}),
				this.evaluationFilesStorage.findFilesByAttribute({
					res_evaluation_id: id,
					title: 'property-summary-top-image',
				}),
				this.evaluationFilesStorage.findFilesByAttribute({
					res_evaluation_id: id,
					title: 'property-summary-bottom-image',
				}),
				this.evaluationMetaDataStore.getAreaInfo({
					res_evaluation_id: id,
				}),
				this.evaluationFilesStorage.findFiles({
					res_evaluation_id: id,
					origin: FileOriginEnum.EVALUATION_EXHIBITS,
				}),
			]);
			if (evaluationData.reviewed_by && evaluationData.review_date) {
				evaluationData.reviewedBy = await this.userStore.findByAttribute({
					id: evaluationData.reviewed_by,
				});
			}
			evaluationData.coverImage = coverImage ? `${S3_BASE_URL}${coverImage?.dir}` : noPhotoUrl;
			evaluationData.baseUrl = S3_BASE_URL;
			evaluationData.tableOfContents = tocImage ? `${S3_BASE_URL}${tocImage?.dir}` : noPhotoUrl;
			evaluationData.ESDImage = ESDImage ? `${S3_BASE_URL}${ESDImage?.dir}` : noPhotoUrl;
			evaluationData.propertySummaryImage = propertySummaryImage
				? `${S3_BASE_URL}${propertySummaryImage?.dir}`
				: noPhotoUrl;
			evaluationData.propertySummaryBottomImage = propertySummaryBottomImage
				? `${S3_BASE_URL}${propertySummaryBottomImage?.dir}`
				: noPhotoUrl;
			evaluationData.areaInfo = areaInfo;
			evaluationData.map_image_url = evaluationData.map_image_url
				? `${S3_BASE_URL}${evaluationData.map_image_url}`
				: noPhotoUrl;

			const filename = 'Residential Evaluation-' + evaluationData.business_name;
			const templateBase = path.join(process.cwd(), 'templates/resReport/pages');
			const partialsBase = path.join(templateBase, 'partials');

			// Batch read all templates in parallel
			const [
				headerPageHtml,
				watermarkPageHtml,
				chapterPageHtml,
				sectionPageHtml,
				coverPageHtml,
				tocPageHtml,
				loePageHtml,
				executiveSummaryPageHtml,
				executiveSummaryDetailsPageHtml,
				propertySummaryOverviewPageHtml,
				propertySummaryZoningPageHtml,
				propertySummaryAreaInfoPageHtml,
				propertySummaryAerialsMapPageHtml,
				propertyBoundaryPageHtml,
				valuationsDeterminantsPageHtml,
				valuationsExplanationPageHtml,
				valuationsIncomeApproachPageHtml,
				valuationsSalesComparisonApproachPageHtml,
				valuationsCostApproachPageHtml,
				weightedValuePageHtml,
				aboutBusinessPropertiesPageHtml,
				brokerProfilePageHtml,
				brokerSignificantTransactionsPageHtml,
				assumptionsPageHtml,
				assumptionsContinuedPageHtml,
				exhibitsPageHtml,
				footerPageHtml,
			] = await Promise.all([
				fs.promises.readFile(path.join(templateBase, 'header.ejs'), 'utf8'),
				fs.promises.readFile(path.join(partialsBase, 'watermark.ejs'), 'utf8'),
				fs.promises.readFile(path.join(partialsBase, 'chapter.ejs'), 'utf8'),
				fs.promises.readFile(path.join(partialsBase, 'section.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'cover.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'toc.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'letterOfEngagement.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'executiveSummaryDescription.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'executiveSummaryDetails.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'propertySummaryOverview.ejs'), 'utf8'),
				fs.promises.readFile(
					path.join(templateBase, 'propertySummaryZoningDescription.ejs'),
					'utf8',
				),
				fs.promises.readFile(path.join(templateBase, 'propertySummaryAreaInfo.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'propertySummaryAerialsMap.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'propertyBoundary.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'valuationsDeterminants.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'valuationsExplanation.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'valuationsIncomeApproach.ejs'), 'utf8'),
				fs.promises.readFile(
					path.join(templateBase, 'valuationsSalesComparisonApproach.ejs'),
					'utf8',
				),
				fs.promises.readFile(path.join(templateBase, 'valuationsCostApproach.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'weightedValue.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'aboutBusinessProperties.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'brokerProfile.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'brokerSignificantTransactions.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'assumptions.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'assumptionsContinued.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'exhibits.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'footer.ejs'), 'utf8'),
			]);

			const data = {
				filename,
				title: 'Evaluation Report',
				theme: evaluationData.account.theme,
				evaluation_id: evaluationData.id,
				primary_color: evaluationData.account.primary_color,
				secondary_color: evaluationData.account.secondary_color,
				tertiary_color: evaluationData.account.tertiary_color,
				cdnUrl: evaluationData.baseUrl,
			};

			// Pre-render reusable partials
			const chapterExecSummary = ejs.render(chapterPageHtml, {
				theme: data.theme,
				section: 'Section 01',
				title: 'Executive Summary',
			});
			const chapterPropertySummary = ejs.render(chapterPageHtml, {
				theme: data.theme,
				section: 'Section 02',
				title: 'Property Summary',
			});
			const chapterValuations = ejs.render(chapterPageHtml, {
				theme: data.theme,
				section: 'Section 03',
				title: 'Valuations',
			});
			const chapterWeightedValue = ejs.render(chapterPageHtml, {
				theme: data.theme,
				section: 'Section 04',
				title: 'Weighted Value',
			});
			const chapterAboutUs = ejs.render(chapterPageHtml, {
				theme: data.theme,
				section: 'Section 05',
				title: 'About Us',
			});
			const chapterAssumptions = ejs.render(chapterPageHtml, {
				theme: data.theme,
				section: 'Section 06',
				title: 'Assumptions',
			});
			const chapterExhibits = ejs.render(chapterPageHtml, {
				theme: data.theme,
				section: 'Section 07',
				title: 'Exhibits',
			});
			const section1 = ejs.render(sectionPageHtml, { section: 1 });
			const section2 = ejs.render(sectionPageHtml, { section: 2 });
			const section3 = ejs.render(sectionPageHtml, { section: 3 });
			const section4 = ejs.render(sectionPageHtml, { section: 4 });
			const section5 = ejs.render(sectionPageHtml, { section: 5 });
			const section6 = ejs.render(sectionPageHtml, { section: 6 });
			const section7 = ejs.render(sectionPageHtml, { section: 7 });

			// Compose the HTML
			const htmlWithStyle = `
				${ejs.render(headerPageHtml, { data, googleApiKey, repoertImageProxyURL })}
				${ejs.render(coverPageHtml, { evaluation: evaluationData, states: statesOptions })}
				${ejs.render(tocPageHtml, {
					watermark: watermarkPageHtml,
					evaluation: evaluationData,
					cdn_url: S3_BASE_URL,
					chapter: ejs.render(chapterPageHtml, {
						theme: data.theme,
						title: 'Table of Contents',
					}),
				})}
				${ejs.render(loePageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					...reportHelpers,
				})}
				${ejs.render(executiveSummaryPageHtml, {
					evaluation: evaluationData,
					theme: data.theme,
					watermark: watermarkPageHtml,
					chapter: chapterExecSummary,
					section: section1,
				})}
				${ejs.render(executiveSummaryDetailsPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					chapter: chapterExecSummary,
					...reportHelpers,
					propertyRightOptions,
				})}
				${ejs.render(propertySummaryOverviewPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					chapter: chapterPropertySummary,
					section: section2,
					...reportHelpers,
					states: statesOptions,
					frontageOptions,
					topographyOptions,
				})}
				${ejs.render(propertySummaryZoningPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					chapter: chapterPropertySummary,
					section: section2,
					zoneOptions: zoningOptions,
					...reportHelpers,
					conditionOptions,
					propertyClassOptions,
				})}
				${ejs.render(propertySummaryAreaInfoPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					chapter: chapterPropertySummary,
					...reportHelpers,
				})}
				${ejs.render(propertySummaryAerialsMapPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					chapter: chapterPropertySummary,
					googleApiKey,
					states: statesOptions,
				})}
				${ejs.render(propertyBoundaryPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					chapter: chapterPropertySummary,
				})}
				${ejs.render(valuationsDeterminantsPageHtml, {
					evaluation: evaluationData,
					section: section3,
					watermark: watermarkPageHtml,
					chapter: chapterValuations,
				})}
				${ejs.render(valuationsExplanationPageHtml, {
					evaluation: evaluationData,
					section: section3,
					watermark: watermarkPageHtml,
					chapter: chapterValuations,
				})}
				${ejs.render(valuationsIncomeApproachPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					section: section3,
					chapter: chapterValuations,
					zoneOptions: zoningOptions,
					...reportHelpers,
				})}
				${ejs.render(valuationsSalesComparisonApproachPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					section: section3,
					chapter: chapterValuations,
					theme: data.theme,
					googleApiKey,
					...reportHelpers,
					states: statesOptions,
					conditionOptions,
					topographyOptions,
					frontageOptions,
					salesCompQuantitativeAdjustmentsOptions,
				})}
				${ejs.render(valuationsCostApproachPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					section: section3,
					chapter: chapterValuations,
					theme: data.theme,
					googleApiKey,
					...reportHelpers,
					states: statesOptions,
					conditionOptions,
					topographyOptions,
					zoneOptions: zoningOptions,
					frontageOptions,
				})}
				${ejs.render(weightedValuePageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					section: section4,
					chapter: chapterWeightedValue,
					...reportHelpers,
				})}
				${ejs.render(aboutBusinessPropertiesPageHtml, {
					evaluation: evaluationData,
					section: section5,
					watermark: watermarkPageHtml,
					chapter: chapterAboutUs,
				})}
				${ejs.render(brokerProfilePageHtml, {
					evaluation: evaluationData,
					section: section5,
					watermark: watermarkPageHtml,
					chapter: chapterAboutUs,
				})}
				${ejs.render(brokerSignificantTransactionsPageHtml, {
					evaluation: evaluationData,
					section: section5,
					watermark: watermarkPageHtml,
					chapter: chapterAboutUs,
					...reportHelpers,
				})}
				${ejs.render(assumptionsPageHtml, {
					evaluation: evaluationData,
					section: section6,
					watermark: watermarkPageHtml,
					chapter: chapterAssumptions,
				})}
				${ejs.render(assumptionsContinuedPageHtml, {
					evaluation: evaluationData,
					section: section6,
					watermark: watermarkPageHtml,
					chapter: chapterAssumptions,
				})}
				${ejs.render(exhibitsPageHtml, {
					evaluation: evaluationData,
					exhibits,
					section: section7,
					watermark: watermarkPageHtml,
					chapter: chapterExhibits,
				})}
				${ejs.render(footerPageHtml)}
			`;

			// Clean HTML if needed
			const cleanedHtml = htmlWithStyle.replace(/[\n\t]/g, '');
			const $ = cheerio.load(cleanedHtml);
			const updatedHtml = $.html();

			helperFunction.log({
				message: 'Report PDF content generated',
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return updatedHtml;
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return '';
		}
	};

	/**
	 * @description Function to update weight change calculations based on approach.
	 * @param data
	 * @param evaluationData
	 * @param approach
	 * @returns
	 */
	public updateWeightChangeCalcualtions = async (
		data,
		evaluationData,
		approach: EvaluationsEnum,
	) => {
		try {
			if (approach === EvaluationsEnum.INCOME) {
				return await this.updateIncomeApproachCalculations(data, evaluationData);
			}
			if (approach === EvaluationsEnum.SALE || approach === EvaluationsEnum.COST) {
				const { evaluationScenarioId, evalWeight } = data;
				return await this.calculateWeightedMarketValue(evaluationScenarioId, evalWeight);
			}
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return;
		}
	};

	/**
	 * @description Function to update income approach calculations.
	 * @param data
	 * @param evaluationData
	 * @return {Promise<void>}
	 */
	public updateIncomeApproachCalculations = async (data, evaluationData): Promise<void> => {
		try {
			const { evaluationScenarioId, evalWeight } = data;
			if (data?.evaluationScenarioId) {
				const incomeApproachData = await this.resEvaluationIncomeStore.findByAttribute({
					res_evaluation_scenario_id: evaluationScenarioId,
				});
				if (incomeApproachData && !incomeApproachData.incomeSources.length) {
					for (const zoningData of evaluationData.res_zonings) {
						const attributes = {
							res_evaluation_income_approach_id: incomeApproachData.id,
							res_zoning_id: zoningData.id,
							type: zoningData.sub_zone,
							space: zoningData.sub_zone,
							square_feet: zoningData.total_sq_ft,
							comments: zoningData.zone,
							monthly_income: 0,
							annual_income: 0,
							rent_sq_ft: 0,
							link_overview: 1,
						};
						await this.resEvaluationIncomeSourcesStore.create(attributes);
					}
				} else {
					await this.calculateWeightedMarketValue(evaluationScenarioId, evalWeight);
				}
				return;
			}
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return;
		}
	};

	/**
	 * @description Function to calculate weighted market value based on evaluation scenario.
	 * @param scenarioId
	 * @param evalWeight
	 * @returns {Promise<boolean>}
	 */
	public calculateWeightedMarketValue = async (scenarioId, evalWeight) => {
		try {
			let totalWeightedValue = 0;
			const incomeApproachData = await this.resEvaluationIncomeStore.findByAttribute({
				res_evaluation_scenario_id: scenarioId,
			});
			if (incomeApproachData) {
				const indecatedValue = incomeApproachData.indicated_range_annual || 0;
				const indecatedValueWeight = indecatedValue * (incomeApproachData.eval_weight || 0);
				totalWeightedValue += indecatedValueWeight;
			}
			const saleApproachData = await this.resEvaluationSaleApproachStore.findByAttribute({
				res_evaluation_scenario_id: scenarioId,
			});
			if (saleApproachData) {
				const indecatedValue = saleApproachData.sales_approach_value || 0;
				const indecatedValueWeight = indecatedValue * (saleApproachData.eval_weight || 0);
				totalWeightedValue += indecatedValueWeight;
			}
			const costApproachData = await this.resEvaluationCostApproachStore.findByAttribute({
				res_evaluation_scenario_id: scenarioId,
			});
			if (costApproachData) {
				const indecatedValue = costApproachData.total_cost_valuation || 0;
				const indecatedValueWeight = indecatedValue * (costApproachData.eval_weight || 0);
				totalWeightedValue += indecatedValueWeight;
			}
			this.resEvaluationScenarioStore.updateScenario(scenarioId, {
				weighted_market_value: totalWeightedValue,
			});
			return true;
		} catch (e) {
			return false;
		}
	};

	/**
	 * @description Function to update income approaches.
	 * @param data
	 */
	public updateApproaches = async (data: IEvaluationsUpdateRequest): Promise<boolean> => {
		try {
			const id = data.id;
			// Retrieve the old data for the given ID
			const evaluationData = await this.resEvaluationStorage.getResEvaluation({ id });
			// Loop through each appraisal approach in the old data
			for (const scenario of evaluationData.res_evaluation_scenarios) {
				// Check if the approach type is 'income'
				if (scenario.has_income_approach && scenario?.res_evaluation_income_approach) {
					// Extract the ID of the income approach
					const incomeApproachId = scenario?.res_evaluation_income_approach?.id;
					// If the income approach ID exists
					if (incomeApproachId) {
						// Prepare attributes for calculating the income approach
						const incomeAttributes = { data, income: scenario?.res_evaluation_income_approach };
						// Calculate the incremental value using the income approach
						await this.calculateIncomeApproach(incomeAttributes);
					}
				}
				if (scenario.has_sales_approach && scenario?.res_evaluation_sales_approach) {
					// Extract the ID of the sale approach
					const saleApproachId = scenario?.res_evaluation_sales_approach?.id;
					// Prepare attributes for calculating the sale approach
					if (saleApproachId) {
						const saleAttributes = { data, sale: scenario?.res_evaluation_sales_approach };
						await this.setSalesPsfValues(saleAttributes);
					}
				}
				if (scenario.has_cost_approach && scenario?.res_evaluation_cost_approach) {
					// Extract the ID of the cost approach
					const costApproachId = scenario?.res_evaluation_cost_approach;
					// Prepare attributes for calculating the cost approach
					if (costApproachId) {
						const costAttributes = { data, cost: scenario?.res_evaluation_cost_approach };
						await this.setCostPsfValues(costAttributes);
					}
				}
			}
			return true;
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	};

	/**
	 * @description Function to calculate income approaches.
	 * @param incomeAttributes
	 * @returns
	 */
	public calculateIncomeApproach = async (incomeAttributes: ICalculateIncome) => {
		try {
			const { data, income } = incomeAttributes;
			const scenarioId = income.res_evaluation_scenario_id;
			const incomeId = income?.id;
			// Retrieve income data based on the income ID
			const incomeData = await this.resEvaluationIncomeStore.findByAttribute({ id: incomeId });
			// Check if income data exists
			if (!incomeData) {
				return; // Exit if income data does not exist
			}
			// Calculate land size
			const landSize = data.building_size;

			const sSpace = EvaluationsEnum.SQ_FT;
			// Retrieve income sources based on the income approach ID
			let incomeSource: IResIncomeSource[] = await this.resEvaluationIncomeSourcesStore.findAll({
				res_evaluation_income_approach_id: incomeId,
			});
			const zonings = await this.zoningStore.findAll({
				res_evaluation_id: data.id,
			});
			// Remove incomeSource entries whose zoning_id is not in zonings
			const zoningIds = zonings.map((z: any) => z.dataValues?.id ?? z.id);
			const toRemove = incomeSource.filter(
				(src) => src.res_zoning_id && !zoningIds.includes(src.res_zoning_id),
			);
			for (const src of toRemove) {
				await this.resEvaluationIncomeSourcesStore.removeOne(src?.id);
			}
			const zoningsNotInIncomeSource: any = zonings.filter((zoning: any) => {
				// Check if the zoning id is not present in any incomeSource's zoning_id
				return !incomeSource.some((income) => income.res_zoning_id === zoning.dataValues.id);
			});
			if (zoningsNotInIncomeSource) {
				for (const source of zoningsNotInIncomeSource) {
					const zoningData = source.dataValues;
					const attributes = {
						res_evaluation_income_approach_id: incomeId,
						res_zoning_id: zoningData.id,
						type: zoningData.sub_zone,
						space: zoningData.sub_zone,
						sf_source: zoningData.total_sq_ft,
						square_feet: zoningData.total_sq_ft,
						comments: zoningData.zone,
						monthly_income: 0,
						annual_income: 0,
						rent_sq_ft: 0,
						link_overview: 1,
					};
					await this.resEvaluationIncomeSourcesStore.create(attributes);
				}
				incomeSource = await this.resEvaluationIncomeSourcesStore.findAll({
					res_evaluation_income_approach_id: incomeId,
				});
			}

			// Initialize variables for income totals and income source data
			let monthlyIncomeTotal = 0;
			let annualIncomeTotal = 0;
			const incomeSourceData: IResIncomeSource[] = [];
			let newTotalSF = 0;
			// Loop through each income source
			for (const source of incomeSource) {
				const zoneId: number = source.res_zoning_id;
				// Check if zone ID exists
				if (zoneId) {
					incomeData.total_sq_ft = 0;
					// Retrieve zone data based on zone ID
					const zoneData: IResZoning = await this.zoningStore.findByPk(zoneId);
					// Proceed if zone data exists
					if (zoneData) {
						// Determine source space and rent field based on comparison basis
						const sourceSpace: string = EvaluationsEnum.SF_SOURCE;
						const rentField: string = IncomeApproachEnum.RENT_SQ_FT;
						source.square_feet = zoneData.total_sq_ft;
						source.type = zoneData.sub_zone;
						// Set source space and rent field values based on zone data
						source[sourceSpace] = zoneData[sSpace];
						source[rentField] = source[sourceSpace]
							? source.annual_income / source[sourceSpace]
							: 0;
						// Loop through property values and update source space and comments if necessary.
						for (const propertyVal of data.res_zonings) {
							if (zoneId === propertyVal.id) {
								const zoneSpace = await helperFunction.getZoning(
									zoneData.zone,
									true,
									zoneData.sub_zone,
								);
								const zoneComments = await helperFunction.getZoning(zoneData.zone);

								// Ensure the values are of type string
								source.space =
									typeof zoneSpace === 'string' ? zoneSpace : JSON.stringify(zoneSpace);
								source.comments =
									typeof zoneComments === 'string' ? zoneComments : JSON.stringify(zoneComments);
							}
						}
						newTotalSF += source.square_feet || 0;
					}
				}

				// Update income totals and income source data
				monthlyIncomeTotal += source.monthly_income;
				annualIncomeTotal += source.annual_income;
				incomeSourceData.push(source);
			}
			incomeData.total_sq_ft = newTotalSF;
			// Remove income approach if there are no income source data
			if (!incomeSourceData.length) {
				this.resEvaluationIncomeStore.remove({ id: incomeId });
			}
			// Calculate vacancy amount
			const vacancyAmount = incomeData.vacancy ? (annualIncomeTotal * incomeData.vacancy) / 100 : 0;
			const adjustedGrossAmount = annualIncomeTotal - vacancyAmount;
			// Retrieve operating expenses based on the income approach ID
			const operatingExpense = await this.resEvalOperatingExpensesStorage.findAll({
				res_evaluation_income_approach_id: incomeId,
			});
			// Update income data with calculated totals and amounts
			incomeData.total_monthly_income = monthlyIncomeTotal;
			incomeData.total_annual_income = annualIncomeTotal;
			// Initialize variables for operating expenses
			let oePerSquareFeetTotal = 0;
			let oePerSquareFeet = 0;
			let oeGross = 0;
			const operatingExpenseData: IResOperatingExpense[] = [];
			// Loop through each operating expense
			for (const source of operatingExpense) {
				const annualAmount = source.annual_amount;
				if (annualAmount) {
					// Calculate comparison expense based on land size
					const comparisonExpense = IncomeApproachEnum.TOTAL_PER + '_' + sSpace;
					source[comparisonExpense] = landSize
						? parseFloat((annualAmount / landSize).toFixed(2))
						: 0;
					source.total_per_sq_ft = data.building_size
						? parseFloat((annualAmount / data.building_size).toFixed(2))
						: 0;
					oePerSquareFeetTotal += source.total_per_sq_ft;
					oePerSquareFeet += source[comparisonExpense];
					// Calculate percentage of gross
					source.percentage_of_gross = adjustedGrossAmount
						? parseFloat(((annualAmount / adjustedGrossAmount) * 100).toFixed(2))
						: 0;
					oeGross += source.percentage_of_gross;
				}
				operatingExpenseData.push(source);
			}

			incomeData.total_rent_sq_ft = landSize ? incomeData.total_annual_income / landSize : 0;

			incomeData.total_sq_ft = landSize;

			incomeData.total_oe_per_square_feet = oePerSquareFeet;
			if (data.comp_type && data.comp_type != EvaluationsEnum.LAND_ONLY) {
				incomeData.total_oe_per_square_feet = oePerSquareFeetTotal;
			}
			incomeData.total_oe_gross = oeGross;
			// Calculate and update additional income data based on specified conditions
			// (e.g., monthly and annual capitalization rates, indicated ranges)
			if (incomeData.monthly_capitalization_rate) {
				incomeData.total_net_income =
					adjustedGrossAmount +
					(incomeData?.other_total_annual_income || 0) -
					incomeData.total_oe_annual_amount;
			}

			if (incomeData.monthly_capitalization_rate && incomeData.total_net_income) {
				const monthlyCapitalizationRate = incomeData.monthly_capitalization_rate;
				const annualCapitalizationRate = incomeData.annual_capitalization_rate;
				const sqFtCapitalizationRate = incomeData.sq_ft_capitalization_rate;

				incomeData.indicated_range_monthly = monthlyCapitalizationRate
					? incomeData.total_net_income / (monthlyCapitalizationRate / 100)
					: 0;
				incomeData.indicated_range_annual = annualCapitalizationRate
					? incomeData.total_net_income / (annualCapitalizationRate / 100)
					: 0;

				const comparisonRange = IncomeApproachEnum.INDICATED_RANGE_SQ_FT;
				incomeData[comparisonRange] = sqFtCapitalizationRate
					? incomeData.total_net_income / (sqFtCapitalizationRate / 100)
					: 0;
			}

			const comparisonRange = IncomeApproachEnum.INDICATED_RANGE_SQ_FT;
			const monthly = incomeData.indicated_range_monthly || 0;
			const annual = incomeData.indicated_range_annual || 0;
			const sqFeet = incomeData[comparisonRange] || 0;

			let monthlyPsf = 0;
			let annualPsf = 0;
			let sqFeetPsf = 0;

			if (landSize) {
				monthlyPsf = monthly / landSize;
				annualPsf = annual / landSize;
				sqFeetPsf = sqFeet / landSize;
			}
			const incrementalValue = incomeData.indicated_range_annual
				? incomeData.indicated_range_annual * incomeData.eval_weight
				: 0;

			const incomeDataUpdate = {
				indicated_psf_monthly: monthlyPsf || null,
				indicated_psf_annual: annualPsf || null,
				indicated_psf_sq_feet: sqFeetPsf || null,
				total_monthly_income: incomeData.total_monthly_income || null,
				total_annual_income: incomeData.total_annual_income || null,
				total_oe_annual_amount: incomeData.total_oe_annual_amount || null,
				total_oe_gross: incomeData.total_oe_gross || null,
				total_sq_ft: incomeData.total_sq_ft || null,
				total_rent_sq_ft: incomeData.total_rent_sq_ft || null,
				total_oe_per_square_feet: incomeData.total_oe_per_square_feet || null,
				vacant_amount: vacancyAmount ? -vacancyAmount : 0,
				adjusted_gross_amount: adjustedGrossAmount,
				monthly_capitalization_rate: incomeData.monthly_capitalization_rate || null,
				annual_capitalization_rate: incomeData.annual_capitalization_rate || null,
				sq_ft_capitalization_rate: incomeData.sq_ft_capitalization_rate || null,
				total_net_income: incomeData.total_net_income || null,
				indicated_range_monthly: incomeData.indicated_range_monthly || null,
				indicated_range_annual: incomeData.indicated_range_annual || null,
				indicated_range_sq_feet: incomeData.indicated_range_sq_feet || null,
				id: income.id,
				incremental_value: incrementalValue,
			};
			// Update income data in the database
			await this.resEvaluationIncomeStore.updateIncomeApproach(incomeDataUpdate);
			// Handle income sources and operating expenses
			if (incomeSourceData) {
				await this.handleIncomeSourcesOrOperatingExpenses({
					incomeSources: incomeSourceData,
					evaluationIncomeApproachId: income.id,
				});
			}
			if (operatingExpenseData) {
				await this.handleIncomeSourcesOrOperatingExpenses({
					operatingExpenses: operatingExpenseData,
					evaluationIncomeApproachId: income.id,
				});
			}
			await this.calculateWeightedMarketValue(scenarioId, income.eval_weight);
			return true;
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	};

	/**
	 * @description Function to calculate sale approach
	 * @param saleAttributes
	 */
	public setSalesPsfValues = async (saleAttributes): Promise<boolean> => {
		try {
			const { data, sale } = saleAttributes;
			// Fetch the sales approach data for the given appraisal ID
			const saleData: ISalesApproachesRequest =
				await this.resEvaluationSaleApproachStore.findByAttribute({
					id: sale.id,
				});
			// Fetch all zoning data for the given appraisal ID
			const zoningData: IResZoning[] = await this.zoningStore.findAll({
				res_evaluation_id: data.id,
			});
			// Get the land size for the given data
			const landSize = data.building_size; // Define this function as per your logic
			// Initialize variables to store sales approach value and total comp adjustment
			let salesApproachValue = 0;
			let totalCompAdj = 0;
			// Check if averaged adjusted PSF is available in the sales data
			if (saleData?.averaged_adjusted_psf) {
				// Parse the averaged adjusted PSF to a float with 2 decimal places
				const averagedAdjustedPsf = parseFloat(saleData.averaged_adjusted_psf.toFixed(2));

				// Reset sales approach value
				salesApproachValue = 0;
				// Iterate over each zoning data and calculate the total sales adjustment value
				for (const values of zoningData) {
					salesApproachValue += await this.getTotalSalesAdjVal(
						averagedAdjustedPsf,
						values.total_sq_ft,
						values.weight_sf,
					);
				}
				// Calculate total comp adjustment based on land size
				totalCompAdj = landSize ? averagedAdjustedPsf * landSize : 0;
			}
			const incrementalValue = salesApproachValue ? salesApproachValue * saleData.eval_weight : 0;
			// Prepare the sales approach data to be updated
			const saleApproachData = {
				id: sale.id,
				sales_approach_value: salesApproachValue,
				total_comp_adj: totalCompAdj,
				incremental_value: incrementalValue,
			};
			// Update the sales approach data in the store
			await this.resEvaluationSaleApproachStore.updateSalesApproach(saleApproachData);
			await this.calculateWeightedMarketValue(
				saleData.res_evaluation_scenario_id,
				saleData.eval_weight,
			);
			return true;
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	};

	/**
	 * @description Function to calculate cost approaches.
	 * @param costAttributes
	 * @returns
	 */
	public setCostPsfValues = async (costAttributes): Promise<boolean> => {
		try {
			const { data, cost } = costAttributes;
			// Fetch the appraisal cost approach record by cost ID
			const costApproach = await this.resEvaluationCostApproachStore.findByAttribute({
				id: cost.id,
			});
			// Initialize variables
			const landSize = data.land_size || 0;
			let totalCostValuation = 0,
				landValue = 0,
				indicatedValuePsf = 0;
			// Calculate land value if averaged adjusted PSF is available
			if (costApproach && costApproach.averaged_adjusted_psf) {
				const averagedAdjustedPsf = costApproach.averaged_adjusted_psf;
				landValue = parseFloat((averagedAdjustedPsf * landSize).toFixed(2));
			}
			// Initialize improvement-related variables from the appraisal cost approach
			let improvementsTotalSfArea = costApproach.improvements_total_sf_area || 0;
			let improvementsTotalAdjustedCost = costApproach.improvements_total_adjusted_cost || 0;

			let overallReplacementCost = 0,
				totalDepreciation = 0;
			const newImprovements: Partial<ICostImprovements>[] = [];
			// Fetch all improvements related to the current appraisal cost approach
			let improvements: ICostImprovements[] = await this.resEvaluationCostImprovementStore.findAll({
				res_evaluation_cost_approach_id: costApproach.id,
			});
			const zonings = await this.zoningStore.findAll({
				res_evaluation_id: data.id,
			});
			// Remove incomeSource entries whose zoning_id is not in zonings
			const zoningIds = zonings.map((z: any) => z.dataValues?.id ?? z.id);
			const toRemove = improvements.filter(
				(src) => src.zoning_id && !zoningIds.includes(src.zoning_id),
			);
			for (const src of toRemove) {
				await this.resEvaluationCostImprovementStore.delete({ id: src?.id });
			}
			const zoningsNotInImprovements: any = zonings.filter((zoning: any) => {
				// Check if the zoning id is not present in any improvements's zoning_id
				return !improvements.some((improvement) => improvement.zoning_id === zoning.dataValues.id);
			});
			if (zoningsNotInImprovements) {
				for (const source of zoningsNotInImprovements) {
					const zoningData = source.dataValues;
					const attributes = {
						res_evaluation_cost_approach_id: costApproach.id,
						zoning_id: zoningData.id,
						type: zoningData.sub_zone,
						sf_area: zoningData.sq_ft,
					};
					await this.resEvaluationCostImprovementStore.create(attributes);
				}
				improvements = await this.resEvaluationCostImprovementStore.findAll({
					res_evaluation_cost_approach_id: costApproach.id,
				});
			}
			// Process each improvement if there are any
			if (improvements.length > 0) {
				improvementsTotalSfArea = 0;
				improvementsTotalAdjustedCost = 0;
				for (const imp of improvements) {
					if (imp.zoning_id) {
						// Fetch the zoning information and calculate structure costs
						const sfArea = await this.zoningStore.findByPk(imp.zoning_id);
						imp.type = sfArea?.sub_zone;
						imp.sf_area = sfArea?.total_sq_ft || data.building_size;
						imp.structure_cost = parseFloat((imp.sf_area * imp.adjusted_psf).toFixed(2));
						imp.depreciation_amount = parseFloat(
							(imp.structure_cost * (imp.depreciation / 100)).toFixed(2),
						);
						imp.adjusted_cost = imp.structure_cost - imp.depreciation_amount;
					}
					// Accumulate totals
					overallReplacementCost += imp.structure_cost;
					totalDepreciation += imp.depreciation_amount;
					improvementsTotalSfArea += imp.sf_area;
					improvementsTotalAdjustedCost += imp.adjusted_cost;
					newImprovements.push(imp);
				}
				// Save the updated improvements data
				this.resEvaluationCostImprovementStore.bulkCreate(newImprovements);
				// Calculate total cost valuation and indicated value per square foot
				totalCostValuation = landValue + improvementsTotalAdjustedCost;
				indicatedValuePsf = totalCostValuation / improvementsTotalSfArea;
			} else {
				// If no improvements, calculate indicated value per square foot based on land value only
				totalCostValuation = landValue;
				const buildingSize = data.building_size;
				indicatedValuePsf = buildingSize ? totalCostValuation / buildingSize : 0;
			}
			const incrementalValue = totalCostValuation
				? totalCostValuation * costApproach.eval_weight
				: 0;
			// Prepare the data to be updated in the cost approach record
			const costData = {
				land_value: landValue,
				overall_replacement_cost: overallReplacementCost,
				total_depreciation: totalDepreciation,
				incremental_value: incrementalValue, // Assuming this is calculated somewhere else
				total_cost_valuation: totalCostValuation,
				indicated_value_psf: indicatedValuePsf,
				total_depreciated_cost: improvementsTotalAdjustedCost,
				improvements_total_sf_area: improvementsTotalSfArea,
				improvements_total_adjusted_cost: improvementsTotalAdjustedCost,
				id: cost.id,
			};
			// Update the appraisal cost approach with the new data
			const updatedCostApproach =
				await this.resEvaluationCostApproachStore.updateCostApproach(costData);
			await this.calculateWeightedMarketValue(
				costApproach.res_evaluation_scenario_id,
				costApproach.eval_weight,
			);
			if (updatedCostApproach) {
				return true;
			} else {
				return false;
			}
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	};

	/**
	 * @description Function to get total of sales adj value.
	 * @param adj
	 * @param sf
	 * @param weight
	 * @returns
	 */
	public getTotalSalesAdjVal = async (adj: number, sf: number, weight: number): Promise<number> => {
		try {
			// Calculate the percentage value based on square feet and weight
			const percentVal = (sf * weight) / 100;
			// Calculate the adjusted value based on the percentage value and adjustment factor
			const value = adj * percentVal;
			return value;
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return 0;
		}
	};

	/**
	 * @description Function to get merge field data.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getMergeFieldData = async (
		request: IMergeFieldDataRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<object>; // Here keys of this object are dynamic.
		try {
			const { role, account_id, id } = request.user;

			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const evaluationId = request?.body?.evaluation_id;
			if (!evaluationId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.INVALID_EVALUATION_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attribute = { id: evaluationId, account_id: account_id, user_id: id };
			// Role-wise permissions
			if (role === RoleEnum.ADMINISTRATOR) {
				delete attribute?.user_id;
			} else if (role === RoleEnum.USER) {
				delete attribute?.account_id;
			} else if (role === RoleEnum.SUPER_ADMINISTRATOR) {
				delete attribute?.user_id;
				delete attribute?.account_id;
			}
			const { user_id, ...restAttributes } = attribute;
			let attributesWithOr;
			if (role === RoleEnum.USER) {
				attributesWithOr = {
					...restAttributes,
					[Op.or]: [
						{ user_id: id },
						{ reviewed_by: id },
					],
				};
			} else {
				attributesWithOr = { ...restAttributes };
			}
			// Fetching evaluation data by id
			const evaluationInfo = await this.resEvaluationStorage.getResEvaluation(attributesWithOr);
			if (!evaluationInfo) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Requested merge field tags
			const mergeFields = request?.body?.merge_fields;
			const fieldsData = await this.iterateMergeFieldsData(mergeFields, evaluationInfo);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: MergeFieldEnum.MERGE_FIELD_DATA,
				data: fieldsData,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to get merge fields data.
	 * @param mergeFields
	 * @param evaluationInfo
	 * @returns
	 */
	public iterateMergeFieldsData = async (mergeFields: any, evaluationInfo: IEvaluation) => {
		try {
			const fieldsData = {};

			// Process array of fields
			if (mergeFields && Array.isArray(mergeFields)) {
				for (const field of mergeFields) {
					fieldsData[field] = await this.processMergeField(field, evaluationInfo);
				}
				return fieldsData;
			}
			// Process single field string
			else if (mergeFields && typeof mergeFields === 'string') {
				return await this.processMergeField(mergeFields, evaluationInfo);
			}
		} catch (e) {
			return {};
		}
	};

	/**
	 * @description Function to process merge fields and return data of merge fields.
	 * @param field
	 * @param evaluationInfo
	 * @returns
	 */
	public processMergeField = async (field: string, evaluationInfo) => {
		try {
			const dateTags = [
				MergeFieldEnum.CLOSE_DATE,
				MergeFieldEnum.ANALYSIS_DATE,
				MergeFieldEnum.INSPECTION_DATE,
				MergeFieldEnum.EFFECTIVE_DATE,
				MergeFieldEnum.REPORT_DATE,
				MergeFieldEnum.LAST_SALE_DATE,
			];

			const attributes = { status: 1 };
			const codes = await this.commonStore.getGlobalCodeCategoriesByAttribute(attributes);

			const zoningCodes = codes.find((code) => code.type === CompsEnum.ZONE);
			const conditionCodes = codes.find((code) => code.type === CompsEnum.CONDITION);
			const topographyCodes = codes.find((code) => code.type === CompsEnum.TOPOGRAPHIES);
			const frontagesCodes = codes.find((code) => code.type === CompsEnum.FRONTAGES);

			const { options = [] } = zoningCodes || {};
			const conditionOptions = conditionCodes?.options || [];
			const topographyOptions = topographyCodes?.options || [];
			const frontageOptions = frontagesCodes?.options || [];

			const splitTag = await helperFunction.splitField(field);
			const fieldKey = await this.mergeFieldStore.findByAttribute({ tag: splitTag?.tag });

			let fieldValue;
			// Date Fields
			if (dateTags.includes(fieldKey?.key)) {
				return await helperFunction.formatDateToMDY(evaluationInfo?.[fieldKey?.key]);
			}
			// Client Info
			else if (fieldKey?.key?.includes(MergeFieldEnum.CLIENT)) {
				const clientKey = fieldKey.key.split('.').pop();
				return evaluationInfo?.client?.[clientKey];
			} else if (fieldKey?.key === MergeFieldEnum.NAME_OF_CLIENT) {
				const { first_name = '', last_name = '' } = evaluationInfo?.client || {};
				return `${first_name} ${last_name}`;
			}

			// Client State
			else if (fieldKey?.key === MergeFieldEnum.CLIENT_STATE) {
				const getStates = await this.commonStore.findGlobalCodeByAttribute({
					type: GlobalCodeEnums.STATES,
				});
				const stateValue = evaluationInfo?.client?.state;
				const matchState = getStates?.options?.find((obj) => obj?.code === stateValue);
				return matchState?.name || stateValue;
			} else if (
				fieldKey?.key === (MergeFieldEnum.PROPERTY_CLASS || MergeFieldEnum.PROPERTY_RIGHTS)
			) {
				fieldValue = evaluationInfo[fieldKey?.key];
				return await helperFunction.formatString(fieldValue);
			}

			// Zoning Info
			else if (fieldKey?.key?.includes(MergeFieldEnum.ZONING)) {
				const zoneKey = fieldKey.key.split('.').pop();
				let subjectZone;
				if (zoneKey === MergeFieldEnum.SQ_FT) {
					fieldValue = evaluationInfo?.zonings?.[0]?.[zoneKey];
					return await helperFunction.formatNumber(fieldValue, 0, '');
				}
				if (zoneKey === MergeFieldEnum) {
					fieldValue = evaluationInfo?.zonings?.[0]?.[zoneKey];
					return fieldValue + '%';
				}
				if (zoneKey === GlobalCodeEnums.ZONE) {
					fieldValue = evaluationInfo?.zonings?.[0]?.[zoneKey];
					subjectZone = options.find((obj) => obj?.code === fieldValue);
					return subjectZone?.name || (await helperFunction.formatString(fieldValue));
				}

				if (zoneKey === GlobalCodeEnums.SUB_ZONE) {
					fieldValue = evaluationInfo?.zonings?.[0]?.[zoneKey];
					const flatAllSubOptions = options.flatMap((option) => option.sub_options || []);
					const subjectSubZone = flatAllSubOptions.find((obj) => obj?.code === fieldValue);
					return subjectSubZone?.name || (await helperFunction.formatString(fieldValue));
				}
			} else if (
				[
					MergeFieldEnum.ASSESSMENT,
					MergeFieldEnum.LAND_IMPROVEMENT,
					MergeFieldEnum.STRUCTURE_ASSESSMENT,
					MergeFieldEnum.TAX_LIABILITY,
					MergeFieldEnum.TAXES_IN_ARREARS,
					MergeFieldEnum.PRICE_PER_SF,
				].includes(fieldKey?.key)
			) {
				fieldValue = evaluationInfo[fieldKey?.key];
				return await helperFunction.formatCurrency(fieldValue);
			}
			// Traffic Count
			else if (fieldKey?.key === MergeFieldEnum.TRAFFIC_COUNT) {
				if (evaluationInfo?.traffic_count === MergeFieldEnum.INPUT_VALUE) {
					return await helperFunction.formatNumber(evaluationInfo?.traffic_input, 0, '');
				} else {
					return evaluationInfo?.traffic_count;
				}
			}

			// State (Generic)
			else if (fieldKey?.key === MergeFieldEnum.STATE) {
				const getStates = await this.commonStore.findGlobalCodeByAttribute({
					type: GlobalCodeEnums.STATES,
				});
				const stateValue = evaluationInfo[fieldKey.key];
				const matchState = getStates?.options?.find((obj) => obj?.code === stateValue);
				return matchState?.name || stateValue;
			}

			// Condition
			else if (fieldKey?.key === MergeFieldEnum.CONDITION) {
				const conditionValue = evaluationInfo[fieldKey?.key];
				const matchCondition = conditionOptions.find((obj) => obj?.code === conditionValue);
				return matchCondition?.name || conditionValue;
			}
			//Frontage
			else if (fieldKey?.key === MergeFieldEnum.FRONTAGE) {
				const frontageValue = evaluationInfo[fieldKey?.key];
				const matchFrontage = frontageOptions.find((obj) => obj?.code === frontageValue);
				return matchFrontage?.name || frontageValue;
			}

			// Topography
			else if (fieldKey?.key === MergeFieldEnum.TOPOGRAPHY) {
				const topographyValue = evaluationInfo[fieldKey?.key];
				const matchTopography = topographyOptions.find((obj) => obj?.code === topographyValue);
				return matchTopography?.name || fieldValue;
			}

			// General Case
			else {
				fieldValue = evaluationInfo[fieldKey?.key];
				if (!(fieldKey?.key === MergeFieldEnum.ZIP_CODE) && typeof fieldValue === 'number') {
					return Number.isInteger(fieldValue)
						? await helperFunction.formatNumber(fieldValue, 0, '')
						: fieldValue;
				} else if ([MergeFieldEnum.TYPE, MergeFieldEnum.PROPERTY_RIGHTS].includes(fieldKey?.key)) {
					return await helperFunction.formatString(fieldValue);
				} else {
					return fieldValue;
				}
			}
		} catch (e) {
			return {};
		}
	};
}
