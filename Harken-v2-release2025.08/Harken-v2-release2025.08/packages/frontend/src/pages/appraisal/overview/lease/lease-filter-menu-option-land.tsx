import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Box, Typography } from '@mui/material';
import { CustomSelectSearch } from '@/components/custom-select-search';
import {
  SortingTypeJson,
  SortingTypeJsonLeases,
} from '@/pages/comps/comp-form/fakeJson';
import image1 from '../../../../images/image1.jpg';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import image4 from '../../../../images/image4.png';
import image5 from '../../../../images/Group.png';
import React from 'react';
import { FilterComp } from '@/components/interface/header-filter';
import { ListingHeaderEnum } from '@/pages/comps/enum/CompsEnum';
import { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { SortingEnum } from '@/pages/comps/enum/CompsEnum';
import MultipleSelectWithAPI from '@/pages/comps/Listing/select-land-type';
import loadingImage from '../../../../images/loading.png';
import { useGet } from '@/hook/useGet';
import MultipleSelectLandWithAPI from '@/pages/comps/Listing/select-land-type';
import UploadCompsModal from '@/pages/comps/Listing/upload-comps-modal';
import CompsForm from '@/pages/comps/Listing/comps-table';
import { Comp } from '../../../comps/Listing/comps-table-interfaces';
import LeaseFilteredCompsList from './lease-filtered-comp-listing';
import { useLocation } from 'react-router-dom';
import LeaseAppraisalMapListingIntegrated from './evaluation-lease-appraisals-map-listing-integrated';
import AdvanceFilter from '@/pages/comps/Listing/advanceFilter';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';

export interface Option {
  id: number;
  name: string;
  code: string;
  comparisonBasisView: any;
}
const LeaseFilterLandMapHeaderOptions: React.FC<any> = ({
  // passCompsData,
  tableData,
  comparisonBasisView,
}) => {
  // const navigate = useNavigate();
  const location = useLocation();
  const type = location.state?.type;
  const compFilters: { search?: string; compStatus?: string; propertyType?: string[] } = {};
  const currentBounds = location.state?.currentBounds || {};
  const currentZoom = location.state?.mapZoom || 4;
  let appliedFilter: number = 0;

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

  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');
  const [open, setOpen] = useState(false);

  const [sidebarFilters, setSidebarFilters] = useState<FilterComp | null>(null);
  const [sendTypes, setSendTypes] = useState<string>('sales');

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
        ? 'ASC'
        : 'DESC'
      : '',
  });
  const [options, setOptions] = React.useState<Option[]>([]);
  const [compsModalOpen, setCompsModalOpen] = useState(false); // Controls CompsModal
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [localStorageTrigger, setLocalStorageTrigger] = useState(0); // Trigger for localStorage changes

  const [passDataCheckType, setPassDataCheckType] = useState('');
  const triggerLocalStorageUpdate = () => {
    setLocalStorageTrigger((prev) => prev + 1);
    console.log(
      '🔄 PARENT: Triggered localStorage update for integrated component'
    );
  };
  const handleToggle = (newSelectedButton: string | null) => {
    localStorage.removeItem('view');
    if (newSelectedButton !== null) {
      localStorage.setItem('selectedToggle', newSelectedButton);
      setSelectedButton(newSelectedButton);
    }
  };
  const handleToggle1 = (newSelectedButton: string | null) => {
    if (newSelectedButton !== null) {
      localStorage.setItem('selectedSize', newSelectedButton);
      setSelectedToggleButton(newSelectedButton);
    }
  };
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    triggerLocalStorageUpdate();
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

  // Debounce search input with 500ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchValuesByfilter(searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);
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
  // const leasestatus = localStorage.getItem('checkStatus');
  // console.log(leasestatus, 'leasestatus');
  const openNav = () => {
    setIsOpen(true);
  };

  // const createComps = () => {
  //   navigate('/create-comps');
  // };
  // const uploadComps = () => {
  //   setOpen(true);
  // };

  const getType = (event: any) => {
    setSendTypes(event);
  };

  const passSetCheckType = (event: any) => {
    setPassDataCheckType(event);
    setSidebarFilters(null);
  };

  useEffect(() => {
    let orderSorting, sortingType;

    if (
      sortingOrder === SortingEnum.ASC ||
      sortingOrder === SortingEnum.ASC_0 ||
      sortingOrder === SortingEnum.ASC_1
    ) {
      orderSorting = SortingEnum.ASC;
    } else {
      orderSorting = SortingEnum.DESC;
    }

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
    } else {
      sortingType = SortingEnum.Date_SOLD;
    }

    setSortingSettings({
      orderSorting,
      sortingType,
    });

    localStorage.setItem('sortingType', sortingType);
  }, [sortingOrder, checkType]);
  appliedFilter = 0;

  // List of keys to check in localStorage
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

  // Function to check if a value is non-empty
  const isNonEmpty = (value: string | null) =>
    value !== null && value.trim() !== '';

  // Iterate over the keys and count non-empty values in localStorage
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
  // const saleStatusData = Array.isArray(data?.data?.data)
  //   ? data?.data?.data
  //   : [];
  // const saleStatus = saleStatusData?.filter(
  //   (ele: any) => ele?.type === 'sale_status'
  // );
  // const compsSaleStatus =
  //   saleStatus &&
  //   saleStatus[0]?.options?.map((ele: any) => {
  //     return {
  //       value: ele?.code,
  //       label: ele?.name,
  //     };
  //   });
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
    // Clear sortingOrder when switching between sale and lease to reset dropdown
    setSortingOrder(localStorage.getItem('sortingOrder') || '');

    const handlePageRefresh = () => {
      localStorage.removeItem('checkStatus');
      localStorage.removeItem('view');
      // Clear additional items
      ClearAdditionalStorage();
    };

    window.addEventListener('beforeunload', handlePageRefresh);

    return () => {
      window.removeEventListener('beforeunload', handlePageRefresh);
    };
  }, [checkType]);
  useEffect(() => {
    // Remove the 'selectedSize' key from localStorage on page refresh
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('selectedSize');
    });

    // Cleanup event listener on component unmount
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

  return (
    <>
      <UploadCompsModal
        open={open}
        onClose={() => setOpen(false)}
        setCompsModalOpen={setCompsModalOpen}
        setCompsData={setCompsData}
        compsData={compsData ?? []} // Ensure compsData is never null when used
      />

      {compsModalOpen && (
        <CompsForm
          passCompsData={compsData}
          open={compsModalOpen}
          compsData={compsData}
          onClose={() => setCompsModalOpen(false)}
          handleClose={() => setCompsModalOpen(false)} // ✅ Explicitly passing handleClose
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
                  value={searchInput}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              </div>
            </Box>
            <Box className="selectDropdown">
              <CustomSelectSearch
                label={'Select Lease Status'}
                value={
                  localStorage.getItem('compStatus') ||
                  compFilters.compStatus ||
                  selectedValue
                }
                onChange={(e) => {
                  setPage(1);
                  const selectedValue = e.target.value; // Get the selected value
                  setSelectedValue(selectedValue);
                  localStorage.setItem('compStatus', selectedValue); // Set it in localStorage
                  setSelectType(selectedValue); // Update the state
                  setSidebarFilters(null); // Reset sidebar filters (if required)
                }}
                options={compsLeaseStatus}
              />
            </Box>
            <Box
              className="relative"
              sx={{
                border: '1px solid rgb(13 161 199 / var(--tw-text-opacity))',
                padding: 0, // Remove padding
              }}
            >
              <div className="w-full multiSelectDtopDown">
                {localStorage.getItem('activeType') === 'land_only' ? (
                  <MultipleSelectLandWithAPI
                    onChange={(transformedArray) => {
                      setPage(1);
                      setSelectedOptions(transformedArray); // Update state
                      setSidebarFilters(null);
                      // Save updated array as a comma-separated string
                      localStorage.setItem(
                        'property_type',
                        transformedArray.join(',')
                      );
                    }}
                    label="Type"
                    value={compFilters.propertyType || selectedOptions} // Bind state to value
                    options={options as any}
                    setOptions={setOptions as any}
                  />
                ) : (
                  <MultipleSelectWithAPI
                    onChange={(transformedArray) => {
                      setPage(1);
                      setSelectedOptions(transformedArray); // Update state
                      setSidebarFilters(null);
                      // Save updated array as a comma-separated string
                      localStorage.setItem(
                        'property_type',
                        transformedArray.join(',')
                      );
                    }}
                    label="Type"
                    value={compFilters.propertyType || selectedOptions} // Bind state to value
                    options={options as any}
                    setOptions={setOptions as any}
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
                  <p className="bg-[#0da1c7] text-white px-2 py-1 rounded-xl top-[-15px] right-[-7px] text-xs">
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
        }}
        selectPropertyType={selectPropertyType}
        selectType={selectType}
        passDataCheckType={passDataCheckType}
        checkType={checkType}
        setPage={setPage}
        compFilters={compFilters}
      />
      {selectedButton == 'android' ? (
        <LeaseFilteredCompsList
          // dataHandle={dataHandle}
          tableData={tableData}
          typeFilter={selectType}
          sidebarFilters={sidebarFilters}
          selectedToggleButton={selectedToggleButton}
          searchValuesByfilter={searchValuesByfilter}
          // typeProperty={selectPropertyType}
          typeProperty={selectedOptions}
          getType={getType}
          sortingSettings={sortingSettings}
          isOpen={isOpen}
          passDataCheckType={passDataCheckType}
          passSetCheckType={passSetCheckType}
          checkType={checkType}
          setCheckType={setCheckType}
          // listingView={listingView}
          setLoading={setLoading}
          loading={loading}
          page={page}
          setPage={setPage}
          onResetSearch={handleResetSearch}
        />
      ) : (
        <>
          {console.log(
            '🎯 SALES EVALUATION - Rendering EvaluationSalesMapListingIntegrated (selectedButton is NOT android)'
          )}
          <LeaseAppraisalMapListingIntegrated
            typeFilter={selectType}
            selectedToggleButton={selectedToggleButton}
            sidebarFilters={sidebarFilters}
            searchValuesByfilter={searchValuesByfilter}
            typeProperty={selectedOptions}
            sortingSettings={sortingSettings}
            checkType={checkType}
            setCheckType={setCheckType}
            setLoading={setLoading}
            loading={loading}
            page={page}
            setPage={setPage}
            comparisonBasisView={comparisonBasisView}
            tableData={tableData}
            localStorageTrigger={localStorageTrigger}
            mapZoom={currentZoom}
            currentBounds={currentBounds}
            onResetSearch={handleResetSearch}
          />
        </>
      )}
    </>
  );
};
export default LeaseFilterLandMapHeaderOptions;
