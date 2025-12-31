import { currentDateTime } from '../utils/common/Time';

const evaluation_photo_pages = (sequelize, DataTypes) => {
	const evaluation_photo_pages = sequelize.define(
		'evaluation_photo_pages',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			evaluation_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			image_url: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			caption: {
				type: DataTypes.STRING(255),
				allowNull: true,
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
			tableName: 'evaluation_photo_pages',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	return evaluation_photo_pages;
};
export default evaluation_photo_pages;
