import { useEffect, useRef, useState } from 'react';
import { useGet } from '@/hook/useGet';
import AppraisalMenu from '../set-up/appraisa-menu';
import mapBoundaryIcon from '../../../images/marker.png';
import { useMutate, RequestType } from '@/hook/useMutate';
import CommonButton from '@/components/elements/button/Button';
import { Button } from '@mui/material';
import { Icons } from '@/components/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppraisalEnum } from '../set-up/setUpEnum';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';

const MapBoundary = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [polygonData, setPolygonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapType, setMapType] = useState<google.maps.MapTypeId | any>(
    google.maps.MapTypeId.SATELLITE
  );
  const [map, setMap] = useState<google.maps.Map | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  let selectedShape: any = null;
  let drawingManager: any;
  const imageDim = { height: 360, width: 1000 };

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

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
    if (map) {
      const mapTypeIdListener = map.addListener('maptypeid_changed', () => {
        const currentMapType: any = map.getMapTypeId();
        setMapType(currentMapType);
      });

      return () => {
        if (mapTypeIdListener) {
          google.maps.event.removeListener(mapTypeIdListener);
        }
      };
    }
  }, [map]);

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutateAsync({ position: ApiUrl });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  const dataAppraisal = data?.data?.data;
  const map_zoom = dataAppraisal?.map_zoom || 20;
  const latitude = dataAppraisal?.latitude;
  const longitude = dataAppraisal?.longitude;
  const mapTypes = dataAppraisal?.boundary_map_type;

  useEffect(() => {
    const typeMap = mapTypes ? mapTypes : google.maps.MapTypeId.SATELLITE;
    setMapType(typeMap);
  }, [mapTypes]);

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
        rotateControl: false,
        tilt: 0, // for top view from setelight
      };

      const mapInstance = new google.maps.Map(
        mapRef.current as any,
        mapOptions
      );

      setMap(mapInstance);

      google.maps.event.addListener(mapInstance, 'click', () => {
        setMapType((prevType: any) =>
          prevType === google.maps.MapTypeId.ROADMAP
            ? google.maps.MapTypeId.SATELLITE
            : google.maps.MapTypeId.ROADMAP
        );
      });

      drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          editable: true,
          fillColor: '#ff0000',
          strokeColor: '#ff0000',
          strokeWeight: 2,
        },
      });
      drawingManager.setMap(mapInstance);

      google.maps.event.addListener(
        drawingManager,
        'overlaycomplete',
        savePolygon
      );
      google.maps.event.addListener(
        drawingManager,
        'overlaycomplete',
        (event: any) => {
          if (polygonRef.current) {
            polygonRef.current.setMap(null);
          }

          const newShape = event.overlay;
          newShape.type = event.type;

          if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            polygonRef.current = newShape;
            const pathArray = newShape
              .getPath()
              .getArray()
              .map((point: any) => ({
                lat: point.lat(),
                lng: point.lng(),
              }));

            setPolygonData(pathArray);
            drawingManager.setOptions({ drawingMode: null });
          }
        }
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

        savedPolygon.setMap(mapInstance);
        polygonRef.current = savedPolygon;

        const existingPolygonData: any = polygonPath.map((point: any) => ({
          lat: point.lat(),
          lng: point.lng(),
        }));
        setPolygonData(existingPolygonData);
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

  const savePolygon = (event: any) => {
    if (event.type && event.type === google.maps.drawing.OverlayType.POLYGON) {
      clearSelection();
      selectedShape = event.overlay;
    }
  };

  const clearSelection = () => {
    if (selectedShape) {
      selectedShape.setEditable(false);
      selectedShape.setMap(null);
      selectedShape = null;
    }
  };

  const getImage = (lat: number, lng: number) => {
    const polygonPath = polygonRef.current?.getPath();
    let encodedPath = '';

    if (polygonPath) {
      const pathLength = polygonPath.getLength();
      const points = [];
      for (let i = 0; i < pathLength; i++) {
        const point = polygonPath.getAt(i);
        points.push({ lat: point.lat(), lng: point.lng() });
      }
      points.push(points[0]);
      encodedPath = google.maps.geometry.encoding.encodePath(points);
    }

    const zoom = mapInstanceRef.current?.getZoom() || 18;
    const size = `${imageDim.width}x${imageDim.height}`;
    const center = `${lat},${lng}`;
    const path = 'color:0x0EA2C8ff|weight:3|';
    const type = mapType;
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;

    const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${size}&zoom=${zoom}&center=${center}&scale=2&maptype=${type}&path=${path}enc:${encodedPath}&key=${key}`;
    return imageUrl;
  };

  const getImageWithPin = (lat: number, lng: number) => {
    const center = lat + ',' + lng;
    const type = mapType;
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    const icon = import.meta.env.VITE_S3_URL + mapBoundaryIcon;

    const size = 600 + 'x' + 300;
    const zoom = 18;
    const imageUrl =
      'https://maps.googleapis.com/maps/api/staticmap?size=' +
      size +
      '&zoom=' +
      zoom +
      '&center=' +
      center +
      '&scale=2' +
      '&maptype=' +
      type +
      '&markers=icon:' +
      icon +
      '|' +
      center +
      '&key=' +
      key;
    return imageUrl;
  };

  const mutation = useMutate<any, any>({
    queryKey: 'logins',
    endPoint: `appraisals/update-map-boundary/${id}`,
    requestType: RequestType.PATCH,
  });

  const handleSubmit = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    if (polygonData.length === 0) {
      navigate(`/aerialmap?id=${id}`);
      return;
    }

    const centroid = { lat: 0, lng: 0 };
    polygonData.forEach((point: any) => {
      centroid.lat += point.lat;
      centroid.lng += point.lng;
    });

    centroid.lat /= polygonData.length;
    centroid.lng /= polygonData.length;

    const mapSelectedArea = polygonData.map((point: any) => ({
      lat: point.lat.toString(),
      long: point.lng.toString(),
    }));

    const map_image_url = getImage(centroid.lat, centroid.lng);
    const map_image_for_report_url = getImageWithPin(
      centroid.lat,
      centroid.lng
    );
    const data = {
      map_selected_area: mapSelectedArea,
      latitude: centroid.lat.toString(),
      longitude: centroid.lng.toString(),
      map_zoom: mapInstanceRef.current?.getZoom(),
      map_image_url: map_image_url,
      map_image_for_report_url: map_image_for_report_url,
      boundary_map_type: mapType,
    };

    try {
      await mutation.mutateAsync(data);
      setLoading(false);
      toast('Map Boundary saved successfully!');
      navigate(`/aerialmap?id=${id}`);
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  return (
    <>
      <AppraisalMenu>
        <div
          id="map_canvas"
          ref={mapRef}
          style={{ width: '100%', height: '800px' }}
        ></div>

        <div className="w-1/3 py-9 px-5 absolute bg-white top-[330px] right-4">
          <p className="font-bold pb-2 text-center">
            Select the boundaries of the property
          </p>
          <p className="text-center text-xs pb-4">
            Click on the map where you would like to place a point. Move your
            points to the boundaries of the property. When complete, press 'Save
            & Continue' to save the boundaries.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="contained"
              color="primary"
              size="small"
              className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
              onClick={() => {
                navigate(`/appraisal-photo-sheet?id=${id}`);
              }}
            >
              <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
            </Button>
            <CommonButton
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSubmit}
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
              onClick={() => {
                navigate(`/aerialmap?id=${id}`);
              }}
            >
              Skip
            </Button>
          </div>
        </div>
      </AppraisalMenu>
    </>
  );
};

export default MapBoundary;
