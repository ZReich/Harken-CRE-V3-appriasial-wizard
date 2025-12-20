# AI-Powered Comparable Property Matching & Adjustment Calculations

## Table of Contents
1. [Overview](#overview)
2. [Similarity Scoring](#similarity-scoring)
3. [Adjustment Categories](#adjustment-categories)
4. [AI Methodologies](#ai-methodologies)
5. [Implementation Guide](#implementation-guide)
6. [Industry Standards](#industry-standards)

---

## Overview

This document outlines how AI would intelligently find comparable (comp) properties similar to a subject property and calculate quantified adjustments to justify differences between comps and the subject.

### Key Principle
**Adjustments are made TO the comparable, FOR differences from the subject**

---

## Similarity Scoring

### Industry Standard: 0-100% Match Percentage

The system uses **weighted similarity scores** (0-100%) to rate how well each comparable matches the subject property.

#### Example Match Display
```
╔═══════════════════════════════════════════╗
║  123 Main St - Office Building           ║
║  ⭐ 87% Match (Excellent)                 ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  📍 Location: 95%  (0.8 miles away)      ║
║  📏 Size: 88%      (2,450 SF vs 2,600)   ║
║  🏢 Type: 100%     (Office - Same)        ║
║  📅 Date: 75%      (Sold 14 months ago)  ║
║  ⚙️  Condition: 82% (Good vs Good)        ║
║                                           ║
║  💡 AI Insight: "Strong comparable in    ║
║     same submarket. Minimal adjustment   ║
║     needed for size difference."          ║
╚═══════════════════════════════════════════╝
```

### Weighted Scoring Components

| Component | Weight | Description |
|-----------|--------|-------------|
| **Location** | 30% | Most important; includes neighborhood, distance, market dynamics |
| **Property Type** | 25% | Must match (office→office, retail→retail) |
| **Size** | 20% | Building & land square footage similarity |
| **Sale Date** | 10% | Recent sales preferred; recency matters |
| **Condition** | 10% | Quality and state of repairs |
| **Features** | 5% | Amenities, parking, utilities |

### Match Quality Thresholds

| Quality Level | Score Range | Usability | Adjustments |
|---------------|-------------|-----------|-------------|
| Excellent | 85-100% | Highly reliable | Minimal (<10%) |
| Good | 70-84% | Acceptable | Moderate (10-20%) |
| Fair | 55-69% | Use cautiously | Significant (20-30%) |
| Poor | 40-54% | Avoid if possible | Extensive (>30%) |
| Unusable | <40% | Do not use | N/A |

### Professional Standards
- **Minimum 3 comps** required for most appraisals
- **Ideally 5-6 comps** for better accuracy
- At least **2 comps should be 70%+ match**
- **Never use comps below 40% match** unless market is extremely limited

---

## Adjustment Categories

Adjustments fall into these primary categories. Each adjustment includes calculation methodology, supporting data, and confidence levels.

### A. Location/Market Adjustments (±5% to ±30%)

**Metrics Considered:**
- Distance from subject property
- Neighborhood quality indicators:
  - Median price per square foot
  - Employment rate
  - School ratings
  - Crime index
  - Walkability score
- Market supply/demand conditions
- Economic trends

**Example Calculation:**

**Scenario:** Subject in superior neighborhood (+12% price premium vs comp)

```
Analysis:
  Subject neighborhood median price: $250/SF
  Comp neighborhood median price: $220/SF
  Difference: $30/SF or 12% premium
  
  Market Data Support:
  - 15 paired sales show 10-14% premium for subject area
  - School district boundaries add 8-12% value
  - Recent market trends show widening gap

Adjustment:
  Amount: +$300,000
  Percentage: +12%
  Calculation: $2,500,000 × 0.12
  Direction: UPWARD (comp in inferior location, worth less)
  Confidence: HIGH
  
Reasoning:
  "Comp's neighborhood commands 12% lower prices based on market 
   analysis. Adjust comp UPWARD to equalize to subject's superior 
   location."
```

---

### B. Size Adjustments (Typically $5-$50 per SF)

**Primary Methodology:** Paired Sales Analysis

**Principle of Diminishing Returns:**
- First 10,000 SF: $200/SF (highest value per SF)
- Next 10,000 SF: $150/SF (good value)
- Next 10,000 SF: $100/SF (diminishing returns)
- Above 30,000 SF: $75/SF (lowest incremental value)

**Example Calculation:**

**Scenario:** Comp is 20% larger (5,000 SF more)

```
Paired Sales Analysis:
  Pair 1: 22,000 SF at $2.2M vs 27,000 SF at $2.45M
    → 5,000 SF difference = $250,000 → $50/SF
  
  Pair 2: 24,000 SF at $2.4M vs 29,000 SF at $2.6M
    → 5,000 SF difference = $200,000 → $40/SF
  
  Pair 3: 26,000 SF vs 31,000 SF
    → Implied value = $45/SF
  
  Average Market Rate: $45/SF for additional space

Adjustment:
  Calculation: 5,000 SF × $45/SF = $225,000
  Amount: -$225,000
  Percentage: -7.5%
  Direction: DOWNWARD (comp is larger, therefore worth MORE)
  
Reasoning:
  "Based on 3 recent paired sales in the market, additional square 
   footage in this size range adds approximately $45/SF. The comp's 
   extra 5,000 SF makes it worth $225,000 more than if it were the 
   same size as subject. SUBTRACT this from comp's sale price."
  
Supporting Data: Paired sales analysis of 8 transactions in past 6 months
Confidence: HIGH
```

---

### C. Condition/Quality Adjustments (±10% to ±25%)

**Methodologies Used:**
1. Cost Approach (cost to cure deferred maintenance)
2. Market Depreciation (market penalty for poor condition)
3. Income Impact (how poor condition affects operations)

**Example Calculation:**

**Scenario:** Subject recently renovated; comp needs major repairs

```
Subject Property:
  Condition: Good (7.5/10)
  Year Built: 1995, Remodeled: 2020
  Effective Age: 5 years
  Recent Improvements:
    - New HVAC system (2020): $150,000
    - Roof replacement (2019): $80,000
    - Facade renovation (2020): $120,000
  Total Recent CapEx: $350,000

Comparable:
  Condition: Average (5.5/10)
  Year Built: 1993, Never Remodeled
  Effective Age: 32 years
  Deferred Maintenance:
    - HVAC needs replacement: $150,000
    - Roof end of life: $80,000
    - Exterior needs work: $50,000
  Total Deferred: $280,000

Market Analysis:
  Market Depreciation for Deferred Maintenance: 40-60% of cost
  Market Premium for Recent Improvements: 30-50% of cost
  (Markets don't pay dollar-for-dollar; they discount/penalize)

Adjustment Calculation:
  Comp's deferred maintenance: $280,000 × 0.50 = $140,000 penalty
  Subject's improvements: $350,000 × 0.40 = $140,000 premium
  Total gap: $280,000
  
  Amount: +$280,000
  Percentage: +11.2%
  Direction: UPWARD (comp in worse condition, worth less)
  
Reasoning:
  "Subject property is in superior condition with $350K in recent 
   capital improvements. Comparable has deferred maintenance of $280K. 
   Market analysis shows buyers discount deferred maintenance at 50% 
   of cost. Adjust comp UPWARD by $280K to equalize quality."

Supporting Data:
  - Marshall & Swift cost data for systems
  - Analysis of 12 sales with varying condition levels
  - Depreciation tables from local market study

Confidence: MEDIUM-HIGH
```

---

### D. Time/Market Conditions Adjustments (±0.5% to ±1.5% per month)

**Methodology:** Trend Analysis of Repeat Sales

**Example Calculation:**

**Scenario:** Comp sold 21.5 months ago; market has appreciated

```
Market Trend Analysis (from database of 47 repeat sales):
  Jan 2023: $220/SF (0%)
  Feb 2023: $222/SF (+0.9%)
  Mar 2023: $224/SF (+0.9%)
  ... (continues for 21 months)
  Nov 2024: $265/SF (+0.8%)
  
Total Appreciation: 20.5%
Average Monthly Rate: 0.95%

Period Breakdown:
  Jan-Jun 2023: +0.7%/month (+4.2% total)
  Jul-Dec 2023: +0.9%/month (+5.4% total)
  Jan-Jun 2024: +1.0%/month (+6.0% total)
  Jul-Nov 2024: +1.2%/month (+4.8% total)

External Validation:
  CBRE Market Index: +19.8%
  CoStar Index: +21.2%
  Local MLS Data: +20.1%
  Consensus: ~20% appreciation

Adjustment:
  Calculation: $2,500,000 × 0.205 = $512,500
  Amount: +$512,500
  Percentage: +20.5%
  Direction: UPWARD (market has appreciated since sale)
  
Reasoning:
  "Comparable sold 21.5 months ago in appreciating market. Analysis 
   of 47 repeat sales shows consistent appreciation averaging 0.95% 
   per month, totaling 20.5%. Market particularly strong in past 
   6 months (1.2%/month). Adjust comp UPWARD by $512,500 to reflect 
   current market conditions."

Supporting Data:
  - 47 repeat sales analysis
  - CBRE Quarterly Market Report
  - CoStar Commercial Index
  - MLS transaction data

Confidence: VERY HIGH

Sensitivity Analysis:
  Conservative (18%): +$450,000
  Moderate (20.5%): +$512,500
  Aggressive (22%): +$550,000
```

---

### E. Property-Specific Feature Adjustments

#### Example 1: Parking Ratio Adjustment

**Scenario:** Subject has 120 spaces; comp has only 75 spaces

```
Parking Analysis:
  Subject: 4.0 spaces/1,000 SF (exceeds zoning of 3.0)
  Comp: 2.5 spaces/1,000 SF (BELOW zoning minimum, non-conforming)
  Difference: 45 fewer spaces in comp
  
Market Validation:
  Typical market ratio: 3.5 spaces/1,000 SF
  Properties below 3.0 ratio: sell for 5-8% LESS
  Parking shortage impact: significant for tenant attraction
  
Paired Sales:
  123 Main (2.5 ratio) vs 456 Oak (4.0 ratio)
    → $150,000 price difference
    → Implied adjustment: $5,000 per space
  
Cost to Add Parking:
  Surface parking cost: $5,000 per space
  Structured parking: $25,000 per space (not relevant here)

Adjustment:
  Calculation: 45 spaces × $5,000/space = $225,000
  Amount: -$225,000
  Percentage: -9%
  Direction: DOWNWARD (comp has fewer spaces, worth MORE)
  
Reasoning:
  "Subject has superior parking with 4.0 spaces/1,000 SF vs comp's 
   deficient 2.5 ratio (below zoning minimum). Paired sales show 
   each additional space adds ~$5,000. The 45-space deficit in comp 
   makes it worth $225,000 LESS. Adjust comp DOWNWARD (it sold for 
   less due to parking deficit)."

Risk Factors:
  - Non-conforming parking limits buyer pool
  - Future expansion difficult
  - Tenant attraction impaired

Confidence: HIGH
```

#### Example 2: Age/Year Built Adjustment

**Scenario:** Subject built 2015; comp built 2005

```
Age Differential Analysis:
  Age difference: 10 years
  
Economic Life Depreciation Method:
  Typical economic life: 50 years
  Subject effective age: 9 years
  Comp effective age: 19 years
  Annual depreciation rate: 100% ÷ 50 years = 2% per year
  
Market Validation (paired sales):
  Paired sales show: 1.5-2.5% annual depreciation
  Selected rate: 2.0% (middle of range)

Adjustment:
  Calculation: 10 years × 2% = 20% depreciation differential
  Amount: +$500,000
  Percentage: +20%
  Direction: UPWARD (comp is older, less valuable)
  
Reasoning:
  "Comp is 10 years older than subject. Market analysis shows 
   properties depreciate at ~2% per year for this building class. 
   The 10-year age difference represents 20% additional depreciation 
   for comp. Adjust comp UPWARD by $500K to reflect value if it 
   were same age as subject."

Supporting Data: Economic age-life tables, paired sales
Confidence: MEDIUM-HIGH
```

---

## AI Methodologies

### Priority Order for Calculating Adjustments

AI uses these methodologies in priority order (most reliable to least):

1. **Paired Sales Analysis** ⭐⭐⭐⭐⭐ MOST RELIABLE
   - Compare two sales differing in only ONE attribute
   - Directly observable market evidence
   - Most defensible in appraisals

2. **Statistical Regression Analysis** ⭐⭐⭐⭐
   - Analyze hundreds of sales for patterns
   - Extract impact of each variable
   - Good for multiple adjustments

3. **Cost Approach** ⭐⭐⭐
   - Replacement cost adjusted for depreciation
   - Best for physical improvements
   - Use Marshall & Swift or RS Means data

4. **Market Extraction** ⭐⭐
   - Extract from overall market trends
   - Good for time adjustments
   - Use indices and trend data

5. **Informed Judgment** ⭐
   - Use when data limited
   - Last resort
   - Always disclose reasoning

### Data Quality Requirements

For each adjustment, AI documents:
- ✅ Methodology used
- ✅ Number of data points (paired sales, transactions analyzed)
- ✅ Confidence level (High/Medium/Low)
- ✅ External validation where available
- ✅ Sensitivity analysis (conservative/moderate/aggressive)
- ✅ Plain-English reasoning
- ✅ Quality checks and warnings

---

## Complete Adjustment Example

### Full Comparable Analysis

**Subject Property:**
- Address: 123 Business Blvd
- Effective Date: November 2024
- Building Size: 25,000 SF

**Comparable Property:**
- Address: 456 Commerce Dr
- Sale Price: $2,500,000
- Sale Date: January 2023
- Building Size: 30,000 SF
- Initial Price/SF: $83.33

### Adjustment Summary Table

| Adjustment Category | Amount | Percentage | Direction | Confidence | Data Points |
|-------------------|--------|-----------|-----------|-----------|------------|
| Sale Price | $2,500,000 | — | — | — | — |
| Time/Market Conditions | +$512,500 | +20.5% | ↑ | Very High | 47 |
| Location/Neighborhood | +$361,500 | +12% | ↑ | High | 15 |
| Size | -$225,000 | -7.5% | ↓ | High | 8 |
| Condition/Quality | +$280,000 | +11.2% | ↑ | Med-High | 12 |
| Parking Ratio | -$225,000 | -9% | ↓ | High | 3 |
| Age/Year Built | +$160,000 | +6.4% | ↑ | Medium | 18 |
| **TOTAL ADJUSTMENTS** | **+$864,000** | **+34.6%** | — | — | — |
| **ADJUSTED VALUE** | **$3,364,000** | — | — | — | — |

### Indicated Value Per SF
- $3,364,000 ÷ 25,000 SF = **$134.56/SF**
- Subject implied value: **$3,364,000**

### Quality Assessment

```
Total Gross Adjustments: 67.6%
Status: CAUTION - High total adjustments
Recommendation: Consider finding closer comparables
Usability: Acceptable but not ideal
Confidence Score: Medium (72/100)
Weight Recommendation: Use as supporting comp, not primary
```

### Validation Rules Check

| Rule | Status | Severity |
|------|--------|----------|
| No single adjustment >25% | PASS | Critical |
| Total net adjustments <25% | FAIL (34.6%) | Warning |
| Total gross adjustments <40% | FAIL (67.6%) | Warning |
| At least 3 data points each | PARTIAL | Advisory |

---

## Implementation Guide

### Two-Phase Database Query Strategy

```typescript
// PHASE 1: SQL Hard Filters (Fast - eliminates 90% of database)
// Returns ~50 candidates

const hardFilters = {
  propertyType: subjectProperty.building_type,  // MUST match
  propertyCategory: 'Commercial',               // MUST match
  transactionType: 'sale',                       // MUST match
  radius: 5,                                    // Within 5 miles
  minSize: subjectProperty.building_size * 0.5, // 50% of subject
  maxSize: subjectProperty.building_size * 2.0, // 200% of subject
  minLandSize: subjectProperty.land_size * 0.5,
  maxLandSize: subjectProperty.land_size * 2.0,
  saleDate: last24Months()                      // Last 2 years
}

// PHASE 2: AI Scoring (Slower - but only 50 properties)
// Calculate similarity score for each candidate
// Return top 10-20 matches sorted by score
```

### Required API Endpoints

```
POST /api/v1/comps/find-similar
  Parameters:
    - subjectPropertyId: number
    - filters: object (optional)
  Returns:
    - comparables: array of scored properties
    - scores: similarity breakdown
    - adjustments: calculated for each comp

GET /api/v1/comps/adjustment-calculation/:compId/:subjectId
  Returns:
    - detailed adjustment analysis
    - supporting data
    - confidence metrics
```

---

## Industry Standards

### USPAP Compliance

All adjustments must follow **Uniform Standards of Professional Appraisal Practice** (USPAP):

- Document all data sources
- Explain adjustment methodology
- Provide market evidence where possible
- Disclose limitations and assumptions
- Show all calculations

### Appraisal Standards by Adjustment Quality

**Excellent Comps (85-100% match):**
- Require minimal adjustments (<10%)
- Can be weighted heavily in final value
- Minimal explanation needed

**Good Comps (70-84% match):**
- Require moderate adjustments (10-20%)
- Can be primary comps
- Document adjustment methodology

**Fair Comps (55-69% match):**
- Require significant adjustments (20-30%)
- Use as supporting evidence
- Detailed adjustment justification needed

**Poor Comps (40-54% match):**
- Extensive adjustments (>30%)
- Use only if better options unavailable
- Detailed disclaimers required

### Geographic Radius Standards

| Market Type | Standard Radius | Extended Radius |
|------------|-----------------|-----------------|
| Urban | 0.5 - 3 miles | Up to 5 miles |
| Suburban | 3 - 10 miles | Up to 15 miles |
| Rural | 10 - 25 miles | Up to 50 miles |
| Specialized | Per appraisal | Varies |

### Sale Date Standards

- **Preferred:** Sold within 12 months
- **Acceptable:** Sold within 24 months
- **Extended:** Up to 36 months (with justification)
- **Rural/Specialty:** May extend further

---

## Best Practices

### For AI Comp Selection
1. Always show confidence levels
2. Explain why each comp was selected
3. Highlight outliers or unusual adjustments
4. Suggest alternatives if comps are weak
5. Provide sensitivity analysis for key assumptions

### For Adjustment Calculation
1. Use paired sales when available
2. Support adjustments with market data
3. Avoid stacking adjustments on same attribute
4. Use standard depreciation tables
5. Document all sources and calculations

### For Appraiser Review
1. Flag comps with total adjustments >25%
2. Alert if gross adjustments >40%
3. Suggest comparable searches if poor matches
4. Provide sensitivity analysis for key assumptions
5. Generate detailed narratives for explanations

---

## References

### Data Sources for Adjustments
- Paired sales from internal database
- CoStar Commercial Index
- CBRE Market Reports
- LoopNet comparable transactions
- Local MLS data
- Marshall & Swift cost databases
- RS Means construction costs
- ARGUS Enterprise software
- Tax assessor records
- County recorder documents

### Professional Organizations
- Appraisal Institute (AI)
- American Society of Appraisers (ASA)
- National Association of Independent Fee Appraisers (NAIFA)
- American Association of Certified Appraisers (AACA)

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Documentation for AI Comp & Adjustments Implementation
