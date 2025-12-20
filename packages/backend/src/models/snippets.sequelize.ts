import { currentDateTime } from '../utils/common/Time';

const snippets = (sequelize, DataTypes) => {
	const snippets = sequelize.define(
		'snippets',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			snippets_category_id: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			account_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING(100),
			},
			snippet: {
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
			tableName: 'snippets',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return snippets;
};

export default snippets;
