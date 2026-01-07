# Harken Brand Color Migration Status

## Phases 1-4: COMPLETE ✅

### Phase 1: CSS Variables (COMPLETE)
- ✅ Added official Harken primary colors
- ✅ Added official secondary grays
- ✅ Added Accent Set 1: Quality (Teal Mint, Soft Indigo)
- ✅ Added Accent Set 2: Attention (Amber Gold, Warm Slate)
- ✅ Added Accent Set 3: Gamified (Electric Violet)
- ✅ Extended Tailwind `@theme` with all new utilities

### Phase 2: TypeScript Constants (COMPLETE)
- ✅ Created `harkenBrand` export with official structure
- ✅ Updated `lightColors` with grays property
- ✅ Updated `darkColors` with luminous variants
- ✅ Updated chart/status colors to use official palette

### Phase 3: Semantic Token Mapping (COMPLETE)
- ✅ Created `brandTokens.ts` with UI/feature/status/chart tokens
- ✅ Added convenience functions for token access

### Phase 4: Dark Mode Variants (COMPLETE)
- ✅ Added luminous variants for all accent colors
- ✅ Updated chart colors for dark mode visibility

### Testing Infrastructure (COMPLETE)
- ✅ Created `colors.test.ts` (23 tests - all passing)
- ✅ Created `useThemeColors.test.tsx` (14 tests - all passing)
- ✅ Total: 89/89 tests passing

---

## Phases 5-6: IN PROGRESS 🔄

### Migration Strategy

**Common Patterns to Replace:**

| Old (Hardcoded) | New (CSS Variable) |
|-----------------|-------------------|
| `text-[#1c3643]` | `text-harken-dark` |
| `text-[#0da1c7]` | `text-harken-blue` |
| `bg-[#0da1c7]` | `bg-harken-blue` |
| `hover:bg-[#0b8fb0]` | `hover:bg-harken-blue/90` |
| `focus:ring-[#0da1c7]` | `focus:ring-harken-blue` |
| `border-[#0da1c7]` | `border-harken-blue` |
| `from-[#4db8d1]` | `from-harken-accent` |
| `to-[#7fcce0]` | `to-harken-accent-light` |

### Tier 1 Files (High Impact)

| File | Original Count | Remaining | Status |
|------|----------------|-----------|--------|
| `SetupPage.tsx` | 84 | 58 | 🔄 In Progress |
| `SubjectDataPage.tsx` | 78 | 78 | ⏳ Pending |
| `ImprovementValuation.tsx` | 41 | 41 | ⏳ Pending |
| `SiteImprovementsInventory.tsx` | 31 | 31 | ⏳ Pending |
| `IncomeApproachGrid.tsx` | 24 | 24 | ⏳ Pending |
| `SalesGrid.tsx` | 25 | 25 | ⏳ Pending |

**Tier 1 Total:** ~280 instances across 6 files

### Tier 2 Files (Medium Impact)

100+ additional component files with ~800 hex color instances

---

## Quick Migration Commands

### Find all hex colors in a file:
```bash
grep -n "#[0-9a-fA-F]\{6\}" src/pages/SetupPage.tsx
```

### Count remaining hex colors:
```bash
grep -c "#[0-9a-fA-F]\{6\}" src/pages/*.tsx
```

### Batch replace (example):
```bash
# Replace text-[#1c3643] with text-harken-dark
sed -i 's/text-\[#1c3643\]/text-harken-dark/g' src/pages/*.tsx
```

---

## Verification Checklist

- [x] Build passes
- [x] All tests pass (89/89)
- [ ] Tier 1 files migrated
- [ ] Tier 2 files migrated
- [ ] Visual regression testing
- [ ] Dark mode verification
- [ ] Chart color verification

---

## Next Steps

1. **Complete SetupPage.tsx** (58 instances remaining)
2. **Migrate SubjectDataPage.tsx** (78 instances)
3. **Migrate remaining Tier 1 files** (4 files)
4. **Batch migrate Tier 2 files** (100+ files)
5. **Visual verification** on Vercel deployment

---

## Notes

- The color system infrastructure is complete and tested
- Migration is mechanical find-replace work
- Recommend using Sonnet 4.5 (non-thinking) or GPT-4o-mini for bulk migration
- Each file should be verified with `npm run build` after migration
