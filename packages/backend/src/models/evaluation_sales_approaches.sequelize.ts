import { currentDateTime } from '../utils/common/Time';
import { EvaluationsEnum } from '../utils/enums/EvaluationsEnum';

const evaluation_sales_approaches = (sequelize, DataTypes, model) => {
	const evaluation_sales_approaches = sequelize.define(
		'evaluation_sales_approaches',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			evaluation_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			evaluation_scenario_id: {
				type: DataTypes.INTEGER(11),
			},
			weight: {
				type: DataTypes.DOUBLE,
			},
			eval_weight: {
				type: DataTypes.DOUBLE,
			},
			averaged_adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			sales_approach_value: {
				type: DataTypes.DOUBLE,
			},
			note: {
				type: DataTypes.TEXT,
			},
			incremental_value: {
				type: DataTypes.DOUBLE,
			},
			comps: {
				type: DataTypes.TEXT,
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
			total_comp_adj: {
				type: DataTypes.DOUBLE,
			},
			sales_approach_indicated_val: {
				type: DataTypes.DOUBLE,
			},
			area_map_zoom: {
				type: DataTypes.INTEGER,
			},
			map_type: {
				type: DataTypes.STRING,
				defaultValue: EvaluationsEnum.ROADMAP,
			},
			map_center_lat: {
				type: DataTypes.STRING(30),
			},
			map_center_lng: {
				type: DataTypes.STRING(30),
			},
			subject_property_adjustments: {
				type: DataTypes.TEXT,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'evaluation_sales_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluation_sales_approaches.hasMany(model.eval_sales_approach_comps, {
		foreignKey: 'evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'comp_data',
	});
	evaluation_sales_approaches.hasMany(model.eval_sales_approach_subject_adj, {
		foreignKey: 'evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'subject_property_adj',
	});
	evaluation_sales_approaches.hasMany(model.eval_sales_approach_qualitative_sub_adj, {
		foreignKey: 'evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'subject_qualitative_adjustments',
	});
	evaluation_sales_approaches.hasMany(model.eval_sales_approach_comparison_attributes, {
		foreignKey: 'evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'sales_comparison_attributes',
	});
	return evaluation_sales_approaches;
};
export default evaluation_sales_approaches;
