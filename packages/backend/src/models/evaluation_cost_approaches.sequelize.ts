import { EvaluationsEnum } from '../utils/enums/EvaluationsEnum';
import { currentDateTime } from '../utils/common/Time';

const evaluation_cost_approaches = (sequelize, DataTypes, model) => {
	const evaluation_cost_approaches = sequelize.define(
		'evaluation_cost_approaches',
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
			eval_weight: {
				type: DataTypes.DOUBLE,
			},
			weight: {
				type: DataTypes.DOUBLE,
			},
			averaged_adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			incremental_value: {
				type: DataTypes.DOUBLE,
			},
			land_value: {
				type: DataTypes.DOUBLE,
			},
			effective_year_built: {
				type: DataTypes.INTEGER(11),
			},
			effective_age: {
				type: DataTypes.FLOAT,
			},
			base_year_remodeled: {
				type: DataTypes.INTEGER(11),
			},
			remodel_effect: {
				type: DataTypes.DOUBLE,
			},
			overall_replacement_cost: {
				type: DataTypes.DOUBLE,
			},
			total_depreciation: {
				type: DataTypes.DOUBLE,
			},
			total_depreciation_percentage: {
				type: DataTypes.DOUBLE,
			},
			total_depreciated_cost: {
				type: DataTypes.DOUBLE,
			},
			notes: {
				type: DataTypes.TEXT,
			},
			total_cost_valuation: {
				type: DataTypes.DOUBLE,
			},
			indicated_value_psf: {
				type: DataTypes.DOUBLE,
			},
			totals: {
				type: DataTypes.TEXT,
			},
			type: {
				type: DataTypes.STRING(45),
			},
			comments: {
				type: DataTypes.TEXT,
			},

			subject_property_adjustments: {
				type: DataTypes.TEXT,
			},

			indicated_value_punit: {
				type: DataTypes.DOUBLE,
			},

			indicated_value_pbed: {
				type: DataTypes.DOUBLE,
			},

			improvements_total_sf_area: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_subject_lf: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_comp_base: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_comp_lf: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_perimeter_adj: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_location_adj: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_adjusted_ppsf: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_depreciation: {
				type: DataTypes.DOUBLE,
			},
			improvements_total_adjusted_cost: {
				type: DataTypes.DOUBLE,
			},
			area_map_zoom: {
				type: DataTypes.INTEGER,
			},
			map_type: {
				type: DataTypes.STRING(50),
				defaultValue: EvaluationsEnum.ROADMAP,
			},
			map_center_lat: {
				type: DataTypes.STRING(30),
			},
			map_center_lng: {
				type: DataTypes.STRING(30),
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
			tableName: 'evaluation_cost_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluation_cost_approaches.hasMany(model.eval_cost_approach_comps, {
		foreignKey: 'evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'comps',
	});
	evaluation_cost_approaches.hasMany(model.eval_cost_approach_subject_adj, {
		foreignKey: 'evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'cost_subject_property_adjustments',
	});
	evaluation_cost_approaches.hasMany(model.eval_cost_approach_improvements, {
		foreignKey: 'evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'improvements',
	});
	evaluation_cost_approaches.hasMany(model.eval_cost_approach_comparison_attributes, {
		foreignKey: 'evaluation_cost_approach_id',
		sourceKey: 'id',
		as: 'comparison_attributes',
	});
	return evaluation_cost_approaches;
};
export default evaluation_cost_approaches;
