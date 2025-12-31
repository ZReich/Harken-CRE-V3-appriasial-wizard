import { Router } from 'express';
import UserService from '../services/user/user.service';

class UserRoutes {
	router = Router();
	public user = new UserService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		//Get user profile
		this.router.get('/get', this.user.getUserProfile);
		//Create user
		this.router.post('/create', this.user.addPersonalData);

		//New update user profile
		this.router.patch('/update-personal-data/:id', this.user.updatePersonalData);

		//Update user transaction.
		this.router.patch('/update-transaction-data/:id', this.user.updateTransaction);

		//Check user email
		this.router.post('/check-email', this.user.checkEmail);

		//To change password
		this.router.patch('/change-password', this.user.changePassword);

		//To get list of users
		this.router.get('/list', this.user.getUsersList);

		//To get users dropdown
		this.router.get('/dropdown', this.user.getUsersDropdown);
	}
}

export default new UserRoutes().router;
