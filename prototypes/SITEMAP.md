# Harken CRE Prototype Sitemap

## Complete Page Mapping Across Three User Types

---

## HARKEN SUPER ADMIN (prototypes/SuperAdmin/)

### Core Features Navigation

#### COMPS Tab
```
comps-premium-with-clustering.html (../comps-premium-with-clustering.html)
├─ Property Tabs: Commercial | Residential | Land
├─ Advanced filtering and map clustering
├─ Property cards and list view
└─ Actions: Create new comp, edit existing
```

#### APPRAISAL Tab
```
super-admin-appraisals-list.html (DEFAULT VIEW)
├─ Property Tabs: Commercial | Residential | Land
├─ Header Actions:
│   ├─ [View Templates] → super-admin-appraisal-templates.html
│   └─ [New Appraisal] → appraisal-wizard.html (future)
├─ Search and filters
├─ Table: Property, Type, Client, Status, Value, Actions
└─ Actions per row: View, Edit, Delete

super-admin-appraisal-templates.html
├─ Breadcrumb: ← Back to Appraisals
├─ Header Actions:
│   ├─ [Import Template]
│   └─ [Create New Template] → super-admin-template-builder.html?type=appraisal
├─ Property Filters: All | Commercial | Residential | Land
├─ Template Grid:
│   ├─ Commercial Appraisal - USPAP Compliant
│   ├─ Residential Appraisal - URAR Format
│   ├─ Land Appraisal - Standard
│   ├─ Multi-Family Appraisal
│   ├─ Residential Investment Property
│   └─ Office Building Appraisal
└─ Actions per template: Edit, Preview, Usage

super-admin-template-builder.html?type=appraisal&property=commercial
├─ URL Parameters:
│   ├─ type: appraisal | evaluation
│   ├─ property: commercial | residential | land
│   └─ template_id: 123 (for editing existing)
├─ Top Bar:
│   ├─ ← Back
│   ├─ Template Name
│   └─ [Cancel] [Save Draft] [Save Template]
├─ 3-Column Layout:
│   ├─ LEFT: Sections Tree (checkboxes, drag handles, expand/collapse)
│   ├─ CENTER: Live Preview (8.5" x 11" pages with sample data)
│   └─ RIGHT: Properties Tabs
│       ├─ Settings (name, description, type)
│       ├─ Approaches (filtered by property type)
│       ├─ Scenarios (Single, Dual, Triple, Custom)
│       └─ Section Properties (when section selected)
└─ Returns to: super-admin-appraisal-templates.html
```

#### EVALUATION Tab
```
super-admin-evaluations-list.html (DEFAULT VIEW)
├─ Property Tabs: Commercial | Residential | Land
├─ Header Actions:
│   ├─ [View Templates] → super-admin-evaluation-templates.html
│   └─ [New Evaluation] → evaluation-wizard-full.html (../evaluation-wizard-full.html)
├─ Search and filters
├─ Table: Property, Type, Client, Status, Approaches, Value, Actions
└─ Actions per row: View, Edit, Delete

super-admin-evaluation-templates.html
├─ Breadcrumb: ← Back to Evaluations
├─ Header Actions:
│   ├─ [Import Template]
│   └─ [Create New Template] → super-admin-template-builder.html?type=evaluation
├─ Property Filters: All | Commercial | Residential | Land
├─ Template Grid:
│   ├─ Commercial Evaluation - Standard
│   ├─ Commercial As-Is/As-Completed (DUAL SCENARIO badge)
│   ├─ Multi-Family Evaluation
│   ├─ Residential Evaluation - Standard
│   ├─ Residential Investment Analysis
│   ├─ Land Evaluation - Development
│   ├─ Development Lifecycle Analysis (MULTI-SCENARIO badge)
│   └─ Residential Rehab Project (DUAL SCENARIO badge)
└─ Actions per template: Edit, Preview, Usage

super-admin-template-builder.html?type=evaluation&property=commercial
└─ Same structure as appraisal builder, but with:
    ├─ Evaluation-specific sections
    ├─ Scenario configuration (As-Is, As-Completed, etc.)
    └─ Data inheritance settings
```

### Management Features Navigation

#### Dashboard
```
super-admin-dashboard.html
├─ Metrics cards (content creation, user activity, revenue)
├─ Tables: Top users, Top accounts
├─ Charts: Activity trends
└─ Date range filtering
```

#### Users
```
super-admin-users.html
├─ User list table
├─ Search and filters
└─ Actions: Add user, Edit, Delete

super-admin-user-edit.html
├─ User details form
├─ Permissions matrix
└─ Feature access (Appraisals, Evaluations, COMPS)
```

#### Clients
```
super-admin-clients.html
└─ Client management interface
```

#### Accounts
```
super-admin-accounts.html
├─ Account list
└─ Actions: View, Edit, Manage features

super-admin-account-manage.html
├─ Account details
├─ Feature toggles (Appraisals, Evaluations)
└─ User management

super-admin-account-amenities.html
└─ Account-specific amenities configuration

super-admin-account-report-templates.html
└─ Legacy template management (to be replaced)
```

#### Reports
```
super-admin-reports.html
└─ System-wide reports and analytics
```

#### Support
```
super-admin-support-tickets.html
├─ Ticket list
└─ Actions: View, Create, Close

super-admin-support-create-ticket.html
└─ Ticket creation form

super-admin-support-ticket-detail.html
└─ Ticket details and conversation
```

#### Audit Logs
```
super-admin-audit-logs.html
├─ System-wide audit trail
└─ Filters: User, Action, Date range
```

#### Settings
```
super-admin-settings.html
├─ General settings
├─ Billing settings
├─ Amenities configuration
└─ White label settings

super-admin-settings-billing.html
super-admin-settings-amenities.html
super-admin-settings-white-label.html
```

---

## ACCOUNT ADMIN (prototypes/AccountAdmin/)

### Core Features Navigation

#### COMPS Tab
```
../comps-premium-with-clustering.html (shared)
└─ Same as Super Admin but filtered to account data
```

#### APPRAISAL Tab
```
account-admin-appraisals-list.html (DEFAULT VIEW)
├─ Property Tabs: Commercial | Residential | Land
├─ Header Actions:
│   ├─ [View Templates] → account-admin-appraisal-templates.html
│   └─ [New Appraisal] → appraisal-wizard.html
├─ Data: Filtered to this account only
└─ Table: Property, Type, Client, Status, Value, Actions

account-admin-appraisal-templates.html
├─ Breadcrumb: ← Back to Appraisals
├─ Header Actions:
│   └─ [Create Custom Template] → account-admin-template-builder.html?type=appraisal
├─ TWO TABS:
│   ├─ TAB 1: Harken Templates
│   │   ├─ Info: "Enable the ones you want your team to use"
│   │   ├─ Template Cards with Enable/Disable toggle
│   │   ├─ Shows: Enabled, Disabled, Customized status
│   │   ├─ Actions: Preview, Clone & Customize
│   │   └─ Customized templates show "Customized" badge
│   │
│   └─ TAB 2: My Custom Templates
│       ├─ Info: "Templates created by your account"
│       ├─ Template Cards with Enable/Disable toggle
│       ├─ Shows account-created templates only
│       ├─ Actions: Edit, Duplicate, Delete
│       └─ Empty state: Create New Template card
└─ Permissions: Can enable/disable Harken templates, create account templates

account-admin-template-builder.html?type=appraisal
├─ Same structure as super-admin-template-builder.html
├─ Differences:
│   ├─ Cannot edit system templates (read-only preview)
│   ├─ Can create account-scoped templates
│   └─ Templates saved with account_id
└─ Returns to: account-admin-appraisal-templates.html
```

#### EVALUATION Tab
```
account-admin-evaluations-list.html (DEFAULT VIEW)
├─ Property Tabs: Commercial | Residential | Land
├─ Header Actions:
│   ├─ [View Templates] → account-admin-evaluation-templates.html
│   └─ [New Evaluation] → evaluation-wizard-full.html
├─ Data: Filtered to this account only
└─ Table: Property, Type, Client, Status, Approaches, Value, Actions

account-admin-evaluation-templates.html
├─ Breadcrumb: ← Back to Evaluations
├─ TWO TABS:
│   ├─ TAB 1: Harken Templates
│   │   └─ Same as appraisal templates (enable/disable/clone)
│   └─ TAB 2: My Custom Templates
│       └─ Account-specific evaluation templates
└─ Actions per template based on type

account-admin-template-builder.html?type=evaluation
└─ Same as appraisal builder but with evaluation-specific sections
```

### Management Features

#### Dashboard
```
account-admin-dashboard.html
└─ Account-level metrics and activity
```

#### Users
```
account-admin-users.html
├─ Users in this account only
└─ Permissions: Can add/edit users in own account
```

#### Clients
```
account-admin-clients.html
├─ Clients for this account
└─ Full client management
```

#### Reports
```
account-admin-reports.html
└─ Account-level reports
```

#### Support
```
account-admin-support.html
└─ Support tickets for this account
```

#### Settings
```
account-admin-settings.html
├─ Account settings
├─ Billing information
├─ Feature configuration
└─ Template preferences
```

---

## ACCOUNT USER (prototypes/AccountUser/)

### Core Features Navigation

#### COMPS Tab
```
../comps-premium-with-clustering.html (shared)
└─ Filtered to user's data
```

#### APPRAISAL Tab
```
account-user-appraisals-list.html (DEFAULT VIEW)
├─ Property Tabs: Commercial | Residential | Land
├─ Header Actions:
│   ├─ [View Templates] → account-user-appraisal-templates.html
│   └─ [New Appraisal] → appraisal-wizard.html
├─ Data: User's own appraisals only
└─ Table: Property, Type, Client, Status, Value, Actions

account-user-appraisal-templates.html
├─ Breadcrumb: ← Back to Appraisals
├─ Header Actions:
│   └─ [Create Personal Template] → account-user-template-builder.html?type=appraisal
├─ THREE TABS:
│   ├─ TAB 1: Available Templates
│   │   ├─ Info: "Templates from Harken and your account admin"
│   │   ├─ Read-only view (no enable/disable)
│   │   ├─ Shows: System templates + Account templates (if enabled)
│   │   └─ Actions: Preview, Clone to Personal
│   │
│   ├─ TAB 2: My Personal Templates
│   │   ├─ Info: "Templates only visible to you"
│   │   ├─ User's personal templates
│   │   ├─ Actions: Edit, Duplicate, Delete
│   │   └─ Empty state: Create Personal Template card
│   │
│   └─ TAB 3: Shared Templates (FUTURE FEATURE)
│       ├─ Info: "Templates shared by team members"
│       └─ Empty state: "Template sharing coming soon"
└─ Permissions: View enabled templates, manage own personal templates

account-user-template-builder.html?type=appraisal
├─ Same structure as other builders
├─ Differences:
│   ├─ Can only edit personal templates
│   ├─ Can clone available templates to personal
│   └─ Templates saved with account_id AND user_id
└─ Returns to: account-user-appraisal-templates.html
```

#### EVALUATION Tab
```
account-user-evaluations-list.html (DEFAULT VIEW)
├─ Property Tabs: Commercial | Residential | Land
├─ Header Actions:
│   ├─ [View Templates] → account-user-evaluation-templates.html
│   └─ [New Evaluation] → evaluation-wizard-full.html
└─ Data: User's own evaluations only

account-user-evaluation-templates.html
├─ THREE TABS:
│   ├─ Available Templates (read-only)
│   ├─ My Personal Templates (full CRUD)
│   └─ Shared Templates (future)
└─ Same structure as appraisal templates

account-user-template-builder.html?type=evaluation
└─ Same as appraisal builder with evaluation sections
```

### User Management

#### Dashboard
```
account-user-dashboard.html
└─ Personal metrics and activity
```

#### My Profile
```
account-user-profile.html
├─ User information
├─ Credentials and certifications
└─ Notification preferences
```

#### Settings
```
account-user-settings.html
├─ Personal preferences
├─ Theme settings
└─ Workflow customization
```

---

## SHARED PAGES (All User Types)

### Evaluation Wizard
```
evaluation-wizard-full.html (../evaluation-wizard-full.html)
├─ Step 1: Template Selection
│   ├─ Property Type: Commercial | Residential | Land
│   ├─ Template Dropdown (filtered by property type and user access)
│   └─ Template Preview
├─ Step 2: Setup
│   ├─ Client Selection
│   ├─ Scenario Configuration (if multi-scenario template)
│   └─ Approach Selection (per scenario)
├─ Step 3: Overview
│   ├─ Property Details
│   ├─ Specifications
│   ├─ Analysis
│   ├─ Images & Maps
│   └─ Per scenario if multi-scenario
├─ Step 4: Exhibits
└─ Step 5: Review
```

---

## PAGE RELATIONSHIP DIAGRAM

```
SUPER ADMIN FLOW:
=================
Dashboard
    │
    ├─ COMPS ──────────→ comps-premium-with-clustering.html
    │
    ├─ APPRAISAL ──────→ super-admin-appraisals-list.html
    │                       │
    │                       ├─ [View Templates] → super-admin-appraisal-templates.html
    │                       │                           │
    │                       │                           └─ [Create/Edit] → super-admin-template-builder.html?type=appraisal
    │                       │
    │                       └─ [New Appraisal] → appraisal-wizard.html
    │
    ├─ EVALUATION ─────→ super-admin-evaluations-list.html
    │                       │
    │                       ├─ [View Templates] → super-admin-evaluation-templates.html
    │                       │                           │
    │                       │                           └─ [Create/Edit] → super-admin-template-builder.html?type=evaluation
    │                       │
    │                       └─ [New Evaluation] → evaluation-wizard-full.html
    │
    ├─ Users ──────────→ super-admin-users.html → super-admin-user-edit.html
    ├─ Clients ────────→ super-admin-clients.html
    ├─ Accounts ───────→ super-admin-accounts.html → super-admin-account-manage.html
    ├─ Reports ────────→ super-admin-reports.html
    ├─ Support ────────→ super-admin-support-tickets.html
    ├─ Audit Logs ─────→ super-admin-audit-logs.html
    └─ Settings ───────→ super-admin-settings.html


ACCOUNT ADMIN FLOW:
===================
Dashboard (account-admin-dashboard.html)
    │
    ├─ COMPS ──────────→ ../comps-premium-with-clustering.html
    │
    ├─ APPRAISAL ──────→ account-admin-appraisals-list.html
    │                       │
    │                       ├─ [View Templates] → account-admin-appraisal-templates.html
    │                       │                           │
    │                       │                           ├─ Tab 1: Harken Templates
    │                       │                           │   ├─ Enable/Disable toggle
    │                       │                           │   └─ [Clone & Customize] → account-admin-template-builder.html
    │                       │                           │
    │                       │                           ├─ Tab 2: My Custom Templates
    │                       │                           │   └─ [Create/Edit] → account-admin-template-builder.html?type=appraisal
    │                       │
    │                       └─ [New Appraisal] → appraisal-wizard.html
    │
    ├─ EVALUATION ─────→ account-admin-evaluations-list.html
    │                       │
    │                       ├─ [View Templates] → account-admin-evaluation-templates.html
    │                       │                           ├─ Tab 1: Harken Templates
    │                       │                           └─ Tab 2: My Custom Templates
    │                       │
    │                       └─ [New Evaluation] → evaluation-wizard-full.html
    │
    ├─ Users ──────────→ account-admin-users.html (manage account users)
    ├─ Clients ────────→ account-admin-clients.html
    ├─ Reports ────────→ account-admin-reports.html
    ├─ Support ────────→ account-admin-support.html
    └─ Settings ───────→ account-admin-settings.html


ACCOUNT USER FLOW:
==================
Dashboard (account-user-dashboard.html)
    │
    ├─ COMPS ──────────→ ../comps-premium-with-clustering.html
    │
    ├─ APPRAISAL ──────→ account-user-appraisals-list.html
    │                       │
    │                       ├─ [View Templates] → account-user-appraisal-templates.html
    │                       │                           │
    │                       │                           ├─ Tab 1: Available Templates (read-only)
    │                       │                           │   └─ [Clone to Personal] → account-user-template-builder.html
    │                       │                           │
    │                       │                           ├─ Tab 2: My Personal Templates
    │                       │                           │   └─ [Create/Edit] → account-user-template-builder.html?type=appraisal
    │                       │                           │
    │                       │                           └─ Tab 3: Shared Templates (future)
    │                       │
    │                       └─ [New Appraisal] → appraisal-wizard.html
    │
    ├─ EVALUATION ─────→ account-user-evaluations-list.html
    │                       │
    │                       ├─ [View Templates] → account-user-evaluation-templates.html
    │                       │                           ├─ Tab 1: Available Templates
    │                       │                           ├─ Tab 2: My Personal Templates
    │                       │                           └─ Tab 3: Shared Templates
    │                       │
    │                       └─ [New Evaluation] → evaluation-wizard-full.html
    │
    ├─ My Profile ─────→ account-user-profile.html
    └─ Settings ───────→ account-user-settings.html
```

---

## TEMPLATE BUILDER URL PARAMETERS

### All Builders (Universal)
```
?type=appraisal                   - Creating appraisal template
?type=evaluation                  - Creating evaluation template
?property=commercial              - For commercial properties
?property=residential             - For residential properties
?property=land                    - For land properties
?template_id=123                  - Editing existing template
?clone_from=456                   - Cloning from another template
```

### Examples:
```
New commercial appraisal template:
super-admin-template-builder.html?type=appraisal&property=commercial

Edit existing evaluation template:
super-admin-template-builder.html?type=evaluation&template_id=45

Clone Harken template to account:
account-admin-template-builder.html?type=appraisal&clone_from=12

Create personal evaluation template:
account-user-template-builder.html?type=evaluation&property=residential
```

---

## FILE INVENTORY

### SuperAdmin/ (20 files)
- super-admin-dashboard.html
- super-admin-appraisals-list.html ✓ UPDATED
- super-admin-evaluations-list.html ✓ UPDATED
- super-admin-appraisal-templates.html ✓ NEW
- super-admin-evaluation-templates.html ✓ NEW
- super-admin-template-builder.html ✓ NEW
- super-admin-users.html
- super-admin-user-edit.html
- super-admin-clients.html
- super-admin-accounts.html
- super-admin-account-manage.html
- super-admin-account-amenities.html
- super-admin-account-report-templates.html
- super-admin-reports.html
- super-admin-support-tickets.html
- super-admin-support-create-ticket.html
- super-admin-support-ticket-detail.html
- super-admin-audit-logs.html
- super-admin-settings.html
- (+ others)

### AccountAdmin/ (8 files minimum)
- account-admin-dashboard.html
- account-admin-appraisals-list.html
- account-admin-evaluations-list.html
- account-admin-appraisal-templates.html ✓ NEW
- account-admin-evaluation-templates.html
- account-admin-template-builder.html
- account-admin-users.html
- account-admin-settings.html

### AccountUser/ (6 files minimum)
- account-user-dashboard.html
- account-user-appraisals-list.html
- account-user-evaluations-list.html
- account-user-appraisal-templates.html ✓ NEW
- account-user-evaluation-templates.html
- account-user-template-builder.html

### Shared Files
- ../comps-premium-with-clustering.html
- ../evaluation-wizard-full.html
- ../appraisal-wizard.html (future)

---

## NAVIGATION STATE TRACKING

### Property Type Tabs Visibility Rules:

**SHOW property tabs on:**
- COMPS pages
- APPRAISAL list pages
- EVALUATION list pages
- Template list pages
- Wizard pages

**HIDE property tabs on:**
- Dashboard
- Users
- Clients
- Accounts
- Reports
- Support
- Audit Logs
- Settings
- Template Builder (has own property type selector)

---

## TEMPLATE ACCESS CONTROL

### Who Can See Which Templates?

#### Harken Super Admin:
- All system templates (can edit)
- All account templates (read-only view)
- All personal templates (read-only view)

#### Account Admin:
- All system templates (can enable/disable, clone)
- Own account templates (full CRUD)
- Account users' personal templates (read-only view)

#### Account User:
- System templates (if enabled by Harken and Account Admin)
- Account templates (if enabled by Account Admin)
- Own personal templates (full CRUD)
- Other users' personal templates (NOT visible)

---

## WIZARD TEMPLATE FILTERING

When user starts new appraisal/evaluation in wizard:

**Step 1:** Select property type (Commercial, Residential, Land)

**Step 2:** Template dropdown shows:

```javascript
// Pseudo-code for template filtering
const availableTemplates = templates.filter(template => {
  return (
    template.property_type === selectedPropertyType &&
    template.report_type === currentReportType &&
    (
      // System templates enabled by both Harken and Account Admin
      (template.tier === 'system' && template.enabled_for_account) ||
      
      // Account templates enabled by Account Admin
      (template.tier === 'account' && template.account_id === userAccountId && template.is_enabled) ||
      
      // User's own personal templates
      (template.tier === 'personal' && template.user_id === currentUserId)
    )
  );
});

// Group templates in dropdown
return {
  personal: availableTemplates.filter(t => t.tier === 'personal'),
  account: availableTemplates.filter(t => t.tier === 'account'),
  system: availableTemplates.filter(t => t.tier === 'system')
};
```

This ensures users only see templates they have permission to use.

