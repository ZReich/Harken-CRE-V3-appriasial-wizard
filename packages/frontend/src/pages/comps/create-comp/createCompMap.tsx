import React, { useContext, useState, useRef, useEffect } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { MyContext } from '@/App';

const containerStyle = {
  width: '100%',
  height: '250px',
  aspectRatio: '16/9',
};

const defaultCenter = { lat: 40.7128, lng: -74.006 }; // New York

interface MarkerPosition {
  lat: number;
  lng: number;
}

interface Props {
  passData: MarkerPosition;
  onMarkerChange?: (position: MarkerPosition) => void;
  initialZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

function GoogleMapLocation({
  passData,
  onMarkerChange,
  onZoomChange,
  initialZoom = 10, // fallback value
}: Props) {
  const { isLoaded } = useContext(MyContext);

  const [marker, setMarker] = useState<MarkerPosition | null>(
    passData?.lat && passData?.lng ? passData : null
  );
  const [center, setCenter] = useState<MarkerPosition>(
    passData?.lat && passData?.lng ? passData : defaultCenter
  );
  const [zoom, setZoom] = useState<number>(
    passData?.lat && passData?.lng ? initialZoom : 4
  );

  const [pinMode, setPinMode] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (passData?.lat && passData?.lng) {
      setMarker(passData);
      setCenter(passData);
      setZoom(initialZoom); // use passed zoom
    }
  }, [passData, initialZoom]);

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (pinMode && event.latLng) {
      const newMarker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarker(newMarker);
      onMarkerChange?.(newMarker);
      setPinMode(false);
    }
  };

  const handleZoomChanged = () => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom()!;
      setZoom(newZoom);
      onZoomChange?.(newZoom); // propagate zoom
    }
  };

  return isLoaded ? (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Pin button */}
      <button
        type="button"
        onClick={() => setPinMode((prev) => !prev)}
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          background: pinMode ? '#e0e7ff' : '#fff',
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: 6,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          boxShadow: pinMode ? '0 0 0 2px #6366f1' : undefined,
        }}
        title="Add Marker"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={pinMode ? '#6366f1' : 'none'}
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      </button>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        onZoomChanged={handleZoomChanged}
        mapTypeId="hybrid"
      >
        {marker && (
          <MarkerF
            position={marker}
            draggable={true}
            onDragEnd={(event) => {
              if (event.latLng) {
                const newPosition = {
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng(),
                };
                setMarker(newPosition);
                onMarkerChange?.(newPosition);
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  ) : null;
}

export default React.memo(GoogleMapLocation);
