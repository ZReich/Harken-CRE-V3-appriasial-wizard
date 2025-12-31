import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import * as IAuthService from '../../services/auth/IAuthService';
import AuthStore from './auth.store';
import UserStore from '../user/user.store';
import bcrypt from 'bcrypt';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import jwt from 'jsonwebtoken';
import HelperFunction from '../../utils/common/helper';
import SendResponse from '../../utils/common/commonResponse';
import UserEnum, { MailEnum } from '../../utils/enums/MessageEnum';
import MailService from '../mail/mailService';
import StatusEnum from '../../utils/enums/StatusEnum';
import TokenTypeEnum from '../../utils/enums/TokenTypeEnum';
import {
	FORGOT_JWT_SECRET,
	REFRESH_JWT_SECRET,
	REFRESH_TOKEN_EXPIRATION,
	TOKEN_EXPIRATION,
} from '../../env';
import { extractBearerToken } from '../../middleware/authenticate';
import IUser from '../../utils/interfaces/IUser';
import { loginSchema, forgotPwSchema, resetPwSchema } from './auth.validations';
import { ILoginSuccess, ILoginSuccessData } from '../../services/auth/IAuthService';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import AuthFunction from '../../utils/common/auth';

const emailService = new MailService();
const helperFunction = new HelperFunction();
const authFun = new AuthFunction(bcrypt, jwt);
export default class AuthService {
	private storage = new AuthStore();
	private userStorage = new UserStore();
	constructor() {}

	/**
	 * @description Function for login
	 * @param request
	 * @param response
	 * @returns
	 */
	public login = async (
		request: IAuthService.IAuthUserRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ILoginSuccess<ILoginSuccessData>;
		try {
			// Validate schema
			const params = await helperFunction.validate(loginSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { email_address, password } = params.value;
			const userAttributes = {
				email_address,
			};
			// Check user email exist or not
			const user: IUser = await this.storage.findByAttribute(userAttributes);
			if (
				!user ||
				user?.status.toLocaleLowerCase() != StatusEnum.ACTIVE.toLocaleLowerCase() ||
				user.role === RoleEnum.NONE
			) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.INVALID_LOGIN,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// if (user.approved_by_admin != 1 && user.last_login_at != null && user.role != RoleEnum.SUPER_ADMINISTRATOR) {
			// 	data = {
			// 		statusCode: StatusCodeEnum.NOT_FOUND,
			// 		message: UserEnum.NOT_APPROVED_BY_ADMIN,
			// 	};
			// 	return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			// }
			const userPassword: string = user.password;
			// Check password is valid or not
			const matchPassword: boolean = await authFun.comparePassword(password, userPassword);
			if (!matchPassword) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.WRONG_PASSWORD,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const tokenReq = {
				id: user.id,
				role: user.role,
				account_id: user.account_id,
				first_name: user.first_name,
				last_name: user.last_name,
				approved_by_admin: user.approved_by_admin,
				status: user.status,
				email_address: user.email_address,
				comp_adjustment_mode: user.comp_adjustment_mode,
				subscription: user.account?.subscription,
				first_login: user.account?.first_login,
				enable_residential: user.account?.enable_residential,
				enable_residential_mode: user.email_address,
				expire: TOKEN_EXPIRATION,
				type: TokenTypeEnum.TOKEN,
			};

			// Generate JWT Token
			const token: string = await authFun.generateToken(tokenReq);
			// Update last login timestamp
			await this.userStorage.updateAttributes(user.id, { last_login_at: new Date() });

			// Generate JWT Token for refresh Token
			tokenReq.expire = REFRESH_TOKEN_EXPIRATION;
			tokenReq.type = TokenTypeEnum.REFRESH_TOKEN;
			const refresh_token: string = await authFun.generateToken(tokenReq);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.LOGIN_SUCCESSFULLY,
				data: {
					token,
					refresh_token,
					user,
				},
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
			//logging error
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
	 * @description function for forgot password
	 * @param request
	 * @param response
	 * @returns
	 */
	public forgot = async (
		request: IAuthService.IForgotPasswordRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;

		try {
			// Validate schema
			const params = await helperFunction.validate(forgotPwSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { email_address } = params.value;
			const userAttributes = {
				email_address,
			};
			// Check email is valid or not
			const user: IUser = await this.storage.findByAttribute(userAttributes);
			if (!user) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			if (user.status === StatusEnum.DISABLED) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.ACCOUNT_DISABLED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Send email
			emailService.sendMailToUser(email_address, user);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: MailEnum.MAIL_SEND,
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
	 * @description function for reset password
	 * @param request
	 * @param response
	 * @returns
	 */
	public resetPassword = async (
		request: IAuthService.IResetPasswordRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;

		try {
			// Validate schema
			const params = await helperFunction.validate(resetPwSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const { token, password } = params.value;

			let decodeToken;
			try {
				decodeToken = jwt.verify(token, FORGOT_JWT_SECRET);
			} catch (err) {
				let message = UserEnum.INVALID_TOKEN;
				let statusCode = StatusCodeEnum.BAD_REQUEST;

				// Customize error messages for JWT verification failures
				if (err instanceof jwt.TokenExpiredError) {
					message = UserEnum.TOKEN_EXPIRED;
					statusCode = StatusCodeEnum.BAD_REQUEST;
				} else if (err instanceof jwt.JsonWebTokenError) {
					message = UserEnum.INVALID_TOKEN;
					statusCode = StatusCodeEnum.BAD_REQUEST;
				}

				data = {
					statusCode: statusCode,
					message: message,
					error: err.message,
				};

				return SendResponse(response, data, statusCode);
			}

			// Ensure token is of type 'FORGOTTEN_PASSWORD'
			if (decodeToken.type !== TokenTypeEnum.FORGOTTEN_PASSWORD) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: UserEnum.INVALID_TOKEN,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Check token is valid or not
			const userInfo = await this.storage.validateToken({
				user_id: decodeToken?.id,
				token,
				type: TokenTypeEnum.FORGOTTEN_PASSWORD,
			});

			if (!userInfo) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.INVALID_TOKEN,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			const user_id = userInfo?.id;

			// Encrypt the password
			const enc_password = await authFun.hashPassword(password);

			// Update Password
			const updatePassword = await this.storage.updatePassword(enc_password, user_id);
			if (!updatePassword) {
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

			// Logging information
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
	 * @description function for refresh token
	 * @param request
	 * @param response
	 * @returns
	 */
	public refreshToken = async (
		request: { headers?; user?: IUser; authorization?: string },
		response: Response,
	): Promise<Response> => {
		try {
			let data: IError | ILoginSuccess<ILoginSuccessData>;
			const refreshToken = extractBearerToken(request.headers);
			if (refreshToken == undefined) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.REFRESH_TOKEN_REQUIRED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			// Verify the refresh token
			const decoded = jwt.verify(refreshToken, REFRESH_JWT_SECRET);

			// Check if the user still exists
			const user = await this.userStorage.get(decoded.id);
			if (!user) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const tokenReq = {
				id: user.id,
				role: user.role,
				account_id: user.account_id,
				first_name: user.first_name,
				last_name: user.last_name,
				approved_by_admin: user.approved_by_admin,
				status: user.status,
				expire: TOKEN_EXPIRATION,
				type: TokenTypeEnum.TOKEN,
			};
			// Generate Token
			const token: string = await authFun.generateToken(tokenReq);
			// Generate Token for refresh token
			tokenReq.expire = REFRESH_TOKEN_EXPIRATION;
			tokenReq.type = TokenTypeEnum.REFRESH_TOKEN;
			const refresh_token: string = await authFun.generateToken(tokenReq);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: UserEnum.TOKEN_REFRESHED,
				data: {
					token,
					refresh_token,
					user,
				},
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
			const data: IError = {
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
