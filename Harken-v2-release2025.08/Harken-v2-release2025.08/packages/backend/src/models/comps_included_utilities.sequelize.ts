import { currentDateTime } from '../utils/common/Time';

const comps_included_utilities = (sequelize, DataTypes) => {
	const comps_included_utilities = sequelize.define(
		'comps_included_utilities',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			comp_id: {
				type: DataTypes.INTEGER(11),
			},
			utility: {
				type: DataTypes.TEXT,
				allowNull: false,
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
			timestamps: false, // Disable createdAt and updatedAt,
			tableName: 'comps_included_utilities',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return comps_included_utilities;
};

export default comps_included_utilities;
