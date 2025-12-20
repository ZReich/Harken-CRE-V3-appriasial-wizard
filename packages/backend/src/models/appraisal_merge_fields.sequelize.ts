import { currentDateTime } from '../utils/common/Time';

const appraisal_merge_fields = (sequelize, DataTypes) => {
	const appraisal_merge_fields = sequelize.define(
		'appraisal_merge_fields',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			key: {
				type: DataTypes.STRING(100),
			},
			tag: {
				type: DataTypes.STRING(100),
			},
			field: {
				type: DataTypes.STRING(100),
			},
			type: {
				type: DataTypes.STRING(100),
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
			tableName: 'appraisal_merge_fields',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisal_merge_fields;
};

export default appraisal_merge_fields;
