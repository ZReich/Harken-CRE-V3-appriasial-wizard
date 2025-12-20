import { EvaluationsEnum } from '../utils/enums/EvaluationsEnum';
import { currentDateTime } from '../utils/common/Time';

const evaluation_multi_family_approaches = (sequelize, DataTypes, model) => {
	const evaluation_multi_family_approaches = sequelize.define(
		'evaluation_multi_family_approaches',
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
			high_rental_rate: {
				type: DataTypes.DOUBLE,
			},
			low_rental_rate: {
				type: DataTypes.DOUBLE,
			},
			notes: {
				type: DataTypes.TEXT,
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
			tableName: 'evaluation_multi_family_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	evaluation_multi_family_approaches.hasMany(model.eval_multi_family_approach_comps, {
		foreignKey: 'evaluation_multi_family_approach_id',
		sourceKey: 'id',
		as: 'comps',
	});
	evaluation_multi_family_approaches.hasMany(model.eval_multi_family_comparison_attributes, {
		foreignKey: 'evaluation_multi_family_approach_id',
		sourceKey: 'id',
		as: 'comparison_attributes',
	});
	evaluation_multi_family_approaches.hasMany(model.eval_multi_family_subject_adj, {
		foreignKey: 'evaluation_multi_family_approach_id',
		sourceKey: 'id',
		as: 'subject_property_adjustments',
	});
	return evaluation_multi_family_approaches;
};
export default evaluation_multi_family_approaches;
