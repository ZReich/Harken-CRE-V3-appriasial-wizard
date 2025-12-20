import { Router } from 'express';
import AccountsService from '../services/accounts/accounts.service';

class AccountsRoutes {
	router = Router();
	public accounts = new AccountsService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Get accounts
		this.router.get('/list', this.accounts.accountsList);
		// Update contact details in accounts.
		this.router.patch('/update-contact/:id', this.accounts.saveContact);
		// Create contact details in accounts.
		this.router.post('/create-contact', this.accounts.saveContact);
		// Update theme in account setting.
		this.router.patch('/update-theme/:id', this.accounts.updateTheme);
		// Create theme in account setting.
		this.router.post('/create-theme', this.accounts.updateTheme);
		// Get other admins list.
		this.router.get('/get-other-admins/:id', this.accounts.getAdminList);
		// Get listing of accounts with comps and users count
		this.router.post('/setting-account-list', this.accounts.settingsAccountsList);
		// Delete account
		this.router.delete('/delete/:id', this.accounts.deleteAccount);
		// Get account
		this.router.get('/get/:id', this.accounts.getAccount);
		// Function to send invitation mail to broker
		this.router.post('/send-invite', this.accounts.sendInvite);
	}
}

export default new AccountsRoutes().router;
