/**
 * PhotoReferencePanel Component
 * 
 * A floating panel that shows relevant photos based on the active editing section.
 * Auto-filters photos by category, with expandable section for other photos.
 * Includes AI material detection with suggestion chips.
 * 
 * Designed for use in inventory components (ExteriorFeaturesInventory, 
 * MechanicalSystemsInventory, etc.) to let users reference photos while entering data.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { 
  Camera, 
  X, 
  Sparkles, 
  ImageOff, 
  ChevronDown,
  ChevronRight,
  Maximize2,
  Upload,
  Loader2,
  Check,
  XCircle,
  Cpu,
  Zap,
} from 'lucide-react';
import { SECTION_PHOTO_MAPPING, formatSectionName } from '../constants/photoCategories';
import { analyzePhotoForMaterials, type DetectedMaterial, type PhotoAnalysisResult } from '../services/aiService';
import type { PhotoData } from '../types';

interface PhotoReferencePanelProps {
  /** Current editing section (e.g., 'mechanical_hvac', 'exterior_features') */
  activeSection: string;
  /** All uploaded photos mapped by slot ID */
  photos: Record<string, PhotoData | null>;
  /** Close handler */
  onClose: () => void;
  /** Optional: Navigate to photo upload */
  onUploadPhotos?: () => void;
  /** Optional: Handler when user applies a detected material */
  onApplyMaterial?: (material: DetectedMaterial) => void;
  /** Optional: Custom class name */
  className?: string;
}

/**
 * Thumbnail component for photo display with analyze button
 */
function PhotoThumbnail({ 
  photo, 
  slotId,
  slotLabel, 
  isSecondary = false,
  isAnalyzing = false,
  hasAnalysis = false,
  onExpand,
  onAnalyze,
}: { 
  photo: PhotoData; 
  slotId: string;
  slotLabel?: string;
  isSecondary?: boolean; 
  isAnalyzing?: boolean;
  hasAnalysis?: boolean;
  onExpand?: () => void;
  onAnalyze?: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onExpand}
        className={`relative w-full overflow-hidden rounded-lg transition-all ${
          isSecondary 
            ? 'opacity-70 hover:opacity-100' 
            : 'hover:scale-105'
        }`}
      >
        <img 
          src={photo.preview} 
          alt={slotLabel || 'Photo'} 
          className="w-full h-16 object-cover"
        />
        {slotLabel && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
            {slotLabel}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Analysis indicator */}
        {hasAnalysis && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-[#0da1c7] rounded-full flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        
        {/* Loading overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </button>
      
      {/* Analyze button overlay */}
      {!hasAnalysis && !isAnalyzing && onAnalyze && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze();
          }}
          className="absolute top-1 right-1 p-1 bg-[#0da1c7] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          title="Analyze with AI"
        >
          <Cpu className="w-2.5 h-2.5 text-white" />
        </button>
      )}
    </div>
  );
}

/**
 * Material suggestion chip with apply/dismiss actions
 */
function MaterialChip({ 
  material, 
  onApply, 
  onDismiss 
}: { 
  material: DetectedMaterial; 
  onApply: () => void; 
  onDismiss: () => void;
}) {
  const conditionColors: Record<string, string> = {
    excellent: 'text-green-600',
    good: 'text-lime-600',
    average: 'text-gray-600',
    fair: 'text-amber-600',
    poor: 'text-red-600',
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800 truncate">{material.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              material.confidence >= 85 
                ? 'bg-green-100 text-green-700' 
                : material.confidence >= 70 
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {material.confidence}%
            </span>
          </div>
          {material.details && (
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{material.details}</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            {material.suggestedAge !== undefined && (
              <span>Age: ~{material.suggestedAge} yrs</span>
            )}
            {material.suggestedCondition && (
              <span className={conditionColors[material.suggestedCondition] || 'text-gray-600'}>
                {material.suggestedCondition.charAt(0).toUpperCase() + material.suggestedCondition.slice(1)}
              </span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onApply}
            className="p-1.5 rounded-md bg-[#0da1c7]/10 text-[#0da1c7] hover:bg-[#0da1c7]/20 transition-colors"
            title="Apply this material"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-md bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Slot label mapping for photo IDs
 */
const SLOT_LABELS: Record<string, string> = {
  ext_front: 'Front Elevation',
  ext_rear: 'Rear Elevation',
  ext_side_1: 'Side (Left)',
  ext_side_2: 'Side (Right)',
  ext_roof: 'Roof',
  ext_additional_1: 'Exterior Add\'l 1',
  ext_additional_2: 'Exterior Add\'l 2',
  int_lobby: 'Lobby',
  int_office: 'Office',
  int_conference: 'Conference',
  int_shop: 'Shop/Warehouse',
  int_bathroom: 'Bathroom',
  int_mechanical: 'Mechanical Room',
  int_hvac: 'HVAC Equipment',
  int_electrical: 'Electrical',
  int_plumbing: 'Plumbing',
  int_mezzanine: 'Mezzanine',
  int_kitchen: 'Kitchen/Break',
  site_parking: 'Parking',
  site_yard_n: 'Yard (North)',
  site_yard_s: 'Yard (South)',
  site_yard_e: 'Yard (East)',
  site_yard_w: 'Yard (West)',
  site_landscape: 'Landscaping',
  street_east: 'Street (East)',
  street_west: 'Street (West)',
};

function getSlotLabel(slotId: string): string {
  // Try exact match first
  if (SLOT_LABELS[slotId]) return SLOT_LABELS[slotId];
  
  // Try prefix match
  for (const [key, label] of Object.entries(SLOT_LABELS)) {
    if (slotId.startsWith(key)) return label;
  }
  
  // Fallback to formatted ID
  return slotId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function PhotoReferencePanel({ 
  activeSection, 
  photos, 
  onClose,
  onUploadPhotos,
  onApplyMaterial,
  className = '',
}: PhotoReferencePanelProps) {
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [showOtherPhotos, setShowOtherPhotos] = useState(false);
  
  // AI Analysis state
  const [analyzingPhotos, setAnalyzingPhotos] = useState<Set<string>>(new Set());
  const [analysisResults, setAnalysisResults] = useState<Record<string, PhotoAnalysisResult>>({});
  const [dismissedMaterials, setDismissedMaterials] = useState<Set<string>>(new Set());
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  
  // Get photo slot IDs that match the active section
  const relevantPhotoIds = useMemo(() => {
    return SECTION_PHOTO_MAPPING[activeSection] || [];
  }, [activeSection]);
  
  // Filter photos into context-relevant and other
  const { contextPhotos, otherPhotos } = useMemo(() => {
    const context: Array<{ slotId: string; photo: PhotoData }> = [];
    const other: Array<{ slotId: string; photo: PhotoData }> = [];
    
    Object.entries(photos).forEach(([slotId, photo]) => {
      if (!photo) return;
      
      const isRelevant = relevantPhotoIds.some(prefix => slotId.startsWith(prefix));
      
      if (isRelevant) {
        context.push({ slotId, photo });
      } else {
        other.push({ slotId, photo });
      }
    });
    
    return { contextPhotos: context, otherPhotos: other };
  }, [photos, relevantPhotoIds]);
  
  // Get all detected materials across analyzed photos (not dismissed)
  const detectedMaterials = useMemo(() => {
    const materials: Array<DetectedMaterial & { photoId: string }> = [];
    
    Object.entries(analysisResults).forEach(([photoId, result]) => {
      result.materials.forEach(material => {
        if (!dismissedMaterials.has(material.id)) {
          materials.push({ ...material, photoId });
        }
      });
    });
    
    // Sort by confidence descending
    return materials.sort((a, b) => b.confidence - a.confidence);
  }, [analysisResults, dismissedMaterials]);
  
  // Analyze a photo
  const handleAnalyzePhoto = useCallback(async (slotId: string, photo: PhotoData) => {
    if (analyzingPhotos.has(slotId)) return;
    
    setAnalyzingPhotos(prev => new Set([...prev, slotId]));
    
    try {
      const result = await analyzePhotoForMaterials(photo.preview, slotId);
      setAnalysisResults(prev => ({
        ...prev,
        [slotId]: result,
      }));
    } catch (error) {
      console.error('Photo analysis failed:', error);
    } finally {
      setAnalyzingPhotos(prev => {
        const next = new Set(prev);
        next.delete(slotId);
        return next;
      });
    }
  }, [analyzingPhotos]);
  
  // Analyze all context photos
  const handleAnalyzeAll = useCallback(async () => {
    const toAnalyze = contextPhotos.filter(({ slotId }) => !analysisResults[slotId]);
    
    for (const { slotId, photo } of toAnalyze) {
      await handleAnalyzePhoto(slotId, photo);
    }
  }, [contextPhotos, analysisResults, handleAnalyzePhoto]);
  
  // Apply a material suggestion
  const handleApplyMaterial = useCallback((material: DetectedMaterial) => {
    if (onApplyMaterial) {
      onApplyMaterial(material);
    }
    // Dismiss after applying
    setDismissedMaterials(prev => new Set([...prev, material.id]));
  }, [onApplyMaterial]);
  
  // Dismiss a material suggestion
  const handleDismissMaterial = useCallback((materialId: string) => {
    setDismissedMaterials(prev => new Set([...prev, materialId]));
  }, []);
  
  const hasUnanalyzedPhotos = contextPhotos.some(({ slotId }) => !analysisResults[slotId]);
  const isAnalyzingAny = analyzingPhotos.size > 0;
  
  return (
    <>
      {/* Main Panel */}
      <div className={`fixed right-4 top-1/4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[70vh] flex flex-col ${className}`}>
        {/* Header with context indicator */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#0da1c7] to-[#0b8dad] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-4 h-4" />
            <span className="font-semibold text-sm">Reference Photos</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Auto-context indicator */}
        <div className="px-3 py-2 bg-[#0da1c7]/10 border-b border-[#0da1c7]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0da1c7]" />
            <span className="text-xs font-medium text-[#0da1c7]">
              {formatSectionName(activeSection)}
            </span>
          </div>
          
          {/* Analyze All button */}
          {contextPhotos.length > 0 && hasUnanalyzedPhotos && (
            <button
              onClick={handleAnalyzeAll}
              disabled={isAnalyzingAny}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-[#0da1c7] text-white rounded-md hover:bg-[#0b8dad] transition-colors disabled:opacity-50"
            >
              {isAnalyzingAny ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  Analyze All
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Relevant photos section */}
          {contextPhotos.length > 0 ? (
            <div className="p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                Matching Photos ({contextPhotos.length})
              </div>
              <div className="grid grid-cols-3 gap-2">
                {contextPhotos.map(({ slotId, photo }) => (
                  <PhotoThumbnail 
                    key={slotId} 
                    photo={photo}
                    slotId={slotId}
                    slotLabel={getSlotLabel(slotId)}
                    isAnalyzing={analyzingPhotos.has(slotId)}
                    hasAnalysis={!!analysisResults[slotId]}
                    onExpand={() => setExpandedPreview(slotId)}
                    onAnalyze={() => handleAnalyzePhoto(slotId, photo)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="p-6 text-center">
              <ImageOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-2">No photos uploaded for this section</p>
              {onUploadPhotos && (
                <button 
                  onClick={onUploadPhotos}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0da1c7] font-medium hover:underline"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photos
                </button>
              )}
            </div>
          )}
          
          {/* AI Detected Materials Section */}
          {detectedMaterials.length > 0 && (
            <div className="border-t border-slate-100">
              <button
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-[#0da1c7] bg-[#0da1c7]/5 hover:bg-[#0da1c7]/10 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Detected Materials ({detectedMaterials.length})
                </div>
                {showAISuggestions ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              
              {showAISuggestions && (
                <div className="p-3 pt-2 space-y-2">
                  {detectedMaterials.slice(0, 5).map((material) => (
                    <MaterialChip
                      key={material.id}
                      material={material}
                      onApply={() => handleApplyMaterial(material)}
                      onDismiss={() => handleDismissMaterial(material.id)}
                    />
                  ))}
                  {detectedMaterials.length > 5 && (
                    <p className="text-[10px] text-center text-slate-400">
                      +{detectedMaterials.length - 5} more suggestions
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Other photos - collapsed by default */}
          {otherPhotos.length > 0 && (
            <div className="border-t border-slate-100">
              <button
                onClick={() => setShowOtherPhotos(!showOtherPhotos)}
                className="w-full px-3 py-2 text-xs text-slate-500 cursor-pointer hover:bg-slate-50 flex items-center gap-1 transition-colors"
              >
                {showOtherPhotos ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                Other Photos ({otherPhotos.length})
              </button>
              {showOtherPhotos && (
                <div className="p-3 pt-0 grid grid-cols-3 gap-2">
                  {otherPhotos.map(({ slotId, photo }) => (
                    <PhotoThumbnail 
                      key={slotId} 
                      photo={photo}
                      slotId={slotId}
                      slotLabel={getSlotLabel(slotId)}
                      isSecondary
                      onExpand={() => setExpandedPreview(slotId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Expanded Preview Modal */}
      {expandedPreview && photos[expandedPreview] && (
        <div 
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center"
          onClick={() => setExpandedPreview(null)}
        >
          <div 
            className="max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={photos[expandedPreview]!.preview} 
              alt={getSlotLabel(expandedPreview)} 
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="bg-black/90 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{getSlotLabel(expandedPreview)}</div>
                {photos[expandedPreview]?.caption && (
                  <div className="text-sm text-white/70">{photos[expandedPreview]!.caption}</div>
                )}
                {analysisResults[expandedPreview] && (
                  <div className="text-xs text-[#0da1c7] mt-1">
                    {analysisResults[expandedPreview].generalDescription}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setExpandedPreview(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PhotoReferencePanel;
