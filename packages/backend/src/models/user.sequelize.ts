import StatusEnum from '../utils/enums/StatusEnum';
import DefaultEnum from '../utils/enums/DefaultEnum';
import { currentDateTime } from '../utils/common/Time';

const users = (sequelize, DataTypes) => {
	const users = sequelize.define(
		'users',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			account_id: {
				type: DataTypes.INTEGER(11),
			},
			buildout_id: {
				type: DataTypes.INTEGER(11),
			},
			email_address: {
				type: DataTypes.STRING(255),
			},
			first_name: {
				type: DataTypes.STRING(255),
			},
			last_name: {
				type: DataTypes.STRING(255),
			},
			password: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			settings: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			profile_image_url: {
				type: DataTypes.TEXT,
			},
			signature_image_url: {
				type: DataTypes.TEXT,
			},
			role: {
				type: DataTypes.TINYINT(4),
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING(255),
				defaultValue: StatusEnum.ACTIVE,
			},
			opt_in_token: {
				type: DataTypes.STRING(255),
			},
			created_by: {
				type: DataTypes.STRING(255),
				defaultValue: DefaultEnum.HARKEN,
			},
			system: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			approved_by_admin: {
				type: DataTypes.TINYINT(1),
			},
			last_login_at: {
				type: DataTypes.DATE,
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
			paid_through_date: {
				type: DataTypes.STRING(255),
			},
			significant_in_pdf: {
				type: DataTypes.TINYINT(4),
				defaultValue: 0,
			},
			phone_number: {
				type: DataTypes.STRING(255),
			},
			position: {
				type: DataTypes.TEXT,
			},
			qualification: {
				type: DataTypes.TEXT,
			},
			background: {
				type: DataTypes.TEXT,
			},
			affiliations: {
				type: DataTypes.TEXT,
			},
			education: {
				type: DataTypes.TEXT,
			},
			responsibility: {
				type: DataTypes.TEXT,
			},
			include_background_in_pdf: {
				type: DataTypes.TINYINT(1),
				defaultValue: 1,
			},
			include_affiliations_in_pdf: {
				type: DataTypes.TINYINT(1),
				defaultValue: 1,
			},
			include_education_in_pdf: {
				type: DataTypes.TINYINT(1),
				defaultValue: 1,
			},
			include_responsibility_in_pdf: {
				type: DataTypes.TINYINT(1),
				defaultValue: 1,
			},
			comp_adjustment_mode: {
				type: DataTypes.STRING(50),
				defaultValue: DefaultEnum.PERCENT,
			},
		},
		{
			timestamps: false, // Disable createdAt and updatedAt
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	return users;
};

export default users;
