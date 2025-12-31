import { currentDateTime } from "../utils/common/Time";
const corelogic = (sequelize, DataTypes) => {
	const corelogic = sequelize.define(
		'corelogic',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			property_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				references: {
					model: 'properties',
					key: 'id',
				},
			},
			property_detail: {
				type: DataTypes.TEXT('long'),
				allowNull: true,
			},
			building_detail: {
				type: DataTypes.TEXT('long'),
				allowNull: true,
			},
			site_location: {
				type: DataTypes.TEXT('long'),
				allowNull: true,
			},
			tax_assessments: {
				type: DataTypes.TEXT('long'),
				allowNull: true,
			},
			ownership: {
				type: DataTypes.TEXT('long'),
				allowNull: true,
			},
			ownership_transfer: {
				type: DataTypes.TEXT('long'),
				allowNull: true,
			},
			transaction_history: {
				type: DataTypes.TEXT('long'),
				allowNull: true,
			},
			date_created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'corelogic',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return corelogic;
};
export default corelogic;
