import { currentDateTime } from '../utils/common/Time';

const appraisal_sale_comparative_attribute_list = (sequelize, DataTypes, model) => {
	const appraisal_sale_comparative_attribute_list = sequelize.define(
		'appraisal_sale_comparative_attribute_list',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			appraisal_type_id: {
				type: DataTypes.INTEGER(11),
			},
			sales_comparative_attribute_id: {
				type: DataTypes.INTEGER(11),
			},
			default: {
				type: DataTypes.TINYINT(1),
				allowNull: false,
				defaultValue: 1,
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
			tableName: 'appraisal_sale_comparative_attribute_list',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	appraisal_sale_comparative_attribute_list.belongsTo(model.global_codes, {
		foreignKey: 'sales_comparative_attribute_id',
		sourceKey: 'id',
	});
	return appraisal_sale_comparative_attribute_list;
};

export default appraisal_sale_comparative_attribute_list;
