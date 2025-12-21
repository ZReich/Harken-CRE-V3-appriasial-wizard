import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Typography } from '@mui/material';
import axios from 'axios';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import loadingImage from '../../../images/loading.png';
import defaultPropertImage from '../../../images/default-placeholder.png';
import { formatPrice } from '@/utils/sanitize';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Map container style
const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
};

// Default center (US)
const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

interface LandComp {
  id: number;
  comp_id: number;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  sale_price: number;
  land_size: number;
  land_dimension: string;
  land_type: string;
  date_sold: string;
  primary_photo: string;
}

interface SubjectProperty {
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  land_size: number;
  land_dimension: string;
}

const EvaluationLandValuationCompsMap: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const landId = searchParams.get('landId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subjectProperty, setSubjectProperty] = useState<SubjectProperty | null>(null);
  const [landComps, setLandComps] = useState<LandComp[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<LandComp | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [landApproachName, setLandApproachName] = useState('');

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evaluationRes, compsRes] = await Promise.all([
          axios.get(`evaluations/get-land-valuation/${id}${landId ? `?landId=${landId}` : ''}`),
          axios.get(`evaluations/get-land-comps/${id}${landId ? `?landId=${landId}` : ''}`),
        ]);

        if (evaluationRes.data?.data?.data) {
          const evalData = evaluationRes.data.data.data;
          setSubjectProperty({
            street_address: evalData.street_address,
            city: evalData.city,
            state: evalData.state,
            zipcode: evalData.zipcode,
            latitude: evalData.latitude,
            longitude: evalData.longitude,
            land_size: evalData.land_size,
            land_dimension: evalData.land_dimension,
          });

          if (evalData.latitude && evalData.longitude) {
            setMapCenter({
              lat: parseFloat(evalData.latitude),
              lng: parseFloat(evalData.longitude),
            });
          }

          if (evalData.land_valuation_approach?.name) {
            setLandApproachName(evalData.land_valuation_approach.name);
          }
        }

        if (compsRes.data?.data) {
          const comps = compsRes.data.data.map((c: any) => ({
            id: c.id,
            comp_id: c.comp_id,
            ...c.comp_details,
          }));
          setLandComps(comps);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, landId]);

  // Map load callback
  const onLoad = useCallback((map: google.maps.Map) => {
    // Fit bounds to include all markers
    if (subjectProperty && landComps.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      if (subjectProperty.latitude && subjectProperty.longitude) {
        bounds.extend({
          lat: parseFloat(String(subjectProperty.latitude)),
          lng: parseFloat(String(subjectProperty.longitude)),
        });
      }

      landComps.forEach((comp) => {
        if (comp.latitude && comp.longitude) {
          bounds.extend({
            lat: parseFloat(String(comp.latitude)),
            lng: parseFloat(String(comp.longitude)),
          });
        }
      });

      map.fitBounds(bounds);
    }
  }, [subjectProperty, landComps]);

  const handleNextClick = () => {
    // Navigate to next step in wizard (e.g., Market Analysis or Sales Comparison)
    navigate(`/evaluation/sales-approach?id=${id}`);
  };

  const handleBackClick = () => {
    navigate(`/evaluation/land-valuation?id=${id}&landId=${landId}`);
  };

  if (loading || !isLoaded) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} alt="Loading..." />
      </div>
    );
  }

  return (
    <EvaluationMenuOptions
      onNextClick={handleNextClick}
      onBackClick={handleBackClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
        <Typography variant="h1" component="h2" className="text-xl font-bold uppercase">
          Land Valuation - Comps Map{' '}
          <span>{landApproachName ? `(${landApproachName})` : ''}</span>
        </Typography>
        <div className="flex items-center gap-2">
          <ErrorOutlineIcon />
          <span className="text-xs">View land comparables on the map</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="xl:px-[44px] px-[15px] py-4">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={12}
          onLoad={onLoad}
          options={{
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          }}
        >
          {/* Subject Property Marker */}
          {subjectProperty?.latitude && subjectProperty?.longitude && (
            <Marker
              position={{
                lat: parseFloat(String(subjectProperty.latitude)),
                lng: parseFloat(String(subjectProperty.longitude)),
              }}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40),
              }}
              title="Subject Property"
            />
          )}

          {/* Land Comp Markers */}
          {landComps.map((comp) => (
            comp.latitude && comp.longitude && (
              <Marker
                key={comp.id}
                position={{
                  lat: parseFloat(String(comp.latitude)),
                  lng: parseFloat(String(comp.longitude)),
                }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new google.maps.Size(32, 32),
                }}
                onClick={() => setSelectedMarker(comp)}
                title={comp.street_address}
              />
            )
          ))}

          {/* Info Window for selected comp */}
          {selectedMarker && (
            <InfoWindow
              position={{
                lat: parseFloat(String(selectedMarker.latitude)),
                lng: parseFloat(String(selectedMarker.longitude)),
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 min-w-[200px]">
                <img
                  src={
                    selectedMarker.primary_photo
                      ? import.meta.env.VITE_S3_URL + selectedMarker.primary_photo
                      : defaultPropertImage
                  }
                  alt="comp"
                  className="w-full h-24 object-cover rounded mb-2"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = defaultPropertImage;
                  }}
                />
                <h3 className="font-semibold text-sm text-[#0DA1C7]">
                  {formatPrice(selectedMarker.sale_price)}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedMarker.street_address}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedMarker.city}, {selectedMarker.state?.toUpperCase()} {selectedMarker.zipcode}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Land Size:</strong> {selectedMarker.land_size?.toLocaleString()}{' '}
                    {selectedMarker.land_dimension}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Date Sold:</strong>{' '}
                    {selectedMarker.date_sold
                      ? new Date(selectedMarker.date_sold).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              alt="Subject"
              className="w-6 h-6"
            />
            <span className="text-sm text-gray-600">Subject Property</span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
              alt="Comp"
              className="w-6 h-6"
            />
            <span className="text-sm text-gray-600">Land Comparables ({landComps.length})</span>
          </div>
        </div>

        {/* Comps Summary Table */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Land Comparables Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 text-sm font-semibold text-gray-600 border-b">
                    #
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600 border-b">
                    Address
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600 border-b">
                    Sale Price
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600 border-b">
                    Land Size
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600 border-b">
                    Price/Unit
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600 border-b">
                    Date Sold
                  </th>
                </tr>
              </thead>
              <tbody>
                {landComps.map((comp, idx) => {
                  const pricePerUnit = comp.land_size
                    ? comp.sale_price / comp.land_size
                    : 0;
                  return (
                    <tr
                      key={comp.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedMarker(comp)}
                    >
                      <td className="p-3 text-sm text-gray-600 border-b">{idx + 1}</td>
                      <td className="p-3 text-sm text-gray-600 border-b">
                        {comp.street_address}
                        <br />
                        <span className="text-xs text-gray-400">
                          {comp.city}, {comp.state?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-[#0DA1C7] font-semibold border-b">
                        {formatPrice(comp.sale_price)}
                      </td>
                      <td className="p-3 text-sm text-gray-600 border-b">
                        {comp.land_size?.toLocaleString()} {comp.land_dimension}
                      </td>
                      <td className="p-3 text-sm text-gray-600 border-b">
                        {formatPrice(pricePerUnit)}/{comp.land_dimension}
                      </td>
                      <td className="p-3 text-sm text-gray-600 border-b">
                        {comp.date_sold
                          ? new Date(comp.date_sold).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EvaluationMenuOptions>
  );
};

export default EvaluationLandValuationCompsMap;

