import IUser from '../../utils/interfaces//IUser';
import database from '../../config/db';
import DefaultEnum, { LoggerEnum, UserEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
import { IUserListSuccess, IUsersListRequest } from './IUserService';
import { Op } from 'sequelize';
const User = database.users;
const accounts = database.accounts;
const userTransactions = database.users_transactions;
const helperFunction = new HelperFunction();
export interface IUserModel extends IUser, Document {
	id: number;
}

export default class UserStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};
	/**
	 * @description
	 * @param attributes
	 * @returns
	 */
	public async createUser(attributes: object): Promise<IUser> {
		try {
			return await User.create(attributes);
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
	/**
	 * @description query to get user data and user related data from accounts table
	 * @param userId
	 * @returns
	 */
	public async get(userId: number): Promise<IUser> {
		let user;
		try {
			user = await User.findByPk(userId, {
				include: [accounts, userTransactions], // Include the associated Account model
			});
			if (!user) {
				return null;
			}
			return user.get({ plain: true });
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
		}
	}

	public async findByAttribute(attributes: object): Promise<any> {
		try {
			const user = await User.findOne({ where: attributes });
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

	/**
	 * @description Query to update user information.
	 * @param userId
	 * @param updateInfo
	 * @returns
	 */
	public async updateAttributes(userId: number, attributes: object): Promise<IUser> {
		try {
			return await User.update(attributes, {
				where: { id: userId },
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
		}
	}
	/**
	 * @description query to check unique email.
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async findEmail(attributes: object): Promise<IUser> {
		try {
			const user = await User.findOne({ where: { ...attributes } });
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

	// Get current path of image
	public async getCurrentImage(fieldName: string, id: number): Promise<string> {
		try {
			const user = await User.findByPk(id);
			const currentImage = user.get(fieldName);
			return currentImage;
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
	// change password
	public async changePassword(password: string, id: number): Promise<boolean> {
		try {
			return await User.update({ password }, { where: { id } });
		} catch (error) {
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return false;
		}
	}

	/**
	 * @description function to find all records.
	 * @param attributes
	 * @returns
	 */
	public async findAllRecords(attributes: object): Promise<IUser> {
		try {
			const user = await User.findAll({
				where: { ...attributes },
				attributes: [
					'id',
					'account_id',
					'email_address',
					'first_name',
					'last_name',
					'status',
					'created_by',
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
	/**
	 * @description Function to get list of users.
	 * @param data
	 * @returns
	 */
	public async getAllUsers(
		data: Partial<IUsersListRequest>,
		accountId: number,
	): Promise<IUserListSuccess> {
		try {
			const filters: any = {};
			if (accountId) {
				filters.account_id = accountId;
			}
			const {
				page = 1,
				search,
				limit = 10,
				orderByColumn = UserEnum.FIRST_NAME,
				orderBy = DefaultEnum.ASCENDING,
			} = data;

			//applying searching
			if (search) {
				filters[Op.or] = [
					{ first_name: { [Op.like]: `%${search}%` } },
					{ last_name: { [Op.like]: `%${search}%` } },
				];
			}
			//applying pagination
			const offset = (page - 1) * limit;
			const { count, rows } = await User.findAndCountAll({
				limit: Number(limit),
				offset,
				order: [[orderByColumn, orderBy]],
				where: filters,
				attributes: [
					'id',
					'account_id',
					'email_address',
					'first_name',
					'last_name',
					'role',
					'status',
				],
				include: [
					{
						model: accounts,
						attributes: ['id', 'name'],
					},
				],
			});
			return { users: rows, page, perPage: limit, totalRecords: count };
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
	/**
	 * @description Function to get users dropdown.
	 * @param accountId
	 * @returns
	 */
	public async getDropdownUsersByAccountNo(accountId: number): Promise<IUser[]> {
		try {
			const query: any = {
				attributes: ['id', 'first_name', 'last_name', 'account_id'],
				order: [['first_name', 'ASC']],
				where: { status: 'Active' },
			};
			if (accountId) {
				query.where.account_id = accountId;
			}
			const users = await User.findAll(query);
			// Remove users where both first_name and last_name are null
			return users.filter((u) => !(u?.first_name == null && u?.last_name == null));
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}
}
