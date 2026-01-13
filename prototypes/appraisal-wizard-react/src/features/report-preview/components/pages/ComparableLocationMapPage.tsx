/**
 * ComparableLocationMapPage - Map Exhibit for Report
 * ====================================================
 * 
 * Renders a full-page map exhibit showing the subject property
 * and all comparables with numbered pins. One page per approach.
 * 
 * Features:
 * - Full-page layout optimized for 8.5x11 format
 * - Subject property with distinct red marker
 * - Numbered pins for each comparable
 * - Legend with addresses
 * - Scale bar and north arrow (visual only)
 */

import React from 'react';
import type { ComparableMapData } from '../../../review/types';
import { ReportPageBase } from './ReportPageBase';

interface ComparableLocationMapPageProps {
  data: ComparableMapData;
  pageNumber?: number;
  scenarioName?: string;
}

/**
 * Gets the approach title based on type
 */
const getApproachTitle = (type: ComparableMapData['approachType']): string => {
  switch (type) {
    case 'land':
      return 'Land Sales Location Map';
    case 'sales':
      return 'Sales Comparison Location Map';
    case 'rent':
      return 'Rent Comparable Location Map';
    default:
      return 'Comparable Location Map';
  }
};

/**
 * Gets the scenario color based on name
 */
const getScenarioColor = (scenarioId: number): string => {
  // Simple mapping based on scenario ID
  if (scenarioId === 1) return '#3b82f6'; // blue - As Is
  if (scenarioId === 2) return '#22c55e'; // green - As Completed
  return '#a855f7'; // purple - As Stabilized
};

export const ComparableLocationMapPage: React.FC<ComparableLocationMapPageProps> = ({
  data,
  pageNumber = 1,
  scenarioName,
}) => {
  const { approachType, scenarioId, imageUrl, subjectPin, comparablePins } = data;
  const scenarioColor = getScenarioColor(scenarioId);
  const title = getApproachTitle(approachType);

  const getSidebarLabel = () => {
    switch (approachType) {
      case 'land': return 'LAND MAP';
      case 'sales': return 'SALES MAP';
      case 'rent': return 'RENT MAP';
      default: return 'COMP MAP';
    }
  };

  return (
    <ReportPageBase
      title={title}
      sidebarLabel={getSidebarLabel()}
      pageNumber={pageNumber}
      sectionNumber={6}
      sectionTitle="VALUATION"
      contentPadding="p-10"
    >
      {/* Map Image Container */}
      <div
        className="relative bg-slate-100 rounded-lg overflow-hidden mb-4"
        style={{ height: '6.5in' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <svg
              className="w-16 h-16 mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm">Map not captured</p>
            <p className="text-xs mt-1">
              Return to the wizard to capture the location map
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Legend
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Subject Property */}
          <div className="flex items-start gap-2">
            <span
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full text-xs font-bold"
            >
              S
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800">Subject Property</p>
              <p className="text-xs text-slate-500 truncate" title={subjectPin.address}>
                {subjectPin.address}
              </p>
            </div>
          </div>

          {/* Comparable Properties */}
          {comparablePins.map((pin) => (
            <div key={pin.id} className="flex items-start gap-2">
              <span
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white rounded-full text-xs font-bold"
                style={{ backgroundColor: scenarioColor }}
              >
                {pin.number}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800">
                  Comparable {pin.number}
                </p>
                <p className="text-xs text-slate-500 truncate" title={pin.address}>
                  {pin.address}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>
          {comparablePins.length} comparable{comparablePins.length !== 1 ? 's' : ''} shown
        </span>
        <span>Map generated by Harken Appraisal Platform</span>
      </div>
    </ReportPageBase>
  );
};

export default ComparableLocationMapPage;
