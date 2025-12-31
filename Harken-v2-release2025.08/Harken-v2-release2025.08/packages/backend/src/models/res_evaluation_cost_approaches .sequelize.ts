import { EvaluationsEnum } from '../utils/enums/EvaluationsEnum';
import { currentDateTime } from '../utils/common/Time';

const res_evaluation_cost_approaches = (sequelize, DataTypes, model) => {
	const res_evaluation_cost_approaches = sequelize.define(
		'res_evaluation_cost_approaches',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			res_evaluation_id: {
				type: DataTypes.INTEGER(11),
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
			incremental_value: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			land_value: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			comps: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			effective_year_built: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			effective_age: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			base_year_remodeled: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			remodel_effect: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			overall_replacement_cost: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_depreciation: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_depreciation_percentage: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			total_depreciated_cost: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			notes: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			total_cost_valuation: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			indicated_value_psf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING(45),
				allowNull: true,
			},
			improvements: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			totals: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			comments: {
				type: DataTypes.TEXT,
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
			subject_property_adjustments: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			improvements_total_adjusted_cost: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_adjusted_ppsf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_comp_base: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_comp_lf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_depreciation: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_location_adj: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_perimeter_adj: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_sf_area: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			improvements_total_subject_lf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
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
		},
		{
			timestamps: false,
			tableName: 'res_evaluation_cost_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	res_evaluation_cost_approaches.hasMany(model.res_eval_cost_approach_comps, {
		foreignKey: 'res_evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'comp_data',
	});
	res_evaluation_cost_approaches.hasMany(model.res_eval_cost_approach_subject_adj, {
		foreignKey: 'res_evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'cost_subject_property_adjustments',
	});
	res_evaluation_cost_approaches.hasMany(model.res_eval_cost_approach_improvements, {
		foreignKey: 'res_evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'cost_improvements',
	});
	res_evaluation_cost_approaches.hasMany(model.res_eval_cost_approach_comparison_attributes, {
		foreignKey: 'res_evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'comparison_attributes',
	});
	return res_evaluation_cost_approaches;
};

export default res_evaluation_cost_approaches;
