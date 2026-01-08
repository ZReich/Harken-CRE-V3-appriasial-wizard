/**
 * ComparableMapPreview Component
 * 
 * Displays an interactive preview map showing the subject property and all comparables
 * with auto-zoom to fit all pins. Used in Sales Comparison, Income Approach, and 
 * Land Valuation grids.
 * 
 * Features:
 * - Auto-calculates zoom to fit all markers
 * - Numbered pins matching grid order
 * - Color-coded by comparable type
 * - Legend display
 * - Regenerate button
 * - Satellite/Street toggle
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Map, Layers, Satellite, RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import { calculateBoundsZoom, MARKER_COLORS } from '../services/mapGenerationService';
import type { MapMarkerType } from '../types';

// =================================================================
// TYPES
// =================================================================

export interface ComparableLocation {
  id: string;
  lat: number;
  lng: number;
  label: string;
  address?: string;
  details?: string; // e.g., sale price
}

export interface ComparableMapPreviewProps {
  /** Subject property coordinates */
  subject: {
    lat: number;
    lng: number;
    address?: string;
    propertyName?: string;
  };
  /** Array of comparable locations */
  comparables: ComparableLocation[];
  /** Type of comparables for styling */
  type: 'improved-sales' | 'land-sales' | 'rental-comps';
  /** Height of the map in pixels */
  height?: number;
  /** Whether to show the legend */
  showLegend?: boolean;
  /** Whether to show the map type toggle */
  showToggle?: boolean;
  /** Callback when map is regenerated */
  onRegenerate?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =================================================================
// CONSTANTS
// =================================================================

const TYPE_LABELS: Record<string, string> = {
  'improved-sales': 'Improved Sales',
  'land-sales': 'Land Sales',
  'rental-comps': 'Rental Comparables',
};

const MARKER_TYPE_MAP: Record<string, MapMarkerType> = {
  'improved-sales': 'improved-sale',
  'land-sales': 'land-sale',
  'rental-comps': 'rental',
};

// =================================================================
// COMPONENT
// =================================================================

export function ComparableMapPreview({
  subject,
  comparables,
  type,
  height = 300,
  showLegend = true,
  showToggle = true,
  onRegenerate,
  className = '',
}: ComparableMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const isInitializedRef = useRef(false);

  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('roadmap');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markerType = MARKER_TYPE_MAP[type] || 'improved-sale';
  const compColor = MARKER_COLORS[markerType];

  // Validate coordinates
  const hasValidSubject = Number.isFinite(subject.lat) && Number.isFinite(subject.lng);
  const validComparables = useMemo(
    () => comparables.filter(c => Number.isFinite(c.lat) && Number.isFinite(c.lng)),
    [comparables]
  );

  // Calculate bounds for all markers
  const mapBounds = useMemo(() => {
    if (!hasValidSubject) return null;
    
    const allPoints = [
      { lat: subject.lat, lng: subject.lng },
      ...validComparables.map(c => ({ lat: c.lat, lng: c.lng })),
    ];
    
    return calculateBoundsZoom(allPoints);
  }, [subject.lat, subject.lng, validComparables, hasValidSubject]);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if fully loaded
      if (window.google?.maps?.Map) {
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script exists but may not be loaded yet
        const checkLoaded = setInterval(() => {
          if (window.google?.maps?.Map) {
            setIsLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          if (!window.google?.maps?.Map) {
            setError('Google Maps loading timeout');
          }
        }, 10000);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key not configured');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Wait a bit for the API to fully initialize
        const checkLoaded = setInterval(() => {
          if (window.google?.maps?.Map) {
            setIsLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 50);
        
        setTimeout(() => clearInterval(checkLoaded), 5000);
      };
      script.onerror = () => setError('Failed to load Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Create numbered marker icon
  const createMarkerIcon = useCallback((
    color: string,
    label: string,
    isSubject: boolean
  ): google.maps.Symbol => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: isSubject ? 12 : 10,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: isSubject ? 3 : 2,
    };
  }, []);

  // Initialize and update map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps || !mapBounds || !hasValidSubject) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!isInitializedRef.current) {
      // Create new map
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: mapBounds.center,
        zoom: mapBounds.zoom,
        mapTypeId: mapType === 'satellite' ? 'satellite' : 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: mapType === 'roadmap' ? [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ] : undefined,
      });
      isInitializedRef.current = true;
    } else if (googleMapRef.current) {
      // Update existing map
      googleMapRef.current.setCenter(mapBounds.center);
      googleMapRef.current.setZoom(mapBounds.zoom);
    }

    const map = googleMapRef.current;
    if (!map) return;

    // Add subject marker
    const subjectMarker = new google.maps.Marker({
      map,
      position: { lat: subject.lat, lng: subject.lng },
      title: subject.propertyName || 'Subject Property',
      icon: createMarkerIcon(MARKER_COLORS.subject, 'S', true),
      label: {
        text: 'S',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 'bold',
      },
      zIndex: 1000, // Subject always on top
    });

    // Add info window for subject
    const subjectInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <strong style="color: ${MARKER_COLORS.subject};">Subject Property</strong>
          ${subject.propertyName ? `<div style="margin-top: 4px;">${subject.propertyName}</div>` : ''}
          ${subject.address ? `<div style="margin-top: 4px; font-size: 12px; color: #666;">${subject.address}</div>` : ''}
        </div>
      `,
    });

    subjectMarker.addListener('click', () => {
      subjectInfoWindow.open(map, subjectMarker);
    });

    markersRef.current.push(subjectMarker);

    // Add comparable markers
    validComparables.forEach((comp, index) => {
      const compMarker = new google.maps.Marker({
        map,
        position: { lat: comp.lat, lng: comp.lng },
        title: comp.label || `Comp ${index + 1}`,
        icon: createMarkerIcon(compColor, (index + 1).toString(), false),
        label: {
          text: (index + 1).toString(),
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: 'bold',
        },
        zIndex: 100 + index,
      });

      // Add info window for comparable
      const compInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <strong style="color: ${compColor};">${comp.label || `Comp ${index + 1}`}</strong>
            ${comp.address ? `<div style="margin-top: 4px; font-size: 12px; color: #666;">${comp.address}</div>` : ''}
            ${comp.details ? `<div style="margin-top: 4px; font-weight: 600;">${comp.details}</div>` : ''}
          </div>
        `,
      });

      compMarker.addListener('click', () => {
        compInfoWindow.open(map, compMarker);
      });

      markersRef.current.push(compMarker);
    });
  }, [
    subject,
    validComparables,
    mapBounds,
    hasValidSubject,
    mapType,
    compColor,
    createMarkerIcon,
  ]);

  // Initialize map when loaded
  useEffect(() => {
    if (isLoaded && hasValidSubject) {
      initializeMap();
    }
  }, [isLoaded, hasValidSubject, initializeMap]);

  // Update map type
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(
        mapType === 'satellite' ? 'satellite' : 'roadmap'
      );
    }
  }, [mapType]);

  // Handle regenerate
  const handleRegenerate = () => {
    isInitializedRef.current = false;
    initializeMap();
    onRegenerate?.();
  };

  // No comparables state
  if (validComparables.length === 0 && hasValidSubject) {
    return (
      <div
        className={`bg-surface-2 dark:bg-elevation-2 rounded-xl border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-400 p-6">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No Comparables Added</p>
          <p className="text-sm mt-1">Add comparables to the grid to generate a map</p>
        </div>
      </div>
    );
  }

  // No valid subject
  if (!hasValidSubject) {
    return (
      <div
        className={`bg-surface-2 dark:bg-elevation-2 rounded-xl border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-400 p-6">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Subject Location Required</p>
          <p className="text-sm mt-1">Enter the subject property address to generate a map</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`bg-surface-3 dark:bg-elevation-subtle rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-500 p-4">
          <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div
        className={`bg-surface-3 dark:bg-elevation-subtle rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-2 border-border-muted dark:border-dark-border-muted border-t-[#0da1c7] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {TYPE_LABELS[type]} Map
          <span className="ml-2 text-xs font-normal text-harken-gray-med">
            ({validComparables.length} comparable{validComparables.length !== 1 ? 's' : ''})
          </span>
        </h4>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-harken-gray hover:text-harken-gray hover:bg-harken-gray-light rounded transition-colors"
          title="Regenerate map"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden border border-light-border dark:border-dark-border"
        style={{ height }}
      />

      {/* Map Type Toggle */}
      {showToggle && (
        <div className="absolute top-12 left-3 flex bg-surface-1 rounded-lg shadow-md overflow-hidden border border-light-border dark:border-dark-border">
          <button
            onClick={() => setMapType('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              mapType === 'satellite'
                ? 'bg-[#0da1c7] text-white'
                : 'bg-surface-1 text-slate-600 hover:bg-surface-2 dark:bg-elevation-2'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            Satellite
          </button>
          <button
            onClick={() => setMapType('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              mapType === 'roadmap'
                ? 'bg-[#0da1c7] text-white'
                : 'bg-surface-1 text-slate-600 hover:bg-surface-2 dark:bg-elevation-2'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Street
          </button>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 bg-surface-1/95 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-4 text-xs">
            {/* Subject */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: MARKER_COLORS.subject }}
              >
                S
              </div>
              <span className="text-harken-gray font-medium">Subject</span>
            </div>
            {/* Comparables */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: compColor }}
              >
                #
              </div>
              <span className="text-harken-gray font-medium">{TYPE_LABELS[type]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparableMapPreview;
