import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import { Response } from 'express';
import SendResponse from '../../utils/common/commonResponse';
import UserEnum, {
	AppraisalEnum,
	SectionEnum,
	SnippetEnum,
	TemplateEnum,
} from '../../utils/enums/MessageEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import HelperFunction from '../../utils/common/helper';
import { IError, ISuccess } from '../../utils/interfaces/common';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import {
	IReportTempSaveRequest,
	ITemplate,
	ITemplateCreateRequest,
	ITemplateListRequest,
	ITemplateListSuccess,
	ITemplateRequest,
	ITemplateSuccess,
} from './ITemplateService';
import { reportTemplateSchema, templateSchema } from './template.validations';
import TemplateStore from './template.store';
import StatusEnum from '../../utils/enums/StatusEnum';
import SectionStore from '../sections/sections.store';
import SectionItemStore from '../sectionItems/sectionItem.store';
import {
	ISection,
	ISectionCreateRequest,
	ISectionRequest,
	ISectionSuccess,
} from '../sections/ISectionsService';
import { sectionSchema } from '../sections/sections.validations';
import {
	ISectionItem,
	ISectionItemCreateRequest,
	ISectionItemSuccess,
} from '../sectionItems/ISectionItemsService';
import { sectionItemSchema } from '../sectionItems/sectionItem.validations';
import {
	ISnippet,
	ISnippetCreateRequest,
	ISnippetRequest,
	ISnippetSuccess,
} from '../snippets/ISnippetsService';
import { snippetSchema } from '../snippets/snippets.validations';
import SnippetStore from '../snippets/snippets.store';
import {
	IMergeFieldDataRequest,
	IMergeFields,
	IMergeFieldsListRequest,
	IMergeFieldsRequest,
	IMergeFieldsSuccess,
} from '../mergeFields/IMergeFieldService';
import MergeFieldStore from '../mergeFields/mergeField.store';
import AppraisalApproachStore from '../appraisalApproaches/appraisalApproaches.store';
import {
	IAppraisalApproach,
	ResponseApproachObject,
} from '../appraisalApproaches/IAppraisalApproachesService';
import AppraisalsStore from '../appraisals/appraisals.store';
import AppraisalsEnum, {
	GlobalCodeEnums,
	ReportTemplateEnum,
} from '../../utils/enums/AppraisalsEnum';
import { IAppraisal } from '../appraisals/IAppraisalsService';
import { MergeFieldEnum } from '../../utils/enums/MergeFieldsEnum';
import { Op } from 'sequelize';
import CommonStore from '../common/common.store';
import CompsEnum from '../../utils/enums/CompsEnum';
import {
	IAddSnippetsCategoryRequest,
	ISnippetsCategory,
	ISnippetsCategoryRequest,
	ISnippetsCategorySuccess,
} from '../snippetsCategory/ISnippetsCategoryService';
import { snippetsCategorySchema } from '../snippetsCategory/snippetsCategory.validations';
import SnippetsCategoryStore from '../snippetsCategory/snippetsCategory.store';
const helperFunction = new HelperFunction();
const requiredRoles = [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV, RoleEnum.ADMINISTRATOR];

export default class TemplateService {
	private templateStore = new TemplateStore();
	private sectionStore = new SectionStore();
	private sectionItemStore = new SectionItemStore();
	private snippetStore = new SnippetStore();
	private mergeFieldStore = new MergeFieldStore();
	private appraisalApproachStore = new AppraisalApproachStore();
	private appraisalStore = new AppraisalsStore();
	private commonStore = new CommonStore();
	private snippetsCategoryStore = new SnippetsCategoryStore();
	constructor() {}

	/**
	 * @description function to create template
	 * @param request
	 * @param response
	 * @returns
	 */
	public save = async (request: ITemplateCreateRequest, response: Response): Promise<Response> => {
		let data: IError | ITemplateSuccess<ITemplate>;
		try {
			const { account_id, role, id } = request.user;
			// Role validations to create template
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate schema
			const params = await helperFunction.validate(templateSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = { ...request.body, account_id, created_by: id };
			const hasAlphabet = /^[0-9]+$/.test(request?.params?.id);
			if (Object.keys(request?.params).length && !hasAlphabet) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: TemplateEnum.INVALID_TEMPLATE_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const templateId = parseInt(request?.params?.id);
			if (templateId) {
				const findBy: Partial<ITemplate> = {
					id: templateId,
				};
				if (role === RoleEnum.ADMINISTRATOR) {
					findBy.account_id = account_id;
				}
				const findTemplate = await this.templateStore.findByAttribute(findBy);
				if (!findTemplate) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: TemplateEnum.TEMPLATE_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// Updating template
				attributes.id = templateId;
				const updateTemplate = await this.templateStore.update(attributes);
				if (!updateTemplate) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: TemplateEnum.TEMPLATE_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.TEMPLATE_SAVE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			const { appraisal_id } = attributes;
			if (appraisal_id) {
				// Checking appraisal id is valid or not
				const findAppraisal = await this.appraisalStore.findByAttribute({ id: appraisal_id });
				if (!findAppraisal) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.INVALID_APPRAISAL_ID,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				// Checking if template already exists for appraisal or not
				const findTemplate = await this.templateStore.findByAttribute({ appraisal_id });
				if (findTemplate) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: TemplateEnum.TEMPLATE_ALREADY_EXISTS,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}

			// Creating template
			const createTemplate = await this.templateStore.create(attributes);

			if (!createTemplate) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: TemplateEnum.TEMPLATE_SAVE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: TemplateEnum.TEMPLATE_SAVE_SUCCESS,
				data: createTemplate,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to delete template.
	 * @param request
	 * @param response
	 * @returns
	 */
	public delete = async (request: ITemplateRequest, response: Response): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { account_id, role } = request.user;
			// Role validations to delete template
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const templateId = parseInt(request?.params?.id);
			if (!templateId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: TemplateEnum.ENTER_VALID_TEMPLATE_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attributes =
				role === RoleEnum.ADMINISTRATOR ? { account_id, id: templateId } : { id: templateId };

			if (attributes) {
				// Find template
				const findTemplate = await this.templateStore.findByAttribute(attributes);
				if (!findTemplate) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: TemplateEnum.TEMPLATE_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// Deleting template
				const deleteTemplate = await this.templateStore.delete(attributes);
				if (!deleteTemplate) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: TemplateEnum.TEMPLATE_DELETE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.TEMPLATE_DELETE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get list of template.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getList = async (request: ITemplateListRequest, response: Response): Promise<Response> => {
		let data: IError | ITemplateSuccess<ITemplateListSuccess>;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const attributes: any = { ...request.query };
			// Role validations to fetch list according to account id.
			if (role === RoleEnum.ADMINISTRATOR) {
				attributes.accountId = account_id;
			}
			// Fetching list of templates.
			const templateList = await this.templateStore.findList(attributes);
			if (templateList?.template?.length === 0) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.DATA_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: TemplateEnum.TEMPLATE_LIST_SUCCESS,
				data: templateList,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get template by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getById = async (request: ITemplateRequest, response: Response): Promise<Response> => {
		let data: IError | ITemplateSuccess<ITemplate>;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const templateId = parseInt(request?.params?.id);
			const attributes: Partial<ITemplate> = { id: templateId };

			// Role validations to get template
			if (role === (RoleEnum.ADMINISTRATOR || RoleEnum.USER)) {
				attributes.account_id = account_id;
			}

			// Fetching template by id
			const getTemplate = await this.templateStore.findByAttribute(attributes);
			if (!getTemplate) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: TemplateEnum.DATA_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: getTemplate,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description function to create section
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveSection = async (
		request: ISectionCreateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISectionSuccess<ISection>;
		try {
			const { role } = request.user;
			// Role validations to create section
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate schema
			const params = await helperFunction.validate(sectionSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = request.body;
			const sectionId = parseInt(request?.params?.id);
			if (sectionId) {
				// Find section
				const findSection = await this.sectionStore.findByAttribute({ id: sectionId });
				if (!findSection) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SectionEnum.SECTION_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				// Updating section
				attributes.id = sectionId;
				const updateSection = await this.sectionStore.update(attributes);
				if (!updateSection) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SectionEnum.SECTION_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: SectionEnum.SECTION_SAVE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			const { template_id, parent_id } = attributes;
			// Validating template by template id
			const validateTemplate = await this.templateStore.findTemp({
				id: template_id,
			});
			if (!validateTemplate) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: TemplateEnum.ENTER_VALID_TEMPLATE_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			if (parent_id) {
				const validateSection = await this.sectionStore.findByAttribute({
					id: parent_id,
					template_id,
				});
				if (!validateSection) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SectionEnum.ENTER_VALID_ID,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			// Create section
			const createSection = await this.sectionStore.create(attributes);
			if (!createSection) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SectionEnum.SECTION_SAVE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: SectionEnum.SECTION_SAVE_SUCCESS,
				data: createSection,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to delete section.
	 * @param request
	 * @param response
	 * @returns
	 */
	public deleteSection = async (
		request: ISectionRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { role } = request.user;
			// Role validations to delete section
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const sectionId = parseInt(request?.params?.id);
			if (!sectionId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SectionEnum.ENTER_VALID_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			if (sectionId) {
				// Find section
				const findSection = await this.sectionStore.findByAttribute({ id: sectionId });
				if (!findSection) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SectionEnum.SECTION_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// Deleting section
				const deleteSection = await this.sectionStore.delete({ id: sectionId });
				if (!deleteSection) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SectionEnum.SECTION_DELETE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: SectionEnum.SECTION_DELETE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get section by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSection = async (request: ISectionRequest, response: Response): Promise<Response> => {
		let data: IError | ISectionSuccess<ISection>;
		try {
			const { role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const sectionId = parseInt(request?.params?.id);
			if (!sectionId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SectionEnum.ENTER_VALID_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find section
			const findSection = await this.sectionStore.findByAttribute({ id: sectionId });
			if (!findSection) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: SectionEnum.SECTION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: findSection,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description function to save section item.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveSectionItem = async (
		request: ISectionItemCreateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISectionItemSuccess<ISectionItem>;
		try {
			const { role } = request.user;
			// Role validations to create section item
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate schema
			const params = await helperFunction.validate(sectionItemSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = request.body;
			// Validate section
			const validateSection = await this.sectionStore.findByAttribute({
				id: attributes?.section_id,
				template_id: attributes?.template_id,
			});
			if (!validateSection) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: SectionEnum.SECTION_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			const itemId = request?.body?.id;
			if (itemId) {
				// Find item
				const findItem = await this.sectionItemStore.findByAttribute({ id: itemId });
				if (!findItem) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SectionEnum.ITEM_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				const validateSection = await this.sectionStore.findByAttribute({
					id: attributes?.section_id,
					template_id: attributes.template_id,
				});
				if (!validateSection) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SectionEnum.SECTION_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				// Updating item
				attributes.id = itemId;
				if (
					attributes.type === ReportTemplateEnum.APPROACH ||
					attributes.type === ReportTemplateEnum.MAP
				) {
					const { id } = await helperFunction.splitField(attributes?.content);
					attributes.appraisal_approach_id = id;
				}
				const updateItem = await this.sectionItemStore.update(attributes);
				if (!updateItem) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SectionEnum.ITEM_UPDATE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: SectionEnum.ITEM_SAVE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			if (attributes.type === ReportTemplateEnum.SUBSECTION) {
				const { template_id, section_id, content } = attributes;
				// Create subsection if item is subsection
				const subSectionAttributes = {
					template_id,
					parent_id: section_id,
					title: content,
				};
				const createSubSection = await this.sectionStore.create(subSectionAttributes);
				attributes.sub_section_id = createSubSection.id;
			} else if (
				attributes.type === ReportTemplateEnum.APPROACH ||
				attributes.type === ReportTemplateEnum.MAP
			) {
				const { id } = await helperFunction.splitField(attributes?.content);
				attributes.appraisal_approach_id = id;
			}
			// Creating section item
			const createItem = await this.sectionItemStore.create(attributes);

			if (!createItem) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SectionEnum.ITEM_SAVE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: SectionEnum.ITEM_SAVE_SUCCESS,
				data: createItem,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to delete section item.
	 * @param request
	 * @param response
	 * @returns
	 */
	public deleteSectionItem = async (
		request: ISectionRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const itemId = parseInt(request?.params?.id);
			if (!itemId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SectionEnum.ENTER_VALID_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			if (itemId) {
				// Find item
				const findItem = await this.sectionItemStore.findByAttribute({ id: itemId });
				if (!findItem) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SectionEnum.ITEM_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// Deleting item
				const deleteItem = await this.sectionItemStore.delete({ id: itemId });
				if (!deleteItem) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SectionEnum.ITEM_DELETE_FAIL,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: SectionEnum.ITEM_DELETED_SUCCESSFULLY,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to save text snippet.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveSnippet = async (
		request: ISnippetCreateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISnippetSuccess<ISnippet>;
		try {
			const { account_id, role, id } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate schema
			const params = await helperFunction.validate(snippetSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = { ...request?.body, account_id, created_by: id };

			const snippetId = parseInt(request?.params?.id);
			const snippetNameValidationAttr: any = {
				account_id,
				name: attributes.name,
			};
			if (snippetId) {
				snippetNameValidationAttr.id = { [Op.ne]: snippetId };
			}
			// Validating if snippet name already exists or not
			const validateName = await this.snippetStore.findByAttribute(snippetNameValidationAttr);
			if (validateName && validateName.name === attributes.name) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SnippetEnum.SNIPPET_NAME_ALREADY_EXIST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			if (snippetId) {
				const findBy: Partial<ISnippet> = {
					id: snippetId,
					account_id,
				};
				const findSnippet = await this.snippetStore.findByAttribute(findBy);
				if (!findSnippet) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SnippetEnum.SNIPPET_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// Updating snippet
				attributes.id = snippetId;
				const updateSnippet = await this.snippetStore.update(attributes);
				if (!updateSnippet) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SnippetEnum.SNIPPET_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: SnippetEnum.SNIPPET_SAVE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			// Saving snippet
			const saveSnippet = await this.snippetStore.create(attributes);

			if (!saveSnippet) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SnippetEnum.SNIPPET_SAVE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: SnippetEnum.SNIPPET_SAVE_SUCCESS,
				data: saveSnippet,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get list of merge fields.
	 * @param request
	 * @param response
	 * @returns
	 */
	public mergeFieldsList = async (
		request: IMergeFieldsListRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IMergeFieldsSuccess<IMergeFields[]>;
		try {
			const { role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const allMergeFields = [];
			let mergedFields: IMergeFields[];
			// Retrieve all merge fields with no specific type
			const generalMergeFields = await this.mergeFieldStore.findAll({
				type: null,
			});
			allMergeFields.push(generalMergeFields);
			mergedFields = allMergeFields.flat();
			if (!allMergeFields?.length) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: TemplateEnum.MERGE_FIELDS_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			const appraisalId = Number(request?.query?.appraisal_id);

			// Check approach types for the appraisal if an appraisal ID is provided
			if (appraisalId) {
				const selectedApproaches = await this.appraisalApproachStore.findSelectedApproaches({
					appraisal_id: appraisalId,
				});
				if (selectedApproaches?.length) {
					for (const approach of selectedApproaches) {
						const approachType = await this.checkApproachType(approach);
						if (approachType) {
							const approachSpecificFields = await this.mergeFieldStore.findAll(approachType);
							if (approachSpecificFields?.length) {
								const updatedFields = await this.updateWithIdName(approach, approachSpecificFields);
								allMergeFields.push(updatedFields);
								mergedFields = allMergeFields.flat();
							}
						}
					}
				}
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: mergedFields,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get merge field by id.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getMergeFieldById = async (
		request: IMergeFieldsRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IMergeFieldsSuccess<IMergeFields>;
		try {
			const { role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const fieldId = parseInt(request?.params?.id);
			if (!fieldId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SectionEnum.ENTER_VALID_ID,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Find section
			const findField = await this.mergeFieldStore.findByAttribute({ id: fieldId });
			if (!findField) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: TemplateEnum.MERGE_FIELDS_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: findField,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get template by id for report
	 * @param request
	 * @param response
	 * @returns
	 */
	public getTemplateForReport = async (
		request: ITemplateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ITemplateSuccess<ITemplate>;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const appraisalId = parseInt(request?.params?.id);
			const attributes: Partial<ITemplate> = { appraisal_id: appraisalId };

			// Role validations to get template
			if (role === (RoleEnum.ADMINISTRATOR || RoleEnum.USER)) {
				attributes.account_id = account_id;
			}

			// Fetching template by id
			let getTemplate = await this.templateStore.findTemplate(attributes);
			if (!getTemplate) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: TemplateEnum.TEMPLATE_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// If parent id value found in any template then returning template data according to parent_id
			const { parent_id } = getTemplate;
			if (parent_id) {
				getTemplate = await this.templateStore.findTemplate({ id: parent_id });
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: getTemplate,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description function to save template of report
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveReportTemplate = async (
		request: IReportTempSaveRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ITemplateSuccess<ITemplate>;
		try {
			const { account_id, role, id } = request.user;
			// Role validations to create template
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate schema
			const params = await helperFunction.validate(reportTemplateSchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = { ...request.body, account_id, created_by: id };
			const { appraisal_id } = attributes;

			// Checking if appraisal id is valid or not
			if (appraisal_id) {
				const findAppraisal = await this.appraisalStore.findByAttribute({ id: appraisal_id });
				if (!findAppraisal) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: AppraisalEnum.INVALID_APPRAISAL_ID,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			const templateId = parseInt(request?.params?.id);
			if (templateId) {
				delete attributes.account_id;
				delete attributes.created_by;
				const findBy: Partial<ITemplate> = {
					id: templateId,
				};
				if (role === RoleEnum.ADMINISTRATOR) {
					findBy.account_id = account_id;
				}
				const findTemplate = await this.templateStore.findByAttribute(findBy);
				if (!findTemplate) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: TemplateEnum.TEMPLATE_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}
				// Checking valid template to update
				if (appraisal_id) {
					const findValidTemp = await this.templateStore.findByAttribute({
						id: templateId,
						appraisal_id,
					});
					if (!findValidTemp) {
						data = {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							message: TemplateEnum.TEMPLATE_NOT_FOUND,
						};
						return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
					}
				}
				// Updating template
				attributes.id = templateId;
				const updateTemplate = await this.templateStore.updateReportTemplate(attributes);
				if (!updateTemplate) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: TemplateEnum.TEMPLATE_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.TEMPLATE_SAVE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			if (appraisal_id) {
				// Checking if template already exists for appraisal or not
				const findTemplate = await this.templateStore.findByAttribute({ appraisal_id });
				if (findTemplate) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: TemplateEnum.TEMPLATE_ALREADY_EXISTS,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
			}
			// Creating template
			const createTemplate = await this.templateStore.createReportTemplate(attributes);

			if (!createTemplate) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: TemplateEnum.TEMPLATE_SAVE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: TemplateEnum.TEMPLATE_SAVE_SUCCESS,
				data: createTemplate,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get all snippets list
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSnippetsList = async (
		request: ISnippetRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISnippetSuccess<ISnippet[]>;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Find list of all snippets
			const getAllSnippets: ISnippet[] = await this.snippetStore.findAll(account_id);

			if (getAllSnippets?.length < 0) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.SNIPPETS_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: getAllSnippets,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description  Function to delete snippet.
	 * @param request
	 * @param response
	 * @returns
	 */
	public deleteSnippet = async (
		request: ISnippetRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const snippetId = parseInt(request?.params?.id);
			const findBy: Partial<ISnippet> = {
				id: snippetId,
				account_id,
			};
			if (role === RoleEnum.SUPER_ADMINISTRATOR) {
				delete findBy.account_id;
			}
			if (snippetId) {
				const findSnippet = await this.snippetStore.findByAttribute(findBy);
				if (!findSnippet) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SnippetEnum.SNIPPET_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// delete snippet
				const deleteSnippet = await this.snippetStore.delete({ id: snippetId, account_id });
				if (!deleteSnippet) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SnippetEnum.SNIPPET_DELETE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				data = {
					statusCode: StatusCodeEnum.OK,
					message: SnippetEnum.SNIPPET_DELETE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @Description Function to check approach types
	 * @param approaches
	 * @returns
	 */
	public checkApproachType = async (
		approaches: IAppraisalApproach,
	): Promise<ResponseApproachObject | false> => {
		try {
			if (!approaches?.type) return false;

			const response: ResponseApproachObject = {
				[approaches.type]: true,
			};

			return response;
		} catch (e) {
			return false;
		}
	};
	/**
	 * @description function to update merge fields of approaches with approach id and name
	 * @param idName
	 * @param fieldsArray
	 * @returns
	 */
	public updateWithIdName = async (
		approach: any,
		fieldsArray: IMergeFields[],
	): Promise<IMergeFields[]> => {
		const { id, name } = approach;
		return fieldsArray.map((fieldObj) => {
			// Join the ID with the tag and field values
			const updatedTag = `${fieldObj.tag}_${fieldObj.type}_${id}`;
			const updatedField = `${fieldObj.field} (${name})`;

			return {
				...fieldObj,
				tag: updatedTag,
				field: updatedField,
			};
		});
	};

	/**
	 * @description Function to get list of template for dropdown.
	 * @param request
	 * @param response
	 * @returns
	 */
	public dropdownTemplateList = async (
		request: ITemplateRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ITemplateSuccess<ITemplate[]>;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const attributes: any = {};
			// Role validations to fetch list according to account id.
			if (role === RoleEnum.ADMINISTRATOR) {
				attributes.account_id = account_id;
			}
			// Fetching list of templates.
			const templateList = await this.templateStore.findAll(attributes);
			if (!templateList?.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.DATA_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: TemplateEnum.TEMPLATE_LIST_SUCCESS,
				data: templateList,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get merge fields data.
	 * @param mergeFields
	 * @param appraisalInfo
	 * @returns
	 */
	public iterateMergeFieldsData = async (mergeFields: any, appraisalInfo: IAppraisal) => {
		try {
			const fieldsData = {};

			// Process array of fields
			if (mergeFields && Array.isArray(mergeFields)) {
				for (const field of mergeFields) {
					fieldsData[field] = await this.processMergeField(field, appraisalInfo);
				}
				return fieldsData;
			}
			// Process single field string
			else if (mergeFields && typeof mergeFields === 'string') {
				return await this.processMergeField(mergeFields, appraisalInfo);
			}
		} catch (e) {
			return {};
		}
	};
	/**
	 * @description Function to get merge fields data for report.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getMergeFieldData = async (
		request: IMergeFieldDataRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ITemplateSuccess<object>; // Here keys of this object are dynamic.
		try {
			const { role, account_id, id } = request.user;

			//role validations
			if (role === RoleEnum.DATA_ENTRY) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: ErrorMessageEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const appraisalId = request?.body?.appraisal_id;
			if (!appraisalId) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: AppraisalEnum.INVALID_APPRAISAL_ID,
					error: ErrorMessageEnum.INVALID_REQUEST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const attribute = { id: appraisalId, account_id: account_id, user_id: id };
			// Role-wise permissions
			if (role === RoleEnum.ADMINISTRATOR) {
				delete attribute?.user_id;
			} else if (role === RoleEnum.USER) {
				delete attribute?.account_id;
			} else if (role === RoleEnum.SUPER_ADMINISTRATOR) {
				delete attribute?.user_id;
				delete attribute?.account_id;
			}
			// Fetching appraisal data by id
			const appraisalInfo = await this.appraisalStore.getAppraisal(attribute);
			if (!appraisalInfo) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: AppraisalEnum.APPRAISAL_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}
			// Requested merge field tags
			const mergeFields = request?.body?.merge_fields;
			const fieldsData = await this.iterateMergeFieldsData(mergeFields, appraisalInfo);
			data = {
				statusCode: StatusCodeEnum.OK,
				message: MergeFieldEnum.MERGE_FIELD_DATA,
				data: fieldsData,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to process merge fields and return data of merge fields.
	 * @param field
	 * @param appraisalInfo
	 * @returns
	 */
	public processMergeField = async (field: string, appraisalInfo) => {
		try {
			const dateTags = [
				MergeFieldEnum.CLOSE_DATE,
				MergeFieldEnum.ANALYSIS_DATE,
				MergeFieldEnum.INSPECTION_DATE,
				MergeFieldEnum.EFFECTIVE_DATE,
				MergeFieldEnum.REPORT_DATE,
				MergeFieldEnum.LAST_SALE_DATE,
			];

			const attributes = { status: 1 };
			const codes = await this.commonStore.getGlobalCodeCategoriesByAttribute(attributes);

			const zoningCodes = codes.find((code) => code.type === CompsEnum.ZONE);
			const conditionCodes = codes.find((code) => code.type === CompsEnum.CONDITION);
			const topographyCodes = codes.find((code) => code.type === CompsEnum.TOPOGRAPHIES);
			const frontagesCodes = codes.find((code) => code.type === CompsEnum.FRONTAGES);
			const landOptions = codes.find((code) => code.type === CompsEnum.LAND_TYPE);

			const { options = [] } = zoningCodes || {};
			const conditionOptions = conditionCodes?.options || [];
			const topographyOptions = topographyCodes?.options || [];
			const frontageOptions = frontagesCodes?.options || [];

			const splitTag = await helperFunction.splitField(field);
			const fieldKey = await this.mergeFieldStore.findByAttribute({ tag: splitTag?.tag });

			const approaches = appraisalInfo?.appraisal_approaches;
			const getApproach = await helperFunction.searchObject(
				approaches,
				AppraisalsEnum.ID,
				splitTag?.id,
			);

			let fieldValue;

			// Appraisal Approaches
			if (splitTag?.id) {
				const approachMap = {
					[AppraisalsEnum.INCOME]: getApproach?.appraisal_income_approach,
					[AppraisalsEnum.COST]: getApproach?.appraisal_cost_approach,
					[AppraisalsEnum.SALE]: getApproach?.appraisal_sales_approach,
				};
				if (approachMap[splitTag.type]) {
					fieldValue = approachMap[splitTag.type]?.[fieldKey?.key];
					return await helperFunction.formatString(fieldValue);
				}
			}

			// Date Fields
			else if (dateTags.includes(fieldKey?.key)) {
				return await helperFunction.formatDateToMDY(appraisalInfo?.[fieldKey?.key]);
			}
			// Client Info
			else if (fieldKey?.key?.includes(MergeFieldEnum.CLIENT)) {
				const clientKey = fieldKey.key.split('.').pop();
				return appraisalInfo?.client?.[clientKey];
			} else if (fieldKey?.key === MergeFieldEnum.NAME_OF_CLIENT) {
				const { first_name = '', last_name = '' } = appraisalInfo?.client || {};
				return `${first_name} ${last_name}`;
			}

			// Client State
			else if (fieldKey?.key === MergeFieldEnum.CLIENT_STATE) {
				const getStates = await this.commonStore.findGlobalCodeByAttribute({
					type: GlobalCodeEnums.STATES,
				});
				const stateValue = appraisalInfo?.client?.state;
				const matchState = getStates?.options?.find((obj) => obj?.code === stateValue);
				return matchState?.name || stateValue;
			} else if (
				fieldKey?.key === (MergeFieldEnum.PROPERTY_CLASS || MergeFieldEnum.PROPERTY_RIGHTS)
			) {
				fieldValue = appraisalInfo[fieldKey?.key];
				return await helperFunction.formatString(fieldValue);
			}

			// Zoning Info
			else if (fieldKey?.key?.includes(MergeFieldEnum.ZONING)) {
				const zoneKey = fieldKey.key.split('.').pop();
				let subjectZone;
				if (zoneKey === MergeFieldEnum.SQ_FT) {
					fieldValue = appraisalInfo?.zonings?.[0]?.[zoneKey];
					return await helperFunction.formatNumber(fieldValue, 0, '');
				}
				if (zoneKey === MergeFieldEnum) {
					fieldValue = appraisalInfo?.zonings?.[0]?.[zoneKey];
					return fieldValue + '%';
				}
				if (
					appraisalInfo.comp_type === AppraisalsEnum.LAND_ONLY &&
					zoneKey === GlobalCodeEnums.ZONE
				) {
					fieldValue = appraisalInfo?.land_type;
					const subjectLandType = landOptions?.options?.find((obj) => obj?.code === fieldValue);
					return subjectLandType?.name || (await helperFunction.formatString(fieldValue));
				}
				if (zoneKey === GlobalCodeEnums.ZONE) {
					fieldValue = appraisalInfo?.zonings?.[0]?.[zoneKey];
					subjectZone = options.find((obj) => obj?.code === fieldValue);
					return subjectZone?.name || (await helperFunction.formatString(fieldValue));
				}
				if (zoneKey === GlobalCodeEnums.SUB_ZONE) {
					fieldValue = appraisalInfo?.zonings?.[0]?.[zoneKey];
					const flatAllSubOptions = options.flatMap((option) => option.sub_options || []);
					const subjectSubZone = flatAllSubOptions.find((obj) => obj?.code === fieldValue);
					return subjectSubZone?.name || (await helperFunction.formatString(fieldValue));
				}
			} else if (
				[
					MergeFieldEnum.ASSESSMENT,
					MergeFieldEnum.LAND_IMPROVEMENT,
					MergeFieldEnum.STRUCTURE_ASSESSMENT,
					MergeFieldEnum.TAX_LIABILITY,
					MergeFieldEnum.TAXES_IN_ARREARS,
					MergeFieldEnum.PRICE_PER_SF,
				].includes(fieldKey?.key)
			) {
				fieldValue = appraisalInfo[fieldKey?.key];
				return await helperFunction.formatCurrency(fieldValue);
			}
			// Traffic Count
			else if (fieldKey?.key === MergeFieldEnum.TRAFFIC_COUNT) {
				if (appraisalInfo?.traffic_count === MergeFieldEnum.INPUT_VALUE) {
					return await helperFunction.formatNumber(appraisalInfo?.traffic_input, 0, '');
				} else {
					return appraisalInfo?.traffic_count;
				}
			}

			// State (Generic)
			else if (fieldKey?.key === MergeFieldEnum.STATE) {
				const getStates = await this.commonStore.findGlobalCodeByAttribute({
					type: GlobalCodeEnums.STATES,
				});
				const stateValue = appraisalInfo[fieldKey.key];
				const matchState = getStates?.options?.find((obj) => obj?.code === stateValue);
				return matchState?.name || stateValue;
			}

			// Condition
			else if (fieldKey?.key === MergeFieldEnum.CONDITION) {
				const conditionValue = appraisalInfo[fieldKey?.key];
				if (conditionValue === '') {
					return 'N/A';
				} else {
					const matchCondition = conditionOptions.find((obj) => obj?.code === conditionValue);
					return matchCondition?.name || conditionValue;
				}
			}
			//Frontage
			else if (fieldKey?.key === MergeFieldEnum.FRONTAGE) {
				const frontageValue = appraisalInfo[fieldKey?.key];
				if (frontageValue === '') {
					return 'N/A';
				} else {
					const matchFrontage = frontageOptions.find((obj) => obj?.code === frontageValue);
					return matchFrontage?.name || frontageValue;
				}
			}

			// Topography
			else if (fieldKey?.key === MergeFieldEnum.TOPOGRAPHY) {
				const topographyValue = appraisalInfo[fieldKey?.key];
				if (topographyValue === '') {
					return 'N/A';
				} else {
					const matchTopography = topographyOptions.find((obj) => obj?.code === topographyValue);
					return matchTopography?.name || fieldValue;
				}
			}

			// General Case
			else {
				fieldValue = appraisalInfo[fieldKey?.key];
				if (!(fieldKey?.key === MergeFieldEnum.ZIP_CODE) && typeof fieldValue === 'number') {
					return Number.isInteger(fieldValue)
						? await helperFunction.formatNumber(fieldValue, 0, '')
						: fieldValue;
				} else if ([MergeFieldEnum.TYPE, MergeFieldEnum.PROPERTY_RIGHTS].includes(fieldKey?.key)) {
					return await helperFunction.formatString(fieldValue);
				} else {
					return fieldValue;
				}
			}
		} catch (e) {
			return {};
		}
	};

	/**
	 * @description Function to save snippets category.
	 * @param request
	 * @param response
	 * @returns
	 */
	public saveSnippetsCategory = async (
		request: IAddSnippetsCategoryRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISnippetsCategorySuccess<ISnippetsCategory>;
		try {
			const { account_id, role, id } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Validate schema
			const params = await helperFunction.validate(snippetsCategorySchema, request?.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			const attributes = { ...request?.body, account_id, created_by: id };

			const snippetCategoryId = parseInt(request?.params?.id);
			const categoryNameValidationAttr: any = {
				account_id,
				category_name: attributes.category_name,
			};
			if (snippetCategoryId) {
				categoryNameValidationAttr.id = { [Op.ne]: snippetCategoryId };
			}
			// Validating if category already exists or not
			const validateName = await this.snippetsCategoryStore.findByAttribute(
				categoryNameValidationAttr,
			);
			if (validateName && validateName.category_name === attributes.category_name) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SnippetEnum.SNIPPET_CATEGORY_NAME_ALREADY_EXIST,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			if (snippetCategoryId) {
				const findBy: Partial<ISnippetsCategory> = {
					id: snippetCategoryId,
					account_id,
				};
				const findCategory = await this.snippetsCategoryStore.findByAttribute(findBy);
				if (!findCategory) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SnippetEnum.SNIPPET_CATEGORY_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// Updating Category
				attributes.id = snippetCategoryId;
				const updateCategory = await this.snippetsCategoryStore.update(attributes);
				if (!updateCategory) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SnippetEnum.SNIPPET_CATEGORY_UPDATE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}
				data = {
					statusCode: StatusCodeEnum.OK,
					message: SnippetEnum.SNIPPET_CATEGORY_SAVE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			// Saving Category
			const saveSnippetCategory = await this.snippetsCategoryStore.create(attributes);

			if (!saveSnippetCategory) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: SnippetEnum.SNIPPET_CATEGORY_UPDATE_FAILED,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: SnippetEnum.SNIPPET_CATEGORY_SAVE_SUCCESS,
				data: saveSnippetCategory,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get all snippets Category list.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSnippetsCategoryList = async (
		request: ISnippetsCategoryRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISnippetsCategorySuccess<ISnippetsCategory[]>;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Find list of all snippets category
			const getAllSnippetsCategory: ISnippetsCategory[] =
				await this.snippetsCategoryStore.findAll(account_id);

			if (getAllSnippetsCategory?.length < 0) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.SNIPPETS_CATEGORY_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: getAllSnippetsCategory,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description  Function to delete snippet category.
	 * @param request
	 * @param response
	 * @returns
	 */
	public deleteSnippetCategory = async (
		request: ISnippetsCategoryRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			const { account_id, role } = request.user;
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			const categoryId = parseInt(request?.params?.id);
			const findBy: Partial<ISnippet> = {
				id: categoryId,
				account_id,
			};
			if (role === RoleEnum.SUPER_ADMINISTRATOR) {
				delete findBy.account_id;
			}
			if (categoryId) {
				const findCategory = await this.snippetsCategoryStore.findByAttribute(findBy);
				if (!findCategory) {
					data = {
						statusCode: StatusCodeEnum.NOT_FOUND,
						message: SnippetEnum.SNIPPET_CATEGORY_NOT_FOUND,
					};
					return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
				}

				// delete snippet Category
				const deleteCategory = await this.snippetsCategoryStore.delete({
					id: categoryId,
					account_id,
				});
				if (!deleteCategory) {
					data = {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						message: SnippetEnum.SNIPPET_DELETE_FAILED,
					};
					return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
				}

				data = {
					statusCode: StatusCodeEnum.OK,
					message: SnippetEnum.SNIPPET_DELETE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
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
	 * @description Function to get snippets Category.
	 * @param request
	 * @param response
	 * @returns
	 */
	public getSnippetsCategory = async (
		request: ISnippetsCategoryRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | ISnippetsCategorySuccess<ISnippetsCategory>;
		try {
			const { account_id, role } = request.user;
			const categoryId = parseInt(request?.params?.id);
			// Role validations
			if (!requiredRoles.includes(role)) {
				data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
			}
			// Find list of all snippets category
			const getSnippetsCategory: ISnippetsCategory =
				await this.snippetsCategoryStore.findByAttribute({ id: categoryId, account_id });

			if (!getSnippetsCategory) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: TemplateEnum.SNIPPETS_CATEGORY_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.OK);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: StatusEnum.SUCCESS,
				data: getSnippetsCategory,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
}
