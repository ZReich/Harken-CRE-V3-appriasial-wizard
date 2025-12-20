import { currentDateTime } from '../utils/common/Time';

const section_item = (sequelize, DataTypes) => {
	const section_item = sequelize.define(
		'section_item',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			section_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			template_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			appraisal_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING(100),
			},
			content: {
				type: DataTypes.TEXT('medium'),
			},
			order: {
				type: DataTypes.INTEGER(11),
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
			tableName: 'section_item',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return section_item;
};

export default section_item;
