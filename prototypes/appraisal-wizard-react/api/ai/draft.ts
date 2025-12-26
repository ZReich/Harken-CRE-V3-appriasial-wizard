/**
 * AI Draft Generation API Route
 * POST /api/ai/draft
 * 
 * Generates AI-powered text for appraisal report sections.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateDraft, getAvailableSections } from '../_lib/openai';
import type { AIGenerationContext } from '../_lib/types';

interface AIRequestBody {
  section: string;
  context: AIGenerationContext;
  existingText?: string;
  instruction?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
      data: null,
    });
  }

  // Validate API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not configured');
    return res.status(500).json({
      success: false,
      error: 'AI service not configured',
      data: null,
    });
  }

  try {
    const body = req.body as AIRequestBody;
    const { section, context, existingText, instruction } = body;

    // Validate required fields
    if (!section) {
      return res.status(400).json({
        success: false,
        error: 'Section identifier is required',
        data: null,
        availableSections: getAvailableSections(),
      });
    }

    // Generate the draft
    const content = await generateDraft({
      section,
      context: context || {},
      existingText,
      instruction,
    });

    return res.status(200).json({
      success: true,
      data: {
        content,
        section,
      },
      error: null,
    });
  } catch (error) {
    console.error('AI draft generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to generate AI draft: ${errorMessage}`,
      data: null,
    });
  }
}


