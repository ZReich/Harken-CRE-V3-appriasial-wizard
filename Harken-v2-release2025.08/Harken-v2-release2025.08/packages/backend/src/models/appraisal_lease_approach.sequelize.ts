import AppraisalsEnum from '../utils/enums/AppraisalsEnum';
import { currentDateTime } from '../utils/common/Time';

const appraisal_lease_approach = (sequelize, DataTypes, model) => {
	const appraisal_lease_approach = sequelize.define(
		'appraisal_lease_approach',
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
			weight: {
				type: DataTypes.DOUBLE,
			},
			averaged_adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			lease_approach_value: {
				type: DataTypes.DOUBLE,
			},
			note: {
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
			total_comp_adj: {
				type: DataTypes.DOUBLE,
			},
			lease_approach_indicated_val: {
				type: DataTypes.INTEGER(11),
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
			low_adjusted_comp_range: {
				type: DataTypes.STRING(30),
			},
			high_adjusted_comp_range: {
				type: DataTypes.STRING(30),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'appraisal_lease_approach',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	appraisal_lease_approach.hasMany(model.appraisal_lease_approach_comps, {
		foreignKey: 'appraisal_lease_approach_id',
		sourceKey: 'id',
		as: 'comps',
	});
	appraisal_lease_approach.hasMany(model.appraisal_lease_approach_subject_adj, {
		foreignKey: 'appraisal_lease_approach_id',
		sourceKey: 'id',
		as: 'subject_property_adjustments',
	});
	appraisal_lease_approach.hasMany(model.appraisal_lease_approach_qualitative_sub_adj, {
		foreignKey: 'appraisal_lease_approach_id',
		sourceKey: 'id',
		as: 'subject_qualitative_adjustments',
	});
	return appraisal_lease_approach;
};
export default appraisal_lease_approach;
