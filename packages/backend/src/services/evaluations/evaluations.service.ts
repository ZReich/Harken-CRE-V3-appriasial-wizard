import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import SendResponse from '../../utils/common/commonResponse';
import UserEnum, {
	ClientEnum,
	CommonEnum,
	CompEnum,
	EvalMessageEnum,
	FileEnum,
	PhotoPagesEnum,
} from '../../utils/enums/MessageEnum';
import HelperFunction from '../../utils/common/helper';
import * as reportHelpers from '../../utils/common/reportHelpers';
import {
	aerialMapSchema,
	evalAreaInfoSchema,
	evalCostApproachSchema,
	evalIncomeApproachesSchema,
	evaluationCombinedSchema,
	evaluationListSchema,
	evaluationPositionSchema,
	evaluationSaveScenarioSchema,
	getSelectedCompSchema,
	mapBoundarySchema,
	SaveApproachPercentSchema,
	saveAreaMapSchema,
	saveCostImprovementSchema,
	saveLeaseApproachSchema,
	SaveReviewSchema,
	saveSalesApproachSchema,
	updateExhibitPositionSchema,
	uploadImageSchema,
} from './evaluations.validations';
import {
	FileOriginEnum,
	FileStorageEnum,
	LoggerEnum,
	UploadEnum,
} from '../../utils/enums/DefaultEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import ClientStore from '../clients/client.store';
import {
	IAerialMap,
	IAreaInfo,
	IAreaMap,
	ICalculateCost,
	ICalculateIncome,
	ICalculateSale,
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
	ISaveRentRoll,
	ISaveRentRollResponse,
	ISaveReviewDetails,
	IUploadImageRequest,
} from './IEvaluationsService';
import EvaluationsStore from './evaluations.store';
import { EvaluationsEnum, IncomeApproachEnum } from '../../utils/enums/EvaluationsEnum';
import { RentRollEnums, ScreenEnums } from '../../utils/enums/CommonEnum';
import {
	IEvalPhotoPage,
	IEvalPhotoPageRequest,
	IEvalPhotoPagesSuccess,
	IEvaluationPhotoPages,
	IEvalUploadPhotosRequest,
	IEvalUrlSuccess,
} from '../evaluationPhotoPages/IEvaluationPhotoPagesService';
import { S3_BASE_URL } from '../../env';
import UploadFunction from '../../utils/common/upload';
import EvaluationPhotoPagesStorage from '../evaluationPhotoPages/evaluationPhotoPages.store';
import {
	saveEvalPhotoPagesSchema,
	uploadEvalMultiplePhotosSchema,
} from '../evaluationPhotoPages/evaluationPhotoPages.validations';
import { IUploadURLSuccessData, IUploadSuccess } from '../uploadFiles/IUploadService';
import sharp from 'sharp';
import {
	IEvaluationFilesData,
	IFilesPosition,
	IUpdateEvalPositions,
	IUpdateExhibits,
} from '../evaluationFiles/IEvaluationFilesService';
import EvaluationFilesStore from '../evaluationFiles/evaluationFiles.store';
import { IEvaluationMetaData } from '../evaluationMetaData/IEvaluationMetaDataService';
import EvaluationMetaDataStore from '../evaluationMetaData/evaluationMetaData.store';
import StatusEnum from '../../utils/enums/StatusEnum';
import EvaluationIncomeStore from '../evaluationIncomeApproach/evaluationIncome.store';
import {
	handleIncomeSourceOrOpExp,
	IEvalIncomeApproachRequest,
	IEvaluationIncomeApproach,
	IEvaluationIncomeCreateUpdateRequest,
} from '../evaluationIncomeApproach/IEvaluationIncomeApproach';
import EvaluationIncomeSourcesStore from '../evaluationIncomeSource/evaluationIncomeSource.store';
import EvaluationOtherIncomeStore from '../evaluationIncomeOtherSources/evaluationIncomeOtherSource.store';
import EvalOperatingExpensesStorage from '../evaluationOperatingExpenses/evaluationOperatingExpense.store';
import CompsStore from '../comps/comps.store';
import { IComp } from '../comps/ICompsService';
import {
	EvalSalesApproachRequest,
	GetSalesApproachRequest,
	IComparativeListSuccess,
	IEvalSalesApproach,
	ISalesApproachesRequest,
} from '../evaluationSaleApproach/IEvaluationSalesService';
import EvaluationSalesStore from '../evaluationSaleApproach/evaluationSales.store';
import { ISaleComparisonAttributes } from '../evaluationSaleCompareAttributes/IEvaluationSaleCompareAttributes';
import EvaluationSalesSubAdjStorage from '../evaluationSalesApproachSubjectAdj/evaluationSalesSubjectAdj.store';
import EvaluationSalesCompsStorage from '../evaluationSalesApproachComps/evaluationSalesApproachComps.store';
import EvaluationSalesCompAdjStorage from '../evaluationSaleCompAdj/evaluationSalesCompAdj.store';
import EvaluationSalesCompQualitativeAdjStore from '../evaluationSaleCompsQualitativeAdj/evaluationSaleCompQualitativeAdj.store';
import EvaluationSaleComparisonStore from '../evaluationSaleCompareAttributes/evaluationSaleCompareAttributes.store';
import EvaluationSaleSubQualitativeAdjStore from '../evaluationSaleQualitativeSubAdj/evaluationSaleQualitativeAdj.store';
import { SalesSubAdjustments } from '../evaluationSalesApproachSubjectAdj/IEvaluationSalesApproachSubAdj';
import { ISaleSubQualitativeAdj } from '../evaluationSaleQualitativeSubAdj/IEvaluationSaleQualitativeAdj';
import { ISalesComp } from '../evaluationSalesApproachComps/IEvaluationSalesApproachComps';
import { ISalesCompsAdjustments } from '../evaluationSaleCompAdj/IEvaluationSalesCompAdj';
import { ISaleCompsQualitativeAdj } from '../evaluationSaleCompsQualitativeAdj/IEvaluationSaleCompQualitativeAdj';
import ZoningStore from '../zonings/zoning.store';
import {
	GetCostApproachRequest,
	ICostApproach,
	ISaveCostApproachRequest,
	ISaveCostImprovements,
} from '../evaluationCostApproach/IEvaluationCostApproach';
import EvaluationCostApproachStore from '../evaluationCostApproach/evaluationCostApproach.store';
import { ICostSubPropertyAdj } from '../evaluationCostApproachSubAdj/IEvaluationCostApproachSubAdj';
import EvaluationCostSubAdjStorage from '../evaluationCostApproachSubAdj/evaluationCostApproachSubAdj.store';
import { ICostComp } from '../evalCostApproachComps/IEvaluationCostApproachComps';
import EvaluationCostCompsStorage from '../evalCostApproachComps/evaluationCostApproachComps.store';
import EvaluationCostCompAdjStorage from '../evaluationCostApproachCompAdj/evaluationCostApproachCompAdj.store';
import { ICostCompsAdjustment } from '../evaluationCostApproachCompAdj/IEvaluationCostApproachCompAdj';
import { ICostImprovements } from '../evaluationCostApproachImprovements/IEvaluationCostApproachImprovements';
import EvaluationCostImprovementStorage from '../evaluationCostApproachImprovements/evaluationCostImprovements.store';
import {
	GetLeaseApproachRequest,
	ILeaseApproach,
	SaveLeaseApproachRequest,
} from '../evaluationLeaseApproach/IEvaluationLeaseService';
import EvaluationLeaseStore from '../evaluationLeaseApproach/evaluationLease.store';
import EvaluationLeaseSubAdjStorage from '../evaluationLeaseApproachSubAdj/evaluationLeaseSubAdj.store';
import EvaluationLeaseCompsStorage from '../evaluationLeaseApproachComps/evaluationLeaseApproachComps.store';
import EvaluationLeaseCompAdjStorage from '../evaluationLeaseCompAdjustments/evaluationLeaseCompAdj.store';
import EvaluationLeaseSubQualitativeAdjStore from '../evaluationLeaseQualitativeSubAdj/evaluationLeaseQualitativeAdj.store';
import EvaluationLeaseCompQualitativeAdjStore from '../evaluationLeaseCompsQualitativeAdj/evaluationLeaseCompQualitativeAdj.store';
import { ILeaseSubQualitativeAdj } from '../evaluationLeaseQualitativeSubAdj/IEvaluationLeaseQualitativeAdj';
import { ILeaseComp } from '../evaluationLeaseApproachComps/IEvaluationLeaseApproachComps';
import { ILeaseCompsAdjustments } from '../evaluationLeaseCompAdjustments/IEvaluationLeaseCompAdj';
import { ILeaseCompsQualitativeAdj } from '../evaluationLeaseCompsQualitativeAdj/IEvaluationLeaseCompQualitativeAdj';
import { saveRentRollSchema } from '../evaluationRentRolls/rentRolls.validations';
import EvaluationRentRollsStore from '../evaluationRentRolls/rentRolls.store';
import EvaluationRentRollTypeStore from '../evaluationRentRollType/evaluationRentRollType.store';
import {
	GetCapApproachRequest,
	ICapApproach,
	SaveCapApproachRequest,
} from '../evaluationCapApproach/IEvaluationCapApproach';
import { capApproachSaveSchema } from '../evaluationCapApproach/capApproach.validations';
import EvaluationCapApproachStore from '../evaluationCapApproach/evaluationCapApproach.store';
import EvaluationCapCompsStorage from '../evaluationCapComps/evaluationCapApproachComps.store';
import EvaluationMultiFamilyStore from '../evaluationMultiFamilyApproach/evaluationMultiFamily.store';
import {
	GetMultiFamilyRequest,
	IMultiFamilyApproach,
	ISaveMultiFamilyRequest,
} from '../evaluationMultiFamilyApproach/IEvaluationMultiFamily';
import { saveMultiFamilyApproachSchema } from '../evaluationMultiFamilyApproach/evalMultiFamily.validations';
import EvalMultiFamilyCompsStorage from '../evalMultiFamilyComps/evaluationMultiFamilyComps.store';
import { IMultiFamilyComp } from '../evalMultiFamilyComps/IEvaluationMultiFamilyComps';
import EvalMultiFamilyCompAdjStorage from '../evaluationMultiFamilyCompAdj/evaluationMultiFamilyCompAdj.store';
import { ILeaseSubAdjustments } from '../evaluationLeaseApproachSubAdj/IEvaluationLeaseSubjectAdj';
import EvalMultiFamilySubAdjStorage from '../evaluationMultiFamilySubAdj/evaluationMultiFamilySubAdj.store';
import { IMultiFamilySubAdj } from '../evaluationMultiFamilySubAdj/IEvalMultiFamilySubjectAdj';
import { ICapComparisonAttributes } from '../evaluationCapCompareAttributes/IEvaluationCapCompareAttributes';
import EvaluationCapComparativeStore from '../evaluationCapCompareAttributes/evaluationCapCompareAttributes.store';
import { ICostComparisonAttributes } from '../evaluationCostCompareAttributes/IEvaluationCostCompareAttributes';
import EvaluationCostComparativeStore from '../evaluationCostCompareAttributes/evaluationCostCompareAttributes.store';
import EvalMultiFamilyComparativeStore from '../evaluationMultiFamilyCompareAttributes/evaluationMultiFamilyCompareAttributes.store';
import EvalLeaseComparativeStore from '../evaluationLeaseCompareAttributes/evaluationLeaseCompareAttributes.store';
import * as cheerio from 'cheerio';
import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import EvaluationScenarioStore from '../evaluationScenario/evaluationScenario.store';
import IZoning from '../../utils/interfaces/IZoning';
import { IMultiFamilyCompsAdjustment } from '../evaluationMultiFamilyCompAdj/IEvaluationMultiFamilyCompAdj';
import { IOperatingExpense } from '../evaluationOperatingExpenses/IEvaluationOperatingExpenseService';
import { IIncomeSource } from '../evaluationIncomeSource/IEvaluationIncomeSourceService';
import { ISaveWeightPercentage } from '../resEvaluations/IResEvaluationsService';
import UserStore from '../user/user.store';
import { GOOGLE_MAPS_API_KEY, BACKEND_PROXY_URL_FOR_IMAGE } from '../../env';
import CommonStore from '../common/common.store';
import { MergeFieldEnum } from '../../utils/enums/MergeFieldsEnum';
import CompsEnum from '../../utils/enums/CompsEnum';
import MergeFieldStore from '../mergeFields/mergeField.store';
import { GlobalCodeEnums } from '../../utils/enums/AppraisalsEnum';
import { v4 as uuidv4 } from 'uuid';
import { ICapComps } from '../evaluationCapComps/IEvaluationCapComps';
import { changeDateFormat } from '../../utils/common/Time';
import { Op } from 'sequelize';

const helperFunction = new HelperFunction();
const uploadFunction = new UploadFunction();
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
export default class EvaluationsService {
	private evaluationStorage = new EvaluationsStore();
	private zoningStore = new ZoningStore();
	private clientStore = new ClientStore();
	private userStore = new UserStore();
	private evaluationPhotoPagesStore = new EvaluationPhotoPagesStorage();
	private evaluationFilesStorage = new EvaluationFilesStore();
	private evaluationMetaDataStore = new EvaluationMetaDataStore();
	private evaluationIncomeStore = new EvaluationIncomeStore();
	private evaluationIncomeSourcesStore = new EvaluationIncomeSourcesStore();
	private evaluationOtherIncomeStore = new EvaluationOtherIncomeStore();
	private evaluationOperatingExpenseStore = new EvalOperatingExpensesStorage();
	private compStore = new CompsStore();
	private evaluationSaleApproachStore = new EvaluationSalesStore();
	private evaluationSaleSubAdjStore = new EvaluationSalesSubAdjStorage();
	private evaluationSalesCompsStore = new EvaluationSalesCompsStorage();
	private evaluationSalesCompAdjStore = new EvaluationSalesCompAdjStorage();
	private evaluationSaleSubQualitativeAdjStore = new EvaluationSaleSubQualitativeAdjStore();
	private evaluationSaleQualitativeCompAdjStore = new EvaluationSalesCompQualitativeAdjStore();
	private evaluationSaleComparisonStore = new EvaluationSaleComparisonStore();
	private evaluationCostApproachStore = new EvaluationCostApproachStore();
	private evaluationCostSubAdjStore = new EvaluationCostSubAdjStorage();
	private evaluationCostCompsStorage = new EvaluationCostCompsStorage();
	private evaluationCostCompAdjStore = new EvaluationCostCompAdjStorage();
	private evaluationCostImprovementStore = new EvaluationCostImprovementStorage();
	private evaluationLeaseApproachStore = new EvaluationLeaseStore();
	private evaluationLeaseSubAdjStore = new EvaluationLeaseSubAdjStorage();
	private evaluationLeaseCompsStore = new EvaluationLeaseCompsStorage();
	private evaluationLeaseCompAdjStore = new EvaluationLeaseCompAdjStorage();
	private evaluationLeaseSubQualitativeAdjStore = new EvaluationLeaseSubQualitativeAdjStore();
	private evaluationLeaseQualitativeCompAdjStore = new EvaluationLeaseCompQualitativeAdjStore();
	private evaluationRentRollsStore = new EvaluationRentRollsStore();
	private evaluationRentRollTypeStore = new EvaluationRentRollTypeStore();
	private evaluationCapApproachStore = new EvaluationCapApproachStore();
	private evaluationCapCompsStore = new EvaluationCapCompsStorage();
	private evaluationMultiFamilyStore = new EvaluationMultiFamilyStore();
	private evaluationMultiFamilyCompsStore = new EvalMultiFamilyCompsStorage();
	private evaluationMultiFamilyCompAdjStore = new EvalMultiFamilyCompAdjStorage();
	private evaluationMultiFamilySubAdjStore = new EvalMultiFamilySubAdjStorage();
	private evaluationCapComparativeStore = new EvaluationCapComparativeStore();
	private evaluationCostComparativeStore = new EvaluationCostComparativeStore();
	private evalMultiFamilyComparativeStore = new EvalMultiFamilyComparativeStore();
	private evaluationLeaseComparativeStore = new EvalLeaseComparativeStore();
	private evaluationScenarioStore = new EvaluationScenarioStore();
	private commonStore = new CommonStore();
	private mergeFieldStore = new MergeFieldStore();

	constructor() {}

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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			if (!evaluationData.evaluation_included_utilities) {
				evaluationData.evaluation_included_utilities = [];
			}

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
			helperFunction.handleCustomField(EvaluationsEnum.LAND_TYPE, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.MOST_LIKELY_OWNER_USER, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.TOPOGRAPHY, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.LOT_SHAPE, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.FRONTAGE, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.UTILITIES_SELECT, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.CONDITION, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.PROPERTY_CLASS, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.MAIN_STRUCTURE_BASE, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.FOUNDATION, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.PARKING, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.BASEMENT, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.ADA_COMPLIANCE, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.EXTERIOR, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.ROOF, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.ELECTRICAL, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.PLUMBING, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.HEATING_COOLING, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.WINDOWS, evaluationData);
			helperFunction.handleCustomField(EvaluationsEnum.PROPERTY_RIGHTS, evaluationData);

			evaluationData.id = evaluationId;
			const attributes: IEvaluationsUpdateRequest = {
				...evaluationData,
			};
			const evaluation = await this.evaluationStorage.updateOverview(attributes);
			await this.updateApproaches(attributes, findEvaluation?.comp_type);
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
					fileName: `evaluations/${evaluationId}/map_image_url-${uuidv4()}.png`,
				},
				{
					url: map_image_for_report_url,
					existingKey: findEvaluation?.map_image_for_report_url,
					field: 'map_image_for_report_url',
					fileName: `evaluations/${evaluationId}/map_image_for_report_url-${uuidv4()}.png`,
				},
			];

			for (const { url, existingKey, fileName, field } of uploads) {
				const uploadedUrl = await uploadFunction.uploadMapBoundary(url, existingKey, fileName);
				restAttributes[field] = uploadedUrl;
			}

			//Attempt to update the evaluation
			const mapBoundary = await this.evaluationStorage.updateEvaluation(
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const aerialMap = await this.evaluationStorage.updateEvaluation(attributes, evaluationId);
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
			const evaluationInfo = await this.evaluationStorage.getEvaluation(attributesWithOr);
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
	 * @description Function to delete evaluation by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public deleteEvaluation = async (
		request: IEvaluationRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const evaluationId = parseInt(request.params.id);
			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const deletedEvaluation = await this.evaluationStorage.deleteEvaluation({ id: evaluationId });
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
	 * @description Function to upload photo pages.
	 * @param request
	 * @param response
	 * @returns
	 */
	public uploadPhotoPages = async (
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			await this.evaluationStorage.updateEvaluation(evaluationAttributes, evaluationId);
			const dbPhotos = await this.evaluationPhotoPagesStore.findAll({
				evaluation_id: evaluationId,
			});
			const savedPhotos = [];
			for (let index = 0; index < photos.length; index++) {
				const element = photos[index];
				element.evaluation_id = evaluationId;

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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
	 * @description Function to upload multiple photos at once.
	 * @param request
	 * @param response
	 * @returns
	 */
	public uploadMultiplePhotos = async (
		request: IEvalUploadPhotosRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvalPhotoPagesSuccess<IEvalUrlSuccess[]>;
		try {
			// Validate schema
			const params = await helperFunction.validate(uploadEvalMultiplePhotosSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { type } = request.body;
			const files = request.files;
			const photoUrls = [];
			if (files) {
				for (const file of files) {
					const url = S3_BASE_URL + (await uploadFunction.addFile({ file, type }));
					photoUrls.push(url);
				}
			}
			if (photoUrls?.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: FileEnum.FILE_UPLOAD_SUCCESS,
					data: photoUrls,
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
			data = {
				statusCode: StatusCodeEnum.BAD_REQUEST,
				message: FileEnum.FILE_UPLOAD_FAIL,
			};
			return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const fileMetaData: IEvaluationMetaData = metaAttr;
			const attribute: Partial<IEvaluationFilesData> = {
				title: field,
				origin: FileOriginEnum.EVALUATION_IMAGES,
				evaluation_id: evaluationId,
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
				evaluation_id: evaluationId,
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
				EvalMessageEnum.EVALUATION_ID,
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
	 * @description Function to get list of evaluation.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getEvaluationList = async (
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
			const evaluationList = await this.evaluationStorage.getEvaluationList(attributes);
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
			const evaluationId = Number(request?.query?.evaluation_id);
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
				type: UploadEnum.EVALUATION,
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
			const allFiles = await this.evaluationFilesStorage.findFiles({ evaluation_id: evaluationId });
			if (allFiles?.length) {
				const lastElement = allFiles[allFiles?.length - 1];
				order = lastElement?.order + 1;
			}
			const fileAttributes = {
				type: mimetype,
				size,
				dir: url,
				filename: fileName,
				evaluation_id: evaluationId,
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const origin = request?.query?.origin as string;
			const findEvaluationFile = await this.evaluationFilesStorage.findFiles({
				evaluation_id: evaluationId,
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			await this.evaluationStorage.updateEvaluation(evaluationData, evaluationId);
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
	 * @description Function to save income approach screen data
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveIncomeApproachDetails = async (
		request: IEvaluationIncomeCreateUpdateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluationIncomeApproach>;
		try {
			// Validate the request body
			const params = await helperFunction.validate(evalIncomeApproachesSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { evaluation_id, evaluation_scenario_id } = request.body;

			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluation_id });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.evaluationScenarioStore.findScenario({
				id: evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (findScenarioApproaches.has_income_approach === 0) {
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
			const { weighted_market_value, ...attributes } = params.value;
			if (weighted_market_value) {
				// Updating weighted_market_value
				this.evaluationScenarioStore.updateScenario(parseInt(evaluation_scenario_id), {
					weighted_market_value,
				});
			}
			// Checking duplicate record of income approach by evaluation_scenario_id.
			const incomeApproachData = await this.evaluationIncomeStore.findByAttribute({
				evaluation_scenario_id: attributes.evaluation_scenario_id,
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
				const saveIncomeData = await this.evaluationIncomeStore.createIncomeApproach(attributes);
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
						await this.evaluationIncomeStore.updateIncomeApproach(incomeAttributes);
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
					const updatedIncomeSources = incomeSources.map((source) => ({
						...source,
						square_feet: source.sf_source,
					}));
					keepIds = await this.handleIncomeSourcesOrOperatingExpenses({
						updatedIncomeSources,
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
			const {
				updatedIncomeSources,
				operatingExpenses,
				otherIncomeSources,
				evaluationIncomeApproachId,
			} = attributes;
			const itemList = updatedIncomeSources || operatingExpenses || otherIncomeSources;
			let store;
			if (updatedIncomeSources) {
				store = this.evaluationIncomeSourcesStore;
			} else if (operatingExpenses) {
				store = this.evaluationOperatingExpenseStore;
			} else if (otherIncomeSources) {
				store = this.evaluationOtherIncomeStore;
			}
			const idKey = EvaluationsEnum.EVALUATION_INCOME_APPROACH_ID;

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
	 * @description Function to get evaluation income approach id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getIncomeApproach = async (
		request: IEvalIncomeApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IEvaluationIncomeApproach>;
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const incomeApproachData = await this.evaluationIncomeStore.findByAttribute({
				evaluation_scenario_id: evaluationScenarioId,
				evaluation_id: evaluationId,
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
				evaluation_id: evaluationId,
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
	 * @description Function to get selected comps.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSelectedComps = async (
		request: IGetSelectedCompRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IComp[]>;
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
			const comps = await this.compStore.getSelected(attributes, accountId);
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
			const { sales_approach, evaluation_id, ...attributes } = request.body;
			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluation_id });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.evaluationScenarioStore.findScenario({
				id: sales_approach.evaluation_scenario_id,
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
			await this.evaluationScenarioStore.updateScenario(
				sales_approach?.evaluation_scenario_id,
				attributes,
			);

			// Creating new records for sale approach
			if (!sales_approach.id) {
				// Checking duplicate record of sale approach by evaluation scenario id.
				const findSaleData = await this.evaluationSaleApproachStore.findOne({
					evaluation_scenario_id: sales_approach.evaluation_scenario_id,
				});
				if (findSaleData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving sales approach data in evaluation sales approaches table
				sales_approach.evaluation_id = evaluation_id;
				const saveSaleApproach =
					await this.evaluationSaleApproachStore.createSalesApproach(sales_approach);
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
				const findSalesData = await this.evaluationSaleApproachStore.findOne({
					evaluation_scenario_id: sales_approach.evaluation_scenario_id,
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
					updateSalesData = await this.evaluationSaleApproachStore.updateSalesApproach(rest);
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
			const existingSaleAttributes = await this.evaluationSaleComparisonStore.findAll({
				evaluation_sales_approach_id: saleApproachId,
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
					evaluation_sales_approach_id: saleApproachId,
					comparison_key: adjustment!.comparison_key,
					comparison_value: adjustment!.comparison_value,
					order: adjustment!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				evaluation_sales_approach_id: saleApproachId,
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
							evaluation_sales_approach_id: saleApproachId,
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
				...attributesToAdd.map((item) => this.evaluationSaleComparisonStore.create(item)),
				...attributesToDelete.map((item) => this.evaluationSaleComparisonStore.delete(item)),
				...attributesToUpdate.map((item) => this.evaluationSaleComparisonStore.update(item)),
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
			// Filter out adjustments with empty adj_key
			const validAdjustments = newAdjustments.filter(
				(adj) => adj.adj_key && adj.adj_key.trim() !== '',
			);
			// Fetch existing adjustments
			const existingAdjustments = await this.evaluationSaleSubAdjStore.findAdjustments({
				evaluation_sales_approach_id: saleApproachId,
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
					evaluation_sales_approach_id: saleApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_sales_approach_id: saleApproachId,
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
							evaluation_sales_approach_id: saleApproachId,
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
				...adjustmentsToAdd.map((adj) => this.evaluationSaleSubAdjStore.createAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.evaluationSaleSubAdjStore.removeAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.evaluationSaleSubAdjStore.updateAdjustments(adj)),
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
				(adj) => adj?.adj_key && adj?.adj_key.trim() !== '',
			);
			// Fetch existing adjustments
			const existingAdjustments = await this.evaluationSaleSubQualitativeAdjStore.findAdjustments({
				evaluation_sales_approach_id: saleApproachId,
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
					evaluation_sales_approach_id: saleApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
					subject_property_value: adjustment!.subject_property_value,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_sales_approach_id: saleApproachId,
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
							evaluation_sales_approach_id: saleApproachId,
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
					this.evaluationSaleSubQualitativeAdjStore.createAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationSaleSubQualitativeAdjStore.removeAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationSaleSubQualitativeAdjStore.updateAdjustments(adj),
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
			const existingComps = await this.evaluationSalesCompsStore.findSalesComps({
				evaluation_sales_approach_id: salesApproachId,
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
				const createdComp = await this.evaluationSalesCompsStore.createSalesComps({
					...comp,
					evaluation_sales_approach_id: salesApproachId,
				});
				await this.syncSalesCompAdjustments(createdComp.id, comp.comps_adjustments);
				await this.syncSalesCompQualitativeAdj(createdComp.id, comp.comps_qualitative_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.evaluationSalesCompsStore.updateSalesComps(comp);
				await this.syncSalesCompAdjustments(comp.id, comp.comps_adjustments);
				await this.syncSalesCompQualitativeAdj(comp.id, comp.comps_qualitative_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.evaluationSalesCompAdjStore.removeAdjustments({
					eval_sales_approach_comp_id: id,
				});
				await this.evaluationSalesCompsStore.removeSalesComps({ id });
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
	public async syncSalesCompAdjustments(compId: number, newAdjustments: ISalesCompsAdjustments[]) {
		try {
			// Fetch existing comps adjustments
			const existingAdjustments = await this.evaluationSalesCompAdjStore.findAdjustments({
				eval_sales_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				eval_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				eval_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				eval_sales_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.evaluationSalesCompAdjStore.createAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationSalesCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationSalesCompAdjStore.removeAdjustments(adj),
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
			const existingAdjustments = await this.evaluationSaleQualitativeCompAdjStore.findAdjustments({
				evaluation_sales_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				evaluation_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				evaluation_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_sales_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) =>
					this.evaluationSaleQualitativeCompAdjStore.createAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationSaleQualitativeCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationSaleQualitativeCompAdjStore.removeAdjustments(adj),
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
			const findEvaluation = await this.evaluationStorage.findValidEvaluation(evaluationId);
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
			const salesApproachData = await this.evaluationSaleApproachStore.findByAttribute({
				evaluation_scenario_id: evaluationScenarioId,
				evaluation_id: evaluationId,
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
	 * @description Get list of sale Comparative Attributes
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
				await this.evaluationStorage.getComparativeAttributes(attributes);
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
	 * @description Function to update area map info in evaluation sale approaches.
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
					store: this.evaluationSaleApproachStore,
					update: 'updateSalesApproach',
				},
				[EvaluationsEnum.COST_AREA_MAP]: {
					store: this.evaluationCostApproachStore,
					update: 'updateCostApproach',
				},
				[EvaluationsEnum.LEASE_AREA_MAP]: {
					store: this.evaluationLeaseApproachStore,
					update: 'updateLeaseApproach',
				},
				[EvaluationsEnum.CAP_AREA_MAP]: {
					store: this.evaluationCapApproachStore,
					update: 'updateCapApproach',
				},
				[EvaluationsEnum.MULTI_FAMILY_AREA_MAP]: {
					store: this.evaluationMultiFamilyStore,
					update: 'update',
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
			const { cost_approach, evaluation_id, ...attributes } = request.body;
			const { id, evaluation_scenario_id } = cost_approach;
			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({
				id: evaluation_id,
			});
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.evaluationScenarioStore.findScenario({
				id: cost_approach.evaluation_scenario_id,
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
				this.evaluationScenarioStore.updateScenario(
					cost_approach?.evaluation_scenario_id,
					attributes,
				);
			}
			// Checking duplicate record of cost approach by evaluation approach id.
			const findCostData = await this.evaluationCostApproachStore.findByAttribute({
				evaluation_scenario_id,
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
				cost_approach.evaluation_id = evaluation_id;
				const saveCostApproach =
					await this.evaluationCostApproachStore.createCostApproach(cost_approach);
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
					updateCostData = await this.evaluationCostApproachStore.updateCostApproach(rest);
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
			const existingAdjustments = await this.evaluationCostSubAdjStore.findAdjustments({
				evaluation_cost_approach_id: costApproachId,
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
					evaluation_cost_approach_id: costApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_cost_approach_id: costApproachId,
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
							evaluation_cost_approach_id: costApproachId,
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
				...adjustmentsToAdd.map((adj) => this.evaluationCostSubAdjStore.createAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.evaluationCostSubAdjStore.removeAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.evaluationCostSubAdjStore.updateAdjustments(adj)),
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
			const existingComps = await this.evaluationCostCompsStorage.findCostComps({
				evaluation_cost_approach_id: costApproachId,
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
				const createdComp = await this.evaluationCostCompsStorage.createCostComps({
					...comp,
					evaluation_cost_approach_id: costApproachId,
				});
				await this.syncCostCompAdjustments(createdComp.id, comp.comps_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.evaluationCostCompsStorage.updateCostComps(comp);
				await this.syncCostCompAdjustments(comp.id, comp.comps_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.evaluationCostCompAdjStore.removeAdjustments({
					eval_cost_approach_comp_id: id,
				});
				await this.evaluationCostCompsStorage.removeCostComps({ id });
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
			const existingAdjustments = await this.evaluationCostCompAdjStore.findAdjustments({
				eval_cost_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				eval_cost_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				eval_cost_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				eval_cost_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.evaluationCostCompAdjStore.createAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.evaluationCostCompAdjStore.updateAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.evaluationCostCompAdjStore.removeAdjustments(adj)),
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const costApproachData = await this.evaluationCostApproachStore.findByAttribute({
				evaluation_scenario_id: evaluationScenarioId,
				evaluation_id: evaluationId,
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
				evaluation_id,
				evaluation_scenario_id,
				improvements,
				weighted_market_value,
				...attributes
			} = request.body;

			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({
				id: evaluation_id,
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
					attributes.evaluation_scenario_id = evaluation_scenario_id;
					const findData = await this.evaluationCostApproachStore.findByAttribute({
						evaluation_scenario_id,
					});
					if (!findData) {
						const saveCostApproach =
							await this.evaluationCostApproachStore.createCostApproach(attributes);
						if (!saveCostApproach) {
							data = {
								statusCode: StatusCodeEnum.BAD_REQUEST,
								message: EvalMessageEnum.COST_APPROACH_SAVE_FAIL,
							};
							return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
						}
						attributes.id = saveCostApproach?.id;
					} else {
						attributes.id = findData?.id;
					}
				}
				if (weighted_market_value) {
					// Updating weighted_market_value and position in evaluation table.
					this.evaluationScenarioStore.updateScenario(evaluation_scenario_id, {
						weighted_market_value,
					});
				}
				// Updating improvements data in evaluation cost approaches table
				const findCostApproach = await this.evaluationCostApproachStore.findByAttribute({
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
					await this.evaluationCostApproachStore.updateCostApproach(attributes);
				if (updateCostApproach === false) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.COST_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			if (improvements) {
				const updateCostImprovements = await this.syncCostApproachImprovements(
					attributes.id,
					improvements,
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
			const existingImprovements = await this.evaluationCostImprovementStore.findAll({
				evaluation_cost_approach_id: costApproachId,
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
				await this.evaluationCostImprovementStore.create({
					...improvement,
					evaluation_cost_approach_id: costApproachId,
				});
			});

			// Batch update existing improvements
			const updatePromises = improvementsToUpdate.map(async (improvement) => {
				await this.evaluationCostImprovementStore.update(improvement);
			});

			// Batch delete old improvements
			const deletePromises = improvementsToDelete.map(async (id) => {
				await this.evaluationCostImprovementStore.delete({ id });
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
	 * @description Api to check linked comps with approaches
	 * @param request
	 * @param response
	 * @returns
	 */

	public checkLinkedComps = async (
		request: IGetEvaluationRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IComp[]>;
		try {
			const { role, account_id, id } = request.user;
			const evaluationId = parseInt(request?.params?.id);
			if (!evaluationId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.INVALID_EVALUATION_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Find the evaluation by ID
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			const getEvaluationData = await this.evaluationStorage.getLinkedComps({ id: evaluationId });
			const { scenarios } = getEvaluationData;
			if (Array.isArray(scenarios) && scenarios.length > 0) {
				const hasComps = scenarios.map(
					({
						id,
						evaluation_sales_approach,
						evaluation_cost_approach,
						evaluation_lease_approach,
						evaluation_cap_approach,
						evaluation_multi_family_approach,
					}) => ({
						id,
						hasSalesComps: evaluation_sales_approach?.comp_data?.length > 0,
						hasCostComps: evaluation_cost_approach?.comps?.length > 0,
						hasLeaseComps: evaluation_lease_approach?.comps?.length > 0,
						hasCapComps: evaluation_cap_approach?.comps?.length > 0,
						hasMultiFamilyComps: evaluation_multi_family_approach?.comps?.length > 0,
					}),
				);

				const anyComps = hasComps.some(
					({ hasSalesComps, hasCostComps, hasLeaseComps, hasCapComps, hasMultiFamilyComps }) =>
						hasSalesComps || hasCostComps || hasLeaseComps || hasCapComps || hasMultiFamilyComps,
				);

				if (anyComps) {
					const data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.CAN_NOT_CHANGE_VALUE,
					};

					await helperFunction.log({
						message: data.message,
						location: await helperFunction.removeSubstring(__dirname, __filename),
						level: LoggerEnum.INFO,
						error: '',
					});

					return SendResponse(response, data, StatusCodeEnum.OK);
				}
			}

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
	 * @description Function to save and update lease approach.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveLeaseApproach = async (
		request: SaveLeaseApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ILeaseApproach>;
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
			const params = await helperFunction.validate(saveLeaseApproachSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { lease_approach, evaluation_id, ...attributes } = request.body;
			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluation_id });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario
			const findScenarioApproaches = await this.evaluationScenarioStore.findScenario({
				id: lease_approach.evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (findScenarioApproaches.has_lease_approach === 0) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Updating weighted_market_value in evaluation table.
			if (Object.keys(attributes).length > 0) {
				await this.evaluationStorage.updateEvaluation(attributes, evaluation_id);
			}

			// Creating new records for lease approach
			if (!lease_approach.id) {
				// Checking duplicate record of lease approach by evaluation approach id.
				const findLeaseData = await this.evaluationLeaseApproachStore.findOne({
					evaluation_scenario_id: lease_approach.evaluation_scenario_id,
				});
				if (findLeaseData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving lease approach data in evaluation lease approaches table
				lease_approach.evaluation_id = evaluation_id;
				const saveLeaseApproach =
					await this.evaluationLeaseApproachStore.createLeaseApproach(lease_approach);
				if (!saveLeaseApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.LEASE_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.LEASE_APPROACH_SAVED_SUCCESS,
					data: saveLeaseApproach,
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
				// Updating lease approach data
				// Validating record by id
				const findLeaseData = await this.evaluationLeaseApproachStore.findByAttribute({
					evaluation_scenario_id: lease_approach.evaluation_scenario_id,
				});
				if (!findLeaseData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.LEASE_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const {
					subject_property_adjustments,
					subject_qualitative_adjustments,
					comps,
					comparison_attributes,
					...rest
				} = lease_approach;
				let updateLeaseData: boolean;
				if (Object.keys(rest).length > 0) {
					updateLeaseData = await this.evaluationLeaseApproachStore.updateLeaseApproach(rest);
				}
				if (!updateLeaseData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.LEASE_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				// Handle comparison_attributes
				if (comparison_attributes) {
					const updatedCompareAttributes = comparison_attributes.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
					const updateComparisonItems = await this.syncLeaseComparisonItems(
						lease_approach.id,
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

				// Handle subject_property_adjustments
				if (subject_property_adjustments) {
					const updatedSubjectPropertyAdjustments = subject_property_adjustments.map(
						(item, index) => ({
							...item,
							order: index + 1, // Start order from 1 and increment by 1
						}),
					);
					const updateEvaluationSubAdj = await this.syncLeaseSubjectAdjustments(
						lease_approach.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateEvaluationSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.LEASE_APPROACH_SUB_ADJ_UPDATE_FAILED,
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
					const updateQualitativeSubAdj = await this.syncLeaseSubQualitativeAdj(
						lease_approach.id,
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
				if (comps) {
					const updateLeaseComps = await this.synchronizeLeaseComps(lease_approach.id, comps);
					if (!updateLeaseComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.LEASE_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.LEASE_APPROACH_SAVED_SUCCESS,
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
	 * @description Function to handle subject property adjustments of lease approach.
	 * @param leaseApproachId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncLeaseSubjectAdjustments(
		leaseApproachId: number,
		newAdjustments: ILeaseSubAdjustments[],
	): Promise<boolean> {
		try {
			// Filter out adjustments with empty adj_key
			const validAdjustments = newAdjustments.filter(
				(adj) => adj?.adj_key && adj?.adj_key.trim() !== '',
			);
			// Fetch existing adjustments
			const existingAdjustments = await this.evaluationLeaseSubAdjStore.findAdjustments({
				evaluation_lease_approach_id: leaseApproachId,
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
					evaluation_lease_approach_id: leaseApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_lease_approach_id: leaseApproachId,
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
							evaluation_lease_approach_id: leaseApproachId,
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
				...adjustmentsToAdd.map((adj) => this.evaluationLeaseSubAdjStore.createAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.evaluationLeaseSubAdjStore.removeAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.evaluationLeaseSubAdjStore.updateAdjustments(adj)),
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
	 * @description Function to handle lease approach subject qualitative adjustments
	 * @param leaseApproachId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncLeaseSubQualitativeAdj(
		leaseApproachId: number,
		newAdjustments: ILeaseSubQualitativeAdj[],
	): Promise<boolean> {
		try {
			// Filter out adjustments with empty adj_key
			const validAdjustments = newAdjustments.filter(
				(adj) => adj.adj_key && adj.adj_key.trim() !== '',
			);
			// Fetch existing adjustments
			const existingAdjustments = await this.evaluationLeaseSubQualitativeAdjStore.findAdjustments({
				evaluation_lease_approach_id: leaseApproachId,
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
					evaluation_lease_approach_id: leaseApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
					subject_property_value: adjustment!.subject_property_value,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_lease_approach_id: leaseApproachId,
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
							evaluation_lease_approach_id: leaseApproachId,
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
					this.evaluationLeaseSubQualitativeAdjStore.createAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationLeaseSubQualitativeAdjStore.removeAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationLeaseSubQualitativeAdjStore.updateAdjustments(adj),
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
	 * @description Function to handle comps of lease approach.
	 * @param leaseApproachId
	 * @param newComps
	 * @returns
	 */
	public async synchronizeLeaseComps(
		leaseApproachId: number,
		newComps: ILeaseComp[],
	): Promise<boolean> {
		try {
			// Fetch existing comps
			const existingComps = await this.evaluationLeaseCompsStore.findLeaseComps({
				evaluation_lease_approach_id: leaseApproachId,
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
				const createdComp = await this.evaluationLeaseCompsStore.createLeaseComps({
					...comp,
					evaluation_lease_approach_id: leaseApproachId,
				});
				await this.syncLeaseCompAdjustments(createdComp.id, comp.comps_adjustments);
				await this.syncLeaseCompQualitativeAdj(createdComp.id, comp.comps_qualitative_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.evaluationLeaseCompsStore.updateLeaseComps(comp);
				await this.syncLeaseCompAdjustments(comp.id, comp.comps_adjustments);
				await this.syncLeaseCompQualitativeAdj(comp.id, comp.comps_qualitative_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.evaluationLeaseCompAdjStore.removeAdjustments({
					eval_lease_approach_comp_id: id,
				});
				await this.evaluationLeaseCompsStore.removeLeaseComps({ id });
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
	 * @description Function to handle lease approach comps adjustments.
	 * @param compId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncLeaseCompAdjustments(compId: number, newAdjustments: ILeaseCompsAdjustments[]) {
		try {
			// Fetch existing comps adjustments
			const existingAdjustments = await this.evaluationLeaseCompAdjStore.findAdjustments({
				eval_lease_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				eval_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				eval_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				eval_lease_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.evaluationLeaseCompAdjStore.createAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationLeaseCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationLeaseCompAdjStore.removeAdjustments(adj),
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
	 * @description Function to handle lease approach comps qualitative adjustments.
	 * @param compId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncLeaseCompQualitativeAdj(
		compId: number,
		newAdjustments: ILeaseCompsQualitativeAdj[],
	) {
		try {
			// Fetch existing comps adjustments
			const existingAdjustments = await this.evaluationLeaseQualitativeCompAdjStore.findAdjustments(
				{
					evaluation_lease_approach_comp_id: compId,
				},
			);

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				evaluation_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				evaluation_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_lease_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) =>
					this.evaluationLeaseQualitativeCompAdjStore.createAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationLeaseQualitativeCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationLeaseQualitativeCompAdjStore.removeAdjustments(adj),
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
	 * @description Function to get lease approach data.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getLeaseApproach = async (
		request: GetLeaseApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ILeaseApproach>;
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
			// Validating  query params evaluation ApproachId
			if (!evaluationScenarioId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_SCENARIO_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
			// Get evaluation lease approach
			const leaseApproachData = await this.evaluationLeaseApproachStore.findByAttribute({
				evaluation_scenario_id: evaluationScenarioId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.LEASE_APPROACH_DATA,
				data: leaseApproachData,
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
	 * @description Function to save rent rolls.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveRentRoll = async (request: ISaveRentRoll, response: Response): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ISaveRentRollResponse>;
		try {
			// Validate the request body
			const params = await helperFunction.validate(saveRentRollSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attributes = params.value;
			const { rent_rolls, evaluation_id, ...rest } = attributes;
			const { evaluation_scenario_id } = rest;
			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluation_id });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
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
			// Find valid scenario
			const findScenario = await this.evaluationScenarioStore.findScenario({
				id: evaluation_scenario_id,
				evaluation_id,
			});
			if (!findScenario) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (!findScenario.has_multi_family_approach) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			let rentRollTypeData;
			const rentRollTypeId = parseInt(request?.params?.rentRollTypeid);

			if (rentRollTypeId) {
				rentRollTypeData = await this.evaluationRentRollTypeStore.find({
					id: rentRollTypeId,
					evaluation_scenario_id,
				});
				if (!rentRollTypeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}

			if (rentRollTypeId && rentRollTypeData?.type !== attributes?.type) {
				this.evaluationRentRollTypeStore.update({ id: rentRollTypeId, type: attributes?.type });
			} else if (!rentRollTypeId) {
				rentRollTypeData = await this.evaluationRentRollTypeStore.find({
					evaluation_scenario_id,
				});
				if (rentRollTypeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RENT_ROLL_TYPE_ALREADY_EXISTS,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				} else {
					rentRollTypeData = await this.evaluationRentRollTypeStore.create(rest);
				}
			}

			// Handle evaluation rent rolls add, update, delete.
			const keepIds: number[] = [];
			const idKey = RentRollEnums.EVALUATION_RENT_ROLL_TYPE_ID;
			for (const item of rent_rolls) {
				if (item?.id) {
					const foundItem = await this.evaluationRentRollsStore.find(item?.id);
					if (foundItem) {
						this.evaluationRentRollsStore.update(item);
						keepIds.push(item.id);
					}
				} else {
					item[idKey] = rentRollTypeData?.id;
					const createdItem = await this.evaluationRentRollsStore.create(item);
					keepIds.push(createdItem?.id);
				}
			}
			this.evaluationRentRollsStore.remove(keepIds, rentRollTypeData?.id);
			if (!keepIds) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.RENT_ROLL_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.RENT_ROLL_SAVED_SUCCESS,
				data: rentRollTypeData,
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
	 * @description Function to get rent rolls for specific Evaluation and specific approach id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getRentRolls = async (request: IGetRequest, response: Response): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ISaveRentRollResponse>;
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
					message: EvalMessageEnum.PLEASE_PROVIDE_MULTI_FAMILY_ID,
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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

			//get evaluation rent roll
			const evaluationRentRollData = await this.evaluationRentRollTypeStore.find({
				evaluation_scenario_id: evaluationScenarioId,
			});

			// If requested evaluation rent roll not found
			if (!evaluationRentRollData) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.RENT_ROLL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.RENT_ROLL_DATA,
				data: evaluationRentRollData,
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
	 * @description Function to save and update cap approach.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveCapApproach = async (
		request: SaveCapApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ICapApproach>;
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
			const params = await helperFunction.validate(capApproachSaveSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { cap_approach, evaluation_id, ...attributes } = request.body;
			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluation_id });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.evaluationScenarioStore.findScenario({
				id: cap_approach.evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (findScenarioApproaches.has_cap_approach === 0) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Updating weighted_market_value in evaluation table.
			if (Object.keys(attributes).length > 0) {
				await this.evaluationStorage.updateEvaluation(attributes, evaluation_id);
			}

			// Creating new records for cap approach
			if (!cap_approach?.id) {
				// Checking duplicate record of cap approach by evaluation approach id.
				const findCapData = await this.evaluationCapApproachStore.findOne({
					evaluation_scenario_id: cap_approach.evaluation_scenario_id,
				});
				if (findCapData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving cap approach data in evaluation cap approaches table
				cap_approach.evaluation_id = evaluation_id;
				const saveCapApproach = await this.evaluationCapApproachStore.create(cap_approach);
				if (!saveCapApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.CAP_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.CAP_APPROACH_SAVED_SUCCESS,
					data: saveCapApproach,
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
				// Updating cap approach data
				// Validating record by id
				const findCapData = await this.evaluationCapApproachStore.findByAttribute({
					evaluation_scenario_id: cap_approach.evaluation_scenario_id,
				});
				if (!findCapData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.CAP_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const { comps, comparison_attributes, ...rest } = cap_approach;
				let updateCapData: boolean;
				if (Object.keys(rest).length > 0) {
					updateCapData = await this.evaluationCapApproachStore.updateCapApproach(rest);
				}
				if (!updateCapData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.CAP_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Handle comparison_attributes
				if (comparison_attributes) {
					const updatedCompareAttributes = comparison_attributes.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
					const updateComparisonItems = await this.syncCapComparisonItems(
						cap_approach.id,
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
				if (comps) {
					const updateCapComps = await this.synchronizeCapComps(cap_approach.id, comps);
					if (!updateCapComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.CAP_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.CAP_APPROACH_SAVED_SUCCESS,
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
	 * @description Function to handle comps of cap approach.
	 * @param capApproachId
	 * @param newComps
	 * @returns
	 */
	public async synchronizeCapComps(capApproachId: number, newComps: ICapComps[]): Promise<boolean> {
		try {
			// Fetch existing comps
			const existingComps = await this.evaluationCapCompsStore.findCapComps({
				evaluation_cap_approach_id: capApproachId,
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
				await this.evaluationCapCompsStore.createCapComps({
					...comp,
					evaluation_cap_approach_id: capApproachId,
				});
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.evaluationCapCompsStore.updateCapComps(comp);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.evaluationCapCompsStore.removeCapComps({ id });
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
	 * @description Function to get cap approach data.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getCapApproach = async (
		request: GetCapApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<ICapApproach>;
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
			// Validating  query params evaluation ApproachId
			if (!evaluationScenarioId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_SCENARIO_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findValidEvaluation(evaluationId);
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
			// Get evaluation cap approach
			const capApproachData = await this.evaluationCapApproachStore.findByAttribute({
				evaluation_scenario_id: evaluationScenarioId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.CAP_APPROACH_DATA,
				data: capApproachData,
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
	 * @description Function to save and update multifamily approach.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveMultiFamily = async (
		request: ISaveMultiFamilyRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IMultiFamilyApproach>;
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
			const params = await helperFunction.validate(saveMultiFamilyApproachSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { multi_family_approach, evaluation_id, ...attributes } = request.body;
			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluation_id });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.evaluationScenarioStore.findScenario({
				id: multi_family_approach.evaluation_scenario_id,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (findScenarioApproaches.has_multi_family_approach === 0) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Updating weighted_market_value in evaluation table.
			if (Object.keys(attributes).length > 0) {
				await this.evaluationStorage.updateEvaluation(attributes, evaluation_id);
			}

			// Creating new records for multi-family approach
			if (!multi_family_approach.id) {
				// Checking duplicate record of multi-family approach by evaluation approach id.
				const findMultiFamilyData = await this.evaluationMultiFamilyStore.findOne({
					evaluation_scenario_id: multi_family_approach.evaluation_scenario_id,
				});
				if (findMultiFamilyData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving lease approach data in evaluation multi-family approaches table
				multi_family_approach.evaluation_id = evaluation_id;
				const saveMultiFamilyApproach =
					await this.evaluationMultiFamilyStore.create(multi_family_approach);
				if (!saveMultiFamilyApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.MULTI_FAMILY_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.MULTI_FAMILY_APPROACH_SAVED_SUCCESS,
					data: saveMultiFamilyApproach,
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
				// Updating lease approach data
				// Validating record by id
				const findMultifamilyData = await this.evaluationMultiFamilyStore.findByAttribute({
					evaluation_scenario_id: multi_family_approach.evaluation_scenario_id,
				});
				if (!findMultifamilyData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.MULTI_FAMILY_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const { subject_property_adjustments, comps, comparison_attributes, ...rest } =
					multi_family_approach;
				let updateMultiFamilyData: boolean;
				if (Object.keys(rest).length > 0) {
					updateMultiFamilyData = await this.evaluationMultiFamilyStore.update(rest);
				}
				if (!updateMultiFamilyData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: EvalMessageEnum.MULTI_FAMILY_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				// Handle subject_property_adjustments
				if (subject_property_adjustments) {
					const updatedSubjectPropertyAdjustments = subject_property_adjustments.map(
						(item, index) => ({
							...item,
							order: index + 1, // Start order from 1 and increment by 1
						}),
					);
					const updateEvaluationSubAdj = await this.syncMultiFamilySubAdjustments(
						multi_family_approach.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateEvaluationSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.MULTI_FAMILY_APPROACH_SUB_ADJ_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Handle comparison_attributes
				if (comparison_attributes) {
					const updatedCompareAttributes = comparison_attributes.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
					const updateComparisonItems = await this.syncMultiFamilyComparisonItems(
						multi_family_approach.id,
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

				if (comps) {
					const updateMultiFamilyComps = await this.synchronizeMultiFamilyComps(
						multi_family_approach.id,
						comps,
					);
					if (!updateMultiFamilyComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: EvalMessageEnum.MULTI_FAMILY_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: EvalMessageEnum.MULTI_FAMILY_APPROACH_SAVED_SUCCESS,
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
	 * @description Function to handle comps of multi-family approach.
	 * @param leaseApproachId
	 * @param newComps
	 * @returns
	 */
	public async synchronizeMultiFamilyComps(
		ApproachId: number,
		newComps: IMultiFamilyComp[],
	): Promise<boolean> {
		try {
			// Fetch existing comps
			const existingComps = await this.evaluationMultiFamilyCompsStore.find({
				evaluation_multi_family_approach_id: ApproachId,
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
				const createdComp = await this.evaluationMultiFamilyCompsStore.create({
					...comp,
					evaluation_multi_family_approach_id: ApproachId,
				});
				await this.syncMultiFamilyCompAdj(createdComp.id, comp.comps_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.evaluationMultiFamilyCompsStore.update(comp);
				await this.syncMultiFamilyCompAdj(comp.id, comp.comps_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.evaluationMultiFamilyCompsStore.remove({
					evaluation_multi_family_approach_id: id,
				});
				await this.evaluationMultiFamilyCompsStore.remove({ id });
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
	 * @description Function to handle lease approach comps adjustments.
	 * @param compId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncMultiFamilyCompAdj(
		compId: number,
		newAdjustments: IMultiFamilyCompsAdjustment[],
	) {
		try {
			// Fetch existing comps adjustments
			const existingAdjustments = await this.evaluationMultiFamilyCompAdjStore.findAdjustments({
				eval_multi_family_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				eval_multi_family_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				eval_multi_family_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				eval_multi_family_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) =>
					this.evaluationMultiFamilyCompAdjStore.createAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationMultiFamilyCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationMultiFamilyCompAdjStore.removeAdjustments(adj),
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
	 * @description Function to handle subject property adjustments of lease approach.
	 * @param ApproachId
	 * @param newAdjustments
	 * @returns
	 */
	public async syncMultiFamilySubAdjustments(
		ApproachId: number,
		newAdjustments: IMultiFamilySubAdj[],
	): Promise<boolean> {
		try {
			// Filter out adjustments with empty adj_key
			const validAdjustments = newAdjustments.filter(
				(adj) => adj?.adj_key && adj?.adj_key.trim() !== '',
			);

			// Fetch existing adjustments
			const existingAdjustments = await this.evaluationMultiFamilySubAdjStore.findAdjustments({
				evaluation_multi_family_approach_id: ApproachId,
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
					evaluation_multi_family_approach_id: ApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				evaluation_multi_family_approach_id: ApproachId,
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
							evaluation_multi_family_approach_id: ApproachId,
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
				...adjustmentsToAdd.map((adj) =>
					this.evaluationMultiFamilySubAdjStore.createAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.evaluationMultiFamilySubAdjStore.removeAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.evaluationMultiFamilySubAdjStore.updateAdjustments(adj),
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
	 * @description Function to get multi family approach data.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getMultiFamilyApproach = async (
		request: GetMultiFamilyRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IEvaluationSuccess<IMultiFamilyApproach>;
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
			// Validating  query params evaluation Scenario id
			if (!evaluationScenarioId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.PLEASE_PROVIDE_EVALUATION_SCENARIO_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
			if (!findEvaluation) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.EVALUATION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			//Validating selected approach in scenario`
			const findScenarioApproaches = await this.evaluationScenarioStore.findScenario({
				id: evaluationScenarioId,
			});
			if (!findScenarioApproaches) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: EvalMessageEnum.SCENARIO_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (findScenarioApproaches.has_multi_family_approach === 0) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: EvalMessageEnum.APPROACH_NOT_SELECTED_IN_THIS,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
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

			// Get evaluation multi-family approach
			const approachData = await this.evaluationMultiFamilyStore.findByAttribute({
				evaluation_scenario_id: evaluationScenarioId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: EvalMessageEnum.MULTI_FAMILY_APPROACH_DATA,
				data: approachData,
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
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluationId });
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
				const findApproach = await this.evaluationIncomeStore.findByAttribute({ id: approach_id });
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
					updateSuccess = await this.evaluationIncomeStore.updateIncomeApproach(attributes);
				}
			} else if (approach_type === EvaluationsEnum.SALE) {
				const findApproach = await this.evaluationSaleApproachStore.findByAttribute({
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
					updateSuccess = await this.evaluationSaleApproachStore.updateSalesApproach(attributes);
				}
			} else if (approach_type === EvaluationsEnum.COST) {
				const findApproach = await this.evaluationCostApproachStore.findByAttribute({
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
					updateSuccess = await this.evaluationCostApproachStore.updateCostApproach(attributes);
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
	 * @description Function to handle evaluation cap comparison attributes.
	 * @param capApproachId
	 * @param newComparisonItems
	 * @returns
	 */
	public async syncCapComparisonItems(
		capApproachId: number,
		newComparisonItems: ICapComparisonAttributes[],
	): Promise<boolean> {
		try {
			// Filter out items with empty comparison_key
			const validComparisonItems = newComparisonItems.filter(
				(item) => item?.comparison_key && item?.comparison_key.trim() !== '',
			);
			// Fetch existing comparison attributes
			const existingCapAttributes = await this.evaluationCapComparativeStore.findAll({
				evaluation_cap_approach_id: capApproachId,
			});

			// Create Sets for quick lookup of keys
			const existingKeys = new Set(existingCapAttributes.map((item) => item.comparison_key));
			const newKeys = new Set(validComparisonItems.map((item) => item.comparison_key));

			// Determine keys to add, delete, and update
			const keysToAdd = [...newKeys].filter((key) => !existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			const keysToUpdate = [...newKeys].filter((key) => existingKeys.has(key));

			// Prepare batches for database
			const attributesToAdd = keysToAdd.map((key) => {
				const attribute = validComparisonItems.find((item) => item.comparison_key === key);
				return {
					evaluation_cap_approach_id: capApproachId,
					comparison_key: attribute!.comparison_key,
					comparison_value: attribute!.comparison_value,
					order: attribute!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				evaluation_cap_approach_id: capApproachId,
				comparison_key: key,
			}));

			// Find adjustments to update where the `order` is different
			const attributesToUpdate = keysToUpdate
				.map((key) => {
					const newAttribute = validComparisonItems.find((item) => item.comparison_key === key);
					const existingAdjustment = existingCapAttributes.find(
						(item) => item.comparison_key === key,
					);
					if (
						newAttribute &&
						existingAdjustment &&
						newAttribute.order !== existingAdjustment.order
					) {
						return {
							evaluation_cap_approach_id: capApproachId,
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
				...attributesToAdd.map((item) => this.evaluationCapComparativeStore.create(item)),
				...attributesToDelete.map((item) => this.evaluationCapComparativeStore.delete(item)),
				...attributesToUpdate.map((item) => this.evaluationCapComparativeStore.update(item)),
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
			const existingCostAttributes = await this.evaluationCostComparativeStore.findAll({
				evaluation_cost_approach_id: costApproachId,
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
					evaluation_cost_approach_id: costApproachId,
					comparison_key: attribute!.comparison_key,
					comparison_value: attribute!.comparison_value,
					order: attribute!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				evaluation_cost_approach_id: costApproachId,
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
							evaluation_cost_approach_id: costApproachId,
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
				...attributesToAdd.map((item) => this.evaluationCostComparativeStore.create(item)),
				...attributesToDelete.map((item) => this.evaluationCostComparativeStore.delete(item)),
				...attributesToUpdate.map((item) => this.evaluationCostComparativeStore.update(item)),
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
	 * @description Function to handle evaluation multi family comparison attributes.
	 * @param MultiFamilyApproachId
	 * @param newComparisonItems
	 * @returns
	 */
	public async syncMultiFamilyComparisonItems(
		MultiFamilyApproachId: number,
		newComparisonItems: ICapComparisonAttributes[],
	): Promise<boolean> {
		try {
			// Filter out items with empty comparison_key
			const validComparisonItems = newComparisonItems.filter(
				(item) => item?.comparison_key && item?.comparison_key.trim() !== '',
			);
			// Fetch existing comparison attributes
			const existingAttributes = await this.evalMultiFamilyComparativeStore.findAll({
				evaluation_multi_family_approach_id: MultiFamilyApproachId,
			});

			// Create Sets for quick lookup of keys
			const existingKeys = new Set(existingAttributes.map((item) => item.comparison_key));
			const newKeys = new Set(validComparisonItems.map((item) => item.comparison_key));

			// Determine keys to add, delete, and update
			const keysToAdd = [...newKeys].filter((key) => !existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			const keysToUpdate = [...newKeys].filter((key) => existingKeys.has(key));

			// Prepare batches for database
			const attributesToAdd = keysToAdd.map((key) => {
				const attribute = validComparisonItems.find((item) => item.comparison_key === key);
				return {
					evaluation_multi_family_approach_id: MultiFamilyApproachId,
					comparison_key: attribute!.comparison_key,
					comparison_value: attribute!.comparison_value,
					order: attribute!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				evaluation_multi_family_approach_id: MultiFamilyApproachId,
				comparison_key: key,
			}));

			// Find adjustments to update where the `order` is different
			const attributesToUpdate = keysToUpdate
				.map((key) => {
					const newAttribute = validComparisonItems.find((item) => item.comparison_key === key);
					const existingAdjustment = existingAttributes.find((item) => item.comparison_key === key);
					if (
						newAttribute &&
						existingAdjustment &&
						newAttribute.order !== existingAdjustment.order
					) {
						return {
							evaluation_multi_family_approach_id: MultiFamilyApproachId,
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
				...attributesToAdd.map((item) => this.evalMultiFamilyComparativeStore.create(item)),
				...attributesToDelete.map((item) => this.evalMultiFamilyComparativeStore.delete(item)),
				...attributesToUpdate.map((item) => this.evalMultiFamilyComparativeStore.update(item)),
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
	 * @description Function to handle evaluation cap comparison attributes.
	 * @param capApproachId
	 * @param newComparisonItems
	 * @returns
	 */
	public async syncLeaseComparisonItems(
		leaseApproachId: number,
		newComparisonItems: ICapComparisonAttributes[],
	): Promise<boolean> {
		try {
			// Filter out items with empty comparison_key
			const validComparisonItems = newComparisonItems.filter(
				(item) => item?.comparison_key && item?.comparison_key.trim() !== '',
			);

			// Fetch existing comparison attributes
			const existingAttributes = await this.evaluationLeaseComparativeStore.findAll({
				evaluation_lease_approach_id: leaseApproachId,
			});

			// Create Sets for quick lookup of keys
			const existingKeys = new Set(existingAttributes.map((item) => item.comparison_key));
			const newKeys = new Set(validComparisonItems.map((item) => item.comparison_key));

			// Determine keys to add, delete, and update
			const keysToAdd = [...newKeys].filter((key) => !existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newKeys.has(key));
			const keysToUpdate = [...newKeys].filter((key) => existingKeys.has(key));

			// Prepare batches for database
			const attributesToAdd = keysToAdd.map((key) => {
				const attribute = validComparisonItems.find((item) => item.comparison_key === key);
				return {
					evaluation_lease_approach_id: leaseApproachId,
					comparison_key: attribute!.comparison_key,
					comparison_value: attribute!.comparison_value,
					order: attribute!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				evaluation_lease_approach_id: leaseApproachId,
				comparison_key: key,
			}));

			// Find adjustments to update where the `order` is different
			const attributesToUpdate = keysToUpdate
				.map((key) => {
					const newAttribute = validComparisonItems.find((item) => item.comparison_key === key);
					const existingAdjustment = existingAttributes.find((item) => item.comparison_key === key);
					if (
						newAttribute &&
						existingAdjustment &&
						newAttribute.order !== existingAdjustment.order
					) {
						return {
							evaluation_lease_approach_id: leaseApproachId,
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
				...attributesToAdd.map((item) => this.evaluationLeaseComparativeStore.create(item)),
				...attributesToDelete.map((item) => this.evaluationLeaseComparativeStore.delete(item)),
				...attributesToUpdate.map((item) => this.evaluationLeaseComparativeStore.update(item)),
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
			const evaluationData: IEvaluation =
				await this.evaluationStorage.findValidEvaluation(evaluationId);
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
			const evaluationData: any = await this.evaluationStorage.getEvaluationInfoForPdf({
				id,
			});
			for (let index = 0; index < evaluationData.scenarios.length; index++) {
				const scenario = evaluationData.scenarios[index];
				if (scenario.has_lease_approach) {
					// Get evaluation lease approach
					const leaseApproachData = await this.evaluationLeaseApproachStore.findByAttribute({
						evaluation_scenario_id: scenario.id,
					});
					evaluationData.scenarios[index]['evaluation_lease_approach'] = leaseApproachData;
				}

				if (scenario.has_cap_approach) {
					// Get evaluation cap approach
					const capApproachData = await this.evaluationCapApproachStore.findByAttribute({
						evaluation_scenario_id: scenario.id,
					});
					evaluationData.scenarios[index]['evaluation_cap_approach'] = capApproachData;
				}
				if (scenario.has_multi_family_approach) {
					// Get evaluation multi-family approach
					const approachData = await this.evaluationMultiFamilyStore.findByAttribute({
						evaluation_scenario_id: scenario.id,
					});
					evaluationData.scenarios[index]['evaluation_multi_family_approach'] = approachData;

					//get evaluation rent roll
					const evaluationRentRollData = await this.evaluationRentRollTypeStore.find({
						evaluation_scenario_id: scenario.id,
					});
					evaluationData.scenarios[index]['evaluation_rent_roll_approach'] = evaluationRentRollData;
				}
				if (scenario.has_sales_approach) {
					// Get evaluation sales approach
					const approachData = await this.evaluationSaleApproachStore.findByAttribute({
						evaluation_scenario_id: scenario.id,
					});
					evaluationData.scenarios[index]['evaluation_sale_approach'] = approachData;
				}
				if (scenario.has_cost_approach) {
					// Get evaluation cost approach
					const approachData = await this.evaluationCostApproachStore.findByAttribute({
						evaluation_scenario_id: scenario.id,
					});
					evaluationData.scenarios[index]['evaluation_cost_approach'] = approachData;
				}
			}
			// Fetch states name
			const getStates = await this.commonStore.findGlobalCodeByAttribute({ type: 'states' });
			const statesOptions = getStates?.options;

			//Fetch zoning type
			const zoning = await this.commonStore.findGlobalCodeByAttribute({ type: 'zone' });
			const zoningOptions = zoning?.options;

			//Fetch land type
			const landTypes = await this.commonStore.findGlobalCodeByAttribute({ type: 'land_type' });
			const landOptions = landTypes?.options;

			//Fetch condition values
			const condition = await this.commonStore.findGlobalCodeByAttribute({ type: 'condition' });
			const conditionOptions = condition?.options;

			//Fetch frontage values
			const frontage = await this.commonStore.findGlobalCodeByAttribute({ type: 'frontages' });
			const frontageOptions = frontage?.options;

			//Fetch topography values
			const topography = await this.commonStore.findGlobalCodeByAttribute({ type: 'topographies' });
			const topographyOptions = topography?.options;
			//Fetch lease_types values
			const leaseTypes = await this.commonStore.findGlobalCodeByAttribute({ type: 'lease_types' });
			const leaseTypeOptions = leaseTypes?.options;
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
				this.evaluationFilesStorage.findFilesByAttribute({ evaluation_id: id, title: 'cover' }),
				this.evaluationFilesStorage.findFilesByAttribute({
					evaluation_id: id,
					title: 'table-of-contents',
				}),
				this.evaluationFilesStorage.findFilesByAttribute({
					evaluation_id: id,
					title: 'executive-summary-details',
				}),
				this.evaluationFilesStorage.findFilesByAttribute({
					evaluation_id: id,
					title: 'property-summary-top-image',
				}),
				this.evaluationFilesStorage.findFilesByAttribute({
					evaluation_id: id,
					title: 'property-summary-bottom-image',
				}),
				this.evaluationMetaDataStore.getAreaInfo({
					evaluation_id: id,
				}),
				this.evaluationFilesStorage.findFiles({
					evaluation_id: id,
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

			const filename = 'Evaluation-' + evaluationData.business_name;
			const templateBase = path.join(process.cwd(), 'templates/report/pages');
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
				valuationsLeaseCompsComparisonPageHtml,
				valuationsCAPCompsComparisonPageHtml,
				valuationsMultifamilyCompsComparisonPageHtml,
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
				fs.promises.readFile(path.join(templateBase, 'valuationsLeaseCompsComparison.ejs'), 'utf8'),
				fs.promises.readFile(path.join(templateBase, 'valuationsCAPCompsComparison.ejs'), 'utf8'),
				fs.promises.readFile(
					path.join(templateBase, 'valuationsMultifamilyCompsComparison.ejs'),
					'utf8',
				),
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
				${ejs.render(coverPageHtml, { evaluation: evaluationData, ...reportHelpers, states: statesOptions })}
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
					...reportHelpers,
					zoneOptions: zoningOptions,
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
					landOptions: landOptions,
				})}
				${ejs.render(valuationsLeaseCompsComparisonPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					section: section3,
					chapter: chapterValuations,
					theme: data.theme,
					googleApiKey,
					...reportHelpers,
					states: statesOptions,
					conditionOptions: conditionOptions,
					topographyOptions: topographyOptions,
					leaseTypeOptions: leaseTypeOptions,
					zoneOptions: zoningOptions,
					landOptions: landOptions,
				})}
				${ejs.render(valuationsCAPCompsComparisonPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					section: section3,
					chapter: chapterValuations,
					theme: data.theme,
					googleApiKey,
					...reportHelpers,
					states: statesOptions,
					conditionOptions: conditionOptions,
					topographyOptions: topographyOptions,
					frontageOptions: frontageOptions,
					leaseTypeOptions: leaseTypeOptions,
					zoneOptions: zoningOptions,
				})}
				${ejs.render(valuationsMultifamilyCompsComparisonPageHtml, {
					evaluation: evaluationData,
					watermark: watermarkPageHtml,
					section: section3,
					chapter: chapterValuations,
					theme: data.theme,
					googleApiKey,
					...reportHelpers,
					states: statesOptions,
					zoneOptions: zoningOptions,
					conditionOptions: conditionOptions,
					topographyOptions: topographyOptions,
					frontageOptions: frontageOptions,
					leaseTypeOptions: leaseTypeOptions,
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
					conditionOptions: conditionOptions,
					topographyOptions: topographyOptions,
					frontageOptions: frontageOptions,
					zoneOptions: zoningOptions,
					leaseTypeOptions: leaseTypeOptions,
					landOptions: landOptions,
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
					conditionOptions: conditionOptions,
					topographyOptions: topographyOptions,
					leaseTypeOptions: leaseTypeOptions,
					frontageOptions: frontageOptions,
					zoneOptions: zoningOptions,
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
	 * @description Function to create and update setup of evaluations .
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
			const { scenarios, ...evaluationData } = request.body;
			const { client_id } = evaluationData;
			// const { evaluation_type } = evaluationData;
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
				const requestedEvaluation = await this.evaluationStorage.findByAttribute({
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
				const updateEvaluation = await this.evaluationStorage.updateEvaluation(
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
				const findUserDetails = await this.userStore.get(request?.user?.id);

				if (findUserDetails) {
					evaluationData.comp_adjustment_mode = findUserDetails.comp_adjustment_mode;
				}

				createdEvaluation = await this.evaluationStorage.createEvaluation({
					...evaluationData,
				});
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
				evaluationOldData = await this.evaluationStorage.getEvaluation({
					id: editEvaluationId,
				});
			//scenarios add, update.
			const keepId: number[] = [];
			if (scenarios) {
				for (const scenario of scenarios) {
					const isExisting = !!scenario?.id;
					let scenarioId = scenario.id;
					let weightChangeFlag = false;

					if (isExisting) {
						const findScenario = await this.evaluationScenarioStore.findScenario({
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

						//Removing approaches data if not selected on setup screen
						const approachChecks = [
							{ key: 'has_income_approach', store: this.evaluationIncomeStore },
							{ key: 'has_sales_approach', store: this.evaluationSaleApproachStore },
							{ key: 'has_cost_approach', store: this.evaluationCostApproachStore },
							{ key: 'has_lease_approach', store: this.evaluationLeaseApproachStore },
							{ key: 'has_cap_approach', store: this.evaluationCapApproachStore },
							{ key: 'has_multi_family_approach', store: this.evaluationMultiFamilyStore },
						];

						for (const { key, store } of approachChecks) {
							if (!scenario?.[key]) {
								const record = await store.findOne({ evaluation_scenario_id: scenarioId });
								if (record) {
									await store.remove({ id: record.id });
								}
							}
						}

						// If approaches have changed, update weights
						if (oldApproaches.join(',') !== newApproaches.join(',')) {
							weightChangeFlag = true;
							const approaches = [
								{
									key: EvaluationsEnum.HAS_INCOME_APPROACH,
									table: this.evaluationIncomeStore,
									weightKey: EvaluationsEnum.INCOME,
								},
								{
									key: EvaluationsEnum.HAS_SALE_APPROACH,
									table: this.evaluationSaleApproachStore,
									weightKey: EvaluationsEnum.SALE,
								},
								{
									key: EvaluationsEnum.HAS_COST_APPROACH,
									table: this.evaluationCostApproachStore,
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
									evaluation_scenario_id: scenarioId,
								});
								const eval_weight = weights[approach.weightKey];

								if (!exists) {
									const eval_weight = weights[approach.weightKey];
									const savedData = await approach.table.addWeight({
										evaluation_id: evaluationOldData.id,
										evaluation_scenario_id: scenarioId,
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

						scenario.has_rent_roll_approach = scenario.has_multi_family_approach ? 1 : 0;
						if (!scenario.has_rent_roll_approach) {
							this.evaluationRentRollTypeStore.removeType({ evaluation_scenario_id: scenario.id });
						}
						await this.evaluationScenarioStore.updateScenario(scenarioId, scenario);
						keepId.push(scenarioId);
					} else {
						scenario.evaluation_id = createdEvaluation ? createdEvaluation.id : editEvaluationId;
						if (scenario.has_multi_family_approach === 1) {
							scenario.has_rent_roll_approach = 1;
						}
						const saveScenario = await this.evaluationScenarioStore.createScenario(scenario);
						scenarioId = saveScenario.id;
						keepId.push(scenarioId);

						const approaches = [
							{
								key: EvaluationsEnum.HAS_INCOME_APPROACH,
								table: this.evaluationIncomeStore,
								weightKey: EvaluationsEnum.INCOME,
							},
							{
								key: EvaluationsEnum.HAS_SALE_APPROACH,
								table: this.evaluationSaleApproachStore,
								weightKey: EvaluationsEnum.SALE,
							},
							{
								key: EvaluationsEnum.HAS_COST_APPROACH,
								table: this.evaluationCostApproachStore,
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
								evaluation_scenario_id: scenarioId,
							});
							if (!exists) {
								const eval_weight = weights[approach.weightKey];
								const savedData = await approach.table.addWeight({
									evaluation_id: scenario.evaluation_id,
									evaluation_scenario_id: scenarioId,
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
				await this.evaluationScenarioStore.removeScenarios(keepId, editEvaluationId);
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
	 * @description Function to get land size calculations.
	 * @param data
	 * @returns
	 */
	public getLandSize = async (data: IEvaluationsUpdateRequest): Promise<number> => {
		try {
			let landSize = data.building_size;
			// Check if the comparison type is LAND_ONLY
			if (data.comp_type && data.comp_type === EvaluationsEnum.LAND_ONLY) {
				// If comparison type is LAND_ONLY, check if the land dimension is ACRE and analysis type is not PRICE_ACRE
				if (
					data.land_dimension === EvaluationsEnum.ACRE &&
					data.analysis_type !== EvaluationsEnum.PRICE_ACRE
				) {
					// If the land dimension is ACRE and analysis type is not PRICE_ACRE, convert land size to square feet
					landSize = data.land_size * 43560; // Convert acres to square feet
				} else {
					// Otherwise, just use the provided land size
					landSize = data.land_size;
				}
			} else if (data.comparison_basis !== EvaluationsEnum.COMPARISON_BASIS_SF) {
				// If comparison basis is not square feet, calculate land size based on zoning information
				const propSize = data.zonings.map(
					(zoning: IZoning) => zoning[data.comparison_basis.toLowerCase()],
				);
				// Sum up the sizes obtained from zoning information
				landSize = propSize.reduce((acc: number, val: number) => acc + val, 0);
			}

			return landSize;
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
				const incomeApproachData = await this.evaluationIncomeStore.findByAttribute({
					evaluation_scenario_id: evaluationScenarioId,
				});
				if (incomeApproachData && !incomeApproachData.incomeSources.length) {
					if (
						evaluationData?.zonings?.length &&
						evaluationData.comp_type === EvaluationsEnum.BUILDING_WITH_LAND
					) {
						for (const zoningData of evaluationData.zonings) {
							const attributes = {
								evaluation_income_approach_id: incomeApproachData.id,
								zoning_id: zoningData.id,
								type: zoningData.sub_zone,
								space: zoningData.sub_zone,
								sf_source: zoningData.sq_ft,
								square_feet: zoningData.sq_ft,
								comments: zoningData.zone,
								monthly_income: 0,
								annual_income: 0,
								rent_unit: 0,
								unit: zoningData.unit || 0,
								rent_bed: 0,
								bed: zoningData.bed || 0,
								rent_sq_ft: zoningData.rent_sq_ft || 0,
								link_overview: 1,
							};
							await this.evaluationIncomeSourcesStore.create(attributes);
						}
					} else if (evaluationData.comp_type === EvaluationsEnum.LAND_ONLY) {
						const attributes = {
							evaluation_income_approach_id: incomeApproachData.id,
							type: evaluationData.land_type,
							sf_source: evaluationData.land_size,
							comments: EvaluationsEnum.LAND_ONLY_TYPE as string,
							monthly_income: 0,
							annual_income: 0,
							rent_unit: 0,
							unit: 0,
							rent_bed: 0,
							bed: 0,
							rent_sq_ft: 0,
							link_overview: 1,
						};
						await this.evaluationIncomeSourcesStore.create(attributes);
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
			const incomeApproachData = await this.evaluationIncomeStore.findByAttribute({
				evaluation_scenario_id: scenarioId,
			});
			if (incomeApproachData) {
				const indecatedValue = incomeApproachData.indicated_range_annual || 0;
				const indecatedValueWeight = indecatedValue * (incomeApproachData.eval_weight || 0);
				totalWeightedValue += indecatedValueWeight;
			}
			const saleApproachData = await this.evaluationSaleApproachStore.findByAttribute({
				evaluation_scenario_id: scenarioId,
			});
			if (saleApproachData) {
				const indecatedValue = saleApproachData.sales_approach_value || 0;
				const indecatedValueWeight = indecatedValue * (saleApproachData.eval_weight || 0);
				totalWeightedValue += indecatedValueWeight;
			}
			const costApproachData = await this.evaluationCostApproachStore.findByAttribute({
				evaluation_scenario_id: scenarioId,
			});
			if (costApproachData) {
				const indecatedValue = costApproachData.total_cost_valuation || 0;
				const indecatedValueWeight = indecatedValue * (costApproachData.eval_weight || 0);
				totalWeightedValue += indecatedValueWeight;
			}
			this.evaluationScenarioStore.updateScenario(scenarioId, {
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
	public updateApproaches = async (
		data: IEvaluationsUpdateRequest,
		comp_type: string,
	): Promise<boolean> => {
		try {
			const id = data.id;
			// Retrieve the old data for the given ID
			const evaluationData = await this.evaluationStorage.getEvaluation({ id });
			// Loop through each appraisal approach in the old data
			for (const scenario of evaluationData.scenarios) {
				// Check if the approach type is 'income'
				if (scenario.has_income_approach && scenario?.evaluation_income_approach) {
					// Extract the ID of the income approach
					const incomeApproachId = scenario?.evaluation_income_approach?.id;
					// If the income approach ID exists
					if (incomeApproachId) {
						if (data.comp_type != comp_type) {
							await this.evaluationIncomeSourcesStore.removeByAttribute({ link_overview: 1 });
						}
						const incomeSource: IIncomeSource[] = await this.evaluationIncomeSourcesStore.findAll({
							evaluation_income_approach_id: incomeApproachId,
						});
						if (!incomeSource.length && data.comp_type == EvaluationsEnum.LAND_ONLY) {
							const attributes = {
								evaluation_income_approach_id: incomeApproachId,
								type: data.land_type,
								space: data.land_type,
								sf_source: data.land_size,
								comments: EvaluationsEnum.LAND_ONLY_TYPE as string,
								monthly_income: 0,
								annual_income: 0,
								rent_unit: 0,
								unit: 0,
								rent_bed: 0,
								bed: 0,
								rent_sq_ft: 0,
								link_overview: 1,
							};
							await this.evaluationIncomeSourcesStore.create(attributes);
						} else if (data.comp_type == EvaluationsEnum.LAND_ONLY) {
							// Only update the income source where link_overview is 1
							if (incomeSource.length) {
								const overviewSource = incomeSource.find((src) => src.link_overview === 1);
								if (overviewSource) {
									const attributes = {
										type: data.land_type,
										space: data.land_type,
										sf_source: data.land_size,
									};
									await this.evaluationIncomeSourcesStore.update(overviewSource.id, attributes);
								}
							}
						}

						// Prepare attributes for calculating the income approach
						const incomeAttributes = { data, income: scenario?.evaluation_income_approach };
						// Calculate the incremental value using the income approach
						await this.calculateIncomeApproach(incomeAttributes);
					}
				}
				if (scenario.has_sales_approach && scenario?.evaluation_sales_approach) {
					// Extract the ID of the sale approach
					const saleApproachId = scenario?.evaluation_sales_approach?.id;
					// Prepare attributes for calculating the sale approach
					if (saleApproachId) {
						const saleAttributes = { data, sale: scenario?.evaluation_sales_approach };
						await this.setSalesPsfValues(saleAttributes);
					}
				}
				if (scenario.has_cost_approach && scenario?.evaluation_cost_approach) {
					// Extract the ID of the cost approach
					const costApproachId = scenario?.evaluation_cost_approach;
					// Prepare attributes for calculating the cost approach
					if (costApproachId) {
						const costAttributes = { data, cost: scenario?.evaluation_cost_approach };
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
			const scenarioId = income.evaluation_scenario_id;
			const incomeId = income?.id;
			// Retrieve income data based on the income ID
			const incomeData = await this.evaluationIncomeStore.findByAttribute({ id: incomeId });
			// Check if income data exists
			if (!incomeData) {
				return; // Exit if income data does not exist
			}
			// Calculate land size
			const landSize = await this.getLandSize(data);
			// Prepare comparison basis
			const comparisonBasis = data.comparison_basis.replace(' ', '_').toLowerCase();
			const sSpace =
				data.comparison_basis !== EvaluationsEnum.SF ? comparisonBasis : EvaluationsEnum.SQ_FT;
			// Retrieve income sources based on the income approach ID
			let incomeSource: IIncomeSource[] = await this.evaluationIncomeSourcesStore.findAll({
				evaluation_income_approach_id: incomeId,
			});
			const zonings = await this.zoningStore.findAll({
				evaluation_id: data.id,
			});
			// Remove incomeSource entries whose zoning_id is not in zonings
			const zoningIds = zonings.map((z: any) => z.dataValues?.id ?? z.id);
			const toRemove = incomeSource.filter(
				(src) => src.zoning_id && !zoningIds.includes(src.zoning_id),
			);
			for (const src of toRemove) {
				await this.evaluationIncomeSourcesStore.removeOne(src?.id);
			}
			const zoningsNotInIncomeSource: any = zonings.filter((zoning: any) => {
				// Check if the zoning id is not present in any incomeSource's zoning_id
				return !incomeSource.some((income) => income.zoning_id === zoning.dataValues.id);
			});
			if (zoningsNotInIncomeSource) {
				for (const source of zoningsNotInIncomeSource) {
					//Fetch zoning type
					const zoning = await this.commonStore.findGlobalCodeByAttribute({ type: 'zone' });
					const zoningOptions = zoning?.options;

					const zoningData = source.dataValues;

					const zone = zoningOptions.find((obj) => obj?.code === zoningData.zone);
					const zoneName = zone ? zone.name : zoningData.zone;

					const attributes = {
						evaluation_income_approach_id: incomeId,
						zoning_id: zoningData.id,
						type: zoningData.sub_zone,
						space: zoningData.sub_zone,
						sf_source: zoningData.sq_ft,
						comments: zoneName || '',
						monthly_income: 0,
						annual_income: 0,
						rent_unit: 0,
						unit: zoningData.unit || 0,
						rent_bed: 0,
						bed: zoningData.bed || 0,
						rent_sq_ft: zoningData.rent_sq_ft || 0,
						link_overview: 1,
					};
					await this.evaluationIncomeSourcesStore.create(attributes);
				}
				incomeSource = await this.evaluationIncomeSourcesStore.findAll({
					evaluation_income_approach_id: incomeId,
				});
			}

			// Initialize variables for income totals and income source data
			let monthlyIncomeTotal = 0;
			let annualIncomeTotal = 0;
			const incomeSourceData: IIncomeSource[] = [];
			let newTotalSF = 0;
			let newTotalUnit = 0;
			let newTotalBed = 0;
			// Loop through each income source
			for (const source of incomeSource) {
				const zoneId: number = source.zoning_id;
				// Check if comp type is BUILDING_WITH_LAND and zone ID exists
				if (data.comp_type === EvaluationsEnum.BUILDING_WITH_LAND && zoneId) {
					incomeData.total_sq_ft = 0;
					// Retrieve zone data based on zone ID
					const zoneData: IZoning = await this.zoningStore.findByPk(zoneId);
					// Proceed if zone data exists
					if (zoneData) {
						// Determine source space and rent field based on comparison basis
						let sourceSpace: string = EvaluationsEnum.SF_SOURCE;
						let rentField: string = IncomeApproachEnum.RENT_SQ_FT;
						if (data.comparison_basis !== EvaluationsEnum.SF) {
							sourceSpace = comparisonBasis;
							rentField = IncomeApproachEnum.RENT + comparisonBasis;
						}
						source.sf_source = zoneData.sq_ft;
						source.type = zoneData.sub_zone;
						// Set source space and rent field values based on zone data
						source[sourceSpace] = zoneData[sSpace];
						source[rentField] = source[sourceSpace]
							? source.annual_income / source[sourceSpace]
							: 0;
						// Loop through property values and update source space and comments if necessary.
						for (const propertyVal of data.zonings) {
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
						newTotalSF += source.sf_source || 0;
						newTotalBed += source.bed || 0;
						newTotalUnit += source.unit || 0;
					}
				} else if (data.comp_type === EvaluationsEnum.LAND_ONLY) {
					// If comp type is LAND_ONLY update source data
					if (source.link_overview) {
						source.type = data.land_type;
						source.sf_source = landSize;
					}
					newTotalSF = landSize;
					source.rent_unit = 0;
					source.unit = 0;
					source.rent_bed = 0;
					source.bed = 0;
					source.rent_sq_ft = source.sf_source ? source.annual_income / source.sf_source : 0;
				}

				// Update income totals and income source data
				monthlyIncomeTotal += source.monthly_income;
				annualIncomeTotal += source.annual_income;
				incomeSourceData.push(source);
			}
			incomeData.total_sq_ft = newTotalSF;
			incomeData.total_bed = newTotalBed;
			incomeData.total_unit = newTotalUnit;
			// Remove income approach if there are no income source data
			if (!incomeSourceData.length) {
				this.evaluationIncomeStore.remove({ evaluation_scenario_id: scenarioId });
			}
			// Calculate vacancy amount
			const vacancyAmount = incomeData.vacancy ? (annualIncomeTotal * incomeData.vacancy) / 100 : 0;
			const adjustedGrossAmount = annualIncomeTotal - vacancyAmount;
			// Retrieve operating expenses based on the income approach ID
			const operatingExpense = await this.evaluationOperatingExpenseStore.findAll({
				evaluation_income_approach_id: incomeId,
			});
			// Update income data with calculated totals and amounts
			incomeData.total_monthly_income = monthlyIncomeTotal;
			incomeData.total_annual_income = annualIncomeTotal;
			// Initialize variables for operating expenses
			let oePerSquareFeetTotal = 0;
			let oePerSquareFeet = 0;
			let oeGross = 0;
			const operatingExpenseData: IOperatingExpense[] = [];
			// Loop through each operating expense
			for (const source of operatingExpense) {
				const annualAmount = source.annual_amount;
				if (annualAmount) {
					// Calculate comparison expense based on land size
					const comparisonExpense = IncomeApproachEnum.TOTAL_PER + '_' + sSpace;
					source[comparisonExpense] = landSize
						? parseFloat((annualAmount / landSize).toFixed(2))
						: 0;
					if (data.comp_type && data.comp_type != EvaluationsEnum.LAND_ONLY) {
						source.total_per_sq_ft = data.building_size
							? parseFloat((annualAmount / data.building_size).toFixed(2))
							: 0;
						oePerSquareFeetTotal += source.total_per_sq_ft;
					}
					oePerSquareFeet += source[comparisonExpense];
					// Calculate percentage of gross
					source.percentage_of_gross = adjustedGrossAmount
						? parseFloat(((annualAmount / adjustedGrossAmount) * 100).toFixed(2))
						: 0;
					oeGross += source.percentage_of_gross;
				}
				operatingExpenseData.push(source);
			}

			const spaceRent = IncomeApproachEnum.TOTAL_RENT + '_' + sSpace;
			incomeData[spaceRent] = landSize ? incomeData.total_annual_income / landSize : 0;

			const totalComparison = IncomeApproachEnum.TOTAL + ' _' + sSpace;
			incomeData[totalComparison] = landSize;

			const oePerSpaceLabel =
				data.comparison_basis !== EvaluationsEnum.SF
					? IncomeApproachEnum.TOTAL_OE_PER + '_' + comparisonBasis
					: IncomeApproachEnum.TOTAL_OE_PER_SQUARE_FEET;
			incomeData[oePerSpaceLabel] = oePerSquareFeet;
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
				const highCapitalizationRate = IncomeApproachEnum.HIGH_CAP_RATE;
				const keyLabel =
					data.comparison_basis !== EvaluationsEnum.SF
						? comparisonBasis + '_' + IncomeApproachEnum.CAPITALIZATION_RATE
						: IncomeApproachEnum.SQ_FT_CAP_RATE;
				incomeData[keyLabel] = incomeData[highCapitalizationRate] || 0;
			}

			if (incomeData.monthly_capitalization_rate && incomeData.total_net_income) {
				const spaceCapitalizationRate = IncomeApproachEnum.HIGH_CAP_RATE;
				incomeData[spaceCapitalizationRate] = incomeData[spaceCapitalizationRate] || 0;
				const monthlyCapitalizationRate = incomeData.monthly_capitalization_rate;
				const annualCapitalizationRate = incomeData.annual_capitalization_rate;
				const sqFtCapitalizationRate = incomeData[spaceCapitalizationRate];

				incomeData.indicated_range_monthly = monthlyCapitalizationRate
					? incomeData.total_net_income / (monthlyCapitalizationRate / 100)
					: 0;
				incomeData.indicated_range_annual = annualCapitalizationRate
					? incomeData.total_net_income / (annualCapitalizationRate / 100)
					: 0;

				const spaceLabel =
					data.comparison_basis !== EvaluationsEnum.SF ? comparisonBasis : EvaluationsEnum.SQ_FT;
				const comparisonRange = IncomeApproachEnum.INDICATED_RANGE + '_' + spaceLabel;
				incomeData[comparisonRange] = sqFtCapitalizationRate
					? incomeData.total_net_income / (sqFtCapitalizationRate / 100)
					: 0;
			}
			const spaceLabel =
				data.comparison_basis !== EvaluationsEnum.SF ? comparisonBasis : EvaluationsEnum.SQ_FT;
			const comparisonRange = IncomeApproachEnum.INDICATED_RANGE + '_' + spaceLabel;

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
				indicated_psf_unit: sqFeetPsf || null,
				indicated_psf_sq_feet: sqFeetPsf || null,
				indicated_psf_bed: sqFeetPsf || null,
				total_monthly_income: incomeData.total_monthly_income || null,
				total_annual_income: incomeData.total_annual_income || null,
				total_rent_unit: incomeData.total_rent_unit || null,
				total_unit: incomeData.total_unit || null,
				total_oe_annual_amount: incomeData.total_oe_annual_amount || null,
				total_oe_gross: incomeData.total_oe_gross || null,
				total_oe_per_unit: incomeData.total_oe_per_unit || null,
				total_sq_ft: incomeData.total_sq_ft || null,
				total_rent_sq_ft: incomeData.total_rent_sq_ft || null,
				total_oe_per_square_feet: incomeData.total_oe_per_square_feet || null,
				total_rent_bed: incomeData.total_rent_bed || null,
				total_oe_per_bed: incomeData.total_oe_per_bed || null,
				total_bed: incomeData.total_bed || null,
				vacant_amount: vacancyAmount ? -vacancyAmount : 0,
				adjusted_gross_amount: adjustedGrossAmount,
				monthly_capitalization_rate: incomeData.monthly_capitalization_rate || null,
				annual_capitalization_rate: incomeData.annual_capitalization_rate || null,
				unit_capitalization_rate: incomeData.unit_capitalization_rate || null,
				sq_ft_capitalization_rate: incomeData.sq_ft_capitalization_rate || null,
				bed_capitalization_rate: incomeData.bed_capitalization_rate || null,
				high_capitalization_rate: incomeData.high_capitalization_rate || null,
				total_net_income: incomeData.total_net_income || null,
				indicated_range_monthly: incomeData.indicated_range_monthly || null,
				indicated_range_annual: incomeData.indicated_range_annual || null,
				indicated_range_unit: incomeData.indicated_range_unit || null,
				indicated_range_sq_feet: incomeData.indicated_range_sq_feet || null,
				indicated_range_bed: incomeData.indicated_range_bed || null,
				id: income.id,
				incremental_value: incrementalValue,
			};
			// Update income data in the database
			await this.evaluationIncomeStore.updateIncomeApproach(incomeDataUpdate);
			// Handle income sources and operating expenses
			if (incomeSourceData) {
				await this.handleIncomeSourcesOrOperatingExpenses({
					updatedIncomeSources: incomeSourceData,
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
	public setSalesPsfValues = async (saleAttributes: ICalculateSale): Promise<boolean> => {
		try {
			const { data, sale } = saleAttributes;
			// Fetch the sales approach data for the given appraisal ID
			const saleData: ISalesApproachesRequest =
				await this.evaluationSaleApproachStore.findByAttribute({
					id: sale.id,
				});
			// Fetch all zoning data for the given appraisal ID
			const zoningData: IZoning[] = await this.zoningStore.findAll({ evaluation_id: data.id });
			// Get the land size for the given data
			const landSize = await this.getLandSize(data); // Define this function as per your logic
			// Initialize variables to store sales approach value and total comp adjustment
			let salesApproachValue = 0;
			let totalCompAdj = 0;
			// Check if averaged adjusted PSF is available in the sales data
			if (saleData?.averaged_adjusted_psf) {
				// Parse the averaged adjusted PSF to a float with 2 decimal places
				const averagedAdjustedPsf = parseFloat(saleData.averaged_adjusted_psf.toFixed(2));
				// Check if the comparison is for building with land and the basis is square feet

				if (
					data.comp_type === EvaluationsEnum.BUILDING_WITH_LAND &&
					data.comparison_basis === EvaluationsEnum.SF
				) {
					// Reset sales approach value
					salesApproachValue = 0;
					// Iterate over each zoning data and calculate the total sales adjustment value
					for (const values of zoningData) {
						salesApproachValue += await this.getTotalSalesAdjVal(
							averagedAdjustedPsf,
							values.sq_ft,
							values.weight_sf,
						);
					}
				} else {
					// Calculate sales approach value based on land size if the comparison basis is not square feet
					salesApproachValue = landSize ? averagedAdjustedPsf * landSize : 0;
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
			await this.evaluationSaleApproachStore.updateSalesApproach(saleApproachData);
			await this.calculateWeightedMarketValue(
				saleData.evaluation_scenario_id,
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
	 * @description Function to calculate cost approaches.
	 * @param costAttributes
	 * @returns
	 */
	public setCostPsfValues = async (costAttributes: ICalculateCost): Promise<boolean> => {
		try {
			const { data, cost } = costAttributes;
			// Fetch the appraisal cost approach record by cost ID
			const costApproach = await this.evaluationCostApproachStore.findByAttribute({
				id: cost.id,
			});
			// Initialize variables
			let landSize = data.land_size || 0;
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
			let indicatedValuePunit = costApproach.indicated_value_punit || 0;
			let indicatedValuePbed = costApproach.indicated_value_pbed || 0;

			let overallReplacementCost = 0,
				totalDepreciation = 0;
			const newImprovements: Partial<ICostImprovements>[] = [];
			// Fetch all improvements related to the current appraisal cost approach
			let improvements: ICostImprovements[] = await this.evaluationCostImprovementStore.findAll({
				evaluation_cost_approach_id: costApproach.id,
			});
			const zonings = await this.zoningStore.findAll({
				evaluation_id: data.id,
			});
			// Remove incomeSource entries whose zoning_id is not in zonings
			const zoningIds = zonings.map((z: any) => z.dataValues?.id ?? z.id);
			const toRemove = improvements.filter(
				(src) => src.zoning_id && !zoningIds.includes(src.zoning_id),
			);
			for (const src of toRemove) {
				await this.evaluationCostImprovementStore.delete({ id: src?.id });
			}
			const zoningsNotInImprovements: any = zonings.filter((zoning: any) => {
				// Check if the zoning id is not present in any improvements's zoning_id
				return !improvements.some((improvement) => improvement.zoning_id === zoning.dataValues.id);
			});
			if (zoningsNotInImprovements) {
				for (const source of zoningsNotInImprovements) {
					const zoningData = source.dataValues;
					const attributes = {
						evaluation_cost_approach_id: costApproach.id,
						zoning_id: zoningData.id,
						type: zoningData.sub_zone,
						sf_area: zoningData.sq_ft,
					};
					await this.evaluationCostImprovementStore.create(attributes);
				}
				improvements = await this.evaluationCostImprovementStore.findAll({
					evaluation_cost_approach_id: costApproach.id,
				});
			}
			// Process each improvement if there are any
			if (improvements.length > 0) {
				improvementsTotalSfArea = 0;
				improvementsTotalAdjustedCost = 0;
				for (const imp of improvements) {
					if (imp.zoning_id) {
						// Fetch the zoning information and calculate structure costs
						const sfArea = await this.zoningStore.findByAttribute({ id: imp.zoning_id });
						imp.type = sfArea?.sub_zone;
						imp.sf_area = sfArea?.sq_ft || data.building_size;
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
				this.evaluationCostImprovementStore.bulkCreate(newImprovements);
				// Calculate total cost valuation and indicated value per square foot
				totalCostValuation = landValue + improvementsTotalAdjustedCost;
				indicatedValuePsf = totalCostValuation / improvementsTotalSfArea;
				// Adjust indicated values based on comparison basis if not square footage
				if (data.comparison_basis !== EvaluationsEnum.SF) {
					const propSize = data.zonings.map(
						(z: IZoning) => z[data.comparison_basis.replace(' ', '_').toLowerCase()],
					);
					landSize = propSize.reduce((a: number, b: number) => a + b, 0);
					const indicatedValue = totalCostValuation / landSize;

					if (data.comparison_basis.toLowerCase() === EvaluationsEnum.UNIT) {
						indicatedValuePunit = indicatedValue;
					} else {
						indicatedValuePbed = indicatedValue;
					}
				}
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
				indicated_value_punit: indicatedValuePunit,
				indicated_value_pbed: indicatedValuePbed,
				id: cost.id,
			};
			// Update the appraisal cost approach with the new data
			const updatedCostApproach =
				await this.evaluationCostApproachStore.updateCostApproach(costData);
			await this.calculateWeightedMarketValue(
				costApproach.evaluation_scenario_id,
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
				evaluation_scenario_id,
				weighted_market_value,
				rounding,
				review_summary,
				reviewed_by,
				review_date,
			} = request.body;
			const evaluation_id = parseInt(request?.params?.id);

			// Find the evaluation by id
			const findEvaluation = await this.evaluationStorage.findByAttribute({ id: evaluation_id });
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
			if (reviewDate === null && reviewed_by) {
				this.evaluationStorage.deleteData(evaluation_id, { reviewed_by });
			}

			// Only update if there is at least one valid attribute
			if (Object.keys(evalAttributes).length > 0) {
				await this.evaluationStorage.updateEvaluation(evalAttributes, evaluation_id);
			}
			// Update weighted market value and rounding data in scenario table.
			const findScenario = await this.evaluationScenarioStore.findScenario({
				id: evaluation_scenario_id,
			});
			let updateScenarioDetail;
			if (findScenario) {
				const scenarioAttributes = {
					weighted_market_value,
					rounding,
				};
				updateScenarioDetail = await this.evaluationScenarioStore.updateScenario(
					evaluation_scenario_id,
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
				const findApproach = await this.evaluationIncomeStore.findByAttribute({
					id: approach_id,
					evaluation_scenario_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.INCOME_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else {
					updateSuccess = await this.evaluationIncomeStore.updateIncomeApproach(attributes);
				}
			} else if (approach === EvaluationsEnum.SALE) {
				const findApproach = await this.evaluationSaleApproachStore.findByAttribute({
					id: approach_id,
					evaluation_scenario_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.SALES_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else
					updateSuccess = await this.evaluationSaleApproachStore.updateSalesApproach(attributes);
			} else if (approach === EvaluationsEnum.COST) {
				const findApproach = await this.evaluationCostApproachStore.findByAttribute({
					id: approach_id,
					evaluation_scenario_id,
				});
				if (!findApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: EvalMessageEnum.COST_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				} else
					updateSuccess = await this.evaluationCostApproachStore.updateCostApproach(attributes);
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
			const evaluationInfo = await this.evaluationStorage.getReviewDetails(attributesWithOr);
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
			const evaluationInfo = await this.evaluationStorage.getEvaluation(attributesWithOr);
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
