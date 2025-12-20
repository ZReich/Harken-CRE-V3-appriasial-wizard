import { Router } from 'express';
import AuthService from '../services/auth/auth.service';

class AuthRoutes {
	router = Router();
	public auth = new AuthService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Login User
		this.router.post('/login', this.auth.login);
		// Forgot password
		this.router.post('/forgot', this.auth.forgot);
		// Get user info by token for forgot password
		// this.router.post("/getForgotPwUserByToken", this.auth.getForgotPwUserByToken);
		// Update password
		this.router.post('/reset-password', this.auth.resetPassword);
		// Refresh Token
		this.router.post('/refresh-token', this.auth.refreshToken);
	}
}

export default new AuthRoutes().router;
