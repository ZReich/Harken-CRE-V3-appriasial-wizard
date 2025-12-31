import database from '../../config/db';
const EvaluationIncludeUtility = database.evaluation_included_utilities;
import { Op } from 'sequelize';
import { EvaluationsEnum } from '../../utils/enums/EvaluationsEnum';

export default class EvaluationIncludeUtilityStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationIncludeUtilityStore', EvaluationIncludeUtility);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to Add, update Evaluation utilities
	 * @param instanceList
	 * @param objectId
	 * @param objectColumn
	 */
	public async addUtilities(
		instanceList: [],
		objectId: number,
		objectColumn: string = EvaluationsEnum.EVALUATION_ID,
	) {
		const idsToKeep = [];

		if (instanceList.length > 0) {
			for (const value of instanceList) {
				const existingUtility = await EvaluationIncludeUtility.findOne({
					where: {
						[objectColumn]: objectId,
						utility: value,
					},
				});

				if (existingUtility) {
					idsToKeep.push(existingUtility.id);
				} else {
					const newUtility = await EvaluationIncludeUtility.create({
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
		objectColumn: string = EvaluationsEnum.EVALUATION_ID,
	) {
		try {
			if (objectId) {
				// Get unused uitilities
				const instanceList = await EvaluationIncludeUtility.findAll({
					attributes: ['id'],
					where: {
						[objectColumn]: objectId,
						id: {
							[Op.notIn]: idsToKeep,
						},
					},
					raw: true,
				});

				// Remove unused uitilities
				if (instanceList && instanceList.length > 0) {
					for (const instance of instanceList) {
						await EvaluationIncludeUtility.destroy({
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
