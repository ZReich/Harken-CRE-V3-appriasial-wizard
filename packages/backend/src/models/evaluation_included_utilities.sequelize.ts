import { currentDateTime } from '../utils/common/Time';

const evaluation_included_utilities = (sequelize, DataTypes) => {
	const evaluationIncludedUtilities = sequelize.define(
		'evaluation_included_utilities',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			evaluation_id: {
				type: DataTypes.INTEGER(11),
			},
			utility: {
				type: DataTypes.TEXT,
				allowNull: false,
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
			timestamps: false, // Disable createdAt and updatedAt,
			tableName: 'evaluation_included_utilities',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return evaluationIncludedUtilities;
};

export default evaluation_included_utilities;
