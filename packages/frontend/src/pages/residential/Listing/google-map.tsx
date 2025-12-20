/* The above code is a TypeScript React component that utilizes the Google Maps API to display property
data on a map. Here is a summary of what the code does: */
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { IComp } from '@/components/interface/header-filter';
import { MyContext } from '@/App';
import listImage from '../../../images/list.jpg';
import AiImage from '../../../images/AI SVG.svg';
import loadingImage from '../../../images/loading.png';
import { Box, Tooltip } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import { ListingEnum } from '@/pages/comps/enum/CompsEnum';
import { formatDateToMMDDYYYY } from '@/utils/date-format';
import { useNavigate, useLocation } from 'react-router-dom';
import { APIClient } from '@/api/api-client';
import { debounce } from 'lodash';

interface SendTypeItem {
  GoogleData: IComp[];
  clustersData?: any[]; // Add clusters data prop
  selectedToggleButton?: string;
  onMapClustersChange?: (clusters: any[]) => void;
  focusedPropertyId?: number | null;
  onClusterClick?: (properties: IComp[]) => void; // New prop for cluster clicks
  hoveredPropertyId?: number | null; // New prop for hovered property
  onApiDataUpdate?: (
    data: IComp[],
    bounds?: { north: number; south: number; east: number; west: number },
    zoom?: number,
    metadata?: any
  ) => void; // Enhanced prop for API data update with bounds, zoom, and API metadata
  // Filter parameters for cluster-details API
  filterParams?: {
    comparison_basis?: string;
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
    [key: string]: any; // Allow additional filter properties
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
}

interface ClusterData {
  lat: number;
  lng: number;
  count: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  properties?: IComp[]; // Store the actual properties in the cluster
}

const containerStyle = {
  aspectRatio: '16/9',
};

// Fixed center and zoom for US-centered map
const defaultCenter = {
  lat: 39.5, // US center latitude
  lng: -98.35, // US center longitude
};
const defaultZoom = 5; // Fixed zoom level for US view

const GoogleMapLocationComps: React.FC<SendTypeItem> = ({
  GoogleData,
  clustersData,
  selectedToggleButton,
  onMapClustersChange,
  hoveredPropertyId,
  onApiDataUpdate,
  filterParams,
}) => {
  const { isLoaded } = useContext(MyContext);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerData, setMarkerData] = useState<LocationDataItem[]>([]);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [showClusters, setShowClusters] = useState(true);

  const [hoveredInfoWindow, setHoveredInfoWindow] = useState<{
    property: IComp;
    position: { lat: number; lng: number };
    isFromListing?: boolean;
  } | null>(null);
  const [hoveredPriceMarker, setHoveredPriceMarker] = useState<{
    property: IComp;
    position: { lat: number; lng: number };
  } | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  // const [currentMapType, setCurrentMapType] = useState<string>(
  //   google.maps.MapTypeId.ROADMAP
  // ); // Add state for map type
  const [openPropertyId, setOpenPropertyId] = useState<number | null>(null); // Track which property InfoWindow should stay open
  // const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug clusters state changes
  useEffect(() => {
    // Clusters state monitoring
  }, [clusters, showClusters, currentZoom]);

  // Update clusters when clustersData prop changes
  useEffect(() => {
    if (clustersData && Array.isArray(clustersData)) {
      if (clustersData.length > 0) {
        // Transform the clusters data to match the expected ClusterData format
        const processedClusters: ClusterData[] = clustersData.map(
          (cluster: any) => {
            // Prefer center provided by API; fallback to computing from bounds
            let centerLat: number | null = null;
            let centerLng: number | null = null;

            if (cluster.center) {
              const rawLat = cluster.center.lat;
              const rawLng = cluster.center.lng;
              centerLat =
                typeof rawLat === 'number' ? rawLat : parseFloat(rawLat || '0');
              centerLng =
                typeof rawLng === 'number' ? rawLng : parseFloat(rawLng || '0');
            }

            if ((centerLat === null || isNaN(centerLat)) && cluster.bounds) {
              const north = parseFloat(cluster.bounds.north);
              const south = parseFloat(cluster.bounds.south);
              centerLat = (north + south) / 2;
            }
            if ((centerLng === null || isNaN(centerLng)) && cluster.bounds) {
              const east = parseFloat(cluster.bounds.east);
              const west = parseFloat(cluster.bounds.west);
              centerLng = (east + west) / 2;
            }

            const finalLat = centerLat ?? 0;
            const finalLng = centerLng ?? 0;

            return {
              lat: finalLat,
              lng: finalLng,
              count: cluster.count || 0,
              avgPrice: parseFloat(cluster.avgPrice) || 0,
              avgSize: parseFloat(cluster.avgSize) || 0,
              avgPricePerSf: parseFloat(cluster.avgPricePerSf) || 0,
              minPrice: cluster.minPrice || 0,
              maxPrice: cluster.maxPrice || 0,
              properties: cluster.properties || [],
              id: cluster.id || `cluster_${finalLat}_${finalLng}`,
              bounds: cluster.bounds,
              propertyTypes: cluster.propertyTypes || [],
            } as any;
          }
        );

        setClusters(processedClusters);

        if (onMapClustersChange) {
          onMapClustersChange(processedClusters);
        }
      } else {
        // Empty clusters array - clear all clusters
        setClusters([]);

        if (onMapClustersChange) {
          onMapClustersChange([]);
        }
      }
    }
  }, [clustersData, onMapClustersChange]);

  const property_type = localStorage.getItem('checkType');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if Edit button should be hidden based on URL
  const hideEditButton =
    location.pathname.includes('filter-cost-comps') ||
    location.pathname.includes('filter-comps') ||
    location.pathname.includes('filter-lease-comps') ||
    location.pathname.includes('evaluation/filter-comps') ||
    location.pathname.includes('evaluation/filter-lease-comps') ||
    location.pathname.includes('evaluation/filter-cost-comps') ||
    location.pathname.includes('evaluation/filter-cap-comps') ||
    location.pathname.includes('evaluation/filter-multi-family-comps');
  location.pathname.includes(' residential/filter-sales-comps');

  const viewListingItem = (id: number) => {
    let check;
    if (property_type === 'salesCheckbox' || !property_type) {
      check = 'sales';
    } else {
      check = 'lease';
    }
    navigate(`/res-comps-view/${id}/${check}`);
  };

  const updateListingItem = (id: number) => {
    navigate(`/residential-update-comps/${id}`);
  };

  const createClustersFromData = useCallback(
    (compsData: IComp[], _bounds?: google.maps.LatLngBounds) => {
      if (!compsData || compsData.length === 0) {
        return [];
      }

      // ALWAYS show data regardless of bounds for debugging
      const filteredData = compsData;

      const validData = filteredData.filter((comp) => {
        // Use map_pin_lat and map_pin_lng from cluster-details API, fallback to latitude/longitude
        const lat = parseFloat(comp.map_pin_lat || comp.latitude);
        const lng = parseFloat(comp.map_pin_lng || comp.longitude);
        const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        if (!isValid) {
        }
        return isValid;
      });

      if (validData.length === 0) {
        return [];
      }

      const coordinateGroups: { [key: string]: IComp[] } = {};

      validData.forEach((comp) => {
        // Use map_pin_lat and map_pin_lng from cluster-details API, fallback to latitude/longitude
        const lat = parseFloat(comp.map_pin_lat || comp.latitude);
        const lng = parseFloat(comp.map_pin_lng || comp.longitude);

        // Use less precision for grouping to allow for slight coordinate differences
        // Round to 4 decimal places (~11 meter precision)
        const coordKey = `${lat.toFixed(4)}-${lng.toFixed(4)}`;
        if (!coordinateGroups[coordKey]) {
          coordinateGroups[coordKey] = [];
        }
        coordinateGroups[coordKey].push(comp);
      });

      // Create clusters from coordinate groups
      const clusters: ClusterData[] = Object.entries(coordinateGroups).map(
        ([, properties]) => {
          const firstProp = properties[0];
          // Use map_pin_lat and map_pin_lng from cluster-details API, fallback to latitude/longitude
          const lat = parseFloat(firstProp.map_pin_lat || firstProp.latitude);
          const lng = parseFloat(firstProp.map_pin_lng || firstProp.longitude);

          // Calculate price statistics
          const prices = properties
            .map((p) => p.sale_price || p.lease_rate)
            .filter((p) => p && p > 0);

          const avgPrice =
            prices.length > 0
              ? prices.reduce((sum, price) => sum + price, 0) / prices.length
              : 0;

          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

          const cluster = {
            lat,
            lng,
            count: properties.length,
            avgPrice,
            minPrice,
            maxPrice,
            properties,
          };

          return cluster;
        }
      );

      return clusters;
    },
    []
  );

  // Calculate optimal center and zoom from clusters

  // API call for both cluster-details and clusters endpoints with current map bounds
  const callBothAPIs = useCallback(
    async (map: google.maps.Map, useWorldBounds = false) => {
      if (!map) {
        return;
      }

      let north, south, east, west, zoom;

      if (useWorldBounds) {
        // Use world bounds for initial load
        north = 85;
        south = -85;
        east = 180;
        west = -180;
        zoom = defaultZoom; // Use fixed zoom level 5
      } else {
        // Use current map bounds for zoom changes
        const bounds = map.getBounds();
        zoom = map.getZoom() || defaultZoom;

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
        // Get URL-based parameters based on the current location
        const getUrlBasedParams = () => {
          // const currentPath = location.pathname;

          // Get filter parameters from localStorage
          const buildingMin = localStorage.getItem('building_sf_min');
          const buildingMax = localStorage.getItem('building_sf_max');
          const landMin = localStorage.getItem('land_sf_min');
          const landMax = localStorage.getItem('land_sf_max');

          const startDate = localStorage.getItem('start_date');
          const endDate = localStorage.getItem('end_date');
          const state = localStorage.getItem('state');
          const streetAddress = localStorage.getItem('street_address');

          const propertyType = localStorage.getItem('property_type');
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

          // Return filters object structure
          return {
            building_sf_max: buildingMax ? parseInt(buildingMax) : null,
            building_sf_min: buildingMin ? parseInt(buildingMin) : null,
            city: cityArray,
            // comparison_basis: comparison_basis,
            end_date: endDate || null,
            land_sf_max: landMax ? parseInt(landMax) : null,
            land_sf_min: landMin ? parseInt(landMin) : null,
            orderBy: filterParams?.orderBy || 'DESC',
            orderByColumn: filterParams?.orderByColumn || 'date_sold',
            propertyType: propertyTypeArray,
            search: filterParams?.search || '',
            start_date: startDate || null,
            state: state || null,
            street_address: streetAddress || null,
          };
        };

        // Prepare params with consistent pagination settings and filters object structure
        const urlBasedFilters = getUrlBasedParams();
        const clusterDetailsParams = {
          bounds: { north, south, east, west },
          zoom: zoom,
          page: filterParams?.page || 1,
          limit: 10, // Always 10 items per page
          filters: urlBasedFilters, // All filter parameters in filters object
        };

        const clustersParams = {
          bounds: { north, south, east, west },
          zoom: zoom,
          filters: urlBasedFilters,
        };

        // Call both APIs in parallel
        const [clustersResponse, clusterDetailsResponse] = await Promise.all([
          // Call clusters API
          APIClient.getInstance().post<any, typeof clustersParams>(
            'resComps/map-clusters',
            clustersParams
          ),
          // Call cluster-details API with pagination
          APIClient.getInstance().post<any, typeof clusterDetailsParams>(
            'resComps/map-cluster-details',
            clusterDetailsParams
          ),
        ]);

        // Process clusters API response
        const clusters = clustersResponse.data?.data?.clusters || [];
        // const totalCount = clustersResponse.data?.data?.totalCount || 0;

        if (clusters && Array.isArray(clusters) && clusters.length > 0) {
          const processedClusters = clusters.map((cluster: any) => {
            // Calculate center from bounds if center is null
            let centerLat = cluster.center?.lat;
            let centerLng = cluster.center?.lng;

            if (!centerLat || !centerLng) {
              // Calculate center from bounds
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
            };
          });

          setClusters(processedClusters);

          // Keep map centered on US - do not auto-adjust viewport

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
          // Pass the properties along with the bounds, zoom, and API metadata
          const currentBounds = { north, south, east, west };
          onApiDataUpdate(properties, currentBounds, zoom, apiMetadata);
        }
      } catch (error) {
        console.error('🌐 Error calling APIs:', error);
      } finally {
        setLoading(false);
        setIsInteracting(false); // Hide loader when API call completes
      }
    },
    [onApiDataUpdate, onMapClustersChange, filterParams, location.pathname]
  );

  // Debounced API call - waits 1 second after zoom stops
  const debouncedApiCall = useCallback(
    debounce((map: google.maps.Map) => {
      setIsInteracting(true); // Show loader only when API call starts
      callBothAPIs(map, false); // Use current map bounds for zoom changes
    }, 1000),
    [callBothAPIs]
  );

  // Handle zoom change with timeout
  const handleZoomChange = useCallback(
    (map: google.maps.Map) => {
      const zoom = map.getZoom() || 4;

      setCurrentZoom(zoom);
      setShowClusters(true);

      // Close InfoWindow and clear openPropertyId when zoom changes to prevent popup from staying open
      setMarkerData((prevMarkerData) =>
        prevMarkerData.map((marker) => ({
          ...marker,
          isOpen: false,
        }))
      );
      setOpenPropertyId(null);

      // Don't set isInteracting immediately - wait for debounced call

      // Call the debounced function
      debouncedApiCall(map);
    },
    [debouncedApiCall]
  );

  // Handle map load with zoom listener
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      // Add zoom change listener with 1-second delay
      map.addListener('zoom_changed', () => {
        handleZoomChange(map);
      });

      // Add map movement listener with 1-second delay
      map.addListener('dragend', () => {
        debouncedApiCall(map);
      });

      // Only make initial API call if we don't have clusters data from props
      if (
        !clustersData ||
        !Array.isArray(clustersData) ||
        clustersData.length === 0
      ) {
        setTimeout(() => {
          callBothAPIs(map, true); // Use world bounds for initial load
        }, 1000); // Small delay to ensure map is fully loaded
      } else {
        console.log(
          '🗺️ Skipping initial API call - clusters data already available from props'
        );
      }
    },
    [handleZoomChange, callBothAPIs, clustersData]
  );

  // Format price for display
  const formatFullPrice = (price: number | null | undefined): string => {
    if (!price || price === 0) return 'N/A';
    return `$${price.toLocaleString()}`;
  };

  // Format price for tooltips
  const formatPrice = (price: number | null | undefined): string => {
    if (!price || price === 0) return 'N/A';
    return `$${price.toLocaleString()}`;
  };

  // Create cluster tooltip
  const createClusterTooltip = (cluster: any): string => {
    const avgPrice = formatPrice(cluster.avgPrice); // keep $
    const avgSize = cluster.avgSize.toLocaleString(); // no $
    const avgPricePerSf = formatPrice(cluster.avgPricePerSf); // keep $

    const count = cluster.count;
    return `${count} ${count === 1 ? 'property' : 'properties'} • Avg Price: ${avgPrice} | Avg Size: ${avgSize} | Avg $/SF: ${avgPricePerSf}`;
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

  // Create cluster icon with enhanced styling for the new cluster data
  const createClusterIcon = (count: number, isHovered = false): string => {
    // Larger base size for clusters with more than 1000 properties
    const baseSize =
      count > 1000
        ? Math.min(Math.max(45, Math.log10(count + 1) * 25), 75) // Larger for 1000+ properties
        : Math.min(Math.max(35, Math.log10(count + 1) * 25), 65); // Original size for others
    const size = isHovered ? Math.min(baseSize * 1.15, 85) : baseSize; // Only 15% larger when hovered

    // Keep original color coding based on cluster size
    const baseColor =
      count > 1000
        ? '#d73027' // Red for very large clusters
        : count > 500
          ? '#fc8d59' // Orange for large clusters
          : count > 100
            ? '#fee08b' // Yellow for medium clusters
            : count > 10
              ? '#91bfdb' // Light blue for small clusters
              : '#4575b4'; // Blue for single/small clusters (original blue)

    // Bright blue border for hovered clusters
    const color = isHovered ? baseColor : baseColor;
    const strokeColor = isHovered ? '#00BFFF' : '#ffffff'; // Bright blue for hover, white for normal
    const strokeWidth = isHovered ? 3 : 2;
    const opacity = isHovered ? 1 : 0.95;

    // Modest font size increase when hovered
    const baseFontSize = Math.max(12, size / 3.5);
    const fontSize = isHovered
      ? Math.min(baseFontSize * 1.1, 20)
      : baseFontSize;

    // Format count for display
    const displayText =
      count > 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

    // Subtle drop shadow effect for hovered clusters
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

  // Handle cluster click - zoom in and show property InfoWindows
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

        // Zoom to maximum level (18) for single property first
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
          }, 300); // Increased timeout for better reliability
        } else {
          // If no property found, still set openPropertyId to show red marker

          // Use a temporary ID based on cluster coordinates
          const tempId =
            Math.round(cluster.lat * 1000000) +
            Math.round(cluster.lng * 1000000);
          setOpenPropertyId(tempId);
        }
      } else {
        // Multiple properties - use cluster bounds from API to fit the map and show InfoWindows
        setLoading(true);
        try {
          // Use bounds from the /comps/map/clusters API response
          if ((cluster as any).bounds) {
            const bounds = new google.maps.LatLngBounds();
            const clusterBounds = (cluster as any).bounds;

            // Add bounds from API response
            bounds.extend({
              lat: parseFloat(clusterBounds.north),
              lng: parseFloat(clusterBounds.east),
            });
            bounds.extend({
              lat: parseFloat(clusterBounds.south),
              lng: parseFloat(clusterBounds.west),
            });

            // Fit the map to the cluster bounds
            map.fitBounds(bounds);

            // Add some padding for better visualization
            google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
              const currentZoom = map.getZoom();
              if (currentZoom && currentZoom >= 16) {
                map.setZoom(15); // Keep zoom below 16 to show clusters
              }

              // For multi-property clusters, don't show InfoWindows - just zoom in
              // InfoWindows will only show when individual property markers are clicked
            });
          } else {
            // Fallback: zoom in to cluster center if no bounds available
            const newZoom = Math.min(currentZoom + 2, 18);
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

  // Update clusters when GoogleData changes - now using clusters API data instead of creating client-side clusters
  useEffect(() => {
    // Note: Clusters are now set by the clustersApiCall function from the /comps/map/clusters API
    // This effect is kept for compatibility but the main cluster data comes from the API
  }, [GoogleData, currentZoom, createClustersFromData, onMapClustersChange]);

  // Fit map to property bounds when data changes - DISABLED to prevent automatic zoom changes
  useEffect(() => {
    // Note: Auto-fitting bounds is disabled to prevent automatic zoom changes after initial load
    // The map will maintain its initial zoom level and center until user manually changes it
  }, [map, GoogleData]);

  // Handle focused property from listing and hovered property
  useEffect(() => {
    if (hoveredPropertyId && GoogleData) {
      // Find the hovered property in the data
      const hoveredProperty = GoogleData.find(
        (property) => property.id === hoveredPropertyId
      );

      if (hoveredProperty) {
        // Use map_pin_lat and map_pin_lng from cluster-details API, fallback to latitude/longitude
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
      // Clear hovered price marker when no property is hovered
      setHoveredPriceMarker(null);
    }
  }, [hoveredPropertyId, GoogleData]);

  useEffect(() => {
    if (GoogleData && GoogleData.length > 0) {
      // Keep map center and zoom completely stable - no automatic changes

      const locationData: LocationDataItem[] = GoogleData.map((elem, index) => {
        // Check if this property should stay open (from single cluster click)
        const isOpen = openPropertyId === elem.id;

        // Use map_pin_lat and map_pin_lng from cluster-details API, fallback to latitude/longitude
        const lat = parseFloat(elem.map_pin_lat || elem.latitude);
        const lng = parseFloat(elem.map_pin_lng || elem.longitude);

        return {
          lat: lat,
          lng: lng,
          label: elem.label,
          isOpen: isOpen,
          propertyId: elem.id, // Add property ID for focusing
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
                <Box className="flex gap-1 flex-wrap">
                  <p className="font-normal text-gray-900">Building Size :</p>
                  <Tooltip
                    title={
                      elem?.building_size === null || elem?.building_size === 0
                        ? 'N/A'
                        : elem?.building_size.toLocaleString() + ' SF'
                    }
                  >
                    <p className="font-normal text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                      {elem?.building_size === null || elem?.building_size === 0
                        ? 'N/A'
                        : elem?.building_size.toLocaleString() + ' ' + 'SF'}
                    </p>
                  </Tooltip>
                </Box>

                <Box className="flex gap-1 flex-wrap">
                  <p className="text-sm font-normal text-gray-900">
                    Land Size :
                  </p>
                  <Tooltip
                    title={
                      (elem as any).land_dimension === 'ACRE'
                        ? elem?.land_size === null || elem?.land_size === 0
                          ? 'N/A'
                          : (elem?.land_size * 43560)?.toLocaleString() + ' SF'
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
                <Box className="flex gap-1 flex-wrap">
                  <p className="text-sm font-normal text-gray-900">
                    {elem?.sale_status === 'Pending'
                      ? 'Sale Status :'
                      : 'Date of Sale :'}
                  </p>
                  <Tooltip
                    title={
                      elem?.sale_status === 'Pending'
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
                    <a href={`/res-comps-view/${elem.id}`}>
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
                          e.preventDefault();
                          viewListingItem(elem.id);
                        }}
                      >
                        {ListingEnum.VIEW}
                      </CommonButton>
                    </a>
                  </Box>

                  {!hideEditButton && (
                    <Box className="ml-1 mr-2">
                      <a
                        href={`/update-comps/${elem.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (e.button === 0) {
                            updateListingItem(elem.id);
                          }
                        }}
                      >
                        <CommonButton
                          variant="contained"
                          color="primary"
                          className="text-xs"
                          style={{
                            borderRadius: '0px 0px 10px',
                            padding: '2.5px 20px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {ListingEnum.EDIT}
                        </CommonButton>
                      </a>
                    </Box>
                  )}
                </div>
              </Box>
            </Box>
          ),
          checkType: property_type,
          selectedToggleButton: selectedToggleButton,
        };
      });

      setMarkerData(locationData);
    }
  }, [GoogleData, selectedToggleButton]);

  const handleCloseInfoWindow = useCallback(() => {
    // Don't clear openPropertyId to keep the red location marker visible
    // Only close the InfoWindow
    setMarkerData((prevMarkerData) =>
      prevMarkerData.map((marker) => ({
        ...marker,
        isOpen: false,
      }))
    );
  }, []);

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
  }, [map, handleCloseInfoWindow]);

  // Cleanup function on unmount - cancel debounced function
  useEffect(() => {
    return () => {
      // Cancel the debounced function when component unmounts
      debouncedApiCall.cancel();
    };
  }, [debouncedApiCall]);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  return isLoaded ? (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Test button for debugging /comps/map/clusters API */}

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
              map.setZoom(Math.min(currentZoom + 2, 20));
            }
          }}
          disabled={currentZoom >= 20}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
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
              map.setZoom(Math.max(currentZoom - 2, 3));
            }
          }}
          disabled={currentZoom <= 4}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            border: 'none',
            fontSize: '28px',
            fontWeight: 'medium',
            cursor: currentZoom <= 4 ? 'not-allowed' : 'pointer',
            color: currentZoom <= 4 ? '#ccc' : '#666',
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
        center={defaultCenter}
        zoom={defaultZoom}
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
        {/* Render clusters from the /comps/map/clusters API - bounds-based positioning */}
        {(() => {
          if (!clusters || clusters.length === 0) {
            return null;
          }

          // Hide clusters at zoom level 15 and above to show individual property markers
          if (currentZoom >= 15) {
            return null;
          }

          return clusters.map((cluster, index) => {
            const clusterId =
              (cluster as any).id ||
              `api-cluster-${index}-${cluster.lat}-${cluster.lng}`;
            const isHovered = hoveredClusterId === clusterId;

            // Dynamic size based on hover state - adjusted for 1000+ properties
            const iconSize =
              cluster.count > 1000
                ? isHovered
                  ? 60
                  : 55 // Larger for 1000+ properties
                : isHovered
                  ? 50
                  : 45; // Original size for others
            const anchorPoint = isHovered
              ? cluster.count > 1000
                ? 30
                : 25
              : cluster.count > 1000
                ? 27.5
                : 22.5; // Adjust anchor for different sizes

            return (
              <Marker
                key={clusterId}
                position={{ lat: cluster.lat, lng: cluster.lng }}
                icon={{
                  url: createClusterIcon(cluster.count, isHovered),
                  scaledSize: new google.maps.Size(iconSize, iconSize),
                  anchor: new google.maps.Point(anchorPoint, anchorPoint), // Center the icon
                }}
                title={createClusterTooltip(cluster)}
                onClick={() => handleClusterClick(cluster)}
                onMouseOver={() => {
                  setHoveredClusterId(clusterId);
                }}
                onMouseOut={() => {
                  setHoveredClusterId(null);
                }}
                options={{
                  zIndex: isHovered ? 1000 + index : 100 + index, // Give each cluster unique z-index, boost only the hovered one
                }}
              />
            );
          });
        })()}

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
        {(map?.getZoom() || currentZoom) >= 15 &&
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
                      isFromListing: false,
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
        {(map?.getZoom() || currentZoom) >= 15 &&
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
                        isFromListing: false,
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
                  ? hoveredInfoWindow.property.sale_price
                    ? `$${hoveredInfoWindow.property.sale_price.toLocaleString()}`
                    : 'N/A'
                  : hoveredInfoWindow.property.lease_rate
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
      </GoogleMap>

      {/* Cluster count indicator from /comps/map/clusters API */}
    </div>
  ) : (
    <div>Loading Google Maps...</div>
  );
};

export default React.memo(GoogleMapLocationComps);
