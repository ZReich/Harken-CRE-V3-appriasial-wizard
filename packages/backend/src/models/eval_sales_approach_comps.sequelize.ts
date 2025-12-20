import { currentDateTime } from '../utils/common/Time';

const eval_sales_approach_comps = (sequelize, DataTypes, model) => {
	const eval_sales_approach_comps = sequelize.define(
		'eval_sales_approach_comps',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			evaluation_sales_approach_id: {
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
			adjustment_note: {
				type: DataTypes.STRING(255),
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
			blended_adjusted_psf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			averaged_adjusted_psf: {
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
			overall_comparability: {
				type: DataTypes.STRING(15),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'eval_sales_approach_comps',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	eval_sales_approach_comps.hasMany(model.eval_sales_approach_comp_adj, {
		foreignKey: 'eval_sales_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_adjustments',
	});
	eval_sales_approach_comps.hasMany(model.eval_sales_approach_qualitative_comp_adj, {
		foreignKey: 'evaluation_sales_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_qualitative_adjustments',
	});
	eval_sales_approach_comps.belongsTo(model.comps, {
		foreignKey: 'comp_id',
		as: 'comp_details',
	});
	return eval_sales_approach_comps;
};
export default eval_sales_approach_comps;
