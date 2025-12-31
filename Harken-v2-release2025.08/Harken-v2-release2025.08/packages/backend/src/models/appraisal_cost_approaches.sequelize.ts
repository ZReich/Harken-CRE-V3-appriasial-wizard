import { currentDateTime } from '../utils/common/Time';
import AppraisalsEnum from '../utils/enums/AppraisalsEnum';

const appraisal_cost_approaches = (sequelize, DataTypes, model) => {
	const appraisal_cost_approaches = sequelize.define(
		'appraisal_cost_approaches',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
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
			effective_age: {
				type: DataTypes.FLOAT,
			},
			base_year_remodeled: {
				type: DataTypes.INTEGER(11),
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
				type: DataTypes.STRING,
				defaultValue: AppraisalsEnum.ROADMAP,
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
			tableName: 'appraisal_cost_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	appraisal_cost_approaches.hasMany(model.appraisal_cost_approach_comps, {
		foreignKey: 'appraisal_cost_approach_id',
		sourceKey: 'id',
		as: 'comps',
	});
	appraisal_cost_approaches.hasMany(model.appraisal_cost_approach_subject_adj, {
		foreignKey: 'appraisal_cost_approach_id',
		sourceKey: 'id',
		as: 'cost_subject_property_adjustments',
	});
	appraisal_cost_approaches.hasMany(model.appraisal_cost_approach_improvements, {
		foreignKey: 'appraisal_cost_approach_id',
		sourceKey: 'id',
		as: 'improvements',
	});
	return appraisal_cost_approaches;
};
export default appraisal_cost_approaches;
