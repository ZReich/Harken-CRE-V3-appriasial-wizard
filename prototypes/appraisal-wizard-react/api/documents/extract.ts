/**
 * Document Data Extraction API Endpoint
 * 
 * Extracts structured data from appraisal documents using OpenAI GPT.
 * Uses document-type-specific prompts to extract relevant fields.
 * 
 * Uses the same proven pattern as Harken's main application.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Document-type-specific extraction prompts
const EXTRACTION_PROMPTS: Record<string, string> = {
  cadastral: `You are an expert at extracting property information from county records and assessor documents.

Extract the following fields from the document. For each field, provide the extracted value and a confidence score (0-100).

FIELDS TO EXTRACT:
- propertyAddress: Full street address of the property
- legalDescription: Legal description of the property (lot, block, subdivision, etc.)
- taxId: Tax ID, parcel number, or APN
- owner: Current property owner name(s)
- landArea: Land area in acres or square feet (include unit)
- county: County name
- state: State (two-letter abbreviation)
- zipCode: ZIP code
- yearBuilt: Year the property was built
- buildingSize: Building size in square feet
- zoning: Zoning designation

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "propertyAddress": { "value": "123 Main St, City, ST 12345", "confidence": 95 },
    "legalDescription": { "value": "Lot 1, Block 2, Example Subdivision", "confidence": 88 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,

  engagement: `You are an expert at extracting information from appraisal engagement letters and proposals.

Extract the following fields from the document:

FIELDS TO EXTRACT:
- clientName: Name of the client/lender
- clientAddress: Client's address
- fee: Appraisal fee amount
- appraisalPurpose: Purpose of the appraisal (e.g., "Market Value for Loan Collateral")
- effectiveDate: Effective date of the appraisal
- intendedUse: Intended use of the appraisal
- intendedUsers: Intended users
- propertyAddress: Subject property address
- propertyType: Type of property being appraised
- scopeOfWork: Description of scope of work
- dueDate: Report due date

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "clientName": { "value": "First National Bank", "confidence": 95 },
    "fee": { "value": "$4,500", "confidence": 90 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,

  sale: `You are an expert at extracting information from purchase agreements and closing statements.

Extract the following fields from the document:

FIELDS TO EXTRACT:
- salePrice: Sale price of the property
- saleDate: Date of sale or closing
- buyer: Buyer name(s)
- seller: Seller name(s)
- terms: Sale terms (cash, financing, etc.)
- earnestMoney: Earnest money amount
- closingDate: Closing date
- propertyAddress: Property address
- downPayment: Down payment amount
- financingTerms: Financing terms if applicable
- contingencies: Any contingencies

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "salePrice": { "value": "$2,150,000", "confidence": 98 },
    "saleDate": { "value": "2024-06-15", "confidence": 95 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,

  lease: `You are an expert at extracting information from commercial and residential lease agreements.

Extract the following fields from the document:

FIELDS TO EXTRACT:
- tenantName: Tenant name(s)
- landlordName: Landlord name(s)
- rentAmount: Monthly or annual rent amount
- leaseStart: Lease start date
- leaseEnd: Lease end date
- terms: Lease terms description
- escalations: Rent escalation terms
- options: Renewal or purchase options
- securityDeposit: Security deposit amount
- propertyAddress: Leased property address
- squareFeet: Leased square footage
- leaseType: Type of lease (NNN, gross, modified gross, etc.)
- commonAreaMaintenance: CAM charges if applicable

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "tenantName": { "value": "Acme Manufacturing Co.", "confidence": 95 },
    "rentAmount": { "value": "$8,500/month NNN", "confidence": 92 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,

  rentroll: `You are an expert at extracting information from rent rolls and occupancy reports.

Extract the following fields from the document:

FIELDS TO EXTRACT:
- units: Number and description of units
- occupancyRate: Current occupancy rate
- grossIncome: Total gross rental income
- netIncome: Net operating income
- averageRent: Average rent per unit or per SF
- vacancies: Description of vacant units
- totalSquareFeet: Total rentable square feet
- numberOfTenants: Number of current tenants
- annualRent: Total annual rent
- monthlyRent: Total monthly rent

For multi-tenant properties, also extract an array of tenants with their individual details.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "units": { "value": "12 units (10 office, 2 warehouse)", "confidence": 91 },
    "occupancyRate": { "value": "92%", "confidence": 94 },
    ...
  },
  "tenants": [
    { "name": "Tenant A", "unit": "101", "sqft": "1,200", "rent": "$2,400/mo" }
  ]
}

If a field cannot be found, set value to null and confidence to 0.`,

  survey: `You are an expert at extracting information from ALTA surveys and plat maps.

Extract the following fields from the document:

FIELDS TO EXTRACT:
- landArea: Total land area (acres and/or square feet)
- boundaries: Property boundary description
- easements: Easements and encumbrances
- legalDescription: Legal description
- dimensions: Lot dimensions
- setbacks: Required setbacks
- floodZone: Flood zone designation
- surveyDate: Date of survey
- surveyor: Surveyor name/company
- zoning: Zoning designation if shown

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "landArea": { "value": "2.45 acres (106,722 SF)", "confidence": 96 },
    "boundaries": { "value": "North: 250 ft along Main St...", "confidence": 88 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,

  tax_return: `You are an expert at extracting real estate income/expense information from tax returns.

Extract the following fields from Schedule E or other relevant sections:

FIELDS TO EXTRACT:
- grossIncome: Gross rental income
- expenses: Total operating expenses
- netIncome: Net rental income
- depreciation: Depreciation amount
- mortgageInterest: Mortgage interest paid
- propertyTaxes: Property taxes paid
- insurance: Insurance expenses
- repairs: Repairs and maintenance
- utilities: Utilities expenses
- taxYear: Tax year

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "grossIncome": { "value": "$245,000", "confidence": 95 },
    "expenses": { "value": "$98,500", "confidence": 92 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,

  financial_statement: `You are an expert at extracting information from operating statements and P&L reports.

Extract the following fields from the document:

FIELDS TO EXTRACT:
- grossIncome: Gross income/revenue
- effectiveGrossIncome: Effective gross income (after vacancy)
- expenses: Total operating expenses
- netIncome: Net operating income (NOI)
- vacancyRate: Vacancy and collection loss rate
- managementFee: Management fees
- propertyTaxes: Real estate taxes
- insurance: Insurance expenses
- utilities: Utilities expenses
- repairs: Repairs and maintenance
- reserves: Reserve for replacements
- period: Reporting period (year, month, etc.)

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "grossIncome": { "value": "$312,000", "confidence": 96 },
    "netIncome": { "value": "$198,500", "confidence": 94 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,

  unknown: `You are an expert at extracting information from various real estate documents.

Try to extract any relevant property or transaction information you can find:

FIELDS TO EXTRACT (if present):
- propertyAddress: Property address
- owner: Property owner
- value: Any value or price mentioned
- date: Any relevant date
- description: Brief description of document contents

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "fields": {
    "propertyAddress": { "value": "...", "confidence": 80 },
    ...
  }
}

If a field cannot be found, set value to null and confidence to 0.`,
};

interface ExtractionRequest {
  text: string;
  documentType: string;
  filename: string;
}

interface ExtractedField {
  value: string | null;
  confidence: number;
}

interface ExtractionResponse {
  fields: Record<string, ExtractedField>;
  tenants?: Array<{
    name: string;
    unit?: string;
    sqft?: string;
    rent?: string;
  }>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, image, documentType, filename, useVision } = req.body as ExtractionRequest & { image?: string; useVision?: boolean };

    if (!text && !image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing document text or image. Please provide either text or image data.' 
      });
    }

    if (!documentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing document type. Please classify the document first.' 
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] OpenAI API key not configured');
      return res.status(500).json({ success: false, error: 'OpenAI API key not configured' });
    }

    // Get the appropriate extraction prompt
    const extractionPrompt = EXTRACTION_PROMPTS[documentType] || EXTRACTION_PROMPTS['unknown'];

    // Handle image-based extraction with Vision API
    if (useVision && image) {
      console.log(`[Documents/Extract] Using Vision API for ${documentType} document: ${filename || 'unknown'}`);
      console.log(`[Documents/Extract] Image data length: ${image.length} characters`);

      // Call OpenAI Vision API
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Use gpt-4o for vision capabilities
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: extractionPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: 'high', // Use high detail for extraction accuracy
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error('[API] No response from OpenAI Vision API');
        return res.status(500).json({ success: false, error: 'No response from OpenAI Vision API' });
      }

      console.log(`[Documents/Extract] Vision API response received: ${content.substring(0, 200)}...`);

      let result;
      try {
        result = JSON.parse(content);
      } catch (e) {
        console.error('[API] Failed to parse Vision API response as JSON:', content);
        return res.status(500).json({ success: false, error: 'Failed to parse Vision API response' });
      }

      return res.status(200).json({
        success: true,
        ...result,
      });
    }

    // Handle text-based extraction
    console.log(`[Documents/Extract] Extracting from ${documentType} document: ${filename || 'unknown'}`);
    console.log(`[Documents/Extract] Text length: ${text?.length || 0} characters`);

    // Truncate very long texts to avoid token limits (keep first ~12000 chars for extraction)
    const truncatedText = (text && text.length > 12000)
      ? text.substring(0, 12000) + '\n\n[... document truncated ...]'
      : text;

    // Call OpenAI for extraction
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use mini for cost-effective extraction
      messages: [
        {
          role: 'system',
          content: 'You are an expert data extractor for real estate appraisal documents. Extract information accurately and provide confidence scores. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `${extractionPrompt}\n\nDOCUMENT TEXT:\n${truncatedText}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Very low temperature for accurate extraction
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('[Documents/Extract] No response from OpenAI');
      return res.status(500).json({ success: false, error: 'No response from OpenAI' });
    }

    console.log(`[Documents/Extract] OpenAI response length: ${content.length} chars`);

    // Parse the JSON response
    let result: ExtractionResponse;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('[Documents/Extract] Failed to parse OpenAI response:', content.substring(0, 500));
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        return res.status(500).json({ success: false, error: 'Failed to parse extraction response' });
      }
    }

    // Normalize confidence scores to 0-1 range
    const normalizedFields: Record<string, ExtractedField> = {};
    if (result.fields) {
      for (const [key, field] of Object.entries(result.fields)) {
        normalizedFields[key] = {
          value: field.value,
          confidence: field.confidence > 1 ? field.confidence / 100 : field.confidence,
        };
      }
    }

    // Count extracted fields
    const extractedCount = Object.values(normalizedFields).filter(f => f.value !== null).length;
    console.log(`[Documents/Extract] Extracted ${extractedCount} fields from ${documentType} document`);

    return res.status(200).json({
      success: true,
      documentType,
      fields: normalizedFields,
      tenants: result.tenants || [],
      extractedFieldCount: extractedCount,
    });

  } catch (error) {
    console.error('[Documents/Extract] Extraction error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Extraction failed',
    });
  }
}
