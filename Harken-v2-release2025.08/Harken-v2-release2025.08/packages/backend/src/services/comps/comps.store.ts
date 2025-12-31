import database from '../../config/db';
const Comps = database.comps;
const Zoning = database.zoning;
const PropertyUnits = database.property_units;
const CompsIncludedUtilities = database.comps_included_utilities;
const EvalSalesApproachComps = database.eval_sales_approach_comps;
const EvalCapApproachComps = database.eval_cap_approach_comps;
const EvalLeaseApproachComps = database.eval_lease_approach_comps;
const EvalCostApproachComps = database.eval_cost_approach_comps;
const EvalMultiFamilyApproachComps = database.eval_multi_family_approach_comps;
const AppraisalCostApproach = database.appraisal_cost_approach_comps;
const AppraisalSaleApproach = database.appraisal_sales_approach_comps;
const AppraisalLeaseApproach = database.appraisal_lease_approach_comps;
import {
	IComp,
	ICompListSuccessData,
	ICompsRequest,
	IExtractedCompsSuccessData,
	IExtractedCompSuccessData,
	IGeoCluster,
	IGeoClusterResponse,
	IMapFilters,
	IMapSearchResponse,
} from '../comps/ICompsService';
import { ICompsCreateUpdateRequest } from './ICompsService';
import PropertiesStore from '../masterProperty/masterProperty.store';
import IZoning from '../../utils/interfaces/IZoning';
import CompIncludedUtility from '../compUtilities/compIncludedUtility.store';
import CompsEnum from '../../utils/enums/CompsEnum';
import { Op, Sequelize, QueryTypes, literal, where } from 'sequelize';
import ZoningStore from '../zonings/zoning.store';
import PropertyUnitsStore from '../propertyUnits/propertyUnits.store';
import HelperFunction from '../../utils/common/helper';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import IUser from '../../utils/interfaces/IUser';
import DefaultEnum, { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { changeDateFormat } from '../../utils/common/Time';
import UploadFunction from '../../utils/common/upload';
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import { ApproachesEnum } from '../../utils/enums/CommonEnum';
import { OpenAIService } from '../../utils/common/openAI';
import GooglePlacesService from '../../utils/common/googlePlaces';
import { CommonEnum, CompEnum } from '../../utils/enums/MessageEnum';

const helperFunction = new HelperFunction();
const uploadFunction = new UploadFunction();
const openAIService = new OpenAIService();
const googlePlacesService = new GooglePlacesService();
const permittedRoles = [RoleEnum.ADMINISTRATOR, RoleEnum.DATA_ENTRY, RoleEnum.USER];
export default class CompsStore {
	private masterPropertyStorage = new PropertiesStore();
	private utilityStorage = new CompIncludedUtility();
	private propertyUnitStorage = new PropertyUnitsStore();
	private zoningStorage = new ZoningStore();

	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('CompsStore', Comps);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description find comp by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<IComp>): Promise<IComp> {
		try {
			const comps = await Comps.findOne({ where: attributes });
			return comps;
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

	// Create where clause according to filters
	public async getCompFilters(data: Partial<ICompsRequest>, accountId: number) {
		try {
			const {
				type,
				state,
				city,
				propertyType,
				building_sf_min,
				building_sf_max,
				land_sf_min,
				land_sf_max,
				cap_rate_min,
				cap_rate_max,
				street_address,
				comparison_basis,
				land_dimension,
				price_sf_max,
				price_sf_min,
				lease_type,
				square_footage_max,
				square_footage_min,
				compStatus,
				comp_type,
			} = data;
			let { search } = data;
			let { start_date, end_date } = data;
			const filters: any = { type: type };

			if (accountId) {
				filters.account_id = accountId;
			}
			if (comparison_basis) {
				filters.comparison_basis = comparison_basis;
			}
			// Converting request date format.
			if (start_date) {
				start_date = changeDateFormat(start_date);
			}
			if (end_date) {
				end_date = changeDateFormat(end_date);
			}

			// Applying state, comp type and city filter
			if (state) {
				filters.state = state;
			}

			if (city?.length) {
				filters.city = { [Op.in]: city };
			}

			// To filter comps on the basis of status
			if (compStatus && type === CompsEnum.SALE) {
				filters.sale_status = compStatus;
			} else if (compStatus && type === CompsEnum.LEASE) {
				filters.lease_status = compStatus;
			}

			// Applying filters for date
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

			// Applying filters for building size
			if (building_sf_min && building_sf_max) {
				filters.building_size = {
					[Op.between]: [Number(building_sf_min), Number(building_sf_max)],
				};
			} else if (building_sf_min) {
				filters.building_size = { [Op.gte]: Number(building_sf_min) };
			} else if (building_sf_max) {
				filters.building_size = { [Op.lte]: Number(building_sf_max) };
			}
			let landSfMax: number;
			let landSfMin: number;
			// Applying filters for land size
			if (land_sf_min && land_sf_max) {
				if (land_dimension === AppraisalsEnum.ACRE) {
					landSfMin = Number(land_sf_min) * 43560;
					landSfMax = Number(land_sf_max) * 43560;
					filters[Op.or] = [
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.SF },
								{ land_size: { [Op.between]: [Number(landSfMin), Number(landSfMax)] } },
							],
						},
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.ACRE },
								{ land_size: { [Op.between]: [Number(land_sf_min), Number(land_sf_max)] } },
							],
						},
					];
				} else {
					landSfMin = Number(land_sf_min) / 43560;
					landSfMax = Number(land_sf_max) / 43560;
					filters[Op.or] = [
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.ACRE },
								{ land_size: { [Op.between]: [Number(landSfMin), Number(landSfMax)] } },
							],
						},
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.SF },
								{ land_size: { [Op.between]: [Number(land_sf_min), Number(land_sf_max)] } },
							],
						},
					];
				}
			} else if (land_sf_min) {
				if (land_dimension === AppraisalsEnum.ACRE) {
					landSfMin = Number(land_sf_min) * 43560;
					filters[Op.or] = [
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.SF },
								{ land_size: { [Op.gte]: landSfMin } },
							],
						},
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.ACRE },
								{ land_size: { [Op.gte]: land_sf_min } },
							],
						},
					];
				} else {
					landSfMin = Number(land_sf_min) / 43560;
					filters[Op.or] = [
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.ACRE },
								{ land_size: { [Op.gte]: landSfMin } },
							],
						},
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.SF },
								{ land_size: { [Op.gte]: land_sf_min } },
							],
						},
					];
				}
			} else if (land_sf_max) {
				if (land_dimension === AppraisalsEnum.ACRE) {
					landSfMax = Number(land_sf_max) * 43560;
					filters[Op.or] = [
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.SF },
								{ land_size: { [Op.lte]: landSfMax } },
							],
						},
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.ACRE },
								{ land_size: { [Op.lte]: land_sf_max } },
							],
						},
					];
				} else {
					landSfMax = Number(land_sf_max) / 43560;
					filters[Op.or] = [
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.ACRE },
								{ land_size: { [Op.lte]: landSfMax } },
							],
						},
						{
							[Op.and]: [
								{ land_dimension: AppraisalsEnum.SF },
								{ land_size: { [Op.lte]: land_sf_max } },
							],
						},
					];
				}
			}
			// if (land_sf_min && land_dimension === AppraisalsEnum.ACRE) {
			// 	landSfMin = Number(land_sf_min) * 43560;
			// 	filters.land_size = { [Op.gte]: landSfMin };
			// } else if (land_sf_max && land_dimension === AppraisalsEnum.ACRE) {
			// 	landSfMax = Number(land_sf_max) * 43560;
			// 	filters.land_size = { [Op.lte]: landSfMax };
			// } else if (land_sf_min && land_sf_max && land_dimension !== AppraisalsEnum.ACRE) {
			// 	filters.land_size = {
			// 		[Op.between]: [Number(land_sf_min), Number(land_sf_max)],
			// 	};
			// } else if (land_sf_min && land_dimension !== AppraisalsEnum.ACRE) {
			// 	filters.land_size = { [Op.gte]: Number(land_sf_min) };
			// } else if (land_sf_max && land_dimension !== AppraisalsEnum.ACRE) {
			// 	filters.land_size = { [Op.lte]: Number(land_sf_max) };
			// }

			// Applying filters for cap rate
			if (cap_rate_min && cap_rate_max) {
				filters.cap_rate = {
					[Op.between]: [Number(cap_rate_min), Number(cap_rate_max)],
				};
			} else if (cap_rate_min) {
				filters.cap_rate = { [Op.gte]: Number(cap_rate_min) };
			} else if (cap_rate_max) {
				filters.cap_rate = { [Op.lte]: Number(cap_rate_max) };
			}

			// Applying zone filter
			let zoneFilter: any = {
				model: Zoning,
				attributes: {
					include: [[Sequelize.literal("GROUP_CONCAT(zonings.zone SEPARATOR ',')"), 'zoning']], // Include GROUP_CONCAT along with other attributes
				},
			};
			if (propertyType) {
				if (comp_type === CompsEnum.BUILDING_WITH_LAND) {
					if (Array.isArray(propertyType) && propertyType?.length) {
						zoneFilter = {
							model: Zoning,
							attributes: {
								include: [
									[Sequelize.literal("GROUP_CONCAT(zonings.zone SEPARATOR ',')"), 'zoning'],
								],
							},
							where: { zone: { [Op.in]: propertyType } },
						};
					} else if (typeof propertyType === 'string') {
						zoneFilter = {
							model: Zoning,
							attributes: {
								include: [
									[Sequelize.literal("GROUP_CONCAT(zonings.zone SEPARATOR ',')"), 'zoning'],
								],
							},
							where: { zone: propertyType },
						};
					}
				} else if (comp_type === CompsEnum.LAND_ONLY) {
					if (Array.isArray(propertyType) && propertyType?.length) {
						filters.land_type = { [Op.in]: propertyType };
					} else {
						filters.land_type = propertyType;
					}
				}
			}

			if (comp_type) {
				filters.comp_type = comp_type;
			}

			if (street_address) {
				filters.street_address = { [Op.like]: `%${street_address}%` };
			}

			if (search) {
				filters.setPage = 1;
				search = search === CompsEnum.MULTIFAMILY ? CompsEnum.MULTI_FAMILY : search;
				//Searching in comps
				filters[Op.or] = [
					{ street_address: { [Op.like]: `%${search}%` } },
					{ business_name: { [Op.like]: `%${search}%` } },
					{ summary: { [Op.like]: `%${search}%` } },
					{ '$zonings.zone$': { [Op.like]: `%${search}%` } }, // Referencing joined table
					{ '$zonings.sub_zone$': { [Op.like]: `%${search}%` } },
				];
			}

			// If type is sale then sale price should be greater than 0
			if (type == CompsEnum.SALE) {
				filters.sale_price = { [Op.gte]: Number(0) };
			}

			// Added price sf filter
			let priceSfMax: number;
			if (price_sf_max && land_dimension === AppraisalsEnum.ACRE) {
				priceSfMax = Number(price_sf_max) * 43560;
				filters.price_square_foot = { [Op.lte]: priceSfMax };
			} else if (price_sf_min && price_sf_max) {
				filters.price_square_foot = {
					[Op.between]: [price_sf_min, price_sf_max],
				};
			} else if (price_sf_min) {
				filters.price_square_foot = { [Op.gte]: price_sf_min };
			} else if (price_sf_max) {
				filters.price_square_foot = { [Op.lte]: price_sf_max };
			}

			if (lease_type) {
				filters.lease_type = lease_type;
			}

			// Filter for space
			if (square_footage_max && square_footage_min) {
				filters.space = {
					[Op.between]: [Number(square_footage_min), Number(square_footage_max)],
				};
			} else if (square_footage_max) {
				filters.space = { [Op.lte]: Number(square_footage_max) };
			} else if (square_footage_min) {
				filters.space = { [Op.gte]: Number(square_footage_min) };
			}

			if (comp_type === CompsEnum.LEASE && comparison_basis !== CompsEnum.SF) {
				filters[Op.and] = [
					...(filters[Op.and] || []),
					{
						[Op.or]: [{ lease_rate_unit: 'annual' }, { lease_rate_unit: 'monthly' }],
					},
				];
			}

			return { filters, zoneFilter };
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
	 * @description function to get comp list with filters and searching
	 * @param data
	 * @param accountId
	 * @returns
	 */
	public async getAllComps(
		data: Partial<ICompsRequest>,
		user: IUser,
		accountId: number,
	): Promise<ICompListSuccessData> {
		try {
			let { page = 1 } = data;
			const { limit = 10, orderBy = 'DESC', orderByColumn = CompsEnum.DATE_SOLD } = data;
			const { role, id } = user;
			const { filters, zoneFilter } = await this.getCompFilters(data, accountId);
			const { setPage, ...restFilters } = filters;
			if (setPage) {
				page = setPage;
			}

			//Applying pagination
			const offset = (page - 1) * limit;

			let whereClause = {};
			//role validation for private comp
			if (permittedRoles.includes(role)) {
				whereClause = {
					[Op.or]: [
						{ ...restFilters, private_comp: 0 },
						{ ...restFilters, user_id: id, private_comp: 1 },
					],
				};
			} else {
				whereClause = restFilters;
			}
			//Applying query
			const { count, rows } = await Comps.findAndCountAll({
				limit: Number(limit),
				offset: offset,
				order: [[orderByColumn, orderBy]],
				where: whereClause,
				subQuery: false, // Avoid subquery generation
				include: [
					{
						model: CompsIncludedUtilities,
						required: false, // This makes it a LEFT JOIN
					},
					zoneFilter,
				],
				group: ['comps.id'], // Group by comp_id
			});

			// Aggregating distinct zoning types
			const comps = rows.map((comp) => {
				const types = comp?.zonings?.[0]?.dataValues?.zoning || '';
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
				comp.dataValues.type = uniqueTypes;
				return comp;
			});

			return { comps, page, perPage: limit, totalRecord: count.length };
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new CompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description function to create comp
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async createComp(attributes: ICompsCreateUpdateRequest, compLink: boolean = false) {
		try {
			const { zonings, property_units, included_utilities, ...data } = attributes;
			const masterPropertyId = await this.getMasterProperty(data);
			if (masterPropertyId) {
				data.property_id = masterPropertyId;
				// Create the comp entry
				const comp = await Comps.create(data);
				if (comp) {
					if (included_utilities) {
						await this.utilityStorage.addUtilities(included_utilities, comp.id, CompsEnum.COMP_ID);
					}
					if (data.comp_type === CompsEnum.BUILDING_WITH_LAND) {
						// Create zonings entries
						let flag = false;
						const extractZoning: IZoning[] = [];
						await Promise.all(
							zonings.map(async (zoning: IZoning) => {
								if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
									zoning.sub_zone = zoning.sub_zone_custom ? zoning.sub_zone_custom : '';
								}
								delete zoning.sub_zone_custom;
								if (data.comparison_basis == CompsEnum.SF) {
									zoning.unit = null;
									zoning.bed = null;
								} else if (data.comparison_basis == CompsEnum.UNIT) {
									zoning.bed = null;
								} else if (data.comparison_basis == CompsEnum.BED) {
									zoning.unit = null;
								}
								if (
									zoning.zone === CompsEnum.MULTI_FAMILY &&
									data.comparison_basis == CompsEnum.UNIT
								) {
									flag = true;
								}
								extractZoning.push(zoning);
							}),
						);
						await this.zoningStorage.addAssociation(extractZoning, comp.id);
						if (flag) {
							await this.propertyUnitStorage.addPropertyUnits(property_units, comp.id);
						}
					}
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

	// Add/Remove image from server
	public async addPropertyImage(filename: string, id: number) {
		try {
			const comp = await Comps.findByPk(id);
			const currentPropertyImageUrl = comp.get('property_image_url');
			if (currentPropertyImageUrl !== filename) {
				// Remove the previous image from the server
				await uploadFunction.removeFromServer(currentPropertyImageUrl);

				// Update the property_image_url field in the database
				await Comps.update({ property_image_url: filename }, { where: { id: id } });
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

	// Get master property id
	public async getMasterProperty(data) {
		try {
			const coordinates = {
				lat: data.map_pin_lat || data.latitude,
				lng: data.map_pin_lng || data.longitude,
			};

			const address = {
				// business_name: data.business_name,
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
			return Promise.reject(new CompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description function to get comp by id
	 * @param compId
	 * @returns
	 */
	public async getCompById(compId: number): Promise<IComp> {
		try {
			const comps = await Comps.findOne({
				where: { id: compId },
				include: [Zoning, PropertyUnits, CompsIncludedUtilities],
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
			return Promise.reject(new CompsStore.OPERATION_UNSUCCESSFUL());
		}
	}
	/**
	 * @description Function to update comps.
	 * @param attributes
	 * @returns
	 */
	public async updateComp(attributes: ICompsCreateUpdateRequest): Promise<boolean> {
		try {
			const { zonings, property_units, included_utilities, ...data } = attributes;
			// Check id is valid or not
			const isValid = await Comps.findByPk(data.id);
			if (!isValid) {
				return false;
			}
			const masterPropertyId = await this.getMasterProperty(data);
			if (masterPropertyId) {
				data.property_id = masterPropertyId;
				// Add/ update and remove utilities
				this.utilityStorage.addUtilities(included_utilities, data.id, CompsEnum.COMP_ID);

				if (data.property_image_url && isValid.property_image_url !== data.property_image_url) {
					// Remove the previous image from the server
					uploadFunction.removeFromServer(isValid.property_image_url);
				}

				// Create the comp entry
				const comp = await Comps.update(data, {
					where: { id: data.id },
				});
				let flag = false;
				if (comp) {
					if (data?.comp_type === CompsEnum.BUILDING_WITH_LAND) {
						// Create zonings entries
						const extractZoning: IZoning[] = [];
						await Promise.all(
							zonings.map(async (zoning: IZoning) => {
								if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
									zoning.sub_zone = zoning.sub_zone_custom ? zoning.sub_zone_custom : '';
								}
								delete zoning.sub_zone_custom;
								if (data.comparison_basis == CompsEnum.SF) {
									zoning.unit = null;
									zoning.bed = null;
								} else if (data.comparison_basis == CompsEnum.UNIT) {
									zoning.bed = null;
								} else if (data.comparison_basis == CompsEnum.BED) {
									zoning.unit = null;
								}
								if (
									zoning.zone === CompsEnum.MULTI_FAMILY &&
									data.comparison_basis == CompsEnum.UNIT
								) {
									flag = true;
								}
								extractZoning.push(zoning);
							}),
						);
						await this.zoningStorage.addAssociation(extractZoning, data.id);
						if (flag) {
							await this.propertyUnitStorage.addPropertyUnits(property_units, data.id);
						}
					} else {
						// Removing zonings and property units data when comp type is land only.
						this.zoningStorage.delete({ comp_id: data?.id });
						// const zoningData = await this.zoningStorage.findAll({ comp_id: data?.id });
						// if (zoningData) {
						// 	for (const zone of zoningData) {
						// 		this.zoningStorage.delete({ id: zone?.id });
						// 	}
						// }
						this.updateCompAttribute({ id: data?.id, building_size: 0 });
					}
					if (flag && property_units) {
						await this.propertyUnitStorage.addPropertyUnits(property_units, data.id);
					} else {
						this.propertyUnitStorage.removeUnusedAssociations([], data.id);
					}
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
	 * @description Function to delete comp by id
	 * @param compId
	 * @returns
	 */
	public async delete(compId: number): Promise<boolean> {
		try {
			// Tables that can contain comp_id
			const tables = [
				EvalSalesApproachComps,
				EvalCapApproachComps,
				EvalLeaseApproachComps,
				EvalCostApproachComps,
				EvalMultiFamilyApproachComps,
				AppraisalCostApproach,
				AppraisalSaleApproach,
				AppraisalLeaseApproach,
			];

			// Return false if any table has this id as comp_id
			for (const table of tables) {
				const count = await table.count({ where: { comp_id: compId } });
				if (count > 0) {
					return false;
				}
			}

			// Delete comp from table
			return await Comps.destroy({
				where: { id: compId },
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new CompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	/**
	 * @description Query to find cities according to state
	 * @param attributes
	 * @returns
	 */
	public async findCities(state: string, user: IUser) {
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

			return await Comps.findAll(queryOptions);
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
	 * @description Function to search comps in approaches.
	 * @param data
	 * @param user
	 * @returns
	 */
	public async advanceSearch(
		data: Partial<ICompsRequest>,
		user: IUser,
		accountId: number,
	): Promise<IComp[]> {
		try {
			const { role, id } = user;
			const { filters, zoneFilter } = await this.approachesCompFilters(data, accountId);
			let { orderByColumn, orderBy } = data;
			if (!orderByColumn) {
				orderByColumn = 'sale_price';
			}
			if (!orderBy) {
				orderBy = 'asc';
			}
			let whereClause = {};
			//role validation for private comp
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

			if (data?.type === ApproachesEnum.SALE) {
				filters.sale_price = { [Op.gt]: 0, [Op.not]: null };
			}
			if (data?.type === ApproachesEnum.LEASE) {
				filters.lease_rate = { [Op.gt]: 0, [Op.not]: null };
			}
			if (data?.type === ApproachesEnum.LEASE && data?.comparison_basis !== CompsEnum.SF) {
				filters.lease_rate_unit = { [Op.or]: [CompsEnum.ANNUAL, CompsEnum.MONTHLY] };
			}
			//Applying query
			const comps = await Comps.findAll({
				where: whereClause,
				order: [[orderByColumn, orderBy]],
				attributes: [
					'id',
					'property_id',
					'user_id',
					'account_id',
					'business_name',
					'street_address',
					'street_suite',
					'city',
					'county',
					'state',
					'zipcode',
					'type',
					'property_image_url',
					'sale_price',
					'price_square_foot',
					'cap_rate',
					'building_size',
					'land_size',
					'date_sold',
					'comparison_basis',
					'sale_status',
					'lease_status',
					'lease_rate',
					'term',
					'lease_type',
					'space',
					'land_dimension',
					'comp_type',
					'land_type',
					'ai_generated',
				],
				include: [zoneFilter],
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
			return Promise.reject(new CompsStore.OPERATION_UNSUCCESSFUL());
		}
	}
	/**
	 * @description Function to get selected comps by id.
	 * @param compIds
	 * @returns
	 */
	public async getSelected(compIds: number[], accountId: number): Promise<IComp[]> {
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
			const comps = await Comps.findAll({
				where: whereClause,
				include: [Zoning, PropertyUnits],
			});

			// Iterate through comps and calculate the total_beds for each one
			const compsWithTotalBeds = comps.map((comp) => {
				// Calculate the sum of 'bed' fields in the 'zonings' array
				const totalBeds = comp.zonings.reduce((sum, zoning) => sum + (zoning.bed || 0), 0);
				// Calculate the sum of 'unit' fields in the 'zonings' array
				const totalUnits = comp.zonings.reduce((sum, zoning) => sum + (zoning.unit || 0), 0);

				// Add total_beds to the comp object
				return {
					...comp.toJSON(), // Convert Sequelize model instance to a plain object
					total_beds: totalBeds,
					total_units: totalUnits,
				};
			});
			return compsWithTotalBeds;
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return Promise.reject(new CompsStore.OPERATION_UNSUCCESSFUL());
		}
	}

	public async updateCompAttribute(attributes: Partial<IComp>): Promise<IComp> {
		try {
			const { id, ...rest } = attributes;
			const comps = await Comps.update(rest, { where: { id: id } });
			return comps;
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
	 * @description Advance filters in appraisals.
	 * @param data
	 * @param accountId
	 * @returns
	 */
	public async approachesCompFilters(data: Partial<ICompsRequest>, accountId: number) {
		try {
			const {
				type,
				state,
				city,
				propertyType,
				building_sf_min,
				building_sf_max,
				land_sf_min,
				land_sf_max,
				cap_rate_min,
				cap_rate_max,
				street_address,
				comparison_basis,
				appraisal_land_dimension,
				price_sf_max,
				price_sf_min,
				lease_type,
				square_footage_max,
				square_footage_min,
				compStatus,
				comp_type,
			} = data;
			let { search } = data;
			let { start_date, end_date } = data;
			const filters: any = { type: type };

			if (accountId) {
				filters.account_id = accountId;
			}
			if (comparison_basis) {
				filters.comparison_basis = comparison_basis;
			}
			// Converting request date format.
			if (start_date) {
				start_date = changeDateFormat(start_date);
			}
			if (end_date) {
				end_date = changeDateFormat(end_date);
			}

			// Applying state, comp type and city filter
			if (state) {
				filters.state = state;
			}

			if (city?.length) {
				filters.city = { [Op.in]: city };
			}

			// To filter comps on the basis of status
			if (compStatus && type === CompsEnum.SALE) {
				filters.sale_status = compStatus;
			} else if (compStatus && type === CompsEnum.LEASE) {
				filters.lease_status = compStatus;
			}

			// Applying filters for date
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

			// Applying filters for building size
			if (building_sf_min && building_sf_max) {
				filters.building_size = {
					[Op.between]: [Number(building_sf_min), Number(building_sf_max)],
				};
			} else if (building_sf_min) {
				filters.building_size = { [Op.gte]: Number(building_sf_min) };
			} else if (building_sf_max) {
				filters.building_size = { [Op.lte]: Number(building_sf_max) };
			}
			let landSfMax: number;
			let landSfMin: number;
			// Applying filters for land size
			if (land_sf_min && appraisal_land_dimension === CompsEnum.ACRE) {
				landSfMin = Number(land_sf_min) * 43560;
				filters.land_size = { [Op.gte]: landSfMin };
			} else if (land_sf_max && appraisal_land_dimension === CompsEnum.ACRE) {
				landSfMax = Number(land_sf_max) * 43560;
				filters.land_size = { [Op.lte]: landSfMax };
			} else if (land_sf_min && land_sf_max && appraisal_land_dimension !== CompsEnum.ACRE) {
				filters.land_size = {
					[Op.between]: [Number(land_sf_min), Number(land_sf_max)],
				};
			} else if (land_sf_min && appraisal_land_dimension !== CompsEnum.ACRE) {
				filters.land_size = { [Op.gte]: Number(land_sf_min) };
			} else if (land_sf_max && appraisal_land_dimension !== CompsEnum.ACRE) {
				filters.land_size = { [Op.lte]: Number(land_sf_max) };
			}

			// Applying filters for cap rate
			if (cap_rate_min && cap_rate_max) {
				filters.cap_rate = {
					[Op.between]: [Number(cap_rate_min), Number(cap_rate_max)],
				};
			} else if (cap_rate_min) {
				filters.cap_rate = { [Op.gte]: Number(cap_rate_min) };
			} else if (cap_rate_max) {
				filters.cap_rate = { [Op.lte]: Number(cap_rate_max) };
			}

			// Applying zone filter
			let zoneFilter: any = {
				model: Zoning,
			};
			if (propertyType) {
				if (comp_type === CompsEnum.BUILDING_WITH_LAND) {
					zoneFilter = {
						model: Zoning,
						where: { zone: propertyType },
					};
				} else if (comp_type === CompsEnum.LAND_ONLY) {
					filters.land_type = propertyType;
				}
			}

			if (comp_type) {
				filters.comp_type = comp_type;
			}

			if (street_address) {
				filters.street_address = { [Op.like]: `%${street_address}%` };
			}

			if (search) {
				search = search === CompsEnum.MULTIFAMILY ? CompsEnum.MULTI_FAMILY : search;
				//Searching in comps
				filters[Op.or] = [
					{ street_address: { [Op.like]: `%${search}%` } },
					{ business_name: { [Op.like]: `%${search}%` } },
					{ summary: { [Op.like]: `%${search}%` } },
				];
			}

			// If type is sale then sale price should be greater than 0
			if (type == CompsEnum.SALE) {
				filters.sale_price = { [Op.gte]: Number(0) };
			}

			// Added price sf filter
			let priceSfMax: number;
			if (price_sf_max && appraisal_land_dimension === CompsEnum.ACRE) {
				priceSfMax = Number(price_sf_max) * 43560;
				filters.price_square_foot = { [Op.lte]: priceSfMax };
			} else if (price_sf_min) {
				filters.price_square_foot = { [Op.gte]: price_sf_min };
			} else if (price_sf_max) {
				filters.price_square_foot = { [Op.lte]: price_sf_max };
			}

			if (lease_type) {
				filters.lease_type = lease_type;
			}

			// Filter for space
			if (square_footage_max && square_footage_min) {
				filters.space = {
					[Op.between]: [Number(square_footage_min), Number(square_footage_max)],
				};
			} else if (square_footage_max) {
				filters.space = { [Op.lte]: Number(square_footage_max) };
			} else if (square_footage_min) {
				filters.space = { [Op.gte]: Number(square_footage_min) };
			}

			return { filters, zoneFilter };
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
	 * The function `saveExtractedComps` processes and saves extracted property data, creating comps and
	 * linking selected comps.
	 * @param comps - The `saveExtractedComps` function takes an array of `comps` as a parameter. Each
	 * element in the `comps` array represents attributes of a property, including details like building
	 * type, building size, beds, baths, average monthly rent, unit count, included utilities, link
	 * @returns The `saveExtractedComps` function returns a Promise that resolves to an object of type
	 * `IExtractedCompsSuccessData`. This object contains the following properties:
	 * - `compsCreated`: An array of created comp entries.
	 * - `selectedComps`: An array of comp IDs that were selected to be linked.
	 * - `totalCreated`: The total number of comp entries created.
	 * - Address validation is performed using Google Places API before saving.
	 */
	public async saveExtractedComps(comps): Promise<IExtractedCompsSuccessData> {
		try {
			const createdComps = [];
			const linkComps = [];
			let alreadyExistsCompsCount = 0;
			let addressValidationFailCount = 0;
			let totalCreatedCompsCount = 0;
			for (let index = 0; index < comps.length; index++) {
				const attributes = comps[index];
				const zonings = [];
				const propertyUnits = [];
				const propertyType: {
					zone?: string;
					sub_zone?: string;
					sub_zone_custom?: string;
					sq_ft?: number;
				} = {};

				const propertyUnit: {
					beds?: number;
					baths?: number;
					avg_monthly_rent?: number;
					unit_count?: number;
				} = {};
				const { included_utilities, ...data } = attributes;
				if (data) {
					const alreadyExists = await this.findByAttribute({
						street_address: data.street_address,
						city: data.city,
						state: data.state,
						date_sold: data.date_sold,
						ai_generated: 1,
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
					data.map_pin_lat = data.latitude;
					data.map_pin_lng = data.longitude;
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
						building_size,
						beds,
						baths,
						avg_monthly_rent,
						unit_count,
					} = data || {};

					if (building_type) propertyType.zone = building_type;
					if (building_sub_type) propertyType.sub_zone = building_sub_type;
					if (building_sub_type_custom) propertyType.sub_zone_custom = building_sub_type_custom;
					if (building_size) propertyType.sq_ft = building_size;

					if (beds) propertyUnit.beds = beds;
					if (baths) propertyUnit.baths = baths;
					if (avg_monthly_rent) propertyUnit.avg_monthly_rent = avg_monthly_rent;
					if (unit_count) propertyUnit.unit_count = unit_count;

					if (Object.keys(propertyType).length) {
						zonings.push(propertyType);
					}
					if (Object.keys(propertyUnit).length) {
						propertyUnits.push(propertyUnit);
					}

					data.private_comp = data.private_comp || 0;
					// Create the comp entry
					const comp = await Comps.create(data);

					if (comp) {
						if (included_utilities) {
							await this.utilityStorage.addUtilities(
								included_utilities,
								comp.id,
								CompsEnum.COMP_ID,
							);
						}
						if (data.comp_type === CompsEnum.BUILDING_WITH_LAND) {
							// Create zonings entries
							let flag = false;
							const extractZoning: IZoning[] = [];
							await Promise.all(
								zonings.map(async (zoning: IZoning) => {
									if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
										zoning.sub_zone = zoning.sub_zone_custom ? zoning.sub_zone_custom : '';
									}

									delete zoning.sub_zone_custom;
									if (data.comparison_basis == CompsEnum.SF) {
										zoning.unit = null;
										zoning.bed = null;
									} else if (data.comparison_basis == CompsEnum.UNIT) {
										zoning.bed = null;
									} else if (data.comparison_basis == CompsEnum.BED) {
										zoning.unit = null;
									}
									if (
										zoning.zone === CompsEnum.MULTI_FAMILY &&
										data.comparison_basis == CompsEnum.UNIT
									) {
										flag = true;
									}
									extractZoning.push(zoning);
								}),
							);
							await this.zoningStorage.addAssociation(extractZoning, comp.id);
							if (flag) {
								await this.propertyUnitStorage.addPropertyUnits(propertyUnits, comp.id);
							}
						}
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
	 * @description Get cluster size based on zoom level
	 * @param zoom
	 * @returns
	 */
	private getClusterSize(zoom: number): number {
		// if (zoom <= 8) return 10; // Very large clusters
		// if (zoom <= 10) return 50; // Large clusters
		// if (zoom <= 12) return 100; // Medium clusters
		// if (zoom <= 14) return 500; // Small clusters
		// return 1000; // Very small clusters

		if (zoom <= 5) return 0.1; // Country level - very large clusters
		if (zoom <= 6) return 0.5; // Regional level - large clusters
		if (zoom <= 8) return 10.0; // Very large clusters
		if (zoom <= 10) return 50.0; // Large clusters
		if (zoom <= 12) return 100.0; // Medium clusters
		if (zoom <= 14) return 500.0; // Small clusters
		return 2000.0; // Very small clusters
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
			type,
			state,
			city,
			propertyType,
			building_sf_min,
			building_sf_max,
			land_sf_min,
			land_sf_max,
			cap_rate_min,
			cap_rate_max,
			street_address,
			comparison_basis,
			land_dimension,
			price_sf_max,
			price_sf_min,
			lease_type,
			square_footage_max,
			square_footage_min,
			compStatus,
			comp_type,
		} = filters;
		let { search } = filters;
		let { start_date, end_date } = filters;

		// Apply filters
		if (type) {
			conditions.type = type;
			sqlParts.push('type = :type');
			replacements.type = type;
		}
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
		if (comparison_basis) {
			conditions.comparison_basis = comparison_basis;
			sqlParts.push('comparison_basis = :comparison_basis');
			replacements.comparison_basis = comparison_basis;
		}
		// To filter comps on the basis of status
		if (compStatus && type === CompsEnum.SALE) {
			conditions.sale_status = compStatus;
			sqlParts.push('sale_status = :sale_status');
			replacements.sale_status = compStatus;
		} else if (compStatus && type === CompsEnum.LEASE) {
			conditions.lease_status = compStatus;
			sqlParts.push('lease_status = :lease_status');
			replacements.lease_status = compStatus;
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
		// Applying filters for cap rate
		if (cap_rate_min && cap_rate_max) {
			conditions.cap_rate = {
				[Op.between]: [Number(cap_rate_min), Number(cap_rate_max)],
			};
			sqlParts.push('cap_rate BETWEEN :cap_rate_min AND :cap_rate_max');
			replacements.cap_rate_min = Number(cap_rate_min);
			replacements.cap_rate_max = Number(cap_rate_max);
		} else if (cap_rate_min) {
			conditions.cap_rate = { [Op.gte]: Number(cap_rate_min) };
			sqlParts.push('cap_rate >= :cap_rate_min');
			replacements.cap_rate_min = Number(cap_rate_min);
		} else if (cap_rate_max) {
			conditions.cap_rate = { [Op.lte]: Number(cap_rate_max) };
			sqlParts.push('cap_rate <= :cap_rate_max');
			replacements.cap_rate_max = Number(cap_rate_max);
		}
		if (comp_type) {
			conditions.comp_type = comp_type;
			sqlParts.push('comp_type = :comp_type');
			replacements.comp_type = comp_type;
		}
		if (street_address) {
			conditions.street_address = { [Op.like]: `%${street_address}%` };
			sqlParts.push('street_address LIKE :street_address');
			replacements.street_address = `%${street_address}%`;
		}

		// If type is sale then sale price should be greater than 0
		if (type == CompsEnum.SALE) {
			conditions.sale_price = { [Op.gte]: Number(0) };
			sqlParts.push('sale_price >= 0');
			replacements.sale_price = Number(0);
		}
		if (lease_type) {
			conditions.lease_type = lease_type;
			sqlParts.push('lease_type = :lease_type');
			replacements.lease_type = lease_type;
		}

		if (search) {
			search = search === CompsEnum.MULTIFAMILY ? CompsEnum.MULTI_FAMILY : search;
			//Searching in comps
			conditions[Op.or] = [
				{ street_address: { [Op.like]: `%${search}%` } },
				{ business_name: { [Op.like]: `%${search}%` } },
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
		if (land_sf_min && land_sf_max) {
			if (land_dimension === DefaultEnum.ACRE) {
				landSfMin = Number(land_sf_min) * 43560;
				landSfMax = Number(land_sf_max) * 43560;
				conditions[Op.or] = [
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.SF },
							{ land_size: { [Op.between]: [Number(landSfMin), Number(landSfMax)] } },
						],
					},
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.ACRE },
							{ land_size: { [Op.between]: [Number(land_sf_min), Number(land_sf_max)] } },
						],
					},
				];
				sqlParts.push(`((land_dimension = 'ACRE' AND land_size BETWEEN :land_sf_min AND :land_sf_max)
					OR (land_dimension = 'SF' AND land_size BETWEEN :landSfMin AND :landSfMax))`);
				replacements.land_sf_min = Number(land_sf_min);
				replacements.land_sf_max = Number(land_sf_max);
				replacements.landSfMin = Number(landSfMin);
				replacements.landSfMax = Number(landSfMax);
			} else {
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
			}
		} else if (land_sf_min) {
			if (land_dimension === DefaultEnum.ACRE) {
				landSfMin = Number(land_sf_min) * 43560;
				conditions[Op.or] = [
					{
						[Op.and]: [{ land_dimension: DefaultEnum.SF }, { land_size: { [Op.gte]: landSfMin } }],
					},
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.ACRE },
							{ land_size: { [Op.gte]: land_sf_min } },
						],
					},
				];
				sqlParts.push(`((land_dimension = 'SF' AND land_size >= :landSfMin)
					OR (land_dimension = 'ACRE' AND land_size >= :land_sf_min))`);
				replacements.land_sf_min = Number(land_sf_min);
				replacements.landSfMin = Number(landSfMin);
			} else {
				landSfMin = Number(land_sf_min) / 43560;
				conditions[Op.or] = [
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.ACRE },
							{ land_size: { [Op.gte]: landSfMin } },
						],
					},
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.SF },
							{ land_size: { [Op.gte]: land_sf_min } },
						],
					},
				];
				sqlParts.push(`((land_dimension = 'ACRE' AND land_size >= :landSfMin)
					OR (land_dimension = 'SF' AND land_size >= :land_sf_min))`);
				replacements.land_sf_min = Number(land_sf_min);
				replacements.landSfMin = Number(landSfMin);
			}
		} else if (land_sf_max) {
			if (land_dimension === DefaultEnum.ACRE) {
				landSfMax = Number(land_sf_max) * 43560;
				conditions[Op.or] = [
					{
						[Op.and]: [{ land_dimension: DefaultEnum.SF }, { land_size: { [Op.lte]: landSfMax } }],
					},
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.ACRE },
							{ land_size: { [Op.lte]: land_sf_max } },
						],
					},
				];
				sqlParts.push(`((land_dimension = 'ACRE' AND land_size <= :land_sf_max)
					OR (land_dimension = 'SF' AND land_size <= :landSfMax))`);
				replacements.land_sf_max = Number(land_sf_max);
				replacements.landSfMax = Number(landSfMax);
			} else {
				landSfMax = Number(land_sf_max) / 43560;
				conditions[Op.or] = [
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.ACRE },
							{ land_size: { [Op.lte]: landSfMax } },
						],
					},
					{
						[Op.and]: [
							{ land_dimension: DefaultEnum.SF },
							{ land_size: { [Op.lte]: land_sf_max } },
						],
					},
				];
				sqlParts.push(`((land_dimension = 'SF' AND land_size <= :land_sf_max)
					OR (land_dimension = 'ACRE' AND land_size <= :landSfMax))`);
				replacements.land_sf_max = Number(land_sf_max);
				replacements.landSfMax = Number(landSfMax);
			}
		}

		// Added price sf filter
		let priceSfMax: number;
		if (price_sf_max && land_dimension === DefaultEnum.ACRE) {
			priceSfMax = Number(price_sf_max) * 43560;
			conditions.price_square_foot = { [Op.lte]: priceSfMax };
			sqlParts.push('price_square_foot <= :price_sf_max');
			replacements.price_sf_max = priceSfMax;
		} else if (price_sf_min && price_sf_max) {
			conditions.price_square_foot = {
				[Op.between]: [price_sf_min, price_sf_max],
			};
			sqlParts.push('price_square_foot BETWEEN :price_sf_min AND :price_sf_max');
			replacements.price_sf_min = price_sf_min;
			replacements.price_sf_max = price_sf_max;
		} else if (price_sf_min) {
			conditions.price_square_foot = { [Op.gte]: price_sf_min };
			sqlParts.push('price_square_foot >= :price_sf_min');
			replacements.price_sf_min = price_sf_min;
		} else if (price_sf_max) {
			conditions.price_square_foot = { [Op.lte]: price_sf_max };
			sqlParts.push('price_square_foot <= :price_sf_max');
			replacements.price_sf_max = price_sf_max;
		}
		// Filter for space
		if (square_footage_max && square_footage_min) {
			conditions.space = {
				[Op.between]: [Number(square_footage_min), Number(square_footage_max)],
			};
			sqlParts.push('space BETWEEN :square_footage_min AND :square_footage_max');
			replacements.square_footage_min = Number(square_footage_min);
			replacements.square_footage_max = Number(square_footage_max);
		} else if (square_footage_max) {
			conditions.space = { [Op.lte]: Number(square_footage_max) };
			sqlParts.push('space <= :square_footage_max');
			replacements.square_footage_max = Number(square_footage_max);
		} else if (square_footage_min) {
			conditions.space = { [Op.gte]: Number(square_footage_min) };
			sqlParts.push('space >= :square_footage_min');
			replacements.square_footage_min = Number(square_footage_min);
		}
		if (comp_type === CompsEnum.LEASE && comparison_basis !== CompsEnum.SF) {
			conditions[Op.and] = [
				...(conditions[Op.and] || []),
				{
					[Op.or]: [{ lease_rate_unit: 'annual' }, { lease_rate_unit: 'monthly' }],
				},
			];
			sqlParts.push('(lease_rate_unit = :annual OR lease_rate_unit = :monthly)');
			replacements.annual = 'annual';
			replacements.monthly = 'monthly';
		}

		if (propertyType && comp_type === CompsEnum.LAND_ONLY) {
			if (Array.isArray(propertyType) && propertyType?.length) {
				conditions.land_type = { [Op.in]: propertyType };
				sqlParts.push('land_type IN (:landTypes)');
				replacements.landTypes = propertyType;
			} else {
				conditions.land_type = propertyType;
				sqlParts.push('land_type = :landType');
				replacements.landType = propertyType;
			}
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
		if (filters.propertyType && filters.comp_type === CompsEnum.BUILDING_WITH_LAND) {
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
				GROUP_CONCAT(DISTINCT COALESCE(property_class, '') SEPARATOR ',') as property_types,
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
					WHEN ${filters.type === CompsEnum.LEASE ? 'lease_rate' : 'sale_price'} REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(${filters.type === CompsEnum.LEASE ? 'lease_rate' : 'sale_price'} AS DECIMAL(15,2)) > 0
					THEN CAST(${filters.type === CompsEnum.LEASE ? 'lease_rate' : 'sale_price'} AS DECIMAL(15,2))
					ELSE NULL 
				END as price_decimal,
				CASE 
					WHEN ${filters.comp_type === CompsEnum.BUILDING_WITH_LAND ? 'building_size' : 'land_size'} REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(${filters.comp_type === CompsEnum.BUILDING_WITH_LAND ? 'building_size' : 'land_size'} AS DECIMAL(10,2)) > 0
					THEN CAST(${filters.comp_type === CompsEnum.BUILDING_WITH_LAND ? 'building_size' : 'land_size'} AS DECIMAL(10,2))
					ELSE NULL 
				END as size_decimal,
				CASE 
					WHEN price_square_foot REGEXP '^[0-9]+\\.?[0-9]*$' AND CAST(price_square_foot AS DECIMAL(10,2)) > 0
					THEN CAST(price_square_foot AS DECIMAL(10,2))
					ELSE NULL 
				END as psf_decimal,
				z.zone
				FROM comps c
				${zoneFilter ? 'INNER' : 'LEFT'} JOIN zoning z 
					ON c.id = z.comp_id
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
	): Promise<IMapSearchResponse> {
		try {
			const { orderBy = 'DESC', orderByColumn = CompsEnum.DATE_SOLD } = filters;
			const whereClause = this.buildWhereClause(bounds, filters, accountId, userId, role);
			const offset = (page - 1) * pageSize;
			let zoneFilter: any = {
				model: Zoning,
				attributes: {
					include: [[Sequelize.literal("GROUP_CONCAT(zonings.zone SEPARATOR ',')"), 'zoning']], // Include GROUP_CONCAT along with other attributes
				},
			};
			if (filters.propertyType && filters.comp_type === CompsEnum.BUILDING_WITH_LAND) {
				if (Array.isArray(filters.propertyType) && filters.propertyType?.length) {
					zoneFilter = {
						model: Zoning,
						attributes: {
							include: [[Sequelize.literal("GROUP_CONCAT(zonings.zone SEPARATOR ',')"), 'zoning']],
						},
						where: { zone: { [Op.in]: filters.propertyType } },
					};
				} else if (typeof filters.propertyType === 'string') {
					zoneFilter = {
						model: Zoning,
						attributes: {
							include: [[Sequelize.literal("GROUP_CONCAT(zonings.zone SEPARATOR ',')"), 'zoning']],
						},
						where: { zone: filters.propertyType },
					};
				}
			}
			const { count, rows } = await Comps.findAndCountAll({
				where: whereClause.conditions,
				attributes: [
					'id',
					'street_address',
					'city',
					'state',
					'zipcode',
					'type',
					'property_class',
					'sale_price',
					'land_type',
					'lease_type',
					'lease_rate',
					'lease_rate_unit',
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
					'lease_status',
					'sale_status',
					'cap_rate',
					'comp_type',
					'space',
					'ai_generated',
				],
				subQuery: false, // Avoid subquery generation
				include: [zoneFilter],
				group: ['comps.id'], // Group by comp_id
				limit: pageSize,
				offset: offset,
				order: [[orderByColumn, orderBy]],
			});
			// Aggregating distinct zoning types
			const comps = rows.map((comp) => {
				const types = comp?.zonings?.[0]?.dataValues?.zoning || '';
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
				comp.dataValues.type = uniqueTypes;
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
	public async saveExtractedComp(attributes): Promise<IExtractedCompSuccessData> {
		try {
			let compCreated;
			let alreadyExist = false;
			let addressValidationCheck = true;
			const zonings = [];
			const propertyUnits = [];
			const propertyType: {
				zone?: string;
				sub_zone?: string;
				sub_zone_custom?: string;
				sq_ft?: number;
			} = {};

			const propertyUnit: {
				beds?: number;
				baths?: number;
				avg_monthly_rent?: number;
				unit_count?: number;
			} = {};
			const { included_utilities, ...data } = attributes;
			data.comparison_basis = data.comparison_basis || 'SF';
			if (data) {
				const alreadyExists = await this.findByAttribute({
					street_address: data.street_address,
					city: data.city,
					state: data.state,
					date_sold: data.date_sold,
					ai_generated: 1,
				});
				if (alreadyExists) {
					alreadyExist = true;
					if (data.new) {
						alreadyExist = false;
					} else if (data.update) {
						alreadyExist = false;
						data.id = alreadyExists.id;
					}
					if (alreadyExist) {
						const message = `${alreadyExist ? 'Comp already exist.' : ''}`;
						return {
							message,
							alreadyExist,
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
									console.log(
										`Address validation failed for: ${fullAddress}. Using OpenAI to find coordinates.`,
									);
								}
							} else {
								addressValidationCheck = false;
								console.log(
									`Address validation failed for: ${fullAddress}. Using OpenAI to find coordinates.`,
								);
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
					building_size,
					beds,
					baths,
					avg_monthly_rent,
					unit_count,
				} = data || {};

				if (building_type) propertyType.zone = building_type;
				if (building_sub_type) propertyType.sub_zone = building_sub_type;
				if (building_sub_type_custom) propertyType.sub_zone_custom = building_sub_type_custom;
				if (building_size) propertyType.sq_ft = building_size;

				if (beds) propertyUnit.beds = beds;
				if (baths) propertyUnit.baths = baths;
				if (avg_monthly_rent) propertyUnit.avg_monthly_rent = avg_monthly_rent;
				if (unit_count) propertyUnit.unit_count = unit_count;

				if (Object.keys(propertyType).length) {
					zonings.push(propertyType);
				}
				if (Object.keys(propertyUnit).length) {
					propertyUnits.push(propertyUnit);
				}

				data.private_comp = data.private_comp || 0;
				let comp;
				if (data.update && alreadyExists) {
					alreadyExist = false;
					data.id = alreadyExists.id;
					// Update the comp entry
					await Comps.update(data, { where: { id: data.id } });
					comp = await Comps.findByPk(data.id);
				} else {
					// Create the comp entry
					comp = await Comps.create(data);
				}

				if (comp) {
					if (included_utilities) {
						await this.utilityStorage.addUtilities(included_utilities, comp.id, CompsEnum.COMP_ID);
					}
					if (data.comp_type === CompsEnum.BUILDING_WITH_LAND) {
						// Create zonings entries
						let flag = false;
						const extractZoning: IZoning[] = [];
						await Promise.all(
							zonings.map(async (zoning: IZoning) => {
								if (zoning.sub_zone == CompsEnum.TYPE_MY_OWN) {
									zoning.sub_zone = zoning.sub_zone_custom ? zoning.sub_zone_custom : '';
								}

								delete zoning.sub_zone_custom;
								if (data.comparison_basis == CompsEnum.SF) {
									zoning.unit = null;
									zoning.bed = null;
								} else if (data.comparison_basis == CompsEnum.UNIT) {
									zoning.bed = null;
								} else if (data.comparison_basis == CompsEnum.BED) {
									zoning.unit = null;
								}
								if (
									zoning.zone === CompsEnum.MULTI_FAMILY &&
									data.comparison_basis == CompsEnum.UNIT
								) {
									flag = true;
								}
								extractZoning.push(zoning);
							}),
						);
						await this.zoningStorage.addAssociation(extractZoning, comp.id);
						if (flag) {
							await this.propertyUnitStorage.addPropertyUnits(propertyUnits, comp.id);
						}
					}
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
	public async validateComp(data): Promise<IExtractedCompSuccessData> {
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
				const alreadyExists = await this.findByAttribute({
					street_address: data.street_address,
					city: data.city,
					state: data.state,
					date_sold: data.date_sold,
					ai_generated: 1,
				});
				if (alreadyExists) {
					alreadyExist = true;
				}
			}
			data.addressValidation = addressValidationCheck;
			data.alreadyExist = alreadyExist;
			
			data.message = !addressValidationCheck ? CommonEnum.ADDRESS_VALIDATION_FAILED : data.alreadyExist ? CompEnum.COMP_ALREADY_EXIST : CompEnum.COMP_VALIDATION_SUCCESS;
			
			return data;
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
