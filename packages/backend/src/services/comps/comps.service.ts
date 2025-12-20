import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import CompsStore from './comps.store';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import SendResponse from '../../utils/common/commonResponse';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import StatusEnum from '../../utils/enums/StatusEnum';
import { CompEnum, DownloadCompEnum } from '../../utils/enums/MessageEnum';
import {
	ICompSuccess,
	ICompListSuccessData,
	ICompsCreateUpdateRequest,
	IComp,
	ICitiesSuccess,
	ICompsListRequest,
	IGetCompRequest,
	IGetCitiesRequest,
	ICompDownloadRequest,
	IGetPdfUploadRequest,
	ISaveExtractedPdfComps,
	IExtractedComp,
	IExtractedCompsSuccessData,
	IMapBoundsRequest,
	IMapSuccess,
	IGeoClusterResponse,
	IClusterDetailsRequest,
	IMapSearchResponse,
} from '../../services/comps/ICompsService';
import CompsEnum from '../../utils/enums/CompsEnum';
import HelperFunction from '../../utils/common/helper';
import { clusterDetailsSchema, combinedSchema, compsListSchema, downloadCompSchema, mapBoundsSchema } from './comps.validations';
import { GOOGLE_MAPS_API_KEY, S3_BASE_URL } from '../../env';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { changeDateFormat, Timestamp } from '../../utils/common/Time';
import path from 'path';
// import pdf from 'pdf-creator-node';
import { launchBrowser } from '../../utils/common/browser';
import * as cheerio from 'cheerio';
import CompanyStore from '../company/company.store';
import ClientStore from '../clients/client.store';
import fs from 'fs';
import CommonStore from '../common/common.store';
import { OpenAIService } from '../../utils/common/openAI';

const helperFunction = new HelperFunction();
const openAIService = new OpenAIService();
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
export default class CompsService {
	private storage = new CompsStore();
	private companyStore = new CompanyStore();
	private clientStore = new ClientStore();
	private commonStore = new CommonStore();
	constructor() {}

	/**
	 * @description function to get listing of comp
	 * @param request
	 * @param response
	 * @returns
	 */
	public compsList = async (request: ICompsListRequest, response: Response): Promise<Response> => {
		let data: IError | ICompSuccess<ICompListSuccessData>;
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
			const requestData = request?.body;
			let accountId: number;
			//checking user role
			if (!requiredRoles.includes(role)) {
				accountId = account_id;
			}

			//fetching comps list according to type
			const compsList = await this.storage.getAllComps(requestData, request?.user, accountId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: compsList,
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
	 * @description function to create comp
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveComp = async (
		request: ICompsCreateUpdateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ICompSuccess<IComp>;
		try {
			let comp;
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
			const compData = request.body;
			if (compData.property_image_url) {
				compData.property_image_url = await helperFunction.removeSubstring(
					S3_BASE_URL,
					compData.property_image_url,
				);
			}
			if (!compData.included_utilities) {
				compData.included_utilities = [];
			}
			if (compData.date_sold) {
				compData.date_sold = changeDateFormat(compData.date_sold);
			}

			// Handle custom fields
			helperFunction.handleCustomField(CompsEnum.TOPOGRAPHY, compData);
			helperFunction.handleCustomField(CompsEnum.LOT_SHAPE, compData);
			helperFunction.handleCustomField(CompsEnum.UTILITIES_SELECT, compData);
			helperFunction.handleCustomField(CompsEnum.FRONTAGE, compData);
			helperFunction.handleCustomField(CompsEnum.CONDITION, compData);
			helperFunction.handleCustomField(CompsEnum.PARKING, compData);
			helperFunction.handleCustomField(CompsEnum.LAND_TYPE, compData);

			const message = CompEnum.COMP_SAVE_SUCCESS;
			const compId: number = parseInt(request?.params?.id);
			if (compId) {
				compData.id = compId;
				const compAttributes: ICompsCreateUpdateRequest = {
					...compData,
				};
				comp = await this.storage.updateComp(compAttributes);
				if (comp) {
					data = {
						statusCode: StatusCodeEnum.OK,
						message: CompEnum.COMP_SAVE_SUCCESS,
					};
				}
			} else {
				compData.user_id = request?.user?.id;
				compData.account_id = request?.user?.account_id;
				const compAttributes: ICompsCreateUpdateRequest = {
					...compData,
				};
				comp = await this.storage.createComp(compAttributes, compData.comp_link);
				data = {
					statusCode: StatusCodeEnum.OK,
					message: message,
					data: comp,
				};
			}
			if (!comp) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.COMP_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
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
	 * @description function to get comp by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getCompById = async (request: IGetCompRequest, response: Response): Promise<Response> => {
		let data: IError | ICompSuccess<IComp>;
		try {
			const compId: number = parseInt(request.params.id);
			const comp = await this.storage.getCompById(compId);

			if (!comp) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.COMP_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { role, id } = request.user;
			if (!requiredRoles.includes(role)) {
				// Do not have permission of private comp
				if (comp.private_comp && comp.user_id != id) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: CompEnum.PERMISSION_DENIED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompEnum.COMP_DATA,
				data: comp,
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
	 * @description function to delete comp by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public delete = async (request: IGetCompRequest, response: Response): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { role, account_id, id } = request.user;
			const compId: number = parseInt(request.params.id);
			const comp = await this.storage.getCompById(compId);

			if (!comp) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.COMP_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			//checking user role
			if (!requiredRoles.includes(role)) {
				//do not have permission to delete a private comp
				if (comp.private_comp && comp.user_id != id) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: CompEnum.PERMISSION_DENIED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				//checking if account id of comp is not equal to login user account id
				if (comp.account_id != account_id) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: CompEnum.PERMISSION_DENIED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			const compDeleted: boolean = await this.storage.delete(compId);
			if (!compDeleted) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.COMP_DELETE_FAIL,
					error: CompEnum.COMP_EXIST_IN_EVAL_OR_APPRAISAL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			} else {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: CompEnum.COMP_DELETED,
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
	 * @description Function to get cities according to state
	 * @param request
	 * @param response
	 */
	public getCities = async (request: IGetCitiesRequest, response: Response): Promise<Response> => {
		let data: IError | ICompSuccess<ICitiesSuccess>;
		try {
			const state = request?.query?.state;

			if (!state || typeof state !== 'string') {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.STATE_NOT_SELECTED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// State is guaranteed to be a string here
			const stateString: string = state;

			// Fetching all cities according to state.
			const allCities = await this.storage.findCities(stateString, request?.user);
			if (!allCities.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: CompEnum.CITIES_NOT_FOUND,
					data: allCities,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompEnum.ALL_CITIES,
				data: allCities,
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
	 * @description Function to download comps in pdf document.
	 * @param request
	 * @param response
	 * @returns
	 */
	public downloadComps = async (
		request: IGetCompRequest,
		response: Response,
	): Promise<Response | void | any> => {
		let data: IError | ICompSuccess<string>;
		try {
			// Validate schema
			const params = await helperFunction.validate(downloadCompSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { compIds } = request.body;
			if (!compIds.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: DownloadCompEnum.COMPS_NOT_SELECTED,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			const attributes: ICompDownloadRequest = request.body;
			const timestamp = Timestamp(new Date());
			const htmlContent = await this.getCompsPdfContent(attributes);
			const outputFile = `Comp${timestamp}.pdf`;
			// Set the file location for the generated pdf file
			const fileLocation = path.join(process.cwd(), outputFile);

			// Use Puppeteer to generate the PDF
			const browser = await launchBrowser();
			const page = await browser.newPage();

			// Set the HTML content
			await page.setContent(htmlContent);
			// Create the PDF
			await page.pdf({
				path: fileLocation,
				format: 'Letter',
				printBackground: true,
				margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
			});

			await browser.close();

			// Create a read stream for the PDF file
			const stream = fs.createReadStream(fileLocation);

			// Handle errors before starting the response
			stream.on('error', (streamError) => {
				console.error('Error during file streaming:', streamError);
				// Ensure headers are not sent again
				if (!response.headersSent) {
					response.status(500).send('Error sending file');
				}
				// Delete the file if there was an error during streaming
				fs.promises
					.unlink(fileLocation)
					.catch((err) => console.error('Error deleting file after stream error:', err));
				return; // Stop further execution
			});

			// Set response headers to prompt the user for download as a PDF
			response.setHeader('Content-Disposition', `attachment; filename=${outputFile}`);
			response.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			);

			// Pipe the file stream to the response
			stream.pipe(response);

			// Listen for 'finish' event to delete the file after it has been sent
			response.on('finish', () => {
				fs.promises
					.unlink(fileLocation)
					.catch((err) => console.error('Error deleting file after sending:', err));
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
	 * @description Function to create html content for download pdf document.
	 * @param compIds
	 * @returns
	 */
	public getCompsPdfContent = async (attributes: ICompDownloadRequest): Promise<string> => {
		try {
			const { compIds, comparison } = attributes;
			let htmlContent = `<html><body style="font-family: sans-serif;">`;
			for (let i = 0; i < compIds?.length; i++) {
				const compId = compIds[i];
				const isLastCompId = i === compIds?.length - 1;
				let divStyle;
				if (isLastCompId) {
					divStyle = `""`;
				} else {
					divStyle = `"page-break-after: always;"`;
				}
				const compData = await this.storage.getCompById(compId);
				const {
					business_name,
					street_address,
					zipcode,
					type,
					state,
					city,
					summary,
					zonings,
					building_size,
					land_size,
					topography,
					lot_shape,
					frontage,
					condition,
					year_built,
					year_remodeled,
					utilities_select,
					zoning_type,
					concessions,
					sale_price,
					date_sold,
					net_operating_income,
					cap_rate,
					total_operating_expense,
					operating_expense_psf,
					list_price,
					date_list,
					days_on_market,
					total_concessions,
					offeror_id,
					acquirer_id,
					property_image_url,
					map_pin_lat,
					map_pin_lng,
					map_pin_zoom,
					land_type,
					comp_type,
					lease_type,
					space,
					lease_rate,
					lease_rate_unit,
					cam,
					term,
					date_execution,
					date_commencement,
					date_expiration,
					lease_status,
					TI_allowance,
					TI_allowance_unit,
					asking_rent,
					asking_rent_unit,
					escalators,
					free_rent,
					offeror_type,
					acquirer_type,
					land_dimension,
				} = compData;

				const [
					buildingSize,
					salePrice,
					formatDateSold,
					dateList,
					listPrice,
					netOperatingIncome,
					totalOperatingExpense,
					totalConcessions,
					operatingExpensePsf,
					leaseRate,
					dateExecution,
					dateCommencement,
					dateExpiration,
				] = await Promise.all([
					helperFunction.formatNumber(building_size, 0, DownloadCompEnum.SF),
					helperFunction.formatCurrency(sale_price),
					helperFunction.formatDateToMDY(date_sold),
					helperFunction.formatDateToMDY(date_list),
					helperFunction.formatCurrency(list_price),
					helperFunction.formatCurrency(net_operating_income),
					helperFunction.formatCurrency(total_operating_expense),
					helperFunction.formatCurrency(total_concessions),
					helperFunction.formatCurrency(operating_expense_psf),
					helperFunction.formatCurrency(lease_rate),
					helperFunction.formatDateToMDY(date_execution),
					helperFunction.formatDateToMDY(date_commencement),
					helperFunction.formatDateToMDY(date_expiration),
				]);
				let offerorName;
				let getOfferor;
				//Get Landlord details
				if (offeror_type === DownloadCompEnum.COMPANY) {
					getOfferor = await this.companyStore.findByAttribute({ id: offeror_id });
					offerorName = getOfferor?.company_name;
				} else if (offeror_type === DownloadCompEnum.PERSON) {
					getOfferor = await this.clientStore.findByAttribute({ id: offeror_id });
					offerorName =
						getOfferor?.first_name && getOfferor?.last_name
							? `${getOfferor.first_name} ${getOfferor.last_name}`
							: '';
				}

				let getAcquirer;
				let acquirerName;
				//Get Tenant details
				if (acquirer_type === DownloadCompEnum.COMPANY) {
					getAcquirer = await this.companyStore.findByAttribute({ id: acquirer_id });
					acquirerName = getAcquirer?.company_name;
				} else if (acquirer_type === DownloadCompEnum.PERSON) {
					getAcquirer = await this.clientStore.findByAttribute({ id: acquirer_id });
					acquirerName =
						getAcquirer?.first_name && getAcquirer?.last_name
							? `${getAcquirer?.first_name} ${getAcquirer?.last_name}`
							: '';
				}

				// Get map image url of comp
				const mapURL = await this.getCompMapImageUrl({ map_pin_lat, map_pin_lng, map_pin_zoom });

				// Fetching global codes
				const attributes = { status: 1 };
				const codes = await this.commonStore.getGlobalCodeCategoriesByAttribute(attributes);

				// Helper function to get options based on type
				const getOptionsByType = (type: string) =>
					codes.find((code: { type: string }) => code.type === type)?.options;

				// Retrieve global code options
				const zoningsOptions = getOptionsByType(CompsEnum.ZONE);
				const conditionOptions = getOptionsByType(CompsEnum.CONDITION);
				const topographyOptions = getOptionsByType(CompsEnum.TOPOGRAPHIES);
				const frontageOptions = getOptionsByType(CompsEnum.FRONTAGES);
				const landTypeOptions = getOptionsByType(CompsEnum.LAND_TYPE);
				const leaseTypeOptions = getOptionsByType(DownloadCompEnum.LEASE_TYPES);
				const leaseRateUnitOptions = getOptionsByType(DownloadCompEnum.LEASE_RATE_UNIT);
				const lotShapeOptions = getOptionsByType(DownloadCompEnum.LOT_SHAPE);
				const leaseStatusOptions = getOptionsByType(DownloadCompEnum.LEASE_STATUS);
				const tiAllowanceUnitOptions = getOptionsByType(DownloadCompEnum.TI_ALLOWANCE_UNIT);

				// Helper function to match code or fallback to original value
				const matchCodeOrFallback = (options: any[], code: string, isSubZone: boolean = false) => {
					if (isSubZone) {
						for (const obj of options) {
							if (obj.sub_options && Array.isArray(obj.sub_options)) {
								const subMatch = obj.sub_options.find((sub) => sub.code === code);
								if (subMatch) {
									return subMatch.name;
								}
							}
						}
						return code;
					} else {
						const match = options.find((obj) => obj.code === code);
						return match ? match.name : code;
					}
				};

				// Match codes or fallback to original values
				const zoningCode = zonings[0]?.zone
					? matchCodeOrFallback(zoningsOptions, zonings[0]?.zone)
					: '';
				const subZoneCode = zonings[0]?.sub_zone
					? matchCodeOrFallback(zoningsOptions, zonings[0]?.sub_zone, true)
					: '';
				const topographyCode = topography ? matchCodeOrFallback(topographyOptions, topography) : '';
				const conditionCode = condition ? matchCodeOrFallback(conditionOptions, condition) : '';
				const frontageCode = frontage ? matchCodeOrFallback(frontageOptions, frontage) : '';
				const landTypeCode = land_type ? matchCodeOrFallback(landTypeOptions, land_type) : '';
				const leaseTypeCode = lease_type ? matchCodeOrFallback(leaseTypeOptions, lease_type) : '';
				const leaseRateUnitCode = lease_rate_unit
					? matchCodeOrFallback(leaseRateUnitOptions, lease_rate_unit)
					: '';
				const askingRateUnitCode = asking_rent_unit
					? matchCodeOrFallback(leaseRateUnitOptions, asking_rent_unit)
					: '';
				const lotShapeCode = lot_shape ? matchCodeOrFallback(lotShapeOptions, lot_shape) : '';
				const leaseStatusCode = lease_status
					? matchCodeOrFallback(leaseStatusOptions, lease_status)
					: '';
				const tiAllowanceUnitCode = TI_allowance_unit
					? matchCodeOrFallback(tiAllowanceUnitOptions, TI_allowance_unit)
					: '';

				let zoningHtml = '';
				for (let index = 1; index < zonings?.length; index++) {
					const element = zonings[index];
					const { zone, sub_zone, sq_ft } = element;
					const zoneCode = zone ? matchCodeOrFallback(zoningsOptions, zone) : '';
					const subZoningCode = sub_zone ? matchCodeOrFallback(zoningsOptions, sub_zone) : '';
					const sfValue = await helperFunction.formatNumber(sq_ft, 0, DownloadCompEnum.SF);
					zoningHtml += `<tr><td>${zoneCode || ''} - ${subZoningCode || ''} - ${sfValue || ''}</td><td></td><td></td><td></td></tr>`;
				}
				const noPhotoUrl =
					'data:image/png;base64,' +
					(await fs.readFileSync('./src/images/Group1549.png', { encoding: 'base64' }));
				const image = property_image_url ? `${S3_BASE_URL}${property_image_url}` : noPhotoUrl;

				const promises = [];
				let landSize;
				if (land_size) {
					if (comparison === CompsEnum.SF && land_dimension === CompsEnum.SF) {
						promises.push(
							helperFunction.formatNumber(land_size, 0, DownloadCompEnum.SF).then((result) => {
								landSize = result;
							}),
						);
					} else if (comparison === CompsEnum.AC && land_dimension === CompsEnum.SF) {
						const landSizeValue = land_size / 43560;
						promises.push(
							helperFunction.formatNumber(landSizeValue, 3, CompsEnum.AC).then((result) => {
								landSize = result;
							}),
						);
					} else if (comparison === CompsEnum.SF && land_dimension === CompsEnum.ACRE) {
						const landSizeValue = land_size * 43560;
						promises.push(
							helperFunction.formatNumber(landSizeValue, 0, DownloadCompEnum.SF).then((result) => {
								landSize = result;
							}),
						);
					} else if (comparison === CompsEnum.AC && land_dimension === CompsEnum.ACRE) {
						promises.push(
							helperFunction.formatNumber(land_size, 3, CompsEnum.AC).then((result) => {
								landSize = result;
							}),
						);
					}
				}

				let formattedSpace;
				if (space) {
					promises.push(
						helperFunction.formatNumber(space, 0, DownloadCompEnum.SF).then((result) => {
							formattedSpace = result;
						}),
					);
				}

				let formattedSfValue;
				if (zonings[0]?.sq_ft) {
					promises.push(
						helperFunction
							.formatNumber(zonings[0]?.sq_ft, 0, DownloadCompEnum.SF)
							.then((result) => {
								formattedSfValue = result;
							}),
					);
				}

				let formatCam;
				if (cam) {
					promises.push(
						helperFunction.formatCurrency(cam).then((result) => {
							formatCam = result;
						}),
					);
				}
				let tiAllowance;
				if (TI_allowance) {
					promises.push(
						helperFunction.formatCurrency(TI_allowance).then((result) => {
							tiAllowance = result;
						}),
					);
				}
				let askingRent;
				if (asking_rent) {
					promises.push(
						helperFunction.formatCurrency(asking_rent).then((result) => {
							askingRent = result;
						}),
					);
				}
				let formattedEscalators;
				if (escalators) {
					promises.push(
						helperFunction.formatNumber(escalators, 0, DownloadCompEnum.PERCENT).then((result) => {
							formattedEscalators = result;
						}),
					);
				}

				await Promise.all(promises);

				let buildingsInfo = '';
				if (zoningCode) {
					buildingsInfo = `${zoningCode}`;
				}
				if (subZoneCode) {
					buildingsInfo += ` - ${subZoneCode}`;
				}
				if (formattedSfValue) {
					buildingsInfo += ` - ${formattedSfValue}`;
				}

				// Start building HTML content
				htmlContent += `<div style=${divStyle}>
					<div style="background-color: rgb(236, 248, 251); padding: 10px; margin-bottom: 12px;">
					<h2 style="text-transform: capitalize; margin: 0; font-size: 24px; color: rgb(13,161,199); float: left;">${street_address}</h2> 
					<p style="text-transform: capitalize; margin: 0; font-size: 24px; font-weight: 600; color: rgb(13,161,199); float: right;">${type}</p>
					<br>
					<p style="width: 100%; display: inline-block; text-transform: capitalize; margin: 10px 0 0; font-size: 14px; line-height: 1.3;">${street_address}<br>${city}, <span style="text-transform: uppercase;">${state}</span> ${zipcode}</p> 
					</div>
					<table style="width: 100%;">
						<tbody>
							<tr>
								<td style="width:50%; height:300px;">
									<img src="${image}" alt="Property image" style="object-fit: cover; object-position: center; height: 300px; width: 100%">	
								</td>
								<td style="width:50%; height:300px;">
									<img src="${mapURL}" alt="Property map" style="object-fit: cover; object-position: center; height: 300px; width: 100%">
								</td>
							</tr>
						</tbody>
					</table>
					<div style="padding:10px; margin-top: 15px">
					<h3 style="font-size: 16px; border-bottom: 1px solid #ccc; padding: 0 0 7px 0;">PROPERTY DETAILS</h3>
					<table style="font-size: 14px; padding: 10px; text-align: left; table-layout: fixed; width:100%; color:rgb(109, 127, 138); background-color:rgb(249, 249, 249);">
					<tbody>
					<tr style="vertical-align: top;">
					<th colspan="4">Property Summary</th></tr>
					<tr style="vertical-align: top;"><td colspan="4">${summary || DownloadCompEnum.NOT_AVAILABLE}</td></tr>
					<tr style="vertical-align: top;">`;
				if (type === CompsEnum.SALE) {
					if (comp_type === CompsEnum.BUILDING_WITH_LAND) {
						htmlContent += `<th>Buildings</th>
					<th>Building Size</th>
					<th>Land Size</th>
					<th>Topography</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${buildingsInfo || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${buildingSize || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${landSize || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${topographyCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					${zoningHtml}
					<tr style="Vertical-align: top;">
					<th>Lot Shape</th>
					<th>Frontage</th>
					<th>Condition</th>
					<th>Built Year</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${lotShapeCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${frontageCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${conditionCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${year_built || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
					<th>Remodeled Year</th>
					<th>Utilities</th>
					<th>Zoning Type</th>
					<th>Notes</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${year_remodeled || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${utilities_select || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${zoning_type || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${concessions || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					</tbody>
					</table></div>
					<div style="padding:10px;">
					<h3 style="font-size: 16px; border-bottom: 1px solid #ccc; padding: 0 0 7px 0;">TRANSACTION DETAILS</h3>
					<table style="font-size: 14px; padding: 10px; text-align: left; table-layout: fixed; width:100%; background-color:rgb(249, 249, 249); color:rgb(109, 127, 138);">
					<tbody>
					<tr style="vertical-align: top;">
						<th>Sale Price</th>
						<th>Date Sold</th>
						<th>Net Operating Income</th>
						<th>CAP Rate</th>
					</tr>
					<tr style="vertical-align: top;">
						<td>${salePrice || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${formatDateSold || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${netOperatingIncome || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${cap_rate || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
						<th>Total Operating Expense</th>
						<th>Operating Expense (PSF)</th>
						<th>List Price</th>
						<th>List Date</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${totalOperatingExpense || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${operatingExpensePsf || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${listPrice || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${dateList || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>`;
					} else if (comp_type === CompsEnum.LAND_ONLY) {
						htmlContent += `<tr style="vertical-align: top;">
					<th>Land Type</th>
					<th>Land Size</th>
					<th>Topography</th>
					<th>Lot Shape</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${landTypeCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${landSize || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${topographyCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${lotShapeCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					${zoningHtml}
					<tr style="vertical-align: top;">
					<th>Frontage</th>
					<th>Condition</th>
					<th>Utilities</th>
					<th>Zoning Type</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${frontageCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${conditionCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${utilities_select || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${zoning_type || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
					<th>Notes</th>
					<th></th>
					<th></th>
					<th></th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${concessions || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td></td>
					<td></td>
					<td></td>
					</tr>
					</tbody>
					</table></div>
					<div style="padding:10px;">
					<h3 style="font-size: 16px; border-bottom: 1px solid #ccc; padding: 0 0 7px 0;">TRANSACTION DETAILS</h3>
					<table style=" font-size: 14px; padding: 10px; text-align: left; table-layout: fixed; width:100%; background-color:rgb(249, 249, 249); color:rgb(109, 127, 138);">
				<tbody>
					<tr style="vertical-align: top;">
						<th>Sale Price</th>
						<th>Date Sold</th>
						<th>List Price</th>
						<th>List Date</th>
					</tr>
					<tr style="vertical-align: top;">
						<td>${salePrice || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${formatDateSold || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${listPrice || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${dateList || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>`;
					}
					htmlContent += `<tr style="vertical-align: top;">
					<th>Days on Market</th>
					<th>Total Concessions</th>
					<th>Seller</th>
					<th>Buyer</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${days_on_market || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${totalConcessions || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${offerorName || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${acquirerName || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					</tbody>
					</table></div>
					</div>`;
				}
				if (type === CompsEnum.LEASE) {
					if (comp_type === CompsEnum.BUILDING_WITH_LAND) {
						htmlContent += `<th>Buildings</th>
					<th>Building Size</th>
					<th>Land Size</th>
					<th>Topography</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${zoningCode || DownloadCompEnum.NOT_AVAILABLE} - ${subZoneCode || DownloadCompEnum.NOT_AVAILABLE} - ${formattedSfValue || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${buildingSize || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${landSize || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${topographyCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					${zoningHtml}
					<tr style="vertical-align: top;">
					<th>Lot Shape</th>
					<th>Frontage</th>
					<th>Built Year</th>
					<th>Remodeled Year</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${lot_shape || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${frontageCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${year_built || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${year_remodeled || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
					<th>Utilities</th>
					<th>Zoning Type</th>
					<th></th>
					<th></th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${utilities_select || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${zoning_type || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td></td>
					<td></td>
					</tr>
					</tbody>
					</table></div>`;
					}
					if (comp_type === CompsEnum.LAND_ONLY) {
						htmlContent += `<th>Land Type</th>
					<th>Land Size</th>
					<th>Topography</th>
					<th>Lot Shape</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${landTypeCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${landSize || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${topographyCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${lot_shape || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
					<th>Frontage</th>
					<th>Utilities</th>
					<th>Zoning Type</th>
					<th></th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${frontageCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${utilities_select || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${zoning_type || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td></td>
					</tr>
					</tbody>
					</table></div>`;
					}

					htmlContent += `<div style="padding:10px;">
					<h3 style="font-size: 16px; border-bottom: 1px solid #ccc; padding: 0 0 7px 0;">SPACE DETAILS</h3>
					<table style="font-size: 14px; padding: 10px; text-align: left; table-layout: fixed; width:100%; background-color:rgb(249, 249, 249); color:rgb(109, 127, 138);">					
					<tbody>
					<tr style="vertical-align: top;">
						<th>Space(SF)</th>
						<th>Condition</th>
						<th>Lease Type</th>
						<th>Transaction Date</th>
					</tr>
					<tr style="vertical-align: top;">
						<td>${formattedSpace || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${conditionCode || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${leaseTypeCode || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${formatDateSold || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
						<th>Lease Rate</th>
						<th>Lease Rate Units</th>
						<th>CAM</th>
						<th>Term (Months)</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${leaseRate || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${leaseRateUnitCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${formatCam || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${term || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
						<th>Lease Notes</th>
						<th>Execution Date</th>
						<th>Commencement Date</th>
						<th>Expiration Date</th>
					</tr style="vertical-align: top;">
					<tr>
					<td>${concessions || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${dateExecution || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${dateCommencement || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${dateExpiration || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
						<th>Lease Status</th>
						<th>TI Allowance</th>
						<th>TI Allowance Units</th>
						<th>Asking Rent</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${leaseStatusCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${tiAllowance || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${tiAllowanceUnitCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${askingRent || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
						<th>Asking Rent Units</th>
						<th>Escalators</th>
						<th>Free Rent (Months)</th>
						<th>Landlord</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${askingRateUnitCode || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${formattedEscalators || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${free_rent || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${offerorName || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
						<th>Tenant</th>
						<th></th>
						<th></th>
						<th></th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${acquirerName || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td></td>
					<td></td>
					<td></td>
					</tr></tbody>
					</table></div>
					</div>`;
				}
			}

			// Complete the HTML content
			htmlContent += `</body></html>`; // Load the HTML content into Cheerio
			const cleanedHtml = htmlContent.replace(/[\n\t]/g, '');
			const $ = cheerio.load(cleanedHtml);

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
	 * @description Function to get comps map image url.
	 * @param attributes
	 * @returns
	 */
	public getCompMapImageUrl = async (attributes): Promise<string> => {
		try {
			const { map_pin_lat, map_pin_lng, map_pin_zoom } = attributes;
			let zoom = 12;
			if (map_pin_zoom) {
				zoom = map_pin_zoom;
			}
			const apiKey = GOOGLE_MAPS_API_KEY;
			// Construct the URL with marker
			const url = `https://maps.googleapis.com/maps/api/staticmap?center=${map_pin_lat},${map_pin_lng}&zoom=${zoom}&size=600x600&markers=color:red%7C${map_pin_lat},${map_pin_lng}&key=${apiKey}`;
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
	 * @description This code defines an asynchronous function `extractPdfPropertiesData` that extracts
	text from a PDF file, constructs a prompt with specific instructions for extracting real estate
	property details from the extracted text, and then sends the prompt to an OpenAI service to
	generate a chat completion response.
	 * @param request
	 * @param response
	 * @returns
	 */
	public extractPdfPropertiesData = async (
		request: IGetPdfUploadRequest,
		response: Response,
	): Promise<Response | void | any> => {
		let data: IError | ICompSuccess<any[]>;
		try {
			const pdfPath = request.file.path; //Get file path

			// Extract text from the PDF
			const extractedText = await helperFunction.extractTextFromPdf(pdfPath);

			if (!extractedText) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.TEXT_EXTRACTION_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Construct the prompt for multiple properties
			const prompt = `
			### Task:
			You are an expert real estate data extraction AI. Your job is to extract property details from the provided text and return a structured JSON object.
			
			**IMPORTANT:**
			- You must follow ALL instructions and rules below EXACTLY and STRICTLY.
			- Output ONLY valid JSON. No explanations, markdown, comments, or extra text—just pure JSON.
			- Do NOT include \`\`\`json or \`\`\` in the response.
			- If information is missing, set the value to null (unless instructed otherwise).
			- All instructions and rules are mandatory and must be followed for every property.

			### Instructions:
			1. Include a field named "order" in each property's object, starting from value 1 and incrementing for each subsequent property.
			2. Ensure accurate mapping of fields even if they are represented by synonyms, abbreviations, or variations in phrasing.
			3. "Comparison basis" and "land dimension" refer to the unit of building size and land area.
			4. Use lowercase two-letter abbreviations for U.S. states.
			5. Always find "latitude" and "longitude" coordinates of each property on the basis of address in the form of string.
			6. For "street_suite" field extract suite number of address. 
			7. building_size is total of square feet values of all buildings or properties in property details.
			8. For comparison_basis field determine comparison basis Either "SF", "Bed", "Unit", If value not available by default set its value to "SF".  
			9. For "frontage" field, if the value is available then check similarity with words "poor", "fair", "average", "good", "very_good", or "excellent", and use these. if not similar then set 'Type My Own' in the frontage field and store the actual value in the frontage_custom key. If the value contains the word "select" (case-insensitive), set "frontage" to null.
			10. For "select_utilities" field extract site utilities, If value is available then check similarity with words "Full City Service", "Septic and Cistern", "Septic and Well", "Community Sewer and water", "No City Services", and use these. if not similar then set 'Type My Own' in the utilities_select field and store the actual value in the utilities_select_custom key. If the value contains the word "select" (case-insensitive), set "select_utilities" to null.
			11. Determine "sale_status" must be either "Closed" or "Pending".
			12. For "building_type" field, if the value is available then check similarity with words "office", "retail", "industrial", "multi-family", "hospitality", "special", "residential" and use these.
			13. For "building_sub_type" field, set value Type My Own if property sub type is available and for "building_sub_type_custom" set the property sub type value.
			14. Find "condition" of space, If the value is available, if the value is available then check similarity with words "poor", "fair", "average", "good", "very_good", or "excellent", and use these. if not similar then set 'Type My Own' in the condition field and set the actual value in the condition_custom field. If the value contains the word "select" (case-insensitive), set "condition" to null.
			15. Always calculate "price_square_foot" if sale_price is available.	 
			16. Extract site "topography", if the value is available then check similarity with words "level", "sloped", "very_sloped", and use these. if not similar then set "Type My Own" in the topography field and store the actual value in the topography_custom key. If the value contains the word "select" (case-insensitive), set "topography" to null.
			17. Extract "lot_shape" value , if the value is available then check similarity with words "Rectangular", "Square", "Irregular",  and use these. if not similar then set "Type My Own" in the lot_shape field and store the actual value in the lot_shape_custom key. If the value contains the word "select" (case-insensitive), set "lot_shape" to null.
			18. For "parking" field, If the value is available but not similar to "Off Street", "Shared On Street", "Parking Garage", set 'Type My Own' in the parking field and set the actual value in the parking_custom field. If the value contains the word "select" (case-insensitive), set "parking" to null.
			19. Ensure "private_comp" remains an integer (not a string).
			20. For "TI_allowance_unit" field extract TI_allowance unit either "sf" or "total".
			21. For "land_dimension" extract unit of land size, either "ACRE" or "SF", if not available then set to "SF".
			22. For "order" start from 1 and increment for each subsequent property.
			23. Extract land area or size value in "land_size".
			24. For "county" field set county of city.
			25. For "est_building_value" field, find building residual value.
			26. For "offeror_type" field, identify seller type either "company" or "person", and for "acquirer_type" field, identify buyer type is either "company" or "person".
			27. For "escalators" field, extract only number value do not add any text in this field.
			28. For "street_address" field, if street address is not available then extract area details in this field.
			29. For "beds" field, extract value only from like "# of beds" or "no. of beds".
			30. For "baths" field, extract value only from like "# of baths" or "no. of baths".
			31. If property is of type sale then remove field lease_rate_unit.
			32. Determine if property is of type land then remove fields "building_size", "comparison_basis" from output Json.

			## Only adhere to the following instructions if property is of type "lease":
			1. For "lease_rate" field, extract lease price value, and remove "sale_price" and "sale_status" field from the output json.
			2. Extract lease term value in "term".
			3. For "lease_rate_unit" field, extract lease rate unit value and match similarity with words  "annual", "monthly", "year", "month", "acre_year", "acre_month" and use these words only instead of actual word, if value not available then use word "year".
			4. For "lease_status" field, determine status of lease, and use words "new_lease" ,"renewal", "sublease", "expansion" and use these values.		 
			5. For "lease_type" field, extract type of lease, if the value is available then check similarity with words "absolute_net", "gross", "modified_gross", "nnn", "modified_net", "full_service", ground_lease" and use these.	 
			6. For "asking_rent_unit" field, extract asking rent unit value and check similarity with words "annual", "monthly", "year", "month", "acre_year", "acre_month" and use these words only instead of actual word, if value not available then use word "year".  

			Given text: ${extractedText}

			### Additional Instruction 
			if property summary or summary exist then summary should be placed in the "summary" field for each property. 
			Otherwise only when property summary or summary does not exist in Given text:
			Please give me a brief, 1 paragraph, 2-4 sentence summary of the property without any bullet point details. Do not provide any subjective thoughts on the property. The summary should be placed in the "summary" field for each property.

			Expected JSON Output:
			{
			  "properties": [
				{
				  "order":1,
				  "street_address": null,
				  "street_suite": null,
				  "city": null,
				  "county": null,
				  "state": null, 
				  "zipcode": null,
				  "latitude":null, //Extract latitude of property
				  "longitude":null, //Extract longitude of property
				  "property_image_url": null,
				  "building_size": null, 
				  "comparison_basis": "SF",  
				  "frontage": null, 
				  "frontage_custom": null,
				  "utilities_select": null, 
				  "utilities_select_custom":null,
				  "utilities_text": null,
				  "zoning_type": null,
				  "sale_status": null,
				  "building_comments": null,
				  "building_type": null,
				  "building_sub_type":"Type My Own",
				  "building_sub_type_custom": null,
				  "weight_sf": null,
				  "est_building_value": null,
				  "site_access": null,
				  "gross_building_area": null,
				  "net_building_area": null,	
				  "site_coverage_percent": null,
				  "effective_age": null,
				  "site_comments": null,
				  "occupancy": null,
				  "condition": null, 
				  "condition_custom": null,
				  "year_built": null,
				  "year_remodeled": null,
				  "sale_price": null,
				  "price_square_foot": null,
				  "lease_rate": null,
				  "term": null,
				  "concessions": null,
				  "land_size": null, 
				  "land_type": null,
				  "land_dimension": "SF",
				  "est_land_value": null,
				  "date_sold": null,
				  "summary": null,
				  "parcel_id_apn": null,
				  "net_operating_income": null,
				  "cap_rate": null, 
				  "lease_type": null, 
				  "topography": null, 
				  "lot_shape": null, 
				  "lot_shape_custom":null, 
				  "lease_rate_unit": null,
				  "space": null,
				  "cam": null,
				  "date_execution": null,
				  "date_commencement": null,
				  "date_expiration": null,
				  "TI_allowance": null,
				  "TI_allowance_unit": null,
				  "asking_rent": null,
				  "asking_rent_unit": null,
				  "escalators": null,
				  "free_rent": null,
				  "lease_status": null,
				  "total_operating_expense": null,
				  "operating_expense_psf": null,
				  "list_price": null,
				  "date_list": null,
				  "days_on_market": null,
				  "total_concessions": null,
				  "offeror_type": null,
				  "acquirer_type": null,
				  "private_comp": 0,
				  "location_desc": null,
				  "legal_desc": null,
				  "grantor": null,
				  "grantee": null,
				  "instrument": null,
				  "confirmed_by": null,
				  "confirmed_with": null,
				  "financing": null,
				  "marketing_time": null,
				  "construction_class": null,
				  "stories": null,
				  "lease_status":null, 
				  "other_include_utilities": null,
				  "parking": null, 
				  "parking_custom": null,
				  "baths":null,
				  "beds":null,
				  "unit_count":null
				}
			  ]
			} 

			### Strictly follow below mentioned important Rules:
			1. Identify if the property is of type land, then remove given fields, "building_size", "building_type", "building_sub_type", "building_sub_type_custom" from all objects.
			2. Identify if the property is of type sale then find lease fields and remove from all object.
			3. Please Ensure Remove any key-value pair from the JSON if the key has null values in all objects.
			4. Retain any key that exists in at least one object across all objects and If value of that key is missing in other objects, set its value to null.
			5. Ensure numeric values are not enclosed in quotes.
			6. Dates must be strictly formatted as MM/DD/YYYY. If any date has only MM and YYYY then by default set value of DD as '01'.
			7. Boolean and integer fields (such as "private_comp") must retain their correct data types.

			**REMEMBER:** Output only valid JSON, strictly following all instructions and rules above. Do not add any explanations, comments, or extra text.`;

			// Get response from OpenAI.
			const openAIResponse = await openAIService.generateChatCompletion(prompt);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompEnum.COMPS_EXTRACTED_SUCCESS,
				data: openAIResponse,
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
	 * @description This code defines an asynchronous function `saveExtractedPdfComps` that takes in a
	 * request object and a response object.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveExtractedPdfComps = async (
		request: ISaveExtractedPdfComps,
		response: Response,
	): Promise<Response> => {
		let data: IError | ICompSuccess<IExtractedCompsSuccessData>;
		try {
			const { properties, comp_type, type, ai_generated } = request.body;

			/* This code is using the `map` method to iterate over an array called `properties`.
			For each element in the `properties` array, it is creating a new object by spreading the
			properties of the current element (`property`) and adding two additional properties `comp_type`
			and `type` to the new object. The resulting array of new objects is stored in the `compsData`
			variable. */
			const compsData = properties.map((property) => ({
				...property,
				comp_type,
				type,
				ai_generated,
			}));
			const compsArray = [];

			for (let index = 0; index < compsData.length; index++) {
				const compData = compsData[index];

				if (!compData.included_utilities) {
					compData.included_utilities = [];
				}
				if (compData.date_sold) {
					compData.date_sold = changeDateFormat(compData.date_sold);
				}

				// Handle custom fields
				helperFunction.handleCustomField(CompsEnum.TOPOGRAPHY, compData);
				helperFunction.handleCustomField(CompsEnum.LOT_SHAPE, compData);
				helperFunction.handleCustomField(CompsEnum.UTILITIES_SELECT, compData);
				helperFunction.handleCustomField(CompsEnum.FRONTAGE, compData);
				helperFunction.handleCustomField(CompsEnum.CONDITION, compData);
				helperFunction.handleCustomField(CompsEnum.PARKING, compData);
				helperFunction.handleCustomField(CompsEnum.LAND_TYPE, compData);

				compData.user_id = request?.user?.id;
				compData.account_id = request?.user?.account_id;
				const compAttributes: IExtractedComp = {
					...compData,
				};
				compsArray.push(compAttributes);
			}
			const comps = await this.storage.saveExtractedComps(compsArray);
			const { compsCreated } = comps;
			if (!compsCreated.length) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: comps.message || CompEnum.COMP_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompEnum.COMP_SAVE_SUCCESS,
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
	 * @description Get geo-clustered properties for map display
	 * @param request
	 * @param response
	 * @returns
	 */
	public getGeoClusters = async (
		request: IMapBoundsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IMapSuccess<IGeoClusterResponse>;
		try {
			// Validate schema
			const params = await helperFunction.validate(mapBoundsSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { role, account_id, id } = request.user;

			const { bounds, zoom, filters } = params.value;

			// Get clustered properties
			const clusters = await this.storage.getGeoClusters(
				bounds,
				zoom,
				filters,
				account_id,
				id,
				role,
			);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: clusters,
			};

			// Logging information
			helperFunction.log({
				message: `Successfully retrieved ${clusters.clusters.length} clusters`,
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
	 * @description Get detailed properties within a cluster/bounds
	 * @param request
	 * @param response
	 * @returns
	 */
	public getClusterDetails = async (
		request: IClusterDetailsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IMapSuccess<IMapSearchResponse>;
		try {
			// Validate schema
			const params = await helperFunction.validate(clusterDetailsSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { role, account_id, id } = request.user;

			const { bounds, filters, limit, page } = params.value;

			// Get detailed properties
			const properties = await this.storage.getClusterDetails(
				bounds,
				filters,
				limit,
				page,
				account_id,
				id,
				role,
			);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: properties,
			};

			// Logging information
			helperFunction.log({
				message: `Successfully retrieved ${properties.properties.length} properties`,
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
}
