# Troubleshooting Document Extraction

## Issue: Extracted Data Not Populating Wizard Fields

If you upload a document and it doesn't populate the wizard fields with the extracted data, follow this diagnostic guide.

## Step 1: Check the Browser Console

1. **Open your browser's Developer Tools**
   - Press `F12` or right-click → "Inspect"
   - Click on the "Console" tab

2. **Upload your document** (e.g., `cad.pdf`)

3. **Look for these log messages** in sequence:

### A. Text Extraction Logs

```
[DocumentExtraction] Starting text extraction for: cad.pdf (application/pdf)
[DocumentExtraction] Loading pdfjs-dist...
[DocumentExtraction] PDF.js worker source set to version 4.8.69
[DocumentExtraction] File loaded, size: 125000 bytes
[DocumentExtraction] PDF loaded, 1 pages
[DocumentExtraction] Page 1 extracted: 850 chars
[DocumentExtraction] ✓ Extracted 850 chars from PDF client-side
```

**✅ If you see this**: Text extraction worked! Move to Step B.

**❌ If you see error messages**: 
- `✗ Client-side PDF extraction failed` → PDF.js library issue (see Solution 1)
- `⚠ PDF appears to be scanned` → The PDF is an image, needs OCR (see Solution 2)

### B. Classification Logs

```
[DocumentExtraction] Classification response: {"success":true,"documentType":"cadastral","confidence":0.85}
```

**✅ If you see `"documentType":"cadastral"`**: Classification worked! Move to Step C.

**❌ If you see**:
- `"documentType":"unknown"` → Classification failed (see Solution 3)
- `Classification API error: 404` → API endpoint not accessible (see Solution 4)
- `Classification API error: 500` → Server error (see Solution 5)

### C. Extraction Logs

```
[DocumentExtraction] Extraction response: {
  "success": true,
  "fields": {
    "propertyAddress": {"value": "4217 Silver Sage Way, Billings, MT 59106", "confidence": 95},
    "taxId": {"value": "0004128500", "confidence": 98},
    ...
  }
}
```

**✅ If you see field values**: Extraction worked! Move to Step D.

**❌ If you see**:
- `"success": false` → Extraction API failed (see Solution 5)
- Empty `fields: {}` → OpenAI couldn't extract data (see Solution 6)

### D. Application to Wizard Logs

```
[DocumentIntake] ✓ Extraction successful for cad.pdf
[DocumentIntake] Extracted data: {propertyAddress: {...}, taxId: {...}, ...}
[DocumentIntake] Adding field: propertyAddress = "4217 Silver Sage Way..." (confidence: 0.95)
[DocumentIntake] Applying 8 fields to wizard state

[WizardContext] APPLY_DOCUMENT_EXTRACTED_DATA triggered
[WizardContext] Document: cad.pdf Type: cadastral
[WizardContext] Field "propertyAddress" -> "subjectData.address.street"
[WizardContext]   Current value: ""
[WizardContext]   New value: "4217 Silver Sage Way, Billings, MT 59106" (confidence: 0.95)
[WizardContext]   Should apply: true
[WizardContext]   ✓ Applied to wizard state
[WizardContext] Applied 8 fields, skipped 0 fields
```

**✅ If you see "Applied X fields"**: Data was applied! Check if the wizard fields are actually updating on screen (see Solution 7).

**❌ If you see**:
- `Skipped (confidence too low)` → Confidence below 50% threshold (see Solution 8)
- `Skipped (field already filled)` → Fields were manually filled before extraction (see Solution 9)
- `No mapping found for field` → Field mapping configuration issue (see Solution 10)

---

## Solutions

### Solution 1: PDF.js Library Issue
**Problem**: `pdfjs-dist` failed to load or initialize

**Fixes**:
1. Check network tab for failed CDN requests to `cdnjs.cloudflare.com`
2. Verify `pdfjs-dist` is installed: `npm list pdfjs-dist`
3. Clear browser cache and reload

### Solution 2: Scanned PDF (Image-Based)
**Problem**: PDF is scanned image, not text-based

**Current Workaround**:
- Rename file to be more descriptive: `cadastral-yellowstone-county.pdf` or `cad.pdf`
- The system will use filename-based classification as fallback

**Future Fix**: Backend OCR integration needed (not yet implemented)

### Solution 3: Classification Failed
**Problem**: Document classified as "unknown" 

**Causes**:
1. **Empty text extraction** → PDF is scanned or text extraction failed
2. **Filename doesn't match patterns** → File needs better name

**Fixes**:
- Check Step A logs - did text extraction work?
- Rename file to include keywords: `cadastral`, `cad`, `county`, `parcel`, `assessor`, `tax`
- For engagement letters: `engagement`, `letter`, `proposal`
- For sale docs: `sale`, `purchase`, `deed`

### Solution 4: API Endpoint 404 Error
**Problem**: Backend API not accessible

**In Local Development**:
```bash
# Make sure you're using vercel dev, not vite
npm run dev
# NOT: npm run dev:vite
```

**In Vercel Deployment**:
- Check if `/api/documents/classify.ts` and `/api/documents/extract.ts` files exist
- Verify Vercel deployment succeeded (no build errors)

### Solution 5: Server Error (500)
**Problem**: Backend API crashed or OpenAI API issue

**Checks**:
1. **Vercel Dashboard** → Function Logs
2. **Environment Variables**: Is `OPENAI_API_KEY` set correctly?
3. **OpenAI Account**: API key valid? Credits available?

**Common Causes**:
- Missing or invalid `OPENAI_API_KEY` environment variable
- OpenAI API rate limit exceeded
- OpenAI API returned invalid JSON

### Solution 6: Empty Extraction Results
**Problem**: OpenAI couldn't find any data in the document

**Causes**:
1. **Document text is garbled** → OCR quality issue
2. **Wrong document type** → Classified as wrong type, used wrong prompt
3. **Document format unexpected** → OpenAI prompt doesn't match document structure

**Debug**:
```javascript
// Check what text was sent to OpenAI
console.log('[DocumentExtraction] Sending text to classify API:', text.substring(0, 500));
```

**Fixes**:
- Try reclassifying with the correct type manually
- Check if text extraction captured the right content
- May need to adjust extraction prompts in `/api/documents/extract.ts`

### Solution 7: Data Applied But Not Visible in UI
**Problem**: Console shows "Applied X fields" but wizard doesn't update

**Causes**:
1. **React state not re-rendering** → Context update issue
2. **Wrong field path** → Data applied to wrong location in state
3. **Form not bound to context** → Input not reading from wizard context

**Debug**:
```javascript
// Check actual state after application
console.log('[WizardContext] Updated state subjectData:', updatedState.subjectData);
```

**Fixes**:
- Refresh the page and try again
- Navigate to a different wizard page and back
- Check if `subjectData.address.street` exists in state
- Verify SetupPage input is bound to `useWizard()` context

### Solution 8: Confidence Too Low
**Problem**: AI confidence below 50% threshold

**Example**:
```
[WizardContext] ✗ Skipped (confidence too low: 0.35)
```

**Causes**:
- Text quality poor (scanned PDF)
- Field value ambiguous or unclear
- OpenAI not certain about extraction

**Options**:
1. **Accept lower confidence**: Edit threshold in `WizardContext.tsx` line 351:
   ```typescript
   const shouldApply = fieldData.confidence >= 0.3 && !isFilled(currentValue);
   // Changed from 0.5 to 0.3
   ```
2. **Manual entry**: Just type the value in manually
3. **Better source document**: Use a cleaner PDF

### Solution 9: Fields Already Filled
**Problem**: Extracted data skipped because fields were manually filled

**Example**:
```
[WizardContext] ✗ Skipped (field already filled with: "123 Main St")
```

**This is intentional** - the system doesn't overwrite manual entries.

**To Allow Overwrite**:
1. Clear the field manually first, then re-upload document
2. Or use the "Reprocess" button on the document card
3. Or modify the logic in `WizardContext.tsx` line 351 to allow overwriting

### Solution 10: No Field Mapping
**Problem**: Extracted field has no corresponding wizard field

**Example**:
```
[WizardContext] ⚠ No mapping found for field "buildingSize"
```

**Fix**: Add mapping in `src/config/documentFieldMappings.ts`:
```typescript
cadastral: [
  // ... existing mappings
  { extractedField: 'buildingSize', wizardPath: 'subjectData.buildingArea' },
],
```

---

## Testing Checklist

After uploading `cad.pdf` in Vercel, verify:

- [ ] PDF text extraction succeeded (850+ characters)
- [ ] Document classified as "cadastral" with >60% confidence
- [ ] Extraction returned 8-10 fields with values
- [ ] At least 5+ fields applied to wizard state
- [ ] Property address visible in Setup page input
- [ ] Tax ID visible in Setup page input  
- [ ] Legal description visible in Setup page textarea
- [ ] Document source indicators (blue info icons) appear next to populated fields
- [ ] Clicking indicator shows document name and confidence score

---

## Quick Debug Command

Paste this in the browser console **after** uploading a document:

```javascript
// Check wizard state
const state = JSON.parse(localStorage.getItem('wizardState') || '{}');
console.log('Subject Data:', state.subjectData);
console.log('Document Sources:', state.documentFieldSources);
console.log('Property Address:', state.subjectData?.address?.street);
console.log('Tax ID:', state.subjectData?.taxId);
console.log('Legal Description:', state.subjectData?.legalDescription);
```

This will show you exactly what's in the wizard state after extraction.

---

## Still Not Working?

If you've tried all solutions and it still doesn't work:

1. **Export the console logs**:
   - Right-click in console → "Save as..."
   - Or copy/paste all logs to a text file

2. **Check Vercel function logs**:
   - Vercel Dashboard → Your Project → Functions tab
   - Look for `/api/documents/classify` and `/api/documents/extract` logs

3. **Provide this info**:
   - Browser console logs (especially [WizardContext] messages)
   - Vercel function logs
   - The actual PDF file you're trying to upload
   - Which fields you expected to be populated

This will help diagnose any remaining issues.
