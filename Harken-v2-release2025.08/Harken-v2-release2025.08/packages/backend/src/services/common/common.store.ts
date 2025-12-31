import database from '../../config/db';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
import { IGlobalCode, IGlobalSubOptionsCode } from './ICommonService';
import { Op, Sequelize } from 'sequelize';

const GlobalCodeCategories = database.global_code_categories;
const GlobalCodes = database.global_codes;
const helperFunction = new HelperFunction();

export default class CommonStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('CommonStore', CommonStore);
			super('An error occured while processing the request.');
		}
	};

	// Get list of global codes
	public async getGlobalCodeCategoriesByAttribute(attributes: object): Promise<IGlobalCode[]> {
		try {
			return await GlobalCodeCategories.findAll({
				where: attributes,
				attributes: ['id', 'type', 'label'],
				include: [
					{
						model: GlobalCodes,
						where: { status: 1, parent_id: { [Op.eq]: null } },
						as: 'options', // Alias for GlobalCodes relation in GlobalCodeCategories
						required: false,
						attributes: [
							'id',
							'global_code_category_id',
							'code',
							'name',
							'appraisal_default',
							'comps_default',
							'evaluation_default',
							'default_order',
						],
						include: [
							{
								model: GlobalCodes,
								where: { status: 1, parent_id: { [Op.ne]: null } }, // Condition for the parent-child relationship
								as: 'sub_options', // Alias for the self-referencing child relationship
								required: false,
								attributes: [
									'id',
									'global_code_category_id',
									'code',
									'name',
									'parent_id',
									'appraisal_default',
									'evaluation_default',
									'default_order'
								],
							},
						],
					},
				],
				order: [
					// Sorting options by code, and 'type_my_own' comes last
					[
						Sequelize.literal(
							`CASE WHEN \`options\`.\`code\` IN ('type_my_own', 'Type My Own') THEN 1 ELSE 0 END`,
						),
						'ASC',
					],
					['options', 'name', 'ASC'], // Sorting options by name alphabetically

					[
						Sequelize.literal(
							`CASE WHEN \`options->sub_options\`.\`code\` IN ('type_my_own', 'Type My Own') THEN 1 ELSE 0 END`,
						),
						'ASC',
					],
					['options', 'sub_options', 'name', 'ASC'],
				],
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}
	// find global codes
	public async findGlobalCodeByAttribute(attributes: object): Promise<IGlobalCode> {
		try {
			const result = await GlobalCodeCategories.findOne({
				where: attributes,
				attributes: ['id', 'type', 'label'],
				include: [
					{
						model: GlobalCodes,
						where: { status: 1 },
						as: 'options', // Alias for GlobalCodes relation in GlobalCodeCategories
						required: false,
						attributes: ['id', 'global_code_category_id', 'code', 'name'],
						include: [
							{
								model: GlobalCodes,
								where: { status: 1 }, // Condition for the parent-child relationship
								as: 'sub_options', // Alias for the self-referencing child relationship
								required: false,
								attributes: ['id', 'global_code_category_id', 'code', 'name', 'parent_id'],
							},
						],
					},
				],
			});
			return result ? result.toJSON() : null;
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}

	/**
	 * @description Query to get global code sub options.
	 * @param attributes
	 * @returns
	 */
	public async getGlobalSubOptions(
		attributes: Partial<IGlobalSubOptionsCode>,
	): Promise<IGlobalSubOptionsCode[]> {
		try {
			return await GlobalCodes.findAll({
				where: attributes,
				attributes: ['code', 'name'],
			});
		} catch (e) {
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e.message || e;
		}
	}
}
