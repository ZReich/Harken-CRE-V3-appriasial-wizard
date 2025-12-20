import database from '../../config/db';
import { Op, Sequelize } from 'sequelize';
import IAccount, {
	IAccountListSuccessData,
	IAccountSuccessData,
	IAccountsRequest,
} from './IAccountsService';
import AccountEnum from '../../utils/enums/Accounts.Enum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
const Accounts = database.accounts;
const helperFunction = new HelperFunction();
import UserStore from '../user/user.store';

export default class AccountsStore {
	private userStorage = new UserStore();
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AccountsStore', Accounts);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description
	 * @param attributes
	 * @returns
	 */
	public async findAllAccounts(): Promise<IAccountSuccessData> {
		try {
			const allAccounts = await Accounts.findAll({
				where: { is_deleted: 0 },
				attributes: ['id', 'name', 'created'],
			});
			return { accounts: allAccounts, totalRecords: allAccounts.length };
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
	 * @description find account by attribute
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<IAccount>): Promise<IAccount> {
		try {
			const account = await Accounts.findOne({ where: attributes });
			return account;
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
	 * @description Function to update account
	 * @param attributes
	 * @param id
	 * @returns
	 */
	public async updateDetails(attributes: Partial<IAccount>, id: number): Promise<boolean> {
		try {
			const account = await Accounts.update(attributes, { where: { id: id } });
			return account;
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
	 * @description function to find all linked users and comps for a single account
	 * @param attributes
	 * @returns
	 */
	public async findAccountsDetail(
		data: Partial<IAccountsRequest>,
	): Promise<IAccountListSuccessData> {
		try {
			const filters: any = { is_deleted: 0 };

			const { page = 1, search, limit } = data;
			let { orderByColumn, orderBy } = data;
			//Applying pagination
			const offset = (page - 1) * limit;

			if (search) {
				filters.name = { [Op.like]: `%${search}%` };
			}
			if (!orderByColumn) {
				orderByColumn = AccountEnum.NAME;
			}
			if (!orderBy) {
				orderBy = 'asc';
			}
			const { count, rows } = await Accounts.findAndCountAll({
				limit: Number(limit),
				offset: offset,
				order: [[orderByColumn, orderBy]],
				where: filters,
				attributes: [
					'id',
					'name',
					'created',
					'subscription',
					[
						Sequelize.literal('(SELECT COUNT(id) FROM comps WHERE account_id=accounts.id)'),
						'comps',
					],
					[
						Sequelize.literal('(SELECT COUNT(id) FROM users WHERE account_id=accounts.id)'),
						'users',
					],
				],
				group: ['accounts.id'], // Group by account id
			});
			return { accounts: rows, page, perPage: limit, totalRecords: count.length };
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
	 * @description Function to create create account
	 * @param attributes
	 * @returns
	 */
	public async createAccount(attributes: Partial<IAccount>): Promise<IAccount> {
		try {
			const account = await Accounts.create({ ...attributes });
			return account;
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
}
