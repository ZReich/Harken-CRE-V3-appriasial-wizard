import { currentDateTime } from '../utils/common/Time';

const global_code_categories = (sequelize, DataTypes) => {
	const global_code_categories = sequelize.define(
		'global_code_categories',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			type: {
				type: DataTypes.STRING(50),
			},
			label: {
				type: DataTypes.STRING(100),
			},
			status: {
				type: DataTypes.TINYINT(1),
				allowNull: false,
				defaultValue: 1,
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
			tableName: 'global_code_categories',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return global_code_categories;
};
export default global_code_categories;
