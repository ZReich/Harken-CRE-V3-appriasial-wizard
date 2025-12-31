import database from '../../config/db';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';

const CoreLogic = database.corelogic;
const helperFunction = new HelperFunction();

export default class CoreLogicStore {
	/**
	 * @description Get CoreLogic data from the database
	 * @param property_id The property ID
	 * @returns Promise<any>
	 */
	public async getCoreLogicData(property_id: number): Promise<any> {
		try {
			return await CoreLogic.findOne({
				where: { property_id },
				attributes: [
					'property_detail',
					'building_detail',
					'site_location',
					'tax_assessments',
					'ownership',
					'ownership_transfer',
					'transaction_history'
				],
			});
		} catch (error) {
			helperFunction.log({
				message: `Failed to get CoreLogic data: ${error.message}`,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return null;
		}
	}

	/**
	 * @description Store CoreLogic API response data in the database
	 * @param property_id The property ID (foreign key)
	 * @param apiResponses Object containing all 8 API responses
	 * @returns Promise<any>
	 */
	public async storeCoreLogicData(property_id: number, apiResponses: any): Promise<any> {
		try {
			return await CoreLogic.create({
				property_id: property_id,
				property_detail: apiResponses.propertyData ? JSON.stringify(apiResponses.propertyData) : null,
				building_detail: apiResponses.buildingData ? JSON.stringify(apiResponses.buildingData) : null,
				site_location: apiResponses.siteLocationData ? JSON.stringify(apiResponses.siteLocationData) : null,
				tax_assessments: apiResponses.taxAssessmentsData ? JSON.stringify(apiResponses.taxAssessmentsData) : null,
				ownership: apiResponses.ownershipData ? JSON.stringify(apiResponses.ownershipData) : null,
				ownership_transfer: apiResponses.ownershipTransferData ? JSON.stringify(apiResponses.ownershipTransferData) : null,
				transaction_history: apiResponses.transactionHistoryData ? JSON.stringify(apiResponses.transactionHistoryData) : null,
			});
		} catch (error) {
			helperFunction.log({
				message: `Failed to store CoreLogic data: ${error.message}`,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return error.message || error;
		}
	}
}
