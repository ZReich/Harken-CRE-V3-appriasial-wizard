const tokens = (sequelize, DataTypes) => {
	const tokens = sequelize.define(
		'tokens',
		{
			token: {
				type: DataTypes.STRING(255),
				allowNull: false,
				primaryKey: true, // Define 'token' as the primary key
			},
			type: {
				type: DataTypes.INTEGER(11), // Assuming type is a string
				allowNull: false,
			},
			user_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			created: {
				type: DataTypes.DATE,
				allowNull: true,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt,
		},
	);
	return tokens;
};
export default tokens;
