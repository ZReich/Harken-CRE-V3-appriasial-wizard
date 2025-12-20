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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const containerStyle = {
  aspectRatio: '16/7',
};
type CenterType = {
  lat: number;
  lng: number;
};
const EvaluationGoogleMapAreaInfoSales: React.FC<any> = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<any>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  const [fitBounds, setFitBounds] = useState<boolean>(true);
  const [hasLeaseType, setHasLeaseType] = useState(false);
  const [hasCostType, setHasCostType] = useState(false);
  const [hasSalesType, setHasSalesType] = useState(false);
  const [filtereleasedData, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const saleMapId = searchParams.get('salesId');

  const [markerData, setMarkerData] = useState<{ lat: number; lng: number }[]>(
    []
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  const { data } = useGet<any>({
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
      const response = await mutateAsync({
        position: ApiUrl,
      });
      console.log('Update successful:', response);
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  useEffect(() => {
    if (data?.data?.data?.scenarios && !data.isStale) {
      const updateData = data.data.data.scenarios;
      console.log(updateData, 'updateDataupdateDataupdateData');
      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === 1
      );
      setHasSalesType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const costApproaches = updateData.filter(
        (item: { has_cost_approach: any }) => item.has_cost_approach === 1
      );
      setHasCostType(costApproaches.length > 0);
      setFilteredCostData(costApproaches);

      const leaseApproaches = updateData.filter(
        (item: { has_lease_approach: any }) => item.has_lease_approach === 1
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeaseData(leaseApproaches);
    }
  }, [data?.data?.data?.scenarios]);

  const { data: salesApproch, refetch: refetchSale } = useGet<any>({
    queryKey: `evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${saleMapId}`,
    endPoint: `evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${saleMapId}`,
    config: { enabled: Boolean(saleMapId) },
  });

  useEffect(() => {
    refetchSale();
  }, [id]);

  const salesMap = salesApproch?.data?.data?.comp_data;
  const salesId = salesApproch?.data?.data?.id;
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
    setZoomLevel(mapZoomType);
  }, [mapTypes, mapZoomType]);

  const mutation = useMutate<any, any>({
    queryKey: 'salesMap',
    endPoint: `evaluations/save-sale-area-map/${salesId}`,
    requestType: RequestType.PATCH,
  });
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
    const mapData = {
      area_map_zoom: zoomLevel,
      map_type: mapType,
      map_center_lat: String(centerToSubmit?.lat),
      map_center_lng: String(centerToSubmit?.lng),
    };

    try {
      await mutation.mutateAsync(mapData);
      toast('Sales Comps Map saved successfully!', {
        className: 'nowrap-toast',
      });

      if (hasSalesType && filtereSalesdData.length > 1) {
        const salesApproachId = searchParams.get('salesId');

        const leaseIndex = filtereSalesdData.findIndex(
          (element) => element.id == salesApproachId
        );

        if (leaseIndex < filtereSalesdData.length - 1) {
          const saleIdRedirectIndex = filtereSalesdData[leaseIndex + 1].id;
          navigate(
            `/evaluation/sales-approach?id=${id}&salesId=${saleIdRedirectIndex}`
          );
          return;
        }
      }
      if (hasLeaseType) {
        navigate(
          `/evaluation/lease-approach?id=${id}&leaseId=${filtereleasedData?.[0]?.id}`
        );
        return;
      }
      if (hasCostType) {
        navigate(
          `/evaluation/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`
        );
        return;
      } else {
        navigate(`/evaluation-exhibits?id=${id}`);
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
    <EvaluationMenuOptions>
      <div className="px-5 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase">comp Area Map</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <ErrorOutlineIcon />
          <span className="text-xs">
            Lets get started! Enter some general information for this
            evaluation.
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
              navigate(
                `/evaluation/sales-approach?id=${id}&salesId=${saleMapId}`
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

export default EvaluationGoogleMapAreaInfoSales;
