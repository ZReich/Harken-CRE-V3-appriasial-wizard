import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { MyContext } from '@/App';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import { useMutate, RequestType } from '@/hook/useMutate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { useGet } from '@/hook/useGet';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { EvaluationEnum } from '../set-up/evaluation-setup-enums';
import RedLocationIcon from '../../../images/red-dot.png';
import GreenLocationIcon from '../../../images/green-dot.png';
import OrangeLocationIcon from '../../../images/orange-dot.png';
import yellowLocationIcon from '../../../images/yellow-dot.png';
import purpleLocationIcon from '../../../images/purple-dot.png';

const containerStyle = {
  aspectRatio: '16/9',
};
type CenterType = {
  lat: number;
  lng: number;
};

const EvaluationGoogleMapAreaInfoCap: React.FC<any> = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<any>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  const [fitBounds, setFitBounds] = useState<boolean>(true);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costMapId = searchParams.get('multiFamilyId');

  const [markerData, setMarkerData] = useState<{ lat: number; lng: number }[]>(
    []
  );
  useEffect(() => {
    if (id && costMapId) {
      setTimeout(() => {
        refetch();
      }, 500);
    }
  }, [costMapId]);
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  const { data, refetch } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutateAsync({
        position: ApiUrl,
      });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  const { data: costApproch, refetch: refetchCost } = useGet<any>({
    queryKey: `evaluations/get-multi-family-approach?evaluationId=${id}&evaluationScenarionId=${costMapId}`,
    endPoint: `evaluations/get-multi-family-approach?evaluationId=${id}&evaluationScenarioId=${costMapId}`,
    config: { enabled: Boolean(id) },
  });

  useEffect(() => {
    refetchCost();
  }, [id]);

  const salesMap = costApproch?.data?.data?.comps;
  // const salesId = costApproch?.data?.data?.id;

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
  const [newCenter, setNewCenter] = useState<CenterType | null>(null);

  const mapTypes =
    costApproch?.data?.data?.map_type ||
    googleDta?.aerial_map_type ||
    'roadmap';

  const mapZoomType =
    costApproch?.data?.data?.area_map_zoom || googleDta?.aerial_map_zoom || 16;

  useEffect(() => {
    setMapType(
      mapTypes === 'hybrid'
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP
    );
    setZoomLevel(mapZoomType);
  }, [mapTypes, mapZoomType]);

  const mutation = useMutate<any, any>({
    queryKey: 'costMap',
    endPoint: `evaluations/save-multi-family-area-map/${costMapId}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    if (lat && long) {
      setMarkerData([{ lat, lng: long }]);
    }
  }, [lat, long]);

  useEffect(() => {
    const mapLat = costApproch?.data?.data?.map_center_lat;
    const mapLng = costApproch?.data?.data?.map_center_lng;
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
  }, [data, lat, long, costApproch]);
  const allMarkers = [...markerData, ...latLngArray];

  useEffect(() => {
    if (map) {
      const zoomListener = map.addListener('zoom_changed', () => {
        setZoomLevel(map.getZoom() || 4);
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
    if (map && fitBounds) {
      const bounds = new google.maps.LatLngBounds();
      allMarkers.forEach((marker) => {
        bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
      });
      map.fitBounds(bounds);
      setFitBounds(false);
    }
  }, [allMarkers, map, fitBounds]);

  const submitAerialMap = async () => {
    const centerToSubmit = newCenter || center;
    const data = {
      area_map_zoom: zoomLevel,
      map_type: mapType,
      map_center_lat: String(centerToSubmit?.lat),
      map_center_lng: String(centerToSubmit?.lng),
    };

    try {
      await mutation.mutateAsync(data);
      toast('Cost comps saved successfully!');
      navigate(
        `/evaluation/cost-approach-improvement?id=${id}&costId=${costMapId}`
      );
    } catch (error) {
      toast.error('Error updating aerial map. Please try again.');
    }
  };

  const handleMapTypeChange = (type: string) => {
    const newMapType =
      type === 'hybrid'
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP;

    setMapType(newMapType);
  };

  const { isLoaded } = useContext(MyContext);

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

  return isLoaded ? (
    <EvaluationMenuOptions>
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
          // map.setMapTypeId(
          //   mapTypes === 'hybrid'
          //     ? google.maps.MapTypeId.HYBRID
          //     : google.maps.MapTypeId.ROADMAP
          // );
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

      <div className="w-1/3 py-9 px-5 absolute bg-white top-[330px] right-4">
        <p className="font-bold pb-2 text-center">Set the Cost Comp map view</p>
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
            onClick={() => {
              navigate(
                `/evaluation/cost-approach?id=${id}&costId=${costMapId}`
              );
            }}
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
            {EvaluationEnum.SAVE_AND_CONTINUE}
            <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
          </CommonButton>
        </div>
      </div>
    </EvaluationMenuOptions>
  ) : null;
};

export default EvaluationGoogleMapAreaInfoCap;
