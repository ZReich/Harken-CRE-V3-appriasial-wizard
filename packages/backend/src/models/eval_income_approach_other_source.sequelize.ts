import { currentDateTime } from '../utils/common/Time';

const eval_income_approach_other_source = (sequelize, DataTypes) => {
	const eval_income_approach_other_source = sequelize.define(
		'eval_income_approach_other_source',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			evaluation_income_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING(255),
			},
			monthly_income: {
				type: DataTypes.DOUBLE,
			},
			annual_income: {
				type: DataTypes.DOUBLE,
			},
			square_feet: {
				type: DataTypes.DOUBLE,
			},
			comments: {
				type: DataTypes.STRING(255),
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
			tableName: 'eval_income_approach_other_source',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return eval_income_approach_other_source;
};
export default eval_income_approach_other_source;
