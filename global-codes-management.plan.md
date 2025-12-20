# Global Codes Management System

## Overview

Create a two-tier global codes management system where Super Admins manage system-wide codes (used by all accounts) and Account Admins can create custom codes for their specific account. The system manages 40+ categories of standardized dropdown values used throughout the platform (property types, sale statuses, lease types, adjustment options, etc.).

**HYBRID APPROACH**: Combines module visibility flags (Appraisals/Evaluations/Comps) with property type scoping (Commercial/Residential/Land) for maximum flexibility.

## Architecture

### Two-Tier Permission System

1. **Super Admin Level** (`prototypes/SuperAdmin/super-admin-settings-global-codes.html`)
   - Manage system-wide codes that all accounts inherit
   - Create/edit/delete global code categories
   - Create/edit/delete codes within categories
   - Manage parent-child hierarchies (e.g., Office → Medical Office Condo)
   - Set module visibility flags (appraisal_default, evaluation_default, comps_default)
   - Set property type scope flags (commercial_applicable, residential_applicable, land_applicable)
   - Cannot delete codes that are in use by accounts

2. **Account Admin Level** (future: `super-admin-account-global-codes.html`)
   - View all system-wide codes (read-only)
   - Create custom codes for their account only
   - Custom codes only visible to their account
   - Cannot modify system-wide codes

### Database Structure

**Existing tables** (already created):
- `global_code_categories` - 40+ categories (property_types, sale_status, approaches, etc.)
- `global_codes` - Individual codes within categories
  - `parent_id` for hierarchy support
  - `appraisal_default`, `evaluation_default`, `comps_default` module visibility flags
  - `status` for active/inactive

**NEW: Property Type Scoping (Hybrid Approach)**

Migration needed to add property type scope flags:

```sql
-- Add property type applicability flags to codes
ALTER TABLE global_codes 
  ADD COLUMN commercial_applicable TINYINT(1) DEFAULT 1 COMMENT 'Applies to commercial properties (Office, Retail, Industrial)',
  ADD COLUMN residential_applicable TINYINT(1) DEFAULT 1 COMMENT 'Applies to residential properties (res_comps, res_evaluations)',
  ADD COLUMN land_applicable TINYINT(1) DEFAULT 1 COMMENT 'Applies to land-only properties (active_type: land_only)';

-- Add to categories for category-level defaults
ALTER TABLE global_code_categories 
  ADD COLUMN commercial_applicable TINYINT(1) DEFAULT 1,
  ADD COLUMN residential_applicable TINYINT(1) DEFAULT 1,
  ADD COLUMN land_applicable TINYINT(1) DEFAULT 1;

-- Set appropriate defaults based on existing data
UPDATE global_codes gc
JOIN global_code_categories gcc ON gc.global_code_category_id = gcc.id
SET 
  gc.commercial_applicable = CASE 
    WHEN gcc.type IN ('property_types', 'sales_comp_quantitative_adjustments') THEN 1
    WHEN gcc.type IN ('res_evaluation_types', 'sales_res_comp_quantitative_adjustments') THEN 0
    WHEN gc.code IN ('bedrooms', 'bathrooms', 'garage', 'basement') THEN 0
    ELSE 1
  END,
  gc.residential_applicable = CASE
    WHEN gcc.type IN ('res_evaluation_types', 'sales_res_comp_quantitative_adjustments') THEN 1
    WHEN gcc.type = 'property_types' AND gc.code = 'residential' THEN 1
    WHEN gc.code IN ('bedrooms', 'bathrooms', 'garage') THEN 1
    ELSE 1
  END,
  gc.land_applicable = CASE
    WHEN gcc.type = 'land_type' THEN 1
    WHEN gc.code IN ('bedrooms', 'bathrooms', 'garage', 'basement') THEN 0
    ELSE 1
  END;
```

**Property Type Context**:
- **Commercial**: `building_with_land` properties using `comps`, `appraisals`, `evaluations` tables
  - Property types: Office, Retail, Industrial, Multi-Family, Hospitality, Special Purpose
  - Has building_size > 0
- **Residential**: Separate tables `res_comps`, `res_evaluations` (no appraisals)
  - Residential-specific fields: bedrooms, bathrooms, garage, stories
  - Property types: Single-family, Townhome, Condo, etc.
- **Land**: Same tables as commercial but `active_type: 'land_only'`, `building_size: 0`
  - Property types: Agricultural, Development, Recreational, etc.
  - No building-specific fields

**Future table** for account-specific codes:
```sql
CREATE TABLE account_global_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  global_code_category_id INT NOT NULL,
  code VARCHAR(50),
  name VARCHAR(100),
  parent_id INT,
  -- Module visibility
  appraisal_default TINYINT(1) DEFAULT 1,
  evaluation_default TINYINT(1) DEFAULT 1,
  comps_default TINYINT(1) DEFAULT 1,
  -- Property type scope
  commercial_applicable TINYINT(1) DEFAULT 1,
  residential_applicable TINYINT(1) DEFAULT 1,
  land_applicable TINYINT(1) DEFAULT 1,
  status TINYINT DEFAULT 1,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (global_code_category_id) REFERENCES global_code_categories(id),
  FOREIGN KEY (parent_id) REFERENCES account_global_codes(id)
);
```

## Implementation Plan

### Phase 1: Prototype HTML Page

**File**: `prototypes/SuperAdmin/super-admin-settings-global-codes.html`

#### Build Notes Section

**Display State**: Minimized by default, expandable via button

**Floating Button** (top right, fixed position):
- SVG icon + "Show Build Notes" text
- Background: Yellow (#ffc107) with border
- Visible when build notes section is hidden
- Onclick: Expand build notes and scroll to it

**Build Notes Content** (when expanded):

**Link to Full Plan**:
- Prominent link at top of build notes
- Text: "View Full Implementation Plan" with document SVG icon
- Links to: `global-codes-management.plan.md`
- Styled as primary link in blue box

**Key Documentation Points**:
- What Are Global Codes: System-wide standardized dropdown values
- Hybrid Scoping System: 6 total toggle switches per code
  - 3 Module Visibility toggles (Appraisals/Evaluations/Comps)
  - 3 Property Type toggles (Commercial/Residential/Land)
- Two-Tier Architecture: Super Admins + Account Admins
- Where They Appear: All approaches, property details, forms
- Data Impact: Changes affect ALL accounts immediately
- Hierarchy Support: Parent-child relationships
- Priority: High when dropdown management becomes painful
- Build Time: 3-4 weeks full implementation

#### Page Layout

**Design System**: NO EMOJIS - Use SVG icons throughout

**Icons to Use**:
- Building icon for Commercial
- Home icon for Residential
- Landscape icon for Land
- Eye icon for visibility
- Settings/cog icon for management
- Folder icon for categories
- Document icon for plan link

1. **Navigation**: Standard Super Admin navbar

2. **Floating Toggle Button**: Fixed position (top right)
   - SVG hammer/wrench icon + "Show Build Notes"
   - Yellow background

3. **Build Notes Section**: Initially hidden
   - Link to plan with document icon
   - Comprehensive documentation
   - "Hide Build Notes" button

4. **Back Link**: Arrow SVG + "Back to Settings"

5. **Page Title**: "GLOBAL CODES MANAGEMENT"
   - Subtitle: "Manage system-wide dropdown options • 40 categories • 2,547 codes"

6. **Two-Column Layout**:

   **Left Sidebar - Categories**:
   - "Add Category" button at top
   - Categories grouped with SVG icons:
     - Property Fields (folder icon)
     - Approaches (chart icon)
     - Building Details (tools icon)
     - Workflow (workflow icon)
   - Show code count per category
   - Active category highlighted

   **Main Content Area**:
   
   **Action Bar**:
   - Search input (magnifying glass SVG)
   - Status filter dropdown
   - "Add New Code" button
   - "Export CSV" button

   **Codes Table** (9 columns):
   1. Name (with hierarchy indentation for children)
   2. Code (monospace, gray background)
   3. Parent (if applicable)
   4-6. **Module Visibility** (grouped header with 3 toggle switches):
      - Appraisals
      - Evaluations
      - Comps
   7-9. **Property Type Scope** (grouped header with 3 toggle switches):
      - Commercial (building SVG icon)
      - Residential (home SVG icon)
      - Land (landscape SVG icon)
   10. Status (badge)
   11. Actions (Edit link)

7. **Add/Edit Code Modal**

   Form sections:
   - **Basic Information**:
     - Code Name*
     - Code Identifier* (auto-generated)
     - Category*
     - Parent Code (optional)
     - Description
   
   - **Module Visibility** (checkboxes with icons):
     - Show in Appraisals
     - Show in Evaluations
     - Show in Comps
   
   - **Property Type Applicability** (checkboxes with icons):
     - Commercial (Office, Retail, Industrial, Multi-Family, Hospitality, Special Purpose)
     - Residential (Single-family homes, res_comps, res_evaluations tables)
     - Land (Land-only properties, no building component)
   
   - Status dropdown

8. **Add/Edit Category Modal**
   - Category Type (identifier)
   - Category Label
   - Description
   - Property type applicability defaults (3 checkboxes)

#### Sample Data Display

**Property Types Category** - Shows scoping in action:
| Code | Module Visibility | Property Type Scope |
|------|-------------------|---------------------|
| Office (parent) | Appr ✓ Eval ✓ Comps ✓ | Commercial ✓ Residential ✗ Land ✗ |
| ↳ Medical Office Condo | Appr ✓ Eval ✓ Comps ✓ | Commercial ✓ Residential ✗ Land ✗ |
| Residential | Appr ✗ Eval ✓ Comps ✓ | Commercial ✗ Residential ✓ Land ✗ |

**Universal Categories** (apply to all types):
| Code | Property Type Scope |
|------|---------------------|
| Topography | Commercial ✓ Residential ✓ Land ✓ |
| Utilities | Commercial ✓ Residential ✓ Land ✓ |
| Condition | Commercial ✓ Residential ✓ Land ✓ |

**Residential-Only Codes**:
| Code | Property Type Scope |
|------|---------------------|
| Bedrooms | Commercial ✗ Residential ✓ Land ✗ |
| Bathrooms | Commercial ✗ Residential ✓ Land ✗ |

### Phase 2: Backend API Development

**Migration**: `migrations/YYYYMMDDHHMMSS-add-property-type-scoping.js`

Add columns as specified in Database Structure section above.

**New Endpoints** (add to `packages/backend/src/routes/admin.routes.ts`):

```
GET    /admin/global-codes/categories          - List all categories
GET    /admin/global-codes/categories/:id      - Get category with codes
POST   /admin/global-codes/categories          - Create category (SUPER_ADMIN)
PATCH  /admin/global-codes/categories/:id      - Update category
DELETE /admin/global-codes/categories/:id      - Delete category (if no codes)

GET    /admin/global-codes                     - List codes (with filters)
  Query params: ?categoryId=1&propertyType=commercial&module=appraisals&status=active
GET    /admin/global-codes/:id                 - Get specific code
POST   /admin/global-codes                     - Create code
PATCH  /admin/global-codes/:id                 - Update code
DELETE /admin/global-codes/:id                 - Delete code (check usage)

GET    /admin/global-codes/:id/usage           - Usage statistics
POST   /admin/global-codes/:id/duplicate       - Duplicate code
POST   /admin/global-codes/reorder             - Reorder within category
```

**Service**: `packages/backend/src/services/admin/adminGlobalCodes.service.ts`

Key methods with property type scoping:
- `listCodes(filters)` - Filter by propertyType param (commercial/residential/land)
- `createCode(data)` - Validate property type flags
- `updateCode(id, data)` - Update all 6 visibility/scope flags
- `getCodeUsage(id)` - Count usage in comps, res_comps, appraisals, evaluations, res_evaluations

**Update Existing Endpoint**: `packages/backend/src/services/common/common.service.ts`

Modify `getAllGlobalCodes` to accept property type filter:
```typescript
GET /globalCodes?propertyType=residential&module=evaluations
// Returns only codes where:
// - residential_applicable = 1
// - evaluation_default = 1
// - status = 1
```

### Phase 3: Frontend React Implementation

**Component**: `packages/frontend/src/pages/admin/GlobalCodesManagement.tsx`

State includes:
- `selectedPropertyType` - Filter codes by commercial/residential/land
- Property type filter UI with icons

**Codes Table Component** shows all 9 columns with grouped headers:
- "Module Visibility" header spanning 3 columns
- "Property Type Scope" header spanning 3 columns

### Phase 4: Integration & Testing

**Testing Scenarios**:
1. Create "Data Center" code with Commercial only
2. Create "Condo" code with Residential only
3. Create "Topography" option applicable to all 3 types
4. Verify residential evaluations only see residential-applicable codes
5. Verify commercial appraisals don't see residential-only codes
6. Test hierarchies work across property types

## Files to Create/Modify

**New Files**:
- `prototypes/SuperAdmin/super-admin-settings-global-codes.html` (with 9-column table, SVG icons)
- `migrations/YYYYMMDDHHMMSS-add-property-type-scoping.js`
- `packages/backend/src/services/admin/adminGlobalCodes.service.ts`
- `packages/backend/src/services/admin/adminGlobalCodes.store.ts`
- `packages/frontend/src/pages/admin/GlobalCodesManagement.tsx`
- `packages/frontend/src/components/admin/CodeModal.tsx`
- `packages/frontend/src/components/admin/CategoryModal.tsx`
- `packages/frontend/src/components/admin/CodesTable.tsx`
- `migrations/YYYYMMDDHHMMSS-create-account-global-codes.js`
- `global-codes-management.plan.md` (this file)

**Modified Files**:
- `prototypes/SuperAdmin/super-admin-settings.html` (✓ completed - links to global codes page)
- `packages/backend/src/routes/admin.routes.ts`
- `packages/backend/src/services/common/common.service.ts` (add propertyType filter param)
- `packages/backend/src/services/common/common.store.ts`
- `packages/frontend/src/App.tsx`

## Key Design Decisions

1. **Hybrid Scoping System**: 6 toggle switches (3 module + 3 property type) gives maximum flexibility
2. **Property Type Awareness**: System recognizes Commercial uses different tables than Residential
3. **Universal vs Specific Codes**: Some codes (Topography, Utilities) apply to all property types
4. **Residential Differentiation**: Bedrooms/Bathrooms only for residential
5. **No Emojis**: Professional UI uses SVG icons throughout
6. **Two-Tier Permissions**: Super Admin manages global, Account Admin adds custom
7. **Usage Tracking**: Prevents deletion of codes in use across any property type
8. **Category-Level Defaults**: Categories can set default property type applicability

## Success Metrics

- Codes correctly filtered by property type context (commercial form shows only commercial-applicable codes)
- Residential evaluations don't show commercial-only codes
- Land appraisals don't show building-specific codes (bedrooms, garage)
- Account admins can create market-specific codes for their property types
- No broken dropdowns when switching between Commercial/Residential/Land tabs

## Implementation Priority

**Phase 1**: Prototype with SVG icons + property type scoping (current task)
**Phase 2**: Backend migration + API with property type filters
**Phase 3**: React components with dual filtering
**Phase 4**: Account-level customization
**Phase 5**: Integration testing across all 3 property types

