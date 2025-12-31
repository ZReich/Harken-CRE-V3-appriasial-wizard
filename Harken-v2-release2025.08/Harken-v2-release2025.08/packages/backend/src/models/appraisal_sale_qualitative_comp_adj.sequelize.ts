import { currentDateTime } from '../utils/common/Time';

const appraisal_sales_approach_qualitative_comp_adj = (sequelize, DataTypes) => {
	const appraisal_sales_approach_qualitative_comp_adj = sequelize.define(
		'appraisal_sales_approach_qualitative_comp_adj',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_sales_approach_comp_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			adj_key: {
				type: DataTypes.STRING(50),
			},
			adj_value: {
				type: DataTypes.STRING(50),
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
			tableName: 'appraisal_sales_approach_qualitative_comp_adj',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return appraisal_sales_approach_qualitative_comp_adj;
};
export default appraisal_sales_approach_qualitative_comp_adj;
