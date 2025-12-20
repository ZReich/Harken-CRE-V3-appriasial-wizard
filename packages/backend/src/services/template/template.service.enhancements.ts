/**
 * Template Service Enhancements
 * Additional methods for template builder functionality
 * These methods extend the existing TemplateService with new capabilities
 */

import { Response } from 'express';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import SendResponse from '../../utils/common/commonResponse';
import { TemplateEnum } from '../../utils/enums/MessageEnum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import HelperFunction from '../../utils/common/helper';
import TemplateStore from './template.store';
import TemplateConfigurationStore from '../templateConfiguration/templateConfiguration.store';
import TemplateScenariosStore from '../templateScenarios/templateScenarios.store';
import SectionStore from '../sections/sections.store';
import SectionItemStore from '../sectionItems/sectionItem.store';
import {
	ITemplate,
	ITemplateWithConfigRequest,
	ITemplateFilterRequest,
	ITemplateConfigurationRequest,
	ITemplateScenarioRequest,
	ITemplateConfiguration,
	ITemplateScenario,
} from './ITemplateService';

const helperFunction = new HelperFunction();

export default class TemplateServiceEnhancements {
	private templateStore = new TemplateStore();
	private templateConfigStore = new TemplateConfigurationStore();
	private templateScenariosStore = new TemplateScenariosStore();
	private sectionStore = new SectionStore();
	private sectionItemStore = new SectionItemStore();

	/**
	 * Create template with configuration and scenarios
	 * Handles the complete template creation flow from the Template Builder UI
	 */
	public createTemplateWithConfig = async (
		request: ITemplateWithConfigRequest,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const { user } = request;
			const {
				name,
				description,
				report_type,
				property_category,
				allow_improved,
				allow_vacant_land,
				scenario_preset,
				enable_data_inheritance,
				account_id,
				configurations,
				template_scenarios,
				sections,
			} = request.body;

			// Validation: At least one composition type must be allowed
			if (!allow_improved && !allow_vacant_land) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message:
						'At least one composition type (improved or vacant land) must be allowed',
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Create the base template
			const template = await this.templateStore.create({
				name,
				description,
				report_type,
				property_category,
				allow_improved: allow_improved ? 1 : 0,
				allow_vacant_land: allow_vacant_land ? 1 : 0,
				scenario_preset,
				enable_data_inheritance: enable_data_inheritance ? 1 : 0,
				account_id: account_id || user.account_id,
				created_by: user.id,
			} as any);

			// Create configurations if provided
			if (configurations && configurations.length > 0) {
				await this.templateConfigStore.bulkUpsert(
					template.id,
					configurations
				);
			}

			// Create scenarios if provided
			if (template_scenarios && template_scenarios.length > 0) {
				const scenariosWithTemplateId = template_scenarios.map(
					(scenario, index) => ({
						...scenario,
						template_id: template.id,
						display_order: scenario.display_order ?? index,
					})
				);
				await this.templateScenariosStore.bulkCreate(
					scenariosWithTemplateId
				);
			}

			// Create sections if provided
			if (sections && sections.length > 0) {
				for (const section of sections) {
					const createdSection = await this.sectionStore.create({
						...section,
						template_id: template.id,
					});

					// Create section items if provided
					if (section.items && section.items.length > 0) {
						for (const item of section.items) {
							await this.sectionItemStore.create({
								...item,
								section_id: createdSection.id,
							});
						}
					}
				}
			}

			// Fetch the complete template with all relations
			const completeTemplate = await this.getTemplateWithConfig(template.id);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: TemplateEnum.TEMPLATE_SAVE_SUCCESS,
				data: completeTemplate,
			};

			helperFunction.log({
				message: `Template created with config: ${template.id}`,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Get template with full configuration
	 * Returns template with sections, configurations, and scenarios
	 */
	private async getTemplateWithConfig(
		template_id: number
	): Promise<ITemplate | null> {
		try {
			const template = await this.templateStore.findByAttribute({
				id: template_id,
			});

			if (!template) {
				return null;
			}

			// Load configurations
			template.configurations = await this.templateConfigStore.findAllByTemplate(
				template_id
			);

			// Load scenarios
			template.template_scenarios = await this.templateScenariosStore.findAllByTemplate(
				template_id
			);

			return template;
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
	 * Get template with full config (public route handler)
	 */
	public getTemplateWithConfigHandler = async (
		request: any,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const { id } = request.params;
			const template = await this.getTemplateWithConfig(parseInt(id));

			if (!template) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: TemplateEnum.TEMPLATE_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Template retrieved successfully',
				data: template,
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Get templates filtered by type and category
	 */
	public getTemplatesByType = async (
		request: ITemplateFilterRequest,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const {
				report_type,
				property_category,
				allow_vacant_land,
				page = 1,
				limit = 20,
				search,
			} = request.query;

			// Build filters
			const filters: any = {};
			if (report_type) filters.report_type = report_type;
			if (property_category) filters.property_category = property_category;
			if (allow_vacant_land !== undefined)
				filters.allow_vacant_land = allow_vacant_land;

			// Get filtered templates
			const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

			const templates = await this.templateStore.getAllTemplates({
				...filters,
				search,
				limit: parseInt(limit as string),
				offset,
			});

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Templates retrieved successfully',
				data: templates,
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Update template configuration
	 */
	public updateTemplateConfiguration = async (
		request: ITemplateConfigurationRequest,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const { template_id, configurations } = request.body;

			// Validate template exists
			const template = await this.templateStore.findByAttribute({
				id: template_id,
			});

			if (!template) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: TemplateEnum.TEMPLATE_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Update configurations
			await this.templateConfigStore.bulkUpsert(template_id, configurations);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Template configuration updated successfully',
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Clone an existing template
	 */
	public cloneTemplate = async (
		request: any,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const { id } = request.params;
			const { name } = request.body;
			const { user } = request;

			// Get source template with all data
			const sourceTemplate = await this.getTemplateWithConfig(parseInt(id));

			if (!sourceTemplate) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: TemplateEnum.TEMPLATE_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Create new template
			const newTemplate = await this.templateStore.create({
				name: name || `${sourceTemplate.name} (Copy)`,
				description: sourceTemplate.description,
				report_type: sourceTemplate.report_type,
				property_category: sourceTemplate.property_category,
				allow_improved: sourceTemplate.allow_improved,
				allow_vacant_land: sourceTemplate.allow_vacant_land,
				scenario_preset: sourceTemplate.scenario_preset,
				enable_data_inheritance: sourceTemplate.enable_data_inheritance,
				account_id: user.account_id,
				created_by: user.id,
				parent_id: sourceTemplate.id,
			} as any);

			// Clone configurations
			if (sourceTemplate.configurations) {
				const configsToClone = sourceTemplate.configurations.map((config) => ({
					config_key: config.config_key,
					config_value: config.config_value,
				}));
				await this.templateConfigStore.bulkUpsert(
					newTemplate.id,
					configsToClone
				);
			}

			// Clone scenarios
			if (sourceTemplate.template_scenarios) {
				const scenariosToClone = sourceTemplate.template_scenarios.map(
					(scenario) => ({
						template_id: newTemplate.id,
						scenario_type: scenario.scenario_type,
						custom_name: scenario.custom_name,
						display_order: scenario.display_order,
						default_approaches: scenario.default_approaches,
						require_completion_date: scenario.require_completion_date,
						require_hypothetical_statement:
							scenario.require_hypothetical_statement,
					})
				);
				await this.templateScenariosStore.bulkCreate(scenariosToClone);
			}

			// Clone sections and items
			if (sourceTemplate.sections) {
				for (const section of sourceTemplate.sections) {
					const newSection = await this.sectionStore.create({
						template_id: newTemplate.id,
						title: section.title,
						order: section.order,
						parent_id: section.parent_id,
					});

					if (section.items) {
						for (const item of section.items) {
							await this.sectionItemStore.create({
								section_id: newSection.id,
								type: item.type,
								content: item.content,
								order: item.order,
							} as any);
						}
					}
				}
			}

			const clonedTemplate = await this.getTemplateWithConfig(newTemplate.id);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Template cloned successfully',
				data: clonedTemplate,
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Create template scenario
	 */
	public createTemplateScenario = async (
		request: ITemplateScenarioRequest,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const scenarioData = request.body;

			const scenario = await this.templateScenariosStore.create(scenarioData);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Template scenario created successfully',
				data: scenario,
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Update template scenario
	 */
	public updateTemplateScenario = async (
		request: any,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const { scenarioId } = request.params;
			const scenarioData = request.body;

			const updated = await this.templateScenariosStore.update(
				parseInt(scenarioId),
				scenarioData
			);

			if (!updated) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: 'Template scenario not found',
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Template scenario updated successfully',
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Delete template scenario
	 */
	public deleteTemplateScenario = async (
		request: any,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const { scenarioId } = request.params;

			const deleted = await this.templateScenariosStore.delete(
				parseInt(scenarioId)
			);

			if (!deleted) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: 'Template scenario not found',
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Template scenario deleted successfully',
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * Get template scenarios
	 */
	public getTemplateScenarios = async (
		request: any,
		response: Response
	): Promise<Response> => {
		let data;
		try {
			const { id } = request.params;

			const scenarios = await this.templateScenariosStore.findAllByTemplate(
				parseInt(id)
			);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Template scenarios retrieved successfully',
				data: scenarios,
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
}

