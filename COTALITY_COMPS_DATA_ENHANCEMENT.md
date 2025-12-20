# Cotality Comp Data Enhancement Guide

**For:** Business Owners & Decision Makers  
**Purpose:** Field mapping and enhancement strategy for Cotality bulk data  
**Date:** November 2025

---

## Executive Summary

This document outlines how Cotality bulk property data maps to Harken's comp database and identifies high-value fields to add for competitive advantage.

### At a Glance

| Comp Type | Current Fields Mappable | Fields to Add | Total Enhanced Fields |
|-----------|------------------------|---------------|----------------------|
| **Commercial** | ~45 fields | 15 fields | ~60 fields |
| **Residential** | ~55 fields | 18 fields | ~73 fields |
| **Land** | ~30 fields | 12 fields | ~42 fields |

### Key Benefits

✅ **70-80% reduction** in manual data entry  
✅ **Comprehensive property data** for Montana & North Dakota  
✅ **Better comp quality** through enhanced filtering  
✅ **Competitive differentiation** vs. manual-only competitors  
✅ **Premium feature potential** for advanced analytics

---

## Table of Contents

1. [Commercial Comp Field Mapping](#commercial-comp-field-mapping)
2. [Residential Comp Field Mapping](#residential-comp-field-mapping)
3. [Land Comp Field Mapping](#land-comp-field-mapping)
4. [Fields to Add - Commercial](#fields-to-add---commercial)
5. [Fields to Add - Residential](#fields-to-add---residential)
6. [Fields to Add - Land](#fields-to-add---land)
7. [Business Value by User Type](#business-value-by-user-type)

---

## Commercial Comp Field Mapping

### Property Type: Commercial (Office, Retail, Industrial, Multi-Family 5+ units)

**Current Harken Fields → Cotality Data Source**

#### Core Property Information (45 fields currently mappable)

| Harken Database Field | Cotality Source Field | Cotality Field # | Available? |
|----------------------|----------------------|------------------|------------|
| **IDENTIFIERS** |
| `parcel_id_apn` | APN (PARCEL NUMBER UNFORMATTED) | 3 | ✅ Yes |
| `street_address` | PROPERTY STREET NAME - ENRICHED | 69 | ✅ Yes |
| `street_suite` | PROPERTY UNIT NUMBER - ENRICHED | 73 | ✅ Yes |
| `city` | PROPERTY CITY - ENRICHED | 74 | ✅ Yes |
| `county` | PROPERTY COUNTY NAME - ENRICHED | 78 | ✅ Yes |
| `state` | PROPERTY STATE - ENRICHED | 75 | ✅ Yes |
| `zipcode` | PROPERTY ZIPCODE 5 - ENRICHED | 76 | ✅ Yes |
| `latitude` | PARCEL LEVEL LATITUDE | 48 | ✅ Yes |
| `longitude` | PARCEL LEVEL LONGITUDE | 49 | ✅ Yes |
| `map_pin_lat` | PARCEL LEVEL LATITUDE | 48 | ✅ Yes |
| `map_pin_lng` | PARCEL LEVEL LONGITUDE | 49 | ✅ Yes |
| **PROPERTY DETAILS** |
| `type` | LAND USE CODE - ENRICHED | 34 | ✅ Yes |
| `property_class` | PROPERTY INDICATOR CODE - ENRICHED | 40 | ✅ Yes |
| `condition` | BUILDING IMPROVEMENT CONDITION CODE | 226 | ✅ Yes |
| `year_built` | YEAR BUILT - ENRICHED | 194 | ✅ Yes |
| `year_remodeled` | EFFECTIVE YEAR BUILT - ENRICHED | 195 | ✅ Yes |
| `building_size` | UNIVERSAL BUILDING SQUARE FEET | 246 | ✅ Yes |
| `land_size` | TOTAL LAND SQUARE FOOTAGE - ENRICHED | 191 | ✅ Yes |
| `land_dimension` | Calculate from TOTAL NUMBER OF ACRES | 190 | ✅ Yes |
| `frontage` | FRONT FOOTAGE | 188 | ✅ Yes |
| `topography` | LOCATION INFLUENCE CODE | 43 | ⚠️ Partial |
| `lot_shape` | BUILDING SHAPE TYPE CODE - ENRICHED | 229 | ⚠️ Partial |
| `utilities_select` | WATER TYPE CODE + SEWER TYPE CODE + ELECTRICITY TYPE CODE | 266, 264, 263 | ✅ Yes (combine) |
| `utilities_text` | Combine utility type descriptions | - | ✅ Yes (derived) |
| `zoning_type` | ZONING CODE | 38 | ✅ Yes |
| `stories` | TOTAL NUMBER OF STORIES - ENRICHED | 223 | ✅ Yes |
| `parking` | PARKING TYPE CODE | 237 | ✅ Yes |
| **SALE INFORMATION** |
| `sale_price` | SALE AMOUNT | 168 | ✅ Yes |
| `date_sold` | SALE RECORDING DATE | 166 | ✅ Yes |
| `price_square_foot` | Calculate: SALE AMOUNT / BUILDING SF | - | ✅ Yes (calculated) |
| `grantor` | SELLER NAME | 174 | ✅ Yes |
| `grantee` | Not in Cotality | - | ❌ No (manual) |
| `instrument` | SALE DOCUMENT TYPE CODE | 165 | ✅ Yes |
| `financing` | PRIMARY MORTGAGE AMOUNT | 175 | ✅ Yes |
| `list_price` | Not in Cotality | - | ❌ No (manual) |
| `days_on_market` | Calculate if list_date available | - | ⚠️ Partial |
| **LEASE INFORMATION** (if applicable) |
| `lease_rate` | ESTIMATED RENTAL VALUE | 744 | ✅ Yes (convert to $/SF) |
| `lease_rate_unit` | Derive from calculation | - | ✅ Yes (set to $/SF/Year) |
| `space` | UNIVERSAL BUILDING SQUARE FEET | 246 | ✅ Yes |
| `lease_type` | PROPERTY INDICATOR CODE - ENRICHED | 40 | ⚠️ Partial |
| `term` | Not in Cotality | - | ❌ No (manual) |
| `cam` | Not in Cotality | - | ❌ No (manual) |
| **INCOME APPROACH** |
| `cap_rate` | CAP RATE | 892 | ✅ Yes |
| `net_operating_income` | Calculate from ESTIMATED RENTAL VALUE | 744 | ⚠️ Estimated |
| `total_operating_expense` | Not in Cotality | - | ❌ No (manual) |
| `operating_expense_psf` | Calculate if expenses available | - | ⚠️ Partial |
| **ADDITIONAL** |
| `legal_desc` | LEGAL DESCRIPTION | 90 | ✅ Yes |
| `occupancy` | Not in Cotality | - | ❌ No (manual) |
| `summary` | Not in Cotality | - | ❌ No (manual) |
| `confirmed_by` | Not in Cotality | - | ❌ No (manual) |
| `confirmed_with` | Not in Cotality | - | ❌ No (manual) |

**Summary:**
- ✅ **Directly Available:** ~35 fields
- ⚠️ **Partial/Derived:** ~10 fields  
- ❌ **Not Available:** ~10 fields (require manual entry)
- **Total Auto-Populated:** ~45 fields

---

## Residential Comp Field Mapping

### Property Type: Residential (Single-Family, Duplex, Triplex, Fourplex, Condos)

**Current Harken Fields → Cotality Data Source**

#### All Commercial Fields PLUS Residential-Specific (55+ fields currently mappable)

Residential comps include **all 45 commercial fields** listed above, plus:

| Harken Database Field | Cotality Source Field | Cotality Field # | Available? |
|----------------------|----------------------|------------------|------------|
| **RESIDENTIAL DETAILS** |
| `bedrooms` | TOTAL NUMBER OF BEDROOMS - ALL BUILDINGS - ENRICHED | 196 | ✅ Yes |
| `bathrooms` | TOTAL NUMBER OF BATHROOMS - ALL BUILDINGS - ENRICHED | 198 | ✅ Yes |
| `basement` | BASEMENT TYPE CODE - ENRICHED | 213 | ✅ Yes |
| | BASEMENT PERCENTAGE FINISHED - ENRICHED | 215 | ✅ Yes |
| | FINISHED BASEMENT AREA SQUARE FEET | 259 | ✅ Yes |
| | UNFINISHED BASEMENT AREA SQUARE FEET | 260 | ✅ Yes |
| **BUILDING COMPONENTS** |
| `exterior` | EXTERIOR WALL TYPE CODE - ENRICHED | 231 | ✅ Yes |
| `roof` | ROOF COVER TYPE CODE - ENRICHED | 240 | ✅ Yes |
| | ROOF SHAPE TYPE CODE - ENRICHED | 241 | ✅ Yes |
| `heating_cooling` | HEATING TYPE CODE - ENRICHED | 221 | ✅ Yes |
| | AIR CONDITIONING TYPE CODE - ENRICHED | 210 | ✅ Yes |
| | AIR CONDITIONING INDICATOR - ENRICHED | 209 | ✅ Yes |
| `electrical` | ELECTRICITY/WIRING TYPE CODE | 263 | ✅ Yes |
| `plumbing` | Not in Cotality | - | ❌ No (manual) |
| `windows` | Not in Cotality | - | ❌ No (manual) |
| **AMENITIES** |
| `garage` | GARAGE TYPE CODE - ENRICHED | 235 | ✅ Yes |
| | TOTAL NUMBER OF PARKING SPACES - ENRICHED | 236 | ✅ Yes |
| `fireplace` | FIREPLACE INDICATOR - ENRICHED | 217 | ✅ Yes |
| | TOTAL NUMBER OF FIREPLACES - ENRICHED | 218 | ✅ Yes |
| | FIREPLACE TYPE CODE - ENRICHED | 219 | ✅ Yes |
| `fencing` | Not in Cotality | - | ❌ No (manual) |
| `other_amenities` | Combine: pool, patio, solar indicators | 238, 243, 244 | ✅ Yes (derived) |

**Summary:**
- ✅ **Directly Available:** ~50 fields
- ⚠️ **Partial/Derived:** ~5 fields  
- ❌ **Not Available:** ~5 fields (require manual entry)
- **Total Auto-Populated:** ~55 fields

---

## Land Comp Field Mapping

### Property Type: Land-Only (Vacant Land, Development Sites)

**Current Harken Fields → Cotality Data Source**

#### Land-Focused Fields (30 fields currently mappable)

| Harken Database Field | Cotality Source Field | Cotality Field # | Available? |
|----------------------|----------------------|------------------|------------|
| **IDENTIFIERS** (Same as Commercial) |
| `parcel_id_apn` | APN (PARCEL NUMBER UNFORMATTED) | 3 | ✅ Yes |
| `street_address` | PROPERTY STREET NAME - ENRICHED | 69 | ✅ Yes |
| `city` | PROPERTY CITY - ENRICHED | 74 | ✅ Yes |
| `county` | PROPERTY COUNTY NAME - ENRICHED | 78 | ✅ Yes |
| `state` | PROPERTY STATE - ENRICHED | 75 | ✅ Yes |
| `zipcode` | PROPERTY ZIPCODE 5 - ENRICHED | 76 | ✅ Yes |
| `latitude` | PARCEL LEVEL LATITUDE | 48 | ✅ Yes |
| `longitude` | PARCEL LEVEL LONGITUDE | 49 | ✅ Yes |
| **LAND CHARACTERISTICS** (Critical) |
| `land_size` | TOTAL LAND SQUARE FOOTAGE - ENRICHED | 191 | ✅ Yes |
| | TOTAL NUMBER OF ACRES - ENRICHED | 190 | ✅ Yes |
| `land_dimension` | Set to "Acre" or "SF" | - | ✅ Yes |
| `land_type` | LAND USE CODE - ENRICHED | 34 | ✅ Yes |
| | COUNTY LAND USE DESCRIPTION | 35 | ✅ Yes |
| | STATE LAND USE DESCRIPTION | 36 | ✅ Yes |
| **SITE DETAILS** |
| `topography` | LOCATION INFLUENCE CODE | 43 | ⚠️ Partial |
| `lot_shape` | BUILDING SHAPE TYPE CODE - ENRICHED | 229 | ⚠️ Partial |
| `frontage` | FRONT FOOTAGE | 188 | ✅ Yes |
| `front_feet` | FRONT FOOTAGE | 188 | ✅ Yes |
| `lot_depth` | DEPTH FOOTAGE | 189 | ✅ Yes |
| **UTILITIES & INFRASTRUCTURE** |
| `utilities_select` | WATER TYPE CODE + SEWER TYPE CODE + ELECTRICITY TYPE CODE | 266, 264, 263 | ✅ Yes (combine) |
| `utilities_text` | Combine utility descriptions | - | ✅ Yes (derived) |
| **ZONING & LEGAL** |
| `zoning_type` | ZONING CODE | 38 | ✅ Yes |
| `zoning_description` | ZONING CODE DESCRIPTION | 39 | ✅ Yes |
| `legal_desc` | LEGAL DESCRIPTION | 90 | ✅ Yes |
| **SALE INFORMATION** |
| `sale_price` | SALE AMOUNT | 168 | ✅ Yes |
| `date_sold` | SALE RECORDING DATE | 166 | ✅ Yes |
| `price_square_foot` | Calculate: SALE AMOUNT / ACRES ($/acre) | - | ✅ Yes (calculated) |
| `grantor` | SELLER NAME | 174 | ✅ Yes |
| `grantee` | Not in Cotality | - | ❌ No (manual) |
| **NOT USED FOR LAND** |
| `building_size` | N/A (land only) | - | Set to 0/NULL |
| `year_built` | N/A (land only) | - | Set to NULL |
| `condition` | N/A (land only) | - | Set to NULL |

**Summary:**
- ✅ **Directly Available:** ~25 fields
- ⚠️ **Partial/Derived:** ~5 fields  
- ❌ **Not Available:** ~5 fields (require manual entry)
- **Total Auto-Populated:** ~30 fields

---

## Fields to Add - Commercial

### 15 High-Value Fields NOT Currently in Harken Database

These fields are available in Cotality data and should be added to enhance comp quality and analysis.

| Priority | Field Name | Cotality Source | Field # | Why Add This Field |
|----------|-----------|-----------------|---------|-------------------|
| **🔴 CRITICAL - Add First** |
| 1 | **Owner Corporate Indicator** | OWNER 1 CORPORATE INDICATOR | 97 | **Identifies corporate vs. individual ownership**<br><br>**Value:** Corporate sales often don't reflect true market value due to portfolio transactions, 1031 exchanges, or distressed sales. Critical for determining if a comp is truly "arm's length."<br><br>**Users:**<br>• **Appraisers:** Filter out or adjust corporate sales that may be non-market<br>• **Banks:** Risk assessment - corporate ownership may indicate investment/distressed property<br>• **Brokers:** Market analysis - track corporate ownership trends in area |
| 2 | **Owner Occupancy Code** | OWNER OCCUPANCY CODE | 110 | **Owner-occupied vs. absentee/investor-owned**<br><br>**Value:** Owner-occupied properties typically sell at 5-15% premium over investor-owned properties. Critical adjustment factor.<br><br>**Users:**<br>• **Appraisers:** Adjust comps for owner occupancy differences<br>• **Banks:** Risk indicator - owner-occupied = lower default risk<br>• **Brokers:** Pricing strategy - owner-occupied properties command premium |
| 3 | **Sale Type Code** | SALE TYPE CODE | 169 | **Distinguishes market vs. non-market sales**<br><br>**Value:** Identifies foreclosure, gift, family transfer, estate sale, etc. Essential for filtering non-arm's-length transactions that shouldn't be used as comps.<br><br>**Users:**<br>• **Appraisers:** Filter non-market sales - exclude from analysis<br>• **Banks:** Risk assessment - distressed sales indicate market weakness<br>• **Brokers:** True market analysis - exclude anomalies |
| 4 | **Transaction Type Code** | TRANSACTION TYPE CODE | 170 | **Detailed transaction classification**<br><br>**Value:** Market sale with mortgage, cash sale, construction loan, refinance, etc. Provides context for financing terms and transaction motivation.<br><br>**Users:**<br>• **Appraisers:** Understand transaction context and financing impact<br>• **Banks:** LTV analysis - cash vs. financed sales<br>• **Brokers:** Market trends - track cash buyer activity |
| 5 | **Subdivision Name** | SUBDIVISION NAME | 89 | **Subdivision or condo complex name**<br><br>**Value:** Properties in the same subdivision are the best comps. Allows filtering for same-subdivision comps which require minimal adjustments.<br><br>**Users:**<br>• **Appraisers:** Comp selection - same subdivision preferred<br>• **Banks:** Market segmentation - subdivision-level pricing<br>• **Brokers:** Find true comparables quickly |
| **🟡 HIGH VALUE - Add Second** |
| 6 | **Total Number of Buildings** | TOTAL NUMBER OF BUILDINGS - ENRICHED | 41 | **Multi-building properties**<br><br>**Value:** A 5-building campus vs. single building requires different valuation. Critical for commercial properties with multiple structures.<br><br>**Users:**<br>• **Appraisers:** Understand property complexity<br>• **Banks:** Risk - multi-building = higher maintenance/management<br>• **Brokers:** Property description accuracy |
| 7 | **Total Number of Units** | TOTAL NUMBER OF UNITS - ALL BUILDINGS - ENRICHED | 245 | **Explicit unit count**<br><br>**Value:** Critical for multi-family and commercial properties. Allows per-unit value calculation and comparison.<br><br>**Users:**<br>• **Appraisers:** Calculate $/unit values for multi-family<br>• **Banks:** Income stream analysis - more units = diversified income<br>• **Brokers:** Investment analysis - ROI per unit |
| 8 | **Assessed Total Value** | ASSESSED TOTAL VALUE | 133 | **Total tax assessment**<br><br>**Value:** Compare assessed value to market value. Large gaps may indicate assessment appeal opportunity or overpricing.<br><br>**Users:**<br>• **Appraisers:** Third-party value validation<br>• **Banks:** Additional data point for value verification<br>• **Brokers:** Estimate property taxes for buyers |
| 9 | **Market Total Value** | MARKET TOTAL VALUE | 136 | **County's market value estimate**<br><br>**Value:** County assessor's independent market value opinion. Useful third-party validation point.<br><br>**Users:**<br>• **Appraisers:** Third-party validation of market value<br>• **Banks:** Additional value indicator<br>• **Brokers:** Market positioning reference |
| 10 | **Tax Rate Percent** | TOTAL PROPERTY TAX RATE PERCENT | 147 | **Property tax rate percentage**<br><br>**Value:** Calculate annual property taxes for any property. Critical for investment analysis and cap rate calculations.<br><br>**Users:**<br>• **Appraisers:** Operating expense estimation for income approach<br>• **Banks:** Debt service coverage analysis<br>• **Brokers:** Investment analysis - tax burden calculation |
| 11 | **View Code** | VIEW CODE | 42 | **Property view type**<br><br>**Value:** Gulf view, mountain view, pool view, city view, etc. Can add 10-30% value premium in certain markets.<br><br>**Users:**<br>• **Appraisers:** Location premium adjustment for view<br>• **Banks:** Value-add assessment<br>• **Brokers:** Premium marketing feature |
| 12 | **Location Influence Code** | LOCATION INFLUENCE CODE | 43 | **Positive/negative location factors**<br><br>**Value:** Waterfront, flood plain, airport proximity, golf course, cemetery, power lines. Critical for location adjustments (+/- 20% or more).<br><br>**Users:**<br>• **Appraisers:** Location adjustments - positive and negative<br>• **Banks:** Risk assessment - flood plain = insurance issues<br>• **Brokers:** Disclosure requirements and marketing |
| 13 | **Neighborhood Description** | NEIGHBORHOOD DESCRIPTION | 31 | **County-defined neighborhood**<br><br>**Value:** More specific than city - allows neighborhood-level comp selection. Better micro-market analysis.<br><br>**Users:**<br>• **Appraisers:** Neighborhood-level comp selection<br>• **Banks:** Market micro-segmentation<br>• **Brokers:** Neighborhood market reports |
| 14 | **Confidence Score** | CONFIDENCE SCORE - MKTG | 297 | **Data quality indicator (0-100)**<br><br>**Value:** Cotality's confidence in their data accuracy. Helps appraisers judge comp reliability.<br><br>**Users:**<br>• **Appraisers:** Data quality assessment - weight comps by confidence<br>• **Banks:** Risk indicator - low confidence = verify independently<br>• **Brokers:** Data reliability indicator |
| 15 | **Foreclosure Stage Code** | FORECLOSURE STAGE CODE | 44 | **Foreclosure status**<br><br>**Value:** Identifies properties in auction, pre-foreclosure, REO. Critical for filtering distressed sales that don't reflect market value.<br><br>**Users:**<br>• **Appraisers:** Filter distressed sales - exclude from analysis<br>• **Banks:** Risk assessment - foreclosure activity indicator<br>• **Brokers:** Distressed property identification |

---

## Fields to Add - Residential

### 18 High-Value Fields (15 Commercial + 3 Residential-Specific)

Residential comps should include **ALL 15 commercial fields** listed above, PLUS these 3 residential-specific fields:

| Priority | Field Name | Cotality Source | Field # | Why Add This Field |
|----------|-----------|-----------------|---------|-------------------|
| 16 | **Pool Indicator** | POOL INDICATOR - ENRICHED | 238 | **Pool presence (Y/N)**<br><br>**Value:** Pool can add $20,000-$100,000+ to residential value depending on market. Critical amenity for adjustment.<br><br>**Users:**<br>• **Appraisers:** Amenity adjustment ($20K-$100K typical)<br>• **Banks:** Value-add feature<br>• **Brokers:** Premium marketing feature |
| 17 | **Solar Panel Indicator** | SOLAR PANEL INDICATOR - ENRICHED | 244 | **Solar panels present (Y/N)**<br><br>**Value:** Solar panels add $15,000-$50,000+ value and reduce utility costs. Increasingly important green feature.<br><br>**Users:**<br>• **Appraisers:** Green feature adjustment<br>• **Banks:** Energy efficiency value<br>• **Brokers:** Sustainable feature marketing - lower monthly costs |
| 18 | **School District Name** | SCHOOL DISTRICT NAME | 26 | **School district**<br><br>**Value:** School quality is #1 driver of residential value for families. Properties in top-rated school districts command 10-25% premium.<br><br>**Users:**<br>• **Appraisers:** School district adjustment - can be 10-25% difference<br>• **Banks:** Marketability factor - easier to sell<br>• **Brokers:** Family buyer marketing - school ratings drive sales |

---

## Fields to Add - Land

### 12 High-Value Fields (Subset of Commercial Fields)

Land comps should include these fields from the commercial list:

| Fields to Add | Field Numbers | Why Important for Land |
|---------------|---------------|------------------------|
| Owner Corporate Indicator | #1 | Corporate land sales often part of larger deals |
| Owner Occupancy Code | #2 | Absentee land ownership common for investment |
| Sale Type Code | #3 | Filter foreclosure/distressed land sales |
| Transaction Type Code | #4 | Understand financing (cash land purchases common) |
| Assessed Total Value | #8 | Tax assessment for land value |
| Market Total Value | #9 | County market value estimate |
| Tax Rate Percent | #10 | Calculate holding costs |
| View Code | #11 | Premium for view lots |
| Location Influence Code | #12 | Waterfront, flood plain critical for land |
| Neighborhood Description | #13 | Neighborhood-level land values |
| Confidence Score | #14 | Data quality for land records |
| Foreclosure Stage Code | #15 | Distressed land sales common |

**Not Applicable for Land:**
- Subdivision Name (land typically pre-subdivision)
- Total Buildings/Units (no structures)
- Pool/Solar (no improvements)
- School District (less relevant for vacant land)

---

## Business Value by User Type

### For Appraisers

**Time Savings:**
- **Pre-populated comps** save 2-4 hours per evaluation/appraisal
- **Value:** $200-$400 per report in time savings
- **Better filtering** reduces comp search time by 50%

**Quality Improvements:**
- **Owner type filtering** eliminates questionable comps
- **Sale type filtering** ensures arm's length transactions
- **Subdivision/neighborhood matching** finds best comps
- **School district data** supports residential adjustments

**Competitive Advantage:**
- **Faster turnaround** - complete reports 30% faster
- **Better supported adjustments** - more data points
- **More defensible valuations** - third-party data validation

### For Banks

**Risk Reduction:**
- **Filter non-market sales** (foreclosures, family transfers)
- **Identify corporate sales** that may not reflect true value
- **Verify owner occupancy** for risk assessment
- **Track foreclosure activity** in market areas

**Faster Loan Decisions:**
- **Pre-populated comps** = faster appraisal completion
- **Better comp quality** = fewer valuation disputes
- **Automated validation** against county data

**Portfolio Analysis:**
- **Market trend tracking** by neighborhood/subdivision
- **Risk area identification** through foreclosure trends
- **Investment property identification** via owner occupancy

**Value:** 30-50% faster loan approvals, 10-15% reduction in valuation disputes

### For Brokers

**Better Pricing:**
- **More comp data** = better CMA (Comparative Market Analysis)
- **Subdivision-specific pricing** for accuracy
- **School district premium analysis** for residential
- **View premium quantification** for premium lots

**Client Presentations:**
- **Professional comp reports** with comprehensive data
- **Market trend analysis** by neighborhood
- **Third-party validation** (county assessments)

**Competitive Intelligence:**
- **Corporate ownership trends** in market
- **Foreclosure activity tracking** for opportunities
- **Investment vs. owner-occupied** market mix

**Value:** 15-20% improvement in listing price accuracy, more winning presentations

---

## Conclusion

### Summary of Enhancements

| Comp Type | Fields Currently Mappable | Fields to Add | Total Enhanced Coverage |
|-----------|--------------------------|---------------|------------------------|
| **Commercial** | ~45 fields | +15 fields | ~60 fields |
| **Residential** | ~55 fields | +18 fields | ~73 fields |
| **Land** | ~30 fields | +12 fields | ~42 fields |

### Key Benefits

✅ **Eliminate 70-80% of manual data entry**  
✅ **Enhanced filtering** for better comp selection  
✅ **Third-party validation** via county data  
✅ **Competitive differentiation** in marketplace  
✅ **Premium feature potential** for advanced users  

### Investment Overview

**Cotality Data Cost:**
- Montana: $30,000/year with monthly updates
- North Dakota: $30,000/year with monthly updates
- **Total:** $60,000/year

**Value Delivered:**
- Time savings for appraisers: 2-4 hours per report
- Better comp quality and selection
- Competitive platform advantage
- Premium tier revenue potential

---

**End of Document**

*This document focuses on field mapping and business value. For technical implementation details, see separate implementation guide.*

