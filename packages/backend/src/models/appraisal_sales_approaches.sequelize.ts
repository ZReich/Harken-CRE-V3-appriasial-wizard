import AppraisalsEnum from '../utils/enums/AppraisalsEnum';
import { currentDateTime } from '../utils/common/Time';

const appraisal_sales_approaches = (sequelize, DataTypes, model) => {
	const appraisal_sales_approaches = sequelize.define(
		'appraisal_sales_approaches',
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
			sales_approach_value: {
				type: DataTypes.DOUBLE,
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
				defaultValue: AppraisalsEnum.ROADMAP,
			},
			map_center_lat: {
				type: DataTypes.STRING(30),
			},
			map_center_lng: {
				type: DataTypes.STRING(30),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'appraisal_sales_approaches',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	appraisal_sales_approaches.hasMany(model.appraisal_sales_approach_comps, {
		foreignKey: 'appraisal_sales_approach_id',
		sourceKey: 'id',
		as: 'comps',
	});
	appraisal_sales_approaches.hasMany(model.appraisal_sales_approach_subject_adj, {
		foreignKey: 'appraisal_sales_approach_id',
		sourceKey: 'id',
		as: 'subject_property_adjustments',
	});
	appraisal_sales_approaches.hasMany(model.appraisal_sales_approach_qualitative_sub_adj, {
		foreignKey: 'appraisal_sales_approach_id',
		sourceKey: 'id',
		as: 'subject_qualitative_adjustments',
	});
	appraisal_sales_approaches.hasMany(model.appraisal_sales_approach_comparison_attributes, {
		foreignKey: 'appraisal_sales_approach_id',
		sourceKey: 'id',
		as: 'sales_comparison_attributes',
	});
	return appraisal_sales_approaches;
};
export default appraisal_sales_approaches;
