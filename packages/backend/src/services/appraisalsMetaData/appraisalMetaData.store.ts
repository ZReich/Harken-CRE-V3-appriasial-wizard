import database from '../../config/db';
import { IAppraisalMetaData } from './IAppraisalMetaDataService';
const AppraisalsMetaData = database.appraisals_metadata;
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import AppraisalsEnum, { AreaInfoEnum } from '../../utils/enums/AppraisalsEnum';
const helperFunction = new HelperFunction();

export default class AppraisalsMetaDataStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AppraisalsMetaDataStore', AppraisalsMetaData);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create appraisal metadata
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async create(attributes: object): Promise<IAppraisalMetaData> {
		try {
			return await AppraisalsMetaData.create(attributes);
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
	 * @description function to update appraisal metadata
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async update(id: number, attributes: object): Promise<boolean> {
		try {
			return await AppraisalsMetaData.update(attributes, {
				where: { id },
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new AppraisalsMetaData.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description Find appraisal metadata by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findDataByAttribute(attributes: object): Promise<IAppraisalMetaData> {
		try {
			return await AppraisalsMetaData.findOne({ where: attributes });
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
	 * @description Function to remove record by id
	 * @param id
	 * @returns
	 */
	public async removeById(id: number) {
		try {
			return await AppraisalsMetaData.destroy({
				where: { id },
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
	 * @description Function to Add, update appraisal meta
	 * @param instanceList
	 * @param objectId
	 * @param objectColumn
	 */
	public async saveAreaInfo(
		instanceList: [],
		objectId: number,
		objectColumn: string = AppraisalsEnum.APPRAISAL_ID,
	) {
		try {
			const instance = [
				AreaInfoEnum.CITY_INFO,
				AreaInfoEnum.COUNTY_INFO,
				AreaInfoEnum.PROPERTY_SUMMARY_SALES_ARROW,
				AreaInfoEnum.PROPERTY_SUMMARY_VACANCY_ARROW,
				AreaInfoEnum.PROPERTY_SUMMARY_NET_ABSORPTION_ARROW,
				AreaInfoEnum.PROPERTY_SUMMARY_CONSTRUCTION_ARROW,
				AreaInfoEnum.PROPERTY_SUMMARY_LEASE_RATES_ARROW,
			];
			for (const value of instance) {
				const existing = await AppraisalsMetaData.findOne({
					where: {
						[objectColumn]: objectId,
						name: value,
					},
				});
				if (existing) {
					// If any record found then update
					await this.update(existing.id, {
						[objectColumn]: objectId,
						name: value,
						value: instanceList[value],
					});
				} else {
					// If record not found then create
					await AppraisalsMetaData.create({
						[objectColumn]: objectId,
						name: value,
						value: instanceList[value],
					});
				}
			}
			return true;
		} catch (e) {
			console.log(e);
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
	 * @description Function to get area info by appraisal id.
	 * @param attributes
	 * @returns
	 */
	public async getAreaInfo(attributes: object): Promise<IAppraisalMetaData[]> {
		try {
			return await AppraisalsMetaData.findAll({ where: attributes });
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
