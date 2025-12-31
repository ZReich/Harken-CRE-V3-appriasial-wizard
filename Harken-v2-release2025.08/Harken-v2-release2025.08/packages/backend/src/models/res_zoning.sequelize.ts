const res_zoning = (sequelize, DataTypes) => {
	const res_zoning = sequelize.define(
		'res_zoning',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			res_comp_id: {
				type: DataTypes.INTEGER(11),
			},
			res_evaluation_id: {
				type: DataTypes.INTEGER(11),
			},
			zone: {
				type: DataTypes.TEXT,
			},
			sub_zone: {
				type: DataTypes.TEXT,
			},
			total_sq_ft: {
				type: DataTypes.FLOAT,
			},
			gross_living_sq_ft: {
				type: DataTypes.FLOAT,
			},
			basement_sq_ft: {
				type: DataTypes.FLOAT,
			},
			basement_finished_sq_ft: {
				type: DataTypes.FLOAT,
			},
			basement_unfinished_sq_ft: {
				type: DataTypes.FLOAT,
			},
			created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			weight_sf: {
				type: DataTypes.INTEGER(11),
				defaultValue: 100,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			tableName: 'res_zoning',
		},
	);
	return res_zoning;
};
export default res_zoning;
