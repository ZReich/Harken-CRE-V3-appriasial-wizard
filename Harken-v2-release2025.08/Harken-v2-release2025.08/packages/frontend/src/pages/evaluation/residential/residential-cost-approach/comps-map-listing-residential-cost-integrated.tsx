import React, { useState, useCallback, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import GoogleMapLocationComps from '../../../residential/Listing/google-map';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import ResidentialCostMapSideFilteredListing from './residential-cost-map-side-filtered-listing';
import { useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface CompsMapListingProps {
  typeFilter: string;
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
  isMapExpanded?: boolean;
  onMapExpandToggle?: () => void;
  forceMapUpdate?: number;
}

const CostCompsMapListingIntegratedResidential: React.FC<
  CompsMapListingProps
> = (props) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const compFilters = props.compFilters;
  const currentBounds = props.currentBounds;
  const currentMapZoom = props.mapZoom;

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [forceMapUpdate, setForceMapUpdate] = useState(0);
  // console.log(savedMapState);
  // Get comparison_basis from URL parameters first, then fallback to localStorage, then props
  const actualComparisonBasis =
    searchParams.get('comparison_basis') ||
    localStorage.getItem('comparisonBasisView') ||
    props.comparisonBasisView ||
    (props.sidebarFilters as any)?.comparison_basis ||
    'SF';
  console.log(setIsFullscreen, setForceMapUpdate);
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
  const [mapBounds, setMapBounds] = useState<
    { north: number; south: number; east: number; west: number } | undefined
  >();
  const [mapZoom, setMapZoom] = useState<number | undefined>();
  const [hasMapDataUpdate, setHasMapDataUpdate] = useState(false);
  const [clustersData, setClustersData] = useState<any[]>([]);
  const [getCurrentMapState, setGetCurrentMapState] = useState<
    (() => { bounds: any; zoom: number } | null) | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compsLength, setCompsLength] = useState(0);

  // Map expansion props
  const isMapExpanded = props.isMapExpanded || false;
  const onMapExpandToggle = props.onMapExpandToggle;
  // const forceMapUpdate = props.forceMapUpdate || 0;

  // Fullscreen toggle handler

  // Restore selectedIds from navigation state
  useEffect(() => {
    if (
      location.state?.selectedIds &&
      Array.isArray(location.state.selectedIds)
    ) {
      setSelectedIds(location.state.selectedIds);
    }
  }, [location.state?.selectedIds]);
  // Debug filteredData changes
  React.useEffect(() => {
    // Debug logging removed
  }, [filteredData]);

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
  // Debug when filteredData changes
  useEffect(() => {
    // Debug logging removed
  }, [filteredData]);

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 139px)' }}>
      <Grid
        item
        xs={12}
        md={isMapExpanded ? 12 : 6}
        lg={isMapExpanded ? 12 : 8}
      >
        <Box sx={{ height: '100%', position: 'relative' }}>
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
            handleCheckboxToggle={handleCheckboxToggle}
            selectedIds={selectedIds}
            compsLength={compsLength}
            isFullscreen={isFullscreen}
            onFullscreenToggle={onMapExpandToggle}
            forceMapUpdate={forceMapUpdate}
            filterParams={{
              comparison_basis: actualComparisonBasis,
              comp_type:
                localStorage.getItem('activeType') || 'building_with_land',
              page: props.page || 1,
              propertyType:
                localStorage.getItem('property_type') ||
                props.sidebarFilters?.propertyType,
              orderByColumn:
                localStorage.getItem('sortingType') ||
                props.sortingSettings?.sortingType ||
                'date_sold',
              orderBy:
                localStorage.getItem('sortingOrder') ||
                props.sortingSettings?.orderSorting ||
                'DESC',
              type: props.checkType === 'leasesCheckbox' ? 'lease' : 'sale',
              search: props.searchValuesByfilter || '',
              compStatus: props.sidebarFilters?.compStatus || '',
              state:
                localStorage.getItem('state_res') ||
                props.sidebarFilters?.state ||
                null,
              street_address:
                localStorage.getItem('street_address_res') ||
                props.sidebarFilters?.street_address ||
                null,
              cap_rate_min: props.sidebarFilters?.cap_rate_min ?? null,
              cap_rate_max: props.sidebarFilters?.cap_rate_max ?? null,
              price_sf_min: props.sidebarFilters?.price_sf_min ?? null,
              price_sf_max: props.sidebarFilters?.price_sf_max ?? null,
              land_sf_min: localStorage.getItem('land_sf_min_res')
                ? parseFloat(
                    localStorage.getItem('land_sf_min_res')!.replace(/,/g, '')
                  )
                : props.sidebarFilters?.land_sf_min ?? null,
              land_sf_max: localStorage.getItem('land_sf_max_res')
                ? parseFloat(
                    localStorage.getItem('land_sf_max_res')!.replace(/,/g, '')
                  )
                : props.sidebarFilters?.land_sf_max ?? null,
              square_footage_min:
                props.sidebarFilters?.square_footage_min ?? null,
              square_footage_max:
                props.sidebarFilters?.square_footage_max ?? null,
              building_sf_min: localStorage.getItem('building_sf_min_res')
                ? parseFloat(
                    localStorage
                      .getItem('building_sf_min_res')!
                      .replace(/,/g, '')
                  )
                : props.sidebarFilters?.building_sf_min ?? null,
              building_sf_max: localStorage.getItem('building_sf_max_res')
                ? parseFloat(
                    localStorage
                      .getItem('building_sf_max_res')!
                      .replace(/,/g, '')
                  )
                : props.sidebarFilters?.building_sf_max ?? null,
              city: localStorage.getItem('selectedCities_res')
                ? JSON.parse(localStorage.getItem('selectedCities_res')!)
                : props.sidebarFilters?.city || [],
              lease_type: props.sidebarFilters?.lease_type || null,
              start_date:
                localStorage.getItem('start_date_res') ||
                props.sidebarFilters?.start_date ||
                null,
              end_date:
                localStorage.getItem('end_date_res') ||
                props.sidebarFilters?.end_date ||
                null,
            }}
          />
        </Box>
      </Grid>

      {/* Listing Panel */}
      <Grid
        item
        xs={12}
        md={6}
        lg={4}
        sx={{ display: isMapExpanded ? 'none' : 'block' }}
      >
        <ResidentialCostMapSideFilteredListing
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
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          compsLength={compsLength}
          setCompsLength={setCompsLength}
        />
      </Grid>
    </Grid>
  );
};

export default CostCompsMapListingIntegratedResidential;
