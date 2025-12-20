# Harken CRE - Super Admin Prototype

This folder contains the complete **Super Admin prototype** for Harken CRE, showcasing the unified navigation design and comprehensive dashboard system.

## 🎯 Overview

This prototype demonstrates the **Phase 1** implementation - the Harken Super Admin view that has access to **EVERYTHING** in the platform. It includes:

- ✅ Unified navigation with prominent core features (COMPS, APPRAISAL, EVALUATION)
- ✅ Full dashboard and user management system
- ✅ Role-based access control UI
- ✅ Feature toggle controls for accounts
- ✅ Complete linking between all pages

## 📂 File Structure

```
SuperAdmin/
├── components/
│   └── unified-nav-snippet.html          # Reusable navigation component
├── assets/
│   └── harken.png                        # Harken logo
├── super-admin-dashboard.html            # 🏠 LANDING PAGE (Default)
├── super-admin-comps.html                # COMPS portal
├── super-admin-appraisals-list.html      # Appraisals list view
├── super-admin-evaluations-list.html     # Evaluations list view
├── super-admin-users.html                # Users management list
├── super-admin-user-detail.html          # User detail with permissions matrix
├── super-admin-accounts.html             # Accounts list
├── super-admin-account-detail.html       # Account detail with feature toggles
├── super-admin-clients.html              # Clients management
├── super-admin-reports.html              # Reports & analytics portal
├── super-admin-support.html              # Support tickets
├── super-admin-audit-logs.html           # System audit logs
├── super-admin-settings.html             # Platform settings
└── README.md                             # This file
```

## 🎨 Navigation Design

### Primary Navigation Bar

The unified navigation features a **two-tier visual hierarchy**:

#### Tier 1: Core Features (Purple - Prominent)
```
[COMPS] [APPRAISAL] [EVALUATION]
```
- **Color**: Purple gradient (#7c3aed)
- **Font**: 15px, bold (700), letter-spacing 0.5px
- **Styling**: Grouped together with purple background glow
- **Purpose**: These are the core product features that the entire platform is built around

#### Tier 2: Management Features (Standard)
```
Dashboard | Users | Clients | Accounts | Reports | Support | Audit Logs | Settings
```
- **Color**: White/Teal (#0da1c7)
- **Font**: 14px, medium (500)
- **Purpose**: Dashboard and administrative functions

### Property Type Tabs (Conditional)

```
[Commercial] [Residential] [Land]
```

**Only visible on**: COMPS, APPRAISAL, and EVALUATION pages  
**Hidden on**: Dashboard, Users, Clients, Accounts, Reports, Support, Audit Logs, Settings

## 🏠 Default Landing Page

**File**: `super-admin-dashboard.html`

When a Super Admin logs in, they land on the Dashboard page, which includes:
- Content creation metrics (Appraisals, Evaluations, Comps)
- User activity statistics
- Top users and accounts tables
- Revenue and billing metrics
- Charts powered by Chart.js

## 🔗 Page Linking Map

### Core Features
```
Dashboard (Landing)
├── COMPS → super-admin-comps.html
│   └── Links to: ../comps-premium-with-clustering.html (full interface)
├── APPRAISAL → super-admin-appraisals-list.html
│   └── Property tabs visible
├── EVALUATION → super-admin-evaluations-list.html
    ├── Links to: ../evaluation-wizard-full.html (create new)
    └── Property tabs visible
```

### Management Features
```
Dashboard
├── Users → super-admin-users.html
│   └── User Detail → super-admin-user-detail.html
│       └── Permissions Matrix (COMPS always enabled)
├── Clients → super-admin-clients.html
├── Accounts → super-admin-accounts.html
│   └── Account Detail → super-admin-account-detail.html
│       └── Feature Toggles (Enable/Disable Appraisals & Evaluations)
├── Reports → super-admin-reports.html
├── Support → super-admin-support.html
├── Audit Logs → super-admin-audit-logs.html
└── Settings → super-admin-settings.html
```

## 🔐 Role-Based Access Control (RBAC)

### Feature Access Rules

#### COMPS
- **Always Enabled**: ✅ Cannot be disabled
- **Available to**: All accounts and users
- **Rationale**: Core feature that all customers need

#### APPRAISALS
- **Toggleable**: ✅ Can be enabled/disabled per account
- **Control Location**: Account Detail page (`super-admin-account-detail.html`)
- **User Permission**: Can be enabled/disabled per user (`super-admin-user-detail.html`)

#### EVALUATIONS
- **Toggleable**: ✅ Can be enabled/disabled per account
- **Control Location**: Account Detail page (`super-admin-account-detail.html`)
- **User Permission**: Can be enabled/disabled per user (`super-admin-user-detail.html`)

### User Permissions Matrix

Located in: `super-admin-user-detail.html`

Permissions include:
- ✅ COMPS (always checked, disabled)
- ☑️ Appraisals (toggle)
- ☑️ Evaluations (toggle)
- ☑️ Dashboard Access
- ☑️ Manage Users (admin only)
- ☑️ Manage Clients
- ☑️ View Reports
- ☑️ Account Settings (admin only)

## 🎨 Color Palette

| Element | Color | Hex Code |
|---------|-------|----------|
| Core Features (Purple) | Purple gradient | `#7c3aed` → `#6d28d9` |
| Management Features | Teal | `#0da1c7` |
| Navbar Background | Dark Navy | `#1c3643` |
| Active States | Teal underline | `#0da1c7` |
| Background | Light Gray | `#f9f9f9` |

## 🚀 How to View the Prototype

### Option 1: Open Directly
1. Navigate to `prototypes/SuperAdmin/`
2. Open `super-admin-dashboard.html` in your browser
3. Use the navigation to explore all pages

### Option 2: Run with Local Server (Recommended)
```bash
# From the project root
cd prototypes/SuperAdmin
python -m http.server 8000
# or
npx serve
```
Then open: `http://localhost:8000/super-admin-dashboard.html`

## 🔄 Navigation State Management

The navigation component (`components/unified-nav-snippet.html`) includes JavaScript that:

1. **Highlights active page**: Automatically detects the current page and highlights the corresponding nav item
2. **Shows/hides property tabs**: Property tabs only appear on COMPS, APPRAISAL, and EVALUATION pages
3. **Persists property type**: Stores the selected property type (Commercial/Residential/Land) in localStorage

## 📊 Key Features Demonstrated

### 1. Dashboard (Landing Page)
- Content creation metrics with charts
- User activity analytics
- Top users and accounts
- Revenue tracking

### 2. Users Management
- User list with search and filters
- User detail page with full permissions matrix
- Role management (Admin, User, Super Admin)
- Activity tracking

### 3. Accounts Management
- Account list with subscription tiers
- Account detail with feature access controls
- **Feature Toggles**: Enable/disable Appraisals and Evaluations
- Account statistics and user list

### 4. Reports & Analytics
- 9 different report types showcased
- Visual card-based interface
- Export capabilities

### 5. Support System
- Ticket management interface
- Status filtering (Open, In Progress, Resolved, Closed)
- Priority levels (High, Medium, Low)

### 6. Audit Logs
- Complete activity tracking
- User action logging
- IP address tracking
- Searchable and filterable

### 7. Platform Settings
- Platform-wide configuration
- API key management
- Email notification settings
- Billing settings
- White label configuration

## 🎯 Next Steps

### Phase 2: Regular User Prototype
After approval of this Super Admin prototype, create a **Regular User view** with:
- Restricted navigation based on permissions
- Hide management features (Users, Accounts, Audit Logs, Settings)
- Show only enabled features (COMPS, Appraisals, Evaluations based on account settings)
- Simplified dashboard

### Implementation in React
Once prototypes are approved:
1. Implement unified navigation in `packages/frontend/src/components/header/index.tsx`
2. Add property type tabs component
3. Create dashboard pages in React
4. Implement RBAC logic in backend
5. Add feature toggle functionality

## 📝 Notes for Presentation

When showing this prototype to owners:

1. **Start at the Landing Page**: `super-admin-dashboard.html`
2. **Highlight Core Features**: Point out the purple COMPS, APPRAISAL, EVALUATION buttons
3. **Demonstrate Property Tabs**: Navigate to COMPS or EVALUATION to show conditional tabs
4. **Show Feature Toggles**: 
   - Go to Accounts → Account Detail
   - Show how Appraisals/Evaluations can be enabled/disabled
5. **Show User Permissions**:
   - Go to Users → User Detail
   - Show permissions matrix with COMPS always enabled
6. **Emphasize Linking**: Show how everything connects together

## 🛠 Technical Details

### Technologies Used
- **HTML5**: Structure
- **Tailwind CSS**: Styling (via CDN)
- **Montserrat Font**: Typography
- **Material Icons**: Icon library
- **Chart.js**: Data visualizations (dashboard charts)
- **Vanilla JavaScript**: Navigation state management

### Browser Compatibility
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## 📞 Support

For questions about this prototype, contact the development team.

---

**Version**: 1.0  
**Date**: October 27, 2024  
**Status**: ✅ Phase 1 Complete - Ready for Review

