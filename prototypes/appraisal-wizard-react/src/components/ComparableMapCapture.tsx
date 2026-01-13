/**
 * ComparableMapCapture - Map Screenshot Capture for Report
 * =========================================================
 * 
 * A component that displays an interactive map with comparable pins
 * and allows users to capture a screenshot for the report.
 * 
 * Features:
 * - Shows subject property with distinct marker
 * - Shows numbered pins for each comparable
 * - Capture button to take screenshot
 * - Stores image URL in wizard state
 * 
 * Usage:
 * Place this component after each comparison grid in the wizard:
 * - After LandSalesGrid
 * - After SalesGrid
 * - After RentComparableGrid
 */

import React, { useState, useCallback, useRef } from 'react';
import { Camera, MapPin, Check, RefreshCw } from 'lucide-react';
import { useWizard } from '../context/WizardContext';

export type ApproachMapType = 'land-sales' | 'improved-sales' | 'rental-comps';

interface ComparablePin {
  id: string;
  number: number;
  address: string;
  lat?: number;
  lng?: number;
}

interface ComparableMapCaptureProps {
  /** Type of approach this map is for */
  approachType: ApproachMapType;
  /** Subject property address */
  subjectAddress?: string;
  /** Subject property coordinates */
  subjectLat?: number;
  subjectLng?: number;
  /** Comparable properties to show on map */
  comparables: ComparablePin[];
  /** Optional custom title */
  title?: string;
  /** Callback when map is captured */
  onCapture?: (imageUrl: string) => void;
}

/**
 * Gets the display title based on approach type
 */
function getApproachTitle(type: ApproachMapType): string {
  switch (type) {
    case 'land-sales':
      return 'Land Sales Location Map';
    case 'improved-sales':
      return 'Sales Comparison Location Map';
    case 'rental-comps':
      return 'Rent Comparable Location Map';
    default:
      return 'Comparable Location Map';
  }
}

export const ComparableMapCapture: React.FC<ComparableMapCaptureProps> = ({
  approachType,
  subjectAddress = 'Subject Property',
  subjectLat,
  subjectLng,
  comparables,
  title,
  onCapture,
}) => {
  const { dispatch, state } = useWizard();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(
    state.approachMaps[approachType]?.imageUrl || null
  );

  const displayTitle = title || getApproachTitle(approachType);

  /**
   * Captures the map as an image
   * In a real implementation, this would use html2canvas or similar
   * For now, we'll create a placeholder image with pins
   */
  const handleCapture = useCallback(async () => {
    setIsCapturing(true);
    
    try {
      // Simulate capture delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, we would use html2canvas:
      // const canvas = await html2canvas(mapContainerRef.current);
      // const imageUrl = canvas.toDataURL('image/png');
      
      // For now, create a placeholder data URL
      // This would be replaced with actual map screenshot
      const placeholderSvg = createPlaceholderMapSvg(
        subjectAddress,
        comparables.map(c => c.address)
      );
      const imageUrl = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
      
      setCapturedImageUrl(imageUrl);
      setIsCaptured(true);
      
      // Save to wizard state with proper MapData structure
      dispatch({
        type: 'SET_APPROACH_MAP',
        payload: {
          approachType,
          map: {
            id: `${approachType}-map`,
            type: approachType,
            title: displayTitle,
            source: 'generated' as const,
            center: { lat: 0, lng: 0 }, // Placeholder - actual coords from map
            zoom: 12,
            mapType: 'hybrid' as const,
            imageUrl,
            markers: comparables.map((comp, idx) => {
              const markerType = approachType === 'land-sales' ? 'land-sale' as const
                : approachType === 'rental-comps' ? 'rental' as const
                : 'improved-sale' as const;
              return {
                id: comp.id,
                lat: 0, // Placeholder - would come from geocoded address
                lng: 0,
                label: String(idx + 1),
                type: markerType,
                color: approachType === 'land-sales' ? '#f97316' : approachType === 'rental-comps' ? '#22c55e' : '#3b82f6',
                number: idx + 1,
                address: comp.address,
              };
            }),
            capturedAt: new Date().toISOString(),
            reportSections: [`${approachType}-section`],
          },
        },
      });
      
      onCapture?.(imageUrl);
    } catch (error) {
      console.error('Failed to capture map:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [approachType, comparables, dispatch, displayTitle, onCapture, subjectAddress]);

  /**
   * Resets the captured image to allow re-capture
   */
  const handleReset = useCallback(() => {
    setIsCaptured(false);
    setCapturedImageUrl(null);
    
    // Remove from wizard state
    dispatch({
      type: 'REMOVE_APPROACH_MAP',
      payload: approachType,
    });
  }, [approachType, dispatch]);

  return (
    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0da1c7]" />
          <h3 className="font-semibold text-slate-800">{displayTitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isCaptured ? (
            <>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="w-4 h-4" />
                Captured
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recapture
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={isCapturing || comparables.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#0da1c7] text-white rounded-md hover:bg-[#0b8fb0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Capture Map for Report
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Map Preview / Placeholder */}
      <div
        ref={mapContainerRef}
        className="relative bg-slate-100 rounded-lg overflow-hidden"
        style={{ height: '300px' }}
      >
        {capturedImageUrl ? (
          <img
            src={capturedImageUrl}
            alt={displayTitle}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <MapPin className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Map preview will appear here</p>
            <p className="text-xs mt-1">
              {comparables.length} comparable{comparables.length !== 1 ? 's' : ''} to display
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      {comparables.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {/* Subject Pin */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-bold">
              S
            </span>
            <span className="text-slate-600 truncate" title={subjectAddress}>
              {subjectAddress}
            </span>
          </div>
          
          {/* Comparable Pins */}
          {comparables.map((comp) => (
            <div key={comp.id} className="flex items-center gap-2 text-xs">
              <span className="w-5 h-5 flex items-center justify-center bg-[#0da1c7] text-white rounded-full text-[10px] font-bold">
                {comp.number}
              </span>
              <span className="text-slate-600 truncate" title={comp.address}>
                {comp.address}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {comparables.length === 0 && (
        <p className="mt-3 text-sm text-slate-500 text-center">
          Add comparables above to generate a location map
        </p>
      )}
    </div>
  );
};

/**
 * Creates a placeholder SVG for the map
 * In production, this would be replaced with actual map rendering
 */
function createPlaceholderMapSvg(subjectAddress: string, compAddresses: string[]): string {
  const width = 800;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Generate pin positions in a circle around center
  const pins: { x: number; y: number; label: string; isSubject: boolean }[] = [
    { x: centerX, y: centerY, label: 'S', isSubject: true },
  ];
  
  const radius = 150;
  compAddresses.forEach((_, index) => {
    const angle = (2 * Math.PI * index) / compAddresses.length - Math.PI / 2;
    pins.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: String(index + 1),
      isSubject: false,
    });
  });

  const pinsSvg = pins.map(pin => `
    <circle cx="${pin.x}" cy="${pin.y}" r="15" fill="${pin.isSubject ? '#ef4444' : '#0da1c7'}" />
    <text x="${pin.x}" y="${pin.y + 5}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
      ${pin.label}
    </text>
  `).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#e2e8f0"/>
      <text x="${centerX}" y="40" text-anchor="middle" fill="#64748b" font-size="16">
        Comparable Location Map
      </text>
      <text x="${centerX}" y="60" text-anchor="middle" fill="#94a3b8" font-size="12">
        (Map placeholder - actual map will render in production)
      </text>
      ${pinsSvg}
      <rect x="20" y="${height - 80}" width="200" height="60" fill="white" rx="4" stroke="#e2e8f0"/>
      <text x="30" y="${height - 55}" fill="#64748b" font-size="11">
        <tspan fill="#ef4444">●</tspan> Subject Property
      </text>
      <text x="30" y="${height - 35}" fill="#64748b" font-size="11">
        <tspan fill="#0da1c7">●</tspan> Comparable (${compAddresses.length})
      </text>
    </svg>
  `;
}

export default ComparableMapCapture;
