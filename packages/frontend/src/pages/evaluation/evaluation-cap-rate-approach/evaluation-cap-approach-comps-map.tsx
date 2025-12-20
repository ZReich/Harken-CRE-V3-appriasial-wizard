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
import loadingImage from '../../../images/loading.png';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const containerStyle = {
  aspectRatio: '16/7',
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
  const [hasSalesType, setHasSalesType] = useState(false);
  const [loader, setLoader] = useState(false);
  const [filteredSalesData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  console.log(
    hasSalesType,
    filteredSalesData,
    'filteredSalesDatafilteredSalesData'
  );
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const capMapId: any = searchParams.get('capId');

  const [markerData, setMarkerData] = useState<{ lat: number; lng: number }[]>(
    []
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  const { data: evaluationData } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });
  useEffect(() => {
    if (evaluationData?.data?.data?.scenarios && !evaluationData.isStale) {
      const updateData = evaluationData.data.data.scenarios;
      const salesApproaches = updateData.filter(
        (item: { has_sales_approach: any }) => item.has_sales_approach === 1
      );
      setHasSalesType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);
    }
  }, [evaluationData?.data?.data?.scenarios]);

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

  const { data: salesApproch, refetch: refetchSale } = useGet<any>({
    queryKey: `evaluations/get-cap-approach?evaluationId=${id}&evaluationScenarioId=${capMapId}`,
    endPoint: `evaluations/get-cap-approach?evaluationId=${id}&evaluationScenarioId=${capMapId}`,
    config: { enabled: Boolean(capMapId) },
  });

  useEffect(() => {
    refetchSale();
  }, [id]);
  const salesMap = salesApproch?.data?.data?.comps;
  const capId = salesApproch?.data?.data?.id;
  const latLngArray =
    salesMap?.map(
      (item: { comp_details: { latitude: any; longitude: any } }) => ({
        lat: Number(item.comp_details.latitude),
        lng: Number(item.comp_details.longitude),
      })
    ) || [];

  const googleDta = evaluationData?.data?.data;

  const lat = evaluationData?.data?.data?.latitude
    ? Number(evaluationData.data.data.latitude)
    : googleDta?.latitude
      ? Number(googleDta.latitude)
      : undefined;

  const long = evaluationData?.data?.data?.longitude
    ? Number(evaluationData.data.data.longitude)
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
    endPoint: `evaluations/save-cap-area-map/${capId}`,
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
  }, [evaluationData, lat, long, salesApproch]);
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
    setLoader(true);
    const centerToSubmit = center;
    const mapData = {
      area_map_zoom: zoomLevel,
      map_type: mapType,
      map_center_lat: String(centerToSubmit?.lat),
      map_center_lng: String(centerToSubmit?.lng),
    };

    try {
      await mutation.mutateAsync(mapData);
      setLoader(false);
      toast('Sales Comps Map saved successfully!');

      const scenarios = evaluationData?.data?.data?.scenarios || [];
      const currentScenario = scenarios.find(
        (s: any) => s.id === Number(capMapId)
      );

      // === 1. Check CURRENT scenario ===

      if (currentScenario?.has_multi_family_approach === 1) {
        navigate(
          `/evaluation/rent-roll?id=${id}&evaluationId=${currentScenario.id}`
        );
        return;
      }
      if (currentScenario?.has_sales_approach === 1) {
        navigate(
          `/evaluation/sales-approach?id=${id}&salesId=${currentScenario.id}`
        );
        return;
      }
      if (currentScenario?.has_lease_approach === 1) {
        navigate(
          `/evaluation/lease-approach?id=${id}&leaseId=${currentScenario.id}`
        );
        return;
      }
      if (currentScenario?.has_cost_approach === 1) {
        navigate(
          `/evaluation/cost-approach?id=${id}&costId=${currentScenario.id}`
        );
        return;
      }

      // === 2. Check NEXT scenarios ===
      const nextScenarios = scenarios.filter(
        (s: any) => s.id > Number(capMapId)
      );

      const nextIncome = nextScenarios.find(
        (s: any) => s.has_income_approach === 1
      );
      if (nextIncome) {
        navigate(
          `/evaluation/income-approch?id=${id}&IncomeId=${nextIncome.id}`
        );
        return;
      }

      const nextCap = nextScenarios.find((s: any) => s.has_cap_approach === 1);
      if (nextCap) {
        navigate(`/evaluation/cap-approach?id=${id}&capId=${nextCap.id}`);
        return;
      }

      const nextMulti = nextScenarios.find(
        (s: any) => s.has_multi_family_approach === 1
      );
      if (nextMulti) {
        navigate(`/evaluation/rent-roll?id=${id}&evaluationId=${nextMulti.id}`);
        return;
      }
      // === 3. Check PREVIOUS scenarios for sales, lease, cost ===
      const previousScenarios = scenarios.filter(
        (s: any) => s.id < Number(capMapId)
      );

      const prevSales = previousScenarios.find(
        (s: any) =>
          s.has_sales_approach === 1 && s.evaluation_sales_approach?.id
      );
      if (prevSales) {
        navigate(`/evaluation/sales-approach?id=${id}&salesId=${prevSales.id}`);
        return;
      }

      const prevLease = previousScenarios.find(
        (s: any) =>
          s.has_lease_approach === 1 && s.evaluation_lease_approach?.id
      );
      if (prevLease) {
        navigate(`/evaluation/lease-approach?id=${id}&leaseId=${prevLease.id}`);
        return;
      }

      const prevCost = previousScenarios.find(
        (s: any) => s.has_cost_approach === 1 && s.evaluation_cost_approach?.id
      );
      if (prevCost) {
        navigate(`/evaluation/cost-approach?id=${id}&costId=${prevCost.id}`);
        return;
      }

      // === 4. Fallback ===
      navigate(`/evaluation-exhibits?id=${id}`);
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
    <EvaluationMenuOptions>
      <div className="px-5 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase">CAP RATE COMP AREA MAP</h1>
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
        <p className="font-bold pb-2 text-center">
          Set the CAP Rate comp map view
        </p>
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
              navigate(`/evaluation/cap-approach?id=${id}&capId=${capMapId}`);
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
