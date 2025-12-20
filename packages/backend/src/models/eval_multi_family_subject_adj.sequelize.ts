import { currentDateTime } from '../utils/common/Time';

const eval_multi_family_subject_adj = (sequelize, DataTypes) => {
	const eval_multi_family_subject_adj = sequelize.define(
		'eval_multi_family_subject_adj',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			evaluation_multi_family_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			adj_key: {
				type: DataTypes.STRING(255),
			},
			adj_value: {
				type: DataTypes.STRING(255),
			},
			order: {
				type: DataTypes.INTEGER(11),
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
			tableName: 'eval_multi_family_subject_adj',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return eval_multi_family_subject_adj;
};
export default eval_multi_family_subject_adj;
