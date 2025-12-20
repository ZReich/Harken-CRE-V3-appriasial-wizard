# Appraisal Wizard Implementation Plan
**Based on Revised Final Appraisal Report Analysis**

## Overview
This document outlines the implementation of a comprehensive Appraisal Wizard for commercial real estate appraisals, modeled after the Evaluation Wizard but adapted for full USPAP-compliant appraisal reports.

---

## Document Structure Analysis

### Pages Analyzed: 93 total pages
### Yellow Dot Annotations: Catalogued across all major sections

---

## SECTION 1: REPORT HEADER & IDENTIFICATION

### Step 1.1: Cover Page & Title Information
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Property Name/Description** 📍
   - Input: Text
   - Example: "Proposed Canyon Creek Industrial Shop Complex"
   
2. **Location** 📍
   - City: Text
   - County: Text
   - State: Dropdown
   
3. **Multiple Value Dates** 📍
   - Date of Inspection: Date picker
   - Date of "As Is" Value: Date picker
   - Date of "As Completed" Value: Date picker
   - Date of "As Stabilized" Value: Date picker
   - Date of Report: Date picker

4. **Client Information** 📍
   - Client Name: Text
   - Attention To: Text
   - Address: Text (multiline)
   - City, State, ZIP: Text

5. **Appraiser Information** 📍
   - Company Name: Text
   - Appraiser Name: Text
   - Credentials: Text (MAI, etc.)
   - Address: Text
   - Phone: Phone input

---

## SECTION 2: TRANSMITTAL LETTER

### Step 2.1: Letter of Transmittal
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Date of Letter** 📍
   - Input: Date picker

2. **Recipient Information** 📍
   - Name: Text
   - Title: Text
   - Organization: Text
   - Address: Text

3. **Subject Line** 📍
   - RE: Text (auto-populated from property description)

4. **Salutation** 📍
   - Dear [Name]: Text

5. **Purpose Statement** 📍
   - Purpose of Appraisal: Dropdown
     - Market Value Estimate
     - Financing
     - Litigation Support
     - Other (specify)

6. **Value Type** 📍
   - "As Is" Market Value: Radio/checkbox
   - "Prospective" Market Value: Radio/checkbox
   - Both: Radio/checkbox

7. **Inspection Confirmation** 📍
   - Personal inspection checkbox
   - Date confirmed

8. **Value Conclusions** 📍 (highlighted in red in original)
   - "Prospective" Value as of completion date: Currency
   - Date: Date picker
   - "Prospective" Value as of stabilization date: Currency
   - Date: Date picker
   - "As Is" Market Value: Currency
   - Date: Date picker

9. **Exposure Period** 📍
   - Number: Integer
   - Unit: Dropdown (Days, Months, Years)

10. **Report Page Count** 📍
    - Pages: Auto-calculated
    - Exhibits: Auto-calculated

---

## SECTION 3: SUMMARY OF APPRAISAL

### Step 3.1: Basic Property Information
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Interest Appraised** 📍
   - Dropdown:
     - Fee Simple
     - Leased Fee Estate
     - Leasehold Estate
     - Other
   - Definition display (auto-populated)

2. **Type of Property** 📍
   - Dropdown:
     - Light Industrial
     - Heavy Industrial
     - Office
     - Retail
     - Multi-Family
     - Other
   - Detailed Description: Text area

3. **Location** 📍
   - Full Address: Text
   - Proximity Description: Text

4. **Physical Address** 📍
   - TBD checkbox (if not yet assigned)
   - Address: Text

5. **Tax ID Number** 📍
   - Multiple parcels supported
   - Parcel 1 ID: Text
   - Parcel 2 ID: Text
   - Parcel 3 ID: Text
   - Add more button

6. **Legal Description** 📍
   - Lots: Text
   - Block: Text
   - Subdivision Name: Text
   - Filing: Text
   - Document Number: Text
   - County: Text
   - Replat Information: Text area

7. **Owner of Record** 📍
   - Name: Text
   - Entity Type: Dropdown (LLC, Corporation, Individual, Trust, etc.)

### Step 3.2: Site Information
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Total Site Area** 📍
   - Acres: Decimal
   - Square Feet: Integer (auto-calculated)
   - Shape: Dropdown (Rectangular, Irregular, etc.)

2. **Land Allocation** 📍
   - Improved Area: Integer (SF)
   - Remainder Area: Integer (SF)
   - Frontage: Integer (feet)
   - Street: Text

3. **Zoning** 📍
   - Classification: Text
   - Description: Text area (auto-populated from zoning code)
   - Permitted Use Confirmation: Checkbox

4. **Utilities** 📍
   - All city services: Checkbox
   - Individual utilities: Multiple checkboxes
     - Water
     - Sewer
     - Electric
     - Gas
     - Phone
     - Cable/Internet

### Step 3.3: Improvements Description
**Screens Required:** 1 screen (with repeating building blocks)

**Fields with Yellow Dot Annotations:**

1. **Number of Buildings** 📍
   - Count: Integer

2. **For Each Building:**
   - Building Number: Text
   - Square Footage: Integer
   - Number of Units: Integer
   - Unit Size Range: Text (e.g., "1,500 - 4,400 SF")
   
3. **Interior Finishes** 📍
   - Walls: Multiple checkboxes
     - Metal liner paneling
     - Painted drywall
     - Plywood
     - Other
   - Ceilings: Checkboxes
   - Floor: Checkboxes

4. **Doors** 📍
   - Overhead doors per unit: Integer
   - Man doors per unit: Integer
   - Door types: Checkboxes

### Step 3.4: Highest and Best Use
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **"As Vacant" Analysis** 📍
   - Conclusion: Text area
   - Reasoning: Text area

2. **"As Improved" Analysis** 📍
   - Conclusion: Text area
   - Proposed Use Description: Text area

### Step 3.5: Value Summary
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Land Value** 📍
   - Amount: Currency

2. **Remainder Parcel Value** 📍
   - Amount: Currency

3. **Value by Cost Approach** 📍
   - Amount: Currency

4. **Value by Sales Comparison Approach** 📍
   - Amount: Currency

5. **Value by Income Approach** 📍
   - Amount: Currency

6. **Final Values** 📍
   - Final "As Completed" Market Value: Currency
   - Final "As Stabilized" Market Value: Currency
   - Final "As Is" Market Value: Currency

7. **Effective Dates** 📍
   - Date of "As Stabilized" Value: Date picker
   - Date of "As Completed" Value: Date picker
   - Date of "As Is" Value: Date picker
   - Date of Report: Date picker

8. **Estimated Exposure Period** 📍
   - Duration: Text

---

## SECTION 4: PURPOSE & SCOPE

### Step 4.1: Purpose of the Appraisal
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Purpose Statement** 📍
   - Template text with merge fields
   - Editable text area

2. **Market Value Definition** 📍
   - Standard definition display
   - Source citation: Auto-populated
   - 5 Conditions Checklist:
     - Typical motivation
     - Well-informed parties
     - Reasonable exposure time
     - Cash or equivalent payment
     - Normal consideration

### Step 4.2: Intended Use & Users
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Intended Use** 📍
   - Dropdown:
     - Bank loan evaluation
     - Purchase/Sale decision
     - Litigation support
     - Estate planning
     - Other
   - Custom description: Text

2. **Intended Users** 📍
   - Primary user: Text
   - Sole/Exclusive use: Checkbox
   - Authorization for unnamed third parties: Text area

### Step 4.3: Interest Valued
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Interest Type** 📍
   - Dropdown matching earlier selection
   - Definition: Auto-populated
   - Source: Auto-populated

### Step 4.4: Effective Dates
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Date of Inspection** 📍
   - Date picker

2. **Effective Date of "AS IS" Value** 📍
   - Date picker

3. **Effective Date of "AS COMPLETED" Value** 📍
   - Date picker
   - Future date validation

4. **Effective Date of "AS STABILIZED" Value** 📍
   - Date picker
   - Future date validation

5. **Date of Report** 📍
   - Date picker

### Step 4.5: Assumptions & Conditions
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Extraordinary Assumptions** 📍
   - Definition display
   - Source: Auto-populated
   - List of assumptions:
     - Improvement completion assumption
     - Completion date: Date picker
     - Description: Text area
   - Platting/Re-platting assumption
     - Description: Text area

2. **Hypothetical Conditions** 📍
   - Definition display
   - None: Checkbox
   - If applicable: Text area

---

## SECTION 5: APPRAISAL DEVELOPMENT & REPORTING PROCESS

### Step 5.1: Development Process
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Inspection Details** 📍
   - Site inspected: Checkbox
   - Plans reviewed: Checkbox
   - Costs reviewed: Checkbox
   - Specifications reviewed: Checkbox
   - Broker interviews: Checkbox

2. **Data Gathering** 📍
   - Land sales: Checkbox
   - Improved sales: Checkbox
   - Rental survey: Checkbox
   - Location: Text

3. **Approaches Used** 📍
   - Sales Comparison (As Is): Checkbox
   - Cost Approach (As Completed): Checkbox
   - Sales Comparison (As Completed): Checkbox
   - Income Approach (As Stabilized): Checkbox
   - Sales Comparison (Remainder): Checkbox
   - Income capitalization method: Dropdown
     - Direct Capitalization
     - DCF
     - Other

---

## SECTION 6: GENERAL AREA ANALYSIS

### Step 6.1: City/County Overview
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Location Description** 📍
   - City: Text
   - County: Text
   - State: Text
   - Geographic position: Text area
   - Distance to major cities: Text

2. **Population Statistics** 📍
   - Current year: Integer
   - Current population: Integer
   - Base year: Integer
   - Base population: Integer
   - Growth percentage: Calculated
   - County population: Integer

3. **Economic Characteristics** 📍
   - Economic description: Text area (WYSIWYG)
   - Major industries: Multiple select
   - Key employers: Text list

4. **Notable Features** 📍
   - Medical facilities: Text area
   - Tourism: Text area
   - Other: Text area

---

## SECTION 7: NEIGHBORHOOD ANALYSIS

### Step 7.1: Neighborhood Definition
**Screens Required:** 1 screen with map integration

**Fields with Yellow Dot Annotations:**

1. **Neighborhood Map** 📍
   - Map upload or draw on map
   - Boundary markers:
     - North: Text
     - South: Text
     - East: Text
     - West: Text

2. **Location Description** 📍
   - Street/Address: Text
   - Distance from CBD: Decimal (miles)
   - Direction from CBD: Dropdown (N, S, E, W, NE, NW, SE, SW)

3. **Neighborhood Characteristics** 📍
   - Development stage: Dropdown
     - Developing
     - Fully developed
     - Mixed
   - Primary uses: Multiple select
     - Warehouse
     - Light industrial
     - Retail
     - Office
     - Other

### Step 7.2: Access & Infrastructure
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Primary Access Routes** 📍
   - Route 1: Text
   - Route 2: Text
   - Route 3: Text
   - Interstate access: Text

2. **Traffic Counts** 📍
   - Location 1: Text
   - Count: Integer (VPD)
   - Location 2: Text
   - Count: Integer (VPD)
   - Source: Text
   - Date: Date

3. **Development Activity** 📍
   - Recent development: Text area
   - Planned development: Text area
   - Infrastructure improvements: Text area

### Step 7.3: Land Uses & Development
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Current Build-Out** 📍
   - Percentage: Integer (0-100)
   - Description: Text area

2. **Existing Land Uses** 📍
   - By area (percentages or description)
   - Retail: Text
   - Industrial: Text
   - Office: Text
   - Other: Text

3. **Notable Developments** 📍
   - List of major properties/businesses: Text area

4. **Future Outlook** 📍
   - Summary: Text area
   - Growth potential: Dropdown (High, Moderate, Low)

---

## SECTION 8: SITE ANALYSIS

### Step 8.1: Detailed Site Description
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Physical Inspection** 📍
   - Inspection completed: Checkbox
   - Proposed site plan reviewed: Checkbox
   - Data source: Text

2. **Location** 📍
   - Street: Text
   - Side: Dropdown (North, South, East, West)
   - Distance from intersection: Integer (feet)
   - Nearby cross streets: Text

3. **Address** 📍
   - Number: Text
   - Street: Text
   - Unit/Building numbers: Text
   - City: Text
   - State: Text
   - ZIP: Text

4. **Tax Identification** 📍
   - Parcel 1:
     - Lot: Text
     - Tax ID: Text
   - Parcel 2:
     - Lot: Text
     - Tax ID: Text
   - Parcel 3:
     - Lot: Text
     - Tax ID: Text
   - Add more parcels button

5. **Legal Description** 📍
   - Lots: Text
   - Block: Text
   - Subdivision: Text
   - Filing: Text
   - City: Text
   - County: Text
   - State: Text
   - Document #: Text
   - Replat information: Text area

### Step 8.2: Site Dimensions & Characteristics
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Proposed Plat** 📍
   - Lot 3A:
     - Area (acres): Decimal
     - Area (SF): Integer (calculated)
   - Lot 5A:
     - Area (acres): Decimal
     - Area (SF): Integer (calculated)
   - Total:
     - Acres: Decimal (calculated)
     - SF: Integer (calculated)

2. **Land Allocation Note** 📍
   - Phase 1 improvements area: Integer (SF)
   - Remainder area: Integer (SF)
   - Description: Text area

3. **Shape** 📍
   - Dropdown:
     - Rectangular
     - Irregular
     - Square
     - Triangular
     - Other
   - Reference: Text (e.g., "see plat in addenda")

4. **Frontages** 📍
   - Street name: Text
   - Length: Integer (feet)
   - Additional frontages: Repeatable fields

### Step 8.3: Improvements
**Screens Required:** 1 screen with building repeater

**Fields with Yellow Dot Annotations:**

1. **Phase Information** 📍
   - Current phase: Dropdown
   - Total phases: Integer
   - Phase description: Text

2. **Building Details** (Repeatable Section)
   - Building Number/ID: Text
   - Building Footprint: Integer (SF)
   - Number of units: Integer
   - Location on lot: Text

3. **Combined Statistics** 📍
   - Total footprint: Integer (calculated)
   - Site coverage ratio: Percentage (calculated)
   - Typical range: Text (informational)

### Step 8.4: Site Conditions
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Easements** 📍
   - Existing easements: Text area
   - Proposed easements: Text area
   - Impact on value: Dropdown
     - None
     - Adverse
     - Positive
   - Description: Text

2. **Zoning** 📍
   - Classification: Text
   - Definition: Text area (WYSIWYG for formatting)
   - Permitted use confirmation: Checkbox
   - Conditional uses: Text area

---

## SECTION 9: IMPROVEMENT ANALYSIS

### Step 9.1: Description of Improvements
**Screens Required:** 1 screen with repeating building sections

**Fields with Yellow Dot Annotations:**

1. **Overview** 📍
   - Number of buildings: Integer
   - Building types: Text
   - Phase: Integer
   - Total phases: Integer

2. **Building Identification** 📍
   - Building 1 Number: Text
   - Building 2 Number: Text
   - Building 3 Number: Text

3. **Building Locations** 📍
   - Building 1: Dropdown/Text
   - Building 2: Dropdown/Text
   - Building 3: Dropdown/Text

### Step 9.2: Unit Mix (Per Building)
**Screens Required:** Dynamic screens based on number of buildings

**For Each Building - Fields with Yellow Dot Annotations:**

1. **Building Header** 📍
   - Building Number/ID: Text
   - Total SF: Integer
   - Number of units: Integer

2. **Unit Details Table** 📍 (Table format)
   - Headers:
     - Unit #
     - Unit Size SF
     - Office SF
     - Shop/Mezz. SF
     - % Shop
     - % Office
     - Restrooms
     - # O.H. Doors
   
3. **Individual Unit Rows** (Repeatable)
   - Unit number: Integer
   - Total size: Integer
   - Office area: Integer
   - Shop/mezzanine area: Integer
   - Shop percentage: Calculated
   - Office percentage: Calculated
   - Restroom count: Text (e.g., "1 toilet / 1 sink")
   - Overhead doors: Integer

4. **Building Totals Row** 📍
   - Total SF: Calculated
   - Total office SF: Calculated
   - Total shop SF: Calculated
   - Average % shop: Calculated
   - Average % office: Calculated
   - Dash for non-totaling fields

### Step 9.3: Additional Improvement Details
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Floor Plans** 📍
   - Description: Text area
   - Range: Text (e.g., "single open shop to shop with office")
   - Features list: Checkboxes
     - Restroom
     - Office
     - Mezzanine storage

2. **Construction Quality** 📍
   - Overall quality: Dropdown
     - Good
     - Average
     - Fair
     - Poor
   - Description: Text area

3. **Site Improvements** 📍
   - Parking: Text
   - Landscaping: Text
   - Lighting: Text
   - Other: Text area

---

## SECTION 10: TAXES & ASSESSMENTS

### Step 10.1: Property Tax Information
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

(Note: No yellow dots visible on taxes pages in sample, but standard fields needed)

1. **Tax Year** 📍
   - Year: Integer

2. **Assessment Values**
   - Land: Currency
   - Improvements: Currency
   - Total: Currency (calculated)

3. **Tax Rates**
   - Rate: Decimal
   - Amount: Currency

4. **Special Assessments**
   - Description: Text
   - Amount: Currency

---

## SECTION 11: PROPERTY OWNERSHIP & TRANSACTION HISTORY

### Step 11.1: Current Ownership
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

(Standard fields needed)

1. **Owner of Record**
   - Name: Text
   - Entity type: Text
   - Date acquired: Date
   - Purchase price: Currency

2. **Recent Sales (3 years)**
   - Sale 1:
     - Date: Date
     - Price: Currency
     - Buyer: Text
     - Seller: Text
   - Add more button

---

## SECTION 12: HIGHEST AND BEST USE ANALYSIS

### Step 12.1: Highest & Best Use - As Vacant
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Legal Permissibility** 📍
   - Analysis: Text area
   - Conclusion: Text

2. **Physical Possibility** 📍
   - Analysis: Text area
   - Conclusion: Text

3. **Financial Feasibility** 📍
   - Analysis: Text area
   - Conclusion: Text

4. **Maximum Productivity** 📍
   - Analysis: Text area
   - Conclusion: Text

5. **Conclusion** 📍
   - "As Vacant" HBU: Text area

### Step 12.2: Highest & Best Use - As Improved
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Analysis** 📍
   - Current use description: Text area
   - Proposed use description: Text area

2. **Conclusion** 📍
   - "As Improved" HBU: Text area

---

## SECTION 13: COST APPROACH

### Step 13.1: Land Valuation
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Valuation Method** 📍
   - Method: Dropdown
     - Sales Comparison
     - Extraction
     - Allocation
     - Other
   
2. **Land Value Conclusion** 📍
   - Total land value: Currency
   - Value per acre: Currency (calculated)
   - Value per SF: Currency (calculated)

### Step 13.2: Improvement Valuation
**Screens Required:** Multiple screens (1 per building)

**Fields with Yellow Dot Annotations:**

1. **Cost Estimation Method** 📍
   - Source: Dropdown
     - Marshall & Swift
     - RS Means
     - Contractor estimates
     - Other
   - Base date: Date

2. **Building Costs** (Per building)
   - Building ID: Text
   - Square footage: Integer
   - Cost per SF: Currency
   - Total cost: Currency (calculated)

3. **Site Improvements** 📍
   - Parking: Currency
   - Landscaping: Currency
   - Fencing: Currency
   - Other: Currency
   - Total: Currency (calculated)

4. **Total Replacement Cost New** 📍
   - Buildings: Currency (calculated)
   - Site improvements: Currency
   - Total RCN: Currency (calculated)

### Step 13.3: Depreciation
**Screens Required:** 1 screen

**Fields needed (based on appraisal theory, may not have yellow dots):**

1. **Physical Deterioration**
   - **Curable (Deferred Maintenance):**
     - Description: Text
     - Amount: Currency
   - **Incurable - Short-lived:**
     - Description: Text (e.g., Roof, HVAC)
     - Calculation: Age/Life method
     - Amount: Currency
   - **Incurable - Long-lived:**
     - Description: Text (e.g., Foundation, Frame)
     - Calculation: Age/Life method
     - Amount: Currency

2. **Functional Obsolescence**
   - **Curable:**
     - Description: Text (e.g., Outdated finishes)
     - Amount: Currency
   - **Incurable:**
     - Description: Text (e.g., Poor layout, low ceilings)
     - Calculation: Capitalized rent loss
     - Amount: Currency

3. **External Obsolescence**
   - Description: Text (e.g., Negative market influences)
   - Amount: Currency

4. **Total Depreciation** 📍
   - Amount: Currency (calculated)
   - Percentage: Percentage (calculated)

### Step 13.4: Cost Approach Conclusion
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Calculation** 📍
   - Replacement Cost New: Currency (from above)
   - Less Total Depreciation: Currency (from Step 13.3)
   - Depreciated Cost: Currency (calculated)
   - Plus Land Value: Currency (from Step 13.1)
   - **Indicated Value by Cost Approach**: Currency (calculated)

---

## SECTION 14: SALES COMPARISON APPROACH

### Step 14.1: Comparable Sales Search
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Search Criteria** 📍
   - Property type: Multiple select
   - Location: Text
   - Date range:
     - From: Date
     - To: Date
   - Size range:
     - Min SF: Integer
     - Max SF: Integer

2. **Sources** 📍
   - CoStar: Checkbox
   - LoopNet: Checkbox
   - Broker interviews: Checkbox
   - Other: Text

### Step 14.2: Market Conditions Analysis
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Market Interview Summary** 📍
   - Brokers interviewed: Text area
   - Key findings: Text area

2. **Market Trend** 📍
   - Industrial property values: Dropdown (Increasing, Stable, Decreasing)
   - Timeframe: Text
   - Drivers: Text area

3. **Notable Market Events** 📍
   - Event description: Text area
   - Impact: Text area

### Step 14.3: Comparable Sales Data
**Screens Required:** 1 screen per comparable (typically 3-5)

**For Each Comparable - Fields with Yellow Dot Annotations:**

1. **Basic Information**
   - Sale number: Integer
   - Address: Text
   - City: Text
   - State: Text

2. **Sale Details**
   - Date of sale: Date
   - Sale price: Currency
   - Sale price per SF: Currency (calculated)

3. **Property Characteristics**
   - Property type: Dropdown
   - Building size SF: Integer
   - Land area: Decimal (acres) or Integer (SF)
   - Year built: Integer
   - Effective age: Integer or Text
   - Condition: Dropdown
   - Unit sizes: Text

4. **Features**
   - Office area percentage: Percentage
   - Sidewall height: Integer (feet)
   - Number of units: Integer

5. **Transaction Details**
   - Property rights: Dropdown (Fee Simple, Leased Fee, etc.)
   - Financing: Dropdown (Cash, Conventional, Seller, etc.)
   - Conditions of sale: Dropdown (Arm's length, Estate, etc.)
   - Market conditions: Dropdown (Current, Similar, Inferior, etc.)

6. **Cap Rate** 📍 (If applicable, highlighted in yellow)
   - Cap rate: Percentage
   - NOI: Currency (if available)

7. **Property-Type Specifics (Note)**
   - Logic should be included to add fields based on property type.
   - Example (Industrial): `Ceiling Height`, `Loading Docks`.

### Step 14.4: Sales Comparison Grid
**Screens Required:** 1 screen (spreadsheet view)

**Fields with Yellow Dot Annotations:**

**Headers Row:** 📍
- Element (rows)
- Subject
- Sale 1
- Sale 2
- Sale 3
- Sale 4

**Transactional Adjustment Rows:**

1. **Date of Sale** 📍
   - Subject: N/A or Effective date
   - Each Sale: Date

2. **Address** 📍
   - Full addresses

3. **H & B Use** 📍
   - Use description

4. **Year Built** 📍
   - Year

5. **Effective Age** 📍
   - Text (New, 10 yrs, etc.)

6. **Size/SF Bldg** 📍
   - Integer with comma separators

7. **% Office Area** 📍
   - Percentage

8. **Qual./Cond.** 📍
   - Dropdown (Good/New, Average, Fair, etc.)

9. **Sidewall Height** 📍
   - Integer (feet)

10. **Sales Price** 📍
    - Currency

11. **$/SF Building** 📍
    - Currency

12. **CAP Rate** 📍 (Highlighted in yellow on grid)
    - Percentage

**Transactional Adjustments Section:**

13. **Property Rights** 📍
    - Dropdown (Fee Simple, Leased Fee, etc.)

14. **Financing Terms** 📍
    - Dropdown (Cash, Conventional, Seller, etc.)

15. **Conditions of Sale** 📍
    - Dropdown (Arm's length, Estate, REO, etc.)

16. **Time / Market Conditions** 📍
    - Dropdown (Current, Superior, Inferior)
    - Calculated based on sale date vs. effective date.

17. **Total Transactional Adjustment** 📍
    - Currency or percentage (calculated)

**Property Adjustments Section:**

18. **Location** 📍
    - Dropdown (Good, Inferior, Similar, Superior)

19. **Effective Age** 📍
    - Dropdown (Similar, Inferior, Superior)

20. **Bldg. Size/SF** 📍
    - Dropdown (Similar, Inferior, Superior)

21. **Sidewall Hght** 📍
    - Dropdown (Similar, Inferior)

22. **Qual./Cond.** 📍 (Highlighted in yellow)
    - Dropdown (Superior, Similar, Inferior)

23. **Overall Comparability** 📍 (Highlighted in yellow, bottom row)
    - Dropdown (Inferior, Superior, Similar)
    - N/A for subject

### Step 14.5: Adjustment Analysis
**Screens Required:** 1 screen per sale

**Fields with Yellow Dot Annotations:**

1. **Sale Discussion** 📍
   - Sale number: Auto-populated
   - Location description: Text area
   - Comparability discussion: Text area

2. **Transactional Adjustments**
   - Property Rights adjustment: Currency
   - Explanation: Text
   - Financing Terms adjustment: Currency
   - Explanation: Text
   - Conditions of Sale adjustment: Currency
   - Explanation: Text
   - Time / Market Conditions adjustment: Percentage or Currency
   - Explanation: Text

3. **Property Adjustments**
   - Location: Currency
   - Explanation: Text
   - Size: Currency
   - Explanation: Text
   - Age: Currency
   - Explanation: Text
   - Condition: Currency
   - Explanation: Text
   - Other: Currency
   - Explanation: Text

### Step 14.6: Sales Comparison Conclusion
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Reconciliation** 📍
   - Sale 1 adjusted value: Currency
   - Weight: Percentage
   - Sale 2 adjusted value: Currency
   - Weight: Percentage
   - Sale 3 adjusted value: Currency
   - Weight: Percentage
   - Sale 4 adjusted value: Currency
   - Weight: Percentage

2. **Weighted Average** 📍
   - Calculated value: Currency

3. **Conclusion** 📍
   - **Indicated Value by Sales Comparison**: Currency
   - Rounding explanation: Text

---

## SECTION 15: INCOME APPROACH

### Step 15.1: Income Approach Method Selection
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Method** 📍
   - Dropdown:
     - Direct Capitalization
     - Discounted Cash Flow
     - Not Applicable
   
2. **Justification** 📍
   - Text area

### Step 15.2: Rental Income Analysis
**Screens Required:** 1 screen

**Fields needed:**

1.  **Market Rent Survey (Lease Comps)**
    *   Comparable rentals: Repeatable section
    *   **Fields for each comp:**
        *   `Contract Rent`: Currency per SF
        *   `Lease Type`: (NNN, Gross, etc.)
        *   `Term`: Months/Years
        *   `Tenant Improvements (TI) Allowance`: Currency per SF
        *   `Free Rent Period`: Months
        *   `Escalations`: Text (e.g., 3% annual)
    *   **Calculated Field:** `Effective Rent` per SF
    *   Conclusion: Reconciled Market Rent per SF or per unit

2.  **Subject Property Potential Income**
   - Number of units: Integer
   - Average size: Integer
   - Market rent per SF: Currency
   - Potential Gross Income: Currency (calculated)

### Step 15.3: Operating Expenses
**Screens Required:** 1 screen

**Fields needed:**

1. **Expense Categories**
   - Management: Currency or Percentage
   - Maintenance: Currency
   - Insurance: Currency
   - Property taxes: Currency
   - Utilities: Currency
   - Reserves: Currency
   - Other: Currency

2. **Total Operating Expenses** 📍
   - Amount: Currency (calculated)

3. **Net Operating Income** 📍
   - PGI: Currency
   - Less vacancy: Currency
   - Effective Gross Income: Currency
   - Less expenses: Currency
   - **NOI**: Currency (calculated)

### Step 15.4: Capitalization Rate
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1.  **Cap Rate Analysis (Cap Rate Comps)** 📍
    *   Description: Text area
    *   Market survey: Text area

2.  **Comparable Sales Cap Rates** 📍 (from sales grid)
    *   **Fields for each comp:**
        *   `As-Sold Cap Rate`: Percentage
        *   `Location Quality`: Dropdown (A, B, C)
        *   `Tenant Credit Quality`: Dropdown (Investment Grade, Local, etc.)
        *   `Weighted Avg. Lease Term`: Years
        *   `Occupancy Rate`: Percentage
    *   **Calculated Field:** `Adjusted Cap Rate` for each comp after risk adjustments.

3.  **Risk Assessment** 📍
   - Subject risk analysis: Text area
   - Risk factors: Multiple select
     - Project size
     - Location
     - Tenant quality
     - Market conditions
     - Other

4. **Cap Rate Conclusion** 📍
   - Selected cap rate: Percentage
   - Justification: Text area

### Step 15.5: Income Approach Conclusion
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Direct Capitalization Calculation** 📍
   - NOI: Currency
   - Cap Rate: Percentage
   - Formula: NOI ÷ Cap Rate = Value
   - Calculated value: Currency

2. **Rounding** 📍
   - Rounded to: Currency

3. **Conclusion** 📍
   - **Indicated Value by Income Approach**: Currency

---

## SECTION 15.5: MULTI-FAMILY / GRM APPROACH

### Step 15.5.1: GRM Analysis
**Screens Required:** 1 screen

**Fields needed:**

1.  **GRM Calculation from Comps**
    *   For each Multi-Family comparable sale:
        *   `Sale Price`: Currency
        *   `Annual Gross Rent`: Currency
        *   **Calculated:** `Gross Rent Multiplier (GRM)`
    *   Conclusion: Reconciled Market GRM

2.  **Value Indication by GRM**
    *   `Subject Annual Gross Rent`: Currency
    *   `Market GRM`: Multiplier
    *   **Indicated Value by GRM**: Currency (calculated)

### Step 15.5.2: Amenity Analysis
**Screens Required:** 1 screen

**Fields needed:**

1.  **Amenity Checklist**
    *   Checkboxes for common amenities (Pool, Fitness Center, Clubhouse, etc.)
    *   Comparison between Subject and Comps
    *   Amenity Adjustment: per unit or lump sum

---

## SECTION 17: CORRELATION ANALYSIS AND FINAL VALUE

### Step 17.1: Reconciliation of Approaches
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Approach Summary** 📍
   - Cost Approach:
     - Indicated value: Currency
     - Weight: Percentage
     - Reasoning: Text area
   - Sales Comparison:
     - Indicated value: Currency
     - Weight: Percentage
     - Reasoning: Text area
   - Income Approach:
     - Indicated value: Currency
     - Weight: Percentage
     - Reasoning: Text area

2. **"As Completed" Value** 📍
   - Weighted value: Currency (calculated)
   - Final value: Currency
   - Rounding explanation: Text

3. **"As Stabilized" Value** 📍
   - Weighted value: Currency (calculated)
   - Final value: Currency
   - Rounding explanation: Text

4. **"As Is" Value** 📍
   - Land value: Currency
   - Remainder parcel: Currency
   - Final value: Currency

### Step 17.2: Final Value Conclusion
**Screens Required:** 1 screen (Summary)

**Fields with Yellow Dot Annotations:**

1. **Final Value Opinions** 📍
   - **"As Completed" Market Value**: Currency
   - **Effective Date**: Date
   - **"As Stabilized" Market Value**: Currency
   - **Effective Date**: Date
   - **"As Is" Market Value**: Currency
   - **Effective Date**: Date

2. **Exposure Period** 📍
   - Period: Text

3. **Marketing Time** 📍
   - Period: Text

---

## SECTION 18: CERTIFICATION

### Step 18.1: Certification Statement
**Screens Required:** 1 screen

**Fields with Yellow Dot Annotations:**

1. **Certification Checklist** 📍
   - Standard certification statements (auto-populated)
   - Appraiser attestation: Checkbox for each item

2. **Appraiser Signature** 📍
   - Signature: Signature field or upload
   - Print name: Text
   - Date: Date
   - License/Certification #: Text

3. **Additional Certifying Appraisers**
   - Name: Text
   - Signature: Signature field
   - Date: Date
   - License #: Text

---

## SECTION 19: QUALIFICATIONS

### Step 19.1: Appraiser Qualifications
**Screens Required:** 1 screen per appraiser

**Fields needed:**

1. **Education**
   - Degrees: Repeatable text fields
   - Institutions: Text
   - Years: Integer

2. **Professional Designations**
   - MAI, SRA, CCIM, etc.: Checkboxes or text

3. **Licenses/Certifications**
   - State: Text
   - License #: Text
   - Expiration: Date

4. **Experience**
   - Years in practice: Integer
   - Specializations: Multiple select
   - Types of properties appraised: Text area

5. **Professional Affiliations**
   - Organizations: Text list

---

## SECTION 20: ASSUMPTIONS & LIMITING CONDITIONS

### Step 20.1: Standard Assumptions
**Screens Required:** 1 screen

**Fields needed:**

1. **Limiting Conditions** 📍
   - Standard conditions: Pre-populated checklist (editable)
   - Additional conditions: Text area

---

## SECTION 21: ADDENDA

### Step 21.1: Supporting Documentation
**Screens Required:** 1 screen (file upload manager)

**Fields with Yellow Dot Annotations:**

1. **Required Addenda** 📍
   - Aerial photograph: File upload
   - Subject property photos: Multiple file uploads
   - County Orion detail: File upload
   - Plat map: File upload
   - Proposed site plan: File upload
   - Floor plans: Multiple uploads
   - Elevations: Multiple uploads
   - Land sales map: File upload
   - Improved sales map: File upload
   - Rental comparables map: File upload
   - Letter of engagement: File upload
   - State licenses: File upload (for each appraiser)

2. **Optional Addenda**
   - Additional photos: Multiple uploads
   - Market studies: File upload
   - Rent rolls: File upload
   - Other: Multiple uploads with descriptions

---

## WORKFLOW NAVIGATION STRUCTURE

### Navigation Model

```
Appraisal Wizard
├── 1. Getting Started
│   ├── 1.1 Project Setup
│   ├── 1.2 Client & Property Info
│   └── 1.3 Value Dates & Types
│
├── 2. Property Identification
│   ├── 2.1 Subject Property
│   ├── 2.2 Legal Description
│   ├── 2.3 Ownership
│   └── 2.4 Site Description
│
├── 3. Improvements
│   ├── 3.1 Building Overview
│   ├── 3.2 Unit Mix (per building)
│   ├── 3.3 Construction Details
│   └── 3.4 Site Improvements
│
├── 4. Market Analysis
│   ├── 4.1 General Area
│   ├── 4.2 Neighborhood
│   ├── 4.3 Market Conditions
│   └── 4.4 Highest & Best Use
│
├── 5. Valuation Approaches
│   ├── 5.1 Approach Selection
│   ├── 5.2 Land Valuation
│   ├── 5.3 Cost Approach
│   │   ├── 5.3.1 Improvement Costs
│   │   ├── 5.3.2 Depreciation
│   │   └── 5.3.3 Cost Conclusion
│   ├── 5.4 Sales Comparison
│   │   ├── 5.4.1 Comparable Search
│   │   ├── 5.4.2 Comp Data Entry (per comp)
│   │   ├── 5.4.3 Adjustment Grid
│   │   ├── 5.4.4 Adjustment Analysis
│   │   └── 5.4.5 Sales Conclusion
│   └── 5.5 Income Approach
│       ├── 5.5.1 Rental Analysis
│       ├── 5.5.2 Operating Expenses
│       ├── 5.5.3 Cap Rate
│       └── 5.5.4 Income Conclusion
│
├── 6. Reconciliation
│   ├── 6.1 Approach Weighting
│   ├── 6.2 Final Values
│   └── 6.3 Exposure Period
│
├── 7. Report Components
│   ├── 7.1 Purpose & Scope
│   ├── 7.2 Assumptions & Conditions
│   ├── 7.3 Transmittal Letter
│   ├── 7.4 Certification
│   └── 7.5 Qualifications
│
└── 8. Addenda & Finalize
    ├── 8.1 Photo Upload
    ├── 8.2 Maps & Plans
    ├── 8.3 Supporting Documents
    └── 8.4 Review & Generate
```

---

## UI/UX DESIGN SPECIFICATIONS

### Design Pattern
- Similar to Evaluation Wizard
- Left sidebar navigation (collapsible sections)
- Main content area with form fields
- Right sidebar for help text and definitions
- Progress indicator at top
- Save & Continue / Previous buttons at bottom

### Special Components Needed

1. **Repeating Building Section**
   - Add/Remove building blocks
   - Each with unit table
   - Auto-numbering

2. **Sales Comparison Grid**
   - Spreadsheet-style entry
   - Dropdown cells
   - Auto-calculation cells
   - Color coding (yellow highlights)
   - Export to Excel option

3. **Map Integration**
   - For neighborhood boundaries
   - For comp locations
   - Drawing tools

4. **Document Uploader**
   - Drag & drop
   - Image preview
   - PDF preview
   - Organize by category

5. **Signature Fields**
   - Digital signature pad
   - Upload signature image
   - Date stamp

6. **Merge Field Tags**
   - Throughout text areas
   - Auto-populate from earlier entries
   - Preview merged text

7. **Auto-Calculation Fields**
   - Currency calculations
   - Percentage calculations
   - Square footage conversions
   - Weighted averages

8. **Date Validation**
   - Effective dates logic
   - Future date warnings
   - Date sequence validation

---

## DATA RELATIONSHIPS

### Key Dependencies

1. **Property Info → Throughout Report**
   - Address
   - Legal description
   - Owner
   - Property type

2. **Value Dates → Conclusions**
   - As Is: Linked to inspection date
   - As Completed: Future date
   - As Stabilized: Future date after completion

3. **Buildings → Multiple Sections**
   - Improvement description
   - Cost approach
   - Unit mix tables
   - Photos

4. **Sales Comps → Multiple Uses**
   - Sales comparison grid
   - Cap rate analysis (if income-producing)
   - Market conditions support

5. **Land Value → Final Values**
   - As Is value (land + remainder)
   - Cost approach (land + depreciated improvements)

---

## REPORT GENERATION

### Output Formats

1. **PDF Report**
   - Professional formatting
   - Page numbers
   - Table of contents
   - Bookmarks
   - Addenda properly organized

2. **Word Document**
   - Editable format
   - Styles preserved
   - Tables formatted

3. **Summary Sheet**
   - One-page summary
   - Key values
   - Property overview

---

## DATABASE SCHEMA CONSIDERATIONS

### New Tables Needed

1. **appraisals**
   - Links to existing client/property tables
   - Multiple value types
   - Status tracking

2. **appraisal_buildings**
   - Building-level details
   - Links to appraisal

3. **appraisal_units**
   - Unit-level details
   - Links to building

4. **appraisal_comparables**
   - Reusable comp database
   - Property type
   - Sale details
   - Can be linked to multiple appraisals

5. **appraisal_adjustments**
   - Links comp to appraisal
   - Adjustment amounts
   - Explanations

6. **appraisal_approaches**
   - Stores calculated values
   - Weights
   - Conclusions

7. **appraisal_addenda**
   - File storage
   - Category
   - Order

---

## IMPLEMENTATION PHASES

### Phase 1: Core Setup (Weeks 1-2)
- Database schema
- Basic wizard structure
- Navigation framework
- Property identification screens

### Phase 2: Valuation Approaches (Weeks 3-5)
- Cost approach screens
- Sales comparison grid
- Income approach screens
- Auto-calculations

### Phase 3: Supporting Sections (Weeks 6-7)
- Market analysis
- Highest & best use
- Assumptions & conditions
- Certification

### Phase 4: Addenda & Generation (Week 8)
- File upload system
- Report templates
- PDF generation
- Review system

### Phase 5: Polish & Test (Weeks 9-10)
- UI refinements
- Validation logic
- Error handling
- User testing

---

## INTEGRATION POINTS

### Existing System Integration

1. **Client Portal**
   - Client requests appraisal
   - Status updates
   - Report delivery

2. **Document Management**
   - Store work files
   - Version control
   - Collaboration

3. **Comp Database**
   - Search existing comps
   - Add new comps
   - Share across appraisals

4. **User Management**
   - Appraiser assignments
   - Permissions
   - License tracking

5. **Billing**
   - Fee tracking
   - Invoice generation
   - Payment status

---

## VALIDATION RULES

### Critical Validations

1. **Date Logic**
   - Report date >= Inspection date
   - As Completed date > As Is date
   - As Stabilized date >= As Completed date

2. **Value Logic**
   - All approach values must be > 0
   - Weights must sum to 100%
   - Final value should be within reasonable range of approaches

3. **Required Fields**
   - Property identification
   - At least one approach
   - Certification
   - Signature

4. **Completeness Checks**
   - All sections visited
   - All conditional fields completed
   - Minimum photo requirements
   - Required addenda uploaded

---

## HELP SYSTEM

### Context-Sensitive Help

1. **Field-Level Help**
   - Tooltip on hover
   - Info icon with expanded explanation
   - Examples

2. **Section-Level Help**
   - What to include
   - Common mistakes
   - USPAP requirements

3. **Definitions**
   - Appraisal terms
   - Automatically displayed for key concepts
   - Linked to glossary

4. **Video Tutorials**
   - Getting started
   - Complex sections (sales grid, etc.)
   - Best practices

---

## QUALITY CONTROL FEATURES

1. **Auto-Save**
   - Save every 30 seconds
   - Save on navigation
   - Restore on crash

2. **Version History**
   - Track changes
   - Restore previous versions
   - Audit trail

3. **Review Checklist**
   - Pre-generation check
   - Flag potential issues
   - Completeness score

4. **Peer Review**
   - Assign reviewer
   - Comment system
   - Approval workflow

---

## ACCESSIBILITY

1. **Keyboard Navigation**
   - Tab order
   - Shortcuts
   - Skip links

2. **Screen Reader Support**
   - ARIA labels
   - Alt text
   - Semantic HTML

3. **Color Contrast**
   - WCAG AA compliance
   - Not relying on color alone

---

## PERFORMANCE CONSIDERATIONS

1. **Lazy Loading**
   - Load sections on demand
   - Image optimization
   - Pagination for long lists

2. **Caching**
   - Client-side caching
   - Comp search results
   - User preferences

3. **Optimization**
   - Minimize API calls
   - Batch operations
   - Background processing for PDF generation

---

## SECURITY

1. **Data Protection**
   - Encryption at rest
   - SSL/TLS in transit
   - Access controls

2. **Authentication**
   - Multi-factor option
   - Session management
   - Auto-logout

3. **Authorization**
   - Role-based access
   - Appraisal ownership
   - Client data separation

---

## TESTING STRATEGY

1. **Unit Tests**
   - Calculation logic
   - Validation rules
   - Data transformations

2. **Integration Tests**
   - Wizard flow
   - Report generation
   - Database operations

3. **User Acceptance Testing**
   - Real appraisers
   - Sample reports
   - Feedback incorporation

4. **Performance Testing**
   - Load testing
   - PDF generation speed
   - Concurrent users

---

## DOCUMENTATION

1. **User Guide**
   - Step-by-step instructions
   - Screenshots
   - FAQs

2. **Admin Guide**
   - Setup
   - Configuration
   - Maintenance

3. **Developer Docs**
   - API documentation
   - Database schema
   - Extension points

---

## FUTURE ENHANCEMENTS

1. **AI Integration**
   - Auto-fill from PDFs
   - Comp suggestions
   - Market analysis summaries

2. **Mobile App**
   - Field inspection
   - Photo capture
   - Offline mode

3. **Advanced Analytics**
   - Market trends
   - Performance metrics
   - Comp database insights

4. **Collaboration**
   - Multi-appraiser assignments
   - Real-time editing
   - Comments & discussions

---

## SUMMARY

This Appraisal Wizard will provide a comprehensive, guided interface for creating USPAP-compliant commercial appraisal reports. By breaking down the complex appraisal process into manageable steps, validating data at each stage, and automating calculations and report generation, it will significantly improve efficiency and quality for appraisers while maintaining professional standards.

The yellow dot annotations throughout the sample PDF have been catalogued and mapped to specific data fields, ensuring all critical components are captured in the wizard workflow.

---

**Document Version:** 1.0  
**Date:** November 19, 2025  
**Status:** Implementation Plan - Ready for Development

