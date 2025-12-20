import { currentDateTime } from '../utils/common/Time';

const accounts = (sequelize, DataTypes, model) => {
	const accounts = sequelize.define(
		'accounts',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			customer_id: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			subscription_id: {
				type: DataTypes.TEXT,
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			street_address: {
				type: DataTypes.TEXT,
			},
			city: {
				type: DataTypes.STRING(255),
			},
			state: {
				type: DataTypes.STRING(255),
			},
			zipcode: {
				type: DataTypes.INTEGER(11),
			},
			phone_number: {
				type: DataTypes.STRING(255),
			},
			detail: {
				type: DataTypes.TEXT,
			},
			settings: {
				type: DataTypes.TEXT,
			},
			share_clients: {
				type: DataTypes.TINYINT(4),
				defaultValue: 0,
			},
			manager_email: {
				type: DataTypes.TEXT,
			},
			status: {
				type: DataTypes.TINYINT(4),
				allowNull: false,
				defaultValue: 1,
			},
			third_party_uid: {
				type: DataTypes.STRING(255),
			},
			g_place_id: {
				type: DataTypes.STRING(255),
			},
			theme: {
				type: DataTypes.STRING(255),
			},
			logo_url: {
				type: DataTypes.TEXT,
			},
			data: {
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
			subscription_plan: {
				type: DataTypes.TEXT,
			},
			eval_access: {
				type: DataTypes.TINYINT(1),
			},
			created_by: {
				type: DataTypes.INTEGER(11),
			},
			subscription: {
				type: DataTypes.STRING(255),
			},
			per_user_price: {
				type: DataTypes.FLOAT,
			},
			first_login: {
				type: DataTypes.TINYINT(4),
				defaultValue: 0,
			},
			primary_color: {
				type: DataTypes.STRING(20),
			},
			secondary_color: {
				type: DataTypes.STRING(20),
			},
			tertiary_color: {
				type: DataTypes.STRING(20),
			},
			enable_residential: {
				type: DataTypes.STRING(1),
				defaultValue: 'N',
			},
			is_deleted: {
				type: DataTypes.TINYINT(4),
				allowNull: false,
				defaultValue: 0,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt,
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	accounts.hasMany(model.template, {
		foreignKey: 'account_id',
		sourceKey: 'id',
	});
	return accounts;
};
export default accounts;
