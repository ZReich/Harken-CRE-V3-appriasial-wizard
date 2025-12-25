# Migration Guide: Vercel API Routes to Harken Backend

This document describes how to migrate the Vercel serverless API routes to the Harken Express backend when you're ready to consolidate.

## Architecture Overview

```
Current (Vercel):
Frontend → /api/* → Vercel Serverless Functions → External APIs

Future (Harken):
Frontend → https://api.harken.com/v2/* → Express Backend → External APIs
```

The migration is designed to be **minimal effort** because:
1. API contracts (request/response shapes) are identical
2. Core business logic is in portable utility files
3. Only the Express wrapper needs to be added

---

## Migration Checklist

### Step 1: Copy Shared Types (5 minutes)

Copy the API contract types to the Harken backend:

```
FROM: prototypes/appraisal-wizard-react/src/types/api.ts
TO:   packages/backend/src/utils/interfaces/api.types.ts
```

These types define all request/response interfaces and are 100% portable.

### Step 2: Copy Utility Functions (15 minutes)

Copy the core business logic from `api/_lib/` to Harken:

| From (Vercel) | To (Harken) |
|---------------|-------------|
| `api/_lib/fred.ts` | `packages/backend/src/services/integration/fred.ts` |
| `api/_lib/census.ts` | `packages/backend/src/services/integration/census.ts` |
| `api/_lib/cadastral.ts` | `packages/backend/src/services/integration/cadastral.ts` |
| `api/_lib/risk-engine.ts` | `packages/backend/src/services/integration/risk-engine.ts` |

For OpenAI, merge with existing:
| From (Vercel) | To (Harken) |
|---------------|-------------|
| `api/_lib/openai.ts` | Merge prompts into `packages/backend/src/services/appraisal/appraisal-ai.service.ts` |

### Step 3: Create Express Routes (30 minutes)

Create a new routes file for the integration endpoints:

**File: `packages/backend/src/routes/integration.routes.ts`**

```typescript
import { Router } from 'express';
import IntegrationService from '../services/integration/integration.service';

class IntegrationRoutes {
  router = Router();
  integrationService = new IntegrationService();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // AI Draft Generation
    this.router.post('/ai/draft', this.integrationService.generateAIDraft);
    
    // Economic Indicators
    this.router.get('/economic/indicators', this.integrationService.getEconomicIndicators);
    
    // Cadastral Lookup
    this.router.post('/cadastral/query', this.integrationService.queryCadastral);
    
    // Demographics
    this.router.post('/demographics/radius', this.integrationService.getDemographics);
    
    // Risk Rating
    this.router.post('/risk-rating/calculate', this.integrationService.calculateRiskRating);
  }
}

export default new IntegrationRoutes().router;
```

### Step 4: Create Integration Service (1 hour)

**File: `packages/backend/src/services/integration/integration.service.ts`**

```typescript
import { Request, Response } from 'express';
import { generateDraft } from './openai';           // Copied from Vercel
import { getMultipleFredSeries, FRED_SERIES } from './fred';  // Copied from Vercel
import { calculateRiskRating } from './risk-engine'; // Copied from Vercel
import { queryParcelByLocation, queryParcelByAddress } from './cadastral';
import { getRadiusDemographics } from './census';

export default class IntegrationService {
  
  public generateAIDraft = async (req: Request, res: Response) => {
    try {
      const { section, context, existingText, instruction } = req.body;
      
      const content = await generateDraft({ section, context, existingText, instruction });
      
      return res.status(200).json({
        success: true,
        data: { content, section },
      });
    } catch (error) {
      console.error('AI generation error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  public getEconomicIndicators = async (req: Request, res: Response) => {
    try {
      // Same logic as api/economic/indicators.ts
      const series = await getMultipleFredSeries([
        FRED_SERIES.FEDERAL_FUNDS_RATE,
        FRED_SERIES.TREASURY_10Y,
        FRED_SERIES.CPI,
        FRED_SERIES.GDP,
      ]);
      
      // Format and return (same as Vercel route)
      return res.status(200).json({
        success: true,
        data: {
          federalFundsRate: { current: series[FRED_SERIES.FEDERAL_FUNDS_RATE].observations[0]?.value },
          // ... rest of formatting
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  public queryCadastral = async (req: Request, res: Response) => {
    // Same logic as api/cadastral/query.ts
  };

  public getDemographics = async (req: Request, res: Response) => {
    // Same logic as api/demographics/radius.ts
  };

  public calculateRiskRating = async (req: Request, res: Response) => {
    // Same logic as api/risk-rating/calculate.ts
  };
}
```

### Step 5: Register Routes (5 minutes)

Add the new routes to your main Express app:

**File: `packages/backend/src/app.ts`** (or equivalent)

```typescript
import integrationRoutes from './routes/integration.routes';

// Add to your route registrations:
app.use('/v2', integrationRoutes);
```

### Step 6: Add Environment Variables (5 minutes)

Ensure these are in your Harken backend environment:

```
OPENAI_API_KEY=sk-...
FRED_API_KEY=...
GREATSCHOOLS_API_KEY=... (optional)
CRIMEOMETER_API_KEY=... (optional)
```

### Step 7: Switch Frontend API Base URL (2 minutes)

Update the frontend environment variable:

```
# Before (Vercel)
VITE_API_BASE_URL=/api

# After (Harken)
VITE_API_BASE_URL=https://api.harken.com/v2
```

Or set in Vercel Dashboard > Project Settings > Environment Variables.

---

## Verification Checklist

After migration, verify each endpoint:

- [ ] `POST /v2/ai/draft` - Test AI generation
- [ ] `GET /v2/economic/indicators` - Check FRED data
- [ ] `POST /v2/cadastral/query` - Test Montana property lookup
- [ ] `POST /v2/demographics/radius` - Test Census data
- [ ] `POST /v2/risk-rating/calculate` - Test risk calculation

---

## Rollback Plan

If issues occur, rollback by changing the environment variable:

```
VITE_API_BASE_URL=/api
```

The Vercel API routes will continue to work as a fallback.

---

## Time Estimate

| Task | Time |
|------|------|
| Copy types | 5 min |
| Copy utilities | 15 min |
| Create Express routes | 30 min |
| Create service | 1 hour |
| Register routes | 5 min |
| Environment variables | 5 min |
| Testing | 30 min |
| **Total** | **~2.5 hours** |

---

## Files Summary

### Files to Copy (Direct Copy)
- `src/types/api.ts` - API contracts
- `api/_lib/fred.ts` - FRED API wrapper
- `api/_lib/census.ts` - Census API wrapper
- `api/_lib/cadastral.ts` - Montana Cadastral wrapper
- `api/_lib/risk-engine.ts` - Risk rating algorithm

### Files to Merge
- `api/_lib/openai.ts` - Merge prompts with existing AI service

### Files to Create
- `packages/backend/src/routes/integration.routes.ts`
- `packages/backend/src/services/integration/integration.service.ts`

### Files to Update
- `packages/backend/src/app.ts` - Add route registration
- `.env` - Add API keys


