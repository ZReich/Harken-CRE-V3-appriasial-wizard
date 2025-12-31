import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const AppraisalSalesApproach = database.appraisal_sales_approaches;
const SalesApproachComps = database.appraisal_sales_approach_comps;
const SalesApproachSubjectAdj = database.appraisal_sales_approach_subject_adj;
const SalesApproachCompAdj = database.appraisal_sales_approach_comp_adj;
const Comps = database.comps;
const Zoning = database.zoning;
const SubjectQualitativeAdj = database.appraisal_sales_approach_qualitative_sub_adj;
const SaleQualitativeCompsAdj = database.appraisal_sales_approach_qualitative_comp_adj;
const SalesComparisonAttribute = database.appraisal_sales_approach_comparison_attributes;
const PropertyUnits = database.property_units;
import HelperFunction from '../../utils/common/helper';
import { ISalesApproach, ISalesApproachesRequest } from './IAppraisalSalesService';
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';

const helperFunction = new HelperFunction();
export default class AppraisalSalesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AppraisalSalesStore', AppraisalSalesApproach);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to save sales approach
	 * @param attributes
	 * @returns
	 */
	public async createSalesApproach(
		attributes: Partial<ISalesApproachesRequest>,
	): Promise<ISalesApproach> {
		try {
			const {
				sales_comparison_attributes,
				subject_property_adjustments,
				subject_qualitative_adjustments,
				comps,
				...rest
			} = attributes;

			const updatedSubjectPropertyAdjustments = subject_property_adjustments
				.filter((item) => item?.adj_key && item?.adj_key.trim() !== '')
				.map((item, index) => ({
					...item,
					order: index + 1, // Start order from 1 and increment by 1
				}));

			let updateSubQualitativeAdjustments = [];
			if (subject_qualitative_adjustments?.length > 0) {
				updateSubQualitativeAdjustments = subject_qualitative_adjustments
					.filter((item) => item?.adj_key && item?.adj_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}
			let updateComparisonAttributes = [];
			if (sales_comparison_attributes?.length > 0) {
				updateComparisonAttributes = sales_comparison_attributes
					.filter((item) => item?.comparison_key && item?.comparison_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}
			// Prepare nested comps data
			const nestedComps =
				comps?.map((comp) => ({
					...comp,
					comps_adjustments: comp?.comps_adjustments || [],
					comps_qualitative_adjustments: comp?.comps_qualitative_adjustments || [],
				})) || [];

			return await AppraisalSalesApproach.create(
				{
					...rest,
					sales_comparison_attributes: updateComparisonAttributes || [],
					subject_property_adjustments: updatedSubjectPropertyAdjustments || [],
					subject_qualitative_adjustments: updateSubQualitativeAdjustments,
					comps: nestedComps,
				},
				{
					include: [
						{ model: SalesComparisonAttribute, as: 'sales_comparison_attributes' },
						{ model: SalesApproachSubjectAdj, as: 'subject_property_adjustments' },
						{ model: SubjectQualitativeAdj, as: 'subject_qualitative_adjustments' },
						{
							model: SalesApproachComps,
							as: 'comps',
							include: [
								{ model: SalesApproachCompAdj, as: 'comps_adjustments' },
								{ model: SaleQualitativeCompsAdj, as: 'comps_qualitative_adjustments' },
							],
						},
					],
				},
			);
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
	 * @description Function to find sales approach by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(
		attributes: Partial<ISalesApproach>,
	): Promise<ISalesApproach | null> {
		try {
			const appraisalSalesApproach = await AppraisalSalesApproach.findOne({
				where: attributes,
				attributes: [
					'id',
					'appraisal_approach_id',
					'weight',
					'averaged_adjusted_psf',
					'sales_approach_value',
					'note',
					'total_comp_adj',
					'sales_approach_indicated_val',
					'area_map_zoom',
					'map_type',
					'map_center_lat',
					'map_center_lng',
				],
				include: [
					{
						model: SalesComparisonAttribute,
						as: 'sales_comparison_attributes',
						attributes: ['comparison_key', 'comparison_value'],
					},
					{
						model: SalesApproachSubjectAdj,
						as: 'subject_property_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: SubjectQualitativeAdj,
						as: 'subject_qualitative_adjustments',
						attributes: ['adj_key', 'adj_value', 'subject_property_value'],
					},
				],
				order: [
					[
						{ model: SalesApproachSubjectAdj, as: 'subject_property_adjustments' },
						AppraisalsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: SubjectQualitativeAdj, as: 'subject_qualitative_adjustments' },
						AppraisalsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: SalesComparisonAttribute, as: 'sales_comparison_attributes' },
						AppraisalsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
				],
			});

			if (!appraisalSalesApproach) {
				return null; // Early exit if no record is found
			}

			const linkedComps = await SalesApproachComps.findAll({
				where: { appraisal_sales_approach_id: appraisalSalesApproach.id },
				attributes: [
					'id',
					'comp_id',
					'adjustment_note',
					'total_adjustment',
					'adjusted_psf',
					'weight',
					'blended_adjusted_psf',
					'averaged_adjusted_psf',
					'overall_comparability',
					'order',
				],
				include: [
					{
						model: SalesApproachCompAdj,
						as: 'comps_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: SaleQualitativeCompsAdj,
						as: 'comps_qualitative_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
				],
				order: [[AppraisalsEnum.ORDER_BY_COLUMN, 'ASC']],
			});

			// Fetch and attach comp details in parallel
			const compDetails = await Promise.all(
				linkedComps.map(async (comp) => {
					const compData = await Comps.findOne({
						where: { id: comp.comp_id },
						attributes: [
							'id',
							'property_id',
							'business_name',
							'street_address',
							'street_suite',
							'city',
							'county',
							'state',
							'zipcode',
							'type',
							'property_image_url',
							'condition',
							'year_built',
							'year_remodeled',
							'sale_price',
							'price_square_foot',
							'lease_rate',
							'term',
							'building_size',
							'land_size',
							'land_dimension',
							'date_sold',
							'frontage',
							'utilities_select',
							'zoning_type',
							'map_pin_lat',
							'map_pin_lng',
							'map_pin_zoom',
							'latitude',
							'longitude',
							'cap_rate',
							'comp_type',
							'land_type',
							'lease_type',
							'topography',
							'lot_shape',
							'lease_rate_unit',
							'space',
							'comparison_basis',
							'effective_age',
							'grantor',
							'grantee',
							'sale_status',
						],
						include: [
							{
								model: Zoning,
								// attributes: ['bed', 'unit', 'sq_ft'],
							},
							{ model: PropertyUnits, attributes: ['beds', 'baths', 'sq_ft'] },
						],
					});

					if (!compData) return null;

					const plainData = compData.get({ plain: true });

					// Calculate totals
					plainData.total_beds = await helperFunction.calculateTotal(plainData.zonings, 'bed');
					plainData.total_units = await helperFunction.calculateTotal(plainData.zonings, 'unit');
					plainData.total_property_beds = await helperFunction.calculateTotal(
						plainData.property_units,
						'beds',
					);
					plainData.total_property_baths = await helperFunction.calculateTotal(
						plainData.property_units,
						'baths',
					);

					return { ...comp.get({ plain: true }), comp_details: plainData };
				}),
			);

			// Add comp details to the response
			return {
				...appraisalSalesApproach.toJSON(),
				comps: compDetails.filter(Boolean), // Remove null values
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
	 * @description function to update income approach details.
	 * @param attributes
	 * @returns
	 */
	public async updateSalesApproach(attributes: Partial<ISalesApproach>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalSalesApproach.update(rest, {
				where: {
					id: id,
				},
			});
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
	 * @description Find appraisal by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findOne(attributes: Partial<ISalesApproach>): Promise<ISalesApproach> {
		try {
			return await AppraisalSalesApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}
}
