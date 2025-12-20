import { currentDateTime } from '../utils/common/Time';

const eval_income_approach_op_exp = (sequelize, DataTypes) => {
	const eval_income_approach_op_exp = sequelize.define(
		'eval_income_approach_op_exp',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			evaluation_income_approach_id: {
				type: DataTypes.INTEGER(11),
			},
			name: {
				type: DataTypes.STRING(255),
			},
			annual_amount: {
				type: DataTypes.DOUBLE,
			},
			percentage_of_gross: {
				type: DataTypes.DOUBLE,
			},
			total_per_bed: {
				type: DataTypes.DOUBLE,
			},
			total_per_unit: {
				type: DataTypes.DOUBLE,
			},
			total_per_sq_ft: {
				type: DataTypes.DOUBLE,
			},
			comments: {
				type: DataTypes.STRING(255),
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
			tableName: 'eval_income_approach_op_exp',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return eval_income_approach_op_exp;
};
export default eval_income_approach_op_exp;
