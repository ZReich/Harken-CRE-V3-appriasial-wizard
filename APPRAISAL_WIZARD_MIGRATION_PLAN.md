# Appraisal Wizard V2 - Functionality & Data Migration Plan

## Goal
Ensure "Appraisal Wizard V2" contains all data fields, sections, and functionality from "Version 1" while maintaining the new "Data-First" 5-Phase workflow.

## Migration Map

### Phase 1: Template Selection
- **Status**: Implemented.
- **V1 Source**: `template-selection`
- **V2 Target**: Phase 1 Screen.

### Phase 2: Setup (Expanded)
Current V2 only has Property Type and Client. Needs expansion to cover V1 Sections 1, 4, 5.
- **V2 Tab 1: Assignment Details**
    - Dates: Inspection, Report, Effective (As Is, Completed, Stabilized) [V1 1.1, 1.3, 4.4]
    - Personnel: Appraiser (User), Client (Detailed) [V1 1.1]
    - File Number / Reference IDs.
- **V2 Tab 2: Purpose & Scope**
    - Purpose of Appraisal [V1 4.1]
    - Intended Use & Users [V1 4.2]
    - Interest Valued [V1 4.3]
    - Definition of Value (Market Value, etc.)
    - Scope of Work / Development Process [V1 5.1]
- **V2 Tab 3: Property Identification**
    - Address, Legal Description, Tax IDs [V1 1.2, 3.1]
    - Owner of Record, History of Ownership (3 Years) [V1 11.1]
    - *Note: Moved Ownership here from Subject Data to group with ID.*

### Phase 3: Subject Property Data
- **V2 Tab 1: Location & Market Area** [V1 6.1, 7.1, 7.2, 7.3]
    - General Area Analysis (City/County data)
    - Neighborhood Definition (Boundaries, Characteristics)
    - Access & Infrastructure
    - Market Conditions (Trends, Supply/Demand) [from V1 14.2 - moved here as it's market data]
- **V2 Tab 2: Site Details** [V1 3.2, 8.1, 8.2, 8.3, 8.4]
    - Dimensions, Area, Shape, Topography
    - Zoning (Classification, Permitted Uses)
    - Utilities & Services
    - Flood & Environmental Hazards
    - Adjacent Properties
- **V2 Tab 3: Improvements** [V1 3.3, 9.1, 9.2, 9.3]
    - Building Count, GBA, NRA
    - Construction Details (Foundation, Frame, Exterior, Roof)
    - Interior Finishes (Floors, Walls, Ceilings)
    - Mechanical Systems (HVAC, Electrical, Plumbing)
    - Unit Mix (for Multi-tenant/Multi-family)
- **V2 Tab 4: Taxes & Assessment** [V1 10.1]
    - Current Assessment (Land/Imp)
    - Tax Rates & History
    - Special Assessments

### Phase 4: Valuation Analysis
- **V2 Tab 1: Highest & Best Use** [V1 12.1, 12.2]
    - Analysis As Vacant (4 Tests)
    - Analysis As Improved
    - Conclusion
- **V2 Tab 2: Land Valuation** [V1 13.1]
    - Method Selection
    - Land Comparable Grid
    - Land Value Conclusion
- **V2 Tab 3: Cost Approach** [V1 13.2, 13.3, 13.4]
    - Replacement Cost New (RCN) Calculation
    - Depreciation Analysis (Physical, Functional, External)
    - Indicated Value
- **V2 Tab 4: Sales Comparison** [V1 14.1, 14.3, 14.4, 14.5, 14.6]
    - Comparable Search Criteria
    - Sales Grid (Adjustments)
    - Adjustment Analysis (Commentary)
    - Reconciliation of Sales
- **V2 Tab 5: Income Approach** [V1 15.1 - 15.5]
    - Market Rent Analysis / Rent Roll
    - Operating Expense Analysis
    - NOI Calculation
    - Capitalization Rate Analysis (Cap Rate Comps/Build-up)
    - Value Conclusion

### Phase 5: Review & Reporting
- **V2 Tab 1: Reconciliation** [V1 17.1, 17.2]
    - Weighing of Approaches
    - Final Value Conclusions (As Is, Completed, Stabilized)
    - Exposure Time Statement
- **V2 Tab 2: Certification & Limiting Conditions** [V1 18.1, 20.1]
    - Standard Assumptions
    - Limiting Conditions
    - Appraiser Certification
- **V2 Tab 3: Addenda & Exhibits** [V1 21.1]
    - Maps (Location, Site, Zoning)
    - Photos (Subject, Comps)
    - Other Documents
- **V2 Tab 4: Transmittal Letter** [V1 2.1]
    - Letter Generation text/fields

## Implementation Strategy
1.  **Expand "Setup" Phase**: Break into `Assignment`, `Scope`, and `Property ID` tabs.
2.  **Enhance "Subject Data" Tabs**: Inject missing fields from V1 Sections 6-11 into the existing 4 tabs.
3.  **Build out "Analysis" Tabs**: Create the HBU and Land Val tabs. Flesh out Cost/Sales/Income with V1 fields.
4.  **Build out "Review" Tabs**: Implement Reconciliation, Certs, and Addenda.








