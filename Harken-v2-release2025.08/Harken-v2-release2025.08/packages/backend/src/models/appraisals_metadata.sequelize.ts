import { currentDateTime } from '../utils/common/Time';

const appraisals_metadata = (sequelize, DataTypes) => {
	const appraisalMetaData = sequelize.define(
		'appraisals_metadata',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING(255),
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
			tableName: 'appraisals_metadata',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisalMetaData;
};
export default appraisals_metadata;
