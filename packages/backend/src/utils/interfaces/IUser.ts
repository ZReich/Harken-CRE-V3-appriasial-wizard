import IAccount from '../../services/accounts/IAccountsService';

export default interface IUser {
	id: number;
	first_name: string;
	last_name: string;
	email_address?: string;
	password?: string;
	role: number;
	status?: string;
	account_id: number;
	approved_by_admin?: number;
	last_login_at?: Date;
	users_transactions?: [];
	account?: IAccount;
	comp_adjustment_mode?: string;
}
