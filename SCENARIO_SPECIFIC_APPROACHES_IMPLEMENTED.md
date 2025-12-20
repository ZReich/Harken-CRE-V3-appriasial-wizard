# Scenario-Specific Approaches Implementation - COMPLETE ✅

## Overview
Successfully redesigned the Template Builder to support **per-scenario approach selection** instead of global approaches. Each scenario now has its own set of available approaches, matching real-world appraisal practices where different scenarios require different valuation methods.

---

## What Was Changed

### 1. Removed Global Approaches Tab ✅

#### 1.1 Removed Approaches Tab Button
**File:** `prototypes/SuperAdmin/super-admin-template-builder.html` (Line 679)

**Removed:**
```html
<button class="prop-tab" onclick="switchTab('approaches')">Approaches</button>
```

**Result:** Now only 3 tabs remain:
- Settings
- Scenarios  
- Section

#### 1.2 Removed Approaches Tab Content
**File:** `prototypes/SuperAdmin/super-admin-template-builder.html` (Lines 784-833)

**Removed:** Entire `#approaches-tab` div with all approach checkboxes and weighting options

#### 1.3 Updated Left Panel Valuation Approaches Section
**File:** `prototypes/SuperAdmin/super-admin-template-builder.html` (Lines 299-309)

**Changed:**
- Added `id="valuation-approaches-section"` to parent div
- Changed `id="valuation-approaches-list"` to `id="all-scenarios-approaches-list"`
- Updated comment to reflect dynamic population based on scenarios

---

### 2. Added CSS for Scenario Groups ✅

**File:** `prototypes/SuperAdmin/super-admin-template-builder.html` (Lines 52-59)

**Added CSS:**
```css
/* Scenario approach groups */
.scenario-approaches-group { margin-bottom: 12px; }
.scenario-group-header { 
    font-size: 12px; 
    font-weight: 600; 
    color: #687F8B; 
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
    margin-bottom: 6px; 
    padding-left: 8px; 
    border-left: 2px solid #0da1c7; 
}

/* Scenario approach section in scenario cards */
.scenario-approaches-section { 
    margin-top: 12px; 
    padding: 12px; 
    background: #f9fafb; 
    border-radius: 6px; 
    border: 1px solid #e5e7eb; 
}
.approach-checkboxes { 
    display: flex; 
    flex-direction: column; 
    gap: 4px; 
}
.approach-checkbox { 
    width: 16px; 
    height: 16px; 
    cursor: pointer; 
    accent-color: #0da1c7; 
}
```

---

### 3. Updated Scenario Card Structure ✅

**File:** `prototypes/SuperAdmin/super-admin-template-builder.html` (Lines 1142-1229)

#### 3.1 Created Helper Functions

**`generateApproachCheckboxes(scenarioId, selectedApproaches = [])`** (Lines 1145-1173)
- Generates HTML for 7 approach checkboxes
- Pre-checks approaches based on `selectedApproaches` array
- Each checkbox has `data-scenario-id` and `data-approach-id` attributes

**Approaches included:**
1. Sales Comparison Approach
2. Income Approach
3. Cost Approach
4. Lease Approach
5. Direct Capitalization (Cap Rate)
6. Multi-Family Approach
7. Rent Roll Approach

**`attachApproachListeners(scenarioId)`** (Lines 1175-1184)
- Attaches change event listeners to all approach checkboxes for a scenario
- Calls `updateLeftPanelApproaches()` when any approach is toggled
- Console logs approach changes for debugging

#### 3.2 Updated `addScenarioRow()` Function

**Now accepts:** `function(defaultType = 'as_is', defaultApproaches = [])`

**New features:**
- Added `data-scenario-id` attribute to scenario row
- Embedded approach selection section in each scenario card
- Calls `updateLeftPanelApproaches()` after adding scenario
- Automatically attaches event listeners to approach checkboxes

**Visual structure:**
```
┌─────────────────────────────────────────┐
│ [1] [As-Is ▼]                   [Remove]│
│                                          │
│ Available Approaches for This Scenario  │
│ ☑ Sales Comparison Approach             │
│ ☐ Income Approach                       │
│ ☐ Cost Approach                         │
│ ☐ Lease Approach                        │
│ ☐ Direct Capitalization (Cap Rate)      │
│ ☐ Multi-Family Approach                 │
│ ☐ Rent Roll Approach                    │
└─────────────────────────────────────────┘
```

---

### 4. Created Dynamic Left Panel Update Function ✅

**File:** `prototypes/SuperAdmin/super-admin-template-builder.html` (Lines 1294-1387)

**`updateLeftPanelApproaches()`** - Core functionality:

#### For Single Scenario:
- Shows approaches as **flat list** (no grouping)
- Example:
```
☑ ▼ Valuation Approaches
    ☑ Sales Comparison Approach
    ☑ Income Approach
```

#### For Multiple Scenarios:
- Shows approaches **grouped by scenario**
- Example:
```
☑ ▼ Valuation Approaches
    AS-IS (CURRENT CONDITION)
    ☑ Sales Comparison Approach
    
    AS-COMPLETED (AFTER CONSTRUCTION)
    ☑ Sales Comparison Approach
    ☑ Cost Approach
    ☑ Income Approach
```

#### Logic:
1. Clears existing content
2. Checks scenario count
3. If 0 scenarios → Hides arrow, collapses list
4. If 1 scenario → Shows flat list
5. If 2+ scenarios → Shows grouped list
6. Makes arrow visible and expanded if any approaches exist

---

### 5. Updated Scenario Preset Function ✅

**File:** `prototypes/SuperAdmin/super-admin-template-builder.html` (Lines 1098-1131)

**`selectScenarioPreset(preset)`** - Now includes intelligent default approaches:

#### Dual Scenarios Preset:
```javascript
// As-Is: Sales Comparison only (existing condition)
window.addScenarioRow('as_is', ['sales_comparison']);

// As-Completed: Sales + Cost (new construction)
window.addScenarioRow('as_completed', ['sales_comparison', 'cost']);
```

#### Triple Scenarios Preset:
```javascript
// As-Is: Sales Comparison (existing condition)
window.addScenarioRow('as_is', ['sales_comparison']);

// As-Stabilized: Sales + Income (operating property)
window.addScenarioRow('as_stabilized', ['sales_comparison', 'income']);

// As-Completed: All three major approaches
window.addScenarioRow('as_completed', ['sales_comparison', 'income', 'cost']);
```

**Rationale:**
- **As-Is:** Typically uses Sales Comparison to value existing condition
- **As-Stabilized:** Adds Income Approach for operating/stabilized properties
- **As-Completed:** Uses all major approaches for completed development

---

### 6. Removed Old Approach Logic ✅

**File:** `prototypes/SuperAdmin/super-admin-template-builder.html`

#### Removed Functions (Lines 1294-1329):
- ❌ `setupApproachIndicators()` - No longer needed (no global approaches tab)
- ❌ `updateApproachIndicator()` - Replaced by `updateLeftPanelApproaches()`

#### Updated Initialization (Lines 1389-1397):
**Before:**
```javascript
function initializeTemplateBuilder() {
    updatePropertyCategory();
    setupApproachIndicators();  // ❌ Removed
    updateScenarioComparisonVisibility();
}
```

**After:**
```javascript
function initializeTemplateBuilder() {
    updatePropertyCategory();
    updateScenarioComparisonVisibility();
    updateLeftPanelApproaches();  // ✅ Added
}
```

---

## How It Works Now

### User Flow

#### Step 1: User Selects Scenario Preset
```
Settings Tab → Scenarios Tab → Click "Dual Scenarios"
```

**Result:**
- Creates 2 scenarios with pre-selected approaches
- Scenario 1 (As-Is) has Sales Comparison checked
- Scenario 2 (As-Completed) has Sales + Cost checked
- Left panel automatically shows grouped approaches

#### Step 2: User Customizes Approaches
```
Check/uncheck approaches within each scenario card
```

**Result:**
- Left panel updates immediately
- Grouping by scenario maintained
- Console logs changes for debugging

#### Step 3: User Adds Custom Scenario
```
Click "Add Scenario" → Select type → Check desired approaches
```

**Result:**
- New scenario added to list
- Approaches appear in left panel under new scenario group
- Arrow remains expanded

---

## Visual Examples

### Single Scenario (Flat List)

**Scenarios Tab:**
```
┌─────────────────────────────────────────┐
│ [1] [As-Is ▼]                   [Remove]│
│                                          │
│ Available Approaches for This Scenario  │
│ ☑ Sales Comparison Approach             │
│ ☑ Income Approach                       │
│ ☐ Cost Approach                         │
└─────────────────────────────────────────┘
```

**Left Panel:**
```
☑ ▼ Valuation Approaches
    ☑ Sales Comparison Approach
    ☑ Income Approach
```

---

### Multiple Scenarios (Grouped List)

**Scenarios Tab:**
```
┌─────────────────────────────────────────┐
│ [1] [As-Is ▼]                   [Remove]│
│ ☑ Sales Comparison Approach             │
│ ☐ Income Approach                       │
│ ☐ Cost Approach                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [2] [As-Completed ▼]            [Remove]│
│ ☑ Sales Comparison Approach             │
│ ☑ Income Approach                       │
│ ☑ Cost Approach                         │
└─────────────────────────────────────────┘
```

**Left Panel:**
```
☑ ▼ Valuation Approaches
    AS-IS (CURRENT CONDITION)
    ☑ Sales Comparison Approach
    
    AS-COMPLETED (AFTER CONSTRUCTION)
    ☑ Sales Comparison Approach
    ☑ Income Approach
    ☑ Cost Approach
```

---

## Database Integration

### Data Structure

When template is saved, each scenario includes its approaches:

```javascript
scenarios: [
    {
        scenario_type: "as_is",
        custom_name: null,
        display_order: 1,
        default_approaches: ["sales_comparison"],  // ✅ JSON array
        require_completion_date: 0,
        require_hypothetical_statement: 0
    },
    {
        scenario_type: "as_completed",
        custom_name: null,
        display_order: 2,
        default_approaches: ["sales_comparison", "cost"],  // ✅ JSON array
        require_completion_date: 1,
        require_hypothetical_statement: 0
    }
]
```

### Database Schema Match ✅

The `template_scenarios` table already supports this:
```typescript
default_approaches: {
    type: dataTypes.JSON,  // Array of approach strings
    allowNull: true,
}
```

**No backend changes required!** The UI now matches the existing database schema.

---

## Benefits Delivered

### ✅ 1. Matches Real-World Practice
Different scenarios genuinely need different approaches:
- **Vacant Land (As-Is)**: Sales Comparison only
- **Under Construction (As-Completed)**: Sales + Cost
- **Operating Property (As-Stabilized)**: Sales + Income

### ✅ 2. Matches Database Schema
Uses existing `default_approaches` JSON field - no migration needed

### ✅ 3. Better UX
- Approaches configured where they're used (with scenarios)
- No confusion about global vs per-scenario settings
- Visual grouping shows which approaches apply to which scenario

### ✅ 4. More Flexible
Each scenario is fully independent - different approaches for different conditions

### ✅ 5. Clearer Logic
One scenario card = one complete configuration (type + approaches)

### ✅ 6. Intelligent Defaults
Preset scenarios come with sensible default approaches based on scenario type

---

## Testing Checklist

### ✅ Single Scenario Test
- [x] Create template (default single scenario)
- [x] Add scenario via "Custom" preset
- [x] Check "Sales Comparison" and "Income" approaches
- [x] Left panel shows flat list: Sales Comparison, Income
- [x] Arrow is visible and expanded

### ✅ Dual Scenarios Test
- [x] Select "Dual Scenarios" preset
- [x] Scenario 1 (As-Is) has Sales Comparison pre-checked
- [x] Scenario 2 (As-Completed) has Sales + Cost pre-checked
- [x] Left panel shows grouped list with scenario headers
- [x] Arrow is visible and expanded

### ✅ Triple Scenarios Test
- [x] Select "Triple Scenarios" preset
- [x] Scenario 1 (As-Is) has Sales Comparison
- [x] Scenario 2 (As-Stabilized) has Sales + Income
- [x] Scenario 3 (As-Completed) has Sales + Income + Cost
- [x] Left panel shows all 3 groups

### ✅ Approach Toggling Test
- [x] Check Income on Scenario 2 → Appears in left panel under Scenario 2
- [x] Uncheck Cost on Scenario 2 → Disappears from left panel
- [x] Uncheck all approaches on Scenario 1 → Scenario 1 group disappears
- [x] Check an approach again → Scenario 1 group reappears

### ✅ Arrow Behavior Test
- [x] Arrow hidden when no scenarios exist
- [x] Arrow visible when approaches exist
- [x] Click arrow → Collapses list
- [x] Click arrow again → Expands list

### ✅ Console Logging Test
- [x] Check approach → Console shows: "Approach toggled: sales_comparison for scenario: 1 Checked: true"
- [x] Uncheck approach → Console shows: "Approach toggled: sales_comparison for scenario: 1 Checked: false"

---

## Files Modified

**1. `prototypes/SuperAdmin/super-admin-template-builder.html`**

**Summary of changes:**
- Line 679: Removed Approaches tab button
- Lines 784-833: Removed Approaches tab content
- Lines 52-59: Added CSS for scenario groups and approach sections
- Lines 299-309: Updated left panel Valuation Approaches section
- Lines 1145-1173: Added `generateApproachCheckboxes()` function
- Lines 1175-1184: Added `attachApproachListeners()` function
- Lines 1186-1229: Updated `addScenarioRow()` with approach support
- Lines 1294-1387: Created `updateLeftPanelApproaches()` function
- Lines 1098-1131: Updated `selectScenarioPreset()` with default approaches
- Removed: `setupApproachIndicators()` and `updateApproachIndicator()`
- Lines 1389-1397: Updated `initializeTemplateBuilder()`

**Total lines modified:** ~200 lines

---

## Migration Notes

### For Existing Templates
If any templates were created with the old global approach system:
1. **Option A:** Write migration script to move global approaches to first scenario's `default_approaches`
2. **Option B:** Mark old templates as requiring re-configuration
3. **Option C:** Default behavior: Show all approaches as available if `default_approaches` is null

### Backward Compatibility
The database schema already supported per-scenario approaches, so this is actually **forward-compatible** - making the UI match what the database was designed for.

---

## Next Steps (Optional Enhancements)

### Phase 2 Features
1. **Drag-and-drop scenario reordering** - Reorder scenarios in the list
2. **Copy scenario** - Duplicate a scenario with all its approaches
3. **Approach templates** - Save common approach combinations as presets
4. **Conditional approaches** - Show/hide approaches based on property type
5. **Approach validation** - Warn if no approaches selected for a scenario

### React Conversion
When converting to React:
1. `generateApproachCheckboxes()` → React component
2. `attachApproachListeners()` → `onChange` props
3. `updateLeftPanelApproaches()` → `useEffect` hook
4. `scenarioCounter` → `useState`
5. Scenario data → Redux or Context API

---

## Conclusion

The Template Builder now supports **per-scenario approach selection**, matching:
- ✅ Real-world appraisal practices
- ✅ Existing database schema (`default_approaches` JSON field)
- ✅ User expectations (approaches configured with scenarios)

**Result:** A more intuitive, flexible, and accurate template builder that correctly represents how different scenarios require different valuation methods.

---

**Implementation Date:** January 29, 2025  
**Status:** ✅ **COMPLETE & TESTED**  
**Zero Linting Errors:** ✅  
**Database Compatible:** ✅ (uses existing schema)  
**Backward Compatible:** ✅ (can add migration if needed)  
**Production Ready:** Prototype phase complete













