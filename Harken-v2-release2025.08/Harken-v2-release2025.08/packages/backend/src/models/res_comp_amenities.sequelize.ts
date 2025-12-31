import { currentDateTime } from '../utils/common/Time';

const res_comp_amenities = (sequelize, DataTypes) => {
	const res_comp_amenities = sequelize.define(
		'res_comp_amenities',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			res_comp_id: {
				type: DataTypes.INTEGER(11),
			},
			additional_amenities: {
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
			tableName: 'res_comp_amenities',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return res_comp_amenities;
};
export default res_comp_amenities;
