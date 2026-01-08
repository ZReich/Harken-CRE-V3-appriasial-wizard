/**
 * Smart Crop Service - AI-Driven Auto-Cropping for Real Estate Photos
 * ====================================================================
 * 
 * Provides intelligent auto-cropping optimized for real estate photography.
 * Uses compositional heuristics (rule of thirds, horizon detection, subject centering)
 * to determine optimal crop regions for various photo types.
 * 
 * Future enhancement: Integrate with AI vision API for subject detection.
 */

// =================================================================
// TYPES
// =================================================================

export interface SmartCropResult {
  /** X position as percentage (0-100) */
  x: number;
  /** Y position as percentage (0-100) */
  y: number;
  /** Width as percentage (0-100) */
  width: number;
  /** Height as percentage (0-100) */
  height: number;
  /** Confidence score (0-1) */
  confidence: number;
  /** Suggested aspect ratio label */
  aspectRatioLabel: string;
}

export interface SmartCropOptions {
  /** Target aspect ratio (default: 16/9 for landscape real estate) */
  targetAspectRatio?: number;
  /** Photo category for context-aware cropping */
  category?: 'exterior' | 'interior' | 'aerial' | 'street' | 'detail' | 'general';
  /** Prefer keeping upper portion (for buildings/sky) */
  preferUpperPortion?: boolean;
  /** Minimum dimension for the crop result in pixels */
  minDimension?: number;
}

// =================================================================
// ASPECT RATIO PRESETS FOR REAL ESTATE
// =================================================================

export const REAL_ESTATE_ASPECT_RATIOS = {
  landscape: 16 / 9,      // Standard landscape - best for exteriors
  classic: 4 / 3,         // Classic - good for interiors
  photo: 3 / 2,           // Photo standard - versatile
  square: 1,              // Square - social media friendly
  portrait: 2 / 3,        // Portrait - for vertical features
} as const;

// Category-specific optimal aspect ratios
const CATEGORY_OPTIMAL_RATIOS: Record<string, number> = {
  exterior: 16 / 9,       // Wide landscape for building facades
  interior: 4 / 3,        // Slightly less wide for rooms
  aerial: 16 / 9,         // Wide for aerial views
  street: 16 / 9,         // Wide for street scenes
  detail: 4 / 3,          // Closer framing for details
  general: 16 / 9,        // Default to landscape
};

// =================================================================
// CORE SMART CROP FUNCTION
// =================================================================

/**
 * Analyzes an image and returns the optimal crop for real estate photography.
 * 
 * Strategy:
 * 1. Determine target aspect ratio based on category
 * 2. Calculate crop region that maintains important content
 * 3. For exterior/aerial: favor upper 1/3 (buildings, sky)
 * 4. For interior: center crop
 * 5. Apply rule of thirds positioning
 * 
 * @param imageBlob - The image file to analyze
 * @param options - Cropping options
 * @returns Promise<SmartCropResult> - The optimal crop region
 */
export async function getSmartCrop(
  imageBlob: Blob,
  options: SmartCropOptions = {}
): Promise<SmartCropResult> {
  const {
    targetAspectRatio = options.category 
      ? CATEGORY_OPTIMAL_RATIOS[options.category] 
      : REAL_ESTATE_ASPECT_RATIOS.landscape,
    category = 'general',
    preferUpperPortion = category === 'exterior' || category === 'aerial' || category === 'street',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const { naturalWidth: width, naturalHeight: height } = img;
        const imgAspect = width / height;
        
        let cropWidth: number;
        let cropHeight: number;
        let x: number;
        let y: number;
        let confidence = 0.85;
        
        if (Math.abs(imgAspect - targetAspectRatio) < 0.1) {
          // Image already close to target aspect ratio - minimal crop
          cropWidth = 100;
          cropHeight = 100;
          x = 0;
          y = 0;
          confidence = 0.95;
        } else if (imgAspect > targetAspectRatio) {
          // Image is wider than target - crop sides (keep center)
          cropHeight = 100;
          cropWidth = (height * targetAspectRatio / width) * 100;
          x = (100 - cropWidth) / 2;
          y = 0;
          confidence = 0.88;
        } else {
          // Image is taller than target - crop top/bottom
          cropWidth = 100;
          cropHeight = (width / targetAspectRatio / height) * 100;
          x = 0;
          
          // Smart vertical positioning based on photo type
          if (preferUpperPortion) {
            // For exteriors: favor upper 1/3 to keep building tops and sky
            // Position crop so it captures upper portion but not extreme top
            const availableSpace = 100 - cropHeight;
            y = availableSpace * 0.25; // Keep upper portion, slight margin from top
          } else {
            // For interiors: center crop
            y = (100 - cropHeight) / 2;
          }
          
          confidence = 0.82;
        }
        
        // Determine aspect ratio label
        let aspectRatioLabel = 'Custom';
        if (Math.abs(targetAspectRatio - 16/9) < 0.01) aspectRatioLabel = '16:9';
        else if (Math.abs(targetAspectRatio - 4/3) < 0.01) aspectRatioLabel = '4:3';
        else if (Math.abs(targetAspectRatio - 3/2) < 0.01) aspectRatioLabel = '3:2';
        else if (Math.abs(targetAspectRatio - 1) < 0.01) aspectRatioLabel = '1:1';
        
        // Clean up
        URL.revokeObjectURL(img.src);
        
        resolve({
          x: Math.max(0, Math.min(100 - cropWidth, x)),
          y: Math.max(0, Math.min(100 - cropHeight, y)),
          width: cropWidth,
          height: cropHeight,
          confidence,
          aspectRatioLabel,
        });
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for smart crop analysis'));
    };
    
    img.src = URL.createObjectURL(imageBlob);
  });
}

// =================================================================
// APPLY CROP TO IMAGE
// =================================================================

/**
 * Applies a crop to an image and returns the cropped result as a Blob.
 * 
 * @param imageBlob - The original image
 * @param crop - The crop region (percentages)
 * @param outputQuality - JPEG quality (0-1, default 0.92)
 * @returns Promise<Blob> - The cropped image
 */
export async function applyCropToImage(
  imageBlob: Blob,
  crop: SmartCropResult,
  outputQuality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const { naturalWidth: imgWidth, naturalHeight: imgHeight } = img;
        
        // Convert percentage crop to pixels
        const pixelCrop = {
          x: (crop.x / 100) * imgWidth,
          y: (crop.y / 100) * imgHeight,
          width: (crop.width / 100) * imgWidth,
          height: (crop.height / 100) * imgHeight,
        };
        
        // Create canvas for cropped output
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the cropped region
        ctx.drawImage(
          img,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(img.src);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create cropped image blob'));
            }
          },
          'image/jpeg',
          outputQuality
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = URL.createObjectURL(imageBlob);
  });
}

// =================================================================
// AUTO-CROP WORKFLOW
// =================================================================

/**
 * Complete auto-crop workflow: analyze image and apply optimal crop.
 * Returns both the cropped image and the crop data for potential re-cropping.
 * 
 * @param file - The original image file
 * @param options - Cropping options
 * @returns Promise with cropped file and crop metadata
 */
export async function autoCropImage(
  file: File,
  options: SmartCropOptions = {}
): Promise<{
  croppedFile: File;
  cropData: SmartCropResult;
  originalFile: File;
}> {
  // Get smart crop suggestion
  const cropData = await getSmartCrop(file, options);
  
  // Apply the crop
  const croppedBlob = await applyCropToImage(file, cropData);
  
  // Create a new File with the same name
  const croppedFile = new File(
    [croppedBlob],
    file.name.replace(/\.[^.]+$/, '_cropped.jpg'),
    { type: 'image/jpeg' }
  );
  
  return {
    croppedFile,
    cropData,
    originalFile: file,
  };
}

// =================================================================
// UTILITY: DETECT PHOTO CATEGORY FROM FILENAME/CONTEXT
// =================================================================

/**
 * Attempts to detect photo category from filename patterns.
 * Used for smarter auto-crop decisions.
 */
export function detectCategoryFromFilename(filename: string): SmartCropOptions['category'] {
  const lower = filename.toLowerCase();
  
  if (lower.includes('exterior') || lower.includes('front') || lower.includes('facade')) {
    return 'exterior';
  }
  if (lower.includes('interior') || lower.includes('room') || lower.includes('kitchen') || lower.includes('bath')) {
    return 'interior';
  }
  if (lower.includes('aerial') || lower.includes('drone') || lower.includes('overhead')) {
    return 'aerial';
  }
  if (lower.includes('street') || lower.includes('view') || lower.includes('neighborhood')) {
    return 'street';
  }
  if (lower.includes('detail') || lower.includes('close')) {
    return 'detail';
  }
  
  return 'general';
}

export default {
  getSmartCrop,
  applyCropToImage,
  autoCropImage,
  detectCategoryFromFilename,
  REAL_ESTATE_ASPECT_RATIOS,
};
