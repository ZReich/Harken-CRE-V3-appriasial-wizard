/**
 * Photo Classification Service
 * 
 * This service handles AI-powered photo classification for appraisal property photos.
 * Uses GPT-4o Vision API to analyze images and suggest appropriate photo slots.
 * 
 * Backend API Requirements:
 * - POST /api/photos/classify - AI photo classification
 * - Accepts: { image: base64, filename: string }
 * - Returns: JSON with slot suggestions and confidence scores
 */

// ==========================================
// TYPES
// ==========================================

export interface PhotoSlotInfo {
  id: string;
  label: string;
  category: string;
  categoryLabel: string;
  description: string;
  keywords: string[];
}

export interface PhotoClassificationSuggestion {
  slotId: string;
  slotLabel: string;
  category: string;
  categoryLabel: string;
  confidence: number; // 0-100
  reasoning: string;
}

export interface PhotoMetadata {
  hasGPS: boolean;
  latitude?: number;
  longitude?: number;
  compassDirection?: string;
  timestamp?: string;
  cameraModel?: string;
}

export interface PhotoClassificationResult {
  success: boolean;
  photoId: string;
  filename: string;
  suggestions: PhotoClassificationSuggestion[];
  metadata?: PhotoMetadata;
  processingTimeMs: number;
  error?: string;
}

export interface StagingPhoto {
  id: string;
  file: File;
  preview: string;
  filename: string;
  status: 'pending' | 'classifying' | 'classified' | 'error';
  classification?: PhotoClassificationResult;
  assignedSlot?: string;
}

// ==========================================
// PHOTO SLOT DEFINITIONS
// ==========================================

export const PHOTO_SLOTS: PhotoSlotInfo[] = [
  // Exterior
  { id: 'ext_front', label: 'Front Elevation', category: 'exterior', categoryLabel: 'Exterior', description: 'Primary street-facing view', keywords: ['front', 'facade', 'entrance', 'main', 'street-facing', 'entry'] },
  { id: 'ext_rear', label: 'Rear Elevation', category: 'exterior', categoryLabel: 'Exterior', description: 'Back of building', keywords: ['rear', 'back', 'behind', 'loading'] },
  { id: 'ext_side_1', label: 'Side Elevation (Left)', category: 'exterior', categoryLabel: 'Exterior', description: 'Left side of building', keywords: ['side', 'left', 'lateral'] },
  { id: 'ext_side_2', label: 'Side Elevation (Right)', category: 'exterior', categoryLabel: 'Exterior', description: 'Right side of building', keywords: ['side', 'right', 'lateral'] },
  { id: 'ext_additional_1', label: 'Additional Exterior', category: 'exterior', categoryLabel: 'Exterior', description: 'Extra exterior view', keywords: ['exterior', 'outside', 'building'] },
  { id: 'ext_additional_2', label: 'Additional Exterior', category: 'exterior', categoryLabel: 'Exterior', description: 'Extra exterior view', keywords: ['exterior', 'outside', 'building'] },
  
  // Interior
  { id: 'int_lobby', label: 'Lobby/Reception', category: 'interior', categoryLabel: 'Interior', description: 'Main entrance or reception area', keywords: ['lobby', 'reception', 'entrance', 'foyer', 'waiting'] },
  { id: 'int_office', label: 'Typical Office', category: 'interior', categoryLabel: 'Interior', description: 'Representative office space', keywords: ['office', 'desk', 'workstation', 'cubicle'] },
  { id: 'int_conference', label: 'Conference Room', category: 'interior', categoryLabel: 'Interior', description: 'Meeting/conference space', keywords: ['conference', 'meeting', 'board', 'table'] },
  { id: 'int_shop', label: 'Shop/Warehouse', category: 'interior', categoryLabel: 'Interior', description: 'Shop or warehouse space', keywords: ['shop', 'warehouse', 'storage', 'industrial', 'bay', 'dock'] },
  { id: 'int_bathroom', label: 'Bathroom', category: 'interior', categoryLabel: 'Interior', description: 'Representative bathroom', keywords: ['bathroom', 'restroom', 'toilet', 'lavatory', 'sink'] },
  { id: 'int_mechanical', label: 'Mechanical Room', category: 'interior', categoryLabel: 'Interior', description: 'HVAC or mechanical systems', keywords: ['mechanical', 'hvac', 'boiler', 'electrical', 'panel', 'utility'] },
  { id: 'int_mezzanine', label: 'Mezzanine', category: 'interior', categoryLabel: 'Interior', description: 'Mezzanine level if present', keywords: ['mezzanine', 'loft', 'upper', 'balcony'] },
  { id: 'int_kitchen', label: 'Kitchen/Break Room', category: 'interior', categoryLabel: 'Interior', description: 'Kitchen or break room area', keywords: ['kitchen', 'break', 'lunch', 'refrigerator', 'microwave', 'cafeteria'] },
  { id: 'int_additional_1', label: 'Additional Interior', category: 'interior', categoryLabel: 'Interior', description: 'Extra interior view', keywords: ['interior', 'inside', 'room'] },
  { id: 'int_additional_2', label: 'Additional Interior', category: 'interior', categoryLabel: 'Interior', description: 'Extra interior view', keywords: ['interior', 'inside', 'room'] },
  { id: 'int_additional_3', label: 'Additional Interior', category: 'interior', categoryLabel: 'Interior', description: 'Extra interior view', keywords: ['interior', 'inside', 'room'] },
  { id: 'int_additional_4', label: 'Additional Interior', category: 'interior', categoryLabel: 'Interior', description: 'Extra interior view', keywords: ['interior', 'inside', 'room'] },
  
  // Site
  { id: 'site_parking', label: 'Parking Area', category: 'site', categoryLabel: 'Site', description: 'Main parking lot or area', keywords: ['parking', 'lot', 'cars', 'asphalt', 'spaces'] },
  { id: 'site_yard_n', label: 'Yard/Storage (North)', category: 'site', categoryLabel: 'Site', description: 'Yard facing north', keywords: ['yard', 'storage', 'north', 'outdoor'] },
  { id: 'site_yard_s', label: 'Yard/Storage (South)', category: 'site', categoryLabel: 'Site', description: 'Yard facing south', keywords: ['yard', 'storage', 'south', 'outdoor'] },
  { id: 'site_yard_e', label: 'Yard/Storage (East)', category: 'site', categoryLabel: 'Site', description: 'Yard facing east', keywords: ['yard', 'storage', 'east', 'outdoor'] },
  { id: 'site_yard_w', label: 'Yard/Storage (West)', category: 'site', categoryLabel: 'Site', description: 'Yard facing west', keywords: ['yard', 'storage', 'west', 'outdoor'] },
  
  // Street
  { id: 'street_east', label: 'Street View Facing East', category: 'street', categoryLabel: 'Street Scene', description: 'View looking east from property', keywords: ['street', 'east', 'road', 'neighborhood'] },
  { id: 'street_west', label: 'Street View Facing West', category: 'street', categoryLabel: 'Street Scene', description: 'View looking west from property', keywords: ['street', 'west', 'road', 'neighborhood'] },
];

// ==========================================
// API CONFIGURATION
// ==========================================

// API Base URL - reserved for backend integration
// const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_PHOTO_AI !== 'false';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate a unique ID for a photo
 */
export function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert a File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create a preview URL for a file
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Extract EXIF metadata from an image file (simplified version)
 * In production, use a library like exif-js for full EXIF parsing
 */
export async function extractMetadata(file: File): Promise<PhotoMetadata> {
  // Basic metadata - in production, parse EXIF data
  return {
    hasGPS: false,
    timestamp: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
  };
}

// ==========================================
// MOCK CLASSIFICATION
// ==========================================

/**
 * Analyze filename for classification hints
 */
function analyzeFilename(filename: string): { slotId: string; confidence: number } | null {
  const lowerFilename = filename.toLowerCase();
  
  // Check each slot's keywords against filename
  for (const slot of PHOTO_SLOTS) {
    for (const keyword of slot.keywords) {
      if (lowerFilename.includes(keyword.toLowerCase())) {
        return {
          slotId: slot.id,
          confidence: 75 + Math.random() * 20, // 75-95% confidence for filename match
        };
      }
    }
  }
  
  return null;
}

/**
 * Generate mock classification based on filename patterns
 */
function generateMockClassification(
  _photoId: string,
  filename: string,
  usedSlots: Set<string>
): PhotoClassificationSuggestion[] {
  const suggestions: PhotoClassificationSuggestion[] = [];
  
  // First, try to match by filename
  const filenameMatch = analyzeFilename(filename);
  if (filenameMatch && !usedSlots.has(filenameMatch.slotId)) {
    const slot = PHOTO_SLOTS.find(s => s.id === filenameMatch.slotId)!;
    suggestions.push({
      slotId: slot.id,
      slotLabel: slot.label,
      category: slot.category,
      categoryLabel: slot.categoryLabel,
      confidence: filenameMatch.confidence,
      reasoning: `Filename "${filename}" matches "${slot.label}" keywords`,
    });
  }
  
  // Add some alternative suggestions
  const availableSlots = PHOTO_SLOTS.filter(s => 
    !usedSlots.has(s.id) && 
    !suggestions.some(sug => sug.slotId === s.id)
  );
  
  // Shuffle and pick up to 2 alternatives
  const shuffled = availableSlots.sort(() => Math.random() - 0.5);
  const alternatives = shuffled.slice(0, 2);
  
  for (const slot of alternatives) {
    suggestions.push({
      slotId: slot.id,
      slotLabel: slot.label,
      category: slot.category,
      categoryLabel: slot.categoryLabel,
      confidence: 30 + Math.random() * 30, // 30-60% for alternatives
      reasoning: 'Alternative suggestion based on available slots',
    });
  }
  
  // If no suggestions yet, add random ones
  if (suggestions.length === 0 && availableSlots.length > 0) {
    const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
    suggestions.push({
      slotId: randomSlot.id,
      slotLabel: randomSlot.label,
      category: randomSlot.category,
      categoryLabel: randomSlot.categoryLabel,
      confidence: 40 + Math.random() * 20,
      reasoning: 'Best available slot based on property photo analysis',
    });
  }
  
  // Sort by confidence descending
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ==========================================
// REAL AI CLASSIFICATION (GPT-4o Vision)
// ==========================================

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

async function classifyWithGPT4o(
  base64Image: string,
  filename: string
): Promise<PhotoClassificationSuggestion[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `${CLASSIFICATION_PROMPT}\n\nFilename: ${filename}` },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'low', // Use low detail for faster/cheaper classification
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  const suggestions: PhotoClassificationSuggestion[] = [];
  
  // Add primary suggestion
  const primarySlot = PHOTO_SLOTS.find(s => s.id === parsed.primary_slot);
  if (primarySlot) {
    suggestions.push({
      slotId: primarySlot.id,
      slotLabel: primarySlot.label,
      category: primarySlot.category,
      categoryLabel: primarySlot.categoryLabel,
      confidence: parsed.primary_confidence,
      reasoning: parsed.primary_reasoning,
    });
  }
  
  // Add alternatives
  if (parsed.alternatives) {
    for (const alt of parsed.alternatives) {
      const altSlot = PHOTO_SLOTS.find(s => s.id === alt.slot);
      if (altSlot) {
        suggestions.push({
          slotId: altSlot.id,
          slotLabel: altSlot.label,
          category: altSlot.category,
          categoryLabel: altSlot.categoryLabel,
          confidence: alt.confidence,
          reasoning: 'Alternative suggestion',
        });
      }
    }
  }
  
  return suggestions;
}

// ==========================================
// MAIN CLASSIFICATION FUNCTION
// ==========================================

/**
 * Classify a single photo
 */
export async function classifyPhoto(
  file: File,
  photoId: string,
  usedSlots: Set<string> = new Set()
): Promise<PhotoClassificationResult> {
  const startTime = Date.now();
  
  try {
    let suggestions: PhotoClassificationSuggestion[];
    let metadata: PhotoMetadata | undefined;
    
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      suggestions = generateMockClassification(photoId, file.name, usedSlots);
      metadata = await extractMetadata(file);
    } else {
      // Real AI classification
      const base64 = await fileToBase64(file);
      suggestions = await classifyWithGPT4o(base64, file.name);
      metadata = await extractMetadata(file);
      
      // Filter out already used slots
      suggestions = suggestions.filter(s => !usedSlots.has(s.slotId));
    }
    
    return {
      success: true,
      photoId,
      filename: file.name,
      suggestions,
      metadata,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      photoId,
      filename: file.name,
      suggestions: [],
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Classification failed',
    };
  }
}

/**
 * Classify multiple photos in parallel
 */
export async function classifyPhotos(
  files: File[],
  existingAssignments: Record<string, string> = {}
): Promise<PhotoClassificationResult[]> {
  const usedSlots = new Set(Object.values(existingAssignments));
  const results: PhotoClassificationResult[] = [];
  
  // Process in parallel with a concurrency limit
  const CONCURRENCY = 3;
  const queue = [...files];
  const processing: Promise<void>[] = [];
  
  const processNext = async () => {
    while (queue.length > 0) {
      const file = queue.shift()!;
      const photoId = generatePhotoId();
      
      const result = await classifyPhoto(file, photoId, usedSlots);
      results.push(result);
      
      // Mark the top suggestion as used
      if (result.suggestions.length > 0) {
        usedSlots.add(result.suggestions[0].slotId);
      }
    }
  };
  
  // Start concurrent workers
  for (let i = 0; i < Math.min(CONCURRENCY, files.length); i++) {
    processing.push(processNext());
  }
  
  await Promise.all(processing);
  
  return results;
}

/**
 * Create a StagingPhoto object from a File
 */
export function createStagingPhoto(file: File): StagingPhoto {
  return {
    id: generatePhotoId(),
    file,
    preview: createPreviewUrl(file),
    filename: file.name,
    status: 'pending',
  };
}

/**
 * Get slot info by ID
 */
export function getSlotInfo(slotId: string): PhotoSlotInfo | undefined {
  return PHOTO_SLOTS.find(s => s.id === slotId);
}

/**
 * Get all slots for a category
 */
export function getSlotsByCategory(category: string): PhotoSlotInfo[] {
  return PHOTO_SLOTS.filter(s => s.category === category);
}

/**
 * Validate if a file is an acceptable image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const maxSize = 20 * 1024 * 1024; // 20MB
  
  if (!acceptedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}. Accepted: JPG, PNG, WebP, HEIC` };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 20MB` };
  }
  
  return { valid: true };
}

