import React from 'react';
import type { ReportPhoto, PhotoGridLayoutType } from '../../../../types';

interface PhotoGridPageProps {
  photos: ReportPhoto[];
  layout?: PhotoGridLayoutType;
  title?: string;
  pageNumber?: number;
  showAttribution?: boolean;
  takenBy?: string;
  takenDate?: string;
  isEditing?: boolean;
  onPhotoClick?: (photoId: string) => void;
}

export const PhotoGridPage: React.FC<PhotoGridPageProps> = ({
  photos,
  layout = 'grid-6',
  title,
  pageNumber,
  showAttribution = false,
  takenBy,
  takenDate,
  isEditing = false,
  onPhotoClick,
}) => {
  const getGridClass = () => {
    switch (layout) {
      case 'grid-6':
        return 'grid-cols-2 gap-4';
      case 'grid-4':
        return 'grid-cols-2 gap-6';
      case 'grid-2':
        return 'grid-cols-2 gap-8';
      case 'single':
        return 'grid-cols-1';
      default:
        return 'grid-cols-2 gap-4';
    }
  };

  const getMaxPhotos = () => {
    switch (layout) {
      case 'grid-6':
        return 6;
      case 'grid-4':
        return 4;
      case 'grid-2':
        return 2;
      case 'single':
        return 1;
      default:
        return 6;
    }
  };

  const displayPhotos = photos.slice(0, getMaxPhotos());

  if (layout === 'single' && displayPhotos.length > 0) {
    const photo = displayPhotos[0];
    return (
      <div className="w-full h-full bg-surface-1 flex flex-col">
        {/* Title */}
        {title && (
          <div className="px-16 pt-8 pb-4">
            <h3 className="text-lg font-semibold text-slate-800 text-center">{title}</h3>
          </div>
        )}

        {/* Single large photo */}
        <div 
          className={`flex-1 px-12 pb-8 flex flex-col items-center justify-center ${
            isEditing ? 'cursor-pointer' : ''
          }`}
          onClick={() => isEditing && onPhotoClick?.(photo.id)}
        >
          <div className="relative w-full max-h-[600px] flex items-center justify-center">
            <img
              src={photo.url}
              alt={photo.caption || 'Property photo'}
              className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">Click to edit</span>
              </div>
            )}
          </div>
          {photo.caption && (
            <p className="text-sm text-slate-600 text-center mt-4 max-w-lg">
              {photo.caption}
            </p>
          )}
        </div>

        {/* Page number */}
        {pageNumber && (
          <div className="px-16 py-4 text-right">
            <span className="text-sm text-slate-400">Page {pageNumber}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-surface-1 flex flex-col">
      {/* Page header */}
      {title && (
        <div className="px-16 pt-8 pb-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {pageNumber && (
              <span className="text-sm text-slate-400">Page {pageNumber}</span>
            )}
          </div>
        </div>
      )}

      {/* Photo grid */}
      <div className="flex-1 px-12 py-6">
        <div className={`grid ${getGridClass()} h-full`}>
          {displayPhotos.map((photo, index) => (
            <div 
              key={photo.id}
              className={`flex flex-col ${
                isEditing ? 'cursor-pointer group' : ''
              }`}
              onClick={() => isEditing && onPhotoClick?.(photo.id)}
            >
              <div className="relative flex-1 min-h-0 bg-surface-3 dark:bg-elevation-subtle rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Click to edit</span>
                  </div>
                )}
              </div>
              {photo.caption && (
                <p className="text-xs text-slate-600 text-center mt-2 line-clamp-2">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}

          {/* Fill empty grid slots */}
          {displayPhotos.length < getMaxPhotos() && Array.from(
            { length: getMaxPhotos() - displayPhotos.length },
            (_, i) => (
              <div 
                key={`empty-${i}`}
                className="flex flex-col"
              >
                <div className="flex-1 min-h-0 bg-surface-2 dark:bg-elevation-2 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center">
                  <span className="text-sm text-slate-400">Empty slot</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Attribution footer */}
      {showAttribution && (takenBy || takenDate) && (
        <div className="px-16 py-4 border-t border-light-border dark:border-dark-border text-center">
          <p className="text-xs text-slate-500">
            {takenBy && `Photos by ${takenBy}`}
            {takenBy && takenDate && ' • '}
            {takenDate && `Taken ${new Date(takenDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}`}
          </p>
        </div>
      )}

      {/* Page number (if no title shown) */}
      {!title && pageNumber && (
        <div className="px-16 py-4 text-right">
          <span className="text-sm text-slate-400">Page {pageNumber}</span>
        </div>
      )}
    </div>
  );
};

export default PhotoGridPage;

