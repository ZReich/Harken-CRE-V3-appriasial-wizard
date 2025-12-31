import { currentDateTime } from '../utils/common/Time';
import DefaultEnum from '../utils/enums/DefaultEnum';

const appraisal_rent_roll_type = (sequelize, DataTypes, model) => {
	const appraisal_rent_roll_type = sequelize.define(
		'appraisal_rent_roll_type',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			appraisal_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			type: {
				type: DataTypes.TEXT,
				allowNull: false,
				defaultValue: DefaultEnum.SUMMARY,
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
			tableName: 'appraisal_rent_roll_type',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	appraisal_rent_roll_type.hasMany(model.appraisal_rent_roll, {
		foreignKey: 'appraisal_rent_roll_type_id',
		sourceKey: 'id',
		as: 'rent_rolls',
	});
	return appraisal_rent_roll_type;
};
export default appraisal_rent_roll_type;
