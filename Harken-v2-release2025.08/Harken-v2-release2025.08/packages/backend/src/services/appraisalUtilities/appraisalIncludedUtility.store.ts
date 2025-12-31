import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import database from '../../config/db';
const AppraisalIncludeUtility = database.appraisals_included_utilities;
import { Op } from 'sequelize';

export default class AppraisalIncludeUtilityStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AppraisalIncludeUtilityStore', AppraisalIncludeUtility);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to Add, update appraisal utilities
	 * @param instanceList
	 * @param objectId
	 * @param objectColumn
	 */
	public async addUtilities(
		instanceList: [],
		objectId: number,
		objectColumn: string = AppraisalsEnum.APPRAISAL_ID,
	) {
		const idsToKeep = [];

		if (instanceList.length > 0) {
			for (const value of instanceList) {
				const existingUtility = await AppraisalIncludeUtility.findOne({
					where: {
						[objectColumn]: objectId,
						utility: value,
					},
				});

				if (existingUtility) {
					idsToKeep.push(existingUtility.id);
				} else {
					const newUtility = await AppraisalIncludeUtility.create({
						[objectColumn]: objectId,
						utility: value,
					});

					idsToKeep.push(newUtility.id);
				}
			}
		}
		await this.removeUnusedAssociations(idsToKeep, objectId, objectColumn);
	}

	/**
	 * @description Function to Remove unused utilities
	 * @param idsToKeep
	 * @param objectId
	 * @param objectColumn
	 * @returns
	 */
	public async removeUnusedAssociations(
		idsToKeep,
		objectId: number,
		objectColumn: string = AppraisalsEnum.APPRAISAL_ID,
	) {
		try {
			if (objectId) {
				// Get unused uitilities
				const instanceList = await AppraisalIncludeUtility.findAll({
					attributes: ['id'],
					where: {
						[objectColumn]: objectId,
						id: {
							[Op.notIn]: idsToKeep,
						},
					},
				});

				// Remove unused uitilities
				if (instanceList && instanceList.length > 0) {
					for (const instance of instanceList) {
						await AppraisalIncludeUtility.destroy({
							where: {
								id: instance.id,
							},
						});
					}
				}
			}
			return true;
		} catch (err) {
			return false;
		}
	}
}
