/**
 * CostSegPhotoLinker Component
 * 
 * Reusable component for linking photos to cost segregation items (refinements or supplements).
 * Features AI-powered suggestions based on photo classification.
 */

import React, { useState, useMemo } from 'react';
import { Image, Plus, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface CostSegPhotoLinkerProps {
  /** Currently linked photo IDs */
  linkedPhotoIds?: string[];
  /** Available photos to choose from */
  availablePhotos: Photo[];
  /** Item description for display */
  itemDescription: string;
  /** Callback when photos are updated */
  onUpdatePhotos: (photoIds: string[]) => void;
  /** Optional label for the section */
  label?: string;
  /** Maximum number of photos allowed */
  maxPhotos?: number;
  /** Show AI suggestions (TODO: implement AI matching) */
  showAISuggestions?: boolean;
}

export const CostSegPhotoLinker: React.FC<CostSegPhotoLinkerProps> = ({
  linkedPhotoIds = [],
  availablePhotos,
  itemDescription,
  onUpdatePhotos,
  label = 'Linked Photos',
  maxPhotos = 5,
  showAISuggestions = false, // Disabled for now until AI functions are integrated
}) => {
  const [isSelectingPhoto, setIsSelectingPhoto] = useState(false);

  // TODO: Implement AI suggestions using analyzeCostSegComponents and matchPhotoToCostSegItems
  // from photoClassification.ts when those functions are fully integrated
  const aiSuggestions: any[] = [];

  const linkedPhotos = useMemo(() => {
    return availablePhotos.filter(p => linkedPhotoIds.includes(p.id));
  }, [availablePhotos, linkedPhotoIds]);

  const availableUnlinkedPhotos = useMemo(() => {
    return availablePhotos.filter(p => !linkedPhotoIds.includes(p.id));
  }, [availablePhotos, linkedPhotoIds]);

  const handleAddPhoto = (photoId: string) => {
    if (linkedPhotoIds.length >= maxPhotos) {
      return; // Max photos reached
    }
    onUpdatePhotos([...linkedPhotoIds, photoId]);
    setIsSelectingPhoto(false);
  };

  const handleRemovePhoto = (photoId: string) => {
    onUpdatePhotos(linkedPhotoIds.filter(id => id !== photoId));
  };

  const handleAcceptSuggestion = (photoId: string) => {
    handleAddPhoto(photoId);
  };

  const canAddMore = linkedPhotoIds.length < maxPhotos;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {canAddMore && (
          <button
            onClick={() => setIsSelectingPhoto(!isSelectingPhoto)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Photo
          </button>
        )}
      </div>

      {/* AI Suggestions - Placeholder for future implementation */}
      {showAISuggestions && aiSuggestions.length > 0 && canAddMore && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-900">AI photo suggestions will appear here</span>
          </div>
        </div>
      )}

      {/* Linked Photos Grid */}
      {linkedPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {linkedPhotos.map(photo => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt={photo.caption || 'Linked photo'}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => handleRemovePhoto(photo.id)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg truncate">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No photos linked */}
      {linkedPhotos.length === 0 && !isSelectingPhoto && (
        <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 border border-gray-200 border-dashed rounded-lg">
          <Image className="w-6 h-6 mx-auto mb-1 text-gray-400" />
          No photos linked yet
        </div>
      )}

      {/* Photo Selection Grid */}
      {isSelectingPhoto && (
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Select Photo</h4>
            <button
              onClick={() => setIsSelectingPhoto(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {availableUnlinkedPhotos.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              No photos available to link
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {availableUnlinkedPhotos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => handleAddPhoto(photo.id)}
                  className="relative group cursor-pointer hover:opacity-75 transition-opacity"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Available photo'}
                    className="w-full h-20 object-cover rounded border border-gray-300 hover:border-blue-500"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-0.5 rounded-b truncate">
                      {photo.caption}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Max photos reached */}
      {linkedPhotoIds.length >= maxPhotos && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Maximum of {maxPhotos} photos reached
        </div>
      )}
    </div>
  );
};

export default CostSegPhotoLinker;
