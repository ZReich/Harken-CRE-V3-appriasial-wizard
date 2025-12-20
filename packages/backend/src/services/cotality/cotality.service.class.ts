import { Response, Request } from 'express';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import SendResponse from '../../utils/common/commonResponse';
import { CotalityService } from './cotality.service';
import {
	mapToSalesApproachFields,
	mapToCostApproachFields,
	mapToIncomeApproachFields,
	mapToLeaseApproachFields,
	mapToCapRateApproachFields,
} from './cotality.fieldMapper';
import { IError } from '../../utils/interfaces/common';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';

const helperFunction = new HelperFunction();

interface ICotalityPropertyRequest extends Request {
	body: {
		address: string;
		city: string;
		state: string;
		zipcode?: string;
	};
}

export default class CotalityServiceClass {
	private cotalityService: CotalityService;

	constructor() {
		this.cotalityService = new CotalityService();
	}

	/**
	 * Get property by PropId
	 */
	public getPropertyByPropId = async (request: Request, response: Response): Promise<Response> => {
		let data: IError | any;
		try {
			const propId = request.params.propId;
			if (!propId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: 'Property ID is required',
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const cotalityData = await this.cotalityService.getPropertyByPropId(propId);
			const mappedData = this.cotalityService.mapToCompsModel(cotalityData);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Property data retrieved successfully',
				data: {
					raw: cotalityData,
					mapped: mappedData,
				},
			};

			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e: any) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || 'Error fetching property data',
				error: e,
			};

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
	 * Get property by address
	 */
	public getPropertyByAddress = async (request: ICotalityPropertyRequest, response: Response): Promise<Response> => {
		let data: IError | any;
		try {
			const { address, city, state, zipcode } = request.body;

			if (!address || !city || !state) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: 'Address, city, and state are required',
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const cotalityData = await this.cotalityService.getPropertyByAddress(address, city, state, zipcode);
			const mappedData = this.cotalityService.mapToCompsModel(cotalityData);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Property data retrieved successfully',
				data: {
					raw: cotalityData,
					mapped: mappedData,
				},
			};

			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e: any) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || 'Error fetching property data',
				error: e,
			};

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
	 * Get field mapping documentation
	 */
	public getFieldMapping = async (request: Request, response: Response): Promise<Response> => {
		let data: IError | any;
		try {
			const mapping = this.cotalityService.getFieldMappingDocumentation();

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Field mapping documentation retrieved successfully',
				data: mapping,
			};

			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e: any) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || 'Error retrieving field mapping',
				error: e,
			};

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
	 * Explore property data - returns raw API response + mapped fields for all approaches
	 */
	public exploreProperty = async (request: Request, response: Response): Promise<Response> => {
		let data: IError | any;
		try {
			const propId = request.params.propId;
			if (!propId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: 'Property ID is required',
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const cotalityData = await this.cotalityService.getPropertyByPropId(propId);
			const compsMapped = this.cotalityService.mapToCompsModel(cotalityData);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Property exploration data retrieved successfully',
				data: {
					raw: cotalityData,
					mapped: {
						comps: compsMapped,
						salesApproach: mapToSalesApproachFields(cotalityData),
						costApproach: mapToCostApproachFields(cotalityData),
						incomeApproach: mapToIncomeApproachFields(cotalityData),
						leaseApproach: mapToLeaseApproachFields(cotalityData),
						capRateApproach: mapToCapRateApproachFields(cotalityData),
					},
				},
			};

			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e: any) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || 'Error exploring property data',
				error: e,
			};

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

