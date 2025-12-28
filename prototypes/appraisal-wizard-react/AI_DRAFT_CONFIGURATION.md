# AI Draft Configuration Guide

## Issue Fixed

The AI Draft functionality on the Subject Property Data page (Location & Area tab) was using hardcoded simulated text instead of calling the live OpenAI API to generate professional appraisal text.

## What Was Changed

### 1. Updated `SubjectDataPage.tsx`
- **Removed**: Hardcoded `simulatedLocationDrafts` object with static template text
- **Added**: Import of `generateDraft` and `buildContextFromState` from `aiService`
- **Added**: `aiContext` memo that builds context from wizard state
- **Updated**: `handleDraftAllLocation` function now calls the real OpenAI API via `generateDraft()`
- **Updated**: `LocationContent` component now accepts `contextData` prop
- **Updated**: All `EnhancedTextArea` components now receive `contextData` for AI generation

### 2. How It Works Now

#### "AI Draft All" Button
When you click the "AI Draft All (4 Sections)" button:
1. It builds the AI context from your wizard state (property type, location, etc.)
2. It makes 4 sequential API calls to OpenAI:
   - Area Description (`area_description`)
   - Neighborhood Boundaries (`neighborhood_description`)
   - Neighborhood Characteristics (`neighborhood_description` with custom instruction)
   - Specific Location (`site_description` with custom instruction)
3. Each section is populated with AI-generated text written in the style of a 30-year MAI appraiser

#### Individual AI Draft Buttons
Each text area also has its own AI draft button that:
1. Uses the `EnhancedTextArea` component's built-in AI functionality
2. Calls the same OpenAI API with the specific section context
3. Falls back to simulated data if the API is not configured

## Configuration Required

### Step 1: Set Up OpenAI API Key

You need to create a `.env.local` file in the `prototypes/appraisal-wizard-react` directory with your OpenAI API key:

```bash
# Copy the example file
cp env.example .env.local
```

Then edit `.env.local` and add your OpenAI API key:

```env
# REQUIRED: OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# OPTIONAL: Other API keys
FRED_API_KEY=your-fred-api-key-here
VITE_API_BASE_URL=/api
```

### Step 2: Get an OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Paste it into your `.env.local` file

### Step 3: Deploy to Vercel (if applicable)

If you're deploying to Vercel:

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:
   - `OPENAI_API_KEY` = `sk-your-actual-openai-api-key-here`
   - `FRED_API_KEY` = `your-fred-api-key-here` (optional)
5. Redeploy your application

### Step 4: Restart Your Development Server

After creating/updating `.env.local`:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Testing the AI Draft Feature

1. Start your development server: `npm run dev`
2. Navigate to the Appraisal Wizard
3. Complete the Setup page with a property address
4. Go to **Subject Property Data** → **Location & Area** tab
5. Click the **"AI Draft All (4 Sections)"** button
6. Watch as all 4 sections are populated with AI-generated professional text

You should see:
- Loading state: "Drafting All..." with a spinner
- Each section populated sequentially with unique AI-generated content
- Professional appraisal-style text written by GPT-4o

## API Details

### Backend API Route
- **Path**: `/api/ai/draft`
- **File**: `api/ai/draft.ts`
- **Method**: POST
- **Body**:
  ```json
  {
    "section": "area_description",
    "context": {
      "propertyType": "commercial",
      "propertySubtype": "light industrial",
      "siteData": {
        "city": "Billings",
        "state": "Montana",
        "county": "Yellowstone County"
      }
    }
  }
  ```

### OpenAI Service
- **File**: `api/_lib/openai.ts`
- **Model**: `gpt-4o`
- **Temperature**: 0.7
- **Max Tokens**: 1000
- **System Prompt**: Configured to write as a 30-year MAI-designated commercial real estate appraiser

### Available Sections
- `area_description` - Regional/area overview
- `neighborhood_description` - Neighborhood analysis
- `neighborhood_boundaries` - Neighborhood boundaries (uses `neighborhood_description`)
- `neighborhood_characteristics` - Neighborhood characteristics (uses `neighborhood_description`)
- `site_description` - Site-specific location description
- `hbu_analysis` - Highest and Best Use analysis
- And many more...

## Troubleshooting

### "Failed to generate AI drafts" Error
- **Check**: Is `OPENAI_API_KEY` set in `.env.local`?
- **Check**: Did you restart the dev server after adding the key?
- **Check**: Is your OpenAI API key valid and has available credits?
- **Check**: Browser console (F12) for detailed error messages

### Still Getting Default Text
- **Check**: Are you using the **"AI Draft All"** button (not just clicking in the text areas)?
- **Check**: Is the loading spinner appearing? If not, the button click isn't working
- **Check**: Network tab in browser dev tools - do you see POST requests to `/api/ai/draft`?

### API Key Not Found in Production
- **Check**: Did you add the environment variable in Vercel Dashboard?
- **Check**: Did you redeploy after adding the environment variable?
- **Vercel Note**: Environment variables require a redeploy to take effect

## Cost Estimates

Using GPT-4o:
- Each section generation: ~300-500 tokens (~$0.005-0.008 per section)
- "Draft All" (4 sections): ~$0.02-0.03 per use
- Monthly estimate (100 uses): ~$2-3

## Security Notes

⚠️ **Never commit `.env.local` to git!**

The `.env.local` file is already in `.gitignore`, but double-check:
```bash
# Verify it's ignored
git status
# Should NOT show .env.local
```

## Migration Path

This implementation is designed to be 100% portable to the main Harken backend:

1. The AI service (`aiService.ts`) can be used as-is
2. The OpenAI library (`api/_lib/openai.ts`) can be copied to `packages/backend/src/services/appraisal/`
3. The API route can be replaced with a Harken backend endpoint
4. Update `VITE_API_BASE_URL` to point to the Harken backend

## Support

If you continue to have issues:
1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify the API key is valid on OpenAI's platform
4. Try the individual "Draft" buttons on each text area to isolate the issue


