import { Box, Grid, Stack } from '@mui/material';
import image1 from '../../../images/list.jpg';
import { useEffect, useState, useRef } from 'react';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import { ListingEnum, PaginationEnum } from '../enum/CompsEnum';
import { useNavigate, useLocation } from 'react-router-dom';
import print from '../../../images/print.svg';
import AiImage from '../../../images/AI SVG.svg';
import { ClearIcon } from '@mui/x-date-pickers';
import axios from 'axios';
import { APIClient } from '@/api/api-client';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import DeleteConfirmationModal from './delete-confirmation';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';
import CompsMapListSide from '@/utils/compsMapListSide';

// Import the global API lock

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
  isLoading?: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  onApiDataUpdate?: any;
  uploadCompsStatus: any;
  disableInternalApiCalls?: boolean; // Disable internal API calls when data is provided externally
  apiMetadata?: any; // API metadata including pagination information
  onPropertyFocus?: (propertyId: number | null) => void; // New prop for property focusing
  onPropertyHover?: (propertyId: number | null) => void; // New prop for property hover
  data?: IComp[] | null; // Override data prop for cluster filtering (allow null)
  isClusterFiltered?: boolean; // Indicates if data is cluster filtered
  clearClusterFilter?: () => void; // Function to clear cluster filter
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  mapZoom?: number; // Current map zoom level
  hasMapDataUpdate?: boolean; // Indicates if data came from map
  onClustersApiUpdate?: (clusters: any[]) => void; // Callback to update clusters on the map
  onZoomChange?: (getCurrentZoom: () => number | null) => void; // Callback to get current zoom from map
  onResetSearch?: () => void; // Callback to reset search input
  selectedIds?: any[]; // Shared selected IDs state
  handleCheckboxToggle?: (id: any) => void; // Shared checkbox toggle function
  clearSelectedIds?: () => void; // Function to clear selected IDs
  onZoomReset?: () => void; // Function to trigger zoom reset
  isClusterTransitioning?: boolean; // Track cluster zoom transitions
  pendingApiCall?: boolean; // Track pending API calls
  lastApiTimestamp?: number; // Track latest API call timestamp
  setLastApiTimestamp?: (timestamp: number) => void;
  isClusterDataLocked?: boolean; // Lock data during cluster transitions
  onDeleteSuccess?: () => void; // Callback after successful deletion
}

interface typeResponse {
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
interface paramsType {
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
    compStatus?: string;
    comp_type?: string;
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

const SideListingMap: React.FC<CompsListingMapProps> = ({
  typeFilter: _typeFilter,
  searchValuesByfilter: _searchValuesByfilter,
  sidebarFilters: _sidebarFilters,
  typeProperty: _typeProperty,
  passGoogleData,
  passSetCheckType,
  sortingSettings: _sortingSettings,
  checkType,
  setCheckType,
  setLoading,
  loading,
  selectedToggleButton,
  page,
  setPage,
  uploadCompsStatus,
  currentBounds,
  currentMapZoom,
  // currentZoom,

  onPropertyFocus,
  onPropertyHover,
  data: externalData, // Renamed to avoid confusion with internal data
  isClusterFiltered = false,
  clearClusterFilter,
  mapBounds, // Current map bounds
  mapZoom, // Current map zoom
  hasMapDataUpdate = false, // Indicates if data came from map
  onClustersApiUpdate,
  onZoomChange,
  compFilters,
  onResetSearch, // Add the callback for resetting search
  selectedIds: externalSelectedIds = [], // Renamed to avoid confusion
  handleCheckboxToggle: externalHandleCheckboxToggle, // External toggle function
  clearSelectedIds, // External clear function
  onZoomReset, // Callback to trigger zoom reset
  setLastApiTimestamp, // Set latest API call timestamp

  apiMetadata, // API metadata including pagination information
  onDeleteSuccess, // Callback after successful deletion
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [page, setPage] = useState(1);
  // Use external selectedIds if provided, otherwise use local state
  const [localSelectedIds, setLocalSelectedIds] = useState<any[]>([]);
  const selectedIds =
    externalSelectedIds.length > 0 ? externalSelectedIds : localSelectedIds;
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();

  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [paginatedOriginalData, setPaginatedOriginalData] = useState<any[]>([]);

  // Track if we have valid navigation state (not from refresh)
  const [hasValidState, setHasValidState] = useState(false);
  const [savedState, setSavedState] = useState<any>(null);
  // Track if user has interacted with map after returning from view page
  const [hasMapInteraction, setHasMapInteraction] = useState(false);
  // Track if user has made filter changes to clear saved filters
  const [hasUserFilterChanges, setHasUserFilterChanges] = useState(false);
  // Track if toggle has been changed to ignore parent filter props
  const [hasToggleChanged, setHasToggleChanged] = useState(false);
  // Track if current API call is triggered by map interaction (zoom/cluster)
  const [isMapTriggered, setIsMapTriggered] = useState(false);
  const [getCurrentZoom] = useState<(() => number | null) | null>(null);
  // Track data loading states similar to Google Map clusters
  const [dataForming, setDataForming] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(''); // Track current search term
  const [allOriginalData, setAllOriginalData] = useState<any[]>([]);
  const [dataReady, setDataReady] = useState(false);

  const [isToggleChanging, setIsToggleChanging] = useState(false); // Track toggle changes
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial component load
  const lastApiParamsRef = useRef<string>(''); // Track last API call to prevent duplicates
  const lastClustersParamsRef = useRef<string>(''); // Track last clusters API call to prevent duplicates
  console.log(allOriginalData, dataReady);
  useEffect(() => {
    const newSearchTerm = _searchValuesByfilter || '';
    if (newSearchTerm !== currentSearchTerm) {
      // Search term changed - request system page reset to 1
      setHasToggleChanged(true);
      requestPage(1, 'system');
      setCurrentSearchTerm(newSearchTerm);
    }
  }, [_searchValuesByfilter, currentSearchTerm]);

  useEffect(() => {
    // Only use location.state if it exists and we haven't processed it yet
    if (location.state && !hasValidState) {
      setSavedState(location.state);
      setHasValidState(true);
      // Start data forming process
      setDataForming(true);
      // Clear existing data to prevent showing old data
      setPaginatedOriginalData([]);
      // Force clusters API update when returning from navigation
      lastClustersParamsRef.current = '';
      // Clear the state to prevent it from persisting on refresh
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, [location.state, hasValidState]);

  // Use saved state only if it was set from navigation (not refresh)
  const finalCompFilters =
    compFilters || (hasValidState ? savedState?.filters : null);
  const finalCurrentBounds =
    currentBounds || (hasValidState ? savedState?.bounds : null);
  const finalCurrentMapZoom =
    currentMapZoom || (hasValidState ? savedState?.zoom : null);

  // Set initial default values in localStorage if they don't exist
  useEffect(() => {
    const initializeDefaults = () => {
      if (!localStorage.getItem('activeType')) {
        localStorage.setItem('activeType', 'building_with_land');
      }
      if (!localStorage.getItem('checkType')) {
        localStorage.setItem('checkType', 'salesCheckbox');
      }
      if (!localStorage.getItem('selectedSize')) {
        localStorage.setItem('selectedSize', 'SF');
      }
    };

    initializeDefaults();
    // Set initial data ready state
    if (!hasValidState) {
      // Initial state setup complete
    }
    // Mark initial load as complete immediately to allow simultaneous rendering
    setIsInitialLoad(false);
  }, [hasValidState]);

  // Debug when externalData changes
  useEffect(() => {}, [externalData]);

  // Pass getCurrentZoom function to parent component
  useEffect(() => {
    if (onZoomChange && getCurrentZoom) {
      onZoomChange(getCurrentZoom);
    }
  }, [onZoomChange, getCurrentZoom]);

  // const [loading,setLoading]=useState<boolean>(false);
  const parameterType =
    checkType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: 'cluster-details-stable', // Use stable key to prevent auto-triggering
    endPoint: 'comps/map-cluster-details',
    requestType: RequestType.POST,
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
      clearSelectedIds();
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
    // ALLOW API CALLS AFTER DELETION - deleteBoolean indicates a delete operation occurred
    const isAfterDeletion = deleteBoolean && deleteBoolean.trim() !== '';

    if (
      isClusterFiltered &&
      externalData &&
      externalData.length > 0 &&
      !isAfterDeletion
    ) {
      return;
    }

    // Only skip API calls for page 1 when we have fresh map data
    // Allow API calls for pagination (page > 1) and after deletion
    if (hasMapDataUpdate && externalData && page === 1 && !isAfterDeletion) {
      return;
    }

    const fetchData = async () => {
      // Use current bounds if user has interacted with map, otherwise use saved bounds
      const bounds = mapBounds || {
        north: 85, // Default world bounds
        south: -85,
        east: 180,
        west: -180,
      };

      const zoom = getCurrentZoom
        ? getCurrentZoom() || 4
        : mapZoom ||
          currentMapZoom ||
          (hasValidState ? finalCurrentMapZoom : 4) ||
          4; // Use same zoom calculation as map-clusters API

      // Always build filters from localStorage to ensure consistency
      // Get filter parameters from localStorage and props
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

      // Build finalFilters with essential defaults always included
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
        search: _searchValuesByfilter || localStorage.getItem('search_term'), // Pass the actual search value
        compStatus: '', // Always include compStatus, even if empty
      } as any;
      // compute effectivePage: prefer user-requested ref, else state
      const effectivePage =
        requestedPageRef.current !== null ? requestedPageRef.current : page;

      const shouldResetToOne = _searchValuesByfilter !== currentSearchTerm;

      // Only add non-empty values from localStorage
      if (buildingMax && buildingMax > 0)
        finalFilters.building_sf_max = buildingMax;
      if (buildingMin && buildingMin > 0)
        finalFilters.building_sf_min = buildingMin;

      // Set cap_rate fields to null if no value, otherwise parse the value
      finalFilters.cap_rate_max =
        capRateMax && capRateMax > 0 ? capRateMax : null;
      finalFilters.cap_rate_min =
        capRateMin && capRateMin > 0 ? capRateMin : null;
      if (cityArray && cityArray.length > 0) finalFilters.city = cityArray;
      if (compStatus && compStatus.trim() !== '')
        finalFilters.compStatus = compStatus;
      if (endDate && endDate.trim() !== '') finalFilters.end_date = endDate;
      if (landMax && landMax > 0) finalFilters.land_sf_max = landMax;
      if (landMin && landMin > 0) finalFilters.land_sf_min = landMin;
      if (leaseType && leaseType.trim() !== '')
        finalFilters.lease_type = leaseType;
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

      // Prepare params for cluster-details API with pagination and all filters
      const params: paramsType = {
        bounds,
        zoom,
        page: shouldResetToOne ? 1 : effectivePage || 1,
        limit: 10,
        filters: finalFilters,
      };

      // Create a hash of the params to prevent duplicate calls
      const paramsHash = JSON.stringify(params);
      if (lastApiParamsRef.current === paramsHash) {
        console.log('🚫 LISTING: Skipping duplicate API call');
        return;
      }
      try {
        lastApiParamsRef.current = paramsHash;
        const apiTimestamp = Date.now();
        if (setLastApiTimestamp) setLastApiTimestamp(apiTimestamp);
        await mutation.mutateAsync(params);

        // success -> clear requested override and user paging flag so future calls use normal state
        requestedPageRef.current = null;
        userIsPagingRef.current = false;
      } catch (error) {
        console.error('Error while mutating data:', error);
        // Reset hash on error to allow retry
        lastApiParamsRef.current = '';
        // keep requestedPageRef/userIsPagingRef if you want retry to use the same page
      }
    };

    fetchData();
  }, [
    // Add page dependency for backend pagination
    parameterType,
    deleteBoolean,
    uploadCompsStatus,
    isClusterFiltered,
    page, // Page changes should trigger new API calls
    mapBounds, // Map bounds changes should trigger new API calls
    mapZoom, // Map zoom changes should trigger new API calls
    hasMapDataUpdate, // Track when map provides new data
    _sortingSettings, // Sort changes should trigger new API calls
    _searchValuesByfilter, // Search changes should trigger new API calls
    _typeFilter, // Status filter changes should trigger new API calls
    _typeProperty, // Property type changes should trigger new API calls
    _sidebarFilters, // Sidebar filter changes should trigger new API calls
    hasToggleChanged, // Toggle changes should trigger new API calls
    isToggleChanging, // Block API calls during toggle changes
    isInitialLoad, // Block API calls during initial load
  ]);

  // Track map interactions
  useEffect(() => {
    if (mapBounds || mapZoom) {
      setHasMapInteraction(true);
      setIsMapTriggered(true);

      // Ask the listing to use page 1 (system origin); the logic above will ignore this
      // if the user clicked a page very recently.
      requestPage(1, 'system');
    }
  }, [mapBounds, mapZoom]); // no page dep needed

  // Reset map triggered flag after API call completes
  useEffect(() => {
    if (!mutation.isLoading && isMapTriggered) {
      setIsMapTriggered(false);
    }
  }, [mutation.isLoading, isMapTriggered]);

  // Track filter changes to clear saved state
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
      (_searchValuesByfilter && _searchValuesByfilter.trim() !== '');

    if (hasFilterUpdates) {
      setHasUserFilterChanges(true);
    }
  }, [_typeFilter, _typeProperty, _sidebarFilters, _searchValuesByfilter]);
  // COMPLETELY DISABLE THIS USEEFFECT DURING CLUSTER OPERATIONS
  // useEffect(() => {
  //   if (isClusterTransitioning || pendingApiCall || isClusterDataLocked) {
  //     return;
  //   }

  useEffect(() => {
    // Validate bounds have all required properties
    const isValidBounds = (bounds: any) =>
      bounds &&
      bounds.north != null &&
      bounds.south != null &&
      bounds.east != null &&
      bounds.west != null;

    // Use current bounds if user has interacted with map, otherwise use saved bounds
    const bounds = hasMapInteraction
      ? isValidBounds(mapBounds)
        ? mapBounds
        : isValidBounds(currentBounds)
          ? currentBounds
          : {
              north: 49.3457868, // US bounds
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
                north: 49.3457868, // US bounds
                south: 24.7433195,
                east: -66.9513812,
                west: -124.7844079,
              };
    const zoom = getCurrentZoom
      ? getCurrentZoom() || 4
      : mapZoom ||
        currentMapZoom ||
        (hasValidState ? finalCurrentMapZoom : 4) ||
        4;

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
        : _sortingSettings?.orderSorting || 'DESC',
      orderByColumn:
        localStorage.getItem('sortingType') ||
        _sortingSettings?.sortingType ||
        'date_sold',
      type: parameterType,
      search: _searchValuesByfilter || localStorage.getItem('search_term'), // Pass the actual search value
      compStatus: '', // Always include compStatus, even if empty
    } as any;

    // Only add non-empty values from localStorage
    if (buildingMax && buildingMax > 0)
      clustersFilters.building_sf_max = buildingMax;
    if (buildingMin && buildingMin > 0)
      clustersFilters.building_sf_min = buildingMin;

    // Set cap_rate fields to null if no value, otherwise parse the value
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
      zoom, // Use getCurrentZoom callback
      filters: clustersFilters,
    };

    // Create a hash of the clusters params to prevent duplicate calls
    const clustersParamsHash = JSON.stringify(clustersParams);
    lastClustersParamsRef.current = clustersParamsHash;

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
        // Reset hash on error to allow retry
        lastClustersParamsRef.current = '';
        if (onClustersApiUpdate) {
          onClustersApiUpdate([]);
        }
      });
  }, [
    parameterType,
    mapBounds,
    mapZoom,
    _sortingSettings,
    _searchValuesByfilter,
    _typeFilter,
    _typeProperty,
    _sidebarFilters,
    deleteBoolean, // Add deleteBoolean to trigger map-clusters API after deletion
    hasToggleChanged, // Toggle changes should trigger map-clusters API
    isToggleChanging, // Block API calls during toggle changes
    isInitialLoad, // Block API calls during initial load
  ]);

  // Debug external data changes
  useEffect(() => {
    // Debug logging removed
  }, [externalData]);

  // Debug paginatedOriginalData changes
  useEffect(() => {
    // Debug logging removed
  }, [paginatedOriginalData]);

  // Update data state when API data changes with delay mechanism
  useEffect(() => {
    const isAfterDeletion = deleteBoolean && deleteBoolean.trim() !== '';

    if (dataForming) {
      // Process data immediately without delay
      // After deletion, always prioritize fresh API data
      if (isAfterDeletion) {
        const backendData = mutation.data?.data.data.properties || [];
        setAllOriginalData(backendData);
        setPaginatedOriginalData(backendData);
      }
      // Use cluster-filtered data if available (from map cluster clicks)
      else if (isClusterFiltered && externalData && externalData.length > 0) {
        setAllOriginalData(externalData || []);
        setPaginatedOriginalData(externalData || []); // Show all external data
      }
      // Use external data from map for page 1 only, API data for other pages
      else if (hasMapDataUpdate && externalData && page === 1) {
        setAllOriginalData(externalData);
        setPaginatedOriginalData(externalData);
      }
      // Use backend API data for all other cases (including pagination)
      else {
        const backendData = mutation.data?.data.data.properties || [];
        setAllOriginalData(backendData);
        setPaginatedOriginalData(backendData); // Backend already provides paginated data
      }

      // Remove delay to allow immediate rendering
      setDataForming(false);
      setDataReady(true);
    } else {
      // Normal data update without delay
      // After deletion, always prioritize fresh API data
      if (isAfterDeletion) {
        const backendData = mutation.data?.data.data.properties || [];
        setAllOriginalData(backendData);
        setPaginatedOriginalData(backendData);
      } else if (isClusterFiltered && externalData && externalData.length > 0) {
        setAllOriginalData(externalData || []);
        setPaginatedOriginalData(externalData || []); // Show all external data
      } else if (hasMapDataUpdate && externalData && page === 1) {
        setAllOriginalData(externalData);
        setPaginatedOriginalData(externalData);
      } else {
        const backendData = mutation.data?.data.data.properties || [];
        setAllOriginalData(backendData);
        setPaginatedOriginalData(backendData); // Backend already provides paginated data
      }
      setDataReady(true);
    }
  }, [
    mutation.data,
    externalData,
    isClusterFiltered,
    page,
    hasMapDataUpdate,
    dataForming,
    deleteBoolean, // Add deleteBoolean to trigger data update after deletion
  ]);

  // Add a useEffect to log when data variable changes
  useEffect(() => {}, [externalData, paginatedOriginalData]);
  // ------- paging guard refs -------
  const requestedPageRef = useRef<number | null>(null); // requested override used by fetch
  const userIsPagingRef = useRef<boolean>(false); // true while user-initiated pagination in-flight
  const lastUserActionTsRef = useRef<number>(0); // timestamp of last user paging action

  // Centralized page requester. origin: 'user' | 'system'
  const requestPage = (
    newPage: number,
    origin: 'user' | 'system' = 'system'
  ) => {
    const pageNum = Math.max(Math.floor(Number(newPage) || 1), 1);

    if (origin === 'user') {
      // mark that user initiated paging (take immediate precedence)
      userIsPagingRef.current = true;
      lastUserActionTsRef.current = Date.now();
      requestedPageRef.current = pageNum;
      setIsMapTriggered(false);
      setPage(pageNum);

      // Fail-safe: clear the user guard after a short timeout so it doesn't hang forever

      return;
    }

    const now = Date.now();
    const delta = now - (lastUserActionTsRef.current || 0);
    const USER_ACTION_GRACE_MS = 800; // tolerate ~800ms race window

    if (delta >= 0 && delta < USER_ACTION_GRACE_MS) {
      console.log(
        `requestPage: system ignored (recent user action ${delta}ms ago) ->`,
        pageNum
      );
      return;
    }

    // Accept system request
    requestedPageRef.current = pageNum;
    setIsMapTriggered(false);
    setPage(pageNum);
  };

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    // synchronous immediate user action
    requestPage(newPage, 'user');
  };

  const handlePreviousPage = () => {
    const newPage = Math.max((typeof page === 'number' ? page : 1) - 1, 1);
    requestPage(newPage, 'user');
  };

  const handleNextPage = () => {
    const newPage = Math.max((typeof page === 'number' ? page : 1) + 1, 1);
    requestPage(newPage, 'user');
  };

  const viewListingItem = (id: number) => {
    let check;
    if (checkType === 'salesCheckbox') {
      check = 'sales';
    } else {
      check = 'lease';
    }

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

    // Get current filter state for back navigation - use saved filters when available, but prioritize localStorage if filters changed
    const hasFilterUpdates =
      (_typeFilter && _typeFilter.trim() !== '') ||
      (_typeProperty && _typeProperty.length > 0) ||
      (_sidebarFilters &&
        Object.keys(_sidebarFilters).some(
          (key) =>
            (_sidebarFilters as any)[key] !== null &&
            (_sidebarFilters as any)[key] !== ''
        )) ||
      (_searchValuesByfilter && _searchValuesByfilter.trim() !== '');

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
            cap_rate_min: localStorage.getItem('cap_rate_min')
              ? parseFloat(
                  localStorage.getItem('cap_rate_min')!.replace(/[%,]/g, '')
                )
              : null,
            cap_rate_max: localStorage.getItem('cap_rate_max')
              ? parseFloat(
                  localStorage.getItem('cap_rate_max')!.replace(/[%,]/g, '')
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
            search: _searchValuesByfilter || '',

            orderBy:
              _sortingSettings?.orderSorting ||
              localStorage.getItem('sortingOrder') ||
              'DESC',
            orderByColumn:
              _sortingSettings?.sortingType ||
              localStorage.getItem('sortingType') ||
              'date_sold',
            type: checkType === 'salesCheckbox' ? 'sale' : 'lease',
          };

    // Use current map bounds with validation, fallback to default world bounds
    const isValidBounds = (bounds: any) =>
      bounds &&
      bounds.north != null &&
      bounds.south != null &&
      bounds.east != null &&
      bounds.west != null;

    const currentBounds = isValidBounds(mapBounds)
      ? mapBounds
      : {
          north: 49.3457868, // US bounds
          south: 24.7433195,
          east: -66.9513812,
          west: -124.7844079,
        };

    const currentZoom =
      mapZoom ||
      currentMapZoom ||
      (hasValidState ? finalCurrentMapZoom : 4) ||
      4;

    navigate(`/comps-view/${id}/${check}`, {
      state: {
        filters: currentFilters,
        bounds: currentBounds,
        zoom: currentZoom,
        selectedToggleButton: selectedToggleButton || null,
        previousPath: window.location.pathname,
        propertyId: id,
        selectedIds: selectedIds,
      },
    });
  };

  const updateListingItem = (id: number) => {
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

    // Get current filter state for back navigation - use saved filters when available, but prioritize localStorage if filters changed
    const hasFilterUpdates =
      (_typeFilter && _typeFilter.trim() !== '') ||
      (_typeProperty && _typeProperty.length > 0) ||
      (_sidebarFilters &&
        Object.keys(_sidebarFilters).some(
          (key) =>
            (_sidebarFilters as any)[key] !== null &&
            (_sidebarFilters as any)[key] !== ''
        )) ||
      (_searchValuesByfilter && _searchValuesByfilter.trim() !== '');

    let currentFilters;
    if (
      finalCompFilters &&
      Object.keys(finalCompFilters).length > 0 &&
      !hasFilterUpdates &&
      !hasUserFilterChanges
    ) {
      // Use saved filters and convert propertyType to array format
      currentFilters = {
        ...finalCompFilters,
        propertyType: Array.isArray(finalCompFilters.propertyType)
          ? finalCompFilters.propertyType
          : finalCompFilters.propertyType
            ? finalCompFilters.propertyType.split(',').filter(Boolean)
            : [],
      };
      // Remove activeType and checkType if they exist
      delete currentFilters.activeType;
      delete currentFilters.checkType;
    } else {
      // Fallback to localStorage
      const propertyTypeString = localStorage.getItem('property_type');
      const propertyTypeArray = propertyTypeString
        ? propertyTypeString.split(',').filter(Boolean)
        : [];

      currentFilters = {
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
          ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
          : null,
        land_sf_max: localStorage.getItem('land_sf_max')
          ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
          : null,
        cap_rate_min: localStorage.getItem('cap_rate_min')
          ? parseFloat(
              localStorage.getItem('cap_rate_min')!.replace(/[%,]/g, '')
            )
          : null,
        cap_rate_max: localStorage.getItem('cap_rate_max')
          ? parseFloat(
              localStorage.getItem('cap_rate_max')!.replace(/[%,]/g, '')
            )
          : null,
        price_sf_min: localStorage.getItem('price_sf_min'),
        price_sf_max: localStorage.getItem('price_sf_max'),
        start_date: localStorage.getItem('start_date'),
        end_date: localStorage.getItem('end_date'),
        state: localStorage.getItem('state'),
        street_address: localStorage.getItem('street_address'),
        compStatus: localStorage.getItem('compStatus'),
        propertyType: propertyTypeArray,
        lease_type: localStorage.getItem('lease_type'),
        city: cityArray,
        land_dimension:
          !localStorage.getItem('selectedSize') ||
          localStorage.getItem('selectedSize') === 'SF'
            ? 'SF'
            : 'ACRE',
        orderBy: _sortingSettings?.orderSorting || 'DESC',
        orderByColumn: _sortingSettings?.sortingType || 'date_sold',
        search: _searchValuesByfilter || '',
        type: checkType === 'salesCheckbox' ? 'sale' : 'lease',
      };
    }

    // Use current map bounds with validation, fallback to US bounds
    const isValidBounds = (bounds: any) =>
      bounds &&
      bounds.north != null &&
      bounds.south != null &&
      bounds.east != null &&
      bounds.west != null;

    const currentBounds = isValidBounds(mapBounds)
      ? mapBounds
      : {
          north: 49.3457868, // US bounds
          south: 24.7433195,
          east: -66.9513812,
          west: -124.7844079,
        };

    const currentZoom =
      mapZoom ||
      currentMapZoom ||
      (hasValidState ? finalCurrentMapZoom : 4) ||
      4;

    navigate(`/update-comps/${id}`, {
      state: {
        filters: currentFilters,
        bounds: currentBounds,
        zoom: currentZoom,
        selectedToggleButton: selectedToggleButton || null,
        previousPath: window.location.pathname,
        propertyId: id,
        selectedIds: selectedIds,
      },
    });
  };

  // const handlePreviousPage = () => {
  //   setIsMapTriggered(false);
  //   setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  // };

  // const handleNextPage = () => {
  //   setIsMapTriggered(false);
  //   setPage((prevPage: any) => Math.max(prevPage + 1, 1));
  // };

  // Show loader only when mutation is loading and no data is available
  const shouldShowLoader =
    mutation.isLoading &&
    !externalData &&
    (!paginatedOriginalData || paginatedOriginalData.length === 0);

  if (shouldShowLoader) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }

  if (mutation.isError) {
    return <>{ListingEnum.ERROR}....</>;
  }

  // Use external data for cluster filtering only
  const hasExternalData =
    isClusterFiltered && Array.isArray(externalData) && externalData.length > 0;

  // Show pagination except for cluster-filtered data
  const shouldShowPagination = !isClusterFiltered;

  // Use backend totalRecord for pagination (whether from map API or listing API)
  const totalItems = hasExternalData
    ? externalData.length // For cluster filtered, use external data length
    : mutation.data?.data.data.totalRecord || apiMetadata?.totalRecord || 0; // Prioritize fresh mutation data over cached apiMetadata

  const data = hasExternalData ? externalData : paginatedOriginalData;

  // When using cluster-filtered data, the map already has the data
  if (!isClusterFiltered) {
    // For backend pagination, pass the current page data to map for clustering
    passGoogleData(paginatedOriginalData);
  }
  const isAllSelected =
    data.every((item) => selectedIds.includes(item.id.toString())) &&
    data.length > 0;

  const handleSelectAll = () => {
    const currentPageIds = data.map((item) => item.id.toString()); // IDs of items on the current page

    if (isAllSelected) {
      // Deselect only the items from the current page
      if (externalHandleCheckboxToggle) {
        // For external state, toggle each item individually
        currentPageIds.forEach((id) => externalHandleCheckboxToggle(id));
      } else {
        setLocalSelectedIds((prevSelectedIds) =>
          prevSelectedIds.filter((id) => !currentPageIds.includes(id))
        );
      }
    } else {
      // Add the current page's IDs to the selected IDs
      if (externalHandleCheckboxToggle) {
        // For external state, toggle each item individually
        currentPageIds.forEach((id) => {
          if (!selectedIds.includes(id)) {
            externalHandleCheckboxToggle(id);
          }
        });
      } else {
        setLocalSelectedIds((prevSelectedIds) => [
          ...prevSelectedIds,
          ...currentPageIds.filter((id) => !prevSelectedIds.includes(id)), // Avoid duplicates
        ]);
      }
    }
  };
  const handleCheckboxToggle = (id: any) => {
    if (externalHandleCheckboxToggle) {
      externalHandleCheckboxToggle(id);
    } else {
      setLocalSelectedIds(
        (prevSelectedIds) =>
          prevSelectedIds.includes(id)
            ? prevSelectedIds.filter((itemId) => itemId !== id) // Remove if already selected
            : [...prevSelectedIds, id] // Add to selection
      );
    }
  };

  const downloadComps = async () => {
    setLoading(true);
    try {
      const payload = {
        compIds: selectedIds, // Ensure selectedIds is an array of valid IDs
        comparison:
          localStorage.getItem('activeType') === 'land_only'
            ? selectedToggleButton
            : 'SF', // Ensure selectedToggleButton holds the correct comparison value
      };

      const response = await axios.post('comps/download-comp-pdf', payload, {
        responseType: 'blob',
      });

      // Create a URL for the downloaded blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Comps.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLoading(false);
      toast.success('Comps downloaded successfully!');
    } catch (error) {
      console.error('Error downloading comps:', error);
      setLoading(false);
      toast.error('Failed to download comps');
    }
  };

  if (loading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }
  const deleteListingItem = (id: number) => {
    setDeleteId(id);
    setModalOpen(true);
  };
  const closeCompsModal1 = () => {
    setModalOpen(false);
  };
  const setArrayAfterDelete = () => {
    // Use timestamp to ensure unique value and trigger useEffect
    setDeleteBoolean(Date.now().toString());
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container>
          <Grid item xs={12} className="bg-silverGray rounded-lg pb-6">
            <Box>
              <Box className="flex justify-between mr-7 py-3.5">
                <Box className="pl-5 text-customBlack text-sm">
                  {isClusterFiltered && (
                    <div className="mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                        Showing {data.length} properties from cluster
                      </span>
                      <button
                        onClick={clearClusterFilter}
                        className="text-blue-600 text-xs underline"
                      >
                        Show all properties
                      </button>
                    </div>
                  )}
                  {data && data.length > 0 ? (
                    <div className="select-text text-lightBlack flex items-center gap-2">
                      <span className="flex flex-wrap 2xl:flex-nowrap items-center gap-2">
                        <label className="comp-select capitalize font-semibold">
                          Select all
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                          />
                          <span className="checkmark"></span>
                        </label>
                        <span
                          className="totalEntry truncate"
                          style={{ fontSize: '12px' }}
                        >
                          Showing{' '}
                          {!isClusterFiltered && !hasExternalData
                            ? (page - 1) * 10 + 1
                            : 1}{' '}
                          to{' '}
                          {!isClusterFiltered && !hasExternalData
                            ? Math.min(page * 10, totalItems)
                            : data.length}{' '}
                          of {totalItems} entries
                        </span>
                      </span>
                    </div>
                  ) : null}
                </Box>
                <Box className="flex gap-2 items-center">
                  {selectedIds.length > 0 ? (
                    <Box className="flex items-center gap-2.5 mr-3">
                      <p className="text-sm">Print({selectedIds.length})</p>
                      <img
                        src={print}
                        className="cursor-pointer"
                        onClick={downloadComps}
                      />
                    </Box>
                  ) : (
                    <Box className="flex items-center gap-2.5 mr-3 opacity-50 cursor-not-allowed">
                      <p className="text-sm text-gray-400">Print</p>
                      <img
                        src={print}
                        className="pointer-events-none"
                        onClick={() => toast.error('Please select Comps')}
                      />
                    </Box>
                  )}

                  <Box className="round flex items-center">
                    <Box className="pl-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={checkType === 'leasesCheckbox'}
                        onChange={handleCheckboxChange}
                        id="leasesCheckbox"
                      />
                      <label htmlFor="leasesCheckbox"></label>{' '}
                      <span className="select-text-content">
                        {ListingEnum.LEASES}{' '}
                      </span>
                    </Box>
                  </Box>
                  <Box className="round">
                    <Box className="pl-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={checkType === 'salesCheckbox'}
                        onChange={handleCheckboxChange}
                        id="salesCheckbox"
                      />
                      <label htmlFor="salesCheckbox"></label>{' '}
                      <span className="select-text-content">
                        {ListingEnum.SALES}
                      </span>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <CompsMapListSide
                data={data}
                image1={image1}
                AiImage={AiImage}
                onPropertyFocus={onPropertyFocus}
                onPropertyHover={onPropertyHover}
                selectedIds={selectedIds}
                handleCheckboxToggle={handleCheckboxToggle}
                viewListingItem={viewListingItem}
                updateListingItem={updateListingItem}
                deleteListingItem={deleteListingItem}
                selectedToggleButton={selectedToggleButton}
                checkType={checkType}
                hidden={false}
                isLoading={false}
              />
              {/* Show pagination when using backend API (not external data from map) or when using cluster-details API */}
              {shouldShowPagination && (
                <Stack direction="row" justifyContent="center" mt={2}>
                  <button
                    className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
                    onClick={handlePreviousPage}
                    disabled={data?.length === 0 || page === 1}
                  >
                    {PaginationEnum.PREVIOUS}
                  </button>
                  <Pagination
                    count={totalItems === 0 ? 0 : Math.ceil(totalItems / 10)}
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
                    className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= Math.ceil(totalItems / 10) ? 'text-gray-400 cursor-not-allowed' : ''}`}
                    disabled={page >= Math.ceil(totalItems / 10)}
                    onClick={handleNextPage}
                  >
                    {PaginationEnum.NEXT}
                  </button>
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>
        {modalOpen ? (
          <CompDeleteModal>
            <div
              className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
              onClick={closeCompsModal1}
            >
              <ClearIcon className="text-3xl" />
            </div>
            <DeleteConfirmationModal
              close={closeCompsModal1}
              deleteId={deleteId}
              setArrayAfterDelete={setArrayAfterDelete}
              onDeleteSuccess={() => {
                // Immediately trigger API calls without waiting for useEffect
                const triggerImmediateRefresh = async () => {
                  // Reset API hashes first
                  lastApiParamsRef.current = '';
                  lastClustersParamsRef.current = '';

                  // Set deleteBoolean to trigger useEffect dependencies
                  setDeleteBoolean(Date.now().toString());

                  // Force immediate re-render
                  setTimeout(() => {
                    // This will trigger both useEffects immediately
                    setDeleteBoolean(Date.now().toString());
                  }, 0);
                };

                triggerImmediateRefresh();

                // Reset page to 1 if current page becomes empty
                if (paginatedOriginalData.length === 1 && page > 1) {
                  requestPage(page - 1, 'system');
                }

                // Clear the deleted item from selected IDs
                if (deleteId) {
                  const deletedIdStr = deleteId.toString();
                  if (
                    externalHandleCheckboxToggle &&
                    selectedIds.includes(deletedIdStr)
                  ) {
                    externalHandleCheckboxToggle(deletedIdStr);
                  } else {
                    setLocalSelectedIds((prev) =>
                      prev.filter((id) => id !== deletedIdStr)
                    );
                  }
                }
                // Call parent onDeleteSuccess callback
                if (onDeleteSuccess) {
                  onDeleteSuccess();
                }
              }}
            />
          </CompDeleteModal>
        ) : null}
      </Box>
    </>
  );
};
export default SideListingMap;
