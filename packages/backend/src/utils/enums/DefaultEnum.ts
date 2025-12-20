enum DefaultEnum {
	HARKEN = 'HARKEN',
	SF = 'SF',
	CITY = 'city',
	DISTINCT_CITY = 'DISTINCT city',
	PERCENT = 'Percent',
	SALE = 'Sale',
	YES = 'yes',
	ROAD_MAP = 'roadmap',
	HYBRID_MAP = 'hybrid',
	PRICE_PER_SF = '$/SF',
	DEVELOPMENT = 'development',
	ASCENDING = 'asc',
	DECENDING = 'desc',
	NAME = 'name',
	SUMMARY = 'summary',
	DETAIL = 'detail',
	ACRE = 'ACRE',
}

export enum API_VERSION {
	VERSION = '/api/v2',
}

export default DefaultEnum;

export enum UserEnum {
	USER_ID = 'user_id',
	ACTIVE = 'Active',
	FIRST_NAME = 'first_name',
}

export enum UploadEnum {
	COMPS = 'comps',
	USERS = 'users',
	ACCOUNTS = 'accounts',
	APPRAISAL = 'appraisal',
	GENERAL = 'general',
	EXHIBITS = 'exhibits',
	IMAGE = 'image',
	EXTRA_IMAGE = 'extraImage',
	PDF = 'pdf',
	EVALUATION = 'evaluation',
	RES_EVALUATION = 'res_evaluation',
}
export enum LoggerEnum {
	ERROR = 'error',
	INFO = 'info',
}

export enum FileOriginEnum {
	APPRAISAL_IMAGES = 'APPRAISAL_IMAGES',
	APPRAISAL_EXHIBITS = 'APPRAISAL_EXHIBITS',
	APPRAISAL_PHOTO_PAGES = 'APPRAISAL_PHOTO_PAGES',
	EVALUATION_IMAGES = 'EVALUATION_IMAGES',
	EVALUATION_EXHIBITS = 'EVALUATION_EXHIBITS',
}

export enum FileStorageEnum {
	SERVER = 'SERVER',
	LOCAL = 'LOCAL',
}

export enum MapEnum {
	ROADMAP = 'roadmap',
	HYBRID = 'hybrid',
}
export enum AppraisalIncomeEnum {
	APPRAISAL_INCOME_APPROACH_ID = 'appraisal_income_approach_id',
	INCOME_SOURCE = 'incomeSource',
	OPERATING_EXPENSE = 'operatingExpense',
}
