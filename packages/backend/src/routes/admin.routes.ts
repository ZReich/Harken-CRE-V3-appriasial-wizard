import { Router } from 'express';
import { authorize, RoleGroups } from '../middleware/authorize';
import AdminUsersService from '../services/admin/adminUsers.service';
import AdminAccountsService from '../services/admin/adminAccounts.service';
import AdminReportsService from '../services/admin/adminReports.service';
import AdminAuditService from '../services/admin/adminAudit.service';

/**
 * Admin Routes
 * 
 * All routes in this file are protected by role-based access control.
 * Most routes require SUPER_ADMINISTRATOR or DEV roles.
 * Some routes allow ADMINISTRATOR role with account-scoped access.
 */
class AdminRoutes {
	router = Router();
	
	// Service instances
	private adminUsersService = new AdminUsersService();
	private adminAccountsService = new AdminAccountsService();
	private adminReportsService = new AdminReportsService();
	private adminAuditService = new AdminAuditService();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		// ============================================
		// USER MANAGEMENT ROUTES
		// ============================================
		
		/**
		 * GET /admin/users
		 * List all users with filtering and pagination
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (account-scoped)
		 */
		this.router.get(
			'/users',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminUsersService.listUsers,
		);

		/**
		 * GET /admin/users/:id
		 * Get specific user details
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (account-scoped)
		 */
		this.router.get(
			'/users/:id',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminUsersService.getUser,
		);

		/**
		 * POST /admin/users
		 * Create new user
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (account-scoped)
		 */
		this.router.post(
			'/users',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminUsersService.createUser,
		);

		/**
		 * PATCH /admin/users/:id
		 * Update user (profile, role, status, account)
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (account-scoped)
		 */
		this.router.patch(
			'/users/:id',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminUsersService.updateUser,
		);

		/**
		 * DELETE /admin/users/:id
		 * Deactivate/delete user
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (account-scoped)
		 */
		this.router.delete(
			'/users/:id',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminUsersService.deleteUser,
		);

		/**
		 * POST /admin/users/:id/reset-password
		 * Trigger password reset email for user
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (account-scoped)
		 */
		this.router.post(
			'/users/:id/reset-password',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminUsersService.resetPassword,
		);

		// ============================================
		// ACCOUNT MANAGEMENT ROUTES
		// ============================================

		/**
		 * GET /admin/accounts
		 * List all accounts with metrics
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.get(
			'/accounts',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminAccountsService.listAccounts,
		);

		/**
		 * GET /admin/accounts/:id
		 * Get specific account details with usage metrics
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (own account only)
		 */
		this.router.get(
			'/accounts/:id',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminAccountsService.getAccount,
		);

		/**
		 * POST /admin/accounts
		 * Create new account
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.post(
			'/accounts',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminAccountsService.createAccount,
		);

		/**
		 * PATCH /admin/accounts/:id
		 * Update account settings (features, theme, general settings)
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (own account only)
		 */
		this.router.patch(
			'/accounts/:id',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminAccountsService.updateAccount,
		);

		/**
		 * POST /admin/accounts/:id/subscription
		 * Update account subscription (plan, pricing, seats)
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.post(
			'/accounts/:id/subscription',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminAccountsService.updateSubscription,
		);

		/**
		 * GET /admin/accounts/:id/invoices
		 * Get account invoices (Phase 2 - placeholder)
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (own account only)
		 */
		this.router.get(
			'/accounts/:id/invoices',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminAccountsService.getInvoices,
		);

		// ============================================
		// REPORTING & ANALYTICS ROUTES
		// ============================================

		/**
		 * GET /admin/reports/usage
		 * Get user activity and usage metrics
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.get(
			'/reports/usage',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminReportsService.getUsageReport,
		);

		/**
		 * GET /admin/reports/content
		 * Get content creation metrics (appraisals, evaluations, comps)
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.get(
			'/reports/content',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminReportsService.getContentReport,
		);

		/**
		 * GET /admin/reports/billing
		 * Get billing and revenue metrics
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.get(
			'/reports/billing',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminReportsService.getBillingReport,
		);

		/**
		 * GET /admin/reports/system
		 * Get system health and error metrics
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.get(
			'/reports/system',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminReportsService.getSystemReport,
		);

		/**
		 * GET /admin/reports/dashboard
		 * Get aggregated dashboard metrics
		 * Access: SUPER_ADMIN, DEV, ADMINISTRATOR (account-scoped data)
		 */
		this.router.get(
			'/reports/dashboard',
			authorize(RoleGroups.ADMIN_ROLES),
			this.adminReportsService.getDashboardReport,
		);

		// ============================================
		// AUDIT LOG ROUTES
		// ============================================

		/**
		 * GET /admin/logs
		 * Get audit logs with filtering
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.get(
			'/logs',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminAuditService.getAuditLogs,
		);

		/**
		 * GET /admin/logs/:id
		 * Get specific audit log details
		 * Access: SUPER_ADMIN, DEV
		 */
		this.router.get(
			'/logs/:id',
			authorize(RoleGroups.SUPER_ROLES),
			this.adminAuditService.getAuditLog,
		);
	}
}

export default new AdminRoutes().router;




















