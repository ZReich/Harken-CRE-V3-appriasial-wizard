import { currentDateTime } from '../utils/common/Time';

const appraisal_lease_approach_subject_adj = (sequelize, DataTypes) => {
	const appraisal_lease_approach_subject_adj = sequelize.define(
		'appraisal_lease_approach_subject_adj',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_lease_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			adj_key: {
				type: DataTypes.STRING(50),
			},
			adj_value: {
				type: DataTypes.STRING(50),
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
			tableName: 'appraisal_lease_approach_subject_adj',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisal_lease_approach_subject_adj;
};
export default appraisal_lease_approach_subject_adj;
