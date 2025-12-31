import { currentDateTime } from '../utils/common/Time';

const evaluation_files = (sequelize, DataTypes) => {
	const evaluationFiles = sequelize.define(
		'evaluation_files',
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
			buildout_id: {
				type: DataTypes.INTEGER(11),
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
			tableName: 'evaluation_files',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return evaluationFiles;
};
export default evaluation_files;
