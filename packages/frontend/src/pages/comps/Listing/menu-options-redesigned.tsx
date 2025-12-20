import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/icons';
import { Box, Typography, Tooltip, Chip, Badge } from '@mui/material';
import {
  FilterList,
  Upload,
  Add,
  Search,
  Close,
} from '@mui/icons-material';
import { CustomSelectSearch } from '@/components/custom-select-search';
import { useLocation, useNavigate } from 'react-router-dom';
import MapFilter from './filter';
import CompsListingMap from './listing';
import React from 'react';
import { FilterComp } from '@/components/interface/header-filter';
import { ListingHeaderEnum } from '../enum/CompsEnum';
import { SelectChangeEvent } from '@mui/material/Select';
import { SortingEnum } from '../enum/CompsEnum';
import MultipleSelectWithAPI from './select-type';
import loadingImage from '../../../images/loading.png';
import { useGet } from '@/hook/useGet';
import MultipleSelectLandWithAPI from './select-land-type';
import { SortingTypeJson, SortingTypeJsonLeases } from '../comp-form/fakeJson';
import UploadCompsModal from './upload-comps-modal';
import CompsForm from './comps-table';
import { Comp } from './comps-table-interfaces';
import CompsMapListingIntegrated from './comps-map-listing-integrated';
import CompsCardsView from './comps-cards-view';
import { ViewToggle, ViewMode } from '@/components/view-toggle';
import { colors, borderRadius, shadows, transitions } from '@/utils/design-tokens';
import { fade, buttonPress, pulse } from '@/utils/animations';
import { debounce, getViewPreference } from '@/utils/comps-helpers';

export interface Option {
  id: number;
  name: string;
  code: string;
}

const MapHeaderOptionsRedesigned = () => {
  const navigate = useNavigate();
  let appliedFilter: number = 0;
  const location = useLocation();
  const type = location.state?.type;
  const compFilters = location.state?.compFilters || {};
  const [isOpen, setIsOpen] = useState(false);
  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');
  const [sidebarFilters, setSidebarFilters] = useState<FilterComp | null>(null);
  const [sendTypes, setSendTypes] = useState<string>('sales');
  const [page, setPage] = useState(1);
  
  // Get active comp type from localStorage
  const activeCompType = localStorage.getItem('activeType') || 'building_with_land';
  
  // View mode state with preference loading
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const savedView = getViewPreference(activeCompType);
    // For list view, check the old selectedToggle system
    const oldToggle = localStorage.getItem('selectedToggle');
    if (oldToggle === 'android') return 'table';
    if (oldToggle === 'web') return 'map';
    return savedView;
  });
  
  const [selectedButton, setSelectedButton] = useState(() => {
    if (currentView === 'map') return 'web';
    return 'android';
  });

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
  const [sortingOrder, setSortingOrder] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [uploadCompsStatus, setUploadCompsStatus] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>(
    localStorage.getItem('compStatus') || ''
  );
  const [sortingSettings, setSortingSettings] = useState({
    sortingType: '',
    orderSorting: '',
  });
  const [options, setOptions] = React.useState<Option[]>([]);
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [compsModalOpen, setCompsModalOpen] = useState(false);
  const [passDataCheckType, setPassDataCheckType] = useState('');
  
  // Search with debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchValuesByfilter(value);
    }, 300),
    []
  );

  const handleToggle = (newView: ViewMode) => {
    setCurrentView(newView);
    
    // Update old system for backward compatibility
    if (newView === 'map') {
      setSelectedButton('web');
      localStorage.setItem('selectedToggle', 'web');
    } else {
      setSelectedButton('android');
      localStorage.setItem('selectedToggle', 'android');
    }

    // Clear filters when switching views
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
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem('view');
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
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
    setOpen(true);
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

  // Calculate applied filters
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
          <img src={loadingImage} alt="Loading..." />
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
        compsData={compsData}
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

      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50"
        style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyDark} 100%)`,
          boxShadow: shadows.lg,
        }}
      >
        <Box className="py-4 px-6">
          <Box className="flex justify-between items-center gap-4 flex-wrap">
            {/* Left Section: Title and Controls */}
            <Box className="flex items-center flex-wrap gap-3">
              <Typography
                variant="h5"
                component="h1"
                className="font-bold text-white"
                sx={{ fontSize: '24px', fontWeight: 700 }}
              >
                Comps
              </Typography>

              {/* Sales/Lease Toggle - Modern Segmented Control */}
              <motion.div
                className="flex bg-white/10 rounded-lg p-1"
                style={{ borderRadius: borderRadius.md }}
              >
                <button
                  onClick={() => setCheckType('salesCheckbox')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    checkType === 'salesCheckbox'
                      ? 'bg-white text-gray-900'
                      : 'text-white/80 hover:text-white'
                  }`}
                  style={{
                    borderRadius: borderRadius.sm,
                  }}
                >
                  Sales
                </button>
                <button
                  onClick={() => setCheckType('leasesCheckbox')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    checkType === 'leasesCheckbox'
                      ? 'bg-white text-gray-900'
                      : 'text-white/80 hover:text-white'
                  }`}
                  style={{
                    borderRadius: borderRadius.sm,
                  }}
                >
                  Leases
                </button>
              </motion.div>

              {/* Enhanced Search Bar */}
              <motion.div
                className="relative flex items-center bg-white/10 rounded-lg px-4 py-2"
                whileFocus={{ scale: 1.02 }}
                style={{
                  borderRadius: borderRadius.md,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Search className="text-white/60 mr-2" fontSize="small" />
                <input
                  type="text"
                  placeholder="Search comps..."
                  onChange={handleInputChange}
                  className="bg-transparent border-none outline-none text-white placeholder-white/50 text-sm w-48"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
              </motion.div>

              {/* Status Select */}
              <Box className="selectDropdown min-w-[180px]">
                <CustomSelectSearch
                  label={
                    checkType === 'leasesCheckbox'
                      ? 'Lease Status'
                      : 'Sale Status'
                  }
                  value={localStorage.getItem('compStatus') || selectedValue}
                  onChange={(e) => {
                    setPage(1);
                    const selectedValue = e.target.value;
                    setSelectedValue(selectedValue);
                    localStorage.setItem('compStatus', selectedValue);
                    setSelectType(selectedValue);
                    setSidebarFilters(null);
                  }}
                  options={
                    checkType === 'leasesCheckbox'
                      ? compsLeaseStatus
                      : compsSaleStatus
                  }
                />
              </Box>

              {/* Property Type Multi-Select */}
              <Box className="min-w-[180px]">
                {localStorage.getItem('activeType') === 'land_only' ? (
                  <MultipleSelectLandWithAPI
                    onChange={(transformedArray) => {
                      setPage(1);
                      setSelectedOptions(transformedArray);
                      setSidebarFilters(null);
                      localStorage.setItem(
                        'property_type',
                        transformedArray.join(',')
                      );
                    }}
                    label="Property Type"
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
                      localStorage.setItem(
                        'property_type',
                        transformedArray.join(',')
                      );
                    }}
                    label="Property Type"
                    value={selectedOptions}
                    options={options}
                    setOptions={setOptions}
                  />
                )}
              </Box>

              {/* Sort By */}
              <Box className="selectDropdown min-w-[160px]">
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
                    setSortingOrder(e.target.value as string);
                  }}
                />
              </Box>

              {/* Filter Button with Badge */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openNav}
                className="relative flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                style={{
                  borderRadius: borderRadius.md,
                  border: `2px solid ${colors.primary}`,
                }}
              >
                <FilterList fontSize="small" />
                <span>Filters</span>
                <AnimatePresence>
                  {appliedFilter > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        backgroundColor: colors.accent,
                      }}
                    >
                      {appliedFilter}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </Box>

            {/* Right Section: Actions and View Toggle */}
            <Box className="flex items-center gap-3">
              {/* Upload Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={uploadComps}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                style={{ borderRadius: borderRadius.md }}
              >
                <Upload fontSize="small" />
                <span className="hidden sm:inline">Upload</span>
              </motion.button>

              {/* Create New Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createComps}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                }}
              >
                <Add fontSize="small" />
                <span className="hidden sm:inline">Create New</span>
              </motion.button>

              {/* View Toggle */}
              <ViewToggle
                currentView={currentView}
                onViewChange={handleToggle}
                compType={activeCompType}
                availableViews={['cards', 'table', 'map']}
              />
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Filter Sidebar */}
      <MapFilter
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

      {/* Content - Switch between views */}
      <AnimatePresence mode="wait">
        {currentView === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompsListingMap
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
          </motion.div>
        )}

        {currentView === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompsMapListingIntegrated
              typeFilter={selectType}
              sidebarFilters={sidebarFilters}
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
            />
          </motion.div>
        )}

        {currentView === 'cards' && (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cards view will be implemented by modifying the listing component */}
            <CompsListingMap
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MapHeaderOptionsRedesigned;


















