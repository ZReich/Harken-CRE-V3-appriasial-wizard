/**
 * BoundaryDrawingTool Component
 * 
 * Provides an interactive map with drawing capabilities for:
 * - Drawing property boundaries
 * - Importing boundaries from Cotality parcel data
 * - Manual polygon editing
 * - Exporting boundary coordinates
 * 
 * Uses Google Maps Drawing Library for polygon creation/editing.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  PenTool,
  Trash2,
  Download,
  Upload,
  Undo2,
  Layers,
  Satellite,
  Check,
  AlertCircle,
  Square,
  Info
} from 'lucide-react';

// =================================================================
// TYPES
// =================================================================

export interface BoundaryCoordinate {
  lat: number;
  lng: number;
}

export interface BoundaryDrawingToolProps {
  /** Center coordinates for the map */
  center?: {
    lat: number;
    lng: number;
  };
  /** Initial boundary coordinates */
  initialBoundary?: BoundaryCoordinate[];
  /** Callback when boundary changes */
  onBoundaryChange?: (boundary: BoundaryCoordinate[]) => void;
  /** Parcel data from Cotality (for auto-import) */
  parcelData?: {
    geometry?: {
      coordinates: number[][][];
    };
  };
  /** Height of the component */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

// =================================================================
// COMPONENT
// =================================================================

export function BoundaryDrawingTool({
  center,
  initialBoundary,
  onBoundaryChange,
  parcelData,
  height = 350,
  className = '',
}: BoundaryDrawingToolProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasBoundary, setHasBoundary] = useState(!!initialBoundary?.length);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite');
  const [boundaryHistory, setBoundaryHistory] = useState<BoundaryCoordinate[][]>([]);

  const hasValidCenter = center?.lat !== undefined && center?.lng !== undefined;

  // Load Google Maps script with drawing library
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps?.drawing?.DrawingManager) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps?.drawing?.DrawingManager) {
            setIsLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          if (!window.google?.maps?.drawing?.DrawingManager) {
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Wait for the drawing library to initialize
        const checkLoaded = setInterval(() => {
          if (window.google?.maps?.drawing?.DrawingManager) {
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

  // Get boundary coordinates from polygon
  const getBoundaryFromPolygon = useCallback((polygon: google.maps.Polygon): BoundaryCoordinate[] => {
    const path = polygon.getPath();
    const coords: BoundaryCoordinate[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coords.push({ lat: point.lat(), lng: point.lng() });
    }
    return coords;
  }, []);

  // Save to history before making changes
  const saveToHistory = useCallback(() => {
    if (polygonRef.current) {
      const coords = getBoundaryFromPolygon(polygonRef.current);
      setBoundaryHistory(prev => [...prev.slice(-9), coords]);
    }
  }, [getBoundaryFromPolygon]);

  // Undo last change
  const handleUndo = useCallback(() => {
    if (boundaryHistory.length === 0) return;

    const prevBoundary = boundaryHistory[boundaryHistory.length - 1];
    setBoundaryHistory(prev => prev.slice(0, -1));

    if (polygonRef.current && prevBoundary.length > 0) {
      const path = prevBoundary.map(c => new google.maps.LatLng(c.lat, c.lng));
      polygonRef.current.setPath(path);
      onBoundaryChange?.(prevBoundary);
    }
  }, [boundaryHistory, onBoundaryChange]);

  // Clear boundary
  const handleClearBoundary = useCallback(() => {
    if (polygonRef.current) {
      saveToHistory();
      polygonRef.current.setMap(null);
      polygonRef.current = null;
      setHasBoundary(false);
      onBoundaryChange?.([]);
    }
  }, [saveToHistory, onBoundaryChange]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !hasValidCenter || !center) return;

    // Create map
    if (!googleMapRef.current) {
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 18,
        mapTypeId: mapType === 'satellite' ? 'satellite' : 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Create drawing manager
      drawingManagerRef.current = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#0da1c7',
          fillOpacity: 0.2,
          strokeColor: '#0da1c7',
          strokeWeight: 3,
          editable: true,
          draggable: true,
        },
      });

      drawingManagerRef.current.setMap(googleMapRef.current);

      // Handle polygon completion
      google.maps.event.addListener(
        drawingManagerRef.current,
        'polygoncomplete',
        (polygon: google.maps.Polygon) => {
          // Remove old polygon
          if (polygonRef.current) {
            polygonRef.current.setMap(null);
          }

          polygonRef.current = polygon;
          setIsDrawing(false);
          setHasBoundary(true);

          // Set up edit listeners
          const path = polygon.getPath();
          google.maps.event.addListener(path, 'set_at', () => {
            const coords = getBoundaryFromPolygon(polygon);
            onBoundaryChange?.(coords);
          });
          google.maps.event.addListener(path, 'insert_at', () => {
            const coords = getBoundaryFromPolygon(polygon);
            onBoundaryChange?.(coords);
          });

          // Stop drawing mode
          drawingManagerRef.current?.setDrawingMode(null);

          // Notify parent
          const coords = getBoundaryFromPolygon(polygon);
          onBoundaryChange?.(coords);
        }
      );

      // Add initial boundary if provided
      if (initialBoundary && initialBoundary.length > 0) {
        const path = initialBoundary.map(c => new google.maps.LatLng(c.lat, c.lng));
        polygonRef.current = new google.maps.Polygon({
          paths: path,
          fillColor: '#0da1c7',
          fillOpacity: 0.2,
          strokeColor: '#0da1c7',
          strokeWeight: 3,
          editable: true,
          draggable: true,
          map: googleMapRef.current,
        });
        setHasBoundary(true);

        // Set up edit listeners
        const polygonPath = polygonRef.current.getPath();
        google.maps.event.addListener(polygonPath, 'set_at', () => {
          const coords = getBoundaryFromPolygon(polygonRef.current!);
          onBoundaryChange?.(coords);
        });
        google.maps.event.addListener(polygonPath, 'insert_at', () => {
          const coords = getBoundaryFromPolygon(polygonRef.current!);
          onBoundaryChange?.(coords);
        });
      }
    }
  }, [isLoaded, hasValidCenter, center, mapType, initialBoundary, onBoundaryChange, getBoundaryFromPolygon]);

  // Update map type
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(
        mapType === 'satellite' ? 'satellite' : 'roadmap'
      );
    }
  }, [mapType]);

  // Start drawing mode
  const handleStartDrawing = () => {
    if (drawingManagerRef.current) {
      saveToHistory();
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setIsDrawing(true);
    }
  };

  // Stop drawing mode
  const handleStopDrawing = () => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
      setIsDrawing(false);
    }
  };

  // Import from parcel data
  const handleImportFromParcel = () => {
    if (!parcelData?.geometry?.coordinates || !googleMapRef.current) return;

    saveToHistory();

    // Remove existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    // Convert GeoJSON coordinates to Google Maps path
    // GeoJSON is [lng, lat], Google Maps is {lat, lng}
    const coords = parcelData.geometry.coordinates[0];
    const path = coords.map((coord: number[]) =>
      new google.maps.LatLng(coord[1], coord[0])
    );

    polygonRef.current = new google.maps.Polygon({
      paths: path,
      fillColor: '#0da1c7',
      fillOpacity: 0.2,
      strokeColor: '#0da1c7',
      strokeWeight: 3,
      editable: true,
      draggable: true,
      map: googleMapRef.current,
    });

    setHasBoundary(true);

    // Set up edit listeners
    const polygonPath = polygonRef.current.getPath();
    google.maps.event.addListener(polygonPath, 'set_at', () => {
      const boundaryCoords = getBoundaryFromPolygon(polygonRef.current!);
      onBoundaryChange?.(boundaryCoords);
    });
    google.maps.event.addListener(polygonPath, 'insert_at', () => {
      const boundaryCoords = getBoundaryFromPolygon(polygonRef.current!);
      onBoundaryChange?.(boundaryCoords);
    });

    // Notify parent
    const boundaryCoords = coords.map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0],
    }));
    onBoundaryChange?.(boundaryCoords);
  };

  // Export boundary coordinates
  const handleExportBoundary = () => {
    if (!polygonRef.current) return;

    const coords = getBoundaryFromPolygon(polygonRef.current);
    const json = JSON.stringify(coords, null, 2);

    // Copy to clipboard
    navigator.clipboard.writeText(json).then(() => {
      alert('Boundary coordinates copied to clipboard!');
    });
  };

  // No coordinates state
  if (!hasValidCenter) {
    return (
      <div
        className={`bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-400 dark:text-slate-500 p-6">
          <Square className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium text-slate-600">Property Location Required</p>
          <p className="text-sm mt-1">
            Enter the property address to draw boundaries
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`bg-slate-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-500 p-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
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
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-[#0da1c7] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading drawing tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#0da1c7]" />
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Property Boundary</span>
          {hasBoundary && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              <Check className="w-3 h-3" />
              Drawn
            </span>
          )}
        </div>

        {/* Map Type Toggle */}
        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setMapType('satellite')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${mapType === 'satellite'
                ? 'bg-[#0da1c7] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Satellite className="w-3 h-3" />
            Satellite
          </button>
          <button
            onClick={() => setMapType('roadmap')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${mapType === 'roadmap'
                ? 'bg-[#0da1c7] text-white'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
          >
            <Layers className="w-3 h-3" />
            Street
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: height - 96 }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Drawing Controls Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Draw Button */}
          {!isDrawing ? (
            <button
              onClick={handleStartDrawing}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <PenTool className="w-4 h-4 text-[#0da1c7]" />
              {hasBoundary ? 'Redraw' : 'Draw Boundary'}
            </button>
          ) : (
            <button
              onClick={handleStopDrawing}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 rounded-lg shadow-md text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Cancel Drawing
            </button>
          )}

          {/* Import from Parcel */}
          {parcelData?.geometry && (
            <button
              onClick={handleImportFromParcel}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-4 h-4 text-purple-600" />
              Import from Parcel
            </button>
          )}
        </div>

        {/* Action Buttons Overlay */}
        {hasBoundary && (
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={handleUndo}
              disabled={boundaryHistory.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportBoundary}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Export coordinates"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearBoundary}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg shadow-md border border-red-200 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
              title="Clear boundary"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Drawing Instructions */}
        {isDrawing && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/75 rounded-lg text-white text-sm">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Click to add points. Double-click or click first point to complete.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {hasBoundary
            ? 'Drag corners to adjust. Click polygon to edit vertices.'
            : 'Click "Draw Boundary" to outline the property.'}
        </p>
      </div>
    </div>
  );
}

export default BoundaryDrawingTool;
