import { ResEvaluationsEnum } from '../utils/enums/ResEvaluationsEnum';
import { currentDateTime } from '../utils/common/Time';

const res_evaluation_sales_approaches = (sequelize, DataTypes, model) => {
	const res_evaluation_sales_approaches = sequelize.define(
		'res_evaluation_sales_approaches',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			res_evaluation_id: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			res_evaluation_scenario_id: {
				type: DataTypes.INTEGER(11),
			},
			eval_weight: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			weight: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			averaged_adjusted_psf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			sales_approach_value: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			incremental_value: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			comps: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			note: {
				type: DataTypes.TEXT,
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
			subject_property_adjustments: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			total_comp_adj: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			area_map_zoom: {
				type: DataTypes.INTEGER,
			},
			map_type: {
				type: DataTypes.STRING,
				defaultValue: ResEvaluationsEnum.ROADMAP,
			},
			map_center_lat: {
				type: DataTypes.STRING(30),
			},
			map_center_lng: {
				type: DataTypes.STRING(30),
			},
		},
		{
			timestamps: false,
			tableName: 'res_evaluation_sales_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	res_evaluation_sales_approaches.hasMany(model.res_eval_sales_approach_comps, {
		foreignKey: 'res_evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'comp_data',
	});
	res_evaluation_sales_approaches.hasMany(model.res_eval_sales_approach_subject_adj, {
		foreignKey: 'res_evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'subject_property_adj',
	});
	res_evaluation_sales_approaches.hasMany(model.res_eval_sales_approach_qualitative_sub_adj, {
		foreignKey: 'res_evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'subject_qualitative_adjustments',
	});
	res_evaluation_sales_approaches.hasMany(model.res_eval_sales_approach_comparison_attributes, {
		foreignKey: 'res_evaluation_sales_approach_id',
		sourceKey: 'id',
		as: 'sales_comparison_attributes',
	});
	return res_evaluation_sales_approaches;
};

export default res_evaluation_sales_approaches;
