import { currentDateTime } from '../utils/common/Time';

const eval_multi_family_approach_comps = (sequelize, DataTypes, model) => {
	const eval_multi_family_approach_comps = sequelize.define(
		'eval_multi_family_approach_comps',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			evaluation_multi_family_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			comp_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			order: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			property_unit: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			property_unit_id: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			avg_monthly_rent: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_adjustment: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			adjusted_montly_val: {
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
			tableName: 'eval_multi_family_approach_comps',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	eval_multi_family_approach_comps.hasMany(model.eval_multi_family_comp_adj, {
		foreignKey: 'eval_multi_family_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_adjustments',
	});
	eval_multi_family_approach_comps.belongsTo(model.comps, {
		foreignKey: 'comp_id',
		as: 'comp_details',
	});
	return eval_multi_family_approach_comps;
};
export default eval_multi_family_approach_comps;
