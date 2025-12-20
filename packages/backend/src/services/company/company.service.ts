import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import { Response } from 'express';
import SendResponse from '../../utils/common/commonResponse';
import * as ICompanyService from './ICompanyService';
import { CompanyEnum } from '../../utils/enums/MessageEnum';
import CompanyStore from './company.store';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import HelperFunction from '../../utils/common/helper';
import { createCompanySchema } from './company.validation';
import { IError } from '../../utils/interfaces/common';
import { ICompanyListSuccess, ICompanySuccess } from './ICompanyService';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';

const helperFunction = new HelperFunction();
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
export default class CompanyService {
	private storage = new CompanyStore();
	constructor() {}

	/**
	 * @description function to create company
	 * @param request
	 * @param response
	 * @returns
	 */
	public createComapny = async (
		request: ICompanyService.ICompanyCreateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ICompanySuccess;
		try {
			// Validate schema
			const params = await helperFunction.validate(createCompanySchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attributes = request.body;
			if (!attributes.account_id || request?.user?.role != RoleEnum.SUPER_ADMINISTRATOR) {
				attributes.account_id = request?.user?.account_id;
			}
			// Check if a record with the same company_name already exists
			const existingCompany = await this.storage.findByAttribute({
				company_name: attributes.company_name,
			});

			// If a record with the same company_name already exists
			if (existingCompany) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompanyEnum.COMPANY_ALREADY_EXIST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const company = await this.storage.createCompany(attributes);
			if (!company) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: CompanyEnum.COMPANY_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompanyEnum.COMPANY_SAVE_SUCCESS,
				data: company,
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
	 * @description function to get all companies
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAll = async (
		request: ICompanyService.IGetCompanyRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ICompanyListSuccess;
		try {
			let account_id = {};
			if (!requiredRoles.includes(request?.user?.role)) {
				account_id = { account_id: request?.user?.account_id };
			}

			const companies = await this.storage.getByAttribute(account_id);
			if (!companies) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: CompanyEnum.COMPANY_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompanyEnum.COMPANY_LIST,
				data: companies,
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
	 * @description Function to get company by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getCompanyDetails = async (
		request: ICompanyService.IGetCompanyRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ICompanySuccess;
		try {
			const companyId = parseInt(request.params.id);
			const { account_id } = request.user;

			const attribute = {
				id: companyId,
				account_id,
			};
			if (requiredRoles.includes(request?.user?.role)) {
				delete attribute.account_id;
			}
			const findCompany = await this.storage.findByAttribute(attribute);
			if (!findCompany) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: CompanyEnum.NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: CompanyEnum.COMPANY_DATA,
				data: findCompany,
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
