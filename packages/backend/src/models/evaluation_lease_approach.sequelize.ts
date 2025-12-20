import { EvaluationsEnum } from '../utils/enums/EvaluationsEnum';
import { currentDateTime } from '../utils/common/Time';

const evaluation_lease_approaches = (sequelize, DataTypes, model) => {
	const evaluation_lease_approaches = sequelize.define(
		'evaluation_lease_approaches',
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
			averaged_adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			lease_comps_value: {
				type: DataTypes.DOUBLE,
			},
			notes: {
				type: DataTypes.TEXT,
			},
			lease_comps_notes: {
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
			low_adjusted_comp_range: {
				type: DataTypes.STRING(30),
			},
			high_adjusted_comp_range: {
				type: DataTypes.STRING(30),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'evaluation_lease_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluation_lease_approaches.hasMany(model.eval_lease_approach_comps, {
		foreignKey: 'evaluation_lease_approach_id',
		sourceKey: 'id',
		as: 'comps',
	});
	evaluation_lease_approaches.hasMany(model.eval_lease_approach_subject_adj, {
		foreignKey: 'evaluation_lease_approach_id',
		sourceKey: 'id',
		as: 'subject_property_adjustments',
	});
	evaluation_lease_approaches.hasMany(model.eval_lease_approach_qualitative_sub_adj, {
		foreignKey: 'evaluation_lease_approach_id',
		sourceKey: 'id',
		as: 'subject_qualitative_adjustments',
	});
	evaluation_lease_approaches.hasMany(model.eval_lease_approach_comparison_attributes, {
		foreignKey: 'evaluation_lease_approach_id',
		sourceKey: 'id',
		as: 'comparison_attributes',
	});
	return evaluation_lease_approaches;
};
export default evaluation_lease_approaches;
