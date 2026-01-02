# AI Draft Quick Reference Card

## 🎯 For Developers

### Adding AI Draft to a New Section

```tsx
// 1. Add to component
<EnhancedTextArea
  label="Section Name"
  value={text}
  onChange={setText}
  sectionContext="my_new_section"  // ← Triggers AI
  helperText="AI can draft this section."
/>

// 2. Add prompt to api/_lib/openai.ts
my_new_section: (ctx) => `Write as 30-year MAI appraiser.

PROPERTY DATA:
- Type: ${ctx.propertyType}
- Location: ${ctx.siteData?.city}

Write professional narrative:
1. Instruction 1
2. Instruction 2

Use professional terminology. Write X paragraphs, Y words.`

// 3. Mirror to packages/backend/.../appraisal-ai.service.ts
// (Copy same prompt to SECTION_PROMPTS)

// 4. If new data needed, extend AIGenerationContext in types/api.ts
// and buildEnhancedContextForAI() in hbuContextBuilder.ts
```

---

## 📋 All 48 Section Contexts

### Setup & Subject Data
```
legal_description
construction_description
site_notes
zoning_description
transaction_history
```

### Location & Area
```
area_description
neighborhood_description
neighborhood_boundaries
neighborhood_characteristics
specific_location
```

### Site Details
```
site_description
site_notes
site_description_full
site_improvements
easements
property_boundaries
water_source
sewer_type
electric
natural_gas
telecom
flood_zone
```

### HBU Analysis
```
hbu_legally_permissible
hbu_physically_possible
hbu_financially_feasible
hbu_maximally_productive
hbu_as_improved
hbu_analysis
```

### Valuation Approaches
```
sales_comparison
land_valuation
rent_comparable
expense_comparable
multi_family
market_analysis
cost_approach
cost_reconciliation
```

### Building Components
```
exterior_component
exterior_description
interior_component
interior_description
mechanical_component
mechanical_description
depreciation_override
improvement_description
```

### Review & Reconciliation
```
reconciliation
exposure
swot_summary_analysis
```

### Supplemental
```
permit_analysis
traffic_analysis
property_boundaries
```

---

## 🔧 Context Data Available

```typescript
ctx.propertyType          // "Industrial", "Office", etc.
ctx.propertySubtype       // "Warehouse", "Flex", etc.

// Site Data (22 fields)
ctx.siteData.city
ctx.siteData.state
ctx.siteData.county
ctx.siteData.zoning
ctx.siteData.siteSize
ctx.siteData.shape
ctx.siteData.topography
ctx.siteData.frontage
ctx.siteData.waterSource
ctx.siteData.sewerType
ctx.siteData.electricProvider
ctx.siteData.naturalGas
ctx.siteData.telecom
ctx.siteData.femaZone
ctx.siteData.easements
ctx.siteData.environmental
ctx.siteData.accessQuality
ctx.siteData.visibility
ctx.siteData.pavingType
ctx.siteData.fencingType
ctx.siteData.approachType
ctx.siteData.utilities

// Improvement Data
ctx.improvementData.buildingSize
ctx.improvementData.yearBuilt
ctx.improvementData.condition
ctx.improvementData.constructionType
ctx.improvementData.quality
ctx.improvementData.exteriorFeatures
ctx.improvementData.interiorFeatures
ctx.improvementData.mechanicalSystems

// Market Data
ctx.marketData.vacancyRate
ctx.marketData.marketTrend
ctx.marketData.capRate
ctx.marketData.rentalRate
ctx.marketData.salesPricePerSf
ctx.marketData.daysOnMarket

// Valuation Data
ctx.valuationData.salesValue
ctx.valuationData.incomeValue
ctx.valuationData.costValue
ctx.valuationData.landValue
ctx.valuationData.concludedValue
ctx.valuationData.minSalesValue
ctx.valuationData.maxSalesValue

// Comparables
ctx.salesComps[]        // {address, salePrice, adjustedPrice, saleDate}
ctx.landComps[]         // {address, pricePerAcre, adjustedPricePerAcre}
ctx.rentComps[]         // {address, rentPerSf}
ctx.expenseComps[]      // {address, expenseRatio}

// Income/Cost
ctx.noi
ctx.replacementCostNew
ctx.depreciation
ctx.entrepreneurialIncentive

// SWOT
ctx.swotStrengths[]
ctx.swotWeaknesses[]
ctx.swotOpportunities[]
ctx.swotThreats[]

// Transaction
ctx.lastSaleDate
ctx.lastSalePrice
ctx.transactionHistory
ctx.legalDescription

// Supplemental
ctx.buildingPermits[]   // {permitNumber, type, description, issueDate}
ctx.aadt                // Traffic count
```

---

## 📏 Prompt Standards

### Voice
- Third person: "the appraiser", "we", "our analysis"
- Definitive: "It is our conclusion" not "It appears"
- Professional: Use SF, PSF, NNN, GBA, NRA, MAI terminology

### Structure
```
Write a professional [section type] as a 30-year MAI appraiser would.

[PROPERTY DATA from context]

Write a professional narrative:
1. [Step 1]
2. [Step 2]
3. [Step 3]

[Additional instructions]

[Formatting requirement]. Write X paragraphs, approximately Y words.
```

### Formatting
- Headers: `<b><u>SECTION NAME</u></b>`
- Subsections: `<b>Subsection:</b>`
- Paragraph breaks with blank lines
- No emojis, no informal language

### Length Guidelines
- **Utility sections**: 75-100 words (1 paragraph)
- **Standard sections**: 150-200 words (2-3 paragraphs)
- **Complex analyses**: 250-300 words (3-4 paragraphs)
- **SWOT synthesis**: 350-450 words (4-5 paragraphs)

---

## 🧪 Testing Checklist

For each new section:
- [ ] Generate with empty wizard state → Handles gracefully
- [ ] Generate with partial data → Incorporates available data
- [ ] Generate with full data → Rich, detailed narrative
- [ ] Check formatting → Bold headers render correctly
- [ ] Check length → Within word count target
- [ ] Check tone → Sounds like 30-year MAI appraiser
- [ ] Check data → No fake data, only wizard state
- [ ] Check USPAP → Proper terminology if methodology section

---

## 🚨 Common Issues & Fixes

**No AI button appears**
→ Add `sectionContext="section_name"` prop to EnhancedTextArea

**Generated text has placeholders**
→ User needs to fill prerequisite fields (address, property type, etc.)

**API fails**
→ Check OPENAI_API_KEY in .env file

**Text doesn't match property**
→ Verify buildEnhancedContextForAI() extracts correct fields

**Wrong tone/style**
→ Update prompt to emphasize "30-year MAI appraiser" voice

---

## 📞 Quick Links

- **Full Docs**: `AI_DRAFT_SYSTEM_DOCUMENTATION.md`
- **Summary**: `AI_DRAFT_IMPLEMENTATION_SUMMARY.md`
- **Prompts**: `api/_lib/openai.ts` or `packages/backend/.../appraisal-ai.service.ts`
- **Context Builder**: `src/utils/hbuContextBuilder.ts`
- **Types**: `src/types/api.ts`
- **Component**: `src/components/EnhancedTextArea.tsx`

---

## 💡 Pro Tips

1. **Conditional Content**: Use ternary operators for optional data
   ```typescript
   ${ctx.salesComps?.length > 0 ? `COMPS:\n${ctx.salesComps.map(...)}` : 'Comps analyzed.'}
   ```

2. **Graceful Fallbacks**: Always provide "Not specified" for missing data
   ```typescript
   Location: ${ctx.siteData?.city || 'Not specified'}
   ```

3. **Property Type Adaptation**: Adjust language based on property type
   ```typescript
   ${ctx.propertyType === 'Industrial' ? 'clear heights' : 'ceiling heights'}
   ```

4. **USPAP References**: Include when methodology-related
   ```
   "USPAP Standards Rule 1-5 requires..."
   "The four tests of highest and best use..."
   ```

5. **Test with Real Data**: Always test prompts with actual wizard state, not just mock data

---

**System Status**: ✅ All 48 sections operational
**Prompt Quality**: ✅ 30-year MAI appraiser voice
**Data Integration**: ✅ Real wizard state, zero fake data
**USPAP Compliance**: ✅ Proper terminology and methodology
**Documentation**: ✅ Complete with examples

**Ready for production use.** 🚀
