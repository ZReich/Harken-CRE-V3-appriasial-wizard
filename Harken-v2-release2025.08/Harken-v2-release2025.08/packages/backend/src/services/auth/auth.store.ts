import IUser from '../../utils/interfaces/IUser';
import database from '../../config/db';
const User = database.users;
const Token = database.tokens;
const Accounts = database.accounts;
// import * as crypto from 'crypto';
import TokenTypeEnum from '../../utils/enums/TokenTypeEnum';
import StatusEnum from '../../utils/enums/StatusEnum';
import { IAuth } from './IAuthService';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
import AuthFunctions from '../../utils/common/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { FORGOT_TOKEN_EXPIRATION } from '../../env';
const helperFunction = new HelperFunction();
const authFun = new AuthFunctions(bcrypt, jwt);
export default class AuthStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AuthStore', User);
			super('An error occured while processing the request.');
		}
	};

	public async findByAttribute(attributes: IAuth): Promise<IUser> {
		try {
			const user: IUser = await User.findOne({
				where: attributes,
				include: [
					{
						model: Accounts,
					},
				],
			});
			return user;
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
	}

	public async insertToken(user_id: number, type): Promise<string> {
		try {
			const tokenReq = {
				id: user_id,
				type,
				expire: FORGOT_TOKEN_EXPIRATION,
			};
			// Generate a random token
			const token = await authFun.generateToken(tokenReq);
			const data = {
				token,
				type,
				user_id,
			};
			// Create Token
			await Token.create(data);
			// Return the generated token appended with the user_id
			return token;
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
	}

	public async isTokenValid(token, type) {
		try {
			const tkn = token.substring(0, 30);
			const uid = token.substring(30);

			const queryResult = await Token.findOne({
				where: {
					token: tkn,
					user_id: uid,
				},
			});

			if (queryResult) {
				if (queryResult.type !== type) {
					return false;
				}

				const created = new Date(queryResult.created);
				const strip = created.toISOString().slice(0, 10);

				const today = new Date();
				const strip2 = today.toISOString().slice(0, 10);

				if (type === TokenTypeEnum.FORGOTTEN_PASSWORD) {
					if (strip !== strip2) {
						return false;
					}
				}

				// Assuming getUserInfo is defined somewhere
				const userInfo = await User.findOne({ where: { id: queryResult.user_id } });
				return userInfo;
			} else {
				return false;
			}
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			console.error('Error occurred while checking token validity:', e);
			return false;
		}
	}

	public async updatePassword(password, userId) {
		try {
			const [affectedRows] = await User.update(
				{ password, status: StatusEnum.ACTIVE },
				{ where: { id: userId } },
			);

			if (affectedRows === 0) {
				return false; // No rows were updated
			}

			return true; // Update successful
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false; // Update failed
		}
	}

	/**
	 * @description Function to validate token for forgot password.
	 * @param tokenData
	 * @returns
	 */
	public async validateToken(tokenData) {
		try {
			const { user_id, token, type } = tokenData;

			const queryResult = await Token.findOne({
				where: {
					token,
					user_id,
				},
			});

			if (queryResult) {
				if (queryResult?.type !== type) {
					return false;
				}

				const created = new Date(queryResult.created);
				const strip = created.toISOString().slice(0, 10);

				const today = new Date();
				const strip2 = today.toISOString().slice(0, 10);

				if (type === TokenTypeEnum.FORGOTTEN_PASSWORD) {
					if (strip !== strip2) {
						return false;
					}
				}

				// Assuming getUserInfo is defined somewhere
				const userInfo = await User.findOne({ where: { id: queryResult.user_id } });
				return userInfo;
			} else {
				return false;
			}
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			console.error('Error occurred while checking token validity:', e);
			return false;
		}
	}
}
