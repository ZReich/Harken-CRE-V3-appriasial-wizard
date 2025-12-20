import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import UserStore from './user.store';
import SendResponse from '../../utils/common/commonResponse';
import UserEnum, { AccountsEnum, MailEnum } from '../../utils/enums/MessageEnum';
import { Response } from '../../utils/interfaces/common';
import IUser from '../../utils/interfaces/IUser';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import UsersTransactionStore from '../usersTransactions/usersTransactions.store';
import AccountsStore from '../accounts/accounts.store';
import HelperFunction from '../../utils/common/helper';
import {
	changePwSchema,
	checkEmailSchema,
	updateUsersTransactions,
	userAddPersonalDataSchema,
} from './user.validations';
import { IError } from '../../utils/interfaces/common';
import {
	IUserSuccess,
	IProfileSuccessData,
	IEmailSuccessData,
	IUserListSuccess,
	IAddPersonalDataRequest,
	IUpdateTransactionRequest,
	IChangePasswordRequest,
	IUsersListRequest,
	IUserRequest,
	IUpdateUserEmail,
	IGetUserRequest,
} from '../../services/user/IUserService';
import StatusEnum from '../../utils/enums/StatusEnum';
import { S3_BASE_URL } from '../../env';
import bcrypt from 'bcrypt';
const helperFunction = new HelperFunction();
import MailService from '../mail/mailService';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import AuthFunctions from '../../utils/common/auth';
import UploadFunction from '../../utils/common/upload';
const authFun = new AuthFunctions(bcrypt);
const uploadFunction = new UploadFunction();

const emailService = new MailService();

const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV];
export default class UserService {
	private storage = new UserStore();
	private transactionStore = new UsersTransactionStore();
	private accountStore = new AccountsStore();
	constructor() {}

	/**
	 *@description Function to get user profile data
	 * @param request
	 * @param response
	 * @returns
	 */
	public getUserProfile = async (
		request: IGetUserRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUserSuccess<IProfileSuccessData>;
		try {
			const userId: number = request?.user?.id;
			const user: IUser = await this.storage.get(userId);
			if (!user) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.USER_INFO,
				data: { user },
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
	 * @description function to Upload image.
	 * @param file
	 * @param id
	 * @param fieldName
	 * @returns
	 */
	public async addImage(file: Express.Multer.File, id: number, fieldName: string) {
		try {
			if (!file) {
				return false;
			}
			// Perform S3 upload
			const filename = await uploadFunction.uploadToS3({
				fileInput: file,
				entityName: 'users',
				objectId: id,
			});

			if (filename) {
				const currentImageUrl = await this.storage.getCurrentImage(fieldName, id);
				if (currentImageUrl != filename) {
					// Remove the previous image from the server
					await uploadFunction.removeFromServer(currentImageUrl);
				}

				// Update the property_image_url field in the database
				await this.storage.updateAttributes(id, { [fieldName]: filename });
			}
		} catch (error) {
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return Promise.reject(error.message || error);
		}
	}

	/**
	 * @description function to check email, if already exists or not.
	 * @param request
	 * @param response
	 */
	public checkEmail = async (request: IUpdateUserEmail, response: Response): Promise<Response> => {
		let data: IError | IUserSuccess<IEmailSuccessData>;
		try {
			const { id, email_address } = request.body;
			const params = await helperFunction.validate(checkEmailSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const findEmail = await this.storage.findEmail({
				email_address: email_address,
			});
			// If findEmail user id not equal to user id
			if (findEmail && findEmail.id != id) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: MailEnum.EMAIL_ALREADY_TAKEN,
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
				message: MailEnum.EMAIL_NOT_TAKEN,
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
	 * @description Function to create user.
	 * @param request
	 * @param response
	 * @returns
	 */
	public save = async (request: IAddPersonalDataRequest, response: Response): Promise<Response> => {
		let data: IError | IUserSuccess<IProfileSuccessData>;
		try {
			//Joi validations for request body
			const params = await helperFunction.validate(userAddPersonalDataSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const value = params.value;

			const findEmail = await this.storage.findEmail({
				email_address: value.email_address,
			});
			// If findEmail user id not equal to user id
			if (findEmail) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: MailEnum.EMAIL_ALREADY_TAKEN,
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

			const { role, account_id } = request.user;

			value.role = RoleEnum.USER;
			value.status = StatusEnum.ACTIVE;
			//If role is not superAdmin or dev then add logged user account id as id
			if (!requiredRoles.includes(role)) {
				value.account_id = account_id;
			}

			//validating account id while updating account in user profile
			if (value.account_id) {
				const findAccount = await this.accountStore.findByAttribute({
					id: value.account_id,
				});
				if (!findAccount) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AccountsEnum.ACCOUNTS_DATA_NOT_FOUND,
					};
					//logging information
					helperFunction.log({
						message: data.message,
						location: await helperFunction.removeSubstring(__dirname, __filename),
						level: LoggerEnum.INFO,
						error: '',
					});
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
			}

			//Add user information
			const user: IUser = await this.storage.createUser(value);
			if (!user) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: UserEnum.USER_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			const files = request?.files;

			if (files) {
				const fieldNames = Object.keys(files);
				for (let i = 0; i < fieldNames.length; i++) {
					const fieldName = fieldNames[i];
					const file = request.files[fieldName][0];
					this.addImage(file, user.id, fieldName);
				}
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.USER_SAVE_SUCCESS,
				data: { user },
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
	 * @description function to update personal data of user
	 * @param request
	 * @param response
	 * @returns
	 */
	public updatePersonalData = async (
		request: IAddPersonalDataRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUserSuccess<IProfileSuccessData>;
		try {
			const { id, role, account_id } = request.user;
			const editUserId: number = Number(request?.params?.id);
			const editUser = await this.storage.findByAttribute({
				id: editUserId,
			});
			const userAccountId = editUser.account_id;

			//Joi validations for request body
			const params = await helperFunction.validate(userAddPersonalDataSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const value = params.value;

			const findEmail = await this.storage.findEmail({
				email_address: value.email_address,
			});

			// If findEmail user id not equal to user id
			if (findEmail && findEmail.id != editUserId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: MailEnum.EMAIL_ALREADY_TAKEN,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const isAdmin = role === RoleEnum.ADMINISTRATOR && account_id === userAccountId;
			const isValid = id === editUserId;
			const hasRequiredRole = requiredRoles.includes(role);

			//Role validation checks
			if (!(isAdmin || isValid || hasRequiredRole)) {
				const data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			if (value.profile_image_url) {
				value.profile_image_url = await helperFunction.removeSubstring(
					S3_BASE_URL,
					value.profile_image_url,
				);
			}
			if (editUser.profile_image_url && value.profile_image_url !== editUser.profile_image_url) {
				await uploadFunction.removeFromServer(editUser.profile_image_url);
			}

			if (value.signature_image_url) {
				value.signature_image_url = await helperFunction.removeSubstring(
					S3_BASE_URL,
					value.signature_image_url,
				);
			}
			if (
				editUser.signature_image_url &&
				value.signature_image_url !== editUser.signature_image_url
			) {
				await uploadFunction.removeFromServer(editUser.signature_image_url);
			}

			// Updating user details.
			await this.storage.updateAttributes(editUserId, value);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.USER_SAVE_SUCCESS,
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
	 * @description function to update user transaction data of user
	 * @param request
	 * @param response
	 * @returns
	 */
	public updateTransaction = async (
		request: IUpdateTransactionRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUserSuccess<IProfileSuccessData>;
		try {
			const editUserId: number = Number(request?.params?.id);
			const editUser = await this.storage.findByAttribute({
				id: editUserId,
			});

			//Validating user
			if (!editUser) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: ErrorMessageEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const editUserAccountId = editUser.account_id;
			const { id, role, account_id } = request.user;

			//Role validation checks
			const isAdmin = role === RoleEnum.ADMINISTRATOR && account_id === editUserAccountId;
			const isValid = id === editUserId;
			const hasRequiredRole = requiredRoles.includes(role);

			if (!(isAdmin || isValid || hasRequiredRole)) {
				const data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PERMISSION_DENIED,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			//Joi validations for request body
			const params = await helperFunction.validate(updateUsersTransactions, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { users_transactions, ...rest } = params.value;

			// Validating update request for account id update of user.
			if (rest.account_id) {
				const findAccount = await this.accountStore.findByAttribute({
					id: rest.account_id,
				});
				if (!findAccount) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AccountsEnum.ACCOUNTS_DATA_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
			}

			if (Object.keys(rest).length > 0) {
				await this.storage.updateAttributes(editUserId, rest);
			}

			//users transactions add, update, delete.

			const keepTransactionId = [];

			if (users_transactions) {
				for (const transaction of users_transactions) {
					if (transaction.id) {
						const findTransaction = await this.transactionStore.find(transaction.id);
						if (findTransaction) {
							// updating info in user-transactions
							await this.transactionStore.update(transaction.id, transaction);
							keepTransactionId.push(transaction.id);
						}
					} else {
						transaction.user_id = editUserId;

						//creating new user transactions
						const createTransaction = await this.transactionStore.createTransaction(transaction);
						keepTransactionId.push(createTransaction.id);
					}
				}

				//removing users transactions
				await this.transactionStore.removeUnusedTransactions(keepTransactionId, editUserId);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.USER_SAVE_SUCCESS,
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
	 * @description function to change password
	 * @param request
	 * @param response
	 * @returns
	 */
	public changePassword = async (
		request: IChangePasswordRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUserSuccess<IProfileSuccessData>;
		try {
			// Validate schema
			const params = await helperFunction.validate(changePwSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { new_password, confirm_password } = request.body;
			if (confirm_password != new_password) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.PASSWORD_MISMATCH,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { id } = request.user;
			// Check if the user is exists
			const user: IUser = await this.storage.get(id);
			if (!user) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const enc_password = await authFun.hashPassword(new_password);
			// Change Password
			const success = await this.storage.changePassword(enc_password, id);
			if (!success) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.PASSWORD_NOT_UPDATE,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.PASSWORD_UPDATE,
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
	 * @description Function to add personal data of user.
	 * @param request
	 * @param response
	 * @returns
	 */
	public addPersonalData = async (
		request: IAddPersonalDataRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUserSuccess<IProfileSuccessData>;
		try {
			//Joi validations for request body
			const params = await helperFunction.validate(userAddPersonalDataSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const value = params.value;

			const findEmail = await this.storage.findEmail({
				email_address: value.email_address,
			});
			// If findEmail user id not equal to user id
			if (findEmail) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: MailEnum.EMAIL_ALREADY_TAKEN,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { role, account_id, first_name, last_name } = request.user;

			value.role = RoleEnum.USER;
			value.status = StatusEnum.ACTIVE;
			//If role is not superAdmin or dev then add logged user account id as id
			if (!requiredRoles.includes(role)) {
				value.account_id = account_id;
			}

			//validating account id while updating account in user profile
			if (value.account_id) {
				const findAccount = await this.accountStore.findByAttribute({
					id: value.account_id,
				});
				if (!findAccount) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: AccountsEnum.ACCOUNTS_DATA_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
			}
			// Remove image base url
			if (value.profile_image_url) {
				value.profile_image_url = await helperFunction.removeSubstring(
					S3_BASE_URL,
					value.profile_image_url,
				);
			}
			// Remove image base url
			if (value.signature_image_url) {
				value.signature_image_url = await helperFunction.removeSubstring(
					S3_BASE_URL,
					value.signature_image_url,
				);
			}

			//Add user information
			const user: IUser = await this.storage.createUser(value);
			if (!user) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: UserEnum.USER_SAVE_FAIL,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			const { email_address } = value;

			const sender = first_name + ' ' + last_name;
			emailService.sendSetPasswordEmail({ email_address, user, sender });
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.USER_SAVE_SUCCESS,
				data: { user },
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
	 * @description Function to get users list.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getUsersList = async (
		request: IUsersListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUserSuccess<IUserListSuccess>;
		try {
			const { role, account_id } = request.user;

			let accountId: number;
			//checking user role
			if (!requiredRoles.includes(role)) {
				accountId = account_id;
			}
			const requestData = request?.query;

			//fetching users list
			const usersList = await this.storage.getAllUsers(requestData, accountId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: usersList,
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
	 * @description Function to get users for dropdown by account number.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getUsersDropdown = async (
		request: IUserRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IUserSuccess<IUser[]>;
		try {
			const { role, account_id } = request.user;
			let accountId: number;
			//checking user role
			if (!requiredRoles.includes(role)) {
				accountId = account_id;
			}
			const users = await this.storage.getDropdownUsersByAccountNo(accountId);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: users,
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
}
