import { currentDateTime } from '../utils/common/Time';
import DefaultEnum from '../utils/enums/DefaultEnum';

const evaluation_rent_roll_type = (sequelize, DataTypes, model) => {
	const evaluation_rent_roll_type = sequelize.define(
		'evaluation_rent_roll_type',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			evaluation_scenario_id: {
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
			tableName: 'evaluation_rent_roll_type',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	evaluation_rent_roll_type.hasMany(model.evaluation_rent_roll, {
		foreignKey: 'evaluation_rent_roll_type_id',
		sourceKey: 'id',
		as: 'rent_rolls',
	});
	return evaluation_rent_roll_type;
};
export default evaluation_rent_roll_type;
