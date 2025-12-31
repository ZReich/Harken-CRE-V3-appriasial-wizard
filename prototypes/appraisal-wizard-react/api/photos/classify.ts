/**
 * Photo Classification API Endpoint
 * 
 * Classifies property photos using GPT-4o Vision API.
 * This endpoint keeps the OpenAI API key secure on the server.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Photo slot definitions
const PHOTO_SLOTS = [
  // Exterior
  { id: 'ext_front', label: 'Front Elevation', category: 'exterior', categoryLabel: 'Exterior Photos' },
  { id: 'ext_rear', label: 'Rear Elevation', category: 'exterior', categoryLabel: 'Exterior Photos' },
  { id: 'ext_side_1', label: 'Side Elevation (Left)', category: 'exterior', categoryLabel: 'Exterior Photos' },
  { id: 'ext_side_2', label: 'Side Elevation (Right)', category: 'exterior', categoryLabel: 'Exterior Photos' },
  { id: 'ext_additional_1', label: 'Additional Exterior View 1', category: 'exterior', categoryLabel: 'Exterior Photos' },
  { id: 'ext_additional_2', label: 'Additional Exterior View 2', category: 'exterior', categoryLabel: 'Exterior Photos' },
  // Interior
  { id: 'int_lobby', label: 'Lobby/Reception', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_office', label: 'Typical Office', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_conference', label: 'Conference Room', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_shop', label: 'Shop/Warehouse', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_bathroom', label: 'Bathroom', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_mechanical', label: 'Mechanical Room', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_mezzanine', label: 'Mezzanine', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_kitchen', label: 'Kitchen/Break Room', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_additional_1', label: 'Additional Interior View 1', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_additional_2', label: 'Additional Interior View 2', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_additional_3', label: 'Additional Interior View 3', category: 'interior', categoryLabel: 'Interior Photos' },
  { id: 'int_additional_4', label: 'Additional Interior View 4', category: 'interior', categoryLabel: 'Interior Photos' },
  // Site
  { id: 'site_parking', label: 'Parking Area', category: 'site', categoryLabel: 'Site Photos' },
  { id: 'site_yard_n', label: 'Yard/Storage Area (North)', category: 'site', categoryLabel: 'Site Photos' },
  { id: 'site_yard_s', label: 'Yard/Storage Area (South)', category: 'site', categoryLabel: 'Site Photos' },
  { id: 'site_yard_e', label: 'Yard/Storage Area (East)', category: 'site', categoryLabel: 'Site Photos' },
  { id: 'site_yard_w', label: 'Yard/Storage Area (West)', category: 'site', categoryLabel: 'Site Photos' },
  // Street Scene
  { id: 'street_east', label: 'Street View Facing East', category: 'street', categoryLabel: 'Street Scene Photos' },
  { id: 'street_west', label: 'Street View Facing West', category: 'street', categoryLabel: 'Street Scene Photos' },
];

const CLASSIFICATION_PROMPT = `You are an expert commercial real estate appraiser analyzing property photos. 
Classify this photo into one of these categories and suggest the most appropriate slot:

EXTERIOR PHOTOS:
- ext_front: Front Elevation - Primary street-facing view of building
- ext_rear: Rear Elevation - Back of building
- ext_side_1: Side Elevation (Left) - Left side of building
- ext_side_2: Side Elevation (Right) - Right side of building
- ext_additional_1/2: Additional exterior views

INTERIOR PHOTOS:
- int_lobby: Lobby/Reception - Main entrance or waiting area
- int_office: Typical Office - Representative office space
- int_conference: Conference Room - Meeting spaces
- int_shop: Shop/Warehouse - Industrial/warehouse space
- int_bathroom: Bathroom - Restrooms
- int_mechanical: Mechanical Room - HVAC, electrical panels
- int_mezzanine: Mezzanine - Upper level/loft areas
- int_kitchen: Kitchen/Break Room - Food prep or break areas
- int_additional_1/2/3/4: Additional interior views

SITE PHOTOS:
- site_parking: Parking Area - Parking lots
- site_yard_n/s/e/w: Yard/Storage areas (by direction)

STREET SCENE PHOTOS:
- street_east: Street View Facing East
- street_west: Street View Facing West

Respond in JSON format:
{
  "primary_slot": "slot_id",
  "primary_confidence": 0-100,
  "primary_reasoning": "brief explanation",
  "alternatives": [
    {"slot": "slot_id", "confidence": 0-100}
  ]
}`;

interface ClassificationRequest {
  image: string; // base64 encoded image
  filename: string;
  usedSlots?: string[];
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
    const { image, filename, usedSlots = [] } = req.body as ClassificationRequest;

    if (!image || !filename) {
      return res.status(400).json({ error: 'Missing image or filename' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `${CLASSIFICATION_PROMPT}\n\nFilename: ${filename}` },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: 'low', // Use low detail for faster/cheaper classification
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }

    // Transform to our format
    const suggestions = [];
    
    // Add primary suggestion
    const primarySlot = PHOTO_SLOTS.find(s => s.id === result.primary_slot);
    if (primarySlot && !usedSlots.includes(primarySlot.id)) {
      suggestions.push({
        slotId: primarySlot.id,
        slotLabel: primarySlot.label,
        category: primarySlot.category,
        categoryLabel: primarySlot.categoryLabel,
        confidence: result.primary_confidence,
        reasoning: result.primary_reasoning,
      });
    }

    // Add alternatives
    if (result.alternatives && Array.isArray(result.alternatives)) {
      for (const alt of result.alternatives) {
        const altSlot = PHOTO_SLOTS.find(s => s.id === alt.slot);
        if (altSlot && !usedSlots.includes(altSlot.id)) {
          suggestions.push({
            slotId: altSlot.id,
            slotLabel: altSlot.label,
            category: altSlot.category,
            categoryLabel: altSlot.categoryLabel,
            confidence: alt.confidence,
            reasoning: alt.reasoning || 'Alternative suggestion',
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      suggestions,
    });

  } catch (error) {
    console.error('Photo classification error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Classification failed',
    });
  }
}
