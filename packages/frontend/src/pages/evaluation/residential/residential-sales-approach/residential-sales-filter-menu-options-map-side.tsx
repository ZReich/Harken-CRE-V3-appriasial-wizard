import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Box, Typography } from '@mui/material';
import { CustomSelectSearch } from '@/components/custom-select-search';
import { useLocation } from 'react-router-dom';
import image1 from '../../../../images/image1.jpg';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import image4 from '../../../../images/image4.png';
import image5 from '../../../../images/Group.png';
import ResidentialCompsAdvanceFilter from './residential-comps-advance-filter';
import ResidentialSalesFilteredCompsList from './residential-sales-filetered-comps-listing';
import React from 'react';
import { FilterComp } from '@/components/interface/header-filter';
import {
  ListingHeaderEnum,
  MenuOptionsEnum,
} from '@/pages/comps/enum/CompsEnum';
import { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { SortingEnum } from '@/pages/comps/enum/CompsEnum';
import loadingImage from '../../../../images/loading.png';
import {
  RetailpropertyTypeJson,
  SortingTypeJson,
} from '@/pages/comps/comp-form/fakeJson';
// import UploadCompsModal from './upload-comps-modal';
import { Comp } from '../../../comps/Listing/comps-table-interfaces';
import SalesCompsMapListingIntegratedResidential from './comps-map-listing-residential-sales-integrated';
// import UploadCompsModalResidential from './residential-upload-comps-modal';

import ResidentialCompsForm from '@/pages/residential/Listing/ResidentialCompsForm';
import UploadCompsModalResidential from '@/pages/residential/Listing/residential-upload-comps-modal';
export interface Option {
  id: number;
  name: string;
  code: string;
}
const ResidentialFilterLandMapHeaderOptions = () => {
  let appliedFilter: number = 0;
  const location = useLocation();
  const type = location.state?.type;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(() => {
    if (localStorage.getItem('view') === 'android') {
      return 'android';
    }
    return localStorage.getItem('selectedToggle') === 'android'
      ? 'android'
      : 'web';
  });
  console.log(
    '🎯 MENU OPTIONS - selectedButton current value:',
    selectedButton
  );
  console.log(
    '🎯 MENU OPTIONS - localStorage view:',
    localStorage.getItem('view')
  );
  console.log(
    '🎯 MENU OPTIONS - localStorage selectedToggle:',
    localStorage.getItem('selectedToggle')
  );
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
  // const [selectPropertyType] = useState('');
  const [selectPropertyType, setSelectPropertyType] = useState('show_all');
  const [sortingOrder, setSortingOrder] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [uploadCompsStatus, setUploadCompsStatus] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    sidebarFilters?.propertyType || selectPropertyType || ''
  );

  const [options, setOptions] = useState(RetailpropertyTypeJson);
  const [sortingSettings, setSortingSettings] = useState({
    sortingType: '',
    orderSorting: '',
  });
  // const [options, setOptions] = React.useState<Option[]>([]);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [compsModalOpen, setCompsModalOpen] = useState(false);

  const [passDataCheckType, setPassDataCheckType] = useState('');
  console.log(setSelectedOptions, setSelectPropertyType);
  useEffect(() => {
    if (selectPropertyType === 'show_all') {
      setOptions([...RetailpropertyTypeJson]);
    } else {
      setOptions(RetailpropertyTypeJson);
    }
  }, []);
  const handleToggle = (newSelectedButton: string | null) => {
    // Keys to remove from localStorage
    const keysToRemove = [
      'building_sf_min',
      'building_sf_max',
      'land_sf_min',
      'land_sf_max',
      'cap_rate_max',
      'all',
      'selectedCities',
      'street_address',
      'start_date',
      'end_date',
      'state',
      'compStatus',
      'property_type',
    ];

    // Remove each key from localStorage
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Remove 'view' key and update 'selectedToggle'
    localStorage.removeItem('view');
    if (newSelectedButton !== null) {
      localStorage.setItem('selectedToggle', newSelectedButton);
      setSelectedButton(newSelectedButton);
    }
  };
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValuesByfilter(e.target.value);
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
  }, [sortingOrder]);
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
  ];

  const isNonEmpty = (value: string | null) =>
    value !== null && value.trim() !== '';

  keysToCheck.forEach((key) => {
    const value = localStorage.getItem(key);
    if (isNonEmpty(value)) {
      appliedFilter += 1;
    }
  });

  useEffect(() => {
    const handlePageRefresh = () => {
      localStorage.removeItem('checkStatus');
      localStorage.removeItem('view');
    };

    window.addEventListener('beforeunload', handlePageRefresh);

    return () => {
      window.removeEventListener('beforeunload', handlePageRefresh);
    };
  }, [checkType]);

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
      <UploadCompsModalResidential
        open={open}
        onClose={() => setOpen(false)}
        setCompsModalOpen={setCompsModalOpen}
        setCompsData={setCompsData}
        compsData={compsData}
        setUploadCompsStatus={setUploadCompsStatus}
      />

      {compsModalOpen && (
        <ResidentialCompsForm
          passCompsData={compsData}
          open={compsModalOpen}
          compsData={compsData}
          onClose={() => setCompsModalOpen(false)}
          handleClose={() => setCompsModalOpen(false)} // ✅ Explicitly passing handleClose
          setUploadCompsStatus={setUploadCompsStatus} // Pass setUploadCompsStatus
        />
      )}
      <Box className="py-5 map-header-sticky">
        <Box className="flex justify-between flex-wrap 2xl:flex-nowrap px-9 gap-2">
          <Box className="flex">
            <Typography
              variant="h5"
              component="h5"
              sx={{
                marginRight: '50px',
                padding: '0',
                fontSize: '20px',
                fontWeight: '700',
              }}
            >
              {ListingHeaderEnum.COMPS_LIST}
            </Typography>

            <Box className="relative ml-9">
              <div className="items-end flex">
                <Icons.SearchIcon className="text-[#0DA1C7] mr-1 pointer-events-none ny" />
                <Icons.Input
                  className="text-xs !pb-[6px]"
                  placeholder={MenuOptionsEnum.SEARCH_LISTINGS}
                  onChange={handleInputChange}
                />
              </div>
            </Box>

            <Box className="ml-3 selectDropdown">
              <CustomSelectSearch
                label={MenuOptionsEnum.PROPERTY_TYPE}
                value={
                  sidebarFilters?.propertyType
                    ? sidebarFilters?.propertyType
                    : selectedValue
                }
                onChange={(e) => {
                  setPage(1);
                  const selectedValue = e.target.value;
                  const valueToStore =
                    selectedValue === 'show_all' ? '' : selectedValue;
                  setSelectedValue(selectedValue);
                  // Always set the value in localStorage, even if it's empty
                  localStorage.setItem('compStatus', valueToStore);
                  // Also set property_type to ensure API dependency tracking
                  localStorage.setItem('property_type', valueToStore);
                  setSelectType(valueToStore);
                  setSidebarFilters(null);
                }}
                options={options}
              />
            </Box>
            <Box className="ml-5 selectDropdown">
              <CustomSelectSearch
                label="Sort By"
                options={SortingTypeJson}
                value={sortingOrder}
                onChange={(e: SelectChangeEvent<string>) => {
                  setPage(1);
                  setSortingOrder(e.target.value as string);
                }}
              />
            </Box>
            <Box className="ml-3 relative">
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
          <Box className="flex cursor-pointer gap-2">
            <Box className="">
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
      <ResidentialCompsAdvanceFilter
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
      />
      {selectedButton == 'android' ? (
        <>
          {console.log(
            '🎯 MENU OPTIONS - Rendering CompsListingMap (selectedButton is android)'
          )}
          <ResidentialSalesFilteredCompsList
            typeFilter={selectType}
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
          />
        </>
      ) : (
        <>
          {console.log(
            '🎯 MENU OPTIONS - Rendering CompsMapListingIntegrated (selectedButton is NOT android)'
          )}
          <SalesCompsMapListingIntegratedResidential
            typeFilter={selectType}
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
            uploadCompsStatus={uploadCompsStatus}
          />
        </>
      )}
    </>
  );
};
export default ResidentialFilterLandMapHeaderOptions;
