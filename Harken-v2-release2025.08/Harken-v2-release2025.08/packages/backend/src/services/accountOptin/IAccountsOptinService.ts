export default interface IAccountOptin {
	id: number;
	account_id: number;
	token: string;
	expiration: Date;
	users: string;
	whosentit: number;
	email_address: number;
	status: string;
}

export interface ICreateAccountOptinRequest {
	id?: number;
	account_id: number;
	whosentit: number;
	token: string;
	expiration: Date;
	users?: string;
	email_address: string;
	status: string;
}
