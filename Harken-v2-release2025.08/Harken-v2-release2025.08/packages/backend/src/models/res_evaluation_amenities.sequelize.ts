import { currentDateTime } from '../utils/common/Time';

const res_evaluation_amenities = (sequelize, DataTypes) => {
	const res_evaluation_amenities = sequelize.define(
		'res_evaluation_amenities',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			res_evaluation_id: {
				type: DataTypes.INTEGER(11),
			},
			additional_amenities: {
				type: DataTypes.TEXT,
			},
			order: {
				type: DataTypes.INTEGER(11),
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
			tableName: 'res_evaluation_amenities',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return res_evaluation_amenities;
};
export default res_evaluation_amenities;
