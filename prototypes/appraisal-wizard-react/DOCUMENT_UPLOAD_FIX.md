# Document Upload Fix

## Problem

When uploading documents (like `cad.pdf`) in the local development environment, the document extraction was failing with errors. This was caused by several issues:

### Root Causes

1. **Missing Vercel Dev Server**: The API endpoints (`/api/documents/classify` and `/api/documents/extract`) are Vercel serverless functions that don't work with the standard `vite` dev server. They only work when:
   - Deployed to Vercel (production)
   - Running with `vercel dev` (local development)

2. **Weak Filename Pattern Matching**: The fallback filename matching (used when PDF text extraction fails) didn't recognize common abbreviations like "cad" for cadastral documents.

3. **Insufficient Error Logging**: The PDF text extraction had minimal logging, making it difficult to diagnose where the process was failing.

## Solution

### 1. Use Vercel Dev Server for Local Development

**Changed**: `package.json` scripts
```json
{
  "scripts": {
    "dev": "vercel dev",      // Now uses Vercel dev server
    "dev:vite": "vite",       // Keep vite option for UI-only work
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

**Added**: `vercel` as a dev dependency
```json
{
  "devDependencies": {
    "vercel": "^37.0.0"
  }
}
```

### 2. Improved Filename Pattern Matching

**Changed**: `src/services/documentExtraction.ts` - Enhanced the fallback filename detection
```typescript
// Before: Only matched "cadastral", "county", "parcel"
if (filename.includes('cadastral') || filename.includes('county') || filename.includes('parcel')) {
  return { documentType: 'cadastral', confidence: 0.6 };
}

// After: Matches more patterns including "cad", "assessor", "tax"
const lowerFilename = filename.toLowerCase();
if (lowerFilename.includes('cadastral') || lowerFilename.includes('county') || 
    lowerFilename.includes('parcel') || lowerFilename.includes('cad') || 
    lowerFilename.includes('assessor') || lowerFilename.includes('tax')) {
  return { documentType: 'cadastral', confidence: 0.6 };
}
```

### 3. Enhanced Error Logging

**Changed**: `src/services/documentExtraction.ts` - Added comprehensive logging
```typescript
console.log(`[DocumentExtraction] Starting text extraction for: ${file.name} (${file.type})`);
console.log('[DocumentExtraction] Loading pdfjs-dist...');
console.log(`[DocumentExtraction] PDF.js worker source set to version ${pdfjsLib.version}`);
console.log(`[DocumentExtraction] File loaded, size: ${arrayBuffer.byteLength} bytes`);
console.log(`[DocumentExtraction] PDF loaded, ${pdf.numPages} pages`);
console.log(`[DocumentExtraction] Page ${i} extracted: ${pageText.length} chars`);
console.log(`[DocumentExtraction] ✓ Extracted ${fullText.length} chars from PDF client-side`);
```

## How to Use

### Development (Local)

```bash
# Install dependencies (includes vercel CLI)
npm install

# Run with Vercel dev server (supports API endpoints)
npm run dev

# OR run with Vite only (UI development, APIs won't work)
npm run dev:vite
```

### Production (Vercel)

The production build continues to work as before:
```bash
npm run build
```

Environment variables on Vercel:
- `OPENAI_API_KEY` - Required for document classification and extraction
- `VITE_USE_MOCK_DATA` - Optional, set to 'true' to use mock data instead of real AI

## Troubleshooting

### Error: "Cannot fetch /api/documents/classify"

**Cause**: Using `vite` instead of `vercel dev`  
**Fix**: Run `npm run dev` instead of `npm run dev:vite`

### Error: "Classification failed" or "Extraction failed"

**Check**:
1. Open browser console (F12)
2. Look for `[DocumentExtraction]` log messages
3. Common issues:
   - PDF text extraction failed → Check if PDF is scanned (needs OCR)
   - API returned error → Check `OPENAI_API_KEY` is set
   - Network error → Check `vercel dev` is running

### PDF Text Extraction Fails

**Symptoms**: Console shows "PDF appears to be scanned or has minimal text"  
**Cause**: The PDF is image-based (scanned) rather than text-based  
**Current Status**: Client-side extraction can't handle scanned PDFs  
**Workaround**: Use filename-based classification (name file descriptively like "cadastral.pdf")  
**Future**: Backend OCR integration needed for scanned documents

## Testing the Fix

1. **Start the dev server**:
   ```bash
   npm run dev
   ```
   
2. **Navigate to Document Intake page** in the wizard

3. **Upload a test document** (e.g., `cad.pdf`)

4. **Open browser console** (F12) and watch for:
   ```
   [DocumentExtraction] Starting text extraction for: cad.pdf (application/pdf)
   [DocumentExtraction] Loading pdfjs-dist...
   [DocumentExtraction] PDF loaded, 1 pages
   [DocumentExtraction] ✓ Extracted 457 chars from PDF client-side
   ```

5. **Verify the document is classified** as "cadastral" (should see confidence ~60% if using filename fallback, or higher if text extraction worked)

6. **Check extracted fields** are populated in the wizard (property address, legal description, etc.)

## Files Modified

- `package.json` - Added vercel dev dependency and updated dev script
- `src/services/documentExtraction.ts` - Improved filename matching and logging
- `DOCUMENT_UPLOAD_FIX.md` - This documentation

## Related Documentation

- `PHOTO_AI_FIX.md` - Photo classification AI implementation
- `DOCUMENT_EXTRACTION_STATUS.md` - Document AI extraction feature overview
- `IMPLEMENTATION_PLAN.md` - Overall document AI implementation plan
