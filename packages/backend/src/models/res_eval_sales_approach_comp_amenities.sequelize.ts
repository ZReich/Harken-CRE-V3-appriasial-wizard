import { currentDateTime } from '../utils/common/Time';

const res_eval_sales_approach_comp_amenities = (sequelize, DataTypes) => {
	const res_eval_sales_approach_comp_amenities = sequelize.define(
		'res_eval_sales_approach_comp_amenities',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			res_eval_sales_approach_comp_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			another_amenity_name: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			subject_property_check: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			comp_property_check: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			another_amenity_value: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			is_extra: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0,
			},
			date_created: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			},
			last_updated: {
				type: DataTypes.DATE,
				allowNull: true,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			},
		},
		{
			timestamps: false,
			tableName: 'res_eval_sales_approach_comp_amenities',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	return res_eval_sales_approach_comp_amenities;
};

export default res_eval_sales_approach_comp_amenities;
