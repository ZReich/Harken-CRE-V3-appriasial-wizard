import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { MyContext } from '@/App';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import { useMutate, RequestType } from '@/hook/useMutate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { useGet } from '@/hook/useGet';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { EvaluationEnum } from '../../set-up/evaluation-setup-enums';
import RedLocationIcon from '../../../../images/red-dot.png';
import GreenLocationIcon from '../../../../images/green-dot.png';
import OrangeLocationIcon from '../../../../images/orange-dot.png';
import yellowLocationIcon from '../../../../images/yellow-dot.png';
import purpleLocationIcon from '../../../../images/purple-dot.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ResidentialSalesApproachEnum } from './residential-sales-approach-enum';
const containerStyle = {
  aspectRatio: ResidentialSalesApproachEnum.ASPECT_RATIO,
};
type CenterType = {
  lat: number;
  lng: number;
};
const ResidentialGoogleMapAreaInfoSales: React.FC<any> = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<any>(ResidentialSalesApproachEnum.ROAD_MAP);
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  const [fitBounds, setFitBounds] = useState<boolean>(true);
  const [, setHasLeaseType] = useState(false);
  const [hasCostType, setHasCostType] = useState(false);
  const [hasSalesType, setHasSalesType] = useState(false);
  const [, setFilteredLeaseData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);

  const [searchParams] = useSearchParams();
  const id = searchParams.get(ResidentialSalesApproachEnum.ID);
  const saleMapId = searchParams.get(ResidentialSalesApproachEnum.SALES_ID);

  const [markerData, setMarkerData] = useState<{ lat: number; lng: number }[]>(
    []
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  const { data } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'res-evaluations/update-position',
    endPoint: `res-evaluations/update-position/${id}`,
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
    if (data?.data?.data?.res_evaluation_scenarios && !data.isStale) {
      const updateData = data.data.data.res_evaluation_scenarios;

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
  }, [data?.data?.data?.res_evaluation_scenarios]);

  const { data: salesApproch, refetch: refetchSale } = useGet<any>({
    queryKey: `res-evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${saleMapId}`,
    endPoint: `res-evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${saleMapId}`,
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
    ResidentialSalesApproachEnum.ROAD_MAP;
  const mapZoomType =
    salesApproch?.data?.data?.area_map_zoom || googleDta?.aerial_map_zoom || 16;

  useEffect(() => {
    setMapType(
      mapTypes === ResidentialSalesApproachEnum.HYBRID
        ? google.maps.MapTypeId.HYBRID
        : google.maps.MapTypeId.ROADMAP
    );
    setZoomLevel(mapZoomType);
  }, [mapTypes, mapZoomType]);

  const mutation = useMutate<any, any>({
    queryKey: 'salesMap',
    endPoint: `res-evaluations/save-sale-area-map/${salesId}`,
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
      const zoomListener = map.addListener(ResidentialSalesApproachEnum.ZOOM_CHANGED, () => {
        setZoomLevel(map.getZoom() || 4);
      });

      const mapTypeIdListener = map.addListener(ResidentialSalesApproachEnum.MAP_TYPE_ID_CHANGED, () => {
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
      const zoomListener = map.addListener(ResidentialSalesApproachEnum.ZOOM_CHANGED, () => {
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

      const mapTypeIdListener = map.addListener(ResidentialSalesApproachEnum.MAP_TYPE_ID_CHANGED, () => {
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
      toast(ResidentialSalesApproachEnum.SALES_COMPS_MAP_SAVED_SUCCESSFULLY, {
        className: 'nowrap-toast',
      });

      if (hasSalesType && filtereSalesdData.length > 1) {
        const leaseApproachId = searchParams.get(ResidentialSalesApproachEnum.SALES_ID);

        const leaseIndex = filtereSalesdData.findIndex(
          (element) => element.id == leaseApproachId
        );

        if (leaseIndex < filtereSalesdData.length - 1) {
          const saleIdRedirectIndex = filtereSalesdData[leaseIndex + 1].id;
          navigate(
            `/residential/sales-approach?id=${id}&salesId=${saleIdRedirectIndex}`
          );
          return;
        }
      }
      if (hasCostType) {
        navigate(
          `/residential/evaluation/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`
        );
        return;
      } else {
        navigate(`/residential/evaluation-exhibits?id=${id}`);
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
    <ResidentialMenuOptions>
      <div className="px-5 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase">{ResidentialSalesApproachEnum.SALES_COMPS_MAP_HEADER}</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <ErrorOutlineIcon />
          <span className="text-xs">
            {ResidentialSalesApproachEnum.SALES_COMPS_MAP_GENERAL_INFORMATION}
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
              mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID],
            },
          });
          if (center) {
            map.setCenter(center);
          }

          google.maps.event.addListener(map, ResidentialSalesApproachEnum.MAP_TYPE_ID_CHANGED, () => {
            const currentMapType = map.getMapTypeId();
            handleMapTypeChange(
              currentMapType === ResidentialSalesApproachEnum.HYBRID ? ResidentialSalesApproachEnum.HYBRID : ResidentialSalesApproachEnum.ROAD_MAP
            );
          });

          google.maps.event.addListener(map, ResidentialSalesApproachEnum.DRAG_END, () => {
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
        <p className="font-bold pb-2 text-center">{ResidentialSalesApproachEnum.SET_THE_COMP_MAP_VIEW}</p>
        <p className="text-center text-xs pb-4">
          {ResidentialSalesApproachEnum.SALES_COMPS_MAP_TEXT}
        </p>
        <div className="flex justify-center gap-3">
          <Button
            variant="contained"
            color="primary"
            size="small"
            className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
            onClick={() => {
              navigate(
                `/residential/sales-approach?id=${id}&salesId=${saleMapId}`
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
    </ResidentialMenuOptions>
  ) : null;
};

export default ResidentialGoogleMapAreaInfoSales;
