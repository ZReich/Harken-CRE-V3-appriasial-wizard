import { currentDateTime } from '../utils/common/Time';

const global_codes = (sequelize, DataTypes, model) => {
	const global_codes = sequelize.define(
		'global_codes',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			global_code_category_id: {
				type: DataTypes.INTEGER(11),
			},
			code: {
				type: DataTypes.STRING(50),
			},
			name: {
				type: DataTypes.STRING(100),
			},
			parent_id: {
				type: DataTypes.INTEGER(11),
				references: {
					model: 'global_codes', // Reference the same model
					key: 'id',
				},
			},
			appraisal_default: {
				type: DataTypes.INTEGER(11),
			},
			evaluation_default: {
				type: DataTypes.INTEGER(11),
			},
			comps_default: {
				type: DataTypes.TINYINT(1),
			},
			default_order: {
				type: DataTypes.INTEGER(11),
			},
			status: {
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
			tableName: 'global_codes',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	// Define self-referencing association
	global_codes.hasMany(global_codes, {
		foreignKey: 'parent_id',
		as: 'sub_options', // Alias for children
	});

	global_codes.belongsTo(global_codes, {
		foreignKey: 'parent_id',
		as: 'parent', // Alias for parent
	});

	// Association with global_code_categories model
	model.global_code_categories.hasMany(global_codes, {
		foreignKey: 'global_code_category_id',
		as: 'options', // Alias to distinguish subsections
	});

	return global_codes;
};

export default global_codes;
