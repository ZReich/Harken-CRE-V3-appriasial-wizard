import { Formik, Form } from 'formik';
import { mapFilterValidation } from '@/utils/validation-Schema';
import { Box, Button, SelectChangeEvent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import StyledFieldFilter from '@/components/styles/styledFiledFilter';
import { CustomSelect } from '@/components/custom-select';
import CommonButton from '@/components/elements/button/Button';
import { ComparisonBasisOptions } from '@/pages/comps/Listing/filter-initial-values';

import DatePickerComp from '@/components/date-picker';
import {
  handleInputChange,
  sanitizeInputPercentage,
  sanitizeInputLandSize,
} from '@/utils/sanitize';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { useGet } from '@/hook/useGet';
import { formatDate } from '@/utils/date-format';
import crossImage from '../../../../images/cross.png';
import { filterInitialValues } from '@/pages/comps/Listing/filter-initial-values';
import { FilterComp } from '@/components/interface/header-filter';
import moment from 'moment';
import { FilterListingEnum } from '@/pages/comps/enum/CompsEnum';
import { ClearAdditionalStorage } from '@/utils/clearAdditionalStorage';
import SelectTextField from '@/components/styles/select-input';
import { formatToPercentage } from '@/utils/commonFunctions';
import MultipleSelectWithAPI from '@/pages/comps/Listing/select-type';
import AdvanceFilterMultipleSelectCheckmarks from '@/components/advance-filter-multi-select';
import { leaseTypeOptions } from '@/pages/comps/create-comp/SelectOption';
import MultipleSelectLandWithAPI from '@/pages/comps/Listing/select-land-type';
// import { RestoreFocus } from '@dnd-kit/core/dist/components/Accessibility';
export interface Option {
  id: number;
  name: string;
  code: string; // Include the code in the Option type
}

interface MapFilterProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApplyFilter: (filters: FilterComp) => void;
  sendTypes: string;
  selectPropertyType: any;
  selectType: any;
  passDataCheckType: any;
  checkType: any;
  setPage: any;
}

interface FormData {
  square_footage_max: any;
  square_footage_min: any;
  start_date: any;
  end_date: any;
  building_sf_min: string;
  cape_rate_min: string;
  cap_rate_max: string;
  building_sf_max: string;
  land_sf_min: string;
  land_sf_max: string;
  property_type: string;
  compStatus: string;
  street_address: string;
  formUpdate: boolean;
  all: string;
  state: string;
  orderByColumn: string;
  lease_type: any;
  price_sf_max: any;
  price_sf_min: any;
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

const CostCompsAdvanceFilter: React.FC<MapFilterProps> = ({
  isOpen,
  setIsOpen,
  onApplyFilter,
  passDataCheckType,
  checkType,
  setPage,
}) => {
  console.log(passDataCheckType, 'passDataCheckType');
  const isButtonVisible = FilterListingEnum.MAP_SEARCH_FILTER;
  const fieldWidth: string = '100%';
  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({ value, label })
  );
  const [state, setState] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<any>([]);
  const [options, setOptions] = React.useState<any[]>([]);

  const [, setPropertyType] = useState('');
  const [compStatus, setSelectType] = useState('');
  const [, setSelectCompType] = useState('');

  const [selectedCities, setSelectedCities] = useState<any[]>([]);
  const { data: newdata } = useGet<any>({
    queryKey: 'all',
    endPoint: `globalCodes`,
    config: { refetchOnWindowFocus: false },
  });
  const saleStatusData = Array.isArray(newdata?.data?.data)
    ? newdata?.data?.data
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
  const leaseStatusData = Array.isArray(newdata?.data?.data)
    ? newdata?.data?.data
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
  React.useEffect(() => {
    if (newdata?.data?.data) {
      const rawData = newdata?.data?.data;

      // Check if rawData is an array
      if (Array.isArray(rawData)) {
        const filteredData = rawData.find(
          (item: any) => item.type === 'property_types'
        );

        if (filteredData && filteredData.options) {
          const processedOptions = filteredData.options
            .filter(
              (option: any) =>
                option.code === 'building_with_land' ||
                option.code === 'land_only'
            )
            .flatMap((option: any) => {
              const parentOption = {
                id: option.id,
                name: option.name, // This is what will be displayed
                code: option.code, // This is what will be stored
                disabled: true, // Parent option disabled
              };

              const subOptions =
                option.sub_options?.map((subOption: any) => ({
                  id: subOption.id,
                  name: subOption.name, // This will be displayed
                  code: subOption.code, // This will be stored
                  disabled: false, // Sub-options enabled
                })) || [];

              return [parentOption, ...subOptions];
            });

          setOptions(processedOptions);
        }
      } else {
        console.error('Expected an array but received:', rawData);
      }
    }
  }, [newdata]);
  useEffect(() => {
    setSelectedCities([]);
  }, [state]);
  const getStoredValue = (key: string, fallback: any = null) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return storedValue;
    }
    return fallback;
  };
  const handleCityChange = (selectedCities: City[]) => {
    // Remove the previous selected cities from localStorage
    localStorage.removeItem('selectedCities');

    const cityNames = selectedCities.map((cityObj) => cityObj.city);

    localStorage.setItem('selectedCities', JSON.stringify(cityNames));

    setSelectedCities(cityNames);
  };

  const handleSubmit = async (value: FormData) => {
    setPage(1);
    setIsOpen(false);

    const fallbackParams = {
      cap_rate_min: localStorage.getItem('all')
        ? Number(localStorage.getItem('all')!.replace('%', ''))
        : null,
      cap_rate_max: localStorage.getItem('cap_rate_max')
        ? Number(localStorage.getItem('cap_rate_max')!.replace('%', ''))
        : null,
      state: localStorage.getItem('state') || '',
      street_address: localStorage.getItem('street_address') || '',
    };

    const capeRateMaxValue = localStorage.getItem('cap_rate_max')
      ? localStorage.getItem('cap_rate_max')!.replace('%', '')
      : value.cap_rate_max
        ? value.cap_rate_max.replace('%', '')
        : '';

    const capeRateMinValue = localStorage.getItem('all')
      ? localStorage.getItem('all')!.replace('%', '')
      : value.all
        ? value.all.replace('%', '')
        : '';

    const buildingMax = localStorage.getItem('building_sf_max')
      ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
      : value.building_sf_max
        ? parseFloat(value.building_sf_max.replace(/,/g, ''))
        : null;

    const spaceMax = localStorage.getItem('square_footage_max')
      ? parseFloat(
          localStorage.getItem('square_footage_max')!.replace(/,/g, '')
        )
      : value.square_footage_max
        ? parseFloat(value.square_footage_max.replace(/,/g, ''))
        : null;

    const spaceMin = localStorage.getItem('square_footage_min')
      ? parseFloat(
          localStorage.getItem('square_footage_min')!.replace(/,/g, '')
        )
      : value.square_footage_min
        ? parseFloat(value.square_footage_min.replace(/,/g, ''))
        : null;

    const priceMax = localStorage.getItem('price_sf_max')
      ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
      : value.price_sf_max
        ? parseFloat(value.price_sf_max.replace(/,/g, ''))
        : null;
    const leaseType = localStorage.getItem('lease_type')
      ? localStorage.getItem('lease_type') // Take value from localStorage if present
      : value.lease_type
        ? value.lease_type // Otherwise, take value from `value.lease_type`
        : null; // Default to null if neither exists

    const PriceMin = localStorage.getItem('price_sf_min')
      ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
      : value.price_sf_min
        ? parseFloat(value.price_sf_min.replace(/,/g, ''))
        : null;

    const buildingMin = localStorage.getItem('building_sf_min')
      ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
      : value.building_sf_min
        ? parseFloat(value.building_sf_min.replace(/,/g, ''))
        : null;
    const landMax = localStorage.getItem('land_sf_max')
      ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
      : value.land_sf_max
        ? parseFloat(value.land_sf_max.replace(/,/g, ''))
        : null;

    const landMin = localStorage.getItem('land_sf_min')
      ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
      : value.land_sf_min
        ? parseFloat(value.land_sf_min.replace(/,/g, ''))
        : null;

    let propertyType: string[] | null = null;
    const storedPropertyType = localStorage.getItem('property_type');

    if (storedPropertyType) {
      // If property_type is stored, convert it into an array
      propertyType = storedPropertyType.split(',').map((item) => item.trim());
    } else if (selectedOptions.length > 0) {
      // If selectedOptions have values, set it
      propertyType = selectedOptions;
    }

    let currentCompStatus = compStatus;
    const storedCompStatus = localStorage.getItem('compStatus');

    // let currentLeaseType = compType;
    // const storedCompTYpe = localStorage.getItem('leaee_type');

    if (storedCompStatus) {
      // If compStatus is stored, use the value from localStorage
      currentCompStatus = storedCompStatus;
    } else {
      // Otherwise, store the value from compStatus (if not in localStorage already)
      // localStorage.setItem('compStatus', currentCompStatus);
    }

    // if (storedCompTYpe) {
    //   // If compStatus is stored, use the value from localStorage
    //   currentLeaseType = storedCompTYpe;
    // } else {
    //   // Otherwise, store the value from compStatus (if not in localStorage already)
    //   localStorage.setItem('lease_type', currentLeaseType);
    // }

    const stateStorage = value.state || localStorage.getItem('state') || '';
    const selectedCity = getStoredValue('selectedCities', selectedCities);

    const params: Omit<FilterComp, 'search'> = {
      end_date: value.end_date,
      start_date: value.start_date || localStorage.getItem('start_date') || '',
      land_sf_min: landMin ?? null,
      land_sf_max: landMax ?? null,
      propertyType: propertyType || null,
      compStatus: currentCompStatus || '',
      lease_type: leaseType || null,
      street_address:
        value.street_address || localStorage.getItem('street_address') || '',
      city: selectedCity || [],
      state: stateStorage || '',
      comp_type: undefined,
      building_sf_min:
        passDataCheckType === 'leasesCheckbox' ? null : buildingMin ?? null,
      building_sf_max:
        passDataCheckType === 'leasesCheckbox' ? null : buildingMax ?? null,
      square_footage_min:
        passDataCheckType === 'leasesCheckbox' ? spaceMin ?? null : null,
      square_footage_max:
        passDataCheckType === 'leasesCheckbox' ? spaceMax ?? null : null,
      price_sf_max:
        passDataCheckType === 'leasesCheckbox' ? priceMax ?? null : null,
      price_sf_min:
        passDataCheckType === 'leasesCheckbox' ? PriceMin ?? null : null,
      cap_rate_max:
        passDataCheckType !== 'leasesCheckbox'
          ? capeRateMaxValue
            ? Number(capeRateMaxValue)
            : fallbackParams.cap_rate_max ?? null
          : null,
      cap_rate_min:
        passDataCheckType !== 'leasesCheckbox'
          ? capeRateMinValue
            ? Number(capeRateMinValue)
            : fallbackParams.cap_rate_min ?? null
          : null,
    };

    onApplyFilter(params);

    localStorage.setItem(
      'all',
      sanitizeInputPercentage(
        params.cap_rate_min !== null && params.cap_rate_min !== undefined
          ? params.cap_rate_min.toString().replace(/%/g, '')
          : ''
      )
    );

    if (!value.state) {
      localStorage.removeItem('selectedCities');
    }
  };

  const { data } = useGet<CityResponse>({
    queryKey: `city/${state}`,
    endPoint: `comps/cities?state=${state}`,
    config: { enabled: Boolean(state), refetchOnWindowFocus: false },
  });
  const usaCity = (data && data.data && data.data.data) || [];
  const closeNav = () => {
    //  clearFields();
    setIsOpen(false);
  };

  const clearFields = (resetForm: any) => {
    setSelectedOptions([]);
    setSelectType('');
    setPropertyType('');
    setState('');
    resetForm();
    setSelectedCities([]);
    localStorage.removeItem('selectedCities'); // Remove the key

    // Remove items from localStorage
    const removeFromLocalStorage = (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing ${key} from localStorage`, e);
      }
    };

    const fieldsToRemove = [
      'street_address',
      'compStatus',
      'property_type',
      'square_footage_max',
      'square_footage_min',
      'price_sf_min',
      'price_sf_max',
      'building_sf_min',
      'params',
      'end_date',
      'start_date',
      'cap_rate_max',
      'cap_rate_min',
      'selectedCities',
      'lease_type',
      'comp_type',
      'street_address_comps',
    ];

    fieldsToRemove.forEach(removeFromLocalStorage);

    ClearAdditionalStorage();
  };

  useEffect(() => {
    const selectedOptions = localStorage.getItem('property_type');
    const state = localStorage.getItem('state');

    if (selectedOptions) {
      setPropertyType(selectedOptions);
    }
    if (state) {
      setState(state);
    }
  }, []);
  useEffect(() => {
    const savedPropertyType = localStorage.getItem('property_type');
    if (savedPropertyType) {
      setSelectedOptions(savedPropertyType.split(','));
    }
  }, []);
  //   const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    const approachId = searchParams.get('approachId');
    const pathname = location.pathname;

    const shouldClear =
      (pathname === '/filter-comps' && id && approachId) ||
      pathname === '/comps';

    if (shouldClear) {
      const keysToRemove = [
        'building_sf_max',
        'building_sf_min',
        'cap_rate_max',
        'compStatus',
        'end_date',
        'land_sf_max',
        'land_sf_min',
        'property_type',
        'start_date',
        'state',
        'street_address',
        'all',
      ];

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
  }, [location]);

  // const handleSelectChange = (transformedArray: string[]) => {
  //   setSelectedOptions(transformedArray);
  //   // Save updated array to localStorage as a comma-separated string
  //   localStorage.setItem('property_type', transformedArray.join(','));
  // };

  return (
    <>
      <Box
        className={`element overlay z-50 backdrop-brightness-75 pb-10 justify-end items-end flex top-0 right-0 fixed overflow-x-hidden min-h-full transition-width duration-500 ${isOpen ? 'open' : ''}`}
      >
        <Box className="overlay-content rounded-lg max-w-[655px] w-full relative flex flex-col bg-white shadow-zinc-900">
          <Formik
            onSubmit={() => {}}
            initialValues={filterInitialValues}
            validationSchema={mapFilterValidation}
            // onSubmit={handleSubmit}
          >
            {({ handleChange, values, setFieldValue, resetForm }: any) => {
              const handleCapValuesChange = ({
                value = '',
                name = '',
              }: {
                value: string;
                name: string;
              }) => {
                if (value.endsWith('%')) {
                  value = value.slice(0, -1);
                }
                const formattedValue = formatToPercentage(value);
                setFieldValue(name, formattedValue);
                localStorage.setItem(name, formattedValue);
              };

              const handleKeyDown = ({
                eventValue,
                name,
              }: {
                eventValue: any;
                name: any;
              }) => {
                if (eventValue.key === 'Backspace') {
                  let value = values[name]; // Access the correct value dynamically based on the name
                  if (!value) return; // If the value is already empty, do nothing

                  // Handle full selection deletion
                  if (window.getSelection()?.toString() === value) {
                    setFieldValue(name, '');
                    localStorage.removeItem(name); // Remove from localStorage
                    return;
                  }

                  // Handle backspace logic
                  if (value.endsWith('%')) {
                    value = value.slice(0, -1); // Remove the percentage symbol
                  }

                  const newValue = value.slice(0, -1); // Remove the last character
                  if (!newValue) {
                    setFieldValue(name, '');
                    localStorage.removeItem(name); // Remove from localStorage
                  } else {
                    const formattedValue = formatToPercentage(newValue);
                    setFieldValue(name, formattedValue);
                    // localStorage.setItem(name, formattedValue); // Update localStorage with the new value
                  }
                }
              };

              return (
                <>
                  <Form>
                    <Box className="rounded relative flex items-center p-4 bg-[#E7F6FA]">
                      <Box className="advance-Filter text-customDeeperSkyBlue font-bold text-base">
                        ADVANCED FILTER
                      </Box>
                      <div className="flex items-center m-auto"></div>

                      <Box
                        // onClick={closeNav}
                        onClick={() => {
                          closeNav();
                          clearFields(resetForm);
                        }}
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
                          SEARCH TYPE
                        </Box>
                        <div className="w-full">
                          <CustomSelect
                            label={
                              // localStorage.getItem('compStatus')
                              //   ?
                              localStorage.getItem('checkType') ===
                              'leasesCheckbox'
                                ? 'Lease Status'
                                : 'Sale Status'
                              // : passDataCheckType === 'leasesCheckbox'
                              //   ? 'Lease Status'
                              //   : 'Sale Status'
                            }
                            value={localStorage.getItem('compStatus') || ''} // Show an empty value if compStatus is not set
                            onChange={(e) => {
                              const selectedValue = e.target.value; // Get the selected value
                              localStorage.setItem('compStatus', selectedValue); // Set it in localStorage

                              setSelectType(selectedValue); // Update the state
                              // setSidebarFilters(null); // Reset sidebar filters (if required)
                            }}
                            options={
                              localStorage.getItem('checkType') ===
                              'leasesCheckbox'
                                ? compsLeaseStatus
                                : compsSaleStatus
                            }
                          />
                        </div>

                        <Box
                          className="relative ml-9"
                          sx={{
                            border:
                              '1px solid rgb(13 161 199 / var(--tw-text-opacity))',
                            padding: 0, // Remove padding
                          }}
                        >
                          <div className="w-full">
                            {localStorage.getItem('activeType') ===
                            'land_only' ? (
                              <MultipleSelectLandWithAPI
                                onChange={(transformedArray) => {
                                  setSelectedOptions(transformedArray); // Update state
                                  // setSidebarFilters(null);
                                  // Save updated array as a comma-separated string
                                  localStorage.setItem(
                                    'property_type',
                                    transformedArray.join(',')
                                  );
                                }}
                                label="Type"
                                value={selectedOptions} // Bind state to value
                                options={options}
                                setOptions={setOptions}
                              />
                            ) : (
                              <MultipleSelectWithAPI
                                onChange={(transformedArray) => {
                                  setSelectedOptions(transformedArray); // Update state
                                  // setSidebarFilters(null);
                                  // Save updated array as a comma-separated string
                                  localStorage.setItem(
                                    'property_type',
                                    transformedArray.join(',')
                                  );
                                }}
                                label="Type"
                                value={selectedOptions} // Bind state to value
                                options={options}
                                setOptions={setOptions}
                              />
                            )}
                          </div>
                        </Box>
                        {localStorage.getItem('checkType') ===
                          'leasesCheckbox' && (
                          <CustomSelect
                            label={
                              localStorage.getItem('lease_type')
                                ? 'Lease Type'
                                : 'Lease Type'
                            }
                            value={localStorage.getItem('lease_type') || ''} // Show an empty value if compStatus is not set
                            onChange={(e) => {
                              const selectedCompTypeValue = e.target.value; // Get the selected value
                              localStorage.setItem(
                                'lease_type',
                                selectedCompTypeValue
                              ); // Set it in localStorage

                              setSelectCompType(selectedCompTypeValue); // Update the state
                              // setSidebarFilters(null); // Reset sidebar filters (if required)
                            }}
                            options={leaseTypeOptions} // Options specific to leases
                          />
                        )}
                        <div className="w-full">
                          <CustomSelect
                            disabled
                            label={
                              'Comparison basis'
                              // localStorage.getItem('compStatus')
                              //   ?
                            }
                            value={
                              localStorage.getItem('comparisonBasis') || ''
                            } // Show an empty value if compStatus is not set
                            options={ComparisonBasisOptions}
                          />
                        </div>
                        <Box className="text-left font-semibold col-span-3 text-sm">
                          LOCATION
                        </Box>
                        <div className="w-ful mt-[11px]">
                          <SelectTextField
                            options={usaStateOptions}
                            label="State"
                            name="state"
                            value={
                              localStorage.getItem('state')
                                ? localStorage.getItem('state')
                                : ''
                            }
                            onChange={(e: SelectChangeEvent<string>) => {
                              // Clear any previously stored cities and state
                              localStorage.removeItem('selectedCities');

                              const newValue = e.target.value as string;

                              // Set the selected state in localStorage
                              localStorage.setItem('state', newValue);

                              // Update state value in React state
                              setState(newValue);

                              // Update form field value
                              setFieldValue('state', newValue);
                            }}
                          />
                        </div>
                        <div className="w-full">
                          <AdvanceFilterMultipleSelectCheckmarks
                            onChange={handleCityChange}
                            usaCity={usaCity}
                            // usaCity={localStorage.getItem('selectedCities')}
                            label="Commercial"
                            appraisalData={undefined}
                          />
                        </div>
                        <div className="w-full mt-0.5">
                          <StyledFieldFilter
                            label="Street Address"
                            name="street_address"
                            type="text"
                            onChange={(e: SelectChangeEvent<string>) => {
                              const value = e.target.value;
                              localStorage.setItem('street_address', value); // Set value in localStorage
                              setFieldValue('street_address', value); // Update the form field value
                            }}
                            value={
                              // values.street_address ||
                              localStorage.getItem('street_address') || ''
                            }
                          />
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-2 gap-5 py-5 ${localStorage.getItem('activeType') === 'land_only' ? 'land-only-advancefilter' : ''}`}
                      >
                        <Box
                          className={`text-left font-semibold text-sm ${
                            localStorage.getItem('activeType') ===
                            'building_with_land'
                              ? 'col-span-3'
                              : 'col-span-2 mb-3'
                          }`}
                        >
                          ADDITIONAL CRITERIA
                        </Box>
                        <DatePickerComp
                          label={
                            localStorage.getItem('checkType') ===
                            'leasesCheckbox' ? (
                              <p className="text-base">Lease Start Date</p>
                            ) : (
                              <p className="text-base">Sale Start Date</p>
                            )
                          }
                          name="start_date"
                          onChange={(value: Date | null) => {
                            if (value) {
                              const formattedDate = formatDate(value);
                              handleChange({
                                target: {
                                  name: 'start_date',
                                  value: formattedDate,
                                },
                              });
                              localStorage.setItem('start_date', formattedDate);
                            } else {
                              handleChange({
                                target: {
                                  name: 'start_date',
                                  value: '',
                                },
                              });
                              localStorage.removeItem('start_date');
                            }
                          }}
                          value={
                            // values.start_date
                            // ? moment(values.start_date)
                            moment(localStorage.getItem('start_date')) || null
                          }
                        />
                        <DatePickerComp
                          label={
                            localStorage.getItem('checkType') ===
                            'leasesCheckbox' ? (
                              <p className="text-base">Lease End Date</p>
                            ) : (
                              <p className="text-base">Sale End Date</p>
                            )
                          }
                          name="end_date"
                          onChange={(value: Date | null) => {
                            if (value) {
                              const formattedDate = formatDate(value);
                              handleChange({
                                target: {
                                  name: 'end_date',
                                  value: formattedDate,
                                },
                              });
                              localStorage.setItem('end_date', formattedDate);
                            } else {
                              handleChange({
                                target: {
                                  name: 'end_date',
                                  value: '',
                                },
                              });
                              localStorage.removeItem('end_date');
                            }
                          }}
                          value={
                            // values.end_date
                            // ?
                            // moment(values.end_date)
                            // :
                            moment(localStorage.getItem('end_date')) || null
                          }
                        />
                        {localStorage.getItem('activeType') !== 'land_only' && (
                          <>
                            <StyledFieldFilter
                              label={
                                passDataCheckType === 'leasesCheckbox'
                                  ? 'Space SF Min'
                                  : 'Building SF Min'
                              }
                              name={
                                passDataCheckType === 'leasesCheckbox'
                                  ? 'square_footage_min'
                                  : 'building_sf_min'
                              }
                              type="text"
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const input = sanitizeInputLandSize(
                                  e.target.value
                                );

                                // Dynamically handle localStorage key
                                const localStorageKey =
                                  passDataCheckType === 'leasesCheckbox'
                                    ? 'square_footage_min'
                                    : 'building_sf_min';

                                // Update localStorage and handleChange
                                localStorage.setItem(localStorageKey, input);

                                handleInputChange(
                                  handleChange,
                                  localStorageKey,
                                  input
                                );

                                // Dynamically set Formik's field value
                                setFieldValue(localStorageKey, input);
                              }}
                              value={
                                passDataCheckType === 'leasesCheckbox'
                                  ? values.square_footage_min ||
                                    localStorage.getItem(
                                      'square_footage_min'
                                    ) ||
                                    ''
                                  : values.building_sf_min ||
                                    localStorage.getItem('building_sf_min') ||
                                    ''
                              }
                            />
                            <StyledFieldFilter
                              label={
                                passDataCheckType === 'leasesCheckbox'
                                  ? 'Space SF Max'
                                  : 'Building SF Max'
                              }
                              name={
                                passDataCheckType === 'leasesCheckbox'
                                  ? 'square_footage_max'
                                  : 'building_sf_max'
                              }
                              type="text"
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const input = sanitizeInputLandSize(
                                  e.target.value
                                );

                                // Dynamically handle localStorage key
                                const localStorageKey =
                                  passDataCheckType === 'leasesCheckbox'
                                    ? 'square_footage_max'
                                    : 'building_sf_max';

                                // Update localStorage and handleChange
                                localStorage.setItem(localStorageKey, input);

                                handleInputChange(
                                  handleChange,
                                  localStorageKey,
                                  input
                                );

                                // Dynamically set Formik's field value
                                setFieldValue(localStorageKey, input);
                              }}
                              value={
                                passDataCheckType === 'leasesCheckbox'
                                  ? values.square_footage_max ||
                                    localStorage.getItem(
                                      'square_footage_max'
                                    ) ||
                                    ''
                                  : values.building_sf_max ||
                                    localStorage.getItem('building_sf_max') ||
                                    ''
                              }
                            />
                          </>
                        )}

                        <StyledFieldFilter
                          label={
                            !localStorage.getItem('selectedSize') ||
                            localStorage.getItem('selectedSize') === 'SF'
                              ? 'Land SF Min'
                              : 'Land ACRE Min'
                          }
                          name="land_sf_min"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize(e.target.value);
                            localStorage.setItem('land_sf_min', input); // Set value in localStorage
                            handleInputChange(
                              handleChange,
                              'land_sf_min',
                              input
                            );
                            setFieldValue('land_sf_min', input); // Update form field value
                          }}
                          value={
                            // values.land_sf_min ||
                            localStorage.getItem('land_sf_min') || ''
                          }
                        />

                        <StyledFieldFilter
                          label={
                            !localStorage.getItem('selectedSize') ||
                            localStorage.getItem('selectedSize') === 'SF'
                              ? 'Land SF Max'
                              : 'Land ACRE Max'
                          }
                          name="land_sf_max"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize(e.target.value);
                            localStorage.setItem('land_sf_max', input);
                            handleInputChange(
                              handleChange,
                              'land_sf_max',
                              input
                            );
                            setFieldValue('land_sf_max', input);
                          }}
                          value={
                            // values.land_sf_max ||
                            localStorage.getItem('land_sf_max') || ''
                          }
                          style={{ width: fieldWidth }}
                        />

                        <>
                          {checkType === 'leasesCheckbox' && (
                            <>
                              <StyledFieldFilter
                                // label="$/SF/YR Min"
                                label={
                                  !localStorage.getItem('selectedSize') ||
                                  localStorage.getItem('selectedSize') === 'SF'
                                    ? '$/SF/YR Min'
                                    : '$/AC/YR Min'
                                }
                                name="price_sf_min"
                                onChange={(e) => {
                                  const input = sanitizeInputLandSize(
                                    e.target.value
                                  );
                                  const key = 'price_sf_min';

                                  localStorage.setItem(key, input); // Set value in localStorage
                                  handleInputChange(handleChange, key, input);
                                  setFieldValue(key, input);
                                }}
                                value={
                                  localStorage.getItem('price_sf_min') || ''
                                }
                                onKeyDown={(e: any) =>
                                  handleKeyDown({
                                    eventValue: e,
                                    name: 'price_sf_min',
                                  })
                                }
                              />

                              <StyledFieldFilter
                                label={
                                  !localStorage.getItem('selectedSize') ||
                                  localStorage.getItem('selectedSize') === 'SF'
                                    ? '$/SF/YR Max'
                                    : '$/AC/YR Max'
                                }
                                name="price_sf_max"
                                onChange={(e) => {
                                  const input = sanitizeInputLandSize(
                                    e.target.value
                                  );
                                  const key = 'price_sf_max';

                                  localStorage.setItem(key, input); // Save value to localStorage
                                  handleInputChange(handleChange, key, input);
                                  setFieldValue(key, input);
                                }}
                                value={
                                  localStorage.getItem('price_sf_max') || ''
                                }
                                onKeyDown={(e: any) =>
                                  handleKeyDown({
                                    eventValue: e,
                                    name: 'price_sf_max',
                                  })
                                }
                              />
                            </>
                          )}

                          {localStorage.getItem('activeType') !== 'land_only' &&
                            checkType !== 'leasesCheckbox' && (
                              <>
                                <StyledFieldFilter
                                  label="CAP Rate Min"
                                  name="all"
                                  onChange={(e) => {
                                    handleCapValuesChange({
                                      value: e.target.value,
                                      name: 'all',
                                    });
                                  }}
                                  value={
                                    values.all ||
                                    localStorage.getItem('all') ||
                                    ''
                                  }
                                  onKeyDown={(e: any) =>
                                    handleKeyDown({
                                      eventValue: e,
                                      name: 'all',
                                    })
                                  }
                                />

                                <StyledFieldFilter
                                  label="CAP Rate Max"
                                  name="cap_rate_max"
                                  onChange={(e) => {
                                    handleCapValuesChange({
                                      value: e.target.value,
                                      name: 'cap_rate_max',
                                    });
                                  }}
                                  value={
                                    localStorage.getItem('cap_rate_max') || ''
                                  }
                                  onKeyDown={(e: any) =>
                                    handleKeyDown({
                                      eventValue: e,
                                      name: 'cap_rate_max',
                                    })
                                  }
                                />
                              </>
                            )}
                        </>
                      </div>
                      <Box className="mt-7 flex justify-between items-center">
                        <Box className="flex justify-end">
                          <Button
                            variant="outlined"
                            color="error"
                            className="p-2 px-3"
                            onClick={() => {
                              clearFields(resetForm);
                              setFieldValue('state', '');
                              setFieldValue('street_address', '');
                              setSelectedCities([]);
                            }}
                          >
                            Reset
                          </Button>
                        </Box>
                        <div>
                          <CommonButton
                            onClick={handleSubmit}
                            variant="contained"
                            // type="submit"
                            isButtonVisible={isButtonVisible}
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

export default CostCompsAdvanceFilter;
