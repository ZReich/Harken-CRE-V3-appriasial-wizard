import { Sequelize, DataTypes, Model } from 'sequelize';

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
	const TemplateConfiguration = sequelize.define(
		'template_configuration',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: dataTypes.INTEGER,
			},
			template_id: {
				type: dataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'template',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			config_key: {
				type: dataTypes.STRING(100),
				allowNull: false,
			},
			config_value: {
				type: dataTypes.TEXT,
				allowNull: true,
			},
			date_created: {
				type: dataTypes.DATE,
				allowNull: false,
				defaultValue: dataTypes.NOW,
			},
			last_updated: {
				type: dataTypes.DATE,
				allowNull: true,
			},
		},
		{
			timestamps: false,
			tableName: 'template_configuration',
		}
	);

	return TemplateConfiguration;
};













