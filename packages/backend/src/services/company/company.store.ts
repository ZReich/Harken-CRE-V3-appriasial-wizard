import { ICompany, ICompanyCreateRequest } from './ICompanyService';
import database from '../../config/db';
import HelperFunction from '../../utils/common/helper';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
const Company = database.company;
const helperFunction = new HelperFunction();

export default class CompanyStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('CompanyStore', Company);
			super('An error occured while processing the request.');
		}
	};

	// Create company
	public async createCompany(attributes: ICompanyCreateRequest): Promise<ICompany> {
		try {
			// Create a new company
			return await Company.create(attributes);
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

	// Get all companies by attributes
	public async getByAttribute(attributes: object): Promise<ICompany[]> {
		try {
			// If attibutes are not null then apply where condition
			if (Object.keys(attributes).length !== 0) {
				return await Company.findAll({
					where: attributes,
					order: [['company_name', 'ASC']], // Order by company_name column in ascending order
				});
			} else {
				return await Company.findAll({
					order: [['company_name', 'ASC']], // Order by company_name column in ascending order
				});
			}
		} catch (e) {
			console.log(e);
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
	 * @description Query to find company by id.
	 * @param attributes
	 * @returns
	 */
	public async findByAttribute(attributes: Partial<ICompany>): Promise<ICompany> {
		try {
			const account = await Company.findOne({ where: attributes });
			return account;
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
