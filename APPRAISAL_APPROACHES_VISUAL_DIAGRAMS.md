# Appraisal Approaches: Visual Diagrams
**Correct vs. Incorrect Implementations**

---

## Table of Contents

1. [Cost Approach - Critical Error](#cost-approach---critical-error)
2. [Sales Comparison Approach - Flow](#sales-comparison-approach---flow)
3. [All Approaches Comparison Matrix](#all-approaches-comparison-matrix)
4. [Lease Comps - Effective Rent Calculation](#lease-comps---effective-rent-calculation)
5. [Cap Rate Comps - Risk Adjustment Flow](#cap-rate-comps---risk-adjustment-flow)
6. [Multi-Family - GRM Method](#multi-family---grm-method)
7. [Quick Reference: Should It Have Adjustments?](#quick-reference-should-it-have-adjustments)

---

## Cost Approach - Critical Error

### ❌ CURRENT IMPLEMENTATION (WRONG)

```
┌─────────────────────────────────────────────────────────────┐
│                 COST APPROACH - CURRENT (WRONG)             │
└─────────────────────────────────────────────────────────────┘

Step 1: Get Land Value
   ↓
   Land Value = $500,000

Step 2: Select Building Cost Comps
   ↓
   ┌──────────────────────────────────────────────┐
   │  Comp 1: Recent building sold for $2.5M     │
   │  Building Size: 25,000 SF                    │
   │  Price per SF: $100/SF                       │
   │                                              │
   │  ❌ APPLY ADJUSTMENTS (WRONG!)              │
   │  ├─ Time Adjustment: +5%                    │
   │  ├─ Location Adjustment: +3%                │
   │  ├─ Condition Adjustment: -2%               │
   │  └─ Total Adjustment: +6%                   │
   │                                              │
   │  Adjusted $/SF: $106/SF                     │
   └──────────────────────────────────────────────┘
   ↓
Step 3: Calculate Building Value
   ↓
   Subject Building: 20,000 SF × $106/SF = $2,120,000
   ↓
Step 4: Total Value
   ↓
   ❌ WRONG CALCULATION:
   Land ($500K) + Adjusted Building ($2,120K) = $2,620,000

┌──────────────────────────────────────────────────┐
│  PROBLEM: This is treating cost comps like      │
│  sales comps! Cost approach doesn't adjust      │
│  comparable SALES - it calculates REPLACEMENT   │
│  COST and deducts DEPRECIATION.                 │
└──────────────────────────────────────────────────┘
```

---

### ✅ CORRECT IMPLEMENTATION

```
┌─────────────────────────────────────────────────────────────┐
│                 COST APPROACH - CORRECT                     │
└─────────────────────────────────────────────────────────────┘

Step 1: Get Land Value (from sales comparison of vacant land)
   ↓
   Land Value = $500,000

Step 2: Calculate Replacement Cost New
   ↓
   ┌──────────────────────────────────────────────┐
   │  Building Components:                        │
   │  ├─ Main Building: 20,000 SF × $150/SF      │
   │  │  (from Marshall & Swift cost manual)     │
   │  │  = $3,000,000                            │
   │  │                                          │
   │  ├─ Site Improvements:                      │
   │  │  • Parking lot: $100,000                │
   │  │  • Landscaping: $50,000                 │
   │  │  • Fencing: $25,000                     │
   │  │  = $175,000                             │
   │  │                                          │
   │  └─ Total Replacement Cost = $3,175,000    │
   └──────────────────────────────────────────────┘
   ↓
Step 3: Calculate Depreciation (NOT adjustments!)
   ↓
   ┌──────────────────────────────────────────────┐
   │  A. PHYSICAL DETERIORATION                  │
   │     ├─ Curable (Deferred Maintenance)      │
   │     │  • Needs paint: $15,000              │
   │     │  • HVAC repairs: $25,000             │
   │     │  Subtotal: $40,000                   │
   │     │                                      │
   │     ├─ Incurable - Short-lived             │
   │     │  • Roof (15 yrs old, 20 yr life)    │
   │     │    $100K × (15/20) = $75,000        │
   │     │  • HVAC systems                      │
   │     │    $50K × age/life = $30,000        │
   │     │  Subtotal: $105,000                  │
   │     │                                      │
   │     └─ Incurable - Long-lived              │
   │        • Building (20 yrs, 50 yr life)    │
   │          $3M × (20/50) = $400,000          │
   │        Subtotal: $400,000                  │
   │                                            │
   │  Physical Total: $545,000                  │
   ├──────────────────────────────────────────┤
   │  B. FUNCTIONAL OBSOLESCENCE                │
   │     ├─ Curable                             │
   │     │  • Outdated finishes: $50,000       │
   │     │                                      │
   │     └─ Incurable                           │
   │        • Low ceiling heights (8 ft)        │
   │          Market rent loss: $30,000         │
   │                                            │
   │  Functional Total: $80,000                 │
   ├──────────────────────────────────────────┤
   │  C. EXTERNAL OBSOLESCENCE                  │
   │     • Nearby landfill impact: $100,000    │
   │                                            │
   │  External Total: $100,000                  │
   ├──────────────────────────────────────────┤
   │  TOTAL DEPRECIATION: $725,000              │
   │  Depreciation %: 22.8%                     │
   └──────────────────────────────────────────────┘
   ↓
Step 4: Calculate Depreciated Cost
   ↓
   Replacement Cost New:     $3,175,000
   Less: Total Depreciation: -$725,000
                            ───────────
   Depreciated Cost:         $2,450,000
   ↓
Step 5: Add Land Value
   ↓
   ✅ CORRECT CALCULATION:
   
   Land Value:              $500,000
   Depreciated Cost:      +$2,450,000
                          ───────────
   INDICATED VALUE:       $2,950,000

┌──────────────────────────────────────────────────┐
│  KEY DIFFERENCE: No comp adjustments!            │
│  Instead: Cost manual + Depreciation analysis    │
└──────────────────────────────────────────────────┘
```

---

### Side-by-Side Comparison

```
┌─────────────────────────────┬─────────────────────────────┐
│     CURRENT (WRONG) ❌      │      CORRECT ✅             │
├─────────────────────────────┼─────────────────────────────┤
│ Uses SOLD PROPERTIES        │ Uses COST MANUALS           │
│ (comps with sale prices)    │ (Marshall & Swift, RS Means)│
│                             │                             │
│ Applies ADJUSTMENTS         │ Calculates DEPRECIATION     │
│ • Time: +5%                 │ • Physical: $545K           │
│ • Location: +3%             │ • Functional: $80K          │
│ • Condition: -2%            │ • External: $100K           │
│                             │                             │
│ Adjusts SALE PRICE          │ Deducts from COST           │
│ (like sales comp approach)  │ (unique to cost approach)   │
│                             │                             │
│ Final: Land + Adjusted Sale │ Final: Land + (Cost - Depr) │
│                             │                             │
│ RESULT: Incorrect Value     │ RESULT: Correct Value       │
│         Violates USPAP      │         Complies with USPAP │
└─────────────────────────────┴─────────────────────────────┘
```

---

## Sales Comparison Approach - Flow

### ✅ CORRECT - This approach SHOULD have adjustments

```
┌────────────────────────────────────────────────────────────────┐
│              SALES COMPARISON APPROACH - CORRECT                │
└────────────────────────────────────────────────────────────────┘

                    SUBJECT PROPERTY
                   (To be appraised)
                          │
                          ↓
            ┌─────────────────────────┐
            │  Search for Comparable  │
            │  Sales (Comps)          │
            └─────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ↓                           ↓
      COMP #1                      COMP #2                   COMP #3
   Sold $2.5M                    Sold $2.7M                Sold $2.3M
   25,000 SF                     27,000 SF                 23,000 SF
   2015 Built                    2018 Built                2012 Built
   Good Condition                Excellent Cond            Average Cond
            │                           │                        │
            ↓                           ↓                        ↓
   ┌─────────────────┐         ┌─────────────────┐      ┌─────────────────┐
   │  TRANSACTIONAL  │         │  TRANSACTIONAL  │      │  TRANSACTIONAL  │
   │  ADJUSTMENTS    │         │  ADJUSTMENTS    │      │  ADJUSTMENTS    │
   ├─────────────────┤         ├─────────────────┤      ├─────────────────┤
   │ • Financing:    │         │ • Financing:    │      │ • Financing:    │
   │   Cash = $0     │         │   Seller finance│      │   Cash = $0     │
   │                 │         │   = -$50,000    │      │                 │
   │ • Conditions:   │         │ • Conditions:   │      │ • Conditions:   │
   │   Arm's length  │         │   Market sale   │      │   Estate sale   │
   │   = $0          │         │   = $0          │      │   = +$75,000    │
   │                 │         │                 │      │                 │
   │ • Time:         │         │ • Time:         │      │ • Time:         │
   │   1 year ago    │         │   6 months ago  │      │   18 months ago │
   │   = +$125,000   │         │   = +$67,500    │      │   = +$207,000   │
   │   (5% annual)   │         │   (2.5%)        │      │   (9%)          │
   └─────────────────┘         └─────────────────┘      └─────────────────┘
            │                           │                        │
            ↓                           ↓                        ↓
   ┌─────────────────┐         ┌─────────────────┐      ┌─────────────────┐
   │   PROPERTY      │         │   PROPERTY      │      │   PROPERTY      │
   │   ADJUSTMENTS   │         │   ADJUSTMENTS   │      │   ADJUSTMENTS   │
   ├─────────────────┤         ├─────────────────┤      ├─────────────────┤
   │ • Location:     │         │ • Location:     │      │ • Location:     │
   │   Same = $0     │         │   Better than   │      │   Worse than    │
   │                 │         │   subject       │      │   subject       │
   │                 │         │   = -$100,000   │      │   = +$150,000   │
   │ • Size:         │         │ • Size:         │      │ • Size:         │
   │   +1,000 SF     │         │   +3,000 SF     │      │   -1,000 SF     │
   │   = -$50,000    │         │   = -$150,000   │      │   = +$50,000    │
   │                 │         │                 │      │                 │
   │ • Condition:    │         │ • Condition:    │      │ • Condition:    │
   │   Same = $0     │         │   Better = -$75K│      │   Worse = +$100K│
   │                 │         │                 │      │                 │
   │ • Age:          │         │ • Age:          │      │ • Age:          │
   │   -3 years      │         │   Newer by 6 yrs│      │   Older by 6 yrs│
   │   = +$30,000    │         │   = -$60,000    │      │   = +$60,000    │
   └─────────────────┘         └─────────────────┘      └─────────────────┘
            │                           │                        │
            ↓                           ↓                        ↓
   ┌─────────────────┐         ┌─────────────────┐      ┌─────────────────┐
   │ Total Adj:      │         │ Total Adj:      │      │ Total Adj:      │
   │ +$105,000       │         │ -$367,500       │      │ +$642,000       │
   │                 │         │                 │      │                 │
   │ Adjusted Value: │         │ Adjusted Value: │      │ Adjusted Value: │
   │ $2,605,000      │         │ $2,332,500      │      │ $2,942,000      │
   └─────────────────┘         └─────────────────┘      └─────────────────┘
            │                           │                        │
            └───────────────┬───────────┴────────────────────────┘
                            ↓
                   ┌─────────────────┐
                   │  RECONCILIATION │
                   ├─────────────────┤
                   │ Comp 1: $2.605M │ Weight: 30%
                   │ Comp 2: $2.333M │ Weight: 40% (Best match)
                   │ Comp 3: $2.942M │ Weight: 30%
                   │                 │
                   │ Weighted Avg:   │
                   │ $2,573,750      │
                   │                 │
                   │ INDICATED VALUE │
                   │   $2,575,000    │
                   └─────────────────┘
```

### Key Principle: Adjustments are made TO the comp, FOR differences from subject

```
┌──────────────────────────────────────────────────────────────┐
│  IF comp is BETTER than subject → SUBTRACT (comp worth more) │
│  IF comp is WORSE than subject → ADD (comp worth less)       │
│                                                              │
│  Example:                                                    │
│  Subject: 24,000 SF, Good condition, 2016 built             │
│  Comp: 27,000 SF, Excellent condition, 2018 built           │
│                                                              │
│  Adjustments TO comp:                                        │
│  • Larger size → SUBTRACT $150K (extra 3,000 SF worth more) │
│  • Better condition → SUBTRACT $75K (better = worth more)    │
│  • Newer → SUBTRACT $60K (newer = worth more)                │
└──────────────────────────────────────────────────────────────┘
```

---

## All Approaches Comparison Matrix

### Visual Matrix: Should It Have Adjustments?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ADJUSTMENT FIELD REQUIREMENTS                          │
├────────────────────────┬──────────────┬──────────────┬─────────────────────┤
│ APPROACH               │ HAS COMPS?   │ ADJUSTMENTS? │ ADJUSTMENT TYPE     │
├────────────────────────┼──────────────┼──────────────┼─────────────────────┤
│                        │              │              │                     │
│ 1. Sales Comparison    │      ✅      │      ✅      │ Property +          │
│                        │      YES     │      YES     │ Transactional       │
│                        │              │              │                     │
│    Status: ⚠️ Partial  │              │              │ Missing: financing, │
│                        │              │              │ conditions of sale  │
├────────────────────────┼──────────────┼──────────────┼─────────────────────┤
│                        │              │              │                     │
│ 2. Cost Approach       │      ⚠️      │      ❌      │ DEPRECIATION        │
│                        │  Data Only   │      NO!     │ (not adjustments)   │
│                        │              │              │                     │
│    Status: ❌ WRONG    │              │              │ Currently uses      │
│                        │              │              │ adjustments (ERROR!)│
├────────────────────────┼──────────────┼──────────────┼─────────────────────┤
│                        │              │              │                     │
│ 3. Income Approach     │      ❌      │      ❌      │ Direct Calculation  │
│                        │      NO      │      NO      │ NOI ÷ Cap Rate      │
│                        │              │              │                     │
│    Status: ✅ CORRECT  │              │              │ No adjustments      │
│                        │              │              │ needed              │
├────────────────────────┼──────────────┼──────────────┼─────────────────────┤
│                        │              │              │                     │
│ 4. Lease Comps         │      ✅      │      ⚠️      │ LEASE TERMS         │
│                        │      YES     │   LIMITED    │ (not property)      │
│                        │              │              │                     │
│    Status: ⚠️ Partial  │              │              │ Missing: TI, free   │
│                        │              │              │ rent, escalations   │
├────────────────────────┼──────────────┼──────────────┼─────────────────────┤
│                        │              │              │                     │
│ 5. Cap Rate Comps      │      ✅      │      ⚠️      │ RISK FACTORS        │
│                        │      YES     │   LIMITED    │ (not physical)      │
│                        │              │              │                     │
│    Status: ⚠️ Partial  │              │              │ Missing: tenant     │
│                        │              │              │ quality, occupancy  │
├────────────────────────┼──────────────┼──────────────┼─────────────────────┤
│                        │              │              │                     │
│ 6. Multi-Family/GRM    │      ✅      │      ⚠️      │ UNIT-BASED          │
│                        │      YES     │   LIMITED    │ (per unit/GRM)      │
│                        │              │              │                     │
│    Status: ⚠️ Partial  │              │              │ Missing: GRM calc,  │
│                        │              │              │ amenity analysis    │
├────────────────────────┼──────────────┼──────────────┼─────────────────────┤
│                        │              │              │                     │
│ 7. Rent Roll           │      ❌      │      ❌      │ Direct Analysis     │
│                        │      NO      │      NO      │ (property's rents)  │
│                        │              │              │                     │
│    Status: ✅ CORRECT  │              │              │ No comps or         │
│                        │              │              │ adjustments         │
└────────────────────────┴──────────────┴──────────────┴─────────────────────┘

Legend:
  ✅ = Correct implementation
  ⚠️ = Partially correct, needs enhancement
  ❌ = Incorrect implementation OR correctly has none
```

---

## Lease Comps - Effective Rent Calculation

### Why Lease Comps Need Special Treatment

```
┌─────────────────────────────────────────────────────────────────┐
│                  LEASE COMPS - EFFECTIVE RENT                   │
└─────────────────────────────────────────────────────────────────┘

Problem: Two leases may have same CONTRACT RENT but different value

Example:

┌─────────────────────────────────────────────────────────────────┐
│ LEASE A: $25/SF/Year                                            │
│ ├─ 5-year term                                                  │
│ ├─ No free rent                                                 │
│ ├─ $0 TI allowance                                              │
│ ├─ 3% annual escalations                                        │
│ │                                                                │
│ └─ EFFECTIVE RENT: $25.00/SF/Year                               │
├─────────────────────────────────────────────────────────────────┤
│ LEASE B: $25/SF/Year (SAME contract rent)                       │
│ ├─ 5-year term                                                  │
│ ├─ 6 months FREE RENT                                           │
│ ├─ $30/SF TI allowance                                          │
│ ├─ No escalations                                               │
│ │                                                                │
│ └─ EFFECTIVE RENT: $18.50/SF/Year (26% LESS!)                   │
└─────────────────────────────────────────────────────────────────┘

Calculation for Lease B:

Step 1: Adjust for Free Rent
   Contract Rent: $25/SF/Year
   Free Rent: 6 months of 60 months = 10%
   Adjusted: $25 × (1 - 0.10) = $22.50/SF/Year

Step 2: Adjust for TI Allowance
   TI Allowance: $30/SF
   Amortize over 5 years: $30 ÷ 5 = $6.00/SF/Year
   Adjusted: $22.50 - $6.00 = $16.50/SF/Year

Step 3: Adjust for Escalations (Lease A has them)
   Lease A grows 3% annually (average ~$2/SF value)
   Lease B has no growth
   Effective Rent for B: $16.50/SF/Year

Conclusion: 
   Lease A = $25.00/SF effective
   Lease B = $16.50/SF effective
   Difference: 34% despite same contract rent!
```

### Lease Comp Adjustment Flow

```
                    LEASE COMP
                  Contract Rent: $30/SF/Yr
                         │
                         ↓
         ┌───────────────────────────────┐
         │   LEASE TERM ADJUSTMENTS      │
         ├───────────────────────────────┤
         │ • Free Rent (3 months)        │
         │   Impact: -$7.50/SF           │
         │                               │
         │ • TI Allowance ($25/SF)       │
         │   Amortized: -$5.00/SF/yr     │
         │                               │
         │ • Escalations (CPI)           │
         │   Value: +$1.50/SF            │
         └───────────────────────────────┘
                         │
                         ↓
                Adjusted Lease Rate
                  $19.00/SF/Year
                         │
                         ↓
         ┌───────────────────────────────┐
         │   PROPERTY ADJUSTMENTS        │
         ├───────────────────────────────┤
         │ • Location                    │
         │   Adjustment: +$2.00/SF       │
         │                               │
         │ • Space Size (smaller)        │
         │   Adjustment: +$1.00/SF       │
         │                               │
         │ • Condition (worse)           │
         │   Adjustment: +$1.50/SF       │
         └───────────────────────────────┘
                         │
                         ↓
              EFFECTIVE MARKET RENT
                $23.50/SF/Year
```

---

## Cap Rate Comps - Risk Adjustment Flow

### Understanding Cap Rate Direction

```
┌─────────────────────────────────────────────────────────────────┐
│                 CAP RATE RISK RELATIONSHIP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LOWER Risk  = LOWER Cap Rate = HIGHER Value                   │
│  HIGHER Risk = HIGHER Cap Rate = LOWER Value                   │
│                                                                 │
│  Example Property Values at Different Cap Rates:               │
│                                                                 │
│  NOI = $500,000/year                                           │
│                                                                 │
│  ┌────────────┬─────────────┬────────────────┐                │
│  │ Cap Rate   │ Value       │ Property Type  │                │
│  ├────────────┼─────────────┼────────────────┤                │
│  │ 4.0%       │ $12,500,000 │ Class A+       │                │
│  │ 5.0%       │ $10,000,000 │ Class A        │                │
│  │ 6.0%       │ $8,333,333  │ Class B+       │                │
│  │ 7.0%       │ $7,142,857  │ Class B        │                │
│  │ 8.0%       │ $6,250,000  │ Class C+       │                │
│  │ 9.0%       │ $5,555,556  │ Class C        │                │
│  │ 10.0%      │ $5,000,000  │ Class D        │                │
│  └────────────┴─────────────┴────────────────┘                │
│                                                                 │
│  1% change in cap rate = ~12-15% change in value!              │
└─────────────────────────────────────────────────────────────────┘
```

### Cap Rate Adjustment Process

```
                 COMP PROPERTY SOLD
            Sale Price: $8,000,000
            NOI: $560,000
            Cap Rate: 7.0%
                      │
                      ↓
         ┌─────────────────────────────┐
         │   ANALYZE RISK FACTORS      │
         │   (Comp vs Subject)         │
         └─────────────────────────────┘
                      │
        ┏─────────────┻─────────────┓
        ↓                           ↓
┌──────────────────┐        ┌──────────────────┐
│ COMP PROPERTY    │        │ SUBJECT PROPERTY │
├──────────────────┤        ├──────────────────┤
│ Location: B      │        │ Location: A      │
│ Tenant: Local    │        │ Tenant: Credit   │
│ Occupancy: 85%   │        │ Occupancy: 95%   │
│ Age: 25 years    │        │ Age: 5 years     │
│ Condition: Good  │        │ Condition: Excell│
└──────────────────┘        └──────────────────┘
        │                           │
        └────────────┬──────────────┘
                     ↓
         ┌─────────────────────────────┐
         │   CALCULATE ADJUSTMENTS     │
         ├─────────────────────────────┤
         │ Location: A vs B            │
         │   -1.0% (Subject better)    │
         │                             │
         │ Tenant: Credit vs Local     │
         │   -1.0% (Subject better)    │
         │                             │
         │ Occupancy: 95% vs 85%       │
         │   -0.4% (Subject stabilized)│
         │                             │
         │ Age: 5 yrs vs 25 yrs        │
         │   -0.5% (Subject newer)     │
         │                             │
         │ Condition: Excell vs Good   │
         │   -0.3% (Subject better)    │
         │                             │
         │ TOTAL ADJUSTMENT: -3.2%     │
         └─────────────────────────────┘
                     ↓
         ┌─────────────────────────────┐
         │   ADJUSTED CAP RATE         │
         ├─────────────────────────────┤
         │ Comp's Cap Rate: 7.0%       │
         │ Adjustment: -3.2%           │
         │                             │
         │ Adjusted: 3.8%              │
         │                             │
         │ (Subject has LOWER risk,    │
         │  therefore LOWER cap rate)  │
         └─────────────────────────────┘
                     ↓
         ┌─────────────────────────────┐
         │   APPLY TO SUBJECT          │
         ├─────────────────────────────┤
         │ Subject NOI: $500,000       │
         │ Market Cap Rate: 3.8%       │
         │                             │
         │ Indicated Value:            │
         │ $500,000 ÷ 0.038            │
         │ = $13,157,895               │
         └─────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ KEY INSIGHT: Subject is LOWER RISK than comp, so:           │
│ • Lower cap rate (3.8% vs 7.0%)                             │
│ • Higher value multiplier (26.3x vs 14.3x)                  │
│ • Worth MORE per dollar of NOI                              │
└──────────────────────────────────────────────────────────────┘
```

### Risk Factor Impact Chart

```
┌─────────────────────────────────────────────────────────────────┐
│               CAP RATE IMPACT BY RISK FACTOR                    │
├──────────────────────┬──────────────────┬──────────────────────┤
│ Risk Factor          │ Typical Range    │ Example              │
├──────────────────────┼──────────────────┼──────────────────────┤
│ Location Quality     │ ±1.0% to ±3.0%   │ A vs C = 2.0%        │
│ Tenant Credit        │ ±0.5% to ±2.0%   │ Credit vs Local=1.5% │
│ Lease Term           │ ±0.3% to ±1.0%   │ Long vs Short = 0.8% │
│ Occupancy            │ ±0.5% to ±4.0%   │ 95% vs 70% = 2.5%    │
│ Property Condition   │ ±0.3% to ±1.5%   │ Excell vs Fair = 1.0%│
│ Property Age         │ ±0.2% to ±1.0%   │ New vs Old = 0.6%    │
│ Market Tier          │ ±0.5% to ±2.0%   │ Primary vs Tertiary  │
│ Management Intensity │ ±0.2% to ±0.8%   │ NNN vs Full Svc=0.5% │
└──────────────────────┴──────────────────┴──────────────────────┘

Example Combined Effect:
  Comp: C Location, Local Tenant, 80% Occupied = 9.0% cap
  Subject: A Location, Credit Tenant, 95% Occupied
  
  Adjustments:
    Location: -2.0%
    Tenant: -1.5%
    Occupancy: -1.5%
    Total: -5.0%
  
  Adjusted Cap for Subject: 4.0%
  
  With same NOI of $500K:
    Comp Value: $500K ÷ 0.09 = $5,555,556
    Subject Value: $500K ÷ 0.04 = $12,500,000
    
  Subject worth 125% MORE due to lower risk!
```

---

## Multi-Family - GRM Method

### Gross Rent Multiplier Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                MULTI-FAMILY: GRM METHOD                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: Calculate GRM from Comparable Sales

┌──────────────────────────────────────────────────────────────┐
│ COMP #1: 50-Unit Apartment Complex                          │
│ ├─ Sale Price: $5,000,000                                   │
│ ├─ Monthly Gross Rent: $50,000                              │
│ │   (50 units × $1,000 avg rent)                            │
│ ├─ Annual Gross Rent: $600,000                              │
│ │                                                            │
│ └─ GRM = Sale Price ÷ Annual Rent                           │
│     $5,000,000 ÷ $600,000 = 8.33                            │
├──────────────────────────────────────────────────────────────┤
│ COMP #2: 75-Unit Apartment Complex                          │
│ ├─ Sale Price: $8,250,000                                   │
│ ├─ Monthly Gross Rent: $82,500                              │
│ │   (75 units × $1,100 avg rent)                            │
│ ├─ Annual Gross Rent: $990,000                              │
│ │                                                            │
│ └─ GRM = $8,250,000 ÷ $990,000 = 8.33                       │
├──────────────────────────────────────────────────────────────┤
│ COMP #3: 40-Unit Apartment Complex                          │
│ ├─ Sale Price: $3,600,000                                   │
│ ├─ Monthly Gross Rent: $36,000                              │
│ │   (40 units × $900 avg rent)                              │
│ ├─ Annual Gross Rent: $432,000                              │
│ │                                                            │
│ └─ GRM = $3,600,000 ÷ $432,000 = 8.33                       │
└──────────────────────────────────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────────────────────┐
│ MARKET GRM CONCLUSION                                        │
│ ├─ Comp 1 GRM: 8.33                                         │
│ ├─ Comp 2 GRM: 8.33                                         │
│ ├─ Comp 3 GRM: 8.33                                         │
│ │                                                            │
│ └─ MARKET GRM: 8.33 (consistent!)                           │
└──────────────────────────────────────────────────────────────┘
              │
              ↓

Step 2: Apply GRM to Subject Property

┌──────────────────────────────────────────────────────────────┐
│ SUBJECT PROPERTY: 60-Unit Apartment Complex                 │
│                                                              │
│ Unit Mix:                                                    │
│ ├─ 20 units: 1BR @ $950/month = $19,000/month               │
│ ├─ 30 units: 2BR @ $1,200/month = $36,000/month             │
│ └─ 10 units: 3BR @ $1,500/month = $15,000/month             │
│                                                              │
│ Total Monthly Rent: $70,000                                  │
│ Annual Gross Rent: $840,000                                  │
│                                                              │
│ APPLY MARKET GRM:                                            │
│ Value = Annual Rent × GRM                                    │
│       = $840,000 × 8.33                                      │
│       = $6,997,200                                           │
│                                                              │
│ INDICATED VALUE: $7,000,000                                  │
│                                                              │
│ Check: Price per Unit = $7M ÷ 60 = $116,667/unit           │
└──────────────────────────────────────────────────────────────┘
```

### Per-Unit Method (Alternative)

```
Method 2: Price Per Unit

From Comps:
  Comp 1: $5,000,000 ÷ 50 units = $100,000/unit
  Comp 2: $8,250,000 ÷ 75 units = $110,000/unit
  Comp 3: $3,600,000 ÷ 40 units = $90,000/unit
  
  Market Average: $100,000/unit
  
Apply to Subject:
  60 units × $100,000 = $6,000,000

Reconciliation:
  GRM Method: $7,000,000
  Per-Unit Method: $6,000,000
  
  Difference explained by:
  • Subject has higher rents ($1,167 avg vs $1,000 market avg)
  • GRM method captures this rent premium
  • Per-unit method misses it
  
  Final Indicated Value: $6,500,000
  (weighted toward GRM method 60%, per-unit 40%)
```

### Why GRM is Critical for Multi-Family

```
┌─────────────────────────────────────────────────────────────────┐
│            WHY GRM MATTERS IN MULTI-FAMILY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Two properties with SAME unit count can have DIFFERENT values  │
│  if rents differ:                                               │
│                                                                 │
│  Property A: 50 units @ $800/month avg = $40,000/month         │
│    Value at 8.33 GRM: $480K × 8.33 = $3,998,400               │
│                                                                 │
│  Property B: 50 units @ $1,200/month avg = $60,000/month       │
│    Value at 8.33 GRM: $720K × 8.33 = $5,997,600               │
│                                                                 │
│  DIFFERENCE: 50% more value with 50% higher rents!             │
│                                                                 │
│  GRM captures income-producing capability                       │
│  Per-unit method misses rent differences                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Should It Have Adjustments?

### Decision Tree

```
                    START: Valuation Approach
                              │
                              ↓
                    ┌─────────────────────┐
                    │ Does it use COMPS?  │
                    └─────────────────────┘
                       ↙              ↘
                     YES               NO
                      │                 │
                      ↓                 ↓
        ┌─────────────────────┐   ┌─────────────────────┐
        │ What TYPE of comp?  │   │ NO ADJUSTMENTS      │
        └─────────────────────┘   │ (Direct calculation)│
                      │            │                     │
          ┌───────────┼───────┐   │ Examples:           │
          ↓           ↓       ↓   │ • Income Approach   │
      SALES       LEASE     CAP   │ • Rent Roll         │
      COMPS       COMPS    RATE   └─────────────────────┘
          │           │       │
          ↓           ↓       ↓
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ Property│ │  Lease  │ │  Risk   │
    │   +     │ │  Terms  │ │ Factors │
    │ Trans-  │ │   +     │ │   +     │
    │ action  │ │Property │ │Property │
    │ Adjust  │ │ Adjust  │ │ Quality │
    └─────────┘ └─────────┘ └─────────┘
        │           │           │
        ↓           ↓           ↓
    ✅ YES      ✅ YES       ✅ YES
    Full Set    Limited     Limited
                 Set         Set

               EXCEPTION:
                    │
                    ↓
            ┌──────────────┐
            │ COST COMPS?  │
            └──────────────┘
                    │
                    ↓
            ❌ NO ADJUSTMENTS!
            Use for cost data only
            Apply DEPRECIATION instead
```

### At-a-Glance Reference

```
┌──────────────────────────────────────────────────────────────────┐
│                    ADJUSTMENT QUICK REFERENCE                    │
├─────────────────────────┬───────────────┬────────────────────────┤
│ Approach                │ Adjustments?  │ Why/Why Not?           │
├─────────────────────────┼───────────────┼────────────────────────┤
│ 📊 Sales Comparison     │ ✅ YES        │ Comp differs from      │
│                         │ (8-12 fields) │ subject - must adjust  │
├─────────────────────────┼───────────────┼────────────────────────┤
│ 🏗️ Cost                 │ ❌ NO!        │ Uses cost manuals +    │
│                         │               │ depreciation, not comps│
├─────────────────────────┼───────────────┼────────────────────────┤
│ 💰 Income               │ ❌ NO         │ Direct: NOI ÷ Cap Rate │
├─────────────────────────┼───────────────┼────────────────────────┤
│ 📝 Lease Comps          │ ⚠️ LIMITED    │ Lease terms differ     │
│                         │ (6-8 fields)  │ (TI, free rent, etc.)  │
├─────────────────────────┼───────────────┼────────────────────────┤
│ 📈 Cap Rate Comps       │ ⚠️ LIMITED    │ Risk levels differ     │
│                         │ (5-7 fields)  │ (location, tenant, etc)│
├─────────────────────────┼───────────────┼────────────────────────┤
│ 🏢 Multi-Family/GRM     │ ⚠️ LIMITED    │ Unit mix, amenities    │
│                         │ (8-10 fields) │ differ; use GRM        │
├─────────────────────────┼───────────────┼────────────────────────┤
│ 📋 Rent Roll            │ ❌ NO         │ Direct property income │
│                         │               │ analysis (no comps)    │
└─────────────────────────┴───────────────┴────────────────────────┘
```

---

## Summary: Visual Hierarchy

### The Appraisal Pyramid

```
                        FINAL VALUE
                             ▲
                             │
            ┌────────────────┼────────────────┐
            │                │                │
      SALES COMP        COST            INCOME
      APPROACH         APPROACH        APPROACH
            │                │                │
            ↓                ↓                ↓
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Comp Sales   │  │ Cost Manuals │  │ NOI          │
    │      +       │  │      +       │  │      ÷       │
    │ ADJUSTMENTS  │  │ DEPRECIATION │  │ Cap Rate     │
    │              │  │              │  │              │
    │ ✅ Dropdowns │  │ ❌ NO        │  │ ❌ NO        │
    │    Needed    │  │  Dropdowns   │  │  Dropdowns   │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                      Reconciliation
                             │
                             ↓
                      FINAL OPINION OF VALUE


Supporting Approaches:
      │
      ├─ Lease Comps ───→ ⚠️ Limited adjustments (lease terms)
      ├─ Cap Rate Comps ─→ ⚠️ Limited adjustments (risk factors)
      ├─ Multi-Family ───→ ⚠️ Limited adjustments (GRM-based)
      └─ Rent Roll ──────→ ❌ No adjustments (direct analysis)
```

---

**End of Visual Diagrams**

*These diagrams complement the detailed analysis in:*  
`APPRAISAL_APPROACHES_ADJUSTMENT_FIELDS_ANALYSIS.md`

For implementation details, code examples, and full field specifications, refer to the main analysis document.








