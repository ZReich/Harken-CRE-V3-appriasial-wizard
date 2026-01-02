import { useState, useMemo } from 'react';
import {
  ChevronDown,
  Check,
  X,
  GripVertical,
  Sparkles,
  AlertCircle,
  Loader2,
  Trash2,
  Zap
} from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import type { StagingPhoto, DetectedBuildingComponent } from '../types';
import VisualSlotPicker from './VisualSlotPicker';
import PhotoComponentSuggestions from './PhotoComponentSuggestions';

interface PhotoStagingTrayProps {
  onAssignPhoto: (photo: StagingPhoto, slotId: string) => void;
  onAcceptAllSuggestions: () => void;
  usedSlots: Set<string>;
  onDragStart?: (photo: StagingPhoto) => void;
  onDragEnd?: () => void;
  className?: string;
  /** Callback when user accepts a detected component from photo analysis */
  onAcceptDetectedComponent?: (component: DetectedBuildingComponent) => void;
  /** Set of component type IDs already in the inventory */
  existingComponentTypeIds?: Set<string>;
}

// Confidence color coding
function getConfidenceColor(confidence: number): { bg: string; text: string; border: string; glow: string } {
  if (confidence >= 80) return {
    bg: 'bg-gradient-to-br from-green-100 to-emerald-100',
    text: 'text-green-700',
    border: 'border-green-300',
    glow: 'shadow-green-200'
  };
  if (confidence >= 50) return {
    bg: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    glow: 'shadow-amber-200'
  };
  return {
    bg: 'bg-gradient-to-br from-red-100 to-orange-100',
    text: 'text-red-700',
    border: 'border-red-300',
    glow: 'shadow-red-200'
  };
}

// Individual photo card in the staging tray
function StagingPhotoCard({
  photo,
  onAssign,
  onRemove,
  usedSlots,
  onDragStart,
  onDragEnd,
}: {
  photo: StagingPhoto;
  onAssign: (slotId: string) => void;
  onRemove: () => void;
  usedSlots: Set<string>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const topSuggestion = photo.suggestions?.[0];
  const isSlotAvailable = topSuggestion && !usedSlots.has(topSuggestion.slotId);
  const confidenceColors = topSuggestion ? getConfidenceColor(topSuggestion.confidence) : null;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'staging-photo',
      photoId: photo.id,
      preview: photo.preview,
    }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const handleAcceptSuggestion = () => {
    if (topSuggestion && isSlotAvailable) {
      onAssign(topSuggestion.slotId);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        relative bg-white dark:bg-slate-800 border-2 rounded-xl overflow-hidden
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg hover:scale-[1.02]'}
        ${photo.status === 'error' ? 'border-red-300' : 'border-gray-200'}
        ${confidenceColors ? `shadow-md ${confidenceColors.glow}` : 'shadow-sm'}
      `}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={photo.preview}
          alt={photo.filename}
          className="w-full h-full object-cover"
        />

        {/* Status Overlay */}
        {photo.status === 'classifying' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <div className="absolute inset-0 bg-[#0da1c7] rounded-full animate-ping opacity-50" />
                <Loader2 className="w-8 h-8 text-white animate-spin relative z-10" />
              </div>
              <span className="text-[10px] text-white/80 font-medium">Analyzing</span>
            </div>
          </div>
        )}

        {/* Drag Handle */}
        <div className="absolute top-1.5 left-1.5 p-1.5 bg-black/40 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 p-1.5 bg-black/40 backdrop-blur-sm hover:bg-red-500 rounded-lg text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Confidence Badge */}
        {photo.status === 'classified' && topSuggestion && (
          <div className={`
            absolute bottom-1.5 left-1.5 right-1.5 px-2 py-1 rounded-lg
            backdrop-blur-sm flex items-center justify-between
            ${topSuggestion.confidence >= 80
              ? 'bg-green-500/90 text-white'
              : topSuggestion.confidence >= 50
                ? 'bg-amber-500/90 text-white'
                : 'bg-gray-800/80 text-white'
            }
          `}>
            <span className="text-[10px] font-bold truncate">{topSuggestion.slotLabel}</span>
            <span className="text-[9px] font-medium opacity-80">{Math.round(topSuggestion.confidence)}%</span>
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="p-2.5 space-y-2">
        {/* Filename */}
        <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate" title={photo.filename}>
          {photo.filename}
        </p>

        {/* Status / Suggestion */}
        {photo.status === 'classifying' && (
          <div className="flex items-center gap-1.5 text-xs text-[#0da1c7]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-medium">AI is analyzing...</span>
          </div>
        )}

        {photo.status === 'error' && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-red-600 mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Classification failed</span>
            </div>

            {/* Manual assignment picker for failed classifications */}
            <VisualSlotPicker
              value={undefined}
              onChange={(slotId) => onAssign(slotId)}
              usedSlots={usedSlots}
              suggestedSlotId={undefined}
              photoPreview={photo.preview}
            />
          </>
        )}

        {photo.status === 'classified' && (
          <>
            {/* Visual Slot Picker */}
            <VisualSlotPicker
              value={undefined}
              onChange={(slotId) => onAssign(slotId)}
              usedSlots={usedSlots}
              suggestedSlotId={topSuggestion?.slotId}
              photoPreview={photo.preview}
            />

            {/* Quick Accept Button */}
            {isSlotAvailable && topSuggestion && (
              <button
                onClick={handleAcceptSuggestion}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 
                  bg-gradient-to-r from-[#0da1c7] to-[#4db8d1] hover:from-[#0b8ba8] hover:to-[#3da8c1]
                  text-white text-xs font-bold rounded-lg transition-all duration-200
                  shadow-lg shadow-[#0da1c7]/30 hover:shadow-[#0da1c7]/50 hover:scale-[1.02]"
              >
                <Check className="w-3.5 h-3.5" />
                Accept AI Suggestion
              </button>
            )}

            {!isSlotAvailable && topSuggestion && (
              <p className="text-[10px] text-amber-600 text-center bg-amber-50 rounded-lg px-2 py-1">
                Suggested slot in use - select another
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Section to display detected building components from classified photos
function DetectedComponentsSection({
  classifiedPhotos,
  onAcceptComponent,
  existingComponentTypeIds,
}: {
  classifiedPhotos: StagingPhoto[];
  onAcceptComponent?: (component: DetectedBuildingComponent) => void;
  existingComponentTypeIds?: Set<string>;
}) {
  // Collect all detected components from all classified photos
  const allDetectedComponents = useMemo(() => {
    const components: DetectedBuildingComponent[] = [];
    const seenIds = new Set<string>();

    for (const photo of classifiedPhotos) {
      if (photo.detectedComponents) {
        for (const component of photo.detectedComponents) {
          // Dedupe by component type ID
          if (!seenIds.has(component.componentTypeId)) {
            seenIds.add(component.componentTypeId);
            components.push(component);
          }
        }
      }
    }

    return components;
  }, [classifiedPhotos]);

  // Don't render if no components detected
  if (allDetectedComponents.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <PhotoComponentSuggestions
        detectedComponents={allDetectedComponents}
        photoFilename={`${classifiedPhotos.length} photos analyzed`}
        compact={true}
        onAcceptComponent={onAcceptComponent}
        existingComponentTypeIds={existingComponentTypeIds}
      />
    </div>
  );
}

export default function PhotoStagingTray({
  onAssignPhoto,
  onAcceptAllSuggestions,
  usedSlots,
  onDragStart,
  onDragEnd,
  className = '',
  onAcceptDetectedComponent,
  existingComponentTypeIds,
}: PhotoStagingTrayProps) {
  const { getStagingPhotos, removeStagingPhoto, clearStagingPhotos } = useWizard();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAcceptingAll, setIsAcceptingAll] = useState(false);

  const stagingPhotos = getStagingPhotos();
  const unassignedPhotos = stagingPhotos.filter(p => !p.assignedSlot);
  const classifiedPhotos = unassignedPhotos.filter(p => p.status === 'classified');
  const processingPhotos = unassignedPhotos.filter(p => p.status === 'classifying' || p.status === 'pending');

  // Count how many can be auto-assigned
  const autoAssignableCount = classifiedPhotos.filter(p => {
    const topSuggestion = p.suggestions?.[0];
    return topSuggestion && !usedSlots.has(topSuggestion.slotId);
  }).length;

  if (unassignedPhotos.length === 0) {
    return null;
  }

  const handleRemovePhoto = (photoId: string) => {
    removeStagingPhoto(photoId);
  };

  const handleAssignPhoto = (photo: StagingPhoto, slotId: string) => {
    onAssignPhoto(photo, slotId);
  };

  const handleAcceptAll = async () => {
    setIsAcceptingAll(true);
    await onAcceptAllSuggestions();
    setTimeout(() => setIsAcceptingAll(false), 500);
  };

  const handlePhotoDragStart = (photo: StagingPhoto) => {
    onDragStart?.(photo);
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50
      dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900
      border-2 border-amber-200/50 dark:border-slate-700
      shadow-xl shadow-amber-200/20 dark:shadow-black/20
      ${className}
    `}>
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="relative flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/30 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Count Badge */}
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30">
              <span className="text-lg font-black">{unassignedPhotos.length}</span>
            </div>
            {processingPhotos.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0da1c7] rounded-full animate-pulse flex items-center justify-center">
                <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg text-amber-900 dark:text-amber-400">Photos Ready to Assign</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500/80">
              {processingPhotos.length > 0
                ? `${processingPhotos.length} analyzing with AI...`
                : `${classifiedPhotos.length} classified - use dropdown or drag to assign`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Batch Actions */}
          {!isCollapsed && classifiedPhotos.length > 0 && (
            <>
              {autoAssignableCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptAll();
                  }}
                  disabled={isAcceptingAll}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 
                    bg-gradient-to-r from-[#0da1c7] to-[#4db8d1] 
                    hover:from-[#0b8ba8] hover:to-[#3da8c1]
                    text-white text-sm font-bold rounded-xl transition-all duration-300
                    shadow-lg shadow-[#0da1c7]/30 hover:shadow-[#0da1c7]/50 hover:scale-105
                    ${isAcceptingAll ? 'animate-pulse' : ''}
                  `}
                >
                  {isAcceptingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Accept All ({autoAssignableCount})
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearStagingPhotos();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-600 transition-all hover:shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </>
          )}

          {/* Collapse Toggle */}
          <div className={`
            p-2 rounded-lg bg-white/50 dark:bg-slate-700/50 transition-transform duration-300
            ${isCollapsed ? '' : 'rotate-180'}
          `}>
            <ChevronDown className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {!isCollapsed && (
        <div className="relative px-5 pb-5">
          {/* Helper Text - At top for visibility */}
          <div className="mb-4 p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl border border-amber-200/50 dark:border-slate-600/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-400">Three ways to assign photos:</p>
                <ul className="mt-1 text-xs text-amber-700 dark:text-amber-500 space-y-0.5">
                  <li><strong>1. Accept All</strong> - Use AI suggestions for all photos at once</li>
                  <li><strong>2. Visual Picker</strong> - Click dropdown to see all slots in a beautiful grid</li>
                  <li><strong>3. Drag & Drop</strong> - Drag photos to slots (panel appears when dragging)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Photo Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {unassignedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <StagingPhotoCard
                  photo={photo}
                  onAssign={(slotId) => handleAssignPhoto(photo, slotId)}
                  onRemove={() => handleRemovePhoto(photo.id)}
                  usedSlots={usedSlots}
                  onDragStart={() => handlePhotoDragStart(photo)}
                  onDragEnd={onDragEnd}
                />
              </div>
            ))}
          </div>

          {/* Detected Building Components Section */}
          <DetectedComponentsSection
            classifiedPhotos={classifiedPhotos}
            onAcceptComponent={onAcceptDetectedComponent}
            existingComponentTypeIds={existingComponentTypeIds}
          />
        </div>
      )}
    </div>
  );
}
