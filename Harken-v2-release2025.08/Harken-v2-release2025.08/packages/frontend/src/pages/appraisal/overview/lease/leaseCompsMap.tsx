import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { MyContext } from '@/App';
import AppraisalMenu from '../../set-up/appraisa-menu';
import { useMutate, RequestType } from '@/hook/useMutate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { useGet } from '@/hook/useGet';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { AppraisalEnum } from '../../set-up/setUpEnum';
import RedLocationIcon from '../../../../images/red-dot.png';
import GreenLocationIcon from '../../../../images/green-dot.png';
import OrangeLocationIcon from '../../../../images/orange-dot.png';
import yellowLocationIcon from '../../../../images/yellow-dot.png';
import purpleLocationIcon from '../../../../images/purple-dot.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
const containerStyle = {
  aspectRatio: '16/7',
};
type CenterType = {
  lat: number;
  lng: number;
};
const GoogleMapAreaInfoLease: React.FC<any> = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<any>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  const [fitBounds, setFitBounds] = useState<boolean>(true);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const leaseMapId = searchParams.get('leaseId');
  const [hasLeaseType, setHasLeaseType] = useState(false);
  const [hasCostType, setHasCostType] = useState(false);
  const [filtereleasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [markerData, setMarkerData] = useState<{ lat: number; lng: number }[]>(
    []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  });
  const { data } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutateAsync({ position: ApiUrl });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  useEffect(() => {
    if (data?.data?.data?.appraisal_approaches && !data.isStale) {
      const updateData = data.data.data.appraisal_approaches;

      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'lease'
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeaseData(leaseApproaches);

      const costApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'cost'
      );
      setHasCostType(costApproaches.length > 0);
      setFilteredCostData(costApproaches);
    }
  }, [data?.data?.data?.appraisal_approaches]);

  const { data: leaseApproch, refetch: refetchSale } = useGet<any>({
    queryKey: `appraisals/get-lease-approach?appraisalId=${id}&appraisalApproachId=${leaseMapId}`,
    endPoint: `appraisals/get-lease-approach?appraisalId=${id}&appraisalApproachId=${leaseMapId}`,
    config: { enabled: Boolean(leaseMapId) },
  });

  useEffect(() => {
    refetchSale();
  }, [id]);

  const salesMap = leaseApproch?.data?.data?.comps;
  const leaseId = leaseApproch?.data?.data?.id;
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
  console.log(newCenter);
  const mapTypes =
    leaseApproch?.data?.data?.map_type ||
    googleDta?.aerial_map_type ||
    'roadmap';
  const mapZoomType =
    leaseApproch?.data?.data?.area_map_zoom || googleDta?.aerial_map_zoom || 16;

  useEffect(() => {
    setMapType(
      mapTypes === 'hybrid'
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP
    );
    setZoomLevel(mapZoomType);
  }, [mapTypes, mapZoomType]);

  const mutation = useMutate<any, any>({
    queryKey: `appraisals/save-lease-area-map/${leaseId}`,
    endPoint: `appraisals/save-lease-area-map/${leaseId}`,
    requestType: RequestType.PATCH,
  });
  useEffect(() => {
    if (lat && long) {
      setMarkerData([{ lat, lng: long }]);
    }
  }, [lat, long]);
  useEffect(() => {
    const mapLat = leaseApproch?.data?.data?.map_center_lat;
    const mapLng = leaseApproch?.data?.data?.map_center_lng;
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
  }, [data, lat, long, leaseApproch]);
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
    const centerToSubmit = center;
    const data = {
      area_map_zoom: zoomLevel,
      map_type: mapType,
      map_center_lat: String(centerToSubmit?.lat),
      map_center_lng: String(centerToSubmit?.lng),
    };

    try {
      await mutation.mutateAsync(data);
      toast('Lease Comps Map saved successfully!', {
        className: 'nowrap-toast',
      });
      if (hasLeaseType && filtereleasedData.length > 1) {
        const leaseApproachId = searchParams.get('leaseId');

        const leaseIndex = filtereleasedData.findIndex(
          (element) => element.id == leaseApproachId
        );

        if (leaseIndex < filtereleasedData.length - 1) {
          const saleIdRedirectIndex = filtereleasedData[leaseIndex + 1].id;
          navigate(`/lease-approach?id=${id}&leaseId=${saleIdRedirectIndex}`);
          return;
        }
      }
      if (hasCostType) {
        navigate(`/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`);
      } else {
        navigate(`/appraisal-exhibits?id=${id}`);
      }
    } catch (error) {
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

  return isLoaded ? (
    <AppraisalMenu>
      <div className="px-5 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase">Lease Comp Area Map</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <ErrorOutlineIcon />
          <span className="text-xs">
            Lets get started! Enter some general information for this Appraisal.
          </span>
        </div>
      </div>
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
        <p className="font-bold pb-2 text-center">Set the comp map view</p>
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
              navigate(`/lease-approach?id=${id}&leaseId=${leaseMapId}`);
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
            {AppraisalEnum.SAVE_AND_CONTINUE}
            <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
          </CommonButton>
        </div>
      </div>
    </AppraisalMenu>
  ) : null;
};

export default GoogleMapAreaInfoLease;
