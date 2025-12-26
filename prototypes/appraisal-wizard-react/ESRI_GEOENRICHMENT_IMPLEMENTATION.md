# ESRI GeoEnrichment API Integration Guide

## Overview

This document details the implementation plan for integrating ESRI's GeoEnrichment API to provide **true radius-based demographics** (1, 3, 5 mile rings) in the Appraisal Wizard V3.

### Current State vs. Target State

| Feature | Current (Census) | Target (ESRI) |
|---------|------------------|---------------|
| **Data Source** | US Census Bureau ACS | ESRI GeoEnrichment |
| **Radius Accuracy** | ❌ Approximated from county | ✅ True ring buffer |
| **Population Counts** | Scaled estimates | Exact counts |
| **Income Data** | County-level median | Precise radius median |
| **Employment by Industry** | Static percentages | Real local data |
| **Projections** | 1% assumed growth | ESRI 5-year projections |
| **Data Vintage** | 2022 ACS | 2024/2025 (updated annually) |
| **Cost** | FREE | Paid (credits-based) |

---

## Part 1: ESRI Developer Account & API Access

### 1.1 Account Setup

1. **Create an ArcGIS Developer Account**
   - Go to: https://developers.arcgis.com/sign-up/
   - Sign up with your organization email
   - Verify your email

2. **Generate an API Key**
   - Navigate to: https://developers.arcgis.com/api-keys/
   - Click "New API Key"
   - Name: `harken-appraisal-wizard-production`
   - Enable these scopes:
     - `geocode:storage` - For geocoding operations
     - `geoenrichment` - For demographics data
   - Copy the API key (starts with `AAPK...`)

3. **Add to Environment Variables**
   ```bash
   # In Vercel Dashboard > Project Settings > Environment Variables
   ESRI_API_KEY=AAPK...your-api-key-here
   ```

### 1.2 Pricing Structure (2024)

ESRI uses a **credits-based pricing model**:

| Service | Credits per Request |
|---------|---------------------|
| GeoEnrichment (per variable per study area) | 10 credits |
| Geocoding | 0.04 credits |

**Credit Costs:**
| Plan | Credits/Month | Cost | Cost per 1000 Lookups |
|------|--------------|------|----------------------|
| Free Tier | 50,000 | $0 | N/A |
| Pay-As-You-Go | N/A | $0.001/credit | ~$15 |
| Developer Subscription | 1M | ~$125/month | ~$1.50 |
| Enterprise | Custom | Contact ESRI | Negotiated |

**Cost Calculation for Our Use Case:**
- 3 radii × 15 variables = 45 credits per property lookup
- 50,000 free credits = ~1,111 property lookups/month (FREE)
- After free tier: ~$0.045 per property lookup

---

## Part 2: API Integration Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (React)                                                    │
│  └── DemographicsPanel.tsx                                          │
│      └── calls demographicsService.getDemographicsByRadius()        │
├─────────────────────────────────────────────────────────────────────┤
│  Vercel API Route                                                   │
│  └── /api/demographics/radius (POST)                                │
│      ├── Check: ESRI_API_KEY exists?                                │
│      │   ├── YES → Call ESRI GeoEnrichment                          │
│      │   └── NO  → Fall back to Census (approximated)               │
│      └── Return: { source: 'esri' | 'census', isApproximate: bool } │
├─────────────────────────────────────────────────────────────────────┤
│  Backend Libraries (api/_lib/)                                      │
│  ├── esri.ts       ← NEW: ESRI GeoEnrichment wrapper               │
│  └── census.ts     ← Existing: Fallback/free option                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Hybrid Strategy

We implement a **tiered approach**:

1. **Primary**: ESRI GeoEnrichment (when API key is configured)
2. **Fallback**: Census API (free, approximated)
3. **Emergency**: Cached county-level data

This ensures the app always works, even if ESRI is unavailable.

---

## Part 3: ESRI GeoEnrichment API Details

### 3.1 API Endpoint

```
POST https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/GeoEnrichment/enrich
```

### 3.2 Key Data Collections

For real estate appraisals, we need these data collections:

| Collection ID | Description | Key Variables |
|--------------|-------------|---------------|
| `KeyUSFacts` | Core US demographics | TOTPOP_CY, MEDHINC_CY, AVGHHSZ_CY |
| `populationtotals` | Population counts & projections | TOTPOP_CY, TOTPOP_FY |
| `householdincome` | Income data | MEDHINC_CY, AVGHINC_CY, PCI_CY |
| `educationalattainment` | Education levels | EDUCBASECY, BACHDEG_CY |
| `industry` | Employment by industry | All NAICS sectors |
| `age` | Age distribution | AGE0_CY through AGE85_CY |
| `housing` | Housing characteristics | TOTHU_CY, VACANT_CY, OWNER_CY |

### 3.3 Selected Analysis Variables

For our appraisal demographics panel, we use these 15 variables:

```typescript
const ESRI_ANALYSIS_VARIABLES = [
  // Population
  'KeyUSFacts.TOTPOP_CY',      // Total Population (Current Year)
  'KeyUSFacts.TOTPOP_FY',      // Total Population (5-Year Forecast)
  'KeyUSFacts.POPGRW_CY',      // Population Growth Rate
  
  // Households  
  'KeyUSFacts.TOTHH_CY',       // Total Households
  'KeyUSFacts.TOTHH_FY',       // Households (5-Year Forecast)
  'KeyUSFacts.AVGHHSZ_CY',     // Average Household Size
  
  // Income
  'KeyUSFacts.MEDHINC_CY',     // Median Household Income
  'KeyUSFacts.AVGHINC_CY',     // Average Household Income
  'KeyUSFacts.PCI_CY',         // Per Capita Income
  
  // Education
  'educationalattainment.EDUCBASECY',   // Education Base (25+)
  'educationalattainment.BACHDEG_CY',   // Bachelor's Degree
  'educationalattainment.GRADDEG_CY',   // Graduate/Professional Degree
  
  // Employment
  'KeyUSFacts.CIVLBFR_CY',     // Civilian Labor Force
  'KeyUSFacts.UNEMPRT_CY',     // Unemployment Rate
  'KeyUSFacts.UNEMPCNT_CY',    // Unemployed Count
];
```

### 3.4 Study Areas (Ring Buffers)

```typescript
const studyAreas = [
  {
    geometry: { x: longitude, y: latitude },
    areaType: 'RingBuffer',
    bufferUnits: 'esriMiles',
    bufferRadii: [1, 3, 5]  // All three radii in one request
  }
];
```

### 3.5 Sample API Request

```typescript
const requestBody = {
  f: 'json',
  token: ESRI_API_KEY,
  studyAreas: JSON.stringify([{
    geometry: { x: -108.5007, y: 45.7833 },
    areaType: 'RingBuffer',
    bufferUnits: 'esriMiles',
    bufferRadii: [1, 3, 5]
  }]),
  analysisVariables: JSON.stringify([
    'KeyUSFacts.TOTPOP_CY',
    'KeyUSFacts.MEDHINC_CY',
    // ... etc
  ]),
  returnGeometry: false,
  useData: JSON.stringify({
    sourceCountry: 'US',
    hierarchy: 'esri2025'  // Use latest data vintage
  })
};
```

### 3.6 Sample API Response

```json
{
  "results": [
    {
      "value": {
        "FeatureSet": [
          {
            "features": [
              {
                "attributes": {
                  "StdGeographyLevel": "1 Mile Ring",
                  "StdGeographyName": "1 Mile Ring",
                  "StdGeographyID": "0",
                  "TOTPOP_CY": 9876,
                  "TOTPOP_FY": 10234,
                  "MEDHINC_CY": 67890,
                  "AVGHHSZ_CY": 2.45,
                  "BACHDEG_CY": 1234,
                  "GRADDEG_CY": 567,
                  ...
                }
              },
              {
                "attributes": {
                  "StdGeographyLevel": "3 Mile Ring",
                  ...
                }
              },
              {
                "attributes": {
                  "StdGeographyLevel": "5 Mile Ring", 
                  ...
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## Part 4: Industry Employment Data

### 4.1 NAICS Industry Variables

ESRI provides employment by NAICS sector. We request these for the employment pie chart:

```typescript
const INDUSTRY_VARIABLES = [
  'industry.INDAGRI_CY',    // Agriculture
  'industry.INDMIN_CY',     // Mining
  'industry.INDCONS_CY',    // Construction
  'industry.INDMANU_CY',    // Manufacturing
  'industry.INDTRADE_CY',   // Wholesale Trade
  'industry.INDRTRADE_CY',  // Retail Trade
  'industry.INDTRANS_CY',   // Transportation
  'industry.INDINFO_CY',    // Information
  'industry.INDFIN_CY',     // Finance/Insurance
  'industry.INDRE_CY',      // Real Estate
  'industry.INDTECH_CY',    // Professional/Technical
  'industry.INDMGMT_CY',    // Management
  'industry.INDADMIN_CY',   // Administrative
  'industry.INDEDUC_CY',    // Education
  'industry.INDHLTH_CY',    // Healthcare
  'industry.INDARTS_CY',    // Arts/Entertainment
  'industry.INDFOOD_CY',    // Food Services
  'industry.INDOTSV_CY',    // Other Services
  'industry.INDPUB_CY',     // Public Administration
];
```

### 4.2 Industry Mapping

Map ESRI codes to human-readable names:

```typescript
const INDUSTRY_LABELS: Record<string, string> = {
  'INDAGRI_CY': 'Agriculture & Forestry',
  'INDMIN_CY': 'Mining & Oil/Gas',
  'INDCONS_CY': 'Construction',
  'INDMANU_CY': 'Manufacturing',
  'INDTRADE_CY': 'Wholesale Trade',
  'INDRTRADE_CY': 'Retail Trade',
  'INDTRANS_CY': 'Transportation & Warehousing',
  'INDINFO_CY': 'Information',
  'INDFIN_CY': 'Finance & Insurance',
  'INDRE_CY': 'Real Estate',
  'INDTECH_CY': 'Professional & Technical',
  'INDMGMT_CY': 'Management',
  'INDADMIN_CY': 'Administrative Services',
  'INDEDUC_CY': 'Education Services',
  'INDHLTH_CY': 'Healthcare & Social',
  'INDARTS_CY': 'Arts & Entertainment',
  'INDFOOD_CY': 'Accommodation & Food',
  'INDOTSV_CY': 'Other Services',
  'INDPUB_CY': 'Public Administration',
};
```

---

## Part 5: Implementation Files

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `api/_lib/esri.ts` | CREATE | ESRI GeoEnrichment API wrapper |
| `api/demographics/radius.ts` | MODIFY | Add ESRI as primary source |
| `src/services/demographicsService.ts` | MODIFY | Handle new response format |
| `src/types/api.ts` | MODIFY | Add employment data to types |
| `env.example` | MODIFY | Add ESRI_API_KEY |

---

## Part 6: Error Handling & Fallbacks

### 6.1 Fallback Chain

```typescript
async function getDemographics(lat: number, lng: number): Promise<DemographicsResponse> {
  // 1. Try ESRI (if API key configured)
  if (process.env.ESRI_API_KEY) {
    try {
      const esriData = await fetchFromESRI(lat, lng);
      return { ...esriData, source: 'esri', isApproximate: false };
    } catch (error) {
      console.error('ESRI failed, falling back to Census:', error);
    }
  }
  
  // 2. Fall back to Census (free, approximated)
  try {
    const censusData = await fetchFromCensus(lat, lng);
    return { ...censusData, source: 'census', isApproximate: true };
  } catch (error) {
    console.error('Census failed, using cached data:', error);
  }
  
  // 3. Emergency: Return cached county averages
  return { ...getCachedDefaults(lat, lng), source: 'cached', isApproximate: true };
}
```

### 6.2 Rate Limiting & Caching

```typescript
// Simple in-memory cache (Vercel serverless)
const cache = new Map<string, { data: DemographicsResponse; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(lat: number, lng: number): string {
  // Round to 3 decimal places (~100m precision) to increase cache hits
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}
```

---

## Part 7: Testing

### 7.1 Test Coordinates

| Location | Latitude | Longitude | Expected Population (1mi) |
|----------|----------|-----------|---------------------------|
| Downtown Billings, MT | 45.7833 | -108.5007 | ~10,000 |
| Rural Montana | 46.8797 | -113.9940 | ~500 |
| Los Angeles, CA | 34.0522 | -118.2437 | ~50,000 |

### 7.2 API Testing

```bash
# Test ESRI endpoint directly
curl -X POST "https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/GeoEnrichment/enrich" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "f=json" \
  -d "token=YOUR_API_KEY" \
  -d "studyAreas=[{\"geometry\":{\"x\":-108.5007,\"y\":45.7833},\"areaType\":\"RingBuffer\",\"bufferUnits\":\"esriMiles\",\"bufferRadii\":[1]}]" \
  -d "analysisVariables=[\"KeyUSFacts.TOTPOP_CY\",\"KeyUSFacts.MEDHINC_CY\"]"
```

---

## Part 8: Benefits Summary

| Benefit | Impact |
|---------|--------|
| **Accurate Radius Data** | True ring buffers, not approximations |
| **Updated Data** | 2024/2025 vintage vs 2022 Census |
| **5-Year Projections** | Built-in forecasts from ESRI |
| **Industry Employment** | Real local NAICS data |
| **Professional Appearance** | "Data: ESRI Demographics" in report footer |
| **Cost Efficient** | ~1,100 free lookups/month |
| **Fallback Safety** | Census API as backup |

---

## Part 9: Report Output Enhancement

### Current Report Output (Census)
```
Source: US Census Bureau ACS 2022 (County-level estimates)
Note: Radius data approximated from county totals
```

### Enhanced Report Output (ESRI)
```
Source: ESRI Demographics 2025
Data: GeoEnrichment ring buffer analysis
Vintage: June 2025 Update
Methodology: Census Bureau ACS, proprietary ESRI modeling
```

This professional data attribution adds credibility to the appraisal report.

---

## Implementation Status (Completed)

All files have been created/updated:

### Created Files
| File | Purpose |
|------|---------|
| `api/_lib/esri.ts` | ESRI GeoEnrichment API wrapper with all variable mappings |
| `api/maps/static-radius.ts` | Static map URL generator for PDF reports |
| `src/components/RadiusRingMap.tsx` | Interactive Google Maps component with radius rings |
| `src/components/DemographicsPanel.tsx` | Combined map + data table panel for wizard |

### Updated Files
| File | Changes |
|------|---------|
| `api/demographics/radius.ts` | Added ESRI as primary source, Census as fallback |
| `src/types/api.ts` | Added `employment` and `isApproximate` fields |
| `src/features/report-preview/components/pages/DemographicsPage.tsx` | Added static map image support |
| `env.example` | Added ESRI_API_KEY and GOOGLE_MAPS_API_KEY documentation |

---

## Migration Checklist

- [ ] Create ESRI Developer account (https://location.arcgis.com/sign-up/)
- [ ] Generate API key with geoenrichment scope
- [ ] Add ESRI_API_KEY to Vercel environment variables
- [x] Create `api/_lib/esri.ts` wrapper
- [x] Update `api/demographics/radius.ts` to use ESRI
- [x] Update frontend types for employment data
- [x] Create RadiusRingMap component
- [x] Create static map API for PDF
- [x] Create DemographicsPanel component
- [x] Update DemographicsPage for reports
- [ ] Add GOOGLE_MAPS_API_KEY to Vercel (if not already)
- [ ] Add VITE_GOOGLE_MAPS_API_KEY to Vercel
- [ ] Test with Billings, MT coordinates
- [ ] Verify fallback to Census works
- [ ] Monitor credit usage in ESRI dashboard

