import database from '../../config/db';
const PropertyUnits = database.property_units;
import { Op } from 'sequelize';
import IPropertyUnits from './IPropertyUnits';
import CompsEnum from '../../utils/enums/CompsEnum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
const helperFunction = new HelperFunction();
export default class PropertyUnitsStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('PropertyUnitsStore', PropertyUnits);
			super('An error occurred while processing the request.');
		}
	};

	// Add properties
	public async addPropertyUnits(
		instanceList: IPropertyUnits[],
		objectId: number,
		objectColumn: string = CompsEnum.COMP_ID,
	) {
		try {
			const idsToKeep = [];

			if (instanceList.length > 0) {
				for (const data of instanceList) {
					// Assign objectId to objectColumn
					data[objectColumn] = objectId;

					try {
						let instance;

						// Check if instance with the same ID exists
						if (data.id) {
							instance = await PropertyUnits.findByPk(data.id);

							if (instance) {
								// Update existing instance
								await instance.update(data);
								idsToKeep.push(instance.id);
							}
						}

						// If instance does not exist or ID is not provided, create new instance
						if (!instance) {
							instance = await PropertyUnits.create(data);
							idsToKeep.push(instance.id);
						}
					} catch (error) {
						//logging error
						helperFunction.log({
							message: error.message,
							location: await helperFunction.removeSubstring(__dirname, __filename),
							level: LoggerEnum.ERROR,
							error: error,
						});
						return Promise.reject(error.message || error);
					}
				}
			}
			// Remove extra linked properties
			await this.removeUnusedAssociations(idsToKeep, objectId, objectColumn);
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

	// Remove extra linked properties
	public async removeUnusedAssociations(
		idsToKeep,
		objectId: number,
		objectColumn: string = CompsEnum.COMP_ID,
	) {
		try {
			// Get unused properties
			const instances = await PropertyUnits.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: idsToKeep,
					},
				},
			});
			// Delete unused properties
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
			return e.message || e;
		}
	}
	/**
	 * @description Function to get list of property units.
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IPropertyUnits>): Promise<IPropertyUnits[]> {
		try {
			return await PropertyUnits.findAll({ where: attributes });
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
	 * @description Function delete property units.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<IPropertyUnits>): Promise<IPropertyUnits> {
		try {
			return await PropertyUnits.destroy({ where: attributes });
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
