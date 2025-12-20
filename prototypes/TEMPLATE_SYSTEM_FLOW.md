# Template System Flow Documentation

## Overview

The Harken CRE template system implements a three-tier architecture for managing appraisal and evaluation report templates across different user permission levels.

## Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              TIER 1: HARKEN SUPER ADMIN                      │
│  • Creates master system templates for all accounts          │
│  • Templates for: Appraisals, Evaluations                   │
│  • Property types: Commercial, Residential, Land             │
│  • These are "seed" templates available system-wide          │
└─────────────────────────────────────────────────────────────┘
                            ↓
            Templates stored with account_id = NULL
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TIER 2: ACCOUNT ADMIN                           │
│  Template Management Options:                                │
│  1. Enable/Disable Harken templates for their account        │
│  2. Clone & Customize Harken templates                       │
│  3. Create custom account templates from scratch             │
│  4. Manage which templates users can see                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
    Templates filtered by account_template_permissions
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TIER 3: ACCOUNT USER                            │
│  Template Management Options:                                │
│  1. View enabled Harken templates (read-only)                │
│  2. View enabled Account templates (read-only)               │
│  3. Create personal templates (only visible to self)         │
│  4. Clone any available template to create personal version  │
└─────────────────────────────────────────────────────────────┘
```

## User Flows

### Flow 1: Super Admin Creates System Template

**Steps:**
1. Navigate to: APPRAISAL or EVALUATION tab
2. Click "View Templates" button
3. Click "+ Create New Template"
4. Template Builder opens with URL parameter `?type=appraisal` or `?type=evaluation`
5. **Configure Template:**
   - Set template name and description
   - Select property type (Commercial, Residential, or Land)
   - Select available approaches (filtered by property type)
   - Configure scenarios (Single, Dual, Triple, or Custom)
   - Enable/disable report sections
   - Configure merge fields and section properties
6. Preview template in real-time
7. Click "Save Template"
8. Template saved with `account_id = NULL` (system template)
9. Template appears in all Account Admin "Harken Templates" tabs

**Database Impact:**
```sql
INSERT INTO templates (
  name, description, report_type, property_type,
  template_tier, account_id, user_id,
  is_enabled, available_approaches, scenario_config, sections_config
) VALUES (
  'Commercial Appraisal - USPAP',
  'Full USPAP-compliant commercial appraisal',
  'appraisal', 'commercial',
  'system', NULL, NULL,
  TRUE, '["income","sales","cost"]', '{"preset":"single"}', '{...}'
);
```

---

### Flow 2: Account Admin Enables Harken Template

**Steps:**
1. Navigate to: APPRAISAL > View Templates
2. Switch to "Harken Templates" tab
3. See list of all system templates
4. Toggle ON a disabled template (e.g., "Multi-Family Appraisal")
5. Template becomes enabled for all users in this account

**Database Impact:**
```sql
INSERT INTO account_template_permissions (
  account_id, template_id, is_enabled, is_customized
) VALUES (
  123, 5, TRUE, FALSE
);
```

**Result:**
- Template now appears in Account User's "Available Templates" tab
- Users in this account can select it when creating new appraisals

---

### Flow 3: Account Admin Customizes Harken Template

**Steps:**
1. Navigate to: APPRAISAL > View Templates
2. Switch to "Harken Templates" tab
3. Click "Clone & Customize" on a template
4. Template Builder opens in clone mode
5. Make modifications:
   - Rename template (e.g., "Smith & Associates Commercial USPAP")
   - Add custom sections (e.g., "Firm Disclaimer")
   - Add firm logo merge field
   - Modify section order
6. Save as account-specific template
7. Original Harken template remains unchanged

**Database Impact:**
```sql
-- Create cloned template
INSERT INTO templates (
  name, description, report_type, property_type,
  template_tier, account_id, user_id,
  is_enabled, available_approaches, scenario_config, sections_config
) VALUES (
  'Smith & Associates Commercial USPAP',
  'Customized version of Harken template',
  'appraisal', 'commercial',
  'account', 123, NULL,
  TRUE, '["income","sales","cost"]', '{...}', '{...}'
);

-- Link to original
UPDATE account_template_permissions
SET is_customized = TRUE, custom_template_id = 456
WHERE account_id = 123 AND template_id = 1;
```

**Result:**
- Customized template shown in "Harken Templates" tab with "Customized" badge
- Users see customized version instead of original
- Can revert to original Harken template anytime

---

### Flow 4: Account Admin Creates Custom Template

**Steps:**
1. Navigate to: APPRAISAL > View Templates
2. Switch to "My Custom Templates" tab
3. Click "+ Create Custom Template" (or click empty state card)
4. Template Builder opens
5. Build template from scratch:
   - Select property type
   - Configure approaches
   - Build section structure
   - Add custom sections unique to firm
6. Save template
7. Enable/disable for users via toggle

**Database Impact:**
```sql
INSERT INTO templates (
  name, description, report_type, property_type,
  template_tier, account_id, user_id,
  is_enabled, available_approaches, scenario_config
) VALUES (
  'Smith & Associates Land Development',
  'Custom land development analysis template',
  'evaluation', 'land',
  'account', 123, NULL,
  TRUE, '["sales","cost"]', '{"preset":"dual"}'
);
```

---

### Flow 5: Account User Creates Personal Template

**Steps:**
1. Navigate to: APPRAISAL > View Templates
2. Switch to "My Personal Templates" tab
3. Click "+ Create Personal Template"
4. Template Builder opens
5. Build template customized to personal workflow
6. Save template (only visible to this user)

**Database Impact:**
```sql
INSERT INTO templates (
  name, description, report_type, property_type,
  template_tier, account_id, user_id,
  is_enabled, available_approaches
) VALUES (
  'My Quick Commercial Evaluation',
  'Streamlined template for quick turnarounds',
  'evaluation', 'commercial',
  'personal', 123, 789,
  TRUE, '["income","sales"]'
);
```

---

### Flow 6: User Creates New Evaluation with Template

**Complete Workflow:**

#### Step 1: Start New Evaluation
1. Click EVALUATION tab
2. Click "+ New Evaluation" button
3. Evaluation Wizard opens

#### Step 2: Select Property Type
```html
[Commercial] [Residential] [Land]
```
User selects: **Commercial**

#### Step 3: Select Template
Dropdown shows (filtered by property type = commercial):

```
Personal Templates
├─ My Quick Commercial Evaluation

Account Templates  
├─ Smith & Associates Commercial Standard

Harken Templates
├─ Commercial Evaluation - Standard
└─ Commercial As-Is/As-Completed
```

User selects: **Commercial As-Is/As-Completed**

**Template Preview Shows:**
- Property Type: Commercial
- Scenarios: As-Is + As-Completed (Dual)
- Approaches: Income, Sales, Cost, Cap
- Sections: 20 sections

#### Step 4: Scenario Configuration
Template has dual scenario preset, wizard shows:

```
Scenario 1: As-Is
└─ Current condition valuation

Scenario 2: As-Completed
├─ After planned improvements
└─ [✓] Copy data from As-Is scenario
```

#### Step 5: Select Approaches (Per Scenario)
```
Scenario 1: As-Is - Select Approaches
[✓] Income Approach
[✓] Sales Comparison Approach
[ ] Cost Approach
[✓] Direct Capitalization

Scenario 2: As-Completed - Select Approaches
[✓] Income Approach
[✓] Sales Comparison Approach
[✓] Cost Approach (to show improvement value)
[✓] Direct Capitalization
```

#### Step 6-9: Fill Out Property Details, Approaches, Exhibits, Review
- Property details filled once (shared by both scenarios)
- When filling Scenario 1 Income Approach, data saved
- When navigating to Scenario 2 Income Approach:
  - All fields pre-filled from Scenario 1
  - User can edit any field (e.g., higher rent after improvements)
  - Changes don't affect Scenario 1

#### Step 10: Generate Report
- Report includes both scenarios
- Automatic comparison table showing:
  - As-Is Value: $1,250,000
  - As-Completed Value: $1,850,000
  - Value Increase: $600,000 (48%)
  - Improvement Cost: $450,000
  - ROI: 133%

---

## Property Type Filtering

### Commercial/Land Templates
**Available Approaches:**
- Income Approach
- Sales Comparison Approach
- Cost Approach
- Lease Approach
- Direct Capitalization (Cap) Approach
- Multi-Family Approach
- Rent Roll Approach

**Use Cases:**
- Office buildings, retail centers, industrial
- Multi-family (5+ units)
- Hotels, special-purpose properties
- Raw land, development sites

### Residential Templates
**Available Approaches:**
- Income Approach
- Sales Comparison Approach
- Cost Approach

**Restricted Approaches:**
- No Lease Approach
- No Cap Approach
- No Multi-Family Approach
- No Rent Roll Approach

**Use Cases:**
- Single-family homes
- Duplexes, triplexes, fourplexes (2-4 units)
- Residential investment properties

---

## Scenario Types and Use Cases

### As-Is
- **Definition:** Current condition, no assumptions
- **Use Case:** Standard evaluations, baseline valuations
- **Example:** Existing commercial building being sold

### As-Completed
- **Definition:** After planned construction/improvements
- **Use Case:** Development projects, major renovations
- **Example:** Office building after planned tenant improvements
- **Requires:** Hypothetical conditions statement, completion date

### As-Stabilized
- **Definition:** After completion and reaching stabilized occupancy
- **Use Case:** New construction, major repositioning
- **Example:** New apartment complex at 90% occupancy for 90 days
- **Requires:** Completion date, stabilization assumptions

### As-Renovated
- **Definition:** After completing specific improvements
- **Use Case:** Value-add projects, property repositioning
- **Example:** Shopping center after facade renovation

### Prospective
- **Definition:** Future value at specified date
- **Use Case:** Long-term investment analysis
- **Example:** Property value projected 5 years from now

### Retrospective
- **Definition:** Past value at historical date
- **Use Case:** Legal disputes, tax appeals
- **Example:** Property value as of January 1, 2020

### Hypothetical
- **Definition:** Based on conditions contrary to fact
- **Use Case:** Feasibility studies, development analysis
- **Example:** Value assuming different zoning

### Proposed
- **Definition:** Planned development not yet started
- **Use Case:** Pre-construction financing
- **Example:** Value of proposed shopping center on vacant land

### Under Construction
- **Definition:** Value during construction phase
- **Use Case:** Construction loans, interim financing
- **Example:** Office building 60% complete

---

## Data Inheritance

### How It Works:

When template configured with multiple scenarios and "Enable Data Inheritance" is checked:

1. **User fills Scenario 1 (As-Is):**
   - Property details: 123 Main St, 25,000 SF, built 2015
   - Income Approach: Current rent $20/SF, NOI $350,000
   - Sales comps: 5 comparables selected
   - Adjustments: Location +5%, Condition -3%

2. **User navigates to Scenario 2 (As-Completed):**
   - Property details: AUTO-COPIED (same building)
   - Income Approach: PRE-FILLED with As-Is data
     - User edits: Rent changes to $28/SF (after improvements)
     - User edits: NOI changes to $520,000
   - Sales comps: AUTO-COPIED (same 5 comps)
   - Adjustments: PRE-FILLED (user can modify)

3. **Report Generation:**
   - Scenario 1 shows original values
   - Scenario 2 shows edited values
   - Comparison table auto-generated

### What Gets Inherited:
- Property address, parcel ID, legal description
- Building size, year built (if not changing)
- Selected comparables
- Subject property adjustments (editable)
- Operating expenses (editable for changes)

### What Doesn't Get Inherited:
- Scenario-specific effective dates
- Hypothetical conditions statements
- Scenario-specific conclusions
- Weighted market values

---

## Template Builder Components

### Left Panel: Sections Tree
**Purpose:** Manage which sections appear in the report

**Functionality:**
- Checkboxes: Enable/disable sections
- Expand/Collapse: View subsections and merge fields
- Drag handles: Reorder sections
- Active state: Click to configure in Properties panel

**Sections Hierarchy:**
```
[✓] Cover Page
    ├─ [✓] Property Photo
    ├─ [✓] Property Address
    ├─ [✓] File Number
    └─ [✓] Company Logo
[✓] Executive Summary
    ├─ [✓] Property Overview
    ├─ [✓] Key Metrics
    └─ [✓] Value Conclusion
[✓] Property Details
[✓] Market Analysis
[✓] Highest and Best Use
[✓] Valuation Approaches
[ ] Scenario Comparison (only if multi-scenario)
[✓] Certification
[ ] Addenda
```

### Center Panel: Live Preview
**Purpose:** Real-time preview of report layout

**Features:**
- 8.5" x 11" page rendering
- Sample data population
- Multiple page view
- Zoom controls (Fit, 75%, 100%)
- Reflects section enable/disable immediately

### Right Panel: Properties
**Four Tabs:**

#### Tab 1: Template Settings
- Template name
- Description
- Report type (Appraisal/Evaluation) - locked after save
- Property type (Commercial/Residential/Land) - locked after save
- System template access toggle

#### Tab 2: Approach Configuration
- Filtered checkboxes based on property type
- Commercial/Land: 7 approaches
- Residential: 3 approaches only
- Approach weighting options

#### Tab 3: Scenario Configuration
- Preset selector cards: Single, Dual, Triple, Custom
- Custom scenario builder (when Custom selected)
- Data inheritance toggle
- Hypothetical conditions requirement
- Completion date requirement
- Scenario comparison table settings

#### Tab 4: Section Properties
- Active when section clicked in tree
- Section title editing
- Section description
- Visibility rules (always, conditional)
- Available merge fields list

---

## Template Selection in Wizard

### Evaluation Wizard - Step 1

**Property Type Selection:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Commercial   │  │ Residential  │  │    Land      │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Template Dropdown (after property type selected):**
```html
<select>
  <optgroup label="Personal Templates">
    <option>My Quick Commercial Template</option>
  </optgroup>
  <optgroup label="Smith & Associates Templates">
    <option>Smith & Associates Commercial Standard</option>
    <option>Smith & Associates As-Is/As-Completed</option>
  </optgroup>
  <optgroup label="Harken Templates">
    <option>Commercial Evaluation - Standard</option>
    <option>Commercial As-Is/As-Completed</option>
    <option>Multi-Family Evaluation</option>
  </optgroup>
</select>
```

**Template Preview:**
Shows selected template metadata:
- Property Type
- Report Type
- Scenario Structure
- Available Approaches
- Number of Sections

---

## Navigation Differences by Role

### Super Admin Navigation
```
[Logo] COMPS | APPRAISAL | EVALUATION | Dashboard | Users | Clients | Accounts | Reports | Support | Audit Logs | Settings
```

**Access:**
- All accounts (global view)
- All templates (create/edit system templates)
- Full audit trail

### Account Admin Navigation
```
[Logo] COMPS | APPRAISAL | EVALUATION | Dashboard | Users | Clients | Reports | Support | Settings
```

**Removed:**
- "Accounts" (can only manage own account in Settings)
- "Audit Logs" (system-level only)

**Access:**
- Own account data only
- Can manage Harken templates (enable/disable, clone)
- Can create account templates

### Account User Navigation
```
[Logo] COMPS | APPRAISAL | EVALUATION | Dashboard | My Profile | Settings
```

**Removed:**
- "Users" (no user management)
- "Clients" (simplified workflow)
- "Accounts", "Reports", "Support", "Audit Logs"

**Access:**
- Own data only
- Can use enabled templates
- Can create personal templates

---

## Template Availability Matrix

| Template Type | Super Admin | Account Admin | Account User |
|---------------|-------------|---------------|--------------|
| System Templates | Create, Edit, Delete | View, Enable/Disable, Clone | View (if enabled) |
| Account Templates | View All | Create, Edit, Delete (own) | View (if enabled) |
| Personal Templates | View All | View All (in account) | Create, Edit, Delete (own) |

---

## API Endpoints Required

### Template Management
```
GET    /api/templates                    - List templates (filtered by role)
GET    /api/templates/:id                - Get template by ID
POST   /api/templates                    - Create new template
PATCH  /api/templates/:id                - Update template
DELETE /api/templates/:id                - Delete template
POST   /api/templates/:id/clone          - Clone template
```

### Template Permissions
```
GET    /api/accounts/:id/templates       - Get account's template permissions
POST   /api/accounts/:id/templates/enable   - Enable Harken template
POST   /api/accounts/:id/templates/disable  - Disable template
```

### Wizard Integration
```
GET    /api/templates/available?type=evaluation&property=commercial
       - Returns templates accessible to current user for specific type/property
```

---

## File Organization

### Super Admin
- **Lists:** super-admin-appraisals-list.html, super-admin-evaluations-list.html
- **Templates:** super-admin-appraisal-templates.html, super-admin-evaluation-templates.html
- **Builder:** super-admin-template-builder.html (universal, URL param driven)

### Account Admin
- **Lists:** account-admin-appraisals-list.html, account-admin-evaluations-list.html
- **Templates:** account-admin-appraisal-templates.html (2 tabs), account-admin-evaluation-templates.html (2 tabs)
- **Builder:** account-admin-template-builder.html (universal)

### Account User
- **Lists:** account-user-appraisals-list.html, account-user-evaluations-list.html
- **Templates:** account-user-appraisal-templates.html (3 tabs), account-user-evaluation-templates.html (3 tabs)
- **Builder:** account-user-template-builder.html (universal)

---

## Key Design Decisions

1. **Universal Builder:** One template builder page serves all report types and property types, driven by URL parameters
2. **No Emojis:** Clean professional design using Material Icons only
3. **Consistent Styling:** All three user types share same visual language (teal/blue theme)
4. **Progressive Disclosure:** Templates show more/less detail based on user's permission level
5. **Context-Aware Navigation:** "View Templates" button in list views, not separate top-level nav item

---

## Future Enhancements

- Template versioning and change history
- Template sharing between users
- Template marketplace (share templates between accounts)
- Template analytics (which templates perform best)
- Template validation (ensure USPAP compliance)
- Template import/export (JSON format)

