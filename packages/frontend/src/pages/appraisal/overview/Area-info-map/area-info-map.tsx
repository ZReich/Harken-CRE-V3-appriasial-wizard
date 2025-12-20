import { MyContext } from '@/App';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { Button } from '@mui/material';
import { GoogleMap, Marker } from '@react-google-maps/api';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppraisalMenu from '../../set-up/appraisa-menu';
import { AppraisalEnum } from '../../set-up/setUpEnum';
import loadingImage from '../../../../images/loading.png';
const containerStyle = {
  aspectRatio: '16/9',
};

type CenterType = {
  lat: number;
  lng: number;
};

const GoogleMapAreaInfo: React.FC<any> = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<any>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>();
  const [fitBounds, setFitBounds] = useState<boolean>(true);
  const [loader, setLoader] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [markerData, setMarkerData] = useState<{ lat: number; lng: number }[]>(
    []
  );

  const { data } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  const googleDta = data?.data?.data;
  const lat = googleDta?.latitude ? Number(googleDta.latitude) : undefined;
  const long = googleDta?.longitude ? Number(googleDta.longitude) : undefined;
  const mapZoomType = googleDta?.aerial_map_zoom || 14;

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    lat && long ? { lat, lng: long } : { lat: 37.0902, lng: -95.7129 }
  );
  const [, setNewCenter] = useState<CenterType | null>(null);

  const mutation = useMutate<any, any>({
    queryKey: `appraisals/update-aerial-map/${id}`,
    endPoint: `appraisals/update-aerial-map/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    if (lat && long) {
      setMarkerData([{ lat, lng: long }]);
    }
  }, [lat, long]);

  const mapTypes =
    googleDta?.map_type || googleDta?.aerial_map_type || 'roadmap';

  useEffect(() => {
    setMapType(
      mapTypes === 'hybrid'
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP
    );
    setZoomLevel(mapZoomType);
  }, [mapTypes, mapZoomType]);

  useEffect(() => {
    const mapLat = googleDta?.map_center_lat;
    const mapLng = googleDta?.map_center_lng;
    if (mapLat && mapLng) {
      const newCenter = { lat: Number(mapLat), lng: Number(mapLng) };
      setCenter(newCenter);
    } else if (lat && long) {
      const newCenter = { lat, lng: long };
      setCenter(newCenter);
      setMarkerData([{ lat, lng: long }]);
    } else {
      const defaultCenter = { lat: 37.0902, lng: -95.7129 };
      setCenter(defaultCenter);
      setMarkerData([]);
    }
  }, [data, lat, long, googleDta]);

  const allMarkers = [...markerData];

  // ✅ Updated useEffect for zoom & mapTypeId listeners
  useEffect(() => {
    if (map) {
      const zoomListener = map.addListener('zoom_changed', () => {
        const newZoom = map.getZoom() || 4;
        setZoomLevel(newZoom);

        const center = map.getCenter();
        if (center) {
          const lat = center.lat();
          const lng = center.lng();
          setCenter({ lat, lng });
          setNewCenter({ lat, lng });
        }
      });

      const mapTypeIdListener = map.addListener('maptypeid_changed', () => {
        setMapType(map.getMapTypeId());
      });

      return () => {
        zoomListener.remove();
        mapTypeIdListener.remove();
      };
    }
  }, [map]);

  useEffect(() => {
    if (map && fitBounds && allMarkers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      allMarkers.forEach((marker) => {
        bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
      });
      map.fitBounds(bounds);
      setFitBounds(false);
    }
  }, [allMarkers, map, fitBounds]);

  const submitAerialMap = async () => {
    setLoader(true);
    const centerToSubmit = center;
    const data = {
      aerial_map_zoom: zoomLevel,
      aerial_map_type: mapType,
      map_center_lat: String(centerToSubmit?.lat),
      map_center_lng: String(centerToSubmit?.lng),
    };
    try {
      await mutation.mutateAsync(data);
      toast('Aerial map saved successfully!');
      setLoader(false);
      navigate(`/area-info?id=${id}`);
    } catch (error) {
      console.error('Error updating aerial map:', error);
      toast.error('Error updating aerial map. Please try again.');
    }
  };

  const { isLoaded } = useContext(MyContext);

  const handleMapTypeChange = (type: string) => {
    const newMapType =
      type === 'hybrid'
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP;

    setMapType(newMapType);
  };

  const handleDragEnd = (currentMap: any) => {
    if (currentMap) {
      const newCenter = currentMap.getCenter();
      if (newCenter) {
        const lat = newCenter.lat();
        const lng = newCenter.lng();
        setCenter({ lat, lng });
        setNewCenter({ lat, lng });
      }
    }
  };
  if (loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  return isLoaded ? (
    <AppraisalMenu>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || { lat: 37.0902, lng: -95.7129 }}
        zoom={zoomLevel}
        mapTypeId={mapType}
        onLoad={(map) => {
          setMap(map);
          map.setOptions({
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DEFAULT,
              mapTypeIds: ['roadmap', 'hybrid'],
            },
          });

          if (center) {
            map.setCenter(center);
          }

          google.maps.event.addListener(map, 'maptypeid_changed', () => {
            const currentMapType = map.getMapTypeId();
            handleMapTypeChange(
              currentMapType === 'hybrid' ? 'hybrid' : 'roadmap'
            );
          });

          google.maps.event.addListener(map, 'dragend', () => {
            handleDragEnd(map);
          });
        }}
      >
        {markerData.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} />
        ))}
      </GoogleMap>

      <div className="w-1/3 py-9 px-5 absolute bg-white top-[330px] right-4">
        <p className="font-bold pb-2 text-center">Set the aerial map view</p>
        <p className="text-center text-xs pb-4">
          Zoom and orient the map for final PDF display. When complete, press
          'Save & Continue' to save the boundaries.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            variant="contained"
            color="primary"
            size="small"
            className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
            onClick={() => navigate(`/property-boundaries?id=${id}`)}
          >
            <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
          </Button>
          <CommonButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            onClick={submitAerialMap}
            style={{ width: '300px', fontSize: '14px' }}
          >
            {AppraisalEnum.SAVE_AND_CONTINUE}
            <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
          </CommonButton>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
            onClick={() => navigate(`/area-info?id=${id}`)}
          >
            Skip
          </Button>
        </div>
      </div>
    </AppraisalMenu>
  ) : null;
};

export default GoogleMapAreaInfo;
