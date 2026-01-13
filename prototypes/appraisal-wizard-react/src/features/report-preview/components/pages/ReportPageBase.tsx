/**
 * ReportPageBase - Shared Page Wrapper Component
 * ================================================
 * 
 * Provides consistent page structure for all report pages:
 * - Teal sidebar (80px) with vertical section label
 * - Blue header line with title
 * - Dimensions: 8.5in x 11in (US Letter)
 * - Section badge in top-right (e.g., "SECTION 7 • VALUE")
 * - Footer with "ROVE Valuations | Page X"
 * 
 * Usage:
 * <ReportPageBase
 *   title="Market Analysis"
 *   sidebarLabel="ANALYSIS"
 *   sectionNumber={7}
 *   sectionTitle="VALUE"
 *   pageNumber={15}
 * >
 *   {page content}
 * </ReportPageBase>
 */

import React from 'react';

interface ReportPageBaseProps {
  /** Page title displayed in the header */
  title: string;
  /** Vertical text displayed in the sidebar */
  sidebarLabel?: string;
  /** Page number for footer */
  pageNumber?: number;
  /** Section number for the badge (e.g., 7) */
  sectionNumber?: number;
  /** Section title for the badge (e.g., "VALUE") */
  sectionTitle?: string;
  /** Legacy: Optional section badge text (overrides sectionNumber/sectionTitle) */
  sectionBadge?: string;
  /** Children content */
  children: React.ReactNode;
  /** Optional: hide sidebar for special layouts */
  hideSidebar?: boolean;
  /** Optional: hide header for special layouts */
  hideHeader?: boolean;
  /** Optional: custom padding for content area */
  contentPadding?: string;
}

export const ReportPageBase: React.FC<ReportPageBaseProps> = ({
  title,
  sidebarLabel,
  pageNumber,
  sectionNumber,
  sectionTitle,
  sectionBadge,
  children,
  hideSidebar = false,
  hideHeader = false,
  contentPadding = 'p-10',
}) => {
  // Brand color - consistent teal/blue
  const brandColor = '#0da1c7';

  // Build section badge text
  const getBadgeText = () => {
    if (sectionBadge) return sectionBadge;
    if (sectionNumber && sectionTitle) {
      return `SECTION ${sectionNumber} • ${sectionTitle}`;
    }
    if (sectionTitle) return sectionTitle;
    return null;
  };

  const badgeText = getBadgeText();

  if (hideSidebar) {
    // Simple layout without sidebar
    return (
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden relative"
        style={{
          width: '8.5in',
          minHeight: '11in',
        }}
      >
        {/* Section Badge */}
        {badgeText && (
          <div
            className="absolute top-6 right-8 text-white px-4 py-2 rounded text-xs font-semibold"
            style={{ backgroundColor: brandColor }}
          >
            {badgeText}
          </div>
        )}

        {/* Header */}
        {!hideHeader && (
          <div
            className="border-b-2 px-12 pt-12 pb-4"
            style={{ borderColor: brandColor }}
          >
            <h2 className="text-2xl font-light text-slate-800">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className={`${contentPadding}`}>
          {children}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 right-8 text-xs text-slate-500 flex items-center gap-4">
          <span>ROVE Valuations</span>
          <span>|</span>
          <span>Page {pageNumber || ''}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white shadow-lg rounded-lg overflow-hidden"
      style={{
        width: '8.5in',
        minHeight: '11in',
      }}
    >
      <div className="grid grid-cols-[80px_1fr]" style={{ minHeight: '11in' }}>
        {/* Teal Sidebar */}
        <div
          className="text-white flex items-center justify-center relative"
          style={{ backgroundColor: brandColor }}
        >
          {/* Page number at top of sidebar */}
          {pageNumber && (
            <div className="absolute top-8 text-center">
              <span className="text-xs font-bold tracking-wider">
                {pageNumber}
              </span>
            </div>
          )}
          
          {/* Vertical section label */}
          {sidebarLabel && (
            <span
              className="text-4xl font-bold tracking-widest"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              {sidebarLabel}
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Section Badge */}
          {badgeText && (
            <div
              className="absolute top-6 right-8 text-white px-4 py-2 rounded text-xs font-semibold z-10"
              style={{ backgroundColor: brandColor }}
            >
              {badgeText}
            </div>
          )}

          {/* Content with header */}
          <div className={contentPadding}>
            {/* Title */}
            {!hideHeader && (
              <h2 className="text-2xl font-light text-slate-800 mb-2 mt-8">{title}</h2>
            )}
            
            {/* Page Content */}
            {children}
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 right-8 text-xs text-slate-500 flex items-center gap-4">
            <span>ROVE Valuations</span>
            <span>|</span>
            <span>Page {pageNumber || ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPageBase;
