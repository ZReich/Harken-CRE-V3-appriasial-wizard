# Types Directory Structure

This directory contains all TypeScript type definitions for the Appraisal Wizard.

## Main Files

| File | Purpose |
|------|---------|
| `index.ts` | All main types, re-exports from features |
| `api.ts` | API response types (if present) |

## Quick Navigation for `index.ts`

The main types file is organized into clearly marked sections. Search for `// ===` to jump between sections:

### Core Sections (by line number prefix)

| Section | Types | Description |
|---------|-------|-------------|
| **Income Approach** | `LineItem`, `IncomeData`, `FinancialSummary` | Re-exported from features |
| **Wizard State** | `AppraisalScenario`, `HeightZone` | Core wizard configuration |
| **Component Details** | `ComponentCondition`, `ComponentDetail`, `PhotoData` | Building component tracking |
| **Exterior/Interior** | `ExteriorFeatures`, `InteriorFeatures`, `MechanicalSystems` | Property physical features |
| **Improvements** | `ImprovementArea`, `ImprovementBuilding`, `ImprovementsInventory` | Building inventory |
| **Site Improvements** | `SiteImprovement`, `SiteImprovementsInventory` | M&S Section 66 |
| **Cost Segregation** | `CostSegComponent`, `CostSegAnalysis`, `CostSegState` | IRS cost seg analysis |
| **Documents** | `ExtractedField`, `UploadedDocument`, `ExtractedFieldSource` | Document extraction |
| **Field Suggestions** | `FieldSuggestion`, `FieldSuggestionSource` | AI field suggestions |
| **Owners** | `Owner` | Property ownership |
| **Reconciliation** | `ReconciliationData`, `ScenarioReconciliation` | Value reconciliation |
| **Progress** | `PageTabState`, `ScenarioCompletionState`, `CelebrationState` | Progress tracking |
| **Analysis** | `ApproachConclusion`, `AnalysisConclusions`, `CostApproachOverrides` | Analysis conclusions |
| **Subject Data** | `SubjectAddress`, `SubjectData`, `BuildingPermit` | Subject property |
| **External Data** | `CadastralData`, `DemographicsData`, `EconomicIndicators` | Third-party data |
| **SWOT** | `SWOTItem`, `SWOTCategory`, `RiskRatingData` | SWOT and risk |
| **Sales/Land** | `SalesCompProperty`, `LandSaleComp`, `SalesComparisonData` | Valuation approaches |
| **HBU/Market** | `HBUAnalysis`, `MarketAnalysisData` | Highest & best use |
| **Photo** | `StagingPhoto`, `PhotoClassificationSuggestion` | Photo management |
| **WizardState** | `WizardState`, `WizardAction` | Central state shape |
| **Validation** | `ValidationIssue`, `ValidationResult` | Form validation |
| **Marshall & Swift** | `ConstructionClass` | Cost approach data |
| **Report** | `ReportPhoto`, `ReportSection`, `PageLayout` | Report configuration |
| **Editor** | `EditorMode`, `SelectedElement`, `EditorHistory` | Editor state |

## Usage

```typescript
// Import specific types
import type { SubjectData, WizardState, SalesCompProperty } from '../types';

// Or import everything (less common)
import * as Types from '../types';
```

## Adding New Types

1. Find the appropriate section by searching for `// ===`
2. Add your type with JSDoc documentation
3. Export it in the section

Example:
```typescript
/**
 * My new type for feature X.
 * Used in: ComponentY, ComponentZ
 */
export interface MyNewType {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
}
```

## Type Dependencies

```
WizardState
├── AppraisalScenario
├── SubjectData
│   └── SubjectAddress
├── ImprovementsInventory
│   ├── ImprovementBuilding
│   └── ImprovementArea
├── StagingPhoto
├── CelebrationState
├── PageTabState
└── ... (40+ more)
```
