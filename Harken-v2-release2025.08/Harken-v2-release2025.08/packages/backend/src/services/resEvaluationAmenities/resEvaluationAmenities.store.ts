import database from '../../config/db';
const ResEvalAmenities = database.res_evaluation_amenities;
import { Op } from 'sequelize';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { ResEvaluationsEnum } from '../../utils/enums/ResEvaluationsEnum';
const helperFunction = new HelperFunction();
export default class ResCompAmenitiesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('ResEvalAmenitiesStore', ResEvalAmenities);
			super('An error occurred while processing the request.');
		}
	};

	// Add/update comp Amenities
	public async addAmenities(
		instanceList: [],
		objectId: number,
		objectColumn: string = ResEvaluationsEnum.EVALUATION_ID,
	) {
		const idsToKeep = [];

		if (instanceList.length > 0) {
			for (const value of instanceList) {
				const existingAdditionalAmenity = await ResEvalAmenities.findOne({
					where: {
						[objectColumn]: objectId,
						additional_amenities: value,
					},
				});

				if (existingAdditionalAmenity) {
					idsToKeep.push(existingAdditionalAmenity.id);
				} else {
					const newAdditionalAmenity = await ResEvalAmenities.create({
						[objectColumn]: objectId,
						additional_amenities: value,
					});

					idsToKeep.push(newAdditionalAmenity.id);
				}
			}
		}

		await this.removeUnusedAssociations(idsToKeep, objectId, objectColumn);
	}

	// Remove unused Amenities
	public async removeUnusedAssociations(
		idsToKeep,
		objectId: number,
		objectColumn: string = ResEvaluationsEnum.EVALUATION_ID,
	) {
		try {
			if (objectId) {
				// Get unused Amenities
				const instanceList = await ResEvalAmenities.findAll({
					attributes: ['id'],
					where: {
						[objectColumn]: objectId,
						id: {
							[Op.notIn]: idsToKeep,
						},
					},
				});

				// Remove unused Amenities
				if (instanceList && instanceList.length > 0) {
					for (const instance of instanceList) {
						await ResEvalAmenities.destroy({
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
