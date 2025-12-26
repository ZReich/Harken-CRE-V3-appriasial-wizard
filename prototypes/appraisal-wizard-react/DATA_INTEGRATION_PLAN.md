# Data Integration Fix Plan

## Executive Summary

This document outlines the plan to fix data collection issues in the Appraisal Wizard v3 React prototype. The issues identified are:

1. **Demographics data not loading** - Coordinates not being passed correctly
2. **Tax & Ownership data not populating** - Cadastral tax data not flowing to Tax tab
3. **Multi-parcel support missing** - Only single parcel lookups supported
4. **AI drafts not working** - Was using simulated data instead of OpenAI API (FIXED)

---

## Issue 1: Demographics Data Not Loading

### Root Cause Analysis

The `DemographicsPanel` component requires `latitude` and `longitude` coordinates to fetch Census data. These coordinates come from:

1. **Google Places Autocomplete** - When user selects an address from suggestions
2. **Cadastral Lookup** - When property is looked up in Montana GIS

**The Problem:** While coordinates ARE being saved to `wizardState.subjectData.coordinates` in some flows, the initial state doesn't include `coordinates` in its defaults, and the data may not be persisting correctly.

### Files Involved

- `src/pages/SetupPage.tsx` - Address entry and property lookup
- `src/pages/SubjectDataPage.tsx` - Demographics tab uses coordinates
- `src/components/DemographicsPanel.tsx` - Displays demographic data
- `src/context/WizardContext.tsx` - State management
- `src/services/demographicsService.ts` - API calls to Census
- `api/demographics/radius.ts` - Vercel function for Census data

### Fix Steps

1. **Verify coordinates are saved from Google Places** (line ~536-556 in SetupPage.tsx)
   - Already calls `setSubjectData({ coordinates: { latitude, longitude } })`
   - ✅ This looks correct

2. **Verify coordinates are saved from Cadastral lookup** (line ~389-426 in SetupPage.tsx)
   - The `handlePropertyImport` function does include coordinates
   - ✅ This looks correct

3. **Check WizardContext initial state** - Add `coordinates` to default subjectData
   - Currently NOT in default state
   - ⚠️ NEEDS FIX - Add to initial state

4. **Check WizardContext SET_SUBJECT_DATA reducer** 
   - The coordinates property should persist through state updates
   - ⚠️ NEEDS FIX - Ensure coordinates aren't being overwritten

### Action Items

- [ ] Add `coordinates: undefined` to `getInitialState()` in WizardContext.tsx
- [ ] Ensure coordinates persist in SET_SUBJECT_DATA reducer
- [ ] Add debug logging to track coordinate flow

---

## Issue 2: Tax & Ownership Data Not Populating

### Root Cause Analysis

The Cadastral API returns tax assessment data:
- `assessedLandValue`
- `assessedImprovementValue`
- `totalAssessedValue`
- `taxYear`
- `ownerName`

This data is stored in `wizardState.subjectData.cadastralData` but NOT automatically populated to the Tax & Ownership tab fields.

### Files Involved

- `src/pages/SetupPage.tsx` - Stores cadastral data (line 412-426)
- `src/pages/SubjectDataPage.tsx` - Tax tab needs to read/display this data
- `src/context/WizardContext.tsx` - State structure

### Current Flow

```
Cadastral API → handlePropertyImport() → setSubjectData({ cadastralData: {...} })
                                            ↓
                          SubjectDataPage Tax Tab (NOT reading cadastralData!)
```

### Fix Steps

1. **Populate Tax tab fields from cadastralData**
   - In `SubjectDataPage.tsx`, read `wizardState.subjectData.cadastralData`
   - Auto-fill: `assessedLand`, `assessedImprovements`, `totalAssessed`, `taxYear`

2. **Add cadastralData to SubjectData type**
   - Already in types/index.ts ✅

3. **Display owner info from cadastral**
   - Owner name is already being updated in SetupPage (line 384-386)
   - May need to ensure it persists

### Action Items

- [ ] Update TaxContent component to auto-populate from cadastralData
- [ ] Add "Auto-filled from Cadastral" indicator badges
- [ ] Ensure owner data flows correctly

---

## Issue 3: Multi-Parcel Support

### Root Cause Analysis

Current implementation only supports single-parcel lookups. Multi-parcel properties need:
- Multiple parcel IDs
- Multiple legal descriptions
- Combined acreage
- Multiple owner records (potentially)

### Current Limitation

The Montana Cadastral API can return multiple parcels for a single address, but we only process `features[0]`.

### Fix Steps

1. **Modify cadastral API to return array of parcels**
2. **Add UI for managing multiple parcels in Improvements tab**
3. **Aggregate acreage and values across parcels**

### Action Items (Future Enhancement)

- [ ] Update `api/_lib/cadastral.ts` to return all matching parcels
- [ ] Add multi-parcel UI in ImprovementsInventory component
- [ ] Add parcel aggregation logic

---

## Issue 4: AI Drafts Not Working (FIXED)

### What Was Wrong

The `handleDraftAllLocation` function in `SubjectDataPage.tsx` was using **hardcoded simulated text** instead of calling the OpenAI API.

### What Was Fixed

1. Imported `generateDraft` from `aiService.ts`
2. Replaced hardcoded drafts with real API calls
3. Added `contextData` prop to `EnhancedTextArea` components
4. Updated `LocationContent` component to pass AI context

### Remaining Verification

- [ ] Verify `.env.local` has `OPENAI_API_KEY` for local development
- [ ] Verify Vercel has `OPENAI_API_KEY` environment variable
- [ ] Test on Vercel production

---

## Implementation Priority

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | AI Drafts | Done | High |
| 2 | Demographics | Medium | High |
| 3 | Tax & Ownership | Low | Medium |
| 4 | Multi-Parcel | High | Low |

---

## Testing Checklist

### After Implementation

1. **Setup Page → Enter Montana Address**
   - [ ] Google Places autocomplete works
   - [ ] Coordinates are captured
   - [ ] Auto-lookup triggers and completes
   - [ ] Tax ID, Legal Description populated

2. **Subject Data → Demographics Tab**
   - [ ] Data loads automatically
   - [ ] 1, 3, 5 mile radius data displays
   - [ ] No "Location coordinates required" error

3. **Subject Data → Tax & Ownership Tab**
   - [ ] Assessed values pre-populated
   - [ ] Tax year shown
   - [ ] Owner name displayed

4. **Subject Data → Location & Area Tab**
   - [ ] "AI Draft All" button generates live content
   - [ ] Individual AI buttons generate live content
   - [ ] Content is contextual to property

5. **Vercel Production**
   - [ ] All APIs respond correctly
   - [ ] Environment variables are accessible
   - [ ] No CORS errors

---

## Environment Variables Required (Vercel)

```
OPENAI_API_KEY=sk-...          # For AI drafts
FRED_API_KEY=...               # For economic indicators
VITE_GOOGLE_MAPS_API_KEY=...   # For address autocomplete
```

---

## API Endpoints Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/ai/draft` | ✅ Active | Requires OPENAI_API_KEY |
| `/api/cadastral/query` | ✅ Active | Montana free, others mock |
| `/api/demographics/radius` | ✅ Active | Uses Census API (no key) |
| `/api/economic/indicators` | ✅ Active | Requires FRED_API_KEY |
| `/api/risk-rating/calculate` | ✅ Active | No API key needed |

---

## Next Steps

1. Implement fixes for Issues 1-3
2. Test locally with `.env.local`
3. Deploy to Vercel
4. Verify all data flows on production

