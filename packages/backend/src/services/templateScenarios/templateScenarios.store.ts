import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { ITemplateScenario } from '../template/ITemplateService';

const TemplateScenarios = database.template_scenarios;
const helperFunction = new HelperFunction();

export default class TemplateScenariosStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * Create a template scenario
	 */
	public async create(
		attributes: Partial<ITemplateScenario>
	): Promise<ITemplateScenario> {
		try {
			// Convert array to JSON string if needed
			if (
				attributes.default_approaches &&
				Array.isArray(attributes.default_approaches)
			) {
				attributes.default_approaches = JSON.stringify(
					attributes.default_approaches
				);
			}
			return await TemplateScenarios.create(attributes);
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
	 * Update a template scenario
	 */
	public async update(
		id: number,
		attributes: Partial<ITemplateScenario>
	): Promise<boolean> {
		try {
			// Convert array to JSON string if needed
			if (
				attributes.default_approaches &&
				Array.isArray(attributes.default_approaches)
			) {
				attributes.default_approaches = JSON.stringify(
					attributes.default_approaches
				);
			}

			const [affectedRows] = await TemplateScenarios.update(attributes, {
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
	 * Find scenario by ID
	 */
	public async findById(id: number): Promise<ITemplateScenario | null> {
		try {
			const scenario = await TemplateScenarios.findByPk(id);
			if (scenario && scenario.default_approaches) {
				// Parse JSON string to array if needed
				if (typeof scenario.default_approaches === 'string') {
					scenario.default_approaches = JSON.parse(
						scenario.default_approaches
					);
				}
			}
			return scenario;
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
	 * Find all scenarios for a template, ordered by display_order
	 */
	public async findAllByTemplate(
		template_id: number
	): Promise<ITemplateScenario[]> {
		try {
			const scenarios = await TemplateScenarios.findAll({
				where: { template_id },
				order: [['display_order', 'ASC']],
			});

			// Parse JSON strings to arrays
			return scenarios.map((scenario) => {
				if (
					scenario.default_approaches &&
					typeof scenario.default_approaches === 'string'
				) {
					scenario.default_approaches = JSON.parse(
						scenario.default_approaches
					);
				}
				return scenario;
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
	 * Delete a template scenario
	 */
	public async delete(id: number): Promise<boolean> {
		try {
			const count = await TemplateScenarios.destroy({
				where: { id },
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
	 * Delete all scenarios for a template
	 */
	public async deleteByTemplate(template_id: number): Promise<boolean> {
		try {
			const count = await TemplateScenarios.destroy({
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
	 * Bulk create scenarios for a template
	 */
	public async bulkCreate(
		scenarios: Partial<ITemplateScenario>[]
	): Promise<ITemplateScenario[]> {
		try {
			// Convert arrays to JSON strings
			const preparedScenarios = scenarios.map((scenario) => ({
				...scenario,
				default_approaches:
					Array.isArray(scenario.default_approaches)
						? JSON.stringify(scenario.default_approaches)
						: scenario.default_approaches,
			}));

			return await TemplateScenarios.bulkCreate(preparedScenarios);
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
	 * Reorder scenarios for a template
	 */
	public async reorder(
		template_id: number,
		scenarioOrders: Array<{ id: number; display_order: number }>
	): Promise<boolean> {
		try {
			for (const { id, display_order } of scenarioOrders) {
				await TemplateScenarios.update(
					{ display_order },
					{ where: { id, template_id } }
				);
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













