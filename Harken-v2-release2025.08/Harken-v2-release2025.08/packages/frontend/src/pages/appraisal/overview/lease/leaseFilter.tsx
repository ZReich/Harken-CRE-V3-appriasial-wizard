import { Box, Grid, Modal, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import StyledFieldFilter from '@/components/styles/styledFiledFilter';
import { CustomSelect } from '@/components/custom-select';
import {
  // selectTypeJson,
  compType,
  usa_state,
  // propertyTypeJson,
} from '@/pages/comps/comp-form/fakeJson';
import CommonButton from '@/components/elements/button/Button';
import DatePickerComp from '@/components/date-picker';
import { handleInputChange, sanitizeInputLandSize2 } from '@/utils/sanitize';
import MultipleSelectCheckmarks from '@/components/multi-select';
import { formatDate } from '@/utils/date-format';
import { SelectChangeEvent } from '@mui/material/Select';
import crossImage from '../../../../images/cross.png';
// import crossImageNew from '../../../../images/cross.png';
import crossImageNew from '../../../../images/close.svg';

import {
  LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND,
  LEASEFILTERCRITERIALENUMSLANDONLY,
} from '@/pages/comps/enum/ApproachEnums';

import moment from 'moment';
import {
  CreateCompsEnum,
  FilterListingEnum,
} from '@/pages/comps/enum/CompsEnum';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import TableComponent from './leaseTableData';
import { Link } from 'react-router-dom';
import { Icons } from '@/components/icons';
import axios from 'axios';
import {
  landTypeOptions,
  propertyOptions,
} from '@/pages/comps/create-comp/SelectOption';

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

const LeaseFilter: React.FC<any> = ({
  isOpen,
  setIsOpen,
  passCompsData,
  tableLength,
  appraisalData,
  tableData,
  appraisalComparisonBasis,
  compsType,
  landDimensions,
}: any) => {
  const isButtonVisible = FilterListingEnum.MAP_SEARCH_FILTER;
  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({ value, label })
  );

  const [state, setState] = useState(appraisalData?.state);
  const [selectedLeaseType, setSelectedLeaseType] = useState<any>('');
  const [, setPropertyType] = useState('');
  const [leaseTypeOptions, setLeaseTypeOptions] = useState<any[]>([]);
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
    start_date: any;
    end_date: any;
    price_sf_min: any | null;
    price_sf_max: any | null;
    land_sf_min: any | null;
    land_sf_max: any | null;
    square_footage_min: any | string | null;
    square_footage_max: any | string | null;
    street_address: any;
    comparison_basis: any | undefined;
    orderByColumn: any;
    orderBy: any;
    lease_type: any;
    appraisal_land_dimension: any;
  }

  const [formValues, setFormValues] = useState<FormValues>({
    comp_type:
      compsType === 'building_with_land' ? 'building_with_land' : 'land_only',
    state: appraisalData?.state,
    lease_type: selectedLeaseType,
    type: 'lease',
    // city: appraisalData.state != state ? [] : [appraisalData.city],
    city: appraisalData?.city ? [appraisalData.city] : [],
    propertyType: '',
    start_date: '',
    end_date: '',
    price_sf_min: null,
    price_sf_max: null,
    land_sf_min: null,
    land_sf_max: null,
    square_footage_min: null,
    square_footage_max: null,
    street_address: '',
    comparison_basis: appraisalComparisonBasis,
    orderByColumn: 'sale_price',
    orderBy: 'asc',
    appraisal_land_dimension: '',
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
  // handle lease type change

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
  useEffect(() => {
    fetchComposData();
  }, []);

  const fetchComposData = async () => {
    try {
      const response = await axios.get('globalCodes', {});

      if (response?.data?.data?.data) {
        const qualitativeOptions = response.data.data.data
          .find((item: any) => item.type === 'lease_types')
          ?.options.filter((option: any) => option.code !== 'type_my_own');

        const dynamicQualitativeAdjustments = (qualitativeOptions || []).map(
          (option: any) => ({
            adj_key: option.code,
            adj_value: option.name,
          })
        );

        setLeaseTypeOptions(dynamicQualitativeAdjustments); // Set the options
      }
    } catch (error) {
      console.error('Error fetching comps data:', error);
    }
  };

  const handleSubmit = async (newOrder?: string, newOrderByColumn?: string) => {
    try {
      const updatedFormValues = {
        ...formValues,
        // Ensure numerical values for square_footage_min/max
        square_footage_min: formValues.square_footage_min
          ? Number(formValues.square_footage_min)
          : null,
        square_footage_max: formValues.square_footage_max
          ? Number(formValues.square_footage_max)
          : null,
        // Ensure date fields are valid
        start_date: !isNaN(Date.parse(formValues.start_date))
          ? formValues.start_date
          : '',
        end_date: !isNaN(Date.parse(formValues.end_date))
          ? formValues.end_date
          : '',
        // Handle sorting order and column
        orderBy: newOrder || formValues.orderBy,
        orderByColumn: newOrderByColumn || formValues.orderByColumn,
        city: state ? formValues.city : [],
        state: formValues?.state === 'select' ? '' : formValues?.state,
      };

      const response = await mutation.mutateAsync(updatedFormValues);
      // localStorage.removeItem('selectedCities')
      setApiData(response.data.data);
    } catch (error) {
      console.error('Filter submission error:', error);
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
    console.log('eeeeeee', e);

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
              <Box className="bg-white p-6 rounded-lg w-[1000px] h-[500px] relative m-auto mt-20 shadow-none">
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
                    Lease Approach
                  </Typography>
                  {compsType === 'building_with_land' ? (
                    <ul className="list-none">
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND.POINTONE}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND.POINTTWO}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND.POINTTHREE}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND.POINTFOUR}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND.POINTFIVE}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND.POINTSIX}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSBUILDINGWITHLAND.POINTSEVEN}
                      </li>
                    </ul>
                  ) : (
                    <ul className="list-none">
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSLANDONLY.LANDPOINTONE}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSLANDONLY.LANDPOINTTWO}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSLANDONLY.LANDPOINTTHREE}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSLANDONLY.LANDPOINTFOUR}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSLANDONLY.LANDPOINTFIVE}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSLANDONLY.LANDPOINTSIX}
                      </li>
                      <li className="no-decoration">
                        {LEASEFILTERCRITERIALENUMSLANDONLY.LANDPOINTSEVEN}
                      </li>
                    </ul>
                  )}
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
                    disabled
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
                    disabled={compsType === 'land_only'} // Disable if compsType is "land_only"
                  /> */}

                  <CustomSelect
                    label={
                      localStorage.getItem('activeType') ===
                      'building_with_land'
                        ? 'Property Type'
                        : 'Land Type'
                    }
                    options={
                      localStorage.getItem('activeType') ===
                      'building_with_land'
                        ? propertyOptions
                        : landTypeOptions
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

                  {/* First State Dropdown */}
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

                  {/* City Multiple Select Dropdown */}
                  <MultipleSelectCheckmarks
                    onChange={handleCityChange}
                    usaCity={usaCity}
                    state={formValues?.state}
                    label="Commercial"
                    value={formValues?.city}
                    appraisalData={appraisalData}
                  />

                  <CustomSelect
                    label="Lease Type"
                    name="lease_type"
                    options={leaseTypeOptions.map((option) => ({
                      label: option.adj_value,
                      value: option.adj_key,
                    }))}
                    value={selectedLeaseType}
                    onChange={(e: SelectChangeEvent<string>) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        lease_type: e.target.value,
                      }));
                      // localStorage.removeItem('selectedCities');
                      setSelectedLeaseType(e.target.value as string);
                      // handleSelectChange('state', e.target.value);
                    }}
                  />
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                  <Box className="text-center uppercase font-bold text-base">
                    ADDITIONAL CRITERIA
                  </Box>
                  <div className="flex flex-row gap-4 mt-[16px] common-label-wrapper">
                    <DatePickerComp
                      name="start_date"
                      style={{ width: '100%' }}
                      label={
                        <span className="relative">
                          {CreateCompsEnum.LEASE_DATE_START}
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
                          {CreateCompsEnum.LEASE_DATE_END}
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
                    <div className="flex flex-row gap-4">
                      <>
                        <StyledFieldFilter
                          label="Space SF Min"
                          name="price_sf_min"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize2(
                              e.target.value
                            );
                            localStorage.removeItem('price_sf_min');
                            const numericValue =
                              input !== ''
                                ? Number(input.replace(/,/g, ''))
                                : null;

                            handleInputChange(
                              handleChange,
                              'price_sf_min',
                              numericValue as any
                            );
                            handleSelectChange(
                              'price_sf_min',
                              numericValue as any
                            );
                          }}
                          value={
                            formValues.price_sf_min !== null
                              ? Number(formValues.price_sf_min).toLocaleString(
                                  'en-US',
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )
                              : ''
                          }
                        />

                        <StyledFieldFilter
                          label="Space SF Max"
                          name="price_sf_max"
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const input = sanitizeInputLandSize2(
                              e.target.value
                            );
                            localStorage.removeItem('price_sf_max');
                            const numericValue =
                              input !== ''
                                ? Number(input.replace(/,/g, ''))
                                : null;

                            handleInputChange(
                              handleChange,
                              'price_sf_max',
                              numericValue as any
                            );
                            handleSelectChange(
                              'price_sf_max',
                              numericValue as any
                            );
                          }}
                          value={
                            formValues.price_sf_max !== null
                              ? Number(formValues.price_sf_max).toLocaleString(
                                  'en-US',
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )
                              : ''
                          }
                        />
                      </>
                    </div>
                  )}
                  <div className="flex flex-row gap-4">
                    <StyledFieldFilter
                      // label="Land SF Min"
                      label={
                        appraisalData?.land_dimension === 'ACRE'
                          ? 'Land ACRE Min'
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
                      // label="Land SF Max"
                      label={
                        appraisalData?.land_dimension === 'ACRE'
                          ? 'Land ACRE Max'
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
                    <StyledFieldFilter
                      label="$/SF/YR Min"
                      name="square_footage_min"
                      onKeyDown={(e: React.KeyboardEvent) => {
                        // Allow only numbers and navigation keys
                        const allowedKeys = [
                          'Backspace',
                          'Delete',
                          'ArrowLeft',
                          'ArrowRight',
                        ];
                        if (
                          !allowedKeys.includes(e.key) &&
                          !/^\d$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = e.target.value;

                        // Remove non-numeric characters
                        const sanitizedInput = input.replace(/[^0-9]/g, '');

                        // Format value with commas
                        const formattedInput =
                          Number(sanitizedInput).toLocaleString('en-US');

                        // Update form value
                        handleInputChange(
                          handleChange,
                          'square_footage_min',
                          sanitizedInput
                        );

                        // Reflect formatted value in the field
                        e.target.value = formattedInput;
                      }}
                      value={
                        formValues?.square_footage_min
                          ? Number(
                              formValues.square_footage_min
                            ).toLocaleString('en-US')
                          : ''
                      }
                    />

                    <StyledFieldFilter
                      label="$/SF/YR Max"
                      name="square_footage_max"
                      onKeyDown={(e: React.KeyboardEvent) => {
                        // Allow only numbers and navigation keys
                        const allowedKeys = [
                          'Backspace',
                          'Delete',
                          'ArrowLeft',
                          'ArrowRight',
                        ];
                        if (
                          !allowedKeys.includes(e.key) &&
                          !/^\d$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = e.target.value;

                        // Remove all non-numeric characters
                        const sanitizedInput = input.replace(/[^0-9]/g, '');

                        // Format value with commas
                        const formattedInput =
                          Number(sanitizedInput).toLocaleString('en-US');

                        // Update form value
                        handleInputChange(
                          handleChange,
                          'square_footage_max',
                          sanitizedInput
                        );

                        // Reflect formatted value in the field
                        e.target.value = formattedInput;
                      }}
                      value={
                        formValues?.square_footage_max
                          ? Number(
                              formValues.square_footage_max
                            ).toLocaleString('en-US')
                          : ''
                      }
                    />
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
                  formvalues={formValues} // Ensure formValues is passed here
                  tableLength={tableLength}
                  dataHandle={dataHandle}
                  rowss={apiData}
                  onClose={() => setIsTableOpen(false)}
                  dataLength={undefined}
                  landDimensions={landDimensions}
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

export default LeaseFilter;
