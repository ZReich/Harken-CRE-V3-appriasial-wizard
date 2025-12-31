import { currentDateTime } from '../utils/common/Time';

const appraisals_included_utilities = (sequelize, DataTypes) => {
	const appraisals_included_utilities = sequelize.define(
		'appraisals_included_utilities',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			appraisal_id: {
				type: DataTypes.INTEGER(11),
			},
			utility: {
				type: DataTypes.TEXT,
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
			timestamps: false, // Disable createdAt and updatedAt,
			tableName: 'appraisals_included_utilities',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisals_included_utilities;
};

export default appraisals_included_utilities;
