import React, { useState, useCallback, useEffect, useRef } from 'react';
import GoogleMapLocationComps from '../../comps/Listing/google-map';
import EvaluationCostFilteredMapSideListing from './evaluation-cost-map-side-filtered-listing';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import { Box, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { APIClient } from '@/api/api-client';

interface EvaluationCostMapListingProps {
  typeFilter: string;
  typeProperty: any;
  setCompsLength?: any;
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null;
  compFilters: any;
  currentBounds?: any;
  mapZoom: any;
  sortingSettings: any;
  checkType: any;
  setCheckType: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  uploadCompsStatus: any;
  comparisonBasisView?: any;
  tableData?: any;
  localStorageTrigger?: number;
  onResetSearch?: () => void;
  setClustersReady?: (ready: boolean) => void;
}

const EvaluationCostMapListingIntegrated: React.FC<
  EvaluationCostMapListingProps
> = (props) => {
  const location = useLocation();

  const compFilters = props.compFilters;
  const currentBounds = props.currentBounds;
  const currentMapZoom = props.mapZoom;

  const [googleData, setGoogleData] = useState<IComp[]>([]);
  const [originalData, setOriginalData] = useState<IComp[]>([]);
  const [focusedPropertyId, setFocusedPropertyId] = useState<number | null>(
    null
  );
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(
    null
  );
  const [filteredData, setFilteredData] = useState<IComp[] | null>(null);
  const [isClusterFiltered, setIsClusterFiltered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapBounds, setMapBounds] = useState<
    { north: number; south: number; east: number; west: number } | undefined
  >();
  const [mapZoom, setMapZoom] = useState<number | undefined>();
  const [hasMapDataUpdate, setHasMapDataUpdate] = useState(false);
  const [clustersData, setClustersData] = useState<any[]>([]);
  const [delayedClustersData, setDelayedClustersData] = useState<any[]>([]);
  const [getCurrentMapState, setGetCurrentMapState] = useState<
    (() => { bounds: any; zoom: number } | null) | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compsLength, setCompsLength] = useState(0);
  const [resetZoom, setResetZoom] = useState(false);
  const [mapInteractionCount, setMapInteractionCount] = useState(0);

  useEffect(() => {
    if (
      location.state?.selectedIds &&
      Array.isArray(location.state.selectedIds)
    ) {
      setSelectedIds(location.state.selectedIds);
    }
  }, [location.state?.selectedIds]);

  // Add cluster API management state and refs
  const lastClustersParamsRef = useRef<string>('');

  // Cluster API call logic (moved from listing-side.tsx)
  useEffect(() => {
    // Only call cluster API when we have valid map bounds and zoom
    if (!mapBounds || !mapZoom) {
      return;
    }

    const checkType = props.checkType || 'salesCheckbox';
    const parameterType = checkType === 'leasesCheckbox' ? 'lease' : 'sale';

    // Validate bounds have all required properties
    const isValidBounds = (bounds: any) =>
      bounds &&
      bounds.north != null &&
      bounds.south != null &&
      bounds.east != null &&
      bounds.west != null;

    // Use current bounds
    const bounds = isValidBounds(mapBounds)
      ? mapBounds
      : {
          north: 49.3457868, // US bounds
          south: 24.7433195,
          east: -66.9513812,
          west: -124.7844079,
        };

    const zoom = mapZoom || 4;

    // Build clusters filters from localStorage (same logic as listing-side.tsx)
    const buildingMin = localStorage.getItem('building_sf_min')
      ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
      : null;
    const buildingMax = localStorage.getItem('building_sf_max')
      ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
      : null;
    const landMin = localStorage.getItem('land_sf_min')
      ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
      : null;
    const landMax = localStorage.getItem('land_sf_max')
      ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
      : null;
    const capRateMin = localStorage.getItem('cap_rate_min')
      ? parseFloat(localStorage.getItem('cap_rate_min')!.replace(/,/g, ''))
      : null;
    const capRateMax = localStorage.getItem('cap_rate_max')
      ? parseFloat(localStorage.getItem('cap_rate_max')!.replace(/,/g, ''))
      : null;
    const priceSfMin = localStorage.getItem('price_sf_min')
      ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
      : null;
    const priceSfMax = localStorage.getItem('price_sf_max')
      ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
      : null;
    const squareFootageMin = localStorage.getItem('square_footage_min')
      ? parseFloat(
          localStorage.getItem('square_footage_min')!.replace(/,/g, '')
        )
      : null;
    const squareFootageMax = localStorage.getItem('square_footage_max')
      ? parseFloat(
          localStorage.getItem('square_footage_max')!.replace(/,/g, '')
        )
      : null;
    const startDate = localStorage.getItem('start_date');
    const endDate = localStorage.getItem('end_date');
    const state = localStorage.getItem('state');
    const streetAddress = localStorage.getItem('street_address');
    const compStatus = localStorage.getItem('compStatus');
    const propertyType = localStorage.getItem('property_type');
    const leaseType = localStorage.getItem('lease_type');
    const selectedCities = localStorage.getItem('selectedCities');

    let cityArray: any[] = [];
    if (selectedCities) {
      try {
        cityArray = JSON.parse(selectedCities);
      } catch (e) {
        console.warn('Failed to parse selectedCities:', e);
      }
    }

    let propertyTypeArray: any[] | null = null;
    if (propertyType) {
      propertyTypeArray = propertyType.split(',').filter(Boolean);
    }

    const compType = localStorage.getItem('activeType') || 'building_with_land';

    // Build clustersFilters with essential defaults always included
    const clustersFilters = {
      comp_type: compType || 'building_with_land',
      land_dimension:
        !localStorage.getItem('selectedSize') ||
        localStorage.getItem('selectedSize') === 'SF'
          ? 'SF'
          : 'ACRE',
      orderBy: localStorage.getItem('sortingOrder')?.includes('asc')
        ? 'asc'
        : props.sortingSettings?.orderSorting || 'DESC',
      orderByColumn:
        localStorage.getItem('sortingType') ||
        props.sortingSettings?.sortingType ||
        'date_sold',
      type: parameterType,
      search: props.searchValuesByfilter || '',
      compStatus: '',
    } as any;

    // Only add non-empty values from localStorage
    if (buildingMax && buildingMax > 0)
      clustersFilters.building_sf_max = buildingMax;
    if (buildingMin && buildingMin > 0)
      clustersFilters.building_sf_min = buildingMin;
    clustersFilters.cap_rate_max =
      capRateMax && capRateMax > 0 ? capRateMax : null;
    clustersFilters.cap_rate_min =
      capRateMin && capRateMin > 0 ? capRateMin : null;
    if (cityArray && cityArray.length > 0) clustersFilters.city = cityArray;
    if (compStatus && compStatus.trim() !== '')
      clustersFilters.compStatus = compStatus;
    if (endDate && endDate.trim() !== '') clustersFilters.end_date = endDate;
    if (landMax && landMax > 0) clustersFilters.land_sf_max = landMax;
    if (landMin && landMin > 0) clustersFilters.land_sf_min = landMin;
    if (leaseType && leaseType.trim() !== '')
      clustersFilters.lease_type = leaseType;
    if (priceSfMax && priceSfMax > 0) clustersFilters.price_sf_max = priceSfMax;
    if (priceSfMin && priceSfMin > 0) clustersFilters.price_sf_min = priceSfMin;
    if (propertyTypeArray && propertyTypeArray.length > 0)
      clustersFilters.propertyType = propertyTypeArray;
    if (squareFootageMax && squareFootageMax > 0)
      clustersFilters.square_footage_max = squareFootageMax;
    if (squareFootageMin && squareFootageMin > 0)
      clustersFilters.square_footage_min = squareFootageMin;
    if (startDate && startDate.trim() !== '')
      clustersFilters.start_date = startDate;
    if (state && state.trim() !== '') clustersFilters.state = state;
    if (streetAddress && streetAddress.trim() !== '')
      clustersFilters.street_address = streetAddress;

    const clustersParams = {
      bounds,
      zoom,
      filters: clustersFilters,
    };

    // Create a hash of the clusters params to prevent duplicate calls
    const clustersParamsHash = JSON.stringify(clustersParams);
    if (lastClustersParamsRef.current === clustersParamsHash) {
      console.log('🚫 COST EVALUATION: Skipping duplicate clusters API call');
      return;
    }

    console.log(
      '🗺️ COST EVALUATION: Calling clusters API with zoom:',
      zoom,
      'fullscreen:',
      isFullscreen,
      'localStorageTrigger:',
      props.localStorageTrigger
    );
    lastClustersParamsRef.current = clustersParamsHash;

    APIClient.getInstance()
      .post<any, typeof clustersParams>('comps/map-clusters', clustersParams)
      .then((res: any) => {
        const clusters = res?.data?.data?.clusters || [];
        console.log('🗺️ COST EVALUATION: Received clusters:', clusters.length);
        setClustersData(clusters);
        if (props.setClustersReady) {
          props.setClustersReady(true);
        }
      })
      .catch((err: any) => {
        console.error('COST EVALUATION: Error fetching map clusters:', err);
        lastClustersParamsRef.current = '';
        setClustersData([]);
      });
  }, [
    mapBounds,
    mapZoom,
    props.sortingSettings,
    props.searchValuesByfilter,
    props.checkType,
    props.sidebarFilters,
    props.localStorageTrigger,
    isFullscreen,
    props.setClustersReady,
  ]);

  // Handle API data updates from map component
  const handleApiDataUpdate = useCallback(
    (
      properties: IComp[],
      bounds?: { north: number; south: number; east: number; west: number },
      zoom?: number
    ) => {
      // Update the main data sources
      setGoogleData(properties);
      setOriginalData(properties);

      // Always update filtered data when API provides new data
      setFilteredData(properties);

      // Update map bounds and zoom information
      if (bounds) {
        setMapBounds(bounds);
      }
      if (zoom !== undefined) {
        setMapZoom(zoom);
      }

      // Mark that we have data from map
      setHasMapDataUpdate(true);

      // Reset cluster filtering state since we have new data
      setIsClusterFiltered(false);
    },
    []
  );

  // Handle data from listing component
  const handleGoogleDataChange = useCallback((data: IComp[]) => {
    // Always update the data sources when new data comes from listing
    setGoogleData(data);
    setOriginalData(data);

    // Only update filteredData if we don't have any external data yet (null)
    setFilteredData((currentFilteredData) => {
      if (currentFilteredData === null) {
        return data;
      } else {
        return currentFilteredData;
      }
    });

    // Mark that we don't have fresh map data when listing updates
    setHasMapDataUpdate(false);
  }, []);

  // Handle clusters data fetched by listing (on filter changes)
  const handleClustersApiUpdate = useCallback((clusters: any[]) => {
    setClustersData(clusters || []);
  }, []);

  // Show clusters immediately and notify parent when ready
  useEffect(() => {
    setDelayedClustersData(clustersData);
    if (props.setClustersReady) {
      props.setClustersReady(true);
    }
  }, [clustersData, props]);

  // Handle property focus from listing
  const handlePropertyFocus = useCallback((propertyId: number | null) => {
    setFocusedPropertyId(propertyId);
  }, []);

  // Handle property hover from listing
  const handlePropertyHover = useCallback((propertyId: number | null) => {
    setHoveredPropertyId(propertyId);
  }, []);

  // Handle cluster click from map - filter listing to show cluster properties
  const handleClusterFilter = useCallback((properties: IComp[]) => {
    setFilteredData(properties);
    setIsClusterFiltered(true);
  }, []);

  // Clear cluster filter
  const clearClusterFilter = useCallback(() => {
    setFilteredData(originalData);
    setIsClusterFiltered(false);
  }, [originalData]);

  // Handle clusters from map
  const handleMapClustersChange = useCallback(() => {
    // Clusters updated
  }, []);

  // Dummy function for compatibility
  const passSetCheckType = useCallback(
    (type: any) => {
      props.setCheckType(type);
    },
    [props]
  );

  // Handle map interactions (zoom, pan, cluster clicks) to reset page
  const handleMapInteraction = useCallback(() => {
    props.setPage(1);
    setMapInteractionCount((prev) => prev + 1);
  }, [props]);

  // Trigger zoom reset callback
  const triggerZoomReset = useCallback(() => {
    setResetZoom(true);
    // Reset the flag after a short delay
    setTimeout(() => setResetZoom(false), 100);
  }, []);

  const handleCheckboxToggle = useCallback(
    (id: string) => {
      const maxSelectable = 4 - compsLength;
      setSelectedIds((prevSelectedIds) => {
        const alreadySelected = prevSelectedIds.includes(id);
        let updatedSelection;

        if (alreadySelected) {
          updatedSelection = prevSelectedIds.filter((itemId) => itemId !== id);
        } else {
          if (prevSelectedIds.length >= maxSelectable) {
            toast.error(
              `${compsLength} comp${compsLength === 1 ? '' : 's'} ${
                compsLength === 1 ? 'is' : 'are'
              } already linked. You can only link up to ${maxSelectable} more.`
            );
            return prevSelectedIds;
          }
          updatedSelection = [...prevSelectedIds, id];
        }

        return updatedSelection;
      });
    },
    [compsLength]
  );

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Debug when filteredData changes
  useEffect(() => {
    // Debug logging removed
  }, [filteredData]);

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 139px)' }}>
      <Grid item xs={12} md={isFullscreen ? 12 : 6} lg={isFullscreen ? 12 : 8}>
        <Box sx={{ height: '100%', position: 'relative' }}>
          <GoogleMapLocationComps
            compFilters={compFilters}
            currentBounds={currentBounds}
            currentMapZoom={currentMapZoom}
            GoogleData={googleData}
            clustersData={delayedClustersData}
            selectedToggleButton={props.selectedToggleButton}
            onMapClustersChange={handleMapClustersChange}
            focusedPropertyId={focusedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onClusterClick={handleClusterFilter}
            onApiDataUpdate={handleApiDataUpdate}
            onMapStateChange={setGetCurrentMapState}
            handleCheckboxToggle={handleCheckboxToggle}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            compsLength={compsLength}
            isFullscreen={isFullscreen}
            onFullscreenToggle={handleFullscreenToggle}
            disableInitialApiCall={true}
            filterParams={{
              comparison_basis: 'SF', // Fixed for cost approach
              comp_type:
                localStorage.getItem('activeType') || 'building_with_land',
              page: props.page || 1,
              propertyType: props.sidebarFilters?.propertyType,
              orderByColumn: props.sortingSettings?.sortingType || 'date_sold',
              orderBy: props.sortingSettings?.orderSorting || 'DESC',
              type: props.checkType === 'leasesCheckbox' ? 'lease' : 'sale',
              search: props.searchValuesByfilter || '',
              compStatus: props.sidebarFilters?.compStatus || '',
              state: props.sidebarFilters?.state || null,
              street_address: props.sidebarFilters?.street_address || null,
              price_sf_min: props.sidebarFilters?.price_sf_min ?? null,
              price_sf_max: props.sidebarFilters?.price_sf_max ?? null,
              land_sf_min: props.sidebarFilters?.land_sf_min ?? null,
              land_sf_max: props.sidebarFilters?.land_sf_max ?? null,
              square_footage_min:
                props.sidebarFilters?.square_footage_min ?? null,
              square_footage_max:
                props.sidebarFilters?.square_footage_max ?? null,
              building_sf_min: props.sidebarFilters?.building_sf_min ?? null,
              building_sf_max: props.sidebarFilters?.building_sf_max ?? null,
              city: props.sidebarFilters?.city || [],
              lease_type: props.sidebarFilters?.lease_type || null,
              start_date: props.sidebarFilters?.start_date || null,
              end_date: props.sidebarFilters?.end_date || null,
            }}
            resetZoom={resetZoom}
            onMapInteraction={handleMapInteraction}
          />
        </Box>
      </Grid>

      {/* Listing Panel */}
      {!isFullscreen && (
        <Grid item xs={12} md={6} lg={4}>
          <EvaluationCostFilteredMapSideListing
            {...props}
            data={filteredData} // Use filteredData from map API
            passGoogleData={handleGoogleDataChange}
            currentMapZoom={currentMapZoom}
            passSetCheckType={passSetCheckType}
            passDataCheckType={() => {}} // Dummy function
            onPropertyFocus={handlePropertyFocus}
            onPropertyHover={handlePropertyHover}
            isClusterFiltered={isClusterFiltered}
            clearClusterFilter={clearClusterFilter}
            onApiDataUpdate={handleApiDataUpdate}
            mapBounds={mapBounds}
            compFilters={compFilters}
            currentBounds={currentBounds}
            mapZoom={mapZoom}
            hasMapDataUpdate={hasMapDataUpdate}
            onClustersApiUpdate={handleClustersApiUpdate}
            getCurrentMapState={getCurrentMapState}
            setGetCurrentMapState={setGetCurrentMapState}
            onResetSearch={props.onResetSearch}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            compsLength={compsLength}
            setCompsLength={setCompsLength}
            onZoomReset={triggerZoomReset}
            mapInteractionTrigger={mapInteractionCount}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default EvaluationCostMapListingIntegrated;
