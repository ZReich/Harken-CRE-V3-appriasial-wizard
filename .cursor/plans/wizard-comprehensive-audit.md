# Appraisal Wizard React - Comprehensive Audit

**Created**: January 10, 2026  
**Status**: Complete Reference Document  
**Purpose**: Source of truth for all implemented features across the 6-phase wizard

---

## Phase 1: Template Selection (`/template`)

### Report Type Selection Panel

| Option | Description |
|--------|-------------|
| **Appraisal** | Full USPAP-compliant opinion of value with extensive data analysis, HBU, all approaches |
| **Evaluation** | Restricted scope valuation for lower-risk transactions, streamlined analysis |

### Template Selection

| Tab | Contents |
|-----|----------|
| **System Templates** | Standard Appraisal, Commercial Evaluation-Detailed, Restricted Appraisal Report, Development Lifecycle Analysis, Standard Evaluation, Desktop Evaluation |
| **My Templates (Custom)** | User-created templates with edit/duplicate/delete, usage tracking, public/private visibility, property type tags |

---

## Phase 2: Document Intake (`/document-intake`)

### Tab 1: Documents

| Component | Functionality |
|-----------|---------------|
| **AI-Powered Drop Zone** | Multi-file upload (PDF, images, Word, Excel, CSV) |
| **Document Classification** | Auto-detects: cadastral, engagement, sale, lease, rent roll, operating statement, flood, environmental, title, insurance |
| **Data Extraction** | OCR with field-level confidence scores |
| **Document Cards** | Status tracking, extracted field count, reprocess, reclassify options |
| **Field Suggestions** | Pending suggestions mapped to wizard fields via `DOCUMENT_FIELD_MAPPINGS` |

### Tab 2: Photos

| Component | Functionality |
|-----------|---------------|
| **Cover Photo Section** | Select hero image for report cover |
| **Bulk Photo Drop Zone** | Upload multiple photos, triggers AI classification |
| **Photo Staging Tray** | Unassigned photos with AI-suggested slot assignments |
| **Floating Drop Panel** | Drag-and-drop slot assignment |
| **PhotoCropModal** | Manual crop with aspect ratio selector |
| **Auto-Crop Service** | Smart cropping based on category detection |

---

## Phase 3: Setup (`/setup`)

### Tab 1: Assignment Basics

| Section | Fields/Features |
|---------|-----------------|
| **Property Address** | Google Places Autocomplete with coordinates capture |
| **Property Lookup** | Montana Cadastral (FREE) or Cotality API |
| **Key Dates** | Report Date, Inspection Date, Effective Date |
| **Property Classification** | 3-tier M&S hierarchy: Category -> Property Type -> Occupancy Code |
| **Unit Configuration** | Multi-family: UnitMixGrid with types, count, SF |
| **Property Components** | Mixed-use: Primary auto-created, add secondary components |
| **Property Status** | Existing, Under Construction, Proposed, Recently Completed |
| **Planned Changes** | None, Minor, Major renovation, Change of use |
| **Occupancy Status** | Stabilized, Lease-up, Vacant, N/A |
| **Loan Purpose** | Purchase, Refinance, Construction, Bridge, Internal |
| **Valuation Scenarios** | Auto-generated with Required/Recommended badges |
| **Approach Selection** | Per-scenario: Sales, Income, Cost checkboxes |
| **Cost Segregation Toggle** | Enable IRS depreciation study |

### Tab 2: Purpose & Scope

- Value Type (Market, Insurable, Liquidation, Investment)
- Property Interest (Fee Simple, Leased Fee, Leasehold, Partial)
- Intended Users textarea

### Tab 3: Property ID

- Property Name, Legal Description with AI Draft
- Property Ownership (multiple owners with type/percentage)
- Tax ID/Parcel # with field suggestions

### Tab 4: Inspection

- Inspection Type dropdown
- Personal Inspection toggle with contract appraiser fields
- USPAP Assistance textarea

### Tab 5: Certifications

- USPAP Certifications acknowledgment checkbox
- Additional Certifications textarea
- License Number, State, Expiration Date

---

## Phase 4: Subject Data (`/subject-data`)

### Tab 1: Location & Area

- City/County (auto-populated)
- Area Description, Neighborhood Boundaries, Neighborhood Characteristics, Specific Location
- All with AI Draft buttons + "Draft All" master button

### Tab 2: Site Details

| Section | Fields |
|---------|--------|
| **Site Size** | Acres/SF with conversion, Shape, Frontage |
| **Zoning** | Class, Description, Conformance |
| **Utilities** | Water, Sewer, Electric, Gas, Telecom (each with notes) |
| **Storm/Fire** | Storm drainage, Fire hydrant distance |
| **Flood Zone** | FEMA lookup API, Map Panel, Date, Insurance Required |
| **Boundaries** | N/S/E/W descriptions |
| **Characteristics** | Topography, Drainage, Environmental, Easements |
| **Site Improvements** | M&S Section 66 inventory with cost calculator |
| **External Data** | Traffic Data API, Building Permits API |
| **Site Narrative** | EnhancedTextArea with AI Draft |

### Tab 3: Improvements

- ImprovementsInventory component with full building grid
- Multiple buildings support
- Building fields: Year Built, GBA, Stories, Construction, Condition, Quality, etc.

### Tab 4: Demographics

- DemographicsPanel with census data from coordinates

### Tab 5: Tax & Ownership

- Tax Year, Assessed Values (auto-filled from cadastral)
- Mill Levy, Tax Amount
- Sale History, Transaction History, Grantor/Grantee

### Tab 6: Photos & Maps

- Photo Categories: Exterior (6), Interior (12), Site (5), Street (2)
- Photo slots with metadata (caption, taken by, date)
- Cover Photo Picker, Staging Tray, Floating Drop Panel
- MapGeneratorPanel (ESRI), BoundaryDrawingTool

### Tab 7: Exhibits & Docs

- Uploaded documents from Phase 2
- Include in Report toggles

---

## Phase 5: Analysis (`/analysis`)

### Scenario Switcher

- Dropdown for As Is, As Completed, As Stabilized, As Proposed
- Each scenario maintains independent values

### Sales Comparison Tab

| Component | Features |
|-----------|----------|
| **SalesComparisonTabs** | Improved Sales / Land Sales sub-tabs |
| **Analysis Mode Toggle** | Standard vs Improvement Analysis (residual) |
| **SalesGrid** | Subject + comparable columns with adjustments |
| **Quantitative Adjustments** | Popover with %/$ toggle, presets, INF/SUP/SIM labels |
| **Qualitative Adjustments** | Click-to-cycle chips (SIM/SUP/INF) |
| **Land Sales Grid** | When property is land or Cost Approach needs land value |
| **Notes Section** | EnhancedTextArea - flows into report |

### Income Approach Tab

| Component | Features |
|-----------|----------|
| **IncomeApproachInstanceTabs** | Component-based for mixed-use |
| **IncomeApproachGrid** | Main income analysis |
| **Rent Comparable Grid** | Rent comps with adjustments |
| **Expense Comparable Grid** | Expense validation comps |
| **Direct Capitalization** | PGI, Vacancy, EGI, Expenses, NOI, Cap Rate |
| **DCF Analysis** | 10-year projections with Holding Period, Discount Rate, Terminal Cap, Growth Rate |
| **DCFProjectionTable** | Year-by-year: PGI, Vacancy, EGI, Expenses, NOI, PV Factor, PV of NOI |
| **GRM Analysis** | For residential |
| **Cap Rate Comps** | Comparable cap rates |
| **Notes Section** | Flows into report |

### Cost Approach Tab

- CostApproachGrid with RCN, depreciation, land value
- Land Valuation from Land Sales sub-tab
- Depreciation: Physical, Functional, External
- Site Improvements from inventory

### Cost Segregation Tab (if enabled)

- CostSegTab with 5/15/39-year class breakdown
- Component Classifier, Depreciation Schedule

### Right Sidebars

- ReconciliationSummary with editable weights
- ValueReconciliationSummary for mixed-use
- ContextualMarketData per approach
- Dynamic Guidance Panel per approach/scenario

---

## Phase 6: Review (`/review`)

### Tab 1: Highest & Best Use

- As Vacant: Legally Permissible, Physically Possible, Financially Feasible, Maximally Productive
- All with AI Draft + "Draft All (4 Sections)" button
- As Improved Analysis (if property has improvements)

### Tab 2: Market Analysis

- MarketAnalysisGrid: supply/demand, vacancy, absorption, trends
- EconomicIndicatorsPanel: rates, GDP, employment, CPI

### Tab 3: SWOT Analysis

- SWOTAnalysis component with quadrant editor
- AI Suggestions from property data
- Summary narrative

### Tab 4: Risk Rating

- RiskRatingPanel with bond-style rating (AAA to C)
- Four dimensions: Market Volatility, Liquidity, Income Stability, Asset Quality

### Tab 5: Cost Segregation (if enabled)

- CostSegOverview, Generate Analysis button
- CostSegFullReportEditor

### Tab 6: Value Reconciliation

- Per-scenario weight sliders (Sales, Income, Cost)
- Reconciliation Comments
- Final Value calculation

### Tab 7: Completion Checklist

- CompletionChecklist component
- USPAP compliance checks
- Continue to Preview button

### Report Preview Mode (Full-Screen)

- ReportEditor WYSIWYG
- Section visibility toggles, reordering
- Custom styling (fonts, colors)
- Save Draft, Save as Template, Generate Final PDF
- Unsaved changes tracking
- Finalize flow dialogs (SaveChanges, PostSave, TemplateSave, Finalize)

---

## Cross-Cutting Features

| Feature | Status |
|---------|--------|
| AI Draft for narratives | Implemented |
| Document extraction with AI | Implemented |
| Field suggestions system | Implemented |
| Photo management with AI | Implemented |
| DCF 10-year projections | Implemented |
| Notes flow to report | Implemented |
| Multi-scenario support | Implemented |
| Mixed-use components | Implemented |
| Cost Segregation | Implemented |
| Risk Rating system | Implemented |
| SWOT Analysis with AI | Implemented |
| Market Analysis grid | Implemented |
| Progress tracking | Implemented |
| Celebration system | Implemented |
| Smart continue navigation | Implemented |
| LocalStorage persistence | Implemented |
| Light/Dark theme | Implemented |
| USPAP compliance features | Implemented |

---

## Key Files Reference

| Feature | Primary File |
|---------|-------------|
| Template Selection | `src/pages/TemplatePage.tsx` |
| Document Intake | `src/pages/DocumentIntakePage.tsx` |
| Setup | `src/pages/SetupPage.tsx` |
| Subject Data | `src/pages/SubjectDataPage.tsx` |
| Analysis | `src/pages/AnalysisPage.tsx` |
| Review | `src/pages/ReviewPage.tsx` |
| Wizard State | `src/context/WizardContext.tsx` |
| Sales Grid | `src/features/sales-comparison/components/SalesGrid.tsx` |
| Income Grid | `src/features/income-approach/components/IncomeApproachGrid.tsx` |
| DCF Table | `src/features/income-approach/components/DCFProjectionTable.tsx` |
| Cost Grid | `src/features/cost-approach/components/CostApproachGrid.tsx` |
| Report Editor | `src/features/review/components/ReportEditor.tsx` |
| Grid Configs | `src/constants/gridConfigurations.ts` |
