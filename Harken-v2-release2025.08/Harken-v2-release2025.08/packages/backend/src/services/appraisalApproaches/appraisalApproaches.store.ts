import database from '../../config/db';
const AppraisalApproaches = database.appraisal_approaches;
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { Op } from 'sequelize';
import HelperFunction from '../../utils/common/helper';
import { IAppraisalApproach } from './IAppraisalApproachesService';

const helperFunction = new HelperFunction();
export default class AppraisalApproachStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AppraisalApproachStore', AppraisalApproachStore);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find approach by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findAppraisalApproaches(
		attributes: Partial<IAppraisalApproach>,
	): Promise<IAppraisalApproach> {
		try {
			return await AppraisalApproaches.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to add new approach to appraisal_approaches table.
	 * @param attributes
	 * @returns
	 */
	public async createAppraisalApproaches(
		attributes: IAppraisalApproach,
	): Promise<IAppraisalApproach> {
		try {
			return await AppraisalApproaches.create(attributes);
		} catch (e) {
			console.log(e);
			return e.message || e;
		}
	}

	/**
	 * @description Function to update any approach details in appraisal_approaches table.
	 * @param attributes
	 * @returns
	 */
	public async updateAppraisalApproaches(
		id: number,
		attributes: Partial<IAppraisalApproach>,
	): Promise<IAppraisalApproach> {
		try {
			return await AppraisalApproaches.update(attributes, {
				where: {
					id: id,
				},
			});
		} catch (e) {
			console.log(e);
			return e.message || e;
		}
	}

	/**
	 * @description function to remove unused appraisal approaches.
	 * @param keepApproachId
	 * @param objectId
	 * @returns
	 */
	public async removeAppraisalApproaches(
		keepApproachId: number[],
		objectId: number,
	): Promise<boolean> {
		try {
			const objectColumn = AppraisalsEnum.APPRAISAL_ID;
			const instances = await AppraisalApproaches.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: keepApproachId,
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

	/**
	 * @description Find selected approaches
	 * @param attributes
	 * @returns
	 */
	public async findSelectedApproaches(
		attributes: Partial<IAppraisalApproach>,
	): Promise<IAppraisalApproach[]> {
		try {
			return await AppraisalApproaches.findAll({ where: attributes, raw: true });
		} catch (e) {
			return e.message || e;
		}
	}
}
