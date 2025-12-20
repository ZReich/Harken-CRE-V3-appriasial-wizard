import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { MyContext } from '@/App';
import { useSearchParams } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import RedLocationIcon from '../../../images/red-dot.png';
import GreenLocationIcon from '../../../images/green-dot.png';
import OrangeLocationIcon from '../../../images/orange-dot.png';
import yellowLocationIcon from '../../../images/yellow-dot.png';
import purpleLocationIcon from '../../../images/purple-dot.png';

const containerStyle = {
  aspectRatio: '16/7',
};

const GoogleMapAreaInfoSales: React.FC<any> = ({ approachId }: any) => {
  const [map] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<any>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  const [fitBounds, setFitBounds] = useState<boolean>(true);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [markerData, setMarkerData] = useState<{ lat: number; lng: number }[]>(
    []
  );

  const { data } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  const { data: salesApproch, refetch: refetchSale } = useGet<any>({
    queryKey: `appraisals/get-sales-approach?appraisalId=${id}&appraisalApproachId=${approachId}`,
    endPoint: `appraisals/get-sales-approach?appraisalId=${id}&appraisalApproachId=${approachId}`,
    config: { enabled: Boolean(approachId) },
  });

  useEffect(() => {
    refetchSale();
  }, [id]);

  const salesMap = salesApproch?.data?.data?.comps;

  const latLngArray =
    salesMap?.map(
      (item: { comp_details: { latitude: any; longitude: any } }) => ({
        lat: Number(item.comp_details.latitude),
        lng: Number(item.comp_details.longitude),
      })
    ) || [];

  const googleDta = data?.data?.data;

  const lat = data?.data?.data?.latitude
    ? Number(data.data.data.latitude)
    : googleDta?.latitude
      ? Number(googleDta.latitude)
      : undefined;

  const long = data?.data?.data?.longitude
    ? Number(data.data.data.longitude)
    : googleDta?.longitude
      ? Number(googleDta.longitude)
      : undefined;

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    lat && long ? { lat, lng: long } : { lat: 37.0902, lng: -95.7129 }
  );

  const mapTypes =
    salesApproch?.data?.data?.map_type ||
    googleDta?.aerial_map_type ||
    'roadmap';
  const mapZoomType =
    salesApproch?.data?.data?.area_map_zoom || googleDta?.aerial_map_zoom || 16;

  useEffect(() => {
    setMapType(
      mapTypes === 'hybrid'
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP
    );
    setZoomLevel(mapZoomType - 1);
  }, [mapTypes, mapZoomType]);

  useEffect(() => {
    if (lat && long) {
      setMarkerData([{ lat, lng: long }]);
    }
  }, [lat, long]);
  useEffect(() => {
    const mapLat = salesApproch?.data?.data?.map_center_lat;
    const mapLng = salesApproch?.data?.data?.map_center_lng;
    if (mapLat && mapLng) {
      const newCenter = { lat: Number(mapLat), lng: Number(mapLng) };
      setCenter(newCenter);
    } else {
      if (lat && long) {
        const newCenter = { lat, lng: long };
        setCenter(newCenter);
        setMarkerData([{ lat, lng: long }]);
      } else {
        const defaultCenter = { lat: 37.0902, lng: -95.7129 };
        setCenter(defaultCenter);
        setMarkerData([]);
      }
    }
  }, [data, lat, long, salesApproch]);
  const allMarkers = [...markerData, ...latLngArray];

  useEffect(() => {
    if (map && fitBounds) {
      const bounds = new google.maps.LatLngBounds();
      allMarkers.forEach((marker) => {
        bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
      });
      map.fitBounds(bounds);
      setFitBounds(false);
    }
  }, [allMarkers, map, fitBounds]);

  const { isLoaded } = useContext(MyContext);

  return isLoaded ? (
    <div className="w-full">
      {/* Label above the map */}
      <div className="text-lg font-semibold mb-2 text-[#0DA1C7]">
        Sales Approach Map
      </div>

      {/* Google Map Component */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || { lat: 37.0902, lng: -95.7129 }}
        zoom={zoomLevel}
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
        {allMarkers.map((marker, index) => {
          let iconUrl;
          if (index === 0) {
            iconUrl = RedLocationIcon;
          } else if (index === 1) {
            iconUrl = GreenLocationIcon;
          } else if (index === 2) {
            iconUrl = yellowLocationIcon;
          } else if (index === 3) {
            iconUrl = OrangeLocationIcon;
          } else {
            iconUrl = purpleLocationIcon;
          }

          return (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={{
                url: iconUrl,
                scaledSize: new google.maps.Size(30, 30),
              }}
            />
          );
        })}
      </GoogleMap>
    </div>
  ) : null;
};

export default GoogleMapAreaInfoSales;
