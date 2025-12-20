import { currentDateTime } from '../utils/common/Time';

const res_eval_sales_approach_comps = (sequelize, DataTypes, model) => {
	const res_eval_sales_approach_comps = sequelize.define(
		'res_eval_sales_approach_comps',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			res_evaluation_sales_approach_id: {
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
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'res_eval_sales_approach_comps',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	res_eval_sales_approach_comps.hasMany(model.res_eval_sales_approach_comp_amenities, {
		foreignKey: 'res_eval_sales_approach_comp_id',
		sourceKey: 'id',
		as: 'extra_amenities',
	});
	res_eval_sales_approach_comps.hasMany(model.res_eval_sales_approach_comp_adj, {
		foreignKey: 'res_eval_sales_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_adjustments',
	});
	res_eval_sales_approach_comps.hasMany(model.res_eval_sales_approach_qualitative_comp_adj, {
		foreignKey: {
			name: 'res_evaluation_sales_approach_comp_id',
			allowNull: true,
		},
		sourceKey: 'id',
		constraints: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		as: 'comps_qualitative_adjustments',
		constraintName: 'fk_qual_adj_comp',
	});

	return res_eval_sales_approach_comps;
};
export default res_eval_sales_approach_comps;
