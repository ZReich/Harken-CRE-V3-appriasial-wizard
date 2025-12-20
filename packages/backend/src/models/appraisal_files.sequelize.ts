import { currentDateTime } from '../utils/common/Time';

const appraisal_files = (sequelize, DataTypes) => {
	const appraisalFiles = sequelize.define(
		'appraisal_files',
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
			type: {
				type: DataTypes.STRING(255),
			},
			size: {
				type: DataTypes.FLOAT,
			},
			height: {
				type: DataTypes.FLOAT,
			},
			width: {
				type: DataTypes.FLOAT,
			},
			title: {
				type: DataTypes.TEXT,
			},
			description: {
				type: DataTypes.TEXT,
			},
			dir: {
				type: DataTypes.TEXT,
			},
			filename: {
				type: DataTypes.TEXT,
			},
			origin: {
				type: DataTypes.TEXT,
			},
			storage: {
				type: DataTypes.TEXT,
			},
			order: {
				type: DataTypes.INTEGER(11),
			},
			created: {
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
			tableName: 'appraisal_files',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisalFiles;
};
export default appraisal_files;
