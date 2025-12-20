import { currentDateTime } from '../utils/common/Time';

const res_evaluation_income_approaches = (sequelize, DataTypes, model) => {
	const res_evaluation_income_approaches = sequelize.define(
		'res_evaluation_income_approaches',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			res_evaluation_id: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			res_evaluation_scenario_id: {
				type: DataTypes.INTEGER(11),
			},
			eval_weight: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			income_source: {
				type: DataTypes.TEXT,
			},
			operating_expense: {
				type: DataTypes.TEXT,
			},
			net_income: {
				type: DataTypes.TEXT,
			},
			indicated_value_range: {
				type: DataTypes.TEXT,
			},
			indicated_value_psf: {
				type: DataTypes.TEXT,
			},
			incremental_value: {
				type: DataTypes.DOUBLE,
			},
			incremental_value_monthly: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true,
			},
			total: {
				type: DataTypes.TEXT,
			},
			vacancy: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			adjusted_gross_amount: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			vacant_amount: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			date_created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			last_updated: {
				type: DataTypes.DATE,
				allowNull: true,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			},
			monthly_capitalization_rate: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			annual_capitalization_rate: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			sq_ft_capitalization_rate: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_net_income: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			indicated_range_monthly: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			indicated_range_annual: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			indicated_range_sq_feet: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			indicated_psf_monthly: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			indicated_psf_annual: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			indicated_psf_sq_feet: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_monthly_income: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_annual_income: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_oe_annual_amount: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_oe_gross: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_sq_ft: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_rent_sq_ft: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_oe_per_square_feet: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			income_notes: {
				type: DataTypes.TEXT,
			},
			expense_notes: {
				type: DataTypes.TEXT,
			},
			cap_rate_notes: {
				type: DataTypes.TEXT,
			},
			other_total_monthly_income: {
				type: DataTypes.DOUBLE,
			},
			other_total_annual_income: {
				type: DataTypes.DOUBLE,
			},
			other_total_sq_ft: {
				type: DataTypes.DOUBLE,
			},
		},
		{
			timestamps: false,
			tableName: 'res_evaluation_income_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	res_evaluation_income_approaches.hasMany(model.res_eval_income_approach_op_exp, {
		foreignKey: 'res_evaluation_income_approach_id',
		sourceKey: 'id',
		as: 'operatingExpenses',
	});
	res_evaluation_income_approaches.hasMany(model.res_eval_income_approach_source, {
		foreignKey: 'res_evaluation_income_approach_id',
		sourceKey: 'id',
		as: 'incomeSources',
	});
	res_evaluation_income_approaches.hasMany(model.res_eval_income_approach_other_source, {
		foreignKey: 'res_evaluation_income_approach_id',
		sourceKey: 'id',
		as: 'otherIncomeSources',
	});
	return res_evaluation_income_approaches;
};
export default res_evaluation_income_approaches;
