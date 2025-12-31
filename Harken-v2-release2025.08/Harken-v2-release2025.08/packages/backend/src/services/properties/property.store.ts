import database from '../../config/db';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';

const Properties = database.properties;
const helperFunction = new HelperFunction();

export default class PropertyStore {
	/**
	 * @description Find property by attributes
	 * @param attributes The attributes to search for
	 * @returns Promise<any>
	 */
	public async findProperty(attributes: object): Promise<any> {
		try {
			return await Properties.findOne({
				where: attributes,
				attributes: ['id', 'corelogic_ts'],
			});
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

	/**
	 * @description Create new property record
	 * @param propertyData The property data to save
	 * @returns Promise<any>
	 */
	public async createProperty(propertyData: any): Promise<any> {
		try {
			return await Properties.create({
				...propertyData,
				corelogic_ts: new Date(),
			});
		} catch (error) {
			helperFunction.log({
				message: `Failed to create property: ${error.message}`,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return null;
		}
	}

	/**
	 * @description Update corelogic_ts timestamp in properties table
	 * @param property_id The property ID
	 * @returns Promise<any>
	 */
	public async updateCoreLogicTimestamp(property_id: number): Promise<any> {
		try {
			return await Properties.update(
				{ corelogic_ts: new Date() },
				{ where: { id: property_id } }
			);
		} catch (error) {
			helperFunction.log({
				message: `Failed to update corelogic_ts: ${error.message}`,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return null;
		}
	}
}
