import { currentDateTime } from '../utils/common/Time';

const sections = (sequelize, DataTypes, model) => {
	const Sections = sequelize.define(
		'sections',
		{
			id: {
				type: DataTypes.INTEGER(11),
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			template_id: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
			},
			title: {
				type: DataTypes.STRING(100),
			},
			order: {
				type: DataTypes.INTEGER(11),
			},
			parent_id: {
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
			tableName: 'sections',
			hooks: {
				beforeCreate: (instance) => {
					instance.last_updated = currentDateTime();
				},
			},
		},
	);
	Sections.hasMany(model.section_item, {
		foreignKey: 'section_id',
		as: 'items', // Alias to distinguish subsections
	});
	// Association between SectionItem and its related subsection
	model.section_item.belongsTo(Sections, {
		foreignKey: 'sub_section_id',
		as: 'subsections', // Alias to reference subsection in SectionItem
	});
	return Sections;
};

export default sections;
