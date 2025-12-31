const zoning = (sequelize, DataTypes, model) => {
	const zoning = sequelize.define(
		'zoning',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			listing_id: {
				type: DataTypes.INTEGER(11),
			},
			comp_id: {
				type: DataTypes.INTEGER(11),
			},
			evaluation_id: {
				type: DataTypes.INTEGER(11),
			},
			appraisal_id: {
				type: DataTypes.INTEGER(11),
			},
			zone: {
				type: DataTypes.TEXT,
			},
			sub_zone: {
				type: DataTypes.TEXT,
			},
			sq_ft: {
				type: DataTypes.FLOAT,
			},
			weight_sf: {
				type: DataTypes.INTEGER(11),
				defaultValue: 100,
			},
			created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			unit: {
				type: DataTypes.FLOAT,
			},
			bed: {
				type: DataTypes.FLOAT,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'zoning',
		},
	);
	zoning.hasMany(model.appraisal_income_approach_source, {
		foreignKey: 'zoning_id',
		sourceKey: 'id',
	});
	zoning.hasMany(model.appraisal_cost_approach_improvements, {
		foreignKey: 'zoning_id',
		sourceKey: 'id',
	});
	// zoning.hasMany(model.eval_income_approach_source, {
	// 	foreignKey: 'zoning_id',
	// 	sourceKey: 'id',
	// });
	zoning.hasMany(model.eval_cost_approach_improvements, {
		foreignKey: 'zoning_id',
		sourceKey: 'id',
	});
	return zoning;
};
export default zoning;
