import { currentDateTime } from '../utils/common/Time';

const company = (sequelize, DataTypes) => {
	const company = sequelize.define(
		'company',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			full_name: {
				type: DataTypes.STRING(255),
				allowNull: true,
				defaultValue: '',
			},
			company_name: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			email_address: {
				type: DataTypes.STRING(255),
				allowNull: true,
				defaultValue: '',
			},
			account_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
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
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'company',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return company;
};
export default company;
