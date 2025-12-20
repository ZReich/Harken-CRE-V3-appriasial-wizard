import database from '../../config/db';
import IAccountOptin, { ICreateAccountOptinRequest } from './IAccountsOptinService';
const AccountOptin = database.account_optin;

export default class AccountOptinStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AccountOptinStore', AccountOptin);
			super('An error occurred while processing the request.');
		}
	};
	/**
	 * @description Function to create create account
	 * @param attributes
	 * @returns
	 */
	public async createAccountOptin(attributes: ICreateAccountOptinRequest): Promise<IAccountOptin> {
		try {
			return await AccountOptin.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}
}
