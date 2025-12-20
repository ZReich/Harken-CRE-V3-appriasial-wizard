import { currentDateTime } from '../utils/common/Time';

const res_eval_income_approach_op_exp = (sequelize, DataTypes) => {
	const res_eval_income_approach_op_exp = sequelize.define(
		'res_eval_income_approach_op_exp',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			res_evaluation_income_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			annual_amount: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			percentage_of_gross: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_per_sq_ft: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			comments: {
				type: DataTypes.STRING(255),
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
		},
		{
			timestamps: false,
			tableName: 'res_eval_income_approach_op_exp',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return res_eval_income_approach_op_exp;
};

export default res_eval_income_approach_op_exp;
