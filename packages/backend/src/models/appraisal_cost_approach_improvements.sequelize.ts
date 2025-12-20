import { currentDateTime } from '../utils/common/Time';

const appraisal_cost_approach_improvements = (sequelize, DataTypes) => {
	const appraisal_cost_approach_improvements = sequelize.define(
		'appraisal_cost_approach_improvements',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			zoning_id: {
				type: DataTypes.INTEGER(11),
			},
			appraisal_cost_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING(50),
			},
			sf_area: {
				type: DataTypes.DOUBLE,
			},
			adjusted_psf: {
				type: DataTypes.DOUBLE,
			},
			depreciation: {
				type: DataTypes.DOUBLE,
			},
			adjusted_cost: {
				type: DataTypes.DOUBLE,
			},
			depreciation_amount: {
				type: DataTypes.DOUBLE,
			},
			structure_cost: {
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
			tableName: 'appraisal_cost_approach_improvements',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisal_cost_approach_improvements;
};
export default appraisal_cost_approach_improvements;
