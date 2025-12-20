import { Router } from 'express';
import TemplateService from '../services/template/template.service';
import TemplateServiceEnhancements from '../services/template/template.service.enhancements';

class TemplateRoutes {
	router = Router();
	public template = new TemplateService();
	public templateEnhancements = new TemplateServiceEnhancements();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Create template
		this.router.post('/create', this.template.save);
		// Update template
		this.router.patch('/update/:id', this.template.save);
		// Delete template
		this.router.delete('/delete/:id', this.template.delete);
		// To get list of templates
		this.router.get('/list', this.template.getList);
		// To get template by id
		this.router.get('/get/:id', this.template.getById);
		// List of templates for dropdown
		this.router.get('/dropdown-list', this.template.dropdownTemplateList);
		// Create section
		this.router.post('/save-section', this.template.saveSection);
		// Update section
		this.router.patch('/update-section/:id', this.template.saveSection);
		// Delete section
		this.router.delete('/delete-section/:id', this.template.deleteSection);
		// To get section by id
		this.router.get('/get-section/:id', this.template.getSection);
		// Create section item
		this.router.post('/save-section-item', this.template.saveSectionItem);
		// Update section item
		this.router.patch('/update-section-item', this.template.saveSectionItem);
		// Delete section item
		this.router.delete('/delete-section-item/:id', this.template.deleteSectionItem);
		// Get list of all merge fields
		this.router.get('/merge-fields-list', this.template.mergeFieldsList);
		// Get merge field by id
		this.router.get('/merge-field/:id', this.template.getMergeFieldById);
		// To get template by id for report
		this.router.get('/report-template/:id', this.template.getTemplateForReport);
		// Save report template
		this.router.post('/save-report-template', this.template.saveReportTemplate);
		// Update report template
		this.router.post('/update-report-template/:id', this.template.saveReportTemplate);
		// Save snippet
		this.router.post('/save-snippet', this.template.saveSnippet);
		// Get list of all snippets
		this.router.get('/snippet-list', this.template.getSnippetsList);
		// Update snippet
		this.router.post('/update-snippet/:id', this.template.saveSnippet);
		// Delete snippet
		this.router.delete('/delete-snippet/:id', this.template.deleteSnippet);
		// Get merge fields data
		this.router.post('/merge-field-data', this.template.getMergeFieldData);
		// Save snippet category
		this.router.post('/save-snippet-category', this.template.saveSnippetsCategory);
		// Get list of all snippets category
		this.router.get('/snippet-category-list', this.template.getSnippetsCategoryList);
		// Update snippet Category
		this.router.patch('/update-snippet-category/:id', this.template.saveSnippetsCategory);
		// Delete snippet Category
		this.router.delete('/delete-snippet-category/:id', this.template.deleteSnippetCategory);
		// Get list of all snippets category
		this.router.get('/snippet-category/:id', this.template.getSnippetsCategory);

		// ========== NEW TEMPLATE BUILDER ROUTES ==========
		
		// Create template with configuration and scenarios
		this.router.post('/create-with-config', this.templateEnhancements.createTemplateWithConfig);
		
		// Get template with full configuration (sections, config, scenarios)
		this.router.get('/:id/full', this.templateEnhancements.getTemplateWithConfigHandler);
		
		// Get templates filtered by type and category
		this.router.get('/filter/by-type', this.templateEnhancements.getTemplatesByType);
		
		// Update template configuration
		this.router.put('/:id/configuration', this.templateEnhancements.updateTemplateConfiguration);
		
		// Clone a template
		this.router.post('/:id/clone', this.templateEnhancements.cloneTemplate);
		
		// Template scenarios management
		this.router.get('/:id/scenarios', this.templateEnhancements.getTemplateScenarios);
		this.router.post('/:id/scenarios', this.templateEnhancements.createTemplateScenario);
		this.router.put('/:id/scenarios/:scenarioId', this.templateEnhancements.updateTemplateScenario);
		this.router.delete('/:id/scenarios/:scenarioId', this.templateEnhancements.deleteTemplateScenario);
	}
}

export default new TemplateRoutes().router;
