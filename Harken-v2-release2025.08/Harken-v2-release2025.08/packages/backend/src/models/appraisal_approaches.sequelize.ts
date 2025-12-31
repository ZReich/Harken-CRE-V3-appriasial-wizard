import { currentDateTime } from '../utils/common/Time';

const appraisal_approaches = (sequelize, DataTypes, model) => {
	const appraisal_approaches = sequelize.define(
		'appraisal_approaches',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_id: {
				type: DataTypes.INTEGER(11),
			},
			type: {
				type: DataTypes.STRING(50),
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: true,
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
			tableName: 'appraisal_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	appraisal_approaches.hasOne(model.appraisal_income_approaches, {
		foreignKey: 'appraisal_approach_id',
		sourceKey: 'id',
	});
	appraisal_approaches.hasOne(model.appraisal_sales_approaches, {
		foreignKey: 'appraisal_approach_id',
		sourceKey: 'id',
	});
	appraisal_approaches.hasOne(model.appraisal_cost_approaches, {
		foreignKey: 'appraisal_approach_id',
		sourceKey: 'id',
	});
	appraisal_approaches.hasOne(model.appraisal_lease_approach, {
		foreignKey: 'appraisal_approach_id',
		sourceKey: 'id',
	});
	appraisal_approaches.hasMany(model.section_item, {
		foreignKey: 'appraisal_approach_id',
		sourceKey: 'id',
	});
	appraisal_approaches.hasOne(model.appraisal_rent_roll_type, {
		foreignKey: 'appraisal_approach_id',
		sourceKey: 'id',
	});

	return appraisal_approaches;
};
export default appraisal_approaches;
