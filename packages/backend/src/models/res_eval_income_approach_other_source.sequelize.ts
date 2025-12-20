import { currentDateTime } from '../utils/common/Time';

const res_eval_income_approach_other_source = (sequelize, DataTypes) => {
	const res_eval_income_approach_other_source = sequelize.define(
		'res_eval_income_approach_other_source',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			res_evaluation_income_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			space: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			monthly_income: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			annual_income: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			rent_sq_ft: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			square_feet: {
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
			tableName: 'res_eval_income_approach_other_source',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return res_eval_income_approach_other_source;
};

export default res_eval_income_approach_other_source;
