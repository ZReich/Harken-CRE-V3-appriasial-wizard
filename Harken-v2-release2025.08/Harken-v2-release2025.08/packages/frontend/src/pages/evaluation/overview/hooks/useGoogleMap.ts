import { useEffect, useRef, useCallback } from 'react';
import { MapConstants } from '../constants';

interface UseGoogleMapProps {
  latitude?: number;
  longitude?: number;
  mapZoom?: number;
  mapType: google.maps.MapTypeId;
  mapSelectedArea: any[] | null;
  onPolygonDataChange: (data: any[]) => void;
  polygonOptions: any
}

export const useGoogleMap = ({
  latitude,
  longitude,
  mapZoom,
  mapType,
  mapSelectedArea,
  onPolygonDataChange
}: UseGoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const selectedShapeRef = useRef<google.maps.Polygon | null>(null);

  // Clear selection helper
  const clearSelection = useCallback(() => {
    if (selectedShapeRef.current) {
      selectedShapeRef.current.setEditable(false);
      selectedShapeRef.current.setMap(null);
      selectedShapeRef.current = null;
    }
  }, []);

  // Save polygon helper
  const savePolygon = useCallback((event: any) => {
    if (event.type === google.maps.drawing.OverlayType.POLYGON) {
      clearSelection();
      selectedShapeRef.current = event.overlay;
    }
  }, [clearSelection]);

  // Initialize map
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;

      const google = window.google;
      const myLatlng = new google.maps.LatLng(
        latitude || MapConstants.DEFAULT_LATITUDE,
        longitude || MapConstants.DEFAULT_LONGITUDE
      );

      const mapOptions = {
        zoom: mapZoom || MapConstants.DEFAULT_ZOOM,
        center: myLatlng,
        mapTypeId: mapType,
        rotateControl: false,
      };

      const mapInstance = new google.maps.Map(
        mapRef.current,
        mapOptions
      );

      mapInstanceRef.current = mapInstance;

      // Initialize drawing manager
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          editable: true,
          // fillColor: MapConstants.POLYGON_FILL_COLOR,
          fillColor: '#ff0000',
          // strokeColor: MapConstants.POLYGON_STROKE_COLOR,
          strokeColor: '#ff0000',
          // strokeWeight: MapConstants.POLYGON_STROKE_WEIGHT,
          strokeWeight: 2
        },
      });

      drawingManager.setMap(mapInstance);
      drawingManagerRef.current = drawingManager;

      // Add listeners for polygon creation
      google.maps.event.addListener(
        drawingManager,
        'overlaycomplete',
        savePolygon
      );

      google.maps.event.addListener(
        drawingManager,
        'overlaycomplete',
        (event: any) => {
          if (polygonRef.current) {
            polygonRef.current.setMap(null);
          }

          const newShape = event.overlay;
          newShape.type = event.type;

          if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            polygonRef.current = newShape;
            const pathArray = newShape
              .getPath()
              .getArray()
              .map((point: any) => ({
                lat: point.lat(),
                lng: point.lng(),
              }));

            onPolygonDataChange(pathArray);
            drawingManager.setOptions({ drawingMode: null });
          }
        }
      );

      // Load existing polygon if available
      if (Array.isArray(mapSelectedArea) && mapSelectedArea.length > 0) {
        const polygonPath = mapSelectedArea.map(
          (point: any) => new google.maps.LatLng(point.lat, point.long)
        );

        const savedPolygon = new google.maps.Polygon({
          paths: polygonPath,
          editable: true,
          // fillColor: MapConstants.POLYGON_FILL_COLOR,
          fillColor: '#ff0000',
          // strokeColor: MapConstants.POLYGON_STROKE_COLOR,
          strokeColor: '#ff0000',
          // strokeWeight: MapConstants.POLYGON_STROKE_WEIGHT,
          strokeWeight: 2
        });

        savedPolygon.setMap(mapInstance);
        polygonRef.current = savedPolygon;

        const existingPolygonData = polygonPath.map((point: any) => ({
          lat: point.lat(),
          lng: point.lng(),
        }));

        onPolygonDataChange(existingPolygonData);
      }
    };

    // Load Google Maps API if not already loaded
    if (window.google) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_KEY}&libraries=drawing,geometry`;
      script.async = true;
      script.onload = () => initializeMap();
      document.body.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
      }
    };
  }, [mapType, mapSelectedArea, latitude, longitude, mapZoom, savePolygon, onPolygonDataChange]);

  // Get encoded path for static map
  const getEncodedPath = useCallback(() => {
    const polygonPath = polygonRef.current?.getPath();
    if (!polygonPath) return '';

    return google.maps.geometry.encoding.encodePath(polygonPath);
  }, []);

  return {
    mapRef,
    mapInstanceRef,
    polygonRef,
    getEncodedPath
  };
};