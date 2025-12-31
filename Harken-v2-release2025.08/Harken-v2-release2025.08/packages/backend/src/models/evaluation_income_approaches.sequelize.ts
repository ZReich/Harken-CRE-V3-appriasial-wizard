import { currentDateTime } from '../utils/common/Time';

const evaluation_income_approaches = (sequelize, DataTypes, model) => {
	const evaluation_income_approaches = sequelize.define(
		'evaluation_income_approaches',
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
			evaluation_scenario_id: {
				type: DataTypes.INTEGER(11),
			},
			eval_weight: {
				type: DataTypes.DOUBLE,
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
			},
			total: {
				type: DataTypes.TEXT,
			},
			vacancy: {
				type: DataTypes.DOUBLE,
			},
			adjusted_gross_amount: {
				type: DataTypes.DOUBLE,
			},
			vacant_amount: {
				type: DataTypes.DOUBLE,
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
			monthly_capitalization_rate: {
				type: DataTypes.DOUBLE,
			},
			annual_capitalization_rate: {
				type: DataTypes.DOUBLE,
			},
			unit_capitalization_rate: {
				type: DataTypes.DOUBLE,
			},
			sq_ft_capitalization_rate: {
				type: DataTypes.DOUBLE,
			},
			bed_capitalization_rate: {
				type: DataTypes.DOUBLE,
			},
			high_capitalization_rate: {
				type: DataTypes.DOUBLE,
			},
			total_net_income: {
				type: DataTypes.DOUBLE,
			},
			indicated_range_monthly: {
				type: DataTypes.DOUBLE,
			},
			indicated_range_annual: {
				type: DataTypes.DOUBLE,
			},
			indicated_range_unit: {
				type: DataTypes.DOUBLE,
			},
			indicated_range_sq_feet: {
				type: DataTypes.DOUBLE,
			},
			indicated_range_bed: {
				type: DataTypes.DOUBLE,
			},
			indicated_psf_monthly: {
				type: DataTypes.DOUBLE,
			},
			indicated_psf_annual: {
				type: DataTypes.DOUBLE,
			},
			indicated_psf_unit: {
				type: DataTypes.DOUBLE,
			},
			indicated_psf_sq_feet: {
				type: DataTypes.DOUBLE,
			},
			indicated_psf_bed: {
				type: DataTypes.DOUBLE,
			},
			total_monthly_income: {
				type: DataTypes.DOUBLE,
			},
			total_annual_income: {
				type: DataTypes.DOUBLE,
			},
			total_rent_unit: {
				type: DataTypes.DOUBLE,
			},
			total_unit: {
				type: DataTypes.DOUBLE,
			},
			total_oe_annual_amount: {
				type: DataTypes.DOUBLE,
			},
			total_oe_gross: {
				type: DataTypes.DOUBLE,
			},
			total_oe_per_unit: {
				type: DataTypes.DOUBLE,
			},
			total_sq_ft: {
				type: DataTypes.DOUBLE,
			},
			total_rent_sq_ft: {
				type: DataTypes.DOUBLE,
			},
			total_oe_per_square_feet: {
				type: DataTypes.DOUBLE,
			},
			total_rent_bed: {
				type: DataTypes.DOUBLE,
			},
			total_oe_per_bed: {
				type: DataTypes.DOUBLE,
			},
			total_bed: {
				type: DataTypes.DOUBLE,
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
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'evaluation_income_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluation_income_approaches.hasMany(model.eval_income_approach_op_exp, {
		foreignKey: 'evaluation_income_approach_id',
		sourceKey: 'id',
		as: 'operatingExpenses',
	});
	evaluation_income_approaches.hasMany(model.eval_income_approach_source, {
		foreignKey: 'evaluation_income_approach_id',
		sourceKey: 'id',
		as: 'incomeSources',
	});
	evaluation_income_approaches.hasMany(model.eval_income_approach_other_source, {
		foreignKey: 'evaluation_income_approach_id',
		sourceKey: 'id',
		as: 'otherIncomeSources',
	});
	return evaluation_income_approaches;
};
export default evaluation_income_approaches;
