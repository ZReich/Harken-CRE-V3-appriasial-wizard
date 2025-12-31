import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Box, Typography } from '@mui/material';
import { CustomSelectSearch } from '@/components/custom-select-search';
import { SortingTypeJson, SortingTypeJsonLeases } from '../comp-form/fakeJson';
import { useLocation, useNavigate } from 'react-router-dom';
import image1 from '../../../images/image1.jpg';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import image4 from '../../../images/image4.png';
import image5 from '../../../images/Group.png';
// import MapFilter from './filter';
import CompsListingMap from './listing';
import CompsLandMapListingIntegrated from './comps-land-map-listing-integrated';
import React from 'react';
import { FilterComp } from '@/components/interface/header-filter';
import { ListingHeaderEnum } from '../enum/CompsEnum';
import { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { SortingEnum } from '../enum/CompsEnum';
import MultipleSelectWithAPI from './select-type';
import loadingImage from '../../../images/loading.png';
import { useGet } from '@/hook/useGet';
import MultipleSelectLandWithAPI from './select-land-type';
import UploadCompsModal from './upload-comps-modal';
import CompsForm from './comps-table';
import { Comp } from './comps-table-interfaces';
import AdvanceFilter from '@/pages/comps/Listing/advanceFilter';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';
import { HeaderEnum } from '@/components/header/ENUM/headerEnum';

export interface Option {
  id: number;
  name: string;
  code: string;
}
const MapHeaderLandOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const type = location.state?.type;
  let appliedFilter: number = 0;

  localStorage.setItem('activeType', HeaderEnum.LAND_ONLY);
  localStorage.setItem('activeMain', HeaderEnum.COMPS);
  localStorage.setItem('activeButton', HeaderEnum.LAND);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(() => {
    if (localStorage.getItem('view') === 'android') {
      return 'android';
    }
    return localStorage.getItem('selectedToggle') === 'android'
      ? 'android'
      : 'web';
  });

  const [selectedToggleButton, setSelectedToggleButton] = useState(
    localStorage.getItem('selectedSize') === 'AC' ? 'AC' : 'SF'
  );
  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');
  const [open, setOpen] = useState(false);

  const [sidebarFilters, setSidebarFilters] = useState<FilterComp | null>(null);
  const [sendTypes, setSendTypes] = useState<string>('sales');
  const [uploadCompsStatus, setUploadCompsStatus] = useState(false);
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
  const [page, setPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState<any>(
    localStorage.getItem('compStatus') || ''
  );
  const [sortingSettings, setSortingSettings] = useState({
    sortingType: localStorage.getItem('sortingType') || '',
    orderSorting: localStorage.getItem('sortingOrder')
      ? localStorage.getItem('sortingOrder')?.includes('asc')
        ? 'asc'
        : 'DESC'
      : '',
  });
  const [options, setOptions] = React.useState<Option[]>([]);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);

  const [passDataCheckType, setPassDataCheckType] = useState('');
  const [hasFilterChanged, setHasFilterChanged] = useState(false);
  const [setClustersReady] = useState(() => () => {});
  const compFilters: { search?: string } = {};
  const currentBounds = location.state?.currentBounds || {};
  const currentZoom = location.state?.mapZoom || 4;
  const handleToggle = (newSelectedButton: string | null) => {
    // Keys to remove from localStorage

    // Remove 'view' key and update 'selectedToggle'
    localStorage.removeItem('view');
    if (newSelectedButton !== null) {
      localStorage.setItem('selectedToggle', newSelectedButton);
      setSelectedButton(newSelectedButton);
    }
  };
  const [searchInput, setSearchInput] = useState<string>('');

  // Initialize searchInput with compFilters.search if available (only once)
  useEffect(() => {
    if (compFilters.search) {
      setSearchInput(compFilters.search);
      setSearchValuesByfilter(compFilters.search);
    }
  }, []); // Empty dependency array to run only once

  // Clear compFilters.search when searchInput is cleared
  useEffect(() => {
    if (searchInput === '' && compFilters.search) {
      // Clear the compFilters.search to prevent it from being passed to API
      compFilters.search = '';
    }
  }, [searchInput, compFilters]);

  const handleToggle1 = (newSelectedButton: string | null) => {
    if (newSelectedButton !== null) {
      localStorage.setItem('selectedSize', newSelectedButton);
      setSelectedToggleButton(newSelectedButton);
    }
  };
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      localStorage.removeItem('search_term');
    }
    setSearchInput(value);
    setSearchValuesByfilter(value);
    setHasFilterChanged(true);
  };
  const handleInputBlur = () => {
    // Immediately trigger search on blur
    setSearchValuesByfilter(searchInput);
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
  const selectedToggle = localStorage.getItem('selectedSize');
  useEffect(() => {
    if (selectedToggle === 'AC') {
      setSelectedToggleButton('AC');
    } else if (selectedToggle === 'SF') {
      setSelectedToggleButton('SF');
    }
  }, [selectedToggle]);

  const openNav = () => {
    setIsOpen(true);
  };

  const createComps = () => {
    navigate('/create-comps');
  };
  const uploadComps = () => {
    // Set activeType to land_only for land comps
    localStorage.setItem('activeType', 'land_only');
    navigate('/upload-comps');
  };

  const getType = (event: any) => {
    setSendTypes(event);
  };

  const passSetCheckType = (event: any) => {
    setPassDataCheckType(event);
    setSidebarFilters(null);
  };

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

    if (
      checkType === 'salesCheckbox' &&
      (sortingOrder === SortingEnum.ASC_0 ||
        sortingOrder === SortingEnum.DESC_1)
    ) {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        sortingType: SortingEnum.SALE_PRICE,
      }));
    } else if (
      checkType === 'leasesCheckbox' &&
      (sortingOrder === SortingEnum.ASC_0 ||
        sortingOrder === SortingEnum.DESC_1)
    ) {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        sortingType: SortingEnum.LEASE_RATE,
      }));
    } else if (
      sortingOrder === SortingEnum.ASC ||
      sortingOrder === SortingEnum.DESC_0
    ) {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        sortingType: SortingEnum.STREET_ADDRESS,
      }));
    } else {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        sortingType: SortingEnum.Date_SOLD,
      }));
    }
  }, [sortingOrder, checkType]);

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
    'compStatus',
    'state',
    'price_sf_max',
    'price_sf_min',
  ];

  const isNonEmpty = (value: string | null) =>
    value !== null && value.trim() !== '';

  keysToCheck.forEach((key) => {
    const value = localStorage.getItem(key);
    if (isNonEmpty(value)) {
      appliedFilter += 1;
    }
  });

  console.log('Number of applied filters:', appliedFilter);

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
      // Clear additional related keys
      ClearAdditionalStorage();
    };

    window.addEventListener('beforeunload', handlePageRefresh);

    return () => {
      window.removeEventListener('beforeunload', handlePageRefresh);
    };
  }, [checkType]);
  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('selectedSize');
    });

    return () => {
      window.removeEventListener('beforeunload', () => {
        localStorage.removeItem('selectedSize');
      });
    };
  }, []);
  useEffect(() => {
    if (checkType === 'leasesCheckbox') {
      setSelectedValue('');
    }
    if (checkType === 'salesCheckbox') {
      setSelectedValue('');
    }
    // Trigger filter change to refresh API
    setHasFilterChanged(true);
  }, [checkType]);
  if (loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }
  console.log('selectuionvuttonn');

  return (
    <>
      <UploadCompsModal
        open={open}
        onClose={() => setOpen(false)}
        setCompsModalOpen={setCompsModalOpen}
        setCompsData={setCompsData}
        compsData={compsData ?? []}
        setUploadCompsStatus={setUploadCompsStatus}
      />

      {compsModalOpen && (
        <CompsForm
          passCompsData={compsData}
          open={compsModalOpen}
          compsData={compsData}
          onClose={() => setCompsModalOpen(false)}
          handleClose={() => setCompsModalOpen(false)}
          setUploadCompsStatus={setUploadCompsStatus}
        />
      )}
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
                  value={
                    searchInput || localStorage.getItem('search_term') || ''
                  }
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              </div>
            </Box>
            <Box className="selectDropdown">
              <CustomSelectSearch
                label={
                  checkType === 'leasesCheckbox'
                    ? 'Select Lease Status'
                    : 'Select Sale Status'
                }
                value={localStorage.getItem('compStatus') || selectedValue}
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
                    value={selectedOptions}
                    options={options}
                    setOptions={setOptions}
                  />
                ) : (
                  <MultipleSelectWithAPI
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
                    value={selectedOptions}
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
                  const selectedSorting = e.target.value as string;
                  setPage(1);
                  setSortingOrder(selectedSorting);
                  localStorage.setItem('sortingOrder', selectedSorting);
                  localStorage.setItem(
                    'sortingType',
                    sortingSettings?.sortingType || ''
                  );
                  setHasFilterChanged(true);
                }}
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
              <ToggleButtonGroup
                value={selectedToggleButton}
                exclusive
                onChange={(_e, v) => handleToggle1(v)}
                sx={{
                  '&.MuiToggleButtonGroup-root': { p: 0.4, width: '120px' },
                  backgroundColor: '#D9D9D9',
                  borderRadius: '5px',
                }}
                className="cursor-pointer"
              >
                <Tooltip title="SF">
                  <ToggleButton
                    className={
                      selectedToggleButton === 'SF'
                        ? 'bg-[#0DA1C7] rounded-[4px] px-5 text-white'
                        : 'bg-[#D9D9D9] px-5'
                    }
                    value="SF"
                    sx={{
                      '&.MuiButtonBase-root': { p: 0.5 },
                      fontSize: '12px',
                      border: 'none',
                    }}
                  >
                    <span className="uppercase text-sm font-semibold">sf</span>
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="AC">
                  <ToggleButton
                    className={
                      selectedToggleButton === 'AC'
                        ? 'bg-[#0DA1C7] text-white rounded-[4px] pl-[20px] pr-[14px]'
                        : 'bg-[#D9D9D9] pl-[20px] pr-[14px]'
                    }
                    value="AC"
                    sx={{
                      '&.MuiButtonBase-root': { p: 0.5 },
                      fontSize: '12px',
                      border: 'none',
                    }}
                  >
                    <span className="uppercase text-sm font-semibold">ac</span>
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
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
          setHasFilterChanged(true);
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
            selectedToggleButton={selectedToggleButton}
          />
        </>
      ) : (
        <>
          <CompsLandMapListingIntegrated
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
            selectedToggleButton={selectedToggleButton}
          />
        </>
      )}
    </>
  );
};
export default MapHeaderLandOptions;
