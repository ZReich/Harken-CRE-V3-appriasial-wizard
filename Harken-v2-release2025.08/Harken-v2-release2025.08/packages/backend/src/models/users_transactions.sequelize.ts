import { currentDateTime } from '../utils/common/Time';

const users_transactions = (sequelize, DataTypes) => {
	const users_transactions = sequelize.define(
		'users_transactions',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			user_id: {
				type: DataTypes.INTEGER(11),
			},
			name: {
				type: DataTypes.TEXT,
			},
			sf: {
				type: DataTypes.TEXT,
			},
			category: {
				type: DataTypes.TEXT,
			},
			type: {
				type: DataTypes.TEXT,
			},
			date_created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			last_updated: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
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
	return users_transactions;
};

export default users_transactions;
