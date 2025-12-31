import { currentDateTime } from '../utils/common/Time';

const snippets_category = (sequelize, DataTypes, model) => {
	const snippets_category = sequelize.define(
		'snippets_category',
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
			category_name: {
				type: DataTypes.STRING(100),
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
			tableName: 'snippets_category',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	snippets_category.hasMany(model.snippets, {
		foreignKey: 'snippets_category_id',
		sourceKey: 'id',
	});
	return snippets_category;
};

export default snippets_category;
