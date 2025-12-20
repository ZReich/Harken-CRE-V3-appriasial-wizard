import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { MyContext } from '@/App';

const containerStyle = {
  width: '100%',
  height: '250px',
  aspectRatio: '40/9',
};
const ReportSectionMap: React.FC<any> = ({ googleDta }) => {
  const [markerData, setMarkerData] = useState<any[]>([]);
  const [mapType, setMapType] = useState<any>('roadmap');

  const lat = googleDta ? Number(googleDta.latitude) : undefined;
  const long = googleDta ? Number(googleDta.longitude) : undefined;
  const mapZoomType = googleDta?.aerial_map_zoom;
  console.log('rick', googleDta);

  const center = {
    lat: lat || 37.0902,
    lng: long || -95.7129,
  };

  const mapTypes = googleDta?.aerial_map_type || 'roadmap';

  useEffect(() => {
    setMapType(
      mapTypes === 'hybrid'
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP
    );
  }, [mapTypes]);

  useEffect(() => {
    if (lat && long) {
      setMarkerData([{ lat, lng: long }]);
    } else {
      setMarkerData([]);
    }
  }, [lat, long]);

  const { isLoaded } = useContext(MyContext);

  return isLoaded ? (
    <div className="w-full">
      <div className="text-lg font-semibold mb-2 text-[#0DA1C7]">
        Aerial Map
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={mapZoomType ? mapZoomType : 4}
        mapTypeId={mapType}
        onLoad={(map) => {
          map.setOptions({
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
            gestureHandling: 'none',
            scrollwheel: false,
          });
        }}
      >
        {markerData.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} />
        ))}
      </GoogleMap>
    </div>
  ) : null;
};

export default React.memo(ReportSectionMap);
