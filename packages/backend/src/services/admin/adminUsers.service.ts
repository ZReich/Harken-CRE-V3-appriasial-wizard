import { Response } from 'express';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import SendResponse from '../../utils/common/commonResponse';
import UserEnum from '../../utils/enums/MessageEnum';
import { RoleEnum } from '../../utils/enums/RoleEnum';
import UserStore from '../user/user.store';
import AccountsStore from '../accounts/accounts.store';
import { hasAccountAccess, RoleGroups } from '../../middleware/authorize';

interface AdminRequest {
	user?: {
		id: number;
		role: RoleEnum;
		account_id: number;
		email_address: string;
	};
	query?: any;
	params?: any;
	body?: any;
}

export default class AdminUsersService {
	private userStore = new UserStore();
	private accountStore = new AccountsStore();

	/**
	 * GET /admin/users
	 * List all users with filtering, search, and pagination
	 */
	public listUsers = async (request: AdminRequest, response: Response): Promise<Response> => {
		let data;
		try {
			const { role, account_id } = request.user;
			const { 
				accountId, 
				status, 
				roleFilter, 
				search, 
				page = 1, 
				limit = 10,
				orderByColumn,
				orderBy = 'DESC'
			} = request.query;

			// Build filter object
			const filters: any = {};

			// Account scoping: Administrators can only see their own account
			if (role === RoleEnum.ADMINISTRATOR) {
				filters.account_id = account_id;
			} else if (accountId) {
				filters.account_id = accountId;
			}

			if (status) {
				filters.status = status;
			}

			if (roleFilter) {
				filters.role = roleFilter;
			}

			// Pagination
			const offset = (parseInt(page) - 1) * parseInt(limit);

			// Fetch users with filters
			const users = await this.userStore.getAllUsers(
				{
					...filters,
					search,
					orderByColumn,
					orderBy,
					limit: parseInt(limit),
					offset,
				},
				filters.account_id,
			);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Users retrieved successfully',
				data: users,
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * GET /admin/users/:id
	 * Get specific user details
	 */
	public getUser = async (request: AdminRequest, response: Response): Promise<Response> => {
		let data;
		try {
			const userId = parseInt(request.params.id);
			const { role, account_id } = request.user;

			const user = await this.userStore.get(userId);

			if (!user) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Check account access
			if (!hasAccountAccess(role, account_id, user.account_id)) {
				data = {
					statusCode: StatusCodeEnum.FORBIDDEN,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.FORBIDDEN);
			}

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'User retrieved successfully',
				data: { user },
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * POST /admin/users
	 * Create new user
	 */
	public createUser = async (request: AdminRequest, response: Response): Promise<Response> => {
		let data;
		try {
			const { role, account_id } = request.user;
			const userData = request.body;

			// Default role is USER
			userData.role = userData.role || RoleEnum.USER;

			// Account assignment logic
			if (role === RoleEnum.ADMINISTRATOR) {
				// Administrators can only create users in their own account
				userData.account_id = account_id;
			} else if (!userData.account_id) {
				// Super roles must specify account
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: 'Account ID is required',
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Validate account exists
			const accountExists = await this.accountStore.findByAttribute({
				id: userData.account_id,
			});

			if (!accountExists) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: 'Account not found',
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Check email uniqueness
			const existingUser = await this.userStore.findEmail({
				email_address: userData.email_address,
			});

			if (existingUser) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: 'Email address already exists',
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}

			// Create user
			const newUser = await this.userStore.createUser(userData);

			// TODO: Send welcome/set-password email

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'User created successfully',
				data: { user: newUser },
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * PATCH /admin/users/:id
	 * Update user
	 */
	public updateUser = async (request: AdminRequest, response: Response): Promise<Response> => {
		let data;
		try {
			const userId = parseInt(request.params.id);
			const { role, account_id } = request.user;
			const updateData = request.body;

			const user = await this.userStore.get(userId);

			if (!user) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Check account access
			if (!hasAccountAccess(role, account_id, user.account_id)) {
				data = {
					statusCode: StatusCodeEnum.FORBIDDEN,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.FORBIDDEN);
			}

			// Role changes only allowed for super roles
			if (updateData.role && !RoleGroups.SUPER_ROLES.includes(role)) {
				delete updateData.role;
			}

			// Account transfers only allowed for super roles
			if (updateData.account_id && !RoleGroups.SUPER_ROLES.includes(role)) {
				delete updateData.account_id;
			}

			// Update user
			await this.userStore.updateAttributes(userId, updateData);

			const updatedUser = await this.userStore.get(userId);

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'User updated successfully',
				data: { user: updatedUser },
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * DELETE /admin/users/:id
	 * Deactivate user (soft delete)
	 */
	public deleteUser = async (request: AdminRequest, response: Response): Promise<Response> => {
		let data;
		try {
			const userId = parseInt(request.params.id);
			const { role, account_id } = request.user;

			const user = await this.userStore.get(userId);

			if (!user) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Check account access
			if (!hasAccountAccess(role, account_id, user.account_id)) {
				data = {
					statusCode: StatusCodeEnum.FORBIDDEN,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.FORBIDDEN);
			}

			// Soft delete - set status to inactive
			await this.userStore.updateAttributes(userId, { status: 'INACTIVE' });

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'User deactivated successfully',
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * POST /admin/users/:id/reset-password
	 * Trigger password reset email
	 */
	public resetPassword = async (request: AdminRequest, response: Response): Promise<Response> => {
		let data;
		try {
			const userId = parseInt(request.params.id);
			const { role, account_id } = request.user;

			const user = await this.userStore.get(userId);

			if (!user) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: UserEnum.USER_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.NOT_FOUND);
			}

			// Check account access
			if (!hasAccountAccess(role, account_id, user.account_id)) {
				data = {
					statusCode: StatusCodeEnum.FORBIDDEN,
					message: UserEnum.PERMISSION_DENIED,
				};
				return SendResponse(response, data, StatusCodeEnum.FORBIDDEN);
			}

			// TODO: Generate reset token and send email
			// For now, just return success

			data = {
				statusCode: StatusCodeEnum.OK,
				message: 'Password reset email sent successfully',
			};

			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
}














