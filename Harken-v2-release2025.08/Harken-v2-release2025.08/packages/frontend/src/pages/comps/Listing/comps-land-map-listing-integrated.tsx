import React, { useState, useCallback, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import GoogleMapLocationComps from './google-map';
import SideListingMap from './listing-side';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import loadingImage from '../../../images/loading.png';

interface CompsMapListingProps {
  // Add your existing props here
  typeFilter: string;
  typeProperty: any;
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null;
  compFilters: any;
  sortingSettings: any;
  checkType: any;
  setCheckType: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  currentBounds?: any;
  uploadCompsStatus: any;
  mapZoom: any;
  onResetSearch?: () => void; // Add the reset search callback
  setClustersReady?: (ready: boolean) => void;
  hasFilterChanged?: boolean;
  setHasFilterChanged?: (changed: boolean) => void;
}

const CompsLandMapListingIntegrated: React.FC<CompsMapListingProps> = (
  props
) => {
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
  const [filteredData, setFilteredData] = useState<IComp[] | null>(null); // Start as null instead of undefined
  const [isClusterFiltered, setIsClusterFiltered] = useState(false);
  const [mapBounds, setMapBounds] = useState<
    { north: number; south: number; east: number; west: number } | undefined
  >();
  const [mapZoom, setMapZoom] = useState<number | undefined>();
  const [hasMapDataUpdate, setHasMapDataUpdate] = useState(false);
  const [clustersData, setClustersData] = useState<any[]>([]); // Initialize as empty array instead of null
  const [getCurrentMapState, setGetCurrentMapState] = useState<
    (() => { bounds: any; zoom: number } | null) | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [compsLength] = useState(0); // Add this if not already defined
  const [resetZoom, setResetZoom] = useState(false); // Add zoom reset state
  const [clustersLoading, setClustersLoading] = useState(() => {
    // Only show loader on refresh (no navigation state), not when returning from view/edit
    return !location.state;
  });
  const [clustersReady, setClustersReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [apiMetadata, setApiMetadata] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cluster transition states to prevent blinking
  const [isClusterTransitioning, setIsClusterTransitioning] = useState(false);
  const [pendingApiCall, setPendingApiCall] = useState(false);
  const [isClusterDataLocked, setIsClusterDataLocked] = useState(false);
  const [lastApiTimestamp, setLastApiTimestamp] = useState(0);

  console.log(setClustersReady, isUpdating, hasMapDataUpdate);
  // Stop loading when clusters are ready or after 3 seconds max
  useEffect(() => {
    if (clustersReady) {
      setClustersLoading(false);
    }
  }, [clustersReady]);

  // Fallback timer to prevent infinite loading (only if initially loading)
  useEffect(() => {
    if (!location.state) {
      const timer = setTimeout(() => {
        setClustersLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Initialize selectedIds from navigation state when returning from view page
  useEffect(() => {
    if (
      location.state?.selectedIds &&
      Array.isArray(location.state.selectedIds)
    ) {
      console.log(
        '🔄 Initializing selectedIds from navigation state:',
        location.state.selectedIds
      );
      setSelectedIds(location.state.selectedIds);
    }
  }, [location.state?.selectedIds]);

  // Restore localStorage values when returning from view page
  useEffect(() => {
    if (location.state?.preservedLocalStorage) {
      const preserved = location.state.preservedLocalStorage;
      console.log('🔄 Restoring localStorage values:', preserved);

      const restoreValues = () => {
        // Restore each preserved value if it exists
        if (preserved.compStatus) {
          localStorage.setItem('compStatus', preserved.compStatus);
        }
        if (preserved.property_type) {
          localStorage.setItem('property_type', preserved.property_type);
        }
        if (preserved.checkType) {
          localStorage.setItem('checkType', preserved.checkType);
        }
        if (preserved.activeType) {
          localStorage.setItem('activeType', preserved.activeType);
        }
        if (preserved.search_term) {
          localStorage.setItem('search_term', preserved.search_term);
        }
      };

      // Restore immediately
      restoreValues();

      // Also restore after a delay to handle components that might clear localStorage
      const timer1 = setTimeout(restoreValues, 100);
      const timer2 = setTimeout(restoreValues, 500);
      const timer3 = setTimeout(restoreValues, 1000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [location.state?.preservedLocalStorage]);

  // Debug selectedIds changes
  useEffect(() => {
    console.log('🔄 Parent selectedIds changed:', selectedIds);
  }, [selectedIds]);
  // Debug filteredData changes
  React.useEffect(() => {
    // Debug logging removed
  }, [filteredData]);

  // Handle API data updates from map component
  const handleApiDataUpdate = useCallback(
    (
      properties: IComp[],
      bounds?: { north: number; south: number; east: number; west: number },
      zoom?: number,
      metadata?: any
    ) => {
      console.log('🔄 handleApiDataUpdate called with:', {
        properties: properties.length,
        bounds,
        zoom,
        metadata,
      });

      // Update the main data sources immediately
      setGoogleData(properties);
      setOriginalData(properties);
      setFilteredData(properties);

      // Update map bounds and zoom information
      if (bounds) {
        setMapBounds(bounds);
      }
      if (zoom !== undefined) {
        setMapZoom(zoom);
      }

      // Store API metadata for pagination
      if (metadata) {
        setApiMetadata(metadata);
      }

      // Reset cluster filtering state since we have new data
      setIsClusterFiltered(false);
      setIsUpdating(false);
    },
    []
  );

  // Handle data from listing component
  const handleGoogleDataChange = useCallback((data: IComp[]) => {
    // Always update the data sources when new data comes from listing
    // This ensures the listing component can provide initial data
    setGoogleData(data);
    setOriginalData(data);

    // Only update filteredData if we don't have any external data yet (null)
    setFilteredData((currentFilteredData) => {
      if (currentFilteredData === null) {
        return data;
      } else {
        console.log(
          '🔄 Keeping existing filteredData, not overriding with listing data'
        );
        return currentFilteredData;
      }
    });

    // Mark that we don't have fresh map data when listing updates
    setHasMapDataUpdate(false);
  }, []);

  // Handle clusters data fetched by listing (on filter changes)
  const handleClustersApiUpdate = useCallback(
    (clusters: any[]) => {
      setClustersData(clusters || []);
      if (clusters && clusters.length > 0) {
        if (props.setClustersReady) {
          props.setClustersReady(true);
        }
        setIsInitialLoad(false);
      }
    },
    [props]
  );

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

  // Debug when filteredData changes
  useEffect(() => {
    // Debug logging removed
  }, [filteredData]);

  // Handle checkbox toggle for both components
  const handleCheckboxToggle = useCallback((id: any) => {
    setSelectedIds(
      (prevSelectedIds) =>
        prevSelectedIds.includes(id)
          ? prevSelectedIds.filter((itemId) => itemId !== id) // Remove if already selected
          : [...prevSelectedIds, id] // Add to selection
    );
  }, []);

  // Clear selected IDs function
  const clearSelectedIds = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Trigger zoom reset function
  const triggerZoomReset = useCallback(() => {
    setResetZoom(true);
    // Reset the flag after a brief moment to allow for potential future resets
    setTimeout(() => {
      setResetZoom(false);
    }, 100);
  }, []);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle map interactions (zoom, pan, cluster clicks) - reset page to 1
  const handleMapInteraction = useCallback(() => {
    if (props.setPage) {
      props.setPage(1);
    }
  }, [props]);

  // Force API call when filters change and map is in fullscreen mode
  const [forceMapUpdate, setForceMapUpdate] = useState(0);

  useEffect(() => {
    console.log('🔍 Filter change detected in integrated component:', {
      isFullscreen,
      hasFilterChanged: props.hasFilterChanged,
      sidebarFilters: props.sidebarFilters,
      searchValuesByfilter: props.searchValuesByfilter,
      sortingSettings: props.sortingSettings,
      checkType: props.checkType,
    });

    // Trigger map update for any filter changes (navigation bar or sidebar filters)
    if (props.hasFilterChanged || props.sidebarFilters) {
      console.log(
        '🔄 Navigation bar or sidebar filters changed, triggering map update'
      );
      setForceMapUpdate((prev) => prev + 1);

      // Reset hasFilterChanged after handling the change
      if (props.hasFilterChanged && props.setHasFilterChanged) {
        props.setHasFilterChanged(false);
      }
    }
  }, [
    props.hasFilterChanged,
    props.sidebarFilters,
    props.searchValuesByfilter,
    props.sortingSettings,
    props.checkType,
    props.setHasFilterChanged,
  ]);

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 139px)' }}>
      <Grid
        item
        xs={12}
        md={isFullscreen ? 12 : 6}
        lg={isFullscreen ? 12 : 8}
        sx={{
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '& > *': {
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            position: 'relative',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::after': isFullscreen
              ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  pointerEvents: 'none',
                  opacity: 1,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: -1,
                }
              : {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '8px',
                  boxShadow: 'none',
                  pointerEvents: 'none',
                  opacity: 0,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: -1,
                },
          }}
        >
          {clustersLoading && isInitialLoad && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className="img-update-loader">
                <img src={loadingImage} />
              </div>
            </div>
          )}
          <GoogleMapLocationComps
            compFilters={compFilters}
            currentBounds={currentBounds}
            currentMapZoom={currentMapZoom}
            GoogleData={googleData}
            clustersData={clustersData}
            selectedToggleButton={props.selectedToggleButton}
            onMapClustersChange={handleMapClustersChange}
            focusedPropertyId={focusedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onClusterClick={handleClusterFilter}
            onApiDataUpdate={handleApiDataUpdate}
            selectedIds={selectedIds}
            handleCheckboxToggle={handleCheckboxToggle}
            compsLength={compsLength}
            resetZoom={resetZoom}
            isClusterTransitioning={isClusterTransitioning}
            setIsClusterTransitioning={setIsClusterTransitioning}
            pendingApiCall={pendingApiCall}
            setPendingApiCall={setPendingApiCall}
            isClusterDataLocked={isClusterDataLocked}
            setIsClusterDataLocked={setIsClusterDataLocked}
            lastApiTimestamp={lastApiTimestamp}
            setLastApiTimestamp={setLastApiTimestamp}
            onMapStateChange={setGetCurrentMapState}
            onMapInteraction={handleMapInteraction}
            filterParams={{
              // Only include comparison_basis if activeType is NOT land_only
              ...(localStorage.getItem('activeType') !== 'land_only' && {
                comparison_basis:
                  (props.sidebarFilters as any)?.comparison_baisi || 'SF',
              }),
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
              cap_rate_min: props.sidebarFilters?.cap_rate_min ?? null,
              cap_rate_max: props.sidebarFilters?.cap_rate_max ?? null,
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
            isFullscreen={isFullscreen}
            onFullscreenToggle={handleFullscreenToggle}
            forceMapUpdate={forceMapUpdate}
            disableSinglePropertyClusters={true}
          />
        </Box>
      </Grid>

      {/* Listing Panel */}
      <Grid
        item
        xs={12}
        md={6}
        lg={4}
        sx={{
          display: isFullscreen ? 'none' : 'block',
          opacity: isFullscreen ? 0 : 1,
          transform: isFullscreen
            ? 'translateX(20px) scale(0.95)'
            : 'translateX(0) scale(1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          visibility: isFullscreen ? 'hidden' : 'visible',
        }}
      >
        <Box
          sx={{
            height: '100%',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '8px',
            backgroundColor: 'background.paper',
            boxShadow: isFullscreen ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <SideListingMap
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
            onDeleteSuccess={() => {
              // Force data refresh after deletion
              setHasMapDataUpdate(false);
              setFilteredData(null);
            }}
            mapBounds={mapBounds}
            compFilters={compFilters}
            currentBounds={currentBounds}
            mapZoom={mapZoom}
            hasMapDataUpdate={hasMapDataUpdate} // Allow SideListingMap to make API calls when needed
            onClustersApiUpdate={handleClustersApiUpdate}
            getCurrentMapState={getCurrentMapState}
            setGetCurrentMapState={setGetCurrentMapState}
            selectedIds={selectedIds}
            handleCheckboxToggle={handleCheckboxToggle}
            clearSelectedIds={clearSelectedIds}
            onZoomReset={triggerZoomReset}
            onResetSearch={props.onResetSearch} // Pass the reset search callback
            apiMetadata={apiMetadata} // Pass API metadata for pagination
            disableInternalApiCalls={false} // Allow internal API calls for deletion
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default CompsLandMapListingIntegrated;
