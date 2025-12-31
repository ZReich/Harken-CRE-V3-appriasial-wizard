import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import type { PhotoData } from '../types';

interface PhotoLivePreviewProps {
  photos: Record<string, PhotoData | null>;
  defaultTakenBy?: string;
  defaultTakenDate?: string;
}

export const PhotoLivePreview: React.FC<PhotoLivePreviewProps> = ({
  photos,
  defaultTakenBy = '',
  defaultTakenDate = '',
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Organize photos into pages
  const pages = useMemo(() => {
    const result: Array<{
      title: string;
      pageNumber: number;
      photos: Array<{ id: string; photo: PhotoData | null; label: string }>;
    }> = [];

    // Page 1: Aerial + first 2 exterior
    result.push({
      title: 'Subject Property Photos - Aerial & Exterior',
      pageNumber: 53,
      photos: [
        { id: 'aerial_main', photo: photos['aerial_main'], label: 'Aerial View' },
        { id: 'ext_front', photo: photos['ext_front'], label: 'Front Elevation' },
        { id: 'ext_rear', photo: photos['ext_rear'], label: 'Rear Elevation' },
        { id: 'ext_side_1', photo: photos['ext_side_1'], label: 'Side Elevation' },
        { id: 'ext_side_2', photo: photos['ext_side_2'], label: 'Side Elevation' },
        { id: 'ext_additional_1', photo: photos['ext_additional_1'], label: 'Exterior' },
      ],
    });

    // Page 2: Interior photos (first 6)
    result.push({
      title: 'Subject Property Photos - Interior',
      pageNumber: 54,
      photos: [
        { id: 'int_lobby', photo: photos['int_lobby'], label: 'Lobby' },
        { id: 'int_office', photo: photos['int_office'], label: 'Office' },
        { id: 'int_conference', photo: photos['int_conference'], label: 'Conference' },
        { id: 'int_shop', photo: photos['int_shop'], label: 'Shop/Warehouse' },
        { id: 'int_bathroom', photo: photos['int_bathroom'], label: 'Bathroom' },
        { id: 'int_mechanical', photo: photos['int_mechanical'], label: 'Mechanical' },
      ],
    });

    // Page 3: More interior + site
    result.push({
      title: 'Subject Property Photos - Interior & Site',
      pageNumber: 55,
      photos: [
        { id: 'int_mezzanine', photo: photos['int_mezzanine'], label: 'Mezzanine' },
        { id: 'int_kitchen', photo: photos['int_kitchen'], label: 'Kitchen' },
        { id: 'site_parking', photo: photos['site_parking'], label: 'Parking' },
        { id: 'site_yard_n', photo: photos['site_yard_n'], label: 'Yard North' },
        { id: 'site_yard_s', photo: photos['site_yard_s'], label: 'Yard South' },
        { id: 'street_east', photo: photos['street_east'], label: 'Street East' },
      ],
    });

    // Page 4: Remaining photos
    result.push({
      title: 'Subject Property Photos - Site & Street',
      pageNumber: 56,
      photos: [
        { id: 'site_yard_e', photo: photos['site_yard_e'], label: 'Yard East' },
        { id: 'site_yard_w', photo: photos['site_yard_w'], label: 'Yard West' },
        { id: 'street_west', photo: photos['street_west'], label: 'Street West' },
        { id: 'int_additional_1', photo: photos['int_additional_1'], label: 'Interior' },
        { id: 'int_additional_2', photo: photos['int_additional_2'], label: 'Interior' },
        { id: 'ext_additional_2', photo: photos['ext_additional_2'], label: 'Exterior' },
      ],
    });

    return result;
  }, [photos]);

  const activePage = pages[currentPage];
  const uploadedCount = Object.values(photos).filter(Boolean).length;

  // Get attribution from first photo with data
  const getAttribution = () => {
    for (const photo of Object.values(photos)) {
      if (photo) {
        const takenBy = photo.takenBy || defaultTakenBy;
        const date = photo.takenDate || defaultTakenDate;
        if (takenBy || date) {
          return { takenBy, date };
        }
      }
    }
    return { takenBy: defaultTakenBy, date: defaultTakenDate };
  };

  const attribution = getAttribution();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#0da1c7]/20 flex items-center justify-center">
          <Camera className="w-4 h-4 text-[#0da1c7]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1c3643]">Live Preview</h3>
          <p className="text-xs text-gray-500">{uploadedCount} photos uploaded</p>
        </div>
      </div>

      {/* Mini Report Page */}
      <div 
        className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      >
        {/* Rove Header Bar */}
        <div className="bg-[#1E4A3F] text-white px-3 py-2 flex-shrink-0">
          <h4 className="text-xs font-semibold truncate">{activePage.title}</h4>
        </div>

        {/* Photo Grid (6-up layout) */}
        <div className="flex-1 p-3 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 h-full">
            {activePage.photos.map(({ id, photo, label }) => (
              <div 
                key={id}
                className={`rounded overflow-hidden flex flex-col ${
                  photo 
                    ? 'bg-slate-100' 
                    : 'bg-slate-50 border border-dashed border-slate-200'
                }`}
              >
                <div className="flex-1 min-h-0 relative">
                  {photo ? (
                    <img
                      src={photo.preview}
                      alt={photo.caption || label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[8px] text-slate-300">Empty</span>
                    </div>
                  )}
                </div>
                <div className="px-1 py-0.5 text-center flex-shrink-0">
                  <p className="text-[8px] text-slate-600 truncate">
                    {photo?.caption || label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attribution Footer */}
        {(attribution.takenBy || attribution.date) && (
          <div className="px-3 py-1.5 border-t border-slate-100 flex-shrink-0">
            <p className="text-[9px] text-slate-500 text-center truncate">
              {attribution.takenBy && `Taken By: ${attribution.takenBy}`}
              {attribution.takenBy && attribution.date && ', '}
              {attribution.date && new Date(attribution.date).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className={`p-1.5 rounded-lg transition-colors ${
            currentPage === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            Page {activePage.pageNumber}
          </span>
          <div className="flex gap-1">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentPage
                    ? 'bg-[#0da1c7]'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className={`p-1.5 rounded-lg transition-colors ${
            currentPage === pages.length - 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-3 p-2 bg-gradient-to-r from-[#0da1c7]/10 to-transparent rounded-lg">
        <p className="text-[10px] text-[#1c3643]">
          <span className="font-medium">Real-time preview</span> — Photos update live as you upload them
        </p>
      </div>
    </div>
  );
};

export default PhotoLivePreview;

