import { Sequelize, DataTypes } from 'sequelize';
import { DATABASE, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } from '../env';
import users from '../models/user.sequelize'; // Import the User model
import tokens from '../models/token.sequelize';
import accounts from '../models/accounts.sequelize';
import comps_included_utilities from '../models/comps_included_utilities.sequelize';
import comps from '../models/comps.sequelize';
import zoning from '../models/zoning.sequelize';
import properties from '../models/properties.sequelize';
import property_units from '../models/property_units.sequelize';
import company from '../models/company.sequelize';
import clients from '../models/clients.sequelize';
import users_transactions from '../models/users_transactions.sequelize';
import eval_sales_approach_comps from '../models/eval_sales_approach_comps.sequelize';
import eval_cap_approach_comps from '../models/eval_cap_approach_comps.sequelize';
import eval_lease_approach_comps from '../models/eval_lease_approach_comps.sequelize';
import eval_cost_approach_comps from '../models/eval_cost_approach_comps.sequelize';
import eval_multi_family_approach_comps from '../models/eval_multi_family_approach_comps.sequelize';
import res_comps from '../models/res_comps.sequelize';
import res_comp_amenities from '../models/res_comp_amenities.sequelize';
import res_zoning from '../models/res_zoning.sequelize';
import res_eval_sales_approach_comps from '../models/res_eval_sales_approach_comps.sequelize';
import res_eval_cost_approach_comps from '../models/res_eval_cost_approach_comps.sequelize';
import appraisals from '../models/appraisals.sequelize';
import logger from '../models/logger.sequelize';
import account_optin from '../models/account_optin.sequelize';
import appraisal_approaches from '../models/appraisal_approaches.sequelize';
import appraisals_included_utilities from '../models/appraisals_included_utilities.sequelize';
import appraisal_files from '../models/appraisal_files.sequelize';
import appraisals_metadata from '../models/appraisals_metadata.sequelize';
import appraisal_income_approaches from '../models/appraisal_income_approaches.sequelize';
import appraisal_income_approach_op_exp from '../models/appraisal_income_approach_op_exp.sequelize';
import appraisal_income_approach_source from '../models/appraisal_income_approach_source.sequelize';
import appraisal_sales_approaches from '../models/appraisal_sales_approaches.sequelize';
import appraisal_sales_approach_comps from '../models/appraisal_sales_approach_comps.sequelize';
import appraisal_sales_approach_comp_adj from '../models/appraisal_sales_approach_comp_adj.sequelize';
import appraisal_sales_approach_subject_adj from '../models/appraisal_sales_approach_subject_adj.sequelize';
import appraisal_cost_approaches from '../models/appraisal_cost_approaches.sequelize';
import appraisal_cost_approach_subject_adj from '../models/appraisal_cost_approach_subject_adj.sequelize';
import appraisal_cost_approach_improvements from '../models/appraisal_cost_approach_improvements.sequelize';
import appraisal_cost_approach_comps from '../models/appraisal_cost_approach_comps.sequelize';
import appraisal_cost_approach_comp_adj from '../models/appraisal_cost_approach_comp_adj.sequelize';
import template from '../models/template.sequelize';
import sections from '../models/sections.sequelize';
import section_item from '../models/section_item.sequelize';
import snippets from '../models/snippets.sequelize';
import appraisal_merge_fields from '../models/appraisal_merge_fields.sequelize';
import global_code_categories from '../models/global_code_categories.sequelize';
import global_codes from '../models/global_codes.sequelize';
import appraisal_photo_pages from '../models/appraisal_photo_pages.sequelize';
import appraisal_lease_approach from '../models/appraisal_lease_approach.sequelize';
import appraisal_lease_approach_comp_adj from '../models/appraisal_lease_approach_comp_adj.sequelize';
import appraisal_lease_approach_subject_adj from '../models/appraisal_lease_approach_subject_adj.sequelize';
import appraisal_lease_approach_comps from '../models/appraisal_lease_approach_comps.sequelize';
import appraisal_income_approach_other_source from '../models/appraisal_income_approach_other_source.sequelize';
import appraisal_sales_approach_comparison_attributes from '../models/appraisal_sale_compare_attributes.sequelize';
import appraisal_sales_approach_qualitative_comp_adj from '../models/appraisal_sale_qualitative_comp_adj.sequelize';
import appraisal_sales_approach_qualitative_sub_adj from '../models/appraisal_sale_qualitative_sub_adj.sequelize';
import appraisal_lease_approach_qualitative_comp_adj from '../models/appraisal_lease_qualitative_comp_adj.sequelize';
import appraisal_lease_approach_qualitative_sub_adj from '../models/appraisal_lease_qualitative_sub_adj.sequelize';
import appraisal_sale_comparative_attribute_list from '../models/appraisal_sale_comparative_attribute_list.sequelize';
import appraisal_rent_roll from '../models/appraisal_rent_roll.sequelize';
import appraisal_rent_roll_type from '../models/appraisal_rent_roll_type.sequelize';
import snippets_category from '../models/snippets_category.sequelize';
import evaluations from '../models/evaluations.sequelize';
import evaluation_included_utilities from '../models/evaluation_included_utilities.sequelize';
import evaluations_metadata from '../models/evaluations_metadata.sequelize';
import evaluation_photo_pages from '../models/evaluation_photo_pages.sequelize';
import evaluation_files from '../models/evaluation_files.sequelize';
import evaluation_income_approaches from '../models/evaluation_income_approaches.sequelize';
import eval_income_approach_source from '../models/eval_income_approach_source.sequelize';
import eval_income_approach_other_source from '../models/eval_income_approach_other_source.sequelize';
import eval_income_approach_op_exp from '../models/eval_income_approach_op_exp.sequelize';
import evaluation_sales_approaches from '../models/evaluation_sales_approaches.sequelize';
import eval_sales_approach_comp_adj from '../models/eval_sales_approach_comp_adj.sequelize';
import eval_sales_approach_subject_adj from '../models/eval_sales_approach_subject_adj.sequelize';
import eval_sales_approach_qualitative_sub_adj from '../models/eval_sales_approach_qualitative_sub_adj.sequelize';
import eval_sales_approach_qualitative_comp_adj from '../models/eval_sales_approach_qualitative_comp_adj.sequelize';
import evaluation_comparative_attribute_list from '../models/evaluation_comparative_attribute_list.sequelize';
import eval_sales_approach_comparison_attributes from '../models/eval_sales_approach_comparison_attributes.sequelize';
import evaluation_cost_approaches from '../models/evaluation_cost_approaches.sequelize';
import eval_cost_approach_comp_adj from '../models/eval_cost_approach_comp_adj.sequelize';
import eval_cost_approach_improvements from '../models/eval_cost_approach_improvements.sequelize';
import eval_cost_approach_subject_adj from '../models/eval_cost_approach_subject_adj.sequelize';
import eval_lease_approach_comp_adj from '../models/eval_lease_approach_comp_adj.sequelize';
import eval_lease_approach_subject_adj from '../models/eval_lease_approach_subject_adj.sequelize';
import eval_lease_approach_qualitative_comp_adj from '../models/eval_lease_qualitative_comp_adj.sequelize';
import eval_lease_approach_qualitative_sub_adj from '../models/eval_lease_qualitative_sub_adj.sequelize';
import evaluation_lease_approaches from '../models/evaluation_lease_approach.sequelize';
import evaluation_rent_roll_type from '../models/evaluation_rent_roll_type.sequelize';
import evaluation_rent_roll from '../models/evaluation_rent_roll.sequelize';
import evaluation_cap_approaches from '../models/evaluation_cap_approaches.sequelize';
import evaluation_multi_family_approaches from '../models/evaluation_multi_family_approaches.sequelize';
import eval_multi_family_comp_adj from '../models/eval_multi_family_comp_adj.sequelize';
import eval_multi_family_subject_adj from '../models/eval_multi_family_subject_adj.sequelize';
import eval_cap_approach_comparison_attributes from '../models/eval_cap_approach_comparison_attributes.sequelize';
import eval_cost_approach_comparison_attributes from '../models/eval_cost_approach_comparison_attributes.sequelize';
import eval_multi_family_comparison_attributes from '../models/eval_multi_family_comparison_attributes.sequelize';
import eval_lease_approach_comparison_attributes from '../models/eval_lease_comparison_attributes.sequelize';
import evaluation_scenarios from '../models/evaluation_scenario.sequelize';
import res_evaluation_scenarios from '../models/res_evaluation_scenario.sequelize';
import res_evaluations from '../models/res_evaluations.sequelize';
import res_evaluation_amenities from '../models/res_evaluation_amenities.sequelize';
import res_evaluations_metadata from '../models/res_evaluations_metadata.sequelize';
import res_evaluation_photo_pages from '../models/res_evaluation_photo_pages.sequelize';
import res_evaluation_files from '../models/res_evaluation_files.sequelize';
import res_evaluation_income_approaches from '../models/res_evaluation_income_approaches.sequelize';
import res_eval_income_approach_source from '../models/res_eval_income_approach_source.sequelize';
import res_eval_income_approach_other_source from '../models/res_eval_income_approach_other_source.sequelize';
import res_eval_income_approach_op_exp from '../models/res_eval_income_approach_op_exp.sequelize';
import res_evaluation_cost_approaches from '../models/res_evaluation_cost_approaches .sequelize';
import res_eval_cost_approach_comparison_attributes from '../models/res_eval_cost_approach_comparison_attributes.sequelize';
import res_eval_cost_approach_subject_adj from '../models/res_eval_cost_approach_subject_adj.sequelize';
import res_eval_cost_approach_comp_adj from '../models/res_eval_cost_approach_comp_adj.sequelize';
import res_eval_cost_approach_improvements from '../models/res_eval_cost_approach_improvements.sequelize';
import res_evaluation_sales_approaches from '../models/res_evaluation_sales_approaches.sequelize';
import res_eval_sales_approach_comp_adj from '../models/res_eval_sales_approach_comp_adj.sequelize';
import res_eval_sales_approach_comparison_attributes from '../models/res_eval_sales_approach_comparison_attributes.sequelize';
import res_eval_sales_approach_comp_amenities from '../models/res_eval_sales_approach_comp_amenities.sequelize';
import res_eval_sales_approach_subject_adj from '../models/res_eval_sales_approach_subject_adj.sequelize';
import res_eval_sales_approach_qualitative_sub_adj from '../models/res_eval_sales_approach_qualitative_sub_adj.sequelize';
import res_eval_sales_approach_qualitative_comp_adj from '../models/res_eval_sales_approach_qualitative_comp_adj.sequelize';
import res_evaluation_comparative_attribute_list from '../models/res_evaluation_comparative_attributes.sequelize';
import corelogic from '../models/corelogic.sequelize';

const db: any = {};
initialize();
async function initialize() {
	const sequelize = new Sequelize(DATABASE, DB_USERNAME, DB_PASSWORD, {
		host: DB_HOST,
		dialect: 'mysql',
		dialectOptions: {},
		port: DB_PORT,
		logging: false,
		pool: {
			max: 10,
			min: 1,
			acquire: 30000,
			idle: 10000,
		},
	});

	// Assign the User model to the db object
	db.users = users(sequelize, DataTypes);
	db.tokens = tokens(sequelize, DataTypes);
	db.section_item = section_item(sequelize, DataTypes);
	db.sections = sections(sequelize, DataTypes, db);
	db.template = template(sequelize, DataTypes, db);
	db.accounts = accounts(sequelize, DataTypes, db);
	db.comps = comps(sequelize, DataTypes);
	db.comps_included_utilities = comps_included_utilities(sequelize, DataTypes);
	db.corelogic = corelogic(sequelize, DataTypes);
	db.properties = properties(sequelize, DataTypes);
	db.property_units = property_units(sequelize, DataTypes);
	db.company = company(sequelize, DataTypes);
	db.clients = clients(sequelize, DataTypes);
	db.users_transactions = users_transactions(sequelize, DataTypes);
	db.eval_cap_approach_comps = eval_cap_approach_comps(sequelize, DataTypes, db);
	db.res_comps = res_comps(sequelize, DataTypes);
	db.res_comp_amenities = res_comp_amenities(sequelize, DataTypes);
	db.res_zoning = res_zoning(sequelize, DataTypes);
	db.appraisal_income_approach_op_exp = appraisal_income_approach_op_exp(sequelize, DataTypes);
	db.appraisal_income_approach_other_source = appraisal_income_approach_other_source(
		sequelize,
		DataTypes,
	);
	db.appraisal_income_approach_source = appraisal_income_approach_source(sequelize, DataTypes);
	db.appraisal_income_approaches = appraisal_income_approaches(sequelize, DataTypes, db);
	db.appraisal_sales_approach_comp_adj = appraisal_sales_approach_comp_adj(sequelize, DataTypes);
	db.appraisal_sales_approach_subject_adj = appraisal_sales_approach_subject_adj(
		sequelize,
		DataTypes,
	);
	db.appraisal_sales_approach_qualitative_comp_adj = appraisal_sales_approach_qualitative_comp_adj(
		sequelize,
		DataTypes,
	);
	db.appraisal_sales_approach_qualitative_sub_adj = appraisal_sales_approach_qualitative_sub_adj(
		sequelize,
		DataTypes,
	);
	db.appraisal_sales_approach_comparison_attributes =
		appraisal_sales_approach_comparison_attributes(sequelize, DataTypes);
	db.appraisal_sales_approach_comps = appraisal_sales_approach_comps(sequelize, DataTypes, db);
	db.appraisal_sales_approaches = appraisal_sales_approaches(sequelize, DataTypes, db);
	db.appraisal_cost_approach_comp_adj = appraisal_cost_approach_comp_adj(sequelize, DataTypes);
	db.appraisal_cost_approach_comps = appraisal_cost_approach_comps(sequelize, DataTypes, db);
	db.appraisal_cost_approach_improvements = appraisal_cost_approach_improvements(
		sequelize,
		DataTypes,
	);
	db.appraisal_cost_approach_subject_adj = appraisal_cost_approach_subject_adj(
		sequelize,
		DataTypes,
	);
	db.appraisal_cost_approaches = appraisal_cost_approaches(sequelize, DataTypes, db);
	db.appraisal_lease_approach_comp_adj = appraisal_lease_approach_comp_adj(sequelize, DataTypes);
	db.appraisal_lease_approach_subject_adj = appraisal_lease_approach_subject_adj(
		sequelize,
		DataTypes,
	);
	db.appraisal_lease_approach_qualitative_comp_adj = appraisal_lease_approach_qualitative_comp_adj(
		sequelize,
		DataTypes,
	);
	db.appraisal_lease_approach_qualitative_sub_adj = appraisal_lease_approach_qualitative_sub_adj(
		sequelize,
		DataTypes,
	);
	db.appraisal_lease_approach_comps = appraisal_lease_approach_comps(sequelize, DataTypes, db);
	db.appraisal_lease_approach = appraisal_lease_approach(sequelize, DataTypes, db);
	db.appraisal_rent_roll = appraisal_rent_roll(sequelize, DataTypes);
	db.appraisal_rent_roll_type = appraisal_rent_roll_type(sequelize, DataTypes, db);
	db.appraisal_approaches = appraisal_approaches(sequelize, DataTypes, db);
	db.eval_income_approach_op_exp = eval_income_approach_op_exp(sequelize, DataTypes);
	db.eval_income_approach_other_source = eval_income_approach_other_source(sequelize, DataTypes);
	db.eval_income_approach_source = eval_income_approach_source(sequelize, DataTypes);
	db.evaluation_income_approaches = evaluation_income_approaches(sequelize, DataTypes, db);
	db.eval_cost_approach_improvements = eval_cost_approach_improvements(sequelize, DataTypes);
	db.eval_cost_approach_comp_adj = eval_cost_approach_comp_adj(sequelize, DataTypes);
	db.eval_cost_approach_subject_adj = eval_cost_approach_subject_adj(sequelize, DataTypes);
	db.eval_cost_approach_comps = eval_cost_approach_comps(sequelize, DataTypes, db);
	db.eval_cost_approach_comparison_attributes = eval_cost_approach_comparison_attributes(
		sequelize,
		DataTypes,
	);
	db.evaluation_cost_approaches = evaluation_cost_approaches(sequelize, DataTypes, db);
	db.eval_lease_approach_comp_adj = eval_lease_approach_comp_adj(sequelize, DataTypes);
	db.eval_lease_approach_subject_adj = eval_lease_approach_subject_adj(sequelize, DataTypes);
	db.eval_lease_approach_qualitative_comp_adj = eval_lease_approach_qualitative_comp_adj(
		sequelize,
		DataTypes,
	);
	db.eval_lease_approach_qualitative_sub_adj = eval_lease_approach_qualitative_sub_adj(
		sequelize,
		DataTypes,
	);
	db.eval_lease_approach_comps = eval_lease_approach_comps(sequelize, DataTypes, db);
	db.eval_lease_approach_comparison_attributes = eval_lease_approach_comparison_attributes(
		sequelize,
		DataTypes,
	);
	db.evaluation_lease_approaches = evaluation_lease_approaches(sequelize, DataTypes, db);
	db.evaluation_rent_roll = evaluation_rent_roll(sequelize, DataTypes);
	db.evaluation_rent_roll_type = evaluation_rent_roll_type(sequelize, DataTypes, db);
	db.eval_cap_approach_comparison_attributes = eval_cap_approach_comparison_attributes(
		sequelize,
		DataTypes,
	);
	db.evaluation_cap_approaches = evaluation_cap_approaches(sequelize, DataTypes, db);
	db.zoning = zoning(sequelize, DataTypes, db);
	db.logger = logger(sequelize, DataTypes);
	db.account_optin = account_optin(sequelize, DataTypes);
	db.appraisals_included_utilities = appraisals_included_utilities(sequelize, DataTypes);
	db.appraisal_files = appraisal_files(sequelize, DataTypes);
	db.appraisals_metadata = appraisals_metadata(sequelize, DataTypes);
	db.appraisal_photo_pages = appraisal_photo_pages(sequelize, DataTypes);
	db.appraisals = appraisals(sequelize, DataTypes, db);
	db.snippets = snippets(sequelize, DataTypes);
	db.snippets_category = snippets_category(sequelize, DataTypes, db);
	db.eval_sales_approach_qualitative_comp_adj = eval_sales_approach_qualitative_comp_adj(
		sequelize,
		DataTypes,
	);
	db.eval_sales_approach_qualitative_sub_adj = eval_sales_approach_qualitative_sub_adj(
		sequelize,
		DataTypes,
	);
	db.eval_sales_approach_comparison_attributes = eval_sales_approach_comparison_attributes(
		sequelize,
		DataTypes,
	);
	db.eval_sales_approach_subject_adj = eval_sales_approach_subject_adj(sequelize, DataTypes);
	db.eval_sales_approach_comp_adj = eval_sales_approach_comp_adj(sequelize, DataTypes);
	db.eval_sales_approach_comps = eval_sales_approach_comps(sequelize, DataTypes, db);
	db.evaluation_sales_approaches = evaluation_sales_approaches(sequelize, DataTypes, db);
	db.eval_multi_family_subject_adj = eval_multi_family_subject_adj(sequelize, DataTypes);
	db.eval_multi_family_comp_adj = eval_multi_family_comp_adj(sequelize, DataTypes);
	db.eval_multi_family_approach_comps = eval_multi_family_approach_comps(sequelize, DataTypes, db);
	db.eval_multi_family_comparison_attributes = eval_multi_family_comparison_attributes(
		sequelize,
		DataTypes,
	);
	db.evaluation_multi_family_approaches = evaluation_multi_family_approaches(
		sequelize,
		DataTypes,
		db,
	);
	db.evaluation_files = evaluation_files(sequelize, DataTypes);
	db.evaluations_metadata = evaluations_metadata(sequelize, DataTypes);
	db.evaluation_included_utilities = evaluation_included_utilities(sequelize, DataTypes);
	db.evaluation_photo_pages = evaluation_photo_pages(sequelize, DataTypes);
	db.evaluation_scenarios = evaluation_scenarios(sequelize, DataTypes, db);
	db.res_eval_income_approach_source = res_eval_income_approach_source(sequelize, DataTypes);
	db.res_eval_income_approach_other_source = res_eval_income_approach_other_source(
		sequelize,
		DataTypes,
	);
	db.res_eval_income_approach_op_exp = res_eval_income_approach_op_exp(sequelize, DataTypes);
	db.res_evaluation_income_approaches = res_evaluation_income_approaches(sequelize, DataTypes, db);

	db.res_eval_cost_approach_improvements = res_eval_cost_approach_improvements(
		sequelize,
		DataTypes,
	);
	db.res_eval_cost_approach_subject_adj = res_eval_cost_approach_subject_adj(sequelize, DataTypes);
	db.res_eval_cost_approach_comp_adj = res_eval_cost_approach_comp_adj(sequelize, DataTypes);
	db.res_eval_cost_approach_comps = res_eval_cost_approach_comps(sequelize, DataTypes, db);
	db.res_eval_cost_approach_comparison_attributes = res_eval_cost_approach_comparison_attributes(
		sequelize,
		DataTypes,
	);
	db.res_evaluation_cost_approaches = res_evaluation_cost_approaches(sequelize, DataTypes, db);
	db.res_eval_sales_approach_comp_amenities = res_eval_sales_approach_comp_amenities(
		sequelize,
		DataTypes,
	);
	db.res_eval_sales_approach_qualitative_comp_adj = res_eval_sales_approach_qualitative_comp_adj(
		sequelize,
		DataTypes,
	);
	db.res_eval_sales_approach_comp_adj = res_eval_sales_approach_comp_adj(sequelize, DataTypes);
	db.res_eval_sales_approach_comps = res_eval_sales_approach_comps(sequelize, DataTypes, db);
	db.res_eval_sales_approach_comparison_attributes = res_eval_sales_approach_comparison_attributes(
		sequelize,
		DataTypes,
	);
	db.res_eval_sales_approach_qualitative_sub_adj = res_eval_sales_approach_qualitative_sub_adj(
		sequelize,
		DataTypes,
	);

	db.res_eval_sales_approach_subject_adj = res_eval_sales_approach_subject_adj(
		sequelize,
		DataTypes,
	);
	db.res_evaluation_sales_approaches = res_evaluation_sales_approaches(sequelize, DataTypes, db);
	db.res_evaluation_scenarios = res_evaluation_scenarios(sequelize, DataTypes, db);
	db.evaluations = evaluations(sequelize, DataTypes, db);
	db.res_evaluations = res_evaluations(sequelize, DataTypes, db);
	db.appraisal_merge_fields = appraisal_merge_fields(sequelize, DataTypes);
	db.global_code_categories = global_code_categories(sequelize, DataTypes);
	db.global_codes = global_codes(sequelize, DataTypes, db);
	db.evaluation_comparative_attribute_list = evaluation_comparative_attribute_list(
		sequelize,
		DataTypes,
		db,
	);
	db.appraisal_sale_comparative_attribute_list = appraisal_sale_comparative_attribute_list(
		sequelize,
		DataTypes,
		db,
	);
	db.res_evaluation_comparative_attribute_list = res_evaluation_comparative_attribute_list(
		sequelize,
		DataTypes,
		db,
	);
	db.res_evaluations_metadata = res_evaluations_metadata(sequelize, DataTypes);
	db.res_evaluation_amenities = res_evaluation_amenities(sequelize, DataTypes);
	db.res_evaluation_photo_pages = res_evaluation_photo_pages(sequelize, DataTypes);
	db.res_evaluation_files = res_evaluation_files(sequelize, DataTypes);
	db.corelogic = corelogic(sequelize, DataTypes);

	db.Sequelize = Sequelize;
	db.sequelize = sequelize;

	/**
	 * @description  Defining association between models
	 */

	db.comps.hasMany(db.comps_included_utilities, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.accounts.hasMany(db.users, {
		foreignKey: 'account_id',
		sourceKey: 'id',
	});

	db.accounts.hasMany(db.comps, {
		foreignKey: 'account_id',
	});

	db.properties.hasMany(db.comps, {
		foreignKey: 'property_id',
		sourceKey: 'id',
	});

	db.users.hasMany(db.comps, {
		foreignKey: 'user_id',
		sourceKey: 'id',
	});

	db.users.belongsTo(db.accounts, {
		foreignKey: 'account_id',
	});

	db.comps.hasMany(db.zoning, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.comps.hasMany(db.property_units, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.comps.hasMany(db.eval_sales_approach_comps, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.comps.hasMany(db.eval_cap_approach_comps, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.comps.hasMany(db.eval_lease_approach_comps, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.comps.hasMany(db.eval_cost_approach_comps, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.comps.hasMany(db.eval_multi_family_approach_comps, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.users.hasMany(db.users_transactions, {
		foreignKey: 'user_id',
		sourceKey: 'id',
	});

	db.res_comps.hasMany(db.res_comp_amenities, {
		foreignKey: 'res_comp_id',
		sourceKey: 'id',
	});
	db.res_comps.hasMany(db.res_zoning, {
		foreignKey: 'res_comp_id',
	});

	db.res_comps.hasMany(db.res_eval_cost_approach_comps, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.res_comps.hasMany(db.res_eval_sales_approach_comps, {
		foreignKey: 'comp_id',
		sourceKey: 'id',
	});

	db.accounts.hasMany(db.comps, {
		foreignKey: 'account_id',
	});

	db.properties.hasMany(db.res_comps, {
		foreignKey: 'property_id',
		sourceKey: 'id',
	});

	db.users.hasMany(db.res_comps, {
		foreignKey: 'user_id',
		sourceKey: 'id',
	});

	db.users.hasMany(db.clients, {
		foreignKey: 'user_id',
		sourceKey: 'id',
	});

	db.accounts.hasMany(db.clients, {
		foreignKey: 'account_id',
	});

	db.accounts.hasMany(db.company, {
		foreignKey: 'account_id',
	});

	db.properties.hasMany(db.appraisals, {
		foreignKey: 'property_id',
		sourceKey: 'id',
	});

	db.users.hasMany(db.appraisals, {
		foreignKey: 'user_id',
		sourceKey: 'id',
	});

	db.accounts.hasMany(db.appraisals, {
		foreignKey: 'account_id',
	});

	db.clients.hasMany(db.appraisals, {
		foreignKey: 'client_id',
	});

	db.appraisals.hasOne(db.clients, {
		foreignKey: 'id',
		sourceKey: 'client_id',
		as: 'client',
	});
	db.clients.hasMany(db.evaluations, {
		foreignKey: 'client_id',
	});

	db.evaluations.hasOne(db.clients, {
		foreignKey: 'id',
		sourceKey: 'client_id',
		as: 'client',
	});
	db.clients.hasMany(db.res_evaluations, {
		foreignKey: 'client_id',
	});

	db.res_evaluations.hasOne(db.clients, {
		foreignKey: 'id',
		sourceKey: 'client_id',
		as: 'client',
	});

	db.accounts.hasMany(db.account_optin, {
		foreignKey: 'account_id',
		sourceKey: 'id',
	});
	db.appraisals.hasMany(db.appraisal_photo_pages, {
		foreignKey: 'appraisal_id',
		sourceKey: 'id',
		as: 'photos',
	});
	db.appraisal_photo_pages.belongsTo(db.appraisals, {
		foreignKey: 'appraisal_id',
	});

	db.accounts.hasMany(db.evaluations, {
		foreignKey: 'account_id',
	});
	db.evaluations.belongsTo(db.accounts, {
		foreignKey: 'account_id',
	});

	db.accounts.hasMany(db.res_evaluations, {
		foreignKey: 'account_id',
	});
	db.res_evaluations.belongsTo(db.accounts, {
		foreignKey: 'account_id',
	});

	db.users.hasMany(db.evaluations, {
		foreignKey: 'user_id',
		sourceKey: 'id',
	});

	db.evaluations.belongsTo(db.users, {
		foreignKey: 'user_id',
	});

	db.users.hasMany(db.res_evaluations, {
		foreignKey: 'user_id',
		sourceKey: 'id',
	});

	db.res_evaluations.belongsTo(db.users, {
		foreignKey: 'user_id',
	});

	db.res_evaluations.hasMany(db.res_evaluation_amenities, {
		foreignKey: 'res_evaluation_id',
		sourceKey: 'id',
	});
	db.evaluations.hasMany(db.evaluations_metadata, {
		foreignKey: 'evaluation_id',
		sourceKey: 'id',
	});
	db.evaluations_metadata.belongsTo(db.evaluations, {
		foreignKey: 'evaluation_id',
	});
	db.res_evaluations.hasMany(db.res_evaluations_metadata, {
		foreignKey: 'res_evaluation_id',
		sourceKey: 'id',
	});
	db.res_evaluations_metadata.belongsTo(db.res_evaluations, {
		foreignKey: 'res_evaluation_id',
	});
	db.res_evaluations.hasMany(db.res_evaluation_photo_pages, {
		foreignKey: 'res_evaluation_id',
		sourceKey: 'id',
		as: 'photos',
	});
	db.res_evaluation_photo_pages.belongsTo(db.res_evaluations, {
		foreignKey: 'res_evaluation_id',
	});
	db.res_evaluations.hasMany(db.res_evaluation_files, {
		foreignKey: 'res_evaluation_id',
		sourceKey: 'id',
	});
	db.res_evaluation_files.belongsTo(db.res_evaluations, {
		foreignKey: 'res_evaluation_id',
	});

	db.properties.hasMany(db.corelogic, {
		foreignKey: 'property_id',
		sourceKey: 'id',
	});

	db.corelogic.belongsTo(db.properties, {
		foreignKey: 'property_id',
	});

	// sync all models with database
	await sequelize.sync({ alter: true });
}
export default db;
