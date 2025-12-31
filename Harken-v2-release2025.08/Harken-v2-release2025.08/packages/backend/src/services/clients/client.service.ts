import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import { Response } from 'express';
import SendResponse from '../../utils/common/commonResponse';
import { ClientEnum } from '../../utils/enums/MessageEnum';
import ClientStore from './client.store';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import HelperFunction from '../../utils/common/helper';
import { createClientSchema } from './client.validations';
import { IError } from '../../utils/interfaces/common';
import {
	IClient,
	IClientCreateRequest,
	IClientListSuccess,
	IClientSuccess,
	IClientsListRequest,
	IClientsSuccess,
	IGetClientListSuccess,
	IGetClientsRequest,
} from './IClientService';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
const helperFunction = new HelperFunction();
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];

export default class ClientService {
	private storage = new ClientStore();
	constructor() {}

	/**
	 * @description function to create client
	 * @param request
	 * @param response
	 * @returns
	 */
	public create = async (request: IClientCreateRequest, response: Response): Promise<Response> => {
		let data: IError | IClientSuccess;
		try {
			// Validate schema
			const params = await helperFunction.validate(createClientSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attributes = request.body;

			// Add account id of login user if role is not super admin
			if (!attributes.account_id || request?.user?.role != RoleEnum.SUPER_ADMINISTRATOR) {
				attributes.account_id = request?.user?.account_id;
			}
			// Add user_id of login user
			attributes.user_id = request?.user?.id;
			// Create cleint
			const client: IClient = await this.storage.createClient(attributes);
			if (!client) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ClientEnum.CLIENT_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: ClientEnum.CLIENT_SAVE_SUCCESS,
				data: client,
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
	 * @description function to get all Clients
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAll = async (request: IGetClientsRequest, response: Response): Promise<Response> => {
		let data: IError | IClientListSuccess;
		try {
			let account_id = {};
			// If role is not super admin or dev then get only logged user account's client
			if (
				request?.user?.role != RoleEnum.SUPER_ADMINISTRATOR &&
				request?.user?.role != RoleEnum.DEV
			) {
				account_id = { account_id: request?.user?.account_id };
			}
			// Get clients by account id
			const clients = await this.storage.getByAttribute(account_id);
			if (!clients) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: ClientEnum.CLIENTS_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: ClientEnum.CLIENTS_LIST,
				data: clients,
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
	 * @description function to update client
	 * @param request
	 * @param response
	 * @returns
	 */
	public update = async (request: IClientCreateRequest, response: Response): Promise<Response> => {
		let data: IError | IClientSuccess;
		try {
			const params = await helperFunction.validate(createClientSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { id, role } = request.user;
			const clientId = parseInt(request?.params?.id);
			const client = await this.storage.findByAttribute({ id: clientId });
			if (!client) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: ClientEnum.CLIENTS_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			if (role != RoleEnum.SUPER_ADMINISTRATOR && client.user_id != id) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ClientEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const clients = await this.storage.update(clientId, request.body);
			if (!clients) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ClientEnum.CLIENT_UPDATE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: ClientEnum.CLIENT_SAVE_SUCCESS,
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
	 * @description function to delete client
	 * @param request
	 * @param response
	 * @returns
	 */
	public delete = async (request: IGetClientsRequest, response: Response): Promise<Response> => {
		let data: IError | IClientSuccess;
		try {
			const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
			const { role, account_id, id } = request.user;
			//Delete client by client id
			const clientId = parseInt(request?.params?.id);
			const client = await this.storage.findByAttribute({ id: clientId });
			if (!client) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: ClientEnum.CLIENTS_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			if (
				!requiredRoles.includes(role) ||
				(role === RoleEnum.ADMINISTRATOR && client.account_id != account_id) ||
				(role === RoleEnum.USER && client.user_id != id)
			) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ClientEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const clients = await this.storage.delete(clientId);
			if (!clients) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ClientEnum.DELETE_CLIENT_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: ClientEnum.CLIENT_DELETE,
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
	 * @description function to get client by id
	 * @param request
	 * @param response
	 * @returns
	 */
	public getClient = async (request: IGetClientsRequest, response: Response): Promise<Response> => {
		let data: IError | IClientSuccess;
		try {
			const { role, account_id } = request.user;
			const requestedClientId = parseInt(request.params.id);
			//If role is not super admin or dev then get only logged user account's client
			const attribute = {
				id: requestedClientId,
				account_id,
			};

			if (requiredRoles.includes(role)) {
				delete attribute.account_id;
			}
			//get clients by account id
			const client = await this.storage.findByAttribute(attribute);
			if (!client) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: ClientEnum.NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: ClientEnum.CLIENT_DATA,
				data: client,
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
	 * @description Function to get clients list
	 * @param request
	 * @param response
	 * @returns
	 */
	public getClientsList = async (
		request: IClientsListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IClientsSuccess<IGetClientListSuccess>;
		try {
			const { role, account_id, id } = request.user;
			const attributes = request.query;

			let accountId;
			let userId;
			//checking user role permissions
			if (role === RoleEnum.ADMINISTRATOR) {
				accountId = account_id;
			}
			if (role === RoleEnum.USER) {
				userId = id;
			}
			//get all clients
			const clients = await this.storage.getAllClients(attributes, accountId, userId);
			if (!clients) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: ClientEnum.NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: ClientEnum.CLIENTS_LIST,
				data: clients,
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
}
