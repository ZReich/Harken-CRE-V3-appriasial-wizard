import DefaultEnum from '../utils/enums/DefaultEnum';
import { currentDateTime } from '../utils/common/Time';

const res_comps = (sequelize, DataTypes) => {
	const res_comps = sequelize.define(
		'res_comps',
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
			property_name: {
				type: DataTypes.STRING(255),
			},
			street_address: {
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
				defaultValue: DefaultEnum.SALE,
			},
			property_image_url: {
				type: DataTypes.TEXT,
			},
			condition: {
				type: DataTypes.TEXT,
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
				type: DataTypes.DATE,
			},
			summary: {
				type: DataTypes.TEXT,
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
			basement: {
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
			topography: {
				type: DataTypes.STRING(255),
			},
			lot_shape: {
				type: DataTypes.STRING(255),
			},
			list_price: {
				type: DataTypes.FLOAT,
			},
			date_list: {
				type: DataTypes.STRING(255),
			},
			days_on_market: {
				type: DataTypes.INTEGER(11),
			},
			total_concessions: {
				type: DataTypes.FLOAT,
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
				type: DataTypes.STRING(255),
			},
			bedrooms: {
				type: DataTypes.TEXT,
			},
			bathrooms: {
				type: DataTypes.TEXT,
			},
			garage: {
				type: DataTypes.TEXT,
			},
			fencing: {
				type: DataTypes.TEXT,
			},
			fireplace: {
				type: DataTypes.TEXT,
			},
			other_amenities: {
				type: DataTypes.TEXT,
			},
			created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			last_updated: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
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
	return res_comps;
};
export default res_comps;
