import { Box, Grid, Stack } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import image1 from '../../../images/list.jpg';
import { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import { ListingEnum, PaginationEnum } from '../enum/CompsEnum';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import print from '../../../images/print.svg';
import AiImage from '../../../images/AI SVG.svg';
import { ClearIcon } from '@mui/x-date-pickers';
import axios from 'axios';
import { APIClient } from '@/api/api-client';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';
import { Icons } from '@/components/icons';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import DeleteConfirmationModal from './delete-confirmation';

interface CompsListingMapProps {
  typeFilter: string;
  typeProperty: any;
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
  onApiDataUpdate?: any;
  uploadCompsStatus: any;
  onPropertyFocus?: (propertyId: number | null) => void; // New prop for property focusing
  onPropertyHover?: (propertyId: number | null) => void; // New prop for property hover
  data?: IComp[] | null; // Override data prop for cluster filtering (allow null)
  isClusterFiltered?: boolean; // Indicates if data is cluster filtered
  clearClusterFilter?: () => void; // Function to clear cluster filter
  mapBounds?: {
    // Current map bounds from GoogleMapLocationComps
    north: number;
    south: number;
    east: number;
    west: number;
  };
  mapZoom?: number; // Current map zoom level
  hasMapDataUpdate?: boolean; // Indicates if data came from map
  onClustersApiUpdate?: (clusters: any[]) => void; // Callback to update clusters on the map
}

interface typeResponse {
  data: {
    data: {
      properties: IComp[];
      page: number;
      perPage: number;
      totalRecord: number;
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
  onApiDataUpdate,
  onPropertyFocus,
  onPropertyHover,
  data: externalData, // Renamed to avoid confusion with internal data
  isClusterFiltered = false,
  clearClusterFilter,
  mapBounds, // Current map bounds
  mapZoom, // Current map zoom
  hasMapDataUpdate = false, // Indicates if data came from map
  onClustersApiUpdate,
  compFilters,
}) => {
  console.log(' SideListingMap - Component rendered with props:', compFilters);

  const navigate = useNavigate();
  // const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  console.log('🏠 SideListingMap - externalData received:', externalData);
  console.log('🏠 SideListingMap - externalData length:', externalData?.length);
  console.log('🏠 SideListingMap - externalData type:', typeof externalData);
  console.log(
    '🏠 SideListingMap - externalData is null?',
    externalData === null
  );
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [allOriginalData, setAllOriginalData] = useState<any[]>([]);
  const [paginatedOriginalData, setPaginatedOriginalData] = useState<any[]>([]);
  console.log('🏠 SideListingMap - onApiDataUpdate prop:', onApiDataUpdate);
  // Debug when externalData changes
  useEffect(() => {
    console.log('🏠📡 SideListingMap - externalData changed:', {
      externalData,
      allOriginalData,
      length: externalData?.length,
      isNull: externalData === null,
      isArray: Array.isArray(externalData),
      firstItem: externalData?.[0],
    });
  }, [externalData]);

  // const [loading,setLoading]=useState<boolean>(false);
  const parameterType =
    checkType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: `cluster-details/${parameterType}`,
    endPoint: 'comps/map-cluster-details',
    requestType: RequestType.POST,
  });
  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    localStorage.setItem('checkType', e.target.id);
    localStorage.removeItem('approachType');

    setSelectedIds([]);
    localStorage.removeItem('compStatus');
    const selectedType = e.target.id;
    setCheckType(selectedType); // Update state for selected checkbox
    passSetCheckType(selectedType); // Call the function passed in props

    // Clear values from localStorage if the checkbox is toggled
    const keysToRemove = [
      'all',
      'cap_rate_max',
      'state',
      'street_address',
      'property_type',
      'price_sf_min',
      'price_sf_max',
      'building_sf_min',
      'building_sf_max',
      'square_footage_min',
      'square_footage_max',
      'start_date',
      'end_date',
      'lease_type',
      'selectedCities',
      'land_sf_max',
      'land_sf_min',
      'street_address_comps',
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key); // Remove all the specified keys
    });

    // Optionally, set empty or default values for compStatus and property_type
    localStorage.setItem('property_type', '');

    // Reset params and checkStatus if they are set in localStorage
    localStorage.removeItem('params');
    localStorage.removeItem('checkStatus');

    setPage(1); // Reset the page to the first page
  };
  useEffect(() => {
    if (checkType === 'salesCheckbox') {
      localStorage.removeItem('compStatus');
    }
  }, [checkType]);

  useEffect(() => {
    // Skip API call if we have cluster-filtered data (from clicking on clusters)
    if (isClusterFiltered && externalData && externalData.length > 0) {
      console.log(
        '📡 Skipping internal API call - using cluster-filtered data (length:',
        externalData?.length,
        ')'
      );
      return;
    }

    // Skip API call if we have fresh map data and we're on page 1
    if (hasMapDataUpdate && externalData && page === 1) {
      console.log(
        '📡 Skipping internal API call - using fresh map data for page 1'
      );
      return;
    }

    console.log(
      '📡 Making cluster-details API call - using backend pagination mode'
    );

    const fetchData = async () => {
      // Use map bounds if available, otherwise use world bounds
      const bounds = mapBounds || {
        north: 85, // Default world bounds
        south: -85,
        east: 180,
        west: -180,
      };

      const zoom = mapZoom || 5; // Better default zoom for US

      // Get filter parameters from localStorage and props
        const buildingMin = localStorage.getItem('building_sf_min')
            ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
            :  null;
      const buildingMax = localStorage.getItem('building_sf_max')
        ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
        :  null;
      const landMin = localStorage.getItem('land_sf_min')
        ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
        :  null;
      const landMax = localStorage.getItem('land_sf_max')
        ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
        :  null;
      const capRateMin = localStorage.getItem('cap_rate_min')
        ? parseFloat(localStorage.getItem('cap_rate_min')!.replace(/,/g, ''))
        :  null;
      const capRateMax = localStorage.getItem('cap_rate_max')
        ? parseFloat(localStorage.getItem('cap_rate_max')!.replace(/,/g, ''))
        :  null;
      const priceSfMin = localStorage.getItem('price_sf_min')
        ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
        :  null;
      const priceSfMax = localStorage.getItem('price_sf_max')
        ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
        :  null;
      const squareFootageMin = localStorage.getItem('square_footage_min')
        ? parseFloat(localStorage.getItem('square_footage_min')!.replace(/,/g, ''))
        :  null;
      const squareFootageMax = localStorage.getItem('square_footage_max')
        ? parseFloat(localStorage.getItem('square_footage_max')!.replace(/,/g, ''))
        :  null;
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

      // Prepare params for cluster-details API with pagination and all filters
      const params: paramsType = {
        bounds,
        zoom,
        page: page, // Current page from state
        limit: 10, // Items per page
        filters: {
          building_sf_max: buildingMax,
          building_sf_min: buildingMin,
          cap_rate_max: capRateMax,
          cap_rate_min: capRateMin,
          city: cityArray,
          compStatus: compStatus || '',
          comp_type: compType,
          end_date: endDate || null,
          land_dimension:
            !localStorage.getItem('selectedSize') ||
            localStorage.getItem('selectedSize') === 'SF'
              ? 'SF'
              : 'ACRE',
          land_sf_max: landMax,
          land_sf_min: landMin,
          lease_type: leaseType || null,
          orderBy: _sortingSettings?.orderSorting || 'DESC',
          orderByColumn: _sortingSettings?.sortingType || 'date_sold',
          price_sf_max: priceSfMax,
          price_sf_min: priceSfMin,
          propertyType: propertyTypeArray,
          search: _searchValuesByfilter || '',
          square_footage_max: squareFootageMax,
          square_footage_min: squareFootageMin,
          start_date: startDate || null,
          state: state || null,
          street_address: streetAddress || null,
          type: parameterType,
        },
      };

      console.log('📡 API params:', params);

      try {
        await mutation.mutateAsync(params);
      } catch (error) {
        console.error('Error while mutating data:', error);
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
    // Filter dependencies to trigger API calls when filters change
    _sortingSettings, // Sort changes should trigger new API calls
    _searchValuesByfilter, // Search changes should trigger new API calls
    _typeFilter, // Status filter changes should trigger new API calls
    _typeProperty, // Property type changes should trigger new API calls
    _sidebarFilters, // Sidebar filter changes should trigger new API calls
  ]);

  // Call map-clusters API whenever filters/bounds/zoom change and update map clusters
  useEffect(() => {
    const bounds = mapBounds || {
      north: 85,
      south: -85,
      east: 180,
      west: -180,
    };
    const zoom = mapZoom || 5;

    const buildingMin = localStorage.getItem('building_sf_min')
            ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
            :  null;
    const buildingMax = localStorage.getItem('building_sf_max')
            ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
            :  null;
    const landMin = localStorage.getItem('land_sf_min')
            ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
            :  null;
    const landMax = localStorage.getItem('land_sf_max')
            ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
            :  null;
    const capRateMin = localStorage.getItem('cap_rate_min')
            ? parseFloat(localStorage.getItem('cap_rate_min')!.replace(/,/g, ''))
            :  null;
    const capRateMax = localStorage.getItem('cap_rate_max')
            ? parseFloat(localStorage.getItem('cap_rate_max')!.replace(/,/g, ''))
            :  null;
    const priceSfMin = localStorage.getItem('price_sf_min')
            ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
            :  null;
    const priceSfMax = localStorage.getItem('price_sf_max')
            ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
            :  null;
    const squareFootageMin = localStorage.getItem('square_footage_min')
            ? parseFloat(localStorage.getItem('square_footage_min')!.replace(/,/g, ''))
            :  null;
    const squareFootageMax = localStorage.getItem('square_footage_max')
            ? parseFloat(localStorage.getItem('square_footage_max')!.replace(/,/g, ''))
            :  null;
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

    const clustersParams = {
      bounds,
      zoom,
      filters: {
        building_sf_max: buildingMax,
        building_sf_min: buildingMin,
        cap_rate_max: capRateMax,
        cap_rate_min: capRateMin,
        city: cityArray,
        compStatus: compStatus || '',
        comp_type: compType,
        end_date: endDate || null,
        land_dimension:
          !localStorage.getItem('selectedSize') ||
          localStorage.getItem('selectedSize') === 'SF'
            ? 'SF'
            : 'ACRE',
        land_sf_max: landMax,
        land_sf_min: landMin,
        lease_type: leaseType || null,
        orderBy: _sortingSettings?.orderSorting || 'DESC',
        orderByColumn: _sortingSettings?.sortingType || 'date_sold',
        price_sf_max: priceSfMax,
        price_sf_min: priceSfMin,
        propertyType: propertyTypeArray,
        search: _searchValuesByfilter || '',
        square_footage_max: squareFootageMax,
        square_footage_min: squareFootageMin,
        start_date: startDate || null,
        state: state || null,
        street_address: streetAddress || null,
        type: parameterType,
      },
    };

    APIClient.getInstance()
      .post<any, typeof clustersParams>('comps/map-clusters', clustersParams)
      .then((res: any) => {
        const clusters = res?.data?.data?.clusters || [];
        // Always call onClustersApiUpdate, even if clusters array is empty
        // This ensures the map clears previous clusters when no results are found
        if (onClustersApiUpdate) {
          onClustersApiUpdate(clusters);
          console.log('🗺️ Updated map clusters:', clusters.length, 'clusters');
        }
      })
      .catch((err: any) => {
        console.error('Error fetching map clusters:', err);
        // On error, also clear clusters
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
  ]);

  // Debug external data changes
  useEffect(() => {
    // Debug logging removed
  }, [externalData]);

  // Debug paginatedOriginalData changes
  useEffect(() => {
    // Debug logging removed
  }, [paginatedOriginalData]);

  // Update data state when API data changes
  useEffect(() => {
    // Use cluster-filtered data if available (from map cluster clicks)
    if (isClusterFiltered && externalData && externalData.length > 0) {
      console.log(
        '📊 Using cluster-filtered data - showing all',
        externalData?.length,
        'items from cluster'
      );
      setAllOriginalData(externalData || []);
      setPaginatedOriginalData(externalData || []); // Show all external data
    }
    // Use external data from map for page 1, then API data for other pages
    else if (hasMapDataUpdate && externalData && page === 1) {
      console.log(
        '📊 Using map data for page 1 - showing',
        externalData.length,
        'items from map'
      );
      setAllOriginalData(externalData);
      setPaginatedOriginalData(externalData);
    }
    // Use backend API data for all other cases
    else {
      const backendData = mutation.data?.data.data.properties || [];
      console.log(
        '📊 Using backend cluster-details data - showing',
        backendData.length,
        'items for page',
        page
      );
      setAllOriginalData(backendData);
      setPaginatedOriginalData(backendData); // Backend already provides paginated data
    }
  }, [mutation.data, externalData, isClusterFiltered, page, hasMapDataUpdate]);

  // Add a useEffect to log when data variable changes
  useEffect(() => {
    // const finalData =
    //   externalData !== undefined && externalData !== null
    //     ? externalData
    //     : paginatedOriginalData;
    // Debug logging removed
  }, [externalData, paginatedOriginalData]);

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const viewListingItem = (id: number) => {
    let check;
    if (checkType === 'salesCheckbox') {
      check = 'sales';
    } else {
      check = 'lease';
    }
    navigate(`/comps-view/${id}/${check}`, {
      state: {
        selectedToggleButton: selectedToggleButton || null, // Optional parameter
      },
    });
  };

  const updateListingItem = (id: number) => {
    navigate(`/update-comps/${id}`);
  };

  const handlePreviousPage = () => {
    setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage: any) => Math.max(prevPage + 1, 1));
  };

  if (mutation.isLoading) {
    return <>{ListingEnum.LOADING}....</>;
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
    : mutation.data?.data.data.totalRecord || 0; // For normal listing, use backend total
  const data = hasExternalData ? externalData : paginatedOriginalData;

  console.log('🏠🎯 SideListingMap - Final data for rendering:', {
    data,
    dataLength: data?.length,
    dataSource: hasExternalData
      ? 'external (cluster-filtered)'
      : hasMapDataUpdate && page === 1
        ? 'map API (page 1)'
        : 'backend listing API',
    externalDataValue: externalData,
    externalDataLength: externalData?.length,
    paginatedDataLength: paginatedOriginalData?.length,
    currentPage: page,
    totalItems: totalItems,
    backendTotalRecord: mutation.data?.data.data.totalRecord,
    isClusterFiltered,
    hasExternalData,
    shouldShowPagination,
    hasMapDataUpdate,
    mapBounds,
    mapZoom,
  });

  // Only call passGoogleData if we're using backend data and not cluster filtered
  // When using cluster-filtered data, the map already has the data
  if (!isClusterFiltered) {
    // For backend pagination, pass the current page data to map for clustering
    passGoogleData(paginatedOriginalData);
  }
  function formatDateToMMDDYYYY(dateString: any) {
    if (!dateString) return '';

    // Ensure the input is in the correct format
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return 'Invalid date format';

    return `${month}/${day}/${year}`;
  }
  const isAllSelected =
    data.every((item) => selectedIds.includes(item.id)) && data.length > 0;

  const handleSelectAll = () => {
    const currentPageIds = data.map((item) => item.id); // IDs of items on the current page

    if (isAllSelected) {
      // Deselect only the items from the current page
      setSelectedIds((prevSelectedIds) =>
        prevSelectedIds.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      // Add the current page's IDs to the selected IDs
      setSelectedIds((prevSelectedIds) => [
        ...prevSelectedIds,
        ...currentPageIds.filter((id) => !prevSelectedIds.includes(id)), // Avoid duplicates
      ]);
    }
  };
  const handleCheckboxToggle = (id: any) => {
    setSelectedIds(
      (prevSelectedIds) =>
        prevSelectedIds.includes(id)
          ? prevSelectedIds.filter((itemId) => itemId !== id) // Remove if already selected
          : [...prevSelectedIds, id] // Add to selection
    );
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
  const setArrayAfterDelete = (event: any) => {
    setDeleteBoolean(event);
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
                  {data && data.length === 0 ? (
                    ''
                  ) : (
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
                  )}
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
              <Box
                sx={{
                  height: '58vh',
                  fontFamily: 'montserrat-normal',
                  '&::-webkit-scrollbar': {
                    width: '10px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#0DA1C7',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(90, 90, 90, 1)',
                    borderRadius: '6px',
                  },
                }}
                className="overflow-scroll xl:h-[calc(100vh-278px)] p-3.5 pt-0"
              >
                {data.length === 0 ? (
                  <div>{ListingEnum.N0_RECORDS_FOUND}</div>
                ) : (
                  <>
                    {data.length &&
                      data.map((ele: any, index: number) => (
                        <Box
                          key={index}
                          className="flex relative bg-[white] rounded-lg w-full mb-4 p-2 border border-solid border-[#f3f3f3] gap-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-200"
                          style={{
                            boxShadow: '4px 7px 5px 7px #00000008',
                          }}
                          onMouseEnter={() => {
                            // Focus this property on the map when hovering
                            if (onPropertyFocus) {
                              onPropertyFocus(ele.id);
                            }
                            // Also call hover callback
                            if (onPropertyHover) {
                              onPropertyHover(ele.id);
                            }
                          }}
                          onMouseLeave={() => {
                            // Remove focus when not hovering
                            if (onPropertyFocus) {
                              onPropertyFocus(null);
                            }
                            // Also call hover callback
                            if (onPropertyHover) {
                              onPropertyHover(null);
                            }
                          }}
                        >
                          <Box className="w-5">
                            <label className="comp-select">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(ele.id)}
                                onChange={() => handleCheckboxToggle(ele.id)}
                              />
                              <span className="checkmark"></span>
                            </label>
                          </Box>
                          <Box className="flex-1">
                            <img
                              style={{
                                width: '100%',
                                maxWidth: '170px',
                                objectFit: 'cover',
                                height: 'auto',
                                minHeight: '115px',
                                objectPosition: 'center center',
                              }}
                              src={
                                ele.property_image_url
                                  ? import.meta.env.VITE_S3_URL +
                                    ele.property_image_url
                                  : image1
                              }
                              className="rounded-img-list-comps"
                            />
                          </Box>
                          <Box className="flex-1 py-3">
                            <Box className="flex mb-1.5">
                              <Box className="text-[#0DA1C7] text-base font-semibold capitalize leading-6">
                                {ele.street_address}
                              </Box>
                            </Box>
                            <Box className="text-sm flex text-left">
                              <Tooltip title={`${ele.street_address}`}>
                                <Box className="text-sm text-ellipsis overflow-hidden">
                                  {ele.street_address}
                                </Box>
                              </Tooltip>
                            </Box>

                            <Tooltip
                              title={`${ele.city}, ${ele.state.toUpperCase()}, ${ele.zipcode}`}
                            >
                              <Box className="text-sm py-0.5 text-ellipsis overflow-hidden">
                                {`${ele.city}, ${ele.state.toUpperCase()}, ${ele.zipcode}`}
                              </Box>
                            </Tooltip>
                            {localStorage.getItem('activeType') ===
                            'building_with_land' ? (
                              <Box className="flex gap-1 text-sm flex-wrap">
                                <p className="text-nowrap">Year Built :</p>
                                <p>
                                  {ele?.year_built === null ||
                                  ele?.year_built === ''
                                    ? 'N/A'
                                    : ele?.year_built}
                                </p>
                              </Box>
                            ) : null}
                          </Box>
                          <Box className="text-sm flex-1 py-3 min-w-52">
                            {localStorage.getItem('activeType') !==
                            'land_only' ? (
                              <Box className="flex gap-1 flex-wrap">
                                <p>Building Size :</p>
                                <p>
                                  {ele?.building_size === null ||
                                  ele?.building_size === ''
                                    ? 'N/A'
                                    : ele?.building_size.toLocaleString() +
                                      ' ' +
                                      'SF'}
                                </p>
                              </Box>
                            ) : null}

                            {localStorage.getItem('activeType') ===
                            'building_with_land' ? (
                              <Box className="flex gap-1 flex-wrap">
                                <p className="text-sm">Land Size :</p>
                                <p className="text-[13px]">
                                  {ele.land_dimension === 'ACRE'
                                    ? ele?.land_size === null ||
                                      ele?.land_size === ''
                                      ? 'N/A'
                                      : (
                                          ele?.land_size * 43560
                                        )?.toLocaleString() +
                                        ' ' +
                                        'SF'
                                    : ele?.land_size === null ||
                                        ele?.land_size === ''
                                      ? 'N/A'
                                      : ele?.land_size?.toLocaleString() +
                                        ' ' +
                                        'SF'}
                                </p>
                              </Box>
                            ) : (
                              // }
                              <Box className="flex gap-1 flex-wrap">
                                <p className="text-sm">Land Size :</p>
                                <p className="text-[13px]">
                                  {
                                    selectedToggleButton === 'SF' // Check if the selected toggle is "SF"
                                      ? ele.land_dimension === 'ACRE' // If the land dimension is in "ACRE"
                                        ? ele?.land_size === null ||
                                          ele?.land_size === '' // Check for null or empty value
                                          ? 'N/A'
                                          : (
                                              ele?.land_size * 43560
                                            )?.toLocaleString() + ' SF' // Convert to SF
                                        : ele?.land_size === null ||
                                            ele?.land_size === '' // If already in SF, just check for null or empty value
                                          ? 'N/A'
                                          : ele?.land_size?.toLocaleString() +
                                            ' SF' // Display as is in SF
                                      : selectedToggleButton === 'AC' // Check if the selected toggle is "ACRE"
                                        ? ele.land_dimension === 'SF' // If the land dimension is in "SF"
                                          ? ele?.land_size === null ||
                                            ele?.land_size === '' // Check for null or empty value
                                            ? 'N/A'
                                            : (ele?.land_size / 43560)
                                                ?.toFixed(3)
                                                .toLocaleString() + ' AC' // Convert to ACRE
                                          : ele?.land_size === null ||
                                              ele?.land_size === '' // If already in ACRE, just check for null or empty value
                                            ? 'N/A'
                                            : ele?.land_size
                                                .toFixed(3)
                                                .toLocaleString() + ' AC' // Display as is in ACRE
                                        : 'N/A' // Default fallback if no toggle is selected
                                  }
                                </p>
                              </Box>
                            )}
                            {checkType === 'salesCheckbox' ? (
                              <Box className="flex gap-1 flex-wrap">
                                <p className="text-sm">
                                  {ele?.sale_status === 'Pending'
                                    ? 'Sale Status :'
                                    : 'Date of Sale :'}
                                </p>
                                <p className="text-[13px]">
                                  {ele?.sale_status === 'Pending'
                                    ? ele?.sale_status
                                    : formatDateToMMDDYYYY(ele?.date_sold)}
                                </p>
                              </Box>
                            ) : (
                              <Box className="flex gap-1 flex-wrap">
                                <p>Lease Status :</p>
                                <p>
                                  {ele?.lease_status === 'select' ||
                                  ele?.lease_status === ''
                                    ? 'N/A'
                                    : ele?.lease_status === 'new_lease'
                                      ? 'New Lease'
                                      : ele?.lease_status}
                                </p>
                              </Box>
                            )}
                            <div
                              className={`flex justify-end items-center mt-2.5 ${
                                localStorage.getItem('activeType') ===
                                'land_only'
                                  ? 'mt-7'
                                  : ''
                              }`}
                            >
                              {ele.ai_generated === 1 && (
                                <img
                                  src={AiImage}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    marginRight: '5px',
                                    // marginLeft: '139px',
                                  }}
                                />
                              )}
                              <Box>
                                <a href={`/comps-view/${ele.id}`}>
                                  <CommonButton
                                    variant="contained"
                                    className="text-xs"
                                    color="primary"
                                    style={{
                                      borderRadius: '0 0 0 10px',
                                      padding: '2.5px 20px',
                                      textTransform: 'capitalize',
                                    }}
                                    onClick={(e: any) => {
                                      e.preventDefault();
                                      viewListingItem(ele.id);
                                    }}
                                  >
                                    {ListingEnum.VIEW}
                                  </CommonButton>
                                </a>
                              </Box>

                              <Box className="ml-1">
                                <a
                                  href={`/update-comps/${ele.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (e.button === 0) {
                                      updateListingItem(ele.id);
                                    }
                                  }}
                                >
                                  <CommonButton
                                    variant="contained"
                                    color="primary"
                                    className="text-xs"
                                    style={{
                                      borderRadius: '0px 0px 10px',
                                      // fontSize: '12px',
                                      padding: '2.5px 20px',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {ListingEnum.EDIT}
                                  </CommonButton>
                                </a>
                              </Box>
                              <Icons.DeleteIcon
                                className="text-red-500 cursor-pointer"
                                onClick={() => deleteListingItem(ele?.id)}
                              />
                            </div>
                          </Box>
                        </Box>
                      ))}
                  </>
                )}
              </Box>
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
            />
          </CompDeleteModal>
        ) : null}
      </Box>
    </>
  );
};
export default SideListingMap;
