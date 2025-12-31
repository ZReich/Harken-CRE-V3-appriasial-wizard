import { Formik, Form } from 'formik';
import { mapFilterValidation } from '@/utils/validation-Schema';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import StyledFieldFilter from '@/components/styles/styledFiledFilter';
import { CustomSelect } from '@/components/custom-select';
import { RetailpropertyTypeJson } from '@/pages/comps/comp-form/fakeJson';
import CommonButton from '@/components/elements/button/Button';
import DatePickerComp from '@/components/date-picker';
import { handleInputChange, sanitizeInputLandSize } from '@/utils/sanitize';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { useGet } from '@/hook/useGet';
import MultipleSelectCheckmarks from '@/components/multi-select';
import { formatDate } from '@/utils/date-format';
import { filterInitialValues } from '@/pages/residential/Listing/filter-initial-values';
// import { filterInitialValues } from './filter-initial-values';
import { SelectChangeEvent } from '@mui/material/Select';
import crossImage from '../../../../images/cross.png';
import { FilterCompResidential } from '@/components/interface/header-filter';
import { FilterListingEnum } from '@/pages/comps/enum/CompsEnum';
import moment from 'moment';
import SelectTextField from '@/components/styles/select-input';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';

let saveCityParams: any;

interface MapFilterProps {
  isOpen: boolean;
  compFilters?: any;
  setIsOpen: (isOpen: boolean) => void;
  onApplyFilter: (filters: FilterCompResidential) => void;
  selectPropertyType?: any;
  setPage?: any;
  sendTypes?: any;
  selectType?: string;
  passDataCheckType?: any;
  checkType?: any;
  onReset?: () => void;
}

interface FormData {
  start_date: any;
  end_date: any;
  building_sf_min: string;
  building_sf_max: string;
  land_sf_min: string;
  land_sf_max: string;
  property_type: string;
  street_address: string;
  formUpdate: boolean;
  state: string;
  orderColoumn: string;
}

interface City {
  city: string;
}

interface CityResponse {
  data: {
    data: {
      allCities: City[];
    };
  };
}

const REsidentialCompsAdvanceFilter: React.FC<MapFilterProps> = ({
  isOpen,
  setIsOpen,
  onApplyFilter,
  selectPropertyType,
  setPage,
  onReset,
}) => {
  const isButtonVisible = FilterListingEnum.MAP_SEARCH_FILTER;
  const fieldWidth: string = '100%';
  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({ value, label })
  );

  // Clear storage when browser is refreshed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear specific local storage items related to filters
      ClearAdditionalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const [state, setState] = useState('');
  const [property_type, setPropertyType] = useState('show_all');
  const [selectedCities, setSelectedCities] = useState<any[]>([]);
  const [options] = useState(RetailpropertyTypeJson);
  const [hasFilterChanged, setHasFilterChanged] = useState(false);
  useEffect(() => {
    setSelectedCities([]);
  }, [state]);
  useEffect(() => {
    const storedCities = localStorage.getItem('selectedCities');

    if (storedCities) {
      try {
        const parsedCities = JSON.parse(storedCities);
        if (Array.isArray(parsedCities) && parsedCities.length > 0) {
          setSelectedCities(parsedCities);
        }
      } catch (e) {
        console.warn('🚫 FILTER INIT: Failed to parse stored cities:', e);
      }
    }
  }, []); // Run only on mount

  const handleCityChange = (selectedCities: City[]) => {
    localStorage.removeItem('selectedCities_res');
    const cityNames: string[] = selectedCities.map((cityObj) => cityObj.city);
    saveCityParams = cityNames; // Store as string array instead of objects
    setSelectedCities(cityNames);
  };
  console.log(hasFilterChanged);

  const handleSubmit = async (value: FormData) => {
    setPage(1);
    setIsOpen(false);

    const fallbackParams = {
      state: localStorage.getItem('state_res') || '',
      street_address: localStorage.getItem('street_address_res') || '',
    };

    let buildingMax: number | null;
    let buildingMin: number | null;
    let landMin: number | null;
    let landMax: number | null;
    let stateStorage: any;
    let selectedCity: any;

    if (localStorage.getItem('selectedCities_res')) {
      const parsedData = JSON.parse(
        localStorage.getItem('selectedCities_res')!
      );
      // Now parsedData is already a string array like ['Los Angeles', 'New York']
      selectedCity = parsedData;
    } else {
      selectedCity = selectedCities ? selectedCities : [];
    }

    if (localStorage.getItem('state_res')) {
      stateStorage = localStorage.getItem('state_res');
    } else {
      stateStorage =
        value.state === '--Select State--' ? fallbackParams.state : value.state;
    }

    const storedBuildingMax = localStorage.getItem('building_sf_max_res');
    if (storedBuildingMax) {
      buildingMax = parseFloat(storedBuildingMax.replace(/,/g, ''));
    } else {
      buildingMax = value.building_sf_max
        ? parseFloat(value.building_sf_max.replace(/,/g, ''))
        : null;
    }

    const storedBuildingMin = localStorage.getItem('building_sf_min_res');
    if (storedBuildingMin) {
      buildingMin = parseFloat(storedBuildingMin.replace(/,/g, ''));
    } else {
      buildingMin = value.building_sf_min
        ? parseFloat(value.building_sf_min.replace(/,/g, ''))
        : null;
    }

    const storedLandMin = localStorage.getItem('land_sf_min_res');
    if (storedLandMin) {
      landMin = parseFloat(storedLandMin.replace(/,/g, ''));
    } else {
      landMin = value.land_sf_min
        ? parseFloat(value.land_sf_min.replace(/,/g, ''))
        : null;
    }

    const storedLandMax = localStorage.getItem('land_sf_max_res');
    if (storedLandMax) {
      landMax = parseFloat(storedLandMax.replace(/,/g, ''));
    } else {
      landMax = value.land_sf_max
        ? parseFloat(value.land_sf_max.replace(/,/g, ''))
        : null;
    }

    const params: Omit<FilterCompResidential, 'search'> = {
      end_date:
        value.end_date === 'NaN/NaN/NaN'
          ? ''
          : value.end_date || localStorage.getItem('end_date_res') || '',
      start_date:
        value.start_date === 'NaN/NaN/NaN'
          ? ''
          : value.start_date || localStorage.getItem('start_date_res') || '',
      building_sf_min: buildingMin,
      land_sf_min: landMin,
      building_sf_max: buildingMax,
      land_sf_max: landMax,
      propertyType: property_type === 'show_all' ? '' : property_type,
      street_address:
        value.street_address ||
        localStorage.getItem('street_address_res') ||
        '',
      city: selectedCity,
      state: stateStorage,
    };
    onApplyFilter(params);

    localStorage.setItem('params_res', JSON.stringify(params));
    localStorage.setItem('property_type', params.propertyType);
    localStorage.setItem('state_res', params.state);
    localStorage.setItem('street_address_res', params.street_address);

    if (saveCityParams) {
      localStorage.setItem(
        'selectedCities_res',
        JSON.stringify(saveCityParams)
      );
    }

    if (!localStorage.getItem('state_res')) {
      localStorage.removeItem('selectedCities_res');
    }

    localStorage.setItem('end_date_res', params.end_date);
    localStorage.setItem('start_date_res', params.start_date);

    const input = sanitizeInputLandSize(
      params.building_sf_min !== null ? params.building_sf_min.toString() : ''
    );
    localStorage.setItem('building_sf_min_res', input);

    const input_max_building = sanitizeInputLandSize(
      params.building_sf_max !== null ? params.building_sf_max.toString() : ''
    );
    localStorage.setItem('building_sf_max_res', input_max_building);

    const input_land_sf_min = sanitizeInputLandSize(
      params.land_sf_min !== null ? params.land_sf_min.toString() : ''
    );
    localStorage.setItem('land_sf_min_res', input_land_sf_min);

    const input_land_sf_max = sanitizeInputLandSize(
      params.land_sf_max !== null ? params.land_sf_max.toString() : ''
    );
    localStorage.setItem('land_sf_max_res', input_land_sf_max);
  };

  const { data } = useGet<CityResponse>({
    queryKey: `${FilterListingEnum.CITY}/${state}`,
    endPoint: `resComps/cities?state=${state}`,
    config: { enabled: Boolean(state), refetchOnWindowFocus: false },
  });

  const usaCity = (data && data.data && data.data.data) || [];

  const closeNav = () => {
    setIsOpen(false);
  };

  const clearFields = (resetForm: any) => {
    saveCityParams = '';
    setPropertyType('show_all');
    setState('');
    setSelectedCities([]);
    resetForm();
    // Clear specific local storage items related to filters
    ClearAdditionalStorage();
  };

  useEffect(() => {
    setPropertyType(selectPropertyType);
  }, [selectPropertyType]);

  // Removed automatic restoration useEffect to prevent previous values from being stored

  useEffect(() => {
    const propertyType =
      localStorage.getItem('property_type') ||
      localStorage.getItem('property_type_res');
    const state = localStorage.getItem('state_res');

    if (propertyType) {
      setPropertyType(propertyType);
    }
    if (state) {
      setState(state);
    }
  }, []);

  // Update property_type when filter opens
  useEffect(() => {
    if (isOpen) {
      const currentPropertyType = localStorage.getItem('property_type');
      if (currentPropertyType && currentPropertyType !== property_type) {
        setPropertyType(currentPropertyType);
      }
    }
  }, [isOpen, property_type]);

  return (
    <>
      <Box
        className={`element overlay z-50 backdrop-brightness-75 flex justify-end items-center  top-0 right-0 fixed overflow-x-hidden min-h-full transition-width duration-500 ${isOpen ? 'open' : ''}`}
      >
        <Box className="overlay-content rounded-lg max-w-[655px] w-full relative flex flex-col bg-white shadow-zinc-900">
          <Formik
            initialValues={filterInitialValues}
            validationSchema={mapFilterValidation}
            onSubmit={handleSubmit}
          >
            {({ handleChange, values, setFieldValue, resetForm }) => {
              return (
                <>
                  <Form>
                    <Box className="rounded relative flex items-center justify-between p-4 bg-[#E7F6FA] w-full">
                      <Box className="advance-Filter text-customDeeperSkyBlue font-bold text-base leading-[19.5px]">
                        {FilterListingEnum.ADVANCE_FILTER}
                      </Box>
                      <Box
                        onClick={closeNav}
                        className="cursor-pointer flex items-center"
                      >
                        <img
                          src={crossImage}
                          alt="crossImage"
                          className="h-[14px] w-[22px] px-1"
                        />
                      </Box>
                    </Box>
                    <div className="p-5 overflow-y-auto max-h-[90vh]">
                      <div className="grid grid-cols-3 gap-5">
                        <Box className="text-left font-semibold col-span-3 text-sm">
                          {FilterListingEnum.SEARCH_TYPE}
                        </Box>
                        <div className="w-full">
                          <CustomSelect
                            label="Property Type"
                            options={options}
                            value={
                              property_type ||
                              localStorage.getItem('compStatus') ||
                              'show_all'
                            }
                            // value={values?.property_type}
                            onChange={(e: SelectChangeEvent<string>) => {
                              setPropertyType(e.target.value);
                              localStorage.setItem(
                                'property_type',
                                e.target.value
                              );
                              setFieldValue('property_type', e.target.value);
                            }}
                          />
                        </div>
                        <Box className="text-left font-semibold col-span-3 text-sm">
                          {FilterListingEnum.LOCATION}
                        </Box>
                        <div className="w-full mt-1">
                          <SelectTextField
                            options={usaStateOptions}
                            label="State"
                            name="state"
                            value={state || 'select'}
                            onChange={(e: SelectChangeEvent<string>) => {
                              localStorage.removeItem('selectedCities_res');
                              localStorage.removeItem('state_res');
                              const newValue = e.target.value as string;
                              setState(newValue);
                              setHasFilterChanged(true);
                              setFieldValue('state', newValue);
                            }}
                          />
                        </div>
                        <div className="w-full">
                          <MultipleSelectCheckmarks
                            onChange={handleCityChange}
                            usaCity={usaCity}
                            label="Residential"
                            appraisalData={undefined}
                          />
                        </div>
                        <div className="w-full ">
                          <StyledFieldFilter
                            label="Street Address"
                            name="street_address"
                            type="text"
                            onChange={(e: SelectChangeEvent<string>) => {
                              localStorage.removeItem('street_address_res');
                              setHasFilterChanged(true);
                              setFieldValue('street_address', e.target.value);
                            }}
                            value={
                              values.street_address ||
                              localStorage.getItem('street_address_res') ||
                              ''
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-5 py-5">
                        <Box className="text-left font-semibold col-span-3 text-sm">
                          {FilterListingEnum.ADDITIONAL_CRITERIA}
                        </Box>
                        <DatePickerComp
                          label={
                            <p className="text-base">
                              {FilterListingEnum.SALE_DATE_START}
                            </p>
                          }
                          name="start_date"
                          value={moment(
                            values.start_date
                              ? values.start_date
                              : localStorage.getItem('start_date_res')
                          )}
                          onChange={(value: Date | null) => {
                            if (value) {
                              const formattedDate = formatDate(value);
                              localStorage.setItem(
                                'start_date_res',
                                formattedDate
                              );
                              setHasFilterChanged(true);
                              handleChange({
                                target: {
                                  name: 'start_date',
                                  value: formattedDate,
                                },
                              });
                            } else {
                              localStorage.removeItem('start_date_res');
                              setHasFilterChanged(true);
                              handleChange({
                                target: {
                                  name: 'start_date',
                                  value: '',
                                },
                              });
                            }
                          }}
                        />

                        <DatePickerComp
                          label={
                            <p className="text-base">
                              {FilterListingEnum.SALE_DATE_END}
                            </p>
                          }
                          name="end_date"
                          value={moment(
                            values.end_date
                              ? values.end_date
                              : localStorage.getItem('end_date_res')
                          )}
                          onChange={(value: Date | null) => {
                            if (value) {
                              const formattedDate = formatDate(value);
                              localStorage.setItem(
                                'end_date_res',
                                formattedDate
                              );
                              setHasFilterChanged(true);
                              handleChange({
                                target: {
                                  name: 'end_date',
                                  value: formattedDate,
                                },
                              });
                            } else {
                              localStorage.removeItem('end_date_res');
                              setHasFilterChanged(true);
                              handleChange({
                                target: {
                                  name: 'end_date',
                                  value: '',
                                },
                              });
                            }
                          }}
                        />

                        <StyledFieldFilter
                          label="Building SF Min"
                          name="building_sf_min"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize(e.target.value);
                            localStorage.removeItem('building_sf_min_res');
                            handleInputChange(
                              handleChange,
                              'building_sf_min',
                              input
                            );
                            setFieldValue('building_sf_min', input);
                          }}
                          value={
                            values.building_sf_min ||
                            localStorage.getItem('building_sf_min_res') ||
                            ''
                          }
                        />

                        <StyledFieldFilter
                          label="Building SF Max"
                          name="building_sf_max"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            localStorage.removeItem('building_sf_max_res');
                            const input = sanitizeInputLandSize(e.target.value);
                            handleInputChange(
                              handleChange,
                              'building_sf_max',
                              input
                            );
                            setFieldValue('building_sf_max', input);
                          }}
                          value={
                            values.building_sf_max ||
                            localStorage.getItem('building_sf_max_res') ||
                            ''
                          }
                        />
                        <StyledFieldFilter
                          label="Land SF Min"
                          name="land_sf_min"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            localStorage.removeItem('land_sf_min_res');
                            const input = sanitizeInputLandSize(e.target.value);
                            handleInputChange(
                              handleChange,
                              'land_sf_min',
                              input
                            );
                            setFieldValue('land_sf_min', input);
                          }}
                          value={
                            values.land_sf_min ||
                            localStorage.getItem('land_sf_min_res') ||
                            ''
                          }
                        />
                        <StyledFieldFilter
                          label="Land SF Max"
                          name="land_sf_max"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize(e.target.value);
                            localStorage.removeItem('land_sf_max_res');
                            handleInputChange(
                              handleChange,
                              'land_sf_max',
                              input
                            );
                            setFieldValue('land_sf_max', input);
                          }}
                          value={
                            values.land_sf_max ||
                            localStorage.getItem('land_sf_max_res') ||
                            ''
                          }
                          style={{ width: fieldWidth }}
                        />
                      </div>
                      <Box className="mt-7 flex justify-between items-center">
                        <Box className="flex justify-end">
                          <Button
                            className="p-2 px-3"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              clearFields(resetForm);
                              setFieldValue('state', '');

                              // Clear sortingOrder from localStorage on reset
                              localStorage.removeItem('sortingOrder');

                              // Notify parent component to reset sortingOrder state
                              if (onReset) {
                                onReset();
                              }

                              // Clear compFilters by applying empty filter with timestamp
                              onApplyFilter({
                                start_date: '',
                                end_date: '',
                                building_sf_min: null,
                                building_sf_max: null,
                                land_sf_min: null,
                                land_sf_max: null,
                                propertyType: '',
                                street_address: '',
                                city: [],
                                state: '',
                                _timestamp: Date.now(),
                              });
                            }}
                          >
                            Reset
                          </Button>
                        </Box>
                        <div>
                          <CommonButton
                            variant="contained"
                            type="button"
                            isButtonVisible={isButtonVisible}
                            onClick={() => handleSubmit(values)}
                          >
                            {FilterListingEnum.APPLY}
                          </CommonButton>
                        </div>
                      </Box>
                    </div>
                  </Form>
                </>
              );
            }}
          </Formik>
        </Box>
      </Box>
    </>
  );
};

export default REsidentialCompsAdvanceFilter;
