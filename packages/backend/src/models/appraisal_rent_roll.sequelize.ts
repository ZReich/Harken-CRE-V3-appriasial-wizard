import { currentDateTime } from '../utils/common/Time';

const appraisal_rent_roll = (sequelize, DataTypes) => {
	const appraisal_rent_roll = sequelize.define(
		'appraisal_rent_roll',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			appraisal_rent_roll_type_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			beds: {
				type: DataTypes.INTEGER(11),
			},
			baths: {
				type: DataTypes.INTEGER(11),
			},
			unit: {
				type: DataTypes.TEXT,
			},
			rent: {
				type: DataTypes.DOUBLE,
				defaultValue: 0,
			},
			tenant_exp: {
				type: DataTypes.TEXT,
			},
			description: {
				type: DataTypes.TEXT,
			},
			lease_expiration: {
				type: DataTypes.TEXT,
			},
			sq_ft: {
				type: DataTypes.FLOAT,
			},
			unit_count: {
				type: DataTypes.FLOAT,
			},
			avg_monthly_rent: {
				type: DataTypes.DOUBLE,
				defaultValue: 0,
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
			tableName: 'appraisal_rent_roll',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisal_rent_roll;
};
export default appraisal_rent_roll;
