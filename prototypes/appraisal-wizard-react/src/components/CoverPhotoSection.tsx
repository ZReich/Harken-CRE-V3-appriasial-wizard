import React, { useState, useRef, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Star, 
  Sparkles,
  RefreshCw,
  FileImage,
  Check
} from 'lucide-react';
import type { CoverPhotoData, SubjectData } from '../types';

interface PhotoData {
  file: File;
  preview: string;
  caption?: string;
  takenBy?: string;
  takenDate?: string;
}

interface CoverPhotoSectionProps {
  coverPhoto?: CoverPhotoData;
  onSetCoverPhoto: (photo: CoverPhotoData) => void;
  onRemoveCoverPhoto: () => void;
  uploadedPhotos: Record<string, PhotoData | null>;
  subjectData: SubjectData;
  onOpenPicker: () => void;
}

export default function CoverPhotoSection({
  coverPhoto,
  onSetCoverPhoto,
  onRemoveCoverPhoto,
  uploadedPhotos,
  subjectData,
  onOpenPicker,
}: CoverPhotoSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Count available photos for the picker
  const availablePhotosCount = Object.values(uploadedPhotos).filter(Boolean).length;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(f => f.type.startsWith('image/'));
    
    if (imageFile) {
      const preview = URL.createObjectURL(imageFile);
      onSetCoverPhoto({
        id: `cover_${Date.now()}`,
        file: imageFile,
        preview,
        caption: 'Subject Property',
      });
    }
  }, [onSetCoverPhoto]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      onSetCoverPhoto({
        id: `cover_${Date.now()}`,
        file,
        preview,
        caption: 'Subject Property',
      });
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onSetCoverPhoto]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Property info for the mini preview
  const propertyName = subjectData.propertyName || 'Subject Property';
  const propertyAddress = [
    subjectData.address?.street,
    subjectData.address?.city,
    subjectData.address?.state,
    subjectData.address?.zip
  ].filter(Boolean).join(', ') || 'Address Not Specified';

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#0da1c7]/30 bg-gradient-to-br from-slate-50 via-white to-[#0da1c7]/5">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#0da1c7] to-cyan-400 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-4 border-b border-[#0da1c7]/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0da1c7] to-cyan-600 text-white shadow-lg shadow-[#0da1c7]/30">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Cover Photo</h3>
            <p className="text-sm text-slate-500">The hero image on your report's title page</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
          <span className="text-xs font-medium text-slate-600">Page 1</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5">
        <div className="flex gap-6">
          {/* Mini Cover Page Preview */}
          <div className="flex-shrink-0 w-56">
            <div className="text-xs font-medium text-slate-500 mb-2 text-center">Report Preview</div>
            <div 
              className="relative w-full aspect-[8.5/11] rounded-lg overflow-hidden shadow-xl border border-slate-200"
              style={{
                background: coverPhoto 
                  ? `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.3)), url(${coverPhoto.preview}) center/cover`
                  : 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
              }}
            >
              {/* Mini cover page content */}
              <div className="absolute inset-0 flex flex-col p-4 text-white">
                {/* Logo area */}
                <div className="text-[8px] font-bold tracking-wider text-white/80 mb-auto">
                  ROVE EVALUATIONS
                </div>

                {/* Title area */}
                <div className="mb-4">
                  <div className="text-[6px] font-medium tracking-widest text-sky-400 uppercase mb-1">
                    Commercial Appraisal
                  </div>
                  <div className="text-sm font-bold leading-tight mb-1 line-clamp-2">
                    {propertyName}
                  </div>
                  <div className="text-[8px] text-white/70 line-clamp-2">
                    {propertyAddress}
                  </div>
                </div>

                {/* Footer info */}
                <div className="flex gap-3 pt-2 border-t border-white/20">
                  <div>
                    <div className="text-[5px] text-white/50 uppercase">Type</div>
                    <div className="text-[7px] font-medium">Commercial</div>
                  </div>
                  <div>
                    <div className="text-[5px] text-white/50 uppercase">Date</div>
                    <div className="text-[7px] font-medium">
                      {subjectData.effectiveDate 
                        ? new Date(subjectData.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'TBD'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo placeholder indicator */}
              {!coverPhoto && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1 text-white/30">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[8px]">No Photo</span>
                  </div>
                </div>
              )}

              {/* Success checkmark when photo is set */}
              {coverPhoto && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Upload/Selection Area */}
          <div className="flex-1 flex flex-col">
            {coverPhoto ? (
              // Photo is set - show preview with actions
              <div className="flex-1 flex flex-col">
                <div className="relative flex-1 rounded-xl overflow-hidden border-2 border-green-200 bg-green-50/30">
                  <img 
                    src={coverPhoto.preview} 
                    alt="Cover photo" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={handleUploadClick}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-slate-700 text-sm font-medium rounded-lg transition-all shadow-lg"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Change Photo
                      </button>
                      <button
                        onClick={onRemoveCoverPhoto}
                        className="flex items-center justify-center px-3 py-2.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Source indicator */}
                  {coverPhoto.sourceSlotId && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#0da1c7] text-white text-xs font-medium rounded-full shadow-lg">
                      <FileImage className="w-3 h-3" />
                      From uploads
                    </div>
                  )}
                </div>

                {/* Helper text */}
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                  <Sparkles className="w-4 h-4" />
                  <span>Cover photo set! Hover to change or remove.</span>
                </div>
              </div>
            ) : (
              // No photo - show upload options
              <div className="flex-1 flex flex-col gap-4">
                {/* Drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                  className={`
                    flex-1 flex flex-col items-center justify-center gap-3 
                    border-2 border-dashed rounded-xl cursor-pointer
                    transition-all duration-200
                    ${isDragOver 
                      ? 'border-[#0da1c7] bg-[#0da1c7]/10 scale-[1.02]' 
                      : 'border-slate-300 hover:border-[#0da1c7] hover:bg-[#0da1c7]/5'
                    }
                  `}
                >
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center
                    transition-all duration-200
                    ${isDragOver 
                      ? 'bg-[#0da1c7] text-white scale-110' 
                      : 'bg-slate-100 text-slate-400'
                    }
                  `}>
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${isDragOver ? 'text-[#0da1c7]' : 'text-slate-700'}`}>
                      {isDragOver ? 'Drop photo here' : 'Drop photo here or click to upload'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      JPG, PNG, WebP, HEIC
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Select from uploads button */}
                <button
                  onClick={onOpenPicker}
                  disabled={availablePhotosCount === 0}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    font-medium transition-all
                    ${availablePhotosCount > 0
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  <FileImage className="w-5 h-5" />
                  {availablePhotosCount > 0 
                    ? `Select from ${availablePhotosCount} uploaded photo${availablePhotosCount !== 1 ? 's' : ''}`
                    : 'No photos uploaded yet'
                  }
                </button>

                {/* Recommendation hint */}
                {availablePhotosCount === 0 && (
                  <p className="text-xs text-slate-500 text-center">
                    Upload photos below, then come back to select your cover
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

