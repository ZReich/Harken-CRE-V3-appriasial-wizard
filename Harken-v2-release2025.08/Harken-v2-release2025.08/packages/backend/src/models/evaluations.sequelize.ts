import { currentDateTime } from '../utils/common/Time';
import DefaultEnum from '../utils/enums/DefaultEnum';

const evaluations = (sequelize, DataTypes, model) => {
	const evaluations = sequelize.define(
		'evaluations',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			property_id: {
				type: DataTypes.INTEGER(11),
			},
			user_id: {
				type: DataTypes.INTEGER(11),
			},
			account_id: {
				type: DataTypes.INTEGER(11),
			},
			client_id: {
				type: DataTypes.INTEGER(11),
			},
			evaluation_type: {
				type: DataTypes.STRING(30),
			},
			business_name: {
				type: DataTypes.STRING(255),
			},
			street_address: {
				type: DataTypes.STRING(255),
			},
			street_suite: {
				type: DataTypes.STRING(255),
			},
			city: {
				type: DataTypes.STRING(255),
			},
			county: {
				type: DataTypes.STRING(255),
			},
			state: {
				type: DataTypes.STRING(255),
			},
			zipcode: {
				type: DataTypes.INTEGER(11),
			},
			type: {
				type: DataTypes.STRING(255),
			},
			under_contract_price: {
				type: DataTypes.DECIMAL(10, 2),
			},
			close_date: {
				// type: DataTypes.DATE,
				type: DataTypes.DATEONLY,
			},
			last_transferred_date: {
				// type: DataTypes.DATE,
				type: DataTypes.DATEONLY,
			},
			price: {
				type: DataTypes.DECIMAL(10, 2),
			},
			land_assessment: {
				type: DataTypes.DECIMAL(10, 2),
			},
			structure_assessment: {
				type: DataTypes.DECIMAL(10, 2),
			},
			sids: {
				type: DataTypes.TEXT,
			},
			taxes_in_arrears: {
				type: DataTypes.DECIMAL(10, 2),
			},
			tax_liability: {
				type: DataTypes.DECIMAL(10, 2),
			},
			condition: {
				type: DataTypes.STRING(255),
			},
			property_class: {
				type: DataTypes.STRING(255),
			},
			year_built: {
				type: DataTypes.STRING(255),
			},
			year_remodeled: {
				type: DataTypes.STRING(255),
			},
			price_square_foot: {
				type: DataTypes.DOUBLE,
			},
			building_size: {
				type: DataTypes.DOUBLE,
			},
			land_size: {
				type: DataTypes.DOUBLE,
			},
			land_dimension: {
				type: DataTypes.TEXT,
			},
			no_stories: {
				type: DataTypes.STRING(255),
			},
			parcel_id_apn: {
				type: DataTypes.STRING(255),
			},
			has_income_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_lease_comps: {
				type: DataTypes.TINYINT(1),
			},
			has_cap_comps: {
				type: DataTypes.TINYINT(1),
			},
			has_multi_family: {
				type: DataTypes.TINYINT(1),
			},
			has_sales_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_cost_approach: {
				type: DataTypes.TINYINT(1),
			},
			owner_of_record: {
				type: DataTypes.TEXT,
			},
			property_geocode: {
				type: DataTypes.TEXT,
			},
			property_legal: {
				type: DataTypes.TEXT,
			},
			property_rights: {
				type: DataTypes.TEXT,
			},
			high_and_best_user: {
				type: DataTypes.TEXT,
			},
			intended_use: {
				type: DataTypes.TEXT,
			},
			intended_user: {
				type: DataTypes.TEXT,
			},
			topography: {
				type: DataTypes.STRING(255),
			},
			frontage: {
				type: DataTypes.STRING(255),
			},
			front_feet: {
				type: DataTypes.DOUBLE,
			},
			lot_depth: {
				type: DataTypes.DOUBLE,
			},
			utilities_select: {
				type: DataTypes.STRING(255),
			},
			utilities_text: {
				type: DataTypes.TEXT,
			},
			zoning_type: {
				type: DataTypes.STRING(255),
			},
			zoning_description: {
				type: DataTypes.TEXT,
			},
			height: {
				type: DataTypes.STRING(255),
			},
			main_structure_base: {
				type: DataTypes.TEXT,
			},
			foundation: {
				type: DataTypes.TEXT,
			},
			parking: {
				type: DataTypes.TEXT,
			},
			basement: {
				type: DataTypes.TEXT,
			},
			ada_compliance: {
				type: DataTypes.STRING(255),
			},
			date_of_analysis: {
				// type: DataTypes.DATE,
				type: DataTypes.DATEONLY,
			},
			inspector_name: {
				type: DataTypes.TEXT,
			},
			report_date: {
				// type: DataTypes.DATE,
				type: DataTypes.DATEONLY,
			},
			effective_date: {
				// type: DataTypes.DATE,
				type: DataTypes.DATEONLY,
			},
			exterior: {
				type: DataTypes.TEXT,
			},
			roof: {
				type: DataTypes.TEXT,
			},
			electrical: {
				type: DataTypes.TEXT,
			},
			plumbing: {
				type: DataTypes.TEXT,
			},
			heating_cooling: {
				type: DataTypes.TEXT,
			},
			windows: {
				type: DataTypes.TEXT,
			},
			conforming_use_determination: {
				type: DataTypes.TEXT,
			},
			traffic_street_address: {
				type: DataTypes.TEXT,
			},
			traffic_counts: {
				type: DataTypes.TEXT,
			},
			traffic_count: {
				type: DataTypes.TEXT,
			},
			traffic_input: {
				type: DataTypes.DOUBLE,
			},
			map_image_url: {
				type: DataTypes.TEXT,
			},
			map_zoom: {
				type: DataTypes.INTEGER(11),
			},
			map_selected_area: {
				type: DataTypes.TEXT,
			},
			map_pin_lat: {
				type: DataTypes.TEXT,
			},
			map_pin_lng: {
				type: DataTypes.TEXT,
			},
			map_pin_zoom: {
				type: DataTypes.INTEGER(11),
			},
			map_image_for_report_url: {
				type: DataTypes.TEXT,
			},
			google_place_id: {
				type: DataTypes.TEXT,
			},
			map_pin_image_url: {
				type: DataTypes.INTEGER(11),
			},
			latitude: {
				type: DataTypes.STRING(255),
			},
			longitude: {
				type: DataTypes.STRING(255),
			},
			weighted_market_value: {
				type: DataTypes.DECIMAL(10, 2),
			},
			position: {
				type: DataTypes.TEXT,
			},
			submitted: {
				type: DataTypes.TINYINT(4),
				defaultValue: 0,
			},
			file_number: {
				type: DataTypes.STRING(255),
			},
			summary: {
				type: DataTypes.TEXT,
			},
			rounding: {
				type: DataTypes.INTEGER(11),
			},
			created: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			last_updated: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			},
			last_transfer_date_known: {
				type: DataTypes.STRING(255),
				defaultValue: DefaultEnum.YES,
			},
			most_likely_owner_user: {
				type: DataTypes.TEXT,
			},
			review_summary: {
				type: DataTypes.TEXT,
			},
			comp_adjustment_mode: {
				type: DataTypes.STRING(255),
				defaultValue: DefaultEnum.PERCENT,
			},
			comp_type: {
				type: DataTypes.STRING(255),
			},
			land_type: {
				type: DataTypes.STRING(255),
			},
			lot_shape: {
				type: DataTypes.STRING(255),
			},
			aerial_map_zoom: {
				type: DataTypes.INTEGER(11),
			},
			comp_area_map_zoom: {
				type: DataTypes.INTEGER(11),
			},
			aerial_map_type: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.ROAD_MAP,
			},
			comps_map_type: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.ROAD_MAP,
			},
			assessed_market_year: {
				type: DataTypes.STRING(255),
			},
			tax_liability_year: {
				type: DataTypes.STRING(255),
			},
			total_land_improvement: {
				type: DataTypes.DECIMAL(10, 2),
			},
			analysis_type: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.PRICE_PER_SF,
			},
			comparison_basis: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.SF,
				allowNull: false,
			},
			included_utilities: {
				type: DataTypes.TEXT,
			},
			other_include_utilities: {
				type: DataTypes.TEXT,
			},
			map_center_lat: {
				type: DataTypes.STRING(30),
			},
			map_center_lng: {
				type: DataTypes.STRING(30),
			},
			boundary_map_type: {
				type: DataTypes.STRING(20),
				defaultValue: DefaultEnum.HYBRID_MAP,
			},
			multi_family_comps_map_zoom: {
				type: DataTypes.INTEGER(11),
			},
			multi_family_comps_map_type: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.ROAD_MAP,
			},
			lease_comp_area_map_zoom: {
				type: DataTypes.INTEGER(11),
			},
			lease_comps_map_type: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.ROAD_MAP,
			},
			cap_comps_area_map_zoom: {
				type: DataTypes.INTEGER(11),
			},
			cap_comps_map_type: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.ROAD_MAP,
			},
			cost_comps_area_map_zoom: {
				type: DataTypes.INTEGER(11),
			},
			cost_comps_map_type: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.ROAD_MAP,
			},
			data: {
				type: DataTypes.TEXT,
			},
			photos_taken_by: {
				type: DataTypes.STRING(255),
			},
			photo_date: {
				type: DataTypes.STRING(50),
			},
			file_pdf_url: {
				type: DataTypes.TEXT,
			},
			property_image_url: {
				type: DataTypes.TEXT,
			},
			sale_price: {
				type: DataTypes.FLOAT,
			},
			lease_rate: {
				type: DataTypes.DOUBLE,
			},
			term: {
				type: DataTypes.INTEGER(11),
			},
			concessions: {
				type: DataTypes.TEXT,
			},
			date_sold: {
				// type: DataTypes.DATE,
				type: DataTypes.DATEONLY,
			},
			has_suite_parcel: {
				type: DataTypes.TINYINT(1),
			},
			services: {
				type: DataTypes.STRING(255),
			},
			additional_feature: {
				type: DataTypes.TEXT,
			},
			key_highlights: {
				type: DataTypes.TEXT,
			},
			site_details_north: {
				type: DataTypes.TEXT,
			},
			site_details_south: {
				type: DataTypes.TEXT,
			},
			site_details_east: {
				type: DataTypes.TEXT,
			},
			site_details_west: {
				type: DataTypes.TEXT,
			},
			exhibits: {
				type: DataTypes.TEXT,
			},
			county_details_url: {
				type: DataTypes.TEXT,
			},
			county_tax_url: {
				type: DataTypes.TEXT,
			},
			subdivision_survey_url: {
				type: DataTypes.TEXT,
			},
			linked_evals: {
				type: DataTypes.TEXT,
			},
			reviewed_by: {
				type: DataTypes.INTEGER(11),
			},
			review_date: {
				type: DataTypes.DATEONLY,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluations.hasMany(model.zoning, {
		foreignKey: 'evaluation_id',
		sourceKey: 'id',
	});
	evaluations.hasMany(model.evaluation_photo_pages, {
		foreignKey: 'evaluation_id',
		sourceKey: 'id',
		as: 'photos',
	});
	evaluations.hasMany(model.evaluation_files, {
		foreignKey: 'evaluation_id',
		sourceKey: 'id',
	});
	evaluations.hasMany(model.evaluation_scenarios, {
		foreignKey: 'evaluation_id',
		sourceKey: 'id',
		as: 'scenarios',
	});
	evaluations.hasMany(model.evaluations_metadata, {
		foreignKey: 'evaluation_id',
		sourceKey: 'id',
	});
	evaluations.hasMany(model.evaluation_included_utilities, {
		foreignKey: 'evaluation_id',
		sourceKey: 'id',
	});
	return evaluations;
};
export default evaluations;
