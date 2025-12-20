import database from '../../config/db';
const Token = database.Token;

export default class TokenStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('TokenStore', Token);
			super('An error occured while processing the request.');
		}
	};
}
