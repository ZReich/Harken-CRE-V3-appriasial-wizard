import { FORGOT_JWT_SECRET, JWT_SECRET, REFRESH_JWT_SECRET } from '../../env';

import ITokenDetails from '../../services/auth/IAuthService';
import TokenTypeEnum from '../enums/TokenTypeEnum';

export default class AuthFunctions {
	public bcrypt;
	public jwt;

	constructor(bcrypt: string = '', jwt: string = '') {
		this.bcrypt = bcrypt;
		this.jwt = jwt;
	}

	/**
	 * @description function to compare password
	 * @param password
	 * @param userPassword
	 * @returns
	 */
	async comparePassword(password: string, userPassword: string) {
		try {
			const matchPassword: boolean = await this.bcrypt.compare(
				password,
				userPassword.replace(/^\$2y/, '$2a'),
			);
			return matchPassword;
		} catch (e) {
			console.log(e);
			throw e;
		}
	}

	/**
	 * @description Function to generate new token
	 * @param id
	 * @param role
	 * @param account_id
	 * @param expire
	 * @returns
	 */
	async generateToken(data: Partial<ITokenDetails>) {
		try {
			const { expire, type } = data;
			let secret: string = JWT_SECRET;
			if (type === TokenTypeEnum.REFRESH_TOKEN) {
				secret = REFRESH_JWT_SECRET;
			} else if (type === TokenTypeEnum.FORGOTTEN_PASSWORD) {
				secret = FORGOT_JWT_SECRET;
			}
			const token: string = await this.jwt.sign(data, secret, {
				expiresIn: expire,
			});
			return token;
		} catch (e) {
			console.log(e);
			throw e;
		}
	}

	/**
	 * @description Function to hash the password
	 * @param password
	 * @returns
	 */
	async hashPassword(password: string) {
		const hashPw: string = await this.bcrypt.hash(password, 1);
		return hashPw;
	}
}
