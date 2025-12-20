import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { ISnippetsCategory } from './ISnippetsCategoryService';
import { literal, where } from 'sequelize';
const SnippetsCategory = database.snippets_category;
const Snippets = database.snippets;
const helperFunction = new HelperFunction();
export default class SnippetsCategoryStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to save snippets category
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: ISnippetsCategory): Promise<ISnippetsCategory> {
		try {
			return await SnippetsCategory.create(attributes);
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
	 * @description function to update snippets category
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<ISnippetsCategory>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await SnippetsCategory.update(rest, {
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
	 * @description Query to delete snippets category
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ISnippetsCategory>): Promise<boolean> {
		try {
			return await SnippetsCategory.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description Function to find snippets category.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ISnippetsCategory>): Promise<ISnippetsCategory> {
		try {
			const whereClause: any = {};

			for (const key in attributes) {
				const value = attributes[key];
				if (typeof value === 'string') {
					// Use binary comparison for string fields (case-sensitive)
					whereClause[key] = where(
						literal(`BINARY \`${key}\``), // enforce case sensitivity
						value,
					);
				} else {
					// Keep non-string values as is
					whereClause[key] = value;
				}
			}
			return await SnippetsCategory.findOne({
				where: whereClause,
				attributes: ['id', 'account_id', 'category_name', 'created_by'],
				include: [{ model: Snippets, attributes: ['id', 'snippet', 'name'] }],
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
	 * @description Function to get list of all snippets category on the basis of account_id.
	 * @returns
	 */
	public async findAll(account_id: number): Promise<ISnippetsCategory[]> {
		try {
			const orderBy = 'asc';
			const orderByColumn = 'category_name';
			return await SnippetsCategory.findAll({
				attributes: ['id', 'category_name', 'account_id'],
				include: [{ model: Snippets, attributes: ['id', 'snippet', 'name'] }],
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
