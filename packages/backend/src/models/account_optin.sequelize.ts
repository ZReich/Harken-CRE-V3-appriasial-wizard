const account_optin = (sequelize, DataTypes) => {
	const accountOptin = sequelize.define(
		'account_optin',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			account_id: {
				type: DataTypes.INTEGER(11),
			},
			token: {
				type: DataTypes.TEXT,
			},
			expiration: {
				type: DataTypes.DATE,
			},
			users: {
				type: DataTypes.TEXT,
			},
			created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			whosentit: {
				type: DataTypes.TEXT,
			},
			email_address: {
				type: DataTypes.TEXT,
			},
			status: {
				type: DataTypes.TEXT,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'account_optin',
		},
	);
	return accountOptin;
};
export default account_optin;
