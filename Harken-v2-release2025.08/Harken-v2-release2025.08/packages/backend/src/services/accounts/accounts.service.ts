import AccountsStore from './accounts.store';
import UserStore from '../user/user.store';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import SendResponse from '../../utils/common/commonResponse';
import IAccount, * as IAccountsService from '../../services/accounts/IAccountsService';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import UserEnum, { AccountsEnum, MailEnum } from '../../utils/enums/MessageEnum';
import {
	IAccountListSuccessData,
	IAccountSuccess,
	IAccountSuccessData,
} from '../../services/accounts/IAccountsService';
import {
	accountContactSchema,
	accountListSchema,
	sendInviteSchema,
	updateThemeSchema,
} from './accounts.validations';
import { S3_BASE_URL } from '../../env';
import IUser from '../../utils/interfaces/IUser';
import MailService from '../mail/mailService';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import UploadFunction from '../../utils/common/upload';
import HelperFunction from '../../utils/common/helper';
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
const permittedRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV, RoleEnum.ADMINISTRATOR];
import AccountOptinStore from '../accountOptin/accountOptin.store';
import { ICreateAccountOptinRequest } from '../accountOptin/IAccountsOptinService';
import StatusEnum from '../../utils/enums/StatusEnum';
const helperFunction = new HelperFunction();

const emailService = new MailService();
const uploadFunction = new UploadFunction();

export default class AccountsService {
	private accountStorage = new AccountsStore();
	private userStorage = new UserStore();
	private accountOptinStorage = new AccountOptinStore();
	constructor() {}

	/**
	 * @description function to get listing of accounts
	 * @param request
	 * @param response
	 * @returns
	 */
	public accountsList = async (
		request: IAccountsService.IAccountsListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAccountSuccess<IAccountSuccessData>;
		try {
			const role = request?.user?.role;
			// If role is not super admin and dev
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const accountsList = await this.accountStorage.findAllAccounts();

			if (!accountsList) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AccountsEnum.ACCOUNTS_DATA_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AccountsEnum.ACCOUNTS_DATA,
				data: accountsList,
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
	 * @description Function to update contact details of account.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveContact = async (
		request: IAccountsService.IContactRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAccountSuccess<IAccount>;
		try {
			const { role, account_id, id } = request.user;
			const editAccountId: number = parseInt(request?.params?.id);
			//validating role while updating account's contact details
			if (
				!(
					requiredRoles.includes(role) ||
					(role === RoleEnum.ADMINISTRATOR && account_id === editAccountId)
				)
			) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Validate schema
			const params = await helperFunction.validate(accountContactSchema, request?.body);
			const attributes = params.value;
			if (!attributes) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			if (!editAccountId) {
				attributes.status = 1;
				attributes.created_by = id;

				if (!attributes.customer_id) {
					attributes.customer_id = '';
				}
				const accountContact = await this.accountStorage.createAccount(attributes);
				data = {
					statusCode: StatusCodeEnum.OK,
					message: AccountsEnum.ACCOUNT_SAVED,
					data: accountContact,
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
			//updating requested details.
			await this.accountStorage.updateDetails(attributes, editAccountId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AccountsEnum.ACCOUNT_SAVED,
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
			}; //logging error
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
	 * @description Function to update theme in account settings.
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateTheme = async (
		request: IAccountsService.IUpdateThemeRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAccountSuccess<IAccount>;
		try {
			const { role, account_id } = request.user;
			const editAccountId: number = parseInt(request?.params?.id);

			//validating role while updating account's theme
			if (
				!(
					requiredRoles.includes(role) ||
					(role === RoleEnum.ADMINISTRATOR && account_id === editAccountId)
				)
			) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Validate schema
			const params = await helperFunction.validate(updateThemeSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			//Finding account
			const editAccount = await this.accountStorage.findByAttribute({
				id: editAccountId,
			});

			//Validating account id
			if (!editAccount) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: ErrorMessageEnum.INVALID_ACCOUNT_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			const value = params.value;
			//removing S3 base url from logo url
			if (value.logo_url) {
				value.logo_url = await helperFunction.removeSubstring(S3_BASE_URL, value.logo_url);
			}
			//removing url from server if already exist
			if (editAccount.logo_url && value.logo_url !== editAccount.logo_url) {
				await uploadFunction.removeFromServer(editAccount.logo_url);
			}
			//updating requested details.
			const updatedData = await this.accountStorage.updateDetails(value, editAccountId);
			if (!updatedData) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AccountsEnum.ACCOUNT_UPDATE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			let message: string = AccountsEnum.ACCOUNT_SAVED;

			if (value.manager_email) {
				const setAccountAdmin = await this.createAccountAdministrator(editAccountId);

				if (setAccountAdmin) {
					if (setAccountAdmin.message) {
						message = setAccountAdmin.message;
					} else if (setAccountAdmin.error) {
						message = setAccountAdmin.error;
					}
				} else {
					// Optional: you can log or assign a fallback message
					message = AccountsEnum.ACCOUNT_SAVED;
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: message,
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
	 * @description Function to get list of admins for a account
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAdminList = async (
		request: IAccountsService.IAccountsListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAccountSuccess<IUser>;
		try {
			const { role } = request.user;
			const accountId: number = parseInt(request?.params?.id);

			//validating role while updating account's contact details
			if (!permittedRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//Finding admin users for same accounts.
			const otherAdmins = await this.userStorage.findAllRecords({
				account_id: accountId,
				role: RoleEnum.ADMINISTRATOR,
			});
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AccountsEnum.ACCOUNTS_DATA,
				data: otherAdmins,
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
	 * @description function to get listing of accounts
	 * @param request
	 * @param response
	 * @returns
	 */
	public settingsAccountsList = async (
		request: IAccountsService.IAccountsListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAccountSuccess<IAccountListSuccessData>;
		try {
			// Validate schema
			const params = await helperFunction.validate(accountListSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const value = params.value;
			const role = request?.user?.role;

			// If role is not super admin and dev
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			//finding account list data
			const accountsList = await this.accountStorage.findAccountsDetail(value);

			if (!accountsList) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AccountsEnum.ACCOUNTS_DATA_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AccountsEnum.ACCOUNTS_DATA,
				data: accountsList,
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
	 * @description Function to delete account.
	 * @param request
	 * @param response
	 * @returns
	 */
	public deleteAccount = async (
		request: IAccountsService.IGetAccountRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { role } = request.user;
			const deleteAccountId: number = parseInt(request?.params?.id);

			//validating role while deleting account.
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			//finding requested account id
			const findAccount = await this.accountStorage.findByAttribute({
				id: deleteAccountId,
				is_deleted: 0,
			});
			if (!findAccount) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AccountsEnum.ALREADY_DELETED_OR_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const attributes = { is_deleted: 1 };
			//deleting account
			const deleted = await this.accountStorage.updateDetails(attributes, deleteAccountId);
			if (!deleted) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AccountsEnum.ACCOUNT_DELETE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AccountsEnum.ACCOUNT_DELETED,
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
	 * @description function to create account admin
	 * @param accountId
	 * @returns
	 */
	public createAccountAdministrator = async (accountId: number) => {
		try {
			const account = await this.accountStorage.findByAttribute({ id: accountId });

			if (account && account.manager_email) {
				const user = await this.userStorage.findByAttribute({
					email_address: account.manager_email,
				});

				if (user) {
					if (user.account_id != accountId) {
						if (!user.account_id) {
							const attributes = { role: RoleEnum.ADMINISTRATOR, account_id: accountId };
							const updatedUser = await this.userStorage.updateAttributes(user.id, attributes);

							if (updatedUser) {
								return {
									status: true,
									message: UserEnum.ROLE_UPDATED_TO_ADMIN,
								};
							} else {
								return { status: false, error: ErrorMessageEnum.CAN_NOT_CREATE_USER };
							}
						} else {
							return { status: false, error: ErrorMessageEnum.USER_ALREADY_REGISTERED };
						}
					} else if (user.account_id === accountId && user.role !== RoleEnum.ADMINISTRATOR) {
						const updatedUser = await this.userStorage.updateAttributes(user.id, {
							role: RoleEnum.ADMINISTRATOR,
						});

						if (updatedUser) {
							return {
								status: true,
								message: UserEnum.ROLE_UPDATED_TO_ADMIN,
							};
						} else {
							return { status: false, error: ErrorMessageEnum.CAN_NOT_CREATE_USER };
						}
					} else {
						return { status: true };
					}
				} else {
					const createdUser = await this.userStorage.createUser({
						email_address: account.manager_email,
						role: RoleEnum.ADMINISTRATOR,
						account_id: accountId,
					});

					if (createdUser) {
						const user = await this.userStorage.findByAttribute({
							email_address: account.manager_email,
						});
						await emailService.sendSetPasswordEmail(user.id);
						return {
							status: true,
							message: MailEnum.ACCOUNT_MANAGER_CREATED,
						};
					} else {
						return { status: false, error: ErrorMessageEnum.CAN_NOT_CREATE_USER };
					}
				}
			}
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return { status: false, error: e.message };
		}
	};
	/**
	 * @description Function to get a account data
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAccount = async (
		request: IAccountsService.IGetAccountRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IAccountSuccess<IAccount>;
		try {
			const { role, account_id } = request.user;
			const accountId: number = parseInt(request?.params?.id);
			//validating role while getting account's contact details
			if (
				!(
					requiredRoles.includes(role) ||
					(role === RoleEnum.ADMINISTRATOR && account_id === accountId)
				)
			) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			//finding requested account id
			const findAccount = await this.accountStorage.findByAttribute({
				id: accountId,
				is_deleted: 0,
			});
			if (!findAccount) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AccountsEnum.ACCOUNTS_DATA_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: AccountsEnum.ACCOUNTS_DATA,
				data: findAccount,
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
	 * @description Function to send invitation mail to broker
	 * @param request
	 * @param response
	 * @returns
	 */
	public sendInvite = async (
		request: IAccountsService.ISendInviteRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			// Validate schema
			const params = await helperFunction.validate(sendInviteSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { role } = request.user;
			//Validating role while using invite mail
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { id, emails } = request.body;
			for (const email of emails) {
				//Find user is exist or not
				const user = await this.userStorage.findByAttribute({ email_address: email });

				if (user && !user.account_id) {
					const data: ICreateAccountOptinRequest = {
						account_id: id,
						whosentit: request.user.id, // login user id
						token: Math.random().toString(36).substring(2, 15), // Generate random token
						expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
						email_address: email,
						status: StatusEnum.SENT,
					};

					// Save the invitation
					if (await this.accountOptinStorage.createAccountOptin(data)) {
						await emailService.sendInviteEmail(data);
					}
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: MailEnum.SEND_INVITE,
			};
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (error) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: error.message,
				error: error,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
}
