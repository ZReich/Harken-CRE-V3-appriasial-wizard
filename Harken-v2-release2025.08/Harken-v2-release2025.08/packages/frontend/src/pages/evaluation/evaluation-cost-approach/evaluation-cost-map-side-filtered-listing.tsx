import { Box, ButtonBase, Grid, Stack } from '@mui/material';
import image1 from '../../../images/list.jpg';
import { useEffect, useState, useRef } from 'react';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { FilterComp, IComp } from '@/components/interface/header-filter';
import { ListingEnum, PaginationEnum } from '@/pages/comps/enum/CompsEnum';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AiImage from '../../../images/AI SVG.svg';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';
import { useFormikContext } from 'formik';

import { APIClient } from '@/api/api-client';
import { EvaluationCostApproachFormValues } from './evaluation-cost-approach-subject-property-form';
import {
  ClearAdditionalCompsLength,
  ClearAdditionalStorage,
} from '@/utils/clearAdditionalStorage';
import CompsMapListSide from '@/utils/compsMapListSide';

interface CompsListingMapProps {
  typeFilter: string;
  currentMapZoom?: any;
  getCurrentMapState: any;
  setGetCurrentMapState?: any;
  typeProperty: any;
  currentBounds?: any;
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null;
  passGoogleData: any;
  passSetCheckType: any;
  passDataCheckType: any;
  sortingSettings: any;
  checkType: any;
  setCheckType: any;
  compFilters?: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
  compsLength?: number;
  setCompsLength?: React.Dispatch<React.SetStateAction<number>>;

  onApiDataUpdate?: any;
  uploadCompsStatus: any;
  onPropertyFocus?: (propertyId: number | null) => void;
  onPropertyHover?: (propertyId: number | null) => void;
  data?: IComp[] | null;

  isClusterFiltered?: boolean;
  clearClusterFilter?: () => void;
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  mapZoom?: number;
  hasMapDataUpdate?: boolean;
  onClustersApiUpdate?: (clusters: any[]) => void;
  onZoomChange?: (getCurrentZoom: () => number | null) => void;
  comparisonBasisView?: any;
  mapData?: any[];
  paginationMeta?: {
    totalRecord?: number;
    totalPages?: number;
    limit?: number;
    page?: number;
  };
  hoveredPropertyId?: number | null;
  setHoveredPropertyId?: (id: number | null) => void;
  onResetSearch?: () => void;
  onZoomReset?: () => void; // Add onZoomReset callback
  mapInteractionTrigger?: number;
}

export interface typeResponse {
  data: {
    data: {
      properties: IComp[];
      page: number;
      perPage: number;
      totalRecord: number;
      currentMapZoom?: any;
    };
  };
}

export interface paramsType {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoom: number;
  page: number;
  limit: number;
  filters: {
    building_sf_max?: number | null;
    building_sf_min?: number | null;
    cap_rate_max?: number | null;
    cap_rate_min?: number | null;
    city?: any[];
    comparison_basis?: string;
    end_date?: string | null;
    land_dimension?: string;
    land_sf_max?: number | null;
    land_sf_min?: number | null;
    lease_type?: string | null;
    orderBy?: string;
    orderByColumn?: string;
    price_sf_max?: number | null;
    price_sf_min?: number | null;
    propertyType?: any[] | null;
    search?: string;
    square_footage_max?: number | null;
    square_footage_min?: number | null;
    start_date?: string | null;
    state?: string | null;
    street_address?: string | null;
    type?: string;
    compFilters?: any;
    currentMapZoom?: any;
  };
}

const EvaluationCostFilteredMapSideListing: React.FC<CompsListingMapProps> = ({
  typeFilter: _typeFilter,
  searchValuesByfilter: _searchValuesByfilter,
  sidebarFilters: _sidebarFilters,
  typeProperty: _typeProperty,
  passGoogleData,
  passSetCheckType,
  sortingSettings: _sortingSettings,
  checkType,
  setCheckType,
  loading,
  setLoading,
  selectedToggleButton,
  page,
  setPage,
  uploadCompsStatus,
  currentBounds,
  currentMapZoom,
  onPropertyFocus,
  onPropertyHover,
  data: externalData,
  isClusterFiltered = false,
  mapBounds,
  mapZoom,
  hasMapDataUpdate = false,
  onClustersApiUpdate,
  onZoomChange,
  compFilters,
  comparisonBasisView,
  mapData = [],
  paginationMeta = {},
  onResetSearch,
  onZoomReset,
  selectedIds: propSelectedIds,
  setSelectedIds: propSetSelectedIds,
  compsLength: propCompsLength,
  mapInteractionTrigger,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localSelectedIds, setLocalSelectedIds] = useState<any[]>([]);

  const selectedIds = propSelectedIds || localSelectedIds;
  const setSelectedIds = propSetSelectedIds || setLocalSelectedIds;
  const { values, setValues } =
    useFormikContext<EvaluationCostApproachFormValues>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costId = searchParams.get('approachId');

  // State management from SideListingMap
  const [allOriginalData, setAllOriginalData] = useState<any[]>([]);

  const [paginatedOriginalData, setPaginatedOriginalData] = useState<any[]>([]);
  const [hasValidState, setHasValidState] = useState(false);
  const [savedState, setSavedState] = useState<any>(null);
  const [hasMapInteraction, setHasMapInteraction] = useState(false);
  const [hasUserFilterChanges, setHasUserFilterChanges] = useState(false);
  // Track if current API call is triggered by map interaction (zoom/cluster)
  const [isMapTriggered, setIsMapTriggered] = useState(false);
  const [getCurrentZoom, setGetCurrentZoom] = useState<
    (() => number | null) | null
  >(null);
  // Anti-blinking states
  const [isToggleChanging, setIsToggleChanging] = useState(false);
  const [hasToggleChanged, setHasToggleChanged] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const clearSelectedIds = propSetSelectedIds;
  console.log(setValues, hasToggleChanged, isInitialLoad);
  // Search change detection states
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  // Debounce search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(_searchValuesByfilter || '');
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [_searchValuesByfilter]);

  // Reset page when map interactions occur (zoom, pan, cluster clicks)
  useEffect(() => {
    if (mapInteractionTrigger && mapInteractionTrigger > 0) {
      setPage(1);
      setIsMapTriggered(true);
    }
  }, [mapInteractionTrigger, setPage]);

  // Legacy state for backward compatibility
  const [apiData, setApiData] = useState<any[]>([]);
  const [apiPaginationMeta, setApiPaginationMeta] = useState<any>({});
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Refs to prevent continuous API calls
  const skipApiCallRef = useRef(false);
  const skipClustersCallRef = useRef(false);
  console.log(isLoadingApi);

  const compsLength =
    propCompsLength ||
    location.state?.compsLength ||
    localStorage.getItem('compsLengthcostevaluation');
  const comparisonBasis = location.state?.comparisonBasis;
  console.log(
    setApiData,
    setApiPaginationMeta,
    setIsLoadingApi,
    allOriginalData,
    setGetCurrentZoom
  );

  // Navigation state management from SideListingMap
  useEffect(() => {
    if (location.state && !hasValidState) {
      setSavedState(location.state);
      setHasValidState(true);
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, [location.state, hasValidState]);

  const finalCompFilters =
    compFilters || (hasValidState ? savedState?.filters : null);
  const finalCurrentBounds =
    currentBounds || (hasValidState ? savedState?.bounds : null);
  const finalCurrentMapZoom =
    currentMapZoom || (hasValidState ? savedState?.zoom : null);

  // Zoom change handler from SideListingMap
  // const handleZoomChange = useCallback(
  //   (getCurrentZoomFn: () => number | null) => {
  //     setGetCurrentZoom(() => getCurrentZoomFn);
  //   },
  //   []
  // );

  useEffect(() => {
    if (onZoomChange && getCurrentZoom) {
      onZoomChange(getCurrentZoom);
    }
  }, [onZoomChange, getCurrentZoom]);

  // API mutations
  const parameterType =
    checkType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: `cluster-details/${parameterType}`,
    endPoint: 'comps/map-cluster-details',
    requestType: RequestType.POST,
  });

  const selectedCompsMutation = useMutate<any, any>({
    queryKey: 'selected-comps',
    endPoint: '/evaluations/get-selected-comps/',
    requestType: RequestType.POST,
  });

  // Debug to verify the prop chain is working
  console.log('🔍 COMPARISON BASIS DEBUG:', {
    comparisonBasisView_prop: comparisonBasisView,
    comparisonBasis_locationState: comparisonBasis,
    locationState_comparisonBasis: location.state?.comparisonBasis,
    localStorage_comparisonBasisView: localStorage.getItem(
      'comparisonBasisView'
    ),
    full_locationState: location.state,
    final_value:
      comparisonBasisView || comparisonBasis || location.state?.comparisonBasis,
  });

  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedType = e.target.id;

    // Batch all localStorage operations
    localStorage.setItem('checkType', selectedType);
    localStorage.removeItem('approachType');
    localStorage.removeItem('compStatus');
    localStorage.removeItem('sortingType');
    localStorage.removeItem('sortingOrder');
    localStorage.setItem('property_type', '');
    localStorage.removeItem('params');
    localStorage.removeItem('checkStatus');

    if (clearSelectedIds) {
      clearSelectedIds([]);
    } else {
      setLocalSelectedIds([]);
    }

    // Clear values from localStorage if the checkbox is toggled
    ClearAdditionalStorage();

    // Batch all state updates
    setCheckType(selectedType);
    setHasUserFilterChanges(true);
    setSavedState(null);
    setHasValidState(false);
    setHasToggleChanged(true);
    setPage(1);

    // Call parent functions
    passSetCheckType(selectedType);

    if (onResetSearch) {
      onResetSearch();
    }

    if (onZoomReset) {
      onZoomReset();
    }

    // Set toggle changing flag and clear it after a longer delay to prevent double API calls
    setIsToggleChanging(true);
    setTimeout(() => {
      setIsToggleChanging(false);
    }, 1000);

    // Ensure initial load is complete when user interacts
    setIsInitialLoad(false);
  };

  useEffect(() => {
    if (checkType === 'salesCheckbox') {
      // localStorage.removeItem('compStatus');
    }
  }, [checkType]);

  // Detect search term changes and reset page to 1
  useEffect(() => {
    const newSearchTerm = debouncedSearchTerm || '';
    if (newSearchTerm !== currentSearchTerm) {
      if (currentSearchTerm !== '') {
        // Search term changed - reset page to 1
        setPage(1);
      }
      setCurrentSearchTerm(newSearchTerm);
    }
  }, [debouncedSearchTerm, currentSearchTerm, setPage]);

  useEffect(() => {
    // Re-enable API calls in listing component
    // return;

    if (skipApiCallRef.current || mutation.isLoading) {
      return;
    }
    if (isClusterFiltered && externalData && externalData.length > 0) {
      return;
    }
    if (hasMapDataUpdate && externalData && page === 1) {
      return;
    }
    // Prevent API calls during toggle changes to avoid blinking
    if (isToggleChanging) {
      return;
    }

    skipApiCallRef.current = true;

    const fetchData = async () => {
      const isValidBounds = (bounds: any) =>
        bounds &&
        bounds.north != null &&
        bounds.south != null &&
        bounds.east != null &&
        bounds.west != null;

      const bounds = hasMapInteraction
        ? isValidBounds(mapBounds)
          ? mapBounds
          : isValidBounds(currentBounds)
            ? currentBounds
            : {
                north: 49.3457868,
                south: 24.7433195,
                east: -66.9513812,
                west: -124.7844079,
              }
        : isValidBounds(finalCurrentBounds)
          ? finalCurrentBounds
          : isValidBounds(currentBounds)
            ? currentBounds
            : isValidBounds(mapBounds)
              ? mapBounds
              : {
                  north: 49.3457868,
                  south: 24.7433195,
                  east: -66.9513812,
                  west: -124.7844079,
                };

      const zoom = getCurrentZoom
        ? getCurrentZoom() || 5
        : mapZoom ||
          currentMapZoom ||
          (hasValidState ? finalCurrentMapZoom : 5) ||
          5;

      // Always build filters from localStorage
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

      let cityArray = [];
      if (selectedCities) {
        try {
          cityArray = JSON.parse(selectedCities);
        } catch (e) {
          console.warn('Failed to parse selectedCities:', e);
        }
      }

      let propertyTypeArray = null;
      if (propertyType) {
        propertyTypeArray = propertyType.split(',').filter(Boolean);
      }

      const compType =
        localStorage.getItem('activeType') || 'building_with_land';

      const finalFilters = {
        comp_type: compType || 'building_with_land',
        land_dimension:
          !localStorage.getItem('selectedSize') ||
          localStorage.getItem('selectedSize') === 'SF'
            ? 'SF'
            : 'ACRE',
        orderBy: localStorage.getItem('sortingOrder')?.includes('asc')
          ? 'asc'
          : _sortingSettings?.orderSorting || 'DESC',
        orderByColumn:
          localStorage.getItem('sortingType') ||
          _sortingSettings?.sortingType ||
          'date_sold',
        type: parameterType,
        search: debouncedSearchTerm || '',
      } as any;

      // Only add non-empty values from localStorage
      if (buildingMax && buildingMax > 0)
        finalFilters.building_sf_max = buildingMax;
      if (buildingMin && buildingMin > 0)
        finalFilters.building_sf_min = buildingMin;
      if (compStatus && compStatus.trim() !== '')
        finalFilters.compStatus = compStatus;
      if (endDate && endDate.trim() !== '') finalFilters.end_date = endDate;
      if (landMax && landMax > 0) finalFilters.land_sf_max = landMax;
      if (landMin && landMin > 0) finalFilters.land_sf_min = landMin;
      if (priceSfMax && priceSfMax > 0) finalFilters.price_sf_max = priceSfMax;
      if (priceSfMin && priceSfMin > 0) finalFilters.price_sf_min = priceSfMin;
      if (propertyTypeArray && propertyTypeArray.length > 0)
        finalFilters.propertyType = propertyTypeArray;
      if (squareFootageMax && squareFootageMax > 0)
        finalFilters.square_footage_max = squareFootageMax;
      if (squareFootageMin && squareFootageMin > 0)
        finalFilters.square_footage_min = squareFootageMin;
      if (startDate && startDate.trim() !== '')
        finalFilters.start_date = startDate;
      if (state && state.trim() !== '') finalFilters.state = state;
      if (streetAddress && streetAddress.trim() !== '')
        finalFilters.street_address = streetAddress;
      if (leaseType && leaseType.trim() !== '')
        finalFilters.lease_type = leaseType;
      if (cityArray && cityArray.length > 0) finalFilters.city = cityArray;

      const params: paramsType = {
        bounds,
        zoom: zoom,
        page:
          _searchValuesByfilter !== currentSearchTerm || isMapTriggered
            ? 1
            : page, // Reset to page 1 for new searches or map interactions
        limit: 10,
        filters: finalFilters,
      };

      try {
        await mutation.mutateAsync(params);
      } catch (error) {
        console.error('Error while mutating data:', error);
      } finally {
        skipApiCallRef.current = false;
      }
    };

    fetchData();
  }, [
    parameterType,
    uploadCompsStatus,
    isClusterFiltered,
    page,
    mapBounds,
    mapZoom,
    hasMapDataUpdate,
    _sortingSettings,
    debouncedSearchTerm,
    _typeFilter,
    _typeProperty,
    _sidebarFilters,
  ]);

  // Map interaction tracking
  useEffect(() => {
    if (mapBounds || mapZoom) {
      setHasMapInteraction(true);
      setIsMapTriggered(true); // Set flag when map interaction occurs
    }
  }, [mapBounds, mapZoom]);

  // Reset map triggered flag after API call completes
  useEffect(() => {
    if (!mutation.isLoading && isMapTriggered) {
      setIsMapTriggered(false);
    }
  }, [mutation.isLoading, isMapTriggered]);

  // Filter change tracking
  useEffect(() => {
    const hasFilterUpdates =
      (_typeFilter && _typeFilter.trim() !== '') ||
      (_typeProperty && _typeProperty.length > 0) ||
      (_sidebarFilters &&
        Object.keys(_sidebarFilters).some(
          (key) =>
            (_sidebarFilters as any)[key] !== null &&
            (_sidebarFilters as any)[key] !== ''
        )) ||
      (debouncedSearchTerm && debouncedSearchTerm.trim() !== '');

    if (hasFilterUpdates) {
      setHasUserFilterChanges(true);
    }
  }, [_typeFilter, _typeProperty, _sidebarFilters, debouncedSearchTerm]);

  // Map-clusters API call
  useEffect(() => {
    // Re-enable clusters API call in listing component
    // return;

    if (skipClustersCallRef.current) {
      return;
    }
    // Prevent clusters API calls during toggle changes to avoid blinking
    if (isToggleChanging) {
      return;
    }

    skipClustersCallRef.current = true;

    const isValidBounds = (bounds: any) =>
      bounds &&
      bounds.north != null &&
      bounds.south != null &&
      bounds.east != null &&
      bounds.west != null;

    const bounds = hasMapInteraction
      ? isValidBounds(mapBounds)
        ? mapBounds
        : isValidBounds(currentBounds)
          ? currentBounds
          : {
              north: 49.3457868,
              south: 24.7433195,
              east: -66.9513812,
              west: -124.7844079,
            }
      : isValidBounds(finalCurrentBounds)
        ? finalCurrentBounds
        : isValidBounds(currentBounds)
          ? currentBounds
          : isValidBounds(mapBounds)
            ? mapBounds
            : {
                north: 49.3457868,
                south: 24.7433195,
                east: -66.9513812,
                west: -124.7844079,
              };
    const zoom = getCurrentZoom
      ? getCurrentZoom() || 5
      : mapZoom ||
        currentMapZoom ||
        (hasValidState ? finalCurrentMapZoom : 5) ||
        5;

    // Always build clusters filters from localStorage
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

    let cityArray = [];
    if (selectedCities) {
      try {
        cityArray = JSON.parse(selectedCities);
      } catch (e) {
        console.warn('Failed to parse selectedCities:', e);
      }
    }

    let propertyTypeArray = null;
    if (propertyType) {
      propertyTypeArray = propertyType.split(',').filter(Boolean);
    }

    const compType = localStorage.getItem('activeType') || 'building_with_land';

    const clustersFilters = {
      comp_type: compType || 'building_with_land',
      land_dimension:
        !localStorage.getItem('selectedSize') ||
        localStorage.getItem('selectedSize') === 'SF'
          ? 'SF'
          : 'ACRE',
      orderBy: localStorage.getItem('sortingOrder')?.includes('asc')
        ? 'asc'
        : _sortingSettings?.orderSorting || 'DESC',
      orderByColumn:
        localStorage.getItem('sortingType') ||
        _sortingSettings?.sortingType ||
        'date_sold',
      type: parameterType,
      search: debouncedSearchTerm || '',
    } as any;

    // Only add non-empty values from localStorage
    if (buildingMax && buildingMax > 0)
      clustersFilters.building_sf_max = buildingMax;
    if (buildingMin && buildingMin > 0)
      clustersFilters.building_sf_min = buildingMin;
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

    APIClient.getInstance()
      .post<any, typeof clustersParams>('comps/map-clusters', clustersParams)
      .then((res: any) => {
        const clusters = res?.data?.data?.clusters || [];
        if (onClustersApiUpdate) {
          onClustersApiUpdate(clusters);
        }
      })
      .catch((err: any) => {
        console.error('Error fetching map clusters:', err);
        if (onClustersApiUpdate) {
          onClustersApiUpdate([]);
        }
      })
      .finally(() => {
        skipClustersCallRef.current = false;
      });
  }, [
    parameterType,
    mapBounds,
    mapZoom,
    _sortingSettings,
    debouncedSearchTerm,
    _typeFilter,
    _typeProperty,
    _sidebarFilters,
  ]);
  // Data state management
  useEffect(() => {
    if (isClusterFiltered && externalData && externalData.length > 0) {
      setAllOriginalData(externalData || []);
      setPaginatedOriginalData(externalData || []);
    } else if (hasMapDataUpdate && externalData && page === 1) {
      setAllOriginalData(externalData);
      setPaginatedOriginalData(externalData);
    } else {
      const backendData = mutation.data?.data.data.properties || [];
      setAllOriginalData(backendData);
      setPaginatedOriginalData(backendData);
    }
  }, [
    mutation.data,
    externalData,
    isClusterFiltered,
    page,
    hasMapDataUpdate,
    loading,
    setLoading,
  ]);

  // Legacy compatibility
  useEffect(() => {
    console.log(
      '📍 Map data updated in listing component:',
      mapData?.length || 0,
      'properties'
    );
    console.log('📄 Pagination metadata:', paginationMeta);
  }, [mapData, paginationMeta]);

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const viewListingItem = (id: number) => {
    const check = 'cost';

    const searchParams = new URLSearchParams(location.search);
    const propertyIdFromUrl = searchParams.get('id');
    const approachIdFromUrl = searchParams.get('approachId');

    // Parse selectedCities from localStorage
    let cityArray = [];
    const selectedCitiesString = localStorage.getItem('selectedCities');
    if (selectedCitiesString) {
      try {
        cityArray = JSON.parse(selectedCitiesString);
      } catch (e) {
        console.warn('Failed to parse selectedCities:', e);
      }
    }

    // Get current filter state for back navigation
    const hasFilterUpdates =
      (_typeFilter && _typeFilter.trim() !== '') ||
      (_typeProperty && _typeProperty.length > 0) ||
      (_sidebarFilters &&
        Object.keys(_sidebarFilters).some(
          (key) =>
            (_sidebarFilters as any)[key] !== null &&
            (_sidebarFilters as any)[key] !== ''
        )) ||
      (debouncedSearchTerm && debouncedSearchTerm.trim() !== '');

    const currentFilters =
      finalCompFilters &&
      Object.keys(finalCompFilters).length > 0 &&
      !hasFilterUpdates &&
      !hasUserFilterChanges
        ? finalCompFilters
        : {
            building_sf_min: localStorage.getItem('building_sf_min')
              ? parseFloat(
                  localStorage.getItem('building_sf_min')!.replace(/,/g, '')
                )
              : null,
            building_sf_max: localStorage.getItem('building_sf_max')
              ? parseFloat(
                  localStorage.getItem('building_sf_max')!.replace(/,/g, '')
                )
              : null,
            land_sf_min: localStorage.getItem('land_sf_min')
              ? parseFloat(
                  localStorage.getItem('land_sf_min')!.replace(/,/g, '')
                )
              : null,
            land_sf_max: localStorage.getItem('land_sf_max')
              ? parseFloat(
                  localStorage.getItem('land_sf_max')!.replace(/,/g, '')
                )
              : null,
            price_sf_min: localStorage.getItem('price_sf_min')
              ? parseFloat(
                  localStorage.getItem('price_sf_min')!.replace(/,/g, '')
                )
              : null,
            price_sf_max: localStorage.getItem('price_sf_max')
              ? parseFloat(
                  localStorage.getItem('price_sf_max')!.replace(/,/g, '')
                )
              : null,
            square_footage_min: localStorage.getItem('square_footage_min')
              ? parseFloat(
                  localStorage.getItem('square_footage_min')!.replace(/,/g, '')
                )
              : null,
            square_footage_max: localStorage.getItem('square_footage_max')
              ? parseFloat(
                  localStorage.getItem('square_footage_max')!.replace(/,/g, '')
                )
              : null,
            start_date: localStorage.getItem('start_date'),
            end_date: localStorage.getItem('end_date'),
            state: localStorage.getItem('state'),
            street_address: localStorage.getItem('street_address'),
            compStatus: localStorage.getItem('compStatus'),
            property_type: localStorage.getItem('property_type'),
            lease_type: localStorage.getItem('lease_type'),
            city: cityArray,
            activeType: localStorage.getItem('activeType'),
            checkType: localStorage.getItem('checkType'),
            land_dimension:
              !localStorage.getItem('selectedSize') ||
              localStorage.getItem('selectedSize') === 'SF'
                ? 'SF'
                : 'ACRE',
            orderBy:
              _sortingSettings?.orderSorting ||
              localStorage.getItem('sortingOrder') ||
              'DESC',
            orderByColumn:
              _sortingSettings?.sortingType ||
              localStorage.getItem('sortingType') ||
              'date_sold',
            search: debouncedSearchTerm || '',
            type: checkType === 'salesCheckbox' ? 'sale' : 'lease',
          };

    // Use current map bounds with validation
    const isValidBounds = (bounds: any) =>
      bounds &&
      bounds.north != null &&
      bounds.south != null &&
      bounds.east != null &&
      bounds.west != null;

    const currentBounds = isValidBounds(mapBounds)
      ? mapBounds
      : {
          north: 49.3457868,
          south: 24.7433195,
          east: -66.9513812,
          west: -124.7844079,
        };

    const currentZoom =
      mapZoom ||
      currentMapZoom ||
      (hasValidState ? finalCurrentMapZoom : 5) ||
      5;

    navigate(`/evaluation/cost-comps-view/${id}/${check}`, {
      state: {
        propertyId: propertyIdFromUrl,
        approachId: approachIdFromUrl,
        selectedToggleButton: selectedToggleButton || null,
        filters: currentFilters,
        bounds: currentBounds,
        zoom: currentZoom,
        selectedIds: selectedIds,
      },
    });
  };

  const handlePreviousPage = () => {
    setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage: any) => Math.max(prevPage + 1, 1));
  };

  // Data management from SideListingMap
  const hasExternalData =
    isClusterFiltered && Array.isArray(externalData) && externalData.length > 0;
  const totalItems = hasExternalData
    ? externalData.length
    : mutation.data?.data.data.totalRecord || 0;
  const data = hasExternalData ? externalData : paginatedOriginalData;

  // Legacy compatibility for mapData
  const legacyData = mapData && mapData.length > 0 ? mapData : apiData || [];
  const finalData = data.length > 0 ? data : legacyData;

  // Legacy pagination
  const activePaginationMeta =
    mapData && mapData.length > 0 ? paginationMeta : apiPaginationMeta;
  const totalRecords = activePaginationMeta?.totalRecord || totalItems;
  const itemsPerPage = activePaginationMeta?.limit || 10;
  const totalPages =
    activePaginationMeta?.totalPages || Math.ceil(totalRecords / itemsPerPage);

  // Pass data to map component
  if (!isClusterFiltered) {
    passGoogleData(finalData);
  }

  const handleSubmit = async () => {
    localStorage.setItem('activeType', 'building_with_land');

    if (selectedIds.length === 0) {
      toast('Please select comps.');
      return;
    }

    try {
      const params = { compIds: selectedIds };
      const response = await selectedCompsMutation.mutateAsync(params);

      if (response?.data) {
        const comps = response?.data?.data || [];

        const updatedComps = comps.map(({ id, ...restComp }: any) => ({
          ...restComp,
          comp_id: id,
          expenses: (values as any).operatingExpenses.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })),
          // comparativeAdjustmentsList: (
          //   values as any
          // ).appraisalSpecificAdjustment.map((exp: any) => ({
          //   ...exp,
          //   comparison_value: 0,
          //   comparison_basis: 0,
          // })),
          adjusted_psf: restComp.price_square_foot,
        }));

        // Clear specific local storage items related to filters
        ClearAdditionalStorage();

        navigate(`/evaluation/cost-approach?id=${id}&costId=${costId}`, {
          state: { updatedComps },
        });
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Filter submission error:', error);
    }
  };

  const handleCheckboxToggle = (id: string) => {
    const maxSelectable = 4 - compsLength;
    setSelectedIds((prevSelectedIds: any) => {
      const alreadySelected = prevSelectedIds.includes(id);
      let updatedSelection;

      if (alreadySelected) {
        // Remove the ID if it's already selected
        updatedSelection = prevSelectedIds.filter(
          (itemId: any) => itemId !== id
        );
      } else {
        // Check limit before adding
        if (prevSelectedIds.length >= maxSelectable) {
          toast.error(
            `${compsLength} comp${compsLength === 1 ? '' : 's'} ${
              compsLength === 1 ? 'is' : 'are'
            } already linked. You can only link up to ${maxSelectable} more.`
          );
          return prevSelectedIds; // Don't add new ID
        }
        updatedSelection = [...prevSelectedIds, id];
      }

      return updatedSelection;
    });
  };

  // Loader disabled
  if (false) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }

  const backToApproach = () => {
    localStorage.setItem('activeType', 'building_with_land');
    // Clear specific local storage items related to filters
    ClearAdditionalStorage();
    ClearAdditionalCompsLength();
    localStorage.removeItem('comprisonBasisView');

    navigate(`/evaluation/cost-approach?id=${id}&costId=${costId}`);
  };
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container>
          <Grid item xs={12} className="bg-silverGray rounded-lg pb-6">
            <Box>
              <Box className="flex justify-between items-center mr-7 py-3.5">
                {/* Left Section: Buttons */}
                <Box className="pl-5 text-customBlack text-sm flex items-center gap-3">
                  <ButtonBase
                    onClick={handleSubmit}
                    disabled={selectedIds.length === 0}
                    style={{
                      backgroundColor: 'rgb(13, 161, 199)',
                      paddingTop: '6px',
                      paddingBottom: '4px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                      opacity: selectedIds.length === 0 ? 0.5 : 1, // Optional: visually indicate it's disabled
                      cursor:
                        selectedIds.length === 0 ? 'not-allowed' : 'pointer', // Optional: cursor change
                    }}
                    className="text-white text-base rounded transition-all"
                  >
                    Link Comps
                  </ButtonBase>
                  <ButtonBase
                    onClick={backToApproach}
                    style={{
                      backgroundColor: 'rgb(13, 161, 199)',
                      paddingTop: '6px',
                      paddingBottom: '4px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                    }}
                    className="text-white text-base rounded transition-all"
                  >
                    Cancel
                  </ButtonBase>
                  {selectedIds.length > 0 && (
                    <span className="text-customBlack text-sm">
                      {selectedIds.length} comp
                      {selectedIds.length === 1 ? '' : 's'} selected
                    </span>
                  )}
                </Box>

                {/* Right Section: Lease and Sale Checkboxes */}
                <Box className="flex gap-4 items-center">
                  <Box className="round">
                    <Box className={`pl-2 flex items-center `}>
                      <input
                        type="checkbox"
                        checked={
                          checkType === 'leasesCheckbox'
                          // approachType === 'leaseCheck'
                        }
                        onChange={handleCheckboxChange}
                        id="leasesCheckbox"
                        // disabled={approachType === 'salesCheck'}
                      />
                      <label htmlFor="leasesCheckbox"></label>
                      <span className="select-text-content">
                        {ListingEnum.LEASES}
                      </span>
                    </Box>
                  </Box>

                  <Box className="round">
                    <Box className={`pl-2 flex items-center `}>
                      <input
                        type="checkbox"
                        checked={checkType === 'salesCheckbox'}
                        // checked={approachType === 'salesCheck'}
                        onChange={handleCheckboxChange}
                        id="salesCheckbox"
                        // disabled={approachType === 'leaseCheck'}
                      />
                      <label htmlFor="salesCheckbox"></label>
                      <span className="select-text-content">
                        {ListingEnum.SALES}
                      </span>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <CompsMapListSide
                data={finalData}
                image1={image1}
                AiImage={AiImage}
                onPropertyFocus={onPropertyFocus}
                onPropertyHover={onPropertyHover}
                selectedIds={selectedIds}
                handleCheckboxToggle={handleCheckboxToggle}
                viewListingItem={viewListingItem}
                selectedToggleButton={selectedToggleButton}
                checkType={checkType}
                hidden={true}
              />
              <Stack direction="row" justifyContent="center" mt={2}>
                <button
                  className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  onClick={handlePreviousPage}
                  disabled={finalData?.length === 0 || page === 1}
                >
                  {PaginationEnum.PREVIOUS}
                </button>
                <Pagination
                  count={finalData?.length === 0 ? 0 : totalPages}
                  page={page}
                  onChange={handleChangePage}
                  className="paginationCard"
                  sx={{
                    '& .MuiPaginationItem-page.Mui-selected': {
                      backgroundColor: '#687F8B',
                      color: 'white',
                    },
                  }}
                />
                <button
                  className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= totalPages ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  disabled={page >= totalPages}
                  onClick={handleNextPage}
                >
                  {PaginationEnum.NEXT}
                </button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default EvaluationCostFilteredMapSideListing;
