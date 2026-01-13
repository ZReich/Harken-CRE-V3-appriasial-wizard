import React from 'react';

interface AddendaHeaderPageProps {
  title?: string;
  subtitle?: string;
  pageNumber?: number;
}

export const AddendaHeaderPage: React.FC<AddendaHeaderPageProps> = ({
  title = 'ADDENDA',
  subtitle,
  pageNumber,
}) => {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center">
      {/* Decorative element top */}
      <div className="w-24 h-1 bg-slate-800 mb-12" />
      
      {/* Main title */}
      <h1 className="text-5xl font-bold text-slate-800 tracking-widest text-center">
        {title}
      </h1>
      
      {/* Subtitle if provided */}
      {subtitle && (
        <p className="text-lg text-slate-500 mt-4">
          {subtitle}
        </p>
      )}
      
      {/* Decorative element bottom */}
      <div className="w-24 h-1 bg-slate-800 mt-12" />

      {/* Page number at bottom */}
      {pageNumber && (
        <div className="absolute bottom-8 right-16">
          <span className="text-sm text-slate-400">Page {pageNumber}</span>
        </div>
      )}
    </div>
  );
};

export default AddendaHeaderPage;

