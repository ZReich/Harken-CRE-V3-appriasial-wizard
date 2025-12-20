import { Request } from 'express';
import IUser from '../../utils/interfaces/IUser';
import { ISuccess } from '../../utils/interfaces/common';
import { ISectionItem } from '../sectionItems/ISectionItemsService';
import { ISection } from '../sections/ISectionsService';
import {
	ReportTypeEnum,
	PropertyCategoryEnum,
	ScenarioPresetEnum,
} from '../../utils/enums/TemplateEnum';

export interface ITemplate {
	id: number;
	appraisal_id?: number;
	parent_id?: number;
	account_id: number;
	name: string;
	description: string;
	created_by: number;
	// New fields for template enhancements
	report_type?: ReportTypeEnum | string;
	property_category?: PropertyCategoryEnum | string;
	allow_improved?: number;
	allow_vacant_land?: number;
	scenario_preset?: ScenarioPresetEnum | string;
	enable_data_inheritance?: number;
	// Related data
	sections?: ISection[];
	configurations?: ITemplateConfiguration[];
	template_scenarios?: ITemplateScenario[];
}

export interface ITemplateConfiguration {
	id?: number;
	template_id: number;
	config_key: string;
	config_value: string;
	date_created?: Date;
	last_updated?: Date;
}

export interface ITemplateScenario {
	id?: number;
	template_id: number;
	scenario_type?: string;
	custom_name?: string;
	display_order: number;
	default_approaches?: string | string[]; // JSON array stored as string
	require_completion_date?: number;
	require_hypothetical_statement?: number;
	date_created?: Date;
	last_updated?: Date;
}

export interface ITemplateRequest extends Request {
	user: IUser;
}

export interface ITemplateCreateRequest extends ITemplateRequest {
	name?: string;
	description?: string;
	appraisal_id?: number;
	parent_id?: number;
}
export interface ITemplateSuccess<T> extends ISuccess {
	data: T;
}

export interface ITemplateListRequest extends ITemplateRequest {
	accountId?: number;
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: string;
	orderByColumn?: string;
}

export interface ITemplateListSuccess {
	template: ITemplate[];
	page: number;
	totalRecord: number;
	perPage: number;
}
export interface IReportTempSaveRequest extends ITemplateRequest {
	name: string;
	description: string;
	appraisal_id: number;
	parent_id?: number;
	section: ISection[];
	item: ISectionItem[];
}
export interface linkExistTempRequest extends ITemplateRequest {
	appraisal_id?: number;
	template_id?: number;
}

// New interfaces for template enhancements
export interface ITemplateWithConfigRequest extends ITemplateRequest {
	name: string;
	description: string;
	report_type: string;
	property_category: string;
	allow_improved?: number;
	allow_vacant_land?: number;
	scenario_preset?: string;
	enable_data_inheritance?: number;
	account_id?: number;
	configurations?: Partial<ITemplateConfiguration>[];
	template_scenarios?: Partial<ITemplateScenario>[];
	sections?: ISection[];
}

export interface ITemplateFilterRequest extends ITemplateListRequest {
	report_type?: string;
	property_category?: string;
	allow_vacant_land?: number;
}

export interface ITemplateConfigurationRequest extends ITemplateRequest {
	template_id: number;
	configurations: Array<{
		config_key: string;
		config_value: string;
	}>;
}

export interface ITemplateScenarioRequest extends ITemplateRequest {
	template_id: number;
	scenario_type?: string;
	custom_name?: string;
	display_order: number;
	default_approaches?: string[];
	require_completion_date?: number;
	require_hypothetical_statement?: number;
}
