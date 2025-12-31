import database from '../../config/db';
const Appraisals = database.appraisals;
const AppraisalApproaches = database.appraisal_approaches;
const IncomeApproaches = database.appraisal_income_approaches;
const IncomeOperatingExp = database.appraisal_income_approach_op_exp;
const IncomeApproachSource = database.appraisal_income_approach_source;
const CostApproaches = database.appraisal_cost_approaches;
const CostSubAdjustments = database.appraisal_cost_approach_subject_adj;
const CostComps = database.appraisal_cost_approach_comps;
const CostCompAdjustments = database.appraisal_cost_approach_comp_adj;
const CostImprovements = database.appraisal_cost_approach_improvements;
const SaleApproaches = database.appraisal_sales_approaches;
const SalesSubAdjustments = database.appraisal_sales_approach_subject_adj;
const SaleComps = database.appraisal_sales_approach_comps;
const SaleCompAdjustments = database.appraisal_sales_approach_comp_adj;
const AppraisalFiles = database.appraisal_files;
const Clients = database.clients;
const Zoning = database.zoning;
const AppraisalsMetaData = database.appraisals_metadata;
const LeaseApproaches = database.appraisal_lease_approach;
const LeaseComps = database.appraisal_lease_approach_comps;
const GlobalCodeCategories = database.global_code_categories;
const GlobalCodes = database.global_codes;
const SaleComparativeAttributeList = database.appraisal_sale_comparative_attribute_list;
// const AppraisalIncludedUtilities = database.appraisals_included_utilities;
const Template = database.template;
import {
	IAppraisal,
	IAppraisalListRequest,
	IAppraisalListSuccess,
	IAppraisalsCreateRequest,
	IAppraisalsUpdateRequest,
	IDeleteAppraisal,
	ISaleComparitiveAttributesList,
} from './IAppraisalsService';
import PropertiesStore from '../masterProperty/masterProperty.store';
import ZoningStore from '../zonings/zoning.store';
import PropertyUnitsStore from '../propertyUnits/propertyUnits.store';
import AppraisalIncludedUtility from '../appraisalUtilities/appraisalIncludedUtility.store';
import IZoning from '../../utils/interfaces/IZoning';
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import DefaultEnum from '../../utils/enums/DefaultEnum';
import { col, fn, Op, where } from 'sequelize';
import { changeDateFormat } from '../../utils/common/Time';

export default class AppraisalsStore {
	private masterPropertyStorage = new PropertiesStore();
	private propertyUnitStorage = new PropertyUnitsStore();
	private zoningStorage = new ZoningStore();
	private utilityStorage = new AppraisalIncludedUtility();

	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AppraisalsStore', Appraisals);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find appraisal by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<IAppraisal>): Promise<IAppraisal> {
		try {
			return await Appraisals.findOne({
				where: attributes,
				include: {
					model: AppraisalApproaches,
					include: [IncomeApproaches, SaleApproaches, CostApproaches],
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to create appraisal
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async createAppraisal(attributes: IAppraisalsCreateRequest): Promise<IAppraisal> {
		try {
			return await Appraisals.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Get master property id
	 * @param data
	 * @returns
	 */
	public async getMasterProperty(data) {
		try {
			const coordinates = {
				lat: data.map_pin_lat || data.latitude,
				lng: data.map_pin_lng || data.longitude,
			};

			const address = {
				business_name: data.business_name,
				street_address: data.street_address,
				city: data.city,
				state: data.state,
				zipcode: data.zipcode,
				county: data.county || null,
			};

			return await this.masterPropertyStorage.retrieve(address, coordinates);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to update appraisal
	 * @param attributes
	 * @returns
	 */
	public async updateOverview(attributes: IAppraisalsUpdateRequest): Promise<boolean> {
		try {
			const { zonings, included_utilities, ...data } = attributes;
			// Check id is valid or not
			const isValid = await Appraisals.findByPk(data.id);
			if (!isValid) {
				return false;
			}
			const masterPropertyId = await this.getMasterProperty(data);
			if (masterPropertyId) {
				data.property_id = masterPropertyId;
				if (included_utilities.length) {
					// Add, update and remove utilities
					this.utilityStorage.addUtilities(
						included_utilities,
						data.id,
						AppraisalsEnum.APPRAISAL_ID,
					);
				}
				if (data.comp_type === AppraisalsEnum.LAND_ONLY) {
					data.comparison_basis = AppraisalsEnum.SF;
				}
				// Create the appraisal entry
				const appraisal = await Appraisals.update(data, {
					where: { id: data.id },
				});

				if (appraisal) {
					if (data.comp_type === AppraisalsEnum.BUILDING_WITH_LAND) {
						// Create zonings entries
						const extractZoning: IZoning[] = await Promise.all(
							zonings.map(async (zoning: IZoning) => {
								if (zoning.sub_zone == AppraisalsEnum.TYPE_MY_OWN) {
									zoning.sub_zone = zoning.sub_zone_custom ? zoning.sub_zone_custom : '';
								}
								delete zoning.sub_zone_custom;
								if (data.comparison_basis == AppraisalsEnum.SF) {
									zoning.unit = null;
									zoning.bed = null;
								} else if (data.comparison_basis == AppraisalsEnum.UNIT) {
									zoning.bed = null;
								} else if (data.comparison_basis == AppraisalsEnum.BED) {
									zoning.unit = null;
								}
								return zoning;
							}),
						);
						await this.zoningStorage.addAssociation(
							extractZoning,
							data.id,
							AppraisalsEnum.APPRAISAL_ID,
						);

						await this.updateAppraisal(
							{ land_type: '', analysis_type: AppraisalsEnum.PRICE_SF as string },
							data.id,
						);
					} else if (data.comp_type === AppraisalsEnum.LAND_ONLY) {
						// Removing zonings and property units data when comp type is land only.
						this.zoningStorage.delete({ appraisal_id: data?.id });
						this.updateAppraisal({ building_size: 0 }, data?.id);
					}
					return true;
				}
				return false;
			}
			return false;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description query to update appraisal details.
	 * @param attributes
	 * @param appraisalId
	 * @returns
	 */
	public async updateAppraisal(
		attributes: Partial<IAppraisal>,
		appraisalId: number,
	): Promise<IAppraisal> {
		try {
			if (attributes?.map_selected_area) {
				attributes.map_selected_area = JSON.stringify(attributes.map_selected_area);
			}
			return await Appraisals.update(attributes, {
				where: {
					id: appraisalId,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Find appraisal by id.
	 * @param attributes
	 * @returns
	 */
	public async getAppraisal(attributes: Partial<IAppraisal>): Promise<IAppraisal> {
		try {
			const appraisal = await Appraisals.findOne({
				where: attributes,
				include: [
					Zoning,
					AppraisalsMetaData,
					AppraisalFiles,
					{
						model: Clients,
						as: 'client',
					},
					{
						model: AppraisalApproaches,
						include: [IncomeApproaches, SaleApproaches, CostApproaches, LeaseApproaches],
					},
					Template,
				],
				order: [[AppraisalApproaches, 'type', 'asc']],
			});

			if (appraisal) {
				const { zonings } = appraisal;
				if (zonings && zonings?.length > 0) {
					// Calculate total beds and total units from zonings
					const totalBeds = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.bed || 0),
						0,
					);
					const totalUnits = zonings.reduce(
						(sum: number, zoning: any) => sum + (zoning.unit || 0),
						0,
					);

					// Add total_beds and total_units to the appraisal
					appraisal.setDataValue('total_beds', totalBeds);
					appraisal.setDataValue('total_units', totalUnits);
				}

				const response = appraisal.toJSON(); // Convert the instance to JSON
				return response as IAppraisal; // Ensure the response type matches IAppraisal
			}

			return appraisal;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to get all appraisals list.
	 * @param attributes
	 * @returns
	 */
	public async getAppraisalList(
		attributes: Partial<IAppraisalListRequest>,
	): Promise<IAppraisalListSuccess> {
		try {
			const filters: any = {};
			const {
				page = 1,
				search,
				limit,
				businessName,
				compType,
				city,
				state,
				streetAddress,
				userId,
				accountId,
			} = attributes;
			let { orderByColumn, orderBy, dateOfAnalysisFrom, dateOfAnalysisTo } = attributes;
			//Applying pagination
			const offset = (page - 1) * limit;

			//Applying searching
			if (search) {
				filters[Op.or] = [
					{ street_address: { [Op.like]: `%${search}%` } },
					{ business_name: { [Op.like]: `%${search}%` } },
					{ '$client.first_name$': { [Op.like]: `%${search}%` } },
					{ '$client.last_name$': { [Op.like]: `%${search}%` } },
					{ '$client.company$': { [Op.like]: `%${search}%` } },
					// Add full name match using CONCAT
					where(fn('CONCAT', col('client.first_name'), ' ', col('client.last_name')), {
						[Op.like]: `%${search}%`,
					}),
				];
			}

			if (!orderByColumn) {
				orderByColumn = AppraisalsEnum.ID;
			}
			if (!orderBy) {
				orderBy = DefaultEnum.DECENDING;
			}

			if (userId) {
				filters.user_id = userId;
			}
			if (accountId) {
				filters.account_id = accountId;
			}
			// To filter name
			if (businessName) {
				filters.business_name = businessName;
			}
			// To filter comp type
			if (compType) {
				filters.comp_type = compType;
			}
			// To filter state
			if (state) {
				filters.state = state;
			}
			// To filter city
			if (city?.length) {
				filters.city = { [Op.in]: city };
			}
			// Filter for street address
			if (streetAddress) {
				filters.street_address = { [Op.like]: `%${streetAddress}%` };
			}

			// Converting request date format.
			if (dateOfAnalysisFrom) {
				dateOfAnalysisFrom = changeDateFormat(dateOfAnalysisFrom);
			}
			if (dateOfAnalysisTo) {
				dateOfAnalysisTo = changeDateFormat(dateOfAnalysisTo);
			}

			// Applying filters for date of analysis
			if (dateOfAnalysisFrom && dateOfAnalysisTo) {
				filters.date_of_analysis = {
					[Op.between]: [dateOfAnalysisFrom, dateOfAnalysisTo],
					[Op.not]: null,
				};
			} else if (dateOfAnalysisFrom) {
				filters.date_of_analysis = { [Op.gte]: dateOfAnalysisFrom, [Op.not]: null };
			} else if (dateOfAnalysisTo) {
				filters.date_of_analysis = { [Op.lte]: dateOfAnalysisTo, [Op.not]: null };
			}

			const { count, rows } = await Appraisals.findAndCountAll({
				limit: Number(limit),
				offset: offset,
				order: [[orderByColumn, orderBy]],
				where: filters,
				distinct: true,
				attributes: [
					'id',
					'property_id',
					'user_id',
					'account_id',
					'client_id',
					'business_name',
					'street_address',
					'street_suite',
					'city',
					'county',
					'state',
					'zipcode',
					'type',
					'comp_type',
					'date_of_analysis',
					'position',
				],
				include: [
					{
						model: Clients,
						as: 'client',
						attributes: ['id', 'first_name', 'last_name', 'company'],
						where: {},
					},
					{ model: AppraisalApproaches, attributes: ['type'] },
				],
			});

			// Aggregating distinct appraisal_approaches types
			const appraisals = rows.map((appraisal: any) => {
				if (appraisal.appraisal_approaches) {
					const uniqueTypes = Array.from(
						new Set(appraisal.appraisal_approaches.map((approach: any) => approach.type)),
					);
					appraisal.dataValues.appraisal_approaches_types = uniqueTypes;
				} else {
					appraisal.dataValues.appraisal_approaches_types = [];
				}
				return appraisal;
			});
			return { appraisals, page, perPage: limit, totalRecords: count };
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Query to delete appraisal by.
	 * @param attributes
	 * @returns
	 */
	public async deleteAppraisal(attributes: IDeleteAppraisal): Promise<boolean> {
		try {
			return await Appraisals.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}
	/**
	 * @description Function to get appraisal info for pdf.
	 * @param attributes
	 * @returns
	 */
	public async getAppraisalInfoForPdf(attributes: Partial<IAppraisal>): Promise<IAppraisal> {
		try {
			const appraisal = await Appraisals.findOne({
				where: attributes,
				include: [
					Zoning,
					// AppraisalsMetaData,
					// AppraisalFiles,
					// AppraisalIncludedUtilities,
					{
						model: AppraisalApproaches,
						include: [
							{
								model: IncomeApproaches,
								include: [
									{ model: IncomeOperatingExp, as: 'operatingExpenses' },
									{ model: IncomeApproachSource, as: 'incomeSources' },
								],
							},
							{
								model: CostApproaches,
								include: [
									{ model: CostSubAdjustments, as: 'cost_subject_property_adjustments' },
									{ model: CostImprovements, as: 'improvements' },
									{
										model: CostComps,
										as: 'comps',
										include: [{ model: CostCompAdjustments, as: 'comps_adjustments' }],
									},
								],
							},
							{
								model: SaleApproaches,
								include: [
									{ model: SalesSubAdjustments, as: 'subject_property_adjustments' },
									{
										model: SaleComps,
										as: 'comps',
										include: [{ model: SaleCompAdjustments, as: 'comps_adjustments' }],
									},
								],
							},
						],
					},
				],
			});
			return appraisal;
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Function to check linked comps to appraisal approach
	 * @param attributes
	 * @returns
	 */
	public async getLinkedComps(attributes: Partial<IAppraisal>): Promise<IAppraisal> {
		try {
			const appraisal = await Appraisals.findOne({
				where: attributes,
				include: [
					{
						model: AppraisalApproaches,
						include: [
							{
								model: CostApproaches,
								include: [
									{
										model: CostComps,
										as: 'comps',
									},
								],
							},
							{
								model: SaleApproaches,
								include: [
									{
										model: SaleComps,
										as: 'comps',
									},
								],
							},
							{
								model: LeaseApproaches,
								include: [
									{
										model: LeaseComps,
										as: 'comps',
									},
								],
							},
						],
					},
				],
			});
			return appraisal;
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Find appraisal by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findValidAppraisal(id: number): Promise<IAppraisal> {
		try {
			return await Appraisals.findByPk(id);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to get all sale comparative attributes.
	 * @param attributes
	 * @returns
	 */
	public async getAllSaleComparativeAttributes(
		attributes,
	): Promise<ISaleComparitiveAttributesList[]> {
		try {
			const { code, status } = attributes;
			const category = await GlobalCodeCategories.findOne({
				where: { type: 'appraisal_types' },
			});

			if (!category) {
				return;
			}
			const gCode = await GlobalCodes.findOne({
				where: {
					global_code_category_id: category?.id,
					code,
					status,
				},
			});
			const saleAttributesIds = await SaleComparativeAttributeList.findAll({
				where: { appraisal_type_id: gCode.id },
				attributes: ['id', 'sales_comparative_attribute_id', 'default'],
				raw: true,
			});
			const saleAttributesIdsArray = saleAttributesIds.map((item) => item.id);

			const globalCodes = await SaleComparativeAttributeList.findAll({
				attributes: ['id', 'sales_comparative_attribute_id', 'appraisal_type_id', 'default'],
				where: { id: { [Op.in]: saleAttributesIdsArray } },
				include: [
					{
						model: GlobalCodes,
						required: true, // Ensures only matching records are fetched
						where: { status },
						attributes: ['code', 'name'],
					},
				],
				order: [[GlobalCodes, 'name', 'ASC']],
			});
			const newList = globalCodes.map((code) => {
				const codeJSON = code.toJSON();
				const { global_code, ...rest } = codeJSON; // Destructure and exclude the unwanted field
				const attributes = global_code || {};
				return { ...rest, ...attributes }; // Merge the remaining fields with attributes
			});
			return newList;
		} catch (e) {
			return e.message || e;
		}
	}
}
