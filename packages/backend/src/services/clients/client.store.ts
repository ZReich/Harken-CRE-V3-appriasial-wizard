import {
	IClient,
	IClientCreateRequest,
	IClientsListRequest,
	IGetClientListSuccess,
} from './IClientService';
import database from '../../config/db';
import DefaultEnum, { LoggerEnum, UserEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
import { Op } from 'sequelize';
const Client = database.clients;
const helperFunction = new HelperFunction();

export default class ClientStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('ClientStore', Client);
			super('An error occured while processing the request.');
		}
	};

	// Create Client
	public async createClient(attributes: IClientCreateRequest): Promise<IClient> {
		try {
			return await Client.create(attributes);
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

	// Get list of clients
	public async getByAttribute(attributes: object): Promise<IClient[]> {
		try {
			// If attribute is not empty then apply where condition
			if (Object.keys(attributes).length !== 0) {
				return await Client.findAll({
					where: attributes,
					order: [['first_name', 'ASC']], // Order by first_name column in ascending order
				});
			} else {
				return await Client.findAll({
					order: [['first_name', 'ASC']], // Order by first_name column in ascending order
				});
			}
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

	// Update client
	public async update(clientId: number, attributes: object): Promise<boolean> {
		try {
			return await Client.update(attributes, {
				where: { id: clientId },
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new ClientStore.OPERATION_UNSUCCESSFUL());
		}
	}

	// Delete client
	public async delete(clientId: number): Promise<IClient> {
		try {
			return await Client.destroy({
				where: { id: clientId },
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new ClientStore.OPERATION_UNSUCCESSFUL());
		}
	}
	/**
	 * @description get client by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<IClient>): Promise<IClient> {
		try {
			const client = await Client.findOne({ where: attributes });
			return client;
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			throw new Error(e.message || e);
		}
	}
	/**
	 * @description Function to get all clients list.
	 * @param data
	 * @returns
	 */
	public async getAllClients(
		attributes: Partial<IClientsListRequest>,
		accountId: number,
		userId: number,
	): Promise<IGetClientListSuccess> {
		try {
			const filters: any = {};
			if (accountId) {
				filters.account_id = accountId;
			}
			if (userId) {
				filters.user_id = userId;
			}
			const {
				page = 1,
				search,
				limit = 10,
				orderByColumn = UserEnum.FIRST_NAME,
				orderBy = DefaultEnum.ASCENDING,
			} = attributes;
			//applying pagination
			const offset = (page - 1) * limit;

			//applying searching
			if (search) {
				filters[Op.or] = [
					{ first_name: { [Op.like]: `%${search}%` } },
					{ last_name: { [Op.like]: `%${search}%` } },
					{ company: { [Op.like]: `%${search}%` } },
				];
			}
			const { count, rows } = await Client.findAndCountAll({
				limit: Number(limit),
				offset: offset,
				order: [[orderByColumn, orderBy]],
				where: filters,
				attributes: ['id', 'account_id', 'user_id', 'first_name', 'last_name', 'company'],
			});
			return { clients: rows, page, perPage: limit, totalRecords: count };
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
