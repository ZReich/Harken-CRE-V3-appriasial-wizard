import React from 'react';
import type { ContentBlock, ReportPhoto } from '../../../../types';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

interface CoverPageProps {
  content: ContentBlock[];
  coverPhoto?: ReportPhoto;
  logoUrl?: string;
  isEditing?: boolean;
  onContentClick?: (blockId: string) => void;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  content,
  coverPhoto,
  logoUrl,
  isEditing = false,
  onContentClick,
}) => {
  const rawData = content[0]?.content as {
    propertyName?: string;
    address?: string;
    reportDate?: string;
    effectiveDate?: string;
    propertyType?: string;
  } | undefined;
  
  // Use sample data as fallback
  const sample = sampleAppraisalData;
  const hasWizardData = rawData?.propertyName && rawData.propertyName.length > 0;
  
  const coverData = hasWizardData ? rawData : {
    propertyName: sample.property.name,
    address: sample.property.fullAddress,
    reportDate: sample.assignment.reportDate,
    effectiveDate: sample.assignment.effectiveDate,
    propertyType: sample.property.propertyType,
  };
  
  // Use sample cover photo if none provided
  const displayPhoto = coverPhoto || (sample.photos.length > 0 ? {
    id: sample.photos[0].id,
    url: sample.photos[0].url,
    caption: sample.photos[0].caption,
    category: 'exterior' as const,
    sortOrder: 0,
  } : undefined);

  return (
    <div className="w-full h-full relative bg-slate-900 text-white overflow-hidden">
      {/* Background photo */}
      {displayPhoto && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${displayPhoto.url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/30" />
        </div>
      )}
      
      {/* Default gradient background if no photo */}
      {!displayPhoto && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      )}

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col p-12">
        {/* Top section - Logo */}
        <div className="flex justify-between items-start">
          {logoUrl ? (
            <img src={logoUrl} alt="Company Logo" className="h-16 object-contain" />
          ) : (
            <div className="text-2xl font-bold tracking-tight text-white/90">
              ROVE EVALUATIONS
            </div>
          )}
        </div>

        {/* Center section - Title */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="text-sm font-medium tracking-widest text-sky-400 uppercase">
              Commercial Appraisal Report
            </div>
            
            <h1 
              className={`text-4xl md:text-5xl font-bold leading-tight ${
                isEditing ? 'cursor-pointer hover:bg-surface-1/10 rounded px-2 -mx-2' : ''
              }`}
              onClick={() => isEditing && onContentClick?.('cover-title')}
            >
              {coverData?.propertyName || 'Subject Property'}
            </h1>
            
            <p 
              className={`text-xl text-white/80 ${
                isEditing ? 'cursor-pointer hover:bg-surface-1/10 rounded px-2 -mx-2' : ''
              }`}
              onClick={() => isEditing && onContentClick?.('cover-address')}
            >
              {coverData?.address || 'Address Not Specified'}
            </p>
          </div>
        </div>

        {/* Bottom section - Details */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
          <div>
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
              Property Type
            </div>
            <div className="text-lg font-medium">
              {coverData?.propertyType || 'Commercial'}
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
              Effective Date
            </div>
            <div className="text-lg font-medium">
              {coverData?.effectiveDate 
                ? new Date(coverData.effectiveDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Not Specified'
              }
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
              Report Date
            </div>
            <div className="text-lg font-medium">
              {coverData?.reportDate 
                ? new Date(coverData.reportDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Not Specified'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;

