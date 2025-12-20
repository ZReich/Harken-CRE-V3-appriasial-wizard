import { useEffect, useRef, useState } from 'react';
import { useGet } from '@/hook/useGet';

const ReportMapBoundary = ({ id_am }: any) => {
  const mapRef = useRef(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapType] = useState<google.maps.MapTypeId>(
    google.maps.MapTypeId.SATELLITE
  );

  const { data } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id_am}`,
    config: { refetchOnWindowFocus: false },
  });

  const dataAppraisal = data?.data?.data;
  const map_zoom = dataAppraisal?.map_zoom;
  const latitude = dataAppraisal?.latitude;
  const longitude = dataAppraisal?.longitude;

  const [map_selected_area, setMapSelectedArea] = useState<unknown>(null);

  useEffect(() => {
    if (dataAppraisal?.map_selected_area) {
      try {
        const parsedArea = JSON.parse(dataAppraisal.map_selected_area);
        setMapSelectedArea(parsedArea);
      } catch (error) {
        setMapSelectedArea(null);
      }
    } else {
      setMapSelectedArea(null);
    }
  }, [dataAppraisal?.map_selected_area]);

  useEffect(() => {
    const initializeMap = () => {
      const google = window.google;
      const myLatlng = new google.maps.LatLng(
        latitude || 40.9403762,
        longitude || -74.1318096
      );
      const mapOptions = {
        zoom: map_zoom || 20,
        center: myLatlng,
        mapTypeId: mapType,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'none',
        scrollwheel: false,
        clickableIcons: false,
        rotateControl: false,
      };

      mapInstanceRef.current = new google.maps.Map(
        mapRef.current as any,
        mapOptions
      );

      if (Array.isArray(map_selected_area) && map_selected_area.length > 0) {
        const polygonPath = map_selected_area.map(
          (point: any) => new google.maps.LatLng(point.lat, point.long)
        );
        const savedPolygon = new google.maps.Polygon({
          paths: polygonPath,
          editable: true,
          fillColor: '#ff0000',
          strokeColor: '#ff0000',
          strokeWeight: 2,
        });

        savedPolygon.setMap(mapInstanceRef.current);
        polygonRef.current = savedPolygon;
      }
    };

    if (window.google) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_KEY}&libraries=drawing`;
      script.async = true;
      script.onload = () => initializeMap();
      document.body.appendChild(script);
    }
  }, [mapType, map_selected_area, latitude, longitude, map_zoom]);

  return (
    <>
      <div className="text-lg font-semibold mb-2 text-[#0DA1C7]">
        Map Boundary
      </div>{' '}
      <div
        id="map_canvas"
        ref={mapRef}
        style={{ width: '100%', height: '400px' }}
      ></div>
    </>
  );
};

export default ReportMapBoundary;
