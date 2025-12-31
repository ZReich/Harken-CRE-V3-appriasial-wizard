import { Box, Grid, Modal, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import StyledFieldFilter from '@/components/styles/styledFiledFilter';
import { CustomSelect } from '@/components/custom-select';
import {
  propertyTypeJson,
  // selectTypeJson,
  compType,
  usa_state,
} from '@/pages/comps/comp-form/fakeJson';
import CommonButton from '@/components/elements/button/Button';
import DatePickerComp from '@/components/date-picker';
import {
  formatPercentageInput,
  handleInputChange,
  sanitizeInputLandSize2,
} from '@/utils/sanitize';
import MultipleSelectCheckmarks from '@/components/multi-select';
import { formatDate } from '@/utils/date-format';
import { SelectChangeEvent } from '@mui/material/Select';
import crossImage from '../../../images/cross.png';
import crossImageNew from '../../../images/close.svg';

import moment from 'moment';
import {
  CreateCompsEnum,
  FilterListingEnum,
} from '@/pages/comps/enum/CompsEnum';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import TableComponent from './salesTableData';
import { Link } from 'react-router-dom';
import { Icons } from '@/components/icons';
import { SALESFILTERCRITERIALENUMS } from '@/pages/comps/enum/ApproachEnums';
import { landTypeOptions } from '@/pages/comps/create-comp/SelectOption';

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

const SalesFilter: React.FC<any> = ({
  isOpen,
  setIsOpen,
  passCompsData,
  tableLength,
  appraisalData,
  tableData,
  appraisalComparisonBasis,
  // compsType,
}: any) => {
  const isButtonVisible = FilterListingEnum.MAP_SEARCH_FILTER;
  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({ value, label })
  );
  // const usaStateOptions = Object.entries(usa_state[0]).map(
  //     ([abbreviation, stateName]) => ({ value: stateName, label: stateName })
  // );
  const [state, setState] = useState(appraisalData?.state);

  const [, setPropertyType] = useState('');
  const [, setSelectType] = useState('');
  const [, setSelectedCities] = useState<string[]>([]);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  interface FormValues {
    comp_type: any;
    state: any | undefined;
    type: any;
    city: any[];
    propertyType: any;
    // propertyTypeValue:any;
    start_date: any;
    end_date: any;
    building_sf_min: any | null;
    building_sf_max: any | null;
    land_sf_min: any | null;
    land_sf_max: any | null;
    cap_rate_min: any | string | null;
    cap_rate_max: any | string | null;
    street_address: any;
    comparison_basis: any | undefined;
    orderByColumn: any;
    orderBy: any;
  }

  const [formValues, setFormValues] = useState<FormValues>({
    comp_type: localStorage.getItem('activeType'),
    state: appraisalData?.state,
    type: 'sale',
    // city: appraisalData?.city ? [appraisalData.city] : [],
    city: appraisalData.city ? [appraisalData.city] : [],
    propertyType: '',
    // propertyTypeValue:'',
    start_date: '',
    end_date: '',
    building_sf_min: null,
    building_sf_max: null,
    land_sf_min: null,
    land_sf_max: null,
    cap_rate_min: null,
    cap_rate_max: null,
    street_address: '',
    comparison_basis: appraisalComparisonBasis,
    orderByColumn: 'sale_price',
    orderBy: 'asc',
  });
  const [, setHidebackModal] = useState(false);
  useEffect(() => {
    // Reset selected cities when state changes
    setSelectedCities([]);
  }, [state]);

  useEffect(() => {
    // Initialize state from local storage if available
    const compType = localStorage.getItem('comp_type');
    const propertyType = localStorage.getItem('property_type');
    const state = localStorage.getItem('state');
    if (compType) setSelectType(compType);
    if (propertyType) setPropertyType(propertyType);
    if (state) setState(state);
  }, []);

  const handleCityChange = (selectedCities: City[]) => {
    const cityNames = selectedCities.map((cityObj) => cityObj.city);
    setSelectedCities(cityNames);

    // Update formValues with selected cities
    setFormValues((prevFormValues: any) => ({
      ...prevFormValues,
      city: cityNames,
    }));

    // Save cities to local storage (if needed)
    localStorage.setItem('selectedCities', JSON.stringify(cityNames));
  };

  const { data } = useGet<CityResponse>({
    queryKey: `city/${state}`,
    endPoint: `comps/cities?state=${state}`,
    config: { enabled: Boolean(state), refetchOnWindowFocus: false },
  });

  const usaCity = data?.data?.data || [];
  const closeNav = () => {
    setIsOpen(false);
  };

  const mutation = useMutate<any, any>({
    queryKey: 'filter',
    endPoint: '/appraisals/advance-filter/',
    requestType: RequestType.POST,
    config: {
      onSuccess: () => {
        setIsTableOpen(true);
        setHidebackModal(true);
        setIsTableOpen(true);
      },
    },
  });

  const handleSubmit = async (newOrder?: string, newOrderByColumn?: string) => {
    try {
      // Update sorting fields in formValues
      const updatedFormValues = {
        ...formValues,
        cap_rate_min: formValues.cap_rate_min
          ? Number(formValues.cap_rate_min)
          : null,
        cap_rate_max: formValues.cap_rate_max
          ? Number(formValues.cap_rate_max)
          : null,
        // Handle NaN for start_date and end_date
        start_date: !isNaN(Date.parse(formValues.start_date))
          ? formValues.start_date
          : '',
        end_date: !isNaN(Date.parse(formValues.end_date))
          ? formValues.end_date
          : '',
        // Update the sorting order and column based on click event
        orderBy: newOrder || formValues.orderBy,
        orderByColumn: newOrderByColumn || formValues.orderByColumn,
        city: state ? formValues.city : [],
        state: formValues?.state === 'select' ? '' : formValues?.state,
      };

      const response = await mutation.mutateAsync(updatedFormValues);
      setApiData(response.data.data);
      localStorage.removeItem('selectedCities');
    } catch (error) {
      console.error('Filter submission error:', error);
      // Handle error (e.g., show error message)
    }
  };

  const handleChange = (e: any) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  const handleStateChange1 = (newState: string) => {
    setFormValues((prev) => ({
      ...prev,
      state: newState,
      city: appraisalData.state === newState ? [appraisalData.city] : [],
    }));
  };

  const dataHandle = (e: any) => {
    passCompsData(e);
    // dataLength(e.data.length)

    setIsTableOpen(false);
  };
  return (
    <>
      <Box
        className={`element overlay z-50 backdrop-brightness-75 pb-10 flex justify-end items-end top-0 right-0 fixed overflow-x-hidden min-h-full transition-width duration-500 ${isOpen ? 'open' : ''}`}
      >
        <Box className="overlay-content overflow-auto m-auto w-[80%] h-[90vh] relative flex flex-col bg-white shadow-zinc-900">
          <div>
            <Box className="modal-header-image relative flex justify-between items-center p-4">
              <Box className="advance-Filter text-customDeeperSkyBlue font-bold text-base">
                <h4 className="text-xs text-white">Results Format</h4>
              </Box>

              <div className="text-center">
                <h2 className="text-[22px] font-normal text-white">
                  ADVANCED FILTER
                </h2>
                <p className="text-sm text-white">
                  Can't find what you're looking for? Create a new comp by
                  <Link
                    to="/create-comps"
                    className="no-underline text-[#0DA1C7]"
                  >
                    &nbsp; clicking here
                  </Link>
                  .
                </p>
              </div>

              <Box className="cursor-pointer flex items-center">
                <Icons.filterIcon
                  className="text-white mr-2 cursor-pointer"
                  onClick={handleOpen}
                />
                <img
                  src={crossImage}
                  alt="crossImage"
                  className="h-[12px] w-[20px] px-1"
                  onClick={closeNav}
                />
              </Box>
            </Box>

            {/* Modal for displaying filter criteria */}
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <Box className="bg-white p-6 rounded-lg w-[1000px] h-[400px] relative m-auto mt-20 shadow-none">
                {/* Close icon inside the modal */}
                <Grid className="flex">
                  <Box
                    className="absolute top-6 right-8 cursor-pointer"
                    onClick={handleClose}
                  >
                    <img
                      style={{ background: 'transparent', opacity: 0.25 }}
                      src={crossImageNew}
                      alt="crossImageNew"
                      className="h-[20px] w-[20px]"
                    />
                  </Box>
                </Grid>

                <Typography
                  className="text-center uppercase font-bold"
                  id="modal-title"
                  variant="h6"
                  component="h2"
                >
                  Filter Criteria
                </Typography>
                <Typography id="modal-description" className="mt-4 leading-10">
                  <Typography
                    className="uppercase font-bold"
                    id="modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Sales Approach
                  </Typography>
                  <ul className="list-none">
                    <li className="no-decoration">
                      {SALESFILTERCRITERIALENUMS.POINTONE}
                    </li>
                    <li className="no-decoration">
                      {SALESFILTERCRITERIALENUMS.POINTTWO}
                    </li>
                    <li className="no-decoration">
                      {SALESFILTERCRITERIALENUMS.POINTTHREE}
                    </li>
                    <li className="no-decoration">
                      {SALESFILTERCRITERIALENUMS.POINTFOUR}
                    </li>
                    <li className="no-decoration">
                      {SALESFILTERCRITERIALENUMS.POINTFIVE}
                    </li>
                    <li className="no-decoration">
                      {SALESFILTERCRITERIALENUMS.POINTSIX}
                    </li>
                  </ul>
                </Typography>
              </Box>
            </Modal>

            {/* Modal for displaying filter criteria */}

            <div className="p-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                  <Box className="text-center uppercase font-bold text-base">
                    SEARCH TYPE
                  </Box>
                  <CustomSelect
                    label="Comp Type"
                    options={compType}
                    value={formValues.type}
                    onChange={(e: SelectChangeEvent<string>) => {
                      // Clear error on change
                      handleSelectChange('type', e.target.value);
                    }}
                  />
                  {/* <CustomSelect
                    label="Type"
                    options={selectTypeJson}
                    value={formValues.comp_type}
                    onChange={(e) => {
                      handleSelectChange('comp_type', e.target.value);
                    }}
                  /> */}
                  <CustomSelect
                    label={
                      localStorage.getItem('activeType') === 'land_only'
                        ? 'Land Type'
                        : 'Property Type'
                    }
                    options={
                      localStorage.getItem('activeType') === 'land_only'
                        ? landTypeOptions
                        : propertyTypeJson
                    }
                    value={formValues.propertyType}
                    onChange={(e: SelectChangeEvent<string>) => {
                      setPropertyType(e.target.value as string);
                      handleSelectChange('propertyType', e.target.value);
                    }}
                    // disabled={formValues.comp_type === 'land_only'}
                  />
                  <StyledFieldFilter
                    label="Street Address"
                    name="street_address"
                    type="text"
                    onChange={handleChange}
                    value={formValues.street_address}
                  />
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                  <Box className="text-center uppercase font-bold text-base">
                    LOCATION
                  </Box>
                  <CustomSelect
                    label="State"
                    options={usaStateOptions}
                    value={formValues.state}
                    onChange={(e: SelectChangeEvent<string>) => {
                      localStorage.removeItem('selectedCities');
                      setState(e.target.value as string);
                      handleSelectChange('state', e.target.value);
                      const selectedState = e.target.value;
                      handleStateChange1(selectedState);
                    }}
                  />
                  <MultipleSelectCheckmarks
                    onChange={handleCityChange}
                    usaCity={usaCity}
                    state={formValues?.state}
                    label="Commercial"
                    value={formValues?.city}
                    appraisalData={appraisalData}
                  />
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                  <Box className="text-center uppercase font-bold text-base mb-4">
                    ADDITIONAL CRITERIA
                  </Box>
                  <div className="flex flex-row gap-4 common-label-wrapper">
                    <DatePickerComp
                      name="start_date"
                      style={{ width: '100%' }}
                      label={
                        <span className="relative">
                          {CreateCompsEnum.DATE_START}
                          <span className="text-red-500"> *</span>
                        </span>
                      }
                      value={moment(formValues.start_date)}
                      onChange={(value: Date | null) => {
                        if (value) {
                          const formattedDate = formatDate(value);
                          handleChange({
                            target: {
                              name: 'start_date',
                              value: formattedDate,
                            },
                          });
                        }
                      }}
                    />
                    <DatePickerComp
                      name="end_date"
                      style={{ width: '100%' }}
                      label={
                        <span className="relative">
                          {CreateCompsEnum.DATE_END}
                          <span className="text-red-500"> *</span>
                        </span>
                      }
                      value={moment(formValues.end_date)}
                      onChange={(value: Date | null) => {
                        if (value) {
                          const formattedDate = formatDate(value);
                          handleChange({
                            target: {
                              name: 'end_date',
                              value: formattedDate,
                            },
                          });
                        }
                      }}
                    />
                  </div>
                  {localStorage.getItem('activeType') !== 'land_only' && (
                    <>
                      <div className="flex flex-row gap-4">
                        <StyledFieldFilter
                          label="Building SF Min"
                          name="building_sf_min"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize2(
                              e.target.value
                            );
                            localStorage.removeItem('building_sf_min');
                            const numericValue =
                              input !== ''
                                ? Number(input.replace(/,/g, ''))
                                : null;

                            handleInputChange(
                              handleChange,
                              'building_sf_min',
                              numericValue as any
                            );
                            handleSelectChange(
                              'building_sf_min',
                              numericValue as any
                            );
                          }}
                          value={
                            formValues.building_sf_min !== null
                              ? Number(
                                  formValues.building_sf_min
                                ).toLocaleString('en-US', {
                                  maximumFractionDigits: 2,
                                })
                              : ''
                          }
                        />

                        <StyledFieldFilter
                          label="Building SF Max"
                          name="building_sf_max"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize2(
                              e.target.value
                            );
                            localStorage.removeItem('building_sf_max');
                            const numericValue =
                              input !== ''
                                ? Number(input.replace(/,/g, ''))
                                : null;

                            handleInputChange(
                              handleChange,
                              'building_sf_max',
                              numericValue as any
                            );
                            handleSelectChange(
                              'building_sf_max',
                              numericValue as any
                            );
                          }}
                          value={
                            formValues.building_sf_max !== null
                              ? Number(
                                  formValues.building_sf_max
                                ).toLocaleString('en-US', {
                                  maximumFractionDigits: 2,
                                })
                              : ''
                          }
                        />
                      </div>
                    </>
                  )}
                  <div className="flex flex-row gap-4">
                    <StyledFieldFilter
                      label={
                        appraisalData.land_dimension === 'ACRE'
                          ? 'Land Acre Min'
                          : 'Land SF Min'
                      }
                      name="land_sf_min"
                      type="text"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = sanitizeInputLandSize2(e.target.value);
                        localStorage.removeItem('land_sf_min');
                        const numericValue =
                          input !== '' ? Number(input.replace(/,/g, '')) : null;

                        handleInputChange(
                          handleChange,
                          'land_sf_min',
                          numericValue as any
                        );
                        handleSelectChange('land_sf_min', numericValue as any);
                      }}
                      value={
                        formValues.land_sf_min !== null
                          ? Number(formValues.land_sf_min).toLocaleString(
                              'en-US',
                              {
                                maximumFractionDigits: 2,
                              }
                            )
                          : ''
                      }
                    />

                    <StyledFieldFilter
                      label={
                        appraisalData.land_dimension === 'ACRE'
                          ? 'Land Acre Max'
                          : 'Land SF Max'
                      }
                      name="land_sf_max"
                      type="text"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = sanitizeInputLandSize2(e.target.value);
                        localStorage.removeItem('land_sf_max');
                        const numericValue =
                          input !== '' ? Number(input.replace(/,/g, '')) : null;

                        handleInputChange(
                          handleChange,
                          'land_sf_max',
                          numericValue as any
                        );
                        handleSelectChange('land_sf_max', numericValue as any);
                      }}
                      value={
                        formValues.land_sf_max !== null
                          ? Number(formValues.land_sf_max).toLocaleString(
                              'en-US',
                              {
                                maximumFractionDigits: 2,
                              }
                            )
                          : ''
                      }
                    />
                  </div>
                  <div className="flex flex-row gap-4">
                    {localStorage.getItem('activeType') !== 'land_only' && (
                      <>
                        <StyledFieldFilter
                          label="Cap Rate Min"
                          name="cap_rate_min"
                          onKeyDown={(e: React.KeyboardEvent) => {
                            const isBack = e.code === 'Backspace';
                            const event =
                              e as React.KeyboardEvent<HTMLInputElement>;

                            const { selectionStart, selectionEnd }: any =
                              e.target;
                            const inputValue =
                              formValues?.cap_rate_min?.toString() || '';

                            if (isBack) {
                              if (
                                selectionStart === 0 &&
                                selectionEnd >= inputValue.length
                              ) {
                                handleInputChange(
                                  handleChange,
                                  'cap_rate_min',
                                  ''
                                );
                                event.preventDefault();
                              } else {
                                const inpArr = Array.from(inputValue);
                                inpArr.pop();
                                handleInputChange(
                                  handleChange,
                                  'cap_rate_min',
                                  inpArr.join('')
                                );
                                event.preventDefault();
                              }
                            }
                          }}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = e.target.value;

                            const sanitizedInput = input.replace(/[%|,]/g, '');

                            if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
                              handleInputChange(
                                handleChange,
                                'cap_rate_min',
                                sanitizedInput
                              );
                            }
                          }}
                          value={formatPercentageInput(
                            formValues?.cap_rate_min
                          )}
                        />

                        <StyledFieldFilter
                          label="Cap Rate Max"
                          name="cap_rate_max"
                          onKeyDown={(e: React.KeyboardEvent) => {
                            const isBack = e.code === 'Backspace';
                            const event =
                              e as React.KeyboardEvent<HTMLInputElement>;

                            if (isBack) {
                              const inputElement = event.currentTarget;
                              const { selectionStart, selectionEnd }: any =
                                e.target;

                              if (
                                selectionStart === 0 &&
                                selectionEnd >= inputElement.value.length
                              ) {
                                handleInputChange(
                                  handleChange,
                                  'cap_rate_max',
                                  ''
                                );
                                event.preventDefault();
                              } else {
                                const input =
                                  formValues?.cap_rate_max?.toString() || '';
                                const inpArr = Array.from(input);
                                inpArr.pop();
                                handleInputChange(
                                  handleChange,
                                  'cap_rate_max',
                                  inpArr.join('')
                                );
                              }
                            }
                          }}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = e.target.value;

                            const sanitizedInput = input.replace(/[%|,]/g, '');

                            if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
                              handleInputChange(
                                handleChange,
                                'cap_rate_max',
                                sanitizedInput
                              );
                            }
                          }}
                          value={formatPercentageInput(
                            formValues?.cap_rate_max
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Box className="mt-7 flex justify-center items-center w-3/12 mx-auto">
                <CommonButton
                  style={{ width: '143px' }}
                  variant="contained"
                  type="button"
                  onClick={() => handleSubmit()} // Ensure no event is passed
                  isButtonVisible={isButtonVisible}
                  className="w-1/4"
                >
                  {FilterListingEnum.SEARCH}
                </CommonButton>
              </Box>

              <div></div>
            </div>
            <Modal
              open={isTableOpen}
              onClose={() => setIsTableOpen(false)}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <Box sx={{ width: '80%', margin: 'auto' }}>
                <TableComponent
                  tableData={tableData}
                  formvalues={formValues}
                  tableLength={tableLength}
                  dataHandle={dataHandle}
                  rowss={apiData}
                  onClose={() => setIsTableOpen(false)}
                  dataLength={undefined}
                  appraisalData={appraisalData}
                />
              </Box>
            </Modal>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default SalesFilter;
