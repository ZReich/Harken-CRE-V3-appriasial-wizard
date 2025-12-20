import { EvaluationsEnum } from '../utils/enums/EvaluationsEnum';
import { currentDateTime } from '../utils/common/Time';

const evaluation_cap_approaches = (sequelize, DataTypes, model) => {
	const evaluation_cap_approaches = sequelize.define(
		'evaluation_cap_approaches',
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
			high_cap_rate: {
				type: DataTypes.DOUBLE,
			},
			low_cap_rate: {
				type: DataTypes.DOUBLE,
			},
			weigted_average: {
				type: DataTypes.DOUBLE,
			},
			rounded_average: {
				type: DataTypes.DOUBLE,
			},
			notes: {
				type: DataTypes.TEXT,
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
			cap_rate_notes: {
				type: DataTypes.TEXT,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'evaluation_cap_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluation_cap_approaches.hasMany(model.eval_cap_approach_comps, {
		foreignKey: 'evaluation_cap_approach_id',
		sourceKey: 'id',
		as: 'comps',
	});
	evaluation_cap_approaches.hasMany(model.eval_cap_approach_comparison_attributes, {
		foreignKey: 'evaluation_cap_approach_id',
		sourceKey: 'id',
		as: 'comparison_attributes',
	});
	return evaluation_cap_approaches;
};
export default evaluation_cap_approaches;
