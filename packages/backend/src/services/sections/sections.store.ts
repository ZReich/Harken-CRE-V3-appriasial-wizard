import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { ISection } from './ISectionsService';
const Section = database.sections;
const helperFunction = new HelperFunction();
export default class SectionStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create section
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: ISection): Promise<ISection> {
		try {
			return await Section.create(attributes);
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
	 * @description function to update section
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<ISection>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await Section.update(rest, {
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
	 * @description Query to delete section.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ISection>): Promise<boolean> {
		try {
			return await Section.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description Function to find section.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ISection>): Promise<ISection> {
		try {
			return await Section.findOne({ where: attributes });
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
