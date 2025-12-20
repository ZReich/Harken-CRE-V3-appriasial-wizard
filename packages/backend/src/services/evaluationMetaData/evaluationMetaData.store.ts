import database from '../../config/db';
const EvaluationMetaData = database.evaluations_metadata;
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { AreaInfoEnum } from '../../utils/enums/AppraisalsEnum';
import { IEvaluationMetaData } from './IEvaluationMetaDataService';
import { EvalMessageEnum } from '../../utils/enums/MessageEnum';
const helperFunction = new HelperFunction();

export default class EvaluationMetaDataStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationMetaDataStore', EvaluationMetaData);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create evaluation metadata
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async create(attributes: object): Promise<IEvaluationMetaData> {
		try {
			return await EvaluationMetaData.create(attributes);
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
	 * @description function to update evaluation metadata
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async update(id: number, attributes: object): Promise<boolean> {
		try {
			return await EvaluationMetaData.update(attributes, {
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
			return Promise.reject(new EvaluationMetaData.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description Find evaluation metadata by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findDataByAttribute(attributes: object): Promise<IEvaluationMetaData> {
		try {
			return await EvaluationMetaData.findOne({ where: attributes });
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
			return await EvaluationMetaData.destroy({
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
	 * @description Function to Add, update evaluation meta
	 * @param instanceList
	 * @param objectId
	 * @param objectColumn
	 */
	public async saveAreaInfo(
		instanceList: [],
		objectId: number,
		objectColumn: string = EvalMessageEnum.EVALUATION_ID,
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
				const existing = await EvaluationMetaData.findOne({
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
					await EvaluationMetaData.create({
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
	 * @description Function to get area info by evaluation id.
	 * @param attributes
	 * @returns
	 */
	public async getAreaInfo(attributes: object): Promise<IEvaluationMetaData[]> {
		try {
			return await EvaluationMetaData.findAll({ where: attributes, raw: true });
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
