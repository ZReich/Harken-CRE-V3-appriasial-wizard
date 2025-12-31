import { currentDateTime } from '../utils/common/Time';

const res_eval_cost_approach_comparison_attributes = (sequelize, DataTypes) => {
	const res_eval_cost_approach_comparison_attributes = sequelize.define(
		'res_eval_cost_approach_comparison_attributes',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			res_evaluation_cost_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			comparison_key: {
				type: DataTypes.STRING(50),
			},
			comparison_value: {
				type: DataTypes.STRING(50),
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
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'res_eval_cost_approach_comparison_attributes',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return res_eval_cost_approach_comparison_attributes;
};
export default res_eval_cost_approach_comparison_attributes;
