# Admin Panel Feature Documentation

**Status:** In Development  
**Version:** 1.0.0  
**Last Updated:** January 15, 2025

## Overview

Enterprise-grade Admin Panel for multi-tenant management providing comprehensive control over users, accounts, billing, reporting, and system configuration with role-based access control.

---

## Feature Status Legend

- `[ ]` - Pending
- `[x]` - Complete
- `[~]` - In Progress
- `[-]` - Blocked/Deferred

---

## Phase 1: Core Admin Features

### 1. HTML/CSS Prototypes
- [x] Dashboard prototype with functional navigation (`prototypes/admin-dashboard.html`)
  - [x] All user email links navigate to User Edit page
  - [x] All account name links navigate to Account Management page
- [x] Users Management prototype with Create User modal (`prototypes/admin-users.html`)
  - [x] "+ Create User" button aligned with search bar (replaced ⊕ icon)
  - [x] Light theme modal matching software design (consistent with Create Account modal)
- [x] User Edit page with full profile management (`prototypes/admin-user-edit.html`)
  - [x] Uniform image upload containers (same height for profile and signature)
  - [x] Drag-and-drop support for profile photo and signature uploads
  - [x] Visual feedback on drag-over (blue border and background)
  - [x] Removed permission banners (RBAC enforced at route level, not UI)
  - [x] Recent Activity section with last 10 user actions
  - [x] Link to full audit log with user filter pre-applied
  - [x] Reset Password functionality with confirmation modal
  - [x] Deactivate User functionality with detailed warning modal
  - [x] Success notification system with auto-dismiss
  - [x] Dynamic UI updates (status badge, button state changes)
  - [x] Keyboard accessibility (ESC to close modals)
- [x] Accounts & Billing prototype with Create Account modal (`prototypes/admin-accounts.html`)
  - [x] "+ Create Account" button (replaced ⊕ icon for better UX)
  - [x] Light theme modal matching software design (not dark theme)
  - [x] Streamlined modal with essential fields only (name, address, subscription, features)
  - [x] Theme colors and logo removed from modal (configured in Account Details page)
- [x] Account Management page with logo upload interface (`prototypes/admin-account-manage.html`)
  - [x] Logo upload interface matching current software design (replaces URL input)
  - [x] JavaScript preview functionality for uploaded logos
  - [x] Users tab with "+ Add User to Account" button (context-aware UX)
  - [x] Add User to Account modal with light theme (account pre-filled/disabled)
  - [x] Removed confusing "View All Users" button to maintain context
  - [x] Standardized action buttons across all user tables (Edit + Reset PW buttons)
  - [x] Reset Password functionality for account users with confirmation modal
  - [x] Dynamic user info extraction from table rows
  - [x] Context-aware success messages with user email
  - [x] Suspend Account functionality with detailed warning modal
  - [x] Reactivate Account functionality with confirmation modal
  - [x] Full suspend/reactivate lifecycle with state management
  - [x] Multi-user impact warnings for both suspend and reactivate
  - [x] Update Payment Method modal with PCI-compliant styling
  - [x] Real-time card number formatting and validation
  - [x] Card brand detection (Visa, MC, Amex, Discover)
  - [x] Expiry date auto-formatting (MM / YY)
  - [x] CVV field with help tooltip
  - [x] Billing address collection
  - [x] Security badge and SSL messaging
  - [x] Success notification system with auto-dismiss
  - [x] Dynamic UI updates (status badge and button toggle between states)
  - [x] Keyboard accessibility (ESC to close modals)
- [x] Reports & Analytics prototype with live charts (`prototypes/admin-reports.html`)
  - [x] Chart.js integration for professional data visualization
  - [x] User Activity multi-line chart (Logins, Active Users, New Signups)
  - [x] Content Creation grouped bar chart (Appraisals, Evaluations, Comps)
  - [x] Revenue Growth area chart with gradient fill
  - [x] Real-time data generation with trending algorithms
  - [x] Interactive tooltips with hover states
  - [x] Responsive chart sizing and legend positioning
  - [x] Brand color scheme (#0da1c7, #2e7d32, #e65100)
  - [x] All account names in Top Accounts table link to Account Management page
- [x] Audit Logs prototype with functional navigation (`prototypes/admin-audit-logs.html`)
  - [x] All actor email links navigate to User Edit page
  - [x] All account name links navigate to Account Management page

### 2. Backend: Authentication & Authorization

#### RBAC Middleware
- [x] Create `packages/backend/src/middleware/authorize.ts`
  - [x] Implement `authorize(requiredRoles: RoleEnum[])` middleware
  - [ ] Role validation logic
  - [ ] Account scoping for ADMINISTRATOR role
  - [ ] Error handling and responses
- [ ] Unit tests for authorize middleware
- [ ] Integration with existing `authenticate.ts`

**Role Permissions for User Management:**
- **Super Administrator** (Harken Corporate Team)
  - Full access to all accounts
  - Can change any user role
  - Can transfer users between accounts
  - Minimal intervention needed
- **Administrator** (Account-level)
  - Manage users within their own account
  - Change user roles within their account
  - Cannot transfer users to other accounts
  - Self-service user management

#### Admin Routes Structure
- [ ] Create `packages/backend/src/routes/admin.routes.ts`
- [ ] Register admin routes in `packages/backend/src/routes/index.ts`
- [ ] Apply authorize middleware to all admin routes

### 3. Backend: User Management API

#### User Management Endpoints
- [ ] `GET /admin/users` - List users with filters
  - [ ] Query parameters: accountId, status, role, search, page, limit
  - [ ] Pagination support
  - [ ] Search by name/email
  - [ ] Filter by account, role, status
- [ ] `POST /admin/users` - Create new user
  - [ ] Default role: USER
  - [ ] Super roles can set any role
  - [ ] Account assignment validation
  - [ ] Email uniqueness check
  - [ ] Send welcome/set-password email
- [ ] `PATCH /admin/users/:id` - Update user
  - [ ] Profile updates (name, email, phone, etc.)
  - [ ] Role changes (super roles only)
  - [ ] Status changes (activate/deactivate)
  - [ ] Account transfers (super roles only)
  - [ ] Permission validation
- [ ] `DELETE /admin/users/:id` - Deactivate user
  - [ ] Soft delete/status change
  - [ ] Cascade handling for user's data
- [ ] `POST /admin/users/:id/reset-password` - Trigger password reset
  - [ ] Generate reset token
  - [ ] Send reset email

#### User Service & Store Extensions
- [ ] Extend `packages/backend/src/services/user/user.store.ts`
  - [ ] `getAllUsersAdmin(filters, pagination)` method
  - [ ] Advanced filtering support
  - [ ] Account-scoped queries for ADMINISTRATOR
- [ ] Extend `packages/backend/src/services/user/user.service.ts`
  - [ ] Admin user listing with role checks
  - [ ] Bulk operations support (future)
- [ ] Joi validation schemas for admin user operations

### 4. Backend: Accounts & Billing API

#### Account Management Endpoints
- [ ] `GET /admin/accounts` - List accounts
  - [ ] Include subscription, user counts, comp counts
  - [ ] Filter by subscription type, status
  - [ ] Search by name
  - [ ] Pagination support
- [ ] `GET /admin/accounts/:id` - Get account details
  - [ ] Full account information
  - [ ] Subscription details
  - [ ] Usage statistics
  - [ ] Feature flags
- [ ] `PATCH /admin/accounts/:id` - Update account settings
  - [ ] `enable_residential` flag
  - [ ] `eval_access` flag
  - [ ] Theme settings (colors, logo)
  - [ ] General settings
- [ ] `POST /admin/accounts/:id/subscription` - Update subscription
  - [ ] Plan changes (Basic, Professional, Enterprise)
  - [ ] Per-user pricing
  - [ ] Seat count
  - [ ] Effective date
- [ ] `GET /admin/accounts/:id/invoices` - Get invoices (Phase 2)
  - [ ] Placeholder/mock data initially
  - [ ] Integration with payment provider later

#### Account Service & Store Extensions
- [ ] Extend `packages/backend/src/services/accounts/accounts.store.ts`
  - [ ] `getAllAccountsAdmin(filters, pagination)` method
  - [ ] Include aggregated counts (users, comps, etc.)
  - [ ] Usage metrics queries
- [ ] Extend `packages/backend/src/services/accounts/accounts.service.ts`
  - [ ] Admin account management methods
  - [ ] Subscription update logic
  - [ ] Feature flag toggle logic
- [ ] Validation schemas for account operations

### 5. Backend: Reporting & Analytics API

#### Reporting Endpoints
- [ ] `GET /admin/reports/usage` - User activity metrics
  - [ ] Active users by date range
  - [ ] Login counts
  - [ ] Session statistics
  - [ ] Group by: day/week/month
- [ ] `GET /admin/reports/content` - Content creation metrics
  - [ ] Appraisals created (by period)
  - [ ] Evaluations created (by period)
  - [ ] Comps added (by period)
  - [ ] Group by: day/week/month
- [ ] `GET /admin/reports/billing` - Revenue metrics
  - [ ] MRR (Monthly Recurring Revenue)
  - [ ] ARR (Annual Run Rate)
  - [ ] Revenue per user
  - [ ] Retention metrics
  - [ ] Account-level revenue breakdown
- [ ] `GET /admin/reports/system` - System health
  - [ ] Error counts by type
  - [ ] API response times
  - [ ] Uptime statistics
  - [ ] Storage usage

#### Reporting Service & Store
- [ ] Create `packages/backend/src/services/reports/reports.store.ts`
  - [ ] User activity aggregations
  - [ ] Content creation aggregations
  - [ ] Billing calculations
  - [ ] System health queries
- [ ] Create `packages/backend/src/services/reports/reports.service.ts`
  - [ ] Report generation logic
  - [ ] Date range handling
  - [ ] Group by logic (day/week/month)
  - [ ] Caching strategy (60s TTL for heavy queries)
- [ ] CSV export utilities

### 6. Backend: Audit Logs API

#### Audit Log Endpoints
- [ ] `GET /admin/logs` - Get audit logs
  - [ ] Filter by actor, action, resource, date range
  - [ ] Pagination support
  - [ ] Search functionality
  - [ ] Sort by timestamp

#### Audit Logging Infrastructure
- [ ] Extend `packages/backend/src/models/logger.sequelize.ts` if needed
- [ ] Audit log store methods
  - [ ] Query with complex filters
  - [ ] Efficient pagination
- [ ] Integrate audit logging into admin actions
  - [ ] User CRUD operations
  - [ ] Account updates
  - [ ] Subscription changes
  - [ ] Role changes
  - [ ] Feature flag toggles

### 7. Frontend: Admin Layout & Routing

#### Routing & Navigation
- [ ] Create `packages/frontend/src/pages/admin/` directory structure
- [ ] Add `/admin` route in `packages/frontend/src/routing/Routes.tsx`
- [ ] Create admin route guard component
  - [ ] Check for SUPER_ADMINISTRATOR, DEV, or ADMINISTRATOR roles
  - [ ] Redirect unauthorized users
- [ ] Create admin navigation component
  - [ ] Links to Dashboard, Users, Accounts, Reports, Audit Logs
  - [ ] Active state styling
  - [ ] Role display

#### Admin Layout Component
- [ ] Create `packages/frontend/src/pages/admin/AdminLayout.tsx`
  - [ ] Consistent header navigation
  - [ ] Footer with copyright
  - [ ] Page wrapper with consistent padding
- [ ] Consistent styling matching prototypes

### 8. Frontend: Dashboard Page

- [ ] Create `packages/frontend/src/pages/admin/Dashboard.tsx`
- [ ] Key Metrics Cards
  - [ ] Total Users (with % change)
  - [ ] Active Accounts (with % change)
  - [ ] Monthly Revenue (with % change)
  - [ ] System Uptime (with % change)
- [ ] Secondary Metrics Cards
  - [ ] Appraisals (30d)
  - [ ] Evaluations (30d)
  - [ ] Comps (30d)
  - [ ] Logins Today
- [ ] Recent Activity Feed
  - [ ] Last 10 admin actions
  - [ ] Clickable links to resources
  - [ ] Timestamp display
- [ ] Quick Stats Sidebar
  - [ ] New Users (7d)
  - [ ] Trials Ending Soon
  - [ ] System Errors (24h)
  - [ ] Avg. API Response
- [ ] API integration with `/admin/reports/*` endpoints
- [ ] Auto-refresh every 60 seconds

### 9. Frontend: Users Management Page

- [ ] Create `packages/frontend/src/pages/admin/Users.tsx`
- [ ] Users Table
  - [ ] Columns: Name, Email, Account, Role, Status, Last Login, Actions
  - [ ] Sortable columns
  - [ ] Server-side pagination
  - [ ] Empty state handling
  - [ ] Loading state
- [ ] Search & Filters
  - [ ] Search by name or email
  - [ ] Filter by account
  - [ ] Filter by role
  - [ ] Filter by status
  - [ ] Clear filters button
- [ ] Create User Modal
  - [ ] Form with validation
  - [ ] Account selection (super roles)
  - [ ] Role selection (super roles)
  - [ ] Profile image upload
  - [ ] Submit handler
- [ ] Edit User Drawer/Modal
  - [ ] Pre-filled form
  - [ ] Role change (with confirmation)
  - [ ] Account transfer (super roles)
  - [ ] Status toggle
  - [ ] Save handler
- [ ] User Actions
  - [ ] Reset Password button (triggers email)
  - [ ] Deactivate/Activate toggle
  - [ ] Delete button (with confirmation)
- [ ] API integration with `/admin/users/*` endpoints

### 10. Frontend: Accounts & Billing Page

- [ ] Create `packages/frontend/src/pages/admin/Accounts.tsx`
- [ ] Accounts Table
  - [ ] Columns: Name, # Users, # Comps, Subscription, MRR, Features, Status, Actions
  - [ ] Server-side pagination
  - [ ] Sortable columns
- [ ] Search & Filters
  - [ ] Search by account name
  - [ ] Filter by subscription type
  - [ ] Filter by status
- [ ] Manage Account Drawer/Modal
  - [ ] Account details tab
  - [ ] Subscription tab (plan, seats, per-user price)
  - [ ] Feature flags (eval_access, enable_residential)
  - [ ] Theme settings (colors, logo upload)
  - [ ] Invoices tab (Phase 2)
  - [ ] Save handler
- [ ] Summary Cards
  - [ ] Total Accounts
  - [ ] Monthly Revenue
  - [ ] Avg. Per User
  - [ ] Trials Ending Soon
- [ ] API integration with `/admin/accounts/*` endpoints

### 11. Frontend: Reports & Analytics Page

- [ ] Create `packages/frontend/src/pages/admin/Reports.tsx`
- [ ] Report Controls
  - [ ] Date range picker (Last 7/30/90 days, Year, Custom)
  - [ ] Group by selector (Day, Week, Month)
  - [ ] Export CSV button
- [ ] User Activity Section
  - [ ] Metrics cards (Logins, Active Users, Sessions/User, Avg. Session Time)
  - [ ] Line chart placeholder
- [ ] Content Creation Section
  - [ ] Metrics cards (Appraisals, Evaluations, Comps)
  - [ ] Bar chart placeholder
- [ ] Revenue & Billing Section
  - [ ] Metrics cards (MRR, ARR, Revenue Per User, Retention Rate)
  - [ ] Area chart placeholder
- [ ] Top Accounts Table
  - [ ] Columns: Account, Users, Logins, Appraisals, Evaluations, Comps, Revenue
  - [ ] Sortable
- [ ] System Health Section
  - [ ] Metrics cards (Uptime, API Response, Errors, Storage)
- [ ] API integration with `/admin/reports/*` endpoints
- [ ] Chart integration (Chart.js or Recharts)

### 12. Frontend: Audit Logs Page

- [ ] Create `packages/frontend/src/pages/admin/AuditLogs.tsx`
- [ ] Audit Logs Table
  - [ ] Columns: Timestamp, Actor, Action, Resource, Description, IP Address
  - [ ] Server-side pagination
  - [ ] Action badge styling (Create, Update, Delete, Login, Config)
- [ ] Search & Filters
  - [ ] Search logs
  - [ ] Filter by action type
  - [ ] Filter by resource type
  - [ ] Filter by actor type
  - [ ] Date range filter
- [ ] Log Details Modal (optional)
  - [ ] Full log entry details
  - [ ] JSON payload (if applicable)
- [ ] API integration with `/admin/logs` endpoint

### 13. Shared Components & Utilities

#### Reusable Components
- [ ] AdminTable component (with sorting, pagination)
- [ ] FilterBar component
- [ ] MetricCard component
- [ ] ActionBadge component
- [ ] RoleBadge component
- [ ] StatusBadge component
- [ ] SearchInput component
- [ ] DateRangePicker component

#### Utilities
- [ ] Pagination helper functions
- [ ] Filter parsing utilities
- [ ] Date formatting utilities
- [ ] CSV export utilities
- [ ] Number formatting (currency, percentages)

### 14. Testing & Quality Assurance

#### Backend Tests
- [ ] Unit tests for authorize middleware
- [ ] Unit tests for user admin service
- [ ] Unit tests for account admin service
- [ ] Unit tests for reports service
- [ ] API integration tests for admin endpoints
- [ ] Role-based access control tests

#### Frontend Tests
- [ ] Route guard tests
- [ ] Dashboard component tests
- [ ] Users page interaction tests
- [ ] Accounts page interaction tests
- [ ] Reports page rendering tests
- [ ] Audit logs filtering tests

#### End-to-End Tests
- [ ] Admin login and navigation flow
- [ ] User creation and management flow
- [ ] Account subscription update flow
- [ ] Report generation flow

---

## Phase 2: Enhanced Billing & Invoicing

### Billing Provider Integration
- [ ] Stripe/payment provider setup
- [ ] Webhook handlers for subscription events
- [ ] Invoice generation and storage
- [ ] Payment method management
- [ ] Proration handling
- [ ] Invoice display in admin panel
- [ ] Email notifications for billing events

---

## Phase 3: Advanced Features

### Advanced Reporting
- [ ] Custom report builder
- [ ] Report scheduling/email delivery
- [ ] Data export enhancements (Excel, PDF)
- [ ] Advanced visualizations
- [ ] Comparative period analysis
- [ ] Custom date range comparisons

### Performance & Scalability
- [ ] Report caching strategy
- [ ] Database query optimization
- [ ] Lazy loading for large datasets
- [ ] Background job processing for heavy reports
- [ ] CDN integration for static assets

### Additional Features
- [ ] Bulk user operations
- [ ] Email campaign management
- [ ] System-wide announcements
- [ ] Feature flag management UI
- [ ] Template management integration
- [ ] API usage analytics
- [ ] Custom branding per account

---

## Technical Specifications

### Security & Permissions

**Role Hierarchy:**
1. `SUPER_ADMINISTRATOR` (1) - Full system access
2. `DEV` (4) - Development and debugging access
3. `ADMINISTRATOR` (3) - Account-scoped management
4. `USER` (2) - Standard user access
5. `DATA_ENTRY` (5) - Limited data entry access

**Access Control:**
- SUPER_ADMINISTRATOR: All admin features, all accounts
- DEV: All admin features, all accounts
- ADMINISTRATOR: Users and settings within their account only
- USER, DATA_ENTRY: No admin panel access

### Performance Targets
- Dashboard load time: < 2s
- Table pagination response: < 500ms
- Report generation: < 5s for 30-day periods
- Chart rendering: < 1s
- Search results: < 300ms

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## UI/UX Guidelines

### Design System
- **Font:** Montserrat (all weights)
- **Primary Color:** #0da1c7 (customBlue / customDeeperSkyBlue)
- **Secondary Color:** #687F8B (gray for text/borders)
- **Dark Background:** #1c3643 (navbar)
- **Light Background:** #f9f9f9 (page background)
- **Link Color:** #38bdf8 (text-sky-400) with underline on hover
- **Success:** limegreen
- **Error:** #a94442 (redError)

### Component Patterns
- Tables: White background, #687F8B text, hover state #f9f9f9
- Modals: z-index ≥ 1000, centered, overlay with backdrop
- Buttons: #0da1c7 primary, #687F8B secondary, rounded corners
- Badges: Rounded pills with semantic colors
- Cards: White background, subtle shadow, rounded corners

---

## Dependencies & Libraries

### Backend
- Express (existing)
- Sequelize (existing)
- Joi (existing validation)
- jsonwebtoken (existing auth)
- bcrypt (existing passwords)

### Frontend
- React (existing)
- Material-UI (existing)
- Tailwind CSS (existing)
- Chart.js or Recharts (for charts - to be added)
- date-fns or dayjs (for date handling - to be added)

---

## Rollout & Deployment

### Phase 1 Deployment Checklist
- [ ] All Phase 1 backend endpoints implemented and tested
- [ ] All Phase 1 frontend pages implemented and tested
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Documentation completed
- [ ] User training materials prepared
- [ ] Database migrations run
- [ ] Feature flag enabled for admin panel
- [ ] Monitoring and logging configured

### Post-Deployment Monitoring
- [ ] Error rate tracking
- [ ] Performance metrics
- [ ] User adoption metrics
- [ ] Audit log reviews
- [ ] Security incident monitoring

---

## Known Issues & Limitations

_To be populated as issues are discovered_

---

## Change Log

### Version 1.0.0 - January 15, 2025
- Initial admin panel specification
- HTML/CSS prototypes created
- Feature checklist established
- Phase 1, 2, 3 roadmap defined

---

## Contributors

- Senior Dev Team
- Design Team
- QA Team

---

## References

- [Harken CRE Main Documentation](./README.md)
- [User Roles Documentation](./packages/backend/src/utils/enums/RoleEnum.ts)
- [Authentication Middleware](./packages/backend/src/middleware/authenticate.ts)
- [Existing Account Routes](./packages/backend/src/routes/accounts.routes.ts)
- [Existing User Routes](./packages/backend/src/routes/user.routes.ts)

