import { currentDateTime } from '../utils/common/Time';

const res_evaluation_scenarios = (sequelize, DataTypes, model) => {
	const res_evaluation_scenarios = sequelize.define(
		'res_evaluation_scenarios',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			res_evaluation_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			has_income_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_sales_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_cost_approach: {
				type: DataTypes.TINYINT(1),
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
			weighted_market_value: {
				type: DataTypes.DECIMAL(10, 2),
			},
			rounding: {
				type: DataTypes.INTEGER(11),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'res_evaluation_scenarios',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	res_evaluation_scenarios.hasOne(model.res_evaluation_income_approaches, {
		foreignKey: 'res_evaluation_scenario_id',
		sourceKey: 'id',
	});
	res_evaluation_scenarios.hasOne(model.res_evaluation_cost_approaches, {
		foreignKey: 'res_evaluation_scenario_id',
		sourceKey: 'id',
	});
	res_evaluation_scenarios.hasOne(model.res_evaluation_sales_approaches, {
		foreignKey: 'res_evaluation_scenario_id',
		sourceKey: 'id',
	});
	return res_evaluation_scenarios;
};
export default res_evaluation_scenarios;
