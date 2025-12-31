import Joi from 'joi';
import { SectionEnum } from '../../utils/enums/MessageEnum';

export const subSectionItemSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	section_id: Joi.number().optional().allow(null),
	template_id: Joi.number().allow(null),
	type: Joi.valid(
		SectionEnum.APPROACH,
		SectionEnum.MAP,
		SectionEnum.IMAGE,
		SectionEnum.TEXT_BLOCK,
		SectionEnum.INCOME_COMPARISON,
	).required(),
	content: Joi.string().optional().allow(null, ''),
});
export const sectionItemSchema = Joi.object({
	id: Joi.number().optional().allow(null),
	section_id: Joi.number().optional().allow(null),
	template_id: Joi.number().optional().allow(null),
	type: Joi.valid(
		SectionEnum.APPROACH,
		SectionEnum.MAP,
		SectionEnum.IMAGE,
		SectionEnum.TEXT_BLOCK,
		SectionEnum.SUBSECTION,
		SectionEnum.PHOTO_PAGES,
		SectionEnum.INCOME_COMPARISON,
	).required(),
	content: Joi.string().optional().allow(null, ''),
	order: Joi.number().optional().allow(null),
	subsections: Joi.when('type', {
		is: SectionEnum.SUBSECTION,
		then: Joi.object({
			id: Joi.number().optional().allow(null),
			title: Joi.string().required(), // Title is required for subsections
			order: Joi.number().optional().allow(null),
			items: Joi.array()
				.items(
					Joi.object({
						id: Joi.number().optional().allow(null),
						template_id: Joi.number().allow(null),
						parent_id: Joi.number().optional().allow(null),
						type: Joi.valid(
							SectionEnum.APPROACH,
							SectionEnum.MAP,
							SectionEnum.IMAGE,
							SectionEnum.TEXT_BLOCK,
							SectionEnum.PHOTO_PAGES,
							SectionEnum.INCOME_COMPARISON,
						).required(),
						content: Joi.string().optional().allow(null, ''),
						order: Joi.number().optional().allow(null),
					}),
				)
				.optional()
				.allow(null, ''),
		}),
		otherwise: Joi.object().optional().allow(null),
	}),
});
