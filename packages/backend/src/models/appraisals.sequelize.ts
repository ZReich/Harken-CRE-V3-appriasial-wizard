import { currentDateTime } from '../utils/common/Time';
import DefaultEnum from '../utils/enums/DefaultEnum';

const appraisals = (sequelize, DataTypes, model) => {
	const appraisals = sequelize.define(
		'appraisals',
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
			appraisal_type: {
				type: DataTypes.STRING(30),
			},
			business_name: {
				type: DataTypes.TEXT,
			},
			street_address: {
				type: DataTypes.TEXT,
			},
			street_suite: {
				type: DataTypes.TEXT,
			},
			city: {
				type: DataTypes.TEXT,
			},
			county: {
				type: DataTypes.TEXT,
			},
			state: {
				type: DataTypes.STRING(10),
			},
			zipcode: {
				type: DataTypes.INTEGER(11),
			},
			type: {
				type: DataTypes.STRING(30),
			},
			under_contract_price: {
				type: DataTypes.DECIMAL(10, 2),
			},
			close_date: {
				type: DataTypes.STRING(50),
			},
			last_transferred_date: {
				type: DataTypes.STRING(50),
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
				type: DataTypes.TEXT,
			},
			property_class: {
				type: DataTypes.TEXT,
			},
			year_built: {
				type: DataTypes.TEXT,
			},
			year_remodeled: {
				type: DataTypes.TEXT,
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
				type: DataTypes.STRING(20),
			},
			no_stories: {
				type: DataTypes.TEXT,
			},
			parcel_id_apn: {
				type: DataTypes.TEXT,
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
				type: DataTypes.TEXT,
			},
			frontage: {
				type: DataTypes.TEXT,
			},
			front_feet: {
				type: DataTypes.DOUBLE,
			},
			lot_depth: {
				type: DataTypes.DOUBLE,
			},
			utilities_select: {
				type: DataTypes.TEXT,
			},
			zoning_type: {
				type: DataTypes.TEXT,
			},
			zoning_description: {
				type: DataTypes.TEXT,
			},
			height: {
				type: DataTypes.TEXT,
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
				type: DataTypes.TEXT,
			},
			date_of_analysis: {
				type: DataTypes.STRING(50),
			},
			inspector_name: {
				type: DataTypes.TEXT,
			},
			report_date: {
				type: DataTypes.STRING(50),
			},
			effective_date: {
				type: DataTypes.STRING(50),
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
			traffic_count: {
				type: DataTypes.STRING(30),
			},
			traffic_input: {
				type: DataTypes.DOUBLE,
			},
			map_image_url: {
				type: DataTypes.TEXT,
			},
			map_zoom: {
				type: DataTypes.INTEGER(3),
			},
			map_selected_area: {
				type: DataTypes.TEXT,
			},
			map_pin_lat: {
				type: DataTypes.STRING(30),
			},
			map_pin_lng: {
				type: DataTypes.STRING(30),
			},
			map_pin_zoom: {
				type: DataTypes.INTEGER(3),
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
				type: DataTypes.STRING(30),
			},
			longitude: {
				type: DataTypes.STRING(30),
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
				type: DataTypes.STRING(100),
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
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.YES,
			},
			most_likely_owner_user: {
				type: DataTypes.TEXT,
			},
			review_summary: {
				type: DataTypes.TEXT,
			},
			comp_adjustment_mode: {
				type: DataTypes.STRING(20),
				defaultValue: DefaultEnum.PERCENT,
			},
			comp_type: {
				type: DataTypes.STRING(30),
			},
			land_type: {
				type: DataTypes.TEXT,
			},
			lot_shape: {
				type: DataTypes.TEXT,
			},
			aerial_map_zoom: {
				type: DataTypes.INTEGER(3),
			},
			aerial_map_type: {
				type: DataTypes.STRING(20),
				defaultValue: DefaultEnum.ROAD_MAP,
			},
			assessed_market_year: {
				type: DataTypes.STRING(20),
			},
			tax_liability_year: {
				type: DataTypes.STRING(20),
			},
			total_land_improvement: {
				type: DataTypes.DECIMAL(10, 2),
			},
			analysis_type: {
				type: DataTypes.STRING(20),
				defaultValue: DefaultEnum.PRICE_PER_SF,
			},
			comparison_basis: {
				type: DataTypes.STRING(20),
				defaultValue: DefaultEnum.SF,
				allowNull: false,
			},
			included_utilities: {
				type: DataTypes.TEXT,
			},
			other_include_utilities: {
				type: DataTypes.TEXT,
			},
			photos_taken_by: {
				type: DataTypes.STRING(255),
			},
			photo_date: {
				type: DataTypes.STRING(50),
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
	appraisals.hasMany(model.appraisal_approaches, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
	});
	appraisals.hasMany(model.appraisal_files, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
	});

	appraisals.hasMany(model.appraisals_metadata, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
	});
	appraisals.hasMany(model.appraisal_income_approaches, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
	});

	appraisals.hasMany(model.appraisals_included_utilities, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
	});
	appraisals.hasMany(model.zoning, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
	});
	appraisals.hasOne(model.template, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
	});
	return appraisals;
};
export default appraisals;
