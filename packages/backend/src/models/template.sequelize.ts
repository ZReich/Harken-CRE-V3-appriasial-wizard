import { currentDateTime } from '../utils/common/Time';

const template = (sequelize, DataTypes, model) => {
	const template = sequelize.define(
		'template',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			account_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			parent_id: {
				type: DataTypes.INTEGER(11),
			},
			appraisal_id: {
				type: DataTypes.INTEGER(11),
			},
			name: {
				type: DataTypes.STRING(100),
			},
			description: {
				type: DataTypes.TEXT,
			},
			created_by: {
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
			tableName: 'template',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	template.hasMany(model.sections, {
		foreignKey: 'template_id',
		sourceKey: 'id',
	});
	return template;
};

export default template;
