import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import SendResponse from '../../utils/common/commonResponse';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import StatusEnum from '../../utils/enums/StatusEnum';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import CompsMapStore from './compsMap.store';
import {
	IMapBoundsRequest,
	IClusterDetailsRequest,
	IGeoClusterResponse,
	IMapSearchResponse,
	IMapStatsResponse,
	IMapSuccess,
} from './ICompsMapService';
import {
	mapBoundsSchema,
	clusterDetailsSchema,
	mapStatsSchema,
} from './compsMap.validations';

const helperFunction = new HelperFunction();

export default class CompsMapService {
	private mapStore = new CompsMapStore();

	constructor() {}

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
			const clusters = await this.mapStore.getGeoClusters(
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
			const properties = await this.mapStore.getClusterDetails(
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
	 * @description Get map statistics for the current view
	 * @param request
	 * @param response
	 * @returns
	 */
	public getMapStats = async (
		request: IMapBoundsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IMapSuccess<IMapStatsResponse>;
		try {
			// Validate schema
			const params = await helperFunction.validate(mapStatsSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { role, account_id, id } = request.user;

			// // Role validations
			// if (role === RoleEnum.DATA_ENTRY) {
			// 	data = {
			// 		statusCode: StatusCodeEnum.UNAUTHORIZED,
			// 		message: ErrorMessageEnum.PERMISSION_DENIED,
			// 	};
			// 	return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			// }

			const { bounds, filters } = params.value;

			// Get map statistics
			const stats = await this.mapStore.getMapStats(
				bounds,
				filters,
				account_id,
				id,
				role,
			);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: stats,
			};

			// Logging information
			helperFunction.log({
				message: `Successfully retrieved map statistics`,
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
	 * @description Search properties within map bounds with enhanced features
	 * @param request
	 * @param response
	 * @returns
	 */
	public searchMapProperties = async (
		request: IMapBoundsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IMapSuccess<IMapSearchResponse>;
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

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const { bounds, zoom, filters, pageSize, page } = params.value;

			// Get both properties and clusters
			const [properties, clusters] = await Promise.all([
				this.mapStore.getClusterDetails(
					bounds,
					filters,
					pageSize,
					page,
					account_id,
					id,
					role,
				),
				zoom < 15 ? this.mapStore.getGeoClusters(
					bounds,
					zoom,
					filters,
					account_id,
					id,
					role,
				) : Promise.resolve(null),
			]);

			const response_data: IMapSearchResponse = {
				...properties,
				clusters: clusters?.clusters || undefined,
			};

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: response_data,
			};

			// Logging information
			helperFunction.log({
				message: `Successfully searched map properties`,
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
	 * @description Get filter options for map search
	 * @param request
	 * @param response
	 * @returns
	 */
	public getMapFilters = async (
		request: IMapBoundsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IMapSuccess<any>;
		try {
			const { role, account_id, id } = request.user;

			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			// Get available filter options
			const filterOptions = await this.getAvailableFilters(account_id, id, role);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: filterOptions,
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
	 * @description Get available filter options from database
	 */
	private async getAvailableFilters(accountId?: number, userId?: number, role?: number) {
		// This would query the database for available filter options
		// For now, returning static options - you can enhance this to be dynamic
		return {
			types: ['sale', 'lease'],
			propertyTypes: [
				'Office',
				'Retail',
				'Industrial',
				'Multi-Family',
				'Hotel',
				'Mixed Use',
				'Land',
				'Other',
			],
			conditions: ['Excellent', 'Good', 'Fair', 'Poor'],
			priceRanges: [
				{ min: 0, max: 100000, label: 'Under $100K' },
				{ min: 100000, max: 500000, label: '$100K - $500K' },
				{ min: 500000, max: 1000000, label: '$500K - $1M' },
				{ min: 1000000, max: 5000000, label: '$1M - $5M' },
				{ min: 5000000, max: null, label: 'Over $5M' },
			],
			sizeRanges: [
				{ min: 0, max: 1000, label: 'Under 1,000 SF' },
				{ min: 1000, max: 5000, label: '1,000 - 5,000 SF' },
				{ min: 5000, max: 10000, label: '5,000 - 10,000 SF' },
				{ min: 10000, max: 50000, label: '10,000 - 50,000 SF' },
				{ min: 50000, max: null, label: 'Over 50,000 SF' },
			],
		};
	}
}
