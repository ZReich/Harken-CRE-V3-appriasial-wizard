const properties = (sequelize, DataTypes) => {
	const properties = sequelize.define(
		'properties',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			business_name: {
				type: DataTypes.STRING(255),
			},
			street_address: {
				type: DataTypes.STRING(255),
			},
			street_suite: {
				type: DataTypes.STRING(255),
			},
			county: {
				type: DataTypes.STRING(255),
			},
			state: {
				type: DataTypes.STRING(255),
			},
			city: {
				type: DataTypes.STRING(255),
			},
			zipcode: {
				type: DataTypes.STRING(255),
			},
			latitude: {
				type: DataTypes.STRING(255),
			},
			longitude: {
				type: DataTypes.STRING(255),
			},
			coordinates: {
				type: DataTypes.GEOMETRY('POINT'),
			},
			google_place_id: {
				type: DataTypes.TEXT,
			},
			date_created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			image: {
				type: DataTypes.TEXT,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'properties',
		},
	);
	return properties;
};
export default properties;
