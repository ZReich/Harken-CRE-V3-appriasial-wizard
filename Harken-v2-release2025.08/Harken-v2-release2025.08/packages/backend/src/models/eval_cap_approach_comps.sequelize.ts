import { currentDateTime } from '../utils/common/Time';

const eval_cap_approach_comps = (sequelize, DataTypes, model) => {
	const eval_cap_approach_comps = sequelize.define(
		'eval_cap_approach_comps',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			evaluation_cap_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			comp_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			order: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			cap_rate: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			weighting_note: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			weight: {
				type: DataTypes.DOUBLE,
				allowNull: true,
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
			tableName: 'eval_cap_approach_comps',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);

	eval_cap_approach_comps.belongsTo(model.comps, {
		foreignKey: 'comp_id',
		as: 'comp_details',
	});
	return eval_cap_approach_comps;
};
export default eval_cap_approach_comps;
