import CompsEnum from '../../utils/enums/CompsEnum';
import database from '../../config/db';
const CompIncludeUtility = database.comps_included_utilities;
import { Op } from 'sequelize';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
const helperFunction = new HelperFunction();
export default class CompIncludeUtilityStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('CompIncludeUtilityStore', CompIncludeUtility);
			super('An error occurred while processing the request.');
		}
	};

	// Add/update comp utilities
	public async addUtilities(
		instanceList: [],
		objectId: number,
		objectColumn: string = CompsEnum.COMP_ID,
	) {
		const idsToKeep = [];

		if (instanceList.length > 0) {
			for (const value of instanceList) {
				const existingUtility = await CompIncludeUtility.findOne({
					where: {
						[objectColumn]: objectId,
						utility: value,
					},
				});

				if (existingUtility) {
					idsToKeep.push(existingUtility.id);
				} else {
					if(value){
						const newUtility = await CompIncludeUtility.create({
							[objectColumn]: objectId,
							utility: value,
						});
	
						idsToKeep.push(newUtility.id);
					}
				}
			}
		}

		await this.removeUnusedAssociations(idsToKeep, objectId, objectColumn);
	}

	// Remove unused utilities
	public async removeUnusedAssociations(
		idsToKeep,
		objectId: number,
		objectColumn: string = CompsEnum.COMP_ID,
	) {
		try {
			if (objectId) {
				// Get unused uitilities
				const instanceList = await CompIncludeUtility.findAll({
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
						await CompIncludeUtility.destroy({
							where: {
								id: instance.id,
							},
						});
					}
				}
			}
			return true;
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
}
