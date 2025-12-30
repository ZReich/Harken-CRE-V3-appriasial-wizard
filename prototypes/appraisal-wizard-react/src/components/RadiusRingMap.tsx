/**
 * RadiusRingMap Component
 * 
 * Displays an interactive Google Map with concentric radius rings (1, 3, 5 miles)
 * around a subject property location. Used in the Demographics panel and reports.
 * 
 * Features:
 * - Satellite/Street view toggle
 * - Cyan-themed radius rings with transparency
 * - Subject property marker
 * - Legend display
 * - Responsive sizing
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Map, Layers, Satellite } from 'lucide-react';

// =================================================================
// TYPES
// =================================================================

export interface RadiusRingMapProps {
  latitude: number;
  longitude: number;
  radii?: number[];
  mapType?: 'satellite' | 'roadmap';
  height?: number;
  showLegend?: boolean;
  showToggle?: boolean;
  onMapTypeChange?: (type: 'satellite' | 'roadmap') => void;
  className?: string;
}

// =================================================================
// CONSTANTS
// =================================================================

// Convert miles to meters for Google Maps
const MILES_TO_METERS = 1609.344;

// Ring styling - distinct colors for each radius for easy differentiation
const RING_STYLES = [
  { 
    radiusMiles: 1, 
    fillColor: '#10b981', // Emerald green
    strokeColor: '#059669',
    fillOpacity: 0.25, 
    strokeWeight: 2.5 
  },
  { 
    radiusMiles: 3, 
    fillColor: '#3b82f6', // Blue
    strokeColor: '#2563eb',
    fillOpacity: 0.20, 
    strokeWeight: 2.5 
  },
  { 
    radiusMiles: 5, 
    fillColor: '#8b5cf6', // Purple
    strokeColor: '#7c3aed',
    fillOpacity: 0.15, 
    strokeWeight: 2.5 
  },
];

const OUTLINE_STROKE_COLOR = '#ffffff';

// =================================================================
// COMPONENT
// =================================================================

export function RadiusRingMap({
  latitude,
  longitude,
  radii = [1, 3, 5],
  mapType: initialMapType = 'satellite',
  height = 400,
  showLegend = true,
  showToggle = true,
  onMapTypeChange,
  className = '',
}: RadiusRingMapProps) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const isInitializedRef = useRef(false);
  
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>(initialMapType);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedRadii = (() => {
    const list = (radii?.length ? radii : [1, 3, 5])
      .map((r) => Number(r))
      .filter((r) => Number.isFinite(r) && r > 0);

    return list.length > 0 ? list : [1, 3, 5];
  })();

  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if already loaded
      if (window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsLoaded(true));
        return;
      }

      // Get API key from environment
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in environment.');
        return;
      }

      // Load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setError('Failed to load Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const buildRings = (map: google.maps.Map, center: google.maps.LatLngLiteral) => {
      // Clear existing circles
      circlesRef.current.forEach(circle => circle.setMap(null));
      circlesRef.current = [];

      // Add circles (largest first so smaller ones are on top)
      const sortedRadii = [...normalizedRadii].sort((a, b) => b - a);

      sortedRadii.forEach((radiusMiles, idx) => {
        const ringStyle = RING_STYLES.find(s => s.radiusMiles === radiusMiles) || {
          fillColor: '#0da1c7',
          strokeColor: '#0da1c7',
          fillOpacity: 0.12,
          strokeWeight: 3,
        };

        // White outline ring (high-contrast) so rings remain visible on satellite tiles
        const outline = new google.maps.Circle({
          map,
          center,
          radius: radiusMiles * MILES_TO_METERS,
          fillOpacity: 0,
          strokeColor: OUTLINE_STROKE_COLOR,
          strokeOpacity: 0.95,
          strokeWeight: Math.max(4, (ringStyle.strokeWeight ?? 3) + 2),
          clickable: false,
          zIndex: 100 + idx, // ensure outline sits under the colored stroke but above the map
        });
        circlesRef.current.push(outline);

        // Colored ring
        const circle = new google.maps.Circle({
          map,
          center,
          radius: radiusMiles * MILES_TO_METERS,
          fillColor: ringStyle.fillColor,
          fillOpacity: Math.min(0.2, ringStyle.fillOpacity ?? 0.12),
          strokeColor: ringStyle.strokeColor,
          strokeWeight: Math.max(3, ringStyle.strokeWeight ?? 3),
          strokeOpacity: 1,
          clickable: false,
          zIndex: 200 + idx,
        });
        circlesRef.current.push(circle);
      });
    };
    
    // Prevent re-initialization if already initialized
    if (isInitializedRef.current && googleMapRef.current) {
      // Just update circles and marker for coordinate changes
      const center = { lat, lng };
      googleMapRef.current.setCenter(center);

      buildRings(googleMapRef.current!, center);
      
      // Update marker
      if (markerRef.current) {
        markerRef.current.setPosition(center);
      }
      
      return;
    }

    const center = { lat, lng };
    
    // Calculate appropriate zoom level based on largest radius
    const maxRadius = Math.max(...normalizedRadii);
    let zoom = 11; // Default for 5 mile radius
    if (maxRadius <= 1) zoom = 14;
    else if (maxRadius <= 3) zoom = 12;
    else if (maxRadius <= 5) zoom = 11;
    else if (maxRadius <= 10) zoom = 10;

    // Create map
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: mapType === 'satellite' ? 'satellite' : 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false, // We use our own toggle
      streetViewControl: false,
      fullscreenControl: false,
      styles: mapType === 'roadmap' ? [
        // Light/minimal style for roadmap
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ] : undefined,
    });

    googleMapRef.current = map;

    buildRings(map, center);

    // Add subject property marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      map,
      position: center,
      title: 'Subject Property',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#dc2626', // Red
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });
    
    // Mark as initialized
    isInitializedRef.current = true;

  }, [lat, lng, normalizedRadii, mapType]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && hasValidCoords) {
      initializeMap();
    }
  }, [isLoaded, hasValidCoords, initializeMap]);

  // Update map type
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(
        mapType === 'satellite' ? 'satellite' : 'roadmap'
      );
    }
  }, [mapType]);

  // Handle map type toggle
  const handleMapTypeChange = (newType: 'satellite' | 'roadmap') => {
    setMapType(newType);
    onMapTypeChange?.(newType);
  };

  // Error state
  if (error) {
    return (
      <div 
        className={`bg-slate-100 rounded-xl flex items-center justify-center ${className}`}
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
        className={`bg-slate-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-[#0da1c7] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="rounded-xl overflow-hidden"
        style={{ height }}
      />

      {/* Map Type Toggle */}
      {showToggle && (
        <div className="absolute top-3 left-3 flex bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
          <button
            onClick={() => handleMapTypeChange('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              mapType === 'satellite'
                ? 'bg-[#0da1c7] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            Satellite
          </button>
          <button
            onClick={() => handleMapTypeChange('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              mapType === 'roadmap'
                ? 'bg-[#0da1c7] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Street
          </button>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 border border-slate-200">
          <div className="flex items-center gap-4 text-xs">
            {radii.sort((a, b) => a - b).map((radius) => {
              const style = RING_STYLES.find(s => s.radiusMiles === radius);
              return (
                <div key={radius} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full border-2"
                    style={{ 
                      backgroundColor: style?.fillColor || '#0da1c7',
                      borderColor: style?.strokeColor || '#0da1c7',
                      opacity: 0.8,
                    }}
                  />
                  <span className="text-slate-600 font-medium">{radius} Mile{radius !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: '#dc2626' }}
              />
              <span className="text-slate-600 font-medium">Subject</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RadiusRingMap;


