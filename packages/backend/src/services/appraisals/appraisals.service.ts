// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = require('child_process').exec;
import * as cheerio from 'cheerio';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import AppraisalsStore from './appraisals.store';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import SendResponse from '../../utils/common/commonResponse';
import UserEnum, {
	AppraisalEnum,
	ClientEnum,
	CommonEnum,
	CompEnum,
	DownloadCompEnum,
	FileEnum,
	PhotoPagesEnum,
	TemplateEnum,
} from '../../utils/enums/MessageEnum';
import {
	IAppraisalsCreateRequest,
	IAppraisalsUpdateRequest,
	IAppraisalSuccess,
	IAppraisal,
	IAppraisalSetupRequest,
	IMapBoundaryRequest,
	IUploadImageRequest,
	IAerialMapRequest,
	IAreaInfoRequest,
	IRemoveImageRequest,
	IPostExhibitsRequest,
	IRemoveExhibitsRequest,
	IGetAppraisalRequest,
	IAppraisalListRequest,
	IAppraisalListSuccess,
	IGetAreaInfoRequest,
	IGetAllAreaInfo,
	IGetSelectedCompRequest,
	IDeleteAppraisalRequest,
	IAppraisalFiles,
	IGetInfoForPdf,
	ICalculateIncome,
	ICalculateSale,
	ICalculateCost,
	IPositionRequest,
	IFieldsDataGet,
	ISaleComparitivesListSuccess,
	IGetRequest,
	ISaveRentRollResponse,
	ISaveRentRoll,
} from '../appraisals/IAppraisalsService';
import HelperFunction from '../../utils/common/helper';
import {
	appraisalSetupAddUpdateSchema,
	areaInfoSchema,
	mapBoundarySchema,
	// removeImageSchema,
	combinedSchema,
	uploadImagechema,
	aerialMapSchema,
	updateExhibitPositionSchema,
	incomeApproachesSchema,
	appraisalListSchema,
	getSelectedCompSchema,
	saveSalesApproachSchema,
	costApproachSchema,
	saveCostImprovementSchema,
	saveAreaMapSchema,
	appraisalPositionSchema,
	saveLeaseApproachSchema,
} from './appraisals.validations';
import DefaultEnum, {
	AppraisalIncomeEnum,
	FileOriginEnum,
	FileStorageEnum,
	LoggerEnum,
	UploadEnum,
} from '../../utils/enums/DefaultEnum';
import AppraisalsEnum, {
	GlobalCodeEnums,
	ImagesPageEnum,
	IncomeApproachEnum,
	ReportTemplateEnum,
	SaleComparativeAttribute,
} from '../../utils/enums/AppraisalsEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import { IUploadSuccess, IUploadURLSuccessData } from '../uploadFiles/IUploadService';
import AppraisalFilesStore from '../appraisalFiles/appraisalFiles.store';
import sharp from 'sharp';
import { GOOGLE_MAPS_API_KEY, S3_BASE_URL } from '../../env';
import AppraisalMetaDataStore from '../appraisalsMetaData/appraisalMetaData.store';
import { IAppraisalMetaData } from '../appraisalsMetaData/IAppraisalMetaDataService';

import {
	IAppraisalFilesData,
	IFilesPosition,
	IUpdateExhibits,
	IUpdatePositions,
} from '../appraisalFiles/IAppraisalFilesService';
import AppraisalIncomeStore from '../appraisalIncomeApproach/appraisalIncome.store';
import StatusEnum from '../../utils/enums/StatusEnum';
import { IComp, ICompsListRequest } from '../comps/ICompsService';
import { compsListSchema } from '../comps/comps.validations';
import CompsStore from '../comps/comps.store';
import {
	GetSalesApproachRequest,
	ISalesApproach,
	SaveSalesApproachRequest,
} from '../appraisalSalesApproach/IAppraisalSalesService';
import AppraisalSalesStore from '../appraisalSalesApproach/appraisalSales.store';
import AppraisalApproachStore from '../appraisalApproaches/appraisalApproaches.store';
import AppraisalSalesSubAdjStorage from '../appraisalSalesApproachSubjectAdj/appraisalSalesSubjectAdj.store';
import AppraisalSalesCompsStorage from '../appraisalSalesApproachComps/appraisalSalesApproachComps.store';
import AppraisalSalesCompAdjStorage from '../appraisalSalesCompAdjustments/appraisalSalesCompAdj.store';
import AppraisalIncomeSourcesStore from '../appraisalIncomeSource/appraisalIncomeSource.store';
import UploadFunction from '../../utils/common/upload';
import AppraisalCostApproachStore from '../appraisalCostApproach/appraisalCostApproach.store';
import AppraisalCostSubAdjStorage from '../appraisalCostApproachSubAdj/appraisalCostApproachSubAdj.store';
import AppraisalCostCompsStorage from '../appraisalCostApproachComps/appraisalCostApproachComps.store';
import AppraisalCostCompAdjStorage from '../appraisalCostApproachCompAdj/appraisalCostApproachCompAdj.store';
import {
	GetCostApproachRequest,
	ICostApproach,
	ISaveAreaMapReq,
	ISaveCostApproachRequest,
	ISaveCostImprovements,
} from '../appraisalCostApproach/IAppraisalCostApproach';
import { ICostCompsAdjustment } from '../appraisalCostApproachCompAdj/IAppraisalCostApproachCompAdj';
import { ICostSubPropertyAdj } from '../appraisalCostApproachSubAdj/IAppraisalCostApproachSubAdj';
import { ICostComp } from '../appraisalCostApproachComps/IAppraisalCostApproachComps';
import { SalesSubAdjustments } from '../appraisalSalesApproachSubjectAdj/IAppraisalSalesApproachSubAdj';
import { ISalesComp } from '../appraisalSalesApproachComps/IAppraisalSalesApproachComps';
import { ISalesCompsAdjustments } from '../appraisalSalesCompAdjustments/IAppraisalSalesCompAdj';
import {
	IAppraisalIncomeApproach,
	IAppraisalIncomeCreateUpdateRequest,
	IGetIncomeApproachRequest,
	IIncomeApproachHtml,
	handleIncomeSourceOrOpExp,
} from '../appraisalIncomeApproach/IAppraisalIncomeApproach';
import { ICostImprovements } from '../appraisalCostApproachImprovements/IAppraisalCostApproachImprovements';
import AppraisalCostImprovementStorage from '../appraisalCostApproachImprovements/appraisalCostImprovements.store';
import AppraisalOperatingExpensesStorage from '../appraisalOperatingExpenses/appraisalOperatingExpense.store';
import { IIncomeSource } from '../appraisalIncomeSource/IAppraisalIncomeSourceService';
import ZoningStore from '../zonings/zoning.store';
import IZoning from '../../utils/interfaces/IZoning';
import { IOperatingExpense } from '../appraisalOperatingExpenses/IAppraisalOperatingExpenseService';
import TemplateStore from '../template/template.store';
import TemplateService from '../template/template.service';
import fs from 'fs';
import { Timestamp } from '../../utils/common/Time';
import { ITemplate, linkExistTempRequest } from '../template/ITemplateService';
import { linkTempSchema } from '../template/template.validations';
import path from 'path';
import ClientStore from '../clients/client.store';
// import * as pdf2img from 'pdf-img-convert'; // Temporarily disabled - requires native dependencies
import CommonStore from '../common/common.store';
import { IAppraisalApproach } from '../appraisalApproaches/IAppraisalApproachesService';
import {
	IAppraisalPhotoPages,
	IPhotoPage,
	IPhotoPageRequest,
	IPhotoPagesSuccess,
	IUploadPhotosRequest,
	IUrlSuccess,
} from '../appraisalPhotoPages/IAppraisalPhotoPagesService';
import {
	savePhotoPagesSchema,
	uploadMultiplePhotosSchema,
} from '../appraisalPhotoPages/appraisalPhotoPages.validations';
import AppraisalPhotoPagesStorage from '../appraisalPhotoPages/appraisalPhotoPages.store';
import { ISaleCompsQualitativeAdj } from '../appraisalSaleCompsQualitativeAdj/IAppraisalSaleCompQualitativeAdj';
import AppraisalSalesCompQualitativeAdjStore from '../appraisalSaleCompsQualitativeAdj/appraisalSaleCompQualitativeAdj.store';
import { ISaleComparisonAttributes } from '../appraisalSaleCompareAttributes/IAppraisalSaleCompareAttributes';
import AppraisalSaleComparisonStore from '../appraisalSaleCompareAttributes/appraisalSaleCompareAttributes.store';
import {
	GetLeaseApproachRequest,
	ILeaseApproach,
	SaveLeaseApproachRequest,
} from '../appraisalLeaseApproach/IAppraisalLeaseService';
import AppraisalLeaseStore from '../appraisalLeaseApproach/appraisalLease.store';
import AppraisalLeaseSubAdjStorage from '../appraisalLeaseApproachSubAdj/appraisalLeaseSubAdj.store';
import AppraisalLeaseCompsStorage from '../appraisalLeaseApproachComps/appraisalLeaseApproachComps.store';
import { ILeaseCompsAdjustments } from '../appraisalLeaseCompAdjustments/IAppraisalLeaseCompAdj';
import AppraisalLeaseCompAdjStorage from '../appraisalLeaseCompAdjustments/appraisalLeaseCompAdj.store';
import AppraisalLeaseSubQualitativeAdjStore from '../appraisalLeaseQualitativeSubAdj/appraisalLeaseQualitativeAdj.store';
import { ILeaseSubQualitativeAdj } from '../appraisalLeaseQualitativeSubAdj/IAppraisalLeaseQualitativeAdj';
import { ILeaseCompsQualitativeAdj } from '../appraisalLeaseCompsQualitativeAdj/IAppraisalLeaseCompQualitativeAdj';
import AppraisalLeaseCompQualitativeAdjStore from '../appraisalLeaseCompsQualitativeAdj/appraisalLeaseCompQualitativeAdj.store';
import { ILeaseComp } from '../appraisalLeaseApproachComps/IAppraisalLeaseApproachComps';
import AppraisalSaleSubQualitativeAdjStore from '../appraisalSaleQualitativeSubAdj/appraisalSaleQualitativeAdj.store';
import { ISaleSubQualitativeAdj } from '../appraisalSaleQualitativeSubAdj/IAppraisalSaleQualitativeAdj';
import CompsEnum from '../../utils/enums/CompsEnum';
import AppraisalOtherIncomeSourceStore from '../appraisalIncomeOtherSource/appraisalIncomeOtherSource.store';
import { saveRentRollSchema } from '../appraisalRentRolls/rentRolls.validations';
import AppraisalRentRollsStore from '../appraisalRentRolls/rentRolls.store';
import AppraisalRentRollTypeStore from '../appraisalRentRollType/appraisalRentRollType.store';
import { IRentRollHtml } from '../appraisalRentRolls/IRentRolls';
import { RentRollEnums, ScreenEnums } from '../../utils/enums/CommonEnum';
import { v4 as uuidv4 } from 'uuid';
import UserStore from '../user/user.store';

const helperFunction = new HelperFunction();
const uploadFunction = new UploadFunction();
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
const permittedRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV, RoleEnum.ADMINISTRATOR];
export default class AppraisalsService {
	private storage = new AppraisalsStore();
	private templateService = new TemplateService();
	private templateStore = new TemplateStore();
	private appraisalFilesStorage = new AppraisalFilesStore();
	private appraisalMetaDataStorage = new AppraisalMetaDataStore();
	private appraisalIncomeStore = new AppraisalIncomeStore();
	private appraisalIncomeSourceStore = new AppraisalIncomeSourcesStore();
	private appraisalOperatingExpenseStore = new AppraisalOperatingExpensesStorage();
	private compStore = new CompsStore();
	private appraisalSalesApproachStore = new AppraisalSalesStore();
	private appraisalApproachesStore = new AppraisalApproachStore();
	private appraisalSaleSubAdjStore = new AppraisalSalesSubAdjStorage();
	private appraisalSalesCompsStore = new AppraisalSalesCompsStorage();
	private appraisalSalesCompAdjStore = new AppraisalSalesCompAdjStorage();
	private appraisalCostApproachStore = new AppraisalCostApproachStore();
	private appraisalCostSubAdjStore = new AppraisalCostSubAdjStorage();
	private appraisalCostCompsStore = new AppraisalCostCompsStorage();
	private appraisalCostCompAdjStore = new AppraisalCostCompAdjStorage();
	private appraisalCostImprovementStore = new AppraisalCostImprovementStorage();
	private zoningStore = new ZoningStore();
	private clientStore = new ClientStore();
	private commonStore = new CommonStore();
	private appraisalPhotoPagesStore = new AppraisalPhotoPagesStorage();
	private appraisalSaleSubQualitativeAdjStore = new AppraisalSaleSubQualitativeAdjStore();
	private appraisalSaleQualitativeCompAdjStore = new AppraisalSalesCompQualitativeAdjStore();
	private appraisalSaleComparisonStore = new AppraisalSaleComparisonStore();
	private appraisalLeaseApproachStore = new AppraisalLeaseStore();
	private appraisalLeaseSubAdjStore = new AppraisalLeaseSubAdjStorage();
	private appraisalLeaseCompsStore = new AppraisalLeaseCompsStorage();
	private appraisalLeaseCompAdjStore = new AppraisalLeaseCompAdjStorage();
	private appraisalLeaseSubQualitativeAdjStore = new AppraisalLeaseSubQualitativeAdjStore();
	private appraisalLeaseQualitativeCompAdjStore = new AppraisalLeaseCompQualitativeAdjStore();
	private appraisalOtherIncomeSourceStore = new AppraisalOtherIncomeSourceStore();
	private appraisalRentRollsStore = new AppraisalRentRollsStore();
	private appraisalRentRollTypeStore = new AppraisalRentRollTypeStore();
	private userStore = new UserStore();
	constructor() {}

	/**
	 * @description function to update appraisal
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateOverview = async (
		request: IAppraisalsUpdateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
		try {
			// Validate schema
			const params = await helperFunction.validate(combinedSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const appraisalId = parseInt(request.params.id);
			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const { role, account_id, id } = request.user;
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const appraisalData = request.body;
			if (!appraisalData.included_utilities) {
				appraisalData.included_utilities = [];
			}

			// Handle custom fields
			helperFunction.handleCustomField(AppraisalsEnum.LAND_TYPE, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.MOST_LIKELY_OWNER_USER, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.TOPOGRAPHY, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.LOT_SHAPE, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.FRONTAGE, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.UTILITIES_SELECT, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.CONDITION, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.PROPERTY_CLASS, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.MAIN_STRUCTURE_BASE, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.FOUNDATION, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.PARKING, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.BASEMENT, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.ADA_COMPLIANCE, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.EXTERIOR, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.ROOF, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.ELECTRICAL, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.PLUMBING, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.HEATING_COOLING, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.WINDOWS, appraisalData);
			helperFunction.handleCustomField(AppraisalsEnum.PROPERTY_RIGHTS, appraisalData);

			appraisalData.id = appraisalId;
			const attributes: IAppraisalsUpdateRequest = {
				...appraisalData,
			};
			const appraisal = await this.storage.updateOverview(attributes);
			const updateApproaches = await this.updateApproaches(attributes, findAppraisal?.comp_type);
			if (!appraisal || !updateApproaches) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.APPRAISAL_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_SAVE_SUCCESS,
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
	 * @description Function to create and update appraisals .
	 * @param request
	 * @param response
	 * @returns
	 */
	public appraisalSetupSave = async (
		request: IAppraisalSetupRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
		try {
			let createdAppraisal: IAppraisal;
			const role = request?.user?.role;
			const editAppraisalId = parseInt(request.params.id);

			// If role is data entry then do not have permission.
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate schema
			const params = await helperFunction.validate(appraisalSetupAddUpdateSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { approaches, ...appraisalData } = params.value;
			const { client_id } = appraisalData;
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
			//Updating appraisal
			if (editAppraisalId) {
				const requestedAppraisal = await this.storage.findByAttribute({ id: editAppraisalId });
				//Validating requested appraisal id.
				if (!requestedAppraisal) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AppraisalEnum.APPRAISAL_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const updateAppraisal = await this.storage.updateAppraisal(appraisalData, editAppraisalId);
				if (!updateAppraisal) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.APPRAISAL_UPDATE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			} else {
				//Create Appraisal
				appraisalData.user_id = request?.user?.id;
				appraisalData.account_id = request?.user?.account_id;
				const findUserDetails = await this.userStore.get(request?.user?.id);

				if (findUserDetails) {
					appraisalData.comp_adjustment_mode = findUserDetails?.comp_adjustment_mode;
				}

				const appraisalAttributes: IAppraisalsCreateRequest = {
					...appraisalData,
				};
				createdAppraisal = await this.storage.createAppraisal(appraisalAttributes);
				if (!createdAppraisal) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.APPRAISAL_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}

			//users approaches add, update.
			const keepApproachId = [];
			if (approaches) {
				for (const approach of approaches) {
					if (approach.id) {
						const findApproach = await this.appraisalApproachesStore.findAppraisalApproaches({
							id: approach.id,
							appraisal_id: editAppraisalId,
						});
						if (findApproach) {
							//updating info in appraisal approach
							await this.appraisalApproachesStore.updateAppraisalApproaches(approach.id, approach);
							keepApproachId.push(approach.id);
						}
					} else {
						//creating new approach for appraisal
						if (!createdAppraisal) {
							approach.appraisal_id = editAppraisalId;
						} else {
							approach.appraisal_id = createdAppraisal.id;
						}
						const createApproach =
							await this.appraisalApproachesStore.createAppraisalApproaches(approach);
						keepApproachId.push(createApproach.id);
					}
				}

				// Removing appraisal approaches
				await this.appraisalApproachesStore.removeAppraisalApproaches(
					keepApproachId,
					editAppraisalId,
				);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_SAVE_SUCCESS,
				data: createdAppraisal,
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
	 * @description Function to update map boundaries.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateMapBoundary = async (
		request: IMapBoundaryRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
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
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
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
					existingKey: findAppraisal?.map_image_url,
					field: 'map_image_url',
					fileName: `appraisals/${appraisalId}/map_image_url-${uuidv4()}.png`,
				},
				{
					url: map_image_for_report_url,
					existingKey: findAppraisal?.map_image_for_report_url,
					field: 'map_image_for_report_url',
					fileName: `appraisals/${appraisalId}/map_image_for_report_url-${uuidv4()}.png`,
				},
			];

			for (const { url, existingKey, fileName, field } of uploads) {
				const uploadedUrl = await uploadFunction.uploadMapBoundary(url, existingKey, fileName);
				restAttributes[field] = uploadedUrl;
			}

			//Attempt to update the appraisal
			const mapBoundary = await this.storage.updateAppraisal(restAttributes, appraisalId);
			if (!mapBoundary) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.APPRAISAL_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_SAVE_SUCCESS,
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
			const params = await helperFunction.validate(uploadImagechema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { field, type, imageId } = request.body;
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const metaAttr = {
				appraisal_id: appraisalId,
				name: field,
			};
			//Check images is saved in metadata table
			const imageMetadata = await this.appraisalMetaDataStorage.findDataByAttribute(metaAttr);
			const fileMetaData: IAppraisalMetaData = metaAttr;
			const attribute: Partial<IAppraisalFilesData> = {
				title: field,
				origin: FileOriginEnum.APPRAISAL_IMAGES,
				appraisal_id: appraisalId,
			};
			if (imageId) {
				attribute.id = imageId;
			}
			const file = await this.appraisalFilesStorage.findFilesByAttribute(attribute);
			if ((file && file?.title !== UploadEnum.EXTRA_IMAGE) || imageId) {
				if (uploadFunction.removeFromServer(file?.dir)) {
					if (file?.title !== UploadEnum.EXTRA_IMAGE) {
						this.appraisalFilesStorage.removeFilesById(file?.id);
					}
				}
				fileMetaData.value = null;
			}
			const metadata = await sharp(request.file.path).metadata();
			const { width, height } = metadata;
			const url = await uploadFunction.addFile({ file: request.file, id: appraisalId, type });
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
			const origin = FileOriginEnum.APPRAISAL_IMAGES;
			const storage = FileStorageEnum.SERVER;
			const fileAttributes: Partial<IAppraisalFilesData> = {
				type: mimetype,
				size,
				dir: url,
				filename: fileName,
				appraisal_id: appraisalId,
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
				fileData = await this.appraisalFilesStorage.update(fileAttributes);
			} else {
				fileData = await this.appraisalFilesStorage.create(fileAttributes);
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
				await this.appraisalMetaDataStorage.update(imageMetadata.id, fileMetaData);
			} else {
				if (file && file.title != UploadEnum.EXTRA_IMAGE) {
					await this.appraisalMetaDataStorage.create(fileMetaData);
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
	 * @description Function to update area info
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateAreaInfo = async (
		request: IAreaInfoRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
		try {
			// Validate the request schema
			const params = await helperFunction.validate(areaInfoSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attributes = params.value;
			//Attempt to update the appraisal
			const areaInfo = await this.appraisalMetaDataStorage.saveAreaInfo(
				attributes,
				appraisalId,
				AppraisalsEnum.APPRAISAL_ID,
			);
			if (!areaInfo) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.APPRAISAL_UPDATE_FAIL,
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
			const { appraisal_approaches } = findAppraisal;
			// Screens next and previous value
			const incomeApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.INCOME,
			);
			const saleApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.SALE,
			);
			const costApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.COST,
			);
			let next: string;
			if (incomeApproach) {
				next = ScreenEnums.INCOME_APPROACH;
			} else if (saleApproach) {
				next = ScreenEnums.SALE_APPROACH;
			} else if (costApproach) {
				next = ScreenEnums.COST_APPROACH;
			} else {
				next = ScreenEnums.EXHIBITS;
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_SAVE_SUCCESS,
				previous: ScreenEnums.AERIAL_MAP_PAGE,
				next,
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
			const image_id = Number(request?.query?.image_id);
			const appraisal_id = Number(request?.query?.appraisal_id);
			const field = String(request?.query?.field);
			if (!image_id || !appraisal_id || !field) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// const { image_id, appraisal_id, field } = request.body;
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisal_id });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attribute = {
				id: image_id,
				title: field,
				origin: FileOriginEnum.APPRAISAL_IMAGES,
			};
			const file = await this.appraisalFilesStorage.findFilesByAttribute(attribute);
			if (!file) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_IMAGES_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			if (uploadFunction.removeFromServer(file.dir)) {
				this.appraisalFilesStorage.removeFilesById(file.id);
			}
			const metaAttr = {
				appraisal_id: appraisal_id,
				name: field,
			};
			//Check images is saved in metadata table
			const imageMetadata = await this.appraisalMetaDataStorage.findDataByAttribute(metaAttr);
			if (imageMetadata && imageMetadata.id) {
				this.appraisalMetaDataStorage.removeById(imageMetadata.id);
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
	public postExhibits = async (
		request: IPostExhibitsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUploadSuccess<IUploadURLSuccessData>;
		try {
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
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
				id: appraisalId,
				type: UploadEnum.APPRAISAL,
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
			const origin = FileOriginEnum.APPRAISAL_EXHIBITS;
			let order = 1;
			const allFiles = await this.appraisalFilesStorage.findFiles({ appraisal_id: appraisalId });
			if (allFiles?.length) {
				const lastElement = allFiles[allFiles?.length - 1];
				order = lastElement?.order + 1;
			}
			const fileAttributes = {
				type: mimetype,
				size,
				dir: url,
				filename: fileName,
				appraisal_id: appraisalId,
				height,
				width,
				title: null,
				description: UploadEnum.EXHIBITS,
				origin,
				storage,
				order,
			};
			const fileData = await this.appraisalFilesStorage.create(fileAttributes);
			if (!fileData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: FileEnum.FILE_UPLOAD_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { appraisal_approaches } = findAppraisal;
			// Screens previous value
			const costApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.COST,
			);
			const saleApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.SALE,
			);
			const incomeApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.INCOME,
			);
			let previous: string;
			if (costApproach) {
				previous = ScreenEnums.COST_APPROACH;
			} else if (saleApproach) {
				previous = ScreenEnums.SALE_APPROACH;
			} else if (incomeApproach) {
				previous = ScreenEnums.INCOME_APPROACH;
			} else {
				previous = ScreenEnums.AREA_INFO;
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: FileEnum.FILE_UPLOAD_SUCCESS,
				data: { id: fileData.id, url: S3_BASE_URL + url },
				previous,
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
			const file = await this.appraisalFilesStorage.findFilesByAttribute(attribute);
			if (file) {
				if (uploadFunction.removeFromServer(file.dir)) {
					this.appraisalFilesStorage.removeFilesById(file.id);
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
	 * @description Function to update aerial map.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateAerialMap = async (
		request: IAerialMapRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
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
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attributes = params.value;
			//Attempt to update the appraisal
			const aerialMap = await this.storage.updateAppraisal(attributes, appraisalId);
			if (!aerialMap) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.APPRAISAL_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_SAVE_SUCCESS,
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
	 * @description Function to get appraisal by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAppraisal = async (
		request: IGetAppraisalRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
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
			const appraisalId = parseInt(request?.params?.id);
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attribute = { id: appraisalId, account_id: account_id, user_id: id };
			if (role === RoleEnum.ADMINISTRATOR) {
				delete attribute?.user_id;
			} else if (role === RoleEnum.USER) {
				delete attribute?.account_id;
			} else if (role === RoleEnum.SUPER_ADMINISTRATOR) {
				delete attribute?.user_id;
				delete attribute?.account_id;
			}
			//finding by appraisal id
			const appraisalInfo = await this.storage.getAppraisal(attribute);
			if (!appraisalInfo) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_DATA,
				data: appraisalInfo,
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
	 * @description Function to get appraisals files
	 * @param request
	 * @param response
	 */
	public getAppraisalFiles = async (
		request: IGetAppraisalRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisalFiles[]>;
		try {
			const { role } = request.user;
			const appraisalId = parseInt(request?.params?.id);
			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const origin = request?.query?.origin as string;
			const findAppraisalFile = await this.appraisalFilesStorage.findFiles({
				appraisal_id: appraisalId,
				origin: origin,
			});
			if (!findAppraisalFile.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.APPRAISAL_IMAGES_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_DATA,
				data: findAppraisalFile,
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
		let data: IError | IAppraisalSuccess<IAppraisalFilesData>;
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
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const { appraisalFilesId, field, value }: IUpdateExhibits = request.body;

			// Construct the attributes object dynamically
			const attributes: IFilesPosition = {
				id: appraisalFilesId,
				[field]: value,
			};
			const updatePosition = await this.appraisalFilesStorage.updateAppraisalFiles(attributes);
			if (!updatePosition) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.EXHIBIT_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { appraisal_approaches } = findAppraisal;
			// Screens previous value
			const costApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.COST,
			);
			const saleApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.SALE,
			);
			const incomeApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.INCOME,
			);
			let previous: string;
			if (costApproach) {
				previous = ScreenEnums.COST_APPROACH;
			} else if (saleApproach) {
				previous = ScreenEnums.SALE_APPROACH;
			} else if (incomeApproach) {
				previous = ScreenEnums.INCOME_APPROACH;
			} else {
				previous = ScreenEnums.AREA_INFO;
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.EXHIBIT_UPDATE_SUCCESS,
				position: ScreenEnums.EXHIBITS,
				previous,
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
	 * @description Function to save income approach screen data
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveIncomeApproachDetails = async (
		request: IAppraisalIncomeCreateUpdateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisalIncomeApproach>;
		try {
			// Validate the request body
			const params = await helperFunction.validate(incomeApproachesSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { appraisal_id } = request.body;

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisal_id });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const { role, account_id, id } = request.user;
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const attributes = params.value;
			// Checking if requested approach type is income or not
			const isValidApproachType = await this.appraisalApproachesStore.findAppraisalApproaches({
				id: attributes.appraisal_approach_id,
				appraisal_id,
				type: AppraisalsEnum.INCOME,
			});
			if (!isValidApproachType) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPROACH_TYPE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Checking duplicate record of income approach by appraisal approach id.
			const incomeApproachData = await this.appraisalIncomeStore.findByAttribute({
				appraisal_approach_id: attributes.appraisal_approach_id,
			});
			let appraisalIncomeApproachId : number;

			const { incomeSources, operatingExpenses, otherIncomeSources, ...incomeAttributes } = params.value;
			// If request id is null then create new record of appraisal income approach
			if (!attributes.id) {
				if (incomeApproachData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// const saveIncomeData = await this.appraisalIncomeStore.createIncomeApproach(attributes);
				const saveIncomeData = await this.appraisalIncomeStore.createIncomeApproach(incomeAttributes);
				if (!saveIncomeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.INCOME_APPROACH_SAVE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				appraisalIncomeApproachId = saveIncomeData.id;
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.INCOME_APPROACH_SAVED_SUCCESS,
					data: saveIncomeData,
				};
			} else {
				if (!incomeApproachData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AppraisalEnum.INCOME_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
			 	appraisalIncomeApproachId = incomeApproachData.id;
				let updateIncomeData: boolean;
				if (Object.keys(incomeAttributes).length > 0) {
					updateIncomeData = await this.appraisalIncomeStore.updateIncomeApproach(incomeAttributes);
				}
				if (!updateIncomeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.INCOME_APPROACH_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			let keepIds: number[] = [];
			// Handle income sources
			// Appraisal income source add, update, delete.
			if (incomeSources) {
				keepIds = await this.handleIncomeSourcesOrOperatingExpenses({
					incomeSources,
					appraisalIncomeApproachId: appraisalIncomeApproachId,
				});
			}
			if (otherIncomeSources) {
				keepIds = await this.handleIncomeSourcesOrOperatingExpenses({
					otherIncomeSources,
					appraisalIncomeApproachId: appraisalIncomeApproachId,
				});
			}
			if (operatingExpenses) {
				keepIds = await this.handleIncomeSourcesOrOperatingExpenses({
					operatingExpenses,
					appraisalIncomeApproachId: appraisalIncomeApproachId,
				});
			}
			if (!keepIds) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INCOME_APPROACH_UPDATE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.INCOME_APPROACH_SAVED_SUCCESS,
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
	 * @description Function to handle income source and operating expenses, add, update, delete.
	 * @param attributes
	 * @returns
	 */
	public async handleIncomeSourcesOrOperatingExpenses(
		attributes: Partial<handleIncomeSourceOrOpExp>,
	): Promise<number[]> {
		try {
			const { incomeSources, operatingExpenses, otherIncomeSources, appraisalIncomeApproachId } =
				attributes;
			const itemList = incomeSources || operatingExpenses || otherIncomeSources;
			let store;
			if (incomeSources) {
				store = this.appraisalIncomeSourceStore;
			} else if (operatingExpenses) {
				store = this.appraisalOperatingExpenseStore;
			} else if (otherIncomeSources) {
				store = this.appraisalOtherIncomeSourceStore;
			}
			const idKey = AppraisalIncomeEnum.APPRAISAL_INCOME_APPROACH_ID;

			const keepIds: number[] = [];
			for (const item of itemList) {
				if (item.id) {
					const foundItem = await store.find(item.id);
					if (foundItem) {
						await store.update(item.id, item);
						keepIds.push(item.id);
					}
				} else {
					item[idKey] = appraisalIncomeApproachId;
					const createdItem = await store.create(item);
					keepIds.push(createdItem.id);
				}
			}

			await store.remove(keepIds, appraisalIncomeApproachId);
			return keepIds;
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Function to get list of appraisals.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAppraisalList = async (
		request: IAppraisalListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisalListSuccess>;
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
			const params = await helperFunction.validate(appraisalListSchema, request.body);
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

			//fetching appraisals list
			const appraisalList = await this.storage.getAppraisalList(attributes);
			if (!appraisalList.appraisals.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.APPRAISALS_DATA_NOT_FOUND,
					data: appraisalList,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: appraisalList,
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
	 * @description Function to get appraisal income approach id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAppraisalIncomeApproach = async (
		request: IGetIncomeApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisalIncomeApproach>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			//validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//validating  query params appraisalApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
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

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			//Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			//get appraisal income approach
			const incomeApproachData = await this.appraisalIncomeStore.findByAttribute({
				appraisal_approach_id: appraisalApproachId,
			});

			// If requested income approach not found
			if (!incomeApproachData) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.INCOME_APPROACH_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.INCOME_APPROACH_DATA,
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
	 * @description Function to get area info of appraisal by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAreaInfo = async (
		request: IGetAreaInfoRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IGetAllAreaInfo>;
		try {
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			//Attempt to get area info of appraisal
			const areaInfo = await this.appraisalMetaDataStorage.getAreaInfo({
				appraisal_id: appraisalId,
			});
			const { appraisal_approaches } = findAppraisal;
			// Screens next and previous value
			const incomeApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.INCOME,
			);
			const saleApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.SALE,
			);
			const costApproach = await helperFunction.searchObject(
				appraisal_approaches,
				AppraisalsEnum.TYPE,
				AppraisalsEnum.COST,
			);
			let next: string;
			if (incomeApproach) {
				next = ScreenEnums.INCOME_APPROACH;
			} else if (saleApproach) {
				next = ScreenEnums.SALE_APPROACH;
			} else if (costApproach) {
				next = ScreenEnums.COST_APPROACH;
			} else {
				next = ScreenEnums.EXHIBITS;
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.AREA_INFO_DATA,
				data: { areaInfo },
				next,
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
	 * @description Advance filter to search comps for appraisal.
	 * @param request
	 * @param response
	 * @returns
	 */
	public advancedFiltersForApproaches = async (
		request: ICompsListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IComp[]>;
		try {
			// Validate schema
			const params = await helperFunction.validate(compsListSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { role, account_id } = request.user;
			const attributes = request.body;
			let accountId: number;
			// Checking permissions
			if (!requiredRoles.includes(role)) {
				accountId = account_id;
			}

			// Searching comps
			const comps = await this.compStore.advanceSearch(attributes, request?.user, accountId);
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
	 * @description Function to get selected comps.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSelectedComps = async (
		request: IGetSelectedCompRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IComp[]>;
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
		request: SaveSalesApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ISalesApproach>;
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
			const { sales_approach, appraisal_id, ...attributes } = request.body;
			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisal_id });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Checking if requested appraisal approach is of type sale or not
			const checkApproachType = await this.appraisalApproachesStore.findAppraisalApproaches({
				id: sales_approach.appraisal_approach_id,
				appraisal_id,
				type: AppraisalsEnum.SALE,
			});
			if (!checkApproachType) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPROACH_TYPE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Updating weighted_market_value in appraisal table.
			await this.storage.updateAppraisal(attributes, appraisal_id);

			// Creating new records for sale approach
			if (!sales_approach.id) {
				// Checking duplicate record of sale approach by appraisal approach id.
				const findSaleData = await this.appraisalSalesApproachStore.findOne({
					appraisal_approach_id: sales_approach.appraisal_approach_id,
				});
				if (findSaleData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving sales approach data in appraisal sales approaches table
				const saveSaleApproach =
					await this.appraisalSalesApproachStore.createSalesApproach(sales_approach);
				if (!saveSaleApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.SALE_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.SALE_APPROACH_SAVED_SUCCESS,
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
				const findSalesData = await this.appraisalSalesApproachStore.findOne({
					appraisal_approach_id: sales_approach.appraisal_approach_id,
				});
				if (!findSalesData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AppraisalEnum.SALES_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const {
					subject_property_adjustments,
					subject_qualitative_adjustments,
					sales_comparison_attributes,
					comps,
					...rest
				} = sales_approach;
				let updateSalesData: boolean;
				if (Object.keys(rest)?.length > 0) {
					updateSalesData = await this.appraisalSalesApproachStore.updateSalesApproach(rest);
				}
				if (!updateSalesData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.SALE_APPROACH_DATA_UPDATE_FAILED,
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
							message: AppraisalEnum.SALES_APPROACH_SUB_ADJ_UPDATE_FAILED,
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
					const updateAppraisalSubAdj = await this.syncSalesSubjectAdjustments(
						sales_approach.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateAppraisalSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: AppraisalEnum.SALES_APPROACH_SUB_ADJ_UPDATE_FAILED,
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
							message: AppraisalEnum.SALE_SUB_QUALITATIVE_ADJ_UPDATE_FAIL,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Handling comps of sales approach
				if (comps) {
					const updateSalesComps = await this.synchronizeSalesComps(sales_approach.id, comps);
					if (!updateSalesComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: AppraisalEnum.SALES_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.SALE_APPROACH_SAVED_SUCCESS,
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
	 * @description Function to get sales approach data by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSalesApproach = async (
		request: GetSalesApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ISalesApproach>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating  query params appraisal ApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the appraisal by id
			const findAppraisal = await this.storage.findValidAppraisal(appraisalId);
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate approach
			const validApproach = await this.appraisalApproachesStore.findAppraisalApproaches({
				appraisal_id: appraisalId,
				id: appraisalApproachId,
			});
			// If requested sales approach not found
			if (!validApproach) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.SALES_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Get appraisal sales approach
			const salesApproachData = await this.appraisalSalesApproachStore.findByAttribute({
				appraisal_approach_id: appraisalApproachId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.SALE_APPROACH_DATA,
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
			const existingAdjustments = await this.appraisalSaleSubAdjStore.findAdjustments({
				appraisal_sales_approach_id: saleApproachId,
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
					appraisal_sales_approach_id: saleApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_sales_approach_id: saleApproachId,
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
							appraisal_sales_approach_id: saleApproachId,
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
				...adjustmentsToAdd.map((adj) => this.appraisalSaleSubAdjStore.createAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.appraisalSaleSubAdjStore.removeAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.appraisalSaleSubAdjStore.updateAdjustments(adj)),
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
			const existingComps = await this.appraisalSalesCompsStore.findSalesComps({
				appraisal_sales_approach_id: salesApproachId,
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
				const createdComp = await this.appraisalSalesCompsStore.createSalesComps({
					...comp,
					appraisal_sales_approach_id: salesApproachId,
				});
				await this.syncSalesCompAdjustments(createdComp.id, comp.comps_adjustments);
				await this.syncSalesCompQualitativeAdj(createdComp.id, comp.comps_qualitative_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.appraisalSalesCompsStore.updateSalesComps(comp);
				await this.syncSalesCompAdjustments(comp.id, comp.comps_adjustments);
				await this.syncSalesCompQualitativeAdj(comp.id, comp.comps_qualitative_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.appraisalSalesCompAdjStore.removeAdjustments({
					appraisal_sales_approach_comp_id: id,
				});
				await this.appraisalSalesCompsStore.removeSalesComps({ id });
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
			const existingAdjustments = await this.appraisalSalesCompAdjStore.findAdjustments({
				appraisal_sales_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				appraisal_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				appraisal_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_sales_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.appraisalSalesCompAdjStore.createAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.appraisalSalesCompAdjStore.updateAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.appraisalSalesCompAdjStore.removeAdjustments(adj)),
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
	 * @description Function to save cost approach land.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveCostApproachLand = async (
		request: ISaveCostApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ICostApproach>;
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
			const params = await helperFunction.validate(costApproachSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { cost_approach, appraisal_id, ...attributes } = request.body;
			const { id, appraisal_approach_id } = cost_approach;
			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({
				id: appraisal_id,
			});
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Checking if requested appraisal approach is of type cost or not
			const checkApproachType = await this.appraisalApproachesStore.findAppraisalApproaches({
				id: appraisal_approach_id,
				appraisal_id,
				type: AppraisalsEnum.COST,
			});
			if (!checkApproachType) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPROACH_TYPE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			if (attributes) {
				// Updating weighted_market_value and position in appraisal table.
				await this.storage.updateAppraisal(attributes, appraisal_id);
			}
			// Checking duplicate record of cost approach by appraisal approach id.
			const findCostData = await this.appraisalCostApproachStore.findByAttribute({
				appraisal_approach_id,
			});
			// Creating new records for cost approach
			if (!id) {
				if (findCostData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving cost approach data in appraisal cost approaches table
				const saveCostApproach =
					await this.appraisalCostApproachStore.createCostApproach(cost_approach);
				if (!saveCostApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.COST_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.COST_APPROACH_SAVED_SUCCESS,
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
						message: AppraisalEnum.COST_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const { cost_subject_property_adjustments, comps, ...rest } = cost_approach;
				rest.total_cost_valuation = findCostData.total_depreciated_cost
					? findCostData.total_depreciated_cost + rest.land_value
					: 0;
				rest.indicated_value_psf = rest.land_value
					? rest.total_cost_valuation / rest.land_value
					: 0;
				rest.indicated_value_punit = findAppraisal.total_units
					? rest.total_cost_valuation / findAppraisal.total_units
					: 0;
				rest.indicated_value_pbed = findAppraisal.total_beds
					? rest.total_cost_valuation / findAppraisal.total_beds
					: 0;
				let updateCostData: boolean;
				if (Object.keys(rest).length > 0) {
					updateCostData = await this.appraisalCostApproachStore.updateCostApproach(rest);
				}
				if (!updateCostData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.COST_APPROACH_DATA_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				// Handle cost_subject_property_adjustments
				if (cost_subject_property_adjustments) {
					const updatedSubjectPropertyAdjustments = cost_subject_property_adjustments.map(
						(item, index) => ({
							...item,
							order: index + 1, // Start order from 1 and increment by 1
						}),
					);
					const updateAppraisalCostSubAdj = await this.syncCostSubjectAdjustments(
						cost_approach?.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateAppraisalCostSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: AppraisalEnum.COST_APPROACH_SUB_ADJ_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				if (comps) {
					const updateCostComps = await this.synchronizeCostComps(cost_approach.id, comps);
					if (!updateCostComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: AppraisalEnum.COST_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.COST_APPROACH_SAVED_SUCCESS,
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
	 * @description Function to get cost approach data by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getCostApproach = async (
		request: GetCostApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ICostApproach>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating query params appraisal ApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate approach
			const validApproach = await this.appraisalApproachesStore.findAppraisalApproaches({
				appraisal_id: appraisalId,
				id: appraisalApproachId,
			});
			// If requested cost approach not found
			if (!validApproach) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.COST_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Get appraisal cost approach
			const costApproachData = await this.appraisalCostApproachStore.findByAttribute({
				appraisal_approach_id: appraisalApproachId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.COST_APPROACH_DATA,
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
	 * @description Function to delete appraisal by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public deleteAppraisal = async (
		request: IDeleteAppraisalRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const appraisalId = parseInt(request.params.id);
			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const { role, account_id, id } = request.user;
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Deleting appraisal
			const deletedAppraisal = await this.storage.deleteAppraisal({ id: appraisalId });
			if (!deletedAppraisal) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.APPRAISAL_DELETE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_DELETED,
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
			const existingAdjustments = await this.appraisalCostSubAdjStore.findAdjustments({
				appraisal_cost_approach_id: costApproachId,
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
					appraisal_cost_approach_id: costApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_cost_approach_id: costApproachId,
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
							appraisal_cost_approach_id: costApproachId,
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
				...adjustmentsToAdd.map((adj) => this.appraisalCostSubAdjStore.createAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.appraisalCostSubAdjStore.removeAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.appraisalCostSubAdjStore.updateAdjustments(adj)),
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
			const existingComps = await this.appraisalCostCompsStore.findCostComps({
				appraisal_cost_approach_id: costApproachId,
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
				const createdComp = await this.appraisalCostCompsStore.createCostComps({
					...comp,
					appraisal_cost_approach_id: costApproachId,
				});
				await this.syncCostCompAdjustments(createdComp.id, comp.comps_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.appraisalCostCompsStore.updateCostComps(comp);
				await this.syncCostCompAdjustments(comp.id, comp.comps_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.appraisalCostCompAdjStore.removeAdjustments({
					appraisal_cost_approach_comp_id: id,
				});
				await this.appraisalCostCompsStore.removeCostComps({ id });
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
			const existingAdjustments = await this.appraisalCostCompAdjStore.findAdjustments({
				appraisal_cost_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				appraisal_cost_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				appraisal_cost_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_cost_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.appraisalCostCompAdjStore.createAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.appraisalCostCompAdjStore.updateAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.appraisalCostCompAdjStore.removeAdjustments(adj)),
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
		let data: IError | IAppraisalSuccess<ISaveCostImprovements>;
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
			const { appraisal_id, appraisal_approach_id, improvements, ...attributes } = request.body;

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({
				id: appraisal_id,
			});
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Checking if requested appraisal approach is of type cost or not
			const checkApproachType = await this.appraisalApproachesStore.findAppraisalApproaches({
				id: appraisal_approach_id,
				appraisal_id,
				type: AppraisalsEnum.COST,
			});
			if (!checkApproachType) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPROACH_TYPE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			if (attributes) {
				if (!attributes.id || attributes.id === undefined) {
					attributes.appraisal_approach_id = appraisal_approach_id;
					const findData = await this.appraisalCostApproachStore.findByAttribute({
						appraisal_approach_id,
					});
					if (!findData) {
						const saveCostApproach =
							await this.appraisalCostApproachStore.createCostApproach(attributes);
						if (!saveCostApproach) {
							data = {
								statusCode: StatusCodeEnum.BAD_REQUEST,
								message: AppraisalEnum.COST_APPROACH_SAVE_FAIL,
							};
							return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
						}
						attributes.id = saveCostApproach.id;
					} else {
						attributes.id = findData.id;
					}
				}
				// Updating improvements data in appraisal cost approaches table
				const findCostApproach = await this.appraisalCostApproachStore.findByAttribute({
					id: attributes.id,
				});
				if (!findCostApproach) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AppraisalEnum.COST_APPROACH_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const updateCostApproach =
					await this.appraisalCostApproachStore.updateCostApproach(attributes);
				if (updateCostApproach === false) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.COST_APPROACH_DATA_UPDATE_FAILED,
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
						message: AppraisalEnum.COST_IMPROVEMENTS_SAVE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.COST_IMPROVEMENTS_SAVE_SUCCESS,
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
			const existingImprovements = await this.appraisalCostImprovementStore?.findAll({
				appraisal_cost_approach_id: costApproachId,
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
				await this.appraisalCostImprovementStore.create({
					...improvement,
					appraisal_cost_approach_id: costApproachId,
				});
			});

			// Batch update existing improvements
			const updatePromises = improvementsToUpdate.map(async (improvement) => {
				await this.appraisalCostImprovementStore.update(improvement);
			});

			// Batch delete old improvements
			const deletePromises = improvementsToDelete.map(async (id) => {
				await this.appraisalCostImprovementStore.delete({ id });
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
	 * @description Function to update area map info in appraisal sale approaches.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveAreaMap = async (request: ISaveAreaMapReq, response: Response): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ICostApproach | ISalesApproach | ILeaseApproach>;
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
			const params = await helperFunction.validate(saveAreaMapSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = request.body;
			const id = parseInt(request.params.id);
			const url = request.originalUrl;

			const isCostApproach = url.includes(AppraisalsEnum.COST_AREA_MAP);
			const isSaleApproach = url.includes(AppraisalsEnum.SALE_AREA_MAP);
			const isLeaseApproach = url.includes(AppraisalsEnum.LEASE_AREA_MAP);

			let findData: ICostApproach | ISalesApproach | ILeaseApproach;
			let updateData: boolean;

			if (isCostApproach) {
				findData = await this.appraisalCostApproachStore.findOne({ id });
				if (findData) {
					updateData = await this.appraisalCostApproachStore.updateCostApproach({
						...attributes,
						id,
					});
				}
			} else if (isSaleApproach) {
				findData = await this.appraisalSalesApproachStore.findOne({ id });
				if (findData) {
					updateData = await this.appraisalSalesApproachStore.updateSalesApproach({
						...attributes,
						id,
					});
				}
			} else if (isLeaseApproach) {
				findData = await this.appraisalLeaseApproachStore.findOne({ id });
				if (findData) {
					updateData = await this.appraisalLeaseApproachStore.updateLeaseApproach({
						...attributes,
						id,
					});
				}
			}

			if (!findData) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.THIS_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			if (!updateData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.AREA_INFO_UPDATE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.AREA_INFO_UPDATE_SUCCESS,
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
	 * @description Function to get data of appraisals for pdf.
	 * @param request
	 * @param response
	 * @returns
	 */
	public generateAppraisalReport = async (
		request: IGetInfoForPdf,
		response: Response,
	): Promise<Response | void | any> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
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

			// Extract appraisal ID from request parameters
			const appraisalId = parseInt(request?.params?.id);

			// Fetch appraisal data by ID
			const appraisalData: IAppraisal = await this.storage.getAppraisalInfoForPdf({
				id: appraisalId,
			});

			// If appraisal data is not found, return an error
			if (!appraisalData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPRAISAL_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const timestamp = Timestamp(new Date());
			// Generate HTML content for the appraisal report
			const htmlContent = await this.getPDFContent(appraisalData);
			const htmlFile = `HTMLReport${timestamp}.html`;

			// Use fs.promises to write the HTML content asynchronously
			await fs.promises.writeFile(htmlFile, htmlContent);

			// Define the output DOCX file with a timestamp in the name
			const outputFile = `AppraisalReport${timestamp}.docx`;

			// Convert HTML to DOCX using Pandoc with a table of contents (ToC) and custom formatting
			const pandocCommand = `pandoc --lua-filter=./././reportReference/formatting.lua -f html -t docx --toc --toc-depth=3 --reference-doc=./././reportReference/custom-reference.docx --standalone ${htmlFile} -o ${outputFile}`;

			return new Promise((resolve, reject) => {
				exec(pandocCommand, async (error) => {
					if (error) {
						return reject(error);
					}

					// Set the file location for the generated DOCX file
					const fileLocation = path.join(process.cwd(), outputFile);

					// Create a read stream for the DOCX file
					const stream = fs.createReadStream(fileLocation);

					// Set response headers to prompt the user for download
					response.setHeader('Content-Disposition', `attachment; filename=${outputFile}`);
					response.setHeader(
						'Content-Type',
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					);

					// Pipe the DOCX file stream to the response
					stream.pipe(response);

					// Listen for 'finish' event to delete the DOCX after it has been sent
					response.on('finish', () => {
						// Asynchronously delete the DOCX file after sending it
						fs.promises
							.unlink(fileLocation)
							.catch((err) => console.error('Error deleting DOCX file:', err));
					});

					// Asynchronously start deleting the HTML file without blocking the response
					fs.promises
						.unlink(htmlFile)
						.catch((err) => console.error('Error deleting HTML file:', err));

					// Handle any errors during file streaming
					stream.on('error', (streamError) => {
						console.error('Error during file streaming:', streamError);
						// Delete the file if there was an error during streaming
						fs.promises
							.unlink(fileLocation)
							.catch((err) => console.error('Error deleting file after stream error:', err));
						response.status(500).send('Error sending file');
					});
				});
			});
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
	 * @description Function to update income approaches.
	 * @param data
	 */
	public updateApproaches = async (
		data: IAppraisalsUpdateRequest,
		comp_type: string,
	): Promise<boolean> => {
		try {
			const id = data.id;
			// Retrieve the old data for the given ID
			const appraisalData: IAppraisal = await this.storage.getAppraisal({ id });
			// Loop through each appraisal approach in the old data
			for (const approach of appraisalData.appraisal_approaches) {
				// Check if the approach type is 'income'
				if (approach.type === AppraisalsEnum.INCOME && approach?.appraisal_income_approach) {
					// Extract the ID of the income approach
					const appraisalIncomeApproachId = approach?.appraisal_income_approach?.id;
					// If the income approach ID exists
					if (appraisalIncomeApproachId) {
						if (data.comp_type != comp_type) {
							await this.appraisalIncomeSourceStore.removeByAttribute({ link_overview: 1 });
						}
						const incomeSource: IIncomeSource[] = await this.appraisalIncomeSourceStore.findAll({
							appraisal_income_approach_id: appraisalIncomeApproachId,
						});
						if (
							!incomeSource.length &&
							data.comp_type == AppraisalsEnum.LAND_ONLY
							// data.comp_type == AppraisalsEnum.LAND_ONLY &&
							// comp_type != AppraisalsEnum.LAND_ONLY
						) {
							const attributes = {
								appraisal_income_approach_id: appraisalIncomeApproachId,
								type: data.land_type,
								sf_source: data.land_size,
								comments: AppraisalsEnum.LAND_ONLY_TYPE as string,
								monthly_income: 0,
								annual_income: 0,
								rent_unit: 0,
								unit: 0,
								rent_bed: 0,
								bed: 0,
								rent_sq_ft: 0,
								link_overview: 1,
							};
							await this.appraisalIncomeSourceStore.create(attributes);
						} else if (data.comp_type == AppraisalsEnum.LAND_ONLY) {
							// Only update the income source where link_overview is 1
							if (incomeSource.length) {
								const overviewSource = incomeSource.find((src) => src.link_overview === 1);
								if (overviewSource) {
									const attributes = {
										type: data.land_type,
										sf_source: data.land_size,
									};
									await this.appraisalIncomeSourceStore.update(overviewSource.id, attributes);
								}
							}
						}

						// Prepare attributes for calculating the income approach
						const incomeAttributes = { data, income: approach?.appraisal_income_approach };
						// Calculate the incremental value using the income approach
						this.calculateIncomeApproach(incomeAttributes);
					}
				} else if (approach.type === AppraisalsEnum.SALE && approach?.appraisal_sales_approach) {
					// Extract the ID of the sale approach
					const appraisalApproachId = approach?.appraisal_sales_approach?.id;
					// Prepare attributes for calculating the sale approach
					if (appraisalApproachId) {
						const saleAttributes = { data, sale: approach?.appraisal_sales_approach };
						this.setSalesPsfValues(saleAttributes);
					}
				} else if (approach.type === AppraisalsEnum.COST && approach?.appraisal_cost_approach) {
					// Extract the ID of the cost approach
					const appraisalApproachId = approach?.appraisal_cost_approach?.id;
					// Prepare attributes for calculating the cost approach
					if (appraisalApproachId) {
						const costAttributes = { data, cost: approach?.appraisal_cost_approach };
						this.setCostPsfValues(costAttributes);
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
			const approachId = income.appraisal_approach_id;
			const incomeId = income?.id;
			// Retrieve income data based on the income ID
			const incomeData = await this.appraisalIncomeStore.findByAttribute({
				id: incomeId,
			});
			// Check if income data exists
			if (!incomeData) {
				return; // Exit if income data does not exist
			}
			// Calculate land size
			const landSize = await this.getLandSize(data);
			// Prepare comparison basis
			const comparisonBasis = data.comparison_basis.replace(' ', '_').toLowerCase();
			const sSpace =
				data.comparison_basis !== AppraisalsEnum.SF ? comparisonBasis : AppraisalsEnum.SQ_FT;
			// Retrieve income sources based on the income approach ID
			let incomeSource: IIncomeSource[] = await this.appraisalIncomeSourceStore.findAll({
				appraisal_income_approach_id: incomeId,
			});
			const zonings = await this.zoningStore.findAll({
				appraisal_id: data.id,
			});
			const zoningsNotInIncomeSource: any = zonings.filter((zoning: any) => {
				// Check if the zoning id is not present in any incomeSource's zoning_id
				return !incomeSource.some((income) => income.zoning_id === zoning.dataValues.id);
			});
			if (zoningsNotInIncomeSource) {
				for (const source of zoningsNotInIncomeSource) {
					const zoningData = source.dataValues;
					const attributes = {
						appraisal_income_approach_id: incomeId,
						zoning_id: zoningData.id,
						type: zoningData.sub_zone,
						space: zoningData.sub_zone,
						sf_source: zoningData.sq_ft,
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
					await this.appraisalIncomeSourceStore.create(attributes);
				}
				incomeSource = await this.appraisalIncomeSourceStore.findAll({
					appraisal_income_approach_id: incomeId,
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
				if (data.comp_type === AppraisalsEnum.BUILDING_WITH_LAND && zoneId) {
					incomeData.total_sq_ft = 0;
					// Retrieve zone data based on zone ID
					const zoneData: IZoning = await this.zoningStore.findByPk(zoneId);
					// Proceed if zone data exists
					if (zoneData) {
						// Determine source space and rent field based on comparison basis
						let sourceSpace: string = AppraisalsEnum.SF_SOURCE;
						let rentField: string = IncomeApproachEnum.RENT_SQ_FT;
						if (data.comparison_basis !== AppraisalsEnum.SF) {
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
				} else if (data.comp_type === AppraisalsEnum.LAND_ONLY) {
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
				this.appraisalIncomeStore.remove({ appraisal_approach_id: approachId });
			}
			// Calculate vacancy amount
			const vacancyAmount = incomeData.vacancy ? (annualIncomeTotal * incomeData.vacancy) / 100 : 0;
			const adjustedGrossAmount = annualIncomeTotal - vacancyAmount;
			// Retrieve operating expenses based on the income approach ID
			const operatingExpense = await this.appraisalOperatingExpenseStore.findAll({
				appraisal_income_approach_id: incomeId,
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
					if (data.comp_type && data.comp_type != AppraisalsEnum.LAND_ONLY) {
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
				data.comparison_basis !== AppraisalsEnum.SF
					? IncomeApproachEnum.TOTAL_OE_PER + '_' + comparisonBasis
					: IncomeApproachEnum.TOTAL_OE_PER_SQUARE_FEET;
			incomeData[oePerSpaceLabel] = oePerSquareFeet;
			if (data.comp_type && data.comp_type != AppraisalsEnum.LAND_ONLY) {
				incomeData.total_oe_per_square_feet = oePerSquareFeetTotal;
			}
			incomeData.total_oe_gross = oeGross;
			// Calculate and update additional income data based on specified conditions
			// (e.g., monthly and annual capitalization rates, indicated ranges)

			if (incomeData.monthly_capitalization_rate) {
				// incomeData.total_net_income = adjustedGrossAmount - incomeData.total_oe_annual_amount;
				incomeData.total_net_income =
					adjustedGrossAmount +
					(incomeData?.other_total_annual_income || 0) -
					incomeData.total_oe_annual_amount;
				const highCapitalizationRate = IncomeApproachEnum.HIGH_CAP_RATE;
				const keyLabel =
					data.comparison_basis !== AppraisalsEnum.SF
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
					data.comparison_basis !== AppraisalsEnum.SF ? comparisonBasis : AppraisalsEnum.SQ_FT;
				const comparisonRange = IncomeApproachEnum.INDICATED_RANGE + '_' + spaceLabel;
				incomeData[comparisonRange] = sqFtCapitalizationRate
					? incomeData.total_net_income / (sqFtCapitalizationRate / 100)
					: 0;
			}
			const spaceLabel =
				data.comparison_basis !== AppraisalsEnum.SF ? comparisonBasis : AppraisalsEnum.SQ_FT;
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
			};
			// Update income data in the database
			await this.appraisalIncomeStore.updateIncomeApproach(incomeDataUpdate);
			// Handle income sources and operating expenses
			if (incomeSourceData) {
				await this.handleIncomeSourcesOrOperatingExpenses({
					incomeSources: incomeSourceData,
					appraisalIncomeApproachId: income.id,
				});
			}
			if (operatingExpenseData) {
				await this.handleIncomeSourcesOrOperatingExpenses({
					operatingExpenses: operatingExpenseData,
					appraisalIncomeApproachId: income.id,
				});
			}

			return annual;
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
	 * @description Function to get land size calculations.
	 * @param data
	 * @returns
	 */
	public getLandSize = async (data: IAppraisalsUpdateRequest): Promise<number> => {
		try {
			let landSize = data.building_size;
			// Check if the comparison type is LAND_ONLY
			if (data.comp_type && data.comp_type === AppraisalsEnum.LAND_ONLY) {
				// If comparison type is LAND_ONLY, check if the land dimension is ACRE and analysis type is not PRICE_ACRE
				if (
					data.land_dimension === AppraisalsEnum.ACRE &&
					data.analysis_type !== AppraisalsEnum.PRICE_ACRE
				) {
					// If the land dimension is ACRE and analysis type is not PRICE_ACRE, convert land size to square feet
					landSize = data.land_size * 43560; // Convert acres to square feet
				} else {
					// Otherwise, just use the provided land size
					landSize = data.land_size;
				}
			} else if (data.comparison_basis !== AppraisalsEnum.SF) {
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
	 * @description Function to calculate sale approach
	 * @param saleAttributes
	 */
	public setSalesPsfValues = async (saleAttributes: ICalculateSale): Promise<boolean> => {
		try {
			const { data, sale } = saleAttributes;
			// Fetch the sales approach data for the given appraisal ID
			const saleData: ISalesApproach = await this.appraisalSalesApproachStore.findByAttribute({
				id: sale.id,
			});
			// Fetch all zoning data for the given appraisal ID
			const zoningData: IZoning[] = await this.zoningStore.findAll({ appraisal_id: data.id });
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
					data.comp_type === AppraisalsEnum.BUILDING_WITH_LAND &&
					data.comparison_basis === AppraisalsEnum.SF
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
			// Prepare the sales approach data to be updated
			const saleApproachData = {
				id: sale.id,
				sales_approach_value: salesApproachValue,
				total_comp_adj: totalCompAdj,
			};
			// Update the sales approach data in the store
			await this.appraisalSalesApproachStore.updateSalesApproach(saleApproachData);
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
			const appraisalCostApproach = await this.appraisalCostApproachStore.findByAttribute({
				id: cost.id,
			});
			// Initialize variables
			let landSize = data.land_size || 0;
			let totalCostValuation = 0,
				landValue = 0,
				indicatedValuePsf = 0;
			// Calculate land value if averaged adjusted PSF is available
			if (appraisalCostApproach && appraisalCostApproach.averaged_adjusted_psf) {
				const averagedAdjustedPsf = appraisalCostApproach.averaged_adjusted_psf;
				landValue = parseFloat((averagedAdjustedPsf * landSize).toFixed(2));
			}
			// Initialize improvement-related variables from the appraisal cost approach
			let improvementsTotalSfArea = appraisalCostApproach.improvements_total_sf_area || 0;
			let improvementsTotalAdjustedCost =
				appraisalCostApproach.improvements_total_adjusted_cost || 0;
			let indicatedValuePunit = appraisalCostApproach.indicated_value_punit || 0;
			let indicatedValuePbed = appraisalCostApproach.indicated_value_pbed || 0;

			let overallReplacementCost = 0,
				totalDepreciation = 0;
			const newImprovements: Partial<ICostImprovements>[] = [];
			// Fetch all improvements related to the current appraisal cost approach
			let improvements: ICostImprovements[] = await this.appraisalCostImprovementStore.findAll({
				appraisal_cost_approach_id: appraisalCostApproach.id,
			});
			const zonings = await this.zoningStore.findAll({
				appraisal_id: data.id,
			});
			const zoningsNotInImprovements: any = zonings.filter((zoning: any) => {
				// Check if the zoning id is not present in any improvements's zoning_id
				return !improvements.some((improvement) => improvement.zoning_id === zoning.dataValues.id);
			});
			if (zoningsNotInImprovements) {
				for (const source of zoningsNotInImprovements) {
					const zoningData = source.dataValues;
					const attributes = {
						appraisal_cost_approach_id: appraisalCostApproach.id,
						zoning_id: zoningData.id,
						type: zoningData.sub_zone,
						sf_area: zoningData.sq_ft,
					};
					await this.appraisalCostImprovementStore.create(attributes);
				}
				improvements = await this.appraisalCostImprovementStore.findAll({
					appraisal_cost_approach_id: appraisalCostApproach.id,
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
				this.appraisalCostImprovementStore.bulkCreate(newImprovements);
				// Calculate total cost valuation and indicated value per square foot
				totalCostValuation = landValue + improvementsTotalAdjustedCost;
				indicatedValuePsf = totalCostValuation / improvementsTotalSfArea;
				// Adjust indicated values based on comparison basis if not square footage
				if (data.comparison_basis !== AppraisalsEnum.SF) {
					const propSize = data.zonings.map(
						(z: IZoning) => z[data.comparison_basis.replace(' ', '_').toLowerCase()],
					);
					landSize = propSize.reduce((a: number, b: number) => a + b, 0);
					const indicatedValue = totalCostValuation / landSize;

					if (data.comparison_basis.toLowerCase() === AppraisalsEnum.UNIT) {
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
			// Prepare the data to be updated in the cost approach record
			const costData = {
				land_value: landValue,
				overall_replacement_cost: overallReplacementCost,
				total_depreciation: totalDepreciation,
				incremental_value: 0, // Assuming this is calculated somewhere else
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
				await this.appraisalCostApproachStore.updateCostApproach(costData);
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
	 * @description Function to update positions of exhibits.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateExhibitsPositions = async (
		request: IUpdatePositions,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisalFilesData[]>;
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
			const appraisalId = parseInt(request?.params?.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
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
					updatePosition.push(await this.appraisalFilesStorage.updateAppraisalFiles(exhibit));
				}
			}
			if (!updatePosition?.length) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.EXHIBIT_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.EXHIBIT_UPDATE_SUCCESS,
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
	 * @description Function
	 * @param request
	 * @param response
	 * @returns
	 */
	public linkExistedTemplate = async (
		request: linkExistTempRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ITemplate>;
		try {
			const { account_id, role, id } = request.user;
			// Role validations to create template
			if (!permittedRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate schema
			const params = await helperFunction.validate(linkTempSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = { ...request.body, account_id, created_by: id };
			const { appraisal_id } = attributes;
			// Checking if Appraisal id is valid or not
			const findAppraisal = await this.storage.findByAttribute({ id: appraisal_id });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPRAISAL_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const templateId = request?.body?.template_id;
			if (templateId) {
				const findBy: Partial<ITemplate> = {
					id: templateId,
				};
				if (role === RoleEnum.ADMINISTRATOR) {
					findBy.account_id = account_id;
				}
				const findTemplate = await this.templateStore.findTemp(findBy);

				if (!findTemplate) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: TemplateEnum.TEMPLATE_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				if (appraisal_id) {
					// Checking if template already exists for appraisal or not
					const findTemplate = await this.templateStore.findByAttribute({ appraisal_id });
					if (findTemplate) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: TemplateEnum.TEMPLATE_ALREADY_EXISTS,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				const findTemplateData = await this.templateStore.findByAttribute(findBy);
				const tempData = findTemplateData?.dataValues;
				tempData.appraisal_id = appraisal_id;
				tempData.created_by = id;
				const createTemplate = await this.templateStore.createTemplateForAppraisal(tempData);

				if (!createTemplate) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: TemplateEnum.TEMPLATE_SAVE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.TEMPLATE_SAVE_SUCCESS,
					data: createTemplate,
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
	 * @description Function to get pdf content
	 * @param appraisalData
	 * @returns
	 */
	public getPDFContent = async (appraisalData: IAppraisal): Promise<string> => {
		try {
			const { id, comparison_basis, analysis_type, comp_type } = appraisalData;

			//*****************Do not remove commented code in this function we will use in future****************/

			// const [templateData, appraisalInfo, getExhibits] = await Promise.all([
			// 	this.templateStore.findByAttribute({ appraisal_id: id }),
			// 	this.storage.getAppraisal({ id }),
			// 	this.appraisalFilesStorage.findFiles({
			// 		appraisal_id: id,
			// 		origin: FileOriginEnum.APPRAISAL_EXHIBITS,
			// 	}),
			// ]);

			// Fetch templateData, exhibits, and appraisalInfo concurrently
			const [templateData, appraisalInfo] = await Promise.all([
				this.templateStore.findByAttribute({ appraisal_id: id }),
				this.storage.getAppraisal({ id }),
			]);

			// Start building HTML content
			let htmlContent = `<html><body>`;
			let itemAttributes = {};
			if (templateData) {
				const { sections } = templateData.dataValues;

				// Collect promises for items processing in parallel to avoid blocking in loops
				const sectionPromises = sections.map(async (section) => {
					let sectionHtml = `<h1>${section.title}</h1>`;
					const { items } = section;
					if (items) {
						itemAttributes = { items, appraisalId: id, comparison_basis, analysis_type, comp_type };
						sectionHtml += await this.getItemData(itemAttributes);
					}
					return sectionHtml;
				});

				// Resolve all section HTML strings in parallel
				const resolvedSections = await Promise.all(sectionPromises);
				htmlContent += resolvedSections.join('');
			}

			// Get all merge fields and fetch associated data
			const mergeFields = await helperFunction.getAllTags(htmlContent);

			if (mergeFields?.length) {
				// Fetch data for merge fields in parallel
				const fieldsData = await this.templateService.iterateMergeFieldsData(
					mergeFields,
					appraisalInfo,
				);
				htmlContent = await helperFunction.replaceAllTags(htmlContent, fieldsData);
			}

			// Process exhibits if they exist and append to HTML
			// if (getExhibits) {
			// 	htmlContent += await this.loadExhibits(getExhibits, id);
			// }

			// Complete the HTML content
			htmlContent += '</body></html>'; // Load the HTML content into Cheerio
			const $ = cheerio.load(htmlContent);

			// Set text-align: left for all <td> elements that don't already have text-align set
			$('td').each((i, el) => {
				const td = $(el);
				if (!td.attr('style') || !td.attr('style').includes('text-align')) {
					td.attr('style', (td.attr('style') || '') + 'text-align: left;');
				}
			});

			// Get the updated HTML content
			const updatedHtml = $.html();

			return updatedHtml;
		} catch (e) {
			// Logging error
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
	 * @description Function to get section data
	 * @param data
	 * @returns
	 */
	public getSectionData = async (sectionAttributes): Promise<string> => {
		let htmlContent = '';
		let itemAttributes = {};
		const { subsections, appraisalId, comparison_basis } = sectionAttributes;
		if (subsections) {
			const subSection = subsections;
			const { items, title } = subSection;
			itemAttributes = { items, appraisalId, comparison_basis };
			htmlContent += `<h3>${title}</h3>`;
			if (items) {
				itemAttributes = { items, appraisalId, comparison_basis };
				htmlContent += await this.getItemData(itemAttributes);
			}
		}
		return htmlContent;
	};

	/**
	 * @description Function to get section and subsections items data
	 * @param data
	 * @returns
	 */
	public getItemData = async (itemAttributes): Promise<string> => {
		const { items, appraisalId, comparison_basis, analysis_type, comp_type } = itemAttributes;
		if (!items?.length) return '';

		// Collect promises for all asynchronous operations inside the loop
		const itemPromises = items.map(async (item) => {
			let itemHtml = '';
			const { subsections } = item;
			let sectionAttributes = {};

			// Process subsections if present
			if (subsections) {
				sectionAttributes = { subsections, appraisalId, comparison_basis };
				itemHtml += await this.getSectionData(sectionAttributes);
			}

			const key = item.type;
			let mapURL = '';
			let imageUrl;

			// Fetch the map URL if the item type is MAP
			if (key === ReportTemplateEnum.MAP) {
				mapURL = await this.getMapImageUrl(item?.content, appraisalId);
			}
			const noPhotoUrl =
				'data:image/png;base64,' +
				(await fs.readFileSync('./src/images/no-photo-available.png', { encoding: 'base64' }));
			// Switch case to handle different types of report items
			switch (key) {
				case ReportTemplateEnum.IMAGE:
					if (item?.content === '') {
						imageUrl = noPhotoUrl;
					} else {
						imageUrl = item?.content;
					}
					itemHtml += `<figure>
									<div style="text-align: center;">
										<img src="${imageUrl}" alt="image" style="text-align:center"/>
									</div>
								</figure><br>`;
					break;
				case ReportTemplateEnum.MAP:
					{
						let mapName: string;
						if (item?.content === ReportTemplateEnum.AERIAL_MAP) {
							mapName = `Aerial View of Subject Property`;
						} else if (
							typeof item?.content === 'string' &&
							item.content.includes(AppraisalsEnum.SALE)
						) {
							mapName = `Sales Map`;
						} else if (
							typeof item?.content === 'string' &&
							item.content.includes(AppraisalsEnum.COST)
						) {
							mapName = `Cost Map`;
						} else if (item?.content === ReportTemplateEnum.MAP_BOUNDARY) {
							mapName = `Map Boundary`;
						}
						itemHtml += `<h3>${mapName}</h3><img src="${mapURL || noPhotoUrl}" alt="Map" width="800" height="400"/><br><br>`;
					}
					break;
				case ReportTemplateEnum.APPROACH: {
					const { id, tag } = await helperFunction.splitField(item?.content);
					switch (tag) {
						case AppraisalsEnum.SALE:
							itemHtml += await this.saleApproachDataGet(id, appraisalId);
							break;
						case AppraisalsEnum.COST:
							itemHtml += await this.getCostApproachData(id, appraisalId);
							break;
						case AppraisalsEnum.INCOME:
							itemHtml += await this.getIncomeApproachData({
								appraisalApproachId: id,
								comparisonBase: comparison_basis,
								appraisalId,
								analysisType: analysis_type,
								compType: comp_type,
							});
							break;
						case AppraisalsEnum.LEASE:
							itemHtml += await this.getLeaseApproachData(id, appraisalId);
							break;
						case AppraisalsEnum.RENT_ROLL:
							itemHtml += await this.rentRollComponent({
								appraisalApproachId: id,
								appraisalId,
							});
							break;
					}
					break;
				}
				case ReportTemplateEnum.TEXT_BLOCK:
					itemHtml += item?.content;
					break;
				case ReportTemplateEnum.PHOTO_PAGES:
					itemHtml += await this.getPhotoPagesData(appraisalId);
					break;
				case AppraisalsEnum.INCOME_COMPARISON:
					itemHtml += await this.incomeComparisonComponent({
						appraisalId,
					});
					break;
				default:
					break;
			}

			return itemHtml; // Return the generated HTML for each item
		});

		// Wait for all itemPromises to resolve
		const resolvedItems = await Promise.all(itemPromises);

		// Concatenate all HTML strings
		return resolvedItems.join('');
	};

	/**
	 * @description Function to get map images url
	 * @param type
	 * @returns
	 */
	public getMapImageUrl = async (type: string, appraisalId: number): Promise<string> => {
		try {
			const locations: { lat: string; lng: string; color: string }[] = [];
			const colors = [
				// ReportTemplateEnum.RED,
				ReportTemplateEnum.GREEN,
				ReportTemplateEnum.YELLOW,
				ReportTemplateEnum.ORANGE,
				ReportTemplateEnum.PURPLE,
				ReportTemplateEnum.BLUE,
			];
			let zoom = 20;
			const appraisalInfo = await this.storage.getAppraisal({ id: appraisalId });
			const {
				aerial_map_zoom,
				map_pin_lat,
				map_pin_lng,
				map_image_url,
				aerial_map_type,
				map_center_lat,
				map_center_lng,
			} = appraisalInfo;
			if (type === ReportTemplateEnum.MAP_BOUNDARY) {
				return map_image_url ? `${S3_BASE_URL}${map_image_url}` : '';
			}
			if (aerial_map_zoom) {
				zoom = aerial_map_zoom - 2;
			}
			const apiKey = GOOGLE_MAPS_API_KEY;
			const { tag, id } = await helperFunction.splitField(type);

			// Default map settings
			locations.push({ lat: map_pin_lat, lng: map_pin_lng, color: ReportTemplateEnum.RED });

			if (type === ReportTemplateEnum.AERIAL_MAP) {
				return `https://maps.googleapis.com/maps/api/staticmap?center=${map_center_lat || map_pin_lat},${map_center_lng || map_pin_lng}&zoom=${zoom}&size=600x400&maptype=${aerial_map_type ? aerial_map_type : 'roadmap'}&markers=color:red%7C${map_pin_lat},${map_pin_lng}&key=${apiKey}`;
			}

			let comps = [];
			let area_map_zoom = 12;
			let map_type = 'roadmap';
			let map_center_lat_position: string;
			let map_center_lng_position: string;
			let saleApproachData: ISalesApproach;
			let approach: IAppraisalApproach[];
			let costApproachData: ICostApproach;

			if (tag === AppraisalsEnum.SALE) {
				if (!id) {
					approach = await this.appraisalApproachesStore.findSelectedApproaches({
						appraisal_id: appraisalId,
						type: AppraisalsEnum.SALE,
					});
					saleApproachData = await this.appraisalSalesApproachStore.findByAttribute({
						appraisal_approach_id: approach[0].id,
					});
				} else {
					saleApproachData = await this.appraisalSalesApproachStore.findByAttribute({
						appraisal_approach_id: id,
					});
				}
				comps = saleApproachData?.comps;
				if (saleApproachData) {
					area_map_zoom = saleApproachData?.area_map_zoom;
					map_type = saleApproachData?.map_type;
					map_center_lat_position = saleApproachData.map_center_lat
						? saleApproachData.map_center_lat
						: map_pin_lat;
					map_center_lng_position = saleApproachData.map_center_lng
						? saleApproachData.map_center_lng
						: map_pin_lng;
				}
			} else if (tag === AppraisalsEnum.COST) {
				if (!id) {
					approach = await this.appraisalApproachesStore.findSelectedApproaches({
						appraisal_id: appraisalId,
						type: AppraisalsEnum.COST,
					});
					costApproachData = await this.appraisalCostApproachStore.findByAttribute({
						appraisal_approach_id: approach[0].id,
					});
				} else {
					costApproachData = await this.appraisalCostApproachStore.findByAttribute({
						appraisal_approach_id: id,
					});
					comps = costApproachData?.comps;
					if (costApproachData) {
						area_map_zoom = costApproachData?.area_map_zoom;
						map_type = costApproachData?.map_type;
						map_center_lat_position = costApproachData.map_center_lat
							? costApproachData.map_center_lat
							: map_pin_lat;
						map_center_lng_position = costApproachData.map_center_lng
							? costApproachData.map_center_lng
							: map_pin_lng;
					}
				}
			}

			if (area_map_zoom) {
				zoom = area_map_zoom - 2;
			}

			// Add locations from comps with dynamic colors
			if (comps) {
				comps.forEach((comp, index) => {
					let { map_pin_lat, map_pin_lng } = comp.comp_details;
					const color = colors[index % colors.length];
					if (!map_pin_lat) {
						map_pin_lat = appraisalInfo?.map_pin_lat;
					}
					if (!map_pin_lng) {
						map_pin_lng = appraisalInfo?.map_pin_lng;
					}
					locations.push({ lat: map_pin_lat, lng: map_pin_lng, color });
				});
			}
			// Construct the URL with markers
			const markers = locations
				.map((location) => `markers=color:${location.color}%7C${location.lat},${location.lng}`)
				.join('&');
			const url = `https://maps.googleapis.com/maps/api/staticmap?center=${map_center_lat_position},${map_center_lng_position}&zoom=${zoom}&size=600x400&maptype=${map_type}&${markers}&key=${apiKey}`;

			return url;
		} catch (e) {
			// Logging error
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
	 * @description Function to get sale data
	 * @returns
	 */
	public getSaleApproachData = async (
		appraisalApproachId,
		appraisalId: number,
	): Promise<string> => {
		try {
			let htmlContent = '';
			let comps: ISalesComp[] = [];
			let subPropertyAdjustments = [];
			let subQualitativeAdj = [];
			let averagedAdjustedPsf = 0;
			let salesApproachValue = 0;
			let saleApproachData: ISalesApproach;
			let approach;
			let saleName = '';
			// Fetch appraisal data for subject property.
			const [appraisalInfo, images] = await Promise.all([
				this.storage.getAppraisal({ id: appraisalId }),
				this.appraisalFilesStorage.findFilesByAttribute({
					appraisal_id: appraisalId,
					title: ImagesPageEnum.COVER,
				}),
			]);
			if (appraisalApproachId) {
				saleApproachData = await this.appraisalSalesApproachStore.findByAttribute({
					appraisal_approach_id: appraisalApproachId,
				});
				approach = await this.appraisalApproachesStore.findAppraisalApproaches({
					id: saleApproachData?.appraisal_approach_id,
				});
				saleName = approach?.name;
			} else {
				approach = await this.appraisalApproachesStore.findSelectedApproaches({
					appraisal_id: appraisalId,
					type: AppraisalsEnum.SALE,
				});
				saleApproachData = await this.appraisalSalesApproachStore.findByAttribute({
					appraisal_approach_id: approach[0].id,
				});
				saleName = approach[0].name;
			}

			if (saleApproachData) {
				comps = saleApproachData?.comps;
				subPropertyAdjustments = saleApproachData?.subject_property_adjustments;
				averagedAdjustedPsf = saleApproachData?.averaged_adjusted_psf;
				salesApproachValue = saleApproachData?.sales_approach_value;
				subQualitativeAdj = saleApproachData.subject_qualitative_adjustments;
			}

			const {
				street_address,
				city,
				state,
				zipcode,
				building_size,
				land_size,
				condition,
				zonings,
				comparison_basis,
				comp_type,
				land_type,
				utilities_select,
				topography,
				lot_shape,
				analysis_type,
				year_built,
				year_remodeled,
			} = appraisalInfo;

			htmlContent += `<h2>Sales Comparison <b>Approach</b> (${saleName || AppraisalsEnum.NA})</h2>`;
			htmlContent += `<table  style="width:100%" border="1"><tr><td></td><td><b>Subject Property</b></td>`;

			const noPhotoUrl =
				'data:image/png;base64,' +
				(await fs.readFileSync('./src/images/no-photo-available.png', { encoding: 'base64' }));
			// Add headers for each comparable
			comps.forEach((_, index) => {
				htmlContent += `<td><b>Comparable #${index + 1}</b></td>`;
			});
			const image = images ? `${S3_BASE_URL}${images?.dir}` : noPhotoUrl;
			htmlContent += `</tr><tr><td></td><td style="text-align: center;"><img src="${image}" alt="Property image" height = "100",width="300"></td>`;

			// Add empty cells for each comparable's image
			comps.forEach((comp) => {
				const { property_image_url } = comp.comp_details;

				const image = property_image_url ? `${S3_BASE_URL}${property_image_url}` : noPhotoUrl;
				htmlContent += `<td style="text-align: center;"><img src="${image}" alt="Property image" height = "100",width="300"></td>`;
			});
			let fullState;
			const getStates = await this.commonStore.findGlobalCodeByAttribute({
				type: GlobalCodeEnums.STATES,
			});
			const stateOptions = getStates?.options;
			const matchState = stateOptions.find((obj) => obj?.code === state);
			if (!matchState) {
				fullState = state;
			} else {
				fullState = matchState?.name;
			}
			htmlContent += `</tr><tr><td><b>Location</b></td><td>${street_address || AppraisalsEnum.NA}
			<br> ${city || AppraisalsEnum.NA}, ${fullState || AppraisalsEnum.NA},
			<br> ${zipcode || AppraisalsEnum.NA}</td>`;

			// Add location for each comparable
			comps.forEach((comp) => {
				const { street_address, city, state, zipcode } = comp.comp_details;
				let compState;
				let matchCompState;
				if (stateOptions) {
					matchCompState = stateOptions.find((obj) => obj?.code === state);
				}
				if (!matchCompState) {
					compState = state;
				} else {
					compState = matchCompState?.name;
				}
				htmlContent += `<td>${street_address || AppraisalsEnum.NA},
				<br> ${city || AppraisalsEnum.NA}, ${compState || AppraisalsEnum.NA},
				<br> ${zipcode || AppraisalsEnum.NA}</td>`;
			});

			htmlContent += `</tr><tr><td><b>Date Sold</b></td><td></td>`;

			// Add date sold for each comparable
			const dateSoldValues = await Promise.all(
				comps.map(async (comp) => {
					const { date_sold } = comp.comp_details;
					const formatDate = await helperFunction.formatDateToMDY(date_sold);
					return `<td>${formatDate || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Join all the <td> elements to add to the HTML content
			htmlContent += dateSoldValues.join('');

			// Add sales price for each comparable and subject property
			htmlContent += `</tr><tr><td><b>Sales Price</b></td><td></td>`;
			const salePrices = await Promise.all(
				comps.map(async (comp) => {
					const { sale_price } = comp.comp_details;
					const salePrice = await helperFunction.formatCurrency(sale_price);
					return `<td>${salePrice || AppraisalsEnum.NA}</td>`;
				}),
			);
			htmlContent += salePrices.join('');

			// Validation to add extra fields when comp type is land only
			if (comp_type === AppraisalsEnum.LAND_ONLY) {
				// Add land type for each comparable and subject property
				htmlContent += `</tr><tr><td><b>Land Type</b></td><td>${land_type || AppraisalsEnum.NA}</td>`;
				const landTypes = await Promise.all(
					comps.map(async (comp) => {
						const { land_type } = comp.comp_details;
						return `<td>${land_type || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += landTypes.join('');

				// Add land size for each comparable and subject property
				let landSize;
				if (analysis_type === AppraisalsEnum.PRICE_SF) {
					landSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
				} else if (analysis_type === AppraisalsEnum.PRICE_ACRE) {
					landSize = await helperFunction.formatNumber(land_size, 3, AppraisalsEnum.AC);
				}

				htmlContent += `</tr><tr><td><b>Land Size</b></td><td>${landSize || AppraisalsEnum.NA}</td>`;
				const landSizes = await Promise.all(
					comps.map(async (comp) => {
						const { land_size, land_dimension } = comp.comp_details;
						let compLandSize;
						if (
							appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
							land_dimension === AppraisalsEnum.ACRE
						) {
							const LandSize = land_size * 43560;
							compLandSize = await helperFunction.formatNumber(LandSize, 0, AppraisalsEnum.SF);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
							land_dimension === AppraisalsEnum.SF
						) {
							const LandSize = land_size / 43560;
							compLandSize = await helperFunction.formatNumber(LandSize, 3, AppraisalsEnum.AC);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
							land_dimension === AppraisalsEnum.SF
						) {
							compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
							land_dimension === AppraisalsEnum.ACRE
						) {
							compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.AC);
						}
						return `<td>${compLandSize || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += landSizes.join('');

				// Add Utilities for each comparable and subject property
				htmlContent += `</tr><tr><td><b>Utilities</b></td><td>${utilities_select || AppraisalsEnum.NA}</td>`;
				const utilities = await Promise.all(
					comps.map(async (comp) => {
						const { utilities_select } = comp.comp_details;
						return `<td>${utilities_select || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += utilities.join('');

				// Add Topography for each comparable and subject property
				htmlContent += `</tr><tr><td><b>Topography</b></td><td>${topography || AppraisalsEnum.NA}</td>`;
				const topographyHtml = await Promise.all(
					comps.map(async (comp) => {
						const { topography } = comp.comp_details;
						return `<td>${topography || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += topographyHtml.join('');

				// Add Shape for each comparable and subject property
				htmlContent += `</tr><tr><td><b>Shape</b></td><td>${lot_shape || AppraisalsEnum.NA}</td>`;
				const ShapeHtml = await Promise.all(
					comps.map(async (comp) => {
						const { lot_shape } = comp.comp_details;
						return `<td>${lot_shape || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += ShapeHtml.join('');
			} else if (comp_type === AppraisalsEnum.BUILDING_WITH_LAND) {
				// Get global code for zoning
				const attributes = { type: GlobalCodeEnums.ZONE };
				let subjectZone;
				let subjectSubZone;
				let subjectSubZoneValue: string;
				let subjectZoneValue: string;
				const zoning = await this.commonStore.findGlobalCodeByAttribute(attributes);
				const { options } = zoning;
				if (options) {
					subjectZone = options.find((obj) => obj?.code === zonings[0]?.zone);
				}
				if (!subjectZone) {
					subjectZoneValue = zonings[0]?.zone;
				} else {
					subjectZoneValue = subjectZone?.name;
				}
				const { sub_options } = subjectZone || {};
				if (sub_options) {
					subjectSubZone = sub_options.find((obj) => obj?.code === zonings[0]?.sub_zone);
				}
				if (!subjectSubZone) {
					subjectSubZoneValue = zonings[0]?.sub_zone;
				} else {
					subjectSubZoneValue = subjectSubZone?.name;
				}
				// Add property type for each comparable and subject property
				htmlContent += `</tr><tr><td><b>Property Type</b></td><td>${subjectZoneValue || AppraisalsEnum.NA}/${subjectSubZoneValue || AppraisalsEnum.NA}</td>`;
				comps.forEach((comp) => {
					const { zonings } = comp.comp_details;
					let zone;
					let subZone;
					let subZoneValue: string;
					let zoneValue: string;
					if (options) {
						zone = options.find((obj) => obj?.code === zonings[0]?.zone);
					}
					if (!zone) {
						zoneValue = zonings[0]?.zone;
					} else {
						zoneValue = zone?.name;
					}
					const { sub_options } = zone || {};
					if (sub_options) {
						subZone = sub_options.find((obj) => obj?.code === zonings[0]?.sub_zone);
					}
					if (!subZone) {
						subZoneValue = zonings[0]?.sub_zone;
					} else {
						subZoneValue = subZone?.name;
					}
					htmlContent += `<td>${zoneValue || AppraisalsEnum.NA}/${subZoneValue || AppraisalsEnum.NA}</td>`;
				});

				if (comparison_basis === AppraisalsEnum.BED) {
					// Add bed value for subject property
					const totalBeds = appraisalInfo?.zonings.reduce(
						(total, zoning) => total + (zoning?.bed || 0),
						0,
					);
					const subPropertyBeds = await helperFunction.formatNumber(totalBeds, 0, '');
					htmlContent += `</tr><tr><td><b>Beds</b></td><td>${subPropertyBeds || AppraisalsEnum.NA}</td>`;
					// Add bed value for each comparable
					const compBeds = comps.map(async (comp) => {
						const { total_beds } = comp.comp_details;
						const compBed = await helperFunction.formatNumber(total_beds, 0, '');
						return `<td>${compBed || AppraisalsEnum.NA}</td>`;
					});

					// If you need to resolve the promises before using the content
					const resolvedHtmlContent = await Promise.all(compBeds);
					htmlContent += resolvedHtmlContent.join('');
				} else if (comparison_basis === AppraisalsEnum.UNIT) {
					// Add unit value for subject property
					const totalUnits = appraisalInfo?.zonings.reduce(
						(total, zoning) => total + (zoning?.unit || 0),
						0,
					);
					const subPropertyUnits = await helperFunction.formatNumber(totalUnits, 0, '');
					htmlContent += `</tr><tr><td><b>Units</b></td><td>${subPropertyUnits || AppraisalsEnum.NA}</td>`;
					// Add unit value for each comparable
					const compUnits = comps.map(async (comp) => {
						const { total_units } = comp.comp_details;
						const compUnit = await helperFunction.formatNumber(total_units, 0, '');
						return `<td>${compUnit || AppraisalsEnum.NA}</td>`;
					});
					const resolvedHtmlContent = await Promise.all(compUnits);
					htmlContent += resolvedHtmlContent.join('');
				}

				// Add building size/land size for each comparable and subject property
				let landSize;
				if (analysis_type === AppraisalsEnum.PRICE_SF) {
					landSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
				} else if (analysis_type === AppraisalsEnum.PRICE_ACRE) {
					landSize = await helperFunction.formatNumber(land_size, 3, AppraisalsEnum.AC);
				}

				htmlContent += `</tr><tr><td><b>Building Size / Land Size</b></td><td>${await helperFunction.formatNumber(building_size, 0, AppraisalsEnum.SF)}/${landSize || AppraisalsEnum.NA}</td>`;
				const comparisonBasis = await Promise.all(
					comps.map(async (comp) => {
						const { building_size, comparison_basis, land_size, land_dimension } =
							comp.comp_details;
						const buildingSize = await helperFunction.formatNumber(
							building_size,
							0,
							comparison_basis,
						);

						let compLandSize;
						if (
							appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
							land_dimension === AppraisalsEnum.ACRE
						) {
							const LandSize = land_size * 43560;
							compLandSize = await helperFunction.formatNumber(LandSize, 0, AppraisalsEnum.SF);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
							land_dimension === AppraisalsEnum.SF
						) {
							const LandSize = land_size / 43560;
							compLandSize = await helperFunction.formatNumber(LandSize, 3, AppraisalsEnum.AC);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
							land_dimension === AppraisalsEnum.SF
						) {
							compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
							land_dimension === AppraisalsEnum.ACRE
						) {
							compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.AC);
						}

						return `<td>${buildingSize || AppraisalsEnum.NA}/${compLandSize || AppraisalsEnum.NA}</td>`;
					}),
				);

				htmlContent += comparisonBasis.join('');

				htmlContent += `</tr><tr><td><b>Year Built / Remodeled</b></td>`;
				htmlContent += `<td>${year_built || AppraisalsEnum.NA} / ${year_remodeled || AppraisalsEnum.NA}</td>`;
				// Add year built/remodeled for each comparable
				comps.forEach((comp) => {
					const { comp_details } = comp;
					htmlContent += `<td>${comp_details?.year_built || AppraisalsEnum.NA} / ${comp_details?.year_remodeled || AppraisalsEnum.NA}</td>`;
				});

				let matchCondition;
				let conditionValue;
				const subjectCondition = { type: GlobalCodeEnums.CONDITION };
				const conditionCodes = await this.commonStore.findGlobalCodeByAttribute(subjectCondition);
				const conditionOptions = conditionCodes?.options;
				if (conditionOptions) {
					matchCondition = conditionOptions.find((obj) => obj?.code === condition);
				}
				if (!matchCondition) {
					conditionValue = condition;
				} else {
					conditionValue = matchCondition?.name;
				}
				htmlContent += `</tr><tr><td><b>Condition</b></td><td>${conditionValue || AppraisalsEnum.NA}</td>`;

				// Add condition for each comparable
				comps.forEach(async (comp) => {
					const { condition } = comp.comp_details;
					let matchCompCondition;
					let compConditionValue;
					if (conditionOptions) {
						matchCompCondition = conditionOptions.find((obj) => obj?.code === condition);
					}
					if (!matchCompCondition) {
						compConditionValue = condition;
					} else {
						compConditionValue = matchCompCondition?.name;
					}
					htmlContent += `<td>${compConditionValue || AppraisalsEnum.NA}</td>`;
				});
			}
			htmlContent += `</tr><tr><td><b>Zoning</b></td><td></td>`;

			// Add zoning for each comparable
			comps.forEach((comp) => {
				const { comp_details } = comp;
				htmlContent += `<td>${comp_details?.zoning_type || AppraisalsEnum.NA}</td>`;
			});

			// Add $/SF for each comparable and subject property
			if (comparison_basis === AppraisalsEnum.SF) {
				htmlContent += `</tr><tr><td><b>$/SF</b></td><td></td>`;
				const compsSF = await Promise.all(
					comps.map(async (comp) => {
						const { comp_details } = comp;
						return `<td>${(await helperFunction.formatCurrency(comp_details?.price_square_foot)) + '/SF' || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsSF.join('');
			} else if (comparison_basis === AppraisalsEnum.BED) {
				htmlContent += `</tr><tr><td><b>$/Bed</b></td><td></td>`;
				const compsBed = await Promise.all(
					comps.map(async (comp) => {
						const { sale_price = 0, total_beds = 0 } = comp.comp_details || {};
						let bedPrice = 0;
						if (total_beds > 0) {
							bedPrice = sale_price / total_beds;
						}
						return `<td>${(await helperFunction.formatCurrency(bedPrice)) || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsBed.join('');
			} else if (comparison_basis === AppraisalsEnum.UNIT) {
				htmlContent += `</tr><tr><td><b>$/Unit</b></td><td></td>`;
				const compsUnit = await Promise.all(
					comps.map(async (comp) => {
						const { sale_price = 0, total_units = 0 } = comp.comp_details;
						let unitPrice = 0;
						if (total_units > 0) {
							unitPrice = sale_price / total_units;
						}
						return `<td>${(await helperFunction.formatCurrency(unitPrice)) || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsUnit.join('');
			}

			htmlContent += `</tr><tr><td><b>Comparison Criteria</b></td><td></td>`;

			// Add comparison criteria for each comparable
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			const subPropertyAdjHtml = await Promise.all(
				subPropertyAdjustments.map(async (subAdj) => {
					const { adj_key, adj_value } = subAdj;
					// Start building the HTML content for each adjustment
					let rowHtml = `</tr><tr><td>${adj_value || AppraisalsEnum.NA}</td><td></td>`;

					// Iterate over comps using map
					const compsHtml = await Promise.all(
						comps.map(async (comp) => {
							const { comps_adjustments } = comp;
							// Find the matching adjustment based on 'adj_key'
							const matchingAdjustment = comps_adjustments.find(
								(adjustment) => adjustment?.adj_key === adj_key,
							);
							// Extract the adjustment value
							const adjValue = matchingAdjustment?.adj_value;

							// Format the adjustment value using 'helperFunction.formatDecimal'
							const formatValue = await helperFunction.formatDecimal(
								adjValue,
								AppraisalsEnum.PERCENT,
							);
							// Return the generated HTML for this comp adjustment
							return `<td>${matchingAdjustment ? formatValue : AppraisalsEnum.NA}</td>`;
						}),
					);

					// Append the comps HTML to the row HTML
					rowHtml += compsHtml.join('');

					// Return the row HTML for this subject_property_adjustment
					return rowHtml;
				}),
			);
			// Join all the generated rows into the final HTML content
			htmlContent += subPropertyAdjHtml.join('');

			htmlContent += `</tr><tr><td><b>Qualitative Adjustments</b></td><td></td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			const subQualitativeAdjHtml = await Promise.all(
				subQualitativeAdj.map(async (subAdj) => {
					const { adj_key, adj_value } = subAdj;
					// Start building the HTML content for each adjustment
					let rowHtml = `</tr><tr><td>${adj_value || AppraisalsEnum.NA}</td><td></td>`;

					// Iterate over comps using map
					const compsHtml = await Promise.all(
						comps.map(async (comp) => {
							const { comps_qualitative_adjustments } = comp;
							// Find the matching adjustment based on 'adj_key'
							const matchingAdjustment = comps_qualitative_adjustments.find(
								(adjustment) => adjustment?.adj_key === adj_key,
							);
							// Extract the adjustment value
							const adjValue = matchingAdjustment?.adj_value;

							// Return the generated HTML for this comp adjustment
							return `<td>${matchingAdjustment ? adjValue : AppraisalsEnum.NA}</td>`;
						}),
					);

					// Append the comps HTML to the row HTML
					rowHtml += compsHtml.join('');

					// Return the row HTML for this subject_property_adjustment
					return rowHtml;
				}),
			);
			// Join all the generated rows into the final HTML content
			htmlContent += subQualitativeAdjHtml.join('');

			htmlContent += `</tr><tr><td><b>Overall Adjustment</b></td><td></td>`;
			const adjustmentsHtml = await Promise.all(
				comps.map(async (comp) => {
					const { total_adjustment } = comp;
					const formattedAdjustment = await helperFunction.formatNumber(
						total_adjustment,
						2,
						AppraisalsEnum.PERCENT,
					);
					return `<td>${formattedAdjustment || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Joining the generated HTML content
			htmlContent += adjustmentsHtml.join('');

			const label =
				comp_type === AppraisalsEnum.BUILDING_WITH_LAND
					? comparison_basis
					: analysis_type === AppraisalsEnum.PRICE_ACRE
						? AppraisalsEnum.AC
						: AppraisalsEnum.SF;
			// Adding adjusted $ value on the basis of comparison value
			htmlContent += `</tr><tr><td><b>Adjusted $/${label}</b></td><td></td>`;
			const adjustedPsfHtml = await Promise.all(
				comps.map(async (comp) => {
					const { adjusted_psf } = comp;
					const formattedPsf = await helperFunction.formatCurrency(adjusted_psf);
					return `<td>${formattedPsf + '/' + label || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Join all the generated table cell HTML content into a single string
			htmlContent += adjustedPsfHtml.join('');

			//Handling unit and bed case
			if (comparison_basis === AppraisalsEnum.BED) {
				htmlContent += `</tr><tr><td><b>Average Adjusted $/Bed</b></td><td>${(await helperFunction.formatCurrency(averagedAdjustedPsf)) + '/Bed' || AppraisalsEnum.NA}</td>`;
				comps.forEach(() => {
					htmlContent += `<td></td>`;
				});
			} else if (comparison_basis === AppraisalsEnum.UNIT) {
				htmlContent += `</tr><tr><td><b>Average Adjusted $/Unit</b></td><td>${(await helperFunction.formatCurrency(averagedAdjustedPsf)) + '/Unit' || AppraisalsEnum.NA}</td>`;
				comps.forEach(() => {
					htmlContent += `<td></td>`;
				});
			} else {
				htmlContent += `</tr><tr><td><b>Average Adjusted $/${label}</b></td><td>${(await helperFunction.formatCurrency(averagedAdjustedPsf)) + `/${label}` || AppraisalsEnum.NA}</td>`;
			}
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			htmlContent += `</tr><tr><td><b>Adjusted Comp Value</b></td><td>${(await helperFunction.formatCurrency(salesApproachValue)) || AppraisalsEnum.NA}</td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			htmlContent += `</tr></table><br>`;
			htmlContent += `<span><b>Notes- </b></span>${saleApproachData?.note || AppraisalsEnum.NA}`;
			return htmlContent;
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
	};
	/**
	 * @description Function to get tables of income approach of appraisal
	 * @param attributes
	 * @returns
	 */
	public getIncomeApproachData = async (
		attributes: Partial<IIncomeApproachHtml>,
	): Promise<string> => {
		try {
			const { appraisalApproachId, comparisonBase, appraisalId, analysisType, compType } =
				attributes;
			let htmlContent = '';
			let approachData: IAppraisalIncomeApproach;
			let approach;
			if (!appraisalApproachId) {
				approach = await this.appraisalApproachesStore.findSelectedApproaches({
					appraisal_id: appraisalId,
					type: AppraisalsEnum.INCOME,
				});
				if (approach && approach?.length > 0) {
					approachData = await this.appraisalIncomeStore.findByAttribute({
						appraisal_approach_id: approach[0].id,
					});
				}
			} else {
				// Fetch appraisal income data based on the appraisal approach ID
				approachData = await this.appraisalIncomeStore.findByAttribute({
					appraisal_approach_id: appraisalApproachId,
				});
				approach = await this.appraisalApproachesStore.findAppraisalApproaches({
					id: approachData?.appraisal_approach_id,
				});
			}

			htmlContent += `<h2>Income Approach (${approach?.name || AppraisalsEnum.NA}) </h2>`;
			const {
				incomeSources = [],
				otherIncomeSources = [],
				operatingExpenses = [],
				total_oe_annual_amount = 0,
				total_oe_gross = 0,
				total_oe_per_square_feet = 0,
			} = approachData || {};

			let sourceRows = '';
			let expenseRows = '';
			let otherIncomeSource = '';
			let formatComparison;

			const {
				total_monthly_income = 0,
				total_annual_income = 0,
				total_rent_sq_ft = 0,
				total_bed = 0,
				total_unit = 0,
				vacant_amount = 0,
				adjusted_gross_amount = 0,
				total_sq_ft = 0,
				income_notes = '',
				vacancy = 0,
				expense_notes = '',
				total_net_income = 0,
				monthly_capitalization_rate = 0,
				annual_capitalization_rate = 0,
				sq_ft_capitalization_rate = 0,
				indicated_range_monthly = 0,
				indicated_range_annual = 0,
				indicated_range_sq_feet = 0,
				indicated_psf_monthly = 0,
				indicated_psf_sq_feet = 0,
				indicated_psf_annual = 0,
				total_oe_per_bed = 0,
				total_oe_per_unit = 0,
				other_total_monthly_income = 0,
				other_total_annual_income = 0,
				other_total_sq_ft = 0,
				cap_rate_notes = '',
			} = approachData || {};

			//Fetch land type
			const landTypes = await this.commonStore.findGlobalCodeByAttribute({ type: 'land_type' });
			const landOptions = landTypes?.options;
			// Iterate through income sources and construct HTML rows for each
			for (const source of incomeSources) {
				const {
					monthly_income = 0,
					annual_income = 0,
					rent_sq_ft = 0,
					sf_source = 0,
					comments = '',
					type = '',
					unit = 0,
					bed = 0,
				} = source || {};

				if (comparisonBase === AppraisalsEnum.SF) {
					formatComparison = helperFunction.formatCurrency(rent_sq_ft);
				} else if (comparisonBase === AppraisalsEnum.UNIT) {
					formatComparison = helperFunction.formatNumber(unit, 0, AppraisalsEnum.UNIT);
				} else if (comparisonBase === AppraisalsEnum.BED) {
					formatComparison = helperFunction.formatNumber(bed, 0, AppraisalsEnum.BED);
				} else {
					formatComparison = '';
				}
				const [monthlyIncome, annualIncome, comparisonBasis] = await Promise.all([
					helperFunction.formatCurrency(monthly_income),
					helperFunction.formatCurrency(annual_income),
					formatComparison,
				]);
				let sfSource = '';
				if (compType === AppraisalsEnum.LAND_ONLY && analysisType === AppraisalsEnum.PRICE_SF) {
					sfSource = await helperFunction.formatNumber(sf_source, 0, AppraisalsEnum.SF);
				} else if (analysisType === AppraisalsEnum.PRICE_ACRE) {
					sfSource = await helperFunction.formatNumber(sf_source, 3, AppraisalsEnum.AC);
				} else {
					sfSource = await helperFunction.formatNumber(sf_source, 0, AppraisalsEnum.SF);
				}

				// Get global code for zoning
				const attributes = { type: GlobalCodeEnums.ZONE };
				const zoningCodes = await this.commonStore.findGlobalCodeByAttribute(attributes);
				const { options } = zoningCodes;
				const subZonesCode = await this.commonStore.getGlobalSubOptions({
					global_code_category_id: 1,
				});
				// Add property type for each comparable
				let zone;
				let subZone;
				let zoneValue: string;
				if (options) {
					zone = options.find((obj) => obj?.code === comments);
				}
				if (!zone) {
					zoneValue = comments;
				} else {
					zoneValue = zone?.name;
				}

				if (subZonesCode) {
					subZone =
						compType === AppraisalsEnum.BUILDING_WITH_LAND
							? subZonesCode.find((obj) => obj?.code === type)
							: landOptions?.find((obj) => obj?.code === type);
				}
				const subZoneValue = subZone ? subZone.name : type;

				sourceRows += `<tr><td>${subZoneValue}</td>
					<td>${monthlyIncome}</td>
					<td>${annualIncome}</td>
					<td>${comparisonBasis}</td>
					<td>${sfSource}</td>
					<td>${zoneValue}</td></tr>`;
			}

			// Iterate through income sources and construct HTML rows for each
			for (const source of otherIncomeSources) {
				const {
					monthly_income = 0,
					annual_income = 0,
					square_feet = 0,
					comments = '',
					type = '',
				} = source || {};

				const [monthlyIncome, annualIncome] = await Promise.all([
					helperFunction.formatCurrency(monthly_income),
					helperFunction.formatCurrency(annual_income),
				]);
				let sfSource = '';
				if (compType === AppraisalsEnum.LAND_ONLY && analysisType === AppraisalsEnum.PRICE_SF) {
					sfSource = await helperFunction.formatNumber(square_feet, 0, AppraisalsEnum.SF);
				} else if (analysisType === AppraisalsEnum.PRICE_ACRE) {
					sfSource = await helperFunction.formatNumber(square_feet, 3, AppraisalsEnum.AC);
				} else {
					sfSource = await helperFunction.formatNumber(square_feet, 0, AppraisalsEnum.SF);
				}
				// Get global code for zoning
				const attributes = { type: GlobalCodeEnums.ZONE };
				const zoningCodes = await this.commonStore.findGlobalCodeByAttribute(attributes);
				const { options } = zoningCodes;
				const subZonesCode = await this.commonStore.getGlobalSubOptions({
					global_code_category_id: 1,
				});
				// Add property type for each comparable
				let zone;
				let subZone;
				let subZoneValue: string;
				let zoneValue: string;
				if (options) {
					zone = options.find((obj) => obj?.code === comments);
				}
				if (!zone) {
					zoneValue = comments;
				} else {
					zoneValue = zone?.name;
				}

				if (subZonesCode) {
					subZone = subZonesCode.find((obj) => obj?.code === type);
				}
				if (!subZone) {
					subZoneValue = type;
				} else {
					subZoneValue = subZone?.name;
				}

				otherIncomeSource += `<tr><td>${subZoneValue}</td>
					<td>${monthlyIncome}</td>
					<td>${annualIncome}</td>
					<td>${sfSource}</td>
					<td>${zoneValue}</td></tr>`;
			}

			// Iterate through operating expenses and construct HTML rows for each
			for (const item of operatingExpenses) {
				const {
					name = '',
					annual_amount = 0,
					percentage_of_gross = 0,
					total_per_sq_ft = 0,
					comments = '',
					total_per_unit = 0,
					total_per_bed = 0,
				} = item || {};

				let compareBasis = '';
				if (comparisonBase === AppraisalsEnum.UNIT) {
					compareBasis = `<td> ${await helperFunction.formatCurrency(total_per_unit)}</td>`;
				}
				if (comparisonBase === AppraisalsEnum.BED) {
					compareBasis = `<td> ${await helperFunction.formatCurrency(total_per_bed)}</td>`;
				}
				const [annualAmount, percentOfGross, totalPerSqFt] = await Promise.all([
					helperFunction.formatCurrency(annual_amount),
					helperFunction.formatNumber(percentage_of_gross, 2, AppraisalsEnum.PERCENT),
					helperFunction.formatCurrency(total_per_sq_ft),
				]);
				expenseRows += `<tr><td>${name || AppraisalsEnum.NA}</td>
					<td>${annualAmount}</td>
					<td>${percentOfGross}</td>
					${compType === AppraisalsEnum.BUILDING_WITH_LAND ? `${compareBasis} dsdsd` : ''}
					<td>${totalPerSqFt}</td>
					<td>${comments}</td></tr>`;
			}

			// Construct the full HTML content with tables for income, expenses, and CAP rate analysis
			let totalComparison;
			if (comparisonBase === AppraisalsEnum.SF) {
				totalComparison = helperFunction.formatCurrency(total_rent_sq_ft);
			} else if (comparisonBase === AppraisalsEnum.UNIT) {
				totalComparison = helperFunction.formatNumber(total_unit, 0, AppraisalsEnum.UNIT);
			} else if (comparisonBase === AppraisalsEnum.BED) {
				totalComparison = helperFunction.formatNumber(total_bed, 0, AppraisalsEnum.BED);
			}
			const [
				totalMonthlyIncome,
				totalAnnualIncome,
				totalComparisonValue,
				vacantAmount,
				adjustedGrossAmount,
				totalOeAnnualAmount,
				totalOeGross,
				totalOePerSquareFeet,
				totalNetIncome,
				monthlyCapRate,
				annualCapRate,
				sqFtCapRate,
				indicatedRangeMonthly,
				indicatedRangeAnnual,
				indicatedRangeSqFeet,
				indicatedPsfMonthly,
				indicatedPsfAnnual,
				indicatedPsfSqFeet,
				totalOePerBed,
				totalOePerUnit,
				vacancyValue,
				totalOtherMonthlyIncome,
				totalOtherAnnualIncome,
			] = await Promise.all([
				helperFunction.formatCurrency(total_monthly_income),
				helperFunction.formatCurrency(total_annual_income),
				totalComparison,
				helperFunction.formatCurrency(vacant_amount),
				helperFunction.formatCurrency(adjusted_gross_amount),
				helperFunction.formatCurrency(total_oe_annual_amount),
				helperFunction.formatNumber(total_oe_gross, 2, AppraisalsEnum.PERCENT),
				helperFunction.formatCurrency(total_oe_per_square_feet),
				helperFunction.formatCurrency(total_net_income),
				helperFunction.formatNumber(monthly_capitalization_rate, 2, AppraisalsEnum.PERCENT),
				helperFunction.formatNumber(annual_capitalization_rate, 2, AppraisalsEnum.PERCENT),
				helperFunction.formatNumber(sq_ft_capitalization_rate, 2, AppraisalsEnum.PERCENT),
				helperFunction.formatCurrency(indicated_range_monthly),
				helperFunction.formatCurrency(indicated_range_annual),
				helperFunction.formatCurrency(indicated_range_sq_feet),
				helperFunction.formatCurrency(indicated_psf_monthly),
				helperFunction.formatCurrency(indicated_psf_annual),
				helperFunction.formatCurrency(indicated_psf_sq_feet),
				helperFunction.formatCurrency(total_oe_per_bed),
				helperFunction.formatCurrency(total_oe_per_unit),
				helperFunction.formatNumber(vacancy, 2, AppraisalsEnum.PERCENT),
				helperFunction.formatCurrency(other_total_monthly_income),
				helperFunction.formatCurrency(other_total_annual_income),
			]);
			let totalSqFt;
			let totalOtherSqFt;
			if (other_total_sq_ft && analysisType === AppraisalsEnum.PRICE_ACRE) {
				totalOtherSqFt = await helperFunction.formatNumber(other_total_sq_ft, 3, AppraisalsEnum.AC);
			} else if (other_total_sq_ft && analysisType === AppraisalsEnum.PRICE_SF) {
				totalOtherSqFt = await helperFunction.formatNumber(other_total_sq_ft, 0, AppraisalsEnum.SF);
			} else {
				totalOtherSqFt = AppraisalsEnum.NA;
			}
			if (total_sq_ft && analysisType === AppraisalsEnum.PRICE_ACRE) {
				totalSqFt = await helperFunction.formatNumber(total_sq_ft, 3, AppraisalsEnum.AC);
			} else if (total_sq_ft && analysisType === AppraisalsEnum.PRICE_SF) {
				totalSqFt = await helperFunction.formatNumber(total_sq_ft, 0, AppraisalsEnum.SF);
			} else {
				totalSqFt = AppraisalsEnum.NA;
			}

			let tableData = '';
			let opExpenses = '';
			let totalExpenseValue = '';
			let totalIncomeLabel = '';

			if (compType === AppraisalsEnum.LAND_ONLY) {
				if (analysisType === AppraisalsEnum.PRICE_ACRE) {
					tableData = `<b>$/AC/YR</b>`;
					opExpenses = `<td><b>$/AC</b></td>`;
					totalIncomeLabel = `<b>Total AC</b>`;
				} else {
					tableData = `<b>$/SF/YR</b>`;
					opExpenses = `<td><b>$/SF</b></td>`;
					totalIncomeLabel = `<b>Total SF</b>`;
				}
			} else {
				if (comparisonBase === AppraisalsEnum.SF) {
					tableData = `<b>$/SF/YR</b>`;
					// opExpenses = `<td><b>$/SF</b></td>`;
					totalIncomeLabel = `<b>Total SF</b>`;
					// totalExpenseValue = `<td>${totalOePerSquareFeet}</td>`;
				} else if (comparisonBase === AppraisalsEnum.UNIT) {
					tableData = `<b>Units</b>`;
					opExpenses = `<td><b>$/Unit<b></td>`;
					totalExpenseValue = `<td>${totalOePerUnit}</td>`;
					totalIncomeLabel = `<b>Total SF</b>`;
				} else if (comparisonBase === AppraisalsEnum.BED) {
					tableData = `<b>Beds</b>`;
					opExpenses = `<td><b>$/Bed<b></td>`;
					totalExpenseValue = `<td>${totalOePerBed}</td>`;
					totalIncomeLabel = `<b>Total SF</b>`;
				}
			}

			const indicatedValueLabel =
				compType === AppraisalsEnum.LAND_ONLY && analysisType === AppraisalsEnum.PRICE_ACRE
					? '$/AC'
					: '$/SF';
			const addExpenseSFcolumn =
				compType === AppraisalsEnum.LAND_ONLY ? '' : `<td><b>$/SF</b></td>`;

			let comparisonIndicateValue = '';

			if (
				compType === AppraisalsEnum.BUILDING_WITH_LAND &&
				comparisonBase === AppraisalsEnum.UNIT
			) {
				comparisonIndicateValue += `<tr><td><b>Indicated Value $/UNIT</b></td>
				<td>${await helperFunction.formatCurrency(Number(indicated_range_monthly) / Number(total_unit))}</td>
				<td>${await helperFunction.formatCurrency(Number(indicated_range_annual) / Number(total_unit))}</td>
				<td>${await helperFunction.formatCurrency(Number(indicated_range_sq_feet) / Number(total_unit))}</td></tr>`;
			} else if (
				compType === AppraisalsEnum.BUILDING_WITH_LAND &&
				comparisonBase === AppraisalsEnum.BED
			) {
				comparisonIndicateValue += `<tr><td><b>Indicated Value $/BED</b></td>
				<td>${await helperFunction.formatCurrency(Number(indicated_range_monthly) / Number(total_bed))}</td>
				<td>${await helperFunction.formatCurrency(Number(indicated_range_annual) / Number(total_bed))}</td>
				<td>${await helperFunction.formatCurrency(Number(indicated_range_sq_feet) / Number(total_bed))}</td></tr>`;
			}

			htmlContent += `<table style="width:100%; border-collapse: collapse;" border="1">
				<tr><td><b>Type</b></td>
					<td><b>Monthly Income</b></td>
					<td><b>Annual Income</b></td>
					<td>${tableData}</td>
					<td>${totalIncomeLabel}</td>
					<td><b>Comments</b></td></tr>
				${sourceRows}
				<tr><td><b>Total and Average</b></td>
					<td><b>${totalMonthlyIncome}</b></td>
					<td><b>${totalAnnualIncome}</b></td>
					<td><b>${totalComparisonValue}</b></td>
					<td><b>${totalSqFt}</b></td>
					<td></td></tr>
			<tr><td colspan="6"><b>Income Notes: </b> ${income_notes}</td></tr>
			<tr><td colspan="6"><b>Vacancy: </b>${vacancyValue} of Gross Income ${vacantAmount}</td></tr>
			<tr><td colspan="6"><b>Effective Income: </b> ${adjustedGrossAmount}</td></tr>
			</table><br>
				
			<h4>OTHER INCOME</h4>
				<table style="width:100%; border-collapse: collapse;" border="1">
				<tr><td><b>Type</b></td>
					<td><b>Monthly Income</b></td>
					<td><b>Annual Income</b></td>
					<td>${totalIncomeLabel}</td>
					<td><b>Comments</b></td></tr>
					${otherIncomeSource}
					<tr><td><b>Total and Average</b></td>
					<td><b>${totalOtherMonthlyIncome}</b></td>
					<td><b>${totalOtherAnnualIncome}</b></td>
					<td><b>${totalOtherSqFt}</b></td>
					<td></td>
				</tr></table><br>

			<h4>EXPENSE</h4>
			<table style="width:100%; border-collapse: collapse;" border="1">
				<tr>
					<td><b>Operation Expenses</b></td>
					<td><b>Amounts</b></td>
					<td><b>% of EGI</b></td>
					${opExpenses}
					${addExpenseSFcolumn}
					<td><b>Comments</b></td>
				</tr>
					${expenseRows}
				<tr>
					<td><b>Total Expenses</b></td>
					<td>${totalOeAnnualAmount}</td>
					<td>${totalOeGross}</td>
					${totalExpenseValue}
					<td>${totalOePerSquareFeet}</td>
					${compType === AppraisalsEnum.BUILDING_WITH_LAND ? '<td></td>' : ''}
				</tr>
				<tr>
					<td colspan="${opExpenses && compType === AppraisalsEnum.BUILDING_WITH_LAND ? '6' : '5'}">
						<b>Expense Notes: </b>${expense_notes}</p>
					</td>
				</tr>
			</table><br>
			<h3>CAP <strong>Rate Analysis</strong></h3>
			<table  style="width:100%; border-collapse: collapse;" border="1">
			<tr><td colspan="4"><b>Net Operating Income: </b>${totalNetIncome}</td></tr>
				<tr><td><b>CAP Rate Range</b></td>
				<td>${monthlyCapRate}</td>
				<td>${annualCapRate}</td>
				<td>${sqFtCapRate}</td></tr>
			<tr><td colspan="4"><b>CAP Rate Notes: </b>${cap_rate_notes}</td></tr>
				<tr><td><b>Indicated Value Range</b></td>
				<td>${indicatedRangeMonthly}</td>
				<td>${indicatedRangeAnnual}</td>
				<td>${indicatedRangeSqFeet}</td></tr>
				<tr><td><b>Indicated Value Per ${indicatedValueLabel}</b></td>
				<td>${indicatedPsfMonthly}</td>
				<td>${indicatedPsfAnnual}</td>
				<td>${indicatedPsfSqFeet}</td></tr>
				${comparisonIndicateValue}
			</table><br>`;
			return htmlContent;
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
	};
	/**
	 * @description Function to get table of cost approach of appraisal
	 * @param data
	 * @returns
	 */
	public getCostApproachData = async (
		appraisalApproachId,
		appraisalId: number,
	): Promise<string> => {
		try {
			let htmlContent = '';
			let comps = [];
			let subPropertyAdjustments = [];
			let improvements = [];
			let costApproachData: ICostApproach;
			let approach;
			let costName = '';
			// Fetch appraisal data for subject property.
			const appraisalInfo = await this.storage.getAppraisal({ id: appraisalId });
			const {
				street_address,
				city,
				state,
				zipcode,
				building_size,
				land_size,
				utilities_select,
				frontage,
				land_dimension,
				zoning_type,
				comp_adjustment_mode,
			} = appraisalInfo;
			const images = await this.appraisalFilesStorage.findFilesByAttribute({
				appraisal_id: appraisalId,
				title: ImagesPageEnum.COVER,
			});
			if (appraisalApproachId) {
				costApproachData = await this.appraisalCostApproachStore.findByAttribute({
					appraisal_approach_id: appraisalApproachId,
				});
				approach = await this.appraisalApproachesStore.findAppraisalApproaches({
					id: costApproachData?.appraisal_approach_id,
				});
				costName = approach?.name;
			} else {
				approach = await this.appraisalApproachesStore.findSelectedApproaches({
					appraisal_id: appraisalId,
					type: AppraisalsEnum.COST,
				});
				costApproachData = await this.appraisalCostApproachStore.findByAttribute({
					appraisal_approach_id: approach[0].id,
				});
				costName = approach[0].name;
			}

			if (costApproachData) {
				comps = costApproachData?.comps;
				subPropertyAdjustments = costApproachData?.cost_subject_property_adjustments;
				improvements = costApproachData?.improvements;
			}

			htmlContent += `<h2>Cost<strong> Approach (Land Value)</strong></h2><h2>Land<strong> Valuation</strong> (${costName || AppraisalsEnum.NA})</h2>`;
			htmlContent += `<table  style="width:100%; border-collapse: collapse;" border="1"><tr><td></td><td><b>Subject Property</b></td>`;

			// Add headers for each comparable
			comps.forEach((_, index) => {
				htmlContent += `<td><b>Comparable #${index + 1}</b></td>`;
			});
			const noPhotoUrl =
				'data:image/png;base64,' +
				(await fs.readFileSync('./src/images/no-photo-available.png', { encoding: 'base64' }));

			const image = images ? `${S3_BASE_URL}${images?.dir}` : noPhotoUrl;
			htmlContent += `</tr><tr><td></td><td style="text-align: center;"><img src="${image}" alt="Property image" height = "100",width="300"></td>`;

			// Add empty cells for each comparable's image
			comps.forEach((comp) => {
				const { property_image_url } = comp.comp_details;
				const image = property_image_url ? `${S3_BASE_URL}${property_image_url}` : noPhotoUrl;
				htmlContent += `<td style="text-align: center;" style="text-align: center;"><img src="${image}" alt="Property image" height = "100",width="300"></td>`;
			});
			let fullState;
			const getStates = await this.commonStore.findGlobalCodeByAttribute({
				type: GlobalCodeEnums.STATES,
			});
			const stateOptions = getStates?.options;
			const matchState = stateOptions.find((obj) => obj?.code === state);
			if (!matchState) {
				fullState = state;
			} else {
				fullState = matchState?.name;
			}
			htmlContent += `</tr><tr><td><b>Location</b></td><td>${street_address || AppraisalsEnum.NA}, 
			<br>${city || AppraisalsEnum.NA}, 
			<br>${fullState || AppraisalsEnum.NA}, 
			<br>${zipcode || AppraisalsEnum.NA}</td>`;

			// Add location for each comparable
			comps.forEach((comp) => {
				const { comp_details } = comp;
				let compState;
				let matchCompState;
				if (stateOptions) {
					matchCompState = stateOptions.find((obj) => obj?.code === state);
				}
				if (!matchCompState) {
					compState = comp_details.state;
				} else {
					compState = matchCompState?.name;
				}
				htmlContent += `<td>${comp_details?.street_address || AppraisalsEnum.NA},
			<br>${comp_details.city || AppraisalsEnum.NA}, 
			<br>${compState || AppraisalsEnum.NA}, 
			<br>${comp_details.zipcode || AppraisalsEnum.NA}</td>`;
			});

			htmlContent += `</tr><tr><td><b>Date Sold</b></td><td></td>`;

			// Add date sold for each comparable
			const dateSoldValues = await Promise.all(
				comps.map(async (comp) => {
					const { date_sold } = comp.comp_details;
					const formatDate = await helperFunction.formatDateToMDY(date_sold);
					return `<td>${formatDate || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Join all the <td> elements to add to the HTML content
			htmlContent += dateSoldValues.join('');

			htmlContent += `</tr><tr><td><b>Sales Price</b></td><td></td>`;

			// Add sales price for each comparable
			const compHtml = await Promise.all(
				comps.map(async (comp) => {
					const { comp_details } = comp;
					const salePrice = await helperFunction.formatCurrency(comp_details?.sale_price);
					return `<td>${salePrice || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Now join the mapped cells and append them to the HTML content
			htmlContent += compHtml.join('');

			htmlContent += `</tr><tr><td><b>Property Type</b></td><td></td>`;

			// Get global code for zoning
			const attributes = { type: GlobalCodeEnums.ZONE };
			const zoning = await this.commonStore.findGlobalCodeByAttribute(attributes);
			const { options } = zoning;

			// Add property type for each comparable
			comps.forEach((comp) => {
				const { zonings } = comp.comp_details;
				let zone;
				let subZone;
				let subZoneValue: string;
				let zoneValue: string;
				if (options) {
					zone = options.find((obj) => obj?.code === zonings[0]?.zone);
				}
				if (!zone) {
					zoneValue = zonings[0]?.zone;
				} else {
					zoneValue = zone?.name;
				}
				const { sub_options } = zone || {};
				if (sub_options) {
					subZone = sub_options.find((obj) => obj?.code === zonings[0]?.sub_zone);
				}
				if (!subZone) {
					subZoneValue = zonings[0]?.sub_zone;
				} else {
					subZoneValue = subZone?.name;
				}
				htmlContent += `<td>${zoneValue || AppraisalsEnum.NA}/${subZoneValue || AppraisalsEnum.NA}</td>`;
			});
			let subLandSize;
			let comparisonAttribute = AppraisalsEnum.PRICE_SF;
			let averageAdjustedUnit = AppraisalsEnum.SF;
			if (land_dimension === AppraisalsEnum.SF) {
				subLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
				comparisonAttribute = AppraisalsEnum.PRICE_SF;
			} else if (land_dimension === AppraisalsEnum.ACRE) {
				subLandSize = await helperFunction.formatNumber(land_size, 3, AppraisalsEnum.AC);
				comparisonAttribute = AppraisalsEnum.PRICE_ACRE;
				averageAdjustedUnit = AppraisalsEnum.AC;
			}
			htmlContent += `</tr><tr><td><b>Building Size / Land Size</b></td><td>${(await helperFunction.formatNumber(building_size, 0, AppraisalsEnum.SF)) || AppraisalsEnum.NA}/${subLandSize || AppraisalsEnum.NA}</td>`;

			// Add building size/land size for each comparable
			const compSizes = await Promise.all(
				comps.map(async (comp) => {
					const { building_size, land_size, land_dimension } = comp.comp_details;

					// Format building size
					const buildingSize = building_size
						? await helperFunction.formatNumber(building_size, 0, AppraisalsEnum.SF)
						: AppraisalsEnum.NA;
					let compLandSize;
					if (
						appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
						land_dimension === AppraisalsEnum.ACRE
					) {
						const LandSize = land_size * 43560;
						compLandSize = await helperFunction.formatNumber(LandSize, 0, AppraisalsEnum.SF);
					} else if (
						appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
						land_dimension === AppraisalsEnum.SF
					) {
						const LandSize = land_size / 43560;
						compLandSize = await helperFunction.formatNumber(LandSize, 3, AppraisalsEnum.AC);
					} else if (
						appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
						land_dimension === AppraisalsEnum.SF
					) {
						compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
					} else if (
						appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
						land_dimension === AppraisalsEnum.ACRE
					) {
						compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.AC);
					}

					return `<td>${buildingSize || AppraisalsEnum.NA}/${compLandSize || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Now join the mapped cells and append them to the HTML content
			htmlContent += compSizes.join('');

			// Add SF
			htmlContent += `</tr><tr><td><b>${comparisonAttribute}</b></td><td></td>`;

			// Add $/SF for each comparable
			const priceSf = await Promise.all(
				comps.map(async (comp) => {
					const { comp_details } = comp;
					const pricePerSquareFoot =
						(await helperFunction.formatCurrency(comp_details?.price_square_foot)) ||
						AppraisalsEnum.NA;
					return `<td>${pricePerSquareFoot}</td>`;
				}),
			);

			// Join the mapped cells and append them to the HTML content
			htmlContent += priceSf.join('');

			htmlContent += `</tr><tr><td><b>Zoning</b></td><td>${zoning_type || AppraisalsEnum.NA}</td>`;

			// Add zoning for each comparable
			comps.forEach((comp) => {
				const { comp_details } = comp;
				htmlContent += `<td>${comp_details?.zoning_type || AppraisalsEnum.NA}</td>`;
			});

			let utilitiesSelect = `<td></td>`;
			if (utilities_select) {
				utilitiesSelect = `<td>${utilities_select}</td>`;
			}

			// Add service for each comparable
			htmlContent += `</tr><tr><td><b>Services</b></td>${utilitiesSelect}`;
			comps.forEach((comp) => {
				const { comp_details } = comp;
				htmlContent += `<td>${comp_details?.utilities_select || AppraisalsEnum.NA}</td>`;
			});

			// Get global code for frontage
			let frontageValue;
			const frontageAttribute = { type: 'frontages' };
			const frontages = await this.commonStore.findGlobalCodeByAttribute(frontageAttribute);
			const frontageOptions = frontages?.options;
			if (frontage === '') {
				frontageValue = 'N/A';
			} else {
				const matchFrontage = frontageOptions.find((obj) => obj?.code === frontage);
				if (!matchFrontage) {
					frontageValue = frontage;
				} else {
					frontageValue = matchFrontage?.name;
				}
			}
			// Add frontage for each comparable
			htmlContent += `</tr><tr><td><b>Frontage</b></td><td>${frontageValue || ''}</td>`;
			comps.forEach((comp) => {
				const { comp_details } = comp;
				let compFrontageValue;
				if (frontage === '') {
					compFrontageValue = 'N/A';
				} else {
					const matchCompFrontage = frontageOptions.find(
						(obj) => obj?.code === comp_details?.frontage,
					);
					if (!matchCompFrontage) {
						compFrontageValue = comp_details?.frontage;
					} else {
						compFrontageValue = matchCompFrontage?.name;
					}
				}
				htmlContent += `<td>${compFrontageValue || ''}</td>`;
			});

			// Add comparison criteria for each comparable
			htmlContent += `</tr><tr><td><b>Comparison Criteria</b></td><td></td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});

			const costAdjustments = await Promise.all(
				subPropertyAdjustments.map(async (subAdj) => {
					const { adj_key, adj_value } = subAdj;
					let rowContent = `</tr><tr><td>${adj_value || AppraisalsEnum.NA}</td><td></td>`;

					const compCells = await Promise.all(
						comps.map(async (comp) => {
							const { comps_adjustments } = comp;

							// Find the matching adjustment, if any
							const matchingAdjustment = comps_adjustments.find(
								(adjustment) => adjustment?.adj_key === adj_key,
							);
							// Format adjustment value or use NA
							const adjValue = matchingAdjustment?.adj_value;
							if (comp_adjustment_mode === 'Percent') {
								return `<td>${matchingAdjustment ? await helperFunction.formatNumber(adjValue, 2, AppraisalsEnum.PERCENT) : AppraisalsEnum.NA}</td>`;
							} else if (comp_adjustment_mode === 'Dollar') {
								return `<td>${matchingAdjustment ? await helperFunction.formatCurrency(adjValue) : AppraisalsEnum.NA}</td>`;
							}
						}),
					);

					// Combine all the comp cells into the row
					rowContent += compCells.join('');
					return rowContent;
				}),
			);
			// Join all rows and append to htmlContent
			htmlContent += costAdjustments.join('');

			htmlContent += `</tr><tr><td><b>Overall Adjustment</b></td><td></td>`;
			const adjustmentsHtml = await Promise.all(
				comps.map(async (comp) => {
					const { total_adjustment } = comp;
					let formattedAdjustment;
					if (comp_adjustment_mode === 'Percent') {
						formattedAdjustment = await helperFunction.formatNumber(
							total_adjustment,
							2,
							AppraisalsEnum.PERCENT,
						);
					} else if (comp_adjustment_mode === 'Dollar') {
						formattedAdjustment = await helperFunction.formatCurrency(total_adjustment);
					}
					return `<td>${formattedAdjustment || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Joining the generated HTML content
			htmlContent += adjustmentsHtml.join('');

			let averagedAdjustedPsf = '';
			let landValue = '';
			let weightVal = '';
			if (costApproachData) {
				const { averaged_adjusted_psf = 0, land_value = 0, weight = 0 } = costApproachData;
				[averagedAdjustedPsf, landValue, weightVal] = await Promise.all([
					helperFunction.formatCurrency(averaged_adjusted_psf),
					helperFunction.formatCurrency(land_value),
					helperFunction.formatNumber(weight, 2, AppraisalsEnum.PERCENT),
				]);
			}

			if (averagedAdjustedPsf === '') {
				averagedAdjustedPsf = AppraisalsEnum.NA;
			} else {
				averagedAdjustedPsf = averagedAdjustedPsf + '/' + averageAdjustedUnit;
			}
			htmlContent += `</tr><tr><td><b>Average Adjusted ${comparisonAttribute}</b></td><td>${averagedAdjustedPsf}</td>`;

			const adjustedPsfHtml = await Promise.all(
				comps.map(async (comp) => {
					const { adjusted_psf } = comp;

					// Format the 'adjusted_psf' value to currency using 'helperFunction'
					const formattedPsf = await helperFunction.formatCurrency(adjusted_psf);

					// Return the generated HTML content for each 'comp' as a promise
					return `<td>${formattedPsf + '/' + averageAdjustedUnit || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Join all the generated table cell HTML content into a single string
			htmlContent += adjustedPsfHtml.join('');

			//Add weighting
			htmlContent += `</tr><tr><td><b>Weighting</b></td><td>${weightVal || AppraisalsEnum.NA}</td>`;

			const weightingHtml = await Promise.all(
				comps.map(async (comp) => {
					const { weight } = comp;

					// Format the 'weight' value
					const formattedWeight = await helperFunction.formatNumber(
						weight,
						2,
						AppraisalsEnum.PERCENT,
					);

					// Return the generated HTML content for each 'comp' as a promise
					return `<td>${formattedWeight || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Join all the generated table cell HTML content into a single string
			htmlContent += weightingHtml.join('');

			htmlContent += `</tr><tr><td><b>Adjusted Comp Value</b></td><td>${landValue || AppraisalsEnum.NA}</td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			htmlContent += `</tr></table><br>`;
			htmlContent += `<span><b>Notes - </b></span>${costApproachData?.notes || AppraisalsEnum.NA}`;

			let improvementRows = '';
			if (improvements?.length > 0) {
				htmlContent += `<h2>Cost<strong> Approach (Improvement Value)</strong></h2>`;
				for (const improvement of improvements) {
					const { type, sf_area, adjusted_psf, structure_cost } = improvement || {};
					let name = null;

					// Search in sub_options
					for (const option of options) {
						if (option?.sub_options) {
							const match = option?.sub_options.find((sub) => sub?.code === type);
							if (match) {
								name = match?.name;
								break;
							}
						}
					}

					const [sfArea, adjustedPsf, structureCost] = await Promise.all([
						helperFunction.formatNumber(sf_area, 0, AppraisalsEnum.SF),
						helperFunction.formatCurrency(adjusted_psf),
						helperFunction.formatCurrency(structure_cost),
					]);

					improvementRows += `<tr><td>${name || type + '-' + sfArea}</td>
						<td>${adjustedPsf}</td>
						<td>${sfArea}</td>
						<td>${structureCost}</td></tr>`;
				}

				const {
					overall_replacement_cost,
					improvements_total_depreciation,
					total_depreciation,
					total_depreciated_cost,
					land_value,
					total_cost_valuation,
					indicated_value_psf,
					comments,
				} = costApproachData;
				const overallReplacementCost =
					await helperFunction.formatCurrency(overall_replacement_cost);
				const [
					improvementTotalDepreciation,
					totalDepreciation,
					totalDepreciatedCost,
					landValue,
					totalCostValuation,
					indicatedValuePsf,
				] = await Promise.all([
					helperFunction.formatNumber(improvements_total_depreciation, 2, AppraisalsEnum.PERCENT),
					helperFunction.formatCurrency(total_depreciation),
					helperFunction.formatCurrency(total_depreciated_cost),
					helperFunction.formatCurrency(land_value),
					helperFunction.formatCurrency(total_cost_valuation),
					helperFunction.formatCurrency(indicated_value_psf),
				]);

				htmlContent += `<table style="width:100%; border-collapse: collapse;"  border="1">
				<tr><td><b>Type</b></td>
					<td><b>Cost PSF</b></td>
					<td><b>Total SF</b></td>
					<td><b>Total Cost</b></td></tr>
				${improvementRows}
				<tr><td><b>Total</b></td>
					<td></td>
					<td></td>
					<td>${overallReplacementCost}</td></tr>
			</table><br>`;

				htmlContent += `<table style="width:100%; border-collapse: collapse;" border="1">
				<tr><td><b>Improvement Valuation</b></td>
					<td><b>Total Cost</b></td></tr>
				<tr><td>Total Overall Replacement</td>
					<td>${overallReplacementCost}</td></tr>
				<tr><td>Depreciation (${improvementTotalDepreciation})</td>
					<td>${totalDepreciation}</td></tr>
				<tr><td>Total Depreciated Cost</td>
					<td>${totalDepreciatedCost}</td></tr>
				<tr><td>Estimated Land Value</td>
					<td>${landValue}</td></tr>
				<tr><td>Total Cost Valuation</td>
					<td>${totalCostValuation + ' @ ' + indicatedValuePsf + '/SF'}</td></tr>
					<tr><td colspan="2"><b>Notes - </b>${comments || AppraisalsEnum.NA}</td></tr>
			</table><br>`;
			}

			return htmlContent;
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
	};
	/**
	 * @description Function to get HTML to preview report.
	 * @param request
	 * @param response
	 * @returns
	 */
	public previewReport = async (
		request: IGetInfoForPdf,
		response: Response,
	): Promise<Response | void | any> => {
		let data: IError | IAppraisalSuccess<string>;
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
			const appraisalId = parseInt(request?.params?.id);
			const appraisalData: IAppraisal = await this.storage.getAppraisalInfoForPdf({
				id: appraisalId,
			});
			if (!appraisalData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPRAISAL_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Fetching html content for preview
			const htmlContent = await this.getPDFContent(appraisalData);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.REPORT_PREVIEW_SUCCESS,
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
	 * @description Function to show exhibits in appraisal report.
	 * @param getExhibits
	 * @param appraisalId
	 * @returns
	 */
	public loadExhibits = async (
		getExhibits: IAppraisalFiles[],
		appraisalId: number,
	): Promise<string> => {
		const htmlContentArray: string[] = [];

		if (getExhibits?.length) {
			htmlContentArray.push('<h2>Exhibits</h2>');

			for (const exhibit of getExhibits) {
				const { type, dir } = exhibit;
				const url = `${S3_BASE_URL}${dir}`;

				if (type.includes(UploadEnum.IMAGE)) {
					htmlContentArray.push(`<img src="${url}" alt="image" width="400" height="400"/><br><br>`);
				} else if (type.includes(UploadEnum.PDF)) {
					try {
						// PDF conversion temporarily disabled - requires pdf-img-convert with native dependencies
						// For now, just include a link to the PDF
						htmlContentArray.push(`<p><a href="${url}" target="_blank">View PDF Document</a></p><br><br>`);
						/* 
						const dateTime = Timestamp(new Date());
						const pdfUrl = `${S3_BASE_URL}${dir}`;
						const pdfArray = await pdf2img.convert(pdfUrl);

						// Process PDF images asynchronously
						const imagePromises = pdfArray.map(async (pdfImage, i) => {
							const imagePath = `output${i}${dateTime}${appraisalId}.png`;

							// Write image file asynchronously
							fs.writeFileSync(imagePath, pdfImage); // pdfImage is a buffer

							const base64Image = await fs.readFileSync(imagePath, { encoding: 'base64' });

							// Push image HTML with base64 content
							htmlContentArray.push(
								`<img src="data:image/png;base64,${base64Image}" style="width: 100%; height: auto; page-break-before: always;" />`,
							);

							// Clean up image files after embedding in HTML
							await fs.unlinkSync(imagePath);
						});

						// Await for all image processing
						await Promise.all(imagePromises);
						*/
					} catch (error) {
						console.error('Error processing PDF:', error);
					}
				}
			}
		}

		// Join HTML content array into a single string
		return htmlContentArray.join('');
	};

	/**
	 * @description  Api to check linked comps with approaches
	 * @param request
	 * @param response
	 * @returns
	 */
	public checkLinkedComps = async (
		request: IGetAppraisalRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IComp[]>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = parseInt(request?.params?.id);
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const getAppraisalData = await this.storage.getLinkedComps({ id: appraisalId });
			const { appraisal_approaches } = getAppraisalData;
			if (appraisal_approaches) {
				const hasComps = appraisal_approaches.map(
					({
						id,
						appraisal_sales_approach,
						appraisal_cost_approach,
						appraisal_lease_approach,
					}) => ({
						id,
						hasSalesComps: appraisal_sales_approach?.comps?.length > 0,
						hasCostComps: appraisal_cost_approach?.comps?.length > 0,
						hasLeaseComps: appraisal_lease_approach?.comps?.length > 0,
					}),
				);
				const anyComps = hasComps.some(
					({ hasSalesComps, hasCostComps, hasLeaseComps }) =>
						hasSalesComps || hasCostComps || hasLeaseComps,
				);
				if (anyComps === true) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.CAN_NOT_CHANGE_VALUE,
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
	 * @description Function to get appraisal income approach html id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getIncomeApproachHTML = async (
		request: IGetIncomeApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<string>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			//validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//validating  query params appraisalApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
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

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			//Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const incomeApproachHTML = await this.getIncomeApproachData({
				appraisalApproachId,
				comparisonBase: findAppraisal?.comparison_basis,
				analysisType: findAppraisal?.analysis_type,
				compType: findAppraisal?.comp_type,
				appraisalId,
			});

			// If requested cost approach not found
			if (!incomeApproachHTML) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.INCOME_APPROACH_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.INCOME_APPROACH_DATA,
				data: incomeApproachHTML,
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
	 * @description Function to get sales approach html data by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSalesApproachHTML = async (
		request: GetSalesApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<string>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating  query params appraisal ApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate approach
			const validApproach = await this.appraisalApproachesStore.findAppraisalApproaches({
				appraisal_id: appraisalId,
				id: appraisalApproachId,
			});
			// If requested sales approach not found
			if (!validApproach) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.SALES_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const saleApproachHTML = await this.saleApproachDataGet(appraisalApproachId, appraisalId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.SALE_APPROACH_DATA,
				data: saleApproachHTML,
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
	 * @description Function to get cost approach html data by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getCostApproachHTML = async (
		request: GetCostApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<string>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating query params appraisal ApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate approach
			const validApproach = await this.appraisalApproachesStore.findAppraisalApproaches({
				appraisal_id: appraisalId,
				id: appraisalApproachId,
			});
			// If requested cost approach not found
			if (!validApproach) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.COST_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const costApproachHTML = await this.getCostApproachData(appraisalApproachId, appraisalId);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.COST_APPROACH_DATA,
				data: costApproachHTML,
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
	 * @description Function to update position of appraisal.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updatePosition = async (
		request: IPositionRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IAppraisal>;
		try {
			// Validate schema
			const params = await helperFunction.validate(appraisalPositionSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const appraisalId = parseInt(request?.params?.id);
			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const { role, account_id, id } = request.user;
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const appraisalData = request.body;
			await this.storage.updateAppraisal(appraisalData, appraisalId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_SAVE_SUCCESS,
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
	 * @description Function to get merge fields data
	 * @param request
	 * @param response
	 * @returns
	 */
	public covertEditorData = async (
		request: IFieldsDataGet,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<string>;
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
			let htmlContent = '';
			htmlContent = request.body.fieldContent;
			const appraisalId = parseInt(request?.params?.id);
			// Fetch templateData, exhibits, and appraisalInfo concurrently
			const appraisalInfo = await this.storage.getAppraisal({ id: appraisalId });

			// Get all merge fields and fetch associated data
			const mergeFields = await helperFunction.getAllTags(htmlContent);

			if (mergeFields?.length) {
				// Fetch data for merge fields in parallel
				const fieldsData = await this.templateService.iterateMergeFieldsData(
					mergeFields,
					appraisalInfo,
				);
				htmlContent = await helperFunction.replaceAllTags(htmlContent, fieldsData);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.APPRAISAL_DATA,
				data: htmlContent,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
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
		request: IAppraisalPhotoPages,
		response: Response,
	): Promise<Response> => {
		let data: IError | IPhotoPagesSuccess<IPhotoPage[]>;
		try {
			// Validate schema
			const params = await helperFunction.validate(savePhotoPagesSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { photos_taken_by, photo_date, photos } = request.body;
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const appraisalAttributes = {
				photos_taken_by,
				photo_date,
			};
			await this.storage.updateAppraisal(appraisalAttributes, appraisalId);
			const dbPhotos = await this.appraisalPhotoPagesStore.findAll({
				appraisal_id: appraisalId,
			});
			const savedPhotos = [];
			for (let index = 0; index < photos.length; index++) {
				const element = photos[index];
				element.appraisal_id = appraisalId;

				if (!element?.id) {
					// Create new photo record if id is null or missing
					const newPhoto = await this.appraisalPhotoPagesStore.create(element);
					savedPhotos.push(newPhoto);
				} else {
					// Update existing photo if id exists
					const updatedPhoto = await this.appraisalPhotoPagesStore.update(element);
					savedPhotos.push(updatedPhoto);
				}
			}

			// Delete photos in the database that are not in the photos array
			const photoIdsToKeep = photos.map((photo) => photo?.id).filter((id) => id); // Get IDs of photos to keep

			for (const dbPhoto of dbPhotos) {
				if (!photoIdsToKeep.includes(dbPhoto.id)) {
					// Delete photo from DB if not in the updated photos list
					await this.appraisalPhotoPagesStore.delete({ id: dbPhoto?.id });
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
	 * @description Function to get all photo pages by appraisal id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAllPhotoPages = async (
		request: IPhotoPageRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IPhotoPagesSuccess<IAppraisalPhotoPages>;
		try {
			const appraisalId = parseInt(request.params.id);
			const { role, account_id, id } = request.user;

			// Find the appraisal by ID
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Check permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const dbPhotos = await this.appraisalPhotoPagesStore.findOne({
				id: appraisalId,
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
	 * @description Function to get data for appraisal photo sheet
	 * @param incomeSources
	 * @returns
	 */
	public getPhotoPagesData = async (appraisalId: number): Promise<string> => {
		try {
			const appraisalPhotosDataInstance = await this.appraisalPhotoPagesStore.findOne({
				id: appraisalId,
			});
			const appraisalPhotosData = appraisalPhotosDataInstance
				? (appraisalPhotosDataInstance as any).get({ plain: true })
				: null;

			let photosHTML = ``;

			if (appraisalPhotosData) {
				photosHTML += `<div custom-style="PhotoPageHeading">
								<b>Subject Property Photos</b>
							</div>`;

				if (appraisalPhotosData?.photos) {
					for (let i = 0; i < appraisalPhotosData.photos.length; i += 2) {
						const { image_url, caption } = appraisalPhotosData.photos[i];
						const secondImage = appraisalPhotosData.photos[i + 1];
						const second_image_url = secondImage?.image_url;

						photosHTML += `
									<figure>
										<div style="text-align: center;">
										<img src="${image_url ? S3_BASE_URL + image_url : ''}" alt="" height="400" width="600" style="display:block; margin:0 auto;">
											<figcaption><b>${caption || ''}</b></figcaption>
										</div>
										<div style="text-align: center;">
										<img src="${second_image_url ? S3_BASE_URL + second_image_url : ''}" alt="" height="400" width="600" style="display:block; margin:0 auto;">
											<figcaption><b>${secondImage?.caption || ''}</b></figcaption>
										</div>
									</figure>`;
					}

					// Footer row for "Taken By" information
					const formatDate = appraisalPhotosData?.photo_date
						? await helperFunction.formatDateToMDY(appraisalPhotosData.photo_date)
						: '';
					photosHTML += `<div style="margin-top: 20px;">
									<b>Taken By: ${appraisalPhotosData.photos_taken_by}, ${formatDate}</b>
							   </div>`;
				}
			}
			return photosHTML;
		} catch (e) {
			// Logging error
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
			const existingAdjustments = await this.appraisalSaleSubQualitativeAdjStore.findAdjustments({
				appraisal_sales_approach_id: saleApproachId,
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
					appraisal_sales_approach_id: saleApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
					subject_property_value: adjustment!.subject_property_value,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_sales_approach_id: saleApproachId,
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
							appraisal_sales_approach_id: saleApproachId,
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
					this.appraisalSaleSubQualitativeAdjStore.createAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.appraisalSaleSubQualitativeAdjStore.removeAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.appraisalSaleSubQualitativeAdjStore.updateAdjustments(adj),
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
			const existingAdjustments = await this.appraisalSaleQualitativeCompAdjStore.findAdjustments({
				appraisal_sales_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				appraisal_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				appraisal_sales_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_sales_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) =>
					this.appraisalSaleQualitativeCompAdjStore.createAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.appraisalSaleQualitativeCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.appraisalSaleQualitativeCompAdjStore.removeAdjustments(adj),
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
	 * @description Function to handle appraisal sales comparison attributes.
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
			const existingSaleAttributes = await this.appraisalSaleComparisonStore.findAll({
				appraisal_sales_approach_id: saleApproachId,
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
					appraisal_sales_approach_id: saleApproachId,
					comparison_key: adjustment!.comparison_key,
					comparison_value: adjustment!.comparison_value,
					order: adjustment!.order,
				};
			});

			const attributesToDelete = keysToDelete.map((key) => ({
				appraisal_sales_approach_id: saleApproachId,
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
							appraisal_sales_approach_id: saleApproachId,
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
				...attributesToAdd.map((item) => this.appraisalSaleComparisonStore.create(item)),
				...attributesToDelete.map((item) => this.appraisalSaleComparisonStore.delete(item)),
				...attributesToUpdate.map((item) => this.appraisalSaleComparisonStore.update(item)),
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
	 * @description Function to save and update lease approach.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveLeaseApproach = async (
		request: SaveLeaseApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ILeaseApproach>;
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
			const { lease_approach, appraisal_id, ...attributes } = request.body;
			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisal_id });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Checking if requested appraisal approach is of type lease or not
			const checkApproachType = await this.appraisalApproachesStore.findAppraisalApproaches({
				id: lease_approach.appraisal_approach_id,
				appraisal_id,
				type: AppraisalsEnum.LEASE,
			});
			if (!checkApproachType) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPROACH_TYPE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Updating weighted_market_value in appraisal table.
			if (Object.keys(attributes).length > 0) {
				await this.storage.updateAppraisal(attributes, appraisal_id);
			}

			// Creating new records for lease approach
			if (!lease_approach.id) {
				// Checking duplicate record of lease approach by appraisal approach id.
				const findLeaseData = await this.appraisalLeaseApproachStore.findOne({
					appraisal_approach_id: lease_approach.appraisal_approach_id,
				});
				if (findLeaseData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.RECORD_ALREADY_EXIST,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Saving lease approach data in appraisal lease approaches table
				const saveLeaseApproach =
					await this.appraisalLeaseApproachStore.createLeaseApproach(lease_approach);
				if (!saveLeaseApproach) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.LEASE_APPROACH_SAVE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.LEASE_APPROACH_SAVED_SUCCESS,
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
				const findLeaseData = await this.appraisalLeaseApproachStore.findByAttribute({
					appraisal_approach_id: lease_approach.appraisal_approach_id,
				});
				if (!findLeaseData) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AppraisalEnum.LEASE_APPROACH_NOT_FOUND,
						error: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				const { subject_property_adjustments, subject_qualitative_adjustments, comps, ...rest } =
					lease_approach;
				let updateLeaseData: boolean;
				if (Object.keys(rest).length > 0) {
					updateLeaseData = await this.appraisalLeaseApproachStore.updateLeaseApproach(rest);
				}
				if (!updateLeaseData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.LEASE_APPROACH_DATA_UPDATE_FAILED,
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
					const updateAppraisalSubAdj = await this.syncLeaseSubjectAdjustments(
						lease_approach.id,
						updatedSubjectPropertyAdjustments,
					);
					if (!updateAppraisalSubAdj) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: AppraisalEnum.LEASE_APPROACH_SUB_ADJ_UPDATE_FAILED,
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
							message: AppraisalEnum.SALE_SUB_QUALITATIVE_ADJ_UPDATE_FAIL,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				if (comps) {
					const updateLeaseComps = await this.synchronizeLeaseComps(lease_approach.id, comps);
					if (!updateLeaseComps) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: AppraisalEnum.LEASE_APPROACH_COMPS_UPDATE_FAILED,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AppraisalEnum.LEASE_APPROACH_SAVED_SUCCESS,
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
		newAdjustments: SalesSubAdjustments[],
	): Promise<boolean> {
		try {
			// Filter out adjustments with empty adj_key
			const validAdjustments = newAdjustments.filter(
				(adj) => adj?.adj_key && adj?.adj_key.trim() !== '',
			);

			// Fetch existing adjustments
			const existingAdjustments = await this.appraisalLeaseSubAdjStore.findAdjustments({
				appraisal_lease_approach_id: leaseApproachId,
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
					appraisal_lease_approach_id: leaseApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_lease_approach_id: leaseApproachId,
				adj_key: key,
			}));

			// Find adjustments to update where the `order` is different
			const adjustmentsToUpdate = keysToUpdate
				.map((key) => {
					const newAdjustment = validAdjustments.find((adj) => adj?.adj_key === key);
					const existingAdjustment = existingAdjustments.find((adj) => adj?.adj_key === key);
					if (
						newAdjustment &&
						existingAdjustment &&
						newAdjustment.order !== existingAdjustment.order
					) {
						return {
							appraisal_lease_approach_id: leaseApproachId,
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
				...adjustmentsToAdd.map((adj) => this.appraisalLeaseSubAdjStore.createAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.appraisalLeaseSubAdjStore.removeAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.appraisalLeaseSubAdjStore.updateAdjustments(adj)),
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
	 * @param salesApproachId
	 * @param newComps
	 * @returns
	 */
	public async synchronizeLeaseComps(
		leaseApproachId: number,
		newComps: ILeaseComp[],
	): Promise<boolean> {
		try {
			// Fetch existing comps
			const existingComps = await this.appraisalLeaseCompsStore.findLeaseComps({
				appraisal_lease_approach_id: leaseApproachId,
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
				const createdComp = await this.appraisalLeaseCompsStore.createLeaseComps({
					...comp,
					appraisal_lease_approach_id: leaseApproachId,
				});
				await this.syncLeaseCompAdjustments(createdComp.id, comp.comps_adjustments);
				await this.syncLeaseCompQualitativeAdj(createdComp.id, comp.comps_qualitative_adjustments);
			});

			// Batch update existing comps
			const updatePromises = compsToUpdate.map(async (comp) => {
				await this.appraisalLeaseCompsStore.updateLeaseComps(comp);
				await this.syncLeaseCompAdjustments(comp.id, comp.comps_adjustments);
				await this.syncLeaseCompQualitativeAdj(comp.id, comp.comps_qualitative_adjustments);
			});

			// Batch delete old comps
			const deletePromises = compsToDelete.map(async (id) => {
				await this.appraisalLeaseCompAdjStore.removeAdjustments({
					appraisal_lease_approach_comp_id: id,
				});
				await this.appraisalLeaseCompsStore.removeLeaseComps({ id });
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
			const existingAdjustments = await this.appraisalLeaseCompAdjStore.findAdjustments({
				appraisal_lease_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				appraisal_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				appraisal_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_lease_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) => this.appraisalLeaseCompAdjStore.createAdjustments(adj)),
				...adjustmentsToUpdate.map((adj) => this.appraisalLeaseCompAdjStore.updateAdjustments(adj)),
				...adjustmentsToDelete.map((adj) => this.appraisalLeaseCompAdjStore.removeAdjustments(adj)),
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
				(adj) => adj?.adj_key && adj?.adj_key.trim() !== '',
			);

			// Fetch existing adjustments
			const existingAdjustments = await this.appraisalLeaseSubQualitativeAdjStore.findAdjustments({
				appraisal_lease_approach_id: leaseApproachId,
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
					appraisal_lease_approach_id: leaseApproachId,
					adj_key: adjustment!.adj_key,
					adj_value: adjustment!.adj_value,
					order: adjustment!.order,
					subject_property_value: adjustment!.subject_property_value,
				};
			});

			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_lease_approach_id: leaseApproachId,
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
							appraisal_lease_approach_id: leaseApproachId,
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
					this.appraisalLeaseSubQualitativeAdjStore.createAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.appraisalLeaseSubQualitativeAdjStore.removeAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.appraisalLeaseSubQualitativeAdjStore.updateAdjustments(adj),
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
			const existingAdjustments = await this.appraisalLeaseQualitativeCompAdjStore.findAdjustments({
				appraisal_lease_approach_comp_id: compId,
			});

			const existingKeys = new Set(existingAdjustments.map((adj) => adj.adj_key));
			const newAdjustmentsMap = new Map(newAdjustments.map((adj) => [adj.adj_key, adj]));

			const keysToAdd = [...newAdjustmentsMap.keys()].filter((key) => !existingKeys.has(key));
			const keysToUpdate = [...newAdjustmentsMap.keys()].filter((key) => existingKeys.has(key));
			const keysToDelete = [...existingKeys].filter((key) => !newAdjustmentsMap.has(key));

			// Prepare adjustments to add
			const adjustmentsToAdd = keysToAdd.map((key) => ({
				appraisal_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to update
			const adjustmentsToUpdate = keysToUpdate.map((key) => ({
				appraisal_lease_approach_comp_id: compId,
				adj_key: key,
				adj_value: newAdjustmentsMap.get(key)!.adj_value,
			}));

			// Prepare adjustments to delete
			const adjustmentsToDelete = keysToDelete.map((key) => ({
				appraisal_lease_approach_comp_id: compId,
				adj_key: key,
			}));

			// Batch add, update, and delete adjustments
			await Promise.all([
				...adjustmentsToAdd.map((adj) =>
					this.appraisalLeaseQualitativeCompAdjStore.createAdjustments(adj),
				),
				...adjustmentsToUpdate.map((adj) =>
					this.appraisalLeaseQualitativeCompAdjStore.updateAdjustments(adj),
				),
				...adjustmentsToDelete.map((adj) =>
					this.appraisalLeaseQualitativeCompAdjStore.removeAdjustments(adj),
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
		let data: IError | IAppraisalSuccess<ILeaseApproach>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating  query params appraisal ApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate approach
			const validApproach = await this.appraisalApproachesStore.findAppraisalApproaches({
				appraisal_id: appraisalId,
				id: appraisalApproachId,
			});
			// If requested lease approach not found
			if (!validApproach) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.LEASE_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Get appraisal lease approach
			const leaseApproachData = await this.appraisalLeaseApproachStore.findByAttribute({
				appraisal_approach_id: appraisalApproachId,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.LEASE_APPROACH_DATA,
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
	 * @description Function to upload multiple photos at once.
	 * @param request
	 * @param response
	 * @returns
	 */
	public uploadMultiplePhotos = async (
		request: IUploadPhotosRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<IUrlSuccess[]>;
		try {
			// Validate schema
			const params = await helperFunction.validate(uploadMultiplePhotosSchema, request.body);
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
	 * @description Function to get table of lease approach of appraisal in download report.
	 * @param appraisalApproachId
	 * @param appraisalId
	 * @returns
	 */

	public getLeaseApproachData = async (
		appraisalApproachId,
		appraisalId: number,
	): Promise<string> => {
		try {
			let htmlContent = '';
			let comps: ILeaseComp[] = [];
			let subPropertyAdjustments = [];
			let subQualitativeAdj = [];
			let leaseApproachData: ILeaseApproach;
			let approach;
			let leaseName = '';
			// Fetch appraisal data for subject property.
			const [appraisalInfo, images] = await Promise.all([
				this.storage.getAppraisal({ id: appraisalId }),
				this.appraisalFilesStorage.findFilesByAttribute({
					appraisal_id: appraisalId,
					title: ImagesPageEnum.COVER,
				}),
			]);
			if (appraisalApproachId) {
				leaseApproachData = await this.appraisalLeaseApproachStore.findByAttribute({
					appraisal_approach_id: appraisalApproachId,
				});
				approach = await this.appraisalApproachesStore.findAppraisalApproaches({
					id: leaseApproachData?.appraisal_approach_id,
				});
				leaseName = approach?.name;
			} else {
				approach = await this.appraisalApproachesStore.findSelectedApproaches({
					appraisal_id: appraisalId,
					type: AppraisalsEnum.LEASE,
				});
				leaseApproachData = await this.appraisalLeaseApproachStore.findByAttribute({
					appraisal_approach_id: approach[0].id,
				});
				leaseName = approach[0].name;
			}

			if (leaseApproachData) {
				comps = leaseApproachData?.comps;
				subPropertyAdjustments = leaseApproachData?.subject_property_adjustments;
				subQualitativeAdj = leaseApproachData.subject_qualitative_adjustments;
			}

			const {
				street_address,
				street_suite,
				city,
				state,
				zipcode,
				building_size,
				land_size,
				condition,
				zonings,
				comparison_basis,
				comp_type,
				land_type,
				analysis_type,
				year_built,
				year_remodeled,
				comp_adjustment_mode,
			} = appraisalInfo;

			htmlContent += `<h2>Lease Comparison <b>Approach</b> (${leaseName || AppraisalsEnum.NA})</h2>`;
			htmlContent += `<table  style="width:100%; border-collapse: collapse;" border="1"><tr><td></td><td><b>Subject Property</b></td>`;

			const noPhotoUrl =
				'data:image/png;base64,' +
				(await fs.readFileSync('./src/images/no-photo-available.png', { encoding: 'base64' }));
			// Add headers for each comparable
			comps.forEach((_, index) => {
				htmlContent += `<td><b>Comparable #${index + 1}</b></td>`;
			});
			const image = images ? `${S3_BASE_URL}${images?.dir}` : noPhotoUrl;
			htmlContent += `</tr><tr><td></td><td style="text-align: center;"><img src="${image}" alt="Property image" height = "100",width="300"></td>`;

			// Add empty cells for each comparable's image
			comps.forEach((comp) => {
				const { property_image_url } = comp.comp_details;
				const image = property_image_url ? `${S3_BASE_URL}${property_image_url}` : noPhotoUrl;
				htmlContent += `<td style="text-align: center;"><img src="${image}" alt="Property image" height = "100",width="300"></td>`;
			});
			let fullState;
			const getStates = await this.commonStore.findGlobalCodeByAttribute({
				type: GlobalCodeEnums.STATES,
			});
			const stateOptions = getStates?.options;
			const matchState = stateOptions.find((obj) => obj?.code === state);
			if (!matchState) {
				fullState = state;
			} else {
				fullState = matchState?.name;
			}
			htmlContent += `</tr><tr><td><b>Location</b></td><td>${street_address || AppraisalsEnum.NA}
			<br> ${street_suite || AppraisalsEnum.NA},
			<br> ${city || AppraisalsEnum.NA}, ${fullState || AppraisalsEnum.NA},
			<br> ${zipcode || AppraisalsEnum.NA}</td>`;

			// Add location for each comparable
			comps.forEach((comp) => {
				const { street_address, city, state, zipcode } = comp.comp_details;
				let compState;
				let matchCompState;
				if (stateOptions) {
					matchCompState = stateOptions.find((obj) => obj?.code === state);
				}
				if (!matchCompState) {
					compState = state;
				} else {
					compState = matchCompState?.name;
				}
				htmlContent += `<td>${street_address || AppraisalsEnum.NA},
				<br> ${city || AppraisalsEnum.NA}, ${compState || AppraisalsEnum.NA},
				<br> ${zipcode || AppraisalsEnum.NA}</td>`;
			});

			htmlContent += `</tr><tr><td><b>Date Leased</b></td><td></td>`;

			// Add date sold for each comparable
			const dateSoldValues = await Promise.all(
				comps.map(async (comp) => {
					const { date_sold } = comp.comp_details;
					const formatDate = await helperFunction.formatDateToMDY(date_sold);
					return `<td>${formatDate || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Join all the <td> elements to add to the HTML content
			htmlContent += dateSoldValues.join('');

			// Add lease type for each comparable and subject property
			htmlContent += `</tr><tr><td><b>Lease Type</b></td><td></td>`;
			const leaseAttribute = { type: 'lease_types' };
			const leaseCodes = await this.commonStore.findGlobalCodeByAttribute(leaseAttribute);
			const { options } = leaseCodes;
			let leaseType;
			let leaseTypeCode;
			const leaseTypesHtml = await Promise.all(
				comps.map(async (comp) => {
					const { lease_type } = comp.comp_details;
					if (options) {
						leaseType = options.find((obj) => obj?.code === lease_type);
					}
					if (!leaseType) {
						leaseTypeCode = lease_type;
					} else {
						leaseTypeCode = leaseType?.name;
					}
					return `<td>${leaseTypeCode || AppraisalsEnum.NA}</td>`;
				}),
			);
			htmlContent += leaseTypesHtml.join('');

			// Add lease type for each comparable and subject property
			htmlContent += `</tr><tr><td><b>Lease Terms - Months</b></td><td></td>`;
			const leaseTerms = await Promise.all(
				comps.map(async (comp) => {
					const { term } = comp.comp_details;
					return `<td>${term || AppraisalsEnum.NA}</td>`;
				}),
			);
			htmlContent += leaseTerms.join('');

			if (comp_type === AppraisalsEnum.LAND_ONLY) {
				// Add land size for each comparable and subject property
				let landSize;
				if (analysis_type === AppraisalsEnum.PRICE_SF) {
					landSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
				} else if (analysis_type === AppraisalsEnum.PRICE_ACRE) {
					landSize = await helperFunction.formatNumber(land_size, 3, AppraisalsEnum.AC);
				}

				htmlContent += `</tr><tr><td><b>Land Size</b></td><td>${landSize || AppraisalsEnum.NA}</td>`;
				const comparisonBasis = await Promise.all(
					comps.map(async (comp) => {
						const { land_size, land_dimension } = comp.comp_details;
						let compLandSize;
						if (
							appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
							land_dimension === AppraisalsEnum.ACRE
						) {
							const LandSize = land_size * 43560;
							compLandSize = await helperFunction.formatNumber(LandSize, 0, AppraisalsEnum.SF);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
							land_dimension === AppraisalsEnum.SF
						) {
							const LandSize = land_size / 43560;
							compLandSize = await helperFunction.formatNumber(LandSize, 3, AppraisalsEnum.AC);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
							land_dimension === AppraisalsEnum.SF
						) {
							compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
						} else if (
							appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
							land_dimension === AppraisalsEnum.ACRE
						) {
							compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.AC);
						}
						return `<td>${compLandSize || AppraisalsEnum.NA}</td>`;
					}),
				);

				htmlContent += comparisonBasis.join('');
			} else if (comp_type === AppraisalsEnum.BUILDING_WITH_LAND) {
				if (comparison_basis === AppraisalsEnum.BED) {
					// Add bed value for subject property
					const totalBeds = appraisalInfo?.zonings.reduce(
						(total, zoning) => total + (zoning?.bed || 0),
						0,
					);
					const subPropertyBeds = await helperFunction.formatNumber(totalBeds, 0, '');
					htmlContent += `</tr><tr><td><b>Beds</b></td><td>${subPropertyBeds || AppraisalsEnum.NA}</td>`;
					// Add bed value for each comparable
					const compBeds = comps.map(async (comp) => {
						const { total_beds } = comp.comp_details;
						const compBed = await helperFunction.formatNumber(total_beds, 0, '');
						return `<td>${compBed || AppraisalsEnum.NA}</td>`;
					});

					// If you need to resolve the promises before using the content
					const resolvedHtmlContent = await Promise.all(compBeds);
					htmlContent += resolvedHtmlContent.join('');
				} else if (comparison_basis === AppraisalsEnum.UNIT) {
					// Add unit value for subject property
					const totalUnits = appraisalInfo?.zonings.reduce(
						(total, zoning) => total + (zoning?.unit || 0),
						0,
					);
					const subPropertyUnits = await helperFunction.formatNumber(totalUnits, 0, '');
					htmlContent += `</tr><tr><td><b>Units</b></td><td>${subPropertyUnits || AppraisalsEnum.NA}</td>`;
					// Add unit value for each comparable
					const compUnits = comps.map(async (comp) => {
						const { total_units } = comp.comp_details;
						const compUnit = await helperFunction.formatNumber(total_units, 0, '');
						return `<td>${compUnit || AppraisalsEnum.NA}</td>`;
					});
					const resolvedHtmlContent = await Promise.all(compUnits);
					htmlContent += resolvedHtmlContent.join('');
				} else {
					// Add building size/land size for each comparable and subject property
					let landSize;
					if (analysis_type === AppraisalsEnum.PRICE_SF) {
						landSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
					} else if (analysis_type === AppraisalsEnum.PRICE_ACRE) {
						landSize = await helperFunction.formatNumber(land_size, 3, AppraisalsEnum.AC);
					}

					htmlContent += `</tr><tr><td><b>Building Size / Land Size</b></td><td>${await helperFunction.formatNumber(building_size, 0, AppraisalsEnum.SF)}/${landSize || AppraisalsEnum.NA}</td>`;
					const comparisonBasis = await Promise.all(
						comps.map(async (comp) => {
							const { building_size, comparison_basis, land_size, land_dimension } =
								comp.comp_details;
							const buildingSize = await helperFunction.formatNumber(
								building_size,
								0,
								comparison_basis,
							);
							let compLandSize;
							if (
								appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
								land_dimension === AppraisalsEnum.ACRE
							) {
								const LandSize = land_size * 43560;
								compLandSize = await helperFunction.formatNumber(LandSize, 0, AppraisalsEnum.SF);
							} else if (
								appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
								land_dimension === AppraisalsEnum.SF
							) {
								const LandSize = land_size / 43560;
								compLandSize = await helperFunction.formatNumber(LandSize, 3, AppraisalsEnum.AC);
							} else if (
								appraisalInfo?.land_dimension === AppraisalsEnum.SF &&
								land_dimension === AppraisalsEnum.SF
							) {
								compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.SF);
							} else if (
								appraisalInfo?.land_dimension === AppraisalsEnum.ACRE &&
								land_dimension === AppraisalsEnum.ACRE
							) {
								compLandSize = await helperFunction.formatNumber(land_size, 0, AppraisalsEnum.AC);
							}

							return `<td>${buildingSize || AppraisalsEnum.NA}/${compLandSize || AppraisalsEnum.NA}</td>`;
						}),
					);

					htmlContent += comparisonBasis.join('');
				}
			}
			htmlContent += `</tr><tr><td><b>Suite Size</b></td><td></td>`;
			const suitSize = await Promise.all(
				comps.map(async (comp) => {
					const { space } = comp.comp_details;
					return `<td>${space || AppraisalsEnum.NA} SF</td>`;
				}),
			);
			htmlContent += suitSize.join('');

			// Validation to add extra fields when comp type is land only
			if (comp_type === AppraisalsEnum.LAND_ONLY) {
				const landAttribute = { type: GlobalCodeEnums.LAND_TYPE };
				let subLandType;
				const landTypeCodes = await this.commonStore.findGlobalCodeByAttribute(landAttribute);
				const { options } = landTypeCodes;
				if (options) {
					subLandType = options.find((obj) => obj?.code === land_type);
				}

				// Add land type for each comparable and subject property
				htmlContent += `</tr><tr><td><b>Land Type</b></td><td>${subLandType.name || AppraisalsEnum.NA}</td>`;
				const landTypes = await Promise.all(
					comps.map(async (comp) => {
						const { land_type } = comp.comp_details;
						let compLandType;
						let landCode;
						if (options) {
							compLandType = options.find((obj) => obj?.code === land_type);
						}
						if (!compLandType) {
							landCode = land_type;
						} else {
							landCode = compLandType?.name;
						}
						return `<td>${landCode || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += landTypes.join('');
			} else if (comp_type === AppraisalsEnum.BUILDING_WITH_LAND) {
				// Get global code for zoning
				const attributes = { type: GlobalCodeEnums.ZONE };
				let subjectZone;
				let subjectSubZone;
				let subjectSubZoneValue: string;
				let subjectZoneValue: string;
				const zoning = await this.commonStore.findGlobalCodeByAttribute(attributes);
				const { options } = zoning;
				if (options) {
					subjectZone = options.find((obj) => obj?.code === zonings[0]?.zone);
				}
				if (!subjectZone) {
					subjectZoneValue = zonings[0]?.zone;
				} else {
					subjectZoneValue = subjectZone?.name;
				}
				const { sub_options } = subjectZone || {};
				if (sub_options) {
					subjectSubZone = sub_options.find((obj) => obj?.code === zonings[0]?.sub_zone);
				}
				if (!subjectSubZone) {
					subjectSubZoneValue = zonings[0]?.sub_zone;
				} else {
					subjectSubZoneValue = subjectSubZone?.name;
				}
				// Add property type for each comparable and subject property
				htmlContent += `</tr><tr><td><b>Property Type/Subtype</b></td><td>${subjectZoneValue || AppraisalsEnum.NA}/${subjectSubZoneValue || AppraisalsEnum.NA}</td>`;
				comps.forEach((comp) => {
					const { zonings } = comp.comp_details;
					let zone;
					let subZone;
					let subZoneValue: string;
					let zoneValue: string;
					if (options) {
						zone = options.find((obj) => obj?.code === zonings[0]?.zone);
					}
					if (!zone) {
						zoneValue = zonings[0]?.zone;
					} else {
						zoneValue = zone?.name;
					}
					const { sub_options } = zone || {};
					if (sub_options) {
						subZone = sub_options.find((obj) => obj?.code === zonings[0]?.sub_zone);
					}
					if (!subZone) {
						subZoneValue = zonings[0]?.sub_zone;
					} else {
						subZoneValue = subZone?.name;
					}
					htmlContent += `<td>${zoneValue || AppraisalsEnum.NA}/${subZoneValue || AppraisalsEnum.NA}</td>`;
				});

				htmlContent += `</tr><tr><td><b>Year Built / Remodeled</b></td>`;
				htmlContent += `<td>${year_built || AppraisalsEnum.NA} / ${year_remodeled || AppraisalsEnum.NA}</td>`;
				// Add year built/remodeled for each comparable
				comps.forEach((comp) => {
					const { comp_details } = comp;
					htmlContent += `<td>${comp_details?.year_built || AppraisalsEnum.NA} / ${comp_details?.year_remodeled || AppraisalsEnum.NA}</td>`;
				});
			}

			// Add condition details in subject property.
			let matchCondition;
			let conditionValue;
			const subjectCondition = { type: GlobalCodeEnums.CONDITION };
			const conditionCodes = await this.commonStore.findGlobalCodeByAttribute(subjectCondition);
			const conditionOptions = conditionCodes?.options;
			if (condition === '') {
				conditionValue = 'N/A';
			} else {
				if (conditionOptions) {
					matchCondition = conditionOptions.find((obj) => obj?.code === condition);
				}
				if (!matchCondition) {
					conditionValue = condition;
				} else {
					conditionValue = matchCondition?.name;
				}
			}
			htmlContent += `</tr><tr><td><b>Condition</b></td><td>${conditionValue || AppraisalsEnum.NA}</td>`;

			// Add condition for each comparable
			comps.forEach(async (comp) => {
				const { condition } = comp.comp_details;
				let matchCompCondition;
				let compConditionValue;
				if (condition === '') {
					conditionValue = 'N/A';
				} else {
					if (conditionOptions) {
						matchCompCondition = conditionOptions.find((obj) => obj?.code === condition);
					}
					if (!matchCompCondition) {
						compConditionValue = condition;
					} else {
						compConditionValue = matchCompCondition?.name;
					}
				}
				htmlContent += `<td>${compConditionValue || AppraisalsEnum.NA}</td>`;
			});

			//Adding zoning details in subject property
			htmlContent += `</tr><tr><td><b>Zoning</b></td><td></td>`;

			// Add zoning for each comparable
			comps.forEach((comp) => {
				const { comp_details } = comp;
				htmlContent += `<td>${comp_details?.zoning_type || AppraisalsEnum.NA}</td>`;
			});

			// Add $/SF for each comparable and subject property
			if (
				comparison_basis === AppraisalsEnum.SF &&
				comp_type === AppraisalsEnum.BUILDING_WITH_LAND
			) {
				htmlContent += `</tr><tr><td><b>$/SF/YR</b></td><td></td>`;
				const compsSF = await Promise.all(
					comps.map(async (comp) => {
						const { comp_details } = comp;
						return `<td>${(await helperFunction.formatCurrency(comp_details?.price_square_foot)) + '/SF' || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsSF.join('');
			} else if (
				comparison_basis === AppraisalsEnum.BED &&
				comp_type === AppraisalsEnum.BUILDING_WITH_LAND
			) {
				htmlContent += `</tr><tr><td><b>$/Bed</b></td><td></td>`;
				const compsBed = await Promise.all(
					comps.map(async (comp) => {
						const { sale_price = 0, total_beds = 0 } = comp.comp_details || {};
						let bedPrice = 0;
						if (total_beds > 0) {
							bedPrice = sale_price / total_beds;
						}
						return `<td>${(await helperFunction.formatCurrency(bedPrice)) || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsBed.join('');
			} else if (
				comparison_basis === AppraisalsEnum.UNIT &&
				comp_type === AppraisalsEnum.BUILDING_WITH_LAND
			) {
				htmlContent += `</tr><tr><td><b>$/Unit</b></td><td></td>`;
				const compsUnit = await Promise.all(
					comps.map(async (comp) => {
						const { sale_price = 0, total_units = 0 } = comp.comp_details;
						let unitPrice = 0;
						if (total_units > 0) {
							unitPrice = sale_price / total_units;
						}
						return `<td>${(await helperFunction.formatCurrency(unitPrice)) || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsUnit.join('');
			}

			if (analysis_type === AppraisalsEnum.PRICE_SF && comp_type === AppraisalsEnum.LAND_ONLY) {
				htmlContent += `</tr><tr><td><b>$/SF/YR</b></td><td></td>`;
				const compsSF = await Promise.all(
					comps.map(async (comp) => {
						const { comp_details } = comp;
						return `<td>${(await helperFunction.formatCurrency(comp_details?.price_square_foot)) + '/SF' || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsSF.join('');
			} else if (
				analysis_type === AppraisalsEnum.PRICE_ACRE &&
				comp_type === AppraisalsEnum.LAND_ONLY
			) {
				htmlContent += `</tr><tr><td><b>$/AC/YR</b></td><td></td>`;
				const compsSF = await Promise.all(
					comps.map(async (comp) => {
						const { price_square_foot } = comp.comp_details;
						const priceSqFt = price_square_foot * AppraisalsEnum.CALCULATE_LAND;
						return `<td>${(await helperFunction.formatCurrency(priceSqFt)) + '/AC' || AppraisalsEnum.NA}</td>`;
					}),
				);
				htmlContent += compsSF.join('');
			}
			// Adding Quantitative Adjustments for subject property
			htmlContent += `</tr><tr><td><b>Quantitative Adjustments</b></td><td></td>`;

			// Add Quantitative Adjustments for each comparable
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			const subPropertyAdjHtml = await Promise.all(
				subPropertyAdjustments.map(async (subAdj) => {
					const { adj_key, adj_value } = subAdj;
					// Start building the HTML content for each adjustment
					let rowHtml = `</tr><tr><td>${adj_value || AppraisalsEnum.NA}</td><td></td>`;

					// Iterate over comps using map
					const compsHtml = await Promise.all(
						comps.map(async (comp) => {
							const { comps_adjustments } = comp;
							// Find the matching adjustment based on 'adj_key'
							const matchingAdjustment = comps_adjustments.find(
								(adjustment) => adjustment?.adj_key === adj_key,
							);
							// Extract the adjustment value
							const adjValue = matchingAdjustment?.adj_value;
							let formatValue;
							if (comp_adjustment_mode === 'Dollar') {
								// Format the adjustment value using 'helperFunction.formatCurrency'
								formatValue = await helperFunction.formatCurrency(adjValue);
							} else {
								// Format the adjustment value using 'helperFunction.formatDecimal'
								formatValue = await helperFunction.formatDecimal(adjValue, AppraisalsEnum.PERCENT);
							}
							// Return the generated HTML for this comp adjustment
							return `<td>${matchingAdjustment ? formatValue : AppraisalsEnum.NA}</td>`;
						}),
					);

					// Append the comps HTML to the row HTML
					rowHtml += compsHtml.join('');

					// Return the row HTML for this subject_property_adjustment
					return rowHtml;
				}),
			);
			// Join all the generated rows into the final HTML content
			htmlContent += subPropertyAdjHtml.join('');

			htmlContent += `</tr><tr><td><b>Qualitative Adjustments</b></td><td></td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			const subQualitativeAdjHtml = await Promise.all(
				subQualitativeAdj.map(async (subAdj) => {
					const { adj_key, adj_value } = subAdj;
					let adjValue = '';
					// Start building the HTML content for each adjustment
					if (adj_key === AppraisalsEnum.BUILDING_SIZE) {
						adjValue = await helperFunction.formatNumber(building_size, 0, AppraisalsEnum.SF);
					}
					let rowHtml = `</tr><tr><td>${adj_value || AppraisalsEnum.NA}</td><td>${adjValue}</td>`;

					// Iterate over comps using map
					const compsHtml = await Promise.all(
						comps.map(async (comp) => {
							const { comps_qualitative_adjustments } = comp;
							// Find the matching adjustment based on 'adj_key'
							const matchingAdjustment = comps_qualitative_adjustments.find(
								(adjustment) => adjustment?.adj_key === adj_key,
							);
							// Extract the adjustment value
							const adjValue = matchingAdjustment?.adj_value;
							const formatValue = await helperFunction.capitalizeFirstLetter(adjValue);

							// Return the generated HTML for this comp adjustment
							return `<td>${matchingAdjustment ? formatValue : AppraisalsEnum.NA}</td>`;
						}),
					);

					// Append the comps HTML to the row HTML
					rowHtml += compsHtml.join('');

					// Return the row HTML for this subject_property_adjustment
					return rowHtml;
				}),
			);
			// Join all the generated rows into the final HTML content
			htmlContent += subQualitativeAdjHtml.join('');

			htmlContent += `</tr><tr><td><b>Overall Adjustment</b></td><td></td>`;
			const adjustmentsHtml = await Promise.all(
				comps.map(async (comp) => {
					const { total_adjustment } = comp;
					let formattedAdjustment;
					if (comp_adjustment_mode === 'Dollar') {
						// Formatting the total adjustment value as currency
						formattedAdjustment = await helperFunction.formatCurrency(total_adjustment);
					} else {
						formattedAdjustment = await helperFunction.formatNumber(
							total_adjustment,
							2,
							AppraisalsEnum.PERCENT,
						);
					}
					return `<td>${formattedAdjustment || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Joining the generated HTML content
			htmlContent += adjustmentsHtml.join('');

			const label =
				comp_type === AppraisalsEnum.BUILDING_WITH_LAND
					? comparison_basis === AppraisalsEnum.SF
						? `${comparison_basis}/YR`
						: comparison_basis
					: analysis_type === AppraisalsEnum.PRICE_ACRE
						? AppraisalsEnum.AC
						: AppraisalsEnum.SF;
			// Adding adjusted $ value on the basis of comparison value
			htmlContent += `</tr><tr><td><b>Adjusted $/${label}</b></td><td></td>`;
			const adjustedPsfHtml = await Promise.all(
				comps.map(async (comp) => {
					const { adjusted_psf } = comp;
					const formattedPsf = await helperFunction.formatCurrency(adjusted_psf);
					return `<td>${formattedPsf || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Join all the generated table cell HTML content into a single string
			htmlContent += adjustedPsfHtml.join('');
			let low_adjusted_comp_range = 0;
			let high_adjusted_comp_range = 0;
			if (leaseApproachData) {
				({ low_adjusted_comp_range, high_adjusted_comp_range } = leaseApproachData);
			}
			const lowRangePrice = await helperFunction.formatCurrency(low_adjusted_comp_range);
			const highRangePrice = await helperFunction.formatCurrency(high_adjusted_comp_range);

			htmlContent += `</tr><tr><td><b>Adjusted Comp Range</b></td><td>${lowRangePrice || AppraisalsEnum.NA} - ${highRangePrice || AppraisalsEnum.NA}</td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			htmlContent += `</tr></table><br>`;
			let note = '';
			if (leaseApproachData) {
				({ note } = leaseApproachData);
			}
			htmlContent += `<span><b>Notes- </b></span>${note || AppraisalsEnum.NA}`;

			htmlContent += `<small>The below sale comparable for the subject property have been adjusted based on the following criteria noted by the author.</small><br><br>`;

			// Adding notes for each comparable
			htmlContent += comps
				.map((comp, index) => {
					const { comp_details, adjustment_note } = comp; // Adjust to actual key names in comp_details
					// const image = images ? `${S3_BASE_URL}${images?.dir}` : noPhotoUrl;

					return `
					  <div>
						<h4>Comparable #${index + 1}</h4>
						<span style="color:blue">${comp_details?.street_address || AppraisalsEnum.NA}</span><br>Notes:${adjustment_note || AppraisalsEnum.NA}
					  </div>
					`;
					// return `
					//   <div>
					// 	<h4>Comparable #${index + 1}</h4>
					// 	<img src="${image}" alt="Property image" height="200" width="200"><br><br>
					// 	<span style="color:blue">${comp_details?.street_address || AppraisalsEnum.NA}</span><br>${adjustment_note || AppraisalsEnum.NA}
					//   </div>
					// `;
				})
				.join('');
			return htmlContent;
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
	};

	/**
	 * @description Function to get html of lease approach by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getLeaseApproachHTML = async (
		request: GetLeaseApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<string>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Validating  query params appraisal ApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Validate approach
			const validApproach = await this.appraisalApproachesStore.findAppraisalApproaches({
				appraisal_id: appraisalId,
				id: appraisalApproachId,
			});
			// If requested lease approach not found
			if (!validApproach) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.LEASE_APPROACH_NOT_FOUND,
					error: ErrorMessageEnum.RECORD_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const leaseApproachHTML = await this.getLeaseApproachData(appraisalApproachId, appraisalId);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.LEASE_APPROACH_DATA,
				data: leaseApproachHTML,
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
	 * @description Function to manage comparative attributes of
	 * @param appraisalApproachId
	 * @param appraisalId
	 * @returns
	 */
	public saleApproachDataGet = async (
		appraisalApproachId: number,
		appraisalId: number,
	): Promise<string> => {
		try {
			let htmlContent = '';
			let comps: ISalesComp[] = [];
			let subPropertyAdjustments = [];
			let subQualitativeAdj = [];
			let salesComparisonAttribute: ISaleComparisonAttributes[];
			let averagedAdjustedPsf = 0;
			let salesApproachValue = 0;
			let saleApproachData: ISalesApproach;
			let approach;
			let saleName = '';
			// Fetch appraisal data for subject property.
			const [appraisalInfo, images] = await Promise.all([
				this.storage.getAppraisal({ id: appraisalId }),
				this.appraisalFilesStorage.findFilesByAttribute({
					appraisal_id: appraisalId,
					title: ImagesPageEnum.COVER,
				}),
			]);
			if (appraisalApproachId) {
				saleApproachData = await this.appraisalSalesApproachStore.findByAttribute({
					appraisal_approach_id: appraisalApproachId,
				});
				approach = await this.appraisalApproachesStore.findAppraisalApproaches({
					id: saleApproachData?.appraisal_approach_id,
				});
				saleName = approach?.name;
			} else {
				approach = await this.appraisalApproachesStore.findSelectedApproaches({
					appraisal_id: appraisalId,
					type: AppraisalsEnum.SALE,
				});
				saleApproachData = await this.appraisalSalesApproachStore.findByAttribute({
					appraisal_approach_id: approach[0].id,
				});
				saleName = approach[0].name;
			}

			if (saleApproachData) {
				comps = saleApproachData?.comps;
				subPropertyAdjustments = saleApproachData?.subject_property_adjustments;
				averagedAdjustedPsf = saleApproachData?.averaged_adjusted_psf;
				salesApproachValue = saleApproachData?.sales_approach_value;
				subQualitativeAdj = saleApproachData?.subject_qualitative_adjustments;
				salesComparisonAttribute = saleApproachData?.sales_comparison_attributes;
			}

			// Get global code for zoning
			const attributes = { status: 1 };
			let subjectZone;
			let subjectSubZone;
			let subjectSubZoneValue: string;
			let subjectZoneValue: string;
			const codes = await this.commonStore.getGlobalCodeCategoriesByAttribute(attributes);
			// Get the zoning object from global codes
			const zoningCodes = codes.find((code: { type: string }) => code.type === CompsEnum.ZONE);
			const { options } = zoningCodes;

			// Get the condition object from global codes
			const conditionCodes = codes.find(
				(code: { type: string }) => code.type === CompsEnum.CONDITION,
			);
			const conditionOptions = conditionCodes.options;

			// Get the condition object from global codes
			const topographyCodes = codes.find(
				(code: { type: string }) => code.type === CompsEnum.TOPOGRAPHIES,
			);
			const topographyOptions = topographyCodes.options;

			const {
				street_address,
				city,
				state,
				business_name,
				building_size,
				land_size,
				condition,
				zonings,
				comparison_basis,
				comp_type,
				land_type,
				utilities_select,
				topography,
				lot_shape,
				analysis_type,
				year_built,
				year_remodeled,
				total_property_baths,
				total_property_beds,
				total_units,
				county,
				zipcode,
				comp_adjustment_mode,
			} = appraisalInfo;

			htmlContent += `<h2>Sales Comparison <b>Approach</b> (${saleName || AppraisalsEnum.NA})</h2>`;
			htmlContent += `<table style="width:100%; border-collapse: collapse;" border="1"><tr><td></td><td><b>Subject Property</b></td>`;

			const noPhotoUrl =
				'data:image/png;base64,' +
				(await fs.readFileSync('./src/images/no-photo-available.png', { encoding: 'base64' }));
			// Add headers for each comparable
			comps.forEach((_, index) => {
				htmlContent += `<td><b>Comparable #${index + 1}</b></td>`;
			});
			const image = images ? `${S3_BASE_URL}${images?.dir}` : noPhotoUrl;
			htmlContent += `</tr><tr><td style="text-align: center;"></td><td><img src="${image}" alt="Property image" height = "100",width="300"></td>`;

			// Add empty cells for each comparable's image
			comps.forEach((comp) => {
				const { property_image_url } = comp.comp_details;
				const image = property_image_url ? `${S3_BASE_URL}${property_image_url}` : noPhotoUrl;
				htmlContent += `<td style="text-align: center;"><img src="${image}" alt="Property image" height = "100",width="300"></td>`;
			});
			let fullState;
			const getStates = await this.commonStore.findGlobalCodeByAttribute({
				type: GlobalCodeEnums.STATES,
			});
			const stateOptions = getStates?.options;
			const matchState = stateOptions.find((obj) => obj?.code === state);
			if (!matchState) {
				fullState = state;
			} else {
				fullState = matchState?.name;
			}

			// Add location for subject property and comps
			htmlContent += `</tr><tr><td><b>Location</b></td><td>${street_address || AppraisalsEnum.NA},<br>
			${city || AppraisalsEnum.NA},<br>${fullState || AppraisalsEnum.NA},<br>${zipcode || AppraisalsEnum.NA}</td>`;
			// Add location for each comparable
			comps.forEach((comp) => {
				const { comp_details } = comp;
				let compState;
				let matchCompState;
				if (stateOptions) {
					matchCompState = stateOptions.find((obj) => obj?.code === comp_details.state);
				}
				if (!matchCompState) {
					compState = comp_details.state;
				} else {
					compState = matchCompState?.name;
				}
				htmlContent += `<td>${comp_details.street_address || AppraisalsEnum.NA},<br>
				${comp_details.city || AppraisalsEnum.NA},<br>
				${compState || AppraisalsEnum.NA},<br>
				${comp_details.zipcode || AppraisalsEnum.NA}</td>`;
			});

			// Add date sold for comps and subject property and comps
			htmlContent += `</tr><tr><td><b>Date Sold</b></td><td></td>`;
			const dateSoldValues = await Promise.all(
				comps.map(async (comp) => {
					const { date_sold, sale_status } = comp.comp_details;
					let showDate;
					if (sale_status === AppraisalsEnum.PENDING) {
						showDate = AppraisalsEnum.PENDING;
					} else {
						showDate = await helperFunction.formatDateToMDY(date_sold);
					}
					return `<td>${showDate || AppraisalsEnum.NA}</td>`;
				}),
			);

			// Join all the <td> elements to add to the HTML content
			htmlContent += dateSoldValues.join('');
			// Creating table for subject property and comps according to sales comparison attributes.
			if (salesComparisonAttribute?.length) {
				for (let index = 0; index < salesComparisonAttribute?.length; index++) {
					const attribute = salesComparisonAttribute[index];

					const { comparison_key, comparison_value } = attribute;

					switch (comparison_key) {
						case AppraisalsEnum.STREET_ADDRESS:
							{
								// Add location for subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${street_address || AppraisalsEnum.NA}</td>`;
								// Add location for each comparable
								comps.forEach((comp) => {
									const { street_address } = comp.comp_details;
									htmlContent += `<td>${street_address || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case SaleComparativeAttribute.CITY_STATE:
							{
								// Add location for subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${city || AppraisalsEnum.NA},${fullState || AppraisalsEnum.NA}</td>`;
								// Add location for each comparable
								comps.forEach((comp) => {
									const { city, state } = comp.comp_details;
									let compState;
									let matchCompState;
									if (stateOptions) {
										matchCompState = stateOptions.find((obj) => obj?.code === state);
									}
									if (!matchCompState) {
										compState = state;
									} else {
										compState = matchCompState?.name;
									}
									htmlContent += `<td>${city || AppraisalsEnum.NA},${compState || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case SaleComparativeAttribute.CITY_COUNTY:
							{
								// Add location for subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${city || AppraisalsEnum.NA},${county || AppraisalsEnum.NA}</td>`;
								// Add location for each comparable
								comps.forEach((comp) => {
									const { city, county } = comp.comp_details;
									htmlContent += `<td>${city || AppraisalsEnum.NA},${county || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case AppraisalsEnum.BUSINESS_NAME:
							{
								// Add location for subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${business_name || AppraisalsEnum.NA}</td>`;
								// Add location for each comparable
								comps.forEach((comp) => {
									const { business_name } = comp.comp_details;
									htmlContent += `<td>${business_name || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case AppraisalsEnum.BUILDING_SIZE:
							{
								let buildingSizeSubProperty;
								if (comp_type === AppraisalsEnum.LAND_ONLY) {
									buildingSizeSubProperty = AppraisalsEnum.NA;
								} else {
									buildingSizeSubProperty = await helperFunction.formatNumber(building_size, 0, '');
								}
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${buildingSizeSubProperty}</td>`;
								const comparisonBasis = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										let compBuildingSize;
										if (comp_details.comp_type === AppraisalsEnum.LAND_ONLY) {
											compBuildingSize = AppraisalsEnum.NA;
										} else {
											compBuildingSize = await helperFunction.formatNumber(
												comp_details.building_size,
												0,
												'',
											);
										}
										return `<td>${compBuildingSize || AppraisalsEnum.NA}</td>`;
									}),
								);

								htmlContent += comparisonBasis.join('');
							}
							break;
						case SaleComparativeAttribute.SALE_PRICE:
							{
								// Add sales price for each comparable and subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const salePrices = await Promise.all(
									comps.map(async (comp) => {
										const { sale_price } = comp.comp_details;
										const salePrice = await helperFunction.formatCurrency(sale_price);
										return `<td>${salePrice || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += salePrices.join('');
							}
							break;
						case AppraisalsEnum.LAND_TYPE:
							{
								// Add land type for each comparable and subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${land_type || AppraisalsEnum.NA}</td>`;
								const landTypes = await Promise.all(
									comps.map(async (comp) => {
										const { land_type } = comp.comp_details;
										return `<td>${land_type || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += landTypes.join('');
							}
							break;
						case SaleComparativeAttribute.LAND_SIZE_SF:
							{
								// Add land size square feet for each comparable and subject property
								let subjectLandSize: AppraisalsEnum | string = AppraisalsEnum.NA;

								if (land_size) {
									const isAcre = appraisalInfo?.land_dimension === AppraisalsEnum.ACRE;
									const landSizeValue = isAcre ? land_size * 43560 : land_size;
									subjectLandSize = await helperFunction.formatNumber(landSizeValue, 0, '');
								}

								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${subjectLandSize}</td>`;

								const landSizes = await Promise.all(
									comps.map(async (comp) => {
										const { land_size, land_dimension } = comp.comp_details;
										let compLandSize;
										if (!land_size) {
											return `<td>${AppraisalsEnum.NA}</td>`;
										}
										if (land_dimension === AppraisalsEnum.ACRE) {
											const LandSize = land_size * 43560;
											compLandSize = await helperFunction.formatNumber(LandSize, 0, '');
											return `<td>${compLandSize || AppraisalsEnum.NA}</td>`;
										} else {
											compLandSize = await helperFunction.formatNumber(land_size, 0, '');
											return `<td>${compLandSize || AppraisalsEnum.NA}</td>`;
										}
									}),
								);
								htmlContent += landSizes.join('');
							}
							break;
						case SaleComparativeAttribute.LAND_SIZE_AC:
							{
								// Add land size for each comparable and subject property
								let subjectLandSize;
								if (!land_size) {
									htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${AppraisalsEnum.NA}</td>`;
								}
								if (appraisalInfo?.land_dimension === AppraisalsEnum.SF) {
									const LandSize = land_size / 43560;
									subjectLandSize = await helperFunction.formatNumber(LandSize, 3, '');
									htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${subjectLandSize || AppraisalsEnum.NA}</td>`;
								} else {
									subjectLandSize = await helperFunction.formatNumber(land_size, 3, '');
									htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${subjectLandSize || AppraisalsEnum.NA}</td>`;
								}

								const landSizes = await Promise.all(
									comps.map(async (comp) => {
										const { land_size, land_dimension } = comp.comp_details;
										let compLandSize;
										if (!land_size) {
											return `<td>${AppraisalsEnum.NA}</td>`;
										}
										if (land_dimension === AppraisalsEnum.SF) {
											const LandSize = land_size / 43560;
											compLandSize = await helperFunction.formatNumber(LandSize, 3, '');
										} else {
											compLandSize = await helperFunction.formatNumber(land_size, 3, '');
										}
										return `<td>${compLandSize || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += landSizes.join('');
							}
							break;
						case AppraisalsEnum.UTILITIES_SELECT:
							{
								// Add Utilities for each comparable and subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${utilities_select || AppraisalsEnum.NA}</td>`;
								const utilities = await Promise.all(
									comps.map(async (comp) => {
										const { utilities_select } = comp.comp_details;
										return `<td>${utilities_select || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += utilities.join('');
							}
							break;
						case AppraisalsEnum.TOPOGRAPHY:
							{
								// Add condition for each comparable and subject property
								let match;
								let value;
								if (topography === '') {
									value = 'N/A';
								} else {
									if (topographyOptions) {
										match = topographyOptions.find((obj) => obj?.code === topography);
									}
									if (!match) {
										value = topography;
									} else {
										value = match?.name;
									}
								}
								// Add topography for each comparable and subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${value || AppraisalsEnum.NA}</td>`;
								const topographyHtml = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										let matchComp;
										let compValue;
										if (comp_details?.topography === '') {
											compValue = 'N/A';
										} else {
											if (topographyOptions) {
												matchComp = topographyOptions.find(
													(obj) => obj?.code === comp_details?.topography,
												);
											}
											if (!matchComp) {
												compValue = comp_details?.topography;
											} else {
												compValue = matchComp?.name;
											}
										}
										return `<td>${compValue || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += topographyHtml.join('');
							}
							break;
						case AppraisalsEnum.LOT_SHAPE:
							{
								// Add Shape for each comparable and subject property
								htmlContent += `</tr><tr><td><b>Shape</b></td><td>${lot_shape || AppraisalsEnum.NA}</td>`;
								const ShapeHtml = await Promise.all(
									comps.map(async (comp) => {
										const { lot_shape } = comp.comp_details;
										return `<td>${lot_shape || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += ShapeHtml.join('');
							}
							break;
						case SaleComparativeAttribute.ZONING_TYPE:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;

								// Add zoning for each comparable
								comps.forEach((comp) => {
									const { comp_details } = comp;
									htmlContent += `<td>${comp_details?.zoning_type || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case SaleComparativeAttribute.ZONE:
							{
								if (options) {
									subjectZone = options.find((obj) => obj?.code === zonings[0]?.zone);
								}
								if (!subjectZone) {
									subjectZoneValue = zonings[0]?.zone;
								} else {
									subjectZoneValue = subjectZone?.name;
								}
								const { sub_options } = subjectZone || {};
								if (sub_options) {
									subjectSubZone = sub_options.find((obj) => obj?.code === zonings[0]?.sub_zone);
								}
								if (!subjectSubZone) {
									subjectSubZoneValue = zonings[0]?.sub_zone;
								} else {
									subjectSubZoneValue = subjectSubZone?.name;
								}
								// Add property type for each comparable and subject property
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${subjectZoneValue || AppraisalsEnum.NA}/${subjectSubZoneValue || AppraisalsEnum.NA}</td>`;
								comps.forEach((comp) => {
									const { zonings } = comp.comp_details;
									let zone;
									let subZone;
									let subZoneValue: string;
									let zoneValue: string;
									if (options) {
										zone = options.find((obj) => obj?.code === zonings[0]?.zone);
									}
									if (!zone) {
										zoneValue = zonings[0]?.zone;
									} else {
										zoneValue = zone?.name;
									}
									const { sub_options } = zone || {};
									if (sub_options) {
										subZone = sub_options.find((obj) => obj?.code === zonings[0]?.sub_zone);
									}
									if (!subZone) {
										subZoneValue = zonings[0]?.sub_zone;
									} else {
										subZoneValue = subZone?.name;
									}
									htmlContent += `<td>${zoneValue || AppraisalsEnum.NA}/${subZoneValue || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case SaleComparativeAttribute.YEAR_BUILT_REMODELED:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td>`;
								htmlContent += `<td>${year_built || AppraisalsEnum.NA} / ${year_remodeled || AppraisalsEnum.NA}</td>`;
								// Add year built/remodeled for each comparable
								comps.forEach((comp) => {
									const { comp_details } = comp;
									htmlContent += `<td>${comp_details?.year_built || AppraisalsEnum.NA} / ${comp_details?.year_remodeled || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case SaleComparativeAttribute.QUALITY_CONDITION:
							{
								// Add condition for each comparable and subject property
								let matchCondition;
								let conditionValue;
								if (condition === '') {
									conditionValue = 'N/A';
								} else {
									if (conditionOptions) {
										matchCondition = conditionOptions.find((obj) => obj?.code === condition);
									}
									if (!matchCondition) {
										conditionValue = condition;
									} else {
										conditionValue = matchCondition?.name;
									}
								}
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${conditionValue || AppraisalsEnum.NA}</td>`;

								// Add condition for each comparable
								comps.forEach(async (comp) => {
									const { comp_details } = comp;
									let matchCompCondition;
									let compConditionValue;
									if (conditionOptions) {
										matchCompCondition = conditionOptions.find(
											(obj) => obj?.code === comp_details?.condition,
										);
									}
									if (!matchCompCondition) {
										compConditionValue = comp_details?.condition;
									} else {
										compConditionValue = matchCompCondition?.name;
									}
									htmlContent += `<td>${compConditionValue || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case SaleComparativeAttribute.UNIT_MIX:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td>`;
								htmlContent += `<td>${total_property_beds || AppraisalsEnum.NA}/${total_property_baths || AppraisalsEnum.NA}</td>`;
								// Add year built/remodeled for each comparable
								comps.forEach((comp) => {
									const { comp_details } = comp;
									htmlContent += `<td>${comp_details?.total_property_beds || AppraisalsEnum.NA}/${comp_details?.total_property_baths || AppraisalsEnum.NA}</td>`;
								});
							}
							break;
						case SaleComparativeAttribute.PRICE_PER_SF:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const compsSF = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										return `<td>${(await helperFunction.formatCurrency(comp_details?.price_square_foot)) || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += compsSF.join('');
							}
							break;
						case SaleComparativeAttribute.PRICE_PER_UNIT:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const compsUnit = await Promise.all(
									comps.map(async (comp) => {
										const { sale_price = 0, total_units = 0 } = comp.comp_details;
										let unitPrice = 0;
										if (total_units > 0) {
											unitPrice = sale_price / total_units;
										}
										return `<td>${(await helperFunction.formatCurrency(unitPrice)) || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += compsUnit.join('');
							}
							break;
						case SaleComparativeAttribute.PRICE_PER_ACRE:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const compsPrice = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										let calculatePrice;
										let calLandSize = comp_details.land_size;
										if (!calLandSize) {
											calculatePrice = 0;
											return `<td>${(await helperFunction.formatCurrency(calculatePrice)) || AppraisalsEnum.NA}</td>`;
										}
										if (comp_details.land_dimension === AppraisalsEnum.SF) {
											calLandSize = parseFloat((comp_details.land_size / 43560).toFixed(3));
										}
										calculatePrice = comp_details.sale_price / calLandSize;
										return `<td>${(await helperFunction.formatCurrency(calculatePrice)) || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += compsPrice.join('');
							}
							break;
						case SaleComparativeAttribute.CAP_RATE:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const capRate = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										let formatCapRate = null;
										if (comp_details?.cap_rate) {
											formatCapRate = comp_details?.cap_rate + AppraisalsEnum.PERCENT;
										}
										return `<td>${formatCapRate || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += capRate.join('');
							}
							break;
						case SaleComparativeAttribute.GRANTOR:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const grantorValue = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										return `<td>${comp_details?.grantor || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += grantorValue.join('');
							}
							break;
						case SaleComparativeAttribute.GRANTEE:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const granteeValue = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										return `<td>${comp_details?.grantee || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += granteeValue.join('');
							}
							break;
						case SaleComparativeAttribute.EFFECTIVE_AGE:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const effectiveAge = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										return `<td>${comp_details?.effective_age || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += effectiveAge.join('');
							}
							break;
						case SaleComparativeAttribute.NO_OF_UNIT:
							{
								const formatUnit = await helperFunction.formatNumber(total_units, 0, '');
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${formatUnit || AppraisalsEnum.NA}</td>`;
								const totalUnits = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										const formatCompUnit = await helperFunction.formatNumber(
											comp_details?.total_units,
											0,
											'',
										);
										return `<td>${formatCompUnit || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += totalUnits.join('');
							}
							break;
						case SaleComparativeAttribute.PRICE_PER_SF_LAND:
							{
								htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td></td>`;
								const pricePerSq = await Promise.all(
									comps.map(async (comp) => {
										const { comp_details } = comp;
										let calLandSize = comp_details.land_size;
										let calculatePrice;
										if (!calLandSize) {
											calculatePrice = 0;
											return `<td>${(await helperFunction.formatCurrency(calculatePrice)) || AppraisalsEnum.NA}</td>`;
										}
										if (comp_details.land_dimension === AppraisalsEnum.ACRE) {
											calLandSize = comp_details.land_size * 43560;
										}
										calculatePrice = comp_details.sale_price / calLandSize;
										return `<td>${(await helperFunction.formatCurrency(calculatePrice)) || AppraisalsEnum.NA}</td>`;
									}),
								);
								htmlContent += pricePerSq.join('');
							}
							break;
						case SaleComparativeAttribute.UNIT_SIZE_SF:
							{
								// let maxUnitSize;
								// let formatUnitSize;
								// if (property_units?.length) {
								// 	// Extract the maximum value of 'sq_ft'
								// 	maxUnitSize = Math.max(...property_units.map((obj) => obj?.sq_ft));
								// 	formatUnitSize = await helperFunction.formatNumber(maxUnitSize, 0, '');
								// }
								// htmlContent += `</tr><tr><td><b>${comparison_value}</b></td><td>${formatUnitSize || AppraisalsEnum.NA}</td>`;
								// const unitSize = await Promise.all(
								// 	comps.map(async (comp) => {
								// 		const { property_units } = comp.comp_details;
								// 		let maxCompUnitSize;
								// 		let formatCompUnitSize;
								// 		if (property_units?.length) {
								// 			// Extract the maximum value of 'sq_ft' in comps
								// 			maxCompUnitSize = Math.max(...property_units.map((obj) => obj?.sq_ft));
								// 			formatCompUnitSize = await helperFunction.formatNumber(
								// 				maxCompUnitSize,
								// 				0,
								// 				'',
								// 			);
								// 		}
								// 		return `<td>${formatCompUnitSize || AppraisalsEnum.NA}</td>`;
								// 	}),
								// );
								// htmlContent += unitSize.join('');
							}
							break;
						default:
							`<td></td>`;
					}
				}
			}

			//Handle building with land case
			htmlContent += `</tr><tr><td><b>Quantitative Adjustments</b></td><td></td>`;

			// Add comparison criteria for each comparable
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			const subPropertyAdjHtml = await Promise.all(
				subPropertyAdjustments.map(async (subAdj) => {
					const { adj_key, adj_value } = subAdj;
					// Start building the HTML content for each adjustment
					let rowHtml = `</tr><tr><td>${adj_value || AppraisalsEnum.NA}</td><td></td>`;

					// Iterate over comps using map
					const compsHtml = await Promise.all(
						comps.map(async (comp) => {
							const { comps_adjustments } = comp;
							// Find the matching adjustment based on 'adj_key'
							const matchingAdjustment = comps_adjustments.find(
								(adjustment) => adjustment?.adj_key === adj_key,
							);
							// Extract the adjustment value
							const adjValue = matchingAdjustment?.adj_value;
							let adjustmentValue;
							if (comp_adjustment_mode === 'Percent') {
								// Format the adjustment value using 'helperFunction.formatDecimal'
								adjustmentValue = await helperFunction.formatDecimal(
									adjValue,
									AppraisalsEnum.PERCENT,
								);
							} else if (comp_adjustment_mode === 'Dollar') {
								// Format the adjustment value using 'helperFunction.formatCurrency'
								adjustmentValue = await helperFunction.formatCurrency(adjValue);
							}
							// Return the generated HTML for this comp adjustment
							return `<td>${matchingAdjustment ? adjustmentValue : AppraisalsEnum.NA}</td>`;
						}),
					);

					// Append the comps HTML to the row HTML
					rowHtml += compsHtml.join('');

					// Return the row HTML for this subject_property_adjustment
					return rowHtml;
				}),
			);
			// Join all the generated rows into the final HTML content
			htmlContent += subPropertyAdjHtml.join('');

			// Adding data of Qualitative Adjustments for comps
			htmlContent += `</tr><tr><td><b>Qualitative Adjustments</b></td><td></td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			const subQualitativeAdjHtml = await Promise.all(
				subQualitativeAdj.map(async (subAdj) => {
					const { adj_key, adj_value } = subAdj;
					// Start building the HTML content for each adjustment
					let buildingSize;
					if (comp_type === AppraisalsEnum.LAND_ONLY) {
						buildingSize = AppraisalsEnum.NA;
					} else {
						buildingSize = await helperFunction.formatNumber(building_size, 0, AppraisalsEnum.SF);
					}
					let adjustmentValue = `<td></td>`;
					if (adj_value === ReportTemplateEnum.BUILDING_SIZE) {
						adjustmentValue = `<td>${buildingSize}</td>`;
					}
					let rowHtml = `</tr><tr><td>${adj_value || AppraisalsEnum.NA}</td>${adjustmentValue}`;

					// Iterate over comps using map
					const compsHtml = await Promise.all(
						comps.map(async (comp) => {
							const { comps_qualitative_adjustments } = comp;
							// Find the matching adjustment based on 'adj_key'
							const matchingAdjustment = comps_qualitative_adjustments.find(
								(adjustment) => adjustment?.adj_key === adj_key,
							);
							// Extract the adjustment value
							const adjValue = matchingAdjustment?.adj_value;
							const formatValue = await helperFunction.capitalizeFirstLetter(adjValue);

							// Return the generated HTML for this comp adjustment
							return `<td>${matchingAdjustment ? formatValue : AppraisalsEnum.NA}</td>`;
						}),
					);

					// Append the comps HTML to the row HTML
					rowHtml += compsHtml.join('');

					// Return the row HTML for this subject_property_adjustment
					return rowHtml;
				}),
			);
			// Join all the generated rows into the final HTML content
			htmlContent += subQualitativeAdjHtml.join('');

			htmlContent += `</tr><tr><td><b>Overall Comparability</b></td><td></td>`;
			const comparabilityHtml = await Promise.all(
				comps.map(async (comp) => {
					const { overall_comparability } = comp;
					const formatValue = await helperFunction.capitalizeFirstLetter(overall_comparability);
					return `<td>${formatValue || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Joining the generated HTML content
			htmlContent += comparabilityHtml.join('');

			htmlContent += `</tr><tr><td><b>Overall Adjustment</b></td><td></td>`;
			const adjustmentsHtml = await Promise.all(
				comps.map(async (comp) => {
					const { total_adjustment } = comp;
					let formattedAdjustment;
					if (comp_adjustment_mode === 'Dollar') {
						formattedAdjustment = await helperFunction.formatCurrency(total_adjustment);
					} else {
						formattedAdjustment = await helperFunction.formatNumber(
							total_adjustment,
							2,
							AppraisalsEnum.PERCENT,
						);
					}
					return `<td>${formattedAdjustment || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Joining the generated HTML content
			htmlContent += adjustmentsHtml.join('');

			const label =
				comp_type === AppraisalsEnum.BUILDING_WITH_LAND
					? comparison_basis
					: analysis_type === AppraisalsEnum.PRICE_ACRE
						? AppraisalsEnum.AC
						: AppraisalsEnum.SF;
			// Adding adjusted $ value on the basis of comparison value
			htmlContent += `</tr><tr><td><b>Adjusted $/${label}</b></td><td></td>`;
			const adjustedPsfHtml = await Promise.all(
				comps.map(async (comp) => {
					const { adjusted_psf } = comp;
					const formattedPsf = await helperFunction.formatCurrency(adjusted_psf);
					return `<td>${formattedPsf || AppraisalsEnum.NA}</td>`;
				}),
			);
			// Join all the generated table cell HTML content into a single string
			htmlContent += adjustedPsfHtml.join('');

			//Handling unit and bed case
			if (comparison_basis === AppraisalsEnum.BED) {
				htmlContent += `</tr><tr><td><b>Average Adjusted $/Bed</b></td><td>${(await helperFunction.formatCurrency(averagedAdjustedPsf)) + '/Bed' || AppraisalsEnum.NA}</td>`;
				comps.forEach(() => {
					htmlContent += `<td></td>`;
				});
			} else if (comparison_basis === AppraisalsEnum.UNIT) {
				htmlContent += `</tr><tr><td><b>Average Adjusted $/Unit</b></td><td>${(await helperFunction.formatCurrency(averagedAdjustedPsf)) + '/Unit' || AppraisalsEnum.NA}</td>`;
				comps.forEach(() => {
					htmlContent += `<td></td>`;
				});
			} else {
				htmlContent += `</tr><tr><td><b>Average Adjusted $/${label}</b></td><td>${(await helperFunction.formatCurrency(averagedAdjustedPsf)) + `/${label}` || AppraisalsEnum.NA}</td>`;
				comps.forEach(() => {
					htmlContent += `<td></td>`;
				});
			}

			let totalSaleValue;
			if (comp_type === AppraisalsEnum.BUILDING_WITH_LAND) {
				if (comparison_basis === AppraisalsEnum.UNIT) {
					totalSaleValue = averagedAdjustedPsf * total_units;
				} else if (comparison_basis === AppraisalsEnum.BED) {
					const totalBeds = zonings.reduce((sum, item) => sum + item.bed, 0);
					totalSaleValue = averagedAdjustedPsf * totalBeds;
				} else {
					totalSaleValue = salesApproachValue;
				}
			} else if (comp_type === AppraisalsEnum.LAND_ONLY) {
				totalSaleValue = land_size * averagedAdjustedPsf;
			}

			htmlContent += `</tr><tr><td><b>Adjusted Comp Value</b></td><td>${(await helperFunction.formatCurrency(totalSaleValue)) || AppraisalsEnum.NA}</td>`;
			comps.forEach(() => {
				htmlContent += `<td></td>`;
			});
			htmlContent += `</tr></table><br>`;
			htmlContent += `<span><b>Notes: </b></span>${saleApproachData?.note || AppraisalsEnum.NA}<br><br>`;

			htmlContent += `<small>The below sale comparable for the subject property have been adjusted based on the following criteria noted by the author.</small><br><br>`;

			// Adding notes for each comparable
			htmlContent += comps
				.map((comp, index) => {
					const { comp_details, adjustment_note } = comp; // Adjust to actual key names in comp_details
					// const image = images ? `${S3_BASE_URL}${images?.dir}` : noPhotoUrl;

					return `
					  <div>
						<h4>Comparable #${index + 1}</h4>
						<span style="color:blue">${comp_details?.street_address || AppraisalsEnum.NA}</span><br>Notes: ${adjustment_note || AppraisalsEnum.NA}
					  </div><br><br>
					`;
					// return `
					//   <div>
					// 	<h4>Comparable #${index + 1}</h4>
					// 	<img src="${image}" alt="Property image" height="200" width="200"><br><br>
					// 	<span style="color:blue">${comp_details?.street_address || AppraisalsEnum.NA}</span><br>${adjustment_note || AppraisalsEnum.NA}
					//   </div><br><br>
					// `;
				})
				.join('');
			return htmlContent;
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
	};

	/**
	 * @description Get list of sale Comparative Attributes
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAllSaleComparativeAttributes = async (
		request: IGetRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISaleComparitivesListSuccess;
		try {
			const { appraisal_type } = request.query;
			const attributes = { status: 1, code: appraisal_type };
			// Get codes by attribute
			const saleComapritiveAttributes =
				await this.storage.getAllSaleComparativeAttributes(attributes);
			if (!saleComapritiveAttributes) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: CommonEnum.GLOBAL_CODE_CATEGORY_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CommonEnum.GLOBAL_CODE_CATEGORIES_LIST,
				data: saleComapritiveAttributes,
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
	 * @description Function to create table of income comparison in report.
	 * @param attributes
	 * @returns
	 */
	public incomeComparisonComponent = async (
		attributes: Partial<IIncomeApproachHtml>,
	): Promise<string> => {
		try {
			const { appraisalId } = attributes;
			let htmlContent = `<h3>Income Comparison</h3>`;
			let approachData;

			const allApproachData: IAppraisalIncomeApproach[] = [];

			const approaches = await this.appraisalApproachesStore.findSelectedApproaches({
				appraisal_id: appraisalId,
				type: AppraisalsEnum.INCOME,
			});

			// Get global code for zoning
			const subZonesCode = await this.commonStore.getGlobalSubOptions({
				global_code_category_id: 1,
			});
			htmlContent += `<table style="width:100%; text-align: left; border-collapse: collapse;" border="1"><tr><th style="background-color:rgb(238, 238, 238);"><u>Income:</u></th>`;

			if (approaches && approaches?.length > 0) {
				// Iterate through approaches and construct HTML for income names
				for (let index = 0; index < approaches?.length; index++) {
					const item = approaches[index];
					const { id, name } = item;
					approachData = await this.appraisalIncomeStore.findByAttribute({
						appraisal_approach_id: id,
					});

					allApproachData.push(approachData);

					htmlContent += `<th style="background-color:rgb(238, 238, 238);">${name || AppraisalsEnum.NA}</th>
					<th style="background-color:rgb(238, 238, 238);"></th>`;
				}
				htmlContent += `</tr>`;

				const allZones = [];
				const columnSums: number[] = new Array(approaches?.length).fill(0);

				// Print First income Approach sources on the basis of index
				if (allApproachData[0]) {
					const { incomeSources } = allApproachData[0] || {};

					// Iterate through income sources and construct HTML for source information
					for (const source of incomeSources) {
						const { annual_income, type } = source;
						const annualIncome = await helperFunction.formatCurrency(annual_income);

						// Add property type for each comparable
						let subZone;
						let subZoneValue: string;

						if (subZonesCode) {
							subZone = subZonesCode.find((obj) => obj?.code === type);
						}
						if (!subZone) {
							subZoneValue = type;
						} else {
							subZoneValue = subZone?.name;
						}
						allZones.push(type);
						htmlContent += `<tr><td>${subZoneValue}</td><td>${annualIncome}</td><td></td>`;
						columnSums[0] += annual_income || 0;

						for (let i = 1; i < allApproachData?.length; i++) {
							const approach = allApproachData[i];
							let annual_income = 0;
							if (approach) {
								const { incomeSources = [] } = approach || {};
								const result = incomeSources.find((item) => item?.type === type);
								if (result) {
									annual_income = result?.annual_income;
								}
							}
							const annualIncome = await helperFunction.formatCurrency(annual_income);
							htmlContent += `<td>${annualIncome}</td><td></td>`;
							columnSums[i] += annual_income || 0;
						}

						htmlContent += `</tr>`;
					}
				}
				if (allApproachData?.length > 1) {
					for (let k = 1; k < allApproachData?.length; k++) {
						const { incomeSources = [] } = allApproachData[k] || {};
						let sourceResult = [];
						sourceResult = incomeSources.filter((obj) => !allZones.includes(obj?.type));

						// Prepare rows for each source
						const htmlRows = await Promise.all(
							sourceResult.map(async (element) => {
								const { type } = element;

								// Find type value and subTypeValue
								const typeValue = subZonesCode?.find((obj) => obj?.code === type);
								const subTypeValue = typeValue?.name || type;

								let rowContent = `<tr><td>${subTypeValue}</td>`;

								// Loop through allApproachData to get annual_income
								for (let j = 0; j < allApproachData?.length; j++) {
									const { incomeSources = [] } = allApproachData[j] || {};
									const result = incomeSources?.find((item) => item?.type === type);
									const annual_income = result?.annual_income || 0;

									// Format currency and update column sums
									const annualIncome = await helperFunction.formatCurrency(annual_income);
									columnSums[j] += annual_income;
									rowContent += `<td>${annualIncome}</td><td></td>`;
								}

								rowContent += '</tr>';
								return rowContent;
							}),
						);

						// Append rows to the HTML content
						htmlContent += htmlRows.join('');
					}
				}

				htmlContent += `</tr>`;

				//Add Collected Revenue row
				htmlContent += `<tr><th>Collected Revenue:</th>`;
				for (const sum of columnSums) {
					const formatSum = await helperFunction.formatCurrency(sum);
					htmlContent += `<td><b>${formatSum}</b></td><td></td>`;
				}
				htmlContent += `</tr>`;

				//Subtracting vacancy amount from collected revenue
				htmlContent += `<tr><td>Less Vacancy:</td>`;
				for (let index = 0; index < allApproachData?.length; index++) {
					const element = allApproachData[index];
					let vacant_amount = 0;
					if (element) {
						vacant_amount = element?.vacant_amount;
					}
					const vacantAmount = await helperFunction.formatCurrency(vacant_amount);
					htmlContent += `<td>${vacantAmount}</td><td></td>`;
				}
				htmlContent += `</tr>`;

				//Adding other income
				htmlContent += `<tr><th style="background-color:rgb(238, 238, 238);"><u>Other Income:</u></th>`;

				allApproachData.forEach(() => {
					htmlContent += `<td style="background-color:rgb(238, 238, 238);"></td><td style="background-color:rgb(238, 238, 238);"></td>`;
				});
				htmlContent += `</tr>`;

				// Add other income sources of all approaches
				const allOtherZones = [];
				const otherIncomeSums: number[] = new Array(approaches?.length).fill(0);
				if (allApproachData[0]) {
					const { otherIncomeSources = [] } = allApproachData[0] || {};

					// Iterate through income sources and construct HTML for source information
					for (const otherSource of otherIncomeSources) {
						const { annual_income, type } = otherSource;
						const annualIncome = await helperFunction.formatCurrency(annual_income);

						// Add property type for each
						let subZone;
						let subZoneValue: string;

						if (subZonesCode) {
							subZone = subZonesCode.find((obj) => obj?.code === type);
						}
						if (!subZone) {
							subZoneValue = type;
						} else {
							subZoneValue = subZone?.name;
						}
						allOtherZones.push(type);
						htmlContent += `<tr><td>${subZoneValue}</td><td>${annualIncome}</td><td></td>`;
						otherIncomeSums[0] += annual_income || 0;

						for (let i = 1; i < allApproachData?.length; i++) {
							const approach = allApproachData[i];
							const { otherIncomeSources = [] } = approach || {};
							const result = otherIncomeSources.find((item) => item?.type === type);
							let annual_income = 0;
							if (result) {
								annual_income = result?.annual_income;
							}
							const annualIncome = await helperFunction.formatCurrency(annual_income);
							htmlContent += `<td>${annualIncome}</td><td></td>`;
							otherIncomeSums[i] += annual_income || 0;
						}

						htmlContent += `</tr>`;
					}
				}
				for (let k = 1; k < allApproachData?.length; k++) {
					const approach = allApproachData[k];
					const { otherIncomeSources = [] } = approach || {};
					const otherSourceResult = otherIncomeSources.filter(
						(obj) => !allOtherZones.includes(obj?.type),
					);
					// Prepare rows for each source
					const htmlRows = await Promise.all(
						otherSourceResult.map(async (element) => {
							const { type } = element;

							// Find type value and subTypeValue
							const typeValue = subZonesCode?.find((obj) => obj?.code === type);
							const subTypeValue = typeValue?.name || type;

							let rowContent = `<tr><td>${subTypeValue}</td>`;

							// Loop through allApproachData to get annual_income
							for (let j = 0; j < allApproachData?.length; j++) {
								const { otherIncomeSources = [] } = allApproachData[j] || {};
								const result = otherIncomeSources?.find((item) => item?.type === type);
								const annual_income = result?.annual_income || 0;

								// Format currency and update column sums
								const annualIncome = await helperFunction.formatCurrency(annual_income);
								otherIncomeSums[j] += annual_income || 0;
								rowContent += `<td>${annualIncome}</td><td></td>`;
							}

							rowContent += '</tr>';
							return rowContent;
						}),
					);

					// Append rows to the HTML content
					htmlContent += htmlRows.join('');
				}
				//Add Collected Revenue row
				htmlContent += `<tr><th>Other Collected Revenue:</th>`;
				for (const sum of otherIncomeSums) {
					const formatSum = await helperFunction.formatCurrency(sum);
					htmlContent += `<td><b>${formatSum}</b></td><td></td>`;
				}
				htmlContent += `</tr>`;

				const effectiveGrossIncomes = [];
				//Add Effective gross income row in table
				htmlContent += `<tr><th>Effective Gross Income:</th>`;
				for (let i = 0; i < columnSums?.length; i++) {
					const collectedRevenue = columnSums[i];
					const vacancyAmount = allApproachData[i]?.vacant_amount || 0;
					const otherRevenue = otherIncomeSums[i] || 0;
					let effectiveGrossIncome = collectedRevenue - vacancyAmount + otherRevenue;
					if (!effectiveGrossIncome) {
						effectiveGrossIncome = 0;
					}
					effectiveGrossIncomes.push(effectiveGrossIncome);
					const formattedEGI = await helperFunction.formatCurrency(effectiveGrossIncome);
					htmlContent += `<td><b>${formattedEGI}</b></td><td></td>`;
				}
				htmlContent += `</tr>`;

				//Adding Operating Expenses
				htmlContent += `<tr><th style="background-color:rgb(238, 238, 238);"><u>Operating Expenses:</u></th>`;

				allApproachData.forEach(() => {
					htmlContent += `<td style="background-color:rgb(238, 238, 238);"></td><td style="background-color:rgb(238, 238, 238);"></td>`;
				});
				htmlContent += `</tr>`;

				//Iterate through operating expenses of approaches and construct HTML
				const expenseNames = [];
				const totalExpense: number[] = new Array(approaches?.length).fill(0);
				const totalPercentGross: number[] = new Array(approaches?.length).fill(0);
				const { operatingExpenses = [] } = allApproachData[0] || {};
				if (operatingExpenses?.length) {
					for (const expense of operatingExpenses) {
						const { annual_amount, name, percentage_of_gross } = expense;
						const [annualAmount, percentGross] = await Promise.all([
							helperFunction.formatCurrency(annual_amount),
							helperFunction.formatNumber(percentage_of_gross, 2, DownloadCompEnum.PERCENT),
						]);
						expenseNames.push(name);
						htmlContent += `<tr><td>${name}</td><td>${annualAmount}</td><td>${percentGross}</td>`;
						totalExpense[0] += annual_amount || 0;
						totalPercentGross[0] += percentage_of_gross || 0;

						for (let i = 1; i < allApproachData?.length; i++) {
							const approach = allApproachData[i];
							const { operatingExpenses = [] } = approach || {};
							const result = operatingExpenses.find((item) => item?.name === name);
							let annual_amount = 0;
							let percentage_of_gross = 0;

							if (result) {
								({ annual_amount, percentage_of_gross } = result);
							}

							const [expenseAnnualAmount, percentGross] = await Promise.all([
								helperFunction.formatCurrency(annual_amount),
								helperFunction.formatNumber(percentage_of_gross, 2, DownloadCompEnum.PERCENT),
							]);
							htmlContent += `<td>${expenseAnnualAmount}</td><td>${percentGross}</td>`;
							totalExpense[i] += annual_amount || 0;
							totalPercentGross[i] += percentage_of_gross || 0;
						}

						htmlContent += `</tr>`;
					}
				}

				for (let k = 1; k < allApproachData?.length; k++) {
					const approach = allApproachData[k];
					const { operatingExpenses = [] } = approach || {};
					const expensesResult = operatingExpenses.filter(
						(obj) => !expenseNames.includes(obj?.name),
					);

					const htmlRows = [];
					for (let i = 0; i < expensesResult?.length; i++) {
						const element = expensesResult[i];
						const { name } = element;
						expenseNames.push(name);
						let rowContent = `<tr><td>${name}</td>`;

						for (let j = 0; j < allApproachData?.length; j++) {
							const approach = allApproachData[j];
							const { operatingExpenses = [] } = approach || {};
							const result = operatingExpenses.find((item) => item?.name === name);
							let annual_amount = 0;
							let percentage_of_gross = 0;

							if (result) {
								({ annual_amount, percentage_of_gross } = result);
							}

							const [annualAmount, percentGross] = await Promise.all([
								helperFunction.formatCurrency(annual_amount),
								helperFunction.formatNumber(percentage_of_gross, 2, DownloadCompEnum.PERCENT),
							]);

							rowContent += `<td>${annualAmount}</td><td>${percentGross}</td>`;
							totalExpense[j] += annual_amount || 0;
							totalPercentGross[j] += percentage_of_gross || 0;
						}

						rowContent += `</tr>`;
						htmlRows.push(rowContent);
					}

					htmlContent += htmlRows.join('');
				}

				//Adding Total Expenses
				const totalExpensesValue = [];
				htmlContent += `<tr><th>Total Expenses:</th>`;
				for (let i = 0; i < totalExpense.length; i++) {
					let expenseValue = totalExpense[i];
					let grossValue = totalPercentGross[i];

					if (expenseValue) {
						totalExpensesValue.push(expenseValue);
					} else {
						expenseValue = 0;
					}
					const formatExpense = await helperFunction.formatCurrency(expenseValue);
					if (!grossValue) {
						grossValue = 0;
					}
					const formatGrossPercent = await helperFunction.formatNumber(
						grossValue,
						2,
						DownloadCompEnum.PERCENT,
					);
					htmlContent += `<td><b>${formatExpense}</b></td><td>${formatGrossPercent}</td>`;
				}
				htmlContent += `</tr>`;

				htmlContent += `<tr><th>Net Operating Income:</th>`;
				for (let index = 0; index < effectiveGrossIncomes?.length; index++) {
					const grossIncome = effectiveGrossIncomes[index];
					const expenseTotal = totalExpensesValue[index];

					//Calculating Net operating income
					let netOperatingIncome = grossIncome - expenseTotal;
					if (!netOperatingIncome) {
						netOperatingIncome = 0;
					}
					const finalNetOperatingIncome = await helperFunction.formatCurrency(netOperatingIncome);
					htmlContent += `<td><b>${finalNetOperatingIncome}</b></td><td></td>`;
				}

				htmlContent += `</tr>`;
				htmlContent += `</table>`;
				const cleanedHtml = htmlContent.replace(/[\n\t]/g, '');
				return cleanedHtml;
			}
			return '';
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
	};

	/**
	 * @description Api to get html content of income comparison component for preview in report.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getIncomeComparisonHTML = async (
		request: IGetIncomeApproachRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<string>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);

			//validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
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

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			//Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const incomeApproachHTML = await this.incomeComparisonComponent({
				comparisonBase: findAppraisal?.comparison_basis,
				appraisalId,
			});

			// If requested income approach not found
			if (!incomeApproachHTML) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.INCOME_APPROACH_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.INCOME_APPROACH_DATA,
				data: incomeApproachHTML,
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
	 * @description Function to save rent rolls.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveRentRoll = async (request: ISaveRentRoll, response: Response): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ISaveRentRollResponse>;
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
			const { rent_rolls, appraisal_id, ...rest } = attributes;

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisal_id });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Checking permissions
			const { role, account_id, id } = request.user;
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Checking if requested approach type is rent roll or not
			const isValidApproachType = await this.appraisalApproachesStore.findAppraisalApproaches({
				id: attributes.appraisal_approach_id,
				appraisal_id,
				type: AppraisalsEnum.RENT_ROLL,
			});
			if (!isValidApproachType) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPROACH_TYPE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			let rentRollTypeData;
			const rentRollTypeId = parseInt(request?.params?.rentRollTypeid);

			if (rentRollTypeId) {
				rentRollTypeData = await this.appraisalRentRollTypeStore.find({
					id: rentRollTypeId,
					appraisal_approach_id: attributes.appraisal_approach_id,
				});
				if (!rentRollTypeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: ErrorMessageEnum.RECORD_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			//
			/* The TypeScript code snippet is checking the `rentRollTypeId` and `rentRollTypeData`
			properties. If `rentRollTypeId` is truthy and the `type` property of `rentRollTypeData` is not
			equal to the `type` property of `attributes`, it updates the `type` property of
			`rentRollTypeData` using `appraisalRentRollTypeStore.update()` method. */
			if (rentRollTypeId && rentRollTypeData?.type !== attributes?.type) {
				this.appraisalRentRollTypeStore.update({ id: rentRollTypeId, type: attributes?.type });
			} else if (!rentRollTypeId) {
				rentRollTypeData = await this.appraisalRentRollTypeStore.find({
					appraisal_approach_id: attributes.appraisal_approach_id,
				});
				if (rentRollTypeData) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.RENT_ROLL_TYPE_ALREADY_EXISTS,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				} else {
					rentRollTypeData = await this.appraisalRentRollTypeStore.create(rest);
				}
			}

			// Handle Appraisal rent rolls add, update, delete.
			const keepIds: number[] = [];
			const idKey = RentRollEnums.APPRAISAL_RENT_ROLL_TYPE_ID;
			for (const item of rent_rolls) {
				if (item?.id) {
					const foundItem = await this.appraisalRentRollsStore.find(item?.id);
					if (foundItem) {
						this.appraisalRentRollsStore.update(item);
						keepIds.push(item.id);
					}
				} else {
					item[idKey] = rentRollTypeData?.id;
					const createdItem = await this.appraisalRentRollsStore.create(item);
					keepIds.push(createdItem?.id);
				}
			}
			this.appraisalRentRollsStore.remove(keepIds, rentRollTypeData?.id);
			if (!keepIds) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.RENT_ROLL_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const getAllRentRolls = await this.appraisalRentRollTypeStore.find({
				id: rentRollTypeData?.id,
			});

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.RENT_ROLL_SAVED_SUCCESS,
				data: getAllRentRolls,
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
	 * @description Function to get rent rolls for specific appraisal and specific approach id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getRentRolls = async (request: IGetRequest, response: Response): Promise<Response> => {
		let data: IError | IAppraisalSuccess<ISaveRentRollResponse>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			//validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//validating  query params appraisalApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
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

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			//Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			//get appraisal rent roll
			const appraisalRentRollData = await this.appraisalRentRollTypeStore.find({
				appraisal_approach_id: appraisalApproachId,
			});

			// If requested appraisal rent roll not found
			if (!appraisalRentRollData) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.RENT_ROLL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.RENT_ROLL_DATA,
				data: appraisalRentRollData,
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
	 * @description Function to get html of rent rolls for specific appraisal and specific approach id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getRentRollComponentHTML = async (
		request: IGetRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAppraisalSuccess<string>;
		try {
			const { role, account_id, id } = request.user;
			const appraisalId = Number(request?.query?.appraisalId);
			const appraisalApproachId = Number(request?.query?.appraisalApproachId);

			//validating query params appraisalId
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			//validating query params appraisalApproachId
			if (!appraisalApproachId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.PLEASE_PROVIDE_APPRAISAL_APPROACH_ID,
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

			// Find the appraisal by id
			const findAppraisal = await this.storage.findByAttribute({ id: appraisalId });
			if (!findAppraisal) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			//Checking permissions
			const isNotAuthorized =
				(role === RoleEnum.ADMINISTRATOR && findAppraisal.account_id != account_id) ||
				(role === RoleEnum.USER && findAppraisal.user_id != id);

			if (isNotAuthorized) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const rentRollHTML = await this.rentRollComponent({
				appraisalId,
				appraisalApproachId,
			});

			// If requested rent roll not found
			if (!rentRollHTML) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.RENT_ROLL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: AppraisalEnum.RENT_ROLL_DATA,
				data: rentRollHTML,
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
	 * @description Create html of rent rolls for specific appraisal and specific approach id.
	 * @param attributes
	 * @returns
	 */
	public rentRollComponent = async (attributes: Partial<IRentRollHtml>): Promise<string> => {
		try {
			const { appraisalId, appraisalApproachId } = attributes;
			const [getApproach, getRentRolls] = await Promise.all([
				this.appraisalApproachesStore.findAppraisalApproaches({
					id: appraisalApproachId,
					appraisal_id: appraisalId,
					type: AppraisalsEnum.RENT_ROLL,
				}),
				this.appraisalRentRollTypeStore.find({ appraisal_approach_id: appraisalApproachId }),
			]);

			const { rent_rolls, type } = getRentRolls || {};
			const isDetailView = type === DefaultEnum.DETAIL;
			const approachName = getApproach?.name || AppraisalsEnum.NA;

			/* Creating an HTML table with dynamic content based on the value of
			the `isDetailView` variable. */
			let htmlContent = `
				<table style="width:100%; text-align: left; border-collapse: collapse;" border="1">
				<tr>
					<td colspan="${isDetailView ? 5 : 4}" style="background-color:rgb(238, 238, 238); text-align: center;">
						<b>Rent Roll - ${approachName}</b>
					</td>
				</tr>
				<tr>
					${
						isDetailView
							? `
						<td><b>Unit #</b></td>
						<td><b>Bed/Bath</b></td>
						<td><b>Rent</b></td>
						<td><b>Tenant Exp.</b></td>
						<td><b>Lease Expires</b></td>
					`
							: `
						<td><b>Bed/Bath</b></td>
						<td><b>SQ.FT.</b></td>
						<td><b>Unit Count</b></td>
						<td><b>Average Monthly Rent</b></td>
					`
					}
				</tr>`;

			let totalRent = 0;
			let totalUnitCount = 0;
			/* The below code is processing a list of rent rolls and generating formatted HTML rows
			based on the data in each rent roll item. It first checks if there are rent rolls available, then
			iterates over each item in the rent rolls array. For each item, it extracts relevant information
			such as unit, beds, baths, rent, etc., and formats them accordingly. It calculates the total rent
			based on whether it is a detailed view or not. */
			if (rent_rolls?.length > 0) {
				const formattedRows = await Promise.all(
					rent_rolls.map(async (item) => {
						const {
							unit,
							beds,
							baths,
							rent,
							tenant_exp,
							lease_expiration,
							description,
							unit_count,
							avg_monthly_rent,
							sq_ft,
						} = item || {};

						let bedBaths;
						let formatBeds;
						let formatBaths;
						if (beds || baths || (beds && baths)) {
							formatBeds = beds
								? await helperFunction.formatNumber(beds, 0, RentRollEnums.BED)
								: AppraisalsEnum.NA;
							formatBaths = baths
								? await helperFunction.formatNumber(baths, 0, RentRollEnums.BATH)
								: AppraisalsEnum.NA;

							bedBaths = `${formatBeds}/${formatBaths}`;
						} else if (description) {
							bedBaths = `${description}`;
						} else {
							bedBaths = '';
						}
						const rentValue = isDetailView ? rent || 0 : avg_monthly_rent || 0;
						totalRent += rentValue;

						const formatRent = await helperFunction.formatCurrency(rentValue);
						const formatSqFt =
							isDetailView || sq_ft == null ? '' : await helperFunction.formatNumber(sq_ft, 0, '');
						const formatUnitCount =
							isDetailView || unit_count == null
								? ''
								: await helperFunction.formatNumber(unit_count, 0, '');
						totalUnitCount += unit_count || 0;

						return isDetailView
							? `
							<tr>
								<td>${unit || ''}</td>
								<td>${bedBaths}</td>
								<td>${formatRent}</td>
								<td>${tenant_exp || ''}</td>
								<td>${lease_expiration || ''}</td>
							</tr>`
							: `
							<tr>
								<td>${bedBaths}</td>
								<td>${formatSqFt || ''}</td>
								<td>${formatUnitCount || ''}</td>
								<td>${formatRent || ''}</td>
							</tr>`;
					}),
				);

				htmlContent += formattedRows.join('');
			}

			const formatTotalRent = await helperFunction.formatCurrency(totalRent);
			const formatTotalUnitCount = await helperFunction.formatNumber(totalUnitCount, 0, '');

			if (type === DefaultEnum.DETAIL) {
				htmlContent += `<tr><td colspan="2"><b>Monthly Total:</b></td><td><b>${formatTotalRent}</b></td><td></td></tr></table>`;
			} else {
				htmlContent += `<tr><td colspan="2"><b>Total:</b></td><td><b>${formatTotalUnitCount}</b></td><td><b>${formatTotalRent}</b></td></tr></table>`;
			}

			return htmlContent.replace(/[\n\t]/g, '');
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	};
}
