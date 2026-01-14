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

import React, { useMemo } from 'react';
import type { ComparableMapData } from '../../../review/types';
import { ReportPageBase } from './ReportPageBase';
import { calculateBoundsZoom, generateStaticMapUrl, MARKER_COLORS } from '../../../../services/mapGenerationService';
import type { MapMarker, MapMarkerType } from '../../../../types';

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

  const approachMarkerType = useMemo(() => {
    if (approachType === 'land') return 'land-sale';
    if (approachType === 'rent') return 'rental';
    return 'improved-sale';
  }, [approachType]);

  // If no captured image, generate a Google Static Maps URL (if VITE_GOOGLE_MAPS_API_KEY is configured).
  // This makes map pages "built-in" and not dependent on manual capture.
  const generatedImageUrl = useMemo(() => {
    if (imageUrl) return imageUrl;

    const markers: MapMarker[] = [
      {
        id: 'subject',
        lat: subjectPin.lat,
        lng: subjectPin.lng,
        label: 'Subject',
        type: 'subject',
        color: MARKER_COLORS.subject,
        address: subjectPin.address,
      },
      ...comparablePins.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        label: `Comp ${p.number}`,
        type: approachMarkerType as MapMarkerType,
        color: MARKER_COLORS[approachMarkerType as MapMarkerType],
        number: p.number,
        address: p.address,
      })),
    ];

    const { center, zoom } = calculateBoundsZoom(markers);

    const url = generateStaticMapUrl({
      center,
      zoom,
      markers,
      mapType: 'roadmap',
      size: { width: 1000, height: 700 },
    });

    if (url) return url;

    // Fallback: lightweight schematic map SVG with pins when no API key is configured.
    const pinDots = comparablePins
      .map((p, idx) => {
        const x = 220 + idx * 180;
        const y = 210 + ((idx % 2) * 140);
        return `<circle cx="${x}" cy="${y}" r="14" fill="${scenarioColor}" /><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" fill="white" font-family="Arial" font-weight="700">${p.number}</text>`;
      })
      .join('');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f1f5f9" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>
        </defs>
        <rect width="1000" height="700" fill="url(#bg)" />
        <rect x="60" y="60" width="880" height="520" rx="18" fill="white" stroke="#cbd5e1" />
        <path d="M120 420 C 260 260, 420 500, 560 320 C 700 140, 820 280, 900 220" fill="none" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
        <circle cx="160" cy="240" r="16" fill="${MARKER_COLORS.subject}" />
        <text x="160" y="246" text-anchor="middle" font-size="12" fill="white" font-family="Arial" font-weight="700">S</text>
        ${pinDots}
        <text x="500" y="635" text-anchor="middle" font-size="14" fill="#64748b" font-family="Arial">
          Map preview (configure VITE_GOOGLE_MAPS_API_KEY to render a real static map)
        </text>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }, [approachMarkerType, approachType, comparablePins, imageUrl, scenarioColor, subjectPin.address, subjectPin.lat, subjectPin.lng]);

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
        {generatedImageUrl ? (
          <img
            src={generatedImageUrl}
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
