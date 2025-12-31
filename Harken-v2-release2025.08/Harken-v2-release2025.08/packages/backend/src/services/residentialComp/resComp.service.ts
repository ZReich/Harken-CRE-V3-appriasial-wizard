import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import {
	ICitiesSuccess,
	IResComp,
	IResCompListSuccessData,
	IResCompSuccess,
	IExtractedCompsSuccess,
} from './IResCompService';
import ResCompsStore from './resComp.store';
import * as IResCompService from '../../services/residentialComp/IResCompService';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import SendResponse from '../../utils/common/commonResponse';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import StatusEnum from '../../utils/enums/StatusEnum';
import { CompEnum, DownloadCompEnum } from '../../utils/enums/MessageEnum';
import HelperFunction from '../../utils/common/helper';
import CompsEnum from '../../utils/enums/CompsEnum';
import { GOOGLE_MAPS_API_KEY, S3_BASE_URL } from '../../env';
import {
	clusterDetailsSchema,
	combinedSchema,
	mapBoundsSchema,
	resCompsListSchema,
	validateCompSchema,
} from './resComps.validations';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { changeDateFormat, Timestamp } from '../../utils/common/Time';
import path from 'path';
import fs from 'fs';
import { launchBrowser } from '../../utils/common/browser';
import * as cheerio from 'cheerio';
import CompanyStore from '../company/company.store';
import ClientStore from '../clients/client.store';
import CommonStore from '../common/common.store';
import { OpenAIService } from '../../utils/common/openAI';

const helperFunction = new HelperFunction();
const openAIService = new OpenAIService();

const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
export default class ResCompsService {
	private resCompStore = new ResCompsStore();
	private companyStore = new CompanyStore();
	private clientStore = new ClientStore();
	private commonStore = new CommonStore();
	constructor() {}

	/**
	 * @description Function to get listing of residential comps.
	 * @param request
	 * @param response
	 */
	public residentialCompList = async (
		request: IResCompService.IResCompsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompSuccess<IResCompListSuccessData>;
		try {
			// Validate schema
			const params = await helperFunction.validate(resCompsListSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { role, account_id } = request.user;

			let accountId: number;
			//checking user role
			if (!requiredRoles.includes(role)) {
				accountId = account_id;
			}
			const requestData = request?.body;

			//fetching residential comps list according to type
			const resCompsList = await this.resCompStore.getAllResComp(
				requestData,
				accountId,
				request?.user,
			);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: resCompsList,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (error) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: error.message,
				error: error,
			};
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description function to delete residential comp by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public delete = async (
		request: IResCompService.IResCompRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { role, account_id, id } = request.user;
			const resCompId: number = parseInt(request?.params?.id);
			const resComp = await this.resCompStore.getCompById(resCompId);

			if (!resComp) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.COMP_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			//checking user role
			if (!requiredRoles.includes(role)) {
				//do not have permission to delete a private comp
				if (resComp.private_comp && resComp.user_id != id) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: CompEnum.PERMISSION_DENIED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				//checking if account id of comp is not equal to login user account id
				if (resComp.account_id != account_id) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: CompEnum.PERMISSION_DENIED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			//deleting residential comp.
			const deleteComp = await this.resCompStore.deleteById(resCompId);
			if (!deleteComp) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.COMP_DELETE_FAIL,
					error: CompEnum.COMP_EXIST_IN_EVAL_OR_APPRAISAL,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
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
		} catch (error) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: error.message,
				error: error,
			};
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
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
		request: IResCompService.ICompsCreateUpdateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompSuccess<IResComp>;
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
			if (!compData.additional_amenities) {
				compData.additional_amenities = [];
			}
			if (compData.date_sold) {
				compData.date_sold = changeDateFormat(compData.date_sold);
			}

			// Handle custom fields
			helperFunction.handleCustomField(CompsEnum.TOPOGRAPHY, compData);
			helperFunction.handleCustomField(CompsEnum.LOT_SHAPE, compData);
			helperFunction.handleCustomField(CompsEnum.FRONTAGE, compData);
			helperFunction.handleCustomField(CompsEnum.CONDITION, compData);
			helperFunction.handleCustomField(CompsEnum.BASEMENT, compData);
			helperFunction.handleCustomField(CompsEnum.UTILITIES_SELECT, compData);
			helperFunction.handleCustomField(CompsEnum.EXTERIOR, compData);
			helperFunction.handleCustomField(CompsEnum.ROOF, compData);
			helperFunction.handleCustomField(CompsEnum.ELECTRICAL, compData);
			helperFunction.handleCustomField(CompsEnum.PLUMBING, compData);
			helperFunction.handleCustomField(CompsEnum.HEATING_COOLING, compData);
			helperFunction.handleCustomField(CompsEnum.WINDOWS, compData);
			helperFunction.handleCustomField(CompsEnum.BEDROOMS, compData);
			helperFunction.handleCustomField(CompsEnum.BATHROOMS, compData);
			helperFunction.handleCustomField(CompsEnum.GARAGE, compData);
			helperFunction.handleCustomField(CompsEnum.FENCING, compData);
			helperFunction.handleCustomField(CompsEnum.FIREPLACE, compData);

			const message = CompEnum.COMP_SAVE_SUCCESS;
			const compId: number = parseInt(request?.params?.id);
			if (compId) {
				compData.id = compId;
				const compAttributes: IResCompService.ICompsCreateUpdateRequest = {
					...compData,
				};
				comp = await this.resCompStore.updateResComp(compAttributes);
				if (comp) {
					data = {
						statusCode: StatusCodeEnum.OK,
						message: CompEnum.COMP_SAVE_SUCCESS,
					};
				}
			} else {
				compData.user_id = request?.user?.id;
				compData.account_id = request?.user?.account_id;
				const compAttributes: IResCompService.ICompsCreateUpdateRequest = {
					...compData,
				};
				comp = await this.resCompStore.createComp(compAttributes, compData.comp_link);
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
	 * @description function to get cities of residential comps.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getCities = async (
		request: IResCompService.IGetCitiesRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompSuccess<ICitiesSuccess>;
		try {
			const state = request?.query?.state;
			if (!state) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompEnum.STATE_NOT_SELECTED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//fetching all cities according to state.
			const allCities = await this.resCompStore.findCities(state, request?.user);
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
		} catch (error) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: error.message,
				error: error,
			};
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
	/**
	 * @description Function to get residential comp by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getComp = async (
		request: IResCompService.IResCompRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompSuccess<IResComp>;
		try {
			const compId: number = parseInt(request.params.id);

			//fetching residential comp.
			const resComp = await this.resCompStore.getCompById(compId);

			//if requested residential comp not found
			if (!resComp) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: CompEnum.COMP_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const { role, id } = request.user;
			if (!requiredRoles.includes(role)) {
				// Do not have permission of private comp
				if (resComp.private_comp && resComp.user_id != id) {
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
				data: resComp,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (error) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: error.message,
				error: error,
			};
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
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
		request: IResCompService.IResCompRequest,
		response: Response,
	): Promise<Response | void | any> => {
		let data: IError | IResCompSuccess<string>;
		try {
			const compIds = request.body.compIds;
			if (!compIds.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: DownloadCompEnum.COMPS_NOT_SELECTED,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			const timestamp = Timestamp(new Date());
			const htmlContent = await this.getCompsPdfContent(compIds);
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
	public getCompsPdfContent = async (compIds: []): Promise<string> => {
		try {
			let htmlContent = `<html><body style="font-family: sans-serif;">`;
			for (let i = 0; i < compIds?.length; i++) {
				const compId = compIds[i];
				const isLastcompId = i === compIds?.length - 1;
				let divStyle;
				if (isLastcompId) {
					divStyle = `" "`;
				} else {
					divStyle = `"page-break-after: always;"`;
				}
				const compData = await this.resCompStore.getCompById(compId);
				const {
					property_name,
					street_address,
					zipcode,
					state,
					city,
					summary,
					res_zonings,
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
					basement,
					sale_price,
					date_sold,
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
					exterior,
					roof,
					electrical,
					plumbing,
					heating_cooling,
					windows,
					bedrooms,
					bathrooms,
					garage,
					fencing,
					fireplace,
					res_comp_amenities,
					other_amenities,
					offeror_type,
					acquirer_type,
					land_dimension,
				} = compData;

				const [
					buildingSize,
					formattedSfValue,
					salePrice,
					formatDateSold,
					dateList,
					listPrice,
					totalConcessions,
				] = await Promise.all([
					helperFunction.formatNumber(building_size, 0, DownloadCompEnum.SF),
					helperFunction.formatNumber(res_zonings[0]?.total_sq_ft, 0, DownloadCompEnum.SF),
					helperFunction.formatCurrency(sale_price),
					helperFunction.formatDateToMDY(date_sold),
					helperFunction.formatDateToMDY(date_list),
					helperFunction.formatCurrency(list_price),
					helperFunction.formatCurrency(total_concessions),
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
				const lotShapeOptions = getOptionsByType(DownloadCompEnum.LOT_SHAPE);

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
				const zoningCode = res_zonings[0]?.zone
					? matchCodeOrFallback(zoningsOptions, res_zonings[0]?.zone)
					: '';
				const subZoneCode = res_zonings[0]?.sub_zone
					? matchCodeOrFallback(zoningsOptions, res_zonings[0]?.sub_zone, true)
					: '';
				const topographyCode = topography ? matchCodeOrFallback(topographyOptions, topography) : '';
				const conditionCode = condition ? matchCodeOrFallback(conditionOptions, condition) : '';
				const frontageCode = frontage ? matchCodeOrFallback(frontageOptions, frontage) : '';
				const lotShapeCode = lot_shape ? matchCodeOrFallback(lotShapeOptions, lot_shape) : '';

				let zoningHtml = '';
				for (let index = 1; index < res_zonings?.length; index++) {
					const element = res_zonings[index];
					const { zone, sub_zone, total_sq_ft } = element;
					const zoneCode = zone ? matchCodeOrFallback(zoningsOptions, zone) : '';
					const subZoningCode = sub_zone ? matchCodeOrFallback(zoningsOptions, sub_zone) : '';
					const sfValue = await helperFunction.formatNumber(total_sq_ft, 0, DownloadCompEnum.SF);
					zoningHtml += `<tr><td>${zoneCode || ''} - ${subZoningCode || ''} - ${sfValue || ''}</td><td></td><td></td><td></td></tr>`;
				}
				const noPhotoUrl =
					'data:image/png;base64,' +
					(await fs.readFileSync('./src/images/Group1549.png', { encoding: 'base64' }));
				const image = property_image_url ? `${S3_BASE_URL}${property_image_url}` : noPhotoUrl;

				// Combine all names into a single string
				const resCompAmenities = res_comp_amenities
					.map((obj) => obj?.additional_amenities)
					.join(', ');

				let landSize;
				if (land_size) {
					const isAcre = land_dimension === CompsEnum.ACRE;
					const landSizeValue = isAcre ? land_size * 43560 : land_size;
					landSize = await helperFunction.formatNumber(landSizeValue, 0, DownloadCompEnum.SF);
				}
				// Start building HTML content
				htmlContent += `<div style=${divStyle}>
					<div style="background-color: rgb(236, 248, 251); padding:10px; margin-bottom: 12px;">
					<h2 style="text-transform: capitalize; color: rgb(13,161,199); font-size: 24px;">${street_address}</h2>
					<p style="font-size: 14px; text-transform: capitalize;">${street_address}<br>${city}, <span style="text-transform: uppercase;">${state}</span> ${zipcode}</p></div>

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
					<table style="font-size: 14px; text-align: left; width:100%; table-layout: fixed; color:rgb(109, 127, 138); background-color:rgb(249, 249, 249);">
					<tbody>
					<tr style="vertical-align: top;">
					<th colspan="4">Property Summary</th></tr>
					<tr style="vertical-align: top;"><td colspan="4">${summary || DownloadCompEnum.NOT_AVAILABLE}</td></tr>
					<tr style="vertical-align: top;">`;
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
					<th>Basement</th>
					<th>Zoning Type</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${year_remodeled || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${utilities_select || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${basement || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${zoning_type || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					</tbody>
					</table></div>
					<div style="padding:10px;">
					<h3 style="font-size: 16px; border-bottom: 1px solid #ccc; padding: 0 0 7px 0;">AMENITIES DETAILS</h3>
					<table style="font-size: 14px; text-align: left; width:100%; table-layout: fixed; background-color:rgb(249, 249, 249); color:rgb(109, 127, 138);">
					<tbody>
					<tr style="vertical-align: top;">
						<th>Exterior</th>
						<th>Roof</th>
						<th>Electrical</th>
						<th>Plumbing</th>
					</tr>
					<tr style="vertical-align: top;">
						<td>${exterior || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${roof || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${electrical || DownloadCompEnum.NOT_AVAILABLE} </td>
						<td>${plumbing || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
						<th>Heating/Cooling</th>
						<th>Windows</th>
						<th>Bedrooms</th>
						<th>Bathrooms</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${heating_cooling || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${windows || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${bedrooms || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${bathrooms || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
					<th>Garage</th>
					<th>Fencing</th>
					<th>Fireplace</th>
					<th>Additional Amenities</th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${garage || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${fencing || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${fireplace || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td>${resCompAmenities || DownloadCompEnum.NOT_AVAILABLE} </td>
					</tr>
					<tr style="vertical-align: top;">
					<th>Other Amenities</th>
					<th></th>
					<th></th>
					<th></th>
					</tr>
					<tr style="vertical-align: top;">
					<td>${other_amenities || DownloadCompEnum.NOT_AVAILABLE} </td>
					<td></td>
					<td></td>
					<td></td>
					</tr>
					</tbody>
					</table></div>
					<div style="padding:10px;">
					<h3 style="font-size: 16px; border-bottom: 1px solid #ccc; padding: 0 0 7px 0;">TRANSACTION DETAILS</h3>
					<table style=" font-size: 14px;text-align: left; width:100%; table-layout: fixed; background-color:rgb(249, 249, 249); color:rgb(109, 127, 138);">
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
					</tr>
					<tr style="vertical-align: top;">
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
	 * @description Extracts structured property data from a PDF.
	 */
	public extractPropertiesData = async (
		request: IResCompService.IResCompPdfUploadRequest,
		response: Response,
	): Promise<Response | void | any> => {
		let data: IError | IResCompSuccess<any[]>;
		try {
			const pdfPath = request.file.path; //Get file path

			// Extract text from the PDF
			const extractedText = await helperFunction.extractTextFromPdf(pdfPath);
			// console.log('Extracted Text:', extractedText);

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
				- Extract the details of multiple real estate properties from the given text and return the output as a structured JSON object.
				- Always output only valid JSON. No explanations, no markdown, no comments, no extra text—just pure JSON. 
				- Do not include \`\`\`json or \`\`\` in the response.
	
				### Strictly adhere to the following instructions:
				1. Include a field named "order" in each property's object, starting from value 1 and incrementing for each subsequent property.
			    2. For "order" start from 1 and increment for each subsequent property.
				3. Ensure accurate mapping of fields even if they are represented by synonyms, abbreviations, or variations in phrasing.
				4. Use lowercase two-letter abbreviations for U.S. states.
				5. For "county" field set county of city.
				6. Always find "latitude" and "longitude" coordinates of each property on the basis of address in the form of string.
				7. Always set "building_type" field to "residential".
				8. building_size is total of square feet values of all buildings or properties in property details.
				9. For "frontage" field, if the value is available then check similarity with words "poor", "fair", "average", "good", "very_good", or "excellent", and use these. if not similar then set 'Type My Own' in the frontage field and store the actual value in the frontage_custom key. If the value contains the word "select" (case-insensitive), set "frontage" to null.
				10. Determine "sale_status" must be either "Closed" or "Pending".
				11. Find "condition" of space, If the value is available, if the value is available then check similarity with words "poor", "fair", "average", "good", "very_good", or "excellent", and use these. if not similar then set 'Type My Own' in the condition field and set the actual value in the condition_custom field. If the value contains the word "select" (case-insensitive), set "condition" to null.
				12. Always calculate "price_square_foot" if sale_price is available.
				13. Extract site "topography", if the value is available then check similarity with words "level", "sloped", "very_sloped", and use these. if not similar then set "Type My Own" in the topography field and store the actual value in the topography_custom key. If the value contains the word "select" (case-insensitive), set "topography" to null.
				14. Extract "lot_shape" value , if the value is available then check similarity with words "rectangular", "square", "irregular",  and use these. if not similar then set "Type My Own" in the lot_shape field and store the actual value in the lot_shape_custom key. If the value contains the word "select" (case-insensitive), set "lot_shape" to null.
				15. Ensure "private_comp" remains an integer (not a string).
				16. For "land_dimension" extract unit of land size, either "ACRE" or "SF", if not available then set to "SF".
				17. Extract land area or land size value in "land_size".
				18. For "building_sub_type" field, if the value is available then check similarity with words "condo", "patio", "ranchette", "single_family_residence", "townhome" and use these. If not similar then set word 'Type My Own' in the "building_sub_type" field and set the actual value in the "building_sub_type_custom" field.
				19. For "basement" field, if the value is available then check similarity with words "partial", "full", "daylight" and use these. If not similar then set word 'Type My Own' in the "basement" field and set the actual value in the "basement_custom" field. If the value contains the word "select" (case-insensitive), set "basement" to null.			
				20. For "select_utilities" field extract site utilities, If value is available then check similarity with words "Full City Service", "Septic and Cistern", "Septic and Well", "Community Sewer and water", "No City Services", and use these. if not similar then set 'Type My Own' in the "utilities_select" field and store the actual value in the "utilities_select_custom" field. If the value contains the word "select" (case-insensitive), set "select_utilities" to null.
				21. For "electrical" field, If value is available then check similarity with words "single_phase", "three_phase" and use these. if not similar then set 'Type My Own' in the "electrical" field and store the actual value in the "electrical_custom" field.
				22. For "exterior" field, If value is available then check similarity with words "Wood Siding", "Steel", "Wood", "Glass", "Brick", "Masonry", "Concrete Block", "Masonry with Block Back Up", "Concrete Board and Masonry", "Masonry and EFIS exterior" and use these. if not similar then set 'Type My Own' in the "exterior" field and store the actual value in the "exterior_custom" field. If the value contains the word "select" (case-insensitive), set "exterior" to null.
				23.	For "roof" field, If value is available then check similarity with words "Standing Seam Metal", "60mil TPO Membrane", "EPDM Membrane", "Asphalt Shingle", "Tar and Gravel" and use these. If not similar then set 'Type My Own' in the "roof" field and store the actual value in the "roof_custom" field. If the value contains the word "select" (case-insensitive), set "roof" to null.
			    24. For "plumbing" field, If value is available then check similarity with words "No Plumbing", "Average per Code", "Above Average" and use these. If not similar then set 'Type My Own' in the "plumbing" field and store the actual value in the "plumbing_custom" field.
				25. For "heating_cooling" field, If value is available then check similarity with words "GFA with Cooling", "GFA without Cooling", "Infrared Gas Radiant Tube", "HVAC System", "Boiler & Chiller System", "Electric", "In Floor Radiant Heating", "No Heating" and use these. If not similar then set 'Type My Own' in the "heating_cooling" field and store the actual value in the "heating_cooling_custom" field. If the value contains the word "select" (case-insensitive), set "heating_cooling" to null.
				26. For "windows" field, If value is available then check similarity with words "Insulated Double Pane", "Insulated & Cased", "Single Pane", "No Windows", "Mix of Old & New" and use these. If not similar then set 'Type My Own' in the "windows" field and store the actual value in the "windows_custom" field.
				27. For "garage" field, If value is available then check similarity with words "None", "Single Car Detached", "Single Car Attached", "Two Car Detached", "Two Car Attached", "Three Car Detached", "Three Car Attached", "Four Car Detached", "Four Car Attached" and use these. If not similar then set 'Type My Own' in the "garage" field and store the actual value in the "garage_custom" field. If the value contains the word "select" (case-insensitive), set "garage" to null.
				28. For "fencing" field, If value is available then check similarity with words "None", "Aluminum", "Wood", "PVC", "Wrought Iron", "Vinyl", "Chain Link", "Electric", "Barbed Wire" and use these. If not similar then set 'Type My Own' in the "fencing" field and store the actual value in the "fencing_custom" field. If the value contains the word "select" (case-insensitive), set "fencing" to null.
				29. For "additional_amenities" check similarity of each available amenity with words "Patio (Uncovered)", "Patio (Covered)", "Deck(Uncovered)", "Deck(Covered)", "Underground Sprinklers", "Shed", "Pool", "Hot Tub", "Outdoor Kitchen", "Landscaping" and use these then add in a array. If amenity is not similar then add in "other_amenities" field in the form of string and separate each word with ",".	
				30. If "Transaction date" or "Date sold" is available, add it to the "date_sold" field.
			
				Extract fireplace, bedrooms, and bathrooms from the input text.
				Fireplace: Extract whole numbers 0–5. If found, use it. If not found, set "fireplace" = "Type My Own" and original text in fireplace_custom. If text contains "select" (any case), set to null.
				Bedrooms: Extract number 0–15 from digit or word (e.g., three, 2, 1 bed, four BR). Use it if valid. Else set "bedrooms" = "Type My Own" and original in bedrooms_custom. Set to null if text contains "select".
				Bathrooms: Extract number 0–15 in 0.5 steps from digit or word (e.g., 1.5, two, 0.5 BA, one and a half baths). Use if valid. Else set "bathrooms" = "Type My Own" and original in bathrooms_custom. Set to null if text contains "select".
				Recognize synonyms: bed, beds, bedroom(s), BR; bath(s), bathroom(s), BA; fireplace(s).
				
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
						"latitude": null,
						"longitude": null,
						"summary": null,
						"gross_living_sq_ft": null,
						"basement_finished_sq_ft": null,
						"basement_unfinished_sq_ft": null,
						"total_sq_ft": null,
						"building_type": null,
						"building_sub_type": null,
						"building_sub_type_custom": null,
						"basement_sq_ft":null,
						"weight_sf": null
						"building_size": null,
						"land_size": null,
						"land_dimension": "SF",
						"topography": null,
						"topography_custom": null,
						"lot_shape": null,
						"lot_shape_custom": null,
						"frontage": null,
						"frontage_custom": null,
						"year_built": null,
						"year_remodeled": null,
						"condition": null,
						"condition_custom": null,
						"utilities_select": null,
						"utilities_select_custom":null,
						"zoning_type": null,
						"basement": null,
						"basement_custom", null,
						"offeror_type": null,
						"acquirer_type": null,
						"exterior": null,
						"exterior_custom": null,
						"price_square_foot": null,
						"roof": null,
						"roof_custom":null,
						"electrical": null,
						"electrical_custom": null,
						"plumbing": null,
						"plumbing_custom": null,
						"heating_cooling": null,
						"heating_cooling_custom": null,
						"windows": null,
						"windows_custom":null,
						"bedrooms": null,
						"bedrooms_custom": null,
						"bathrooms": null,
						"bathrooms_custom": null
						"garage": null,
						"garage_custom": null,
						"fencing": null,
						"fencing_custom": null,
						"fireplace": null,
						"fireplace_custom":null,
						"additional_amenities": [],
						"other_amenities": null,
						"sale_price": null,
						"date_sold": null,
						"sale_status": null,
						"date_list": null,
						"list_price": null,
						"days_on_market": null,
						"total_concessions": null,
						"private_comp": null,
					}
				  ]
				} 
	
				### Strictly follow below mentioned important Rules:
				1. Please Ensure Remove any key-value pair from the JSON if the key has null values in all objects.
				2. Retain any key that exists in at least one object across all objects and If value of that key is missing in other objects, set its value to null.
				3. Ensure numeric values are not enclosed in quotes.
				4. Dates must be strictly formatted as MM/DD/YYYY. If any date has only MM and YYYY then by default set value of DD as '01'.
				5. Boolean and integer fields (such as "private_comp") must retain their correct data types.
				6. Set building_sub_type to "Type My Own" and store actual value in building_sub_type_custom if not matching predefined types.`;

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
	 * @description function to save extracted residential comps
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveExtractedResComps = async (
		request: IResCompService.ISaveExtractedResComps,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompSuccess<IExtractedCompsSuccess>;
		try {
			const { properties, ai_generated } = request.body;
			const compsProperties = properties.map((property) => ({
				...property,
				ai_generated,
			}));
			const allComps = [];
			for (let index = 0; index < compsProperties.length; index++) {
				const compData = compsProperties[index];

				if (!compData.additional_amenities) {
					compData.additional_amenities = [];
				}
				if (compData.date_sold) {
					compData.date_sold = changeDateFormat(compData.date_sold);
				}

				// Handle custom fields
				helperFunction.handleCustomField(CompsEnum.TOPOGRAPHY, compData);
				helperFunction.handleCustomField(CompsEnum.LOT_SHAPE, compData);
				helperFunction.handleCustomField(CompsEnum.FRONTAGE, compData);
				helperFunction.handleCustomField(CompsEnum.CONDITION, compData);
				helperFunction.handleCustomField(CompsEnum.BASEMENT, compData);
				helperFunction.handleCustomField(CompsEnum.UTILITIES_SELECT, compData);
				helperFunction.handleCustomField(CompsEnum.EXTERIOR, compData);
				helperFunction.handleCustomField(CompsEnum.ROOF, compData);
				helperFunction.handleCustomField(CompsEnum.ELECTRICAL, compData);
				helperFunction.handleCustomField(CompsEnum.PLUMBING, compData);
				helperFunction.handleCustomField(CompsEnum.HEATING_COOLING, compData);
				helperFunction.handleCustomField(CompsEnum.WINDOWS, compData);
				helperFunction.handleCustomField(CompsEnum.BEDROOMS, compData);
				helperFunction.handleCustomField(CompsEnum.BATHROOMS, compData);
				helperFunction.handleCustomField(CompsEnum.GARAGE, compData);
				helperFunction.handleCustomField(CompsEnum.FENCING, compData);
				helperFunction.handleCustomField(CompsEnum.FIREPLACE, compData);

				compData.user_id = request?.user?.id;
				compData.account_id = request?.user?.account_id;
				const compAttributes = {
					...compData,
				};
				allComps.push(compAttributes);
			}
			const comp = await this.resCompStore.createExtractedComp(allComps);
			const { compsCreated } = comp;
			if (!compsCreated?.length) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: comp.message || CompEnum.COMP_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompEnum.COMP_SAVE_SUCCESS,
				data: comp,
			};

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
	 * @description Get geo-clustered properties for map display
	 * @param request
	 * @param response
	 * @returns
	 */
	public getGeoClusters = async (
		request: IResCompService.IMapBoundsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompService.IMapSuccess<IResCompService.IGeoClusterResponse>;
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
			const clusters = await this.resCompStore.getGeoClusters(
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
		request: IResCompService.IClusterDetailsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompService.IMapSuccess<IResCompService.IMapSearchResponse>;
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
			const properties = await this.resCompStore.getClusterDetails(
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

	/**
	 * @description This code defines an asynchronous function `saveExtractedPdfComps` that takes in a
	 * request object and a response object.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveExtractedPdfComp = async (
		request: IResCompService.ISaveExtractResComps,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompSuccess<IResCompService.IExtractedCompSuccessData>;
		try {
			const compData = request.body;

			if (!compData.additional_amenities) {
				compData.additional_amenities = [];
			}
			if (compData.date_sold) {
				compData.date_sold = changeDateFormat(compData.date_sold);
			}

			// Handle custom fields
			helperFunction.handleCustomField(CompsEnum.TOPOGRAPHY, compData);
			helperFunction.handleCustomField(CompsEnum.LOT_SHAPE, compData);
			helperFunction.handleCustomField(CompsEnum.FRONTAGE, compData);
			helperFunction.handleCustomField(CompsEnum.CONDITION, compData);
			helperFunction.handleCustomField(CompsEnum.BASEMENT, compData);
			helperFunction.handleCustomField(CompsEnum.UTILITIES_SELECT, compData);
			helperFunction.handleCustomField(CompsEnum.EXTERIOR, compData);
			helperFunction.handleCustomField(CompsEnum.ROOF, compData);
			helperFunction.handleCustomField(CompsEnum.ELECTRICAL, compData);
			helperFunction.handleCustomField(CompsEnum.PLUMBING, compData);
			helperFunction.handleCustomField(CompsEnum.HEATING_COOLING, compData);
			helperFunction.handleCustomField(CompsEnum.WINDOWS, compData);
			helperFunction.handleCustomField(CompsEnum.BEDROOMS, compData);
			helperFunction.handleCustomField(CompsEnum.BATHROOMS, compData);
			helperFunction.handleCustomField(CompsEnum.GARAGE, compData);
			helperFunction.handleCustomField(CompsEnum.FENCING, compData);
			helperFunction.handleCustomField(CompsEnum.FIREPLACE, compData);

			compData.user_id = request?.user?.id;
			compData.account_id = request?.user?.account_id;
			compData.ai_generated = 1;
			const compAttributes = {
				...compData,
			};

			const comp = await this.resCompStore.saveExtractedComp(compAttributes);
			const { compId } = comp;
			if (!compId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: comp.message || CompEnum.COMP_SAVE_FAIL,
					data: comp,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: comp.message || CompEnum.COMP_SAVE_SUCCESS,
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
	 * @description This code defines an asynchronous function `validateComp` that takes in a
	 * request object and a response object.
	 * @param request
	 * @param response
	 * @returns
	 */
	public validateComp = async (
		request: IResCompService.ICompsCreateUpdateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IResCompSuccess<IResCompService.IExtractedCompSuccessData>;
		try {
			const compData = request.body;
			// Validate schema
			const params = await helperFunction.validate(validateCompSchema, compData);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const compAttributes = {
				...compData,
			};
				
			const comp = await this.resCompStore.validateComp(compAttributes);
			const { alreadyExist, addressValidation, message } = comp;
			delete comp.message;
			delete comp.alreadyExist;
			delete comp.addressValidation;
			if (alreadyExist || !addressValidation) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: message,
					data: comp,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: message || CompEnum.COMP_VALIDATION_SUCCESS,
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
}
