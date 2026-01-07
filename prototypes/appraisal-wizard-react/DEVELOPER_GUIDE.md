# Harken Appraisal Wizard - Developer Guide

Welcome to the Harken Appraisal Wizard codebase. This guide will help you understand the architecture, navigate the code, and contribute effectively.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Large Files by Design](#large-files-by-design)
4. [Theming & Colors](#theming--colors)
5. [Key Patterns](#key-patterns)
6. [Testing](#testing)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### The Wizard Flow

The application guides appraisers through a 6-phase workflow:

```
┌─────────────┐    ┌─────────────────┐    ┌─────────┐
│  Template   │ -> │ Document Intake │ -> │  Setup  │
│  Selection  │    │  (OCR Upload)   │    │ (Config)│
└─────────────┘    └─────────────────┘    └─────────┘
                                               │
                                               v
┌─────────────┐    ┌─────────────────┐    ┌─────────┐
│   Review    │ <- │    Analysis     │ <- │ Subject │
│  (Report)   │    │  (Approaches)   │    │  Data   │
└─────────────┘    └─────────────────┘    └─────────┘
```

### Directory Structure

```
src/
├── components/          # 74 reusable UI components
│   ├── ImprovementsInventory.tsx    # Building inventory (extracted)
│   ├── SiteImprovementsInventory.tsx
│   ├── WizardLayout.tsx             # Main layout wrapper
│   └── ... (70+ more)
│
├── context/             # Global state management
│   ├── WizardContext.tsx            # Main context provider (~900 lines)
│   ├── WizardContext.test.tsx       # Context tests
│   └── reducers/                    # Modular reducer slices
│       ├── index.ts                 # Combined reducer export
│       ├── initialState.ts          # Default state shape
│       ├── coreSlice.ts             # Template, property, owners
│       ├── scenarioSlice.ts         # Appraisal scenarios
│       ├── documentSlice.ts         # Document extraction
│       ├── photoSlice.ts            # Photos management
│       ├── mapSlice.ts              # Map data
│       ├── suggestionSlice.ts       # AI field suggestions
│       ├── progressSlice.ts         # Progress tracking
│       └── analysisSlice.ts         # Analysis data
│
├── features/            # Feature-based modules
│   ├── sales-comparison/            # Sales comp grid + adjustments
│   ├── income-approach/             # NOI, cap rates, DCF
│   ├── cost-approach/               # Marshall & Swift integration
│   ├── cost-segregation/            # IRS cost seg analysis
│   ├── multi-family/                # Multi-family specific
│   ├── land-valuation/              # Land sales grid
│   ├── market-analysis/             # Market data
│   ├── report-preview/              # PDF preview components
│   └── review/                      # Report editor (WYSIWYG)
│
├── hooks/               # 13 custom hooks
│   ├── useThemeColors.ts            # Theme-aware color access
│   ├── useCompletion.ts             # Section completion tracking
│   ├── useCelebration.ts            # Completion celebrations
│   └── useSmartContinue.ts          # Smart navigation
│
├── pages/               # Page-level orchestrators
│   ├── TemplatePage.tsx             # Phase 1: Template selection
│   ├── DocumentIntakePage.tsx       # Phase 2: Document upload
│   ├── SetupPage.tsx                # Phase 3: Property setup
│   ├── SubjectDataPage.tsx          # Phase 4: Data entry
│   ├── AnalysisPage.tsx             # Phase 5: Valuation approaches
│   └── ReviewPage.tsx               # Phase 6: Report generation
│
├── services/            # 22 API services
│   ├── aiService.ts                 # OpenAI integration
│   ├── demographicsService.ts       # ESRI GeoEnrichment
│   ├── femaFloodService.ts          # Flood zone lookup
│   └── ... (19 more)
│
├── constants/           # Static configuration
│   ├── colors.ts                    # TypeScript color constants
│   ├── marshallSwift.ts             # Cost approach data
│   └── completionSchema.ts          # Progress tracking schema
│
└── types/               # TypeScript definitions
    ├── index.ts                     # Main types (~2,300 lines)
    └── api.ts                       # API response types
```

---

## State Management

### WizardContext

All wizard state is managed through `WizardContext`. The reducer has been modularized into domain-specific slices:

```typescript
// Access state and dispatch
const { state, dispatch } = useWizard();

// Or use convenience helpers
const { 
  setSubjectData, 
  setPropertyType, 
  addUploadedDocument,
  // ... 50+ helpers
} = useWizard();
```

### Reducer Slices

| Slice | Actions | Purpose |
|-------|---------|---------|
| `coreSlice` | SET_TEMPLATE, SET_PROPERTY_TYPE, SET_SUBJECT_DATA | Core wizard data |
| `scenarioSlice` | ADD_SCENARIO, UPDATE_SCENARIO, SET_SCENARIOS | Multi-scenario support |
| `documentSlice` | ADD_UPLOADED_DOCUMENT, APPLY_DOCUMENT_EXTRACTED_DATA | OCR and extraction |
| `photoSlice` | ADD_STAGING_PHOTOS, ASSIGN_STAGING_PHOTO | Photo management |
| `progressSlice` | MARK_SECTION_COMPLETE, SHOW_CELEBRATION | Progress tracking |
| `analysisSlice` | SET_SALES_COMPARISON_DATA, SET_INCOME_APPROACH_DATA | Valuation data |

### Adding a New Action

1. Add the action type to `types/index.ts`:
```typescript
export type WizardAction =
  | { type: 'MY_NEW_ACTION'; payload: MyPayloadType }
  // ... existing actions
```

2. Handle it in the appropriate slice:
```typescript
// In reducers/mySlice.ts
case 'MY_NEW_ACTION':
  return { ...state, myField: action.payload };
```

3. Add a convenience helper in `WizardContext.tsx`:
```typescript
const myAction = useCallback((data: MyPayloadType) => {
  dispatch({ type: 'MY_NEW_ACTION', payload: data });
}, []);
```

---

## Large Files by Design

Three files are intentionally large as they're **page-level orchestrators**:

| File | Lines | Why It's Large |
|------|-------|----------------|
| `ReportEditor.tsx` | 3,500 | WYSIWYG editor with drag-drop, inline editing, PDF preview |
| `SubjectDataPage.tsx` | 3,100 | 7-tab data entry wizard coordinating 30+ components |
| `SetupPage.tsx` | 2,200 | Property configuration with scenario/approach logic |

### How to Navigate Large Files

1. **Use section markers** - Search for `// ===` to find sections
2. **Search by component name** - Each section is labeled
3. **Use IDE outline** - VS Code's Outline panel shows all functions

Example section markers in ReportEditor.tsx:
```typescript
// =================================================================
// TYPES
// =================================================================

// =================================================================
// SECTION TREE COMPONENT WITH DRAG-DROP REORDERING
// =================================================================

// =================================================================
// COVER PAGE SECTION RENDERER
// =================================================================
```

### Why Not Split Further?

These files coordinate many smaller components that are already extracted:

- SubjectDataPage imports 30+ extracted components
- ReportEditor imports 15+ page renderers
- The remaining code is orchestration logic that benefits from co-location

---

## Theming & Colors

### Color System

Colors are centralized using CSS variables with Tailwind integration:

```css
/* src/index.css */
:root {
  --accent-cyan: #0da1c7;
  --accent-cyan-hover: #0b8fb0;
  --harken-dark: #1c3643;
  /* ... semantic tokens */
}

html.dark {
  --accent-cyan: #00d4ff;
  /* ... dark mode overrides */
}
```

### Using Colors in Components

**In Tailwind classes:**
```tsx
<button className="bg-accent-cyan hover:bg-accent-cyan-hover text-white">
  Click me
</button>
```

**In JavaScript (for charts):**
```tsx
import { useThemeColors } from '../hooks/useThemeColors';

function MyChart() {
  const { chartColors } = useThemeColors();
  return <Line stroke={chartColors.primary} />;
}
```

### Color Constants Location

- CSS Variables: `src/index.css`
- TypeScript Constants: `src/constants/colors.ts`
- Theme Hook: `src/hooks/useThemeColors.ts`

---

## Key Patterns

### 1. Component Extraction

When a piece of UI is reused OR exceeds ~300 lines, extract it:

```typescript
// Good: Extracted to components/MyComponent.tsx
import MyComponent from '../components/MyComponent';

// Bad: 500-line inline JSX
```

### 2. Custom Hooks for Logic

Business logic goes in hooks:

```typescript
// hooks/usePropertyCalculations.ts
export function usePropertyCalculations(propertyData: PropertyData) {
  const totalSF = useMemo(() => 
    propertyData.buildings.reduce((sum, b) => sum + b.squareFeet, 0),
    [propertyData.buildings]
  );
  return { totalSF };
}
```

### 3. Services for API Calls

All external API calls go through services:

```typescript
// services/demographicsService.ts
export async function fetchDemographics(coords: Coordinates) {
  const response = await fetch(`/api/demographics?lat=${coords.lat}&lng=${coords.lng}`);
  return response.json();
}
```

### 4. Constants for Static Data

Configuration and static data goes in constants:

```typescript
// constants/marshallSwift.ts
export const CONSTRUCTION_TYPES = [
  { id: 'A', label: 'Class A - Fireproof' },
  { id: 'B', label: 'Class B - Reinforced Concrete' },
  // ...
];
```

---

## Testing

### Test Setup

Tests use Vitest + React Testing Library:

```bash
# Run tests in watch mode
npm run test

# Run once
npm run test:run

# With coverage
npm run test:coverage
```

### Test Files Location

```
src/
├── context/
│   └── WizardContext.test.tsx    # Context reducer tests
├── features/
│   └── sales-comparison/
│       └── utils/
│           └── adjustmentCalculator.test.ts
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WizardProvider, useWizard } from './WizardContext';

describe('WizardContext', () => {
  it('should update property type', () => {
    const wrapper = ({ children }) => <WizardProvider>{children}</WizardProvider>;
    const { result } = renderHook(() => useWizard(), { wrapper });
    
    act(() => {
      result.current.setPropertyType('industrial', 'warehouse');
    });
    
    expect(result.current.state.propertyType).toBe('industrial');
  });
});
```

---

## Common Tasks

### Adding a New Wizard Page

1. Create the page in `src/pages/MyNewPage.tsx`
2. Add route in `src/main.tsx`
3. Add navigation in `WizardLayout.tsx`
4. Add completion schema in `constants/completionSchema.ts`

### Adding a New Valuation Approach

1. Create feature folder: `src/features/my-approach/`
2. Add components, types, and utils
3. Register in `AnalysisPage.tsx`
4. Add to approach selector in `SetupPage.tsx`

### Adding a New Field to Subject Data

1. Add to `SubjectData` interface in `types/index.ts`
2. Add default value in `context/reducers/initialState.ts`
3. Add UI in `SubjectDataPage.tsx` (appropriate tab)
4. Add to completion schema if required

---

## Troubleshooting

### "Cannot find module" Errors

Check that imports use the correct path alias:
```typescript
// Use relative imports from src/
import { useWizard } from '../context/WizardContext';
```

### State Not Persisting

State is persisted to localStorage. Clear with:
```
?reset=1  // Add to URL to clear state
```

### TypeScript Errors in Tests

Ensure test setup is correct:
```typescript
// src/test/setup.ts should mock browser APIs
import '@testing-library/jest-dom/vitest';
```

### Large Bundle Size Warning

The build will warn about chunk sizes. This is expected for a feature-rich app. Code splitting is already configured in `vite.config.ts`.

---

## Questions?

- Check [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) for architectural decisions
- Review existing code for patterns before implementing new features
- The codebase follows "Intentional Minimalism" - don't add features without clear purpose

---

*Last updated: January 2026*
