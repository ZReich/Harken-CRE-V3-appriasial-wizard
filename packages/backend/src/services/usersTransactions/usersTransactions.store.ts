import IUsersTransactions from '../../utils/interfaces/IUsersTransactions';
import database from '../../config/db';
import { Op } from 'sequelize';
import { LoggerEnum, UserEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
const usersTransactions = database.users_transactions;
const helperFunction = new HelperFunction();
export default class UsersTransactionStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('UsersTransactionsStore', usersTransactions);
			super('An error occurred while processing the request.');
		}
	};
	/**
	 * @description query to create user transaction
	 * @param attributes
	 * @returns
	 */
	public async createTransaction(attributes: IUsersTransactions): Promise<IUsersTransactions> {
		try {
			return await usersTransactions.create(attributes);
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
	 * @description query to find user transaction
	 * @param attributes
	 * @returns
	 */
	public async find(id: number): Promise<IUsersTransactions> {
		try {
			return await usersTransactions.findOne({
				where: {
					id: id,
				},
			});
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
	 * @description query to update user transaction
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(
		id: number,
		attributes: Partial<IUsersTransactions>,
	): Promise<IUsersTransactions> {
		let transactions;
		try {
			transactions = await usersTransactions.update(attributes, {
				where: { id: id },
			});
			return transactions;
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new UsersTransactionStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description Function to remove unused user transactions
	 * @param keepTransactionId
	 * @param objectId
	 * @param objectColumn
	 * @returns
	 */
	public async removeUnusedTransactions(
		keepTransactionId: number[],
		objectId: number,
		objectColumn = UserEnum.USER_ID,
	): Promise<boolean> {
		try {
			const instances = await usersTransactions.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: keepTransactionId,
					},
				},
			});

			if (instances && instances.length > 0) {
				for (const instance of instances) {
					await instance.destroy();
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
			return false;
		}
	}
}
