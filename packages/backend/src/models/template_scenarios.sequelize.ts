import { Sequelize, DataTypes, Model } from 'sequelize';

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
	const TemplateScenarios = sequelize.define(
		'template_scenarios',
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
			scenario_type: {
				type: dataTypes.STRING(50),
				allowNull: true,
			},
			custom_name: {
				type: dataTypes.STRING(255),
				allowNull: true,
			},
			display_order: {
				type: dataTypes.INTEGER,
				defaultValue: 0,
			},
			default_approaches: {
				type: dataTypes.JSON,
				allowNull: true,
			},
			require_completion_date: {
				type: dataTypes.TINYINT,
				defaultValue: 0,
			},
			require_hypothetical_statement: {
				type: dataTypes.TINYINT,
				defaultValue: 0,
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
			tableName: 'template_scenarios',
		}
	);

	return TemplateScenarios;
};













