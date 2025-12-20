import React, { useState, useCallback, useEffect } from 'react';
import GoogleMapLocationCap from './google-map-location-cap-rate';
import EvaluationCapMapSideFilteredListing from './evaluation-cap-map-side-filtered-listing';
import { IComp, FilterComp } from '@/components/interface/header-filter';

interface EvaluationSalesMapListingProps {
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
  comparisonBasisView?: any;
  tableData?: any;
  localStorageTrigger?: number; // Add trigger for localStorage changes
}

const EvaluationCapMapListingIntegrated: React.FC<
  EvaluationSalesMapListingProps
> = (props) => {
  const [mapData, setMapData] = useState<IComp[]>([]);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(
    null
  );
  const [localStorageUpdateTrigger, setLocalStorageUpdateTrigger] = useState(0);
  const [paginationMeta, setPaginationMeta] = useState<any>({});

  // Handle API data updates from map component
  const handleApiDataUpdate = useCallback(
    (
      properties: IComp[],
      bounds?: { north: number; south: number; east: number; west: number },
      zoom?: number,
      metadata?: any
    ) => {
      console.log(
        '🌐🌐🌐 SALES MAP INTEGRATED - API data updated from map:',
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

  // Handle data from listing component
  const passGoogleData = useCallback((data: IComp[]) => {
    console.log(
      '🔄 SALES - Data from listing component:',
      data.length,
      'items'
    );
    setMapData(data);
  }, []);

  // Dummy function for compatibility
  const passSetCheckType = useCallback(
    (type: any) => {
      props.setCheckType(type);
    },
    [props]
  );

  // Handle setting hovered property ID
  const handleHoveredPropertyId = useCallback((propertyId: number | null) => {
    setHoveredPropertyId(propertyId);
  }, []);

  // Create a stable filter params object that combines props and localStorage values
  const filterParamsWithLocalStorage = React.useMemo(() => {
    console.log(
      '🔄 SALES INTEGRATED: Re-computing filterParamsWithLocalStorage due to prop/localStorage changes'
    );
    return {
      comparison_basis: (props.sidebarFilters as any)?.comparison_baisi || 'SF',
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
      comparisonBasisView: props.comparisonBasisView || 'SF',
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
        '🔄 SALES INTEGRATED: localStorage changed, triggering filter update'
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
        <GoogleMapLocationCap
          GoogleData={mapData}
          onApiDataUpdate={handleApiDataUpdate}
          hoveredPropertyId={hoveredPropertyId}
          filterParams={filterParamsWithLocalStorage}
        />
      </div>
      <div className="2xl:xl:w-4/12 xl:w-5/12 w-6/12 relative right-1">
        <EvaluationCapMapSideFilteredListing
          {...props}
          mapData={mapData} // Use mapData from API
          passGoogleData={passGoogleData}
          passSetCheckType={passSetCheckType}
          passDataCheckType={() => {}} // Dummy function
          paginationMeta={paginationMeta}
          hoveredPropertyId={hoveredPropertyId}
          setHoveredPropertyId={handleHoveredPropertyId}
        />
      </div>
    </div>
  );
};

export default EvaluationCapMapListingIntegrated;
