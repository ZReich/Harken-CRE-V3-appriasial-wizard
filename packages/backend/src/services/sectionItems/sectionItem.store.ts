import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { ISectionItem } from './ISectionItemsService';
const SectionItem = database.section_item;
const helperFunction = new HelperFunction();
export default class SectionItemStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to save section item
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: ISectionItem): Promise<ISectionItem> {
		try {
			return await SectionItem.create(attributes);
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
	 * @description function to update section item
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<ISectionItem>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await SectionItem.update(rest, {
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
	 * @description Query to delete section item.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ISectionItem>): Promise<boolean> {
		try {
			return await SectionItem.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description Function to find section item.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ISectionItem>): Promise<ISectionItem> {
		try {
			return await SectionItem.findOne({ where: attributes });
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
