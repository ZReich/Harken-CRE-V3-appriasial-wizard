import { useState, useCallback, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCcw, Maximize2 } from 'lucide-react';

/**
 * PhotoCropModal - Provides image cropping functionality for property photos.
 * Supports common aspect ratios used in appraisal reports.
 */

// Preset aspect ratios for appraisal photos
const ASPECT_RATIOS = [
  { label: '16:9', value: 16 / 9, description: 'Landscape (Standard)' },
  { label: '4:3', value: 4 / 3, description: 'Landscape (Classic)' },
  { label: '3:2', value: 3 / 2, description: 'Photo Standard' },
  { label: '1:1', value: 1, description: 'Square' },
  { label: '2:3', value: 2 / 3, description: 'Portrait' },
  { label: 'Free', value: undefined, description: 'Free Form' },
] as const;

interface PhotoCropModalProps {
  /** The image to crop - can be a URL, data URL, or blob URL */
  image: string;
  /** Initial aspect ratio (e.g., 16/9 for horizontal) */
  initialAspectRatio?: number;
  /** Callback when cropping is complete */
  onCrop: (croppedImage: Blob, cropData: CropResult) => void;
  /** Callback when modal is cancelled */
  onCancel: () => void;
  /** Modal title */
  title?: string;
  /** Show aspect ratio selector */
  showAspectRatioSelector?: boolean;
}

interface CropResult {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number | undefined;
}

// Helper function to center crop with aspect ratio
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined
): Crop {
  if (!aspect) {
    // Default to a centered 80% crop for free-form
    return {
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    };
  }
  
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function PhotoCropModal({
  image,
  initialAspectRatio = 16 / 9,
  onCrop,
  onCancel,
  title = 'Crop Photo',
  showAspectRatioSelector = true,
}: PhotoCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(initialAspectRatio);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // When image loads, initialize the crop
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((newRatio: number | undefined) => {
    setAspectRatio(newRatio);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, newRatio));
    }
  }, []);

  // Reset crop to center
  const handleReset = useCallback(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  }, [aspectRatio]);

  // Maximize crop to fill the image
  const handleMaximize = useCallback(() => {
    setCrop({
      unit: '%',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  }, []);

  // Create cropped image blob
  const createCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Scale to the actual image dimensions
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the crop size
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Enable high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped portion
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop]);

  // Handle apply crop
  const handleApplyCrop = useCallback(async () => {
    if (!completedCrop) return;

    setIsProcessing(true);
    try {
      const blob = await createCroppedImage();
      if (blob) {
        onCrop(blob, {
          x: completedCrop.x,
          y: completedCrop.y,
          width: completedCrop.width,
          height: completedCrop.height,
          aspectRatio,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, createCroppedImage, onCrop, aspectRatio]);

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-surface-1 dark:bg-elevation-1 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-slate-50 to-white dark:from-elevation-1 dark:to-elevation-1">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drag to reposition, resize handles to adjust
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-elevation-3 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        {showAspectRatioSelector && (
          <div className="px-6 py-3 border-b border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-elevation-1/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2">
                Aspect Ratio:
              </span>
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => handleAspectRatioChange(ratio.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    aspectRatio === ratio.value || (ratio.value === undefined && aspectRatio === undefined)
                      ? 'bg-harken-blue text-white shadow-sm'
                      : 'bg-white dark:bg-elevation-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-harken-gray hover:bg-slate-100 dark:hover:bg-harken-gray'
                  }`}
                  title={ratio.description}
                >
                  {ratio.label}
                </button>
              ))}
              
              {/* Reset and Maximize buttons */}
              <div className="flex-1" />
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-elevation-1 transition-colors"
                title="Reset to center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleMaximize}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-elevation-1 transition-colors"
                title="Maximize crop area"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Crop Area */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100 dark:bg-[#0a0a0a] flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              src={image}
              alt="Crop preview"
              className="max-h-[60vh] max-w-full object-contain"
              onLoad={onImageLoad}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-elevation-1/50">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {completedCrop && (
              <span>
                Crop size: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-elevation-1 border border-slate-200 dark:border-harken-gray rounded-lg hover:bg-slate-50 dark:hover:bg-harken-gray transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              disabled={!completedCrop || isProcessing}
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-accent-teal-mint to-[#0da1c7] rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoCropModal;
