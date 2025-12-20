import { currentDateTime } from '../utils/common/Time';

const res_eval_cost_approach_subject_adj = (sequelize, DataTypes) => {
	const res_eval_cost_approach_subject_adj = sequelize.define(
		'res_eval_cost_approach_subject_adj',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			res_evaluation_cost_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			adj_key: {
				type: DataTypes.STRING(255),
			},
			adj_value: {
				type: DataTypes.STRING(255),
			},
			order: {
				type: DataTypes.INTEGER(11),
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
			timestamps: false,
			tableName: 'res_eval_cost_approach_subject_adj',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return res_eval_cost_approach_subject_adj;
};

export default res_eval_cost_approach_subject_adj;
