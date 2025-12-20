import React, { useState, useCallback, useEffect, useContext } from 'react';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import { MyContext } from '@/App';
import { Box, Tooltip } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import listImage from '../../../images/list.jpg';
import AiImage from '../../../images/AI SVG.svg';
import { formatDateToMMDDYYYY } from '@/utils/date-format';
import { IComp } from '@/components/interface/header-filter';
import { APIClient } from '@/api/api-client';
import debounce from 'lodash/debounce';
import loadingImage from '../../../images/loading.png';
import { useLocation, useNavigate } from 'react-router-dom';

// Map configuration
const containerStyle = { width: '100%', height: '82vh' };
const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // US center
const defaultZoom = 4;

interface SendTypeItem {
  GoogleData: IComp[];
  selectedToggleButton?: string;
  comparisonBasis?: any;
  comparisonBasisView?: any;
  onMapClustersChange?: (clusters: any[]) => void;
  focusedPropertyId?: number | null;
  onClusterClick?: (properties: IComp[]) => void;
  hoveredPropertyId?: number | null;
  onApiDataUpdate?: (
    data: IComp[],
    bounds?: { north: number; south: number; east: number; west: number },
    zoom?: number,
    metadata?: any
  ) => void;
  // Sales-specific filter parameters
  filterParams?: {
    comparison_basis?: string;
    comparisonBasis: any;
    comparisonBasisView: any;
    land_dimension?: string;
    comp_type?: string;
    page?: number;
    propertyType?: any;
    orderByColumn?: string;
    type?: string;
    search?: string;
    orderBy?: string;
    compStatus?: string;
    state?: any;
    street_address?: any;
    cap_rate_min?: any;
    cap_rate_max?: any;
    price_sf_min?: any;
    price_sf_max?: any;
    land_sf_min?: any;
    land_sf_max?: any;
    square_footage_min?: any;
    square_footage_max?: any;
    building_sf_min?: any;
    building_sf_max?: any;
    city?: any;
    start_date?: any;
    lease_type?: any;
    end_date?: any;
    [key: string]: any;
  };
}

interface LocationDataItem {
  lat: number;
  lng: number;
  label: string;
  isOpen: boolean;
  content: JSX.Element;
  checkType: any;
  selectedToggleButton: any;
  propertyId?: number;
  comparisonBasisView: any;
}

interface ClusterData {
  lat: number;
  lng: number;
  count: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  properties?: IComp[];
  id?: string;
  bounds?: any;
  propertyTypes?: string[];
  avgSize?: number;
  avgPricePerSf?: number;
  comparisonBasisView: any;
}

const GoogleMapLocationLease: React.FC<SendTypeItem> = ({
  GoogleData,
  selectedToggleButton,
  onMapClustersChange,
  hoveredPropertyId,
  onApiDataUpdate,
  filterParams,
  comparisonBasisView,
  comparisonBasis,
}) => {
  const { isLoaded } = useContext(MyContext);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerData, setMarkerData] = useState<LocationDataItem[]>([]);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [loading, setLoading] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [mapCenter] = useState(defaultCenter);
  const [mapZoom] = useState(defaultZoom);
  const location = useLocation();

  const [calculatedZoom, setCalculatedZoom] = useState<number | null>(null);
  const [calculatedCenter, setCalculatedCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [hoveredInfoWindow, setHoveredInfoWindow] = useState<{
    property: IComp;
    position: { lat: number; lng: number };
  } | null>(null);
  const [hoveredPriceMarker, setHoveredPriceMarker] = useState<{
    property: IComp;
    position: { lat: number; lng: number };
  } | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);

  const [openPropertyId, setOpenPropertyId] = useState<number | null>(null); // Track which property InfoWindow should stay open
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null); // Track hover timeout

  // Debug clusters state changes
  useEffect(() => {
    // Clusters state monitoring
  }, [clusters, currentZoom]);
  const finalComparisonBasisView =
    comparisonBasisView ||
    comparisonBasis ||
    location.state?.comparisonBasis ||
    localStorage.getItem('comparisonBasisView') ||
    'SF'; // Default fallback
  const property_type = localStorage.getItem('checkType');
  const navigate = useNavigate();

  const viewListingItem = (id: number) => {
    let check;
    if (property_type === 'salesCheckbox') {
      check = 'sales';
    } else {
      check = 'lease';
    }
    const searchParams = new URLSearchParams(location.search);
    const propertyIdFromUrl = searchParams.get('id');
    const approachIdFromUrl = searchParams.get('approachId');

    navigate(`/evaluation/lease-comps-view/${id}/${check}`, {
      state: {
        propertyId: propertyIdFromUrl,
        approachId: approachIdFromUrl,
        selectedToggleButton: selectedToggleButton || null,
        comparisonBasisView: finalComparisonBasisView,
      },
    });
  };

  // Calculate optimal center and zoom from clusters
  const calculateOptimalViewport = useCallback((clusters: ClusterData[]) => {
    if (!clusters || clusters.length === 0) {
      return { center: defaultCenter, zoom: defaultZoom };
    }

    // Get all cluster coordinates
    const lats = clusters
      .map((cluster) => cluster.lat)
      .filter((lat) => !isNaN(lat));
    const lngs = clusters
      .map((cluster) => cluster.lng)
      .filter((lng) => !isNaN(lng));

    if (lats.length === 0 || lngs.length === 0) {
      return { center: defaultCenter, zoom: defaultZoom };
    }

    // Calculate bounds
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Check if most clusters are in the US
    const usClusterCount = clusters.filter(
      (cluster) =>
        cluster.lng >= -170 &&
        cluster.lng <= -50 &&
        cluster.lat >= 15 &&
        cluster.lat <= 70
    ).length;

    const isMainlyUS = usClusterCount / clusters.length > 0.8;

    // If mainly US clusters, ensure we center on US
    let finalCenterLat = centerLat;
    let finalCenterLng = centerLng;

    if (isMainlyUS) {
      const usClusters = clusters.filter(
        (cluster) =>
          cluster.lng >= -170 &&
          cluster.lng <= -50 &&
          cluster.lat >= 15 &&
          cluster.lat <= 70
      );

      if (usClusters.length > 0) {
        const usLats = usClusters.map((c) => c.lat);
        const usLngs = usClusters.map((c) => c.lng);
        finalCenterLat =
          usLats.reduce((sum, lat) => sum + lat, 0) / usLats.length;
        finalCenterLng =
          usLngs.reduce((sum, lng) => sum + lng, 0) / usLngs.length;
      }
    }

    // Calculate zoom level based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 14;
    if (maxDiff > 30) zoom = 3;
    else if (maxDiff > 20) zoom = 4;
    else if (maxDiff > 12) zoom = 5;
    else if (maxDiff > 8) zoom = 6;
    else if (maxDiff > 5) zoom = 7;
    else if (maxDiff > 2) zoom = 8;
    else if (maxDiff > 1) zoom = 9;
    else if (maxDiff > 0.5) zoom = 10;
    else if (maxDiff > 0.25) zoom = 11;
    else if (maxDiff > 0.1) zoom = 12;
    else zoom = 13;

    if (isMainlyUS && zoom < 4) {
      zoom = 5;
    }

    return {
      center: { lat: finalCenterLat, lng: finalCenterLng },
      zoom: zoom,
    };
  }, []);

  // API call for both cluster-details and clusters endpoints with sales-specific parameters
  const callBothAPIs = useCallback(
    async (map: google.maps.Map, useWorldBounds = false) => {
      if (!map) {
        return;
      }

      let north, south, east, west, zoom;

      if (useWorldBounds) {
        north = 85;
        south = -85;
        east = 180;
        west = -180;
        zoom = calculatedZoom || 4;
      } else {
        const bounds = map.getBounds();
        zoom = map.getZoom() || calculatedZoom || 4;

        if (!bounds) {
          return;
        }

        north = bounds.getNorthEast().lat();
        south = bounds.getSouthWest().lat();
        east = bounds.getNorthEast().lng();
        west = bounds.getSouthWest().lng();
      }

      setLoading(true);

      try {
        // Get filter parameters from localStorage and props
        const getFilterParams = () => {
          // Get filter parameters from localStorage
          const buildingMin = localStorage.getItem('building_sf_min')
            ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
            :  null;
          const buildingMax = localStorage.getItem('building_sf_max')
            ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
            :  null;
          const landMin = localStorage.getItem('land_sf_min')
            ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
            :  null;
          const landMax = localStorage.getItem('land_sf_max')
            ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
            :  null;
          const priceSfMin = localStorage.getItem('price_sf_min')
            ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
            :  null;
          const priceSfMax = localStorage.getItem('price_sf_max')
            ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
            :  null;
          const squareFootageMin = localStorage.getItem('square_footage_min')
            ? parseFloat(localStorage.getItem('square_footage_min')!.replace(/,/g, ''))
            :  null;
          const squareFootageMax = localStorage.getItem('square_footage_max')
            ? parseFloat(localStorage.getItem('square_footage_max')!.replace(/,/g, ''))
            :  null;
          const startDate = localStorage.getItem('start_date');
          const endDate = localStorage.getItem('end_date');
          const state = localStorage.getItem('state');
          const streetAddress = localStorage.getItem('street_address');
          const compStatus = localStorage.getItem('compStatus');
          const propertyType = localStorage.getItem('property_type');
          const leaseType = localStorage.getItem('lease_type');
          const selectedCities = localStorage.getItem('selectedCities');

          // Process city data
          let cityArray = [];
          if (selectedCities) {
            try {
              cityArray = JSON.parse(selectedCities);
            } catch (e) {
              console.warn('Failed to parse selectedCities:', e);
            }
          }

          // Process property type data
          let propertyTypeArray = null;
          if (propertyType) {
            propertyTypeArray = propertyType.split(',').filter(Boolean);
          }

          // Get comp type from localStorage
          const compType =
            localStorage.getItem('activeType') || 'building_with_land';

          // Determine transaction type based on localStorage checkType
          const checkType = localStorage.getItem('checkType');
          let transactionType = 'sale'; // Default for sales approach
          if (checkType === 'leasesCheckbox' || 'leaseCheckBox') {
            transactionType = 'lease';
          } else if (checkType === 'salesCheckbox' || !checkType) {
            transactionType = 'sale';
          }

          // Return filters object structure
          return {
            building_sf_max: buildingMax,
            building_sf_min: buildingMin,
            city: cityArray,
            compStatus: compStatus || '',
            comp_type: compType,
            comparison_basis: finalComparisonBasisView || 'SF',
            end_date: endDate || null,
            land_dimension:
              !localStorage.getItem('selectedSize') ||
              localStorage.getItem('selectedSize') === 'SF'
                ? 'SF'
                : 'ACRE',
            land_sf_max: landMax,
            land_sf_min: landMin,
            lease_type: leaseType || null,
            orderBy: filterParams?.orderBy || 'DESC',
            orderByColumn: filterParams?.orderByColumn || 'date_sold',
            price_sf_max: priceSfMax,
            price_sf_min: priceSfMin,
            propertyType: propertyTypeArray,
            search: filterParams?.search || '',
            square_footage_max: squareFootageMax,
            square_footage_min: squareFootageMin,
            start_date: startDate || null,
            state: state || null,
            street_address: streetAddress || null,
            type: transactionType,
          };
        };

        // Sales-specific parameters for evaluation/filter-comps with filters object structure
        const salesFilters = getFilterParams();
        const salesParams = {
          bounds: { north, south, east, west },
          zoom: zoom,
          page: filterParams?.page || 1,
          limit: 10,
          filters: salesFilters, // All filter parameters in filters object
        };

        const clustersParams = {
          bounds: { north, south, east, west },
          zoom: zoom,
          filters: salesFilters,
          //   filters: salesFilters, // Include same filters for clusters API
        };

        // Call both APIs in parallel
        const [clustersResponse, clusterDetailsResponse] = await Promise.all([
          APIClient.getInstance().post<any, typeof clustersParams>(
            'comps/map-clusters',
            clustersParams
          ),
          APIClient.getInstance().post<any, typeof salesParams>(
            'comps/map-cluster-details',
            salesParams
          ),
        ]);

        // Process clusters API response
        const clusters = clustersResponse.data?.data?.clusters || [];

        if (clusters && Array.isArray(clusters) && clusters.length > 0) {
          const processedClusters = clusters.map((cluster: any) => {
            let centerLat = cluster.center?.lat;
            let centerLng = cluster.center?.lng;

            if (!centerLat || !centerLng) {
              const north = parseFloat(cluster.bounds.north);
              const south = parseFloat(cluster.bounds.south);
              const east = parseFloat(cluster.bounds.east);
              const west = parseFloat(cluster.bounds.west);

              centerLat = (north + south) / 2;
              centerLng = (east + west) / 2;
            }

            return {
              lat: centerLat,
              lng: centerLng,
              count: cluster.count,
              avgPrice: parseFloat(cluster.avgPrice) || 0,
              avgSize: parseFloat(cluster.avgSize) || 0,
              avgPricePerSf: parseFloat(cluster.avgPricePerSf) || 0,
              minPrice: 0,
              maxPrice: 0,
              properties: [],
              id: cluster.id,
              bounds: cluster.bounds,
              propertyTypes: cluster.propertyTypes || [],
              comparisonBasisView: finalComparisonBasisView || 'SF',
            };
          });

          setClusters(processedClusters);

          // Calculate and set optimal viewport on initial load
          if (useWorldBounds && !calculatedZoom) {
            const optimalViewport = calculateOptimalViewport(processedClusters);
            setCalculatedZoom(optimalViewport.zoom);
            setCalculatedCenter(optimalViewport.center);

            if (map) {
              map.setZoom(optimalViewport.zoom);
              map.setCenter(optimalViewport.center);
            }
          }

          if (onMapClustersChange) {
            onMapClustersChange(processedClusters);
          }
        } else {
          setClusters([]);
          if (onMapClustersChange) {
            onMapClustersChange([]);
          }
        }

        // Process cluster-details API response for listing component
        const properties = clusterDetailsResponse.data?.data?.properties || [];
        const apiMetadata = clusterDetailsResponse.data?.data || {};

        if (onApiDataUpdate) {
          const currentBounds = { north, south, east, west };
          onApiDataUpdate(properties, currentBounds, zoom, apiMetadata);
        }
      } catch (error) {
        console.error('🌐 Error calling Sales APIs:', error);
      } finally {
        setLoading(false);
        setIsInteracting(false); // Hide loader when API call completes
      }
    },
    [onApiDataUpdate, onMapClustersChange, filterParams, calculatedZoom]
  );

  // Watch for filter changes and trigger API calls
  useEffect(() => {
    if (map && filterParams) {
      // Make API calls when filters change
      callBothAPIs(map, false); // Use current map bounds
    }
  }, [filterParams, map]); // Dependencies: filterParams and map only (callBothAPIs excluded to prevent infinite loop)

  // Debounced API call - waits 1 second after zoom stops
  const debouncedApiCall = useCallback(
    debounce((map: google.maps.Map) => {
      setIsInteracting(true); // Show loader only when API call starts
      callBothAPIs(map, false);
    }, 1000),
    [callBothAPIs]
  );

  // Handle zoom change
  const handleZoomChange = useCallback(
    (map: google.maps.Map) => {
      const zoom = map.getZoom() || 3;

      setCurrentZoom(zoom);

      // Close InfoWindow and clear openPropertyId when zoom changes to prevent popup from staying open
      setMarkerData((prevMarkerData) =>
        prevMarkerData.map((marker) => ({
          ...marker,
          isOpen: false,
        }))
      );
      setOpenPropertyId(null);

      // Don't set isInteracting immediately - wait for debounced call

      debouncedApiCall(map);
    },
    [debouncedApiCall]
  );

  // Handle map load
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      map.addListener('zoom_changed', () => {
        handleZoomChange(map);
      });

      // Add map type change listener to keep state in sync
      // map.addListener('maptypeid_changed', () => {
      //   const newMapType = map.getMapTypeId();
      //   if (newMapType) {
      //     setCurrentMapType(newMapType);
      //     console.log('🗺️ Map type changed to:', newMapType);
      //   }
      // });

      setTimeout(() => {
        callBothAPIs(map, true);
      }, 1000);
    },
    [handleZoomChange, callBothAPIs]
  );

  // Format price for display
  const formatFullPrice = (price: number | null | undefined): string => {
    if (!price || price === 0) return 'N/A';
    return `$${price.toLocaleString()}`;
  };

  // Create price marker with pointer
  const createPriceMarker = (
    price: number | null | undefined,
    isFromListing = false
  ): string => {
    const formattedPrice = formatFullPrice(price);
    const backgroundColor = isFromListing ? '#ffffff' : '#0DA1C7';
    const textColor = isFromListing ? 'rgb(13, 161, 199)' : '#ffffff';
    const fontSize = 12;
    const padding = 8;
    const borderRadius = 4;
    const pointerSize = 8;

    // Calculate text width (approximate)
    const textWidth = Math.max(60, formattedPrice.length * 7 + padding * 2);
    const rectHeight = 24;
    const totalHeight = rectHeight + pointerSize;

    const iconSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${textWidth}" height="${totalHeight}" viewBox="0 0 ${textWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Main rectangle -->
        <rect x="0" y="0" width="${textWidth}" height="${rectHeight}" rx="${borderRadius}" ry="${borderRadius}" fill="${backgroundColor}" stroke="#ffffff" stroke-width="1"/>
        <!-- Pointer triangle -->
        <polygon points="${textWidth / 2 - pointerSize / 2},${rectHeight} ${textWidth / 2 + pointerSize / 2},${rectHeight} ${textWidth / 2},${totalHeight}" fill="${backgroundColor}" stroke="#ffffff" stroke-width="1" stroke-linejoin="round"/>
        <!-- Price text -->
        <text x="${textWidth / 2}" y="${rectHeight / 2}" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" dominant-baseline="middle">
          ${formattedPrice}
        </text>
      </svg>
    `)}`;

    return iconSvg;
  };

  // Create cluster icon
  const createClusterIcon = (count: number, isHovered = false): string => {
    const baseSize =
      count > 1000
        ? Math.min(Math.max(45, Math.log10(count + 1) * 25), 75)
        : Math.min(Math.max(35, Math.log10(count + 1) * 25), 65);
    const size = isHovered ? Math.min(baseSize * 1.15, 85) : baseSize;

    const baseColor =
      count > 1000
        ? '#d73027'
        : count > 500
          ? '#fc8d59'
          : count > 100
            ? '#fee08b'
            : count > 10
              ? '#91bfdb'
              : '#4575b4';

    const color = isHovered ? baseColor : baseColor;
    const strokeColor = isHovered ? '#00BFFF' : '#ffffff';
    const strokeWidth = isHovered ? 3 : 2;
    const opacity = isHovered ? 1 : 0.95;

    const baseFontSize = Math.max(12, size / 3.5);
    const fontSize = isHovered
      ? Math.min(baseFontSize * 1.1, 20)
      : baseFontSize;

    const displayText =
      count > 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

    const shadowFilter = isHovered
      ? `<defs><filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs>`
      : '';

    const circleFilter = isHovered ? 'filter="url(#dropshadow)"' : '';

    const iconSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        ${shadowFilter}
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - strokeWidth}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" ${circleFilter}/>
        <text x="${size / 2}" y="${size / 2}" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="${fontSize}" font-weight="bold" dominant-baseline="middle">
          ${displayText}
        </text>
      </svg>
    `)}`;

    return iconSvg;
  };

  // Handle cluster click
  const handleClusterClick = async (cluster: ClusterData) => {
    if (map) {
      if (cluster.count === 1) {
        // Single property - find and show its InfoWindow
        let property = GoogleData?.find((prop) => {
          const lat = parseFloat(prop.map_pin_lat || prop.latitude);
          const lng = parseFloat(prop.map_pin_lng || prop.longitude);
          // Check if property coordinates match cluster coordinates (with some tolerance)
          return (
            Math.abs(lat - cluster.lat) < 0.001 &&
            Math.abs(lng - cluster.lng) < 0.001
          );
        });

        // If no exact match, try with larger tolerance
        if (!property) {
          property = GoogleData?.find((prop) => {
            const lat = parseFloat(prop.map_pin_lat || prop.latitude);
            const lng = parseFloat(prop.map_pin_lng || prop.longitude);
            // Use larger tolerance for property matching
            return (
              Math.abs(lat - cluster.lat) < 0.01 &&
              Math.abs(lng - cluster.lng) < 0.01
            );
          });
        }

        // Zoom to level 18 for single property first
        map.setZoom(18);
        map.setCenter({ lat: cluster.lat, lng: cluster.lng });

        if (property) {
          // Track this property as the one that should stay open
          setOpenPropertyId(property.id);

          // Use setTimeout to ensure InfoWindow shows after zoom completes
          setTimeout(() => {
            setMarkerData((prevMarkerData) =>
              prevMarkerData.map((marker) => ({
                ...marker,
                isOpen: marker.propertyId === property.id,
              }))
            );
          }, 300); // Timeout for better reliability
        } else {
          // Use a temporary ID based on cluster coordinates
          const tempId =
            Math.round(cluster.lat * 1000000) +
            Math.round(cluster.lng * 1000000);
          setOpenPropertyId(tempId);
        }
      } else {
        setLoading(true);
        try {
          if ((cluster as any).bounds) {
            const bounds = new google.maps.LatLngBounds();
            const clusterBounds = (cluster as any).bounds;

            bounds.extend({
              lat: parseFloat(clusterBounds.north),
              lng: parseFloat(clusterBounds.east),
            });
            bounds.extend({
              lat: parseFloat(clusterBounds.south),
              lng: parseFloat(clusterBounds.west),
            });

            map.fitBounds(bounds);

            google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
              const currentZoom = map.getZoom();
              if (currentZoom && currentZoom > 16) {
                map.setZoom(16);
              }

              // For multi-property clusters, don't show InfoWindows - just zoom in
              // InfoWindows will only show when individual property markers are clicked
            });
          } else {
            const newZoom = Math.min(currentZoom + 3, 18);
            map.setZoom(newZoom);
            map.setCenter({ lat: cluster.lat, lng: cluster.lng });
          }
        } catch (error) {
          console.error('Error handling cluster click:', error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Handle focused property from listing and hovered property
  useEffect(() => {
    if (hoveredPropertyId && GoogleData) {
      const hoveredProperty = GoogleData.find(
        (property) => property.id === hoveredPropertyId
      );

      if (hoveredProperty) {
        const lat = parseFloat(
          hoveredProperty.map_pin_lat || hoveredProperty.latitude
        );
        const lng = parseFloat(
          hoveredProperty.map_pin_lng || hoveredProperty.longitude
        );

        if (!isNaN(lat) && !isNaN(lng)) {
          setHoveredPriceMarker({
            property: hoveredProperty,
            position: { lat, lng },
          });
        }
      }
    } else {
      setHoveredPriceMarker(null);
    }
  }, [hoveredPropertyId, GoogleData]);

  useEffect(() => {
    if (GoogleData && GoogleData.length > 0) {
      const locationData: LocationDataItem[] = GoogleData.map((elem, index) => {
        // Check if this property should stay open (from single cluster click)
        const isOpen = openPropertyId === elem.id;

        const lat = parseFloat(elem.map_pin_lat || elem.latitude);
        const lng = parseFloat(elem.map_pin_lng || elem.longitude);

        return {
          lat: lat,
          lng: lng,
          label: elem.label,
          isOpen: isOpen,
          propertyId: elem.id,
          content: (
            <Box
              key={index}
              className="flex bg-[white] rounded-lg w-full mb-4 p-2 border border-solid border-[#f3f3f3]"
              style={{
                boxShadow: '4px 7px 5px 7px #00000008',
                minWidth: '600px',
                width: '600px',
              }}
            >
              <Box className="flex-1">
                <img
                  style={{
                    width: '100%',
                    maxWidth: '170px',
                    objectFit: 'cover',
                    height: 'auto',
                    minHeight: '115px',
                    objectPosition: 'center center',
                  }}
                  src={
                    elem.property_image_url
                      ? import.meta.env.VITE_S3_URL + elem.property_image_url
                      : listImage
                  }
                  className="rounded-img-list-comps"
                />
              </Box>
              <Box className="flex-1 py-3">
                <Box className="flex mb-1.5">
                  <Tooltip title={elem.street_address}>
                    <Box
                      className="text-[#0DA1C7] text-base font-semibold capitalize leading-6 MuiBox-root css-0"
                      style={{ paddingRight: '0.3rem' }}
                    >
                      {elem.street_address}
                    </Box>
                  </Tooltip>
                </Box>
                <Box className="text-sm flex text-left">
                  <Tooltip title={`${elem.street_address}`}>
                    <Box className="text-sm text-ellipsis overflow-hidden font-normal text-gray-900">
                      {elem.street_address}
                    </Box>
                  </Tooltip>
                </Box>

                <Tooltip
                  title={`${elem.city}, ${elem.state?.toUpperCase()}, ${elem.zipcode}`}
                >
                  <Box className="text-sm py-0.5 text-ellipsis overflow-hidden font-normal text-gray-900">
                    {`${elem.city}, ${elem.state?.toUpperCase()}, ${elem.zipcode}`}
                  </Box>
                </Tooltip>
                {localStorage.getItem('activeType') === 'building_with_land' ? (
                  <Box className="flex gap-1 text-sm flex-wrap">
                    <p className="text-nowrap font-normal text-gray-900">
                      Year Built :
                    </p>
                    <p className="font-normal text-gray-900">
                      {(elem as any)?.year_built === null ||
                      (elem as any)?.year_built === ''
                        ? 'N/A'
                        : (elem as any)?.year_built}
                    </p>
                  </Box>
                ) : null}
              </Box>
              <Box className="text-sm flex-1 py-3">
                {localStorage.getItem('activeType') !== 'land_only' ? (
                  <Box className="flex gap-1 flex-wrap">
                    <p className="font-normal text-gray-900">Building Size :</p>
                    <Tooltip
                      title={
                        elem?.building_size === null ||
                        elem?.building_size === 0
                          ? 'N/A'
                          : elem?.building_size.toLocaleString() + ' SF'
                      }
                    >
                      <p className="font-normal text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                        {elem?.building_size === null ||
                        elem?.building_size === 0
                          ? 'N/A'
                          : elem?.building_size.toLocaleString() + ' ' + 'SF'}
                      </p>
                    </Tooltip>
                  </Box>
                ) : null}

                {localStorage.getItem('activeType') === 'building_with_land' ? (
                  <Box className="flex gap-1 flex-wrap">
                    <p className="text-sm font-normal text-gray-900">
                      Land Size :
                    </p>
                    <Tooltip
                      title={
                        (elem as any).land_dimension === 'ACRE'
                          ? elem?.land_size === null || elem?.land_size === 0
                            ? 'N/A'
                            : (elem?.land_size * 43560)?.toLocaleString() +
                              ' SF'
                          : elem?.land_size === null || elem?.land_size === 0
                            ? 'N/A'
                            : elem?.land_size?.toLocaleString() + ' SF'
                      }
                    >
                      <p className="text-[13px] font-normal text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                        {(elem as any).land_dimension === 'ACRE'
                          ? elem?.land_size === null || elem?.land_size === 0
                            ? 'N/A'
                            : (elem?.land_size * 43560)?.toLocaleString() +
                              ' ' +
                              'SF'
                          : elem?.land_size === null || elem?.land_size === 0
                            ? 'N/A'
                            : elem?.land_size?.toLocaleString() + ' ' + 'SF'}
                      </p>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box className="flex gap-1 flex-wrap">
                    <p className="text-sm font-normal text-gray-900">
                      Land Size :
                    </p>
                    <p className="text-[13px] font-normal text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                      {selectedToggleButton === 'SF'
                        ? (elem as any).land_dimension === 'ACRE'
                          ? elem?.land_size === null || elem?.land_size === 0
                            ? 'N/A'
                            : (elem?.land_size * 43560)?.toLocaleString() +
                              ' SF'
                          : elem?.land_size === null || elem?.land_size === 0
                            ? 'N/A'
                            : elem?.land_size?.toLocaleString() + ' SF'
                        : selectedToggleButton === 'AC'
                          ? (elem as any).land_dimension === 'SF'
                            ? elem?.land_size === null || elem?.land_size === 0
                              ? 'N/A'
                              : (elem?.land_size / 43560)
                                  ?.toFixed(3)
                                  .toLocaleString() + ' AC'
                            : elem?.land_size === null || elem?.land_size === 0
                              ? 'N/A'
                              : elem?.land_size.toFixed(3).toLocaleString() +
                                ' AC'
                          : 'N/A'}
                    </p>
                  </Box>
                )}
                {property_type === 'salesCheckbox' || !property_type ? (
                  <Box className="flex gap-1 flex-wrap">
                    <p className="text-sm font-normal text-gray-900">
                      {(elem as any)?.sale_status === 'Pending'
                        ? 'Sale Status :'
                        : 'Date of Sale :'}
                    </p>
                    <Tooltip
                      title={
                        (elem as any)?.sale_status === 'Pending'
                          ? (elem as any)?.sale_status
                          : formatDateToMMDDYYYY(elem?.date_sold)
                      }
                    >
                      <p className="text-[13px] font-normal text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                        {(elem as any)?.sale_status === 'Pending'
                          ? (elem as any)?.sale_status
                          : formatDateToMMDDYYYY(elem?.date_sold)}
                      </p>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box className="flex gap-1 flex-wrap">
                    <p className="font-normal text-gray-900">Lease Status :</p>
                    <Tooltip
                      title={
                        (elem as any)?.lease_status === 'select' ||
                        (elem as any)?.lease_status === ''
                          ? 'N/A'
                          : (elem as any)?.lease_status === 'new_lease'
                            ? 'New Lease'
                            : (elem as any)?.lease_status
                      }
                    >
                      <p className="font-normal text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                        {(elem as any)?.lease_status === 'select' ||
                        (elem as any)?.lease_status === ''
                          ? 'N/A'
                          : (elem as any)?.lease_status === 'new_lease'
                            ? 'New Lease'
                            : (elem as any)?.lease_status}
                      </p>
                    </Tooltip>
                  </Box>
                )}
                <div
                  className={`flex justify-end items-center mt-2.5 ${
                    localStorage.getItem('activeType') === 'land_only'
                      ? 'mt-7'
                      : ''
                  }`}
                >
                  {elem.ai_generated === 1 && (
                    <img
                      src={AiImage}
                      style={{
                        width: '30px',
                        height: '30px',
                        marginRight: '5px',
                      }}
                    />
                  )}
                  <Box className="">
                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      style={{
                        borderRadius: '0 0 0 10px',
                        padding: '2.5px 20px',
                        textTransform: 'capitalize',
                      }}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        viewListingItem(elem.id);
                      }}
                    >
                      View
                    </CommonButton>
                  </Box>
                </div>
              </Box>
            </Box>
          ),
          checkType: property_type,
          selectedToggleButton: selectedToggleButton,
          comparisonBasisView: finalComparisonBasisView,
        };
      });

      setMarkerData(locationData);
    }
  }, [GoogleData, selectedToggleButton]);

  const handleCloseInfoWindow = () => {
    // Don't clear openPropertyId to keep the red location marker visible
    // Only close the InfoWindow
    setMarkerData((prevMarkerData) =>
      prevMarkerData.map((marker) => ({
        ...marker,
        isOpen: false,
      }))
    );
  };

  useEffect(() => {
    if (map) {
      const listener = map.addListener('click', () => {
        // Only close InfoWindow when clicking on map, keep red marker visible
        handleCloseInfoWindow();
      });
      return () => {
        listener.remove();
      };
    }
  }, [map]);

  // Cleanup function on unmount
  useEffect(() => {
    return () => {
      debouncedApiCall.cancel();
    };
  }, [debouncedApiCall]);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  return isLoaded ? (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Custom Zoom Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '129px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => {
            if (map) {
              const currentZoom = map.getZoom() || 0;
              if (currentZoom < 20) {
                map.setZoom(Math.min(currentZoom + 2, 20));
              }
            }
          }}
          disabled={currentZoom >= 20}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: currentZoom >= 20 ? '#f5f5f5' : 'white',
            border: 'none',
            fontSize: '28px',
            fontWeight: 'medium',
            cursor: currentZoom >= 20 ? 'not-allowed' : 'pointer',
            color: currentZoom >= 20 ? '#ccc' : '#666',
            display: 'block',
          }}
        >
          +
        </button>
        <div
          style={{
            height: '1px',
            backgroundColor: '#ddd',
            margin: '0 8px',
          }}
        />
        <button
          onClick={() => {
            if (map) {
              const currentZoom = map.getZoom() || 0;
              if (currentZoom > 3) {
                map.setZoom(Math.max(currentZoom - 2, 3));
              }
            }
          }}
          disabled={currentZoom <= 3}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: currentZoom <= 3 ? '#f5f5f5' : 'white',
            border: 'none',
            fontSize: '28px',
            fontWeight: 'medium',
            cursor: currentZoom <= 3 ? 'not-allowed' : 'pointer',
            color: currentZoom <= 3 ? '#ccc' : '#666',
            display: 'block',
          }}
        >
          −
        </button>
      </div>

      {/* Application loader - centered with overlay */}
      {(loading || isInteracting) && (
        <>
          {/* Semi-transparent overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 999,
            }}
          />
          {/* Centered application loader */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <div className="img-update-loader">
              <img src={loadingImage} />
            </div>
          </div>
        </>
      )}

      <GoogleMap
        mapContainerClassName="googleMap"
        mapContainerStyle={containerStyle}
        center={calculatedCenter || mapCenter}
        zoom={calculatedZoom || mapZoom}
        options={{
          // mapTypeId: currentMapType, // Use state variable instead of hardcoded value
          tilt: 0, // Apply tilt only for satellite view
          mapTypeControl: true, // Allow users to switch map types
          streetViewControl: false,
          zoomControl: false, // Disable default zoom controls
          minZoom: 4, // Minimum zoom level
          maxZoom: 20, // Maximum zoom level
        }}
        onLoad={(map) => {
          setMap(map);
          handleMapLoad(map);
        }}
        onUnmount={onUnmount}
      >
        {/* Render clusters - hide at zoom level 15+ */}
        {currentZoom < 15 &&
          clusters.map((cluster, index) => {
            const clusterId =
              (cluster as any).id ||
              `lease-cluster-${index}-${cluster.lat}-${cluster.lng}`;
            const isHovered = hoveredClusterId === clusterId;

            const title = [
              `${cluster.count} ${cluster.count === 1 ? 'property' : 'properties'}`,
              cluster.avgPrice && cluster.avgPrice > 0
                ? `Avg Price: $${cluster.avgPrice.toLocaleString()}`
                : '',
              (cluster as any).avgSize && (cluster as any).avgSize > 0
                ? `Avg Size: ${(cluster as any).avgSize.toLocaleString()} SF`
                : '',
              (cluster as any).avgPricePerSf &&
              (cluster as any).avgPricePerSf > 0
                ? `Avg $/SF: $${(cluster as any).avgPricePerSf.toFixed(2)}`
                : '',
            ]
              .filter(Boolean)
              .join(' | ');

            const iconSize =
              cluster.count > 1000
                ? isHovered
                  ? 60
                  : 55
                : isHovered
                  ? 50
                  : 45;
            const anchorPoint = isHovered
              ? cluster.count > 1000
                ? 30
                : 25
              : cluster.count > 1000
                ? 27.5
                : 22.5;

            return (
              <Marker
                key={clusterId}
                position={{ lat: cluster.lat, lng: cluster.lng }}
                icon={{
                  url: createClusterIcon(cluster.count, isHovered),
                  scaledSize: new google.maps.Size(iconSize, iconSize),
                  anchor: new google.maps.Point(anchorPoint, anchorPoint),
                }}
                title={title}
                onClick={() => handleClusterClick(cluster)}
                onMouseOver={() => setHoveredClusterId(clusterId)}
                onMouseOut={() => setHoveredClusterId(null)}
                options={{
                  zIndex: isHovered ? 1000 + index : 100 + index,
                }}
              />
            );
          })}

        {/* Individual property price markers when zoom > 14 */}
        {currentZoom > 14 &&
          clusters &&
          clusters.length > 0 &&
          clusters.flatMap((cluster, clusterIndex) => {
            const propertiesAtLocation =
              GoogleData?.filter((prop) => {
                const lat = parseFloat(prop.map_pin_lat || prop.latitude);
                const lng = parseFloat(prop.map_pin_lng || prop.longitude);
                return (
                  Math.abs(lat - cluster.lat) < 0.001 &&
                  Math.abs(lng - cluster.lng) < 0.001
                );
              }) || [];

            return propertiesAtLocation.map((property, propertyIndex) => {
              const clusterId = `property-marker-${clusterIndex}-${propertyIndex}-${cluster.lat}-${cluster.lng}`;

              // Use actual property coordinates instead of cluster coordinates
              const propertyLat = parseFloat(
                property.map_pin_lat || property.latitude
              );
              const propertyLng = parseFloat(
                property.map_pin_lng || property.longitude
              );

              const price =
                property_type === 'salesCheckbox' || !property_type
                  ? property?.sale_price
                  : property?.lease_rate;

              const formattedPrice = formatFullPrice(price);
              const markerWidth = Math.max(80, formattedPrice.length * 8 + 20);
              const markerHeight = 42; // 32 + 10 for pointer

              return (
                <Marker
                  key={`price-marker-${clusterId}`}
                  position={{ lat: propertyLat, lng: propertyLng }}
                  icon={{
                    url: createPriceMarker(price),
                    scaledSize: new google.maps.Size(markerWidth, markerHeight),
                    anchor: new google.maps.Point(
                      markerWidth / 2,
                      markerHeight - 4
                    ), // Point to the tip of the pointer
                  }}
                  title={`${property.street_address} - ${formattedPrice}`}
                  onClick={() => {
                    // Open comp detail card on click
                    setMarkerData((prevMarkerData) =>
                      prevMarkerData.map((marker) => ({
                        ...marker,
                        isOpen: marker.propertyId === property.id,
                      }))
                    );
                  }}
                  // No hover functionality for price markers - only click to open detail card
                  options={{
                    zIndex: 500 + clusterIndex + propertyIndex,
                  }}
                />
              );
            });
          })}

        {/* Red location markers when clusters are hidden (zoom >= 15) */}
        {currentZoom >= 15 &&
          clusters &&
          clusters.length > 0 &&
          clusters.flatMap((cluster, clusterIndex) => {
            const propertiesAtLocation =
              GoogleData?.filter((prop) => {
                const lat = parseFloat(prop.map_pin_lat || prop.latitude);
                const lng = parseFloat(prop.map_pin_lng || prop.longitude);
                return (
                  Math.abs(lat - cluster.lat) < 0.001 &&
                  Math.abs(lng - cluster.lng) < 0.001
                );
              }) || [];

            return propertiesAtLocation.map((property, propertyIndex) => {
              const clusterId = `cluster-marker-${clusterIndex}-${propertyIndex}-${cluster.lat}-${cluster.lng}`;

              // Use actual property coordinates instead of cluster coordinates
              const propertyLat = parseFloat(
                property.map_pin_lat || property.latitude
              );
              const propertyLng = parseFloat(
                property.map_pin_lng || property.longitude
              );

              return (
                <Marker
                  key={`red-marker-${clusterId}`}
                  position={{ lat: propertyLat, lng: propertyLng }}
                  onClick={() => {
                    setOpenPropertyId(property.id);
                    setMarkerData((prevMarkerData) =>
                      prevMarkerData.map((marker) => ({
                        ...marker,
                        isOpen: marker.propertyId === property.id,
                      }))
                    );
                  }}
                  onMouseOver={() => {
                    if (hoverTimeout) clearTimeout(hoverTimeout);
                    setHoveredInfoWindow({
                      property,
                      position: { lat: propertyLat, lng: propertyLng },
                    });
                  }}
                  onMouseOut={() => {
                    if (hoverTimeout) clearTimeout(hoverTimeout);
                    const timeout = setTimeout(() => {
                      setHoveredInfoWindow(null);
                    }, 300);
                    setHoverTimeout(timeout);
                  }}
                />
              );
            });
          })}

        {/* Location marker for single property at high zoom (from cluster click) */}
        {currentZoom >= 15 &&
          openPropertyId &&
          (() => {
            // First try to find the property in GoogleData
            const property = GoogleData?.find((p) => p.id === openPropertyId);

            if (property) {
              const lat = parseFloat(property.map_pin_lat || property.latitude);
              const lng = parseFloat(
                property.map_pin_lng || property.longitude
              );

              if (!isNaN(lat) && !isNaN(lng)) {
                return (
                  <Marker
                    key={`location-${property.id}`}
                    position={{ lat, lng }}
                    onClick={() => {
                      // Reopen the InfoWindow for this property
                      setMarkerData((prevMarkerData) =>
                        prevMarkerData.map((marker) => ({
                          ...marker,
                          isOpen: marker.propertyId === property.id,
                        }))
                      );
                    }}
                    onMouseOver={() => {
                      if (hoverTimeout) clearTimeout(hoverTimeout);
                      setHoveredInfoWindow({
                        property,
                        position: { lat, lng },
                      });
                    }}
                    onMouseOut={() => {
                      if (hoverTimeout) clearTimeout(hoverTimeout);
                      const timeout = setTimeout(() => {
                        setHoveredInfoWindow(null);
                      }, 300);
                      setHoverTimeout(timeout);
                    }}
                  />
                );
              }
            } else {
              // If no property found but we have openPropertyId (temp ID case)
              // Show red marker at the cluster location
              const currentCluster = clusters.find((c) => {
                const tempId =
                  Math.round(c.lat * 1000000) + Math.round(c.lng * 1000000);
                return tempId === openPropertyId;
              });

              if (currentCluster) {
                return (
                  <Marker
                    key={`temp-location-${openPropertyId}`}
                    position={{
                      lat: currentCluster.lat,
                      lng: currentCluster.lng,
                    }}
                  />
                );
              }
            }

            return null;
          })()}

        {/* Info windows for individual properties */}
        {markerData.map(
          (marker, index) =>
            marker.isOpen && (
              <InfoWindow
                key={`info-${index}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                onCloseClick={handleCloseInfoWindow}
              >
                {marker.content}
              </InfoWindow>
            )
        )}

        {/* Hovered property InfoWindow - Simple price display for red markers only */}
        {hoveredInfoWindow && (
          <InfoWindow
            key={`hovered-${hoveredInfoWindow.property.id}`}
            position={hoveredInfoWindow.position}
            options={{
              disableAutoPan: true,
              headerDisabled: true,
              pixelOffset: new google.maps.Size(0, -40),
            }}
          >
            <div
              style={{
                padding: '2px 4px',
                minWidth: '50px',
                textAlign: 'center',
                backgroundColor: 'rgb(13, 161, 199)',
                borderRadius: '4px',
              }}
              onMouseEnter={() => {
                if (hoverTimeout) clearTimeout(hoverTimeout);
              }}
              onMouseLeave={() => {
                if (hoverTimeout) clearTimeout(hoverTimeout);
                const timeout = setTimeout(() => {
                  setHoveredInfoWindow(null);
                }, 300);
                setHoverTimeout(timeout);
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {property_type === 'salesCheckbox' || !property_type
                  ? hoveredInfoWindow?.property?.sale_price
                    ? `$${hoveredInfoWindow.property.sale_price.toLocaleString()}`
                    : 'N/A'
                  : hoveredInfoWindow?.property?.lease_rate
                    ? `$${hoveredInfoWindow.property.lease_rate.toLocaleString()}`
                    : 'N/A'}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Price marker for listing hover */}
        {hoveredPriceMarker && (
          <Marker
            key={`hover-price-marker-${hoveredPriceMarker.property.id}`}
            position={hoveredPriceMarker.position}
            icon={{
              url: createPriceMarker(
                property_type === 'salesCheckbox' || !property_type
                  ? hoveredPriceMarker.property.sale_price
                  : hoveredPriceMarker.property.lease_rate,
                true
              ),
              scaledSize: new google.maps.Size(
                Math.max(
                  80,
                  formatFullPrice(
                    property_type === 'salesCheckbox' || !property_type
                      ? hoveredPriceMarker.property.sale_price
                      : hoveredPriceMarker.property.lease_rate
                  ).length *
                    8 +
                    20
                ),
                42
              ),
              anchor: new google.maps.Point(
                Math.max(
                  80,
                  formatFullPrice(
                    property_type === 'salesCheckbox' || !property_type
                      ? hoveredPriceMarker.property.sale_price
                      : hoveredPriceMarker.property.lease_rate
                  ).length *
                    8 +
                    20
                ) / 2,
                38
              ),
            }}
            options={{
              zIndex: 2000,
            }}
          />
        )}

        {/* Full property InfoWindow for detailed view */}
        {hoveredInfoWindow && false && (
          <InfoWindow
            key={`detailed-${hoveredInfoWindow?.property?.id}`}
            position={hoveredInfoWindow?.position}
            onCloseClick={() => setHoveredInfoWindow(null)}
          >
            <Box
              className="flex bg-[white] rounded-lg w-full mb-4 p-2 border border-solid border-[#f3f3f3]"
              style={{
                boxShadow: '4px 7px 5px 7px #00000008',
                minWidth: '600px',
                width: '600px',
              }}
            >
              <Box className="flex-1">
                <img
                  style={{
                    width: '100%',
                    maxWidth: '170px',
                    objectFit: 'cover',
                    height: 'auto',
                    minHeight: '115px',
                    objectPosition: 'center center',
                  }}
                  src={
                    hoveredInfoWindow?.property?.property_image_url
                      ? import.meta.env.VITE_S3_URL +
                        hoveredInfoWindow?.property?.property_image_url
                      : listImage
                  }
                  className="rounded-img-list-comps"
                />
              </Box>

              <Box className="flex-1 py-3">
                <Box className="flex mb-1.5">
                  <Tooltip
                    title={hoveredInfoWindow?.property?.street_address ?? ''}
                  >
                    <Box
                      className="text-[#0DA1C7] text-base font-semibold capitalize leading-6 MuiBox-root css-0"
                      style={{ paddingRight: '0.3rem' }}
                    >
                      {hoveredInfoWindow?.property?.street_address}
                    </Box>
                  </Tooltip>
                </Box>

                <Box className="text-sm flex text-left">
                  <Tooltip
                    title={`${hoveredInfoWindow?.property?.street_address ?? ''}`}
                  >
                    <Box className="text-sm text-ellipsis overflow-hidden font-normal text-gray-900">
                      {hoveredInfoWindow?.property?.street_address}
                    </Box>
                  </Tooltip>
                </Box>

                <Tooltip
                  title={`${hoveredInfoWindow?.property?.city ?? ''}, ${hoveredInfoWindow?.property?.state?.toUpperCase() ?? ''}, ${hoveredInfoWindow?.property?.zipcode ?? ''}`}
                >
                  <Box className="text-sm py-0.5 text-ellipsis overflow-hidden font-normal text-gray-900">
                    {`${hoveredInfoWindow?.property?.city ?? ''}, ${hoveredInfoWindow?.property?.state?.toUpperCase() ?? ''}, ${hoveredInfoWindow?.property?.zipcode ?? ''}`}
                  </Box>
                </Tooltip>

                {localStorage.getItem('activeType') ===
                  'building_with_land' && (
                  <Box className="flex gap-1 text-sm flex-wrap">
                    <p className="text-nowrap font-normal text-gray-900">
                      Year Built :
                    </p>
                    <p className="font-normal text-gray-900">
                      {hoveredInfoWindow?.property?.year_built
                        ? hoveredInfoWindow?.property?.year_built
                        : 'N/A'}
                    </p>
                  </Box>
                )}
              </Box>

              <Box className="text-sm flex-1 py-3">
                {localStorage.getItem('activeType') !== 'land_only' && (
                  <Box className="flex gap-1 flex-wrap">
                    <p className="font-normal text-gray-900">Building Size :</p>
                    <Tooltip
                      title={
                        !hoveredInfoWindow?.property?.building_size
                          ? 'N/A'
                          : hoveredInfoWindow?.property?.building_size?.toLocaleString() +
                            ' SF'
                      }
                    >
                      <p className="font-normal text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                        {!hoveredInfoWindow?.property?.building_size
                          ? 'N/A'
                          : hoveredInfoWindow?.property?.building_size?.toLocaleString() +
                            ' SF'}
                      </p>
                    </Tooltip>
                  </Box>
                )}

                {/* same pattern continues for Land Size, Sale Status, Lease Status, etc. */}

                <div
                  className={`flex justify-end items-center mt-2.5 ${
                    localStorage.getItem('activeType') === 'land_only'
                      ? 'mt-7'
                      : ''
                  }`}
                >
                  {hoveredInfoWindow?.property?.ai_generated === 1 && (
                    <img
                      src={AiImage}
                      style={{
                        width: '30px',
                        height: '30px',
                        marginRight: '5px',
                      }}
                    />
                  )}
                  <Box>
                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      style={{
                        borderRadius: '0 0 0 10px',
                        padding: '2.5px 20px',
                        textTransform: 'capitalize',
                      }}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        if (hoveredInfoWindow?.property?.id) {
                          viewListingItem(hoveredInfoWindow.property.id);
                        }
                      }}
                    >
                      View
                    </CommonButton>
                  </Box>
                </div>
              </Box>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : (
    <div>Loading Google Maps...</div>
  );
};

export default GoogleMapLocationLease;
