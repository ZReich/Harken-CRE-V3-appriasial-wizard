import React, { useState, useCallback, useEffect, useRef } from 'react';
import GoogleMapLocationComps from '../../comps/Listing/google-map';
import FilteredMapSideListing from './filteres-map-comsp-listing';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import { Box, Grid } from '@mui/material';
import { useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';

interface EvaluationSalesMapListingProps {
  typeFilter: string;
  setUploadCompsStatus?: any;
  typeProperty: any;
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

const AppraislasSalesAppraaisalMapListingIntegrated: React.FC<
  EvaluationSalesMapListingProps
> = (props) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get comparison_basis from URL parameters first, then fallback to props/localStorage
  const actualComparisonBasis =
    searchParams.get('comparison_basis') ||
    props.comparisonBasisView ||
    (props.sidebarFilters as any)?.comparison_basis ||
    localStorage.getItem('comparisonBasisView') ||
    'SF';

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
  const [forceMapUpdate, setForceMapUpdate] = useState(0);
  const [filteredData, setFilteredData] = useState<IComp[] | null>(null);
  const [isClusterFiltered, setIsClusterFiltered] = useState(false);
  const [mapBounds, setMapBounds] = useState<
    { north: number; south: number; east: number; west: number } | undefined
  >();
  const [mapZoom, setMapZoom] = useState<number | undefined>();
  const [hasMapDataUpdate, setHasMapDataUpdate] = useState(false);
  const [clustersData, setClustersData] = useState<any[]>([]);
  const [getCurrentMapState, setGetCurrentMapState] = useState<
    (() => { bounds: any; zoom: number } | null) | null
  >(null);
  const [compsLength, setCompsLength] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [resetZoom, setResetZoom] = useState(false);
  const [mapInteractionCount, setMapInteractionCount] = useState(0);
  const [clustersReady, setClustersReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [delayedClustersData, setDelayedClustersData] = useState<any[]>([]);
  const [activePropertyCard, setActivePropertyCard] = useState<number | null>(
    null
  );
  const cardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [clustersLoading, setClustersLoading] = useState(() => {
    // Only show loader on refresh (no navigation state), not when returning from view/edit
    return !location.state;
  });
  console.log(
    resetZoom,
    setClustersReady,
    setMapInteractionCount,
    forceMapUpdate
  );
  // Stop loading when clusters are ready or after 3 seconds max
  useEffect(() => {
    if (clustersReady) {
      setClustersLoading(false);
    }
  }, [clustersReady]);
  useEffect(() => {
    if (isFullscreen) {
      setForceMapUpdate((prev) => prev + 1);
    }
  }, [
    isFullscreen,
    props.searchValuesByfilter,
    props.sidebarFilters,
    props.sortingSettings,
    props.checkType,
  ]);
  // Fallback timer to prevent infinite loading (only if initially loading)
  useEffect(() => {
    if (!location.state) {
      const timer = setTimeout(() => {
        setClustersLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Restore selectedIds from navigation state
  useEffect(() => {
    if (
      location.state?.selectedIds &&
      Array.isArray(location.state.selectedIds)
    ) {
      setSelectedIds(location.state.selectedIds);
    }
  }, [location.state?.selectedIds]);
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

  // Fullscreen toggle handler
  const handleFullscreenToggle = useCallback(() => {
    console.log(
      '🔄 SALES APPRAISAL: Fullscreen toggle clicked, current state:',
      isFullscreen
    );
    setIsFullscreen((prev) => !prev);
  }, [isFullscreen]);

  // Handle map interactions (zoom, pan, cluster clicks) - reset page to 1
  const handleMapInteraction = useCallback(() => {
    // Close any active property cards when user interacts with map
    if (cardTimeoutRef.current) {
      clearTimeout(cardTimeoutRef.current);
    }
    setHoveredPropertyId(null);
    setActivePropertyCard(null);

    // Reset page to 1 when user interacts with map
    if (props.setPage) {
      props.setPage(1);
    }

    // Increment interaction counter to trigger listing update
    setMapInteractionCount((prev) => prev + 1);
  }, [props]);

  // Show clusters with improved handling for initial load and smooth transitions
  useEffect(() => {
    // For initial load, show clusters immediately to prevent empty map
    if (clustersData.length > 0 && delayedClustersData.length === 0) {
      setDelayedClustersData(clustersData);
      setIsInitialLoad(false);
      if (props.setClustersReady) {
        props.setClustersReady(true);
      }
      return;
    }

    // For updates after initial load, use minimal debouncing for smoothness
    const timer = setTimeout(() => {
      setDelayedClustersData(clustersData);
      if (clustersData.length > 0) {
        setIsInitialLoad(false);
        if (props.setClustersReady) {
          props.setClustersReady(true);
        }
      }
    }, 50); // Very short delay for smooth transitions at all zoom levels

    return () => clearTimeout(timer);
  }, [clustersData, delayedClustersData.length, props]);

  // Handle localStorage trigger changes
  useEffect(() => {
    if (props.localStorageTrigger && props.localStorageTrigger > 0) {
      console.log(
        '🔄 SALES APPRAISAL: LocalStorage trigger detected, value:',
        props.localStorageTrigger
      );
      // The GoogleMapLocationComps component will handle API calls
      // based on the localStorageTrigger prop dependency
    }
  }, [props.localStorageTrigger]);

  // Debug when filteredData changes
  useEffect(() => {
    // Debug logging removed
  }, [filteredData]);

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 139px)' }}>
      <Grid
        item
        xs={isFullscreen ? 12 : 12}
        md={isFullscreen ? 12 : 6}
        lg={isFullscreen ? 12 : 8}
      >
        <Box sx={{ height: '100%', position: 'relative' }}>
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
            {...(localStorage.getItem('activeType') !== 'land_only' && {
              comparisonBasisView: actualComparisonBasis,
            })}
            GoogleData={googleData}
            clustersData={delayedClustersData}
            disableInitialApiCall={true}
            selectedToggleButton={props.selectedToggleButton}
            onMapClustersChange={handleMapClustersChange}
            focusedPropertyId={focusedPropertyId}
            hoveredPropertyId={activePropertyCard || hoveredPropertyId}
            onClusterClick={handleClusterFilter}
            onApiDataUpdate={handleApiDataUpdate}
            onMapStateChange={setGetCurrentMapState}
            onMapInteraction={handleMapInteraction}
            handleCheckboxToggle={handleCheckboxToggle}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            compsLength={compsLength}
            isFullscreen={isFullscreen}
            onFullscreenToggle={handleFullscreenToggle}
            localStorageTrigger={props.localStorageTrigger}
            filterParams={{
              // Only include comparison_basis if activeType is NOT land_only
              ...(localStorage.getItem('activeType') !== 'land_only' && {
                comparison_basis: actualComparisonBasis,
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
            resetZoom={resetZoom}
          />
        </Box>
      </Grid>

      {/* Listing Panel */}
      {!isFullscreen && (
        <Grid item xs={12} md={6} lg={4}>
          <FilteredMapSideListing
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
            {...(localStorage.getItem('activeType') !== 'land_only' && {
              comparisonBasisView: actualComparisonBasis,
            })}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default AppraislasSalesAppraaisalMapListingIntegrated;
