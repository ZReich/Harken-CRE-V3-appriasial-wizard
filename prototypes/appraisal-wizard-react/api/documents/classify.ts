/**
 * Document Classification API Endpoint
 * 
 * Classifies appraisal documents using pdf-parse for text extraction
 * and OpenAI GPT for intelligent document type classification.
 * 
 * Uses the same proven pattern as Harken's main application.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Document type definitions
const DOCUMENT_TYPES = [
  { id: 'cadastral', label: 'Cadastral / County Records', keywords: ['assessor', 'parcel', 'property card', 'tax card', 'county record'] },
  { id: 'engagement', label: 'Engagement Letter', keywords: ['engagement', 'proposal', 'letter of intent', 'loi', 'scope of work'] },
  { id: 'sale', label: 'Buy/Sale Agreement', keywords: ['purchase', 'sale agreement', 'closing statement', 'hud-1', 'settlement'] },
  { id: 'lease', label: 'Lease Agreement', keywords: ['lease', 'rental agreement', 'tenant', 'landlord', 'rent'] },
  { id: 'rentroll', label: 'Rent Roll', keywords: ['rent roll', 'tenant list', 'occupancy', 'unit mix'] },
  { id: 'survey', label: 'Survey / Plat Map', keywords: ['survey', 'alta', 'plat', 'boundary', 'legal description'] },
  { id: 'tax_return', label: 'Tax Return', keywords: ['schedule e', 'form 1040', 'k-1', 'tax return', 'irs'] },
  { id: 'financial_statement', label: 'Financial Statement', keywords: ['income statement', 'operating statement', 'p&l', 'profit and loss', 'proforma'] },
];

const CLASSIFICATION_PROMPT = `You are an expert real estate appraiser assistant. Analyze the following document text and classify it into one of these categories:

DOCUMENT TYPES:
1. cadastral - County records, property cards, assessor data, parcel information, tax cards
2. engagement - Engagement letters, proposals, letters of intent (LOI), scope of work documents
3. sale - Purchase agreements, sale contracts, closing statements, HUD-1, settlement statements
4. lease - Lease agreements, rental contracts, lease amendments, tenant agreements
5. rentroll - Rent rolls, tenant lists, occupancy reports, unit mix summaries
6. survey - ALTA surveys, plat maps, boundary surveys, legal description documents
7. tax_return - Tax returns, Schedule E, K-1 forms, IRS documents related to property income
8. financial_statement - Operating statements, P&L statements, proforma, income/expense reports

Based on the document content, determine the most likely document type.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "type": "document_type_id",
  "confidence": 85,
  "reasoning": "Brief explanation of why this document type was selected",
  "alternatives": [
    {"type": "alternative_type_id", "confidence": 45, "reasoning": "Why this could also fit"}
  ],
  "key_indicators": ["keyword1", "keyword2"]
}

DOCUMENT TEXT:
`;

interface ClassificationRequest {
  text: string;
  filename: string;
}

interface ClassificationResponse {
  type: string;
  confidence: number;
  reasoning: string;
  alternatives?: Array<{ type: string; confidence: number; reasoning?: string }>;
  key_indicators?: string[];
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
    const { text, filename } = req.body as ClassificationRequest;

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing document text. Please extract text from the document first.' 
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] OpenAI API key not configured');
      return res.status(500).json({ success: false, error: 'OpenAI API key not configured' });
    }

    console.log(`[Documents/Classify] Classifying document: ${filename || 'unknown'}`);
    console.log(`[Documents/Classify] Text length: ${text.length} characters`);

    // Truncate very long texts to avoid token limits (keep first ~8000 chars)
    const truncatedText = text.length > 8000 
      ? text.substring(0, 8000) + '\n\n[... document truncated for classification ...]'
      : text;

    // Call OpenAI for classification
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use mini for cost-effective classification
      messages: [
        {
          role: 'system',
          content: 'You are an expert document classifier for real estate appraisal documents. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `${CLASSIFICATION_PROMPT}${truncatedText}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.2, // Low temperature for consistent classification
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('[Documents/Classify] No response from OpenAI');
      return res.status(500).json({ success: false, error: 'No response from OpenAI' });
    }

    console.log(`[Documents/Classify] OpenAI response: ${content.substring(0, 200)}...`);

    // Parse the JSON response
    let result: ClassificationResponse;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('[Documents/Classify] Failed to parse OpenAI response:', content);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        return res.status(500).json({ success: false, error: 'Failed to parse classification response' });
      }
    }

    // Validate the document type
    const validTypes = DOCUMENT_TYPES.map(t => t.id);
    if (!validTypes.includes(result.type)) {
      console.warn(`[Documents/Classify] Unknown document type: ${result.type}, defaulting to unknown`);
      result.type = 'unknown';
      result.confidence = 50;
    }

    // Find the document type info
    const docTypeInfo = DOCUMENT_TYPES.find(t => t.id === result.type);

    console.log(`[Documents/Classify] Classified as: ${result.type} (${result.confidence}% confidence)`);

    return res.status(200).json({
      success: true,
      documentType: result.type,
      confidence: result.confidence / 100, // Normalize to 0-1
      reasoning: result.reasoning,
      alternatives: result.alternatives?.map(alt => ({
        type: alt.type,
        confidence: alt.confidence / 100,
        reasoning: alt.reasoning,
      })) || [],
      keyIndicators: result.key_indicators || [],
      documentTypeLabel: docTypeInfo?.label || 'Unknown Document',
    });

  } catch (error) {
    console.error('[Documents/Classify] Classification error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Classification failed',
    });
  }
}
