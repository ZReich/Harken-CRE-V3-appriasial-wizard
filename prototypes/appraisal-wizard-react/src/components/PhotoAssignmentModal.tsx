import { useState, useMemo } from 'react';
import { 
  X, 
  Check, 
  CheckCircle, 
  ChevronDown,
  Sparkles,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { PHOTO_SLOTS } from '../services/photoClassification';

interface PhotoAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (assignments: Record<string, string>) => void; // photoId -> slotId
  existingSlotAssignments: Record<string, string>; // slotId -> photoId
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-green-600';
  if (confidence >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function getConfidenceBg(confidence: number): string {
  if (confidence >= 80) return 'bg-green-100';
  if (confidence >= 50) return 'bg-amber-100';
  return 'bg-red-100';
}

export default function PhotoAssignmentModal({
  isOpen,
  onClose,
  onApply,
  existingSlotAssignments,
}: PhotoAssignmentModalProps) {
  const { getStagingPhotos } = useWizard();
  
  // Get photos that need assignment
  const stagingPhotos = getStagingPhotos().filter(p => !p.assignedSlot && p.status === 'classified');
  
  // Track local assignments (photoId -> slotId)
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    stagingPhotos.forEach(photo => {
      const topSuggestion = photo.suggestions?.[0];
      if (topSuggestion) {
        initial[photo.id] = topSuggestion.slotId;
      }
    });
    return initial;
  });

  // Check for conflicts (multiple photos assigned to same slot)
  const conflicts = useMemo(() => {
    const slotCounts: Record<string, string[]> = {};
    Object.entries(assignments).forEach(([photoId, slotId]) => {
      if (!slotCounts[slotId]) slotCounts[slotId] = [];
      slotCounts[slotId].push(photoId);
    });
    return Object.entries(slotCounts)
      .filter(([, photoIds]) => photoIds.length > 1)
      .reduce((acc, [slotId, photoIds]) => {
        acc[slotId] = photoIds;
        return acc;
      }, {} as Record<string, string[]>);
  }, [assignments]);

  const hasConflicts = Object.keys(conflicts).length > 0;

  // Group slots by category for dropdown
  const slotsByCategory = useMemo(() => {
    return PHOTO_SLOTS.reduce((acc, slot) => {
      if (!acc[slot.categoryLabel]) acc[slot.categoryLabel] = [];
      acc[slot.categoryLabel].push(slot);
      return acc;
    }, {} as Record<string, typeof PHOTO_SLOTS>);
  }, []);

  const handleSlotChange = (photoId: string, slotId: string) => {
    setAssignments(prev => ({
      ...prev,
      [photoId]: slotId,
    }));
  };

  const handleRemoveAssignment = (photoId: string) => {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[photoId];
      return next;
    });
  };

  const handleApply = () => {
    if (!hasConflicts) {
      onApply(assignments);
      onClose();
    }
  };

  const handleAcceptAllSuggestions = () => {
    const newAssignments: Record<string, string> = {};
    const usedInBatch = new Set(Object.keys(existingSlotAssignments));
    
    stagingPhotos.forEach(photo => {
      const topSuggestion = photo.suggestions?.[0];
      if (topSuggestion && !usedInBatch.has(topSuggestion.slotId)) {
        newAssignments[photo.id] = topSuggestion.slotId;
        usedInBatch.add(topSuggestion.slotId);
      }
    });
    
    setAssignments(newAssignments);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0da1c7]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1c3643]">Review Photo Assignments</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {stagingPhotos.length} photos analyzed - review and confirm assignments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              AI has suggested assignments based on photo content analysis
            </p>
            <button
              onClick={handleAcceptAllSuggestions}
              className="flex items-center gap-2 px-4 py-2 bg-[#0da1c7] hover:bg-[#0b8ba8] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Accept All AI Suggestions
            </button>
          </div>

          {/* Conflict Warning */}
          {hasConflicts && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Slot conflicts detected
                </p>
                <p className="text-sm text-red-600">
                  Multiple photos are assigned to the same slot. Please resolve before applying.
                </p>
              </div>
            </div>
          )}

          {/* Photo List */}
          <div className="space-y-3">
            {stagingPhotos.map(photo => {
              const currentSlot = assignments[photo.id];
              const topSuggestion = photo.suggestions?.[0];
              const isConflict = currentSlot && Object.values(conflicts).some(ids => ids.includes(photo.id));

              return (
                <div
                  key={photo.id}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg border transition-colors
                    ${isConflict ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}
                  `}
                >
                  {/* Drag Handle */}
                  <div className="text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={photo.preview}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Photo Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{photo.filename}</p>
                    {topSuggestion && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-slate-400">AI Suggestion:</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(topSuggestion.confidence)}`}>
                          {topSuggestion.slotLabel}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getConfidenceBg(topSuggestion.confidence)} ${getConfidenceColor(topSuggestion.confidence)}`}>
                          {Math.round(topSuggestion.confidence)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Slot Selector */}
                  <div className="relative w-64">
                    <select
                      value={currentSlot || ''}
                      onChange={(e) => handleSlotChange(photo.id, e.target.value)}
                      className={`
                        w-full px-3 py-2 pr-10 border rounded-lg text-sm appearance-none cursor-pointer
                        focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent
                        ${isConflict ? 'border-red-300 bg-white' : 'border-gray-300 bg-white'}
                      `}
                    >
                      <option value="">Select slot...</option>
                      {Object.entries(slotsByCategory).map(([category, slots]) => (
                        <optgroup key={category} label={category}>
                          {slots.map(slot => {
                            const isUsed = existingSlotAssignments[slot.id] !== undefined;
                            return (
                              <option
                                key={slot.id}
                                value={slot.id}
                                disabled={isUsed}
                              >
                                {slot.label} {isUsed ? '(in use)' : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Match Indicator */}
                  {currentSlot && topSuggestion && currentSlot === topSuggestion.slotId && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Matched</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveAssignment(photo.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Skip this photo"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>

          {stagingPhotos.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
              <p>No photos waiting for assignment</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {Object.keys(assignments).length} of {stagingPhotos.length} photos will be assigned
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={hasConflicts || Object.keys(assignments).length === 0}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                ${hasConflicts || Object.keys(assignments).length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#0da1c7] hover:bg-[#0b8ba8] text-white'
                }
              `}
            >
              <CheckCircle className="w-4 h-4" />
              Apply {Object.keys(assignments).length} Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

