import { currentDateTime } from '../utils/common/Time';

const res_eval_cost_approach_comps = (sequelize, DataTypes, model) => {
	const res_eval_cost_approach_comps = sequelize.define(
		'res_eval_cost_approach_comps',
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
			comp_id: {
				type: DataTypes.INTEGER(11), // this id residential comp id
				allowNull: false,
			},
			order: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			total_adjustment: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			adjusted_psf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			weight: {
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
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'res_eval_cost_approach_comps',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	res_eval_cost_approach_comps.hasMany(model.res_eval_cost_approach_comp_adj, {
		foreignKey: 'res_eval_cost_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_adjustments',
	});
	res_eval_cost_approach_comps.belongsTo(model.res_comps, {
		foreignKey: 'comp_id',
		as: 'comp_details',
	});
	return res_eval_cost_approach_comps;
};
export default res_eval_cost_approach_comps;
