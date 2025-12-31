import { currentDateTime } from '../utils/common/Time';

const appraisal_lease_approach_comps = (sequelize, DataTypes, model) => {
	const appraisal_lease_approach_comps = sequelize.define(
		'appraisal_lease_approach_comps',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_lease_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			comp_id: {
				type: DataTypes.INTEGER(11),
			},
			order: {
				type: DataTypes.INTEGER(11),
			},
			adjustment_note: {
				type: DataTypes.TEXT,
			},
			total_adjustment: {
				type: DataTypes.DOUBLE,
			},
			adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			weight: {
				type: DataTypes.DOUBLE,
			},
			blended_adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			averaged_adjusted_psf: {
				type: DataTypes.DOUBLE,
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
			tableName: 'appraisal_lease_approach_comps',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	appraisal_lease_approach_comps.hasMany(model.appraisal_lease_approach_comp_adj, {
		foreignKey: 'appraisal_lease_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_adjustments',
	});
	appraisal_lease_approach_comps.hasMany(model.appraisal_lease_approach_qualitative_comp_adj, {
		foreignKey: 'appraisal_lease_approach_comp_id',
		sourceKey: 'id',
		as: 'comps_qualitative_adjustments',
	});
	appraisal_lease_approach_comps.belongsTo(model.comps, {
		foreignKey: 'comp_id',
		as: 'comp_details',
	});
	return appraisal_lease_approach_comps;
};
export default appraisal_lease_approach_comps;
