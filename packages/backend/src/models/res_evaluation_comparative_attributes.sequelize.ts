import { currentDateTime } from '../utils/common/Time';

const res_evaluation_comparative_attribute_list = (sequelize, DataTypes, model) => {
	const res_evaluation_comparative_attribute_list = sequelize.define(
		'res_evaluation_comparative_attribute_list',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			res_evaluation_type_id: {
				type: DataTypes.INTEGER(11),
			},
			comparative_attribute_id: {
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
			tableName: 'res_evaluation_comparative_attribute_list',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	res_evaluation_comparative_attribute_list.belongsTo(model.global_codes, {
		foreignKey: 'comparative_attribute_id',
		sourceKey: 'id',
	});
	return res_evaluation_comparative_attribute_list;
};

export default res_evaluation_comparative_attribute_list;
