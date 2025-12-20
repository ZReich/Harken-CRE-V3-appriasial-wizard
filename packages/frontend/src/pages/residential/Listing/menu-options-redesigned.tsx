// Residential comps listing with redesigned header
// This extends the commercial redesign for residential properties

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Tooltip } from '@mui/material';
import {
  FilterList,
  Upload,
  Add,
  Search,
} from '@mui/icons-material';
import { CustomSelectSearch } from '@/components/custom-select-search';
import { useLocation, useNavigate } from 'react-router-dom';
import MapFilter from './filter';
import React from 'react';
import { FilterComp } from '@/components/interface/header-filter';
import { MenuOptionsEnum } from '@/pages/comps/enum/CompsEnum';
import { SelectChangeEvent } from '@mui/material/Select';
import { SortingEnum } from '@/pages/comps/enum/CompsEnum';
import loadingImage from '../../../images/loading.png';
import { RetailpropertyTypeJson, SortingTypeJson } from '@/pages/comps/comp-form/fakeJson';
import { Comp } from '../../comps/Listing/comps-table-interfaces';
import CompsMapListingIntegratedResidential from './comps-map-listing-residential-integrated';
import UploadCompsModalResidential from './residential-upload-comps-modal';
import ResidentialCompsForm from './ResidentialCompsForm';
import { ViewToggle, ViewMode } from '@/components/view-toggle';
import CompsCardsView from '@/pages/comps/Listing/comps-cards-view';
import { colors, borderRadius, shadows } from '@/utils/design-tokens';
import { debounce, getViewPreference } from '@/utils/comps-helpers';

const ResidentialMapHeaderOptionsRedesigned = () => {
  const navigate = useNavigate();
  let appliedFilter: number = 0;
  const location = useLocation();
  const type = location.state?.type;
  const [isOpen, setIsOpen] = useState(false);
  
  // Residential defaults to cards view
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const savedView = getViewPreference('residential');
    const oldToggle = localStorage.getItem('selectedToggle');
    if (oldToggle === 'android') return 'cards'; // Residential prefers cards
    if (oldToggle === 'web') return 'map';
    return savedView;
  });

  const [selectedButton, setSelectedButton] = useState(() => {
    if (currentView === 'map') return 'web';
    return 'android';
  });

  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');
  const [sidebarFilters, setSidebarFilters] = useState<FilterComp | null>(null);
  const [sendTypes, setSendTypes] = useState<string>('sales');
  const [page, setPage] = useState(1);
  
  const [checkType, setCheckType] = useState(() => {
    if (type === 'leases') return 'leasesCheckbox';
    else if (localStorage.getItem('checkType') === 'leasesCheckbox') return 'leasesCheckbox';
    return localStorage.getItem('checkStatus') === 'lease' ? 'leasesCheckbox' : 'salesCheckbox';
  });

  const [selectPropertyType, setSelectPropertyType] = useState('show_all');
  const [sortingOrder, setSortingOrder] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [uploadCompsStatus, setUploadCompsStatus] = useState(false);
  const [selectedValue, setSelectedValue] = useState(sidebarFilters?.propertyType || selectPropertyType || '');
  const [options, setOptions] = useState(RetailpropertyTypeJson);
  const [sortingSettings, setSortingSettings] = useState({
    sortingType: '',
    orderSorting: '',
  });
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
    
    if (newView === 'map') {
      setSelectedButton('web');
      localStorage.setItem('selectedToggle', 'web');
    } else {
      setSelectedButton('android');
      localStorage.setItem('selectedToggle', 'android');
    }

    const keysToRemove = [
      'building_sf_min', 'building_sf_max', 'land_sf_min', 'land_sf_max',
      'cap_rate_max', 'all', 'selectedCities', 'street_address',
      'start_date', 'end_date', 'state', 'compStatus', 'property_type',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem('view');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const openNav = () => setIsOpen(true);
  const uploadComps = () => setOpen(true);
  const createComps = () => navigate('/residential-create-comps');

  useEffect(() => {
    if (sortingOrder === SortingEnum.ASC || sortingOrder === SortingEnum.ASC_0 || sortingOrder === SortingEnum.ASC_1) {
      setSortingSettings((prev) => ({ ...prev, orderSorting: SortingEnum.ASC }));
    } else {
      setSortingSettings((prev) => ({ ...prev, orderSorting: SortingEnum.DESC }));
    }

    if (checkType === 'salesCheckbox' && (sortingOrder === SortingEnum.ASC_0 || sortingOrder === SortingEnum.DESC_1)) {
      setSortingSettings((prev) => ({ ...prev, sortingType: SortingEnum.SALE_PRICE }));
    } else if (sortingOrder === SortingEnum.ASC || sortingOrder === SortingEnum.DESC_0) {
      setSortingSettings((prev) => ({ ...prev, sortingType: SortingEnum.STREET_ADDRESS }));
    } else {
      setSortingSettings((prev) => ({ ...prev, sortingType: SortingEnum.Date_SOLD }));
    }
  }, [sortingOrder, checkType]);

  // Calculate applied filters
  const keysToCheck = [
    'street_address_comps', 'property_type', 'all', 'selectedCities', 'street_address',
    'start_date', 'end_date', 'building_sf_min', 'building_sf_max', 'compStatus', 'state',
  ];
  const isNonEmpty = (value: string | null) => value !== null && value.trim() !== '';
  keysToCheck.forEach((key) => {
    const value = localStorage.getItem(key);
    if (isNonEmpty(value)) appliedFilter += 1;
  });

  if (loading) {
    return <div className="img-update-loader"><img src={loadingImage} alt="Loading..." /></div>;
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
            <Box className="flex items-center flex-wrap gap-3">
              <Typography variant="h5" component="h1" className="font-bold text-white" sx={{ fontSize: '24px', fontWeight: 700 }}>
                Residential Comps
              </Typography>

              {/* Sales/Lease Toggle */}
              <motion.div className="flex bg-white/10 rounded-lg p-1" style={{ borderRadius: borderRadius.md }}>
                <button
                  onClick={() => setCheckType('salesCheckbox')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    checkType === 'salesCheckbox' ? 'bg-white text-gray-900' : 'text-white/80 hover:text-white'
                  }`}
                  style={{ borderRadius: borderRadius.sm }}
                >
                  Sales
                </button>
                <button
                  onClick={() => setCheckType('leasesCheckbox')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    checkType === 'leasesCheckbox' ? 'bg-white text-gray-900' : 'text-white/80 hover:text-white'
                  }`}
                  style={{ borderRadius: borderRadius.sm }}
                >
                  Leases
                </button>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                className="relative flex items-center bg-white/10 rounded-lg px-4 py-2"
                style={{ borderRadius: borderRadius.md, backdropFilter: 'blur(10px)' }}
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

              {/* Sort By */}
              <Box className="selectDropdown min-w-[160px]">
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

              {/* Filter Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openNav}
                className="relative flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                style={{ borderRadius: borderRadius.md, border: `2px solid ${colors.primary}` }}
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
                      style={{ backgroundColor: colors.accent }}
                    >
                      {appliedFilter}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </Box>

            <Box className="flex items-center gap-3">
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createComps}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: colors.primary, borderRadius: borderRadius.md }}
              >
                <Add fontSize="small" />
                <span className="hidden sm:inline">Create New</span>
              </motion.button>

              <ViewToggle
                currentView={currentView}
                onViewChange={handleToggle}
                compType="residential"
                availableViews={['cards', 'map']} // Residential focuses on cards + map
              />
            </Box>
          </Box>
        </Box>
      </motion.div>

      <MapFilter
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        sendTypes={sendTypes}
        onApplyFilter={(filter) => setSidebarFilters(filter)}
        selectPropertyType={selectPropertyType}
        selectType={''}
        passDataCheckType={passDataCheckType}
        checkType={checkType}
        setPage={setPage}
      />

      <AnimatePresence mode="wait">
        {currentView === 'map' && (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CompsMapListingIntegratedResidential
              typeFilter={''}
              sidebarFilters={sidebarFilters}
              searchValuesByfilter={searchValuesByfilter}
              typeProperty={[]}
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
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {/* Cards view for residential - uses shared component */}
            <div className="p-6">
              <p className="text-center text-gray-500">
                Residential cards view - integrate with existing listing component or use CompsCardsView
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResidentialMapHeaderOptionsRedesigned;


















