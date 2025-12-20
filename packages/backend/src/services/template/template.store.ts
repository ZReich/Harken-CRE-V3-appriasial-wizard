import DefaultEnum, { LoggerEnum } from '../../utils/enums/DefaultEnum';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { ITemplate, ITemplateListRequest, ITemplateListSuccess } from './ITemplateService';
import { Op } from 'sequelize';
import { ISection } from '../sections/ISectionsService';
import { ISectionItem } from '../sectionItems/ISectionItemsService';
import { SectionEnum } from '../../utils/enums/MessageEnum';
import AppraisalsEnum, { ReportTemplateEnum } from '../../utils/enums/AppraisalsEnum';
import AppraisalApproachStore from '../appraisalApproaches/appraisalApproaches.store';
import AppraisalSalesStore from '../appraisalSalesApproach/appraisalSales.store';
const Template = database.template;
const Sections = database.sections;
const SectionItem = database.section_item;
const helperFunction = new HelperFunction();
export default class TemplateStore {
	private appraisalApproachesStore = new AppraisalApproachStore();
	private appraisalSalesApproachStore = new AppraisalSalesStore();
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create template
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: ITemplate): Promise<ITemplate> {
		try {
			return await Template.create(attributes);
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
	 * @description function to update template
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<ITemplate>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await Template.update(rest, {
				where: {
					id,
				},
			});
		} catch (e) {
			//logging error
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
	 * @description Query to delete template.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<ITemplate>): Promise<boolean> {
		try {
			return await Template.destroy({
				where: attributes,
			});
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description Function to find template.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ITemplate>) {
		try {
			return await Template.findOne({
				where: attributes,
				include: [
					{
						model: Sections,
						where: { parent_id: { [Op.is]: null } },
						as: 'sections', // Alias for sections association
						required: false,
						attributes: ['id', 'title', 'order'],
						include: [
							{
								model: SectionItem,
								as: 'items', // Alias for section item association
								required: false,
								attributes: ['id', 'type', 'content', 'order', 'sub_section_id'],
								include: [
									{
										model: Sections,
										as: 'subsections', // Include subsections for each section
										required: false,
										attributes: ['id', 'title', 'order'],
										include: [
											{
												model: SectionItem,
												as: 'items', // Include SectionItems for subsections
												required: false,
												attributes: ['id', 'type', 'content', 'order', 'sub_section_id'],
											},
										],
									},
								],
							},
						],
					},
					{
						model: database.template_configuration,
						as: 'configurations',
						required: false,
					},
					{
						model: database.template_scenarios,
						as: 'template_scenarios',
						required: false,
					},
				],
				// Apply global order for sections, items, and subsections
				order: [
					['sections', 'order', 'ASC'], // Order by section 'order' field
					['sections', 'items', 'order', 'ASC'], // Order section items by 'order' field
					['sections', 'items', 'subsections', 'order', 'ASC'], // Order subsections by 'order' field
					['sections', 'items', 'subsections', 'items', 'order', 'ASC'], // Order subsection items by 'order' field
					['template_scenarios', 'display_order', 'ASC'], // Order scenarios by display_order
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

	/**
	 * @description Function to find template.
	 * @param attributes
	 * @returns
	 */
	public async findTemp(attributes: Partial<ITemplate>): Promise<ITemplate> {
		try {
			return await Template.findOne({
				where: attributes,
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
	/**
	 * @description Function to get list of templates.
	 * @param attributes
	 * @returns
	 */
	public async findList(attributes: Partial<ITemplateListRequest>): Promise<ITemplateListSuccess> {
		try {
			const page = attributes.page ? parseInt(attributes.page as any, 10) : 1;
			const limit = attributes.limit ? parseInt(attributes.limit as any, 10) : 10;
			const search = attributes.search || '';
			const orderByColumn = attributes.orderByColumn || DefaultEnum.NAME;
			const orderBy = attributes.orderBy || 'asc';
			const accountId = attributes.accountId;
			const offset = (page - 1) * limit;

			const filters: any = {};
			if (accountId) {
				filters.account_id = accountId;
			}
			if (search) {
				filters.name = { [Op.like]: `%${search}%` };
			}

			filters.appraisal_id = { [Op.is]: null };

			const { count, rows } = await Template.findAndCountAll({
				limit,
				offset,
				order: [[orderByColumn, orderBy]],
				where: filters,
			});

			return { template: rows, page, perPage: limit, totalRecord: count };
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
	 * @description Function to find template.
	 * @param attributes
	 * @returns
	 */
	public async findTemplate(attributes: Partial<ITemplate>): Promise<ITemplate> {
		try {
			return await Template.findOne({
				where: attributes,
				attributes: ['name', 'description', 'parent_id'],
				include: [
					{
						model: Sections,
						where: { parent_id: { [Op.is]: null } },
						as: 'sections',
						attributes: ['title', 'order'], // Alias for sections association
						required: false,
						include: [
							{
								model: SectionItem,
								as: 'items',
								attributes: ['type', 'content', 'order'], // Alias for section item association
								required: false,
								include: [
									{
										model: Sections,
										as: 'subsections', // Include subsections for each section
										attributes: ['title', 'order'], // Alias for subsections association
										required: false,
										include: [
											{
												model: SectionItem,
												as: 'items', // Include SectionItems for subsections
												attributes: ['type', 'content', 'order'], // Alias for section item association
												required: false,
											},
										],
									},
								],
							},
						],
					},
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
	/**
	 * @description Function to save report template.
	 * @param attributes
	 * @returns
	 */
	public async createReportTemplate(attributes: Partial<ITemplate>): Promise<ITemplate> {
		try {
			const { name, account_id, description, sections, appraisal_id, parent_id } = attributes;

			// Create the template
			const template = await Template.create({
				name,
				account_id,
				description,
				appraisal_id,
				parent_id,
			});

			// Helper function to create sections and subsections
			const createSections = async (sections: any[], parentId: number | null) => {
				for (const section of sections) {
					// Create the section or subsection
					const createdSection = await Sections.create({
						title: section.title,
						order: section.order,
						template_id: template.id,
						parent_id: parentId,
					});

					// Create items for the section or subsection
					for (const item of section.items) {
						await SectionItem.create({
							type: item.type,
							content: item.content,
							order: item.order,
							section_id: createdSection.id,
							template_id: template.id,
						});
					}

					// Recursively create subsections
					if (section?.subsections && section?.subsections?.length > 0) {
						await createSections(section?.subsections, createdSection?.id);
					}
				}
			};

			// Start creating sections and subsections from the top level
			await createSections(sections, null);
			return template;
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
	 * @description Function to update report template.
	 * @param templateData
	 * @returns
	 */
	public async updateReportTemplate(templateData: Partial<ITemplate>): Promise<boolean> {
		try {
			const { sections, id, appraisal_id, ...rest } = templateData;

			// Update the template if there are changes in other fields
			if (appraisal_id && rest) {
				await Template.update(rest, { where: { id, appraisal_id } });
			}

			// Get existing sections from the database
			const existingSections = await Sections.findAll({ where: { template_id: id } });

			let sectionOrder = 1; // Initialize section order

			for (const sectionData of sections) {
				let existingSection = existingSections.find(
					(section: ISection) => section?.id === sectionData?.id,
				);

				if (existingSection) {
					// Update existing section with manually set order
					await Sections.update(
						{
							title: sectionData?.title,
							order: sectionOrder++, // Increment section order
						},
						{ where: { id: sectionData.id } },
					);
				} else {
					// Create new section with manually set order
					existingSection = await Sections.create({
						...sectionData,
						template_id: id,
						order: sectionOrder++, // Increment section order
					});
				}

				// Handle Section Items
				const existingSectionItems = await SectionItem.findAll({
					where: { section_id: existingSection.id },
				});

				let itemOrder = 1; // Initialize item order
				const processedItemIds: number[] = [];

				for (const itemData of sectionData.items) {
					let subSectionId = null;

					if (itemData?.type === SectionEnum.SUBSECTION) {
						const subsection = itemData?.subsections;

						// Create the subsection with manually set order
						const createdSubsection = await Sections.create({
							title: subsection?.title,
							parent_id: existingSection?.id,
							template_id: id,
						});
						subSectionId = createdSubsection?.id;

						// Add an entry in SectionItem table for the subsection
						const subsectionItem = await SectionItem.create({
							type: itemData?.type,
							content: itemData?.content,
							order: itemOrder++, // Increment item order
							section_id: existingSection?.id,
							template_id: id,
							sub_section_id: subSectionId,
						});
						processedItemIds.push(subsectionItem?.id);

						// Handle Subsection Items with manual order
						let subItemOrder = 1; // Initialize subsection item order
						for (const subItemData of subsection.items) {
							const existingSubItem = existingSectionItems.find(
								(item: ISectionItem) => item?.id === subItemData?.id,
							);

							const subItemPayload = {
								type: subItemData?.type,
								content: subItemData?.content,
								order: subItemOrder++, // Increment sub-item order
								section_id: createdSubsection?.id,
								template_id: id,
							};

							if (existingSubItem) {
								// Update subsection item
								await SectionItem.update(subItemPayload, { where: { id: subItemData?.id } });
								processedItemIds.push(subItemData?.id);
							} else {
								// Create subsection item
								const newItem = await SectionItem.create(subItemPayload);
								processedItemIds.push(newItem?.id);
							}
						}
					} else {
						const existingItem = existingSectionItems.find(
							(item: ISectionItem) => item?.id === itemData?.id,
						);

						const itemPayload = {
							type: itemData?.type,
							content: itemData?.content,
							order: itemOrder++, // Increment item order
							section_id: existingSection?.id,
							template_id: id,
							sub_section_id: subSectionId,
						};

						if (existingItem) {
							// Update item
							await SectionItem.update(itemPayload, { where: { id: itemData?.id } });
							processedItemIds.push(itemData?.id);
						} else {
							// Create item
							const newItem = await SectionItem.create(itemPayload);
							processedItemIds.push(newItem?.id);
						}
					}
				}

				// Remove Section Items not in the payload
				for (const existingItem of existingSectionItems) {
					if (!processedItemIds.includes(existingItem?.id)) {
						await SectionItem.destroy({ where: { id: existingItem?.id } });
					}
				}
			}

			// Remove Sections not in the payload
			for (const existingSection of existingSections) {
				if (!sections.find((section) => section.id === existingSection?.id)) {
					await Sections.destroy({ where: { id: existingSection?.id } });
				}
			}

			return true;
		} catch (e) {
			//logging error
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
	 * @description Function to get template list for dropdown.
	 * @param attributes
	 * @returns
	 */
	public async findAll(attributes: Partial<ITemplate>): Promise<ITemplate[]> {
		try {
			attributes.appraisal_id = null;
			return await Template.findAll({
				where: attributes,
				attributes: ['id', 'account_id', 'name', 'description', 'parent_id'],
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

	/**
	 * @description Function to create template for report
	 * @param templateData
	 * @returns
	 */
	public createTemplateForAppraisal = async (templateData): Promise<ITemplate> => {
		try {
			const { name, description, parent_id, account_id, sections, appraisal_id, created_by } =
				templateData;

			// Create the Template
			const template = await Template.create({
				name,
				description,
				account_id,
				appraisal_id,
				parent_id,
				created_by,
			});

			// Iterate over sections
			for (const sectionData of sections) {
				const sectionAttr = {
					title: sectionData.title,
					order: sectionData.order,
					template_id: template.id,
				};
				const section = await Sections.create(sectionAttr);

				// Iterate over section items
				for (const itemData of sectionData.items) {
					let subSectionId = null;
					let approach;
					let contentData;
					let approachId: number = null;
					if (itemData.type === ReportTemplateEnum.SUBSECTION) {
						// Create a new section for the subsection
						const subSection = await Sections.create({
							title: itemData.subsections.title,
							order: itemData.subsections.order,
							template_id: template.id,
							parent_id: section.id,
						});

						subSectionId = subSection.id;
					} else if (
						(itemData?.type === ReportTemplateEnum.APPROACH && itemData?.content) ||
						(itemData?.type === ReportTemplateEnum.MAP &&
							(itemData?.content === AppraisalsEnum.COST ||
								itemData?.content === AppraisalsEnum.SALE))
					) {
						approach = await this.appraisalApproachesStore.findSelectedApproaches({
							appraisal_id,
							type: itemData.content,
						});
						if (approach?.length) {
							contentData = `${itemData.content}_${approach[0].id}`;
							approachId = approach[0].id;
						}
					} else {
						contentData = itemData.content;
					}

					// Create the SectionItem
					SectionItem.create({
						type: itemData.type,
						content: contentData,
						order: itemData.order,
						section_id: section.id,
						sub_section_id: subSectionId,
						template_id: template.id,
						appraisal_approach_id: approachId,
					});

					// Handle items inside the subsection if they exist
					if (itemData.subsections && itemData.subsections.items) {
						for (const subItemData of itemData.subsections.items) {
							let subApproach;
							let subContent;
							let subApproachId: number = null;
							if (
								(subItemData?.type === ReportTemplateEnum.APPROACH && subItemData?.content) ||
								(subItemData?.type === ReportTemplateEnum.MAP &&
									(subItemData?.content === AppraisalsEnum.COST ||
										subItemData?.content === AppraisalsEnum.SALE))
							) {
								subApproach = await this.appraisalApproachesStore.findSelectedApproaches({
									appraisal_id,
									type: subItemData.content,
								});
								if (subApproach?.length) {
									subContent = `${subItemData.content}_${subApproach[0].id}`;
									subApproachId = subApproach[0].id;
								}
							} else {
								subContent = subItemData.content;
							}

							SectionItem.create({
								type: subItemData.type,
								content: subContent,
								order: subItemData.order,
								section_id: subSectionId,
								template_id: template.id,
								appraisal_approach_id: subApproachId,
							});
						}
					}
				}
			}
			return template;
		} catch (e) {
			// Logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return e;
		}
	};

	/**
	 * @description Get templates filtered by type/category with pagination
	 * @param filters - Object containing filter criteria
	 * @returns Promise<any>
	 */
	public async getAllTemplates(filters: any): Promise<any> {
		try {
			const {
				report_type,
				property_category,
				allow_vacant_land,
				search,
				limit = 20,
				offset = 0,
			} = filters;

			const where: any = {};
			if (report_type) where.report_type = report_type;
			if (property_category) where.property_category = property_category;
			if (allow_vacant_land !== undefined)
				where.allow_vacant_land = allow_vacant_land;

			// Add search if provided
			if (search) {
				where[Op.or] = [
					{ name: { [Op.like]: `%${search}%` } },
					{ description: { [Op.like]: `%${search}%` } },
				];
			}

			const { rows: templates, count: totalRecord } = await Template.findAndCountAll(
				{
					where,
					limit: parseInt(limit),
					offset: parseInt(offset),
					order: [['date_created', 'DESC']],
					include: [
						{
							model: database.template_configuration,
							as: 'configurations',
							required: false,
						},
						{
							model: database.template_scenarios,
							as: 'template_scenarios',
							required: false,
						},
					],
				}
			);

			return {
				templates,
				totalRecord,
				page: Math.floor(offset / limit) + 1,
				perPage: limit,
			};
		} catch (e) {
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
		return {
			templates: [],
			totalRecord: 0,
			page: 1,
			perPage: filters?.limit || 20,
		};
		}
	}
}
