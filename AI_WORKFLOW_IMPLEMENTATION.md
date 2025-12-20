# AI-Powered Evaluation & Appraisal Workflow Implementation

## Executive Summary

This document outlines a revolutionary AI-powered workflow that automates the evaluation and appraisal process from customer data submission through final report generation. The system automatically selects templates, identifies comparable properties, calculates adjustments, and generates professional reports while maintaining user oversight at critical checkpoints.

**Impact:** This will reduce evaluation creation time from 4-8 hours to 45-90 minutes while improving accuracy and consistency.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Customer Data Intake Methods](#customer-data-intake-methods)
3. [AI Template Selection Engine](#ai-template-selection-engine)
4. [Intelligent Approach Detection](#intelligent-approach-detection)
5. [Approach-Specific AI Workflows](#approach-specific-ai-workflows)
6. [User Checkpoint System](#user-checkpoint-system)
7. [Final Review & Report Generation](#final-review--report-generation)
8. [Technical Implementation](#technical-implementation)
9. [Phased Rollout Plan](#phased-rollout-plan)

---

## System Architecture Overview

### Current System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING HARKEN SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│ • Template System (3-tier: System/Account/Personal)             │
│ • Evaluation Wizard (Multi-step process)                        │
│ • 7 Valuation Approaches (Sales/Income/Cost/Lease/Cap/MF/RR)   │
│ • Comps Database (Sales & Lease comparables)                    │
│ • Report Generation (PDF export)                                │
│ • Google Gemini AI (Already integrated!)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Proposed AI Integration Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER DATA SUBMISSION                         │
│  Email (PDF attachments) OR Client Portal (Web form + uploads)    │
└────────────────────┬───────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────────────┐
│              AI ORCHESTRATION ENGINE (NEW)                         │
│  • Document Parser & Classifier                                    │
│  • Property Type Detector                                          │
│  • Template Matcher                                                │
│  • Approach Recommender                                            │
└────────────────────┬───────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────────────┐
│              AI WORKFLOW PROCESSOR (NEW)                           │
│  Phase 1: Parse uploaded documents → Extract property data        │
│  Phase 2: Select optimal template → Configure approaches          │
│  Phase 3: Auto-select comps → Calculate adjustments               │
│  Phase 4: Populate approach data → Generate calculations          │
│  Phase 5: User review checkpoints → Approve or edit               │
│  Phase 6: Generate report → Export PDF                            │
└────────────────────────────────────────────────────────────────────┘
```

---

## Customer Data Intake Methods

### Method 1: Email Submission (Most Common)

**Typical Email Format:**
```
From: client@propertymanagement.com
To: appraisals@harkencre.com
Subject: Appraisal Request - 123 Main St Commercial Office

Attachments:
- Property_Photos.pdf (15 pages)
- Rent_Roll.xlsx
- Current_Lease.pdf
- Property_Survey.pdf
- Title_Report.pdf

Body:
We need an appraisal for refinancing on our office building at 
123 Main Street, Los Angeles, CA 90012. The property is 25,000 SF 
built in 2005. We need it completed by January 30th. Please quote.
```

**AI Processing Steps:**

1. **Email Parsing**
   ```typescript
   interface EmailSubmission {
     from: string;
     subject: string;
     body: string;
     attachments: Array<{
       filename: string;
       fileType: 'pdf' | 'xlsx' | 'docx' | 'jpg' | 'png';
       content: Buffer;
     }>;
     receivedDate: Date;
   }
   ```

2. **Document Classification**
   - AI analyzes each attachment
   - Classifies: Photos, Rent Roll, Lease, Survey, Title, Comps, etc.
   - Extracts text from PDFs using OCR
   - Identifies property address from multiple sources

3. **Property Data Extraction**
   ```typescript
   interface ExtractedPropertyData {
     address: {
       street: string;
       city: string;
       state: string;
       zipcode: string;
     };
     propertyType: 'commercial' | 'residential' | 'land';
     buildingType?: 'office' | 'retail' | 'industrial' | 'multi-family' | 'hotel' | 'special';
     size?: {
       buildingSF?: number;
       landSF?: number;
       landAcres?: number;
       units?: number;
     };
     yearBuilt?: number;
     purpose: 'refinance' | 'acquisition' | 'disposition' | 'portfolio' | 'litigation';
     urgency?: 'rush' | 'standard' | 'flexible';
     dueDate?: Date;
   }
   ```

### Method 2: Client Portal Submission

**Portal Form Fields:**
```html
<form id="request-evaluation-form">
  <!-- Service Type -->
  <select name="service_type">
    <option value="appraisal">Full Appraisal (USPAP)</option>
    <option value="evaluation">Evaluation</option>
    <option value="bov">Broker Opinion of Value</option>
  </select>

  <!-- Property Information -->
  <input name="property_address" placeholder="123 Main Street" required />
  <input name="city" placeholder="Los Angeles" required />
  <select name="state" required><!-- 50 states --></select>
  <input name="zipcode" required />

  <!-- Property Details -->
  <select name="property_category">
    <option value="commercial">Commercial</option>
    <option value="residential">Residential (1-4 units)</option>
    <option value="land">Land / Vacant</option>
  </select>

  <select name="building_type" id="building-type">
    <!-- Dynamic based on property_category -->
  </select>

  <input type="number" name="building_sf" placeholder="Square Feet" />
  <input type="number" name="land_size" placeholder="Land Size" />
  <select name="land_dimension">
    <option value="SF">Square Feet</option>
    <option value="ACRE">Acres</option>
  </select>

  <input type="number" name="year_built" placeholder="Year Built" />
  <input type="number" name="units" placeholder="Number of Units (if multi-family)" />

  <!-- Purpose & Timeline -->
  <select name="purpose">
    <option value="refinance">Refinancing</option>
    <option value="acquisition">Acquisition</option>
    <option value="sale">Sale/Disposition</option>
    <option value="portfolio">Portfolio Review</option>
    <option value="litigation">Litigation Support</option>
    <option value="estate">Estate Planning</option>
  </select>

  <input type="date" name="due_date" required />

  <!-- File Uploads -->
  <div class="file-upload-section">
    <label>Upload Documents (optional but recommended)</label>
    <input type="file" name="photos" multiple accept="image/*,.pdf" />
    <input type="file" name="rent_roll" accept=".xlsx,.pdf" />
    <input type="file" name="lease_documents" multiple accept=".pdf" />
    <input type="file" name="financial_statements" accept=".pdf,.xlsx" />
    <input type="file" name="property_survey" accept=".pdf" />
    <input type="file" name="other_documents" multiple />
  </div>

  <!-- Special Instructions -->
  <textarea name="special_instructions" rows="4"></textarea>

  <button type="submit">Submit Request</button>
</form>
```

**Portal Advantages:**
- ✅ Structured data (no parsing needed)
- ✅ Validated inputs (dropdowns prevent errors)
- ✅ Real-time file upload with progress
- ✅ Client can track status after submission

---

## AI Template Selection Engine

### Step 1: Property Classification

**AI Analysis Process:**

```typescript
async function classifyProperty(data: ExtractedPropertyData): Promise<PropertyClassification> {
  const prompt = `
    Analyze this property and classify it:
    
    Address: ${data.address.street}, ${data.city}, ${data.state}
    Building Size: ${data.size.buildingSF} SF
    Land Size: ${data.size.landSF} SF
    Units: ${data.size.units}
    Year Built: ${data.yearBuilt}
    
    Determine:
    1. Property Category (commercial/residential/land)
    2. Building Type (office/retail/industrial/multi-family/hotel/special/residential)
    3. Most Likely Use
    4. Complexity Level (simple/moderate/complex)
    
    Return JSON only.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

**AI Output:**
```json
{
  "propertyCategory": "commercial",
  "buildingType": "multi-family",
  "primaryUse": "Apartment Complex",
  "complexityLevel": "moderate",
  "reasoning": "75+ units indicate multi-family commercial property. Requires income approach and rent roll analysis.",
  "confidence": 95
}
```

### Step 2: Template Matching

**AI Template Selection Algorithm:**

```typescript
async function selectOptimalTemplate(
  classification: PropertyClassification,
  purpose: string,
  availableData: string[]
): Promise<TemplateRecommendation> {
  
  // Get all available templates filtered by property type
  const candidateTemplates = await db.templates.findAll({
    where: {
      property_category: classification.propertyCategory,
      is_enabled: true,
      $or: [
        { account_id: user.account_id },  // Account templates
        { account_id: null }              // System templates
      ]
    }
  });
  
  // AI scores each template
  const prompt = `
    Property Classification:
    - Category: ${classification.propertyCategory}
    - Type: ${classification.buildingType}
    - Complexity: ${classification.complexityLevel}
    - Purpose: ${purpose}
    
    Available Data:
    ${availableData.join(', ')}
    
    Template Options:
    ${JSON.stringify(candidateTemplates, null, 2)}
    
    Score each template 0-100 based on:
    1. Property type match
    2. Approach availability for this property
    3. Scenario configuration (does it need As-Completed?)
    4. Data requirements vs available data
    5. Complexity match
    
    Return: Best template ID and reasoning.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

**AI Recommendation Output:**
```json
{
  "selectedTemplateId": 47,
  "templateName": "Multi-Family Evaluation - Standard",
  "matchScore": 92,
  "reasoning": "Perfect match for 75-unit apartment complex. Template includes Multi-Family Approach, Income Approach, and Rent Roll analysis which align with available rent roll data. Property complexity matches template sophistication.",
  "alternativeTemplates": [
    {
      "templateId": 52,
      "name": "Multi-Family As-Is/As-Completed",
      "score": 78,
      "why": "Use this if property is undergoing renovations"
    }
  ],
  "confidence": "high"
}
```

### Step 3: Scenario Detection

**AI Determines Scenario Needs:**

```typescript
async function detectScenarioRequirements(
  data: ExtractedPropertyData,
  purpose: string,
  documents: ParsedDocument[]
): Promise<ScenarioConfig> {
  
  const prompt = `
    Property Purpose: ${purpose}
    
    Document Analysis:
    ${documents.map(d => `- ${d.type}: ${d.summary}`).join('\n')}
    
    Questions:
    1. Is property under construction or renovation? (Needs As-Completed)
    2. Is property vacant or needs stabilization? (Needs As-Stabilized)
    3. Is this a retrospective valuation? (Needs historical scenario)
    4. Multiple scenarios needed?
    
    Return scenario configuration.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

**Scenario Configuration Output:**
```json
{
  "scenarioType": "single",
  "scenarios": [
    {
      "name": "As-Is",
      "type": "as_is",
      "effectiveDate": "2025-01-15",
      "description": "Current market value in present condition",
      "hypotheticalConditions": null
    }
  ],
  "reasoning": "No construction or renovation mentioned. Property is operational. Single As-Is scenario is appropriate for refinancing purpose.",
  "confidence": 90
}
```

---

## Intelligent Approach Detection

### AI Approach Recommender

**Based on:**
1. Property type
2. Available data
3. Template configuration
4. Purpose of valuation
5. Industry best practices

```typescript
async function recommendApproaches(
  propertyClassification: PropertyClassification,
  availableData: AvailableDataTypes,
  purpose: string
): Promise<ApproachRecommendation> {
  
  const prompt = `
    Property: ${propertyClassification.buildingType}
    Purpose: ${purpose}
    
    Available Data:
    - Rent Roll: ${availableData.hasRentRoll}
    - Financial Statements: ${availableData.hasFinancials}
    - Recent Sales Comps: ${availableData.compsCount} in database
    - Lease Information: ${availableData.hasLeases}
    
    For this ${propertyClassification.buildingType} property used for ${purpose}:
    1. Which approaches are REQUIRED by industry standards?
    2. Which approaches are RECOMMENDED for best practice?
    3. Which approaches are OPTIONAL but helpful?
    4. What is the typical weighting for each approach?
    
    Return structured JSON.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

**AI Output Example (Multi-Family):**
```json
{
  "approaches": {
    "required": [
      {
        "type": "income",
        "reason": "Multi-family properties are income-producing. Income approach is primary valuation method.",
        "weight": 50,
        "dataNeeded": ["rent_roll", "operating_expenses", "cap_rate"]
      },
      {
        "type": "multi_family",
        "reason": "Specialized approach for apartment complexes using GRM analysis.",
        "weight": 30,
        "dataNeeded": ["rent_roll", "unit_mix", "comparable_properties"]
      }
    ],
    "recommended": [
      {
        "type": "sales",
        "reason": "Sales comparison provides market validation of income approach.",
        "weight": 15,
        "dataNeeded": ["comparable_sales", "adjustments"]
      },
      {
        "type": "rent_roll",
        "reason": "Detailed unit-level analysis strengthens income approach.",
        "weight": 5,
        "dataNeeded": ["detailed_rent_roll", "unit_sqft", "lease_terms"]
      }
    ],
    "optional": [
      {
        "type": "cost",
        "reason": "Cost approach typically given minimal weight for income properties unless new construction.",
        "weight": 0,
        "useIf": "property less than 2 years old"
      }
    ]
  },
  "totalWeight": 100,
  "confidence": 95
}
```

---

## Approach-Specific AI Workflows

### 1. Sales Comparison Approach - AI Workflow

#### Step 1: Automatic Comp Selection

```typescript
async function autoSelectComps(
  subjectProperty: Property,
  filters: CompFilters
): Promise<RankedComps[]> {
  
  // Phase 1: Hard SQL filters (fast)
  const candidateComps = await db.comps.findAll({
    where: {
      building_type: subjectProperty.building_type,
      type: 'sale',
      building_size: {
        $between: [
          subjectProperty.building_size * 0.5,
          subjectProperty.building_size * 2.0
        ]
      },
      date_sold: {
        $gte: moment().subtract(24, 'months').toDate()
      }
    },
    // Use geographic distance SQL function
    having: db.sequelize.literal(`
      (6371 * acos(
        cos(radians(${subjectProperty.latitude})) 
        * cos(radians(latitude)) 
        * cos(radians(longitude) - radians(${subjectProperty.longitude})) 
        + sin(radians(${subjectProperty.latitude})) 
        * sin(radians(latitude))
      )) <= 10
    `),
    limit: 50
  });
  
  // Phase 2: AI Similarity Scoring (detailed)
  const scoredComps = await Promise.all(
    candidateComps.map(comp => calculateSimilarityScore(subjectProperty, comp))
  );
  
  // Return top 10 ranked by similarity
  return scoredComps
    .filter(c => c.score >= 55) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
```

#### Step 2: AI Adjustment Calculations

**For Each Comp:**

```typescript
async function calculateAdjustments(
  subject: Property,
  comp: Property,
  marketData: MarketData
): Promise<AdjustmentGrid> {
  
  const prompt = `
    Calculate adjustments TO comparable FOR differences from subject:
    
    SUBJECT PROPERTY:
    ${JSON.stringify(subject, null, 2)}
    
    COMPARABLE PROPERTY:
    ${JSON.stringify(comp, null, 2)}
    
    MARKET DATA:
    - Average time adjustment: ${marketData.monthlyAppreciation}% per month
    - Average size adjustment: $${marketData.sizeAdjustmentPerSF} per SF difference
    - Location premium subject area: ${marketData.locationPremium}%
    
    CALCULATE ADJUSTMENTS for:
    1. Time/Market Conditions (months since sale × monthly rate)
    2. Location (use paired sales data if available)
    3. Size (use diminishing returns principle)
    4. Condition (cost to cure deferred maintenance)
    5. Age/Year Built (economic life depreciation)
    6. Parking (spaces per 1000 SF)
    7. Other physical differences
    
    For EACH adjustment provide:
    - Amount ($)
    - Percentage (%)
    - Direction (+ or -)
    - Calculation method
    - Supporting data
    - Confidence level
    
    Return structured JSON.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

**AI Adjustment Output:**
```json
{
  "comp_id": 12345,
  "comp_address": "456 Commerce Dr",
  "sale_price": 2500000,
  "adjustments": [
    {
      "category": "Time/Market Conditions",
      "analysis": "Comp sold 18 months ago. Market appreciation 0.9% per month based on 42 repeat sales.",
      "calculation": "$2,500,000 × (0.009 × 18) = $405,000",
      "amount": 405000,
      "percentage": 16.2,
      "direction": "upward",
      "reasoning": "Market has appreciated since comp sale. Adjust comp UPWARD.",
      "supporting_data": "42 repeat sales, CBRE index confirms 15.8% appreciation",
      "confidence": "very_high",
      "data_points": 42
    },
    {
      "category": "Location",
      "analysis": "Subject in superior submarket. 12% price premium based on 15 paired sales.",
      "calculation": "$2,500,000 × 0.12 = $300,000",
      "amount": 300000,
      "percentage": 12,
      "direction": "upward",
      "reasoning": "Comp in inferior location. Adjust comp UPWARD to equalize.",
      "supporting_data": "15 paired sales show 10-14% premium",
      "confidence": "high",
      "data_points": 15
    },
    {
      "category": "Size",
      "analysis": "Comp is 5,000 SF larger (30,000 vs 25,000). Additional space worth $45/SF based on paired sales.",
      "calculation": "5,000 SF × $45/SF = $225,000",
      "amount": -225000,
      "percentage": -9,
      "direction": "downward",
      "reasoning": "Comp is LARGER, therefore worth MORE. SUBTRACT from comp's sale price.",
      "supporting_data": "3 paired sales average $40-50/SF for incremental space",
      "confidence": "high",
      "data_points": 8
    },
    {
      "category": "Condition",
      "analysis": "Comp has deferred maintenance ($280K) vs subject's recent improvements ($350K).",
      "calculation": "($280K × 0.5) + ($350K × 0.4) = $280,000 gap",
      "amount": 280000,
      "percentage": 11.2,
      "direction": "upward",
      "reasoning": "Market penalizes deferred maintenance at 50% of cost. Adjust comp UPWARD.",
      "supporting_data": "Marshall & Swift cost data + market depreciation analysis",
      "confidence": "medium_high",
      "data_points": 12
    },
    {
      "category": "Parking",
      "analysis": "Subject has 4.0 spaces/1000 SF. Comp has only 2.5 (non-conforming, below 3.0 minimum).",
      "calculation": "45 fewer spaces × $5,000/space = $225,000",
      "amount": -225000,
      "percentage": -9,
      "direction": "downward",
      "reasoning": "Comp has parking deficit worth $225K LESS. SUBTRACT from comp.",
      "supporting_data": "Paired sales show $5K per space, zoning requires 3.0 minimum",
      "confidence": "high",
      "data_points": 3
    },
    {
      "category": "Age/Year Built",
      "analysis": "Comp is 10 years older (built 2005 vs 2015). 2% annual depreciation.",
      "calculation": "10 years × 2% = 20% × $2,500,000 = $500,000",
      "amount": 500000,
      "percentage": 20,
      "direction": "upward",
      "reasoning": "Comp is OLDER, less valuable. Adjust comp UPWARD.",
      "supporting_data": "Economic age-life tables, paired sales confirm 1.5-2.5% annual",
      "confidence": "medium",
      "data_points": 18
    }
  ],
  "summary": {
    "total_adjustments": 1035000,
    "net_adjustment_percentage": 41.4,
    "adjusted_sale_price": 3535000,
    "indicated_value_per_sf": 141.40,
    "subject_implied_value": 3535000,
    "quality_assessment": {
      "total_gross_adjustments": 79.4,
      "status": "CAUTION",
      "recommendation": "High total adjustments. Consider finding closer comparables.",
      "usability": "Fair - use as supporting comp, not primary"
    },
    "confidence_score": 72,
    "weight_recommendation": 15
  },
  "ai_narrative": "This comparable sold for $2,500,000 in mid-2023, approximately 18 months prior to valuation date. Market analysis indicates 16.2% appreciation requiring +$405K adjustment. The comparable is in an inferior submarket (12% lower values, +$300K adjustment), is 20% larger (-$225K adjustment), shows deferred maintenance (+$280K adjustment), has deficient parking (-$225K adjustment), and is 10 years older (+$500K adjustment). After adjustments totaling +$1,035,000 (41.4%), this comparable indicates a value of $3,535,000 for the subject, or $141.40 per square foot. The elevated adjustment percentage suggests this is a reasonable but not ideal comparable."
}
```

#### Step 3: User Checkpoint - Sales Approach Review

**UI Display:**

```
┌──────────────────────────────────────────────────────────────────┐
│  SALES COMPARISON APPROACH - REVIEW & APPROVE                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✓ AI Selected 6 Comparables                                     │
│  ✓ AI Calculated All Adjustments                                 │
│  ✓ Indicated Value: $3,485,000 ($139.40/SF)                     │
│                                                                   │
│  Confidence Score: ████████░░ 82/100 (High)                      │
│                                                                   │
│  📊 COMPARABLES SUMMARY                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Comp 1: 456 Commerce Dr     87% Match  [$3,364,000]  25%  │ │
│  │ Comp 2: 789 Business Blvd   84% Match  [$3,580,000]  25%  │ │
│  │ Comp 3: 123 Corporate Way   81% Match  [$3,425,000]  20%  │ │
│  │ Comp 4: 555 Office Plaza    78% Match  [$3,510,000]  15%  │ │
│  │ Comp 5: 321 Trade Center    76% Match  [$3,620,000]  10%  │ │
│  │ Comp 6: 888 Executive Dr    73% Match  [$3,410,000]  5%   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ⚠️  ALERTS & RECOMMENDATIONS                                    │
│  • Comp 1 has high gross adjustments (67.6%) - Review carefully  │
│  • All comps are within 10 miles - Good geographic clustering   │
│  • 4 of 6 comps sold within last 12 months - Excellent recency  │
│                                                                   │
│  💡 AI INSIGHTS                                                  │
│  "Strong comparable selection with excellent geographic and      │
│   temporal distribution. Adjustments are well-supported by       │
│   market data. Recommend approving with possible review of       │
│   Comp 1 adjustments due to magnitude."                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [View Detailed Adjustments]  [Edit Comps]  [Rerun AI]    │ │
│  │                                                             │ │
│  │  [✓ Approve & Continue]      [← Back]                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

### 2. Income Approach - AI Workflow

#### Step 1: Parse Rent Roll & Financial Data

```typescript
async function parseRentRoll(
  rentRollFile: File | Buffer
): Promise<RentRollData> {
  
  // Extract data from Excel or PDF
  const rawData = await extractRentRollData(rentRollFile);
  
  const prompt = `
    Parse this rent roll data and structure it:
    
    ${rawData}
    
    Extract for EACH UNIT:
    - Unit number/ID
    - Square footage
    - Number of bedrooms/bathrooms (if residential)
    - Current monthly rent
    - Lease start date
    - Lease expiration date
    - Tenant name (optional)
    - Status (occupied/vacant)
    
    Calculate:
    - Total units
    - Occupied units
    - Vacant units
    - Occupancy rate
    - Total monthly income
    - Average rent per unit
    - Average rent per SF
    
    Return structured JSON.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

#### Step 2: AI Calculates Income & Expenses

```typescript
async function calculateIncomeApproach(
  rentRollData: RentRollData,
  operatingExpenses: OperatingExpenses,
  marketData: MarketData
): Promise<IncomeApproachCalculation> {
  
  const prompt = `
    Calculate Income Approach valuation:
    
    RENT ROLL SUMMARY:
    - Total Units: ${rentRollData.totalUnits}
    - Occupied: ${rentRollData.occupiedUnits}
    - Current Occupancy: ${rentRollData.occupancyRate}%
    - Total Monthly Rent: $${rentRollData.totalMonthlyRent}
    
    MARKET DATA:
    - Market occupancy rate: ${marketData.marketOccupancy}%
    - Market cap rate range: ${marketData.capRateRange}
    - Comparable rent per SF: $${marketData.avgRentPerSF}
    
    CALCULATE:
    
    1. Potential Gross Income (PGI)
       - Current rent vs market rent analysis
       - Adjust for below/above market units
    
    2. Vacancy & Collection Loss
       - Use market rate: ${marketData.marketOccupancy}%
       - Consider property-specific factors
    
    3. Effective Gross Income (EGI)
       - PGI minus V&C loss
    
    4. Operating Expenses
       - ${JSON.stringify(operatingExpenses)}
       - Verify against market standards ($X per unit)
    
    5. Net Operating Income (NOI)
       - EGI minus Operating Expenses
    
    6. Market Value
       - NOI / Market Cap Rate
       - Cap rate: ${marketData.capRateRange}
       - Justify selected cap rate
    
    Provide detailed calculations with explanations.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

**AI Income Approach Output:**
```json
{
  "income_calculation": {
    "step_1_pgi": {
      "current_total_rent": 112500,
      "market_analysis": {
        "units_at_market": 65,
        "units_below_market": 10,
        "below_market_adjustment": 8500,
        "reasoning": "10 units average $850/month below market. Upward adjustment."
      },
      "potential_gross_income_monthly": 121000,
      "potential_gross_income_annual": 1452000,
      "calculation": "(Current $112,500 + Market Adjustment $8,500) × 12"
    },
    "step_2_vacancy": {
      "market_vacancy_rate": 5,
      "property_specific_factors": [
        "Property is well-maintained (0.5% reduction)",
        "Strong submarket (-0.5% reduction)",
        "Current 98% occupied (good indicator)"
      ],
      "adjusted_vacancy_rate": 4,
      "vacancy_loss": 58080,
      "calculation": "$1,452,000 × 0.04",
      "reasoning": "Market average 5%, but property factors support 4% rate"
    },
    "step_3_egi": {
      "effective_gross_income": 1393920,
      "calculation": "$1,452,000 - $58,080"
    },
    "step_4_expenses": {
      "property_taxes": 125000,
      "insurance": 35000,
      "utilities": 85000,
      "repairs_maintenance": 95000,
      "management_fee": 83635,
      "administrative": 25000,
      "reserves": 37500,
      "total_operating_expenses": 486135,
      "expense_per_unit": 6482,
      "market_benchmark": 6200,
      "variance_analysis": "4.5% above market average. Reasonable given property age and amenities.",
      "confidence": "high"
    },
    "step_5_noi": {
      "net_operating_income": 907785,
      "calculation": "$1,393,920 - $486,135",
      "noi_per_unit": 12104
    },
    "step_6_valuation": {
      "market_cap_rate_range": {
        "low": 5.5,
        "average": 6.25,
        "high": 7.0
      },
      "selected_cap_rate": 6.0,
      "justification": "Property is Class B+, well-maintained, strong submarket. Selected rate below market average due to quality and location. Market sales of comparable properties indicate 5.75-6.25% range.",
      "supporting_sales": [
        "123 Parkview Apts - 6.1% cap (similar quality)",
        "456 Valley View - 5.8% cap (superior location)",
        "789 Creekside - 6.3% cap (similar age/condition)"
      ],
      "indicated_value": 15129750,
      "calculation": "$907,785 / 0.06",
      "rounded_value": 15130000,
      "value_per_unit": 201733,
      "confidence": 88
    }
  },
  "summary": {
    "approach": "Income Approach",
    "indicated_value": 15130000,
    "noi": 907785,
    "cap_rate": 6.0,
    "key_metrics": {
      "pgi": 1452000,
      "egi": 1393920,
      "occupancy": 96,
      "expense_ratio": 34.9
    }
  },
  "quality_checks": {
    "expense_ratio_reasonable": true,
    "cap_rate_within_market": true,
    "vacancy_assumption_supported": true,
    "pgi_realistic": true,
    "overall_quality": "high"
  },
  "ai_narrative": "The Income Approach indicates a value of $15,130,000 based on stabilized Net Operating Income of $907,785 capitalized at 6.0%. Potential Gross Income of $1,452,000 reflects current rents adjusted for 10 below-market units. A 4% vacancy rate is justified by the property's 98% current occupancy and strong submarket. Operating expenses of $486,135 are 4.5% above market average but reasonable given property amenities. The 6.0% cap rate is supported by three comparable sales ranging from 5.8% to 6.3%, with this property's Class B+ quality and strong location justifying a rate below the market average of 6.25%."
}
```

#### Step 3: User Checkpoint - Income Approach Review

---

### 3. Cost Approach - AI Workflow

#### Step 1: AI Estimates Replacement Cost

```typescript
async function estimateReplacementCost(
  property: Property,
  marketData: CostData
): Promise<CostEstimate> {
  
  const prompt = `
    Estimate replacement cost new:
    
    PROPERTY:
    - Building Type: ${property.building_type}
    - Size: ${property.building_size} SF
    - Year Built: ${property.year_built}
    - Quality: ${property.condition}
    - Stories: ${property.stories}
    - Construction Class: ${property.construction_class}
    
    COST DATA AVAILABLE:
    - Marshall & Swift base cost: $${marketData.marshallSwiftBaseCost}/SF
    - RS Means data: $${marketData.rsMeansData}/SF
    - Local multiplier: ${marketData.localMultiplier}
    
    Calculate replacement cost considering:
    1. Base cost per SF for this building type
    2. Quality adjustment (Q1-Q4 scale)
    3. Local cost multiplier
    4. Current construction costs (2025 rates)
    
    Show calculation and supporting data.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

#### Step 2: AI Calculates Depreciation

```typescript
async function calculateDepreciation(
  property: Property,
  replacementCost: number
): Promise<DepreciationAnalysis> {
  
  const prompt = `
    Calculate depreciation for:
    
    PROPERTY:
    - Year Built: ${property.year_built}
    - Current Year: 2025
    - Actual Age: ${2025 - property.year_built} years
    - Condition: ${property.condition}
    - Year Remodeled: ${property.year_remodeled}
    - Deferred Maintenance: ${property.deferredMaintenance}
    
    REPLACEMENT COST NEW: $${replacementCost}
    
    Calculate THREE types of depreciation:
    
    1. PHYSICAL DEPRECIATION
       - Use Economic Age-Life method
       - Typical economic life: 50 years for commercial
       - Effective age (consider remodeling)
       - Annual depreciation rate: 2%
    
    2. FUNCTIONAL OBSOLESCENCE
       - Outdated design/layout?
       - Inadequate systems (HVAC, electrical)?
       - Poor floor plan?
       - Excessive operating costs?
    
    3. EXTERNAL OBSOLESCENCE
       - Neighborhood decline?
       - Economic factors?
       - Locational issues?
    
    Provide total depreciation and depreciated value.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

---

### 4. Lease Approach - AI Workflow

**For Lease Comparables:**

```typescript
async function analyzeLeasComps(
  subjectProperty: Property,
  leaseComps: LeaseComp[]
): Promise<LeaseAnalysis> {
  
  const prompt = `
    Analyze lease comparables for market rent:
    
    SUBJECT: ${JSON.stringify(subjectProperty)}
    
    LEASE COMPARABLES:
    ${leaseComps.map(lc => `
      - ${lc.address}: $${lc.lease_rate}/${lc.lease_rate_unit}
      - Type: ${lc.lease_type} (NNN/Gross/Modified)
      - Term: ${lc.term} years
      - TI Allowance: $${lc.ti_allowance}
      - Free Rent: ${lc.free_rent} months
      - Space: ${lc.space} SF
      - Date: ${lc.date_execution}
    `).join('\n')}
    
    ANALYZE:
    1. Convert all rents to same basis ($/SF/Year)
    2. Adjust for lease type differences (NNN vs Gross)
    3. Adjust for concessions (TI, free rent) - calculate effective rent
    4. Adjust for time (lease date to current)
    5. Adjust for size, location, quality differences
    6. Calculate market rent range
    7. Recommend market rent for subject
    
    Show all calculations and adjustments.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

---

### 5. Cap Rate Approach - AI Workflow

```typescript
async function analyzeCapRates(
  salesComps: SalesComp[],
  marketData: MarketData
): Promise<CapRateAnalysis> {
  
  const prompt = `
    Analyze market cap rates:
    
    SALES DATA WITH NOI:
    ${salesComps.map(sc => `
      - ${sc.address}
      - Sale Price: $${sc.sale_price}
      - NOI: $${sc.net_operating_income}
      - Implied Cap Rate: ${((sc.net_operating_income / sc.sale_price) * 100).toFixed(2)}%
      - Property Type: ${sc.building_type}
      - Age: ${sc.year_built}
      - Quality: ${sc.quality}
    `).join('\n')}
    
    EXTERNAL DATA:
    - CBRE Cap Rate Survey: ${marketData.cbreCapRate}%
    - CoStar Market Average: ${marketData.costarCapRate}%
    - PWC Real Estate Investor Survey: ${marketData.pwcCapRate}%
    
    ANALYZE:
    1. Calculate cap rate for each comparable sale
    2. Identify outliers (explain why)
    3. Determine cap rate range (low, average, high)
    4. Adjust for subject property quality/location
    5. Recommend cap rate for subject
    6. Justify selection with market data
    
    Return structured analysis.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

---

### 6. Multi-Family Approach - AI Workflow

```typescript
async function analyzeMultiFamilyComps(
  subjectProperty: Property,
  rentRoll: RentRollData,
  mfComps: MultiFamilyComp[]
): Promise<MultiFamilyAnalysis> {
  
  const prompt = `
    Multi-Family valuation using GRM method:
    
    SUBJECT PROPERTY:
    - Total Units: ${subjectProperty.units}
    - Unit Mix: ${JSON.stringify(rentRoll.unitMix)}
    - Current Monthly Income: $${rentRoll.totalMonthlyRent}
    - Average Rent/Unit: $${rentRoll.avgRentPerUnit}
    
    MULTI-FAMILY COMPARABLES:
    ${mfComps.map(mfc => `
      - ${mfc.address}
      - Units: ${mfc.units}
      - Sale Price: $${mfc.sale_price}
      - Avg Monthly Rent: $${mfc.avg_monthly_rent}
      - Annual Rent/Unit: $${mfc.avg_monthly_rent * 12}
      - Implied GRM: ${(mfc.sale_price / (mfc.avg_monthly_rent * 12 * mfc.units)).toFixed(2)}
      - Unit Mix: ${JSON.stringify(mfc.unit_mix)}
    `).join('\n')}
    
    CALCULATE:
    1. Gross Rent Multiplier (GRM) for each comparable
       GRM = Sale Price / (Monthly Rent × 12)
    
    2. Adjust GRMs for:
       - Unit mix differences
       - Location quality
       - Property condition
       - Amenities
    
    3. Calculate GRM range (low, average, high)
    
    4. Select appropriate GRM for subject
    
    5. Apply GRM to subject's income:
       Value = (Monthly Rent × 12) × GRM
    
    Provide detailed analysis.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

---

### 7. Rent Roll Analysis - AI Workflow

**Detailed Unit-Level Analysis:**

```typescript
async function analyzeRentRoll(
  rentRoll: RentRollData,
  marketRents: MarketRentData
): Promise<RentRollAnalysis> {
  
  const prompt = `
    Analyze rent roll unit by unit:
    
    CURRENT RENT ROLL:
    ${rentRoll.units.map(unit => `
      Unit ${unit.number}: ${unit.bedrooms}BR/${unit.bathrooms}BA
      - Size: ${unit.sqft} SF
      - Current Rent: $${unit.current_rent}/month ($${(unit.current_rent / unit.sqft).toFixed(2)}/SF)
      - Lease Expires: ${unit.lease_expiration}
      - Occupied: ${unit.status === 'occupied' ? 'Yes' : 'No'}
    `).join('\n')}
    
    MARKET RENT DATA:
    ${marketRents.byUnitType.map(mr => `
      ${mr.unit_type}: $${mr.avg_rent}/month ($${mr.rent_per_sf}/SF)
      Market Range: $${mr.low_rent} - $${mr.high_rent}
    `).join('\n')}
    
    ANALYZE EACH UNIT:
    1. Compare current rent to market rent
    2. Calculate rent loss (if below market)
    3. Identify lease expiration dates
    4. Calculate potential income at stabilized occupancy
    5. Recommend rent increases upon renewal
    6. Estimate time to stabilization
    
    CALCULATE:
    - Total current annual rent
    - Total market annual rent
    - Annual rent loss to market
    - Stabilized potential income
    - Time to achieve stabilization
    
    Return detailed unit-by-unit analysis.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

---

## User Checkpoint System

### Checkpoint Philosophy

**After EACH approach is completed by AI:**
1. Present results to user
2. Show AI confidence scores
3. Display calculations and reasoning
4. Allow user to:
   - ✅ Approve and continue
   - ✏️ Edit data/adjustments
   - 🔄 Rerun AI with different parameters
   - ⏸️ Save and come back later

### Checkpoint UI Design

```
┌────────────────────────────────────────────────────────────────────┐
│  [APPROACH NAME] - REVIEW & APPROVE                    ┌─────────┐ │
│                                                         │ Step X  │ │
│  ✓ AI Processing Complete                              │ of Y    │ │
│  ⏱️ Processing Time: 2.3 seconds                        └─────────┘ │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📊 RESULTS SUMMARY                                                │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Indicated Value: $3,485,000                               │  │
│  │  Confidence Score: ████████░░ 85/100 (High)                │  │
│  │  Data Quality: ████████░░ 82/100 (Good)                    │  │
│  │  Market Support: █████████░ 88/100 (Very Good)             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  💡 AI INSIGHTS                                                    │
│  "Analysis shows strong market support with minimal adjustments.   │
│   All comparables are highly similar to subject. Recommend         │
│   proceeding with current calculations."                           │
│                                                                     │
│  ⚠️  ALERTS & WARNINGS                                             │
│  • No critical issues detected                                     │
│  • 1 minor recommendation: Consider adding one more comp          │
│                                                                     │
│  📋 DETAILED BREAKDOWN                         [Expand All ▼]     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ • Property Data          ✓ Complete          [View Details] │  │
│  │ • Comparables           ✓ 6 Selected         [Review Comps] │  │
│  │ • Adjustments           ✓ Calculated         [View Grid]    │  │
│  │ • Market Analysis       ✓ Complete           [View Report]  │  │
│  │ • Calculations          ✓ Verified           [See Math]     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ────────────────────────────────────────────────────────────────  │
│                                                                     │
│  USER OPTIONS:                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  [✏️  Edit Data]   [🔄 Rerun AI]   [💾 Save Progress]       │  │
│  │                                                              │  │
│  │  [← Back to Previous]        [✓ Approve & Continue →]       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  💬 Add Notes (Optional):                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  [Text area for user notes/comments]                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Checkpoint Data Persistence

**Every checkpoint automatically saves:**
```typescript
interface CheckpointData {
  evaluation_id: number;
  approach_type: string;
  checkpoint_number: number;
  status: 'pending_review' | 'approved' | 'edited' | 'rejected';
  ai_results: object; // Complete AI output
  user_edits: object | null; // Any changes made by user
  user_notes: string | null;
  confidence_scores: {
    overall: number;
    data_quality: number;
    market_support: number;
  };
  timestamp: Date;
  user_id: number;
  time_spent_reviewing: number; // seconds
}
```

---

## Final Review & Report Generation

### Step 1: Approach Reconciliation

**AI Combines All Approaches:**

```typescript
async function reconcileApproaches(
  approaches: CompletedApproach[]
): Promise<ReconciliationAnalysis> {
  
  const prompt = `
    Reconcile multiple valuation approaches:
    
    COMPLETED APPROACHES:
    ${approaches.map(a => `
      ${a.name}:
      - Indicated Value: $${a.indicated_value}
      - Weight: ${a.weight}%
      - Confidence: ${a.confidence}/100
      - Data Quality: ${a.data_quality}/100
      - Supporting Data Points: ${a.data_points}
    `).join('\n')}
    
    ANALYZE:
    1. Which approach is most reliable for this property type?
    2. Are the values reasonably consistent?
    3. Any outliers that need explanation?
    4. Recommend final reconciled value
    5. Justify weighting for each approach
    
    INDUSTRY STANDARDS:
    - Income properties: Heavy weight to Income Approach (50-60%)
    - Owner-occupied: Heavy weight to Sales Approach (60-80%)
    - New construction: Significant weight to Cost Approach (30-40%)
    
    Return reconciliation analysis with recommended final value.
  `;
  
  const aiResponse = await gemini.generateContent(prompt);
  return JSON.parse(aiResponse.text());
}
```

**AI Reconciliation Output:**
```json
{
  "reconciliation": {
    "property_type": "Multi-Family Income Property",
    "valuation_purpose": "Refinancing",
    "approaches_analyzed": [
      {
        "approach": "Income Approach",
        "indicated_value": 15130000,
        "original_weight": 50,
        "recommended_weight": 55,
        "reliability": "very_high",
        "reasoning": "Primary valuation method for income-producing properties. Strong NOI data, well-supported cap rate, market-tested assumptions."
      },
      {
        "approach": "Multi-Family Approach",
        "indicated_value": 14875000,
        "original_weight": 30,
        "recommended_weight": 25,
        "reliability": "high",
        "reasoning": "GRM analysis supports Income Approach. Good comparable data. Slightly lower weight as it's derivative of income."
      },
      {
        "approach": "Sales Comparison Approach",
        "indicated_value": 15250000,
        "original_weight": 15,
        "recommended_weight": 15,
        "reliability": "medium_high",
        "reasoning": "Limited comparable sales for 75-unit properties in market. Useful for validation but not primary approach for income properties."
      },
      {
        "approach": "Rent Roll Analysis",
        "indicated_value": 15050000,
        "original_weight": 5,
        "recommended_weight": 5,
        "reliability": "high",
        "reasoning": "Supports Income Approach findings. Unit-level analysis confirms stabilized income projections."
      }
    ],
    "value_consistency_analysis": {
      "value_range": {
        "low": 14875000,
        "high": 15250000,
        "spread": 375000,
        "spread_percentage": 2.5
      },
      "assessment": "Excellent consistency. All approaches within 2.5% range indicates strong market support and reliable data.",
      "outliers": "None. All values are tightly clustered."
    },
    "weighted_calculation": {
      "income_approach": {
        "value": 15130000,
        "weight": 0.55,
        "contribution": 8321500
      },
      "multi_family_approach": {
        "value": 14875000,
        "weight": 0.25,
        "contribution": 3718750
      },
      "sales_approach": {
        "value": 15250000,
        "weight": 0.15,
        "contribution": 2287500
      },
      "rent_roll_approach": {
        "value": 15050000,
        "weight": 0.05,
        "contribution": 752500
      },
      "weighted_average": 15080250
    },
    "final_reconciled_value": 15100000,
    "rounding_rationale": "Rounded to $15,100,000 for reasonable precision given property size and value range. Rounding reflects typical market pricing increments for properties in this value range ($50K-$100K increments).",
    "value_per_unit": 201333,
    "confidence_in_final_value": 92
  },
  "reconciliation_narrative": "The Income Approach is given primary weight (55%) as it is the most reliable method for valuing income-producing multi-family properties. The approach is supported by actual rent roll data, market-tested operating expenses, and well-supported cap rate selection from comparable sales. The Multi-Family Approach (25% weight) utilizing GRM analysis corroborates the Income Approach findings, with an indicated value within 1.7% of the Income Approach. The Sales Comparison Approach (15% weight) provides additional market validation, though comparable sales for 75-unit properties are limited in this market. The Rent Roll Analysis (5% weight) confirms the unit-level income projections used in the Income Approach. All four approaches indicate values within a narrow 2.5% range ($14,875,000 to $15,250,000), demonstrating excellent consistency and strong market support. Based on the weighted analysis and the reliability of each approach, the final reconciled value is $15,100,000, or approximately $201,333 per unit."
}
```

### Step 2: AI Narrative Generation

**AI Writes Report Sections:**

```typescript
async function generateReportNarratives(
  evaluation: EvaluationData,
  approaches: CompletedApproach[],
  reconciliation: ReconciliationAnalysis
): Promise<ReportNarratives> {
  
  // Generate each report section
  const sections = {
    executive_summary: await generateExecutiveSummary(evaluation, reconciliation),
    property_description: await generatePropertyDescription(evaluation),
    market_analysis: await generateMarketAnalysis(evaluation, approaches),
    highest_best_use: await generateHighestBestUse(evaluation),
    valuation_methodology: await generateMethodologySection(approaches),
    sales_approach_narrative: await generateSalesNarrative(approaches.sales),
    income_approach_narrative: await generateIncomeNarrative(approaches.income),
    reconciliation_narrative: reconciliation.reconciliation_narrative,
    certification: await generateCertification(evaluation),
    assumptions_limiting_conditions: await generateAssumptions(evaluation)
  };
  
  return sections;
}
```

### Step 3: Final Review Interface

```
┌────────────────────────────────────────────────────────────────────┐
│  FINAL REPORT REVIEW & EDITING                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📄 REPORT COMPLETE - Ready for Review                             │
│                                                                     │
│  Final Value: $15,100,000                                          │
│  Report Pages: 87                                                  │
│  Approaches Used: 4 (Income, Multi-Family, Sales, Rent Roll)      │
│  Comparables: 18 total                                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  LEFT PANEL: Report Sections   │  RIGHT PANEL: Preview      │  │
│  ├─────────────────────────────────┼───────────────────────────┤  │
│  │                                 │                            │  │
│  │  ☑ Cover Page                   │  [PDF Preview Window]     │  │
│  │  ☑ Executive Summary             │                            │  │
│  │  ☑ Property Description          │  Page 1 of 87             │  │
│  │  ☑ Market Analysis               │                            │  │
│  │  ☑ Highest & Best Use            │  [8.5" x 11" render]     │  │
│  │  ☑ Valuation Approaches          │                            │  │
│  │    • Income Approach             │  Zoom: [Fit][75%][100%]  │  │
│  │    • Multi-Family Approach       │                            │  │
│  │    • Sales Approach              │                            │  │
│  │    • Rent Roll Analysis          │                            │  │
│  │  ☑ Reconciliation                │                            │  │
│  │  ☑ Exhibits                      │                            │  │
│  │  ☑ Certification                 │                            │  │
│  │  ☑ Addenda                       │                            │  │
│  │                                  │                            │  │
│  │  [Click section to edit]         │  [Click page to edit]     │  │
│  └─────────────────────────────────┴───────────────────────────┘  │
│                                                                     │
│  🛠️  EDITING TOOLS                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  [Text Editor] [Tables] [Images] [Charts] [Page Breaks]     │  │
│  │  [Add Section] [Delete Section] [Reorder Sections]          │  │
│  │  [AI Rewrite ✨] [Spell Check] [Format]                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  🔍 QUALITY CHECKS                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ✓ All required sections present                             │  │
│  │  ✓ No calculation errors detected                            │  │
│  │  ✓ All comparables have images                               │  │
│  │  ✓ Grammar and spelling checked                              │  │
│  │  ⚠️  1 recommendation: Add market trend chart to page 23     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  📤 EXPORT OPTIONS                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  [📄 Generate PDF]  [📧 Email to Client]  [💾 Save Draft]   │  │
│  │                                                              │  │
│  │  [← Back to Edit]            [✓ Finalize & Send →]          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Database Schema Additions

```sql
-- AI Workflow Tracking
CREATE TABLE ai_workflow_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id INT,
  appraisal_id INT,
  workflow_type ENUM('evaluation', 'appraisal'),
  status ENUM('data_intake', 'template_selection', 'approach_processing', 
              'user_review', 'report_generation', 'completed', 'failed'),
  current_step INT,
  total_steps INT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  total_processing_time INT, -- seconds
  ai_processing_time INT, -- seconds
  user_review_time INT, -- seconds
  created_by INT,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
  FOREIGN KEY (appraisal_id) REFERENCES appraisals(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- AI Processing Steps
CREATE TABLE ai_processing_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  step_type ENUM('template_selection', 'property_classification', 
                 'comp_selection', 'adjustment_calculation', 'approach_calculation',
                 'reconciliation', 'narrative_generation'),
  approach_type VARCHAR(50), -- 'sales', 'income', 'cost', etc.
  status ENUM('pending', 'processing', 'completed', 'failed', 'user_review'),
  ai_input JSON, -- What was sent to AI
  ai_output JSON, -- What AI returned
  confidence_score INT, -- 0-100
  processing_time_ms INT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  FOREIGN KEY (session_id) REFERENCES ai_workflow_sessions(id)
);

-- User Checkpoints
CREATE TABLE user_checkpoints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  step_id INT,
  approach_type VARCHAR(50),
  checkpoint_number INT,
  status ENUM('pending_review', 'approved', 'edited', 'rejected'),
  ai_results JSON,
  user_edits JSON,
  user_notes TEXT,
  confidence_scores JSON,
  time_spent_reviewing INT, -- seconds
  reviewed_at TIMESTAMP,
  reviewed_by INT,
  FOREIGN KEY (session_id) REFERENCES ai_workflow_sessions(id),
  FOREIGN KEY (step_id) REFERENCES ai_processing_steps(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- AI Comp Selections (track AI-selected comps)
CREATE TABLE ai_comp_selections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  step_id INT,
  comp_id INT,
  similarity_score INT, -- 0-100
  match_breakdown JSON, -- Location, size, type scores
  rank_order INT,
  selected_by_ai BOOLEAN,
  approved_by_user BOOLEAN,
  user_removed BOOLEAN,
  removal_reason TEXT,
  FOREIGN KEY (session_id) REFERENCES ai_workflow_sessions(id),
  FOREIGN KEY (step_id) REFERENCES ai_processing_steps(id),
  FOREIGN KEY (comp_id) REFERENCES comps(id)
);

-- AI Adjustment Calculations
CREATE TABLE ai_adjustment_calculations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  step_id INT,
  comp_id INT,
  adjustment_category VARCHAR(100),
  calculation_method VARCHAR(50),
  ai_calculated_amount DECIMAL(15,2),
  ai_calculated_percentage DECIMAL(8,4),
  direction ENUM('upward', 'downward'),
  reasoning TEXT,
  supporting_data JSON,
  confidence_score INT,
  data_points_used INT,
  user_override_amount DECIMAL(15,2),
  user_override_reason TEXT,
  FOREIGN KEY (session_id) REFERENCES ai_workflow_sessions(id),
  FOREIGN KEY (step_id) REFERENCES ai_processing_steps(id),
  FOREIGN KEY (comp_id) REFERENCES comps(id)
);

-- AI Generated Narratives
CREATE TABLE ai_generated_narratives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  section_type VARCHAR(100), -- 'executive_summary', 'property_description', etc.
  ai_generated_text TEXT,
  user_edited_text TEXT,
  edit_count INT DEFAULT 0,
  last_edited_at TIMESTAMP,
  last_edited_by INT,
  FOREIGN KEY (session_id) REFERENCES ai_workflow_sessions(id),
  FOREIGN KEY (last_edited_by) REFERENCES users(id)
);

-- AI Analytics (for improvement)
CREATE TABLE ai_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  metric_type VARCHAR(100),
  metric_value DECIMAL(15,4),
  metadata JSON,
  created_at TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES ai_workflow_sessions(id)
);
```

### API Endpoints

```typescript
// AI Workflow Endpoints

// Start new AI workflow
POST /api/v1/ai-workflow/start
Body: {
  workflowType: 'evaluation' | 'appraisal',
  submissionData: {
    customerEmail?: string,
    portalSubmission?: object,
    attachments: File[]
  }
}
Response: {
  sessionId: number,
  status: 'data_intake',
  estimatedTime: number // seconds
}

// Parse uploaded documents
POST /api/v1/ai-workflow/:sessionId/parse-documents
Response: {
  parsedData: ExtractedPropertyData,
  documents: ParsedDocument[],
  confidence: number
}

// AI Template Selection
POST /api/v1/ai-workflow/:sessionId/select-template
Body: {
  propertyClassification: object,
  purpose: string
}
Response: {
  selectedTemplate: Template,
  matchScore: number,
  reasoning: string,
  alternativeTemplates: Template[]
}

// AI Approach Recommendations
POST /api/v1/ai-workflow/:sessionId/recommend-approaches
Response: {
  recommendedApproaches: ApproachRecommendation[],
  confidence: number
}

// Process Specific Approach
POST /api/v1/ai-workflow/:sessionId/process-approach/:approachType
Body: {
  subjectProperty: object,
  additionalData?: object
}
Response: {
  stepId: number,
  results: object,
  confidence: number,
  checkpointData: object
}

// User Checkpoint Review
POST /api/v1/ai-workflow/:sessionId/checkpoint/:stepId/review
Body: {
  status: 'approved' | 'edited' | 'rejected',
  edits?: object,
  notes?: string
}
Response: {
  nextStep: string,
  continueWorkflow: boolean
}

// Reconcile Approaches
POST /api/v1/ai-workflow/:sessionId/reconcile
Response: {
  reconciliation: ReconciliationAnalysis,
  finalValue: number,
  confidence: number
}

// Generate Report
POST /api/v1/ai-workflow/:sessionId/generate-report
Response: {
  reportId: number,
  narratives: object,
  pdfUrl: string
}

// Get Workflow Status
GET /api/v1/ai-workflow/:sessionId/status
Response: {
  sessionId: number,
  status: string,
  currentStep: number,
  totalSteps: number,
  completionPercentage: number,
  estimatedTimeRemaining: number
}
```

---

## Phased Rollout Plan

### Phase 1: Foundation & Template Auto-Selection (Weeks 1-3)

**Deliverables:**
- ✅ Email/Portal data intake processing
- ✅ Document parser & classifier
- ✅ Property type detection
- ✅ AI template matcher
- ✅ Approach recommender

**Testing:**
- 50 test submissions (25 email, 25 portal)
- Accuracy target: 90% correct template selection

**Metrics:**
- Template selection accuracy
- Processing time (target: <10 seconds)
- User override rate

---

### Phase 2: Sales Approach Automation (Weeks 4-7)

**Deliverables:**
- ✅ AI comp selection with similarity scoring
- ✅ Paired sales analysis
- ✅ Adjustment calculations (all categories)
- ✅ First user checkpoint implementation
- ✅ Edit interface for adjustments

**Testing:**
- 100 properties with known comps
- Compare AI selections vs manual appraiser selections
- Adjustment accuracy validation

**Metrics:**
- Comp selection agreement rate (target: 80%+)
- Adjustment accuracy (target: within 10% of appraiser)
- Time savings (target: 60% reduction)

---

### Phase 3: Income & Multi-Family Approaches (Weeks 8-11)

**Deliverables:**
- ✅ Rent roll parser (Excel & PDF)
- ✅ NOI calculation engine
- ✅ Cap rate analysis
- ✅ GRM analysis
- ✅ Operating expense validation
- ✅ User checkpoint for income approaches

**Testing:**
- 50 multi-family properties
- Validate NOI calculations
- Compare AI cap rate selections

**Metrics:**
- Rent roll parsing accuracy (target: 95%+)
- NOI calculation accuracy (target: 98%+)
- Cap rate reasonableness (target: within 0.5% of appraiser)

---

### Phase 4: All Approaches + Advanced Features (Weeks 12-17)

**Deliverables:**
- ✅ Cost approach automation
- ✅ Lease approach automation
- ✅ Rent roll detailed analysis
- ✅ Reconciliation engine
- ✅ Narrative generation
- ✅ All user checkpoints
- ✅ Final review interface

**Testing:**
- 200 evaluations across all property types
- End-to-end workflow testing
- User acceptance testing with 5 appraisers

**Metrics:**
- End-to-end accuracy
- User satisfaction scores
- Time savings across complete workflow

---

### Phase 5: Production Release & Optimization (Weeks 18-20)

**Deliverables:**
- ✅ Performance optimization
- ✅ Error handling & recovery
- ✅ User training materials
- ✅ Admin monitoring dashboard
- ✅ Analytics & reporting

**Testing:**
- Load testing (100 concurrent workflows)
- Edge case handling
- Production pilot with select users

**Rollout:**
- Week 18: Beta release to 10 power users
- Week 19: Expand to 50% of users
- Week 20: Full production release

---

## Success Metrics & KPIs

### Time Savings
| Task | Current Time | AI-Assisted Time | Savings |
|------|-------------|------------------|---------|
| Data intake | 30-45 min | 2-3 min | 93% |
| Template selection | 10-15 min | 30 sec | 95% |
| Comp selection | 60-90 min | 5-10 min | 89% |
| Adjustment calculations | 90-120 min | 10-15 min | 90% |
| Income analysis | 45-60 min | 5-8 min | 88% |
| Report writing | 60-90 min | 10-15 min | 85% |
| **TOTAL** | **4-8 hours** | **45-90 min** | **80-85%** |

### Quality Metrics
- **Calculation Accuracy**: 98%+ (validated against manual calculations)
- **Comp Selection Relevance**: 85%+ match with appraiser choices
- **Narrative Quality**: 90%+ user satisfaction
- **Final Value Accuracy**: Within 5% of manual appraisal

### User Experience
- **User Approval Rate**: 90%+ approve AI suggestions without edits
- **Edit Frequency**: <20% of AI outputs require significant edits
- **User Satisfaction**: 4.5/5.0 rating
- **Training Time**: <2 hours to proficiency

### Business Impact
- **Capacity Increase**: 3-4x more evaluations per appraiser
- **Faster Turnaround**: 1-2 day average vs 5-7 day manual
- **Cost Reduction**: 60-70% lower cost per evaluation
- **Revenue Growth**: 2-3x through increased volume

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| AI hallucination | Multi-layer validation, human checkpoints, confidence thresholds |
| Data extraction errors | OCR + manual review for low-confidence extractions |
| Calculation errors | Automated testing, cross-validation with formulas |
| API failures | Fallback to manual mode, queue system, retry logic |
| Performance issues | Caching, async processing, load balancing |

### Compliance Risks
| Risk | Mitigation |
|------|------------|
| USPAP violations | AI assists but doesn't replace appraiser judgment |
| Audit trail requirements | Full logging of AI decisions and user overrides |
| Disclosure requirements | Clear documentation of AI usage in reports |
| Liability concerns | User review checkpoints, professional oversight |

### Adoption Risks
| Risk | Mitigation |
|------|------------|
| User resistance | Comprehensive training, demonstrate time savings |
| Trust in AI | Show calculations, provide reasoning, allow overrides |
| Learning curve | Intuitive UI, contextual help, video tutorials |
| Change management | Gradual rollout, champion users, feedback loops |

---

## Conclusion

This AI-powered workflow will revolutionize evaluation and appraisal creation by:

1. **Automating 80-85% of manual work** while maintaining professional oversight
2. **Ensuring accuracy** through multi-checkpoint validation
3. **Maintaining compliance** with USPAP and industry standards
4. **Improving consistency** across all evaluations
5. **Enabling scalability** - handle 3-4x more volume per appraiser
6. **Reducing costs** by 60-70% per evaluation
7. **Faster turnaround** from 5-7 days to 1-2 days

**This is truly revolutionary for the industry** - no other system offers this level of intelligent automation while maintaining professional quality and compliance.

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Implementation Blueprint - Ready for Development

