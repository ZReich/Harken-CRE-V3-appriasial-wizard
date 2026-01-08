import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, GripVertical, Camera, ImagePlus, Check, AlertCircle } from 'lucide-react';
import type { ReportPhoto, PhotoCategory } from '../../../types';
import { PHOTO_SLOTS } from '../constants';

interface PhotoUploadManagerProps {
  photos: ReportPhoto[];
  onPhotosChange: (photos: ReportPhoto[]) => void;
  maxTotalPhotos?: number;
}

interface PhotoSlotGroupProps {
  slot: typeof PHOTO_SLOTS[0];
  photos: ReportPhoto[];
  onUpload: (files: FileList, category: PhotoCategory) => void;
  onRemove: (photoId: string) => void;
  onUpdateCaption: (photoId: string, caption: string) => void;
}

const PhotoSlotGroup: React.FC<PhotoSlotGroupProps> = ({
  slot,
  photos,
  onUpload,
  onRemove,
  onUpdateCaption,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files, slot.category);
    }
  }, [onUpload, slot.category]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files, slot.category);
      e.target.value = ''; // Reset input
    }
  }, [onUpload, slot.category]);

  const photoCount = photos.length;
  const isComplete = photoCount >= slot.minCount;
  const canAddMore = photoCount < slot.maxCount;

  return (
    <div className="border border-light-border dark:border-dark-border dark:border-dark-border rounded-lg overflow-hidden bg-surface-1 dark:bg-elevation-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-2 dark:bg-elevation-2 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isComplete ? 'bg-accent-teal-mint-light text-accent-teal-mint' : 'bg-accent-amber-gold-light text-accent-amber-gold'
          }`}>
            {isComplete ? <Check size={16} /> : <Camera size={16} />}
          </div>
          <div>
            <h4 className="font-medium text-slate-800">{slot.label}</h4>
            <p className="text-xs text-slate-500">
              {photoCount} / {slot.maxCount} photos
              {slot.required && <span className="ml-1 text-harken-error">*</span>}
              {slot.minCount > 0 && !isComplete && (
                <span className="ml-2 text-accent-amber-gold">
                  (Need {slot.minCount - photoCount} more)
                </span>
              )}
            </p>
          </div>
        </div>
        
        {canAddMore && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <ImagePlus size={14} />
            Add Photos
          </button>
        )}
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Photo Grid or Drop Zone */}
      {photos.length === 0 ? (
        <div
          className={`p-8 border-2 border-dashed m-4 rounded-lg transition-colors cursor-pointer ${
            isDragOver
              ? 'border-sky-400 bg-sky-50'
              : 'border-light-border dark:border-dark-border hover:border-border-muted dark:hover:border-dark-border-muted'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-slate-400">
            <Upload size={32} className="mb-2" />
            <p className="text-sm font-medium">Drop photos here or click to upload</p>
            <p className="text-xs mt-1">
              {slot.minCount > 0 
                ? `Minimum ${slot.minCount} photos required`
                : 'Optional photos'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group aspect-[4/3] bg-surface-3 dark:bg-elevation-subtle rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
                  {/* Top actions */}
                  <div className="flex justify-between p-2">
                    <button
                      className="p-1.5 bg-surface-1/20 hover:bg-surface-1/30 rounded text-white cursor-grab"
                      title="Drag to reorder"
                    >
                      <GripVertical size={14} />
                    </button>
                    <button
                      onClick={() => onRemove(photo.id)}
                      className="p-1.5 bg-harken-error/80 hover:bg-harken-error rounded text-white"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  {/* Bottom caption */}
                  <div className="mt-auto p-2">
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => onUpdateCaption(photo.id, e.target.value)}
                      placeholder="Add caption..."
                      className="w-full px-2 py-1 text-xs bg-surface-1/20 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                {/* Photo number badge */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-slate-900/70 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-0">
                  {index + 1}
                </div>
              </div>
            ))}
            
            {/* Add more button inline */}
            {canAddMore && photos.length > 0 && (
              <button
                onClick={() => inputRef.current?.click()}
                className="aspect-[4/3] border-2 border-dashed border-light-border dark:border-dark-border rounded-lg hover:border-sky-400 hover:bg-sky-50 transition-colors flex flex-col items-center justify-center text-slate-400 hover:text-sky-500"
              >
                <ImagePlus size={24} className="mb-1" />
                <span className="text-xs">Add More</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const PhotoUploadManager: React.FC<PhotoUploadManagerProps> = ({
  photos,
  onPhotosChange,
  maxTotalPhotos = 50,
}) => {
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const handleUpload = useCallback(async (files: FileList, category: PhotoCategory) => {
    const newPhotos: ReportPhoto[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not a valid image file`);
        continue;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }

      // Check total photo limit
      if (photos.length + newPhotos.length >= maxTotalPhotos) {
        errors.push(`Maximum ${maxTotalPhotos} photos allowed`);
        break;
      }

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url,
        caption: '',
        category,
        sortOrder: photos.filter(p => p.category === category).length + newPhotos.length,
        takenDate: new Date().toISOString().split('T')[0],
      });
    }

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
    }
    
    if (errors.length > 0) {
      setUploadErrors(errors);
      setTimeout(() => setUploadErrors([]), 5000);
    }
  }, [photos, onPhotosChange, maxTotalPhotos]);

  const handleRemove = useCallback((photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  }, [photos, onPhotosChange]);

  const handleUpdateCaption = useCallback((photoId: string, caption: string) => {
    onPhotosChange(
      photos.map(p => p.id === photoId ? { ...p, caption } : p)
    );
  }, [photos, onPhotosChange]);

  // Get photos by category
  const getPhotosForSlot = (category: PhotoCategory) => {
    return photos
      .filter(p => p.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Calculate completion stats
  const completedSlots = PHOTO_SLOTS.filter(slot => {
    const slotPhotos = getPhotosForSlot(slot.category);
    return slotPhotos.length >= slot.minCount;
  }).length;

  const completedRequired = PHOTO_SLOTS.filter(slot => {
    if (!slot.required) return true;
    const slotPhotos = getPhotosForSlot(slot.category);
    return slotPhotos.length >= slot.minCount;
  }).length === PHOTO_SLOTS.length;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Property Photos</h3>
          <p className="text-sm text-slate-500">
            Upload photos for each category. {photos.length} of {maxTotalPhotos} total photos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            completedRequired 
              ? 'bg-accent-teal-mint-light text-accent-teal-mint'
              : 'bg-accent-amber-gold-light text-accent-amber-gold'
          }`}>
            {completedSlots} / {PHOTO_SLOTS.length} categories
          </div>
        </div>
      </div>

      {/* Error messages */}
      {uploadErrors.length > 0 && (
        <div className="bg-accent-red-light border border-harken-error/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-harken-error flex-shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              {uploadErrors.map((error, i) => (
                <p key={i} className="text-sm text-harken-error">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo slots */}
      <div className="space-y-4">
        {PHOTO_SLOTS.map(slot => (
          <PhotoSlotGroup
            key={slot.id}
            slot={slot}
            photos={getPhotosForSlot(slot.category)}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onUpdateCaption={handleUpdateCaption}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoUploadManager;

