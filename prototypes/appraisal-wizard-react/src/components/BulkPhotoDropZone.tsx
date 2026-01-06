import React, { useState, useRef, useCallback } from 'react';
import { Upload, ImagePlus, AlertCircle, Sparkles, X } from 'lucide-react';
import { validateImageFile, createStagingPhoto, classifyPhoto } from '../services/photoClassification';
import { useWizard } from '../context/WizardContext';
import type { StagingPhoto } from '../types';

interface BulkPhotoDropZoneProps {
  onPhotosProcessed?: (photos: StagingPhoto[]) => void;
  existingSlotAssignments?: Record<string, string>; // slotId -> photoId
  className?: string;
}

export default function BulkPhotoDropZone({
  onPhotosProcessed,
  existingSlotAssignments = {},
  className = '',
}: BulkPhotoDropZoneProps) {
  const { addStagingPhotos, updateStagingPhoto } = useWizard();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    }

    setErrors(newErrors);

    if (validFiles.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: validFiles.length });

    // Create staging photos
    const stagingPhotos: StagingPhoto[] = validFiles.map(file => createStagingPhoto(file));

    // Add all staging photos immediately (with pending status)
    addStagingPhotos(stagingPhotos);

    // Get set of already used slots
    const usedSlots = new Set(Object.keys(existingSlotAssignments));

    // Classify each photo
    for (let i = 0; i < stagingPhotos.length; i++) {
      const photo = stagingPhotos[i];
      setProcessingProgress({ current: i + 1, total: validFiles.length });

      // Update status to classifying
      updateStagingPhoto(photo.id, { status: 'classifying' });

      try {
        const result = await classifyPhoto(photo.file, photo.id, usedSlots, { detectComponents: true });

        if (result.success && result.suggestions.length > 0) {
          // Mark top suggestion as used for subsequent photos
          usedSlots.add(result.suggestions[0].slotId);

          updateStagingPhoto(photo.id, {
            status: 'classified',
            suggestions: result.suggestions,
            detectedComponents: result.detectedComponents,
          });

          // Update local photo object for callback
          photo.status = 'classified';
          photo.suggestions = result.suggestions;
          photo.detectedComponents = result.detectedComponents;
        } else {
          updateStagingPhoto(photo.id, {
            status: 'error',
            error: result.error || 'No suggestions available',
          });
          photo.status = 'error';
          photo.error = result.error;
        }
      } catch (error) {
        updateStagingPhoto(photo.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Classification failed',
        });
        photo.status = 'error';
      }
    }

    setIsProcessing(false);
    setProcessingProgress({ current: 0, total: 0 });

    // Notify parent
    onPhotosProcessed?.(stagingPhotos);
  }, [addStagingPhotos, updateStagingPhoto, existingSlotAssignments, onPhotosProcessed]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFiles]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleClick : undefined}
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-[#0da1c7] bg-[#0da1c7]/10 scale-[1.02]'
            : 'border-gray-300 dark:border-slate-700 hover:border-[#0da1c7]/50 hover:bg-gray-50 dark:hover:bg-slate-800'
          }
          ${isProcessing ? 'cursor-wait' : ''}
        `}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Content */}
        <div className="p-8 text-center">
          {isProcessing ? (
            // Processing State
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0da1c7]/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#0da1c7] animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#1c3643] dark:text-white">
                  Analyzing Photos with AI
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Classifying {processingProgress.current} of {processingProgress.total} photos...
                </p>
              </div>
              {/* Progress Bar */}
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0da1c7] to-[#4db8d1] transition-all duration-300"
                    style={{
                      width: `${(processingProgress.current / processingProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : isDragging ? (
            // Dragging State
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0da1c7]/20 flex items-center justify-center animate-bounce">
                <ImagePlus className="w-8 h-8 text-[#0da1c7]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#0da1c7] dark:text-cyan-400">
                  Drop photos here
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Release to upload and classify
                </p>
              </div>
            </div>
          ) : (
            // Default State
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center border border-gray-200 dark:border-slate-600 transition-colors group-hover:bg-[#0da1c7]/10 dark:group-hover:bg-[#0da1c7]/20">
                <Upload className="w-8 h-8 text-gray-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#1c3643] dark:text-white">
                  Bulk Upload Photos
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Drag & drop multiple photos or{' '}
                  <span className="text-[#0da1c7] font-medium">click to browse</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                  AI will automatically suggest where each photo belongs
                </p>
              </div>
              {/* Supported Formats */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 dark:text-slate-500">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded">JPG</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded">PNG</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded">WebP</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded">HEIC</span>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Border Animation when Dragging */}
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-[#0da1c7] rounded-xl animate-pulse" />
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Some files couldn't be uploaded
                </p>
                <ul className="mt-1 text-sm text-red-600 dark:text-red-400/80 list-disc list-inside">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={clearErrors}
              className="p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

