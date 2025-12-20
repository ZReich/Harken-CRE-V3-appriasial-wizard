import database from '../../config/db';
const Zoning = database.zoning;
import IZoning from '../../utils/interfaces/IZoning';
import { Op } from 'sequelize';
import CompsEnum from '../../utils/enums/CompsEnum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
const helperFunction = new HelperFunction();
export default class ZoningStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('ZoningStore', Zoning);
			super('An error occurred while processing the request.');
		}
	};

	public async addAssociation(
		instanceList: IZoning[],
		objectId: number,
		objectColumn: string = CompsEnum.COMP_ID,
	): Promise<void> {
		try {
			const idsToKeep: number[] = [];

			if (instanceList.length) {
				for (const data of instanceList) {
					data[objectColumn] = objectId;
					let instance;

					// Check if instance with the same ID exists
					if (data.id) {
						instance = await Zoning.findByPk(data.id);

						if (instance) {
							// Update existing instance
							await instance.update(data);
							idsToKeep.push(instance.id);
						}
						data.id;
					}

					// If instance does not exist or ID is not provided, create new instance
					if (!instance && !data.id) {
						instance = await Zoning.create(data);

						idsToKeep.push(instance.id);
					}
				}
			}
			await this.removeUnusedAssociation(idsToKeep, objectId, objectColumn);
		} catch (e) {
			console.error(`Error while add association: ${e}`);
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

	public async removeUnusedAssociation(
		idsToKeep: number[],
		objectId: number,
		objectColumn: string = CompsEnum.COMP_ID,
	): Promise<boolean> {
		try {
			const instances = await Zoning.findAll({
				attributes: ['id'],
				where: {
					[objectColumn]: objectId,
					id: {
						[Op.notIn]: idsToKeep,
					},
				},
			});

			if (instances && instances.length > 0) {
				for (const instance of instances) {
					await instance.destroy();
				}
			}
		} catch (e) {
			console.error(`Error removing unused association: ${e}`);
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
	 * @description Function to find zone by attribute
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<IZoning>): Promise<IZoning> {
		try {
			return await Zoning.findOne({ where: attributes });
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
	 * @description Function to find zone.
	 * @param attributes
	 * @returns
	 */
	public async findByPk(id: number): Promise<IZoning> {
		try {
			return await Zoning.findByPk(id);
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
	 * @description Function to find all zoning list
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IZoning>): Promise<IZoning[]> {
		try {
			return await Zoning.findAll({ where: attributes });
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
	 * @description Function to delete zoning
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<IZoning>): Promise<IZoning> {
		try {
			return await Zoning.destroy({ where: attributes });
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
