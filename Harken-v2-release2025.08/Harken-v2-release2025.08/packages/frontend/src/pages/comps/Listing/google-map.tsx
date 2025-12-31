import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { IComp } from '@/components/interface/header-filter';
import { MyContext } from '@/App';
import loadingImage from '../../../images/loading.png';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { APIClient } from '@/api/api-client';
import { debounce } from 'lodash';
import { formatLandType, formatZoningTypes } from '@/utils/commonFunctions';
import { PropertyCard } from '@/components/PropertyCard';
import { toast } from 'react-toastify';
import { parseNumberOrNull } from '@/utils/sanitize';
import Supercluster from 'supercluster';
import {
  ListingEnum,
  BuildingDetailsEnum,
  FilterListingEnum,
  MenuOptionsEnum,
  SortingEnum,
  LocalStorageKeysEnum,
  LocalStorageEnum,
  FieldNamesEnum,
  PayloadFieldsEnum,
  UnitsEnum,
} from '@/pages/comps/enum/CompsEnum';

// Exportable function for formatting prices in abbreviated form (K/M)
export const formatPriceAbbreviated = (
  price: number | null | undefined
): string => {
  if (!price || price === 0 || isNaN(price)) return ListingEnum.NA;
  if (price >= ListingEnum.TEN_LAKH) {
    return `$${(price / ListingEnum.TEN_LAKH).toFixed(1)}M`;
  }
  if (price >= ListingEnum.ONE_THOUSAND) {
    return `$${(price / ListingEnum.ONE_THOUSAND).toFixed(0)}K`;
  }
  return `$${Math.round(price)}`;
};

// Global singleton lock to prevent duplicate API calls
class GlobalApiLock {
  private static instance: GlobalApiLock;
  private isLocked = false;
  private lockId = 0;

  static getInstance(): GlobalApiLock {
    if (!GlobalApiLock.instance) {
      GlobalApiLock.instance = new GlobalApiLock();
    }
    return GlobalApiLock.instance;
  }

  acquire(): number | null {
    if (this.isLocked) {
      return null;
    }
    this.isLocked = true;
    this.lockId++;
    return this.lockId;
  }

  release(lockId: number): void {
    if (this.lockId === lockId) {
      this.isLocked = false;
    }
  }

  isApiLocked(): boolean {
    return this.isLocked;
  }
}

interface SendTypeItem {
  GoogleData: IComp[];
  compFilters?: any;
  currentMapZoom?: any;
  comparisonBasisView?: any; // Add comparisonBasisView prop for evaluation URLs
  currentBounds?: any;

  clustersData?: any[]; // Add clusters data prop
  disableInternalApiCalls?: boolean; // Disable map's internal API calls when parent handles data fetching
  disableInitialApiCall?: boolean; // Disable only the initial automatic API call, allow zoom/pan updates
  selectedToggleButton?: string;
  onMapClustersChange?: (clusters: any[]) => void;
  focusedPropertyId?: number | null;
  onClusterClick?: (properties: IComp[]) => void; // New prop for cluster clicks
  hoveredPropertyId?: number | null; // New prop for hovered property
  onApiDataUpdate?: (
    data: IComp[],
    bounds?: { north: number; south: number; east: number; west: number },
    zoom?: number,
    metadata?: any,
    compFilters?: any,
    isFromClusterTransition?: boolean,
    apiTimestamp?: number
  ) => void;
  onMapStateChange?: (
    getMapState: () => { bounds: any; zoom: number } | null
  ) => void;
  onMapInteraction?: () => void; // New callback for map interactions (zoom, pan, cluster clicks)
  resetZoom?: boolean; // New prop to trigger zoom reset
  isClusterTransitioning?: boolean; // Track cluster zoom transitions
  setIsClusterTransitioning?: (transitioning: boolean) => void;
  pendingApiCall?: boolean; // Track pending API calls
  setPendingApiCall?: (pending: boolean) => void;
  lastApiTimestamp?: number; // Track latest API call timestamp
  setLastApiTimestamp?: (timestamp: number) => void;
  isClusterDataLocked?: boolean; // Lock data during cluster transitions
  setIsClusterDataLocked?: (locked: boolean) => void;
  // Fullscreen functionality
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  forceMapUpdate?: number; // Counter to force map API calls when filters change
  // Enhanced prop for API data update with bounds, zoom, and API metadata
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
    compFilters?: any;
    currentMapZoom?: any;

    currentBounds?: any;

    end_date?: any;
    [key: string]: any; // Allow additional filter properties
  };
  selectedIds?: any[]; // Shared selected IDs state
  handleCheckboxToggle?: (id: any) => void; // Shared checkbox toggle function
  compsLength?: number; // Number of existing comps
  setSelectedIds?: any; // Add setSelectedIds prop for evaluation URLs
  localStorageTrigger?: number; // Trigger for localStorage changes
  disableSinglePropertyClusters?: boolean; // Disable single property clusters
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
  propertyData?: any;
  compFilters?: any;
  currentBounds?: any;
  currentMapZoom?: any;
}

interface ClusterData {
  lat: number;
  lng: number;
  count: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  properties?: IComp[];
  id?: string;
  avgSize?: number;
  avgPricePerSf?: number;
  bounds?: any;
  propertyTypes?: any[];
}

const containerStyle = {
  aspectRatio: '16/9',
};

// Fixed center and zoom for US-centered map
const defaultCenter = {
  lat: 39.5, // US center latitude
  lng: -98.35, // US center longitude
};
const defaultZoom = 4; // Fixed zoom level for US view

const GoogleMapLocationComps: React.FC<SendTypeItem> = ({
  GoogleData,
  clustersData,
  disableInternalApiCalls = false,
  disableInitialApiCall = false,
  selectedToggleButton,
  onMapClustersChange,
  hoveredPropertyId,
  onApiDataUpdate,
  onMapStateChange,
  onMapInteraction,
  filterParams,
  compFilters,
  currentBounds,
  currentMapZoom,
  selectedIds: propSelectedIds = [],
  handleCheckboxToggle,
  compsLength = 0,
  resetZoom = false,
  isClusterTransitioning = false,
  setIsClusterTransitioning,
  pendingApiCall = false,
  setPendingApiCall,
  setLastApiTimestamp,
  isClusterDataLocked = false,
  setIsClusterDataLocked,
  comparisonBasisView,
  setSelectedIds: propSetSelectedIds,
  isFullscreen = false,
  onFullscreenToggle,
  forceMapUpdate = 0,
  localStorageTrigger = 0,
}) => {
  const { isLoaded } = useContext(MyContext);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerData, setMarkerData] = useState<LocationDataItem[]>([]);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [showClusters, setShowClusters] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [googleDataReady, setGoogleDataReady] = useState(false);
  const [clustersForming, setClustersForming] = useState(false);
  const [superclusterInstance, setSuperclusterInstance] =
    useState<Supercluster | null>(null);
  const [superclusterClusters, setSuperclusterClusters] = useState<any[]>([]);
  const [isClusterZoom, setIsClusterZoom] = useState(false);
  const [pendingClusterUpdate, setPendingClusterUpdate] = useState(false);
  const apiCallInProgressRef = useRef(false);
  const [hoveredPriceMarker, setHoveredPriceMarker] = useState<{
    property: IComp;
    position: { lat: number; lng: number };
  } | null>(null);
  const [userMovedAfterLoading, setUserMovedAfterLoading] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const [openPropertyId, setOpenPropertyId] = useState<number | null>(null); // Track which property InfoWindow should stay open
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(
    localStorage.getItem(LocalStorageEnum.SEARCH_TERM) || ''
  ); // Track current search term

  const [requestSequence, setRequestSequence] = useState<number>(0); // Track request sequence to prevent race conditions
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true); // Track if this is initial load vs search update
  const lastClusterClickTime = useRef(0); // Track last cluster click time for debouncing
  const globalApiCallCounter = useRef(0); // Global counter to track API calls
  const globalLock = GlobalApiLock.getInstance();
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [isFromNavigation, setIsFromNavigation] = useState(false); // Track if coming from navigation
  const [isUserInteraction, setIsUserInteraction] = useState(false); // Track user interactions (zoom, cluster clicks)
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // Track if initial load has completed

  // Create refs for dependencies to avoid dependency issues in callBothAPIs
  const filterParamsRef = useRef(filterParams);
  const isClusterTransitioningRef = useRef(isClusterTransitioning);
  const pendingApiCallRef = useRef(pendingApiCall);
  const isClusterDataLockedRef = useRef(isClusterDataLocked);
  console.log(
    filterParamsRef,
    isUserInteraction,
    googleDataReady,
    'done',
    'filterParamsR'
  );
  // Keep filterParams ref updated and track changes with serialized version for actual filter changes
  // const filterParamsStringRef = useRef<string>(''); // Disabled for now
  const previousFilterParamsRef = useRef<any>(null);
  const previousLocalStorageTriggerRef = useRef<number>(0);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Handle map resize when fullscreen state changes
  useEffect(() => {
    if (mapRef.current) {
      // Add a small delay to allow the CSS transition to start
      const timeoutId = setTimeout(() => {
        google.maps.event.trigger(mapRef.current!, 'resize');
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [isFullscreen]);

  useEffect(() => {
    console.log('🔍 FilterParams updated:', {
      page: filterParams?.page,
      search: filterParams?.search,
      comp_type: filterParams?.comp_type,
    });
    filterParamsRef.current = filterParams;
  }, [filterParams]);

  // Update other refs
  useEffect(() => {
    isClusterTransitioningRef.current = isClusterTransitioning;
  }, [isClusterTransitioning]);

  useEffect(() => {
    pendingApiCallRef.current = pendingApiCall;
  }, [pendingApiCall]);

  useEffect(() => {
    isClusterDataLockedRef.current = isClusterDataLocked;
  }, [isClusterDataLocked]);

  // Memoize map options to prevent re-renders
  const mapOptions = useMemo(
    () => ({
      tilt: 0,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DEFAULT,
        position: google.maps.ControlPosition.TOP_LEFT,
      },
      streetViewControl: false,
      zoomControl: false,
      panControl: false, // Disable the pan control (4-directional arrows)
      rotateControl: false, // Disable rotate control
      scaleControl: false, // Disable scale control
      fullscreenControl: false, // Disable default fullscreen control (we have our own)
      scrollwheel: true,
      gestureHandling: 'greedy',
      minZoom: 4,
      maxZoom: 20,
    }),
    []
  );

  // Memoize cluster rendering to prevent blinking on zoom

  // Debug clusters state changes
  useEffect(() => {
    // Clusters state monitoring
  }, [clusters, showClusters, currentZoom]);

  // Reset data states when component mounts or data changes
  useEffect(() => {
    setDataReady(false);
    setGoogleDataReady(false);
  }, []);

  // Reset zoom when resetZoom prop becomes true
  useEffect(() => {
    if (resetZoom && map) {
      map.setZoom(defaultZoom);
      map.setCenter(defaultCenter);
      setCurrentZoom(defaultZoom);
    }
  }, [resetZoom, map]);

  // Update Supercluster clusters when zoom changes
  const updateSuperclusterClusters = useCallback(
    (zoom: number, bounds: google.maps.LatLngBounds) => {
      if (superclusterInstance && bounds) {
        const bbox = [
          bounds.getSouthWest().lng(),
          bounds.getSouthWest().lat(),
          bounds.getNorthEast().lng(),
          bounds.getNorthEast().lat(),
        ] as [number, number, number, number];

        const clusters = superclusterInstance.getClusters(
          bbox,
          Math.floor(zoom)
        );
        setSuperclusterClusters(clusters);
      }
    },
    [superclusterInstance]
  );

  // Detect search term changes and reset clusters immediately
  useEffect(() => {
    // Priority: filterParams (from parent) > localStorage > empty string
    const newSearchTerm =
      filterParams?.search ||
      localStorage.getItem(LocalStorageEnum.SEARCH_TERM) ||
      '';

    if (newSearchTerm !== currentSearchTerm) {
      // Search term changed - immediately clear old clusters

      // Store search term in localStorage for persistence
      if (newSearchTerm.trim() !== '') {
        localStorage.setItem(LocalStorageEnum.SEARCH_TERM, newSearchTerm);
      } else {
        localStorage.removeItem(LocalStorageEnum.SEARCH_TERM);
      }

      // Increment request sequence to invalidate any pending responses
      setRequestSequence((prev) => prev + 1);

      // Only mark as initial load complete if this is an actual search (not empty to empty)
      if (newSearchTerm.trim() !== '' || currentSearchTerm.trim() !== '') {
        setIsInitialLoad(false);
      }

      // Clear old clusters immediately to prevent showing stale data
      setClusters([]);
      setClustersForming(true);
      setDataReady(false);
      setCurrentSearchTerm(newSearchTerm);
    }
  }, [filterParams?.search, currentSearchTerm]);
  useEffect(() => {
    // fetch with filterParams
    console.log(
      'GoogleMap fetch with params:',
      filterParams,
      'forceMapUpdate:',
      forceMapUpdate
    );
    // fetchData(filterParams);
  }, [filterParams, forceMapUpdate]); // <- forceMapUpdate here

  // Initialize Supercluster instance
  const supercluster = useMemo(() => {
    return new Supercluster({
      radius: 40,
      maxZoom: 20, // Increase maxZoom to handle high zoom levels
      minZoom: 0,
      minPoints: 1, // Allow single property clusters at high zoom levels
    });
  }, []);

  // Stabilize cluster data to prevent unnecessary updates
  const stableClustersData = useMemo(
    () => clustersData,
    [JSON.stringify(clustersData)]
  );

  // Update clusters when clustersData prop changes
  useEffect(() => {
    if (stableClustersData && Array.isArray(stableClustersData)) {
      if (stableClustersData.length > 0) {
        // SMOOTH TRANSITION: Don't clear existing clusters immediately
        // Only clear supercluster data as it will be rebuilt
        setSuperclusterClusters([]);
        // Keep clustersForming false to maintain existing cluster visibility
        // setDataReady remains true to keep existing data visible during transition

        // Transform the clusters data to match the expected ClusterData format
        const processedClusters: ClusterData[] = stableClustersData.map(
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
              centerLat = (north + south) / ListingEnum.TWO;
            }
            if ((centerLng === null || isNaN(centerLng)) && cluster.bounds) {
              const east = parseFloat(cluster.bounds.east);
              const west = parseFloat(cluster.bounds.west);
              centerLng = (east + west) / ListingEnum.TWO;
            }

            const finalLat = centerLat ?? ListingEnum.ZERO;
            const finalLng = centerLng ?? ListingEnum.ZERO;

            return {
              lat: finalLat,
              lng: finalLng,
              count: cluster.count || ListingEnum.ZERO,
              avgPrice: parseFloat(cluster.avgPrice) || ListingEnum.ZERO,
              avgSize: parseFloat(cluster.avgSize) || ListingEnum.ZERO,
              avgPricePerSf:
                parseFloat(cluster.avgPricePerSf) || ListingEnum.ZERO,
              minPrice: cluster.minPrice || ListingEnum.ZERO,
              maxPrice: cluster.maxPrice || ListingEnum.ZERO,
              properties: cluster.properties || [],
              id: cluster.id || `cluster_${finalLat}_${finalLng}`,
              bounds: cluster.bounds,
              propertyTypes: cluster.propertyTypes || [],
            } as any;
          }
        );

        // Prepare data for Supercluster
        const points = processedClusters.map((cluster) => ({
          type: 'Feature' as const,
          properties: {
            cluster: false,
            clusterId: cluster.id,
            count: cluster.count,
            avgPrice: cluster.avgPrice,
            avgSize: cluster.avgSize,
            avgPricePerSf: cluster.avgPricePerSf,
            bounds: cluster.bounds,
            properties: cluster.properties,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [cluster.lng, cluster.lat],
          },
        }));

        // Load points into Supercluster
        supercluster.load(points);
        setSuperclusterInstance(supercluster);

        // IMMEDIATE UPDATE: Remove delays for smoother transitions
        // Update clusters immediately without setTimeout to prevent blinking
        setClusters(processedClusters);
        setClustersForming(false);
        setDataReady(true);

        // Clear flags immediately
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
        if (isFromNavigation) {
          setIsFromNavigation(false);
        }

        if (onMapClustersChange) {
          onMapClustersChange(processedClusters);
        }
      } else {
        // Empty clusters array - clear all clusters and set ready immediately (no loader)
        if (!isClusterZoom) {
          setClusters([]);
          setSuperclusterClusters([]);
          setSuperclusterInstance(null);
          setClustersForming(false);
        }
        setDataReady(true);

        if (onMapClustersChange) {
          onMapClustersChange([]);
        }
      }
    } else {
      // No clusters data - set ready immediately (no loader for empty state)
      if (!isClusterZoom) {
        setClusters([]);
        setSuperclusterClusters([]);
        setSuperclusterInstance(null);
        setClustersForming(false);
      }
      setDataReady(true);
    }
  }, [stableClustersData, onMapClustersChange, supercluster]);

  // Initialize Supercluster clusters when map is ready
  useEffect(() => {
    if (map && superclusterInstance && dataReady && !clustersForming) {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      if (bounds && zoom) {
        updateSuperclusterClusters(zoom, bounds);
      }
    }
  }, [
    map,
    superclusterInstance,
    dataReady,
    clustersForming,
    updateSuperclusterClusters,
  ]);

  const property_type = localStorage.getItem(LocalStorageEnum.CHECK_TYPE);
  const navigate = useNavigate();
  const location = useLocation();

  // Get compsLength from location state or localStorage based on URL
  const getCompsLengthFromStorage = () => {
    const pathname = location.pathname;
    if (pathname.includes('evaluation/filter-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_SALES_EVALUATION
      );
    if (pathname.includes('evaluation/filter-cost-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_COST_EVALUATION
      );
    if (pathname.includes('evaluation/filter-lease-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_LEASE_EVALUATION
      );
    if (pathname.includes('evaluation/filter-cap-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_CAP_EVALUATION
      );
    if (pathname.includes('evaluation/filter-multi-family-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_MULTIFAMILY_EVALUATION
      );
    if (pathname.includes('filter-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_SALES_APPRAISAL
      );
    if (pathname.includes('filter-cost-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_COST_APPRAISAL
      );
    if (pathname.includes('filter-lease-comps'))
      return localStorage.getItem(
        LocalStorageKeysEnum.COMPS_LENGTH_LEASE_APPRAISAL
      );
    return localStorage.getItem('compsLengthsalesevaluation'); // default fallback
  };

  const locationCompsLength =
    location.state?.compsLength || getCompsLengthFromStorage();
  const finalCompsLength =
    locationCompsLength || compsLength || ListingEnum.ZERO;
  console.log('🔢 compsLength value:', finalCompsLength);

  const [localSelectedIds, setLocalSelectedIds] = useState<any[]>([]);
  const setSelectedIds = propSetSelectedIds || setLocalSelectedIds;
  const selectedIds = propSelectedIds || localSelectedIds;

  // Detect if we're in evaluation URLs
  const isEvaluationSalesApproach = location.pathname.includes(
    'evaluation/filter-comps'
  );
  const isEvaluationCostApproach = location.pathname.includes(
    'evaluation/filter-cost-comps'
  );
  const isEvaluationLeaseApproach = location.pathname.includes(
    'evaluation/filter-lease-comps'
  );

  const isEvaluationCapApproach = location.pathname.includes(
    'evaluation/filter-cap-comps'
  );
  const isEvaluationMultiFamilyApproach = location.pathname.includes(
    'evaluation/filter-multi-family-comps'
  );
  const isAppraisaleSalesApproach = location.pathname.includes('filter-comps');
  const isAppraisalCostSalesApproach =
    location.pathname.includes('filter-cost-comps');

  const isAppraisalLeaseApproach =
    location.pathname.includes('filter-lease-comps');
  useEffect(() => {
    if (
      location.state?.selectedIds &&
      Array.isArray(location.state.selectedIds)
    ) {
      setSelectedIds(location.state.selectedIds);
    }
  }, [location.state?.selectedIds, setSelectedIds]);

  // Track if we have valid navigation state (not from refresh)
  const [hasValidState, setHasValidState] = useState(false);
  const [savedState, setSavedState] = useState<any>(null);

  useEffect(() => {
    // Only use location.state if it exists and we haven't processed it yet
    if (location.state && !hasValidState) {
      setSavedState(location.state);
      setHasValidState(true);
      // Clear the state to prevent it from persisting on refresh
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, [location.state, hasValidState]);

  // Detect if we're returning from navigation with search state
  useEffect(() => {
    const hasSearchTerm =
      localStorage.getItem(LocalStorageEnum.SEARCH_TERM) &&
      localStorage.getItem(LocalStorageEnum.SEARCH_TERM)!.trim() !== '';
    const hasNavigationState = hasValidState && savedState;
    const isCapApproach = location.pathname.includes(
      'evaluation/filter-cap-comps'
    );
    const isMultiFamilyApproach = location.pathname.includes(
      'evaluation/filter-multi-family-comps'
    );
    const isLeaseApproach = location.pathname.includes(
      'evaluation/filter-lease-comps'
    );
    const isAppraisalSalesFilter = location.pathname.includes(
      'appraisal/sales/filter-sales-comps'
    );
    const isAppraisalLeaseFilter = location.pathname.includes(
      'appraisal/overview/lease/filter-lease-comps'
    );
    const isFilterComps = location.pathname.includes('filter-comps');
    const isFilterCostComps = location.pathname.includes('filter-cost-comps');
    const isFilterLeaseComps = location.pathname.includes('filter-lease-comps');

    // If we have a search term or navigation state, we're not in initial load
    if (
      hasSearchTerm ||
      hasNavigationState ||
      isCapApproach ||
      isMultiFamilyApproach ||
      isLeaseApproach ||
      isAppraisalSalesFilter ||
      isAppraisalLeaseFilter ||
      isFilterComps ||
      isFilterCostComps ||
      isFilterLeaseComps
    ) {
      setIsInitialLoad(false);

      // Set navigation flag for all approach types and filter comps
      if (
        isCapApproach ||
        isMultiFamilyApproach ||
        isLeaseApproach ||
        isAppraisalSalesFilter ||
        isAppraisalLeaseFilter ||
        isFilterComps ||
        isFilterCostComps ||
        isFilterLeaseComps
      ) {
        setIsFromNavigation(true);
      }

      // Only clear clusters if we don't have valid saved state to prevent flash
      if (
        !hasNavigationState &&
        (isCapApproach ||
          isMultiFamilyApproach ||
          isLeaseApproach ||
          isAppraisalSalesFilter ||
          isAppraisalLeaseFilter ||
          isFilterComps ||
          isFilterCostComps ||
          isFilterLeaseComps)
      ) {
        setClusters([]);
        setClustersForming(true);
        setDataReady(false);
      }
    }
  }, [
    localStorage.getItem(LocalStorageEnum.SEARCH_TERM),
    hasValidState,
    savedState,
    location.pathname,
  ]);

  // Use saved state only if it was set from navigation (not refresh)
  const finalCompFilters =
    compFilters || (hasValidState ? savedState?.filters : null);
  const finalCurrentBounds =
    currentBounds || (hasValidState ? savedState?.bounds : null);
  const finalCurrentMapZoom =
    currentMapZoom ||
    (hasValidState && savedState?.zoom && savedState.zoom !== defaultZoom
      ? savedState.zoom
      : null);

  // Restore search term from saved state when returning from navigation
  useEffect(() => {
    if (hasValidState && savedState?.filters?.search) {
      const savedSearchTerm = savedState.filters.search;
      if (savedSearchTerm && savedSearchTerm.trim() !== '') {
        localStorage.setItem(LocalStorageEnum.SEARCH_TERM, savedSearchTerm);
        setCurrentSearchTerm(savedSearchTerm);
        console.log(
          '🔄 Restored search term from saved state:',
          savedSearchTerm
        );
      }
    }
  }, [hasValidState, savedState]);

  // Get URL parameters for evaluation URLs
  const [searchParams] = useSearchParams();

  // Get comparison basis for evaluation URLs - URL parameters take ABSOLUTE priority
  const comparisonBasis = location.state?.comparisonBasis;

  // For evaluation lease approach, ensure URL parameters take absolute priority over everything else
  let finalComparisonBasisView = 'SF'; // default fallback

  if (isEvaluationLeaseApproach) {
    // For lease approach, URL parameter must take absolute priority
    const urlParam = searchParams.get('comparison_basis');
    if (urlParam && urlParam.trim() !== '') {
      finalComparisonBasisView = urlParam;
      console.log(
        '🔍 GoogleMapLocationComps: Using URL parameter for lease approach (absolute priority):',
        urlParam
      );
    } else {
      // Only if no URL param, then use other sources
      finalComparisonBasisView =
        comparisonBasisView ||
        comparisonBasis ||
        location.state?.comparisonBasis ||
        localStorage.getItem(LocalStorageKeysEnum.COMPARISON_BASIS_VIEW) ||
        'SF';
      console.log(
        '🔍 GoogleMapLocationComps: No URL param for lease approach, using fallback:',
        finalComparisonBasisView
      );
    }
  } else {
    // For other evaluation approaches, use existing priority
    finalComparisonBasisView =
      searchParams.get('comparison_basis') ||
      comparisonBasisView ||
      comparisonBasis ||
      location.state?.comparisonBasis ||
      localStorage.getItem(LocalStorageKeysEnum.COMPARISON_BASIS_VIEW) ||
      'SF';
  }

  // Helper function to format price values (abbreviated for clusters)

  // Abbreviated price formatting for price markers
  const formatAbbreviatedPrice = (price: number | null | undefined): string => {
    return formatPriceAbbreviated(price);
  };

  // Format price for display
  // const formatFullPrice = (price: number | null | undefined): string => {
  //   if (!price || price === 0) return ListingEnum.NA;
  //   return '$' + price.toLocaleString('en-US', {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   });
  // };

  // Create price marker with pointer
  const createPriceMarker = (
    price: number | null | undefined,
    isFromListing = false,
    isHovered = false
  ): string => {
    const formattedPrice = formatAbbreviatedPrice(price);
    const backgroundColor = isHovered
      ? '#ffffff'
      : isFromListing
        ? '#ffffff'
        : '#0DA1C7';
    const textColor = isHovered
      ? '#0DA1C7'
      : isFromListing
        ? 'rgb(13, 161, 199)'
        : '#ffffff';
    const borderColor = isHovered
      ? '#0DA1C7'
      : isFromListing
        ? 'rgb(13, 161, 199)'
        : '#ffffff';
    const fontSize = 12;
    const padding = 8;
    const borderRadius = 4;

    // Calculate text width (approximate) - add extra padding for thicker border
    const extraPadding = isFromListing ? ListingEnum.FOUR : ListingEnum.ZERO;
    const textWidth = Math.max(
      60,
      formattedPrice.length * ListingEnum.SEVEN +
        padding * ListingEnum.TWO +
        extraPadding
    );
    const rectHeight = 24;
    const totalHeight = rectHeight; // Remove pointer height

    const iconSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${textWidth}" height="${totalHeight}" viewBox="0 0 ${textWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Invisible clickable area covering entire marker -->
        <rect x="0" y="0" width="${textWidth}" height="${totalHeight}" fill="transparent" stroke="none" pointer-events="all"/>
        <!-- Main rectangle (square box only) -->
        <rect x="${isFromListing ? '1' : '0.5'}" y="${isFromListing ? '1' : '0.5'}" width="${textWidth - (isFromListing ? 2 : 1)}" height="${rectHeight - (isFromListing ? 2 : 1)}" rx="${borderRadius}" ry="${borderRadius}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${isFromListing ? '2' : '1'}" pointer-events="all"/>
        <!-- Price text -->
        <text x="${textWidth / 2}" y="${rectHeight / 2}" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" dominant-baseline="middle" pointer-events="all">
          ${formattedPrice}
        </text>
      </svg>
    `)}`;

    return iconSvg;
  };

  // Helper function to get proper filters for API calls (same logic as callBothAPIs)
  const getProperFilters = useCallback(() => {
    // Helper function to parse numbers with commas correctly
    const parseNumberWithCommas = (value: string | null): number | null => {
      if (!value || value.trim() === '') return null;
      const cleaned = value.replace(/,/g, ''); // Remove commas
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) || parsed <= ListingEnum.ZERO ? null : parsed;
    };

    // Get filter parameters from localStorage
    const buildingMin = localStorage.getItem(LocalStorageEnum.BUILDING_SF_MIN);
    const buildingMax = localStorage.getItem(LocalStorageEnum.BUILDING_SF_MAX);

    const landMin = localStorage.getItem(LocalStorageEnum.LAND_SF_MIN);
    const landMax = localStorage.getItem(LocalStorageEnum.LAND_SF_MAX);

    const capRateMin = localStorage.getItem(LocalStorageEnum.CAP_RATE_MIN);
    const capRateMax = localStorage.getItem(LocalStorageEnum.CAP_RATE_MAX);

    const priceSfMin = localStorage.getItem(LocalStorageEnum.PRICE_SF_MIN);
    const priceSfMax = localStorage.getItem(LocalStorageEnum.PRICE_SF_MAX);

    const squareFootageMin = localStorage.getItem(
      LocalStorageEnum.SQUARE_FOOTAGE_MIN
    );
    const squareFootageMax = localStorage.getItem(
      LocalStorageEnum.SQUARE_FOOTAGE_MAX
    );

    const startDate = localStorage.getItem(LocalStorageEnum.START_DATE);
    const endDate = localStorage.getItem(LocalStorageEnum.END_DATE);

    const state = localStorage.getItem(LocalStorageEnum.STATE);
    const streetAddress = localStorage.getItem(LocalStorageEnum.STREET_ADDRESS);

    const compStatus = localStorage.getItem(LocalStorageEnum.COMP_STATUS);

    const propertyType = localStorage.getItem(LocalStorageEnum.PROPERTY_TYPE);
    const leaseType = localStorage.getItem(LocalStorageEnum.LEASE_TYPE);

    const selectedCities = localStorage.getItem(
      LocalStorageEnum.SELECTED_CITIES
    );

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

    // Return filters object structure with forced defaults
    const filtersObject: any = {
      comp_type: isEvaluationCostApproach
        ? MenuOptionsEnum.LAND_ONLY
        : localStorage.getItem(LocalStorageKeysEnum.ACTIVE_TYPE) ===
            MenuOptionsEnum.LAND_ONLY
          ? MenuOptionsEnum.LAND_ONLY
          : MenuOptionsEnum.BUILDING_WITH_LAND,
      land_dimension: UnitsEnum.SF,
      orderBy: filterParamsRef.current?.orderBy || FilterListingEnum.DESC,
      orderByColumn:
        filterParamsRef.current?.orderByColumn || FilterListingEnum.DATE_SOLD,
      type:
        isEvaluationLeaseApproach ||
        isAppraisalLeaseApproach ||
        localStorage.getItem(LocalStorageEnum.CHECK_TYPE) ===
          LocalStorageEnum.LEASES_CHECKBOX
          ? PayloadFieldsEnum.LEASE
          : PayloadFieldsEnum.SALE,
    };

    // Only add comparison_basis if URL is not /comps and not filter-cost-comps and comp_type is not land_only
    if (
      location.pathname !== '/comps' &&
      !location.pathname.includes('filter-cost-comps') &&
      filtersObject.comp_type !== MenuOptionsEnum.LAND_ONLY
    ) {
      filtersObject.comparison_basis = finalComparisonBasisView;
    }

    // Only add non-null, non-empty values
    const parsedBuildingMax = parseNumberWithCommas(buildingMax);
    if (parsedBuildingMax) filtersObject.building_sf_max = parsedBuildingMax;
    const parsedBuildingMin = parseNumberWithCommas(buildingMin);
    if (parsedBuildingMin) filtersObject.building_sf_min = parsedBuildingMin;

    filtersObject.cap_rate_max = parseNumberWithCommas(capRateMax);
    filtersObject.cap_rate_min = parseNumberWithCommas(capRateMin);
    if (cityArray.length > 0) filtersObject.city = cityArray;
    if (compStatus && compStatus.trim() !== '')
      filtersObject.compStatus = compStatus;
    if (endDate && endDate.trim() !== '') filtersObject.end_date = endDate;
    const parsedLandMax = parseNumberWithCommas(landMax);
    if (parsedLandMax) filtersObject.land_sf_max = parsedLandMax;
    const parsedLandMin = parseNumberWithCommas(landMin);
    if (parsedLandMin) filtersObject.land_sf_min = parsedLandMin;
    if (leaseType && leaseType.trim() !== '')
      filtersObject.lease_type = leaseType;
    const parsedPriceSfMax = parseNumberWithCommas(priceSfMax);
    if (parsedPriceSfMax) filtersObject.price_sf_max = parsedPriceSfMax;
    const parsedPriceSfMin = parseNumberWithCommas(priceSfMin);
    if (parsedPriceSfMin) filtersObject.price_sf_min = parsedPriceSfMin;
    if (propertyTypeArray && propertyTypeArray.length > ListingEnum.ZERO)
      filtersObject.propertyType = propertyTypeArray;

    // Get search value from localStorage
    const searchValue = localStorage.getItem(LocalStorageEnum.SEARCH_TERM);
    if (searchValue && searchValue.trim() !== '') {
      filtersObject.search = searchValue;
    }
    const parsedSquareFootageMax = parseNumberWithCommas(squareFootageMax);
    if (parsedSquareFootageMax)
      filtersObject.square_footage_max = parsedSquareFootageMax;
    const parsedSquareFootageMin = parseNumberWithCommas(squareFootageMin);
    if (parsedSquareFootageMin)
      filtersObject.square_footage_min = parsedSquareFootageMin;
    if (startDate && startDate.trim() !== '')
      filtersObject.start_date = startDate;
    if (state && state.trim() !== '') filtersObject.state = state;
    if (streetAddress && streetAddress.trim() !== '')
      filtersObject.street_address = streetAddress;

    // Ensure minimum required fields are always present
    if (Object.keys(filtersObject).length <= 5) {
      console.log(
        '⚠️ getProperFilters() returning minimal object, adding defaults'
      );
      filtersObject.comp_type =
        filtersObject.comp_type || MenuOptionsEnum.BUILDING_WITH_LAND;
      filtersObject.land_dimension = UnitsEnum.SF;
      filtersObject.type = filtersObject.type || PayloadFieldsEnum.SALE;
      filtersObject.orderBy = FilterListingEnum.DESC;
      filtersObject.orderByColumn = FilterListingEnum.DATE_SOLD;
    }

    console.log('🔍 getProperFilters() result:', filtersObject);
    return filtersObject;
  }, [
    location.pathname,
    finalComparisonBasisView,
    isEvaluationCostApproach,
    isEvaluationLeaseApproach,
    isAppraisalLeaseApproach,
  ]);

  // Create cluster tooltip content

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

  const propertyIdFromUrl = searchParams.get('id');
  const approachIdFromUrl = searchParams.get('approachId');
  const selectedIdsRef = useRef(selectedIds);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);
  const viewListingItem = (id: number) => {
    let check;
    if (property_type === 'salesCheckbox' || !property_type) {
      check = LocalStorageKeysEnum.SALES;
    } else {
      check = 'lease';
    }

    // Capture exact map state with delay to ensure accuracy
    if (map) {
      setTimeout(() => {
        const currentBounds = map.getBounds();
        const currentZoomLevel = map.getZoom();

        if (currentBounds && currentZoomLevel) {
          // Parse selectedCities from localStorage
          let cityArray = [];
          const selectedCitiesString = localStorage.getItem(
            LocalStorageEnum.SELECTED_CITIES
          );
          if (selectedCitiesString) {
            try {
              cityArray = JSON.parse(selectedCitiesString);
            } catch (e) {
              console.warn('Failed to parse selectedCities:', e);
            }
          }

          // Get current filter state for back navigation
          const currentFilters = {
            ...filterParams,
            building_sf_min: parseNumberOrNull('building_sf_min'),
            ...(location.pathname !== '/comps' &&
              !location.pathname.includes('filter-cost-comps') && {
                comparison_basis:
                  finalComparisonBasisView ||
                  localStorage.getItem(
                    LocalStorageKeysEnum.COMPARISON_BASIS_VIEW
                  ) ||
                  filterParams?.comparison_basis,
              }),
            building_sf_max: parseNumberOrNull(
              LocalStorageEnum.BUILDING_SF_MAX
            ),
            land_sf_min: parseNumberOrNull(LocalStorageEnum.LAND_SF_MIN),
            land_sf_max: parseNumberOrNull(LocalStorageEnum.LAND_SF_MAX),

            cap_rate_min:
              parseNumberOrNull(LocalStorageEnum.CAP_RATE_MIN) || null,
            cap_rate_max:
              parseNumberOrNull(LocalStorageEnum.CAP_RATE_MAX) || null,

            city: cityArray,

            price_sf_min: parseNumberOrNull(LocalStorageEnum.PRICE_SF_MIN),
            price_sf_max: parseNumberOrNull(LocalStorageEnum.PRICE_SF_MAX),

            square_footage_max: parseNumberOrNull(
              LocalStorageEnum.SQUARE_FOOTAGE_MAX
            ),
            square_footage_min: parseNumberOrNull(
              LocalStorageEnum.SQUARE_FOOTAGE_MIN
            ),

            start_date: localStorage.getItem(LocalStorageEnum.START_DATE),
            end_date: localStorage.getItem(LocalStorageEnum.END_DATE),

            state: localStorage.getItem(LocalStorageEnum.STATE),

            street_address: localStorage.getItem(
              LocalStorageEnum.STREET_ADDRESS
            ),

            compStatus: localStorage.getItem(LocalStorageEnum.COMP_STATUS),

            propertyType: localStorage.getItem(LocalStorageEnum.PROPERTY_TYPE),

            lease_type: localStorage.getItem(LocalStorageEnum.LEASE_TYPE),

            land_dimension:
              !localStorage.getItem(LocalStorageEnum.SELECTED_SIZE) ||
              localStorage.getItem(LocalStorageEnum.SELECTED_SIZE) ===
                UnitsEnum.SF
                ? UnitsEnum.SF
                : UnitsEnum.ACRE,

            // Ensure search term is included in saved state
            search:
              filterParams?.search ||
              localStorage.getItem(LocalStorageEnum.SEARCH_TERM) ||
              '',
          };

          const exactMapState = {
            filters: currentFilters,
            previousPath: location.pathname,
            propertyId: propertyIdFromUrl,
            approachId: approachIdFromUrl,
            selectedIds: selectedIdsRef.current,
            bounds: {
              north: currentBounds.getNorthEast().lat(),
              south: currentBounds.getSouthWest().lat(),
              east: currentBounds.getNorthEast().lng(),
              west: currentBounds.getSouthWest().lng(),
            },
            zoom: currentZoomLevel,
          };

          let viewPath;
          if (isEvaluationSalesApproach) {
            viewPath = `/evaluation/sales-comps-view/${id}/${check}`;
          } else if (isEvaluationCostApproach) {
            viewPath = `/evaluation/cost-comps-view/${id}/${check}`;
          } else if (isEvaluationLeaseApproach) {
            viewPath = `/evaluation/lease-comps-view/${id}/${check}`;
          } else if (isEvaluationCapApproach) {
            viewPath = `/evaluation/cap-comps-view/${id}/${check}`;
          } else if (isEvaluationMultiFamilyApproach) {
            viewPath = `/evaluation/multi-family-comps-view/${id}/${check}`;
          } else if (isAppraisaleSalesApproach) {
            viewPath = `/sales-comps-view/${id}/${check}`;
          } else if (isAppraisalCostSalesApproach) {
            viewPath = `/cost-comps-view/${id}/${check}`;
          } else if (isAppraisalLeaseApproach) {
            viewPath = `/lease-comps-view/${id}/${check}`;
          } else {
            viewPath = `/comps-view/${id}/${check}`;
          }

          navigate(viewPath, {
            state: exactMapState,
          });
        } else {
          // Fallback if bounds/zoom not available
          navigate(`/comps-view/${id}/${check}`);
        }
      }, 50); // Small delay to capture final map state
    } else {
      // Fallback if map not available
      navigate(`/comps-view/${id}/${check}`);
    }
  };
  const updateListingItem = (id: number) => {
    // Capture exact map state with delay to ensure accuracy
    if (map) {
      setTimeout(() => {
        const currentBounds = map.getBounds();
        const currentZoomLevel = map.getZoom();

        if (currentBounds && currentZoomLevel) {
          // Parse selectedCities from localStorage
          let cityArray = [];
          const selectedCitiesString = localStorage.getItem(
            LocalStorageEnum.SELECTED_CITIES
          );
          if (selectedCitiesString) {
            try {
              cityArray = JSON.parse(selectedCitiesString);
            } catch (e) {
              console.warn('Failed to parse selectedCities:', e);
            }
          }

          // Get current filter state for back navigation
          const currentFilters = {
            ...filterParams,
            building_sf_min: parseNumberOrNull('building_sf_min'),
            ...(location.pathname !== '/comps' &&
              !location.pathname.includes('filter-cost-comps') && {
                comparison_basis:
                  searchParams.get('comparison_basis') ||
                  finalComparisonBasisView ||
                  filterParams?.comparison_basis,
              }),
            building_sf_max: parseNumberOrNull(
              LocalStorageEnum.BUILDING_SF_MAX
            ),
            land_sf_min: parseNumberOrNull(LocalStorageEnum.LAND_SF_MIN),
            land_sf_max: parseNumberOrNull(LocalStorageEnum.LAND_SF_MAX),

            cap_rate_min:
              parseNumberOrNull(LocalStorageEnum.CAP_RATE_MIN) || null,
            cap_rate_max:
              parseNumberOrNull(LocalStorageEnum.CAP_RATE_MAX) || null,

            city: cityArray,

            price_sf_min: parseNumberOrNull(LocalStorageEnum.PRICE_SF_MIN),
            price_sf_max: parseNumberOrNull(LocalStorageEnum.PRICE_SF_MAX),

            square_footage_max: parseNumberOrNull(
              LocalStorageEnum.SQUARE_FOOTAGE_MAX
            ),
            square_footage_min: parseNumberOrNull(
              LocalStorageEnum.SQUARE_FOOTAGE_MIN
            ),

            start_date: localStorage.getItem(LocalStorageEnum.START_DATE),
            end_date: localStorage.getItem(LocalStorageEnum.END_DATE),

            state: localStorage.getItem(LocalStorageEnum.STATE),
            street_address: localStorage.getItem(
              LocalStorageEnum.STREET_ADDRESS
            ),

            compStatus: localStorage.getItem(LocalStorageEnum.COMP_STATUS),

            propertyType: localStorage.getItem(LocalStorageEnum.PROPERTY_TYPE),
            lease_type: localStorage.getItem(LocalStorageEnum.LEASE_TYPE),

            land_dimension:
              !localStorage.getItem(LocalStorageEnum.SELECTED_SIZE) ||
              localStorage.getItem(LocalStorageEnum.SELECTED_SIZE) ===
                UnitsEnum.SF
                ? UnitsEnum.SF
                : UnitsEnum.ACRE,
            // Ensure search term is included in saved state
            search:
              filterParams?.search ||
              localStorage.getItem(LocalStorageEnum.SEARCH_TERM) ||
              '',
          };

          const exactMapState = {
            filters: currentFilters,
            previousPath: location.pathname,
            propertyId: id,
            selectedIds: selectedIdsRef.current,

            approachId:
              filterParams?.approachId ||
              localStorage.getItem(LocalStorageEnum.APPROACH_ID),
            bounds: {
              north: currentBounds.getNorthEast().lat(),
              south: currentBounds.getSouthWest().lat(),
              east: currentBounds.getNorthEast().lng(),
              west: currentBounds.getSouthWest().lng(),
            },
            zoom: currentZoomLevel,
          };

          navigate(`/update-comps/${id}`, {
            state: exactMapState,
          });
        } else {
          // Fallback if bounds/zoom not available
          navigate(`/update-comps/${id}`);
        }
      }, 50); // Small delay to capture final map state
    } else {
      // Fallback if map not available
      navigate(`/update-comps/${id}`);
    }
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
        const isValid =
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat !== ListingEnum.ZERO &&
          lng !== ListingEnum.ZERO;
        if (!isValid) {
        }
        return isValid;
      });

      if (validData.length === ListingEnum.ZERO) {
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
            .filter((p) => p && p > ListingEnum.ZERO);

          const avgPrice =
            prices.length > ListingEnum.ZERO
              ? prices.reduce((sum, price) => sum + price, ListingEnum.ZERO) /
                prices.length
              : ListingEnum.ZERO;

          const minPrice =
            prices.length > ListingEnum.ZERO
              ? Math.min(...prices)
              : ListingEnum.ZERO;
          const maxPrice =
            prices.length > ListingEnum.ZERO
              ? Math.max(...prices)
              : ListingEnum.ZERO;

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

  // API call for both cluster-details and clusters endpoints with current map bounds
  const callBothAPIs = useCallback(
    async (map: google.maps.Map, useWorldBounds = false) => {
      if (!map) {
        return;
      }

      console.log('🔧 API CALL DEBUG: Starting callBothAPIs', {
        useWorldBounds,
        mapZoom: map.getZoom(),
        defaultZoom,
        timestamp: Date.now(),
      });

      // GLOBAL LOCK - Prevent any API calls from any component
      const lockId = globalLock.acquire();
      if (lockId === null) {
        return;
      }

      // Set local flags
      apiCallInProgressRef.current = true;
      const currentCallId = ++globalApiCallCounter.current;

      let north, south, east, west, zoom;

      if (useWorldBounds) {
        // Use saved state values if available, otherwise use world bounds
        if (
          finalCurrentBounds &&
          finalCurrentMapZoom &&
          finalCurrentBounds.north &&
          finalCurrentBounds.south &&
          finalCurrentBounds.east &&
          finalCurrentBounds.west
        ) {
          north = finalCurrentBounds.north;
          south = finalCurrentBounds.south;
          east = finalCurrentBounds.east;
          west = finalCurrentBounds.west;
          zoom = finalCurrentMapZoom;
        } else {
          // Fallback to US bounds
          north = 49.3457868;
          south = 24.7433195;
          east = -66.9513812;
          west = -124.7844079;
          zoom = defaultZoom;
        }
      } else {
        // Use current map bounds for zoom changes
        const bounds = map.getBounds();
        zoom = map.getZoom() || defaultZoom;

        console.log('🔧 ZOOM DEBUG: Using current map zoom', {
          mapGetZoom: map.getZoom(),
          defaultZoom,
          finalZoom: zoom,
          useWorldBounds,
        });

        if (!bounds) {
          return;
        }

        north = bounds.getNorthEast().lat();
        south = bounds.getSouthWest().lat();
        east = bounds.getNorthEast().lng();
        west = bounds.getSouthWest().lng();
      }

      try {
        // Helper function to parse numbers with commas correctly
        // Fixes issue where comma-separated numbers like "1,000" would be parsed as "1"
        // when using parseInt() or parseFloat() directly
        const parseNumberWithCommas = (value: string | null): number | null => {
          if (!value || value.trim() === '') return null;
          const cleaned = value.replace(/,/g, ''); // Remove commas
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) || parsed <= ListingEnum.ZERO ? null : parsed;
        };

        // Get URL-based parameters based on the current location
        const getUrlBasedParams = () => {
          // IMPORTANT: Get filter parameters from localStorage ONLY - don't fall back to filterParams
          // When Sales/Leases toggle happens, ClearAdditionalStorage() clears localStorage
          // but filterParams still contains old values, causing incorrect API calls
          // We must respect localStorage clearing and not use stale filterParams values
          const buildingMin = localStorage.getItem(
            LocalStorageEnum.BUILDING_SF_MIN
          );
          const buildingMax = localStorage.getItem(
            LocalStorageEnum.BUILDING_SF_MAX
          );

          const landMin = localStorage.getItem(LocalStorageEnum.LAND_SF_MIN);
          const landMax = localStorage.getItem(LocalStorageEnum.LAND_SF_MAX);

          const capRateMin = localStorage.getItem(
            LocalStorageEnum.CAP_RATE_MIN
          );
          const capRateMax = localStorage.getItem(
            LocalStorageEnum.CAP_RATE_MAX
          );

          const priceSfMin = localStorage.getItem(
            LocalStorageEnum.PRICE_SF_MIN
          );
          const priceSfMax = localStorage.getItem(
            LocalStorageEnum.PRICE_SF_MAX
          );

          const squareFootageMin = localStorage.getItem(
            LocalStorageEnum.SQUARE_FOOTAGE_MIN
          );
          const squareFootageMax = localStorage.getItem(
            LocalStorageEnum.SQUARE_FOOTAGE_MAX
          );

          const startDate = localStorage.getItem(LocalStorageEnum.START_DATE);
          const endDate = localStorage.getItem(LocalStorageEnum.END_DATE);

          const state = localStorage.getItem(LocalStorageEnum.STATE);
          const streetAddress = localStorage.getItem(
            LocalStorageEnum.STREET_ADDRESS
          );

          const compStatus = localStorage.getItem(LocalStorageEnum.COMP_STATUS);

          const propertyType = localStorage.getItem(
            LocalStorageEnum.PROPERTY_TYPE
          );
          const leaseType = localStorage.getItem(LocalStorageEnum.LEASE_TYPE);

          const selectedCities = localStorage.getItem(
            LocalStorageEnum.SELECTED_CITIES
          );

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

          // URL-specific comparison_basis parameter for evaluation URLs
          let comparison_basis = 'SF'; // Default value

          if (
            isEvaluationSalesApproach ||
            isEvaluationLeaseApproach ||
            isEvaluationCapApproach ||
            isAppraisalLeaseApproach ||
            isAppraisaleSalesApproach
          ) {
            // Always use the finalComparisonBasisView which already has proper priority logic
            comparison_basis = finalComparisonBasisView;
            console.log(
              '🔍 GoogleMapLocationComps API: Using finalComparisonBasisView for evaluation approach:',
              {
                finalComparisonBasisView,
                comparison_basis,
                isEvaluationLeaseApproach,
                urlParam: searchParams.get('comparison_basis'),
                comparisonBasisViewProp: comparisonBasisView,
                pathname: location.pathname,
              }
            );
          } else if (isEvaluationMultiFamilyApproach) {
            // Use the finalComparisonBasisView which already has proper priority logic
            comparison_basis = finalComparisonBasisView;
          } else {
            const currentPath = location.pathname;
            if (currentPath.includes('evaluation/filter-lease-comps')) {
              comparison_basis =
                searchParams.get('comparison_basis') ||
                filterParamsRef.current?.comparison_basis ||
                BuildingDetailsEnum.SF;
            } else if (currentPath.includes('evaluation/filter-comps')) {
              comparison_basis =
                searchParams.get('comparison_basis') ||
                filterParamsRef.current?.comparison_basis ||
                BuildingDetailsEnum.SF;
            } else if (currentPath.includes('evaluation/filter-cost-comps')) {
              comparison_basis = BuildingDetailsEnum.SF;
            } else if (currentPath.includes('evaluation/filter-cap-comps')) {
              const activeType = localStorage.getItem('activeType');
              comparison_basis =
                activeType === 'land_only'
                  ? BuildingDetailsEnum.SF
                  : searchParams.get('comparison_basis') ||
                    filterParamsRef.current?.comparison_basis ||
                    BuildingDetailsEnum.SF;
            } else if (
              currentPath.includes('evaluation/filter-multi-family-comps')
            ) {
              // Use the finalComparisonBasisView which already has proper priority logic
              comparison_basis = finalComparisonBasisView;
            } else {
              comparison_basis =
                searchParams.get('comparison_basis') ||
                filterParamsRef.current?.comparison_basis ||
                BuildingDetailsEnum.SF;
            }
          }

          // Return filters object structure with forced defaults - remove null/empty values
          const filtersObject: any = {
            comp_type: isEvaluationCostApproach
              ? MenuOptionsEnum.LAND_ONLY // Cost approach always uses land_only
              : localStorage.getItem(LocalStorageKeysEnum.ACTIVE_TYPE) === MenuOptionsEnum.LAND_ONLY
                ? MenuOptionsEnum.LAND_ONLY
                : MenuOptionsEnum.BUILDING_WITH_LAND, // Always set default
            land_dimension: BuildingDetailsEnum.SF, // Always set default
            orderBy: filterParamsRef.current?.orderBy || SortingEnum.DESC, // Use filterParams first, then default
            orderByColumn:
              filterParamsRef.current?.orderByColumn || FieldNamesEnum.DATE_SOLD, // Use filterParams first, then default
            type:
              isEvaluationLeaseApproach ||
              isAppraisalLeaseApproach ||
              localStorage.getItem(LocalStorageEnum.CHECK_TYPE) === LocalStorageEnum.LEASES_CHECKBOX
                ? PayloadFieldsEnum.LEASE
                : PayloadFieldsEnum.SALE, // Use lease for lease approach
          };

          // Only add comparison_basis if URL is not /comps and not filter-cost-comps and comp_type is not land_only
          // Cost comps and land_only don't use comparison_basis parameter in API calls
          if (
            location.pathname !== '/comps' &&
            !location.pathname.includes('filter-cost-comps') &&
            filtersObject.comp_type !== MenuOptionsEnum.LAND_ONLY
          ) {
            filtersObject.comparison_basis = comparison_basis;
            console.log(
              '🔍 GoogleMapLocationComps: Setting comparison_basis in API call:',
              {
                comparison_basis,
                pathname: location.pathname,
                isEvaluationLeaseApproach,
                finalComparisonBasisView,
                comp_type: filtersObject.comp_type,
              }
            );
          }

          // Only add non-null, non-empty values to avoid sending empty filters
          const parsedBuildingMax = parseNumberWithCommas(buildingMax);
          if (parsedBuildingMax)
            filtersObject.building_sf_max = parsedBuildingMax;
          const parsedBuildingMin = parseNumberWithCommas(buildingMin);
          if (parsedBuildingMin)
            filtersObject.building_sf_min = parsedBuildingMin;

          // Set cap_rate fields to null if no value, otherwise parse the value
          filtersObject.cap_rate_max = parseNumberWithCommas(capRateMax);
          filtersObject.cap_rate_min = parseNumberWithCommas(capRateMin);
          if (cityArray.length > ListingEnum.ZERO) filtersObject.city = cityArray;
          if (compStatus && compStatus.trim() !== '')
            filtersObject.compStatus = compStatus;
          if (endDate && endDate.trim() !== '')
            filtersObject.end_date = endDate;
          const parsedLandMax = parseNumberWithCommas(landMax);
          if (parsedLandMax) filtersObject.land_sf_max = parsedLandMax;
          const parsedLandMin = parseNumberWithCommas(landMin);
          if (parsedLandMin) filtersObject.land_sf_min = parsedLandMin;
          if (leaseType && leaseType.trim() !== '')
            filtersObject.lease_type = leaseType;
          const parsedPriceSfMax = parseNumberWithCommas(priceSfMax);
          if (parsedPriceSfMax) filtersObject.price_sf_max = parsedPriceSfMax;
          const parsedPriceSfMin = parseNumberWithCommas(priceSfMin);
          if (parsedPriceSfMin) filtersObject.price_sf_min = parsedPriceSfMin;
          if (propertyTypeArray && propertyTypeArray.length > ListingEnum.ZERO)
            filtersObject.propertyType = propertyTypeArray;

          // Get search value from multiple sources with priority
          // Priority: filterParams (from parent) > localStorage > empty string
          const searchValue = localStorage.getItem(
            LocalStorageEnum.SEARCH_TERM
          );

          console.log('🔍 Search value in API call:', {
            filterParamsSearch: filterParamsRef.current?.search,
            localStorageSearch: localStorage.getItem(
              LocalStorageEnum.SEARCH_TERM
            ),
            finalSearchValue: searchValue,
            willAddToFilters: !!(searchValue && searchValue.trim() !== ''),
          });

          if (searchValue && searchValue.trim() !== '') {
            filtersObject.search = searchValue;
          }
          const parsedSquareFootageMax =
            parseNumberWithCommas(squareFootageMax);
          if (parsedSquareFootageMax)
            filtersObject.square_footage_max = parsedSquareFootageMax;
          const parsedSquareFootageMin =
            parseNumberWithCommas(squareFootageMin);
          if (parsedSquareFootageMin)
            filtersObject.square_footage_min = parsedSquareFootageMin;
          if (startDate && startDate.trim() !== '')
            filtersObject.start_date = startDate;
          if (state && state.trim() !== '') filtersObject.state = state;
          if (streetAddress && streetAddress.trim() !== '')
            filtersObject.street_address = streetAddress;

          return filtersObject;
        };

        // Prepare params with consistent pagination settings and filters object structure
        const urlBasedFilters = getUrlBasedParams();

        const hasBoundsChanges =
          finalCurrentBounds &&
          (north !== finalCurrentBounds.north ||
            south !== finalCurrentBounds.south ||
            east !== finalCurrentBounds.east ||
            west !== finalCurrentBounds.west);

        let finalFilters;
        if (finalCompFilters && Object.keys(finalCompFilters).length > ListingEnum.ZERO) {
          finalFilters = finalCompFilters;
        } else {
          // Merge urlBasedFilters with filterParams to ensure sorting parameters are used
          finalFilters = {
            ...urlBasedFilters,
            ...(filterParamsRef.current?.orderBy && {
              orderBy: filterParamsRef.current.orderBy,
            }),
            ...(filterParamsRef.current?.orderByColumn && {
              orderByColumn: filterParamsRef.current.orderByColumn,
            }),
          };
        }
        const finalBounds = hasBoundsChanges
          ? { north, south, east, west }
          : finalCurrentBounds || { north, south, east, west };
        const finalZoom = useWorldBounds ? finalCurrentMapZoom || zoom : zoom;

        console.log('🔧 FINAL API PARAMS DEBUG:', {
          finalZoom,
          originalZoom: zoom,
          finalCurrentMapZoom,
          useWorldBounds,
          finalBounds,
          callId: currentCallId,
        });

        const clusterDetailsParams = {
          bounds: finalBounds,
          zoom: finalZoom,
          page: useWorldBounds ? filterParamsRef.current?.page || ListingEnum.ONE : ListingEnum.ONE, // Use current page for initial load, page 1 for map interactions
          limit: 10, // Standard limit
          filters: finalFilters,
        };

        const clustersParams = {
          bounds: finalBounds,
          zoom: finalZoom,
          filters: finalFilters,
        };

        console.log('🔥 Final API params with search:', {
          clustersParams,
          clusterDetailsParams,
          searchInFilters: finalFilters.search,
          pageFromFilterParams: filterParamsRef.current?.page,
          finalPageUsed: clusterDetailsParams.page,
        });

        // Capture current request sequence to validate response
        const currentRequestSequence = requestSequence;

        // PREVENT BLINKING: Don't clear existing clusters during transitions
        // Keep current clusters visible while new ones load for smooth experience
        // Only set loading state if we have no current clusters to show
        setClustersForming(false); // Keep false to prevent hiding existing clusters
        // Don't set dataReady to false - keep existing data visible

        // Call both APIs in parallel
        const [clustersResponse, clusterDetailsResponse] = await Promise.all([
          // Call clusters API
          APIClient.getInstance().post<any, typeof clustersParams>(
            'comps/map-clusters',
            clustersParams
          ),
          // Call cluster-details API with pagination
          APIClient.getInstance().post<any, typeof clusterDetailsParams>(
            'comps/map-cluster-details',
            clusterDetailsParams
          ),
        ]);

        // Check if this response is still valid (not superseded by a newer request)
        if (currentRequestSequence !== requestSequence) {
          return;
        }

        // Check if this is still the latest API call
        if (currentCallId !== globalApiCallCounter.current) {
          return;
        }

        // Process clusters API response
        const clusters = clustersResponse.data?.data?.clusters || [];

        // ATOMIC UPDATE: Process and update clusters in a single operation to prevent blinking
        if (clusters && Array.isArray(clusters) && clusters.length > ListingEnum.ZERO) {
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

              centerLat = (north + south) / ListingEnum.TWO;
              centerLng = (east + west) / ListingEnum.TWO;
            }

            return {
              lat: centerLat,
              lng: centerLng,
              count: cluster.count,
              avgPrice: parseFloat(cluster.avgPrice) || ListingEnum.ZERO,
              avgSize: parseFloat(cluster.avgSize) || ListingEnum.ZERO,
              avgPricePerSf: parseFloat(cluster.avgPricePerSf) || ListingEnum.ZERO,
              minPrice: 0,
              maxPrice: 0,
              properties: [],
              id: cluster.id,
              bounds: cluster.bounds,
              propertyTypes: cluster.propertyTypes || [],
            };
          });

          // BATCH STATE UPDATE: Update all cluster-related state atomically
          // Use React 18's automatic batching to prevent multiple re-renders
          setClusters(processedClusters);
          setClustersForming(false);
          setDataReady(true);

          if (onMapClustersChange) {
            onMapClustersChange(processedClusters);
          }
        } else {
          // Handle empty clusters case without clearing existing ones during transitions
          if (!isClusterZoom && !pendingClusterUpdate) {
            setClusters([]);
            setClustersForming(false);
            setDataReady(true);
            if (onMapClustersChange) {
              onMapClustersChange([]);
            }
          }
        } // Process cluster-details API response for listing component
        const properties = clusterDetailsResponse.data?.data?.properties || [];
        const apiMetadata = clusterDetailsResponse.data?.data || {};

        if (onApiDataUpdate) {
          // Pass the properties along with the bounds, zoom, and API metadata
          const currentBounds = { north, south, east, west };
          const isFromTransition =
            isClusterTransitioningRef.current || pendingApiCallRef.current;
          const apiTimestamp = Date.now();
          if (setLastApiTimestamp) setLastApiTimestamp(apiTimestamp);
          onApiDataUpdate(
            properties,
            currentBounds,
            zoom,
            apiMetadata,
            undefined,
            isFromTransition,
            apiTimestamp
          );
        }
      } catch (error) {
        // Don't log error if request was aborted (expected behavior)
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('❌ Error calling APIs:', error);
          // On error, restore proper state to prevent permanent loading/empty state
          setClustersForming(false);
          setDataReady(true);
        }
        // Don't update state if request was aborted or superseded
        return;
      } finally {
        // Reset both ref and state - ensure loading state is always cleared
        apiCallInProgressRef.current = false;
        setClustersForming(false);
        setDataReady(true);
        globalLock.release(lockId);
      }
    },
    [onApiDataUpdate, onMapClustersChange, location.pathname]
  );

  // Handle actual filter changes - only trigger when filter values actually change
  useEffect(() => {
    // Check if this is an actual filter change vs just a re-render
    const currentFilterString = JSON.stringify({
      comparison_basis: filterParams?.comparison_basis,
      comp_type: filterParams?.comp_type,
      propertyType: filterParams?.propertyType,
      orderByColumn: filterParams?.orderByColumn,
      orderBy: filterParams?.orderBy,
      type: filterParams?.type,
      search: filterParams?.search,
      compStatus: filterParams?.compStatus,
      state: filterParams?.state,
      street_address: filterParams?.street_address,
      cap_rate_min: filterParams?.cap_rate_min,
      cap_rate_max: filterParams?.cap_rate_max,
      price_sf_min: filterParams?.price_sf_min,
      price_sf_max: filterParams?.price_sf_max,
      land_sf_min: filterParams?.land_sf_min,
      land_sf_max: filterParams?.land_sf_max,
      square_footage_min: filterParams?.square_footage_min,
      square_footage_max: filterParams?.square_footage_max,
      building_sf_min: filterParams?.building_sf_min,
      building_sf_max: filterParams?.building_sf_max,
      city: filterParams?.city,
      lease_type: filterParams?.lease_type,
      start_date: filterParams?.start_date,
      end_date: filterParams?.end_date,
    });

    const currentFilterStringWithPage = JSON.stringify({
      comparison_basis: filterParams?.comparison_basis,
      comp_type: filterParams?.comp_type,
      propertyType: filterParams?.propertyType,
      orderByColumn: filterParams?.orderByColumn,
      orderBy: filterParams?.orderBy,
      type: filterParams?.type,
      search: filterParams?.search,
      compStatus: filterParams?.compStatus,
      state: filterParams?.state,
      street_address: filterParams?.street_address,
      cap_rate_min: filterParams?.cap_rate_min,
      cap_rate_max: filterParams?.cap_rate_max,
      price_sf_min: filterParams?.price_sf_min,
      price_sf_max: filterParams?.price_sf_max,
      land_sf_min: filterParams?.land_sf_min,
      land_sf_max: filterParams?.land_sf_max,
      square_footage_min: filterParams?.square_footage_min,
      square_footage_max: filterParams?.square_footage_max,
      building_sf_min: filterParams?.building_sf_min,
      building_sf_max: filterParams?.building_sf_max,
      city: filterParams?.city,
      lease_type: filterParams?.lease_type,
      start_date: filterParams?.start_date,
      end_date: filterParams?.end_date,
      page: filterParams?.page,
    });

    const hasActualFilterChange =
      previousFilterParamsRef.current !== null &&
      currentFilterStringWithPage !== previousFilterParamsRef.current;

    // Initialize previousFilterParamsRef on first render to prevent double API calls
    if (previousFilterParamsRef.current === null) {
      previousFilterParamsRef.current = currentFilterString;
      console.log(
        '🔧 Initializing filter reference to prevent double API calls'
      );
    }

    // For evaluation components, also check if localStorage trigger changed
    const isEvaluationComponent =
      isEvaluationSalesApproach ||
      isEvaluationCostApproach ||
      isEvaluationLeaseApproach ||
      isEvaluationCapApproach ||
      isEvaluationMultiFamilyApproach ||
      isAppraisaleSalesApproach ||
      isAppraisalCostSalesApproach ||
      isAppraisalLeaseApproach;

    const hasLocalStorageChanged =
      isEvaluationComponent &&
      localStorageTrigger !== previousLocalStorageTriggerRef.current &&
      localStorageTrigger > ListingEnum.ZERO;

    console.log('🔍 Filter useEffect triggered:', {
      map: !!map,
      hasInitialLoad,
      isFullscreen,
      hasActualFilterChange,
      hasLocalStorageChanged,
      localStorageTrigger,
      previousLocalStorageTrigger: previousLocalStorageTriggerRef.current,
      isEvaluationComponent,
      apiCallInProgress: apiCallInProgressRef.current,
    });

    // Update the references for next comparison
    previousFilterParamsRef.current = currentFilterStringWithPage;
    previousLocalStorageTriggerRef.current = localStorageTrigger;

    // Only make API call when actual filter values change OR localStorage trigger changes (for evaluation components)
    const shouldTriggerApiCall =
      hasActualFilterChange || hasLocalStorageChanged;

    if (
      map &&
      hasInitialLoad &&
      shouldTriggerApiCall &&
      !apiCallInProgressRef.current
    ) {
      const triggerReason = hasActualFilterChange
        ? 'filter change'
        : 'localStorage trigger';
      console.log(
        `🔄 ${triggerReason} detected, making API call from map component`
      );

      const debounce = setTimeout(() => {
        if (
          !isClusterZoom &&
          !pendingClusterUpdate &&
          !apiCallInProgressRef.current
        ) {
          console.log(`🔄 Making API call due to ${triggerReason}`);
          callBothAPIs(map, false);
        } else {
          console.log('🚫 API call blocked:', {
            isClusterZoom,
            pendingClusterUpdate,
            apiCallInProgress: apiCallInProgressRef.current,
          });
        }
      }, 300);

      return () => clearTimeout(debounce);
    } else {
      console.log('🚫 API call not triggered:', {
        hasMap: !!map,
        hasInitialLoad,
        hasActualFilterChange,
        hasLocalStorageChanged,
        shouldTriggerApiCall,
        apiCallInProgress: apiCallInProgressRef.current,
      });
    }
  }, [
    map,
    hasInitialLoad,
    filterParams?.comparison_basis,
    filterParams?.comp_type,
    filterParams?.propertyType,
    filterParams?.orderByColumn,
    filterParams?.orderBy,
    filterParams?.type,
    filterParams?.search,
    filterParams?.compStatus,
    filterParams?.state,
    filterParams?.street_address,
    filterParams?.cap_rate_min,
    filterParams?.cap_rate_max,
    filterParams?.price_sf_min,
    filterParams?.price_sf_max,
    filterParams?.land_sf_min,
    filterParams?.land_sf_max,
    filterParams?.square_footage_min,
    filterParams?.square_footage_max,
    filterParams?.building_sf_min,
    filterParams?.building_sf_max,
    filterParams?.city,
    filterParams?.lease_type,
    filterParams?.start_date,
    filterParams?.end_date,
    filterParams?.page, // Add page to dependencies to trigger API calls on page changes
    localStorageTrigger, // Add localStorage trigger for evaluation components
  ]);

  // Handle forced map updates when filters change in fullscreen mode
  useEffect(() => {
    if (map && forceMapUpdate > ListingEnum.ZERO) {
      console.log(
        '🔄 Force map update triggered:',
        forceMapUpdate,
        'hasInitialLoad:',
        hasInitialLoad
      );

      const debounce = setTimeout(() => {
        if (
          !isClusterZoom &&
          !pendingClusterUpdate &&
          !apiCallInProgressRef.current
        ) {
          console.log('🔄 Making forced API call from map component');
          callBothAPIs(map, false);
          // Ensure hasInitialLoad is true after forced update
          if (!hasInitialLoad) {
            setHasInitialLoad(true);
          }
        } else {
          console.log('🚫 Forced API call blocked:', {
            isClusterZoom,
            pendingClusterUpdate,
            apiCallInProgress: apiCallInProgressRef.current,
          });
        }
      }, 100); // Faster response for forced updates

      return () => clearTimeout(debounce);
    }
  }, [forceMapUpdate, map, hasInitialLoad]);

  // Handle fullscreen mode changes - ensure data is loaded when entering fullscreen
  useEffect(() => {
    if (map && isFullscreen) {
      console.log('🔄 Fullscreen mode activated, ensuring data is loaded');

      // Set hasInitialLoad to true when entering fullscreen mode
      if (!hasInitialLoad) {
        setHasInitialLoad(true);
      }

      // Always make API call when entering fullscreen to ensure data is loaded
      // This ensures the listing data is available when the map expands
      const debounce = setTimeout(() => {
        if (
          !apiCallInProgressRef.current &&
          !isClusterZoom &&
          !pendingClusterUpdate
        ) {
          console.log(
            '🔄 Making API call for fullscreen mode to load listing data'
          );
          callBothAPIs(map, false);
        } else {
          console.log('🚫 Fullscreen API call blocked:', {
            apiCallInProgress: apiCallInProgressRef.current,
            isClusterZoom,
            pendingClusterUpdate,
          });
        }
      }, 200); // Small delay to ensure map is ready

      return () => clearTimeout(debounce);
    }
  }, [isFullscreen, map, hasInitialLoad]);

  // Unified debounced handler for both zoom and drag events
  const debouncedMapUpdate = useCallback(
    debounce((map: google.maps.Map) => {
      // BLOCK ALL API CALLS DURING CLUSTER OPERATIONS - use refs to avoid dependency issues
      if (
        isClusterZoom ||
        pendingClusterUpdate ||
        isClusterTransitioningRef.current ||
        pendingApiCallRef.current ||
        globalLock.isApiLocked()
      ) {
        return;
      }

      // Update Supercluster clusters for both zoom and drag
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      if (bounds && zoom && updateSuperclusterClusters) {
        updateSuperclusterClusters(zoom, bounds);
      }

      // DON'T clear clusters here - let callBothAPIs handle it only when it starts successfully
      // This prevents clusters from disappearing if the API call gets blocked
      callBothAPIs(map, false);
    }, 1000),
    [updateSuperclusterClusters, isClusterZoom, pendingClusterUpdate]
  );

  // Handle zoom change with unified debounced handler
  const handleZoomChange = useCallback(
    (map: google.maps.Map) => {
      const zoom = map.getZoom() || defaultZoom;
      const bounds = map.getBounds();

      setCurrentZoom(zoom);
      setShowClusters(true);
      setIsUserInteraction(true); // Mark as user interaction

      // Map zoom interactions don't affect pagination

      // CONDITIONAL UPDATE: Only update Supercluster if not in cluster transition
      // This prevents competing cluster updates that cause blinking
      if (
        bounds &&
        updateSuperclusterClusters &&
        !isClusterZoom &&
        !pendingClusterUpdate
      ) {
        updateSuperclusterClusters(zoom, bounds);
      }

      // Close InfoWindow and clear openPropertyId when zoom changes to prevent popup from staying open
      setMarkerData((prevMarkerData) =>
        prevMarkerData.map((marker) => ({
          ...marker,
          isOpen: false,
        }))
      );
      setOpenPropertyId(null);

      // Use unified debounced handler that prevents conflicts with drag events
      debouncedMapUpdate(map);
    },
    [debouncedMapUpdate, updateSuperclusterClusters, onMapInteraction]
  );

  // Handle map load with zoom listener
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      // Pass getCurrentMapState function to parent
      if (onMapStateChange) {
        onMapStateChange(() => {
          if (!map) return null;
          const bounds = map.getBounds();
          const zoom = map.getZoom();
          if (!bounds || !zoom) return null;

          return {
            bounds: {
              north: bounds.getNorthEast().lat(),
              south: bounds.getSouthWest().lat(),
              east: bounds.getNorthEast().lng(),
              west: bounds.getSouthWest().lng(),
            },
            zoom: zoom,
          };
        });
      }

      // Add zoom change listener with 1-second delay
      zoomListenerRef.current = map.addListener('zoom_changed', () => {
        handleZoomChange(map);
      });

      // Add map movement listener with unified debounced handler
      map.addListener('dragend', () => {
        setIsUserInteraction(true); // Mark as user interaction

        // Map drag interactions don't affect pagination

        // Use unified debounced handler that prevents conflicts with zoom events
        // The handler will check for blocking conditions internally
        debouncedMapUpdate(map);
      });

      // Only make initial API call if we don't have clusters data from props AND localStorage has some filter data
      // Also skip if we're returning from navigation (hasValidState is true) or during cluster transitions
      // IMPORTANT: Skip API call if we already have valid clusters data from parent component
      if (
        (!clustersData ||
          !Array.isArray(clustersData) ||
          clustersData.length === ListingEnum.ZERO) &&
        !hasValidState &&
        !isClusterTransitioning &&
        !pendingApiCall &&
        !isClusterDataLocked
      ) {
        // Check if localStorage has any filter data or if filterParams are provided
        const hasFilterData =
          localStorage.getItem('activeType') ||
          localStorage.getItem('checkType') ||
          filterParams?.comp_type ||
          filterParams?.type;

        // Additional check: Don't make API call if clusters data is being provided by parent
        // This prevents double loading when parent component already handles data fetching
        const hasValidClustersFromParent =
          clustersData &&
          Array.isArray(clustersData) &&
          clustersData.length > ListingEnum.ZERO;

        if (
          hasFilterData &&
          !hasValidClustersFromParent &&
          !disableInternalApiCalls &&
          !disableInitialApiCall
        ) {
          setTimeout(() => {
            callBothAPIs(map, true); // Use world bounds for initial load
            // Set hasInitialLoad to true after initial API call to enable filter-based API calls
            setTimeout(() => {
              setHasInitialLoad(true);
            }, 2000);
          }, 1000); // Small delay to ensure map is fully loaded
        } else {
          // If no initial API call is made, still enable filter-based API calls after a short delay
          setTimeout(() => {
            setHasInitialLoad(true);
          }, 1500);
        }
      }
    },
    [
      handleZoomChange,
      clustersData,
      updateSuperclusterClusters,
      disableInternalApiCalls,
      disableInitialApiCall,
    ]
  );

  // Create cluster icon with enhanced styling for the new cluster data
  const createClusterIcon = (
    count: number,
    isHovered = false,
    isAnimating = false
  ): string => {
    const baseSize =
      count > ListingEnum.ONE_THOUSAND
        ? Math.min(Math.max(45, Math.log10(count + 1) * 25), 75)
        : Math.min(Math.max(35, Math.log10(count + 1) * 25), 65);

    const size = isHovered ? Math.min(baseSize * 1.15, 85) : baseSize;

    const baseColor = '#4285F4'; // Default blue color

    // Stroke is same color, but faded
    const strokeOpacity = isHovered ? 0.5 : 0.3;
    const strokeWidth = isHovered ? 6 : 5;

    const opacity = isAnimating ? 0.3 : 1;

    const baseFontSize = Math.max(12, size / 3.5);
    const fontSize = isHovered
      ? Math.min(baseFontSize * 1.1, 20)
      : baseFontSize;

    const displayText =
      count > 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

    const iconSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${size / 2 - strokeWidth}" 
          fill="${baseColor}" 
          stroke="${baseColor}" 
          stroke-width="${strokeWidth}" 
          stroke-opacity="${strokeOpacity}" 
          opacity="${opacity}" 
        />
        <text 
          x="${size / 2}" 
          y="${size / 2}" 
          text-anchor="middle" 
          fill="#ffffff" 
          font-family="Arial" 
          font-size="${fontSize}" 
          font-weight="bold" 
          dominant-baseline="middle"
        >
          ${displayText}
        </text>
      </svg>
    `)}`;

    console.log('🎨 CLUSTER ICON CREATED:', {
      count,
      size,
      displayText,
      iconSvgLength: iconSvg.length,
      isHovered,
      isAnimating,
    });

    return iconSvg;
  };

  // Handle Supercluster cluster click with smooth zoom
  const handleSuperclusterClick = useCallback(
    async (cluster: any) => {
      if (map && superclusterInstance) {
        // Debounce cluster clicks to prevent rapid successive calls
        const now = Date.now();
        if (now - lastClusterClickTime.current < ListingEnum.ONE_THOUSAND) {
          return;
        }
        lastClusterClickTime.current = now;
        setIsUserInteraction(true); // Mark as user interaction

        // Don't reset page on cluster clicks to preserve pagination
        // if (onMapInteraction) {
        //   onMapInteraction();
        // }

        // Simplified transition flags to prevent blinking
        if (setIsClusterTransitioning) setIsClusterTransitioning(true);
        if (setPendingApiCall) setPendingApiCall(true);
        setIsClusterZoom(true);
        setPendingClusterUpdate(true);

        const clusterId = cluster.properties.cluster_id;
        const expansionZoom =
          superclusterInstance.getClusterExpansionZoom(clusterId);

        const targetZoom = Math.min(expansionZoom, 20);
        const targetCenter = {
          lat: cluster.geometry.coordinates[1],
          lng: cluster.geometry.coordinates[0],
        };

        map.panTo(targetCenter);
        map.setZoom(targetZoom);

        // IMMEDIATE API CALL: Remove setTimeout for instant response
        google.maps.event.addListenerOnce(map, 'idle', () => {
          // Cancel any pending debounced calls to prevent conflicts
          debouncedMapUpdate.cancel();

          // Make API call immediately when map is idle for fastest response
          callBothAPIs(map, false).finally(() => {
            // Clean up all flags atomically to prevent multiple re-renders
            setIsClusterZoom(false);
            setPendingClusterUpdate(false);
            if (setPendingApiCall) setPendingApiCall(false);
            if (setIsClusterTransitioning) setIsClusterTransitioning(false);
          });
        });
      }
    },
    [
      map,
      superclusterInstance,
      debouncedMapUpdate,
      setIsClusterTransitioning,
      setPendingApiCall,
      setIsClusterDataLocked,
      onMapInteraction,
    ]
  );

  const activeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean hover system based on your requirements
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeMarkerIdRef = useRef<string | null>(null);

  // Simplified hover detection - removed complex cursor detection functions
  // as they were causing issues with nearby markers

  const showPropertyCard = useCallback((markerId: string) => {
    console.log('🎯 Showing property card for:', markerId);
    // The actual property card display is handled by handleClusterClick
    // This function is called immediately on hover for responsive UI
  }, []);

  const hidePropertyCard = useCallback(() => {
    // Close the InfoWindow
    setOpenPropertyId(null);
    setMarkerData((prevMarkerData) =>
      prevMarkerData.map((marker) => ({
        ...marker,
        isOpen: false,
      }))
    );
  }, []);

  // Dynamic positioning helper for InfoWindows near map edges
  const calculateInfoWindowOffset = useCallback(
    (markerLat: number, markerLng: number) => {
      if (!map) return new google.maps.Size(0, -30); // Default offset

      try {
        const mapContainer = map.getDiv();
        const mapBounds = map.getBounds();

        if (!mapBounds || !mapContainer) return new google.maps.Size(0, -30);

        // Get map dimensions
        const mapHeight = mapContainer.offsetHeight;

        // Convert lat/lng to screen coordinates using map's built-in projection
        const markerLatLng = new google.maps.LatLng(markerLat, markerLng);
        const scale = Math.pow(2, map.getZoom() || defaultZoom);
        const worldCoordinate = map
          .getProjection()
          ?.fromLatLngToPoint(markerLatLng);

        if (!worldCoordinate) return new google.maps.Size(0, -30);

        // Get map center in world coordinates
        const mapCenter = map.getCenter();
        if (!mapCenter) return new google.maps.Size(0, -30);

        const mapCenterWorldCoord = map
          .getProjection()
          ?.fromLatLngToPoint(mapCenter);
        if (!mapCenterWorldCoord) return new google.maps.Size(0, -30);

        // Calculate pixel position relative to map center
        const pixelY =
          (worldCoordinate.y - mapCenterWorldCoord.y) * scale + mapHeight / 2;

        // Define safe zones and property card dimensions
        const cardHeight = 250; // estimated property card height

        let offsetX = 0;
        let offsetY = 0; // Start with no offset and calculate based on position

        // Always center the arrow on the marker regardless of edge proximity
        offsetX = 0;

        // The InfoWindow will be positioned with its arrow pointing at the marker center.
        // If the card extends beyond viewport edges, Google Maps will automatically
        // handle the positioning while keeping the arrow centered on the marker.

        // Vertical positioning - position card above marker with proper clearance to prevent overlap
        const topPadding = 80; // Account for map controls and padding
        const clearanceAbove = 15; // Increased clearance to prevent overlap with marker
        const pointerHeight = 12; // Account for InfoWindow triangular pointer height

        const availableSpaceAbove = pixelY - topPadding;

        // Position card above marker with sufficient spacing to prevent overlap
        // The InfoWindow should appear clearly above the marker, not overlapping it

        // Check if we're in the problematic top area where Google Maps tries to flip
        const isNearTopEdge = pixelY < topPadding + cardHeight;
        const isVeryTopEdge = pixelY < topPadding + 50; // Even more aggressive detection

        if (isVeryTopEdge) {
          // Very top edge - small gap above marker
          offsetY = -25;
        } else if (isNearTopEdge) {
          // Near top edge - small gap above marker
          offsetY = -30;
        } else if (availableSpaceAbove >= cardHeight + clearanceAbove) {
          // Normal case - small gap above marker
          offsetY = -25;
        } else {
          // Limited space - small gap above marker
          offsetY = -Math.max(
            25,
            availableSpaceAbove + pointerHeight + clearanceAbove
          );
        }

        // Note: Using ultra-aggressive -125px offset near top edge to completely override Google Maps

        return new google.maps.Size(offsetX, offsetY);
      } catch (error) {
        console.warn('Error calculating InfoWindow offset:', error);
        return new google.maps.Size(0, -30);
      }
    },
    [map]
  );

  // Handle cluster click - zoom in and show property InfoWindows
  const handleClusterClick = async (
    cluster: ClusterData,
    isFromHover = false
  ) => {
    if (map) {
      // Skip debounce for hover events to allow immediate response
      if (!isFromHover) {
        const now = Date.now();
        if (now - lastClusterClickTime.current < ListingEnum.ONE_THOUSAND) {
          return;
        }
        lastClusterClickTime.current = now;
      }
      setIsUserInteraction(true); // Mark as user interaction

      // Only notify parent for non-hover interactions to avoid unwanted side effects
      if (onMapInteraction && !isFromHover) {
        onMapInteraction();
      }

      if (cluster.count === 1) {
        console.log('🎯 Opening single property cluster:', cluster);

        // Check if we already have this cluster open to avoid unnecessary work
        if (isFromHover && openPropertyId && markerData.length > ListingEnum.ZERO) {
          const existingMarker = markerData.find(
            (m) =>
              m.isOpen &&
              Math.abs(m.lat - cluster.lat) < 0.001 &&
              Math.abs(m.lng - cluster.lng) < 0.001
          );
          if (existingMarker) {
            console.log('🎯 Cluster already open, skipping');
            return;
          }
        }

        // IMMEDIATE RESPONSE: Show loading state first for instant feedback
        const tempId = Date.now(); // Use timestamp as numeric ID
        setOpenPropertyId(tempId);

        // Show immediate loading card
        setMarkerData((prevMarkerData) => {
          const loadingMarker = {
            lat: cluster.lat,
            lng: cluster.lng,
            label: 'Loading...',
            isOpen: true,
            propertyId: tempId,
            propertyData: null,
            content: (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  minWidth: '200px',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #0da1c7',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '10px',
                  }}
                />
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {ListingEnum.LOADING_PROPERTY_DETAILS}
                </div>
              </div>
            ),
            checkType: property_type,
            selectedToggleButton: selectedToggleButton,
          };

          // Close other markers and show loading marker
          return prevMarkerData
            .map((marker) => ({ ...marker, isOpen: false }))
            .concat([loadingMarker]);
        });

        // Now find the actual property data by calling specific API
        let property = null;

        // Get comp_id from cluster properties
        if (
          (cluster as any).properties &&
          (cluster as any).properties.length > ListingEnum.ZERO
        ) {
          const clusterProp = (cluster as any).properties[0];
          const compId = clusterProp.comp_id || clusterProp.id;

          if (compId) {
            try {
              // Call specific API to get property details
              const response: any = await APIClient.getInstance().get(
                `comps/get/${compId}`
              );

              if (response.data?.data) {
                property = response.data.data;
                console.log('🎯 Found property via API call:', compId);
              }
            } catch (error) {
              console.error('❌ Error fetching property by comp_id:', error);
            }
          }

          // Fallback: use cluster property data if API call fails
          if (!property) {
            property = clusterProp;
            console.log('⚠️ Using cluster property data as fallback:', compId);
          }
        }

        // If no properties in cluster, make API call to get cluster details
        if (!property) {
          try {
            const clusterBounds = (cluster as any).bounds;
            if (clusterBounds) {
              const clusterDetailsParams = {
                bounds: {
                  north: parseFloat(clusterBounds.north),
                  south: parseFloat(clusterBounds.south),
                  east: parseFloat(clusterBounds.east),
                  west: parseFloat(clusterBounds.west),
                },
                zoom: map?.getZoom() || currentZoom,
                page: 1,
                limit: 1,
                filters: getProperFilters(),
              };

              const response = await APIClient.getInstance().post<
                any,
                typeof clusterDetailsParams
              >('comps/map-cluster-details', clusterDetailsParams);

              const properties = response.data?.data?.properties || [];
              if (properties.length > ListingEnum.ZERO) {
                property = properties[0];
              }
            }
          } catch (error) {
            console.error('❌ Error fetching cluster details:', error);
          }

          // Fallback: search in GoogleData using comp_id first, then coordinates
          if (!property && GoogleData && GoogleData.length > ListingEnum.ZERO) {
            // First, try to match using comp_id from cluster properties
            if (
              (cluster as any).properties &&
              (cluster as any).properties.length > ListingEnum.ZERO
            ) {
              const clusterProp = (cluster as any).properties[0];
              const compId = clusterProp.comp_id || clusterProp.id;

              if (compId) {
                const matchedProperty = GoogleData.find((prop) => {
                  return (
                    prop.id === compId ||
                    prop.comp_id === compId ||
                    prop.id?.toString() === compId?.toString() ||
                    prop.comp_id?.toString() === compId?.toString()
                  );
                });

                if (matchedProperty) {
                  property = matchedProperty;
                  console.log('🎯 Found property using comp_id match:', {
                    cluster_comp_id: compId,
                    matched_property_id: matchedProperty.id,
                    matched_property_comp_id: matchedProperty.comp_id,
                  });
                }
              }
            }

            // If no comp_id match, fallback to coordinate matching with progressive tolerance
            if (!property) {
              const toleranceLevels = [0.001, 0.01, 0.1, 1.0];

              for (const tolerance of toleranceLevels) {
                const matchingProperties = GoogleData.filter((prop) => {
                  const lat = parseFloat(prop.map_pin_lat || prop.latitude);
                  const lng = parseFloat(prop.map_pin_lng || prop.longitude);
                  const latDiff = Math.abs(lat - cluster.lat);
                  const lngDiff = Math.abs(lng - cluster.lng);
                  return latDiff < tolerance && lngDiff < tolerance;
                });

                if (matchingProperties.length > ListingEnum.ZERO) {
                  property = matchingProperties[0];
                  console.log(
                    '🎯 Found property using coordinate fallback:',
                    property.id
                  );
                  break;
                }
              }
            }
          }
        }

        // Replace loading state with actual property data
        if (property) {
          console.log(
            '🎯 Found property data, replacing loading state:',
            property
          );
          // Set openPropertyId to ensure the property is tracked
          setOpenPropertyId(property.id);

          // Replace the loading marker with actual property data
          setMarkerData((prevMarkerData) => {
            // Use cluster coordinates for InfoWindow position
            const newMarker = {
              lat: cluster.lat,
              lng: cluster.lng,
              label: property.label,
              isOpen: true,
              propertyId: property.id,
              propertyData: property, // Store the actual property data
              content: (
                <PropertyCard
                  elem={property}
                  index={0}
                  viewListingItem={viewListingItem}
                  updateListingItem={updateListingItem}
                  formatLandType={formatLandType}
                  formatZoningTypes={formatZoningTypes}
                  checkType={property_type}
                  hideEditButton={hideEditButton}
                  selectedToggleButton={selectedToggleButton}
                />
              ),
              checkType: property_type,
              selectedToggleButton: selectedToggleButton,
            };

            // Check if marker already exists
            const existingMarkerIndex = prevMarkerData.findIndex(
              (marker) => marker.propertyId === property.id
            );

            let result;
            if (existingMarkerIndex >= ListingEnum.ZERO) {
              // Update existing marker
              result = prevMarkerData.map((marker, index) =>
                index === existingMarkerIndex
                  ? { ...newMarker, isOpen: true }
                  : { ...marker, isOpen: false }
              );
            } else {
              // Add new marker and close others
              result = [
                ...prevMarkerData.map((marker) => ({
                  ...marker,
                  isOpen: false,
                })),
                newMarker,
              ];
            }

            return result;
          });
        } else {
          console.log('❌ No property data found for cluster:', cluster);
          // Replace loading state with error message
          const errorId =
            Math.round(cluster.lat * ListingEnum.TEN_LAKH) +
            Math.round(cluster.lng * ListingEnum.TEN_LAKH);
          setOpenPropertyId(errorId);

          setMarkerData((prevMarkerData) => {
            const errorMarker = {
              lat: cluster.lat,
              lng: cluster.lng,
              label: 'Property not found',
              isOpen: true,
              propertyId: errorId,
              propertyData: null,
              content: (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    minWidth: '200px',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ marginBottom: '10px', color: '#e74c3c' }}>
                    ⚠️
                  </div>
                  <div>{ListingEnum.PROPERTY_DETAIL_NOT_AVAILABLE}</div>
                  <div
                    style={{ marginTop: '5px', fontSize: '12px', opacity: 0.7 }}
                  >
                    {ListingEnum.CLICK_TO_CLOSE}
                  </div>
                </div>
              ),
              checkType: property_type,
              selectedToggleButton: selectedToggleButton,
            };

            // Replace loading marker with error marker
            return prevMarkerData
              .map((marker) => ({ ...marker, isOpen: false }))
              .concat([errorMarker]);
          });
        }
      } else {
        try {
          // DISABLE ZOOM LISTENER DURING CLUSTER OPERATION
          if (zoomListenerRef.current) {
            google.maps.event.removeListener(zoomListenerRef.current);
            zoomListenerRef.current = null;
          }

          setIsUserInteraction(true); // Mark as user interaction
          if (setIsClusterDataLocked) setIsClusterDataLocked(true);
          setIsClusterZoom(true);
          setPendingClusterUpdate(true);
          if (setIsClusterTransitioning) setIsClusterTransitioning(true);
          if (setPendingApiCall) setPendingApiCall(true);

          // ✅ Always zoom only 2x closer
          const currentZoom = map.getZoom() || 4;
          const newZoom = Math.min(currentZoom + 2, 20); // cap at max zoom 20
          const targetCenter = { lat: cluster.lat, lng: cluster.lng };

          map.panTo(targetCenter);
          map.setZoom(newZoom);

          // Wait for zoom to complete, then fetch data
          google.maps.event.addListenerOnce(map, 'idle', () => {
            setTimeout(() => {
              debouncedMapUpdate.cancel();

              callBothAPIs(map, false).finally(() => {
                setIsClusterZoom(false);
                setPendingClusterUpdate(false);

                setTimeout(() => {
                  if (setPendingApiCall) setPendingApiCall(false);
                  if (setIsClusterTransitioning)
                    setIsClusterTransitioning(false);

                  setTimeout(() => {
                    if (setIsClusterDataLocked) setIsClusterDataLocked(false);

                    if (map && !zoomListenerRef.current) {
                      zoomListenerRef.current = map.addListener(
                        'zoom_changed',
                        () => handleZoomChange(map)
                      );
                    }
                  }, 500);
                }, 1000);
              });
            }, 200);
          });
        } catch (error) {
          console.error('Error handling cluster click:', error);
          setIsClusterZoom(false);
          if (setIsClusterTransitioning) setIsClusterTransitioning(false);
          if (setPendingApiCall) setPendingApiCall(false);
          if (setIsClusterDataLocked) setIsClusterDataLocked(false);
        }
      }
    }
  };

  // Update clusters when GoogleData changes - now using clusters API data instead of creating client-side clusters
  useEffect(() => {}, [
    GoogleData,
    currentZoom,
    createClustersFromData,
    onMapClustersChange,
  ]);

  // Fit map to property bounds when data changes - DISABLED to prevent automatic zoom changes
  useEffect(() => {
    // Note: Auto-fitting bounds is disabled to prevent automatic zoom changes after initial load
    // The map will maintain its initial zoom level and center until user manually changes it
  }, [map, GoogleData]);

  // Handle focused property from listing and hovered property
  useEffect(() => {
    // Only process hover if user has moved after loading completed
    if (!userMovedAfterLoading) {
      return;
    }

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
      } else {
        // Property not found in current data, clear marker
        setHoveredPriceMarker(null);
      }
    } else {
      // Clear hovered price marker when no property is hovered
      setHoveredPriceMarker(null);
    }
  }, [hoveredPropertyId, GoogleData, userMovedAfterLoading]);

  // Clear hover marker and reset user movement flag when loading starts
  useEffect(() => {
    if (!dataReady || clustersForming) {
      setHoveredPriceMarker(null);
      setUserMovedAfterLoading(false);
    }
  }, [dataReady, clustersForming]);

  // Clear hover marker when loading completes and reset user movement flag
  useEffect(() => {
    if (dataReady && !clustersForming) {
      setHoveredPriceMarker(null);
      setUserMovedAfterLoading(false);
    }
  }, [dataReady, clustersForming]);

  // Track user movement after loading completes
  useEffect(() => {
    const handleMouseMove = () => {
      if (dataReady && !clustersForming && !userMovedAfterLoading) {
        setUserMovedAfterLoading(true);
      }
    };

    if (dataReady && !clustersForming) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [dataReady, clustersForming, userMovedAfterLoading]);

  useEffect(() => {
    if (GoogleData && GoogleData.length > ListingEnum.ZERO) {
      // Keep map center and zoom completely stable - no automatic changes
      setGoogleDataReady(true);

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
            <PropertyCard
              elem={elem}
              index={index}
              viewListingItem={viewListingItem}
              updateListingItem={updateListingItem}
              formatLandType={formatLandType}
              formatZoningTypes={formatZoningTypes}
              checkType={property_type}
              approachType={
                isEvaluationCostApproach || isEvaluationLeaseApproach
                  ? localStorage.getItem('approachType')
                  : undefined
              }
              hideEditButton={hideEditButton}
              selectedToggleButton={selectedToggleButton}
            />
          ),
          checkType: property_type,
          selectedToggleButton: selectedToggleButton,
        };
      });

      // Force update markerData when selectedToggleButton changes
      setMarkerData((prevMarkerData) => {
        const hasOpenClusterMarker = prevMarkerData.some(
          (marker) => marker.isOpen && marker.propertyId === openPropertyId
        );

        if (hasOpenClusterMarker && openPropertyId) {
          // Update the open cluster marker with new selectedToggleButton value
          return prevMarkerData.map((marker) => {
            if (marker.isOpen && marker.propertyId === openPropertyId) {
              const property = GoogleData.find((p) => p.id === openPropertyId);
              if (property) {
                return {
                  ...marker,
                  content: (
                    <PropertyCard
                      elem={property}
                      index={0}
                      viewListingItem={viewListingItem}
                      updateListingItem={updateListingItem}
                      formatLandType={formatLandType}
                      formatZoningTypes={formatZoningTypes}
                      checkType={property_type}
                      approachType={
                        isEvaluationCostApproach || isEvaluationLeaseApproach
                          ? localStorage.getItem(LocalStorageEnum.APPROACH_TYPE)
                          : undefined
                      }
                      hideEditButton={hideEditButton}
                      selectedToggleButton={selectedToggleButton}
                    />
                  ),
                  selectedToggleButton: selectedToggleButton,
                };
              }
            }
            return marker;
          });
        }

        return locationData;
      });
    } else {
      setGoogleDataReady(false);
      // Don't set dataReady to false here - let cluster logic handle it
    }
  }, [
    GoogleData,
    selectedToggleButton,
    openPropertyId,
    property_type,
    hideEditButton,
  ]);

  const handleCloseInfoWindow = useCallback(() => {
    // Clear openPropertyId to prevent InfoWindow from reopening on map moves
    setOpenPropertyId(null);
    // Close the InfoWindow
    setMarkerData((prevMarkerData) =>
      prevMarkerData.map((marker) => ({
        ...marker,
        isOpen: false,
      }))
    );
  }, []);

  // Immediate hover handlers for instant responsiveness
  const handleMarkerEnter = useCallback(
    (markerId: string, cluster: any) => {
      console.log('🖱️ Marker hover enter:', markerId);

      // Clear any existing timeouts
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }

      // Set active marker immediately
      activeMarkerIdRef.current = markerId;

      // Open card IMMEDIATELY - no delay for maximum responsiveness
      showPropertyCard(markerId);
      handleClusterClick(cluster, true); // Mark as hover-triggered
    },
    [showPropertyCard, handleClusterClick]
  );

  const handleMarkerLeave = useCallback(
    (markerId: string) => {
      console.log('🖱️ Marker hover leave:', markerId);

      // Clear open timeout if it exists
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }

      // Use a very short delay to allow smooth transition between nearby markers
      // but still close quickly when mouse truly leaves the marker area
      closeTimeoutRef.current = setTimeout(() => {
        if (activeMarkerIdRef.current === markerId) {
          console.log('🖱️ Closing card for marker:', markerId);
          activeMarkerIdRef.current = null;
          hidePropertyCard();
        }
      }, 150); // Reduced from 500ms to 150ms for faster response
    },
    [hidePropertyCard]
  );

  const handleCardEnter = useCallback(() => {
    console.log('🖱️ Card hover enter');
    // Clear close timeout if it exists - keep card open when hovering over it
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const handleCardLeave = useCallback(() => {
    console.log('🖱️ Card hover leave');
    // Immediate close when leaving the card - no complex detection needed
    closeTimeoutRef.current = setTimeout(() => {
      console.log('🖱️ Closing card after leaving card area');
      activeMarkerIdRef.current = null;
      hidePropertyCard();
    }, 200); // Short delay to allow transition back to marker
  }, [hidePropertyCard]);

  useEffect(() => {
    if (map) {
      // Close InfoWindow when clicking on map
      const mapClickListener = map.addListener('click', () => {
        handleCloseInfoWindow();
      });

      // Close InfoWindow when clicking outside the map container or when focus is lost
      const handleClickOutside = (event: MouseEvent) => {
        const mapContainer = map.getDiv();
        const infoWindows = document.querySelectorAll(
          '.gm-ui-hover-effect, .gm-style-iw, .gm-style-iw-chr, .gm-style-iw-d, .gm-style-iw-c, .gm-style-iw-tc'
        );

        // Check if click is outside map container and not on any InfoWindow elements
        let isClickOutside = !mapContainer.contains(event.target as Node);

        // Also check if click is not on any InfoWindow elements
        infoWindows.forEach((element) => {
          if (element.contains(event.target as Node)) {
            isClickOutside = false;
          }
        });

        if (isClickOutside && openPropertyId !== null) {
          handleCloseInfoWindow();
        }
      };

      // Handle mouse movement to track hover state with enhanced tolerance
      const handleMouseMove = (event: MouseEvent) => {
        if (openPropertyId === null) return;

        const currentMapZoom = map.getZoom() || currentZoom;
        const mapContainer = map.getDiv();
        const infoWindows = document.querySelectorAll(
          '.gm-ui-hover-effect, .gm-style-iw, .gm-style-iw-chr, .gm-style-iw-d, .gm-style-iw-c, .gm-style-iw-tc'
        );

        let isHoveringRelevantArea = false;
        let isNearRelevantArea = false;

        // Check if mouse is over map container
        if (mapContainer.contains(event.target as Node)) {
          isHoveringRelevantArea = true;
        }

        // Check if mouse is over any InfoWindow elements
        infoWindows.forEach((element) => {
          if (element.contains(event.target as Node)) {
            isHoveringRelevantArea = true;
          }
        });

        // Enhanced proximity detection for smooth transitions - adjust tolerance based on zoom
        if (!isHoveringRelevantArea) {
          const mouseX = event.clientX;
          const mouseY = event.clientY;

          // Larger tolerance zones at higher zoom levels to prevent unwanted closing
          const baseTolerance = currentMapZoom >= ListingEnum.TEN ? ListingEnum.HUNDRED : ListingEnum.SIXTY; // Increased tolerance at zoom 10+
          const markerConnectionTolerance = 80; // Extra tolerance for marker connection area

          // Check proximity to InfoWindow elements with enhanced tolerance zone
          infoWindows.forEach((element) => {
            const rect = element.getBoundingClientRect();

            // Extended tolerance zone including marker connection area (bottom of InfoWindow)
            const tolerance = baseTolerance;
            const connectionZoneExtension = markerConnectionTolerance;

            const isNearX =
              mouseX >= rect.left - tolerance &&
              mouseX <= rect.right + tolerance;
            const isNearY =
              mouseY >= rect.top - tolerance &&
              mouseY <= rect.bottom + connectionZoneExtension;

            if (isNearX && isNearY) {
              isNearRelevantArea = true;
            }
          });

          // Also check proximity to map container with zoom-adjusted tolerance
          const mapRect = mapContainer.getBoundingClientRect();
          const mapTolerance = currentMapZoom >= ListingEnum.TEN ? ListingEnum.SIXTY : ListingEnum.FORTY; // Larger tolerance at high zoom
          const isNearMapX =
            mouseX >= mapRect.left - mapTolerance &&
            mouseX <= mapRect.right + mapTolerance;
          const isNearMapY =
            mouseY >= mapRect.top - mapTolerance &&
            mouseY <= mapRect.bottom + mapTolerance;

          if (isNearMapX && isNearMapY) {
            isNearRelevantArea = true;
          }

          // Additional check for markers - find all visible markers and check proximity
          const markers = document.querySelectorAll(
            '[role="button"][title*="$"], [role="img"][title*="$"]'
          );
          markers.forEach((marker) => {
            const markerRect = marker.getBoundingClientRect();
            const markerTolerance = 50;

            const isNearMarkerX =
              mouseX >= markerRect.left - markerTolerance &&
              mouseX <= markerRect.right + markerTolerance;
            const isNearMarkerY =
              mouseY >= markerRect.top - markerTolerance &&
              mouseY <= markerRect.bottom + markerTolerance;

            if (isNearMarkerX && isNearMarkerY) {
              isNearRelevantArea = true;
            }
          });
        }

        // If mouse is not over or near relevant areas, start a delayed close
        if (!isHoveringRelevantArea && !isNearRelevantArea) {
          // Clear any existing timeout
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
          }

          // Responsive delay based on zoom level - longer delays at high zoom for precision
          const closeDelay =
            currentMapZoom >= 10 ? 300 : currentMapZoom >= 6 ? 200 : 600;

          const closeTimeout = setTimeout(() => {
            // Final validation before closing
            if (openPropertyId !== null) {
              handleCloseInfoWindow();
            }
          }, closeDelay);

          setHoverTimeout(closeTimeout);
        } else {
          // Mouse is over or near relevant area, cancel any pending close
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
        }
      };

      // Handle focus loss from the document (backup method)
      const handleFocusLoss = () => {
        // Small delay to allow for focus transitions within InfoWindow elements
        setTimeout(() => {
          const activeElement = document.activeElement;
          const mapContainer = map.getDiv();
          const infoWindows = document.querySelectorAll(
            '.gm-ui-hover-effect, .gm-style-iw, .gm-style-iw-chr, .gm-style-iw-d, .gm-style-iw-c, .gm-style-iw-tc'
          );

          let isFocusInMapArea = mapContainer.contains(activeElement as Node);

          // Check if focus is in any InfoWindow elements
          infoWindows.forEach((element) => {
            if (element.contains(activeElement as Node)) {
              isFocusInMapArea = true;
            }
          });

          if (!isFocusInMapArea && openPropertyId !== null) {
            handleCloseInfoWindow();
          }
        }, 100);
      };

      // Handle Escape key press to close InfoWindow
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && openPropertyId !== null) {
          handleCloseInfoWindow();
        }
      };

      // Handle mouse leave from map area entirely
      const handleMouseLeave = () => {
        if (openPropertyId !== null) {
          // Set a timeout to close after user moves away from map area
          const closeTimeout = setTimeout(() => {
            if (openPropertyId !== null) {
              handleCloseInfoWindow();
            }
          }, 500); // Longer delay for mouse leave events

          setHoverTimeout(closeTimeout);
        }
      };

      // Handle window events that indicate user is interacting elsewhere
      const handleWindowInteraction = () => {
        if (openPropertyId !== null) {
          handleCloseInfoWindow();
        }
      };

      // Add event listeners
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('focusout', handleFocusLoss);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleWindowInteraction);
      window.addEventListener('resize', handleWindowInteraction);

      // Add mouse leave listener to map container
      const mapContainer = map.getDiv();
      mapContainer.addEventListener('mouseleave', handleMouseLeave);

      // Add mouse enter/leave listeners to InfoWindow elements when they appear
      const setupInfoWindowListeners = () => {
        const infoWindows = document.querySelectorAll(
          '.gm-style-iw, .gm-style-iw-c, .gm-style-iw-d, .gm-style-iw-chr'
        );
        infoWindows.forEach((infoWindow) => {
          // Remove existing listeners to prevent duplicates
          const oldEnterHandler = (infoWindow as any)._enterHandler;
          const oldLeaveHandler = (infoWindow as any)._leaveHandler;
          if (oldEnterHandler)
            infoWindow.removeEventListener('mouseenter', oldEnterHandler);
          if (oldLeaveHandler)
            infoWindow.removeEventListener('mouseleave', oldLeaveHandler);

          const handleInfoWindowMouseEnter = () => {
            // Clear any pending close timeout when entering InfoWindow
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
              setHoverTimeout(null);
            }
          };

          const handleInfoWindowMouseLeave = (event: Event) => {
            // Check if mouse is actually leaving to a non-InfoWindow area
            const mouseEvent = event as MouseEvent;
            const relatedTarget = mouseEvent.relatedTarget as Element;
            const currentMapZoom = map.getZoom() || currentZoom;

            // More comprehensive check to prevent unwanted closing
            if (relatedTarget) {
              const allInfoWindows = document.querySelectorAll(
                '.gm-ui-hover-effect, .gm-style-iw, .gm-style-iw-chr, .gm-style-iw-d, .gm-style-iw-c, .gm-style-iw-tc'
              );

              let movingToRelevantArea = false;

              // Check if moving to another InfoWindow element
              allInfoWindows.forEach((element) => {
                if (
                  element.contains(relatedTarget) ||
                  element === relatedTarget
                ) {
                  movingToRelevantArea = true;
                }
              });

              // Also check if moving to map container
              const mapContainer = map.getDiv();
              if (mapContainer.contains(relatedTarget)) {
                movingToRelevantArea = true;
              }

              // Check if moving to a marker
              const markers = document.querySelectorAll(
                '[role="button"][title*="$"], [role="img"][title*="$"]'
              );
              markers.forEach((marker) => {
                if (
                  marker.contains(relatedTarget) ||
                  marker === relatedTarget
                ) {
                  movingToRelevantArea = true;
                }
              });

              if (movingToRelevantArea) {
                return; // Don't close if moving to another relevant element
              }
            }

            // Start close timeout with zoom-responsive delay
            if (openPropertyId !== null) {
              // Longer delays at higher zoom levels to prevent unwanted closing
              const infoWindowDelay =
                currentMapZoom >= 10 ? 400 : currentMapZoom >= 6 ? 300 : 500;

              const closeTimeout = setTimeout(() => {
                if (openPropertyId !== null) {
                  handleCloseInfoWindow();
                }
              }, infoWindowDelay);
              setHoverTimeout(closeTimeout);
            }
          };

          // Store handlers on the element to remove them later
          (infoWindow as any)._enterHandler = handleInfoWindowMouseEnter;
          (infoWindow as any)._leaveHandler = handleInfoWindowMouseLeave;

          infoWindow.addEventListener('mouseenter', handleInfoWindowMouseEnter);
          infoWindow.addEventListener('mouseleave', handleInfoWindowMouseLeave);
        });
      };

      // Set up InfoWindow listeners initially and observe for new InfoWindows
      setupInfoWindowListeners();

      // Use MutationObserver to detect when new InfoWindows are added
      const observer = new MutationObserver(() => {
        setupInfoWindowListeners();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });

      return () => {
        mapClickListener.remove();
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('focusout', handleFocusLoss);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', handleWindowInteraction);
        window.removeEventListener('resize', handleWindowInteraction);

        // Remove mouse leave listener from map container
        const mapContainer = map.getDiv();
        mapContainer.removeEventListener('mouseleave', handleMouseLeave);

        // Disconnect MutationObserver
        observer.disconnect();
      };
    }
  }, [map, handleCloseInfoWindow, openPropertyId]);

  // Cleanup function on unmount - cancel debounced function and hover timeouts
  useEffect(() => {
    return () => {
      // Cancel the debounced function when component unmounts
      debouncedMapUpdate.cancel();
      // Clear hover timeouts
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      // Clear active timeout ref
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
        activeTimeoutRef.current = null;
      }
      // Clear Crexi-style timeouts
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [debouncedMapUpdate, hoverTimeout]);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  // Memoized cluster rendering
  const clustersRendered = React.useMemo(() => {
    console.log('🔍 Cluster Rendering Check:', {
      dataReady,
      clustersForming,
      clustersLength: clusters?.length || ListingEnum.ZERO,
      superclusterClustersLength: superclusterClusters?.length || ListingEnum.ZERO,
      hasGoogleData: GoogleData?.length > ListingEnum.ZERO,
      googleDataLength: GoogleData?.length || ListingEnum.ZERO,
      mapZoom: map?.getZoom() || currentZoom,
      firstFewClusters:
        clusters
          ?.slice(0, 5)
          ?.map((c) => ({ count: c.count, lat: c.lat, lng: c.lng })) || [],
      clustersWithCountGreaterThan1:
        clusters?.filter((c) => c.count > 1)?.length || ListingEnum.ZERO,
      clustersWithCount1: clusters?.filter((c) => c.count === 1)?.length || ListingEnum.ZERO,
      allClusterCounts: clusters?.map((c) => c.count) || [],
      willShowZoom15Markers:
        (map?.getZoom() || currentZoom) >= 15 &&
        GoogleData &&
        GoogleData.length > ListingEnum.ZERO,
    });

    // ZOOM 15+ DEBUG: Log multi-property clusters specifically
    if (
      (map?.getZoom() || currentZoom) >= 15 &&
      clusters &&
      clusters.length > ListingEnum.ZERO
    ) {
      const multiPropertyClusters = clusters.filter((c) => c.count > 1);
      console.log('🔥 ZOOM 15+ MULTI-PROPERTY CLUSTERS DEBUG:', {
        totalClusters: clusters.length,
        multiPropertyCount: multiPropertyClusters.length,
        multiPropertyClusters: multiPropertyClusters.map((c) => ({
          count: c.count,
          lat: c.lat,
          lng: c.lng,
          id: c.id,
        })),
        willRenderMultiProperty: multiPropertyClusters.length > ListingEnum.ZERO,
      });
    }

    // Allow cluster rendering even if data is not fully ready to prevent sequential loading
    // if (!dataReady) {
    //   console.log('🚫 Blocking cluster rendering - dataReady is false');
    //   return null;
    // }

    const currentMapZoom = map?.getZoom() || currentZoom;

    // Use current clusters, keep them visible during transitions to prevent blinking
    const displayClusters = clusters;

    // IMPORTANT: Don't render clusters if we have no data or empty clusters
    if (!clusters || clusters.length === 0) {
      console.log('🚫 Blocking cluster rendering - no clusters data available');
      return null;
    }

    // Reduced debug logging during transitions to improve performance
    if (!isClusterZoom && !pendingClusterUpdate) {
      console.log('🔍 Cluster Rendering Debug:', {
        totalClusters: clusters?.length || ListingEnum.ZERO,
        superclusterClusters: superclusterClusters?.length || ListingEnum.ZERO,
        currentZoom: currentMapZoom,
        dataReady,
        clustersForming,
      });
    }

    // At zoom >= 15, show both multi-property clusters and individual property markers
    // Multi-property clusters will be rendered as cluster icons
    // Single properties will be rendered as price markers in the separate system below

    // SMOOTH TRANSITIONS: Keep clusters visible during zoom operations
    // This prevents the blinking effect when clusters transition

    // Use Supercluster if available, otherwise use original clusters
    const hasSuperclusters =
      superclusterClusters && superclusterClusters.length > ListingEnum.ZERO;
    const hasOriginalClusters = displayClusters && displayClusters.length > ListingEnum.ZERO;

    if (hasSuperclusters) {
      // Render Supercluster clusters

      const renderedMarkers = superclusterClusters
        .map((cluster, index) => {
          // Validate supercluster data before rendering
          if (
            !cluster ||
            !cluster.geometry ||
            !cluster.geometry.coordinates ||
            cluster.geometry.coordinates.length < 2
          ) {
            console.log('🚫 Skipping invalid supercluster:', cluster);
            return null;
          }

          const isCluster = cluster.properties.cluster;
          const clusterId = isCluster
            ? `supercluster-${cluster.properties.cluster_id}`
            : `point-${index}-${cluster.geometry.coordinates[1]}-${cluster.geometry.coordinates[0]}`;
          // const isHovered = hoveredClusterId === clusterId;
          const count = isCluster ? cluster.properties.point_count : 1;

          // SKIP only invalid clusters (count <= 0) - allow single property clusters
          if (!count || count <= 0) {
            console.log(`🚫 Skipping invalid supercluster (count=${count}):`, {
              count,
              lat: cluster.geometry.coordinates[1],
              lng: cluster.geometry.coordinates[0],
            });
            return null;
          }

          // Show all clusters at high zoom levels (19+) to prevent splitting
          // At zoom 19+, even single properties should be treated as clusters if they're close together
          const shouldTreatAsSingleCluster = currentMapZoom >= 19 && !isCluster;

          // Reduced logging during cluster transitions for better performance
          if (!isClusterZoom) {
            console.log(
              `🗺️ Supercluster ${index}: count=${count}, isCluster=${isCluster}, zoom=${currentMapZoom}, shouldTreatAsSingleCluster=${shouldTreatAsSingleCluster}`
            );
          }

          // Check if this specific cluster matches the hovered property
          let isHovered = false;
          if (hoveredPriceMarker && !isCluster) {
            // For individual points, only highlight if it's a single property cluster that matches exactly
            const originalCluster = clusters.find(
              (c) =>
                Math.abs(c.lat - cluster.geometry.coordinates[1]) < 0.01 &&
                Math.abs(c.lng - cluster.geometry.coordinates[0]) < 0.01
            );

            if (
              originalCluster &&
              originalCluster.count === ListingEnum.ONE &&
              originalCluster.properties &&
              originalCluster.properties.length > ListingEnum.ZERO
            ) {
              const clusterProp = originalCluster.properties[0];
              const propId = clusterProp.comp_id || clusterProp.id;
              const hoveredId =
                hoveredPriceMarker.property.comp_id ||
                hoveredPriceMarker.property.id;

              // Only highlight if this is the EXACT property being hovered
              isHovered =
                propId === hoveredId ||
                propId?.toString() === hoveredId?.toString();
            }
          }

          // For individual points, use original cluster data
          if (!isCluster) {
            const originalCluster = clusters.find(
              (c) =>
                Math.abs(c.lat - cluster.geometry.coordinates[1]) < 0.001 &&
                Math.abs(c.lng - cluster.geometry.coordinates[0]) < 0.001
            );

            if (originalCluster) {
              // Temporarily render single property clusters as price markers for debugging
              if (originalCluster.count === 1) {
                console.log(
                  `� Rendering Supercluster single property cluster for debugging:`,
                  {
                    count: originalCluster.count,
                    lat: originalCluster.lat,
                    lng: originalCluster.lng,
                  }
                );

                // Use avgPrice from cluster data for single property clusters
                const price = originalCluster.avgPrice;
                const displayPrice =
                  price && !isNaN(price) && price > ListingEnum.ZERO ? price : null;
                const formattedPrice = displayPrice
                  ? formatAbbreviatedPrice(displayPrice)
                  : ListingEnum.NA;
                const markerWidth = Math.max(
                  80,
                  formattedPrice.length * 8 + 20
                );
                const markerHeight = 42;

                return (
                  <Marker
                    key={clusterId}
                    position={{
                      lat: cluster.geometry.coordinates[1],
                      lng: cluster.geometry.coordinates[0],
                    }}
                    icon={{
                      url: createPriceMarker(displayPrice, false, false),
                      scaledSize: new google.maps.Size(
                        markerWidth,
                        markerHeight
                      ),
                      anchor: new google.maps.Point(
                        markerWidth / ListingEnum.TWO,
                        markerHeight / ListingEnum.TWO
                      ),
                    }}
                    onClick={() => handleClusterClick(originalCluster)}
                    onMouseOver={async () => {
                      console.log(
                        '🔥 SINGLE PROPERTY MARKER HOVER - HITTING MAP-CLUSTERS API'
                      );
                      try {
                        const bounds = map?.getBounds();
                        if (bounds) {
                          const clustersParams = {
                            bounds: {
                              north: bounds.getNorthEast().lat(),
                              south: bounds.getSouthWest().lat(),
                              east: bounds.getNorthEast().lng(),
                              west: bounds.getSouthWest().lng(),
                            },
                            zoom: map?.getZoom() || currentZoom,
                            filters: getProperFilters(),
                          };

                          const response: any =
                            await APIClient.getInstance().post(
                              'comps/map-clusters',
                              clustersParams
                            );
                          console.log(
                            '🔥 MAP-CLUSTERS API RESPONSE (single property):',
                            response.data
                          );
                        }
                      } catch (error) {
                        console.error(
                          '❌ MAP-CLUSTERS API ERROR (single property):',
                          error
                        );
                      }
                      console.log('🔥 MARKER HOVER - CALLING MAP-CLUSTERS API');
                      handleMarkerEnter(clusterId, originalCluster);
                    }}
                    onMouseOut={() => handleMarkerLeave(clusterId)}
                    options={{
                      zIndex: isHovered ? ListingEnum.ONE_THOUSAND : ListingEnum.HUNDRED + index,
                    }}
                  />
                );
              }

              // Multiple properties or no property found - show cluster icon
              // Multiple properties - show cluster icon
              const iconSize = 45;
              const anchorPoint = 22.5;

              return (
                <Marker
                  key={clusterId}
                  position={{
                    lat: cluster.geometry.coordinates[1],
                    lng: cluster.geometry.coordinates[0],
                  }}
                  icon={{
                    url: createClusterIcon(originalCluster.count, isHovered),
                    scaledSize: new google.maps.Size(iconSize, iconSize),
                    anchor: new google.maps.Point(anchorPoint, anchorPoint),
                  }}
                  onClick={() => handleClusterClick(originalCluster)}
                  options={{
                    zIndex: isHovered ? ListingEnum.ONE_THOUSAND : ListingEnum.HUNDRED + index,
                  }}
                />
              );
            }
          }

          // For Supercluster clusters
          const iconSize = count > ListingEnum.ONE_THOUSAND ? 55 : 45;
          const anchorPoint = count > 1000 ? 27.5 : 22.5;

          return (
            <Marker
              key={clusterId}
              position={{
                lat: cluster.geometry.coordinates[1],
                lng: cluster.geometry.coordinates[0],
              }}
              icon={{
                url: createClusterIcon(count, isHovered),
                scaledSize: new google.maps.Size(iconSize, iconSize),
                anchor: new google.maps.Point(anchorPoint, anchorPoint),
              }}
              onClick={() => {
                if (isCluster) {
                  handleSuperclusterClick(cluster);
                }
              }}
              onMouseOver={async () => {
                console.log(
                  '🔥 SUPERCLUSTER MARKER HOVER - HITTING MAP-CLUSTER-DETAILS API'
                );
                try {
                  const bounds = map?.getBounds();
                  if (bounds) {
                    const clusterDetailsParams = {
                      bounds: {
                        north: bounds.getNorthEast().lat(),
                        south: bounds.getSouthWest().lat(),
                        east: bounds.getNorthEast().lng(),
                        west: bounds.getSouthWest().lng(),
                      },
                      zoom: map?.getZoom() || currentZoom,
                      page: 1,
                      limit: 10,
                      filters: getProperFilters(),
                    };

                    const response: any = await APIClient.getInstance().post(
                      'comps/map-cluster-details',
                      clusterDetailsParams
                    );
                    console.log(
                      '🔥 MAP-CLUSTER-DETAILS API RESPONSE (supercluster):',
                      response.data
                    );
                  }
                } catch (error) {
                  console.error(
                    '❌ MAP-CLUSTER-DETAILS API ERROR (supercluster):',
                    error
                  );
                }
              }}
              options={{
                zIndex: isHovered ? 1000 : 100 + index,
              }}
            />
          );
        })
        .filter(Boolean); // Remove null entries (invalid coordinates, etc.)

      console.log(
        `✅ Supercluster rendered ${renderedMarkers.length} markers out of ${superclusterClusters.length} clusters`
      );
      console.log('🔍 Supercluster rendered markers summary:', {
        totalSuperclusters: superclusterClusters.length,
        renderedMarkers: renderedMarkers.length,
        skippedCount: superclusterClusters.length - renderedMarkers.length,
      });
      return renderedMarkers;
    } else if (hasOriginalClusters) {
      // Render original clusters as fallback
      const originalRenderedMarkers = displayClusters
        .map((cluster, index) => {
          // Validate cluster data before rendering
          if (
            !cluster ||
            !cluster.lat ||
            !cluster.lng ||
            !cluster.count ||
            cluster.count <= 0
          ) {
            console.log('🚫 Skipping invalid cluster:', cluster);
            return null;
          }

          console.log(`🔍 Processing cluster ${index}:`, {
            count: cluster.count,
            lat: cluster.lat,
            lng: cluster.lng,
            willRenderAsPrice: cluster.count === ListingEnum.ONE,
            willRenderAsCluster: cluster.count > ListingEnum.ONE,
          });

          const clusterId = `original-cluster-${index}-${cluster.lat}-${cluster.lng}`;

          // Reduced logging during cluster transitions for better performance
          if (!isClusterZoom) {
            console.log(
              `🗺️ Original cluster ${index}: count=${cluster.count}, zoom=${currentMapZoom}`
            );
          }

          // Check if this specific cluster matches the hovered property
          let isHovered = false;
          if (hoveredPriceMarker && cluster.count === ListingEnum.ONE) {
            // Only highlight single property clusters that match the exact hovered property
            if (cluster.properties && cluster.properties.length > ListingEnum.ZERO) {
              const clusterProp = cluster.properties[0];
              const propId = clusterProp.comp_id || clusterProp.id;
              const hoveredId =
                hoveredPriceMarker.property.comp_id ||
                hoveredPriceMarker.property.id;

              // Only highlight if this is the EXACT property being hovered
              isHovered =
                propId === hoveredId ||
                propId?.toString() === hoveredId?.toString();
            }
          }

          // Render single property clusters as price markers
          if (cluster.count === 1) {
            console.log(`� Skipping single property cluster (count=1):`, {
              count: cluster.count,
              lat: cluster.lat,
              lng: cluster.lng,
              zoom: currentMapZoom,
            });

            // At lower zoom levels, render single properties as PRICE MARKERS instead of cluster icons
            const price = cluster.avgPrice;
            const displayPrice =
              price && !isNaN(price) && price > ListingEnum.ZERO ? price : null;
            const formattedPrice = displayPrice
              ? formatAbbreviatedPrice(displayPrice)
              : ListingEnum.NA;
            const markerWidth = Math.max(80, formattedPrice.length * 8 + 20);
            const markerHeight = 42;

            return (
              <Marker
                key={clusterId}
                position={{ lat: cluster.lat, lng: cluster.lng }}
                icon={{
                  url: createPriceMarker(displayPrice, false, isHovered),
                  scaledSize: new google.maps.Size(markerWidth, markerHeight),
                  anchor: new google.maps.Point(
                    markerWidth / 2,
                    markerHeight / 2
                  ),
                }}
                onClick={() => handleClusterClick(cluster)}
                onMouseOver={() => {
                  handleMarkerEnter(clusterId, cluster);
                }}
                onMouseOut={() => {
                  handleMarkerLeave(clusterId);
                }}
                options={{
                  zIndex: isHovered ? 1000 : 100 + index,
                }}
              />
            );
          } else {
            // Render multi-property cluster icon (count > 1) - ALWAYS render regardless of zoom level
            console.log(
              `🔍 Rendering cluster icon for multi-property cluster:`,
              {
                count: cluster.count,
                lat: cluster.lat,
                lng: cluster.lng,
                zoom: currentMapZoom,
                isZoom15Plus: currentMapZoom >= ListingEnum.FIFTEEN,
              }
            );

            const iconSize = cluster.count > ListingEnum.ONE_THOUSAND ? 55 : 45;
            const anchorPoint = cluster.count > ListingEnum.ONE_THOUSAND ? 27.5 : 22.5;

            const markerElement = (
              <Marker
                key={clusterId}
                position={{ lat: cluster.lat, lng: cluster.lng }}
                icon={{
                  url: createClusterIcon(cluster.count, isHovered),
                  scaledSize: new google.maps.Size(iconSize, iconSize),
                  anchor: new google.maps.Point(anchorPoint, anchorPoint),
                }}
                onClick={() => handleClusterClick(cluster)}
                onMouseOver={async () => {
                  console.log(
                    '🔥 MULTI-PROPERTY CLUSTER HOVER - HITTING MAP-CLUSTER-DETAILS API'
                  );
                  try {
                    const bounds = map?.getBounds();
                    if (bounds) {
                      const clusterDetailsParams = {
                        bounds: {
                          north: bounds.getNorthEast().lat(),
                          south: bounds.getSouthWest().lat(),
                          east: bounds.getNorthEast().lng(),
                          west: bounds.getSouthWest().lng(),
                        },
                        zoom: map?.getZoom() || currentZoom,
                        page: 1,
                        limit: 10,
                        filters: getProperFilters(),
                      };

                      const response: any = await APIClient.getInstance().post(
                        'comps/map-cluster-details',
                        clusterDetailsParams
                      );
                      console.log(
                        '🔥 MAP-CLUSTER-DETAILS API RESPONSE (multi-property cluster):',
                        response.data
                      );
                    }
                  } catch (error) {
                    console.error(
                      '❌ MAP-CLUSTER-DETAILS API ERROR (multi-property cluster):',
                      error
                    );
                  }
                }}
                options={{
                  zIndex: isHovered ? ListingEnum.ONE_THOUSAND : ListingEnum.HUNDRED + index,
                }}
              />
            );
            console.log('✅ RETURNING MULTI-PROPERTY MARKER:', {
              clusterId,
              count: cluster.count,
              position: { lat: cluster.lat, lng: cluster.lng },
              iconSize,
              zIndex: isHovered ? ListingEnum.ONE_THOUSAND : ListingEnum.HUNDRED + index,
            });
            return markerElement;
          }
        })
        .filter(Boolean); // Remove null entries (invalid coordinates, etc.)

      console.log(
        `✅ Original clusters rendered ${originalRenderedMarkers.length} markers out of ${displayClusters.length} clusters`
      );
      console.log('🔍 Rendered markers summary:', {
        totalClusters: displayClusters.length,
        renderedMarkers: originalRenderedMarkers.length,
        skippedCount: displayClusters.length - originalRenderedMarkers.length,
        clusterCounts: displayClusters.map((c) => c.count),
        multiPropertyClusters: displayClusters.filter((c) => c.count > 1)
          .length,
      });
      return originalRenderedMarkers;
    }

    return null;
  }, [
    clusters,
    superclusterClusters,
    dataReady,
    clustersForming,
    map,
    currentZoom,
    hoveredPriceMarker,
    // Removed isClusterZoom and pendingClusterUpdate to prevent re-renders during transitions
  ]);

  // Memoized individual markers rendering - show individual red markers at zoom >= 15

  // Memoized price markers rendering - DISABLED to prevent conflicts with individualMarkersRendered
  const priceMarkersRendered = React.useMemo(() => {
    // This system is disabled to prevent conflicts at zoom 14+
    // individualMarkersRendered handles all zoom >= 14 cases now
    return null;
  }, []);

  // Memoized hover marker rendering
  const hoverMarkerRendered = React.useMemo(() => {
    // Don't show hover marker when no property is hovered
    if (!hoveredPriceMarker) return null;

    const price =
      property_type === 'salesCheckbox' || !property_type
        ? hoveredPriceMarker.property.sale_price
        : hoveredPriceMarker.property.lease_rate;

    const formattedPrice = formatAbbreviatedPrice(price);
    const markerWidth = Math.max(80, formattedPrice.length * 8 + 20);

    return (
      <Marker
        key={`hover-price-marker-${hoveredPriceMarker.property.id}`}
        position={hoveredPriceMarker.position}
        icon={{
          url: createPriceMarker(price, true),
          scaledSize: new google.maps.Size(markerWidth, 42),
          anchor: new google.maps.Point(markerWidth / 2, 38),
        }}
        options={{
          zIndex: 2000,
        }}
      />
    );
  }, [hoveredPriceMarker, property_type, dataReady, clustersForming]);

  return isLoaded ? (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Fullscreen Toggle Button */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <button
          onClick={onFullscreenToggle}
          className="fullscreen-button-enhanced"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#555',
            transition: 'all 0.2s ease-in-out',
            position: 'relative',
            overflow: 'hidden',
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.color = '#0066cc';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#555';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
        >
          <div
            className="fullscreen-icon"
            style={{
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isFullscreen ? (
                // Exit fullscreen icon (compress/minimize)
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              ) : (
                // Enter fullscreen icon (expand)
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              )}
            </svg>
          </div>

          {/* Ripple effect overlay */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '0',
              height: '0',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 102, 204, 0.3)',
              transform: 'translate(-50%, -50%)',
              transition: 'width 0.3s ease-out, height 0.3s ease-out',
              pointerEvents: 'none',
            }}
            className="ripple-effect"
          />
        </button>
      </div>

      {/* Test button for debugging /comps/map/clusters API */}

      {/* Custom Zoom Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
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
              setIsUserInteraction(true); // Mark as user interaction
              const currentZoom = map.getZoom() || ListingEnum.ZERO;
              map.setZoom(Math.min(currentZoom + 1, 20));
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
              setIsUserInteraction(true); // Mark as user interaction
              const currentZoom = map.getZoom() || 0;
              map.setZoom(Math.max(currentZoom - 1, 3));
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

      {/* Application loader - only show during initial load, not during data updates */}
      {isInitialLoad && !hasInitialLoad && (
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
        mapContainerClassName={`googleMap map-container ${isFullscreen ? 'fullscreen-container entering' : 'fullscreen-container'}`}
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        options={mapOptions}
        onLoad={(map) => {
          mapRef.current = map; // Store map reference for fullscreen resize

          // Restore exact map view if we have saved bounds and zoom
          if (
            finalCurrentBounds &&
            finalCurrentBounds.north &&
            finalCurrentBounds.south &&
            finalCurrentBounds.east &&
            finalCurrentBounds.west &&
            finalCurrentMapZoom
          ) {
            // Calculate center from bounds
            const centerLat =
              (finalCurrentBounds.north + finalCurrentBounds.south) / 2;
            const centerLng =
              (finalCurrentBounds.east + finalCurrentBounds.west) / 2;

            // Set exact center and zoom instead of using fitBounds
            map.setCenter({ lat: centerLat, lng: centerLng });
            map.setZoom(finalCurrentMapZoom);

            // Initialize Supercluster clusters for restored view
            setTimeout(() => {
              const bounds = map.getBounds();
              if (bounds && updateSuperclusterClusters) {
                updateSuperclusterClusters(finalCurrentMapZoom, bounds);
              }
            }, 100);
          }

          handleMapLoad(map);
        }}
        onUnmount={onUnmount}
      >
        {/* Render clusters - disabled when zoom >= 14 to prevent overlap with individual markers */}
        {clustersRendered}

        {/* Individual property markers - disabled since single properties are now handled by clusters */}
        {null}

        {/* Price markers for single property clusters when zoom >= 14 */}
        {priceMarkersRendered}

        {/* Info windows for individual properties - works at all zoom levels */}
        {markerData
          .filter((marker) => marker.isOpen)
          .map((marker) => (
            <InfoWindow
              key={`info-${marker.propertyId}-${marker.isOpen ? 'open' : 'closed'}`}
              position={{ lat: marker.lat, lng: marker.lng }}
              options={{
                disableAutoPan: false,
                pixelOffset: calculateInfoWindowOffset(marker.lat, marker.lng),
              }}
            >
              <div
                style={{
                  position: 'relative',
                  // margin: '-10px',
                  padding: '0',
                }}
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 0px 10px',
                    margin: '0px ',
                    position: 'fixed',
                    top: '10px',
                    left: '20px',
                    right: '20px',
                    zIndex: 99,
                  }}
                >
                  <input
                    type="checkbox"
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      margin: '0',
                    }}
                    checked={selectedIds.includes(
                      marker.propertyId?.toString() || ''
                    )}
                    onChange={() => {
                      if (handleCheckboxToggle && marker.propertyId) {
                        const id = marker.propertyId.toString();
                        const maxSelectable = 4 - finalCompsLength;
                        const isCurrentlySelected = selectedIds.includes(id);

                        // Use the same logic as FilteredMapSideListing
                        if (
                          !isCurrentlySelected &&
                          selectedIds.length >= maxSelectable
                        ) {
                          toast.error(
                            `${finalCompsLength} comp${finalCompsLength === 1 ? '' : 's'} ${
                              finalCompsLength === 1 ? 'is' : 'are'
                            } already linked. You can only link up to ${maxSelectable} more.`
                          );
                          return;
                        }

                        handleCheckboxToggle(id);
                      }
                    }}
                  />
                  <button
                    onClick={handleCloseInfoWindow}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      padding: '0',
                      width: '25px',
                      height: '25px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#0da1c7',
                      borderRadius: '50%',
                    }}
                  >
                    ×
                  </button>
                </div>
                {marker.propertyData ? (
                  <PropertyCard
                    key={`property-card-${marker.propertyId}`}
                    elem={marker.propertyData}
                    index={0}
                    viewListingItem={viewListingItem}
                    updateListingItem={updateListingItem}
                    formatLandType={formatLandType}
                    formatZoningTypes={formatZoningTypes}
                    checkType={property_type}
                    hideEditButton={hideEditButton}
                    selectedToggleButton={selectedToggleButton}
                    isPopup={true}
                    zoomLevel={currentZoom}
                  />
                ) : (
                  marker.content
                )}
              </div>
            </InfoWindow>
          ))}

        {/* Price marker for listing hover */}
        {hoverMarkerRendered}
      </GoogleMap>

      {/* Cluster count indicator from /comps/map/clusters API */}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Show only triangular pointer, hide rectangular stem */
        
        /* Hide the rectangular stem/connector */
        .gm-style-iw-chr > div {
          display: none !important;
        }
        
        /* Show triangular pointer only */
        .gm-style-iw-tc::after,
        .gm-style-iw-tc::before {
          display: block !important;
          background: white !important;
          border-color: rgba(0,0,0,0.2) transparent !important;
        }
        
        /* Hide the rectangular tail container content */
        .gm-style-iw-tc > div {
          display: none !important;
        }
        
        /* Style InfoWindow container */
        .gm-style-iw {
          display: block !important;
          background: white !important;
          box-shadow: 0 2px 7px 1px rgba(0,0,0,0.3) !important;
          border-radius: 8px !important;
        }
        
        /* Ensure InfoWindow content is visible */
        .gm-style-iw-d {
          display: block !important;
        }
        
        /* Ensure InfoWindow content container is visible */
        .gm-style-iw-c {
          display: block !important;
        }
        
        /* Style only the triangular pointer */
        .gm-style-iw-tc {
          background: transparent !important;
        }
        
        /* Enhance triangular pointer appearance */
        .gm-style-iw-tc::after {
          border-top-color: white !important;
          border-width: 10px 10px 0 10px !important;
        }
        
        .gm-style-iw-tc::before {
          border-top-color: rgba(0,0,0,0.2) !important;
          border-width: 11px 11px 0 11px !important;
          margin-left: -1px !important;
          margin-top: 1px !important;
        }
        
        /* Remove transitions for smooth hover */
        .gm-style-iw,
        .gm-style-iw-d,
        .gm-style-iw-c {
          transition: none !important;
        }
      `}</style>
    </div>
  ) : (
    <div>{ListingEnum.LOADING_GOOGLE_MAPS}</div>
  );
};

export default React.memo(GoogleMapLocationComps);
