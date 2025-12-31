import { changeDateFormat } from '../../utils/common/Time';
import database from '../../config/db';
const ResComps = database.res_comps;
const ResCompAmenities = database.res_comp_amenities;
const ResZoning = database.res_zoning;
const ResCostApproachComps = database.res_eval_cost_approach_comps;
const ResEvalSalesApproachComps = database.res_eval_sales_approach_comps;
import {
	IMapFilters,
	IResComp,
	IResCompListSuccessData,
	IResCompsRequest,
	IGeoClusterResponse,
	IGeoCluster,
} from './IResCompService';
import { Op, Sequelize, QueryTypes, where, literal } from 'sequelize';
import IUser from '../../utils/interfaces/IUser';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import CompsEnum from '../../utils/enums/CompsEnum';
import PropertiesStore from '../masterProperty/masterProperty.store';
import * as IResCompService from '../../services/residentialComp/IResCompService';
import ResCompAmenitiesStore from '../resCompAmenities/compAmenities.store';
import IResZoning from '../../utils/interfaces/IResZoning';
import ResZoningStore from '../resZoning/resZoning.store';
import DefaultEnum, { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
import UploadFunction from '../../utils/common/upload';
import { OpenAIService } from '../../utils/common/openAI';
import GooglePlacesService from '../../utils/common/googlePlaces';
import { CommonEnum, CompEnum } from '../../utils/enums/MessageEnum';

const helperFunction = new HelperFunction();
const uploadFunction = new UploadFunction();
const openAIService = new OpenAIService();
const googlePlacesService = new GooglePlacesService();

const permittedRoles = [RoleEnum.ADMINISTRATOR, RoleEnum.DATA_ENTRY, RoleEnum.USER];

export default class ResCompsStore {
	private masterPropertyStorage = new PropertiesStore();
	private resCompAmenitiesStore = new ResCompAmenitiesStore();
	private resZoningStorage = new ResZoningStore();
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('resCompsStore', ResComps);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Create where clause according to filters.
	 * @param data
	 * @param accountId
	 * @returns
	 */
	public async getResCompFilters(data: Partial<IResCompsRequest>, accountId: number) {
		const {
			search,
			state,
			city,
			propertyType,
			building_sf_min,
			building_sf_max,
			land_sf_min,
			land_sf_max,
			street_address,
		} = data;

		let { start_date, end_date } = data;

		const filters: any = {};

		// Converting request date format.
		if (start_date) {
			start_date = changeDateFormat(start_date);
		}
		if (end_date) {
			end_date = changeDateFormat(end_date);
		}

		//filtering list according to account id
		if (accountId) {
			filters.account_id = accountId;
		}

		//Applying state, comp type and city filter
		if (state) {
			filters.state = state;
		}

		if (city?.length) {
			filters.city = { [Op.in]: city };
		}

		// Applying filters for date\
		if (start_date && end_date) {
			filters.date_sold = {
				[Op.between]: [start_date, end_date],
				[Op.not]: null,
			};
		} else if (start_date) {
			filters.date_sold = { [Op.gte]: start_date, [Op.not]: null };
		} else if (end_date) {
			filters.date_sold = { [Op.lte]: end_date, [Op.not]: null };
		} else {
			filters.date_sold = { [Op.ne]: null };
		}

		//Applying filters for building size
		if (building_sf_min && building_sf_max) {
			filters.building_size = {
				[Op.between]: [Number(building_sf_min), Number(building_sf_max)],
			};
		} else if (building_sf_min) {
			filters.building_size = { [Op.gte]: Number(building_sf_min) };
		} else if (building_sf_max) {
			filters.building_size = { [Op.lte]: Number(building_sf_max) };
		}

		//Applying filters for land size

		if (land_sf_min && land_sf_max) {
			filters.land_size = {
				[Op.between]: [Number(land_sf_min), Number(land_sf_max)],
			};
		} else if (land_sf_min) {
			filters.land_size = { [Op.gte]: Number(land_sf_min) };
		} else if (land_sf_max) {
			filters.land_size = { [Op.lte]: Number(land_sf_max) };
		}

		// Applying zone filter
		let zoneFilter: any = { model: ResZoning };
		if (propertyType) {
			zoneFilter = { model: ResZoning, where: { zone: propertyType } };
		}

		if (street_address) {
			filters.street_address = { [Op.like]: `%${street_address}%` };
		}

		if (search) {
			filters[Op.or] = [
				{ street_address: { [Op.like]: `%${search}%` } },
				{ property_name: { [Op.like]: `%${search}%` } },
			];
		}

		return { filters, zoneFilter };
	}

	/**
	 * @description function to get all residential comps list
	 * @param data
	 * @param user
	 * @returns
	 */
	public async getAllResComp(
		data: Partial<IResCompsRequest>,
		accountId: number,
		user: IUser,
	): Promise<IResCompListSuccessData> {
		let offset;
		try {
			const { page = 1, limit = 10, orderBy = 'DESC', orderByColumn = CompsEnum.DATE_SOLD } = data;
			const { role, id } = user;

			//Applying pagination
			offset = (page - 1) * limit;

			const { filters, zoneFilter } = await this.getResCompFilters(data, accountId);

			let whereClause;
			if (permittedRoles.includes(role)) {
				whereClause = {
					[Op.or]: [
						{ ...filters, private_comp: 0 },
						{ ...filters, user_id: id, private_comp: 1 },
					],
				};
			} else {
				whereClause = filters;
			}

			//Applying query
			const { count, rows } = await ResComps.findAndCountAll({
				limit: Number(limit),
				offset: offset,
				order: [[orderByColumn, orderBy]],
				where: whereClause,
				include: [
					{
						model: ResCompAmenities,
					},
					zoneFilter,
				],
				group: ['res_comps.id'], // Group by comp_id
			});

			return { resComps: rows, page, perPage: limit, totalRecord: count.length };
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new ResCompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description function to create comp
	 * @param attributes
	 * @returns
	 */
	public async createComp(
		attributes: IResCompService.ICompsCreateUpdateRequest,
		compLink: boolean = false,
	): Promise<IResComp | boolean> {
		try {
			const { zonings, ...data } = attributes;
			const masterPropertyId = await this.getMasterProperty(data);
			if (masterPropertyId) {
				data.property_id = masterPropertyId;
				// Create the comp entry
				const comp = await ResComps.create(data);
				if (comp) {
					if (data.additional_amenities) {
						await this.resCompAmenitiesStore.addAmenities(
							data.additional_amenities,
							comp.id,
							CompsEnum.RES_COMP_ID,
						);
					}
					// Create zonings entries
					const extractZoning: IResZoning[] = await zonings.map((zoning: IResZoning) => {
						const { sub_zone_custom, ...rest } = zoning;
						if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
							rest.sub_zone = sub_zone_custom || '';
						}
						return rest;
					});
					await this.resZoningStorage.addAssociation(extractZoning, comp.id);
				}
				if (compLink) {
					const data = await this.getSelected([comp.id], attributes.account_id);
					if (data) {
						return data[0];
					}
				}
				return comp;
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
			return e.message || e;
		}
	}

	// Get master property id
	public async getMasterProperty(data) {
		try {
			const coordinates = {
				lat: data.map_pin_lat || data.latitude,
				lng: data.map_pin_lng || data.longitude,
			};

			const address = {
				// business_name: data.property_name,
				street_address: data.street_address,
				city: data.city,
				state: data.state,
				zipcode: data.zipcode,
				county: data.county || null,
			};

			return await this.masterPropertyStorage.retrieve(address, coordinates);
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new ResCompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description get residential comp by id.
	 * @param resCompId
	 * @returns
	 */
	public async getCompById(resCompId: number) {
		try {
			const resComps = await ResComps.findOne({
				where: { id: resCompId },
				include: [ResZoning, ResCompAmenities],
			});
			return resComps;
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new ResCompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description function to delete residential comp by id.
	 * @param resCompId
	 * @returns
	 */
	public async deleteById(resCompId: number) {
		try {
			// Tables that can contain comp_id
			const tables = [ResCostApproachComps, ResEvalSalesApproachComps];

			// Return false if any table has this id as comp_id
			for (const table of tables) {
				const count = await table.count({ where: { comp_id: resCompId } });
				if (count > 0) {
					return false;
				}
			}
			// Delete comp from table
			return await ResComps.destroy({
				where: { id: resCompId },
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new ResCompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description query to find cities.
	 * @param state
	 * @param user
	 * @returns
	 */
	public async findCities(state, user: IUser) {
		try {
			const { id, role, account_id } = user;
			const queryOptions: any = {
				attributes: [[Sequelize.fn('DISTINCT', Sequelize.col(DefaultEnum.CITY)), DefaultEnum.CITY]],
				where: {
					// Initialize where object
					[Op.and]: [
						{ city: { [Op.ne]: null } },
						{ city: { [Op.ne]: '' } }, // Assuming you want to exclude empty strings as well
						{ state: state },
						{ date_sold: { [Op.not]: null } },
					],
				},
				order: [[DefaultEnum.CITY, DefaultEnum.ASCENDING]],
			};

			const requiredRoles = [RoleEnum.ADMINISTRATOR, RoleEnum.DATA_ENTRY];

			if (requiredRoles.includes(role)) {
				queryOptions.where.account_id = account_id;
			} else if (role === RoleEnum.USER) {
				queryOptions.where.user_id = id;
			}

			return await ResComps.findAll(queryOptions);
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
	 *
	 * @param attributes
	 * @returns
	 */
	public async updateResComp(
		attributes: IResCompService.ICompsCreateUpdateRequest,
	): Promise<boolean> {
		try {
			const { zonings, ...data } = attributes;

			// Check id is valid or not
			const isValid = await ResComps.findByPk(data.id);
			if (!isValid) {
				return false;
			}
			const masterPropertyId = await this.getMasterProperty(data);
			if (masterPropertyId) {
				data.property_id = masterPropertyId;
				// update the comp entry
				const comp = await ResComps.update(data, {
					where: { id: data.id },
					returning: true,
				});

				if (data.property_image_url && isValid.property_image_url !== data.property_image_url) {
					// Remove the previous image from the server
					uploadFunction.removeFromServer(isValid.property_image_url);
				}
				if (comp) {
					if (data.additional_amenities) {
						await this.resCompAmenitiesStore.addAmenities(
							data.additional_amenities,
							data.id,
							CompsEnum.RES_COMP_ID,
						);
					}
					// Create zonings entries
					const extractZoning: IResZoning[] = zonings.map((zoning: IResZoning) => {
						const { sub_zone_custom, ...rest } = zoning;
						if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
							rest.sub_zone = sub_zone_custom || '';
						}
						return rest;
					});
					await this.resZoningStorage.addAssociation(extractZoning, data.id);
					return true;
				}
				return false;
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
			return e.message || e;
		}
	}

	/**
	 * @description function to create comp.
	 * @param attributes
	 * @returns
	 */
	public async createExtractedComp(comps): Promise<IResCompService.IExtractedCompsSuccess> {
		try {
			const createdComps = [];
			const linkComps = [];
			let alreadyExistsCompsCount = 0;
			let addressValidationFailCount = 0;
			let totalCreatedCompsCount = 0;
			for (let index = 0; index < comps.length; index++) {
				const data = comps[index];
				const propertyType: {
					zone?: string;
					sub_zone?: string;
					sub_zone_custom?: string;
					gross_living_sq_ft?: number;
					total_sq_ft?: number;
					basement_sq_ft?: number;
					basement_finished_sq_ft?: number;
					basement_unfinished_sq_ft?: number;
					weight_sf?: number;
				} = {};
				const zonings = [];
				if (data) {
					const alreadyExists = await ResComps.findOne({
						where: {
							street_address: data.street_address,
							city: data.city,
							state: data.state,
							date_sold: data.date_sold,
							ai_generated: 1,
						},
					});
					if (alreadyExists) {
						// Creating array of selected comps to link
						if (data?.link === true) {
							linkComps.push(alreadyExists?.id);
							const data = await this.getSelected([alreadyExists.id], alreadyExists.account_id);
							if (data) {
								createdComps.push(data[0]);
							} else {
								createdComps.push(alreadyExists);
							}
						} else {
							createdComps.push(alreadyExists);
						}
						console.log(
							`Comp already exists for address: ${data.street_address}, city: ${data.city}, state: ${data.state}`,
						);
						alreadyExistsCompsCount++;
						continue; // Skip to the next iteration if comp already exists
					} else {
						// Validate address using Google Places API
						const fullAddress = `${data.street_address}, ${data.city}, ${data.state}, ${data.zipcode ? data.zipcode + ',' : ''} USA`;
						const addressValidation = await googlePlacesService.validateAddress(fullAddress);

						if (addressValidation.isValid) {
							// Use validated coordinates and place_id
							data.latitude = addressValidation.latitude;
							data.longitude = addressValidation.longitude;
							data.google_place_id = addressValidation.place_id;

							// Update address with formatted version if available
							if (addressValidation.formatted_address) {
								// Parse the formatted address to update individual fields
								const addressParts = addressValidation.formatted_address.split(', ');
								if (addressParts.length >= 3) {
									if (addressParts[2].split(' ').length > 1) {
										data.zipcode = parseInt(addressParts[2].split(' ')[1]);
									}
								}
							}
						}
						if (!data.zipcode) {
							const prompt = `Find the ZIP code for this address: ${fullAddress}. Return only the 5-digit ZIP code in JSON format: {"zipcode": "12345"}`;

							// Get response from OpenAI.
							const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
								| { zipcode?: string }
								| { zipcode?: string }[];
							if (openAIResponse) {
								if (Array.isArray(openAIResponse)) {
									data.zipcode = (openAIResponse[0] as { zipcode?: string })?.zipcode;
								} else {
									data.zipcode = (openAIResponse as { zipcode?: string })?.zipcode;
								}
							}
						}
						// Fallback to OpenAI if Google Places validation fails
						if (!data.latitude || !data.longitude) {
							const prompt = `Find the coordinates for this address: ${fullAddress}.
											Return decimal coordinates in JSON format:
											If the address is valid and coordinates are found, return:
											{ "latitude": <value>, "longitude": <value> }  
											If the address is not valid or coordinates cannot be determined, return an empty array:[]`;

							// Get response from OpenAI.
							const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
								| { latitude?: number; longitude?: number }
								| { latitude?: number; longitude?: number }[];
							if (openAIResponse) {
								const response = Array.isArray(openAIResponse) ? openAIResponse[0] : openAIResponse;
								data.latitude = response?.latitude;
								data.longitude = response?.longitude;
								if (!data.latitude || !data.longitude) {
									addressValidationFailCount++;
									console.log(
										`Address validation failed for: ${fullAddress}. Using OpenAI to find coordinates.`,
									);
								}
							} else {
								addressValidationFailCount++;
								console.log(
									`Address validation failed for: ${fullAddress}. Using OpenAI to find coordinates.`,
								);
							}
						}

						if (!data.google_place_id) {
							const prompt = `Find the Google Place ID for this address: ${fullAddress}. Return only the Place ID in JSON format: {"place_id": "<PLACE_ID>"}`;
							const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
								| { place_id?: string }
								| { place_id?: string }[];
							if (openAIResponse) {
								if (Array.isArray(openAIResponse)) {
									data.google_place_id = (openAIResponse[0] as { place_id?: string })?.place_id;
								} else {
									data.google_place_id = (openAIResponse as { place_id?: string })?.place_id;
								}
							}
						}
					}
					data.state = data.state.toLowerCase();
					data.ai_generated = 1;
					// Get master property ID If no master property is found, then creates a new master property.
					const masterPropertyId = await this.getMasterProperty(data);
					if (masterPropertyId) {
						data.property_id = masterPropertyId;
					} else {
						console.log(
							`Address validation failed for master property: ${data.street_address}, city: ${data.city}, state: ${data.state}`,
						);
					}

					const {
						building_type,
						building_sub_type,
						building_sub_type_custom,
						gross_living_sq_ft,
						total_sq_ft,
						basement_sq_ft,
						basement_finished_sq_ft,
						basement_unfinished_sq_ft,
						weight_sf,
					} = data;

					if (building_type) propertyType.zone = building_type;
					if (building_sub_type) propertyType.sub_zone = building_sub_type;
					if (building_sub_type_custom) propertyType.sub_zone_custom = building_sub_type_custom;
					if (gross_living_sq_ft) propertyType.gross_living_sq_ft = gross_living_sq_ft;
					if (total_sq_ft) propertyType.total_sq_ft = total_sq_ft;
					if (weight_sf) propertyType.weight_sf = weight_sf;
					if (basement_sq_ft) propertyType.basement_sq_ft = basement_sq_ft;
					if (basement_finished_sq_ft)
						propertyType.basement_finished_sq_ft = basement_finished_sq_ft;
					if (basement_unfinished_sq_ft)
						propertyType.basement_unfinished_sq_ft = basement_unfinished_sq_ft;

					if (Object.keys(propertyType).length) {
						zonings.push(propertyType);
					}
					data.private_comp = data.private_comp || 0;
					// Create the comp entry
					const comp = await ResComps.create(data);

					if (comp) {
						if (data.additional_amenities) {
							await this.resCompAmenitiesStore.addAmenities(
								data.additional_amenities,
								comp.id,
								CompsEnum.RES_COMP_ID,
							);
						}
						// Create zonings entries
						const extractZoning: IResZoning[] = await zonings.map((zoning: IResZoning) => {
							const { sub_zone_custom, ...rest } = zoning;
							if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
								rest.sub_zone = sub_zone_custom || '';
							}
							return rest;
						});
						await this.resZoningStorage.addAssociation(extractZoning, comp.id);
						totalCreatedCompsCount++;
					}

					// Creating array of selected comps to link
					if (data?.link === true) {
						linkComps.push(comp?.id);
						const data = await this.getSelected([comp.id], comp.account_id);
						if (data) {
							createdComps.push(data[0]);
						} else {
							createdComps.push(comp);
						}
					} else {
						createdComps.push(comp);
					}
				}
			}
			const message = `Out of ${comps.length} comps, ${linkComps?.length ? ' ' + linkComps.length + ' comps linked, ' : ''} ${alreadyExistsCompsCount ? ' ' + alreadyExistsCompsCount + ' comps already existed, ' : ''} ${addressValidationFailCount ? ' ' + addressValidationFailCount + ' comps failed address validation, ' : ''} ${totalCreatedCompsCount + ' created successfully.'}`;

			return {
				compsCreated: createdComps,
				selectedComps: linkComps,
				totalCreated: totalCreatedCompsCount,
				totalLinked: linkComps?.length,
				message,
				addressValidationFailCount,
				alreadyExistsCompsCount,
			};
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
	 * @description Function to get selected comps by id.
	 * @param compIds
	 * @returns
	 */
	public async getSelected(compIds: number[], accountId: number): Promise<IResComp[]> {
		try {
			let whereClause = {};
			if (accountId) {
				whereClause = {
					id: {
						[Op.in]: compIds,
					},
					account_id: accountId,
				};
			} else {
				whereClause = {
					id: {
						[Op.in]: compIds,
					},
				};
			}
			const comps = await ResComps.findAll({
				where: whereClause,
				include: [ResZoning, ResCompAmenities],
			});

			return comps;
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new ResCompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description Get cluster size based on zoom level
	 * @param zoom
	 * @returns
	 */
	private getClusterSize(zoom: number): number {
		if (zoom <= 5) return 0.1; // Country level - very large clusters
		if (zoom <= 6) return 0.5; // Regional level - large clusters
		if (zoom <= 8) return 10.0; // Very large clusters
		if (zoom <= 10) return 50.0; // Large clusters
		if (zoom <= 12) return 100.0; // Medium clusters
		if (zoom <= 14) return 500.0; // Small clusters
		return 2000.0; // Very small clusters
	}

	/**
	 * @description Get clustered data using spatial clustering
	 */
	private async getClusteredData(
		bounds: { north: number; south: number; east: number; west: number },
		zoom: number,
		clusterSize: number,
		filters: IMapFilters,
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IGeoClusterResponse> {
		const whereClause = this.buildWhereClause(bounds, filters, accountId, userId, role);

		let zoneFilter: string = '';
		if (filters.propertyType) {
			if (Array.isArray(filters.propertyType) && filters.propertyType?.length) {
				zoneFilter = `AND z.zone IN (${filters.propertyType.map((type: string) => `'${type}'`).join(',')})`;
			} else if (typeof filters.propertyType === 'string') {
				zoneFilter = `AND z.zone = '${filters.propertyType}'`;
			}
		}
		let latLngWhere = '';
		if (bounds.west > bounds.east) {
			// The bounding box crosses the antimeridian
			latLngWhere = `
				lat_decimal BETWEEN :south AND :north
				AND (
					(lng_decimal BETWEEN :west AND 180)
					OR (lng_decimal BETWEEN -180 AND :east)
				)
			`;
		} else {
			latLngWhere = `
				lat_decimal BETWEEN :south AND :north
				AND lng_decimal BETWEEN :west AND :east
			`;
		}

		const query = `
			SELECT 
				CONCAT(
				FLOOR(lat_decimal * :clusterSize) / :clusterSize, '_',
				FLOOR(lng_decimal * :clusterSize) / :clusterSize
				) as cluster_id,
				FLOOR(lat_decimal * :clusterSize) / :clusterSize as lat_cluster,
				FLOOR(lng_decimal * :clusterSize) / :clusterSize as lng_cluster,
				COUNT(*) as count,
				CASE WHEN COUNT(*) = 1 THEN MAX(id) ELSE NULL END AS comp_id,
				AVG(CASE WHEN price_decimal > 0 THEN price_decimal ELSE NULL END) as avg_price,
				AVG(CASE WHEN size_decimal > 0 THEN size_decimal ELSE NULL END) as avg_size,
				AVG(CASE WHEN psf_decimal > 0 THEN psf_decimal ELSE NULL END) as avg_price_per_sf,
				MIN(lat_decimal) as min_lat,
				MAX(lat_decimal) as max_lat,
				MIN(lng_decimal) as min_lng,
				MAX(lng_decimal) as max_lng,
    			GROUP_CONCAT(DISTINCT zone SEPARATOR ',') AS zoning_types
			FROM (
				SELECT 
				c.*,
				CASE 
					WHEN map_pin_lat REGEXP '^-?[0-9]+\\.?[0-9]*$' 
					THEN CAST(map_pin_lat AS DECIMAL(10,6))
					ELSE NULL 
				END as lat_decimal,
				CASE 
					WHEN map_pin_lng REGEXP '^-?[0-9]+\\.?[0-9]*$' 
					THEN CAST(map_pin_lng AS DECIMAL(10,6))
					ELSE NULL 
				END as lng_decimal,
				CASE 
					WHEN sale_price REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(sale_price AS DECIMAL(15,2)) > 0
					THEN CAST(sale_price AS DECIMAL(15,2))
					ELSE NULL 
				END as price_decimal,
				CASE 
					WHEN building_size REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(building_size AS DECIMAL(10,2)) > 0
					THEN CAST(building_size AS DECIMAL(10,2))
					ELSE NULL 
				END as size_decimal,
				CASE 
					WHEN price_square_foot REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(price_square_foot AS DECIMAL(10,2)) > 0
					THEN CAST(price_square_foot AS DECIMAL(10,2))
					ELSE NULL 
				END as psf_decimal,
        		z.zone
				FROM res_comps c
				${zoneFilter ? 'INNER' : 'LEFT'} JOIN res_zoning z 
					ON c.id = z.res_comp_id
				WHERE ${whereClause.sql}
				${zoneFilter}
				GROUP BY id 
			) as valid_data
			WHERE lat_decimal IS NOT NULL 
				AND lng_decimal IS NOT NULL
				AND ${latLngWhere}
			GROUP BY ${zoom > 15 ? 'lat_decimal, lng_decimal' : 'lat_cluster, lng_cluster'}
			HAVING COUNT(*) > 0
			ORDER BY count DESC
			LIMIT 500
		`;

		const results = await database.sequelize.query(query, {
			type: QueryTypes.SELECT,
			replacements: {
				clusterSize: clusterSize,
				...whereClause.replacements,
			},
		});

		const clusters: IGeoCluster[] = results.map((row: any) => ({
			id: row.cluster_id,
			comp_id: row.comp_id,
			bounds: {
				north: row.max_lat,
				south: row.min_lat,
				east: row.max_lng,
				west: row.min_lng,
			},
			center: {
				lat: (Number(row.min_lat) + Number(row.max_lat)) / 2,
				lng: (Number(row.min_lng) + Number(row.max_lng)) / 2,
			},
			count: row.count,
			avgPrice: row.avg_price,
			avgSize: row.avg_size,
			avgPricePerSf: row.avg_price_per_sf,
			propertyTypes: row.property_types ? row.property_types.split(',') : [],
			zoom: zoom,
		}));

		return {
			clusters,
			totalCount: clusters.reduce((sum, cluster) => sum + cluster.count, 0),
			bounds,
			zoom,
			center: {
				lat: (Number(bounds.north) + Number(bounds.south)) / 2,
				lng: (Number(bounds.east) + Number(bounds.west)) / 2,
			},
		};
	}

	/**
	 * @description Build where clause for map queries
	 */
	private buildWhereClause(
		bounds: { north: number; south: number; east: number; west: number },
		filters: IMapFilters,
		accountId?: number,
		userId?: number,
		role?: number,
	) {
		const conditions: any = {};
		const sqlParts: string[] = [];
		const replacements: any = {};

		// Geographic bounds
		conditions.map_pin_lat = where(literal('CAST(map_pin_lat AS DECIMAL(10,6))'), {
			[Op.between]: [bounds.south, bounds.north],
		});
		// Handle longitude wrapping across the antimeridian
		if (bounds.west > bounds.east) {
			// The bounding box crosses the antimeridian
			conditions[Op.or] = [
				where(literal('CAST(map_pin_lng AS DECIMAL(10,6))'), {
					[Op.between]: [bounds.west, 180],
				}),
				where(literal('CAST(map_pin_lng AS DECIMAL(10,6))'), {
					[Op.between]: [-180, bounds.east],
				}),
			];
		} else {
			conditions.map_pin_lng = where(literal('CAST(map_pin_lng AS DECIMAL(10,6))'), {
				[Op.between]: [bounds.west, bounds.east],
			});
		}

		// Add SQL longitude condition for antimeridian crossing
		if (bounds.west > bounds.east) {
			sqlParts.push(
				'CAST(map_pin_lat AS DECIMAL(10,6)) BETWEEN :south AND :north',
				'(CAST(map_pin_lng AS DECIMAL(10,6)) BETWEEN :west AND 180 OR CAST(map_pin_lng AS DECIMAL(10,6)) BETWEEN -180 AND :east)',
			);
		} else {
			sqlParts.push(
				'CAST(map_pin_lat AS DECIMAL(10,6)) BETWEEN :south AND :north',
				'CAST(map_pin_lng AS DECIMAL(10,6)) BETWEEN :west AND :east',
			);
		}
		replacements.south = bounds.south;
		replacements.north = bounds.north;
		replacements.west = bounds.west;
		replacements.east = bounds.east;

		const {
			state,
			city,
			building_sf_min,
			building_sf_max,
			land_sf_min,
			land_sf_max,
			street_address,
		} = filters;
		let { search } = filters;
		let { start_date, end_date } = filters;

		if (state) {
			conditions.state = state;
			sqlParts.push('state = :state');
			replacements.state = state;
		}
		if (city?.length) {
			conditions.city = city;
			sqlParts.push('city IN (:city)');
			replacements.city = city;
		}
		// Converting request date format.
		if (start_date) {
			start_date = changeDateFormat(start_date);
		}
		if (end_date) {
			end_date = changeDateFormat(end_date);
		}

		// Applying filters for date
		if (start_date && end_date) {
			conditions.date_sold = {
				[Op.between]: [start_date, end_date],
				[Op.not]: null,
			};
			sqlParts.push('date_sold BETWEEN :start_date AND :end_date');
			replacements.start_date = start_date;
			replacements.end_date = end_date;
		} else if (start_date) {
			conditions.date_sold = { [Op.gte]: start_date, [Op.not]: null };
			sqlParts.push('date_sold >= :start_date');
			replacements.start_date = start_date;
		} else if (end_date) {
			conditions.date_sold = { [Op.lte]: end_date, [Op.not]: null };
			sqlParts.push('date_sold <= :end_date');
			replacements.end_date = end_date;
		} else {
			conditions.date_sold = { [Op.ne]: null };
			sqlParts.push('date_sold IS NOT NULL');
		}

		// Applying filters for building size
		if (building_sf_min && building_sf_max) {
			conditions.building_size = {
				[Op.between]: [Number(building_sf_min), Number(building_sf_max)],
			};
			sqlParts.push('building_size BETWEEN :building_sf_min AND :building_sf_max');
			replacements.building_sf_min = Number(building_sf_min);
			replacements.building_sf_max = Number(building_sf_max);
		} else if (building_sf_min) {
			conditions.building_size = { [Op.gte]: Number(building_sf_min) };
			sqlParts.push('building_size >= :building_sf_min');
			replacements.building_sf_min = Number(building_sf_min);
		} else if (building_sf_max) {
			conditions.building_size = { [Op.lte]: Number(building_sf_max) };
			sqlParts.push('building_size <= :building_sf_max');
			replacements.building_sf_max = Number(building_sf_max);
		}
		if (street_address) {
			conditions.street_address = { [Op.like]: `%${street_address}%` };
			sqlParts.push('street_address LIKE :street_address');
			replacements.street_address = `%${street_address}%`;
		}

		conditions.sale_price = { [Op.gte]: Number(0) };
		sqlParts.push('sale_price >= 0');
		replacements.sale_price = Number(0);

		if (search) {
			search = search === CompsEnum.MULTIFAMILY ? CompsEnum.MULTI_FAMILY : search;
			//Searching in comps
			conditions[Op.or] = [
				{ street_address: { [Op.like]: `%${search}%` } },
				{ summary: { [Op.like]: `%${search}%` } },
				// { '$zonings.zone$': { [Op.like]: `%${search}%` } }, // Referencing joined table
				// { '$zonings.sub_zone$': { [Op.like]: `%${search}%` } },
			];
			sqlParts.push(
				'(street_address LIKE :search OR summary LIKE :search)',
				// '(street_address LIKE :search OR business_name LIKE :search OR summary LIKE :search OR $zonings.zone$ LIKE :search OR $zonings.sub_zone$ LIKE :search)',
			);
			replacements.search = `%${search}%`;
		}
		let landSfMax: number;
		let landSfMin: number;
		// Applying filters for land size

		// Applying filters for land size
		if (land_sf_min && land_sf_max) {
			landSfMin = Number(land_sf_min) / 43560;
			landSfMax = Number(land_sf_max) / 43560;
			conditions[Op.or] = [
				{
					[Op.and]: [
						{ land_dimension: DefaultEnum.ACRE },
						{ land_size: { [Op.between]: [Number(landSfMin), Number(landSfMax)] } },
					],
				},
				{
					[Op.and]: [
						{ land_dimension: DefaultEnum.SF },
						{ land_size: { [Op.between]: [Number(land_sf_min), Number(land_sf_max)] } },
					],
				},
			];
			sqlParts.push(`((land_dimension = 'SF' AND land_size BETWEEN :land_sf_min AND :land_sf_max)
				OR (land_dimension = 'ACRE' AND land_size BETWEEN :landSfMin AND :landSfMax))`);
			replacements.land_sf_min = Number(land_sf_min);
			replacements.land_sf_max = Number(land_sf_max);
			replacements.landSfMin = Number(landSfMin);
			replacements.landSfMax = Number(landSfMax);
		} else if (land_sf_min) {
			landSfMin = Number(land_sf_min) / 43560;
			conditions[Op.or] = [
				{
					[Op.and]: [{ land_dimension: DefaultEnum.ACRE }, { land_size: { [Op.gte]: landSfMin } }],
				},
				{
					[Op.and]: [{ land_dimension: DefaultEnum.SF }, { land_size: { [Op.gte]: land_sf_min } }],
				},
			];
			sqlParts.push(`((land_dimension = 'ACRE' AND land_size >= :landSfMin)
				OR (land_dimension = 'SF' AND land_size >= :land_sf_min))`);
			replacements.land_sf_min = Number(land_sf_min);
			replacements.landSfMin = Number(landSfMin);
		} else if (land_sf_max) {
			landSfMax = Number(land_sf_max) / 43560;
			conditions[Op.or] = [
				{
					[Op.and]: [{ land_dimension: DefaultEnum.ACRE }, { land_size: { [Op.lte]: landSfMax } }],
				},
				{
					[Op.and]: [{ land_dimension: DefaultEnum.SF }, { land_size: { [Op.lte]: land_sf_max } }],
				},
			];
			sqlParts.push(`((land_dimension = 'SF' AND land_size <= :land_sf_max)
				OR (land_dimension = 'ACRE' AND land_size <= :landSfMax))`);
			replacements.land_sf_max = Number(land_sf_max);
			replacements.landSfMax = Number(landSfMax);
		}
		// Role based access control
		if (permittedRoles.includes(role)) {
			conditions[Op.or] = [
				{ private_comp: 0, account_id :accountId },
				{ ...conditions, user_id: userId, private_comp: 1, account_id :accountId },
			];
			sqlParts.push('(private_comp = 0 AND account_id = :accountId OR (user_id = :userId AND private_comp = 1 AND account_id = :accountId))');
			replacements.userId = userId;
			replacements.accountId = accountId;
		}
		return {
			conditions,
			sql: sqlParts.join(' AND '),
			replacements,
		};
	}

	/**
	 * @description Get geo-clustered properties for map display
	 * @param bounds Map bounds
	 * @param zoom Current zoom level
	 * @param filters Property filters
	 * @param accountId User's account ID
	 * @returns Clustered properties
	 */
	public async getGeoClusters(
		bounds: { north: number; south: number; east: number; west: number },
		zoom: number,
		filters: IMapFilters = {},
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IGeoClusterResponse> {
		try {
			// Determine clustering strategy based on zoom level
			const clusterSize = this.getClusterSize(zoom);
			return await this.getClusteredData(
				bounds,
				zoom,
				clusterSize,
				filters,
				accountId,
				userId,
				role,
			);
		} catch (error) {
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error,
			});
			throw error;
		}
	}

	/**
	 * @description Get detailed properties within a cluster
	 */
	public async getClusterDetails(
		bounds: { north: number; south: number; east: number; west: number },
		filters: IMapFilters = {},
		pageSize: number = 10,
		page: number = 1,
		accountId?: number,
		userId?: number,
		role?: number,
	): Promise<IResCompService.IMapSearchResponse> {
		try {
			const { orderBy = 'DESC', orderByColumn = CompsEnum.DATE_SOLD } = filters;
			const whereClause = this.buildWhereClause(bounds, filters, accountId, userId, role);
			const offset = (page - 1) * pageSize;
			let zoneFilter: any = {
				model: ResZoning,
				attributes: {
					include: [
						[
							Sequelize.literal(
								"GROUP_CONCAT(DISTINCT res_zonings.sub_zone ORDER BY res_zonings.sub_zone SEPARATOR ',')",
							),
							'sub_zoning',
						],
					],
				},
			};
			if (filters.propertyType) {
				if (Array.isArray(filters.propertyType) && filters.propertyType?.length) {
					zoneFilter = {
						model: ResZoning,
						attributes: {
							include: [
								[Sequelize.literal("GROUP_CONCAT(res_zonings.zone SEPARATOR ',')"), 'zoning'],
							],
						},
						where: { zone: { [Op.in]: filters.propertyType } },
					};
				} else if (typeof filters.propertyType === 'string') {
					zoneFilter = {
						model: ResZoning,
						attributes: {
							include: [
								[Sequelize.literal("GROUP_CONCAT(res_zonings.zone SEPARATOR ',')"), 'zoning'],
							],
						},
						where: { zone: filters.propertyType },
					};
				}
			}
			const { count, rows } = await ResComps.findAndCountAll({
				where: whereClause.conditions,
				attributes: [
					'id',
					'street_address',
					'city',
					'state',
					'zipcode',
					'sale_price',
					'building_size',
					'land_size',
					'land_dimension',
					'price_square_foot',
					'date_sold',
					'year_built',
					'year_remodeled',
					'condition',
					'map_pin_lat',
					'map_pin_lng',
					'property_image_url',
					'summary',
					'created',
					'sale_status',
					'ai_generated',
					'bedrooms',
					'bathrooms',
				],
				subQuery: false, // Avoid subquery generation
				include: [zoneFilter],
				group: ['res_comps.id'], // Group by comp_id
				limit: pageSize,
				offset: offset,
				order: [[orderByColumn, orderBy]],
			});
			// Aggregating distinct zoning types
			const comps = rows.map((comp) => {
				const types = comp?.res_zonings?.[0]?.dataValues?.sub_zoning || '';
				const uniqueTypes = types
					? [
							...new Set(
								types
									.split(',')
									.map((type) => type.trim())
									.filter((type) => type !== ''),
							),
						]
					: [];
				comp.dataValues.sub_type = uniqueTypes;
				return comp;
			});

			return {
				properties: comps,
				totalRecord: count.length,
				page,
				limit: pageSize,
				totalPages: Math.ceil(count.length / pageSize),
			};
		} catch (error) {
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error,
			});
			throw error;
		}
	}
		
	/**
	 * @description Save extracted comp data
	 * @param attributes 
	 * @returns 
	 */
	public async saveExtractedComp(data): Promise<IResCompService.IExtractedCompSuccessData> {
		try {
			let compCreated;
			let alreadyExist = false;
			let addressValidationCheck = true;
			const propertyType: {
				zone?: string;
				sub_zone?: string;
				sub_zone_custom?: string;
				gross_living_sq_ft?: number;
				total_sq_ft?: number;
				basement_sq_ft?: number;
				basement_finished_sq_ft?: number;
				basement_unfinished_sq_ft?: number;
				weight_sf?: number;
			} = {};
			const zonings = [];
			if (data) {
				const alreadyExists = await ResComps.findOne(
					{
						where: {
							street_address: data.street_address,
							city: data.city,
							state: data.state,
							date_sold: data.date_sold,
							ai_generated: 1,
						}
					},
				);
				if (alreadyExists) {
					alreadyExist = true;
					if (data.new) {
						alreadyExist = false;
					} else if(data.update){ 
						alreadyExist = false;
						data.id = alreadyExists.id;
					}
					if (alreadyExist) {
						const message = `${alreadyExist ? 'Comp already exist.' : ''}`;
						return {
							message,
							alreadyExist
						};
					}
				
				} else {
					const fullAddress = `${data.street_address}, ${data.city}, ${data.state}, ${data.zipcode ? data.zipcode + ',' : ''}`;
					if (!data.latitude || !data.longitude) {
						// Validate address using Google Places API
						const addressValidation = await googlePlacesService.validateAddress(fullAddress);
						if (addressValidation.isValid) {
							// Use validated coordinates and place_id
							data.latitude = addressValidation.latitude;
							data.longitude = addressValidation.longitude;
							data.google_place_id = addressValidation.place_id;

							// Update address with formatted version if available
							if (addressValidation.formatted_address) {
								// Parse the formatted address to update individual fields
								const addressParts = addressValidation.formatted_address.split(', ');
								if (addressParts.length >= 3) {
									if (addressParts[2].split(' ').length > 1) {
										data.zipcode = parseInt(addressParts[2].split(' ')[1]);
									}
								}
							}
						}
						// Fallback to OpenAI if Google Places validation fails
						if (!data.latitude || !data.longitude) {
							const prompt = `Find the coordinates for this address: ${fullAddress}.
											Return decimal coordinates in JSON format:
											If the address is valid and coordinates are found, return:
											{ "latitude": <value>, "longitude": <value> }  
											If the address is not valid or coordinates cannot be determined, return an empty array:[]`;

							// Get response from OpenAI.
							const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
								| { latitude?: number; longitude?: number }
								| { latitude?: number; longitude?: number }[];
							if (openAIResponse) {
								const response = Array.isArray(openAIResponse) ? openAIResponse[0] : openAIResponse;
								data.latitude = response?.latitude;
								data.longitude = response?.longitude;
								if (!data.latitude || !data.longitude) {
									addressValidationCheck = false;
									console.log(`Address validation failed for: ${fullAddress}. Using OpenAI to find coordinates.`);
								}
							} else {
								addressValidationCheck = false;
								console.log(`Address validation failed for: ${fullAddress}. Using OpenAI to find coordinates.`);
							}
						}
					}

					if (!data.zipcode) {
						const fullAddress = `${data.street_address}, ${data.city}, ${data.state}`;
						const prompt = `Find the ZIP code for this address: ${fullAddress}. Return only the 5-digit ZIP code in JSON format: {"zipcode": "12345"}`;

						// Get response from OpenAI.
						const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
							| { zipcode?: string }
							| { zipcode?: string }[];
						if (openAIResponse) {
							if (Array.isArray(openAIResponse)) {
								data.zipcode = (openAIResponse[0] as { zipcode?: string })?.zipcode;
							} else {
								data.zipcode = (openAIResponse as { zipcode?: string })?.zipcode;
							}
						}
					}
					// Get Google Place ID using OpenAI if not provided
					if (!data.google_place_id) {
						const prompt = `Find the Google Place ID for this address: ${fullAddress}. Return only the Place ID in JSON format: {"place_id": "<PLACE_ID>"}`;
						const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
							| { place_id?: string }
							| { place_id?: string }[];
						if (openAIResponse) {
							if (Array.isArray(openAIResponse)) {
								data.google_place_id = (openAIResponse[0] as { place_id?: string })?.place_id;
							} else {
								data.google_place_id = (openAIResponse as { place_id?: string })?.place_id;
							}
						}
					}
					if (!addressValidationCheck && !data.uploadAnyway) {
						const message = `${!addressValidationCheck ? 'Address validation failed.' : ''}`;
						return {
							message,
							addressValidation: addressValidationCheck,
						};
					}
				}
				data.map_pin_lat = data.latitude;
				data.map_pin_lng = data.longitude;
				data.state = data.state.toLowerCase();
				data.ai_generated = 1;
				// Get master property ID If no master property is found, then creates a new master property.
				const masterPropertyId = await this.getMasterProperty(data);
				if (masterPropertyId) {
					data.property_id = masterPropertyId;
				} else {
					console.log(`Address validation failed for master property: ${data.street_address}, city: ${data.city}, state: ${data.state}`);
				}

				const {
					building_type,
					building_sub_type,
					building_sub_type_custom,
					gross_living_sq_ft,
					total_sq_ft,
					basement_sq_ft,
					basement_finished_sq_ft,
					basement_unfinished_sq_ft,
					weight_sf,
				} = data;

				if (building_type) propertyType.zone = building_type;
				if (building_sub_type) propertyType.sub_zone = building_sub_type;
				if (building_sub_type_custom) propertyType.sub_zone_custom = building_sub_type_custom;
				if (gross_living_sq_ft) propertyType.gross_living_sq_ft = gross_living_sq_ft;
				if (total_sq_ft) propertyType.total_sq_ft = total_sq_ft;
				if (weight_sf) propertyType.weight_sf = weight_sf;
				if (basement_sq_ft) propertyType.basement_sq_ft = basement_sq_ft;
				if (basement_finished_sq_ft)
					propertyType.basement_finished_sq_ft = basement_finished_sq_ft;
				if (basement_unfinished_sq_ft)
					propertyType.basement_unfinished_sq_ft = basement_unfinished_sq_ft;

				if (Object.keys(propertyType).length) {
					zonings.push(propertyType);
				}
				data.private_comp = data.private_comp || 0;
				let comp;
				if(data.update && alreadyExists){
					alreadyExist = false;
					data.id = alreadyExists.id;
					// Update the comp entry
					await ResComps.update(data, { where: { id: data.id } });
					comp = await ResComps.findByPk(data.id);
				} else {
					// Create the comp entry
					comp = await ResComps.create(data);
				}
				
				if (comp) {
					if (data.additional_amenities) {
						await this.resCompAmenitiesStore.addAmenities(
							data.additional_amenities,
							comp.id,
							CompsEnum.RES_COMP_ID,
						);
					}
					// Create zonings entries
					const extractZoning: IResZoning[] = await zonings.map((zoning: IResZoning) => {
						const { sub_zone_custom, ...rest } = zoning;
						if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
							rest.sub_zone = sub_zone_custom || '';
						}
						return rest;
					});
					await this.resZoningStorage.addAssociation(extractZoning, comp.id);
				}
				compCreated = comp;
			}
			const message = CompEnum.COMP_SAVE_SUCCESS;
			return {
				compId: compCreated.id,
				link: data?.link ? true : false,
				message,
			};
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
	 * @description validate extracted comp data
	 * @param attributes
	 * @returns
	 */
	public async validateComp(data): Promise<IResCompService.IExtractedCompSuccessData> {
		try {
			if (!data) return data;
			let alreadyExist = false;
			let addressValidationCheck = true;
			const fullAddress = `${data.street_address}, ${data.city}, ${data.state}, ${data.zipcode ? data.zipcode + ',' : ''}`;
			// Validate address using Google Places API
			const addressValidation = await googlePlacesService.validateAddress(fullAddress);
			if (addressValidation.isValid) {
				// Use validated coordinates and place_id
				data.latitude = addressValidation.latitude;
				data.longitude = addressValidation.longitude;
				data.google_place_id = addressValidation.place_id;

				// Update address with formatted version if available
				if (addressValidation.formatted_address) {
					// Parse the formatted address to update individual fields
					const addressParts = addressValidation.formatted_address.split(', ');
					if (addressParts.length >= 3) {
						if (addressParts[2].split(' ').length > 1) {
							data.zipcode = parseInt(addressParts[2].split(' ')[1]);
						}
					}
				}
			}
			if (!data.latitude || !data.longitude) {
				// Fallback to OpenAI if Google Places validation fails
				if (!data.latitude || !data.longitude) {
					const prompt = `Find the coordinates for this address: ${fullAddress}.
									Return decimal coordinates in JSON format:
									If the address is valid and coordinates are found, return:
									{ "latitude": <value>, "longitude": <value> }  
									If the address is not valid or coordinates cannot be determined, return an empty array:[]`;

					// Get response from OpenAI.
					const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
						| { latitude?: number; longitude?: number }
						| { latitude?: number; longitude?: number }[];
					if (openAIResponse) {
						const response = Array.isArray(openAIResponse) ? openAIResponse[0] : openAIResponse;
						data.latitude = response?.latitude;
						data.longitude = response?.longitude;
						if (!data.latitude || !data.longitude) {
							addressValidationCheck = false;
						}
					} else {
						addressValidationCheck = false;
					}
				}

				if (!data.zipcode) {
					const fullAddress = `${data.street_address}, ${data.city}, ${data.state}`;
					const prompt = `Find the ZIP code for this address: ${fullAddress}. Return only the 5-digit ZIP code in JSON format: {"zipcode": "12345"}`;

					// Get response from OpenAI.
					const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
						| { zipcode?: string }
						| { zipcode?: string }[];
					if (openAIResponse) {
						if (Array.isArray(openAIResponse)) {
							data.zipcode = (openAIResponse[0] as { zipcode?: string })?.zipcode;
						} else {
							data.zipcode = (openAIResponse as { zipcode?: string })?.zipcode;
						}
					}
				}
				// Get Google Place ID using OpenAI if not provided
				if (!data.google_place_id) {
					const prompt = `Find the Google Place ID for this address: ${fullAddress}. Return only the Place ID in JSON format: {"place_id": "<PLACE_ID>"}`;
					const openAIResponse = (await openAIService.generateChatCompletion(prompt)) as
						| { place_id?: string }
						| { place_id?: string }[];
					if (openAIResponse) {
						if (Array.isArray(openAIResponse)) {
							data.google_place_id = (openAIResponse[0] as { place_id?: string })?.place_id;
						} else {
							data.google_place_id = (openAIResponse as { place_id?: string })?.place_id;
						}
					}
				}
			}
			if (!addressValidationCheck) {
				data.addressValidation = addressValidationCheck;
			} else {
				if (data.date_sold) {
					data.date_sold = changeDateFormat(data.date_sold);
				}
				const alreadyExists = await ResComps.findOne({
					where: {
						street_address: data.street_address,
						city: data.city,
						state: data.state,
						date_sold: data.date_sold,
						ai_generated: 1,
					},
				});
				if (alreadyExists) {
					alreadyExist = true;
				}
			}
			data.addressValidation = addressValidationCheck;
			data.alreadyExist = alreadyExist;
			data.message = !addressValidationCheck ? CommonEnum.ADDRESS_VALIDATION_FAILED : data.alreadyExist ? CompEnum.COMP_ALREADY_EXIST : CompEnum.COMP_VALIDATION_SUCCESS;
		
			return data;
		}  catch (e) {
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
