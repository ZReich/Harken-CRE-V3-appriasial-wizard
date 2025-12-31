import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const Properties = database.properties;
import { Sequelize, Op } from 'sequelize';
import HelperFunction from '../../utils/common/helper';
const helperFunction = new HelperFunction();
export default class PropertiesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('PropertiesStore', Properties);
			super('An error occured while processing the request.');
		}
	};

	// Retrive master property by addree if not find then create new property
	public async retrieve(address, coordinates) {
		try {
			let result = false;
			// Check address is valid or not
			if (await this.isValid(address, coordinates)) {
				// Search properties by address
				const properties = await this.searchProperties(address);
				if (properties.length) {
					// Get exact property id from properties
					result = await this.explore(properties, address);
				}
				if (result) {
					return result;
				} else {
					// Create new master property
					return await this.newMasterProperty(address, coordinates);
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

	// Check address has all parameters or not
	public async isValid(address, coordinates) {
		try {
			if (
				address &&
				coordinates &&
				address.street_address &&
				address.city &&
				address.state &&
				address.zipcode &&
				coordinates.lat &&
				coordinates.lng
			) {
				return true;
			}
			return false;
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

	// Search master property by address
	public async searchProperties(address) {
		try {
			// Looking for matching address
			let properties = await Properties.findAll({
				where: {
					state: address.state,
					city: address.city,
					zipcode: address.zipcode,
					street_address: address.street_address !== null ? address.street_address : undefined, // Only add this condition if street_address is not null
				},
			});

			// If none found, look for something close to matching address by using the levenshtein distance
			if (properties.length === 0 && address.street_address !== null) {
				properties = await Properties.findAll({
					where: {
						state: address.state,
						city: address.city,
						zipcode: address.zipcode,
						street_address: {
							[Op.ne]: null,
							[Op.or]: [
								Sequelize.literal(`levenshtein('${address.street_address}', street_address) < 3`),
							],
						},
					},
				});
			}
			return properties;
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

	// Compare all properties with address and return id of matched property
	public async explore(properties, address) {
		try {
			const checker = { property: null };

			checker.property = properties.find(
				(property) => address?.street_address === property?.street_address,
			);

			if (checker.property?.id) {
				return checker.property.id;
			}
			return properties[0]?.id || 0;
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

	// Function to create a new master property
	public async newMasterProperty(address, coordinates) {
		try {
			const createdProperty = await Properties.create({
				...address,
				latitude: coordinates.lat,
				longitude: coordinates.lng,
				coordinates: Sequelize.fn(
					'ST_GeomFromText',
					`POINT(${coordinates.lat} ${coordinates.lng})`,
				),
			});

			return createdProperty.id;
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
