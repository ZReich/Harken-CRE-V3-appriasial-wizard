import React, { useState, useCallback, useEffect } from 'react';
import GoogleMapLocationCost from './google-map-location-cost';
import EvaluationCostFilteredMapSideListing from './evaluation-cost-map-side-filtered-listing';
import { IComp, FilterComp } from '@/components/interface/header-filter';

interface EvaluationCostMapListingProps {
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
  tableData?: any;
  localStorageTrigger?: number; // Add trigger for localStorage changes
}

const EvaluationCostMapListingIntegrated: React.FC<
  EvaluationCostMapListingProps
> = (props) => {
  const [mapData, setMapData] = useState<IComp[]>([]);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(
    null
  );
  const [localStorageUpdateTrigger, setLocalStorageUpdateTrigger] = useState(0);
  const [paginationMeta, setPaginationMeta] = useState<any>({});

  // Mock data for integration
  const passGoogleData = (data: any) => {
    console.log('🏗️ COST INTEGRATED: passGoogleData called with:', data);
    // This is typically used for passing Google data between components
  };

  const passSetCheckType = (checkType: any) => {
    console.log('🏗️ COST INTEGRATED: passSetCheckType called with:', checkType);
    if (props.setCheckType) {
      props.setCheckType(checkType);
    }
  };

  const passDataCheckType = '';

  // Handle API data update from map component
  const handleApiDataUpdate = useCallback(
    (
      properties: IComp[],
      bounds?: { north: number; south: number; east: number; west: number },
      zoom?: number,
      metadata?: any
    ) => {
      console.log(
        '🏗️🏗️🏗️ COST MAP INTEGRATED - API data updated from map:',
        properties?.length,
        'properties, bounds:',
        bounds,
        'zoom:',
        zoom,
        'metadata:',
        metadata
      );

      // Update the map data
      setMapData(properties);

      // Update pagination metadata if provided
      if (metadata) {
        setPaginationMeta(metadata);
      }
    },
    []
  );

  // Handle map clusters change
  const handleMapClustersChange = useCallback((clusters: any[]) => {
    console.log(
      '🏗️🏗️🏗️ COST MAP INTEGRATED - Map clusters changed:',
      clusters?.length,
      'clusters'
    );
    // This can be used for additional cluster-based functionality if needed
  }, []);

  // Handle setting hovered property ID
  const handleHoveredPropertyId = useCallback((propertyId: number | null) => {
    setHoveredPropertyId(propertyId);
  }, []);

  // Create a stable filter params object that combines props and localStorage values
  const filterParamsWithLocalStorage = React.useMemo(() => {
    console.log(
      '🔄 COST INTEGRATED: Re-computing filterParamsWithLocalStorage due to prop/localStorage changes'
    );
    return {
      comparison_basis: (props.sidebarFilters as any)?.comparison_basis || 'SF',
      land_dimension:
        !localStorage.getItem('selectedSize') ||
        localStorage.getItem('selectedSize') === 'SF'
          ? 'SF'
          : 'ACRE',
      comp_type: localStorage.getItem('activeType') || 'building_with_land',
      page: props.page || 1,
      propertyType:
        props.sidebarFilters?.propertyType ||
        localStorage.getItem('property_type')?.split(',') ||
        null,
      orderByColumn: props.sortingSettings?.sortingType || 'date_sold',
      orderBy: props.sortingSettings?.orderSorting || 'DESC',
      type: props.checkType === 'leasesCheckbox' ? 'lease' : 'sale',
      search: props.searchValuesByfilter || '',
      compStatus:
        props.sidebarFilters?.compStatus ||
        localStorage.getItem('compStatus') ||
        '',
      state:
        props.sidebarFilters?.state || localStorage.getItem('state') || null,
      street_address:
        props.sidebarFilters?.street_address ||
        localStorage.getItem('street_address') ||
        null,
      cap_rate_min:
        props.sidebarFilters?.cap_rate_min ??
        (localStorage.getItem('cap_rate_min')
          ? parseFloat(localStorage.getItem('cap_rate_min')!)
          : null),
      cap_rate_max:
        props.sidebarFilters?.cap_rate_max ??
        (localStorage.getItem('cap_rate_max')
          ? parseFloat(localStorage.getItem('cap_rate_max')!)
          : null),
      price_sf_min:
        props.sidebarFilters?.price_sf_min ??
        (localStorage.getItem('price_sf_min')
          ? parseFloat(localStorage.getItem('price_sf_min')!)
          : null),
      price_sf_max:
        props.sidebarFilters?.price_sf_max ??
        (localStorage.getItem('price_sf_max')
          ? parseFloat(localStorage.getItem('price_sf_max')!)
          : null),
      land_sf_min:
        props.sidebarFilters?.land_sf_min ??
        (localStorage.getItem('land_sf_min')
          ? parseInt(localStorage.getItem('land_sf_min')!)
          : null),
      land_sf_max:
        props.sidebarFilters?.land_sf_max ??
        (localStorage.getItem('land_sf_max')
          ? parseInt(localStorage.getItem('land_sf_max')!)
          : null),
      square_footage_min:
        props.sidebarFilters?.square_footage_min ??
        (localStorage.getItem('square_footage_min')
          ? parseInt(localStorage.getItem('square_footage_min')!)
          : null),
      square_footage_max:
        props.sidebarFilters?.square_footage_max ??
        (localStorage.getItem('square_footage_max')
          ? parseInt(localStorage.getItem('square_footage_max')!)
          : null),
      building_sf_min:
        props.sidebarFilters?.building_sf_min ??
        (localStorage.getItem('building_sf_min')
          ? parseInt(localStorage.getItem('building_sf_min')!)
          : null),
      building_sf_max:
        props.sidebarFilters?.building_sf_max ??
        (localStorage.getItem('building_sf_max')
          ? parseInt(localStorage.getItem('building_sf_max')!)
          : null),
      city:
        props.sidebarFilters?.city ||
        (localStorage.getItem('selectedCities')
          ? JSON.parse(localStorage.getItem('selectedCities')!)
          : []),
      lease_type:
        props.sidebarFilters?.lease_type ||
        localStorage.getItem('lease_type') ||
        null,
      start_date:
        props.sidebarFilters?.start_date ||
        localStorage.getItem('start_date') ||
        null,
      end_date:
        props.sidebarFilters?.end_date ||
        localStorage.getItem('end_date') ||
        null,
    };
  }, [
    props.sidebarFilters,
    props.page,
    props.sortingSettings,
    props.checkType,
    props.searchValuesByfilter,
    props.localStorageTrigger, // Watch for parent localStorage trigger
    localStorageUpdateTrigger, // Add localStorage trigger
  ]);

  // Watch for localStorage changes in header filters
  useEffect(() => {
    const handleStorageChange = () => {
      console.log(
        '🔄 COST INTEGRATED: localStorage changed, triggering filter update'
      );
      setLocalStorageUpdateTrigger((prev) => prev + 1);
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', handleStorageChange);

    // For same-tab localStorage changes, we'll trigger from parent component
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="flex w-full">
      <div className="2xl:xl:w-8/12 xl:w-7/12 w-6/12 overflow-hidden">
        <GoogleMapLocationCost
          GoogleData={mapData}
          onApiDataUpdate={handleApiDataUpdate}
          onMapClustersChange={handleMapClustersChange}
          hoveredPropertyId={hoveredPropertyId}
          selectedToggleButton={props.selectedToggleButton}
          filterParams={filterParamsWithLocalStorage}
        />
      </div>
      <div className="2xl:xl:w-4/12 xl:w-5/12 w-6/12 relative right-1">
        <EvaluationCostFilteredMapSideListing
          {...props}
          mapData={mapData} // Use mapData from API
          passGoogleData={passGoogleData}
          passSetCheckType={passSetCheckType}
          passDataCheckType={passDataCheckType}
          paginationMeta={paginationMeta} // Pass pagination metadata
          hoveredPropertyId={hoveredPropertyId}
          setHoveredPropertyId={handleHoveredPropertyId}
        />
      </div>
    </div>
  );
};

export default EvaluationCostMapListingIntegrated;
