import CompsEnum from '../../utils/enums/CompsEnum';
import database from '../../config/db';
const ResCompAmenities = database.res_comp_amenities;
import { Op } from 'sequelize';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
const helperFunction = new HelperFunction();
export default class ResCompAmenitiesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('ResCompAmenitiesStore', ResCompAmenities);
			super('An error occurred while processing the request.');
		}
	};

	// Add/update comp Amenities
	public async addAmenities(
		instanceList: [],
		objectId: number,
		objectColumn: string = CompsEnum.RES_COMP_ID,
	) {
		const idsToKeep = [];

		if (instanceList.length > 0) {
			for (const value of instanceList) {
				const existingAdditionalAmenity = await ResCompAmenities.findOne({
					where: {
						[objectColumn]: objectId,
						additional_amenities: value,
					},
				});

				if (existingAdditionalAmenity) {
					idsToKeep.push(existingAdditionalAmenity.id);
				} else {
					const newAdditionalAmenity = await ResCompAmenities.create({
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
		objectColumn: string = CompsEnum.RES_COMP_ID,
	) {
		try {
			if (objectId) {
				// Get unused Amenities
				const instanceList = await ResCompAmenities.findAll({
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
						await ResCompAmenities.destroy({
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
