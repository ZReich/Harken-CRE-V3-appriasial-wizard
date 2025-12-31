import { currentDateTime } from '../utils/common/Time';

const res_evaluations_metadata = (sequelize, DataTypes) => {
	const res_evaluations_metadata = sequelize.define(
		'res_evaluations_metadata',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			res_evaluation_id: {
				type: DataTypes.INTEGER(11),
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			value: {
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
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'res_evaluations_metadata',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return res_evaluations_metadata;
};
export default res_evaluations_metadata;
