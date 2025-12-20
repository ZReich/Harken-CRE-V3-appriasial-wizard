import { Response, NextFunction } from 'express';
import { RoleEnum } from '../utils/enums/RoleEnum';
import StatusCodeEnum from '../utils/enums/StatusCodeEnum';
import SendResponse from '../utils/common/commonResponse';
import UserEnum from '../utils/enums/MessageEnum';

/**
 * Custom request interface extending Express Request with user information
 */
interface AuthorizedRequest {
	user?: {
		id: number;
		role: RoleEnum;
		account_id: number;
		first_name: string;
		last_name: string;
		approved_by_admin: number;
		email_address: string;
		comp_adjustment_mode: string;
	};
	url?: string;
}

/**
 * Authorization middleware factory
 * Creates middleware that validates if user has one of the required roles
 * 
 * @param requiredRoles - Array of RoleEnum values that are allowed access
 * @returns Express middleware function
 * 
 * @example
 * // Allow only Super Admins and Devs
 * router.get('/admin/users', authorize([RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV]), getUsersList);
 * 
 * // Allow Super Admins, Devs, and Administrators
 * router.get('/admin/account-settings', authorize([RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV, RoleEnum.ADMINISTRATOR]), getAccountSettings);
 */
export const authorize = (requiredRoles: RoleEnum[]) => {
	return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
		try {
			// Check if user is authenticated (should be set by authenticate middleware)
			if (!req.user) {
				const data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.UNAUTHORIZED,
					error: 'User not authenticated',
				};
				return SendResponse(res, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const userRole = req.user.role;

			// Check if user's role is in the list of required roles
			if (!requiredRoles.includes(userRole)) {
				const data = {
					statusCode: StatusCodeEnum.FORBIDDEN,
					message: UserEnum.PERMISSION_DENIED,
					error: `Required roles: ${requiredRoles.map((r) => RoleEnum[r]).join(', ')}. User role: ${RoleEnum[userRole]}`,
				};
				return SendResponse(res, data, StatusCodeEnum.FORBIDDEN);
			}

			// User is authorized, proceed to next middleware
			return next();
		} catch (error) {
			const data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: error.message || UserEnum.INTERNAL_ERROR,
				error: error,
			};
			return SendResponse(res, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
};

/**
 * Common role group presets for convenience
 */
export const RoleGroups = {
	/** Super administrators and developers - full system access */
	SUPER_ROLES: [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV],

	/** All administrative roles - can manage accounts */
	ADMIN_ROLES: [RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.DEV, RoleEnum.ADMINISTRATOR],

	/** Standard operational roles */
	USER_ROLES: [RoleEnum.USER, RoleEnum.DATA_ENTRY],

	/** All roles */
	ALL_ROLES: [
		RoleEnum.SUPER_ADMINISTRATOR,
		RoleEnum.USER,
		RoleEnum.ADMINISTRATOR,
		RoleEnum.DEV,
		RoleEnum.DATA_ENTRY,
		RoleEnum.NONE,
	],
};

/**
 * Check if a user has account-scoped access to a resource
 * Used when ADMINISTRATOR role needs to be restricted to their own account
 * 
 * @param userRole - The user's role
 * @param userAccountId - The user's account ID
 * @param resourceAccountId - The account ID of the resource being accessed
 * @returns true if user has access, false otherwise
 */
export const hasAccountAccess = (
	userRole: RoleEnum,
	userAccountId: number,
	resourceAccountId: number,
): boolean => {
	// Super roles have access to all accounts
	if (RoleGroups.SUPER_ROLES.includes(userRole)) {
		return true;
	}

	// Administrators can only access their own account
	if (userRole === RoleEnum.ADMINISTRATOR) {
		return userAccountId === resourceAccountId;
	}

	// Other roles don't have cross-account access
	return false;
};

/**
 * Middleware to check account-scoped access
 * Use this in combination with authorize when route needs account validation
 * 
 * @param getResourceAccountId - Function that extracts resource account ID from request
 * @returns Express middleware function
 * 
 * @example
 * router.patch('/admin/users/:id',
 *   authorize(RoleGroups.ADMIN_ROLES),
 *   authorizeAccountAccess((req) => getUserAccountId(req.params.id)),
 *   updateUser
 * );
 */
export const authorizeAccountAccess = (
	getResourceAccountId: (req: AuthorizedRequest) => Promise<number> | number,
) => {
	return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				const data = {
					statusCode: StatusCodeEnum.UNAUTHORIZED,
					message: UserEnum.UNAUTHORIZED,
					error: 'User not authenticated',
				};
				return SendResponse(res, data, StatusCodeEnum.UNAUTHORIZED);
			}

			const resourceAccountId = await getResourceAccountId(req);

			if (!hasAccountAccess(req.user.role, req.user.account_id, resourceAccountId)) {
				const data = {
					statusCode: StatusCodeEnum.FORBIDDEN,
					message: UserEnum.PERMISSION_DENIED,
					error: 'User does not have access to this account',
				};
				return SendResponse(res, data, StatusCodeEnum.FORBIDDEN);
			}

			return next();
		} catch (error) {
			const data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: error.message || UserEnum.INTERNAL_ERROR,
				error: error,
			};
			return SendResponse(res, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
};

export default authorize;




















