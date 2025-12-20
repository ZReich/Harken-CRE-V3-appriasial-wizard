import { currentDateTime } from '../utils/common/Time';

const clients = (sequelize, DataTypes) => {
	const clients = sequelize.define(
		'clients',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			account_id: {
				type: DataTypes.INTEGER(11),
			},
			user_id: {
				type: DataTypes.INTEGER(11),
			},
			first_name: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			last_name: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			title: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			street_address: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			city: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			state: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			zipcode: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			place_id: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			company: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			phone_number: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			email_address: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			shared: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			last_updated: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'clients',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return clients;
};
export default clients;
