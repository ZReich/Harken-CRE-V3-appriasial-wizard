import { currentDateTime } from '../utils/common/Time';

const appraisal_cost_approach_comps = (sequelize, DataTypes, model) => {
	const appraisal_cost_approach_comps = sequelize.define(
		'appraisal_cost_approach_comps',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_cost_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			comp_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			order: {
				type: DataTypes.INTEGER(11),
			},
			total_adjustment: {
				type: DataTypes.DOUBLE,
			},
			adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			weight: {
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
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'appraisal_cost_approach_comps',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	appraisal_cost_approach_comps.hasMany(model.appraisal_cost_approach_comp_adj, {
		foreignKey: 'appraisal_cost_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_adjustments',
	});
	appraisal_cost_approach_comps.belongsTo(model.comps, {
		foreignKey: 'comp_id',
		as: 'comp_details',
	});
	return appraisal_cost_approach_comps;
};
export default appraisal_cost_approach_comps;
