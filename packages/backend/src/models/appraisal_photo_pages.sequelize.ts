import { currentDateTime } from '../utils/common/Time';

const appraisal_photo_pages = (sequelize, DataTypes) => {
	const appraisal_photo_pages = sequelize.define(
		'appraisal_photo_pages',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_id: {
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
			tableName: 'appraisal_photo_pages',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	// models.appraisals.hasMany(appraisal_photo_pages, { foreignKey: 'appraisal_id' });
	// appraisal_photo_pages.belongsTo(models.appraisals, { foreignKey: 'appraisal_id' });

	return appraisal_photo_pages;
};
export default appraisal_photo_pages;
