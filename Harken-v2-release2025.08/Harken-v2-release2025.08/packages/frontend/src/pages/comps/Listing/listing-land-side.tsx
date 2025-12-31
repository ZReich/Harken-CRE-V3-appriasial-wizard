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
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';
import { Icons } from '@/components/icons';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import DeleteConfirmationModal from './delete-confirmation';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';
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
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  uploadCompsStatus: any;
  onPropertyFocus?: (propertyId: number | null) => void; // New prop for property focusing
  onPropertyHover?: (propertyId: number | null) => void; // New prop for property hover
  onClusterFilter?: (properties: IComp[]) => void; // New prop for cluster filtering
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null; // Map viewport bounds for filtering
  isMapViewportFiltered?: boolean; // Indicates if data is filtered by map viewport
  data?: IComp[]; // Override data from cluster-details API
  isClusterFiltered?: boolean; // Indicates if data is from cluster API
  clearClusterFilter?: () => void; // Function to clear cluster filter
}

interface typeResponse {
  data: {
    data: {
      comps: IComp[];
      page: number;
      perPage: number;
      totalRecord: number;
    };
  };
}
interface paramsType extends Partial<FilterComp> {
  type: any; // Already present
  limit: any; // Already present
  page: any; // Already present
  compStatus?: any; // Optional
  propertyType?: any; // Optional
  search?: any; // Optional
  orderByColumn?: any; // Optional
  orderBy?: any; // Optional
  state?: any; // Optional
  street_address?: any; // Optional
  cap_rate_min?: any; // Optional
  cap_rate_max?: any; // Optional
  price_sf_min?: any; // Optional
  price_sf_max?: any; // Optional
  land_sf_min?: any; // Optional
  land_sf_max?: any; // Optional
  square_footage_min?: any; // Optional
  square_footage_max?: any; // Optional
  building_sf_min?: any; // Optional
  building_sf_max?: any; // Optional
  start_date?: any; // Optional
  end_date?: any; // Optional
  city?: any; // Optional
  land_dimension: any;
}

const SideLandListingMap: React.FC<CompsListingMapProps> = ({
  typeFilter,
  searchValuesByfilter,
  sidebarFilters,
  typeProperty,
  passGoogleData,
  passSetCheckType,
  // passDataCheckType,
  sortingSettings,
  checkType,
  setCheckType,
  setLoading,
  loading,
  selectedToggleButton,
  page,
  setPage,
  uploadCompsStatus,
  onPropertyFocus,
  mapBounds = null,
  isMapViewportFiltered = false,
  data: clusterData = undefined, // Cluster data from API
  isClusterFiltered = false, // Whether data is from cluster API
}) => {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [deleteBoolean, setDeleteBoolean] = useState('');
  // const [loading,setLoading]=useState<boolean>(false);
  const parameterType =
    checkType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: `list/${parameterType}`,
    endPoint: 'comps/list',
    requestType: RequestType.POST,
  });

  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedIds([]);
    // localStorage.removeItem('compStatus');
    const selectedType = e.target.id;
    setCheckType(selectedType); // Update state for selected checkbox
    passSetCheckType(selectedType); // Call the function passed in props

    // Clear values from localStorage if the checkbox is toggled
    ClearAdditionalStorage();

    // Optionally, set empty or default values for compStatus and property_type
    localStorage.setItem('property_type', '');

    // Reset params and checkStatus if they are set in localStorage
    localStorage.removeItem('params');
    localStorage.removeItem('checkStatus');

    setPage(1); // Reset the page to the first page
  };
  // useEffect(() => {
  //   if (checkType === 'salesCheckbox') {
  //     localStorage.removeItem('compStatus');
  //   }
  // }, [checkType]);
  const compsPropertyType = localStorage.getItem('property_type');
  const compsPropertyType1: string[] = compsPropertyType
    ? compsPropertyType.split(',')
    : []; // Safely split the string or set as an empty array
  const compStatus = localStorage.getItem('compStatus') || '';
  useEffect(() => {
    // Skip API call if cluster data is being used
    if (isClusterFiltered && clusterData) {
      console.log('📡 Using cluster data, skipping comps/list API call');
      return;
    }

    const fetchData = async () => {
      // Fetch values from localStorage
      const state = localStorage.getItem('state') || null;
      const street_address = localStorage.getItem('street_address') || null;
      const cap_rate_min = localStorage.getItem('all')
        ? Number(localStorage.getItem('all')!.replace('%', ''))
        : null;
      const cap_rate_max = localStorage.getItem('cap_rate_max')
        ? Number(localStorage.getItem('cap_rate_max')!.replace('%', ''))
        : null;
      const price_sf_min = localStorage.getItem('price_sf_min')
        ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
        : null;
      const price_sf_max = localStorage.getItem('price_sf_max')
        ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
        : null;
      const land_sf_min = localStorage.getItem('land_sf_min')
        ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
        : null;
      const building_sf_min = localStorage.getItem('building_sf_min')
        ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
        : null;
      const building_sf_max = localStorage.getItem('building_sf_max')
        ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
        : null;
      const land_sf_max = localStorage.getItem('land_sf_max')
        ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
        : null;

      const start_date = localStorage.getItem('start_date') || null;
      const end_date = localStorage.getItem('end_date') || null;

      const square_footage_min = localStorage.getItem('square_footage_min')
        ? parseFloat(
            localStorage.getItem('square_footage_min')!.replace(/,/g, '')
          )
        : null;
      const square_footage_max = localStorage.getItem('square_footage_max')
        ? parseFloat(
            localStorage.getItem('square_footage_max')!.replace(/,/g, '')
          )
        : null;
      const lease_type = localStorage.getItem('lease_type') || null;
      // Get selectedCities from localStorage and split it into an array
      const city = localStorage.getItem('selectedCities')
        ? JSON.parse(localStorage.getItem('selectedCities')!)
        : [];
      const compType = localStorage.getItem('activeType');
      // Prepare params
      const params: paramsType = {
        limit: 0, // Set to 0 to get all data for clustering and frontend pagination
        land_dimension:
          !localStorage.getItem('selectedSize') ||
          localStorage.getItem('selectedSize') === 'SF'
            ? 'SF'
            : 'ACRE',
        comp_type: compType,
        page: 1, // Always get from page 1 since we want all data
        propertyType: compsPropertyType1.length ? compsPropertyType1 : [],
        orderByColumn: sortingSettings.sortingType || ListingEnum.DATE_SOLD,
        type: parameterType,
        search: searchValuesByfilter,
        orderBy: sortingSettings.orderSorting || 'DESC',
        compStatus: compStatus ? compStatus : '',
        ...(state ||
        street_address ||
        cap_rate_min ||
        cap_rate_max ||
        price_sf_min ||
        price_sf_max ||
        land_sf_min ||
        land_sf_max ||
        square_footage_min ||
        square_footage_max ||
        building_sf_min ||
        building_sf_max ||
        start_date ||
        city ||
        end_date ||
        lease_type
          ? {
              state,
              street_address,
              cap_rate_min,
              cap_rate_max,
              price_sf_min,
              price_sf_max,
              land_sf_min,
              land_sf_max,
              square_footage_min,
              square_footage_max,
              building_sf_max,
              building_sf_min,
              city,
              start_date,
              lease_type,
              end_date,
            }
          : sidebarFilters),
      };

      try {
        await mutation.mutateAsync(params);
      } catch (error) {
        console.error('Error while mutating data:', error);
      }
    };

    fetchData();
  }, [
    // Removed 'page' since we're handling pagination on frontend
    parameterType,
    typeFilter,
    searchValuesByfilter,
    sidebarFilters,
    typeProperty,
    sortingSettings,
    compsPropertyType,
    compStatus,
    deleteBoolean,
    uploadCompsStatus,
    isClusterFiltered, // Add cluster-related dependencies
    clusterData,
  ]);

  // Reset page to 1 when filters change to avoid being on non-existent pages
  useEffect(() => {
    setPage(1);
  }, [
    parameterType,
    typeFilter,
    searchValuesByfilter,
    sidebarFilters,
    typeProperty,
    sortingSettings,
    compsPropertyType,
    compStatus,
  ]);

  // Reset page to 1 when map viewport changes
  useEffect(() => {
    if (mapBounds) {
      setPage(1);
    }
  }, [mapBounds, setPage]);

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
    navigate(`/comps-view/${id}/${check}`);
  };

  const updateListingItem = (id: number) => {
    navigate(`/update-comps/${id}`);
  };

  const handlePreviousPage = () => {
    setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(totalItems / itemsPerPage);
    setPage((prevPage: any) => Math.min(prevPage + 1, maxPage));
  };

  if (mutation.isLoading) {
    return <>{ListingEnum.LOADING}....</>;
  }

  if (mutation.isError) {
    return <>{ListingEnum.ERROR}....</>;
  }

  // Function to filter comps within map viewport
  const filterCompsByViewport = (comps: IComp[], bounds: typeof mapBounds) => {
    if (!bounds) return comps;

    return comps.filter((comp) => {
      const lat = parseFloat(comp.latitude);
      const lng = parseFloat(comp.longitude);

      // Check if the comp is within the viewport bounds
      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    });
  };

  // Use cluster data when available, otherwise use mutation data
  const allData =
    isClusterFiltered && clusterData
      ? clusterData
      : mutation.data?.data.data.comps || [];

  // Apply viewport filtering if enabled OR if mapBounds are provided (auto-enable)
  // Skip viewport filtering if we're using cluster data (already filtered by API)
  const shouldApplyViewportFilter =
    !isClusterFiltered && (isMapViewportFiltered || mapBounds !== null);
  const viewportFilteredData =
    shouldApplyViewportFilter && mapBounds
      ? filterCompsByViewport(allData, mapBounds)
      : allData;

  // Frontend pagination logic
  const itemsPerPage = 10;
  const totalItems = viewportFilteredData.length;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = viewportFilteredData.slice(startIndex, endIndex);

  // Pass all original data to map for clustering (not filtered by viewport)
  passGoogleData(allData);

  // Use paginated viewport-filtered data for listing display
  const data = paginatedData;
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
  // const filterData =
  //   data?.filter((ele: any) => selectedIds?.includes(ele.id)) || [];
  // const filterDataIds = filterData?.map((ele) => ele.id);
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
  if (loading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container>
          <Grid item xs={12} className="bg-silverGray rounded-lg pb-6">
            <Box>
              <Box className="flex justify-between mr-7 pb-3.5 pt-6">
                <Box className="pl-5 text-customBlack text-sm">
                  {isMapViewportFiltered && (
                    <div className="mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">
                        Showing properties in current map view ({totalItems}{' '}
                        total)
                      </span>
                    </div>
                  )}
                  {!isMapViewportFiltered && mapBounds && (
                    <div className="mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                        Auto-filtered by map viewport ({totalItems} total)
                      </span>
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
                        <span className="totalEntry truncate">
                          Showing {(page - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(page * itemsPerPage, totalItems)} of{' '}
                          {totalItems} entries
                          {(isMapViewportFiltered || mapBounds) &&
                            ' (in current view)'}
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
                className="overflow-scroll p-3.5 pt-0 xl:h-[calc(100vh-278px)]"
              >
                {data.length === 0 ? (
                  <div>{ListingEnum.N0_RECORDS_FOUND}</div>
                ) : (
                  <>
                    {data.length &&
                      data.map((ele: any, index: number) => (
                        <Box
                          key={index}
                          className="flex bg-[white] rounded-lg w-full mb-4 p-2 border border-solid border-[#f3f3f3] cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-200"
                          style={{
                            boxShadow: '4px 7px 5px 7px #00000008',
                          }}
                          onMouseEnter={() => {
                            // Focus this property on the map when hovering
                            if (onPropertyFocus) {
                              onPropertyFocus(ele.id);
                            }
                          }}
                          onMouseLeave={() => {
                            // Remove focus when not hovering
                            if (onPropertyFocus) {
                              onPropertyFocus(null);
                            }
                          }}
                        >
                          <Box>
                            <label className="comp-select mr-1">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(ele.id)}
                                onChange={() => handleCheckboxToggle(ele.id)}
                              />
                              <span className="checkmark"></span>
                            </label>
                          </Box>
                          <Box style={{ width: '37%' }}>
                            <img
                              style={{
                                width: '100%',
                                maxWidth: '140px',
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
                          <Box className="pt-3 pl-2.5" style={{ width: '24%' }}>
                            <Box className="flex mb-1.5">
                              <Box className="text-[#0DA1C7] text-base font-semibold capitalize">
                                {ele.business_name}
                              </Box>
                            </Box>
                            <Box className="text-sm flex text-left">
                              <Tooltip title={`${ele.street_address}`}>
                                <Box className="text-sm max-w-[380px] text-ellipsis overflow-hidden block text-nowrap cursor-pointer">
                                  {ele.street_address}
                                </Box>
                              </Tooltip>
                            </Box>

                            <Tooltip
                              title={`${ele.city}, ${ele.zipcode}, ${ele.state}`}
                            >
                              <Box className="text-sm py-0.5 max-w-[140px] text-ellipsis overflow-hidden block text-nowrap cursor-pointer">
                                {`${ele.city}, ${ele.zipcode}, ${ele.state}`}
                              </Box>
                            </Tooltip>
                            <Box className="flex gap-1 text-sm flex-wrap">
                              <p className="text-nowrap">Year Built :</p>
                              <p>
                                {ele?.year_built === null ||
                                ele?.year_built === ''
                                  ? 'N/A'
                                  : ele?.year_built}
                              </p>
                            </Box>
                          </Box>
                          <Box
                            className="pt-3"
                            style={{ width: '63%', fontSize: '14px' }}
                          >
                            <Box className="flex gap-1 ml-[74px] flex-wrap">
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
                            <Box className="flex gap-1 mt-[8px] ml-[74px] flex-wrap">
                              <p>Land Size :</p>
                              <p>
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
                            {checkType === 'salesCheckbox' ? (
                              <Box className="flex gap-1 mt-[8px] ml-[74px] flex-wrap">
                                <p>
                                  {ele?.sale_status === 'Pending'
                                    ? 'Sale Status :'
                                    : 'Date of Sale :'}
                                </p>
                                <p>
                                  {ele?.sale_status === 'Pending'
                                    ? ele?.sale_status
                                    : formatDateToMMDDYYYY(ele?.date_sold)}
                                </p>
                              </Box>
                            ) : (
                              <Box className="flex gap-1 mt-[8px] ml-[74px] flex-wrap">
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
                            <div className="flex justify-end items-center text-right mt-2.5">
                              {ele.ai_generated === 1 && (
                                <img
                                  src={AiImage}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    marginRight: '5px',
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
              <Stack direction="row" justifyContent="center" mt={2}>
                <button
                  className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  onClick={handlePreviousPage}
                  disabled={data?.length === 0 || page === 1}
                >
                  {PaginationEnum.PREVIOUS}
                </button>
                <Pagination
                  count={
                    totalItems === 0 ? 0 : Math.ceil(totalItems / itemsPerPage)
                  }
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
                  className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= Math.ceil(totalItems / itemsPerPage) ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  disabled={page >= Math.ceil(totalItems / itemsPerPage)}
                  onClick={handleNextPage}
                >
                  {PaginationEnum.NEXT}
                </button>
              </Stack>
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
export default SideLandListingMap;
