# Document Extraction Feature Status

## Current State: ❌ NOT LIVE - Using Mock Data

The document extraction feature in the Document Intake page is **currently using simulated/mock data** and **NOT calling any AI API** to actually extract information from uploaded documents.

## What's Happening Now:

When you upload a document:
1. **Classification**: Based purely on **filename keywords** (not AI vision/OCR)
   - e.g., "cadastral" in filename → classifies as Cadastral document
   - If no keywords match, it randomly assigns a document type
2. **Extraction**: Returns **pre-written sample data** (not from your actual document)
   - Every cadastral document returns the same fake data
   - Every engagement letter returns the same fake client name
   - The data is NOT extracted from the actual PDF/image you uploaded

## Code Evidence:

### Line 197 in `src/services/documentExtraction.ts`:
```typescript
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
```

**Default: `true`** - Always uses mock data unless explicitly disabled.

### Lines 272-289 - Mock Extraction:
```typescript
if (USE_MOCK_DATA) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const mockGenerator = mockExtractions[documentType];
  if (!mockGenerator) {
    return {
      success: false,
      error: `Unknown document type: ${documentType}`,
    };
  }

  return {
    success: true,
    data: mockGenerator(), // ← Returns hardcoded sample data
  };
}
```

### Lines 458-526 - Filename-Based Classification:
```typescript
export async function classifyDocument(file: File): Promise<ClassificationResult> {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
  
  const filename = file.name.toLowerCase();
  // ... checks if filename contains keywords like 'cadastral', 'engagement', etc.
  
  // If no matches, use random assignment for demo
  if (scores.length === 0) {
    const types: DocumentType[] = ['cadastral', 'engagement', 'sale', 'lease', 'rentroll'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    // ... returns random type
  }
}
```

## What's Missing:

There is **NO backend API endpoint** for document extraction. The code is set up to call:
- `POST /api/documents/classify` - **DOES NOT EXIST**
- `POST /api/documents/extract` - **DOES NOT EXIST**

Compare to photos (which IS working):
- ✅ `POST /api/photos/classify` - EXISTS and working
- ✅ Uses GPT-4o Vision API to actually analyze photos
- ✅ Has real OpenAI integration

## Sample Mock Data:

### Cadastral Documents:
Every cadastral document returns:
```json
{
  "propertyAddress": "1234 Industrial Blvd, Billings, MT 59101",
  "legalDescription": "Lot 12, Block 4, CANYON CREEK INDUSTRIAL PARK...",
  "taxId": "123-45-678-00",
  "owner": "ABC Industrial Holdings LLC",
  "landArea": "2.45 acres (106,722 SF)"
}
```

### Engagement Letters:
Every engagement letter returns:
```json
{
  "clientName": "First National Bank of Montana",
  "fee": "$4,500",
  "appraisalPurpose": "Market Value for Loan Collateral",
  "effectiveDate": "[today's date]"
}
```

## Why It Looks Real:

The UI is well-designed to look like real AI:
- ✨ Shows "AI is analyzing..." loading state
- 📊 Shows fake confidence scores (88%, 95%, etc.)
- 🎨 Color-codes fields by confidence (green = high, amber = medium, red = low)
- ⏱️ Adds realistic delays (1.5-2.5 seconds)
- 📝 Shows extracted fields in a professional interface

But it's all **theater** - the data is hardcoded and doesn't come from your documents.

## To Make It Real:

### Option 1: Quick Fix - Use OpenAI Directly (Not Recommended - Security Issue)
Add `VITE_OPENAI_API_KEY` and call OpenAI from frontend (exposes API key).

### Option 2: Proper Implementation - Create Backend API (Recommended)

Create two new backend endpoints similar to the photo classification endpoint:

#### 1. `/api/documents/classify`
```typescript
// Use GPT-4o Vision API to:
// 1. Convert PDF to image or extract text
// 2. Analyze document structure and content
// 3. Classify document type (cadastral, engagement, lease, etc.)
// 4. Return classification with confidence score
```

#### 2. `/api/documents/extract`
```typescript
// Use GPT-4o or GPT-4 with structured output to:
// 1. Extract text from PDF/image (OCR if needed)
// 2. Use AI to identify and extract specific fields based on document type
// 3. Return structured data with confidence scores per field
// 4. Support different document types (cadastral, engagement, sale, lease, rentroll)
```

### Required Environment Variables:
```env
OPENAI_API_KEY=sk-your-key-here  # Already set for photos/AI drafts
```

### Implementation Steps:

1. **Create `/api/documents/classify.ts`**
   - Similar structure to `/api/photos/classify.ts`
   - Use GPT-4o Vision for document classification
   - Return document type + confidence

2. **Create `/api/documents/extract.ts`**
   - Use GPT-4 or GPT-4o for text extraction
   - Use structured output mode for consistent field extraction
   - Different prompts for different document types
   - Return extracted fields with confidence scores

3. **Update frontend service**
   - Change `USE_MOCK_DATA` default to `false`
   - Ensure API calls work properly
   - Add error handling for API failures

4. **Test with real documents**
   - Upload actual cadastral records, engagement letters, etc.
   - Verify extraction accuracy
   - Adjust prompts to improve accuracy

## Cost Estimate:

Using GPT-4o for document extraction:
- **Classification**: ~$0.01-0.02 per document (vision API)
- **Extraction**: ~$0.05-0.10 per document (text analysis)
- **Total**: ~$0.06-0.12 per document

For a typical appraisal with 5-10 documents: **~$0.50-1.00 per appraisal**

## User Impact:

Currently, users are seeing:
- ✅ Beautiful UI that looks professional
- ✅ Fast, smooth workflow
- ❌ **Fake data that doesn't match their actual documents**
- ❌ **Have to manually re-enter everything anyway**

This defeats the purpose of the "AI-powered data extraction" feature. Users are essentially:
1. Uploading documents
2. Seeing fake extracted data
3. Manually overwriting all the fake data with real data
4. Wondering why they uploaded documents in the first place

## Recommendation:

**EITHER:**
1. **Implement real AI extraction** using backend APIs (recommended)
2. **Remove the feature** and just allow document upload for reference
3. **Add prominent disclaimer** that extraction is "coming soon" and currently shows sample data

The current state where it **looks** like AI but isn't actually working is confusing for users and may lead to data errors if they accept the fake extracted data thinking it came from their documents.
