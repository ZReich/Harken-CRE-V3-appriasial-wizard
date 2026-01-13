import React from 'react';
import type { ReportPhoto, PhotoGridLayoutType } from '../../../../types';
import { ReportPageBase } from './ReportPageBase';

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
        return 'grid-cols-2 gap-3';
      case 'grid-4':
        return 'grid-cols-2 gap-4';
      case 'grid-2':
        return 'grid-cols-2 gap-6';
      case 'single':
        return 'grid-cols-1';
      default:
        return 'grid-cols-2 gap-3';
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

  const getPhotoHeight = () => {
    switch (layout) {
      case 'grid-6':
        return 'h-[140px]';
      case 'grid-4':
        return 'h-[180px]';
      case 'grid-2':
        return 'h-[240px]';
      case 'single':
        return 'h-[400px]';
      default:
        return 'h-[140px]';
    }
  };

  const displayPhotos = photos.slice(0, getMaxPhotos());

  // Single photo layout
  if (layout === 'single' && displayPhotos.length > 0) {
    const photo = displayPhotos[0];
    return (
      <ReportPageBase
        title={title || 'Property Photo'}
        sidebarLabel="PHOTO"
        pageNumber={pageNumber}
        sectionNumber={2}
        sectionTitle="PROPERTY"
        contentPadding="p-10"
      >
        <div 
          className={`flex flex-col items-center justify-center h-full ${
            isEditing ? 'cursor-pointer' : ''
          }`}
          onClick={() => isEditing && onPhotoClick?.(photo.id)}
        >
          <div className="relative w-full h-[400px] flex items-center justify-center">
            <img
              src={photo.url}
              alt={photo.caption || 'Property photo'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-medium">Click to edit</span>
              </div>
            )}
          </div>
          {photo.caption && (
            <p className="text-xs text-slate-600 text-center mt-3 max-w-md">
              {photo.caption}
            </p>
          )}
        </div>

        {/* Attribution */}
        {showAttribution && (takenBy || takenDate) && (
          <div className="mt-auto pt-3 text-center text-[10px] text-slate-500">
            {takenBy && `Photos by ${takenBy}`}
            {takenBy && takenDate && ' | '}
            {takenDate && `Taken ${new Date(takenDate).toLocaleDateString()}`}
          </div>
        )}
      </ReportPageBase>
    );
  }

  return (
    <ReportPageBase
      title={title || 'Property Photos'}
      sidebarLabel="PHOTO"
      pageNumber={pageNumber}
      sectionNumber={2}
      sectionTitle="PROPERTY"
      contentPadding="p-10"
    >
      {/* Photo grid */}
      <div className={`grid ${getGridClass()} flex-1`}>
        {displayPhotos.map((photo, index) => (
          <div 
            key={photo.id}
            className={`flex flex-col ${
              isEditing ? 'cursor-pointer group' : ''
            }`}
            onClick={() => isEditing && onPhotoClick?.(photo.id)}
          >
            <div className={`relative ${getPhotoHeight()} bg-slate-100 rounded-lg overflow-hidden`}>
              <img
                src={photo.url}
                alt={photo.caption || `Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Click to edit</span>
                </div>
              )}
            </div>
            {photo.caption && (
              <p className="text-[10px] text-slate-600 text-center mt-1 line-clamp-2">
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
              <div className={`${getPhotoHeight()} bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center`}>
                <span className="text-xs text-slate-400">Empty slot</span>
              </div>
            </div>
          )
        )}
      </div>

      {/* Attribution footer */}
      {showAttribution && (takenBy || takenDate) && (
        <div className="mt-auto pt-3 text-center text-[10px] text-slate-500">
          {takenBy && `Photos by ${takenBy}`}
          {takenBy && takenDate && ' | '}
          {takenDate && `Taken ${new Date(takenDate).toLocaleDateString()}`}
        </div>
      )}
    </ReportPageBase>
  );
};

export default PhotoGridPage;
