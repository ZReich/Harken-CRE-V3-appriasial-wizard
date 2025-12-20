import React, { useState, useCallback, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import GoogleMapLocationComps from './residential-sales-google-map';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import ResidentialSalesMapSideFilteredListing from './residential-sales-map-side-filtered-listing';

interface CompsMapListingProps {
  // Add your existing props here
  typeFilter: string;
  typeProperty: any;
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null;
  sortingSettings: any;
  checkType: any;
  setCheckType: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  uploadCompsStatus: any;
}

const SalesCompsMapListingIntegratedResidential: React.FC<
  CompsMapListingProps
> = (props) => {
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
      console.log(
        '🌐🌐🌐 MAP INTEGRATED - API data updated from map:',
        properties?.length,
        'properties, bounds:',
        bounds,
        'zoom:',
        zoom
      );

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
    // This ensures the listing component can provide initial data
    setGoogleData(data);
    setOriginalData(data);

    // Only update filteredData if we don't have any external data yet (null)
    setFilteredData((currentFilteredData) => {
      if (currentFilteredData === null) {
        console.log(
          '🔄 Setting initial filteredData from listing component:',
          data.length,
          'items'
        );
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
  const handleClustersApiUpdate = useCallback((clusters: any[]) => {
    console.log(
      '🌐🗺️ PARENT - Clusters updated from listing API:',
      clusters.length,
      'clusters'
    );
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
  const handleMapClustersChange = useCallback((clusters: any[]) => {
    console.log(clusters);
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

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 120px)' }}>
      <Grid item xs={12} md={6} lg={8}>
        <Box sx={{ height: '100%', position: 'relative' }}>
          <GoogleMapLocationComps
            GoogleData={googleData}
            clustersData={clustersData}
            selectedToggleButton={props.selectedToggleButton}
            onMapClustersChange={handleMapClustersChange}
            focusedPropertyId={focusedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onClusterClick={handleClusterFilter}
            onApiDataUpdate={handleApiDataUpdate}
            filterParams={{
              comparison_basis:
                (props.sidebarFilters as any)?.comparison_baisi || 'SF',
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
          />
        </Box>
      </Grid>

      {/* Listing Panel */}
      <Grid item xs={12} md={6} lg={4}>
        <ResidentialSalesMapSideFilteredListing
          {...props}
          data={filteredData} // Use filteredData from map API
          passGoogleData={handleGoogleDataChange}
          passSetCheckType={passSetCheckType}
          passDataCheckType={() => {}} // Dummy function
          onPropertyFocus={handlePropertyFocus}
          onPropertyHover={handlePropertyHover}
          isClusterFiltered={isClusterFiltered}
          clearClusterFilter={clearClusterFilter}
          onApiDataUpdate={handleApiDataUpdate}
          mapBounds={mapBounds}
          mapZoom={mapZoom}
          hasMapDataUpdate={hasMapDataUpdate}
          onClustersApiUpdate={handleClustersApiUpdate}
        />
      </Grid>
    </Grid>
  );
};

export default SalesCompsMapListingIntegratedResidential;
