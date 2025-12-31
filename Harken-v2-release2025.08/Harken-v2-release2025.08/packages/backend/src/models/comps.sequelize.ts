import { currentDateTime } from '../utils/common/Time';
import DefaultEnum from '../utils/enums/DefaultEnum';

const comps = (sequelize, DataTypes) => {
	const comps = sequelize.define(
		'comps',
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
			property_image_url: {
				type: DataTypes.TEXT,
			},
			condition: {
				type: DataTypes.TEXT,
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
			sale_price: {
				type: DataTypes.DOUBLE,
			},
			price_square_foot: {
				type: DataTypes.DOUBLE,
			},
			lease_rate: {
				type: DataTypes.DOUBLE,
				default: 0,
			},
			term: {
				type: DataTypes.DOUBLE,
			},
			concessions: {
				type: DataTypes.TEXT,
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
			date_sold: {
				type: DataTypes.DATEONLY,
			},
			summary: {
				type: DataTypes.TEXT,
			},
			parcel_id_apn: {
				type: DataTypes.STRING(255),
			},
			frontage: {
				type: DataTypes.STRING(255),
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
			map_pin_lat: {
				type: DataTypes.TEXT,
			},
			map_pin_lng: {
				type: DataTypes.TEXT,
			},
			map_pin_zoom: {
				type: DataTypes.INTEGER(11),
			},
			latitude: {
				type: DataTypes.STRING(255),
			},
			longitude: {
				type: DataTypes.STRING(255),
			},
			net_operating_income: {
				type: DataTypes.DOUBLE,
			},
			cap_rate: {
				type: DataTypes.DOUBLE,
			},
			created: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			last_updated: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			},
			comp_type: {
				type: DataTypes.STRING(255),
			},
			land_type: {
				type: DataTypes.STRING(255),
			},
			lease_type: {
				type: DataTypes.STRING(255),
			},
			topography: {
				type: DataTypes.STRING(255),
			},
			lot_shape: {
				type: DataTypes.STRING(255),
			},
			lease_rate_unit: {
				type: DataTypes.STRING(255),
			},
			space: {
				type: DataTypes.DOUBLE,
			},
			cam: {
				type: DataTypes.DOUBLE,
			},
			date_execution: {
				type: DataTypes.STRING(255),
			},
			date_commencement: {
				type: DataTypes.STRING(255),
			},
			date_expiration: {
				type: DataTypes.STRING(255),
			},
			TI_allowance: {
				type: DataTypes.DOUBLE,
			},
			TI_allowance_unit: {
				type: DataTypes.STRING(255),
			},
			asking_rent: {
				type: DataTypes.DOUBLE,
			},
			asking_rent_unit: {
				type: DataTypes.STRING(255),
			},
			escalators: {
				type: DataTypes.DOUBLE,
			},
			free_rent: {
				type: DataTypes.DOUBLE,
			},
			lease_status: {
				type: DataTypes.STRING(255),
			},
			total_operating_expense: {
				type: DataTypes.DOUBLE,
			},
			operating_expense_psf: {
				type: DataTypes.DOUBLE,
			},
			list_price: {
				type: DataTypes.DOUBLE,
			},
			date_list: {
				type: DataTypes.STRING(255),
			},
			days_on_market: {
				type: DataTypes.INTEGER(11),
			},
			total_concessions: {
				type: DataTypes.DOUBLE,
			},
			offeror_type: {
				type: DataTypes.STRING(255),
			},
			offeror_id: {
				type: DataTypes.INTEGER(11),
			},
			acquirer_type: {
				type: DataTypes.STRING(255),
			},
			acquirer_id: {
				type: DataTypes.INTEGER(11),
			},
			private_comp: {
				type: DataTypes.TINYINT(4),
				defaultValue: 0,
			},
			sale_status: {
				type: DataTypes.STRING(10),
			},
			comparison_basis: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.SF,
				allowNull: false,
			},
			occupancy: {
				type: DataTypes.TEXT,
			},
			location_desc: {
				type: DataTypes.TEXT,
			},
			legal_desc: {
				type: DataTypes.TEXT,
			},
			grantor: {
				type: DataTypes.STRING(255),
			},
			grantee: {
				type: DataTypes.STRING(255),
			},
			instrument: {
				type: DataTypes.STRING(255),
			},
			confirmed_by: {
				type: DataTypes.STRING(255),
			},
			confirmed_with: {
				type: DataTypes.STRING(255),
			},
			financing: {
				type: DataTypes.STRING(255),
			},
			marketing_time: {
				type: DataTypes.STRING(255),
			},
			est_land_value: {
				type: DataTypes.DOUBLE,
			},
			est_building_value: {
				type: DataTypes.DOUBLE,
			},
			construction_class: {
				type: DataTypes.STRING(255),
			},
			stories: {
				type: DataTypes.STRING(255),
			},
			site_access: {
				type: DataTypes.STRING(255),
			},
			gross_building_area: {
				type: DataTypes.DOUBLE,
			},
			net_building_area: {
				type: DataTypes.DOUBLE,
			},
			site_coverage_percent: {
				type: DataTypes.DOUBLE,
			},
			effective_age: {
				type: DataTypes.STRING(255),
			},
			site_comments: {
				type: DataTypes.TEXT,
			},
			building_comments: {
				type: DataTypes.TEXT,
			},
			included_utilities: {
				type: DataTypes.TEXT,
			},
			other_include_utilities: {
				type: DataTypes.TEXT,
			},
			parking: {
				type: DataTypes.TEXT,
			},
			ai_generated: {
				type: DataTypes.TINYINT(4),
				defaultValue: 0,
				allowNull: false,
			},
			google_place_id: {
				type: DataTypes.STRING(255),
				allowNull: true,
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
	return comps;
};
export default comps;
