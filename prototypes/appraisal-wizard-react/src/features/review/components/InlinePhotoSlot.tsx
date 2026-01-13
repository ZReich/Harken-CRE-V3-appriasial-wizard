/**
 * InlinePhotoSlot - Inline photo placement within report sections
 * ================================================================
 * 
 * Allows users to place photos inline within narrative report sections
 * rather than only in the addendum. Supports drag-drop and click-to-assign.
 */

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Image, Plus, X, Crop, RotateCw } from 'lucide-react';
import type { PhotoSlotConfig, InlinePhotoPlacement, PhotoAspectRatio } from '../types';
import type { ReportPhotoData } from '../../../types';
import type { PhotoEdits } from './PhotoEditorDialog';

// Use ReportPhotoData for report photo references
type PhotoData = ReportPhotoData;

// =================================================================
// TYPES
// =================================================================

interface InlinePhotoSlotProps {
  slot: PhotoSlotConfig;
  placement?: InlinePhotoPlacement;
  availablePhotos: PhotoData[];
  onAssign: (slotId: string, photoId: string) => void;
  onRemove: (slotId: string) => void;
  onOpenEditor?: (photo: PhotoData) => void;
  edits?: PhotoEdits;
  className?: string;
}

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoData[];
  onSelect: (photoId: string) => void;
  categoryFilter?: string;
  slotLabel?: string;
}

// =================================================================
// ASPECT RATIO UTILITIES
// =================================================================

const getAspectRatioClass = (ratio: PhotoAspectRatio): string => {
  switch (ratio) {
    case '16/9': return 'aspect-video';
    case '4/3': return 'aspect-[4/3]';
    case '3/2': return 'aspect-[3/2]';
    case 'square': return 'aspect-square';
    default: return 'aspect-video';
  }
};

const getAspectRatioValue = (ratio: PhotoAspectRatio): number => {
  switch (ratio) {
    case '16/9': return 16 / 9;
    case '4/3': return 4 / 3;
    case '3/2': return 3 / 2;
    case 'square': return 1;
    default: return 16 / 9;
  }
};

// =================================================================
// PHOTO PICKER MODAL
// =================================================================

function PhotoPickerModal({
  isOpen,
  onClose,
  photos,
  onSelect,
  categoryFilter,
  slotLabel,
}: PhotoPickerModalProps) {
  // Use portal to render at document root - avoids scrolling/positioning issues
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !portalRoot) return null;

  const filteredPhotos = categoryFilter
    ? photos.filter(p => p.category?.toLowerCase().includes(categoryFilter.toLowerCase()))
    : photos;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-surface-1 dark:bg-elevation-2 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-harken-dark dark:text-white">
              Select Photo
            </h3>
            {slotLabel && (
              <p className="text-sm text-harken-gray-med mt-0.5">
                For: {slotLabel}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-harken-gray-light dark:hover:bg-elevation-3 transition-colors"
          >
            <X className="w-5 h-5 text-harken-gray" />
          </button>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-auto p-6 min-h-0">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-harken-gray-med">
              <Image className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">
                {categoryFilter
                  ? `No ${categoryFilter} photos available`
                  : 'No photos available'}
              </p>
              <p className="text-xs mt-2 text-harken-gray-med-lt">
                Upload photos in the Documents step to use them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    onSelect(photo.id);
                    onClose();
                  }}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-harken-gray-light dark:bg-elevation-1 border-2 border-transparent hover:border-accent-cyan transition-all"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium truncate">
                        {photo.caption}
                      </p>
                      {photo.category && (
                        <p className="text-white/70 text-xs mt-0.5">
                          {photo.category}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-light-border dark:border-dark-border flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-harken-gray hover:bg-harken-gray-light dark:hover:bg-elevation-3 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root
  return createPortal(modalContent, portalRoot);
}

// =================================================================
// INLINE PHOTO SLOT COMPONENT
// =================================================================

export function InlinePhotoSlot({
  slot,
  placement,
  availablePhotos,
  onAssign,
  onRemove,
  onOpenEditor,
  edits,
  className = '',
}: InlinePhotoSlotProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const assignedPhoto = placement
    ? availablePhotos.find(p => p.id === placement.photoId)
    : undefined;

  const handleOpenPicker = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handleSelect = useCallback((photoId: string) => {
    onAssign(slot.id, photoId);
  }, [slot.id, onAssign]);

  const handleRemove = useCallback(() => {
    onRemove(slot.id);
  }, [slot.id, onRemove]);

  // Calculate transform style from edits
  const getImageStyle = (): React.CSSProperties => {
    if (!edits) return {};
    
    const transforms: string[] = [];
    if (edits.rotation) transforms.push(`rotate(${edits.rotation}deg)`);
    if (edits.flipH) transforms.push('scaleX(-1)');
    if (edits.flipV) transforms.push('scaleY(-1)');
    
    return transforms.length > 0 ? { transform: transforms.join(' ') } : {};
  };

  return (
    <>
      <div
        className={`relative rounded-lg overflow-hidden bg-harken-gray-light dark:bg-elevation-1 border-2 border-dashed border-harken-gray-med-lt dark:border-dark-border transition-all ${getAspectRatioClass(slot.aspectRatio)} ${className}`}
      >
        {assignedPhoto ? (
          // Photo is assigned - show the image
          <>
            <img
              src={assignedPhoto.url}
              alt={assignedPhoto.caption}
              className="w-full h-full object-cover"
              style={getImageStyle()}
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  {onOpenEditor && (
                    <button
                      onClick={() => onOpenEditor(assignedPhoto)}
                      className="p-2 rounded-full bg-white/90 hover:bg-white text-harken-dark transition-colors"
                      title="Edit photo"
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleOpenPicker}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-harken-dark transition-colors"
                    title="Replace photo"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRemove}
                    className="p-2 rounded-full bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium truncate">
                {assignedPhoto.caption}
              </p>
              {slot.label && (
                <p className="text-white/60 text-xs mt-0.5">
                  {slot.label}
                </p>
              )}
            </div>
          </>
        ) : (
          // Empty slot - show placeholder
          <button
            onClick={handleOpenPicker}
            className="absolute inset-0 flex flex-col items-center justify-center text-harken-gray-med hover:text-harken-gray hover:bg-harken-gray-med-lt/30 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-harken-gray-med-lt/50 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">
              {slot.label || 'Add Photo'}
            </p>
            {slot.categoryFilter && (
              <p className="text-xs mt-1 opacity-70">
                {slot.categoryFilter} photos
              </p>
            )}
          </button>
        )}
      </div>

      {/* Photo Picker Modal */}
      <PhotoPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        photos={availablePhotos}
        onSelect={handleSelect}
        categoryFilter={slot.categoryFilter}
        slotLabel={slot.label}
      />
    </>
  );
}

// =================================================================
// INLINE PHOTO GRID - Multiple slots in a grid layout
// =================================================================

interface InlinePhotoGridProps {
  slots: PhotoSlotConfig[];
  placements: InlinePhotoPlacement[];
  availablePhotos: PhotoData[];
  onAssign: (slotId: string, photoId: string) => void;
  onRemove: (slotId: string) => void;
  onOpenEditor?: (photo: PhotoData) => void;
  getPhotoEdits?: (photoId: string) => PhotoEdits | undefined;
  position?: 'header' | 'inline' | 'footer';
  columns?: 2 | 3 | 4;
}

export function InlinePhotoGrid({
  slots,
  placements,
  availablePhotos,
  onAssign,
  onRemove,
  onOpenEditor,
  getPhotoEdits,
  position,
  columns = 2,
}: InlinePhotoGridProps) {
  // Filter slots by position if specified
  const filteredSlots = position
    ? slots.filter(s => s.position === position)
    : slots;

  if (filteredSlots.length === 0) return null;

  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {filteredSlots.map((slot) => {
        const placement = placements.find(p => p.slotId === slot.id);
        const edits = placement && getPhotoEdits
          ? getPhotoEdits(placement.photoId)
          : undefined;

        return (
          <InlinePhotoSlot
            key={slot.id}
            slot={slot}
            placement={placement}
            availablePhotos={availablePhotos}
            onAssign={onAssign}
            onRemove={onRemove}
            onOpenEditor={onOpenEditor}
            edits={edits}
          />
        );
      })}
    </div>
  );
}

export default InlinePhotoSlot;
