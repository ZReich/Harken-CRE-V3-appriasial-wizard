import { currentDateTime } from '../utils/common/Time';

const evaluation_scenarios = (sequelize, DataTypes, model) => {
	const evaluation_scenarios = sequelize.define(
		'evaluation_scenarios',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			evaluation_id: {
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
			has_lease_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_cap_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_multi_family_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_rent_roll_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_sales_approach: {
				type: DataTypes.TINYINT(1),
			},
			has_cost_approach: {
				type: DataTypes.TINYINT(1),
			},
			weighted_market_value: {
				type: DataTypes.DECIMAL(10, 2),
			},
			rounding: {
				type: DataTypes.INTEGER(11),
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
			tableName: 'evaluation_scenarios',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluation_scenarios.hasOne(model.evaluation_income_approaches, {
		foreignKey: 'evaluation_scenario_id',
		sourceKey: 'id',
	});
	evaluation_scenarios.hasOne(model.evaluation_sales_approaches, {
		foreignKey: 'evaluation_scenario_id',
		sourceKey: 'id',
	});
	evaluation_scenarios.hasOne(model.evaluation_cost_approaches, {
		foreignKey: 'evaluation_scenario_id',
		sourceKey: 'id',
	});
	evaluation_scenarios.hasOne(model.evaluation_lease_approaches, {
		foreignKey: 'evaluation_scenario_id',
		sourceKey: 'id',
	});
	evaluation_scenarios.hasOne(model.evaluation_cap_approaches, {
		foreignKey: 'evaluation_scenario_id',
		sourceKey: 'id',
	});
	evaluation_scenarios.hasOne(model.evaluation_multi_family_approaches, {
		foreignKey: 'evaluation_scenario_id',
		sourceKey: 'id',
	});
	evaluation_scenarios.hasOne(model.evaluation_rent_roll_type, {
		foreignKey: 'evaluation_scenario_id',
		sourceKey: 'id',
	});
	return evaluation_scenarios;
};
export default evaluation_scenarios;
