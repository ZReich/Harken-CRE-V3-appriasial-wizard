import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Check, 
  Star,
  Home,
  Sofa,
  Trees,
  Route,
  ImageIcon
} from 'lucide-react';
import type { CoverPhotoData } from '../types';

interface PhotoData {
  file?: File;      // Optional - may not be present for loaded/imported photos
  preview: string;
  caption?: string;
  takenBy?: string;
  takenDate?: string;
}

interface CoverPhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photo: CoverPhotoData) => void;
  uploadedPhotos: Record<string, PhotoData | null>;
}

// Category configuration
const CATEGORIES = [
  { id: 'all', label: 'All Photos', Icon: ImageIcon },
  { id: 'exterior', label: 'Exterior', Icon: Home },
  { id: 'interior', label: 'Interior', Icon: Sofa },
  { id: 'site', label: 'Site', Icon: Trees },
  { id: 'street', label: 'Street', Icon: Route },
];

// Slot to category mapping
function getSlotCategory(slotId: string): string {
  if (slotId.startsWith('ext_')) return 'exterior';
  if (slotId.startsWith('int_')) return 'interior';
  if (slotId.startsWith('site_')) return 'site';
  if (slotId.startsWith('street_')) return 'street';
  return 'other';
}

// Slot label mapping
function getSlotLabel(slotId: string): string {
  const labels: Record<string, string> = {
    ext_front: 'Front Elevation',
    ext_rear: 'Rear Elevation',
    ext_side_1: 'Side Elevation (Left)',
    ext_side_2: 'Side Elevation (Right)',
    ext_additional_1: 'Additional Exterior',
    ext_additional_2: 'Additional Exterior',
    int_lobby: 'Lobby/Reception',
    int_office: 'Office Space',
    int_conference: 'Conference Room',
    int_shop: 'Shop/Warehouse',
    int_bathroom: 'Bathroom',
    int_mechanical: 'Mechanical Room',
    int_kitchen: 'Kitchen/Break Room',
    int_hallway: 'Hallway/Corridor',
    int_storage: 'Storage',
    int_additional_1: 'Additional Interior',
    int_additional_2: 'Additional Interior',
    int_additional_3: 'Additional Interior',
    site_parking: 'Parking Area',
    site_landscaping: 'Landscaping',
    site_signage: 'Signage',
    site_rear_yard: 'Rear Yard',
    site_additional: 'Additional Site',
    street_front: 'Street View (Front)',
    street_context: 'Street Context',
  };
  return labels[slotId] || slotId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function CoverPhotoPickerModal({
  isOpen,
  onClose,
  onSelect,
  uploadedPhotos,
}: CoverPhotoPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Get available photos grouped by category
  const photos = useMemo(() => {
    const result: Array<{
      slotId: string;
      category: string;
      label: string;
      photo: PhotoData;
      isRecommended: boolean;
    }> = [];

    Object.entries(uploadedPhotos).forEach(([slotId, photo]) => {
      if (photo) {
        const category = getSlotCategory(slotId);
        result.push({
          slotId,
          category,
          label: getSlotLabel(slotId),
          photo,
          // Recommend front elevation for cover
          isRecommended: slotId === 'ext_front',
        });
      }
    });

    // Sort: recommended first, then by category, then by slot ID
    return result.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.slotId.localeCompare(b.slotId);
    });
  }, [uploadedPhotos]);

  // Filter photos by category
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos;
    return photos.filter(p => p.category === activeCategory);
  }, [photos, activeCategory]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: photos.length };
    photos.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [photos]);

  const handleSelect = () => {
    if (selectedSlotId) {
      const photoData = photos.find(p => p.slotId === selectedSlotId);
      if (photoData) {
        onSelect({
          id: `cover_from_${selectedSlotId}`,
          preview: photoData.photo.preview,
          sourceSlotId: selectedSlotId,
          caption: photoData.label,
        });
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-[#0da1c7]/10 to-cyan-100/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0da1c7] to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Select Cover Photo</h2>
                <p className="text-sm text-slate-500">Choose from your uploaded photos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = activeCategory === cat.id;
              const Icon = cat.Icon;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  disabled={count === 0 && cat.id !== 'all'}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[#0da1c7] text-white shadow-lg shadow-[#0da1c7]/30' 
                      : count > 0 || cat.id === 'all'
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-slate-300 cursor-not-allowed'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  {count > 0 && (
                    <span className={`
                      px-1.5 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <ImageIcon className="w-12 h-12 mb-3" />
              <p className="font-medium">No photos in this category</p>
              <p className="text-sm">Upload photos in the sections below first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((item, index) => {
                const isSelected = selectedSlotId === item.slotId;
                
                return (
                  <button
                    key={item.slotId}
                    onClick={() => setSelectedSlotId(item.slotId)}
                    className={`
                      relative group rounded-xl overflow-hidden border-2 transition-all duration-200
                      animate-in fade-in slide-in-from-bottom-2
                      ${isSelected 
                        ? 'border-[#0da1c7] ring-2 ring-[#0da1c7]/30 scale-[1.02]' 
                        : 'border-slate-200 hover:border-[#0da1c7]/50 hover:shadow-lg'
                      }
                    `}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Photo */}
                    <div className="aspect-[4/3] bg-slate-100">
                      <img
                        src={item.photo.preview}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Label */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                      <p className="text-sm font-medium text-white truncate">{item.label}</p>
                    </div>

                    {/* Recommended badge */}
                    {item.isRecommended && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                        <Star className="w-3 h-3" />
                        Recommended
                      </div>
                    )}

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0da1c7] flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className={`
                      absolute inset-0 bg-[#0da1c7]/10 transition-opacity
                      ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {selectedSlotId 
              ? `Selected: ${photos.find(p => p.slotId === selectedSlotId)?.label}`
              : 'Click a photo to select it'
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedSlotId}
              className={`
                flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all
                ${selectedSlotId
                  ? 'bg-[#0da1c7] hover:bg-[#0b8fb3] text-white shadow-lg shadow-[#0da1c7]/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <Check className="w-4 h-4" />
              Use as Cover
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

