import { useEffect, useState, useCallback } from 'react';
import { Icons } from '@/components/icons';
import { Box, Typography } from '@mui/material';
import { CustomSelectSearch } from '@/components/custom-select-search';
import { useLocation, useNavigate } from 'react-router-dom';
import image1 from '../../../images/image1.jpg';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import image4 from '../../../images/image4.png';
import image5 from '../../../images/Group.png';
// import MapFilter from './filter';
import CompsListingMap from './listing';
import React from 'react';
import { FilterComp } from '@/components/interface/header-filter';
import { ListingHeaderEnum } from '../enum/CompsEnum';
import { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { SortingEnum } from '../enum/CompsEnum';
import MultipleSelectWithchangesAPI from './select-type';
import loadingImage from '../../../images/loading.png';
import { useGet } from '@/hook/useGet';
import MultipleSelectLandWithAPI from './select-land-type';
import { SortingTypeJson, SortingTypeJsonLeases } from '../comp-form/fakeJson';

import CompsMapListingIntegrated from './comps-map-listing-integrated';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';
import AdvanceFilter from '@/pages/comps/Listing/advanceFilter';
import { HeaderEnum } from '@/components/header/ENUM/headerEnum';
export interface Option {
  id: number;
  name: string;
  code: string;
}
const MapHeaderOptions = () => {
  const navigate = useNavigate();
  let appliedFilter: number = 0;
  const location = useLocation();
  const type = location.state?.type;
  // Placeholder: using an empty object for now to avoid stale data issues.
  // In future updates, retrieve compFilters from location.state when state management is implemented.
  // const compFilters = location.state?.compFilters || {};
  const compFilters: { search?: string; compStatus?: string } = {};
  const currentBounds = location.state?.currentBounds || {};
  const currentZoom = location.state?.mapZoom || 4;

  localStorage.setItem('activeType', HeaderEnum.BUILDING_WITH_LAND);
  localStorage.setItem('activeMain', HeaderEnum.COMPS);
  localStorage.setItem('activeButton', HeaderEnum.COMMERCIAL);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(() => {
    if (localStorage.getItem('view') === 'android') {
      return 'android';
    }
    return localStorage.getItem('selectedToggle') === 'android'
      ? 'android'
      : 'web';
  });
  console.log('currentBounds:', currentZoom);
  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');
  const [sidebarFilters, setSidebarFilters] = useState<FilterComp | null>(null);
  const [sendTypes, setSendTypes] = useState<string>('sales');
  const [page, setPage] = useState(1);

  const [checkType, setCheckType] = useState(() => {
    if (type === 'leases') {
      return 'leasesCheckbox';
    } else if (localStorage.getItem('checkType') === 'leasesCheckbox') {
      return 'leasesCheckbox';
    }
    return localStorage.getItem('checkStatus') === 'lease'
      ? 'leasesCheckbox'
      : 'salesCheckbox';
  });
  const [selectedOptions, setSelectedOptions] = useState([] as any[]);
  const [selectType, setSelectType] = useState('');
  const [selectPropertyType] = useState('');
  const [sortingOrder, setSortingOrder] = useState(() => {
    return localStorage.getItem('sortingOrder') || '';
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadCompsStatus, setUploadCompsStatus] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>(
    localStorage.getItem('compStatus') || ''
  );
  console.log(setUploadCompsStatus);
  // Clear selectedValue when checkType changes (Sales/Lease toggle)
  useEffect(() => {
    setSelectedValue('');
    // Also clear from localStorage to ensure clean state
    // localStorage.removeItem('compStatus');
    // Reset selectType to ensure clean state
    setSelectType('');
    // Trigger filter change to refresh API
    setHasFilterChanged(true);
  }, [checkType]);
  const [sortingSettings, setSortingSettings] = useState({
    sortingType: localStorage.getItem('sortingType') || '',
    orderSorting: localStorage.getItem('sortingOrder')
      ? localStorage.getItem('sortingOrder')?.includes('asc')
        ? 'asc'
        : 'DESC'
      : '',
  });
  const [options, setOptions] = React.useState<Option[]>([]);

  const [passDataCheckType, setPassDataCheckType] = useState('');
  const [hasFilterChanged, setHasFilterChanged] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [clustersReady, setClustersReady] = useState(false);

  const handleToggle = (newSelectedButton: string | null) => {
    console.log('🔄 TOGGLE - Before toggle:', {
      newSelectedButton,
      currentCompStatus: localStorage.getItem('compStatus'),
      selectedValue,
    });
    console.log(clustersLoading);
    // Keys to remove from localStorage

    // Remove each key from localStorage

    // Remove 'view' key and update 'selectedToggle'
    localStorage.removeItem('view');
    if (newSelectedButton !== null) {
      localStorage.setItem('selectedToggle', newSelectedButton);
      setSelectedButton(newSelectedButton);
    }

    console.log('🔄 TOGGLE - After toggle:', {
      newSelectedButton,
      currentCompStatus: localStorage.getItem('compStatus'),
      selectedValue,
    });
  };
  const [searchInput, setSearchInput] = useState<string>('');

  // Initialize searchInput with compFilters.search if available (only once)
  useEffect(() => {
    if (compFilters?.search) {
      setSearchInput(compFilters?.search);
      setSearchValuesByfilter(compFilters?.search);
    }
  }, []); // Empty dependency array to run only once

  // Clear compFilters.search when searchInput is cleared
  useEffect(() => {
    if (searchInput === '' && compFilters.search) {
      // Clear the compFilters.search to prevent it from being passed to API
      compFilters.search = '';
    }
  }, [searchInput, compFilters]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchValuesByfilter(value);
          setHasFilterChanged(true);
        }, 500); // 500ms delay
      };
    })(),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleInputBlur = () => {
    // Immediately trigger search on blur
    setSearchValuesByfilter(searchInput);
    setHasFilterChanged(true);
  };

  // Function to reset search input
  const handleResetSearch = () => {
    setSearchInput('');
    setSearchValuesByfilter('');
  };
  const checkstatus = localStorage.getItem('checkStatus');
  useEffect(() => {
    if (checkstatus === 'lease') {
      setCheckType('leasesCheckbox');
    } else if (checkstatus === 'sales') {
      setCheckType('salesCheckbox');
    }
  }, [checkstatus]);

  const openNav = () => {
    setIsOpen(true);
  };
  const uploadComps = () => {
    navigate('/upload-comps');
  };

  const createComps = () => {
    navigate('/create-comps');
  };

  const getType = (event: any) => {
    setSendTypes(event);
  };

  const passSetCheckType = (event: any) => {
    setPassDataCheckType(event);
    setSidebarFilters(null);
  };
  console.log('passcheckype', passDataCheckType);
  useEffect(() => {
    if (
      sortingOrder === SortingEnum.ASC ||
      sortingOrder === SortingEnum.ASC_0 ||
      sortingOrder === SortingEnum.ASC_1
    ) {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        orderSorting: SortingEnum.ASC,
      }));
    } else {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        orderSorting: SortingEnum.DESC,
      }));
    }

    let sortingType = SortingEnum.Date_SOLD; // default

    if (
      checkType === 'salesCheckbox' &&
      (sortingOrder === SortingEnum.ASC_0 ||
        sortingOrder === SortingEnum.DESC_1)
    ) {
      sortingType = SortingEnum.SALE_PRICE;
    } else if (
      checkType === 'leasesCheckbox' &&
      (sortingOrder === SortingEnum.ASC_0 ||
        sortingOrder === SortingEnum.DESC_1)
    ) {
      sortingType = SortingEnum.LEASE_RATE;
    } else if (
      sortingOrder === SortingEnum.ASC ||
      sortingOrder === SortingEnum.DESC_0
    ) {
      sortingType = SortingEnum.STREET_ADDRESS;
    }

    setSortingSettings((prevSettings) => ({
      ...prevSettings,
      sortingType,
    }));

    // Store sortingType in localStorage for persistence
    localStorage.setItem('sortingType', sortingType);
  }, [sortingOrder, checkType]);

  // Stop loading when clusters are ready or after 3 seconds max
  useEffect(() => {
    if (clustersReady) {
      setClustersLoading(false);
    }
  }, [clustersReady]);

  // Fallback timer to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setClustersLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Reset sorting order when checkType changes (sale/lease toggle)
  useEffect(() => {
    // Clear sortingOrder when switching between sale and lease to reset dropdown
    setSortingOrder(localStorage.getItem('sortingOrder') || '');
  }, [checkType]);

  appliedFilter = 0;

  const keysToCheck = [
    'street_address_comps',
    'property_type',
    'lease_type',
    'all',
    'selectedCities',
    'street_address',
    'start_date',
    'end_date',
    'building_sf_min',
    'building_sf_max',
    'land_sf_min',
    'land_sf_max',
    'cap_rate_max',
    'cap_rate_min',
    'compStatus',
    'state',
    'price_sf_max',
    'price_sf_min',
    'square_footage_max',
    'square_footage_min',
  ];

  const isNonEmpty = (value: string | null) =>
    value !== null && value.trim() !== '';

  keysToCheck.forEach((key) => {
    const value = localStorage.getItem(key);
    if (isNonEmpty(value)) {
      appliedFilter += 1;
    }
  });

  // Also check compFilters if available

  const { data } = useGet<any>({
    queryKey: 'all',
    endPoint: `globalCodes`,
    config: { refetchOnWindowFocus: false },
  });
  const saleStatusData = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : [];
  const saleStatus = saleStatusData?.filter(
    (ele: any) => ele?.type === 'sale_status'
  );
  const compsSaleStatus =
    saleStatus &&
    saleStatus[0]?.options?.map((ele: any) => {
      return {
        value: ele?.code,
        label: ele?.name,
      };
    });
  const leaseStatusData = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : [];
  const leaseStatus = leaseStatusData?.filter(
    (ele: any) => ele?.type === 'lease_status'
  );
  const compsLeaseStatus =
    leaseStatus &&
    leaseStatus[0]?.options?.map((ele: any) => {
      return {
        value: ele?.code,
        label: ele?.name,
      };
    });
  useEffect(() => {
    const handlePageRefresh = () => {
      localStorage.removeItem('checkStatus');
      localStorage.removeItem('view');
      localStorage.removeItem('sortingOrder');
      localStorage.removeItem('sortingType');

      ClearAdditionalStorage();
      // Clear compFilters on refresh
      if (location.state?.compFilters) {
        navigate(location.pathname, { replace: true });
      }
    };

    window.addEventListener('beforeunload', handlePageRefresh);

    return () => {
      window.removeEventListener('beforeunload', handlePageRefresh);
    };
  }, [checkType, location.state?.compFilters, location.pathname, navigate]);

  // Preserve current filter values when hasFilterChanged becomes true (but not after reset)
  useEffect(() => {
    if (
      hasFilterChanged &&
      compFilters &&
      Object.keys(compFilters).length > 0 &&
      !isResetActive
    ) {
      // Preserve compStatus if not already in localStorage
      if (!localStorage.getItem('compStatus') && compFilters?.compStatus) {
        localStorage.setItem('compStatus', compFilters?.compStatus);
        setSelectedValue(compFilters?.compStatus);
      }
    }
  }, [hasFilterChanged, compFilters, isResetActive]);
  if (loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  return (
    <>
      <Box className="py-5 map-header-sticky">
        <Box className="flex justify-between xl:px-9 px-4 gap-3 xl:flex-nowrap flex-wrap">
          <Box className="flex items-center flex-wrap gap-3">
            <Typography
              variant="h5"
              component="h5"
              sx={{
                padding: '0',
                fontSize: '20px',
                fontWeight: '700',
              }}
            >
              {ListingHeaderEnum.COMPS_LIST}
            </Typography>

            <Box className="relative">
              <div className="items-end flex">
                <Icons.SearchIcon className="text-[#0DA1C7] mr-1 pointer-events-none" />
                <Icons.Input
                  className="text-xs !pb-[6px]"
                  placeholder="Search Comps"
                  value={searchInput || localStorage.getItem('search_term')}
                  onChange={(e) => {
                    handleInputChange(e as React.ChangeEvent<HTMLInputElement>);
                    localStorage.setItem('search_term', e.target.value);
                  }}
                  onBlur={handleInputBlur}
                />
              </div>
            </Box>
            <Box className="selectDropdown">
              <CustomSelectSearch
                key={checkType} // Force re-render when checkType changes
                label={
                  checkType === 'leasesCheckbox'
                    ? 'Select Lease Status'
                    : 'Select Sale Status'
                }
                value={selectedValue || localStorage.getItem('compStatus')}
                onChange={(e) => {
                  setPage(1);
                  const selectedValue = e.target.value;
                  setSelectedValue(selectedValue);
                  localStorage.setItem('compStatus', selectedValue);
                  setSelectType(selectedValue);
                  setSidebarFilters(null);
                  setHasFilterChanged(true);
                }}
                options={
                  checkType === 'leasesCheckbox'
                    ? compsLeaseStatus
                    : compsSaleStatus
                }
                // storageKey="compStatus"
              />
            </Box>
            <Box
              className="relative"
              sx={{
                border: '1px solid rgb(13 161 199 / var(--tw-text-opacity))',
                padding: 0,
              }}
            >
              <div className="w-full multiSelectDtopDown">
                {localStorage.getItem('activeType') === 'land_only' ? (
                  <MultipleSelectLandWithAPI
                    onChange={(transformedArray) => {
                      setPage(1);
                      setSelectedOptions(transformedArray);
                      setSidebarFilters(null);
                      setHasFilterChanged(true);

                      localStorage.setItem(
                        'property_type',
                        transformedArray.join(',')
                      );
                    }}
                    label="Type"
                    value={
                      localStorage.getItem('property_type')
                        ? localStorage
                            .getItem('property_type')
                            ?.split(',')
                            .filter((item) => item.trim() !== '') || []
                        : hasFilterChanged
                          ? selectedOptions
                          : []
                    }
                    options={options}
                    setOptions={setOptions}
                  />
                ) : (
                  <MultipleSelectWithchangesAPI
                    onChange={(transformedArray) => {
                      setPage(1);
                      setSelectedOptions(transformedArray);
                      setSidebarFilters(null);
                      setHasFilterChanged(true);

                      localStorage.setItem(
                        'property_type',
                        transformedArray.join(',')
                      );
                    }}
                    label="Type"
                    value={
                      localStorage.getItem('property_type')
                        ? localStorage
                            .getItem('property_type')
                            ?.split(',')
                            .filter((item) => item.trim() !== '') || []
                        : hasFilterChanged
                          ? selectedOptions
                          : []
                    }
                    options={options}
                    setOptions={setOptions}
                  />
                )}
              </div>
            </Box>

            <Box className="selectDropdown">
              <CustomSelectSearch
                label="Sort By"
                options={
                  checkType === 'salesCheckbox'
                    ? SortingTypeJson
                    : SortingTypeJsonLeases
                }
                value={sortingOrder}
                onChange={(e: SelectChangeEvent<string>) => {
                  setPage(1);
                  const selectedSorting = e.target.value as string;
                  setSortingOrder(selectedSorting);
                  localStorage.setItem('sortingOrder', selectedSorting);
                  setHasFilterChanged(true);
                }}
                storageKey="sortingOrder"
              />
            </Box>
            <Box className="relative">
              <button
                className="border border-[#0DA1C7] text-[#0DA1C7] bg-white font-semibold h-[34px] px-5 rounded-[6px] pr-9 relative cursor-pointer"
                onClick={openNav}
              >
                <div className="mr-5 cursor-pointer">
                  {ListingHeaderEnum.FILTERS}
                </div>

                <img
                  src={image1}
                  alt="image1"
                  className="h-[20px] w-[20px] absolute top-[7px] right-[8px] mr-2"
                />
              </button>
              <span className="absolute rounded-xl bg-white p-1 top-[-22px] right-[-12px] shadow-md">
                {appliedFilter === 0 ? (
                  ''
                ) : (
                  <p className="bg-[#0da1c7] text-white px-2 py-1 rounded-xl top-[-15px] right-[-7px] text-xs min-w-6">
                    {appliedFilter}
                  </p>
                )}
              </span>
            </Box>
          </Box>
          <Box className="flex cursor-pointer gap-4">
            <Box>
              <button
                onClick={uploadComps}
                className="border-none text-white bg-[#0DA1C7] flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded cursor-pointer"
              >
                {ListingHeaderEnum.IMPORT}
                <Icons.ImportIcon className="relative text-lg" />
              </button>
            </Box>
            <Box className="whitespace-nowrap">
              <button
                onClick={createComps}
                className="border-none text-white bg-[#0DA1C7] flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded cursor-pointer"
              >
                {ListingHeaderEnum.ADD_NEW}
                <Icons.AddIcon className="relative text-lg" />
              </button>
            </Box>

            <Box>
              <ToggleButtonGroup
                value={selectedButton}
                exclusive
                onChange={(_e, v) => handleToggle(v)}
                sx={{
                  '&.MuiToggleButtonGroup-root': { p: 0.4, width: '120px' },
                  backgroundColor: '#D9D9D9',
                  borderRadius: '5px',
                }}
                className="cursor-pointer"
              >
                <Tooltip title="Map">
                  <ToggleButton
                    className={
                      selectedButton === 'web'
                        ? 'bg-[#0DA1C7] rounded-[4px] px-5'
                        : 'bg-[#D9D9D9] px-5'
                    }
                    value="web"
                    sx={{
                      '&.MuiButtonBase-root': { p: 0.5 },
                      fontSize: '12px',
                      border: 'none',
                    }}
                  >
                    <img
                      src={image5}
                      alt="image5"
                      className="h-[20px] w-[20px]"
                    />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="Listing">
                  <ToggleButton
                    className={
                      selectedButton === 'android'
                        ? 'bg-[#0DA1C7] text-white rounded-[4px] px-5'
                        : 'bg-[#D9D9D9] text-black px-5'
                    }
                    value="android"
                    sx={{
                      '&.MuiButtonBase-root': { p: 0.5 },
                      fontSize: '12px',
                      border: 'none',
                    }}
                  >
                    <img
                      src={image4}
                      alt="image4"
                      className="h-[10px] w-[13px] ml-[2px]"
                    />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Box>
      </Box>
      <AdvanceFilter
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        sendTypes={sendTypes}
        onApplyFilter={(filter) => {
          setSidebarFilters(filter);
          if (filter._timestamp) {
            setSelectedValue('');
            setSelectedOptions([]);
            setIsResetActive(true);
            setTimeout(() => setIsResetActive(false), 100);
          }
        }}
        selectPropertyType={selectPropertyType}
        selectType={selectType}
        passDataCheckType={passDataCheckType}
        checkType={checkType}
        setPage={setPage}
        compFilters={compFilters}
      />
      {selectedButton == 'android' ? (
        <>
          <CompsListingMap
            typeFilter={selectType}
            compFilters={compFilters}
            sidebarFilters={sidebarFilters}
            searchValuesByfilter={searchValuesByfilter}
            typeProperty={selectedOptions}
            getType={getType}
            sortingSettings={sortingSettings}
            isOpen={isOpen}
            passDataCheckType={passDataCheckType}
            passSetCheckType={passSetCheckType}
            checkType={checkType}
            setCheckType={setCheckType}
            setLoading={setLoading}
            loading={loading}
            page={page}
            setPage={setPage}
            onResetSearch={handleResetSearch}
          />
        </>
      ) : (
        <>
          <CompsMapListingIntegrated
            typeFilter={selectType}
            sidebarFilters={sidebarFilters}
            mapZoom={currentZoom}
            currentBounds={currentBounds}
            compFilters={compFilters}
            searchValuesByfilter={searchValuesByfilter}
            typeProperty={selectedOptions}
            sortingSettings={sortingSettings}
            checkType={checkType}
            setCheckType={setCheckType}
            setLoading={setLoading}
            loading={loading}
            page={page}
            setPage={setPage}
            uploadCompsStatus={uploadCompsStatus}
            onResetSearch={handleResetSearch}
            setClustersReady={setClustersReady}
            hasFilterChanged={hasFilterChanged}
            setHasFilterChanged={setHasFilterChanged}
          />
        </>
      )}
    </>
  );
};
export default MapHeaderOptions;
