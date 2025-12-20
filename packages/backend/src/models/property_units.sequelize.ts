const property_units = (sequelize, DataTypes) => {
	const property_units = sequelize.define(
		'property_units',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			comp_id: {
				type: DataTypes.INTEGER(11),
			},
			evaluation_id: {
				type: DataTypes.INTEGER(11),
			},
			beds: {
				type: DataTypes.FLOAT,
			},
			baths: {
				type: DataTypes.FLOAT,
			},
			sq_ft: {
				type: DataTypes.FLOAT,
			},
			unit_count: {
				type: DataTypes.FLOAT,
			},
			avg_monthly_rent: {
				type: DataTypes.FLOAT,
				defaultValue: 0,
			},
			created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'property_units',
		},
	);
	return property_units;
};
export default property_units;
