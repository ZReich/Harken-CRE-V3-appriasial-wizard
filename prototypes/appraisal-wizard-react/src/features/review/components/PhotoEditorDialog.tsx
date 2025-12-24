import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Crop, 
  Upload, 
  Maximize2, 
  Check,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';

// =================================================================
// TYPES
// =================================================================

export interface PhotoData {
  id: string;
  url: string;
  caption: string;
  category?: string;
}

export interface PhotoEdits {
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  caption: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PhotoEditorDialogProps {
  isOpen: boolean;
  photo: PhotoData | null;
  onClose: () => void;
  onSave: (photoId: string, edits: PhotoEdits, newUrl?: string) => void;
  onDelete?: (photoId: string) => void;
  availablePhotos?: PhotoData[]; // Gallery of photos to swap with
}

// =================================================================
// LIGHTBOX COMPONENT
// =================================================================

function Lightbox({ 
  photo, 
  edits, 
  onClose 
}: { 
  photo: PhotoData; 
  edits: PhotoEdits; 
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const transformStyle: React.CSSProperties = {
    transform: `
      translate(${position.x}px, ${position.y}px) 
      scale(${zoom}) 
      rotate(${edits.rotation}deg) 
      scaleX(${edits.flipH ? -1 : 1}) 
      scaleY(${edits.flipV ? -1 : 1})
    `,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(3, prev + 0.25)); }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(0.5, prev - 0.25)); }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(1); setPosition({ x: 0, y: 0 }); }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <Move size={20} />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Image */}
      <img
        src={photo.url}
        alt={photo.caption}
        className="max-w-[90vw] max-h-[90vh] object-contain select-none"
        style={transformStyle}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {/* Caption */}
      {edits.caption && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/70 text-white rounded-lg text-lg">
          {edits.caption}
        </div>
      )}
    </div>
  );
}

// =================================================================
// PHOTO GALLERY (for swapping)
// =================================================================

function PhotoGallery({ 
  photos, 
  onSelect, 
  currentPhotoId 
}: { 
  photos: PhotoData[]; 
  onSelect: (photo: PhotoData) => void;
  currentPhotoId: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
      {photos.map((photo) => (
        <button
          key={photo.id}
          onClick={() => onSelect(photo)}
          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
            photo.id === currentPhotoId 
              ? 'border-[#0da1c7] ring-2 ring-[#0da1c7]/30' 
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover"
          />
          {photo.id === currentPhotoId && (
            <div className="absolute inset-0 bg-[#0da1c7]/20 flex items-center justify-center">
              <Check className="text-white" size={24} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// =================================================================
// MAIN PHOTO EDITOR DIALOG
// =================================================================

export function PhotoEditorDialog({
  isOpen,
  photo,
  onClose,
  onSave,
  onDelete,
  availablePhotos = [],
}: PhotoEditorDialogProps) {
  // Edit state
  const [edits, setEdits] = useState<PhotoEdits>({
    rotation: 0,
    flipH: false,
    flipV: false,
    caption: '',
  });
  const [showLightbox, setShowLightbox] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when photo changes
  useEffect(() => {
    if (photo) {
      setEdits({
        rotation: 0,
        flipH: false,
        flipV: false,
        caption: photo.caption || '',
      });
      setSelectedPhotoUrl(photo.url);
    }
  }, [photo]);

  // Handlers
  const handleRotate = useCallback(() => {
    setEdits(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  }, []);

  const handleFlipH = useCallback(() => {
    setEdits(prev => ({ ...prev, flipH: !prev.flipH }));
  }, []);

  const handleFlipV = useCallback(() => {
    setEdits(prev => ({ ...prev, flipV: !prev.flipV }));
  }, []);

  const handleCaptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEdits(prev => ({ ...prev, caption: e.target.value }));
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedPhotoUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSelectFromGallery = useCallback((galleryPhoto: PhotoData) => {
    setSelectedPhotoUrl(galleryPhoto.url);
    setShowGallery(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!photo) return;
    const newUrl = selectedPhotoUrl !== photo.url ? selectedPhotoUrl : undefined;
    onSave(photo.id, edits, newUrl);
    onClose();
  }, [photo, edits, selectedPhotoUrl, onSave, onClose]);

  const handleDelete = useCallback(() => {
    if (!photo || !onDelete) return;
    if (confirm('Are you sure you want to remove this photo from the report?')) {
      onDelete(photo.id);
      onClose();
    }
  }, [photo, onDelete, onClose]);

  if (!isOpen || !photo) return null;

  // Transform style for preview
  const previewTransform: React.CSSProperties = {
    transform: `rotate(${edits.rotation}deg) scaleX(${edits.flipH ? -1 : 1}) scaleY(${edits.flipV ? -1 : 1})`,
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Edit Photo</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Photo Preview */}
            <div className="mb-6">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '280px' }}>
                <img
                  src={selectedPhotoUrl}
                  alt={edits.caption || 'Photo preview'}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={previewTransform}
                />
                {/* Lightbox Button */}
                <button
                  onClick={() => setShowLightbox(true)}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                  title="View Full Size"
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            </div>

            {/* Caption Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <input
                type="text"
                value={edits.caption}
                onChange={handleCaptionChange}
                placeholder="Enter photo caption..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              />
            </div>

            {/* Edit Tools */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transform
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw size={18} />
                  <span className="text-sm">Rotate</span>
                </button>
                <button
                  onClick={handleFlipH}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    edits.flipH ? 'bg-[#0da1c7] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal size={18} />
                  <span className="text-sm">Flip H</span>
                </button>
                <button
                  onClick={handleFlipV}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    edits.flipV ? 'bg-[#0da1c7] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical size={18} />
                  <span className="text-sm">Flip V</span>
                </button>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-400 cursor-not-allowed"
                  title="Crop (Coming Soon)"
                  disabled
                >
                  <Crop size={18} />
                  <span className="text-sm">Crop</span>
                </button>
              </div>
            </div>

            {/* Replace Photo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Replace Photo
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  <Upload size={18} />
                  <span className="text-sm">Upload New</span>
                </button>
                {availablePhotos.length > 0 && (
                  <button
                    onClick={() => setShowGallery(!showGallery)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showGallery ? 'bg-[#0da1c7] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-sm">Choose from Gallery</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Gallery */}
              {showGallery && availablePhotos.length > 0 && (
                <div className="mt-3">
                  <PhotoGallery
                    photos={availablePhotos}
                    onSelect={handleSelectFromGallery}
                    currentPhotoId={photo.id}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                  <span className="text-sm font-medium">Remove</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#0da1c7] text-white rounded-lg hover:bg-[#0890a8] transition-colors font-medium flex items-center gap-2"
              >
                <Check size={18} />
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <Lightbox
          photo={{ ...photo, url: selectedPhotoUrl }}
          edits={edits}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}

export default PhotoEditorDialog;

