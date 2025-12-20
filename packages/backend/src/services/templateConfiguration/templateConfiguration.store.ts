import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { ITemplateConfiguration } from '../template/ITemplateService';

const TemplateConfiguration = database.template_configuration;
const helperFunction = new HelperFunction();

export default class TemplateConfigurationStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * Create a template configuration entry
	 */
	public async create(
		attributes: Partial<ITemplateConfiguration>
	): Promise<ITemplateConfiguration> {
		try {
			return await TemplateConfiguration.create(attributes);
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			throw e;
		}
	}

	/**
	 * Update a template configuration entry
	 */
	public async update(
		id: number,
		attributes: Partial<ITemplateConfiguration>
	): Promise<boolean> {
		try {
			const [affectedRows] = await TemplateConfiguration.update(attributes, {
				where: { id },
			});
			return affectedRows > 0;
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	}

	/**
	 * Find configuration by template_id and config_key
	 */
	public async findByTemplateAndKey(
		template_id: number,
		config_key: string
	): Promise<ITemplateConfiguration | null> {
		try {
			return await TemplateConfiguration.findOne({
				where: { template_id, config_key },
			});
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return null;
		}
	}

	/**
	 * Find all configurations for a template
	 */
	public async findAllByTemplate(
		template_id: number
	): Promise<ITemplateConfiguration[]> {
		try {
			return await TemplateConfiguration.findAll({
				where: { template_id },
			});
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return [];
		}
	}

	/**
	 * Upsert (create or update) a configuration
	 */
	public async upsert(
		attributes: Partial<ITemplateConfiguration>
	): Promise<ITemplateConfiguration> {
		try {
			const existing = await this.findByTemplateAndKey(
				attributes.template_id,
				attributes.config_key
			);

			if (existing) {
				await this.update(existing.id, attributes);
				return { ...existing, ...attributes };
			} else {
				return await this.create(attributes);
			}
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			throw e;
		}
	}

	/**
	 * Delete configuration(s) by template_id
	 */
	public async deleteByTemplate(template_id: number): Promise<boolean> {
		try {
			const count = await TemplateConfiguration.destroy({
				where: { template_id },
			});
			return count > 0;
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	}

	/**
	 * Bulk create or update configurations for a template
	 */
	public async bulkUpsert(
		template_id: number,
		configurations: Array<{ config_key: string; config_value: string }>
	): Promise<boolean> {
		try {
			for (const config of configurations) {
				await this.upsert({
					template_id,
					config_key: config.config_key,
					config_value: config.config_value,
				});
			}
			return true;
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return false;
		}
	}
}













