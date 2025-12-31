import { currentDateTime } from '../utils/common/Time';

const res_eval_cost_approach_improvements = (sequelize, DataTypes) => {
	const model = sequelize.define(
		'res_eval_cost_approach_improvements',
		{
			id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			res_evaluation_cost_approach_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			zoning_id: {
				type: DataTypes.INTEGER(11),
				allowNull: true,
			},
			rsm_code: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			sf_area: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			subject_lf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			comp_base: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			comp_lf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			perimeter_adj: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			location_adj: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			adjusted_psf: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			depreciation: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			adjusted_cost: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			depreciation_amount: {
				type: DataTypes.DOUBLE,
				allowNull: true,
			},
			structure_cost: {
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
			timestamps: false,
			tableName: 'res_eval_cost_approach_improvements',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return model;
};

export default res_eval_cost_approach_improvements;
