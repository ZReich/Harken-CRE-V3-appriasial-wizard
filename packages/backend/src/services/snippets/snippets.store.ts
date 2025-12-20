import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { ISnippet } from './ISnippetsService';
const Snippets = database.snippets;
const helperFunction = new HelperFunction();
export default class SnippetStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to save text snippets
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: ISnippet): Promise<ISnippet> {
		try {
			return await Snippets.create(attributes);
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
	 * @description function to update snippets
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<ISnippet>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await Snippets.update(rest, {
				where: {
					id,
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
			return false;
		}
	}

	/**
	 * @description Query to delete snippets
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ISnippet>): Promise<boolean> {
		try {
			return await Snippets.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description Function to find snippets
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ISnippet>): Promise<ISnippet> {
		try {
			return await Snippets.findOne({ where: attributes });
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
	 * @description Function to get list of all snippets on the basis of account_id.
	 * @returns
	 */
	public async findAll(account_id: number): Promise<ISnippet[]> {
		try {
			const orderBy = 'asc';
			const orderByColumn = 'name';
			return await Snippets.findAll({
				attributes: ['id', 'name', 'snippet'],
				where: { account_id },
				order: [[orderByColumn, orderBy]],
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
}
