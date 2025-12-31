import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
const AppraisalLeaseApproach = database.appraisal_lease_approach;
const LeaseApproachComps = database.appraisal_lease_approach_comps;
const LeaseApproachSubjectAdj = database.appraisal_lease_approach_subject_adj;
const LeaseApproachCompAdj = database.appraisal_lease_approach_comp_adj;
const SubjectLeaseQualitativeAdj = database.appraisal_lease_approach_qualitative_sub_adj;
const LeaseQualitativeCompsAdj = database.appraisal_lease_approach_qualitative_comp_adj;
const Comps = database.comps;
const Zoning = database.zoning;
import HelperFunction from '../../utils/common/helper';
import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import { ILeaseApproach, ILeaseApproachRequest } from './IAppraisalLeaseService';

const helperFunction = new HelperFunction();
export default class AppraisalLeaseStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Function to save lease approach
	 * @param attributes
	 * @returns
	 */
	public async createLeaseApproach(
		attributes: Partial<ILeaseApproachRequest>,
	): Promise<ILeaseApproach> {
		try {
			const { subject_property_adjustments, subject_qualitative_adjustments, comps, ...rest } =
				attributes;
			const updatedSubjectPropertyAdjustments = subject_property_adjustments
				.filter((item) => item.adj_key && item.adj_key.trim() !== '')
				.map((item, index) => ({
					...item,
					order: index + 1, // Start order from 1 and increment by 1
				}));
			let updateSubQualitativeAdjustments = [];
			if (subject_qualitative_adjustments?.length > 0) {
				updateSubQualitativeAdjustments = subject_qualitative_adjustments
					.filter((item) => item.adj_key && item.adj_key.trim() !== '')
					.map((item, index) => ({
						...item,
						order: index + 1, // Start order from 1 and increment by 1
					}));
			}
			// Prepare nested comps data
			const nestedComps =
				comps?.map((comp) => ({
					...comp,
					comps_adjustments: comp.comps_adjustments || [],
					comps_qualitative_adjustments: comp.comps_qualitative_adjustments || [],
				})) || [];

			return await AppraisalLeaseApproach.create(
				{
					...rest,
					subject_property_adjustments: updatedSubjectPropertyAdjustments || [],
					subject_qualitative_adjustments: updateSubQualitativeAdjustments,
					comps: nestedComps,
				},
				{
					include: [
						{ model: LeaseApproachSubjectAdj, as: 'subject_property_adjustments' },
						{ model: SubjectLeaseQualitativeAdj, as: 'subject_qualitative_adjustments' },
						{
							model: LeaseApproachComps,
							as: 'comps',
							include: [
								{ model: LeaseApproachCompAdj, as: 'comps_adjustments' },
								{ model: LeaseQualitativeCompsAdj, as: 'comps_qualitative_adjustments' },
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
	 * @description Function to find lease approach by id
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ILeaseApproach>): Promise<ILeaseApproach> {
		try {
			const appraisalLeaseApproach = await AppraisalLeaseApproach.findOne({
				where: attributes,
				attributes: [
					'id',
					'appraisal_approach_id',
					'weight',
					'averaged_adjusted_psf',
					'lease_approach_value',
					'note',
					'lease_comps_notes',
					'total_comp_adj',
					'lease_approach_indicated_val',
					'area_map_zoom',
					'map_type',
					'map_center_lat',
					'map_center_lng',
					'low_adjusted_comp_range',
					'high_adjusted_comp_range',
				],
				include: [
					{
						model: LeaseApproachSubjectAdj,
						as: 'subject_property_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: SubjectLeaseQualitativeAdj,
						as: 'subject_qualitative_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: LeaseApproachComps,
						as: 'comps',
						include: [
							{
								model: LeaseApproachCompAdj,
								as: 'comps_adjustments',
								attributes: ['adj_key', 'adj_value'],
							},
							{
								model: LeaseQualitativeCompsAdj,
								as: 'comps_qualitative_adjustments',
								attributes: ['adj_key', 'adj_value'],
							},
							{
								model: Comps,
								as: 'comp_details',
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
									'lease_status',
								],
								include: [{ model: Zoning, attributes: ['bed', 'unit', 'sq_ft'] }],
							},
						],
					},
				],
				order: [
					[
						{ model: LeaseApproachSubjectAdj, as: 'subject_property_adjustments' },
						AppraisalsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
					[
						{ model: SubjectLeaseQualitativeAdj, as: 'subject_qualitative_adjustments' },
						AppraisalsEnum.ORDER_BY_COLUMN,
						'ASC',
					],
				],
			});

			if (!appraisalLeaseApproach) {
				return null; // Early exit if no record is found
			}
			const linkedComps = await LeaseApproachComps.findAll({
				where: { appraisal_lease_approach_id: appraisalLeaseApproach?.id },
				attributes: [
					'id',
					'comp_id',
					'adjustment_note',
					'total_adjustment',
					'adjusted_psf',
					'weight',
					'blended_adjusted_psf',
					'averaged_adjusted_psf',
					'order',
				],
				include: [
					{
						model: LeaseApproachCompAdj,
						as: 'comps_adjustments',
						attributes: ['adj_key', 'adj_value'],
					},
					{
						model: LeaseQualitativeCompsAdj,
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
						where: { id: comp?.comp_id },
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
							'lease_status',
						],
						include: [
							{
								model: Zoning,
								attributes: ['bed', 'unit', 'sq_ft'],
							},
						],
					});

					if (!compData) return null;

					const plainData = compData.get({ plain: true });

					// Calculate totals
					plainData.total_beds = await helperFunction.calculateTotal(plainData.zonings, 'bed');
					plainData.total_units = await helperFunction.calculateTotal(plainData.zonings, 'unit');

					return { ...comp.get({ plain: true }), comp_details: plainData };
				}),
			);
			// Add comp details to the response
			return {
				...appraisalLeaseApproach.toJSON(),
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
	 * @description function to update lease approach details.
	 * @param attributes
	 * @returns
	 */
	public async updateLeaseApproach(attributes: Partial<ILeaseApproach>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalLeaseApproach.update(rest, {
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
	 * @description Find one lease approach.
	 * @param attributes
	 * @returns
	 */
	public async findOne(attributes: Partial<ILeaseApproach>): Promise<ILeaseApproach> {
		try {
			return await AppraisalLeaseApproach.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}
}
